import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { Database } from "../../../packages/database/index";
import { Denied, audit, manage } from "../../../packages/domain/identity";
import { projectsFor, requireProject } from "../../../packages/domain/projects";
import {
  uuid,
  typeId,
  name,
  projectFields,
  jobFields,
  typeTable,
  checkedType,
  lockProject,
  checkedEmployee,
  checkedResponsible,
  setPrimaryManager,
  reserveProjectCode,
  reserveJobCode,
  checkDates,
  checkJobTransition,
} from "../../../packages/domain/foundation";

export async function registerFoundation(app: FastifyInstance, db: Database) {
  for (const kind of ["project", "job"] as const) {
    const table = typeTable(kind),
      path = "/api/" + kind + "-types";
    app.get(
      path,
      async () =>
        (
          await db.query(
            `SELECT id,code,display_name,sort_order,enabled,version FROM ${table} ORDER BY sort_order,code`,
          )
        ).rows,
    );
    app.post(path, async (req) => {
      manage(req.actor);
      const b = z
          .object({
            code: z.string().regex(/^[A-Z][A-Z0-9_]{0,49}$/),
            display_name: name,
            sort_order: z.number().int().min(-100000).max(100000).default(0),
          })
          .strict()
          .parse(req.body),
        id = randomUUID();
      await db.transaction(async (tx) => {
        await tx.query(
          `INSERT INTO ${table}(id,code,display_name,sort_order) VALUES($1,$2,$3,$4)`,
          [id, b.code, b.display_name, b.sort_order],
        );
        await audit(tx, req.actor, "TYPE_CREATED", id, { kind, ...b });
      });
      return { id };
    });
    app.patch(path + "/:id", async (req) => {
      manage(req.actor);
      const id = typeId.parse((req.params as any).id),
        b = z
          .object({
            display_name: name.optional(),
            sort_order: z.number().int().min(-100000).max(100000).optional(),
            enabled: z.boolean().optional(),
            version: z.number().int().positive(),
          })
          .strict()
          .parse(req.body);
      await db.transaction(async (tx) => {
        const before = (
          await tx.query(`SELECT * FROM ${table} WHERE id=$1 FOR UPDATE`, [id])
        ).rows[0];
        if (!before) throw new Denied(404);
        if (before.version !== b.version)
          throw new Denied(409, "ข้อมูลเปลี่ยนแล้ว กรุณาโหลดใหม่");
        await tx.query(
          `UPDATE ${table} SET display_name=$2,sort_order=$3,enabled=$4,version=version+1 WHERE id=$1`,
          [
            id,
            b.display_name ?? before.display_name,
            b.sort_order ?? before.sort_order,
            b.enabled ?? before.enabled,
          ],
        );
        await audit(tx, req.actor, "TYPE_UPDATED", id, {
          kind,
          before,
          after: b,
        });
      });
      return { ok: true };
    });
  }
  app.get("/api/projects", async (req) => projectsFor(db, req.actor));
  app.post("/api/projects", async (req) => {
    manage(req.actor);
    const b = z
        .object({
          ...projectFields,
          customer_id: uuid,
          site_id: uuid.nullable().optional(),
        })
        .strict()
        .parse(req.body),
      id = randomUUID();
    let code = "";
    await db.transaction(async (tx) => {
      checkDates(b.start_date, b.target_completion_date);
      const type = await checkedType(tx, "project", b.project_type_id),
        allocated = await reserveProjectCode(tx, id);
      code = allocated.code;
      await tx.query(
        `INSERT INTO projects(id,code,code_namespace,name,customer_id,site_id,created_by,project_type_id,type_name_snapshot,start_date,target_completion_date,status,priority,description,progress)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          id,
          code,
          allocated.namespace,
          b.name,
          b.customer_id,
          b.site_id ?? null,
          req.actor.id,
          type.id,
          type.display_name,
          b.start_date ?? null,
          b.target_completion_date ?? null,
          b.status ?? "ACTIVE",
          b.priority ?? "NORMAL",
          b.description ?? "",
          b.progress ?? 0,
        ],
      );
      if (b.project_manager_id)
        await setPrimaryManager(tx, req.actor, id, b.project_manager_id, null);
      await audit(tx, req.actor, "PROJECT_CREATED", id, { ...b, code });
    });
    return { id, code };
  });
  app.get("/api/projects/:id", async (req) => {
    const id = uuid.parse((req.params as any).id),
      p = await requireProject(db, req.actor, id);
    const jobs = (
      await db.query(
        `SELECT j.id,j.project_id,j.code,j.name,j.job_type_id,j.type_name_snapshot,j.description,
      j.responsible_person_id,e.display_name AS responsible_person_name,j.planned_date::text,j.status,j.progress,j.created_by,j.created_at,j.version,
      t.code AS job_type_code,t.display_name AS job_type_name,t.enabled AS job_type_enabled
      FROM jobs j JOIN job_types t ON t.id=j.job_type_id LEFT JOIN employees e ON e.id=j.responsible_person_id
      WHERE j.project_id=$1 AND ($2<>'TECH' OR EXISTS(SELECT 1 FROM job_assignments a JOIN employees emp ON emp.id=a.employee_id
        WHERE a.project_id=j.project_id AND (a.job_id IS NULL OR a.job_id=j.id) AND a.revoked_at IS NULL AND emp.active AND emp.user_id=$3)) ORDER BY j.code`,
        [id, req.actor.role, req.actor.id],
      )
    ).rows;
    return { ...p, jobs };
  });
  app.patch("/api/projects/:id", async (req) => {
    const id = uuid.parse((req.params as any).id),
      b = z
        .object({
          ...projectFields,
          name: name.optional(),
          version: z.number().int().positive(),
          reason: z.string().trim().min(1).max(500).optional(),
        })
        .strict()
        .parse(req.body);
    if (req.actor.role === "PM" && b.project_manager_id !== undefined)
      throw new Denied();
    await db.transaction(async (tx) => {
      const before = await lockProject(tx, req.actor, id);
      if (before.version !== b.version)
        throw new Denied(409, "ข้อมูลเปลี่ยนแล้ว กรุณาโหลดใหม่");
      const next = { ...before, ...b };
      checkDates(
        next.start_date && String(next.start_date).slice(0, 10),
        next.target_completion_date &&
          String(next.target_completion_date).slice(0, 10),
      );
      if (
        before.status === "CLOSED" &&
        next.status !== "CLOSED" &&
        (!["OWNER", "ADMIN"].includes(req.actor.role) || !b.reason)
      )
        throw new Denied(403, "เปิดโครงการใหม่ต้องให้ Admin/Owner ระบุเหตุผล");
      const type = await checkedType(
        tx,
        "project",
        next.project_type_id,
        before.project_type_id,
      );
      await tx.query(
        `UPDATE projects SET name=$2,project_type_id=$3,type_name_snapshot=$4,start_date=$5,target_completion_date=$6,status=$7,priority=$8,description=$9,progress=$10,version=version+1 WHERE id=$1`,
        [
          id,
          next.name,
          type.id,
          type.id === before.project_type_id
            ? before.type_name_snapshot
            : type.display_name,
          next.start_date,
          next.target_completion_date,
          next.status,
          next.priority,
          next.description,
          next.progress,
        ],
      );
      if (b.project_manager_id !== undefined)
        await setPrimaryManager(
          tx,
          req.actor,
          id,
          b.project_manager_id,
          before.project_manager_id,
        );
      await audit(tx, req.actor, "PROJECT_UPDATED", id, { before, after: b });
    });
    return { ok: true };
  });
  app.post("/api/projects/:id/jobs", async (req) => {
    const project = uuid.parse((req.params as any).id),
      b = z.object(jobFields).strict().parse(req.body),
      id = randomUUID();
    let code = "";
    await db.transaction(async (tx) => {
      const p = await lockProject(tx, req.actor, project);
      if (!["PLANNED", "ACTIVE"].includes(p.status)) throw new Denied(409);
      if (b.status && !["PLANNED", "ACTIVE"].includes(b.status))
        throw new Denied(400, "งานใหม่ต้องเริ่มที่ PLANNED หรือ ACTIVE");
      const type = await checkedType(tx, "job", b.job_type_id);
      await checkedResponsible(tx, project, b.responsible_person_id);
      code = await reserveJobCode(tx, p, id);
      await tx.query(
        `INSERT INTO jobs(id,project_id,code,name,job_type_id,type_name_snapshot,description,responsible_person_id,planned_date,status,progress,created_by)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          id,
          project,
          code,
          b.name,
          type.id,
          type.display_name,
          b.description ?? "",
          b.responsible_person_id ?? null,
          b.planned_date ?? null,
          b.status ?? "PLANNED",
          b.progress ?? 0,
          req.actor.id,
        ],
      );
      await audit(tx, req.actor, "JOB_CREATED", id, {
        project_id: project,
        ...b,
        code,
      });
    });
    return { id, code };
  });
  app.patch("/api/projects/:id/jobs/:job", async (req) => {
    const project = uuid.parse((req.params as any).id),
      job = uuid.parse((req.params as any).job),
      b = z
        .object({
          ...jobFields,
          name: name.optional(),
          version: z.number().int().positive(),
        })
        .strict()
        .parse(req.body);
    await db.transaction(async (tx) => {
      const p = await lockProject(tx, req.actor, project);
      if (p.status === "CLOSED") throw new Denied(409);
      const before = (
        await tx.query(
          "SELECT * FROM jobs WHERE id=$1 AND project_id=$2 FOR UPDATE",
          [job, project],
        )
      ).rows[0];
      if (!before) throw new Denied(404);
      if (before.version !== b.version) throw new Denied(409);
      const next = { ...before, ...b },
        type = await checkedType(
          tx,
          "job",
          next.job_type_id,
          before.job_type_id,
        );
      checkJobTransition(before.status, next.status ?? before.status);
      if (
        b.responsible_person_id !== undefined &&
        b.responsible_person_id !== before.responsible_person_id
      )
        await checkedResponsible(tx, project, b.responsible_person_id, job);
      await tx.query(
        `UPDATE jobs SET name=$2,job_type_id=$3,type_name_snapshot=$4,description=$5,responsible_person_id=$6,planned_date=$7,status=$8,progress=$9,version=version+1 WHERE id=$1`,
        [
          job,
          next.name,
          type.id,
          type.id === before.job_type_id
            ? before.type_name_snapshot
            : type.display_name,
          next.description,
          next.responsible_person_id,
          next.planned_date,
          next.status,
          next.progress,
        ],
      );
      await audit(tx, req.actor, "JOB_UPDATED", job, {
        project_id: project,
        before,
        after: b,
      });
    });
    return { ok: true };
  });
  app.get("/api/projects/:id/assignable-technicians", async (req) =>
    db.transaction(async (tx) => {
      const id = uuid.parse((req.params as any).id);
      await lockProject(tx, req.actor, id);
      return (
        await tx.query(
          "SELECT e.id AS employee_id,e.display_name FROM employees e JOIN users u ON u.id=e.user_id WHERE e.active AND u.active AND u.role='TECH' ORDER BY e.display_name,e.id",
        )
      ).rows;
    }),
  );
  app.get("/api/projects/:id/assignments", async (req) =>
    db.transaction(async (tx) => {
      const id = uuid.parse((req.params as any).id);
      await lockProject(tx, req.actor, id);
      return (
        await tx.query(
          `SELECT a.id,a.employee_id,a.job_id,e.display_name,u.role FROM job_assignments a JOIN employees e ON e.id=a.employee_id JOIN users u ON u.id=e.user_id
      WHERE a.project_id=$1 AND a.revoked_at IS NULL AND ($2<>'PM' OR u.role='TECH') ORDER BY a.created_at,a.id`,
          [id, req.actor.role],
        )
      ).rows;
    }),
  );
  app.post("/api/projects/:id/assignments", async (req) => {
    const project = uuid.parse((req.params as any).id),
      b = z
        .object({ employee_id: uuid, job_id: uuid.nullable().optional() })
        .strict()
        .parse(req.body),
      id = randomUUID();
    await db.transaction(async (tx) => {
      const p = await lockProject(tx, req.actor, project);
      if (!["PLANNED", "ACTIVE"].includes(p.status)) throw new Denied(409);
      await checkedEmployee(tx, b.employee_id, req.actor.role === "PM");
      await tx.query(
        "INSERT INTO job_assignments(id,project_id,job_id,employee_id,created_by) VALUES($1,$2,$3,$4,$5)",
        [id, project, b.job_id ?? null, b.employee_id, req.actor.id],
      );
      await audit(tx, req.actor, "ASSIGNED", id, { project_id: project, ...b });
    });
    return { id };
  });
  app.delete("/api/assignments/:id", async (req) => {
    const id = uuid.parse((req.params as any).id);
    await db.transaction(async (tx) => {
      const assignment = (
        await tx.query("SELECT * FROM job_assignments WHERE id=$1", [id])
      ).rows[0];
      if (!assignment) throw new Denied(404);
      await lockProject(tx, req.actor, assignment.project_id);
      await checkedEmployee(
        tx,
        assignment.employee_id,
        req.actor.role === "PM",
        false,
      );
      const r = await tx.query(
        "UPDATE job_assignments SET revoked_at=now() WHERE id=$1 AND revoked_at IS NULL RETURNING project_id,employee_id,job_id,revoked_at",
        [id],
      );
      if (!r.rows.length) throw new Denied(404);
      await audit(tx, req.actor, "ASSIGNMENT_REVOKED", id, {
        before: assignment,
        after: r.rows[0],
      });
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
      const p = await lockProject(tx, req.actor, id);
      if (
        !(
          await tx.query(
            "SELECT id FROM users WHERE id=$1 AND role='PM' AND active FOR SHARE",
            [b.user_id],
          )
        ).rows.length
      )
        throw new Denied(409);
      if (b.active) {
        await tx.query(
          "INSERT INTO project_members(project_id,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
          [id, b.user_id],
        );
        if (!p.project_manager_id)
          await tx.query(
            "UPDATE projects SET project_manager_id=$2,version=version+1 WHERE id=$1",
            [id, b.user_id],
          );
      } else {
        await tx.query(
          "DELETE FROM project_members WHERE project_id=$1 AND user_id=$2",
          [id, b.user_id],
        );
        if (p.project_manager_id === b.user_id)
          await tx.query(
            "UPDATE projects SET project_manager_id=NULL,version=version+1 WHERE id=$1",
            [id],
          );
      }
      await audit(tx, req.actor, "PM_MEMBERSHIP", id, b);
    });
    return { ok: true };
  });
}
