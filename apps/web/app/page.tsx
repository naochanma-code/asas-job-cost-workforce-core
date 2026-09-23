"use client";
import { useEffect, useState, FormEvent } from "react";
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
    [users, setUsers] = useState<Row[]>([]),
    [selected, setSelected] = useState<Row | null>(null),
    [assignments, setAssignments] = useState<Row[]>([]),
    [page, setPage] = useState("projects"),
    [customer, setCustomer] = useState(""),
    [linkToken, setLinkToken] = useState("");
  const manager = me && ["OWNER", "ADMIN"].includes(me.role);
  async function load(user: Row) {
    setProjects(await api("/projects"));
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
  async function act(fn: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const fields = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    return Object.fromEntries(new FormData(e.currentTarget));
  };
  async function open(id: string) {
    setSelected(await api("/projects/" + id));
    if (manager) setAssignments(await api("/projects/" + id + "/assignments"));
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
            {linkToken && (
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
                <button onClick={() => setPage("setup")}>ลูกค้าและทีม</button>
              )}
              {me.role === "OWNER" && (
                <button onClick={() => setPage("accounts")}>บัญชีผู้ใช้</button>
              )}
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
                          {p.status === "ACTIVE" ? "กำลังดำเนินการ" : "ปิดแล้ว"}
                        </span>
                        <h3>{p.name}</h3>
                        <p>ลูกค้า: {p.customer_name}</p>
                        {p.site_name && <p>สถานที่: {p.site_name}</p>}
                        <small>{p.code}</small>
                      </div>
                      <button onClick={() => act(() => open(p.id))}>
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
                          name: b.name,
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
                  <p>ลูกค้า: {selected.customer_name}</p>
                  {selected.site_name && <p>สถานที่: {selected.site_name}</p>}
                  {selected.jobs.length > 0 && (
                    <section aria-label="งานย่อยในโครงการ">
                      <h3>งานย่อย (Job)</h3>
                      <ul>
                        {selected.jobs.map((j: Row) => (
                          <li key={j.id}>{j.name}</li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {me.role !== "TECH" && (
                    <details>
                      <summary>แก้ชื่อหรือสถานะ</summary>
                      <form
                        key={selected.version}
                        onSubmit={(e) => {
                          const b = fields(e);
                          act(async () => {
                            await api("/projects/" + selected.id, "PATCH", {
                              ...b,
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
                            <option value="ACTIVE">กำลังดำเนินการ</option>
                            <option value="CLOSED">ปิดแล้ว</option>
                          </select>
                        </label>
                        <button disabled={busy}>บันทึก</button>
                      </form>
                    </details>
                  )}
                </section>
                {manager && (
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
                            {users
                              .filter((u) => u.employee_id && u.active)
                              .map((u) => (
                                <option key={u.id} value={u.employee_id}>
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
                        <button disabled={busy || selected.status !== "ACTIVE"}>
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
                          act(async () => {
                            await api(
                              "/projects/" + selected.id + "/jobs",
                              "POST",
                              b,
                            );
                            await open(selected.id);
                          });
                        }}
                      >
                        <label>
                          ชื่องานย่อย
                          <input name="name" required />
                        </label>
                        <button disabled={busy || selected.status !== "ACTIVE"}>
                          เพิ่มงานย่อย
                        </button>
                      </form>
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
                    </section>
                  </div>
                )}
              </>
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
