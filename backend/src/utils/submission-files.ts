import { and, desc, eq, ne, sql } from "drizzle-orm";
import { t } from "elysia";
import { db } from "../db";
import { reviewRounds, revisions, submissions, submissionVersions } from "../db/schema";
import { saveFile } from "../services/storage";

export const managedSlotUrlsSchema = t.Object({
  abstractFileUrl: t.Optional(t.Nullable(t.String())),
  abstractWordFileUrl: t.Optional(t.Nullable(t.String())),
  fullPaperFileUrl: t.Optional(t.Nullable(t.String())),
  fullPaperWordFileUrl: t.Optional(t.Nullable(t.String())),
});

export const adminFilesBodySchema = t.Object({
  slotUrls: t.Optional(t.Union([t.String(), managedSlotUrlsSchema])),
  abstractPdf: t.Optional(t.File({ maxSize: 50 * 1024 * 1024 })),
  abstractWord: t.Optional(t.File({ maxSize: 50 * 1024 * 1024 })),
  fullPaperPdf: t.Optional(t.File({ maxSize: 50 * 1024 * 1024 })),
  fullPaperWord: t.Optional(t.File({ maxSize: 50 * 1024 * 1024 })),
  changelog: t.Optional(t.String()),
});

export interface FileSlotInputs {
  abstractPdf?: File;
  abstractWord?: File;
  fullPaperPdf?: File;
  fullPaperWord?: File;
}

export interface FileSlotUrls {
  abstractFileUrl: string | null;
  abstractWordFileUrl: string | null;
  fullPaperFileUrl: string | null;
  fullPaperWordFileUrl: string | null;
}

export type SlotUrlSource = Pick<
  typeof submissions.$inferSelect,
  | "abstractFileUrl"
  | "abstractWordFileUrl"
  | "fullPaperFileUrl"
  | "fullPaperWordFileUrl"
  | "round1FileUrl"
  | "round1FileType"
>;

const SLOT_LABELS: Record<keyof FileSlotUrls, string> = {
  abstractFileUrl: "บทคัดย่อ (PDF)",
  abstractWordFileUrl: "บทคัดย่อ (Word)",
  fullPaperFileUrl: "ฉบับสมบูรณ์ (PDF)",
  fullPaperWordFileUrl: "ฉบับสมบูรณ์ (Word)",
};

const SLOT_KEYS: (keyof FileSlotUrls)[] = [
  "abstractFileUrl",
  "abstractWordFileUrl",
  "fullPaperFileUrl",
  "fullPaperWordFileUrl",
];

export function resolveCurrentSlotUrls(sub: SlotUrlSource): FileSlotUrls {
  return {
    abstractFileUrl: sub.abstractFileUrl ?? (sub.round1FileType !== "full_paper" ? sub.round1FileUrl : null),
    abstractWordFileUrl: sub.abstractWordFileUrl ?? null,
    fullPaperFileUrl: sub.fullPaperFileUrl ?? (sub.round1FileType === "full_paper" ? sub.round1FileUrl : null),
    fullPaperWordFileUrl: sub.fullPaperWordFileUrl ?? null,
  };
}

function getExtensionFromName(name: string): string {
  const clean = name.split("?")[0] ?? "";
  return (clean.split(".").pop() ?? "").toLowerCase();
}

export function validateSlotFiles(files: FileSlotInputs): string | null {
  if (files.abstractPdf && getExtensionFromName(files.abstractPdf.name) !== "pdf") {
    return "ไฟล์บทคัดย่อ (PDF) ต้องเป็นนามสกุล .pdf เท่านั้น";
  }
  if (files.fullPaperPdf && getExtensionFromName(files.fullPaperPdf.name) !== "pdf") {
    return "ไฟล์บทความฉบับสมบูรณ์ (PDF) ต้องเป็นนามสกุล .pdf เท่านั้น";
  }
  if (files.abstractWord && !["doc", "docx"].includes(getExtensionFromName(files.abstractWord.name))) {
    return "ไฟล์บทคัดย่อ (Word) ต้องเป็นนามสกุล .doc หรือ .docx เท่านั้น";
  }
  if (files.fullPaperWord && !["doc", "docx"].includes(getExtensionFromName(files.fullPaperWord.name))) {
    return "ไฟล์บทความฉบับสมบูรณ์ (Word) ต้องเป็นนามสกุล .doc หรือ .docx เท่านั้น";
  }
  return null;
}

