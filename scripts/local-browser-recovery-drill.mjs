import { randomUUID, randomBytes } from "node:crypto";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { openDatabase, migrate } from "../packages/database/index.ts";
import { backup, restore } from "../packages/database/backup.ts";
import { passwordHash } from "../packages/domain/identity.ts";
import { buildApp } from "../apps/api/src/app.ts";
if (
  process.env.DATABASE_URL ||
  process.env.TEST_DATABASE_URL ||
  process.env.NODE_ENV === "production"
)
  throw Error("Isolated local only");
process.env.LINE_ENABLED = "false";
process.env.LINE_ENROLLMENT_ENABLED = "false";
const folder = await mkdtemp(join(tmpdir(), "asas-browser-recovery-"));
const source = await openDatabase(undefined, join(folder, "source"));
let target = await openDatabase(undefined, join(folder, "target"));
await migrate(source);
await migrate(target);
const u = randomUUID(),
  e = randomUUID(),
  c = randomUUID(),
  p = randomUUID(),
  q = randomUUID(),
  j = randomUUID(),
  k = randomUUID();
const password = randomBytes(32).toString("base64url");
await source.query(
  "INSERT INTO users(id,username,display_name,password_hash,role) VALUES($1,'recovery-tech','Synthetic TECH',$2,'TECH')",
  [u, await passwordHash(password)],
);
await source.query(
  "INSERT INTO employees(id,user_id,code,display_name) VALUES($1,$2,'SYNTH-TECH','Synthetic TECH')",
  [e, u],
);
await source.query(
  "INSERT INTO customers(id,code,name,created_by) VALUES($1,'SYNTH-C','Synthetic Customer',$2)",
  [c, u],
);
await source.query(
  "INSERT INTO projects(id,code,name,customer_id,created_by) VALUES($1,'SYNTH-B','RECOVERY B',$3,$4),($2,'SYNTH-HIDDEN','RECOVERY HIDDEN',$3,$4)",
  [p, q, c, u],
);
await source.query(
  "INSERT INTO jobs(id,project_id,code,name,created_by) VALUES($1,$3,'SYNTH-J1','ASSIGNED JOB',$4),($2,$3,'SYNTH-J2','HIDDEN SIBLING',$4)",
  [j, k, p, u],
);
await source.query(
  "INSERT INTO job_assignments(id,project_id,job_id,employee_id,created_by) VALUES($1,$2,$3,$4,$5)",
  [randomUUID(), p, j, e, u],
);
let restored = false;
let app = await buildApp(source, "http://127.0.0.1:3400");
await app.listen({ host: "127.0.0.1", port: 3401 });
const helper = createServer(async (req, res) => {
  if (req.headers.host !== "127.0.0.1:3402") {
    res.writeHead(403).end();
    return;
  }
  if (
    req.method === "POST" &&
    req.url === "/restore" &&
    req.headers.origin === "http://127.0.0.1:3402" &&
    !restored
  ) {
    try {
      await app.close();
      await backup(source, join(folder, "synthetic.json"));
      await source.close();
      await restore(target, join(folder, "synthetic.json"));
      await target.close();
      target = await openDatabase(undefined, join(folder, "target"));
      app = await buildApp(target, "http://127.0.0.1:3400");
      await app.listen({ host: "127.0.0.1", port: 3401 });
      restored = true;
      res
        .writeHead(200, { "Content-Type": "text/html" })
        .end("<h1>SYNTHETIC RESTORE COMPLETE</h1>");
    } catch {
      res.writeHead(500).end("Synthetic restore failed");
    }
    return;
  }
  if (req.url !== "/") {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
  });
  res.end(
    '<title>Synthetic recovery fixture</title><h1>Local synthetic test only</h1><details><summary>Test account</summary><span id="fixture-user">recovery-tech</span><span id="fixture-password">' +
      password +
      '</span></details><form method="post" action="/restore"><button>Restore synthetic backup</button></form>',
  );
}).listen(3402, "127.0.0.1");
console.log(
  "SYNTHETIC_RESTORE_READY; loopback API3401 WEB3400 helper3402; no real data",
);
async function stop() {
  helper.close();
  await app.close();
  await target.close();
  if (!restored) await source.close();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setTimeout(stop, 20 * 60 * 1000).unref();
