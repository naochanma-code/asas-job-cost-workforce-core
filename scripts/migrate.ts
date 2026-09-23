import { openDatabase, migrate } from "../packages/database/index";
const db = await openDatabase(
  process.env.DATABASE_URL,
  process.env.LOCAL_DB_DIR,
);
try {
  if (
    process.env.MIGRATION_ROLE &&
    process.env.MIGRATION_ROLE !== "asas_m1_migrator"
  )
    throw Error("Unsupported migration role");
  await migrate(
    db,
    process.env.MIGRATION_ROLE as "asas_m1_migrator" | undefined,
  );
  console.log("Migrations applied");
} catch {
  console.error("Migration failed; inspect privately and do not retry blindly");
  process.exitCode = 1;
} finally {
  await db.close();
}