export async function saveSlotFiles(
  submissionId: string,
  tag: string,
  files: FileSlotInputs,
): Promise<FileSlotUrls> {
  const [abstractFileUrl, abstractWordFileUrl, fullPaperFileUrl, fullPaperWordFileUrl] = await Promise.all([
    files.abstractPdf ? saveFile(files.abstractPdf, `abstract-pdf-${submissionId}-${tag}`) : Promise.resolve(null),
    files.abstractWord ? saveFile(files.abstractWord, `abstract-word-${submissionId}-${tag}`) : Promise.resolve(null),
    files.fullPaperPdf ? saveFile(files.fullPaperPdf, `fullpaper-pdf-${submissionId}-${tag}`) : Promise.resolve(null),
    files.fullPaperWord ? saveFile(files.fullPaperWord, `fullpaper-word-${submissionId}-${tag}`) : Promise.resolve(null),
  ]);
  return { abstractFileUrl, abstractWordFileUrl, fullPaperFileUrl, fullPaperWordFileUrl };
}

export function primaryFileUrl(urls: FileSlotUrls): string | null {
  return urls.fullPaperFileUrl ?? urls.fullPaperWordFileUrl ?? urls.abstractFileUrl ?? urls.abstractWordFileUrl ?? null;
}

export function deriveLegacyRound1Fields(urls: FileSlotUrls): {
  round1FileUrl: string | null;
  round1FileType: "abstract" | "full_paper" | null;
} {
  if (urls.fullPaperFileUrl) {
    return { round1FileUrl: urls.fullPaperFileUrl, round1FileType: "full_paper" };
  }
  if (urls.abstractFileUrl) {
    return { round1FileUrl: urls.abstractFileUrl, round1FileType: "abstract" };
  }
  return { round1FileUrl: null, round1FileType: null };
}

export function areSlotUrlsEqual(a: FileSlotUrls, b: FileSlotUrls): boolean {
  return SLOT_KEYS.every((key) => (a[key] ?? null) === (b[key] ?? null));
}

export function parseAndValidateManagedSlotUrls(
  raw: unknown,
  currentSlots: FileSlotUrls,
  allowedUrls: Set<string>,
): { ok: true; urls: FileSlotUrls } | { ok: false; error: string } {
  if (raw === undefined) {
    return { ok: true, urls: { ...currentSlots } };
  }

  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ok: false, error: "ข้อมูลช่องไฟล์ (slotUrls) ไม่ถูกต้อง" };
    }
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "ข้อมูลช่องไฟล์ (slotUrls) ต้องเป็น Object" };
  }

  const record = parsed as Record<string, unknown>;
  const next: FileSlotUrls = {
    abstractFileUrl: currentSlots.abstractFileUrl,
    abstractWordFileUrl: currentSlots.abstractWordFileUrl,
    fullPaperFileUrl: currentSlots.fullPaperFileUrl,
    fullPaperWordFileUrl: currentSlots.fullPaperWordFileUrl,
  };

  for (const key of SLOT_KEYS) {
    if (!(key in record)) continue;
    const val = record[key];
    if (val === null || val === "") {
      next[key] = null;
      continue;
    }
    if (typeof val !== "string" || !allowedUrls.has(val)) {
      return { ok: false, error: `ไม่อนุญาตให้กำหนด URL ที่ไม่ใช่ไฟล์ของผลงานนี้ในช่อง ${SLOT_LABELS[key]}` };
    }
    const ext = getExtensionFromName(val);
    const isPdfSlot = key === "abstractFileUrl" || key === "fullPaperFileUrl";
    if (isPdfSlot && ext !== "pdf") {
      return { ok: false, error: `ช่อง ${SLOT_LABELS[key]} รองรับเฉพาะไฟล์ .pdf` };
    }
    if (!isPdfSlot && !["doc", "docx"].includes(ext)) {
      return { ok: false, error: `ช่อง ${SLOT_LABELS[key]} รองรับเฉพาะไฟล์ .doc หรือ .docx` };
    }
    next[key] = val;
  }

  return { ok: true, urls: next };
}

