import type { Queryable } from "../database/index";
import { Actor, Denied } from "./identity";
export async function projectsFor(db: Queryable, actor: Actor) {
  return (
    await db.query(
      `SELECT p.id,p.code,p.name,p.customer_id,p.site_id,p.status,p.version FROM projects p WHERE
 $2 IN ('OWNER','ADMIN') OR EXISTS(SELECT 1 FROM project_members m WHERE m.project_id=p.id AND m.user_id=$1)
 OR EXISTS(SELECT 1 FROM job_assignments a JOIN employees e ON e.id=a.employee_id WHERE a.project_id=p.id AND e.user_id=$1 AND e.active AND a.revoked_at IS NULL) ORDER BY p.created_at,p.id`,
      [actor.id, actor.role],
    )
  ).rows;
}
export async function requireProject(db: Queryable, actor: Actor, id: string) {
  const p = (await projectsFor(db, actor)).find((p) => p.id === id);
  if (!p) throw new Denied(404, "ไม่พบโครงการ");
  return p;
}
