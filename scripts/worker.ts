import { openDatabase, verifySchema } from "../packages/database/index";
import {
  processLineEvent,
  deliverLine,
  liveTransport,
} from "../apps/api/src/line";
import { lineWorkerConfigured } from "../packages/domain/line-worker-config";

async function main() {
  if (!lineWorkerConfigured(process.env)) throw Error("Configuration");
  const db = await openDatabase(process.env.DATABASE_URL);
  let stopping = false;
  const stop = () => {
    stopping = true;
  };
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, stop);
  try {
    await verifySchema(db);
    const transport = liveTransport(process.env.LINE_CHANNEL_ACCESS_TOKEN!);
    while (!stopping) {
      await processLineEvent(db);
      if (stopping) break;
      await deliverLine(db, transport, process.env.WEB_ORIGIN!);
      if (!stopping) await new Promise((r) => setTimeout(r, 500));
    }
  } finally {
    for (const signal of ["SIGINT", "SIGTERM"]) process.off(signal, stop);
    await db.close();
  }
}

try {
  await main();
} catch {
  // Database/transport errors can carry connection details. Never log the error.
  console.error(
    "LINE worker stopped: check private configuration and database health",
  );
  process.exitCode = 1;
}
