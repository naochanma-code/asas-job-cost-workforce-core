import { openDatabase, migrate } from "../packages/database/index";
const db = await openDatabase(
  process.env.DATABASE_URL,
  process.env.LOCAL_DB_DIR,
);
try {
  await migrate(db);
  console.log("Migrations applied");
} finally {
  await db.close();
}
