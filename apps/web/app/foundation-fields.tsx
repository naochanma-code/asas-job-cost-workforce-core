type Row = Record<string, any>;
export function TypeSelect({
  kind,
  types,
  current,
}: {
  kind: "project" | "job";
  types: Row[];
  current?: string;
}) {
  return (
    <label>
      {kind === "project" ? "ประเภทโครงการ" : "ประเภทงานย่อย"}
      <select
        name={kind + "_type_id"}
        defaultValue={
          current ??
          types.find((t) => t.code === "OTHER" && t.enabled)?.id ??
          ""
        }
        required
      >
        <option value="">เลือกประเภท</option>
        {types
          .filter((t) => t.enabled || t.id === current)
          .map((t) => (
            <option key={t.id} value={t.id}>
              {t.display_name}
              {t.enabled ? "" : " (ปิดใช้งาน — ข้อมูลเดิม)"}
            </option>
          ))}
      </select>
    </label>
  );
}
export function ProjectFields({
  project = {},
  types,
  users,
  manager,
}: {
  project?: Row;
  types: Row[];
  users: Row[];
  manager: boolean;
}) {
  return (
    <>
      <TypeSelect
        kind="project"
        types={types}
        current={project.project_type_id}
      />
      {manager && (
        <label>
          ผู้จัดการโครงการ (PM)
          <select
            name="project_manager_id"
            defaultValue={project.project_manager_id ?? ""}
          >
            <option value="">ยังไม่กำหนด</option>
            {users
              .filter(
                (u) =>
                  u.role === "PM" &&
                  (u.active || u.id === project.project_manager_id),
              )
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.display_name}
                  {u.active ? "" : " (ปิดบัญชี)"}
                </option>
              ))}
          </select>
        </label>
      )}
      <div className="grid compact">
        <label>
          วันเริ่ม
          <input
            type="date"
            name="start_date"
            defaultValue={project.start_date ?? ""}
          />
        </label>
        <label>
          วันจบเป้าหมาย
          <input
            type="date"
            name="target_completion_date"
            defaultValue={project.target_completion_date ?? ""}
          />
        </label>
      </div>
      <label>
        ความสำคัญ
        <select name="priority" defaultValue={project.priority ?? "NORMAL"}>
          <option value="LOW">ต่ำ</option>
          <option value="NORMAL">ปกติ</option>
          <option value="HIGH">สูง</option>
          <option value="URGENT">เร่งด่วน</option>
        </select>
      </label>
      <label>
        รายละเอียด
        <textarea
          name="description"
          maxLength={4000}
          defaultValue={project.description ?? ""}
        />
      </label>
      <label>
        ความคืบหน้า (%)
        <input
          name="progress"
          type="number"
          min={0}
          max={100}
          step={1}
          defaultValue={project.progress ?? 0}
          required
        />
      </label>
    </>
  );
}
export function JobFields({
  job = {},
  types,
  people,
}: {
  job?: Row;
  types: Row[];
  people: Row[];
}) {
  const known = people.some((e) => e.employee_id === job.responsible_person_id);
  return (
    <>
      <TypeSelect kind="job" types={types} current={job.job_type_id} />
      <label>
        รายละเอียดงาน
        <textarea
          name="description"
          maxLength={4000}
          defaultValue={job.description ?? ""}
        />
      </label>
      <label>
        ผู้รับผิดชอบ
        <select
          name="responsible_person_id"
          defaultValue={job.responsible_person_id ?? ""}
        >
          <option value="">ยังไม่กำหนด</option>
          {!known && job.responsible_person_id && (
            <option value={job.responsible_person_id}>
              {job.responsible_person_name} (ข้อมูลเดิม)
            </option>
          )}
          {people.map((e) => (
            <option key={e.employee_id} value={e.employee_id}>
              {e.display_name}
            </option>
          ))}
        </select>
      </label>
      <label>
        วันที่วางแผน
        <input
          type="date"
          name="planned_date"
          defaultValue={job.planned_date ?? ""}
        />
      </label>
      <label>
        สถานะงาน
        <select name="status" defaultValue={job.status ?? "PLANNED"}>
          <option value="PLANNED">วางแผน</option>
          <option value="ACTIVE">กำลังทำ</option>
          {job.id && (
            <>
              <option value="BLOCKED">ติดปัญหา</option>
              <option value="DONE">เสร็จแล้ว</option>
              <option value="CANCELLED">ยกเลิก</option>
            </>
          )}
        </select>
      </label>
      <label>
        ความคืบหน้างาน (%)
        <input
          type="number"
          name="progress"
          min={0}
          max={100}
          step={1}
          defaultValue={job.progress ?? 0}
          required
        />
      </label>
    </>
  );
}
export function projectInput(b: Row) {
  const { reason, ...input } = b;
  return {
    ...input,
    ...(reason ? { reason } : {}),
    progress: Number(b.progress ?? 0),
    start_date: b.start_date || null,
    target_completion_date: b.target_completion_date || null,
    ...(b.project_manager_id !== undefined
      ? { project_manager_id: b.project_manager_id || null }
      : {}),
  };
}
export function jobInput(b: Row) {
  return {
    ...b,
    progress: Number(b.progress ?? 0),
    planned_date: b.planned_date || null,
    responsible_person_id: b.responsible_person_id || null,
  };
}
