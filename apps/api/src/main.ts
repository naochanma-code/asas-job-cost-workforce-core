import {
  openDatabase,
  prepareRuntimeDatabase,
} from "../../../packages/database/index";
import { buildApp } from "./app";
const db = await openDatabase(
  process.env.DATABASE_URL,
  process.env.LOCAL_DB_DIR,
);
await prepareRuntimeDatabase(db);
const app = await buildApp(db, process.env.WEB_ORIGIN);
await app.listen({
  host: process.env.HOST || "127.0.0.1",
  port: Number(process.env.PORT || 3001),
});
console.log("Foundation API listening");
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    await app.close();
    await db.close();
    process.exit(0);
  });
