"use client";
import { useEffect, useState, FormEvent } from "react";
import {
  ProjectFields,
  JobFields,
  projectInput,
  jobInput,
} from "./foundation-fields";
type Row = Record<string, any>;
async function api(path: string, method = "GET", body?: unknown) {
  const r = await fetch("/api" + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await r.json();
  if (!r.ok) throw Error(data.error || "ทำรายการไม่สำเร็จ");
  return data;
}
export default function Home() {
  const [me, setMe] = useState<Row | null>(null),
    [ready, setReady] = useState(false),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [projects, setProjects] = useState<Row[]>([]),
    [customers, setCustomers] = useState<Row[]>([]),
    [sites, setSites] = useState<Row[]>([]),
    [projectTypes, setProjectTypes] = useState<Row[]>([]),
    [jobTypes, setJobTypes] = useState<Row[]>([]),
    [technicians, setTechnicians] = useState<Row[]>([]),
    [users, setUsers] = useState<Row[]>([]),
    [selected, setSelected] = useState<Row | null>(null),
    [createdJob, setCreatedJob] = useState<Row | null>(null),
    [jobError, setJobError] = useState(""),
    [assignments, setAssignments] = useState<Row[]>([]),
    [page, setPage] = useState("projects"),
    [customer, setCustomer] = useState(""),
    [linkToken, setLinkToken] = useState("");
  const manager = me && ["OWNER", "ADMIN"].includes(me.role);
  async function load(user: Row) {
    setProjects(await api("/projects"));
    const [pt, jt] = await Promise.all([
      api("/project-types"),
      api("/job-types"),
    ]);
    setProjectTypes(pt);
    setJobTypes(jt);
    if (["OWNER", "ADMIN"].includes(user.role)) {
      const [c, s, u] = await Promise.all([
        api("/customers"),
        api("/sites"),
        api("/users"),
      ]);
      setCustomers(c);
      setSites(s);
      setUsers(u);
    }
  }
  useEffect(() => {
    const token = new URLSearchParams(location.search).get("linkToken");
    if (token) {
      setLinkToken(token);
      history.replaceState(null, "", "/");
    }
    api("/me")
      .then(async (u) => {
        setMe(u);
        await load(u);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  async function act(
    fn: () => Promise<void>,
    onError?: (message: string) => void,
  ) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (e) {
      const error = (e as Error).message;
      setMessage(error);
      onError?.(error);
    } finally {
      setBusy(false);
    }
  }
  const fields = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    return Object.fromEntries(new FormData(e.currentTarget));
  };
  async function open(id: string) {
    const detail = await api("/projects/" + id);
    setSelected(detail);
    if (manager || me?.role === "PM") {
      setAssignments(await api("/projects/" + id + "/assignments"));
      setTechnicians(await api("/projects/" + id + "/assignable-technicians"));
    }
    return detail;
  }
  if (!ready) return <main>กำลังโหลด…</main>;
  return (
    <>
      <header>
        <small style={{ color: "#bdd7c9" }}>ASAS · FOUNDATION</small>
        <h1>โครงการและทีม</h1>
        <p>
          {me
            ? me.display_name + " · " + me.role
            : "เข้าสู่ระบบเพื่อดูงานที่รับผิดชอบ"}
        </p>
        {me && (
          <button
            className="secondary"
            onClick={() =>
              act(async () => {
                await api("/logout", "POST");
                setMe(null);
                setSelected(null);
                setProjects([]);
                setCustomers([]);
                setSites([]);
                setUsers([]);
                setAssignments([]);
                setCustomer("");
                setProjectTypes([]);
                setJobTypes([]);
                setTechnicians([]);
                setPage("projects");
              })
            }
          >
            ออกจากระบบ
          </button>
        )}
      </header>
      <main>
        {message && (
          <p role="status" className="message">
            {message}
          </p>
        )}
        {!me ? (
          <form
            className="card login"
            onSubmit={(e) => {
              const b = fields(e);
              act(async () => {
                await api("/login", "POST", b);
                const u = await api("/me");
                setMe(u);
                await load(u);
              });
            }}
          >
            <h2>เข้าสู่ระบบ</h2>
            <label>
              ชื่อผู้ใช้
              <input name="username" autoComplete="username" required />
            </label>
            <label>
              รหัสผ่าน
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                minLength={12}
                required
              />
            </label>
            <button disabled={busy}>เข้าสู่ระบบ</button>
            <p className="muted">ใช้บัญชีที่ผู้ดูแลสร้างให้</p>
          </form>
        ) : (
          <>
            {me.line_enabled === true && linkToken && (
              <section className="card">
                <h2>เชื่อมบัญชี LINE</h2>
                <p>
                  เชื่อมกับบัญชี {me.display_name}{" "}
                  สามารถยกเลิกการเชื่อมได้ภายหลัง
                </p>
                <button
                  disabled={busy}
                  onClick={() =>
                    act(async () => {
                      const r = await api("/line/link", "POST", { linkToken });
                      location.assign(r.url);
                    })
                  }
                >
                  ยืนยันเชื่อมบัญชี
                </button>
              </section>
            )}
            <nav>
              <button
                onClick={() => {
                  setPage("projects");
                  setSelected(null);
                }}
              >
                งานของฉัน
              </button>
              {manager && (
                <>
                  <button onClick={() => setPage("setup")}>ลูกค้าและทีม</button>
                  <button onClick={() => setPage("types")}>
                    ประเภทโครงการและงาน
                  </button>
                </>
              )}
              {me.role === "OWNER" && (
                <button onClick={() => setPage("accounts")}>บัญชีผู้ใช้</button>
              )}
              {me.line_enabled === true && (
                <button
                  className="secondary"
                  onClick={() =>
                    act(async () => {
                      await api("/line/link", "DELETE");
                      setLinkToken("");
                      history.replaceState(null, "", "/");
                      setMessage("ยกเลิกการเชื่อม LINE แล้ว");
                    })
                  }
                >
                  ยกเลิกเชื่อม LINE
                </button>
              )}
            </nav>
            {page === "projects" && !selected && (
              <div className="grid">
                <section>
                  <h2>โครงการที่รับผิดชอบ</h2>
                  {!projects.length && (
                    <div className="card">ยังไม่มีโครงการที่ได้รับมอบหมาย</div>
                  )}
                  {projects.map((p) => (
                    <div key={p.id} className="card project">
                      <div>
                        <span className="pill">
                          {
                            {
                              PLANNED: "วางแผน",
                              ACTIVE: "กำลังดำเนินการ",
                              COMPLETED: "งานเสร็จ",
                              CLOSED: "ปิดแล้ว",
                            }[p.status as string]
                          }
                        </span>
                        <h3>{p.name}</h3>
                        <p>ลูกค้า: {p.customer_name}</p>
                        {p.site_name && <p>สถานที่: {p.site_name}</p>}
                        <p>
                          {p.project_type_name} · {p.progress}%
                        </p>
                        <small>{p.code}</small>
                      </div>
                      <button
                        onClick={() =>
                          act(async () => {
                            setCreatedJob(null);
                            setJobError("");
                            await open(p.id);
                          })
                        }
                      >
                        เปิดโครงการ
                      </button>
                    </div>
                  ))}
                </section>
                {manager && (
                  <form
                    className="card"
                    onSubmit={(e) => {
                      const b = fields(e);
                      act(async () => {
                        const r = await api("/projects", "POST", {
                          ...projectInput(b),
                          customer_id: customer,
                          site_id: b.site_id || null,
                        });
                        await load(me);
                        await open(r.id);
                        setMessage("สร้างโครงการแล้ว มอบหมายทีมได้เลย");
                      });
                    }}
                  >
                    <h2>สร้างโครงการ</h2>
                    <label>
                      ลูกค้า
                      <select
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        required
                      >
                        <option value="">เลือกลูกค้า</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      ชื่อโครงการ
                      <input name="name" required maxLength={160} />
                    </label>
                    <ProjectFields
                      types={projectTypes}
                      users={users}
                      manager={Boolean(manager)}
                    />
                    {sites.some((s) => s.customer_id === customer) && (
                      <details>
                        <summary>เพิ่มสถานที่ (ถ้าต้องการ)</summary>
                        <label>
                          สถานที่
                          <select key={customer} name="site_id">
                            <option value="">บันทึกระดับโครงการ</option>
                            {sites
                              .filter((s) => s.customer_id === customer)
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                          </select>
                        </label>
                      </details>
                    )}
                    <button disabled={busy}>สร้างโครงการ</button>
                    <p className="muted">
                      ไม่ต้องมีสถานที่หรืองานย่อยก็เริ่มได้
                    </p>
                  </form>
                )}
              </div>
            )}
            {page === "projects" && selected && (
              <>
                <button className="secondary" onClick={() => setSelected(null)}>
                  กลับรายการโครงการ
                </button>
                <section className="card" key={selected.id}>
                  <small>{selected.code}</small>
                  <h2>{selected.name}</h2>
                  <p>
                    {selected.project_type_name} · ความคืบหน้า{" "}
                    {selected.progress}%
                  </p>
                  <p>PM: {selected.project_manager_name || "ยังไม่กำหนด"}</p>
                  <p>{selected.description}</p>
                  {selected.target_completion_date && (
                    <p>กำหนดเสร็จ: {selected.target_completion_date}</p>
                  )}
                  <p>ลูกค้า: {selected.customer_name}</p>
                  {selected.site_name && <p>สถานที่: {selected.site_name}</p>}
                  {selected.jobs.length > 0 && (
                    <section aria-label="งานย่อยในโครงการ">
                      <h3>งานย่อย (Job)</h3>
                      <ul>
                        {selected.jobs.map((j: Row) => (
                          <li key={j.id} className="job-card">
                            <strong>{j.name}</strong>
                            <p>
                              {j.code} · {j.job_type_name} · {j.status} ·{" "}
                              {j.progress}%
                            </p>
                            {j.responsible_person_name && (
                              <p>ผู้รับผิดชอบ: {j.responsible_person_name}</p>
                            )}
                            {j.planned_date && (
                              <p>วันที่วางแผน: {j.planned_date}</p>
                            )}
                            <p>{j.description}</p>
                            {me.role !== "TECH" && (
                              <details>
                                <summary>แก้ไขงานย่อย</summary>
                                <form
                                  key={j.version}
                                  onSubmit={(e) => {
                                    const b = fields(e);
                                    act(async () => {
                                      await api(
                                        "/projects/" +
                                          selected.id +
                                          "/jobs/" +
                                          j.id,
                                        "PATCH",
                                        { ...jobInput(b), version: j.version },
                                      );
                                      await open(selected.id);
                                      setMessage("บันทึกงานย่อยแล้ว");
                                    });
                                  }}
                                >
                                  <label>
                                    ชื่องานย่อย
                                    <input
                                      name="name"
                                      defaultValue={j.name}
                                      required
                                      maxLength={160}
                                    />
                                  </label>
                                  <JobFields
                                    job={j}
                                    types={jobTypes}
                                    people={assignments
                                      .filter(
                                        (a) =>
                                          a.job_id === null ||
                                          a.job_id === j.id,
                                      )
                                      .filter(
                                        (a, i, list) =>
                                          list.findIndex(
                                            (x) =>
                                              x.employee_id === a.employee_id,
                                          ) === i,
                                      )}
                                  />
                                  <button
                                    disabled={
                                      busy || selected.status === "CLOSED"
                                    }
                                  >
                                    บันทึกงานย่อย
                                  </button>
                                </form>
                              </details>
                            )}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {me.role !== "TECH" && (
                    <details>
                      <summary>แก้ไขข้อมูลโครงการ</summary>
                      <form
                        key={selected.version}
                        onSubmit={(e) => {
                          const b = fields(e);
                          act(async () => {
                            await api("/projects/" + selected.id, "PATCH", {
                              ...projectInput(b),
                              ...(b.reason ? { reason: b.reason } : {}),
                              version: selected.version,
                            });
                            await open(selected.id);
                            await load(me);
                            setMessage("บันทึกแล้ว");
                          });
                        }}
                      >
                        <label>
                          ชื่อโครงการ
                          <input
                            name="name"
                            defaultValue={selected.name}
                            required
                          />
                        </label>
                        <label>
                          สถานะ
                          <select name="status" defaultValue={selected.status}>
                            <option value="PLANNED">วางแผน</option>
                            <option value="ACTIVE">กำลังดำเนินการ</option>
                            <option value="COMPLETED">งานเสร็จ</option>
                            <option value="CLOSED">ปิดแล้ว</option>
                          </select>
                        </label>
                        <ProjectFields
                          project={selected}
                          types={projectTypes}
                          users={users}
                          manager={Boolean(manager)}
                        />
                        {selected.status === "CLOSED" && manager && (
                          <label>
                            เหตุผลเปิดโครงการใหม่
                            <input name="reason" maxLength={500} />
                          </label>
                        )}
                        <button disabled={busy}>บันทึก</button>
                      </form>
                    </details>
                  )}
                </section>
                {(manager || me.role === "PM") && (
                  <div className="grid" key={selected.id}>
                    <section className="card">
                      <h2>ทีมงาน</h2>
                      {assignments.map((a) => (
                        <p key={a.id}>
                          {a.display_name}
                          {a.job_id
                            ? " · " +
                              selected.jobs.find((j: Row) => j.id === a.job_id)
                                ?.name
                            : " · ทั้งโครงการ"}{" "}
                          <button
                            className="secondary"
                            onClick={() =>
                              act(async () => {
                                await api("/assignments/" + a.id, "DELETE");
                                await open(selected.id);
                              })
                            }
                          >
                            ถอนมอบหมาย
                          </button>
                        </p>
                      ))}
                      <form
                        onSubmit={(e) => {
                          const b = fields(e);
                          act(async () => {
                            await api(
                              "/projects/" + selected.id + "/assignments",
                              "POST",
                              {
                                employee_id: b.employee_id,
                                job_id: b.job_id || null,
                              },
                            );
                            await open(selected.id);
                            setMessage("มอบหมายแล้ว");
                          });
                        }}
                      >
                        <label>
                          พนักงาน
                          <select name="employee_id" required>
                            <option value="">เลือกพนักงาน</option>
                            {(manager
                              ? users.filter((u) => u.employee_id && u.active)
                              : technicians
                            ).map((u) => (
                              <option key={u.employee_id} value={u.employee_id}>
                                {u.display_name}
                              </option>
                            ))}
                          </select>
                        </label>
                        {selected.jobs.length > 0 && (
                          <label>
                            ขอบเขตงานที่มอบหมาย
                            <select name="job_id" defaultValue="">
                              <option value="">ทั้งโครงการ</option>
                              {selected.jobs.map((j: Row) => (
                                <option key={j.id} value={j.id}>
                                  {j.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                        <button
                          disabled={
                            busy ||
                            !["PLANNED", "ACTIVE"].includes(selected.status)
                          }
                        >
                          มอบหมายงาน
                        </button>
                      </form>
                    </section>
                    <section className="card">
                      <h2>งานย่อย (Job)</h2>
                      <p className="muted">
                        เพิ่มเมื่อมีงานย่อยที่ต้องแยกมอบหมาย หากไม่มี
                        ใช้ทั้งโครงการได้เลย
                      </p>
                      <form
                        onSubmit={(e) => {
                          const b = fields(e);
                          const form = e.currentTarget;
                          setJobError("");
                          setCreatedJob(null);
                          act(
                            async () => {
                              const created = await api(
                                "/projects/" + selected.id + "/jobs",
                                "POST",
                                jobInput(b),
                              );
                              setCreatedJob({
                                projectId: selected.id,
                                id: created.id,
                                code: created.code,
                                name: b.name,
                              });
                              form.reset();
                              try {
                                const detail = await api(
                                  "/projects/" + selected.id,
                                );
                                setSelected(detail);
                                if (
                                  !detail.jobs.some(
                                    (j: Row) => j.id === created.id,
                                  )
                                ) {
                                  setJobError(
                                    "บันทึกแล้ว แต่รายการยังไม่อัปเดต กรุณาโหลดหน้าใหม่ตรวจอีกครั้ง",
                                  );
                                }
                              } catch {
                                setJobError(
                                  "บันทึกแล้ว แต่โหลดรายการไม่สำเร็จ กรุณาโหลดหน้าใหม่ตรวจอีกครั้ง",
                                );
                              }
                            },
                            (error) =>
                              setJobError(
                                error +
                                  " หากไม่แน่ใจว่าบันทึกแล้วหรือไม่ กรุณาโหลดหน้าใหม่ตรวจรายการก่อนกดซ้ำ",
                              ),
                          );
                        }}
                      >
                        <label>
                          ชื่องานย่อย
                          <input name="name" required />
                        </label>
                        <JobFields
                          types={jobTypes}
                          people={assignments
                            .filter((a) => a.job_id === null)
                            .filter(
                              (a, i, list) =>
                                list.findIndex(
                                  (x) => x.employee_id === a.employee_id,
                                ) === i,
                            )}
                        />
                        <button
                          disabled={
                            busy ||
                            !["PLANNED", "ACTIVE"].includes(selected.status)
                          }
                        >
                          เพิ่มงานย่อย
                        </button>
                      </form>
                      {jobError && (
                        <p role="alert" className="message">
                          {jobError}
                        </p>
                      )}
                      {createdJob && createdJob.projectId === selected.id && (
                        <p role="status" className="message">
                          เพิ่มงานย่อย {createdJob.name} ({createdJob.code})
                          แล้ว
                        </p>
                      )}
                      <h3>งานย่อยในโครงการ ({selected.jobs.length})</h3>
                      {selected.jobs.length === 0 ? (
                        <p className="muted">ยังไม่มีงานย่อย</p>
                      ) : (
                        <ul>
                          {selected.jobs.map((j: Row) => (
                            <li key={j.id}>
                              {j.name} · {j.code} · {j.job_type_name}
                            </li>
                          ))}
                        </ul>
                      )}
                      {manager && (
                        <>
                          <details>
                            <summary>กำหนด PM</summary>
                            <form
                              onSubmit={(e) => {
                                const b = fields(e);
                                act(async () => {
                                  await api(
                                    "/projects/" + selected.id + "/pm",
                                    "POST",
                                    {
                                      user_id: b.user_id,
                                      active: b.action === "add",
                                    },
                                  );
                                  await open(selected.id);
                                  await load(me);
                                  setMessage("บันทึกสิทธิ์ PM แล้ว");
                                });
                              }}
                            >
                              <label>
                                PM
                                <select name="user_id" required>
                                  {users
                                    .filter((u) => u.role === "PM" && u.active)
                                    .map((u) => (
                                      <option key={u.id} value={u.id}>
                                        {u.display_name}
                                      </option>
                                    ))}
                                </select>
                              </label>
                              <label>
                                การมอบหมาย
                                <select name="action">
                                  <option value="add">เพิ่มสิทธิ์</option>
                                  <option value="remove">ถอนสิทธิ์</option>
                                </select>
                              </label>
                              <button disabled={busy}>บันทึก PM</button>
                            </form>
                          </details>
                          {me.line_enabled === true && (
                            <button
                              className="secondary"
                              onClick={() =>
                                act(async () => {
                                  const r = await api(
                                    "/projects/" + selected.id + "/line-code",
                                    "POST",
                                  );
                                  setMessage(
                                    "ใช้ในกลุ่มทดสอบภายใน 10 นาที ด้วย LINE ที่เชื่อมกับบัญชีนี้:\n" +
                                      r.command,
                                  );
                                })
                              }
                            >
                              สร้างรหัสผูกกลุ่ม LINE
                            </button>
                          )}
                        </>
                      )}
                    </section>
                  </div>
                )}
              </>
            )}
            {page === "types" && manager && (
              <div className="grid">
                {[
                  ["project", projectTypes, "ประเภทโครงการ"],
                  ["job", jobTypes, "ประเภทงานย่อย"],
                ].map(([kind, rows, title]) => (
                  <section className="card" key={String(kind)}>
                    <h2>{String(title)}</h2>
                    <p className="muted">
                      Code เปลี่ยนไม่ได้ ปิดใช้งานแทนการลบ ข้อมูลเก่ายังแสดงได้
                    </p>
                    <form
                      onSubmit={(e) => {
                        const b = fields(e);
                        act(async () => {
                          await api("/" + kind + "-types", "POST", {
                            code: String(b.code).trim().toUpperCase(),
                            display_name: b.display_name,
                            sort_order: Number(b.sort_order),
                          });
                          await load(me);
                          setMessage("เพิ่มประเภทแล้ว");
                        });
                      }}
                    >
                      <label>
                        Code
                        <input
                          name="code"
                          required
                          pattern="[A-Za-z][A-Za-z0-9_]{0,49}"
                          maxLength={50}
                        />
                      </label>
                      <label>
                        ชื่อที่แสดง
                        <input name="display_name" required maxLength={160} />
                      </label>
                      <label>
                        ลำดับ
                        <input
                          name="sort_order"
                          type="number"
                          min={-100000}
                          max={100000}
                          defaultValue={0}
                          required
                        />
                      </label>
                      <button disabled={busy}>เพิ่มประเภท</button>
                    </form>
                    {(rows as Row[]).map((t) => (
                      <form
                        className="type-row"
                        key={t.id + ":" + t.version}
                        onSubmit={(e) => {
                          const b = fields(e);
                          act(async () => {
                            await api("/" + kind + "-types/" + t.id, "PATCH", {
                              display_name: b.display_name,
                              sort_order: Number(b.sort_order),
                              enabled: b.enabled === "true",
                              version: t.version,
                            });
                            await load(me);
                            setMessage("บันทึกประเภทแล้ว");
                          });
                        }}
                      >
                        <h3>{t.code}</h3>
                        <label>
                          ชื่อที่แสดง
                          <input
                            name="display_name"
                            defaultValue={t.display_name}
                            required
                            maxLength={160}
                          />
                        </label>
                        <label>
                          ลำดับ
                          <input
                            name="sort_order"
                            type="number"
                            min={-100000}
                            max={100000}
                            defaultValue={t.sort_order}
                            required
                          />
                        </label>
                        <label>
                          การใช้งาน
                          <select
                            name="enabled"
                            defaultValue={String(t.enabled)}
                          >
                            <option value="true">เปิดใช้งาน</option>
                            <option value="false">ปิดใช้งาน</option>
                          </select>
                        </label>
                        <button disabled={busy}>บันทึกประเภท</button>
                      </form>
                    ))}
                  </section>
                ))}
              </div>
            )}
            {page === "setup" && manager && (
              <div className="grid">
                <form
                  className="card"
                  onSubmit={(e) => {
                    const b = fields(e);
                    act(async () => {
                      await api("/customers", "POST", b);
                      await load(me);
                      setMessage("เพิ่มลูกค้าแล้ว");
                    });
                  }}
                >
                  <h2>เพิ่มลูกค้า</h2>
                  <label>
                    ชื่อลูกค้า
                    <input name="name" required />
                  </label>
                  <button disabled={busy}>เพิ่มลูกค้า</button>
                  {customers.map((c) => (
                    <p key={c.id}>{c.name}</p>
                  ))}
                </form>
                <form
                  className="card"
                  onSubmit={(e) => {
                    const b = fields(e);
                    act(async () => {
                      await api("/sites", "POST", b);
                      await load(me);
                      setMessage("เพิ่มสถานที่แล้ว");
                    });
                  }}
                >
                  <h2>สถานที่เพิ่มเติม</h2>
                  <label>
                    ลูกค้า
                    <select name="customer_id" required>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    ชื่อสถานที่
                    <input name="name" required />
                  </label>
                  <button disabled={busy}>เพิ่มสถานที่</button>
                  <p>เพิ่มเฉพาะเมื่อต้องใช้ โครงการไม่จำเป็นต้องมีสถานที่</p>
                </form>
              </div>
            )}
            {page === "accounts" && me.role === "OWNER" && (
              <div className="grid">
                <form
                  className="card"
                  onSubmit={(e) => {
                    const b = fields(e);
                    act(async () => {
                      await api("/users", "POST", b);
                      await load(me);
                      setMessage("สร้างบัญชีแล้ว");
                    });
                  }}
                >
                  <h2>สร้างบัญชีผู้ใช้</h2>
                  <label>
                    ชื่อที่แสดง
                    <input name="display_name" required />
                  </label>
                  <label>
                    ชื่อผู้ใช้
                    <input name="username" autoComplete="off" required />
                  </label>
                  <label>
                    รหัสผ่าน
                    <input
                      name="password"
                      type="password"
                      minLength={12}
                      maxLength={200}
                      autoComplete="new-password"
                      required
                    />
                  </label>
                  <label>
                    สิทธิ์
                    <select name="role">
                      <option>TECH</option>
                      <option>PM</option>
                      <option>ADMIN</option>
                      <option>OWNER</option>
                    </select>
                  </label>
                  <button disabled={busy}>สร้างบัญชี</button>
                </form>
                <section className="card">
                  <h2>ผู้ใช้</h2>
                  {users.map((u) => (
                    <p key={u.id}>
                      {u.display_name} · {u.role} · {u.active ? "เปิด" : "ปิด"}{" "}
                      {u.id !== me.id && (
                        <button
                          className="secondary"
                          onClick={() =>
                            act(async () => {
                              await api("/users/" + u.id, "PATCH", {
                                active: !u.active,
                              });
                              await load(me);
                            })
                          }
                        >
                          {u.active ? "ปิดบัญชี" : "เปิดบัญชี"}
                        </button>
                      )}
                    </p>
                  ))}
                </section>
              </div>
            )}
          </>
        )}
      </main>
      <footer>Milestone 1 · ระบบทดสอบ Foundation · ใช้ข้อมูลทดสอบ</footer>
    </>
  );
}
