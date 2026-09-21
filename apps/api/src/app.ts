import Fastify from "fastify";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { Database } from "../../../packages/database/index";
import {
  Actor,
  Denied,
  audit,
  manage,
  passwordHash,
  verifyPassword,
  hashToken,
  token,
} from "../../../packages/domain/identity";
import { projectsFor, requireProject } from "../../../packages/domain/projects";
import { registerLine } from "./line";

declare module "fastify" {
  interface FastifyRequest {
    actor: Actor;
  }
}
const text = z.string().trim().min(1).max(160),
  uuid = z.string().uuid();
const credentials = z
  .object({
    username: z.string().trim().toLowerCase().min(1).max(100),
    password: z.string().min(12).max(200),
  })
  .strict();
export async function buildApp(db: Database, origin = "http://127.0.0.1:3000") {
  const app = Fastify({
    logger: false,
    bodyLimit: 256 * 1024,
    trustProxy: false,
  });
  const secure = new URL(origin).protocol === "https:";
  if (process.env.NODE_ENV === "production" && !secure)
    throw Error("HTTPS WEB_ORIGIN required");
  await app.register(cookie);
  await app.register(rateLimit, { max: 120, timeWindow: "1 minute" });
  app.removeContentTypeParser("application/json");
  app.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (req, body, done) => {
      if (req.url === "/api/line/webhook") return done(null, body);
      try {
        done(null, JSON.parse(body.toString()));
      } catch {
        done(new Denied(400, "ข้อมูลไม่ถูกต้อง"), undefined);
      }
    },
  );
  const dummy = await passwordHash(token());
  app.addHook("onRequest", async (req, reply) => {
    reply
      .header("Cache-Control", "no-store")
      .header("X-Content-Type-Options", "nosniff");
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.url !== "/api/line/webhook" &&
      req.headers.origin !== origin
    )
      throw new Denied(403, "คำขอต้องมาจากเว็บไซต์นี้");
  });
  app.addHook("preHandler", async (req) => {
    if (
      ["/api/login", "/api/health", "/api/line/webhook"].includes(
        req.url.split("?")[0],
      )
    )
      return;
    const sid = req.cookies.sid;
    if (!sid) throw new Denied(401, "กรุณาเข้าสู่ระบบ");
    const user = (
      await db.query<Actor>(
        `SELECT u.id,u.role,u.display_name FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now() AND u.active`,
        [hashToken(sid)],
      )
    ).rows[0];
    if (!user) throw new Denied(401, "กรุณาเข้าสู่ระบบ");
    req.actor = user;
  });
  app.setErrorHandler((error, req, reply) => {
    if (error instanceof z.ZodError)
      return reply.code(400).send({ error: "ตรวจข้อมูลที่กรอกอีกครั้ง" });
    const code = (error as { code?: string }).code;
    if (["23505", "23503", "23514", "22P02"].includes(code || ""))
      return reply
        .code(409)
        .send({ error: "ข้อมูลซ้ำหรือไม่ตรงกับโครงการ กรุณาตรวจใหม่" });
    const status =
      error instanceof Denied
        ? error.status
        : (error as { statusCode?: number }).statusCode || 500;
    reply
      .code(status)
      .send({
        error:
          status === 500
            ? "ระบบขัดข้อง กรุณาลองใหม่"
            : error instanceof Denied
              ? error.message
              : "คำขอไม่ถูกต้องหรือถี่เกินไป",
      });
  });
  app.get("/api/health", async (_, reply) => {
    try {
      await db.query("SELECT 1");
      return { status: "ok", database: "ready" };
    } catch {
      return reply.code(503).send({ status: "unavailable" });
    }
  });
  app.post(
    "/api/login",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const body = credentials.parse(req.body),
        key = hashToken(body.username);
      const blocked = (
        await db.query(
          "SELECT key FROM login_attempts WHERE key=$1 AND failures>=5 AND blocked_until>now()",
          [key],
        )
      ).rows.length;
      if (blocked) throw new Denied(429, "ลองเข้าสู่ระบบใหม่ภายหลัง");
      const u = (
        await db.query("SELECT * FROM users WHERE username=$1", [body.username])
      ).rows[0];
      const valid = await verifyPassword(
        body.password,
        u?.password_hash || dummy,
      );
      if (!valid || !u?.active) {
        await db.query(
          `INSERT INTO login_attempts(key,failures,blocked_until) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET failures=CASE WHEN login_attempts.blocked_until<now() THEN 1 ELSE login_attempts.failures+1 END,blocked_until=now()+interval '15 minutes'`,
          [key],
        );
        throw new Denied(401, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
      const sid = token();
      await db.transaction(async (tx) => {
        await tx.query("DELETE FROM login_attempts WHERE key=$1", [key]);
        if (req.cookies.sid)
          await tx.query("DELETE FROM sessions WHERE token_hash=$1", [
            hashToken(req.cookies.sid),
          ]);
        await tx.query(
          "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '8 hours')",
          [hashToken(sid), u.id],
        );
      });
      reply.setCookie("sid", sid, {
        httpOnly: true,
        secure,
        sameSite: "strict",
        path: "/",
        maxAge: 8 * 3600,
      });
      return { ok: true };
    },
  );
  app.post("/api/logout", async (req, reply) => {
    await db.query("DELETE FROM sessions WHERE token_hash=$1", [
      hashToken(req.cookies.sid!),
    ]);
    reply.clearCookie("sid", { path: "/" });
    return { ok: true };
  });
  app.get("/api/me", async (req) => req.actor);
  app.get("/api/users", async (req) => {
    manage(req.actor);
    return (
      await db.query(
        "SELECT u.id,u.display_name,u.role,u.active,e.id AS employee_id FROM users u LEFT JOIN employees e ON e.user_id=u.id ORDER BY u.display_name",
      )
    ).rows;
  });
  app.post("/api/users", async (req) => {
    if (req.actor.role !== "OWNER") throw new Denied();
    const b = credentials
        .extend({
          display_name: text,
          role: z.enum(["OWNER", "ADMIN", "PM", "TECH"]),
        })
        .parse(req.body),
      id = randomUUID(),
      hash = await passwordHash(b.password);
    await db.transaction(async (tx) => {
      await tx.query(
        "INSERT INTO users(id,username,display_name,password_hash,role) VALUES($1,$2,$3,$4,$5)",
        [id, b.username, b.display_name, hash, b.role],
      );
      await tx.query(
        "INSERT INTO employees(id,user_id,code,display_name) VALUES($1,$2,$3,$4)",
        [randomUUID(), id, "EMP-" + id.slice(0, 8), b.display_name],
      );
      await audit(tx, req.actor, "USER_CREATED", id, { role: b.role });
    });
    return { id };
  });
  app.patch("/api/users/:id", async (req) => {
    if (req.actor.role !== "OWNER") throw new Denied();
    const id = uuid.parse((req.params as any).id);
    const b = z.object({ active: z.boolean() }).strict().parse(req.body);
    if (id === req.actor.id) throw new Denied(409, "ไม่ปิดบัญชีที่กำลังใช้งาน");
    await db.transaction(async (tx) => {
      const r = await tx.query(
        "UPDATE users SET active=$2 WHERE id=$1 RETURNING id",
        [id, b.active],
      );
      if (!r.rows.length) throw new Denied(404);
      await tx.query("DELETE FROM sessions WHERE user_id=$1", [id]);
      await audit(tx, req.actor, "USER_STATUS", id, b);
    });
    return { ok: true };
  });
  app.get("/api/customers", async (req) => {
    manage(req.actor);
    return (await db.query("SELECT id,code,name FROM customers ORDER BY name"))
      .rows;
  });
  app.post("/api/customers", async (req) => {
    manage(req.actor);
    const b = z.object({ name: text }).strict().parse(req.body),
      id = randomUUID();
    await db.transaction(async (tx) => {
      await tx.query(
        "INSERT INTO customers(id,code,name,created_by) VALUES($1,$2,$3,$4)",
        [id, "CUS-" + id.slice(0, 8), b.name, req.actor.id],
      );
      await audit(tx, req.actor, "CUSTOMER_CREATED", id, b);
    });
    return { id };
  });
  app.get("/api/sites", async (req) => {
    manage(req.actor);
    return (
      await db.query("SELECT id,customer_id,name FROM sites ORDER BY name")
    ).rows;
  });
  app.post("/api/sites", async (req) => {
    manage(req.actor);
    const b = z
        .object({ customer_id: uuid, name: text })
        .strict()
        .parse(req.body),
      id = randomUUID();
    await db.transaction(async (tx) => {
      await tx.query(
        "INSERT INTO sites(id,customer_id,name) VALUES($1,$2,$3)",
        [id, b.customer_id, b.name],
      );
      await audit(tx, req.actor, "SITE_CREATED", id, b);
    });
    return { id };
  });
  app.get("/api/projects", async (req) => projectsFor(db, req.actor));
  app.post("/api/projects", async (req) => {
    manage(req.actor);
    const b = z
        .object({
          name: text,
          customer_id: uuid,
          site_id: uuid.nullable().optional(),
        })
        .strict()
        .parse(req.body),
      id = randomUUID();
    await db.transaction(async (tx) => {
      await tx.query(
        "INSERT INTO projects(id,code,customer_id,site_id,name,created_by) VALUES($1,$2,$3,$4,$5,$6)",
        [
          id,
          "PRJ-" + id.slice(0, 8),
          b.customer_id,
          b.site_id || null,
          b.name,
          req.actor.id,
        ],
      );
      await audit(tx, req.actor, "PROJECT_CREATED", id, b);
    });
    return { id };
  });
  app.get("/api/projects/:id", async (req) => {
    const id = uuid.parse((req.params as any).id);
    const p = await requireProject(db, req.actor, id);
    const jobs = (
      await db.query(
        "SELECT id,code,name FROM jobs WHERE project_id=$1 ORDER BY code",
        [id],
      )
    ).rows;
    return { ...p, jobs };
  });
  app.patch("/api/projects/:id", async (req) => {
    if (req.actor.role === "TECH") throw new Denied();
    const id = uuid.parse((req.params as any).id);
    const b = z
      .object({
        name: text,
        status: z.enum(["ACTIVE", "CLOSED"]),
        version: z.number().int().positive(),
      })
      .strict()
      .parse(req.body);
    await db.transaction(async (tx) => {
      const before = await requireProject(tx, req.actor, id);
      const r = await tx.query(
        "UPDATE projects SET name=$2,status=$3,version=version+1 WHERE id=$1 AND version=$4 RETURNING id",
        [id, b.name, b.status, b.version],
      );
      if (!r.rows.length)
        throw new Denied(409, "ข้อมูลเปลี่ยนแล้ว กรุณาโหลดใหม่");
      await audit(tx, req.actor, "PROJECT_UPDATED", id, { before, after: b });
    });
    return { ok: true };
  });
  app.post("/api/projects/:id/jobs", async (req) => {
    manage(req.actor);
    const project = uuid.parse((req.params as any).id),
      b = z.object({ name: text }).strict().parse(req.body),
      id = randomUUID();
    await db.transaction(async (tx) => {
      const p = await requireProject(tx, req.actor, project);
      if (p.status !== "ACTIVE") throw new Denied(409);
      await tx.query(
        "INSERT INTO jobs(id,project_id,code,name) VALUES($1,$2,$3,$4)",
        [id, project, "JOB-" + id.slice(0, 8), b.name],
      );
      await audit(tx, req.actor, "JOB_CREATED", id, {
        project_id: project,
        ...b,
      });
    });
    return { id };
  });
  app.get("/api/projects/:id/assignments", async (req) => {
    manage(req.actor);
    const id = uuid.parse((req.params as any).id);
    await requireProject(db, req.actor, id);
    return (
      await db.query(
        "SELECT a.id,a.employee_id,a.job_id,e.display_name FROM job_assignments a JOIN employees e ON e.id=a.employee_id WHERE a.project_id=$1 AND a.revoked_at IS NULL",
        [id],
      )
    ).rows;
  });
  app.post("/api/projects/:id/assignments", async (req) => {
    manage(req.actor);
    const project = uuid.parse((req.params as any).id),
      b = z
        .object({ employee_id: uuid, job_id: uuid.nullable().optional() })
        .strict()
        .parse(req.body),
      id = randomUUID();
    await db.transaction(async (tx) => {
      const p = await requireProject(tx, req.actor, project);
      if (p.status !== "ACTIVE") throw new Denied(409);
      const e = (
        await tx.query(
          "SELECT e.id FROM employees e JOIN users u ON u.id=e.user_id WHERE e.id=$1 AND e.active AND u.active",
          [b.employee_id],
        )
      ).rows[0];
      if (!e) throw new Denied(409);
      await tx.query(
        "INSERT INTO job_assignments(id,project_id,job_id,employee_id,created_by) VALUES($1,$2,$3,$4,$5)",
        [id, project, b.job_id || null, b.employee_id, req.actor.id],
      );
      await audit(tx, req.actor, "ASSIGNED", id, { project_id: project, ...b });
    });
    return { id };
  });
  app.delete("/api/assignments/:id", async (req) => {
    manage(req.actor);
    const id = uuid.parse((req.params as any).id);
    await db.transaction(async (tx) => {
      const r = await tx.query(
        "UPDATE job_assignments SET revoked_at=now() WHERE id=$1 AND revoked_at IS NULL RETURNING project_id",
        [id],
      );
      if (!r.rows.length) throw new Denied(404);
      await audit(tx, req.actor, "ASSIGNMENT_REVOKED", id, r.rows[0]);
    });
    return { ok: true };
  });
  app.post("/api/projects/:id/pm", async (req) => {
    manage(req.actor);
    const id = uuid.parse((req.params as any).id),
      b = z
        .object({ user_id: uuid, active: z.boolean() })
        .strict()
        .parse(req.body);
    await db.transaction(async (tx) => {
      await requireProject(tx, req.actor, id);
      if (
        !(
          await tx.query(
            "SELECT id FROM users WHERE id=$1 AND role='PM' AND active",
            [b.user_id],
          )
        ).rows.length
      )
        throw new Denied(409);
      if (b.active)
        await tx.query(
          "INSERT INTO project_members(project_id,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
          [id, b.user_id],
        );
      else
        await tx.query(
          "DELETE FROM project_members WHERE project_id=$1 AND user_id=$2",
          [id, b.user_id],
        );
      await audit(tx, req.actor, "PM_MEMBERSHIP", id, b);
    });
    return { ok: true };
  });
  app.get("/api/audit", async (req) => {
    manage(req.actor);
    return (
      await db.query(
        "SELECT action,entity_id,actor_id,occurred_at FROM audit_logs ORDER BY occurred_at DESC LIMIT 100",
      )
    ).rows;
  });
  await registerLine(app, db, origin);
  return app;
}