export function describeAdminFileChanges(
  before: FileSlotUrls,
  after: FileSlotUrls,
  uploaded: FileSlotUrls,
): string {
  const afterValues = new Set(Object.values(after).filter((v): v is string => Boolean(v)));
  const actions: string[] = [];
  for (const key of SLOT_KEYS) {
    if (uploaded[key]) {
      actions.push(`อัปโหลด${SLOT_LABELS[key]}`);
    } else if (before[key] && !after[key] && !afterValues.has(before[key])) {
      actions.push(`ลบ${SLOT_LABELS[key]}`);
    } else if (before[key] !== after[key] && after[key]) {
      actions.push(`ย้ายไฟล์เข้า${SLOT_LABELS[key]}`);
    }
  }
  return actions.length
    ? `ผู้ดูแลระบบจัดการไฟล์: ${actions.join(", ")}`
    : "ผู้ดูแลระบบจัดการไฟล์ผลงาน";
}

export async function recordInitialSnapshot(sub: typeof submissions.$inferSelect, merged: FileSlotUrls) {
  const [existing] = await db
    .select({ id: submissionVersions.id })
    .from(submissionVersions)
    .where(and(eq(submissionVersions.submissionId, sub.id), eq(submissionVersions.version, 1)))
    .limit(1);

  const primary = primaryFileUrl(merged);
  if (existing) {
    await db
      .update(submissionVersions)
      .set({
        fileUrl: primary,
        abstractFileUrl: merged.abstractFileUrl,
        abstractWordFileUrl: merged.abstractWordFileUrl,
        fullPaperFileUrl: merged.fullPaperFileUrl,
        fullPaperWordFileUrl: merged.fullPaperWordFileUrl,
        submittedAt: new Date(),
      })
      .where(eq(submissionVersions.id, existing.id));
    return;
  }

  await db.insert(submissionVersions).values({
    id: crypto.randomUUID(),
    submissionId: sub.id,
    version: 1,
    kind: "initial",
    title: sub.title,
    titleEn: sub.titleEn,
    abstract: sub.abstract,
    keywords: sub.keywords,
    creators: sub.creators,
    track: sub.track,
    submitterType: sub.submitterType,
    educationLevel: sub.educationLevel,
    presentationFormat: sub.presentationFormat,
    fileUrl: primary,
    abstractFileUrl: merged.abstractFileUrl,
    abstractWordFileUrl: merged.abstractWordFileUrl,
    fullPaperFileUrl: merged.fullPaperFileUrl,
    fullPaperWordFileUrl: merged.fullPaperWordFileUrl,
    changelog: null,
    submittedAt: new Date(),
  });
}

