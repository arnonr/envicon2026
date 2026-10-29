import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { receiptAuditLogs, users } from "../db/schema";

export type ReceiptAuditSource = "receipt_edit" | "upload_slip" | "submission_form" | "event_sync";

export interface ReceiptSnapshot {
  receiptName: string | null;
  receiptTaxId: string | null;
  receiptAddress: string | null;
}

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim();
}

export function hasReceiptChanged(before: ReceiptSnapshot, after: ReceiptSnapshot): boolean {
  return (
    normalize(before.receiptName) !== normalize(after.receiptName) ||
    normalize(before.receiptTaxId) !== normalize(after.receiptTaxId) ||
    normalize(before.receiptAddress) !== normalize(after.receiptAddress)
  );
}

export async function recordReceiptAuditLog(params: {
  submissionId: string;
  changedBy: string | null;
  source: ReceiptAuditSource;
  before: ReceiptSnapshot;
  after: ReceiptSnapshot;
}): Promise<boolean> {
  if (!hasReceiptChanged(params.before, params.after)) {
    return false;
  }

  await db.insert(receiptAuditLogs).values({
    id: crypto.randomUUID(),
    submissionId: params.submissionId,
    changedBy: params.changedBy,
    source: params.source,
    oldReceiptName: params.before.receiptName,
    oldReceiptTaxId: params.before.receiptTaxId,
    oldReceiptAddress: params.before.receiptAddress,
    newReceiptName: params.after.receiptName,
    newReceiptTaxId: params.after.receiptTaxId,
    newReceiptAddress: params.after.receiptAddress,
  });

  return true;
}

export async function getSubmissionReceiptAuditLogs(submissionId: string) {
  return db
    .select({
      id: receiptAuditLogs.id,
      source: receiptAuditLogs.source,
      changedBy: receiptAuditLogs.changedBy,
      changedByName: users.name,
      changedByRole: users.role,
      oldReceiptName: receiptAuditLogs.oldReceiptName,
      oldReceiptTaxId: receiptAuditLogs.oldReceiptTaxId,
      oldReceiptAddress: receiptAuditLogs.oldReceiptAddress,
      newReceiptName: receiptAuditLogs.newReceiptName,
      newReceiptTaxId: receiptAuditLogs.newReceiptTaxId,
      newReceiptAddress: receiptAuditLogs.newReceiptAddress,
      createdAt: receiptAuditLogs.createdAt,
    })
    .from(receiptAuditLogs)
    .leftJoin(users, eq(receiptAuditLogs.changedBy, users.id))
    .where(eq(receiptAuditLogs.submissionId, submissionId))
    .orderBy(desc(receiptAuditLogs.createdAt));
}
