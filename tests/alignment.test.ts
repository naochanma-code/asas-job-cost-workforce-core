import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { readFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Pool } from "pg";
import {
  openDatabase,
  migrate,
  verifySchema,
  type Database,
} from "../packages/database/index";
import { backup, restore } from "../packages/database/backup";
import { passwordHash } from "../packages/domain/identity";
import {
  checkJobTransition,
  date,
  checkDates,
  reserveProjectCode,
  reserveJobCode,
} from "../packages/domain/foundation";
import { buildApp } from "../apps/api/src/app";
import { jobInput, projectInput } from "../apps/web/app/foundation-fields";

async function isolated() {
  if (!process.env.TEST_DATABASE_URL)
    return openDatabase(undefined, "memory://");
  const admin = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
  const schema = "alignment_" + randomUUID().replaceAll("-", "");
  await admin.query(`CREATE SCHEMA "${schema}"`);
  const url = new URL(process.env.TEST_DATABASE_URL);
  url.searchParams.set("options", "-c search_path=" + schema);
  const db = await openDatabase(url.toString()),
    close = db.close;
  return {
    ...db,
    close: async () => {
      await close();
      await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
      await admin.end();
    },
  };
}
test("Alignment unit: real calendar dates, date order and Job lifecycle", () => {
  assert.equal(date.safeParse("2026-02-29").success, false);
  assert.equal(date.safeParse("2028-02-29").success, true);
  assert.throws(() => checkDates("2026-09-24", "2026-09-23"));
  checkDates(null, "2026-09-23");
  for (const [a, b] of [
    ["PLANNED", "ACTIVE"],
    ["ACTIVE", "BLOCKED"],
    ["BLOCKED", "ACTIVE"],
    ["ACTIVE", "DONE"],
    ["BLOCKED", "DONE"],
    ["PLANNED", "CANCELLED"],
    ["ACTIVE", "CANCELLED"],
    ["BLOCKED", "CANCELLED"],
  ])
    checkJobTransition(a, b);
  for (const [a, b] of [
    ["PLANNED", "DONE"],
    ["DONE", "ACTIVE"],
    ["CANCELLED", "ACTIVE"],
  ])
    assert.throws(() => checkJobTransition(a, b));
});
test("Alignment API: configurable types, richer data, PM authorization and atomic codes", async (t) => {
  const db = await isolated();
  await migrate(db);
  const sql = await readFile(
    new URL(
      "../packages/database/migrations/003_m1_alignment.sql",
      import.meta.url,
    ),
    "utf8",
  );
  const seeds = sql.match(
    /INSERT INTO (?:project_types|job_types)\(id,code,display_name,sort_order\)[\s\S]*?ON CONFLICT\(code\) DO NOTHING;/g,
  )!;
  assert.equal(seeds.length, 2);
  for (const seed of seeds) {
    await db.exec(seed);
    await db.exec(seed);
  }
  const password = randomBytes(32).toString("base64url"),
    owner = randomUUID(),
    suffix = randomUUID();
  await db.query(
    "INSERT INTO users(id,username,display_name,password_hash,role) VALUES($1,$2,'Owner fixture',$3,'OWNER')",
    [owner, "alignment-" + suffix, await passwordHash(password)],
  );
  const app = await buildApp(db);
  await app.ready();
  let n = 0;
  const cookies: Record<string, string> = {},
    users: Record<string, any> = {};
  const request = async (
    role: string,
    method: any,
    url: string,
    payload?: any,
  ) =>
    app.inject({
      method,
      url,
      payload,
      headers: {
        origin: "http://127.0.0.1:3000",
        ...(cookies[role] ? { cookie: cookies[role] } : {}),
      },
      remoteAddress: "127.9." + Math.floor(++n / 250) + "." + (n % 250),
    });
  const ok = async (role: string, method: any, url: string, payload?: any) => {
    const r = await request(role, method, url, payload);
    assert.equal(r.statusCode, 200, r.body);
    return r.json();
  };
  const login = async (role: string, username: string) => {
    const r = await request("", "POST", "/api/login", { username, password });
    assert.equal(r.statusCode, 200);
    cookies[role] = String(r.headers["set-cookie"]).split(";")[0];
  };
  let customer: string,
    a: string,
    b: string,
    j1: string,
    j2: string,
    projectType: string,
    jobType: string;
  try {
    await login("OWNER", "alignment-" + suffix);
    for (const role of ["ADMIN", "PM", "PM2", "TECH", "TECH2", "OWNER2"]) {
      const username = "alignment-" + role.toLowerCase() + "-" + suffix;
      users[role] = await ok("OWNER", "POST", "/api/users", {
        username,
        password,
        display_name: "Fixture " + role,
        role: role.replace("2", ""),
      });
      await login(role, username);
    }
    for (const u of await ok("ADMIN", "GET", "/api/users"))
      for (const key of Object.keys(users))
        if (users[key].id === u.id) users[key] = u;
    await t.test(
      "seed idempotency and configurable type CRUD without code mutation",
      async () => {
        assert.equal(
          (await ok("ADMIN", "GET", "/api/project-types")).length,
          5,
        );
        assert.equal((await ok("TECH", "GET", "/api/job-types")).length, 10);
        await migrate(db);
        assert.equal(
          (await ok("ADMIN", "GET", "/api/project-types")).length,
          5,
        );
        projectType = (
          await ok("ADMIN", "POST", "/api/project-types", {
            code: "PILOT_CUSTOM",
            display_name: "Custom project",
            sort_order: -1,
          })
        ).id;
        jobType = (
          await ok("OWNER", "POST", "/api/job-types", {
            code: "PILOT_CUSTOM",
            display_name: "Custom job",
            sort_order: -1,
          })
        ).id;
        for (const [kind, id] of [
          ["project", projectType],
          ["job", jobType],
        ]) {
          await ok("ADMIN", "PATCH", `/api/${kind}-types/${id}`, {
            display_name: "Renamed " + kind,
            sort_order: -10,
            version: 1,
          });
          assert.equal(
            (await ok("ADMIN", "GET", `/api/${kind}-types`))[0].id,
            id,
          );
          assert.equal(
            (
              await request("ADMIN", "PATCH", `/api/${kind}-types/${id}`, {
                code: "CHANGED",
                version: 2,
              })
            ).statusCode,
            400,
          );
          assert.equal(
            (
              await request("PM", "PATCH", `/api/${kind}-types/${id}`, {
                enabled: false,
                version: 2,
              })
            ).statusCode,
            403,
          );
          assert.equal(
            (
              await request("TECH", "POST", `/api/${kind}-types`, {
                code: "NO",
                display_name: "No",
              })
            ).statusCode,
            403,
          );
          await assert.rejects(
            db.query(`UPDATE ${kind}_types SET code='CHANGED' WHERE id=$1`, [
              id,
            ]),
          );
        }
      },
    );
    await t.test(
      "A without Site/Job and B with Site/multiple Jobs/operational fields",
      async () => {
        customer = (
          await ok("ADMIN", "POST", "/api/customers", {
            name: "Synthetic alignment",
          })
        ).id;
        a = (
          await ok("ADMIN", "POST", "/api/projects", {
            name: "A",
            customer_id: customer,
            project_type_id: projectType,
            project_manager_id: users.PM.id,
            start_date: "2026-09-23",
            target_completion_date: "2026-10-23",
            priority: "HIGH",
            description: "Synthetic operational note",
            progress: 20,
          })
        ).id;
        const p = await ok("ADMIN", "GET", "/api/projects/" + a);
        assert.equal(p.site_id, null);
        assert.deepEqual(p.jobs, []);
        assert.equal(p.project_manager_id, users.PM.id);
        assert.equal(p.priority, "HIGH");
        assert.equal(p.progress, 20);
        assert.equal(p.created_by, users.ADMIN.id);
        assert.ok(p.created_at);
        assert.match(p.code, /^PRJ-\d{4}-\d{3,}$/);
        const site = (
          await ok("ADMIN", "POST", "/api/sites", {
            customer_id: customer,
            name: "Synthetic site",
          })
        ).id;
        b = (
          await ok("OWNER", "POST", "/api/projects", {
            name: "B",
            customer_id: customer,
            site_id: site,
            project_manager_id: users.PM2.id,
          })
        ).id;
        j1 = (
          await ok("PM", "POST", `/api/projects/${a}/jobs`, {
            name: "A task",
            job_type_id: jobType,
          })
        ).id;
        j2 = (
          await ok("ADMIN", "POST", `/api/projects/${b}/jobs`, {
            name: "B task one",
            job_type_id: jobType,
          })
        ).id;
        await ok("ADMIN", "POST", `/api/projects/${b}/jobs`, {
          name: "B task two",
        });
        assert.equal(
          (await ok("OWNER", "GET", "/api/projects/" + b)).jobs.length,
          2,
        );
        assert.equal(
          (
            await request("ADMIN", "POST", "/api/projects", {
              name: "bad date",
              customer_id: customer,
              start_date: "2026-02-30",
            })
          ).statusCode,
          400,
        );
        assert.equal(
          (
            await request("ADMIN", "PATCH", "/api/projects/" + a, {
              version: p.version,
              progress: 101,
            })
          ).statusCode,
          400,
        );
        assert.equal(
          (
            await request("PM", "PATCH", `/api/projects/${a}/jobs/${j2}`, {
              name: "wrong scope",
              version: 1,
            })
          ).statusCode,
          404,
        );
      },
    );
    await t.test(
      "disabled types retain history and snapshots; reject new references",
      async () => {
        for (const [kind, id] of [
          ["project", projectType],
          ["job", jobType],
        ]) {
          await ok("ADMIN", "PATCH", `/api/${kind}-types/${id}`, {
            enabled: false,
            display_name: "Disabled " + kind,
            version: 2,
          });
          await migrate(db);
          assert.equal(
            (await ok("ADMIN", "GET", `/api/${kind}-types`)).find(
              (r: any) => r.id === id,
            ).enabled,
            false,
          );
        }
        const p = await ok("ADMIN", "GET", "/api/projects/" + a);
        assert.equal(p.project_type_enabled, false);
        assert.equal(p.type_name_snapshot, "Renamed project");
        assert.equal(p.project_type_name, "Disabled project");
        await ok("PM", "PATCH", "/api/projects/" + a, {
          name: "A revised",
          version: p.version,
          progress: 25,
        });
        assert.equal(
          (
            await request("ADMIN", "POST", "/api/projects", {
              name: "No",
              customer_id: customer,
              project_type_id: projectType,
            })
          ).statusCode,
          409,
        );
        assert.equal(
          (
            await request("ADMIN", "POST", `/api/projects/${a}/jobs`, {
              name: "No",
              job_type_id: jobType,
            })
          ).statusCode,
          409,
        );
        const j = p.jobs[0];
        assert.equal(j.type_name_snapshot, "Renamed job");
        assert.equal(j.job_type_enabled, false);
        await ok("PM", "PATCH", `/api/projects/${a}/jobs/${j1}`, {
          name: "A task revised",
          status: "ACTIVE",
          version: j.version,
        });
      },
    );
    await t.test(
      "PM can assign/revoke TECH only in own project; audit exactly once",
      async () => {
        const candidates = await ok(
          "PM",
          "GET",
          `/api/projects/${a}/assignable-technicians`,
        );
        assert.deepEqual(
          new Set(candidates.map((c: any) => c.employee_id)),
          new Set([users.TECH.employee_id, users.TECH2.employee_id]),
        );
        const assigned = (
          await ok("PM", "POST", `/api/projects/${a}/assignments`, {
            employee_id: users.TECH.employee_id,
          })
        ).id;
        assert.equal((await ok("TECH", "GET", "/api/projects")).length, 1);
        assert.equal(
          (await ok("TECH", "GET", "/api/projects/" + a)).jobs.length,
          1,
        );
        const current = (await ok("PM", "GET", "/api/projects/" + a)).jobs[0];
        await ok("PM", "PATCH", `/api/projects/${a}/jobs/${j1}`, {
          responsible_person_id: users.TECH.employee_id,
          planned_date: "2026-10-01",
          progress: 50,
          version: current.version,
        });
        assert.equal(
          (
            await request("PM", "POST", `/api/projects/${a}/assignments`, {
              employee_id: users.TECH.employee_id,
            })
          ).statusCode,
          409,
        );
        assert.equal(
          (
            await request("PM", "POST", `/api/projects/${a}/assignments`, {
              employee_id: users.TECH2.employee_id,
              job_id: j2,
            })
          ).statusCode,
          409,
        );
        assert.equal(
          (
            await request("PM", "POST", `/api/projects/${b}/assignments`, {
              employee_id: users.TECH.employee_id,
            })
          ).statusCode,
          404,
        );
        assert.equal(
          (
            await request(
              "PM",
              "GET",
              `/api/projects/${b}/assignable-technicians`,
            )
          ).statusCode,
          404,
        );
        for (const role of ["OWNER2", "ADMIN", "PM", "PM2"]) {
          assert.equal(
            (
              await request("PM", "POST", `/api/projects/${a}/assignments`, {
                employee_id: users[role].employee_id,
              })
            ).statusCode,
            403,
          );
          const privileged = (
            await ok("ADMIN", "POST", `/api/projects/${a}/assignments`, {
              employee_id: users[role].employee_id,
            })
          ).id;
          assert.equal(
            (await request("PM", "DELETE", "/api/assignments/" + privileged))
              .statusCode,
            403,
          );
          await ok("OWNER", "DELETE", "/api/assignments/" + privileged);
        }
        const other = (
          await ok("ADMIN", "POST", `/api/projects/${b}/assignments`, {
            employee_id: users.TECH2.employee_id,
          })
        ).id;
        assert.equal(
          (await request("PM", "DELETE", "/api/assignments/" + other))
            .statusCode,
          404,
        );
        await ok("PM", "DELETE", "/api/assignments/" + assigned);
        assert.equal(
          (await request("PM", "DELETE", "/api/assignments/" + assigned))
            .statusCode,
          404,
        );
        assert.deepEqual(await ok("TECH", "GET", "/api/projects"), []);
        assert.equal(
          (await request("TECH", "GET", "/api/projects/" + a)).statusCode,
          404,
        );
        const log = (
          await db.query(
            "SELECT action,actor_id,details FROM audit_logs WHERE entity_id=$1 ORDER BY occurred_at",
            [assigned],
          )
        ).rows;
        assert.deepEqual(
          log.map((r) => r.action),
          ["ASSIGNED", "ASSIGNMENT_REVOKED"],
        );
        assert.ok(log.every((r) => r.actor_id === users.PM.id));
        assert.equal(log[1].details.before.employee_id, users.TECH.employee_id);
        assert.ok(log[1].details.after.revoked_at);
        await ok("ADMIN", "DELETE", "/api/assignments/" + other);
        await ok("PM2", "POST", `/api/projects/${b}/assignments`, {
          employee_id: users.TECH2.employee_id,
          job_id: j2,
        });
        assert.deepEqual(
          (await ok("TECH2", "GET", "/api/projects/" + b)).jobs.map(
            (j: any) => j.id,
          ),
          [j2],
        );
      },
    );
    await t.test(
      "seeded types accept real form payloads and retain immutable IDs",
      async () => {
        const jobs = (await ok("OWNER", "GET", "/api/job-types")).filter(
          (r: any) =>
            [
              "INSTALLATION",
              "SERVICE_SUPPORT",
              "PM_VISIT",
              "SITE_SURVEY",
              "POC",
              "CONFIGURATION",
              "TESTING",
              "TRAINING",
              "OFFICE_WORK",
              "OTHER",
            ].includes(r.code),
        );
        const projects = (
          await ok("OWNER", "GET", "/api/project-types")
        ).filter((r: any) =>
          ["INSTALLATION", "SERVICE", "SURVEY", "POC", "OTHER"].includes(
            r.code,
          ),
        );
        const p = (
          await ok("OWNER", "POST", "/api/projects", {
            name: "Seed form fixture",
            customer_id: customer,
            project_manager_id: users.PM.id,
          })
        ).id;
        await ok("OWNER", "POST", `/api/projects/${p}/assignments`, {
          employee_id: users.TECH.employee_id,
        });
        for (const [i, type] of jobs.entries()) {
          const actor = i % 2 ? "PM" : "OWNER";
          const payload = jobInput({
            name: "Job1 " + type.code,
            job_type_id: type.id,
            description: "test",
            responsible_person_id: users.TECH.employee_id,
            planned_date: "",
            status: "PLANNED",
            progress: "0",
          });
          const made = await ok(
            actor,
            "POST",
            `/api/projects/${p}/jobs`,
            payload,
          );
          const job = (await ok(actor, "GET", `/api/projects/${p}`)).jobs.find(
            (j: any) => j.id === made.id,
          );
          assert.equal(job.job_type_id, type.id);
          assert.equal(job.planned_date, null);
          await ok(actor, "PATCH", `/api/projects/${p}/jobs/${made.id}`, {
            ...payload,
            status: "ACTIVE",
            version: job.version,
          });
        }
        for (const type of projects) {
          const payload = projectInput({
            name: "Seed project " + type.code,
            customer_id: customer,
            project_type_id: type.id,
            start_date: "",
            target_completion_date: "",
            progress: "0",
          });
          const created = await ok("ADMIN", "POST", "/api/projects", payload);
          const detail = await ok(
            "ADMIN",
            "GET",
            "/api/projects/" + created.id,
          );
          assert.equal(detail.project_type_id, type.id);
          await ok("ADMIN", "PATCH", "/api/projects/" + created.id, {
            project_type_id: type.id,
            version: detail.version,
            description: "Seed edit",
          });
        }
        for (const [kind, types] of [
          ["project", projects],
          ["job", jobs],
        ] as const) {
          for (const type of types) {
            await ok("ADMIN", "PATCH", `/api/${kind}-types/${type.id}`, {
              version: type.version,
              enabled: false,
              display_name: type.display_name + " fixture",
              sort_order: type.sort_order,
            });
            const disabled = (
              await ok("OWNER", "GET", `/api/${kind}-types`)
            ).find((r: any) => r.id === type.id);
            assert.equal(disabled.code, type.code);
            assert.equal(disabled.enabled, false);
            const r =
              kind === "job"
                ? await request("OWNER", "POST", `/api/projects/${p}/jobs`, {
                    name: "Disabled",
                    job_type_id: type.id,
                  })
                : await request("OWNER", "POST", "/api/projects", {
                    name: "Disabled",
                    customer_id: customer,
                    project_type_id: type.id,
                  });
            assert.equal(r.statusCode, 409);
            await ok("OWNER", "PATCH", `/api/${kind}-types/${type.id}`, {
              version: disabled.version,
              enabled: true,
              display_name: type.display_name,
            });
          }
          assert.equal(
            (
              await request("OWNER", "PATCH", `/api/${kind}-types/not-an-id`, {
                version: 1,
                enabled: false,
              })
            ).statusCode,
            400,
          );
        }
        assert.equal(
          (
            await request("OWNER", "POST", `/api/projects/${p}/jobs`, {
              name: "Invalid",
              job_type_id: "not-an-id",
            })
          ).statusCode,
          400,
        );
        assert.equal(
          (
            await request("OWNER", "POST", `/api/projects/${p}/jobs`, {
              name: "Unknown",
              job_type_id: randomUUID(),
            })
          ).statusCode,
          409,
        );
      },
    );
    await t.test(
      "Owner creates a Job in a Project without Site and reads it after reopening",
      async () => {
        const project = (
          await ok("OWNER", "POST", "/api/projects", {
            name: "Owner no-site Job visibility",
            customer_id: customer,
          })
        ).id;
        const before = await ok("OWNER", "GET", "/api/projects/" + project);
        assert.equal(before.site_id, null);
        assert.deepEqual(before.jobs, []);
        const created = await ok(
          "OWNER",
          "POST",
          `/api/projects/${project}/jobs`,
          {
            name: "Owner created Job",
          },
        );
        for (let i = 0; i < 2; i++) {
          const reopened = await ok("OWNER", "GET", "/api/projects/" + project);
          assert.equal(reopened.jobs.length, 1);
          assert.equal(reopened.jobs[0].id, created.id);
          assert.equal(reopened.jobs[0].code, created.code);
          assert.equal(reopened.jobs[0].name, "Owner created Job");
        }
      },
    );
    await t.test(
      "PM cannot create user/change roles/appoint PM or exploit ordinary assignment",
      async () => {
        assert.equal(
          (
            await request("PM", "POST", "/api/users", {
              username: "no",
              password,
              display_name: "No",
              role: "OWNER",
            })
          ).statusCode,
          403,
        );
        assert.equal(
          (
            await request("PM", "PATCH", "/api/users/" + users.TECH.id, {
              role: "OWNER",
            })
          ).statusCode,
          403,
        );
        assert.equal(
          (
            await request("PM", "POST", `/api/projects/${a}/pm`, {
              user_id: users.PM2.id,
              active: true,
            })
          ).statusCode,
          403,
        );
        assert.equal(
          (
            await request("PM", "PATCH", "/api/projects/" + a, {
              project_manager_id: users.PM2.id,
              version: 3,
            })
          ).statusCode,
          403,
        );
        await ok("ADMIN", "POST", `/api/projects/${b}/assignments`, {
          employee_id: users.PM.employee_id,
        });
        assert.equal(
          (
            await request("PM", "POST", `/api/projects/${b}/assignments`, {
              employee_id: users.TECH.employee_id,
            })
          ).statusCode,
          404,
        );
        assert.equal(
          (await request("PM", "GET", "/api/projects/" + b)).statusCode,
          404,
        );
        assert.equal(
          (await request("PM", "GET", "/api/users")).statusCode,
          403,
        );
        const operational = JSON.stringify(
          await ok("ADMIN", "GET", "/api/projects"),
        );
        assert.doesNotMatch(
          operational,
          /password|payroll|selling_price|actual_cost|salary/i,
        );
      },
    );
    await t.test(
      "concurrent project and job code generation; no reuse after revoke/close",
      async () => {
        const projects = await Promise.all(
          Array.from({ length: 24 }, (_, i) =>
            ok("ADMIN", "POST", "/api/projects", {
              name: "Concurrent " + i,
              customer_id: customer,
            }),
          ),
        );
        assert.equal(new Set(projects.map((p) => p.code)).size, 24);
        assert.ok(projects.every((p) => /^PRJ-\d{4}-\d{3,}$/.test(p.code)));
        const project = projects[0],
          jobs = await Promise.all(
            Array.from({ length: 24 }, (_, i) =>
              ok("ADMIN", "POST", `/api/projects/${project.id}/jobs`, {
                name: "Concurrent job " + i,
              }),
            ),
          );
        assert.equal(new Set(jobs.map((j) => j.code)).size, 24);
        assert.ok(
          jobs.every((j) =>
            j.code.startsWith("JOB-" + project.code.slice(4) + "-"),
          ),
        );
        const p = await ok("ADMIN", "GET", "/api/projects/" + project.id);
        await ok("ADMIN", "PATCH", "/api/projects/" + project.id, {
          status: "CLOSED",
          version: p.version,
        });
        const next = await ok("ADMIN", "POST", "/api/projects", {
          name: "After close",
          customer_id: customer,
        });
        assert.ok(!projects.some((p) => p.code === next.code));
        assert.equal(
          (
            await db.query(
              "SELECT code FROM code_reservations WHERE entity_id=$1",
              [project.id],
            )
          ).rows[0].code,
          project.code,
        );
      },
    );
  } finally {
    await app.close();
    await db.close();
  }
});

