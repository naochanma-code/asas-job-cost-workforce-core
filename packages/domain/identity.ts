import {
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
  createHash,
  randomUUID,
} from "node:crypto";
import { promisify } from "node:util";
import type { Queryable } from "../database/index";
const scrypt = promisify(scryptCb);
export const hashToken = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const token = () => randomBytes(32).toString("base64url");
export async function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return salt + ":" + key.toString("hex");
}
export async function verifyPassword(password: string, hash: string) {
  const [salt, hex] = hash.split(":");
  if (!salt || !hex) return false;
  const key = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hex, "hex");
  return key.length === expected.length && timingSafeEqual(key, expected);
}
export type Actor = {
  id: string;
  role: "OWNER" | "ADMIN" | "PM" | "TECH";
  display_name: string;
};
export class Denied extends Error {
  constructor(
    public status = 403,
    message = "ไม่มีสิทธิ์ทำรายการ",
  ) {
    super(message);
  }
}
export async function audit(
  db: Queryable,
  actor: Actor,
  action: string,
  entity: string,
  details: object = {},
) {
  await db.query(
    "INSERT INTO audit_logs(id,actor_id,action,entity_id,details) VALUES($1,$2,$3,$4,$5)",
    [randomUUID(), actor.id, action, entity, JSON.stringify(details)],
  );
}
export function manage(actor: Actor) {
  if (!["OWNER", "ADMIN"].includes(actor.role)) throw new Denied();
}
