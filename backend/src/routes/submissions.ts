import { Elysia, t } from "elysia";
import { db } from "../db";
import { reviewRounds, reviews, submissions, revisions, submissionVersions } from "../db/schema";
import { and, eq, desc, inArray, ne, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { ok, fail } from "../utils/response";
import { saveFile, storedFileExists } from "../services/storage";

const MAX_CREATORS = 20;

function parseCreators(raw: string | undefined): string | null {
  if (!raw) return null;
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error("creators must be valid JSON"); }
  if (!Array.isArray(parsed)) throw new Error("creators must be an array");
  if (parsed.length === 0) return null;
  if (parsed.length > MAX_CREATORS) throw new Error(`creators must have at most ${MAX_CREATORS} entries`);
  for (const c of parsed) {
    if (typeof c.firstName !== "string" || typeof c.lastName !== "string")
      throw new Error("each creator must have firstName and lastName");
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
    return ok(own.map((s) => ({ ...s, currentRoundNumber: roundBySubmission.get(s.id) ?? 0 })));
  })

  // Get by ID (with revisions)
  .get("/:id", async ({ params, user, set }) => {
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
    const dispatchedInOpenRound = latestRevision && sub.status === "submitted"
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

    return ok({
      ...sub,
      revisions: revisionList,
      currentRoundNumber,
      rounds: roundSummaries,
      canReplaceLatestRevisionFile: user!.role === "author"
        && sub.authorId === user!.id
        && sub.status === "submitted"
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
      });

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
      if (sub.status !== "submitted") {
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
      if (!["draft", "revision_requested"].includes(sub.status)) {
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
      }),
    }
  )

  // Upload abstract PDF → status becomes "pending_payment"
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

      await db
        .update(submissions)
        .set({ abstractFileUrl: fileUrl, status: "submitted", submittedAt: new Date() })
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
      await db
        .update(submissions)
        .set({
          round1FileUrl: fileUrl,
          round1FileType: body.fileType,
          status: "submitted",
          submittedAt: new Date(),
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
      if (sub.status !== "accepted") {
        set.status = 400;
        return fail("VALIDATION_ERROR", "อัปโหลดบทความฉบับสมบูรณ์ได้หลังจากผลงานผ่านการพิจารณาแล้วเท่านั้น");
      }

      const fileUrl = await saveFile(body.file, `paper-${params.id}`);

      await db
        .update(submissions)
        .set({ fullPaperFileUrl: fileUrl })
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
        .set({ paymentSlipUrl: fileUrl, paymentStatus: "pending_verification" })
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
        file: t.File({ type: ["application/pdf", "image/png", "image/jpeg"], maxSize: 10 * 1024 * 1024 }),
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
      if (sub.status !== "revision_requested") {
        set.status = 400;
        return fail("VALIDATION_ERROR", "Submission is not awaiting revision");
      }

      const [latest] = await db
        .select({ version: revisions.version })
        .from(revisions)
        .where(eq(revisions.submissionId, params.id))
        .orderBy(desc(revisions.version))
        .limit(1);

      const nextVersion = (latest?.version ?? 0) + 1;
      const fileUrl = await saveFile(
        body.file,
        `revision-${params.id}-v${nextVersion}`
      );

      await db.insert(revisions).values({
        id: crypto.randomUUID(),
        submissionId: params.id,
        version: nextVersion,
        fileUrl,
        changelog: body.changelog ?? null,
      });

      const [latestSnapshot] = await db
        .select({ version: submissionVersions.version })
        .from(submissionVersions)
        .where(eq(submissionVersions.submissionId, params.id))
        .orderBy(desc(submissionVersions.version))
        .limit(1);
      const snapshotVersion = Math.max(latestSnapshot?.version ?? 1, nextVersion + 1);
      await db.insert(submissionVersions).values({
        id: crypto.randomUUID(),
        submissionId: params.id,
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
        fileUrl,
        changelog: body.changelog ?? null,
        submittedAt: new Date(),
      });

      await db
        .update(submissions)
        .set({ status: "submitted", fullPaperFileUrl: fileUrl })
        .where(eq(submissions.id, params.id));

      return ok({ message: "Revision submitted successfully", version: nextVersion });
    },
    {
      body: t.Object({
        file: t.File({ type: "application/pdf", maxSize: 50 * 1024 * 1024 }),
        changelog: t.Optional(t.String()),
      }),
    }
  );
