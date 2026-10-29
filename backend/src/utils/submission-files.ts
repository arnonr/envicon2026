import { and, desc, eq, ne } from "drizzle-orm";
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
    .select({ version: submissionVersions.version })
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

  const snapshotVersion = Math.max((latestSnapshot?.version ?? 1) + 1, nextRevisionVersion + 1);
  const newVersionId = crypto.randomUUID();
  await db.insert(submissionVersions).values({
    id: newVersionId,
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

  await db
    .update(reviewRounds)
    .set({ submissionVersionId: newVersionId })
    .where(and(eq(reviewRounds.submissionId, sub.id), ne(reviewRounds.status, "released")));

  return nextRevisionVersion;
}
