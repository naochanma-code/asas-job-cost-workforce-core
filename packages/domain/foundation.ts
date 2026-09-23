import { z } from "zod";
import type { Queryable } from "../database/index";
import { Actor, Denied, audit } from "./identity";

export const uuid = z.string().uuid();
export const name = z.string().trim().min(1).max(160);
export const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const d = new Date(value + "T00:00:00Z");
    return (
      Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value
    );
  }, "Invalid calendar date");
export const projectFields = {
  name,
  project_type_id: uuid.optional(),
  project_manager_id: uuid.nullable().optional(),
  start_date: date.nullable().optional(),
  target_completion_date: date.nullable().optional(),
  status: z.enum(["PLANNED", "ACTIVE", "COMPLETED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  description: z.string().trim().max(4000).optional(),
  progress: z.number().int().min(0).max(100).optional(),
};
export const jobFields = {
  name,
  job_type_id: uuid.optional(),
  description: z.string().trim().max(4000).optional(),
  responsible_person_id: uuid.nullable().optional(),
  planned_date: date.nullable().optional(),
  status: z
    .enum(["PLANNED", "ACTIVE", "BLOCKED", "DONE", "CANCELLED"])
    .optional(),
  progress: z.number().int().min(0).max(100).optional(),
};
export function checkDates(start?: string | null, end?: string | null) {
  if (start && end && end < start)
    throw new Denied(400, "วันจบเป้าหมายต้องไม่ก่อนวันเริ่ม");
}
export function checkJobTransition(before: string, after: string) {
  const allowed: Record<string, string[]> = {
    PLANNED: ["ACTIVE", "CANCELLED"],
    ACTIVE: ["BLOCKED", "DONE", "CANCELLED"],
    BLOCKED: ["ACTIVE", "DONE", "CANCELLED"],
    DONE: [],
    CANCELLED: [],
  };
  if (before !== after && !allowed[before]?.includes(after))
    throw new Denied(409, "เปลี่ยนสถานะงานย่อยไม่ตรงลำดับ");
}
export const typeTable = (kind: "project" | "job") =>
  kind === "project" ? "project_types" : "job_types";
export async function checkedType(
  tx: Queryable,
  kind: "project" | "job",
  id?: string,
  existing?: string,
) {
  const table = typeTable(kind);
  const row = (
    await tx.query(
      `SELECT * FROM ${table} WHERE ${id ? "id=$1" : "code='OTHER'"} FOR SHARE`,
      id ? [id] : [],
    )
  ).rows[0];
  if (!row || (!row.enabled && row.id !== existing))
    throw new Denied(409, "ประเภทนี้ปิดใช้งานแล้ว กรุณาเลือกประเภทที่เปิดอยู่");
  return row;
}
export async function lockProject(tx: Queryable, actor: Actor, id: string) {
  if (!["OWNER", "ADMIN", "PM"].includes(actor.role)) throw new Denied();
  const p = (
    await tx.query(
      "SELECT *,start_date::text,target_completion_date::text FROM projects WHERE id=$1 FOR UPDATE",
      [id],
    )
  ).rows[0];
  if (!p) throw new Denied(404);
  if (
    actor.role === "PM" &&
    !(
      await tx.query(
        "SELECT user_id FROM project_members WHERE project_id=$1 AND user_id=$2",
        [id, actor.id],
      )
    ).rows.length
  )
    throw new Denied(404);
  return p;
}
export async function checkedEmployee(
  tx: Queryable,
  id: string,
  techOnly: boolean,
  active = true,
) {
  const e = (
    await tx.query(
      "SELECT e.id,e.user_id,u.role,e.active AS employee_active,u.active AS user_active FROM employees e JOIN users u ON u.id=e.user_id WHERE e.id=$1 FOR SHARE OF e,u",
      [id],
    )
  ).rows[0];
  if (!e || (techOnly && e.role !== "TECH"))
    throw new Denied(403, "มอบหมายได้เฉพาะช่าง TECH");
  if (active && (!e.employee_active || !e.user_active))
    throw new Denied(409, "พนักงานปิดใช้งานแล้ว");
  return e;
}
export async function checkedResponsible(
  tx: Queryable,
  project: string,
  employee: string | null | undefined,
  job?: string,
) {
  if (!employee) return;
  const e = await checkedEmployee(tx, employee, false);
  if (
    !(
      await tx.query(
        `SELECT 1 FROM project_members WHERE project_id=$1 AND user_id=$2
    UNION ALL SELECT 1 FROM job_assignments WHERE project_id=$1 AND employee_id=$3 AND revoked_at IS NULL AND (job_id IS NULL OR job_id=$4)`,
        [project, e.user_id, employee, job || null],
      )
    ).rows.length
  )
    throw new Denied(409, "ผู้รับผิดชอบต้องอยู่ในทีมของโครงการหรืองานนี้");
}
export async function setPrimaryManager(
  tx: Queryable,
  actor: Actor,
  project: string,
  next: string | null,
  previous: string | null,
) {
  if (!["OWNER", "ADMIN"].includes(actor.role)) throw new Denied();
  if (next === previous) return;
  if (
    next &&
    !(
      await tx.query(
        "SELECT id FROM users WHERE id=$1 AND role='PM' AND active FOR SHARE",
        [next],
      )
    ).rows.length
  )
    throw new Denied(409, "เลือกบัญชี PM ที่เปิดใช้งาน");
  if (previous && previous !== next)
    await tx.query(
      "DELETE FROM project_members WHERE project_id=$1 AND user_id=$2",
      [project, previous],
    );
  if (next)
    await tx.query(
      "INSERT INTO project_members(project_id,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
      [project, next],
    );
  await tx.query("UPDATE projects SET project_manager_id=$2 WHERE id=$1", [
    project,
    next,
  ]);
  if (previous !== next)
    await audit(tx, actor, "PROJECT_MANAGER_CHANGED", project, {
      before: previous,
      after: next,
    });
}
async function nextNumber(tx: Queryable, scope: string) {
  const n = (
    await tx.query(
      "INSERT INTO code_counters(scope,last_value) VALUES($1,1) ON CONFLICT(scope) DO UPDATE SET last_value=code_counters.last_value+1 RETURNING last_value",
      [scope],
    )
  ).rows[0].last_value;
  return String(n);
}
export async function projectNamespace(tx: Queryable) {
  const period = (
    await tx.query(
      "SELECT to_char(now() AT TIME ZONE 'Asia/Bangkok','YYMM') AS period",
    )
  ).rows[0].period;
  return (
    period + "-" + (await nextNumber(tx, "PROJECT:" + period)).padStart(3, "0")
  );
}
export async function reserveProjectCode(tx: Queryable, id: string) {
  for (;;) {
    const namespace = await projectNamespace(tx),
      code = "PRJ-" + namespace;
    const reserved = await tx.query(
      "INSERT INTO code_reservations(code,entity_id,kind) VALUES($1,$2,'PROJECT') ON CONFLICT(code) DO NOTHING RETURNING code",
      [code, id],
    );
    if (reserved.rows.length) return { code, namespace };
  }
}
export async function reserveJobCode(
  tx: Queryable,
  project: Record<string, any>,
  id: string,
) {
  let namespace = project.code_namespace;
  if (!namespace) {
    namespace = await projectNamespace(tx);
    await tx.query("UPDATE projects SET code_namespace=$2 WHERE id=$1", [
      project.id,
      namespace,
    ]);
  }
  for (;;) {
    const code =
      "JOB-" +
      namespace +
      "-" +
      (await nextNumber(tx, "JOB:" + project.id)).padStart(2, "0");
    const reserved = await tx.query(
      "INSERT INTO code_reservations(code,entity_id,kind) VALUES($1,$2,'JOB') ON CONFLICT(code) DO NOTHING RETURNING code",
      [code, id],
    );
    if (reserved.rows.length) return code;
  }
}
