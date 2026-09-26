import {
  openDatabase,
  verifySchema,
  type Database,
} from "../packages/database/index";
import {
  verifyRuntimePrivileges,
  verifyDatabaseTls,
} from "../packages/database/runtime-security";

let db: Database | undefined;
try {
  if (process.env.NODE_ENV !== "production" || !process.env.DATABASE_URL)
    throw Error("Production-mode runtime connection required");
  db = await openDatabase(process.env.DATABASE_URL);
  await verifySchema(db);
  await verifyRuntimePrivileges(db);
  await verifyDatabaseTls(db);
  console.log("PASS: runtime privileges, schema and verified TLS");
} catch {
  console.error(
    "FAIL: runtime database verification; no connection details logged",
  );
  process.exitCode = 1;
} finally {
  await db?.close().catch(() => {
    process.exitCode = 1;
  });
}
