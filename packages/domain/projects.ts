import type { Queryable } from "../database/index";
import { Actor, Denied } from "./identity";
export async function projectsFor(db: Queryable, actor: Actor) {
  return (
    await db.query(
      `SELECT p.id,p.code,p.name,p.customer_id,p.site_id,p.status,p.version,
 c.name AS customer_name,s.name AS site_name,
 p.project_type_id,pt.code AS project_type_code,pt.display_name AS project_type_name,pt.enabled AS project_type_enabled,
 p.type_name_snapshot,p.project_manager_id,pm.display_name AS project_manager_name,
 p.start_date::text,p.target_completion_date::text,p.priority,p.description,p.progress,p.created_by,p.created_at
 FROM projects p JOIN customers c ON c.id=p.customer_id
 JOIN project_types pt ON pt.id=p.project_type_id LEFT JOIN users pm ON pm.id=p.project_manager_id
 LEFT JOIN sites s ON s.id=p.site_id AND s.customer_id=p.customer_id WHERE
 $2 IN ('OWNER','ADMIN') OR ($2='PM' AND EXISTS(SELECT 1 FROM project_members m WHERE m.project_id=p.id AND m.user_id=$1))
 OR ($2='TECH' AND EXISTS(SELECT 1 FROM job_assignments a JOIN employees e ON e.id=a.employee_id WHERE a.project_id=p.id AND e.user_id=$1 AND e.active AND a.revoked_at IS NULL)) ORDER BY p.created_at,p.id`,
      [actor.id, actor.role],
    )
  ).rows;
}
export async function requireProject(db: Queryable, actor: Actor, id: string) {
  const p = (await projectsFor(db, actor)).find((p) => p.id === id);
  if (!p) throw new Denied(404, "ไม่พบโครงการ");
  return p;
}
