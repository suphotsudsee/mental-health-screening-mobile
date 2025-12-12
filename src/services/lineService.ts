import { api } from "./api";
import { ScreeningRecord } from "./screeningService";

const ENABLE_LINE_NOTIFY =
  (process.env.EXPO_PUBLIC_ENABLE_LINE_NOTIFY || "true").toLowerCase() === "true";

export async function sendLineNotifyIfNeeded(record: ScreeningRecord) {
  if (!ENABLE_LINE_NOTIFY) return;
  if (record.risk_level === "medium" || record.risk_level === "high") {
    const name = record.fullname || "(ไม่ระบุชื่อ)";
    const msg =
      `แจ้งเตือนคัดกรองสุขภาพจิต (ส่งเข้ากลุ่ม LINE)\n` +
      `ชื่อ: ${name}\n` +
      `คะแนนเครียด: ${record.stress_score ?? "-"}\n` +
      `8Q รวม: ${record.q8_total}\n` +
      `ระดับเสี่ยง: ${record.risk_level.toUpperCase()}\n` +
      `ข้อแนะนำ: ${record.recommendation}`;

    await api.post(
      "/api/line-alert",   // <<< เปลี่ยนมาใช้ route ใหม่
      { text: msg },
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