export async function recordRevisionAndSnapshot(
  sub: typeof submissions.$inferSelect,
  changedSlots: FileSlotUrls,
  merged: FileSlotUrls,
  changelog: string | null,
) {
  const [latestRev] = await db
    .select({ version: revisions.version })
    .from(revisions)
    .where(eq(revisions.submissionId, sub.id))
    .orderBy(desc(revisions.version))
    .limit(1);

  const nextRevisionVersion = (latestRev?.version ?? 0) + 1;
  const revPrimary = primaryFileUrl(changedSlots) ?? primaryFileUrl(merged);

  if (revPrimary) {
    await db.insert(revisions).values({
      id: crypto.randomUUID(),
      submissionId: sub.id,
      version: nextRevisionVersion,
      fileUrl: revPrimary,
      abstractFileUrl: changedSlots.abstractFileUrl,
      abstractWordFileUrl: changedSlots.abstractWordFileUrl,
      fullPaperFileUrl: changedSlots.fullPaperFileUrl,
      fullPaperWordFileUrl: changedSlots.fullPaperWordFileUrl,
      changelog,
    });
  }

  const [latestSnapshot] = await db
    .select({
      id: submissionVersions.id,
      version: submissionVersions.version,
      kind: submissionVersions.kind,
      changelog: submissionVersions.changelog,
    })
    .from(submissionVersions)
    .where(eq(submissionVersions.submissionId, sub.id))
    .orderBy(desc(submissionVersions.version))
    .limit(1);

  if (!latestSnapshot) {
    const initialUrls = resolveCurrentSlotUrls(sub);
    await db.insert(submissionVersions).values({
      id: crypto.randomUUID(),
      submissionId: sub.id,
      version: 1,
      kind: "initial",
      title: sub.title,
      titleEn: sub.titleEn,
      abstract: sub.abstract,
      keywords: sub.keywords,
      creators: sub.creators,
      track: sub.track,
      submitterType: sub.submitterType,
      educationLevel: sub.educationLevel,
      presentationFormat: sub.presentationFormat,
      fileUrl: primaryFileUrl(initialUrls),
      abstractFileUrl: initialUrls.abstractFileUrl,
      abstractWordFileUrl: initialUrls.abstractWordFileUrl,
      fullPaperFileUrl: initialUrls.fullPaperFileUrl,
      fullPaperWordFileUrl: initialUrls.fullPaperWordFileUrl,
      changelog: null,
      submittedAt: sub.submittedAt ?? new Date(),
    });
  }

  let targetVersionId: string;
  if (
    latestSnapshot &&
    latestSnapshot.kind === "revision" &&
    latestSnapshot.changelog === "แก้ไขข้อมูล/บทคัดย่อ" &&
    latestSnapshot.version >= nextRevisionVersion + 1
  ) {
    targetVersionId = latestSnapshot.id;
    await db
      .update(submissionVersions)
      .set({
        title: sub.title,
        titleEn: sub.titleEn,
        abstract: sub.abstract,
        keywords: sub.keywords,
        creators: sub.creators,
        track: sub.track,
        submitterType: sub.submitterType,
        educationLevel: sub.educationLevel,
        presentationFormat: sub.presentationFormat,
        fileUrl: primaryFileUrl(merged),
        abstractFileUrl: merged.abstractFileUrl,
        abstractWordFileUrl: merged.abstractWordFileUrl,
        fullPaperFileUrl: merged.fullPaperFileUrl,
        fullPaperWordFileUrl: merged.fullPaperWordFileUrl,
        changelog,
        submittedAt: new Date(),
      })
      .where(eq(submissionVersions.id, latestSnapshot.id));
  } else {
    const snapshotVersion = Math.max((latestSnapshot?.version ?? 1) + 1, nextRevisionVersion + 1);
    targetVersionId = crypto.randomUUID();
    await db.insert(submissionVersions).values({
      id: targetVersionId,
      submissionId: sub.id,
      version: snapshotVersion,
      kind: "revision",
      title: sub.title,
      titleEn: sub.titleEn,
      abstract: sub.abstract,
      keywords: sub.keywords,
      creators: sub.creators,
      track: sub.track,
      submitterType: sub.submitterType,
      educationLevel: sub.educationLevel,
      presentationFormat: sub.presentationFormat,
      fileUrl: primaryFileUrl(merged),
      abstractFileUrl: merged.abstractFileUrl,
      abstractWordFileUrl: merged.abstractWordFileUrl,
      fullPaperFileUrl: merged.fullPaperFileUrl,
      fullPaperWordFileUrl: merged.fullPaperWordFileUrl,
      changelog,
      submittedAt: new Date(),
    });
  }

  await db
    .update(reviewRounds)
    .set({ submissionVersionId: targetVersionId })
    .where(and(eq(reviewRounds.submissionId, sub.id), ne(reviewRounds.status, "released")));

  return nextRevisionVersion;
}

