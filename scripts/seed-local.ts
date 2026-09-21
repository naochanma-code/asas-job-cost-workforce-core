import { randomUUID, randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { openDatabase, migrate } from "../packages/database/index";
import { passwordHash } from "../packages/domain/identity";
if (process.env.DATABASE_URL || process.env.NODE_ENV === "production")
  throw Error("Synthetic local database only");
const db = await openDatabase();
try {
  await migrate(db);
  const accounts: { username: string; password: string; role: string }[] = [];
  await db.transaction(async (tx) => {
    await tx.query("LOCK TABLE users IN EXCLUSIVE MODE");
    if ((await tx.query("SELECT id FROM users LIMIT 1")).rows.length)
      throw Error("Seed requires empty local database");
    for (const role of ["OWNER", "ADMIN", "PM", "TECH", "TECH2"]) {
      const id = randomUUID(),
        username = "demo-" + role.toLowerCase(),
        password = randomBytes(18).toString("base64url");
      await tx.query(
        "INSERT INTO users(id,username,display_name,password_hash,role) VALUES($1,$2,$3,$4,$5)",
        [
          id,
          username,
          "บัญชีทดสอบ " + role,
          await passwordHash(password),
          role.replace("2", ""),
        ],
      );
      await tx.query(
        "INSERT INTO employees(id,user_id,code,display_name) VALUES($1,$2,$3,$4)",
        [randomUUID(), id, "EMP-" + id.slice(0, 8), "พนักงานทดสอบ " + role],
      );
      accounts.push({ username, password, role });
    }
  });
  await mkdir(".local", { recursive: true });
  await writeFile(
    ".local/demo-accounts.json",
    JSON.stringify(accounts, null, 2),
    { flag: "wx", mode: 0o600 },
  );
  console.log(
    "Synthetic accounts created; credentials in ignored .local/demo-accounts.json",
  );
} finally {
  await db.close();
}
