import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

function reject() {
  console.error("Synthetic recovery service configuration rejected");
  process.exit(1);
}

const env = process.env;
if (
  env.RECOVERY_SYNTHETIC_ONLY !== "true" ||
  env.NODE_ENV !== "production" ||
  env.LINE_ENABLED !== "false" ||
  env.LINE_ENROLLMENT_ENABLED !== "false" ||
  !/^https:\/\//.test(env.WEB_ORIGIN || "")
) reject();

let database;
try {
  database = new URL(env.DATABASE_URL);
} catch {
  reject();
}
let dbName;
let dbUser;
try {
  dbName = decodeURIComponent(database.pathname.slice(1));
  dbUser = decodeURIComponent(database.username);
} catch {
  reject();
}
const synthetic = /^m1_synthetic_(source|target)_([0-9]{8})$/.exec(dbName);
if (
  !["postgres:", "postgresql:"].includes(database.protocol) ||
  !database.hostname.endsWith(".railway.internal") ||
  !synthetic ||
  dbUser !== `m1_synthetic_runtime_${synthetic[2]}`
) reject();

const webPort = Number(env.PORT || 3000);
if (!Number.isInteger(webPort) || webPort < 1024 || webPort > 65535 || webPort === 3001)
  reject();

let api;
let web;
let stopping = false;
function stop(exitCode = 0) {
  if (exitCode) process.exitCode = exitCode;
  if (stopping) return;
  stopping = true;
  web?.kill("SIGTERM");
  api?.kill("SIGTERM");
  setTimeout(() => process.exit(process.exitCode || 0), 8000).unref();
}
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => stop(0));

api = spawn(process.execPath, ["--import", "tsx", "apps/api/src/main.ts"], {
  env: { ...env, HOST: "127.0.0.1", PORT: "3001" },
  stdio: "inherit",
});
api.on("exit", () => stop(stopping ? 0 : 1));

let ready = false;
for (let attempt = 0; attempt < 60 && !stopping; attempt++) {
  try {
    const response = await fetch("http://127.0.0.1:3001/api/health", {
      signal: AbortSignal.timeout(1000),
    });
    if (response.ok) {
      ready = true;
      break;
    }
  } catch {}
  await delay(1000);
}
if (!ready) {
  stop(1);
} else {
  web = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "apps/web", "--hostname", "::", "--port", String(webPort)],
    {
      env: { ...env, API_URL: "http://127.0.0.1:3001", PORT: String(webPort) },
      stdio: "inherit",
    },
  );
  web.on("exit", () => stop(stopping ? 0 : 1));
}