export type AuthorUpdateSlot = "abstractPdf" | "abstractWord" | "fullPaperPdf" | "fullPaperWord" | "metadata";

export interface AuthorUpdateTrackingFields {
  authorUpdatedAt: Date;
  authorUpdateSummary: string;
  authorUpdatedSlots: string;
}

const AUTHOR_UPDATE_SLOT_ORDER: AuthorUpdateSlot[] = [
  "abstractPdf",
  "abstractWord",
  "fullPaperPdf",
  "fullPaperWord",
  "metadata",
];

const AUTHOR_UPDATE_FILE_LABELS: Record<Exclude<AuthorUpdateSlot, "metadata">, string> = {
  abstractPdf: "บทคัดย่อ (PDF)",
  abstractWord: "บทคัดย่อ (Word)",
  fullPaperPdf: "ฉบับสมบูรณ์ (PDF)",
  fullPaperWord: "ฉบับสมบูรณ์ (Word)",
};

export function parseAuthorUpdatedSlots(raw: string | null | undefined): AuthorUpdateSlot[] {
  if (!raw || typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const set = new Set<string>(parsed.filter((item): item is string => typeof item === "string"));
    return AUTHOR_UPDATE_SLOT_ORDER.filter((slot) => set.has(slot));
  } catch {
    return [];
  }
}

export function hasUnreadAuthorUpdate(sub: {
  authorUpdatedAt: Date | string | null;
  adminSeenAt: Date | string | null;
}): boolean {
  if (!sub.authorUpdatedAt) return false;
  const updatedTime = new Date(sub.authorUpdatedAt).getTime();
  if (Number.isNaN(updatedTime)) return false;
  if (!sub.adminSeenAt) return true;
  const seenTime = new Date(sub.adminSeenAt).getTime();
  if (Number.isNaN(seenTime)) return true;
  return updatedTime > seenTime;
}

export function formatAuthorUpdateSummary(slots: AuthorUpdateSlot[]): string {
  const canonical = AUTHOR_UPDATE_SLOT_ORDER.filter((slot) => slots.includes(slot));
  const fileLabels = canonical
    .filter((slot): slot is Exclude<AuthorUpdateSlot, "metadata"> => slot !== "metadata")
    .map((slot) => AUTHOR_UPDATE_FILE_LABELS[slot]);
  const hasMetadata = canonical.includes("metadata");

  if (fileLabels.length > 0 && hasMetadata) {
    return `อัปเดตไฟล์${fileLabels.join(", ")} และแก้ไขข้อมูลบทคัดย่อ`;
  }
  if (fileLabels.length > 0) {
    return `อัปเดตไฟล์${fileLabels.join(", ")}`;
  }
  if (hasMetadata) {
    return "แก้ไขข้อมูล/บทคัดย่อ";
  }
  return "";
}

export function detectUploadedAuthorSlots(files: FileSlotInputs): AuthorUpdateSlot[] {
  const slots: AuthorUpdateSlot[] = [];
  if (files.abstractPdf) slots.push("abstractPdf");
  if (files.abstractWord) slots.push("abstractWord");
  if (files.fullPaperPdf) slots.push("fullPaperPdf");
  if (files.fullPaperWord) slots.push("fullPaperWord");
  return slots;
}

