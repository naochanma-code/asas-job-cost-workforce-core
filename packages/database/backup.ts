import { createHash } from "node:crypto";
import { writeFile, readFile } from "node:fs/promises";
import type { Database, Row } from "./index";

// Deliberately excludes sessions, pending link codes, inbox and reply tokens.
// Restore requires fresh login/link attempts; never re-send old notifications.
const tables = [
  "users",
  "employees",
  "customers",
  "sites",
  "projects",
  "jobs",
  "project_members",
  "job_assignments",
  "audit_logs",
  "line_accounts",
  "line_group_bindings",
] as const;
export async function backup(db: Database, path: string) {
  const snapshot = await db.transaction(async (tx) => {
    await tx.exec("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");
    const data: Record<string, Row[]> = {};
    for (const table of tables)
      data[table] = (await tx.query(`SELECT * FROM ${table}`)).rows;
    return {
      format: 1,
      migrations: (
        await tx.query(
          "SELECT name,checksum FROM schema_migrations ORDER BY name",
        )
      ).rows,
      data,
    };
  });
  const payload = JSON.stringify(snapshot),
    checksum = createHash("sha256").update(payload).digest("hex");
  await writeFile(path, JSON.stringify({ checksum, payload }), {
    flag: "wx",
    mode: 0o600,
  });
}
export async function restore(db: Database, path: string) {
  const envelope = JSON.parse(await readFile(path, "utf8"));
  if (
    createHash("sha256").update(envelope.payload).digest("hex") !==
    envelope.checksum
  )
    throw Error("Backup checksum mismatch");
  const snapshot = JSON.parse(envelope.payload);
  if (
    snapshot.format !== 1 ||
    JSON.stringify(Object.keys(snapshot.data)) !== JSON.stringify(tables)
  )
    throw Error("Unsupported backup format");
  await db.transaction(async (tx) => {
    const migrations = (
      await tx.query(
        "SELECT name,checksum FROM schema_migrations ORDER BY name",
      )
    ).rows;
    if (JSON.stringify(migrations) !== JSON.stringify(snapshot.migrations))
      throw Error("Backup schema mismatch");
    await tx.exec(
      "LOCK TABLE " + tables.join(",") + " IN ACCESS EXCLUSIVE MODE",
    );
    for (const table of tables)
      if ((await tx.query(`SELECT 1 FROM ${table} LIMIT 1`)).rows.length)
        throw Error("Restore destination must be empty");
    for (const table of tables) {
      const allowed = new Set(
        (
          await tx.query(
            "SELECT column_name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name=$1",
            [table],
          )
        ).rows.map((r) => r.column_name),
      );
      for (const row of snapshot.data[table]) {
        const columns = Object.keys(row);
        if (!columns.length || columns.some((c) => !allowed.has(c)))
          throw Error("Invalid backup columns");
        await tx.query(
          `INSERT INTO ${table} (${columns.map((c) => '"' + c + '"').join(",")}) VALUES (${columns.map((_, i) => "$" + (i + 1)).join(",")})`,
          columns.map((c) =>
            typeof row[c] === "object" && row[c] !== null
              ? JSON.stringify(row[c])
              : row[c],
          ),
        );
      }
    }
  });
}
