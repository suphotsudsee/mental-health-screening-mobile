import { api } from "./api";
import { RiskLevel } from "@logic/riskCalculator";

export interface ScreeningPayload {
  citizen_id: string | null;
  fullname: string | null;
  facility_code: string | null;
  stress_score: number | null;
  q1: 0 | 1;
  q2: 0 | 1;
  q3: 0 | 1;
  q8_total: number;
  risk_level: RiskLevel;
  recommendation: string;
}

export interface ScreeningRecord extends ScreeningPayload {
  id: number;
  created_at: string;
}

export async function fetchScreenings(limit = 500): Promise<ScreeningRecord[]> {
  const res = await api.get<ScreeningRecord[]>(`/api/screenings?limit=${limit}`);
  return res.data;
}

export async function createScreening(payload: ScreeningPayload): Promise<ScreeningRecord> {
  const res = await api.post<ScreeningRecord>("/api/screenings", payload, {
    headers: { "Content-Type": "application/json" }
  });
  return res.data;
}