export function buildAuthorUpdateTracking(
  sub: {
    authorUpdatedAt: Date | string | null;
    adminSeenAt: Date | string | null;
    authorUpdatedSlots: string | null;
  },
  newSlots: AuthorUpdateSlot[],
  now: Date = new Date(),
): AuthorUpdateTrackingFields | null {
  const validNew = AUTHOR_UPDATE_SLOT_ORDER.filter((slot) => newSlots.includes(slot));
  if (validNew.length === 0) return null;

  const previousSlots = hasUnreadAuthorUpdate(sub)
    ? parseAuthorUpdatedSlots(sub.authorUpdatedSlots)
    : [];
  const mergedSet = new Set<AuthorUpdateSlot>([...previousSlots, ...validNew]);
  const mergedSlots = AUTHOR_UPDATE_SLOT_ORDER.filter((slot) => mergedSet.has(slot));

  return {
    authorUpdatedAt: now,
    authorUpdateSummary: formatAuthorUpdateSummary(mergedSlots),
    authorUpdatedSlots: JSON.stringify(mergedSlots),
  };
}

export type SubmissionMetadataSnapshot = Pick<
  typeof submissions.$inferSelect,
  | "title"
  | "titleEn"
  | "abstract"
  | "keywords"
  | "creators"
  | "track"
  | "submitterType"
  | "educationLevel"
  | "presentationFormat"
  | "wantsFullPaper"
  | "round1FileType"
>;

export function hasSubmissionMetadataChanged(
  before: SubmissionMetadataSnapshot,
  after: SubmissionMetadataSnapshot,
): boolean {
  const norm = (val: string | null | undefined) => (val ?? "").trim();
  if (norm(before.title) !== norm(after.title)) return true;
  if (norm(before.titleEn) !== norm(after.titleEn)) return true;
  if (norm(before.abstract) !== norm(after.abstract)) return true;
  if (norm(before.keywords) !== norm(after.keywords)) return true;
  if (norm(before.creators) !== norm(after.creators)) return true;
  if (before.track !== after.track) return true;
  if (before.submitterType !== after.submitterType) return true;
  if (before.educationLevel !== after.educationLevel) return true;
  if (before.presentationFormat !== after.presentationFormat) return true;
  if (before.wantsFullPaper !== after.wantsFullPaper) return true;
  if ((before.round1FileType ?? null) !== (after.round1FileType ?? null)) return true;
  return false;
}

