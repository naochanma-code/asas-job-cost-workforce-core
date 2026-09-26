import { randomUUID } from "node:crypto";
import { openDatabase, migrate } from "../packages/database/index";
import { passwordHash } from "../packages/domain/identity";
const username = process.env.BOOTSTRAP_USERNAME?.toLowerCase(),
  password = process.env.BOOTSTRAP_PASSWORD;
if (!username || !password || password.length < 12)
  throw Error(
    "Set BOOTSTRAP_USERNAME and BOOTSTRAP_PASSWORD (12+ characters) locally",
  );
const db = await openDatabase(
  process.env.DATABASE_URL,
  process.env.LOCAL_DB_DIR,
);
try {
  await migrate(db);
  await db.transaction(async (tx) => {
    await tx.query("LOCK TABLE users IN EXCLUSIVE MODE");
    if ((await tx.query("SELECT id FROM users LIMIT 1")).rows.length)
      throw Error("Bootstrap allowed only on empty users table");
    const id = randomUUID();
    await tx.query(
      "INSERT INTO users(id,username,display_name,password_hash,role) VALUES($1,$2,$3,$4,'OWNER')",
      [id, username, "Owner", await passwordHash(password)],
    );
    await tx.query(
      "INSERT INTO employees(id,user_id,code,display_name) VALUES($1,$2,$3,$4)",
      [randomUUID(), id, "EMP-" + id.slice(0, 8), "Owner"],
    );
  });
  console.log("Owner created; password not logged");
} finally {
  await db.close();
}
