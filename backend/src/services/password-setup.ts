import { db } from "../db";
import { passwordSetupTokens } from "../db/schema";

const TOKEN_EXPIRY_HOURS = 720;

export async function hashSetupToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function issuePasswordSetupToken(userId: string) {
  const token = `${crypto.randomUUID()}${crypto.randomUUID().replaceAll("-", "")}`;
  await db.insert(passwordSetupTokens).values({
    id: crypto.randomUUID(),
    userId,
    tokenHash: await hashSetupToken(token),
    expiresAt: new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
  });
  return token;
}
