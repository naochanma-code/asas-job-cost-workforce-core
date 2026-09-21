import { openDatabase } from "../packages/database/index";
import {
  processLineEvent,
  deliverLine,
  liveTransport,
} from "../apps/api/src/line";
if (
  process.env.LINE_ENABLED !== "true" ||
  !process.env.LINE_CHANNEL_ACCESS_TOKEN ||
  !process.env.DATABASE_URL ||
  !process.env.WEB_ORIGIN?.startsWith("https://") ||
  !process.env.LINE_TEST_USER_IDS ||
  !process.env.LINE_TEST_GROUP_IDS ||
  Buffer.from(process.env.LINE_PAYLOAD_KEY || "", "base64").length !== 32
)
  throw Error(
    "Live worker requires explicit LINE configuration, test allowlists, encryption key, PostgreSQL and HTTPS origin",
  );
const db = await openDatabase(process.env.DATABASE_URL),
  transport = liveTransport(process.env.LINE_CHANNEL_ACCESS_TOKEN);
let stopping = false;
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => (stopping = true));
while (!stopping) {
  await processLineEvent(db);
  await deliverLine(db, transport, process.env.WEB_ORIGIN);
  await new Promise((r) => setTimeout(r, 500));
}
await db.close();
