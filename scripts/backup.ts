import { openDatabase, verifySchema } from "../packages/database/index";
import { backup, restore } from "../packages/database/backup";
async function main() {
  const [mode, path] = process.argv.slice(2);
  if (!["backup", "restore"].includes(mode) || !path)
    throw Error("Usage: backup.ts backup|restore PRIVATE_FILE_PATH");
  if (
    !process.env.DATABASE_URL &&
    process.env.LOCAL_DATABASE_OFFLINE !== "true"
  )
    throw Error(
      "Stop local API first and set LOCAL_DATABASE_OFFLINE=true; embedded DB supports one process only",
    );
  const db = await openDatabase(
    process.env.DATABASE_URL,
    process.env.LOCAL_DB_DIR || ".local/pgdata",
  );
  try {
    // Schema changes belong to the separate migration operator, including restore.
    await verifySchema(db);
    await (mode === "backup" ? backup(db, path) : restore(db, path));
    console.log(mode + " completed");
  } finally {
    await db.close();
  }
}
main().catch(() => {
  // Database errors can contain connection metadata; never print the exception.
  console.error(
    "Backup/restore failed; check private configuration, schema and empty destination",
  );
  process.exitCode = 1;
});