export async function recordMetadataRevisionSnapshot(
  before: typeof submissions.$inferSelect,
  after: typeof submissions.$inferSelect,
  changelog = "แก้ไขข้อมูล/บทคัดย่อ",
): Promise<void> {
  const afterUrls = resolveCurrentSlotUrls(after);
  const [[latestSnapshot], [latestRev]] = await Promise.all([
    db
      .select({
        id: submissionVersions.id,
        version: submissionVersions.version,
        kind: submissionVersions.kind,
        changelog: submissionVersions.changelog,
      })
      .from(submissionVersions)
      .where(eq(submissionVersions.submissionId, after.id))
      .orderBy(desc(submissionVersions.version))
      .limit(1),
    db
      .select({ version: revisions.version })
      .from(revisions)
      .where(eq(revisions.submissionId, after.id))
      .orderBy(desc(revisions.version))
      .limit(1),
  ]);

  if (!latestSnapshot) {
    const beforeUrls = resolveCurrentSlotUrls(before);
    await db.insert(submissionVersions).values({
      id: crypto.randomUUID(),
      submissionId: before.id,
      version: 1,
      kind: "initial",
      title: before.title,
      titleEn: before.titleEn,
      abstract: before.abstract,
      keywords: before.keywords,
      creators: before.creators,
      track: before.track,
      submitterType: before.submitterType,
      educationLevel: before.educationLevel,
      presentationFormat: before.presentationFormat,
      fileUrl: primaryFileUrl(beforeUrls),
      abstractFileUrl: beforeUrls.abstractFileUrl,
      abstractWordFileUrl: beforeUrls.abstractWordFileUrl,
      fullPaperFileUrl: beforeUrls.fullPaperFileUrl,
      fullPaperWordFileUrl: beforeUrls.fullPaperWordFileUrl,
      changelog: null,
      submittedAt: before.submittedAt ?? new Date(),
    });
  }

  let targetVersionId: string;
  if (
    latestSnapshot &&
    latestSnapshot.kind === "revision" &&
    latestSnapshot.changelog === "แก้ไขข้อมูล/บทคัดย่อ" &&
    latestSnapshot.version > (latestRev?.version ?? 0) + 1
  ) {
    targetVersionId = latestSnapshot.id;
    await db
      .update(submissionVersions)
      .set({
        title: after.title,
        titleEn: after.titleEn,
        abstract: after.abstract,
        keywords: after.keywords,
        creators: after.creators,
        track: after.track,
        submitterType: after.submitterType,
        educationLevel: after.educationLevel,
        presentationFormat: after.presentationFormat,
        fileUrl: primaryFileUrl(afterUrls),
        abstractFileUrl: afterUrls.abstractFileUrl,
        abstractWordFileUrl: afterUrls.abstractWordFileUrl,
        fullPaperFileUrl: afterUrls.fullPaperFileUrl,
        fullPaperWordFileUrl: afterUrls.fullPaperWordFileUrl,
        changelog,
        submittedAt: new Date(),
      })
      .where(eq(submissionVersions.id, latestSnapshot.id));
  } else {
    const snapshotVersion = (latestSnapshot?.version ?? 1) + 1;
    targetVersionId = crypto.randomUUID();
    await db.insert(submissionVersions).values({
      id: targetVersionId,
      submissionId: after.id,
      version: snapshotVersion,
      kind: "revision",
      title: after.title,
      titleEn: after.titleEn,
      abstract: after.abstract,
      keywords: after.keywords,
      creators: after.creators,
      track: after.track,
      submitterType: after.submitterType,
      educationLevel: after.educationLevel,
      presentationFormat: after.presentationFormat,
      fileUrl: primaryFileUrl(afterUrls),
      abstractFileUrl: afterUrls.abstractFileUrl,
      abstractWordFileUrl: afterUrls.abstractWordFileUrl,
      fullPaperFileUrl: afterUrls.fullPaperFileUrl,
      fullPaperWordFileUrl: afterUrls.fullPaperWordFileUrl,
      changelog,
      submittedAt: new Date(),
    });
  }

  await db
    .update(reviewRounds)
    .set({ submissionVersionId: targetVersionId })
    .where(and(eq(reviewRounds.submissionId, after.id), ne(reviewRounds.status, "released")));
}

let ensureSubmissionUpdateColumnsPromise: Promise<void> | null = null;

export function ensureSubmissionUpdateColumns(): Promise<void> {
  if (!ensureSubmissionUpdateColumnsPromise) {
    ensureSubmissionUpdateColumnsPromise = (async () => {
      const result = await db.execute(sql`
        SELECT COLUMN_NAME AS columnName
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'submissions'
      `);
      const rows = (Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result) as Array<{
        columnName?: string;
        COLUMN_NAME?: string;
      }>;
      const existing = new Set(
        (Array.isArray(rows) ? rows : [])
          .map((row) => (row.columnName ?? row.COLUMN_NAME ?? "").toLowerCase())
          .filter(Boolean),
      );

      if (!existing.has("author_updated_at")) {
        await db.execute(sql`ALTER TABLE \`submissions\` ADD COLUMN \`author_updated_at\` timestamp NULL DEFAULT NULL`);
      }
      if (!existing.has("author_update_summary")) {
        await db.execute(sql`ALTER TABLE \`submissions\` ADD COLUMN \`author_update_summary\` varchar(500) DEFAULT NULL`);
      }
      if (!existing.has("author_updated_slots")) {
        await db.execute(sql`ALTER TABLE \`submissions\` ADD COLUMN \`author_updated_slots\` varchar(255) DEFAULT NULL`);
      }
      if (!existing.has("admin_seen_at")) {
        await db.execute(sql`ALTER TABLE \`submissions\` ADD COLUMN \`admin_seen_at\` timestamp NULL DEFAULT NULL`);
      }

      await backfillHistoricalAuthorUpdates();
    })().catch((err) => {
      ensureSubmissionUpdateColumnsPromise = null;
      throw err;
    });
  }
  return ensureSubmissionUpdateColumnsPromise;
}

