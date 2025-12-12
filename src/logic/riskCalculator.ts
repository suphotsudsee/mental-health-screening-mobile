export type RiskLevel = "none" | "low" | "medium" | "high";

export interface RiskInput {
  stressScore: number | null; // 1–5
  q1: 0 | 1;
  q2: 0 | 1;
  q3: 0 | 1;
  eightQAnswers: (0 | 1)[]; // length 8
}

export interface RiskResult {
  total8: number;
  hasEmergency: boolean;
  riskLevel: RiskLevel;
  recommendation: string;
}

export const HIGH_ACTION =
  "มีความเสี่ยงสูง / ภาวะฉุกเฉิน แนะนำส่งพบแพทย์หรือทีมสุขภาพจิตทันที และไม่ปล่อยให้อยู่ลำพัง";
export const MEDIUM_ACTION =
  "มีความเสี่ยงปานกลาง แนะนำให้เข้ารับการประเมินเพิ่มเติมโดยบุคลากรสาธารณสุข และติดตามอาการอย่างใกล้ชิด";
export const LOW_ACTION =
  "มีความเสี่ยงต่ำ แนะนำการดูแลตนเอง เบี่ยงเบนความคิด ทำกิจกรรมที่ผ่อนคลาย และติดตามอาการหากไม่ดีขึ้น";
export const NONE_ACTION =
  "ยังไม่พบสัญญาณเสี่ยงสำคัญ แนะนำการดูแลสุขภาพกายใจต่อเนื่อง พักผ่อนให้เพียงพอ และพบผู้เชี่ยวชาญหากมีอาการเพิ่มขึ้น";

export function calculateRisk(input: RiskInput): RiskResult {
  const { stressScore, q1, q2, q3, eightQAnswers } = input;

  const paddedAnswers: (0 | 1)[] = [...eightQAnswers];
  while (paddedAnswers.length < 8) paddedAnswers.push(0);

  const total8 = paddedAnswers.reduce((sum, v) => sum + v, 0);
  const hasEmergency = paddedAnswers[6] === 1 || paddedAnswers[7] === 1;

  let riskLevel: RiskLevel = "none";
  let recommendation = NONE_ACTION;

  if (q3 === 1) {
    if (hasEmergency || total8 >= 4) {
      riskLevel = "high";
      recommendation = HIGH_ACTION;
    } else if (total8 >= 2) {
      riskLevel = "medium";
      recommendation = MEDIUM_ACTION;
    } else {
      riskLevel = "low";
      recommendation = LOW_ACTION;
    }
  } else if (q1 === 1 || q2 === 1 || (stressScore !== null && stressScore >= 4)) {
    riskLevel = "low";
    recommendation = LOW_ACTION;
  }

  return { total8, hasEmergency, riskLevel, recommendation };
}
