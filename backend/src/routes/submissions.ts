import { Elysia, t } from "elysia";
import { db } from "../db";
import { reviewRounds, reviews, submissions, revisions, submissionVersions } from "../db/schema";
import { and, eq, desc, inArray, ne, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { ok, fail } from "../utils/response";
import { saveFile, storedFileExists } from "../services/storage";
import {
  syncEventRegistrationToUserSubmissions,
  syncSubmissionPaymentToEventRegistration,
} from "../services/event-registration-sync";
import { canEdit, canRevise, canCameraReady, canReplaceFile, canUpdateFiles, statusAfterReviseUpload } from "../utils/submission-status";

const MAX_CREATORS = 20;

interface FileSlotInputs {
  abstractPdf?: File;
  abstractWord?: File;
  fullPaperPdf?: File;
  fullPaperWord?: File;
}

interface FileSlotUrls {
  abstractFileUrl: string | null;
  abstractWordFileUrl: string | null;
  fullPaperFileUrl: string | null;
  fullPaperWordFileUrl: string | null;
}

function resolveCurrentSlotUrls(sub: typeof submissions.$inferSelect): FileSlotUrls {
  return {
    abstractFileUrl: sub.abstractFileUrl ?? (sub.round1FileType === "abstract" ? sub.round1FileUrl : null),
    abstractWordFileUrl: sub.abstractWordFileUrl ?? null,
    fullPaperFileUrl: sub.fullPaperFileUrl ?? (sub.round1FileType === "full_paper" ? sub.round1FileUrl : null),
    fullPaperWordFileUrl: sub.fullPaperWordFileUrl ?? null,
  };
}

function getFileExtension(file: File): string {
  return (file.name?.split(".").pop() ?? "").toLowerCase();
}

function validateSlotFiles(files: FileSlotInputs): string | null {
  if (files.abstractPdf && getFileExtension(files.abstractPdf) !== "pdf") {
    return "ไฟล์บทคัดย่อ (PDF) ต้องเป็นนามสกุล .pdf เท่านั้น";
  }
  if (files.fullPaperPdf && getFileExtension(files.fullPaperPdf) !== "pdf") {
    return "ไฟล์บทความฉบับสมบูรณ์ (PDF) ต้องเป็นนามสกุล .pdf เท่านั้น";
  }
  if (files.abstractWord && !["doc", "docx"].includes(getFileExtension(files.abstractWord))) {
    return "ไฟล์บทคัดย่อ (Word) ต้องเป็นนามสกุล .doc หรือ .docx เท่านั้น";
  }
  if (files.fullPaperWord && !["doc", "docx"].includes(getFileExtension(files.fullPaperWord))) {
    return "ไฟล์บทความฉบับสมบูรณ์ (Word) ต้องเป็นนามสกุล .doc หรือ .docx เท่านั้น";
  }
  return null;
}

async function saveSlotFiles(submissionId: string, tag: string, files: FileSlotInputs): Promise<FileSlotUrls> {
  const [abstractFileUrl, abstractWordFileUrl, fullPaperFileUrl, fullPaperWordFileUrl] = await Promise.all([
    files.abstractPdf ? saveFile(files.abstractPdf, `abstract-pdf-${submissionId}-${tag}`) : Promise.resolve(null),
    files.abstractWord ? saveFile(files.abstractWord, `abstract-word-${submissionId}-${tag}`) : Promise.resolve(null),
    files.fullPaperPdf ? saveFile(files.fullPaperPdf, `fullpaper-pdf-${submissionId}-${tag}`) : Promise.resolve(null),
    files.fullPaperWord ? saveFile(files.fullPaperWord, `fullpaper-word-${submissionId}-${tag}`) : Promise.resolve(null),
  ]);
  return { abstractFileUrl, abstractWordFileUrl, fullPaperFileUrl, fullPaperWordFileUrl };
}

function primaryFileUrl(urls: FileSlotUrls): string | null {
  return urls.fullPaperFileUrl ?? urls.fullPaperWordFileUrl ?? urls.abstractFileUrl ?? urls.abstractWordFileUrl ?? null;
}

async function recordInitialSnapshot(sub: typeof submissions.$inferSelect, merged: FileSlotUrls) {
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

async function recordRevisionAndSnapshot(
  sub: typeof submissions.$inferSelect,
  uploaded: FileSlotUrls,
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
  const revPrimary = primaryFileUrl(uploaded) ?? primaryFileUrl(merged) ?? "";

  await db.insert(revisions).values({
    id: crypto.randomUUID(),
    submissionId: sub.id,
    version: nextRevisionVersion,
    fileUrl: revPrimary,
    abstractFileUrl: uploaded.abstractFileUrl,
    abstractWordFileUrl: uploaded.abstractWordFileUrl,
    fullPaperFileUrl: uploaded.fullPaperFileUrl,
    fullPaperWordFileUrl: uploaded.fullPaperWordFileUrl,
    changelog,
  });

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
  await db.insert(submissionVersions).values({
    id: crypto.randomUUID(),
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

  return nextRevisionVersion;
}

function parseCreators(raw: string | undefined): string | null {
  if (!raw) return null;
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error("creators must be valid JSON"); }
  if (!Array.isArray(parsed)) throw new Error("creators must be an array");
  if (parsed.length === 0) return null;
  if (parsed.length > MAX_CREATORS) throw new Error(`creators must have at most ${MAX_CREATORS} entries`);
  for (const c of parsed) {
    if (
      typeof c !== "object" || c === null ||
      typeof (c as Record<string, unknown>).firstName !== "string" ||
      typeof (c as Record<string, unknown>).lastName !== "string" ||
      typeof (c as Record<string, unknown>).affiliation !== "string"
    )
      throw new Error("each creator must have firstName, lastName, and affiliation");
  }
  return JSON.stringify(parsed);
}

export const submissionRoutes = new Elysia({ prefix: "/submissions" })
  .use(requireAuth)

  // List: authors see only their own submissions.
  .get("/", async ({ user, set }) => {
    if (user!.role !== "author") {
      set.status = 403;
      return fail("FORBIDDEN", "Submitter dashboard is only available to authors");
    }

    await syncEventRegistrationToUserSubmissions(user!.id, user!.email);

    const own = await db
      .select()
      .from(submissions)
      .where(eq(submissions.authorId, user!.id))
      .orderBy(desc(submissions.updatedAt));
    const submissionIds = own.map((s) => s.id);
    const maxRounds = submissionIds.length
      ? await db
        .select({
          submissionId: reviewRounds.submissionId,
          maxRound: sql<number>`MAX(${reviewRounds.roundNumber})`.as("max_round"),
        })
        .from(reviewRounds)
        .where(inArray(reviewRounds.submissionId, submissionIds))
        .groupBy(reviewRounds.submissionId)
      : [];
    const roundBySubmission = new Map(maxRounds.map((row) => [row.submissionId, row.maxRound ?? 0]));
    return ok(own.map((s) => ({
      ...s,
      ...resolveCurrentSlotUrls(s),
      currentRoundNumber: roundBySubmission.get(s.id) ?? 0,
    })));
  })

  // Get by ID (with revisions)
  .get("/:id", async ({ params, user, set }) => {
    if (user!.role === "author") {
      await syncEventRegistrationToUserSubmissions(user!.id, user!.email);
    }

    const [sub] = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, params.id))
      .limit(1);

    if (!sub) {
      set.status = 404;
      return fail("NOT_FOUND", "Submission not found");
    }

    if (user!.role !== "admin" && sub.authorId !== user!.id) {
      set.status = 403;
      return fail("FORBIDDEN", "Access denied");
    }

    const revisionRows = await db
      .select()
      .from(revisions)
      .where(eq(revisions.submissionId, params.id))
      .orderBy(desc(revisions.version));
    const revisionList = await Promise.all(revisionRows.map(async (revision) => ({
      ...revision,
      fileAvailable: await storedFileExists(revision.fileUrl),
      abstractFileAvailable: await storedFileExists(revision.abstractFileUrl),
      abstractWordFileAvailable: await storedFileExists(revision.abstractWordFileUrl),
      fullPaperFileAvailable: await storedFileExists(revision.fullPaperFileUrl),
      fullPaperWordFileAvailable: await storedFileExists(revision.fullPaperWordFileUrl),
    })));

    const [releasedRound] = await db
      .select({
        id: reviewRounds.id,
        decision: reviewRounds.decision,
        adminNote: reviewRounds.adminNote,
        releasedAt: reviewRounds.releasedAt,
      })
      .from(reviewRounds)
      .where(and(eq(reviewRounds.submissionId, params.id), eq(reviewRounds.status, "released")))
      .orderBy(desc(reviewRounds.roundNumber))
      .limit(1);
    const releasedComments = releasedRound?.releasedAt
      ? await db
        .select({ commentsToAuthor: reviews.commentsToAuthor })
        .from(reviews)
        .where(eq(reviews.roundId, releasedRound.id))
      : [];

    const roundSummaries = await db
      .select({
        id: reviewRounds.id,
        roundNumber: reviewRounds.roundNumber,
        status: reviewRounds.status,
        decision: reviewRounds.decision,
        adminNote: reviewRounds.adminNote,
        releasedAt: reviewRounds.releasedAt,
      })
      .from(reviewRounds)
      .where(eq(reviewRounds.submissionId, params.id))
      .orderBy(reviewRounds.roundNumber);
    const currentRoundNumber = roundSummaries.length
      ? Math.max(...roundSummaries.map((r) => r.roundNumber))
      : 0;

    const latestRevision = revisionList[0] ?? null;
    const dispatchedInOpenRound = latestRevision && canReplaceFile(sub.status)
      ? await db
        .select({ id: reviews.id })
        .from(reviews)
        .innerJoin(reviewRounds, eq(reviews.roundId, reviewRounds.id))
        .where(and(
          eq(reviews.submissionId, params.id),
          ne(reviews.status, "assigned"),
          ne(reviewRounds.status, "released"),
        ))
        .limit(1)
      : [];

    const resolvedSlots = resolveCurrentSlotUrls(sub);

    return ok({
      ...sub,
      ...resolvedSlots,
      revisions: revisionList,
      currentRoundNumber,
      rounds: roundSummaries,
      canUpdateFiles: user!.role === "author"
        && sub.authorId === user!.id
        && canUpdateFiles(sub.status),
      canReplaceLatestRevisionFile: user!.role === "author"
        && sub.authorId === user!.id
        && canReplaceFile(sub.status)
        && Boolean(latestRevision && !latestRevision.fileAvailable)
        && dispatchedInOpenRound.length === 0,
      releasedResult: releasedRound?.releasedAt
        ? {
          decision: releasedRound.decision,
          adminNote: releasedRound.adminNote,
          releasedAt: releasedRound.releasedAt,
          commentsToAuthor: releasedComments.map((review) => review.commentsToAuthor).filter(Boolean),
        }
        : null,
    });
  })

  // Create draft submission
  .post(
    "/",
    async ({ body, user, set }) => {
      if (user!.role !== "author") {
        set.status = 403;
        return fail("FORBIDDEN", "Only authors can create submissions");
      }

      // Limit to 1 submission per author
      const [existing] = await db
        .select({ id: submissions.id })
        .from(submissions)
        .where(eq(submissions.authorId, user!.id))
        .limit(1);

      if (existing) {
        set.status = 400;
        return fail("LIMIT_REACHED", "ส่งผลงานได้เพียง 1 ผลงานเท่านั้น");
      }

      const id = crypto.randomUUID();
      const creators = parseCreators(body.creators);
      await db.insert(submissions).values({
        id,
        authorId: user!.id,
        title: body.title,
        titleEn: body.titleEn ?? null,
        abstract: body.abstract ?? null,
        keywords: body.keywords ?? null,
        creators,
        track: body.track,
        submitterType: body.submitterType,
        educationLevel: body.educationLevel,
        presentationFormat: body.presentationFormat,
        wantsFullPaper: body.wantsFullPaper ? 1 : 0,
        receiptName: body.receiptName ?? null,
        receiptTaxId: body.receiptTaxId ?? null,
        receiptAddress: body.receiptAddress ?? null,
      });

      await syncEventRegistrationToUserSubmissions(user!.id, user!.email);

      const [sub] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, id))
        .limit(1);

      set.status = 201;
      return ok(sub);
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1 }),
        titleEn: t.Optional(t.String()),
        abstract: t.Optional(t.String()),
        keywords: t.Optional(t.String()),
        creators: t.Optional(t.String()),
        track: t.Number({ minimum: 1, maximum: 7 }),
        submitterType: t.Union([t.Literal("student"), t.Literal("general")]),
        educationLevel: t.Union([t.Literal("bachelor"), t.Literal("master"), t.Literal("doctorate")]),
        presentationFormat: t.Union([t.Literal("oral"), t.Literal("poster")]),
        wantsFullPaper: t.Optional(t.Boolean()),
        receiptName: t.Optional(t.String()),
        receiptTaxId: t.Optional(t.String()),
        receiptAddress: t.Optional(t.String()),
      }),
    }
  )

  // Replace a missing revised PDF before review has started.
  .post(
    "/:id/revisions/latest/replace-file",
    async ({ params, body, user, set }) => {
      const [sub] = await db.select().from(submissions).where(eq(submissions.id, params.id)).limit(1);
      if (!sub) {
        set.status = 404;
        return fail("NOT_FOUND", "Submission not found");
      }
      if (sub.authorId !== user!.id) {
        set.status = 403;
        return fail("FORBIDDEN", "Access denied");
      }
      if (!canReplaceFile(sub.status)) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "Submission is not awaiting review");
      }

      const [latestRevision] = await db
        .select()
        .from(revisions)
        .where(eq(revisions.submissionId, params.id))
        .orderBy(desc(revisions.version))
        .limit(1);
      if (!latestRevision || await storedFileExists(latestRevision.fileUrl)) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "Latest revision file does not require replacement");
      }
      const dispatched = await db
        .select({ id: reviews.id })
        .from(reviews)
        .innerJoin(reviewRounds, eq(reviews.roundId, reviewRounds.id))
        .where(and(
          eq(reviews.submissionId, params.id),
          ne(reviews.status, "assigned"),
          ne(reviewRounds.status, "released"),
        ))
        .limit(1);
      if (dispatched.length) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "Cannot replace the file after review has started");
      }

      const fileUrl = await saveFile(body.file, `revision-${params.id}-v${latestRevision.version}`);
      await db.update(revisions).set({ fileUrl }).where(eq(revisions.id, latestRevision.id));
      await db.update(submissions).set({ fullPaperFileUrl: fileUrl }).where(eq(submissions.id, params.id));
      const [latestVersion] = await db
        .select({ id: submissionVersions.id })
        .from(submissionVersions)
        .where(eq(submissionVersions.submissionId, params.id))
        .orderBy(desc(submissionVersions.version))
        .limit(1);
      if (latestVersion) {
        await db.update(submissionVersions).set({ fileUrl }).where(eq(submissionVersions.id, latestVersion.id));
      }
      return ok({ replaced: true, fileUrl });
    },
    {
      body: t.Object({
        file: t.File({ type: "application/pdf", maxSize: 50 * 1024 * 1024 }),
      }),
    }
  )

  // Update submission (draft / revision_requested only)
  .put(
    "/:id",
    async ({ params, body, user, set }) => {
      const [sub] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);

      if (!sub) {
        set.status = 404;
        return fail("NOT_FOUND", "Submission not found");
      }
      if (sub.authorId !== user!.id) {
        set.status = 403;
        return fail("FORBIDDEN", "Access denied");
      }
      if (!canEdit(sub.status)) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "Cannot edit in current status");
      }

      await db
        .update(submissions)
        .set({
          ...(body.title && { title: body.title }),
          ...(body.titleEn !== undefined && { titleEn: body.titleEn }),
          ...(body.abstract !== undefined && { abstract: body.abstract }),
          ...(body.keywords !== undefined && { keywords: body.keywords }),
          ...(body.creators !== undefined && { creators: parseCreators(body.creators) }),
          ...(body.track && { track: body.track }),
          ...(body.submitterType && { submitterType: body.submitterType }),
          ...(body.educationLevel && { educationLevel: body.educationLevel }),
          ...(body.presentationFormat && { presentationFormat: body.presentationFormat }),
          ...(body.wantsFullPaper !== undefined && { wantsFullPaper: body.wantsFullPaper ? 1 : 0 }),
          ...(body.round1FileType && { round1FileType: body.round1FileType }),
          ...(body.receiptName !== undefined && { receiptName: body.receiptName }),
          ...(body.receiptTaxId !== undefined && { receiptTaxId: body.receiptTaxId }),
          ...(body.receiptAddress !== undefined && { receiptAddress: body.receiptAddress }),
        })
        .where(eq(submissions.id, params.id));

      const [updated] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);

      return ok(updated);
    },
    {
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1 })),
        titleEn: t.Optional(t.String()),
        abstract: t.Optional(t.String()),
        keywords: t.Optional(t.String()),
        creators: t.Optional(t.String()),
        track: t.Optional(t.Number({ minimum: 1, maximum: 7 })),
        submitterType: t.Optional(t.Union([t.Literal("student"), t.Literal("general")])),
        educationLevel: t.Optional(t.Union([t.Literal("bachelor"), t.Literal("master"), t.Literal("doctorate")])),
        presentationFormat: t.Optional(t.Union([t.Literal("oral"), t.Literal("poster")])),
        wantsFullPaper: t.Optional(t.Boolean()),
        round1FileType: t.Optional(t.Union([t.Literal("abstract"), t.Literal("full_paper")])),
        receiptName: t.Optional(t.String()),
        receiptTaxId: t.Optional(t.String()),
        receiptAddress: t.Optional(t.String()),
      }),
    }
  )

  // Upload or update any of the 4 file slots (Abstract PDF/Word, Full Paper PDF/Word)
  .post(
    "/:id/upload-files",
    async ({ params, body, user, set }) => {
      const [sub] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);

      if (!sub) {
        set.status = 404;
        return fail("NOT_FOUND", "Submission not found");
      }
      if (sub.authorId !== user!.id) {
        set.status = 403;
        return fail("FORBIDDEN", "Access denied");
      }
      if (!canUpdateFiles(sub.status)) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "ไม่สามารถอัปเดตไฟล์ในสถานะปัจจุบันได้");
      }

      const files: FileSlotInputs = {
        abstractPdf: body.abstractPdf,
        abstractWord: body.abstractWord,
        fullPaperPdf: body.fullPaperPdf,
        fullPaperWord: body.fullPaperWord,
      };
      if (!files.abstractPdf && !files.abstractWord && !files.fullPaperPdf && !files.fullPaperWord) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์");
      }

      const extError = validateSlotFiles(files);
      if (extError) {
        set.status = 400;
        return fail("VALIDATION_ERROR", extError);
      }

      const currentSlots = resolveCurrentSlotUrls(sub);
      const uploaded = await saveSlotFiles(params.id, sub.status === "draft" ? "r1" : "upd", files);
      const merged: FileSlotUrls = {
        abstractFileUrl: uploaded.abstractFileUrl ?? currentSlots.abstractFileUrl,
        abstractWordFileUrl: uploaded.abstractWordFileUrl ?? currentSlots.abstractWordFileUrl,
        fullPaperFileUrl: uploaded.fullPaperFileUrl ?? currentSlots.fullPaperFileUrl,
        fullPaperWordFileUrl: uploaded.fullPaperWordFileUrl ?? currentSlots.fullPaperWordFileUrl,
      };

      const hasFullPaper = Boolean(merged.fullPaperFileUrl || merged.fullPaperWordFileUrl);
      const round1FileType = hasFullPaper ? "full_paper" as const : "abstract" as const;
      const round1FileUrl = hasFullPaper
        ? (merged.fullPaperFileUrl ?? merged.fullPaperWordFileUrl)
        : (merged.abstractFileUrl ?? merged.abstractWordFileUrl);

      const isInitialSubmit = sub.status === "draft";
      await db
        .update(submissions)
        .set({
          abstractFileUrl: merged.abstractFileUrl,
          abstractWordFileUrl: merged.abstractWordFileUrl,
          fullPaperFileUrl: merged.fullPaperFileUrl,
          fullPaperWordFileUrl: merged.fullPaperWordFileUrl,
          round1FileUrl,
          round1FileType,
          ...(isInitialSubmit && {
            status: "submitted_round1",
            submittedAt: new Date(),
          }),
        })
        .where(eq(submissions.id, params.id));

      if (isInitialSubmit) {
        await recordInitialSnapshot(sub, merged);
      } else {
        await recordRevisionAndSnapshot(
          sub,
          uploaded,
          merged,
          body.changelog?.trim() || "อัปเดตไฟล์ผลงาน",
        );
      }

      const [updated] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);

      return ok({ ...updated!, ...resolveCurrentSlotUrls(updated!) });
    },
    {
      body: t.Object({
        abstractPdf: t.Optional(t.File({ maxSize: 50 * 1024 * 1024 })),
        abstractWord: t.Optional(t.File({ maxSize: 50 * 1024 * 1024 })),
        fullPaperPdf: t.Optional(t.File({ maxSize: 50 * 1024 * 1024 })),
        fullPaperWord: t.Optional(t.File({ maxSize: 50 * 1024 * 1024 })),
        changelog: t.Optional(t.String()),
      }),
    }
  )

  // Upload abstract PDF
  .post(
    "/:id/upload-abstract",
    async ({ params, body, user, set }) => {
      const [sub] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);

      if (!sub) {
        set.status = 404;
        return fail("NOT_FOUND", "Submission not found");
      }
      if (sub.authorId !== user!.id) {
        set.status = 403;
        return fail("FORBIDDEN", "Access denied");
      }
      if (sub.status !== "draft") {
        set.status = 400;
        return fail("VALIDATION_ERROR", "Cannot upload in current status");
      }

      const fileUrl = await saveFile(body.file, `abstract-${params.id}`);
      const currentSlots = resolveCurrentSlotUrls(sub);
      const merged: FileSlotUrls = { ...currentSlots, abstractFileUrl: fileUrl };

      await db
        .update(submissions)
        .set({ abstractFileUrl: fileUrl, round1FileUrl: fileUrl, round1FileType: "abstract", status: "submitted_round1", submittedAt: new Date() })
        .where(eq(submissions.id, params.id));

      await recordInitialSnapshot(sub, merged);

      const [updated] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);

      return ok(updated);
    },
    {
      body: t.Object({
        file: t.File({ type: "application/pdf", maxSize: 50 * 1024 * 1024 }),
      }),
    }
  )

  // Upload round-1 file (author chooses abstract-only or full paper)
  .post(
    "/:id/upload-round1-file",
    async ({ params, body, user, set }) => {
      const [sub] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);

      if (!sub) {
        set.status = 404;
        return fail("NOT_FOUND", "Submission not found");
      }
      if (sub.authorId !== user!.id) {
        set.status = 403;
        return fail("FORBIDDEN", "Access denied");
      }
      if (sub.status !== "draft") {
        set.status = 400;
        return fail("VALIDATION_ERROR", "Cannot upload in current status");
      }

      const fileUrl = await saveFile(body.file, `round1-${params.id}-${body.fileType}`);
      const currentSlots = resolveCurrentSlotUrls(sub);
      const merged: FileSlotUrls = {
        ...currentSlots,
        ...(body.fileType === "abstract" ? { abstractFileUrl: fileUrl } : { fullPaperFileUrl: fileUrl }),
      };
      await db
        .update(submissions)
        .set({
          round1FileUrl: fileUrl,
          round1FileType: body.fileType,
          ...(body.fileType === "abstract" ? { abstractFileUrl: fileUrl } : { fullPaperFileUrl: fileUrl }),
          status: "submitted_round1",
          submittedAt: new Date(),
        })
        .where(eq(submissions.id, params.id));

      await recordInitialSnapshot(sub, merged);

      const [updated] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);

      return ok(updated);
    },
    {
      body: t.Object({
        file: t.File({ type: "application/pdf", maxSize: 50 * 1024 * 1024 }),
        fileType: t.Union([t.Literal("abstract"), t.Literal("full_paper")]),
      }),
    }
  )

  // Upload camera-ready full paper PDF (only after acceptance)
  .post(
    "/:id/upload-paper",
    async ({ params, body, user, set }) => {
      const [sub] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);

      if (!sub) {
        set.status = 404;
        return fail("NOT_FOUND", "Submission not found");
      }
      if (sub.authorId !== user!.id) {
        set.status = 403;
        return fail("FORBIDDEN", "Access denied");
      }
      if (!canCameraReady(sub.status)) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "อัปโหลดบทความฉบับสมบูรณ์ได้หลังจากผลงานผ่านการพิจารณาแล้วเท่านั้น");
      }

      const fileUrl = await saveFile(body.file, `paper-${params.id}`);
      const currentSlots = resolveCurrentSlotUrls(sub);
      const uploaded: FileSlotUrls = {
        abstractFileUrl: null,
        abstractWordFileUrl: null,
        fullPaperFileUrl: fileUrl,
        fullPaperWordFileUrl: null,
      };
      const merged: FileSlotUrls = { ...currentSlots, fullPaperFileUrl: fileUrl };

      await db
        .update(submissions)
        .set({ fullPaperFileUrl: fileUrl })
        .where(eq(submissions.id, params.id));

      await recordRevisionAndSnapshot(sub, uploaded, merged, "อัปโหลดบทความฉบับสมบูรณ์ (Full Paper)");

      const [updated] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);

      return ok(updated);
    },
    {
      body: t.Object({
        file: t.File({ type: "application/pdf", maxSize: 50 * 1024 * 1024 }),
      }),
    }
  )

  // Upload payment slip
  .post(
    "/:id/upload-slip",
    async ({ params, body, user, set }) => {
      const [sub] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);

      if (!sub) {
        set.status = 404;
        return fail("NOT_FOUND", "Submission not found");
      }
      if (sub.authorId !== user!.id) {
        set.status = 403;
        return fail("FORBIDDEN", "Access denied");
      }
      if (sub.paymentStatus === "verified") {
        set.status = 400;
        return fail("VALIDATION_ERROR", "ชำระเงินเรียบร้อยแล้ว ไม่ต้องอัปโหลดเพิ่ม");
      }

      const fileUrl = await saveFile(body.file, `slip-${params.id}`);

      await db
        .update(submissions)
        .set({
          paymentSlipUrl: fileUrl,
          paymentStatus: "pending_verification",
          ...(body.receiptName !== undefined && { receiptName: body.receiptName }),
          ...(body.receiptTaxId !== undefined && { receiptTaxId: body.receiptTaxId }),
          ...(body.receiptAddress !== undefined && { receiptAddress: body.receiptAddress }),
        })
        .where(eq(submissions.id, params.id));

      const [updated] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);

      if (updated) {
        await syncSubmissionPaymentToEventRegistration(updated);
      }

      return ok(updated);
    },
    {
      body: t.Object({
        file: t.File({ type: ["application/pdf", "image/png", "image/jpeg"], maxSize: 10 * 1024 * 1024 }),
        receiptName: t.Optional(t.String()),
        receiptTaxId: t.Optional(t.String()),
        receiptAddress: t.Optional(t.String()),
      }),
    }
  )

  // Submit revision
  .post(
    "/:id/revise",
    async ({ params, body, user, set }) => {
      const [sub] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);

      if (!sub) {
        set.status = 404;
        return fail("NOT_FOUND", "Submission not found");
      }
      if (sub.authorId !== user!.id) {
        set.status = 403;
        return fail("FORBIDDEN", "Access denied");
      }
      if (!canRevise(sub.status)) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "Submission is not awaiting revision");
      }

      const files: FileSlotInputs = {
        abstractPdf: body.abstractPdf,
        abstractWord: body.abstractWord,
        fullPaperPdf: body.fullPaperPdf ?? body.file,
        fullPaperWord: body.fullPaperWord,
      };

      const extError = validateSlotFiles(files);
      if (extError) {
        set.status = 400;
        return fail("VALIDATION_ERROR", extError);
      }

      const currentSlots = resolveCurrentSlotUrls(sub);
      const hasNewFile = Boolean(files.abstractPdf || files.abstractWord || files.fullPaperPdf || files.fullPaperWord);
      const hasExistingFile = Boolean(
        currentSlots.abstractFileUrl || currentSlots.abstractWordFileUrl || currentSlots.fullPaperFileUrl || currentSlots.fullPaperWordFileUrl,
      );
      if (!hasNewFile && !hasExistingFile) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "กรุณาแนบไฟล์อย่างน้อย 1 ไฟล์");
      }

      const uploaded = await saveSlotFiles(params.id, "rev", files);
      const merged: FileSlotUrls = {
        abstractFileUrl: uploaded.abstractFileUrl ?? currentSlots.abstractFileUrl,
        abstractWordFileUrl: uploaded.abstractWordFileUrl ?? currentSlots.abstractWordFileUrl,
        fullPaperFileUrl: uploaded.fullPaperFileUrl ?? currentSlots.fullPaperFileUrl,
        fullPaperWordFileUrl: uploaded.fullPaperWordFileUrl ?? currentSlots.fullPaperWordFileUrl,
      };

      const nextVersion = await recordRevisionAndSnapshot(
        sub,
        uploaded,
        merged,
        body.changelog ?? null,
      );

      const nextStatus = statusAfterReviseUpload(sub.status) ?? "submitted_round2";

      await db
        .update(submissions)
        .set({
          status: nextStatus,
          abstractFileUrl: merged.abstractFileUrl,
          abstractWordFileUrl: merged.abstractWordFileUrl,
          fullPaperFileUrl: merged.fullPaperFileUrl,
          fullPaperWordFileUrl: merged.fullPaperWordFileUrl,
        })
        .where(eq(submissions.id, params.id));

      return ok({ message: "Revision submitted successfully", version: nextVersion });
    },
    {
      body: t.Object({
        file: t.Optional(t.File({ maxSize: 50 * 1024 * 1024 })),
        abstractPdf: t.Optional(t.File({ maxSize: 50 * 1024 * 1024 })),
        abstractWord: t.Optional(t.File({ maxSize: 50 * 1024 * 1024 })),
        fullPaperPdf: t.Optional(t.File({ maxSize: 50 * 1024 * 1024 })),
        fullPaperWord: t.Optional(t.File({ maxSize: 50 * 1024 * 1024 })),
        changelog: t.Optional(t.String()),
      }),
    }
  );
