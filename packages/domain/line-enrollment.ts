import { randomBytes, createHash } from "node:crypto";

const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const ttl = 15 * 60 * 1000;
type Source = { type: string; userId?: string; groupId?: string };
type Slot = {
  hash: string;
  kind: "USER" | "GROUP";
  userId?: string;
  groupId?: string;
};

// Deliberately process-local and bounded. Restart/expiry requires fresh invitations;
// enrollment never grants access, links an account, or queues a business event.
export class LineEnrollment {
  private slots: Slot[] = [];
  private expiresAt = 0;
  private owner = "";
  constructor(private now: () => number = Date.now) {}

  start(owner: string) {
    if (this.expiresAt > this.now()) return undefined;
    this.owner = owner;
    this.expiresAt = this.now() + ttl;
    const invitations = ["USER", "USER", "USER", "GROUP"].map((kind) => {
      const code = randomBytes(24).toString("base64url");
      return { kind: kind as "USER" | "GROUP", code };
    });
    this.slots = invitations.map(({ kind, code }) => ({
      kind,
      hash: hash(code),
    }));
    return {
      expiresAt: new Date(this.expiresAt).toISOString(),
      invitations: invitations.map(({ kind, code }, index) => ({
        slot: index + 1,
        kind,
        command: `ลงทะเบียนทดลอง ${code}`,
      })),
    };
  }

  capture(event: {
    type: string;
    source?: Source;
    message?: { type: string; text?: string };
  }) {
    if (this.now() >= this.expiresAt) {
      this.clear();
      return;
    }
    if (event.type !== "message" || event.message?.type !== "text") return;
    const match = /^(?:ลงทะเบียนทดลอง\s+)?([A-Za-z0-9_-]{32})$/.exec(
      event.message.text?.trim() || "",
    );
    const source = event.source;
    if (!match || !source?.userId || !/^U[0-9a-f]{32}$/.test(source.userId))
      return;
    const slot = this.slots.find((s) => s.hash === hash(match[1]));
    if (!slot || slot.userId) return;
    if (slot.kind === "USER") {
      if (
        source.type !== "user" ||
        source.groupId ||
        this.slots.some((s) => s.kind === "USER" && s.userId === source.userId)
      )
        return;
      slot.userId = source.userId;
    } else {
      if (
        source.type !== "group" ||
        !/^C[0-9a-f]{32}$/.test(source.groupId || "") ||
        !this.slots.some((s) => s.kind === "USER" && s.userId === source.userId)
      )
        return;
      slot.userId = source.userId;
      slot.groupId = source.groupId;
    }
  }

  result(owner: string) {
    if (this.now() >= this.expiresAt) this.clear();
    if (!this.slots.length || this.owner !== owner) return undefined;
    return {
      expiresAt: new Date(this.expiresAt).toISOString(),
      slots: this.slots.map((s, index) => ({
        slot: index + 1,
        kind: s.kind,
        received: !!s.userId,
      })),
      complete: this.slots.every((s) => !!s.userId),
      userIds: this.slots
        .filter((s) => s.kind === "USER" && s.userId)
        .map((s) => s.userId!),
      groupIds: this.slots
        .filter((s) => s.kind === "GROUP" && s.groupId)
        .map((s) => s.groupId!),
    };
  }
  clear() {
    this.slots = [];
    this.owner = "";
    this.expiresAt = 0;
  }
}
