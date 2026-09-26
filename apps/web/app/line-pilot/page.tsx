"use client";
import { useState } from "react";

type Invitation = { slot: number; kind: string; command: string };
type Status = {
  expiresAt: string;
  slots: { slot: number; kind: string; received: boolean }[];
  complete: boolean;
  userIds: string[];
  groupIds: string[];
};
export default function LinePilot() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [status, setStatus] = useState<Status>();
  const [expires, setExpires] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function run(start: boolean) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        start ? "/api/line/enrollment/start" : "/api/line/enrollment",
        { method: start ? "POST" : "GET", cache: "no-store" },
      );
      const result = await response.json();
      if (!response.ok)
        throw Error(
          response.status === 401
            ? "กรุณาเข้าสู่ระบบด้วยบัญชี Owner ที่หน้าแรกก่อน"
            : result.error || "ยังตรวจสถานะไม่ได้",
        );
      if (start) {
        setInvitations(result.invitations);
        setStatus(undefined);
        setExpires(result.expiresAt);
      } else {
        setStatus(result);
        setExpires(result.expiresAt);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "ระบบขัดข้อง กรุณาลองใหม่");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "1rem" }}>
      <h1>ลงทะเบียน LINE Pilot</h1>
      <p>
        เฉพาะ Owner และ OA/กลุ่มทดสอบที่อนุมัติ
        ขั้นนี้ยังไม่เชื่อมบัญชีหรือเปิดดูข้อมูลโครงการ
      </p>
      <p>
        รหัสใช้ได้ครั้งเดียวภายใน 15 นาที เก็บรหัสไว้เฉพาะผู้ทดลอง ไม่ส่งใน
        GitHub หรือแชทกับผู้ช่วย การรีสตาร์ทบริการทำให้ต้องเริ่มรอบใหม่
      </p>
      <button disabled={busy} onClick={() => run(true)}>
        เริ่มรอบลงทะเบียน 3 คนและ 1 กลุ่ม
      </button>{" "}
      <button disabled={busy} onClick={() => run(false)}>
        ตรวจผลลงทะเบียน
      </button>
      {error && <p role="alert">{error}</p>}
      {expires && <p>หมดอายุ: {new Date(expires).toLocaleString("th-TH")}</p>}
      {invitations.map((i) => (
        <section
          key={i.slot}
          style={{
            border: "1px solid #bbb",
            padding: "1rem",
            marginTop: "1rem",
          }}
        >
          <h2>
            {i.kind === "GROUP" ? "กลุ่มทดสอบ" : `ผู้ทดลองคนที่ ${i.slot}`}
          </h2>
          <p>
            {i.kind === "GROUP"
              ? "ให้ผู้ที่ลงทะเบียนส่วนตัวแล้ว ส่งข้อความนี้ในกลุ่มทดสอบที่มี OA อยู่"
              : "ให้ผู้ทดลองแต่ละคนส่งข้อความนี้หา OA ในแชทส่วนตัว ใช้คนละรหัส"}
          </p>
          <textarea
            aria-label={`คำสั่งลงทะเบียนช่อง ${i.slot}`}
            readOnly
            value={i.command}
            rows={2}
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </section>
      ))}
      {status && (
        <section>
          <h2>ผลลงทะเบียน</h2>
          <ul>
            {status.slots.map((s) => (
              <li key={s.slot}>
                {s.kind === "GROUP" ? "กลุ่ม" : `คนที่ ${s.slot}`}:{" "}
                {s.received ? "ได้รับแล้ว" : "รอข้อความ"}
              </li>
            ))}
          </ul>
          <p>
            {status.complete
              ? "ครบแล้ว ให้ผู้ดูแลระบบตรวจขอบเขตก่อนเปิดทดลอง ยังไม่ได้เปิดสิทธิ์อัตโนมัติ"
              : "ยังรอผู้ทดลองส่งข้อความ"}
          </p>
          <details>
            <summary>
              ค่าสำหรับผู้ดูแลระบบ — กรอกใน Railway Variables เท่านั้น
            </summary>
            <label>
              LINE_TEST_USER_IDS
              <textarea
                aria-label="LINE_TEST_USER_IDS"
                readOnly
                value={status.userIds.join(",")}
                rows={3}
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </label>
            <label>
              LINE_TEST_GROUP_IDS
              <textarea
                aria-label="LINE_TEST_GROUP_IDS"
                readOnly
                value={status.groupIds.join(",")}
                rows={2}
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </label>
          </details>
        </section>
      )}
      <p>
        <a href="/">กลับหน้าแอป</a>
      </p>
    </main>
  );
}
