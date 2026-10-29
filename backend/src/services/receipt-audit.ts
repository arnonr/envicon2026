import { desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import { receiptAuditLogs, users } from "../db/schema";

export type ReceiptAuditSource = "receipt_edit" | "upload_slip" | "submission_form" | "event_sync";

export interface ReceiptSnapshot {
  receiptName: string | null;
  receiptTaxId: string | null;
  receiptAddress: string | null;
}

let ensureTablePromise: Promise<void> | null = null;

export function ensureReceiptAuditLogsTable(): Promise<void> {
  if (!ensureTablePromise) {
    ensureTablePromise = db
      .execute(sql`
        CREATE TABLE IF NOT EXISTS \`receipt_audit_logs\` (
          \`id\` varchar(36) NOT NULL,
          \`submission_id\` varchar(36) NOT NULL,
          \`changed_by\` varchar(36) DEFAULT NULL,
          \`source\` enum('receipt_edit','upload_slip','submission_form','event_sync') NOT NULL,
          \`old_receipt_name\` varchar(255) DEFAULT NULL,
          \`old_receipt_tax_id\` varchar(20) DEFAULT NULL,
          \`old_receipt_address\` text,
          \`new_receipt_name\` varchar(255) DEFAULT NULL,
          \`new_receipt_tax_id\` varchar(20) DEFAULT NULL,
          \`new_receipt_address\` text,
          \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_receipt_audit_logs_submission_id\` (\`submission_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `)
      .then(() => undefined)
      .catch((err) => {
        ensureTablePromise = null;
        throw err;
      });
  }
  return ensureTablePromise;
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

  try {
    await ensureReceiptAuditLogsTable();
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
  } catch (err) {
    console.error("[receipt-audit] Failed to record receipt audit log:", err);
    return false;
  }
}

export async function getSubmissionReceiptAuditLogs(submissionId: string) {
  try {
    await ensureReceiptAuditLogsTable();
    const logs = await db
      .select()
      .from(receiptAuditLogs)
      .where(eq(receiptAuditLogs.submissionId, submissionId))
      .orderBy(desc(receiptAuditLogs.createdAt));

    if (logs.length === 0) return [];

    const userIds = [...new Set(logs.map((l) => l.changedBy).filter((id): id is string => Boolean(id)))];
    const userRows = userIds.length
      ? await db
          .select({ id: users.id, name: users.name, role: users.role })
          .from(users)
          .where(inArray(users.id, userIds))
      : [];
    const userMap = new Map(userRows.map((u) => [u.id, u]));

    return logs.map((log) => {
      const editor = log.changedBy ? userMap.get(log.changedBy) : undefined;
      return {
        id: log.id,
        source: log.source,
        changedBy: log.changedBy,
        changedByName: editor?.name ?? null,
        changedByRole: editor?.role ?? null,
        oldReceiptName: log.oldReceiptName,
        oldReceiptTaxId: log.oldReceiptTaxId,
        oldReceiptAddress: log.oldReceiptAddress,
        newReceiptName: log.newReceiptName,
        newReceiptTaxId: log.newReceiptTaxId,
        newReceiptAddress: log.newReceiptAddress,
        createdAt: log.createdAt,
      };
    });
  } catch (err) {
    console.error("[receipt-audit] Failed to load receipt audit logs:", err);
    return [];
  }
}
