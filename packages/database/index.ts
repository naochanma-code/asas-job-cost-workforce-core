import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import { createHash } from "node:crypto";
import { readFile, readdir, mkdir } from "node:fs/promises";

export type Row = Record<string, any>;
export interface Queryable {
  query<T extends Row = Row>(
    sql: string,
    params?: any[],
  ): Promise<{ rows: T[] }>;
  exec(sql: string): Promise<unknown>;
}
export interface Database extends Queryable {
  transaction<T>(fn: (db: Queryable) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
export async function openDatabase(
  url?: string,
  directory = ".local/pgdata",
): Promise<Database> {
  if (url) {
    const pool = new Pool({ connectionString: url, max: 10 });
    return {
      query: async (s, p) => pool.query(s, p),
      exec: (s) => pool.query(s),
      transaction: async (fn) => {
        const c = await pool.connect();
        try {
          await c.query("BEGIN");
          const r = await fn({
            query: (s, p) => c.query(s, p),
            exec: (s) => c.query(s),
          });
          await c.query("COMMIT");
          return r;
        } catch (e) {
          await c.query("ROLLBACK");
          throw e;
        } finally {
          c.release();
        }
      },
      close: () => pool.end(),
    };
  }
  if (process.env.NODE_ENV === "production")
    throw Error("DATABASE_URL required in production");
  if (!directory.startsWith("memory://"))
    await mkdir(directory, { recursive: true });
  const pg = new PGlite(directory);
  await pg.waitReady;
  return {
    query: (s, p) => pg.query(s, p),
    exec: (s) => pg.exec(s),
    transaction: (fn) => pg.transaction((tx) => fn(tx)),
    close: () => pg.close(),
  };
}
export async function migrate(db: Database) {
  await db.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  const dir = new URL("./migrations/", import.meta.url);
  for (const name of (await readdir(dir))
    .filter((n) => n.endsWith(".sql"))
    .sort()) {
    const sql = await readFile(new URL(name, dir), "utf8"),
      checksum = createHash("sha256").update(sql).digest("hex");
    await db.transaction(async (tx) => {
      await tx.query("LOCK TABLE schema_migrations IN EXCLUSIVE MODE");
      const old = (
        await tx.query("SELECT checksum FROM schema_migrations WHERE name=$1", [
          name,
        ])
      ).rows[0];
      if (old) {
        if (old.checksum !== checksum)
          throw Error("Migration checksum mismatch");
        return;
      }
      await tx.exec(sql);
      await tx.query(
        "INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)",
        [name, checksum],
      );
    });
  }
}

// Online runtimes only verify migrations. DDL belongs to the operator job.
export async function verifySchema(db: Queryable) {
  const applied = (
    await db.query("SELECT name,checksum FROM schema_migrations ORDER BY name")
  ).rows;
  const dir = new URL("./migrations/", import.meta.url);
  const names = (await readdir(dir)).filter((n) => n.endsWith(".sql")).sort();
  if (applied.length !== names.length)
    throw Error(
      "Database schema does not match this release; run the approved migration job",
    );
  for (const [i, name] of names.entries()) {
    const checksum = createHash("sha256")
      .update(await readFile(new URL(name, dir), "utf8"))
      .digest("hex");
    if (applied[i].name !== name || applied[i].checksum !== checksum)
      throw Error(
        "Database schema does not match this release; run the approved migration job",
      );
  }
}

export async function prepareRuntimeDatabase(db: Database) {
  if (process.env.NODE_ENV === "production") await verifySchema(db);
  else await migrate(db);
}