test("Migration dry run: legacy data, safe backfill, rerun, restore and counter continuity", async () => {
  const db = await isolated(),
    target = await isolated();
  try {
    await db.query(
      "CREATE TABLE schema_migrations(name text PRIMARY KEY,checksum text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())",
    );
    for (const file of ["001_foundation.sql", "002_line_outbox.sql"]) {
      const sql = await readFile(
        new URL("../packages/database/migrations/" + file, import.meta.url),
        "utf8",
      );
      await db.exec(sql);
      await db.query(
        "INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)",
        [file, createHash("sha256").update(sql).digest("hex")],
      );
    }
    const user = randomUUID(),
      customer = randomUUID(),
      a = randomUUID(),
      b = randomUUID(),
      job = randomUUID();
    await db.query(
      "INSERT INTO users(id,username,display_name,password_hash,role) VALUES($1,'legacy-fixture','Legacy PM','non-login-fixture','PM')",
      [user],
    );
    await db.query(
      "INSERT INTO customers(id,code,name,created_by) VALUES($1,'LEGACY-C','Synthetic legacy',$2)",
      [customer, user],
    );
    await db.query(
      "INSERT INTO projects(id,code,name,customer_id,created_by,status,created_at) VALUES($1,'PRJ-old-unchanged','Legacy A',$3,$4,'ACTIVE','2026-09-01'),($2,'PRJ-2609-009','Legacy B',$3,$4,'CLOSED','2026-09-02')",
      [a, b, customer, user],
    );
    await db.query(
      "INSERT INTO project_members(project_id,user_id) VALUES($1,$2)",
      [a, user],
    );
    await db.query(
      "INSERT INTO jobs(id,project_id,code,name) VALUES($1,$2,'JOB-old-unchanged','Legacy job')",
      [job, a],
    );
    const before = (
      await db.query(
        "SELECT id,code,name,customer_id,site_id,status,created_by,created_at FROM projects ORDER BY id",
      )
    ).rows;
    await migrate(db);
    await verifySchema(db);
    await migrate(db);
    assert.deepEqual(
      (
        await db.query(
          "SELECT id,code,name,customer_id,site_id,status,created_by,created_at FROM projects ORDER BY id",
        )
      ).rows,
      before,
    );
    const p = (await db.query("SELECT * FROM projects WHERE id=$1", [a]))
      .rows[0];
    assert.equal(p.project_manager_id, user);
    assert.equal(p.code_namespace, "2609-010");
    assert.equal(p.site_id, null);
    const j = (await db.query("SELECT * FROM jobs WHERE id=$1", [job])).rows[0];
    assert.equal(j.created_by, user);
    assert.equal(j.status, "PLANNED");
    assert.equal(j.progress, 0);
    assert.equal(j.code, "JOB-old-unchanged");
    assert.equal(
      (await db.query("SELECT count(*)::int n FROM project_types")).rows[0].n,
      5,
    );
    assert.equal(
      (await db.query("SELECT count(*)::int n FROM job_types")).rows[0].n,
      10,
    );
    await db.query(
      "UPDATE project_types SET display_name='Customized Other',enabled=false,version=2 WHERE code='OTHER'",
    );
    await migrate(db);
    assert.equal(
      (await db.query("SELECT enabled FROM project_types WHERE code='OTHER'"))
        .rows[0].enabled,
      false,
    );
    const file = join(
      await mkdtemp(join(tmpdir(), "m1-alignment-")),
      "synthetic.json",
    );
    await backup(db, file);
    await migrate(target);
    await restore(target, file);
    for (const table of [
      "projects",
      "jobs",
      "project_members",
      "project_types",
      "job_types",
      "code_counters",
      "code_reservations",
    ]) {
      const order =
        table === "code_counters"
          ? "scope"
          : table === "code_reservations"
            ? "code"
            : table === "project_members"
              ? "project_id,user_id"
              : "id";
      assert.deepEqual(
        (await target.query(`SELECT * FROM ${table} ORDER BY ${order}`)).rows,
        (await db.query(`SELECT * FROM ${table} ORDER BY ${order}`)).rows,
      );
    }
    await assert.rejects(restore(target, file), /empty/);
    // A restored registry must continue issuing codes, not just retain rows.
    await target.transaction(async (tx) => {
      const next = await reserveProjectCode(tx, randomUUID());
      assert.equal(
        (
          await db.query("SELECT 1 FROM code_reservations WHERE code=$1", [
            next.code,
          ])
        ).rows.length,
        0,
      );
      const first = await reserveJobCode(tx, p, randomUUID());
      const second = await reserveJobCode(tx, p, randomUUID());
      assert.equal(first, "JOB-2609-010-01");
      assert.equal(second, "JOB-2609-010-02");
    });
  } finally {
    await db.close();
    await target.close();
  }
});
