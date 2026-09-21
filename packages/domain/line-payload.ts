import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
function key() {
  const value = Buffer.from(process.env.LINE_PAYLOAD_KEY || "", "base64");
  if (value.length !== 32)
    throw Error("LINE_PAYLOAD_KEY must be 32 random bytes encoded as base64");
  return value;
}
export function seal(payload: unknown) {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  return {
    v: 1,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    data: data.toString("base64"),
  };
}
export function unseal(value: any) {
  if (value.v !== 1) throw Error("Unsupported encrypted payload");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key(),
    Buffer.from(value.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(value.tag, "base64"));
  return JSON.parse(
    Buffer.concat([
      decipher.update(Buffer.from(value.data, "base64")),
      decipher.final(),
    ]).toString("utf8"),
  );
}
export function allowedLineSource(userId?: string, groupId?: string) {
  const users = (process.env.LINE_TEST_USER_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    groups = (process.env.LINE_TEST_GROUP_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return (
    !!userId && users.includes(userId) && (!groupId || groups.includes(groupId))
  );
}
