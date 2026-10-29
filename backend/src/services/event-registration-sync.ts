import { eq, sql } from "drizzle-orm";
import { db } from "../db";
import { eventRegistrations, submissions, users } from "../db/schema";
import { recordReceiptAuditLog, type ReceiptSnapshot } from "./receipt-audit";

export async function findEventRegistrationByEmail(rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();
  if (!email) return null;

  const [reg] = await db
    .select()
    .from(eventRegistrations)
    .where(sql`LOWER(TRIM(${eventRegistrations.email})) = ${email}`)
    .limit(1);

  return reg ?? null;
}

export function mapEventPaymentToSubmissionStatus(
  eventStatus: "pending_verification" | "confirmed" | "rejected",
  paymentSlipUrl: string | null,
): "unpaid" | "pending_verification" | "verified" | "rejected" {
  if (!paymentSlipUrl) return "unpaid";
  if (eventStatus === "confirmed") return "verified";
  if (eventStatus === "rejected") return "rejected";
  return "pending_verification";
}

export function mapSubmissionPaymentToEventStatus(
  submissionStatus: "unpaid" | "pending_verification" | "verified" | "rejected",
): "pending_verification" | "confirmed" | "rejected" {
  if (submissionStatus === "verified") return "confirmed";
  if (submissionStatus === "rejected") return "rejected";
  return "pending_verification";
}

/**
 * Links payment & receipt info from `event_registrations` to the user's submission
 * if they previously registered as an attendee with the same email.
 * Safeguard: Only auto-links to one submission so multiple papers don't duplicate a single slip.
 */
export async function syncEventRegistrationToUserSubmissions(userId: string, userEmail: string) {
  const reg = await findEventRegistrationByEmail(userEmail);
  if (!reg) return;

  const userSubs = await db
    .select()
    .from(submissions)
    .where(eq(submissions.authorId, userId));

  if (userSubs.length === 0) return;

  const mappedStatus = mapEventPaymentToSubmissionStatus(reg.paymentStatus, reg.paymentSlipUrl);

  // Check if any submission is already linked to this event registration slip
  const linkedSub = reg.paymentSlipUrl
    ? userSubs.find((s) => s.paymentSlipUrl === reg.paymentSlipUrl)
    : undefined;

  if (linkedSub) {
    // Keep paymentStatus in sync if admin confirmed/rejected it on the event_registrations side
    if (
      linkedSub.paymentStatus === "pending_verification" &&
      mappedStatus !== "pending_verification"
    ) {
      await db
        .update(submissions)
        .set({ paymentStatus: mappedStatus })
        .where(eq(submissions.id, linkedSub.id));
    }
    return;
  }

  // Only auto-attach if no submission has used this event slip yet, and there is an unpaid submission without a slip
  if (!reg.paymentSlipUrl && !reg.receiptName && !reg.receiptTaxId && !reg.receiptAddress) {
    return;
  }

  const targetSub = userSubs.find((s) => !s.paymentSlipUrl && s.paymentStatus === "unpaid");
  if (!targetSub) return;

  const nextReceipt: ReceiptSnapshot = {
    receiptName: targetSub.receiptName || reg.receiptName,
    receiptTaxId: targetSub.receiptTaxId || reg.receiptTaxId,
    receiptAddress: targetSub.receiptAddress || reg.receiptAddress,
  };

  await db
    .update(submissions)
    .set({
      paymentSlipUrl: reg.paymentSlipUrl,
      paymentStatus: mappedStatus,
      ...nextReceipt,
    })
    .where(eq(submissions.id, targetSub.id));

  await recordReceiptAuditLog({
    submissionId: targetSub.id,
    changedBy: userId,
    source: "event_sync",
    before: {
      receiptName: targetSub.receiptName,
      receiptTaxId: targetSub.receiptTaxId,
      receiptAddress: targetSub.receiptAddress,
    },
    after: nextReceipt,
  });
}

/**
 * When Admin updates payment status on `event_registrations`, sync to any linked submission.
 */
export async function syncEventRegistrationPaymentToSubmission(eventRegId: string) {
  const [reg] = await db
    .select()
    .from(eventRegistrations)
    .where(eq(eventRegistrations.id, eventRegId))
    .limit(1);

  if (!reg) return;

  const email = reg.email.trim().toLowerCase();
  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(sql`LOWER(TRIM(${users.email})) = ${email}`)
    .limit(1);

  if (!user) return;

  const userSubs = await db
    .select()
    .from(submissions)
    .where(eq(submissions.authorId, user.id));

  if (userSubs.length === 0) return;

  const mappedStatus = mapEventPaymentToSubmissionStatus(reg.paymentStatus, reg.paymentSlipUrl);
  const linkedSub =
    (reg.paymentSlipUrl ? userSubs.find((s) => s.paymentSlipUrl === reg.paymentSlipUrl) : undefined) ??
    (userSubs.length === 1 ? userSubs[0] : undefined);

  if (!linkedSub) return;

  const nextReceipt: ReceiptSnapshot = {
    receiptName: linkedSub.receiptName || reg.receiptName,
    receiptTaxId: linkedSub.receiptTaxId || reg.receiptTaxId,
    receiptAddress: linkedSub.receiptAddress || reg.receiptAddress,
  };

  await db
    .update(submissions)
    .set({
      paymentSlipUrl: linkedSub.paymentSlipUrl || reg.paymentSlipUrl,
      paymentStatus: mappedStatus,
      ...nextReceipt,
    })
    .where(eq(submissions.id, linkedSub.id));

  await recordReceiptAuditLog({
    submissionId: linkedSub.id,
    changedBy: null,
    source: "event_sync",
    before: {
      receiptName: linkedSub.receiptName,
      receiptTaxId: linkedSub.receiptTaxId,
      receiptAddress: linkedSub.receiptAddress,
    },
    after: nextReceipt,
  });
}

export async function syncSubmissionReceiptToEventRegistration(
  authorId: string,
  receipt: ReceiptSnapshot,
) {
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, authorId))
    .limit(1);

  if (!user) return;

  const reg = await findEventRegistrationByEmail(user.email);
  if (!reg) return;

  await db
    .update(eventRegistrations)
    .set({
      receiptName: receipt.receiptName || reg.receiptName,
      receiptTaxId: receipt.receiptTaxId || reg.receiptTaxId,
      receiptAddress: receipt.receiptAddress || reg.receiptAddress,
    })
    .where(eq(eventRegistrations.id, reg.id));
}

/**
 * When a submission's payment status or slip is updated, sync back to `event_registrations` if matching email exists.
 */
export async function syncSubmissionPaymentToEventRegistration(submission: {
  authorId: string;
  paymentSlipUrl: string | null;
  paymentStatus: "unpaid" | "pending_verification" | "verified" | "rejected";
  receiptName: string | null;
  receiptTaxId: string | null;
  receiptAddress: string | null;
}) {
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, submission.authorId))
    .limit(1);

  if (!user) return;

  const reg = await findEventRegistrationByEmail(user.email);
  if (!reg) return;

  const mappedEventStatus = mapSubmissionPaymentToEventStatus(submission.paymentStatus);

  await db
    .update(eventRegistrations)
    .set({
      paymentSlipUrl: submission.paymentSlipUrl ?? reg.paymentSlipUrl,
      paymentStatus: mappedEventStatus,
      receiptName: submission.receiptName || reg.receiptName,
      receiptTaxId: submission.receiptTaxId || reg.receiptTaxId,
      receiptAddress: submission.receiptAddress || reg.receiptAddress,
    })
    .where(eq(eventRegistrations.id, reg.id));
}