async function backfillHistoricalAuthorUpdates(): Promise<void> {
  const allRevs = await db
    .select({
      submissionId: revisions.submissionId,
      fileUrl: revisions.fileUrl,
      abstractFileUrl: revisions.abstractFileUrl,
      abstractWordFileUrl: revisions.abstractWordFileUrl,
      fullPaperFileUrl: revisions.fullPaperFileUrl,
      fullPaperWordFileUrl: revisions.fullPaperWordFileUrl,
      changelog: revisions.changelog,
      submittedAt: revisions.submittedAt,
    })
    .from(revisions)
    .orderBy(revisions.version);

  if (allRevs.length === 0) return;

  const candidateSubIds = [...new Set(allRevs.map((r) => r.submissionId))];
  const subs = await db
    .select({
      id: submissions.id,
      status: submissions.status,
      updatedAt: submissions.updatedAt,
      authorUpdatedAt: submissions.authorUpdatedAt,
      adminSeenAt: submissions.adminSeenAt,
    })
    .from(submissions);

  const subById = new Map(subs.map((s) => [s.id, s]));

  const revsBySub = new Map<string, typeof allRevs>();
  for (const rev of allRevs) {
    if (rev.changelog?.startsWith("ผู้ดูแลระบบจัดการไฟล์")) continue;
    const list = revsBySub.get(rev.submissionId) ?? [];
    list.push(rev);
    revsBySub.set(rev.submissionId, list);
  }

  for (const subId of candidateSubIds) {
    const sub = subById.get(subId);
    if (!sub || sub.status === "draft" || sub.authorUpdatedAt || sub.adminSeenAt) continue;
    const subRevs = revsBySub.get(subId);
    if (!subRevs || subRevs.length === 0) continue;

    const slotSet = new Set<AuthorUpdateSlot>();
    let latestAt: Date | null = null;

    for (const rev of subRevs) {
      let matchedSpecific = false;
      if (rev.abstractFileUrl) {
        slotSet.add("abstractPdf");
        matchedSpecific = true;
      }
      if (rev.abstractWordFileUrl) {
        slotSet.add("abstractWord");
        matchedSpecific = true;
      }
      if (rev.fullPaperFileUrl) {
        slotSet.add("fullPaperPdf");
        matchedSpecific = true;
      }
      if (rev.fullPaperWordFileUrl) {
        slotSet.add("fullPaperWord");
        matchedSpecific = true;
      }
      if (!matchedSpecific && rev.fileUrl) {
        const lower = rev.fileUrl.toLowerCase();
        if (lower.includes("abstract-word")) slotSet.add("abstractWord");
        else if (lower.includes("fullpaper-word")) slotSet.add("fullPaperWord");
        else if (lower.includes("abstract")) slotSet.add("abstractPdf");
        else slotSet.add("fullPaperPdf");
      }
      if (rev.submittedAt && (!latestAt || rev.submittedAt.getTime() > latestAt.getTime())) {
        latestAt = rev.submittedAt;
      }
    }

    const orderedSlots = AUTHOR_UPDATE_SLOT_ORDER.filter((slot) => slotSet.has(slot));
    if (orderedSlots.length === 0 || !latestAt) continue;

    await db
      .update(submissions)
      .set({
        authorUpdatedAt: latestAt,
        authorUpdateSummary: formatAuthorUpdateSummary(orderedSlots),
        authorUpdatedSlots: JSON.stringify(orderedSlots),
        updatedAt: sub.updatedAt,
      })
      .where(eq(submissions.id, subId));
  }
}
