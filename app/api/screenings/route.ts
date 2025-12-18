import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type ScreeningPayload = {
  stressLevel?: number | null;
  twoQ?: { q1?: boolean | null; q2?: boolean | null } | null;
  nineQScore?: number | null;
  nineQSeverity?: string | null;
  hasSuicideRisk?: boolean | null;
  lineUserId?: string | null;
  lineGroupId?: string | null;
};

const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const DEFAULT_LINE_TARGET = process.env.LINE_GROUP_ID;

export const runtime = "nodejs";

function toBoolean(val: unknown): boolean {
  return val === true;
}

function resolveNineQLevel(score: number | null): string | null {
  if (score === null) return null;
  if (score < 7) return "minimal";
  if (score < 13) return "mild";
  if (score < 19) return "moderate";
  return "severe";
}

function buildSummaryMessage(params: {
  stressLevel: number | null;
  twoQ1: boolean;
  twoQ2: boolean;
  twoQRisk: boolean;
  nineQScore: number | null;
  nineQLevel: string | null;
  hasSuicideRisk: boolean;
  recordId: bigint;
  createdAt: Date;
}) {
  const lines = [
    "New screening completed",
    `Record ID: ${params.recordId}`,
    `Stress gauge: ${params.stressLevel ?? "n/a"}`,
    `2Q risk: ${params.twoQRisk ? "yes" : "no"} (Q1: ${params.twoQ1 ? "yes" : "no"}, Q2: ${params.twoQ2 ? "yes" : "no"})`,
    `9Q: ${
      params.nineQScore !== null
        ? `${params.nineQScore} (${params.nineQLevel ?? "unclassified"})`
        : "not taken"
    }`,
    `Suicide risk flag: ${params.hasSuicideRisk ? "yes" : "no"}`,
    `Recorded at: ${params.createdAt.toISOString()}`,
  ];

  return lines.join("\n");
}

async function pushLine(text: string, targetId?: string) {
  if (!LINE_TOKEN) {
    return { success: false, skipped: true, reason: "LINE_CHANNEL_ACCESS_TOKEN is not set" };
  }

  const recipient = targetId || DEFAULT_LINE_TARGET;
  if (!recipient) {
    return { success: false, skipped: true, reason: "LINE_GROUP_ID is not set" };
  }

  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_TOKEN}`,
      },
      body: JSON.stringify({
        to: recipient,
        messages: [{ type: "text", text }],
      }),
    });

    if (!res.ok) {
      const textBody = await res.text();
      return { success: false, skipped: false, reason: textBody || `HTTP ${res.status}` };
    }

    return { success: true, skipped: false };
  } catch (err) {
    return {
      success: false,
      skipped: false,
      reason: err instanceof Error ? err.message : "Unknown LINE push error",
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ScreeningPayload;

    const stressLevel = typeof body.stressLevel === "number" ? body.stressLevel : null;
    const twoQ = body.twoQ;
    const nineQScore = typeof body.nineQScore === "number" ? body.nineQScore : null;
    const nineQLevel = body.nineQSeverity ?? resolveNineQLevel(nineQScore);
    const hasSuicideRisk = toBoolean(body.hasSuicideRisk);
    const twoQ1 = toBoolean(twoQ?.q1);
    const twoQ2 = toBoolean(twoQ?.q2);
    const twoQRisk = twoQ1 || twoQ2;

    if (stressLevel === null || !twoQ) {
      return NextResponse.json({ error: "Missing required screening data" }, { status: 400 });
    }

    const record = await prisma.screenings.create({
      data: {
        stress_level: stressLevel,
        two_q1: twoQ1,
        two_q2: twoQ2,
        two_q_risk: twoQRisk,
        nine_q_score: nineQScore,
        nine_q_level: nineQLevel,
        suicide_risk: hasSuicideRisk,
        line_user_id: body.lineUserId ?? null,
        line_group_id: body.lineGroupId ?? null,
      },
    });

    const summary = buildSummaryMessage({
      stressLevel,
      twoQ1,
      twoQ2,
      twoQRisk,
      nineQScore,
      nineQLevel,
      hasSuicideRisk,
      recordId: record.id,
      createdAt: record.created_at,
    });

    const lineResult = await pushLine(summary, body.lineGroupId ?? undefined);

    const responseData = {
      ...record,
      id: record.id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      lineNotified: lineResult.success,
      lineSkipped: lineResult.skipped,
      lineReason: lineResult.reason ?? null,
    });
  } catch (err) {
    console.error("[screenings] Failed to process screening payload", err);
    return NextResponse.json({ error: "Failed to save screening" }, { status: 500 });
  }
}
