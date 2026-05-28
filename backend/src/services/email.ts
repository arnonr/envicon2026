import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { emailNotifications } from "../db/schema";

type EmailType = "reviewer_invitation" | "review_assignment" | "author_result" | "password_reset";

interface EmailMessage {
  type: EmailType;
  recipientEmail: string;
  relatedId?: string | null;
  subject: string;
  htmlBody: string;
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) throw new Error("SMTP_HOST is not configured");

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
    connectionTimeout: 10_000,
    socketTimeout: 30_000,
    ...(user ? { auth: { user, pass: pass ?? "" } } : {}),
  });
}

async function deliver(notification: {
  id: string;
  recipientEmail: string;
  subject: string;
  htmlBody: string;
}) {
  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "ENVICON 2026 <no-reply@envicon.local>",
      to: notification.recipientEmail,
      subject: notification.subject,
      html: notification.htmlBody,
    });
    await db
      .update(emailNotifications)
      .set({ status: "sent", sentAt: new Date(), errorMessage: null })
      .where(eq(emailNotifications.id, notification.id));
    return { id: notification.id, status: "sent" as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email delivery failed";
    await db
      .update(emailNotifications)
      .set({ status: "failed", errorMessage: message })
      .where(eq(emailNotifications.id, notification.id));
    return { id: notification.id, status: "failed" as const, error: message };
  }
}

export async function sendTrackedEmail(message: EmailMessage) {
  const id = crypto.randomUUID();
  await db.insert(emailNotifications).values({
    id,
    type: message.type,
    recipientEmail: message.recipientEmail,
    relatedId: message.relatedId ?? null,
    subject: message.subject,
    htmlBody: message.htmlBody,
  });
  return deliver({ id, ...message });
}

export async function retryTrackedEmail(id: string) {
  const [notification] = await db
    .select()
    .from(emailNotifications)
    .where(eq(emailNotifications.id, id))
    .limit(1);
  if (!notification) return null;
  return deliver(notification);
}

export function appUrl(pathname: string) {
  const base = process.env.APP_BASE_URL || "http://localhost:3000/envicon2026";
  return `${base.replace(/\/$/, "")}/${pathname.replace(/^\//, "")}`;
}

export function escapeHtml(value: string | null | undefined) {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
