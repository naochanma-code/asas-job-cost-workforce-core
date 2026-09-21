import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import type { Database, Queryable } from "../../../packages/database/index";
import {
  Actor,
  Denied,
  audit,
  manage,
  token,
  hashToken,
} from "../../../packages/domain/identity";
import { projectsFor, requireProject } from "../../../packages/domain/projects";
import {
  seal,
  unseal,
  allowedLineSource,
} from "../../../packages/domain/line-payload";

const eventSchema = z.object({
  webhookEventId: z.string().min(1).max(200),
  type: z.string(),
  replyToken: z.string().optional(),
  source: z
    .object({
      type: z.string(),
      userId: z.string().optional(),
      groupId: z.string().optional(),
    })
    .optional(),
  message: z
    .object({ type: z.string(), text: z.string().max(5000).optional() })
    .optional(),
  link: z.object({ result: z.string(), nonce: z.string() }).optional(),
});
export async function registerLine(
  app: FastifyInstance,
  db: Database,
  origin: string,
) {
  app.post("/api/line/webhook", async (req) => {
    const secret = process.env.LINE_CHANNEL_SECRET,
      bot = process.env.LINE_BOT_ID;
    if (process.env.LINE_ENABLED !== "true" || !secret || !bot)
      throw new Denied(503, "LINE ยังไม่เปิดใช้งาน");
    const raw = req.body as Buffer,
      signature = Buffer.from(
        String(req.headers["x-line-signature"] || ""),
        "base64",
      );
    const expected = createHmac("sha256", secret).update(raw).digest();
    if (
      signature.length !== expected.length ||
      !timingSafeEqual(signature, expected)
    )
      throw new Denied(401);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.toString());
    } catch {
      throw new Denied(400);
    }
    const body = z
      .object({
        destination: z.literal(bot),
        events: z.array(eventSchema).max(100),
      })
      .parse(parsed);
    await db.transaction(async (tx) => {
      for (const event of body.events) {
        if (!allowedLineSource(event.source?.userId, event.source?.groupId))
          continue;
        await tx.query(
          "INSERT INTO line_event_inbox(id,payload) VALUES($1,$2) ON CONFLICT(id) DO NOTHING",
          [event.webhookEventId, JSON.stringify(seal(event))],
        );
      }
    });
    return { ok: true };
  });
  app.post("/api/line/link", async (req) => {
    if (process.env.LINE_ENABLED !== "true")
      throw new Denied(503, "LINE ยังไม่เปิดใช้งาน");
    const { linkToken } = z
        .object({ linkToken: z.string().min(10).max(512) })
        .strict()
        .parse(req.body),
      nonce = token();
    await db.query(
      "INSERT INTO line_link_nonces(nonce_hash,user_id,expires_at) VALUES($1,$2,now()+interval '10 minutes')",
      [hashToken(nonce), req.actor.id],
    );
    return {
      url:
        "https://access.line.me/dialog/bot/accountLink?" +
        new URLSearchParams({ linkToken, nonce }),
      notice: "ยกเลิกการเชื่อมบัญชีได้ในหน้างานของฉัน",
    };
  });
  app.delete("/api/line/link", async (req) => {
    await db.transaction(async (tx) => {
      await tx.query("DELETE FROM line_accounts WHERE user_id=$1", [
        req.actor.id,
      ]);
      await tx.query("DELETE FROM line_link_nonces WHERE user_id=$1", [
        req.actor.id,
      ]);
      await audit(tx, req.actor, "LINE_UNLINKED", req.actor.id);
    });
    return { ok: true };
  });
  app.post("/api/projects/:id/line-code", async (req) => {
    manage(req.actor);
    const id = z
        .string()
        .uuid()
        .parse((req.params as any).id),
      code = token();
    await db.transaction(async (tx) => {
      await requireProject(tx, req.actor, id);
      await tx.query(
        "INSERT INTO line_binding_codes(code_hash,project_id,created_by,expires_at) VALUES($1,$2,$3,now()+interval '10 minutes')",
        [hashToken(code), id, req.actor.id],
      );
      await audit(tx, req.actor, "LINE_BINDING_CODE_CREATED", id);
    });
    return { command: "ผูกโครงการ " + code, expiresInMinutes: 10 };
  });
  app.get("/api/line/status", async (req) => {
    manage(req.actor);
    return {
      enabled: process.env.LINE_ENABLED === "true",
      inbox: (
        await db.query(
          "SELECT state,count(*)::int AS count FROM line_event_inbox GROUP BY state",
        )
      ).rows,
      outbox: (
        await db.query(
          "SELECT state,count(*)::int AS count FROM notification_outbox GROUP BY state",
        )
      ).rows,
    };
  });
}
async function lineActor(
  db: Queryable,
  lineUser: string,
): Promise<Actor | undefined> {
  return (
    await db.query<Actor>(
      "SELECT u.id,u.role,u.display_name FROM line_accounts l JOIN users u ON u.id=l.user_id WHERE l.line_user_id=$1 AND u.active",
      [lineUser],
    )
  ).rows[0];
}
export async function processLineEvent(db: Database): Promise<boolean> {
  const event = await db.transaction(async (tx) => {
    const r = (
      await tx.query(
        "SELECT * FROM line_event_inbox WHERE (state IN ('RECEIVED','RETRY') AND next_attempt_at<=now()) OR (state='PROCESSING' AND lease_until<now()) ORDER BY received_at FOR UPDATE SKIP LOCKED LIMIT 1",
      )
    ).rows[0];
    if (!r) return;
    await tx.query(
      "UPDATE line_event_inbox SET state='PROCESSING',attempts=attempts+1,lease_until=now()+interval '1 minute' WHERE id=$1",
      [r.id],
    );
    return r;
  });
  if (!event) return false;
  try {
    await db.transaction(async (tx) => {
      const e = unseal(event.payload) as z.infer<typeof eventSchema>,
        lineUser = e.source?.userId;
      let kind = "NONE";
      if (e.type === "accountLink" && e.link?.result === "ok" && lineUser) {
        const nonce = (
          await tx.query(
            "DELETE FROM line_link_nonces WHERE nonce_hash=$1 AND expires_at>now() RETURNING user_id",
            [hashToken(e.link.nonce)],
          )
        ).rows[0];
        if (
          nonce &&
          (
            await tx.query("SELECT id FROM users WHERE id=$1 AND active", [
              nonce.user_id,
            ])
          ).rows.length
        ) {
          const linked = await tx.query(
            "INSERT INTO line_accounts(line_user_id,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING user_id",
            [lineUser, nonce.user_id],
          );
          await tx.query(
            "INSERT INTO audit_logs(id,actor_id,action) VALUES($1,$2,$3)",
            [
              randomUUID(),
              nonce.user_id,
              linked.rows.length ? "LINE_LINKED" : "LINE_LINK_CONFLICT",
            ],
          );
        }
      } else if (
        e.type === "message" &&
        e.message?.type === "text" &&
        lineUser &&
        e.replyToken
      ) {
        const actor = await lineActor(tx, lineUser),
          text = e.message.text?.trim();
        if (e.source?.type === "user")
          kind =
            text === "เชื่อมบัญชี"
              ? "LINK"
              : text === "งานของฉัน"
                ? "JOBS"
                : "HELP";
        else if (
          e.source?.type === "group" &&
          text?.startsWith("ผูกโครงการ ") &&
          actor &&
          ["OWNER", "ADMIN"].includes(actor.role)
        ) {
          const code = (
            await tx.query(
              "SELECT * FROM line_binding_codes WHERE code_hash=$1 AND expires_at>now() FOR UPDATE",
              [hashToken(text.slice("ผูกโครงการ ".length))],
            )
          ).rows[0];
          if (code && code.created_by === actor.id && e.source.groupId) {
            const existing = (
              await tx.query(
                "SELECT project_id FROM line_group_bindings WHERE group_id=$1",
                [e.source.groupId],
              )
            ).rows[0];
            if (!existing) {
              await tx.query(
                "DELETE FROM line_binding_codes WHERE code_hash=$1",
                [code.code_hash],
              );
              await tx.query(
                "INSERT INTO line_group_bindings(group_id,project_id,created_by) VALUES($1,$2,$3)",
                [e.source.groupId, code.project_id, actor.id],
              );
              await audit(tx, actor, "LINE_GROUP_BOUND", code.project_id);
              kind = "BOUND";
            } else kind = "GROUP";
          } else kind = "GROUP";
        } else kind = "GROUP";
        await tx.query(
          "INSERT INTO notification_outbox(id,event_id,payload) VALUES($1,$2,$3) ON CONFLICT(event_id) DO NOTHING",
          [
            randomUUID(),
            event.id,
            JSON.stringify(
              seal({
                kind,
                lineUser,
                groupId: e.source?.groupId,
                replyToken: e.replyToken,
                sourceType: e.source?.type,
              }),
            ),
          ],
        );
      }
      await tx.query(
        "UPDATE line_event_inbox SET state='DONE',payload='{}',lease_until=NULL WHERE id=$1",
        [event.id],
      );
    });
  } catch {
    await db.query(
      "UPDATE line_event_inbox SET state=CASE WHEN attempts>=5 THEN 'DEAD' ELSE 'RETRY' END,next_attempt_at=now()+interval '1 minute',lease_until=NULL WHERE id=$1",
      [event.id],
    );
  }
  return true;
}
export interface LineTransport {
  linkToken(lineUser: string): Promise<string>;
  reply(replyToken: string, text: string): Promise<void>;
}
export async function deliverLine(
  db: Database,
  transport: LineTransport,
  origin: string,
): Promise<boolean> {
  const item = await db.transaction(async (tx) => {
    const r = (
      await tx.query(
        "SELECT * FROM notification_outbox WHERE (state IN ('PENDING','RETRY') AND next_attempt_at<=now()) OR (state='SENDING' AND lease_until<now()) ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1",
      )
    ).rows[0];
    if (r)
      await tx.query(
        "UPDATE notification_outbox SET state='SENDING',attempts=attempts+1,lease_until=now()+interval '1 minute' WHERE id=$1",
        [r.id],
      );
    return r;
  });
  if (!item) return false;
  try {
    const p = unseal(item.payload);
    if (!allowedLineSource(p.lineUser, p.groupId)) {
      await db.query(
        "UPDATE notification_outbox SET state='CANCELLED',payload='{}',lease_until=NULL WHERE id=$1",
        [item.id],
      );
      return true;
    }
    const actor = await lineActor(db, p.lineUser);
    let text = "กรุณาเปิดแชทส่วนตัวกับบัญชีนี้เพื่อดูงานของคุณ";
    if (p.sourceType === "user") {
      if (p.kind === "LINK") {
        const link = await transport.linkToken(p.lineUser);
        text =
          "เข้าสู่ระบบเพื่อเชื่อมบัญชี (ยกเลิกได้ในหน้าเว็บ): " +
          origin +
          "/?" +
          new URLSearchParams({ linkToken: link });
      } else if (!actor)
        text = "พิมพ์ เชื่อมบัญชี เพื่อเข้าสู่ระบบและเชื่อมบัญชีก่อน";
      else if (p.kind === "JOBS") {
        const rows = (await projectsFor(db, actor)).filter(
          (p) => p.status === "ACTIVE",
        );
        text = rows.length
          ? rows
              .slice(0, 30)
              .map((p) => p.code + " · " + p.name)
              .join("\n")
          : "ยังไม่มีโครงการที่ได้รับมอบหมาย";
      } else
        text =
          "พิมพ์ งานของฉัน เพื่อดูโครงการ หรือ เชื่อมบัญชี เพื่อเชื่อมบัญชี";
    } else if (p.kind === "BOUND")
      text = "เชื่อมกลุ่มแล้ว ดูงานของคุณในแชทส่วนตัว";
    await transport.reply(p.replyToken, text);
    await db.query(
      "UPDATE notification_outbox SET state='SENT',payload='{}',lease_until=NULL WHERE id=$1",
      [item.id],
    );
  } catch {
    await db.query(
      "UPDATE notification_outbox SET state=CASE WHEN attempts>=5 THEN 'DEAD' ELSE 'RETRY' END,next_attempt_at=now()+interval '1 minute',lease_until=NULL,last_error_category='DELIVERY_FAILED' WHERE id=$1",
      [item.id],
    );
  }
  return true;
}
export function liveTransport(accessToken: string): LineTransport {
  const send = async (path: string, body?: object) => {
    const res = await fetch("https://api.line.me/v2/bot/" + path, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw Error("LINE delivery failed");
    return res;
  };
  return {
    linkToken: async (id) => {
      const r = await send("user/" + encodeURIComponent(id) + "/linkToken");
      return ((await r.json()) as { linkToken: string }).linkToken;
    },
    reply: async (replyToken, text) => {
      await send("message/reply", {
        replyToken,
        messages: [{ type: "text", text: text.slice(0, 4900) }],
      });
    },
  };
}
