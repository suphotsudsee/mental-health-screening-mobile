import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyLineSignature } from "@/lib/line-signature";

export const runtime = "nodejs";

async function replyMessage(replyToken: string, text: string) {
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });
}

export async function POST(req: Request) {

 console.log("✅ Webhook HIT:", new Date().toISOString());

  const rawBody = await req.text();

console.log("RAW:", rawBody.slice(0, 300));
  
  const signature = req.headers.get("x-line-signature");

  const valid = verifyLineSignature(
    rawBody,
    process.env.LINE_CHANNEL_SECRET!,
    signature
  );

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);

  for (const ev of body.events) {
    await prisma.line_events.create({
      data: {
        event_type: ev.type,
        user_id: ev.source?.userId,
        reply_token: ev.replyToken,
        message_type: ev.message?.type,
        message_text: ev.message?.text,
        raw_json: ev,
      },
    });

    if (ev.type === "message" && ev.message?.type === "text") {
      await replyMessage(ev.replyToken, `รับแล้ว: ${ev.message.text}`);
    }
  }

  return NextResponse.json({ status: "ok" });
}
