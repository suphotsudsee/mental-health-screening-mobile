import crypto from "crypto";

export function verifyLineSignature(
  rawBody: string,
  channelSecret: string,
  signature: string | null
) {
  if (!signature) return false;

  const hash = crypto
    .createHmac("sha256", channelSecret)
    .update(rawBody)
    .digest("base64");

  return hash === signature;
}
