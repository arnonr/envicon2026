import path from "path";
import { Elysia, t } from "elysia";
import { and, eq, ne } from "drizzle-orm";
import { db } from "../db";
import { reviewRounds, reviews, revisions, submissionVersions, submissions, users } from "../db/schema";
import { getUserFromHeaders, signReviewFileTicket, verifyReviewFileTicket } from "../middleware/auth";
import { requireReviewer } from "../middleware/roles";
import { fail, ok } from "../utils/response";
import { storedFileExists } from "../services/storage";

function resolveBlindFileContentType(ext: string, fallback?: string): string {
  switch (ext.toLowerCase()) {
    case ".pdf":
      return "application/pdf";
    case ".doc":
      return "application/msword";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    default:
      return fallback || "application/octet-stream";
  }
}

const protectedReviewRoutes = new Elysia()
  .use(requireReviewer)
  .get("/", async ({ headers, set }) => {
    const currentUser = await getUserFromHeaders(headers.authorization);
    if (!currentUser) {
      set.status = 401;
      return fail("UNAUTHORIZED", "Authentication required");
    }
    if (!["reviewer", "admin"].includes(currentUser.role)) {
      set.status = 403;
      return fail("FORBIDDEN", "Insufficient permissions");
    }
    const where = currentUser.role === "admin"
      ? ne(reviews.status, "assigned")
      : and(eq(reviews.reviewerId, currentUser.id), ne(reviews.status, "assigned"));
    const assignments = await db
      .select({
        id: reviews.id,
        status: reviews.status,
        dueAt: reviews.dueAt,
        sentAt: reviews.sentAt,
        completedAt: reviews.completedAt,
        recommendation: reviews.recommendation,
        roundNumber: reviewRounds.roundNumber,
        reviewType: reviewRounds.reviewType,
        blindFileUrl: reviewRounds.blindFileUrl,
        title: submissions.title,
        titleEn: submissions.titleEn,
        track: submissions.track,
      })
      .from(reviews)
      .innerJoin(reviewRounds, eq(reviews.roundId, reviewRounds.id))
      .innerJoin(submissions, eq(reviews.submissionId, submissions.id))
      .where(where);
    return ok(assignments.map(({ blindFileUrl, ...rest }) => ({
      ...rest,
      hasBlindFile: Boolean(blindFileUrl),
    })));
  })
  .get(
    "/:id",
    async ({ params, headers, set }) => {
      const currentUser = await getUserFromHeaders(headers.authorization);
      if (!currentUser) {
        set.status = 401;
        return fail("UNAUTHORIZED", "Authentication required");
      }
      if (!["reviewer", "admin"].includes(currentUser.role)) {
        set.status = 403;
        return fail("FORBIDDEN", "Insufficient permissions");
      }
      const isAdmin = currentUser.role === "admin";
      const [assignment] = await db
        .select({
          id: reviews.id,
          reviewerId: reviews.reviewerId,
          status: reviews.status,
          recommendation: reviews.recommendation,
          commentsToAuthor: reviews.commentsToAuthor,
          commentsToEditor: reviews.commentsToEditor,
          dueAt: reviews.dueAt,
          completedAt: reviews.completedAt,
          roundNumber: reviewRounds.roundNumber,
          reviewType: reviewRounds.reviewType,
          blindFileUrl: reviewRounds.blindFileUrl,
          submissionId: submissions.id,
          title: submissions.title,
          titleEn: submissions.titleEn,
          abstract: submissions.abstract,
          keywords: submissions.keywords,
          creators: submissions.creators,
          track: submissions.track,
          submitterType: submissions.submitterType,
          presentationFormat: submissions.presentationFormat,
          abstractFileUrl: submissions.abstractFileUrl,
          fullPaperFileUrl: submissions.fullPaperFileUrl,
          round1FileUrl: submissions.round1FileUrl,
          round1FileType: submissions.round1FileType,
          submittedAt: submissions.submittedAt,
          authorName: users.name,
          authorEmail: users.email,
          authorAffiliation: users.affiliation,
          versionTitle: submissionVersions.title,
          versionTitleEn: submissionVersions.titleEn,
          versionAbstract: submissionVersions.abstract,
          versionKeywords: submissionVersions.keywords,
          versionCreators: submissionVersions.creators,
          versionTrack: submissionVersions.track,
          versionSubmitterType: submissionVersions.submitterType,
          versionPresentationFormat: submissionVersions.presentationFormat,
          versionFileUrl: submissionVersions.fileUrl,
          versionSubmittedAt: submissionVersions.submittedAt,
          paymentStatus: submissions.paymentStatus,
        })
        .from(reviews)
        .innerJoin(reviewRounds, eq(reviews.roundId, reviewRounds.id))
        .innerJoin(submissions, eq(reviews.submissionId, submissions.id))
        .innerJoin(users, eq(submissions.authorId, users.id))
        .leftJoin(submissionVersions, eq(reviewRounds.submissionVersionId, submissionVersions.id))
        .where(eq(reviews.id, params.id))
        .limit(1);
      if (!assignment || assignment.status === "assigned") {
        set.status = 404;
        return fail("NOT_FOUND", "ไม่พบงานประเมิน");
      }
      if (!isAdmin && assignment.reviewerId !== currentUser.id) {
        set.status = 403;
        return fail("FORBIDDEN", "ไม่มีสิทธิ์เข้าถึงงานประเมินนี้");
      }
      const revisionList = await db
        .select()
        .from(revisions)
        .where(eq(revisions.submissionId, assignment.submissionId));
      const hasSnapshot = assignment.versionTitle !== null;
      const resolvedCreators = hasSnapshot ? assignment.versionCreators : assignment.creators;
      const hasBlindFile = Boolean(assignment.blindFileUrl && await storedFileExists(assignment.blindFileUrl));
      const blindExt = assignment.blindFileUrl ? path.extname(assignment.blindFileUrl) || ".pdf" : ".pdf";
      const blindFileTicket = hasBlindFile ? await signReviewFileTicket(currentUser.id, assignment.id) : null;
      const response: Record<string, unknown> = {
        ...assignment,
        hasBlindFile,
        blindFileName: hasBlindFile ? `blind-review-round-${assignment.roundNumber}${blindExt}` : null,
        blindFileTicket,
        title: hasSnapshot ? assignment.versionTitle : assignment.title,
        titleEn: hasSnapshot ? assignment.versionTitleEn : assignment.titleEn,
        abstract: hasSnapshot ? assignment.versionAbstract : assignment.abstract,
        keywords: hasSnapshot ? assignment.versionKeywords : assignment.keywords,
        track: hasSnapshot ? assignment.versionTrack : assignment.track,
        submitterType: hasSnapshot ? assignment.versionSubmitterType : assignment.submitterType,
        presentationFormat: hasSnapshot ? assignment.versionPresentationFormat : assignment.presentationFormat,
        fullPaperFileUrl: assignment.versionFileUrl ?? assignment.fullPaperFileUrl,
        submittedAt: hasSnapshot ? assignment.versionSubmittedAt : assignment.submittedAt,
        revisions: revisionList,
      };
      delete response.blindFileUrl;
      if (isAdmin) {
        response.creators = resolvedCreators;
      } else {
        delete response.authorName;
        delete response.authorEmail;
        delete response.authorAffiliation;
        delete response.creators;
        delete response.paymentStatus;
        delete response.abstractFileUrl;
        delete response.fullPaperFileUrl;
        delete response.round1FileUrl;
        delete response.round1FileType;
        delete response.versionFileUrl;
        delete response.revisions;
      }
      delete response.versionCreators;
      delete response.versionPresentationFormat;
      return ok(response);
    },
    { params: t.Object({ id: t.String() }) },
  )
  .put(
    "/:id/draft",
    async ({ params, body, headers, set }) => {
      const currentUser = await getUserFromHeaders(headers.authorization);
      if (!currentUser) {
        set.status = 401;
        return fail("UNAUTHORIZED", "Authentication required");
      }
      if (!["reviewer", "admin"].includes(currentUser.role)) {
        set.status = 403;
        return fail("FORBIDDEN", "Insufficient permissions");
      }
      const [review] = await db.select().from(reviews).where(eq(reviews.id, params.id)).limit(1);
      if (!review || review.reviewerId !== currentUser.id) {
        set.status = 404;
        return fail("NOT_FOUND", "ไม่พบงานประเมิน");
      }
      if (!["sent", "in_progress"].includes(review.status)) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "ไม่สามารถแก้ไขผลประเมินนี้");
      }
      await db.update(reviews).set({
        recommendation: body.recommendation ?? null,
        commentsToAuthor: body.commentsToAuthor ?? null,
        commentsToEditor: body.commentsToEditor ?? null,
        status: "in_progress",
      }).where(eq(reviews.id, review.id));
      return ok({ saved: true });
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        recommendation: t.Optional(t.Union([t.Literal("accept"), t.Literal("reject"), t.Literal("revise")])),
        commentsToAuthor: t.Optional(t.String()),
        commentsToEditor: t.Optional(t.String()),
      }),
    },
  )
  .post(
    "/:id/submit",
    async ({ params, body, headers, set }) => {
      const currentUser = await getUserFromHeaders(headers.authorization);
      if (!currentUser) {
        set.status = 401;
        return fail("UNAUTHORIZED", "Authentication required");
      }
      if (!["reviewer", "admin"].includes(currentUser.role)) {
        set.status = 403;
        return fail("FORBIDDEN", "Insufficient permissions");
      }
      const [review] = await db.select().from(reviews).where(eq(reviews.id, params.id)).limit(1);
      if (!review || review.reviewerId !== currentUser.id) {
        set.status = 404;
        return fail("NOT_FOUND", "ไม่พบงานประเมิน");
      }
      if (!["sent", "in_progress"].includes(review.status)) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "ผลประเมินนี้ถูกส่งแล้ว");
      }
      if (!body.commentsToAuthor.trim()) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "กรุณากรอกข้อเสนอแนะถึงผู้เขียน");
      }
      await db.update(reviews).set({
        recommendation: body.recommendation,
        commentsToAuthor: body.commentsToAuthor.trim(),
        commentsToEditor: body.commentsToEditor?.trim() || null,
        status: "completed",
        completedAt: new Date(),
      }).where(eq(reviews.id, review.id));

      const assignments = await db.select({ status: reviews.status }).from(reviews).where(eq(reviews.roundId, review.roundId));
      const dispatched = assignments.filter((assignment) => assignment.status !== "assigned");
      if (dispatched.length && dispatched.every((assignment) => assignment.status === "completed")) {
        await db.update(reviewRounds).set({ status: "ready_for_decision" }).where(eq(reviewRounds.id, review.roundId));
      }
      return ok({ submitted: true });
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        recommendation: t.Union([t.Literal("accept"), t.Literal("reject"), t.Literal("revise")]),
        commentsToAuthor: t.String({ minLength: 1 }),
        commentsToEditor: t.Optional(t.String()),
      }),
    },
  );

export const reviewRoutes = new Elysia({ prefix: "/reviews" })
  .get(
    "/:id/file",
    async ({ params, query, headers, set }) => {
      const currentUser =
        (await getUserFromHeaders(headers.authorization)) ??
        (await verifyReviewFileTicket(query.ticket, params.id));
      if (!currentUser) {
        set.status = 401;
        return fail("UNAUTHORIZED", "Authentication required");
      }
      if (!["reviewer", "admin"].includes(currentUser.role)) {
        set.status = 403;
        return fail("FORBIDDEN", "Insufficient permissions");
      }
      const isAdmin = currentUser.role === "admin";
      const [assignment] = await db
        .select({
          reviewerId: reviews.reviewerId,
          status: reviews.status,
          roundNumber: reviewRounds.roundNumber,
          blindFileUrl: reviewRounds.blindFileUrl,
        })
        .from(reviews)
        .innerJoin(reviewRounds, eq(reviews.roundId, reviewRounds.id))
        .where(eq(reviews.id, params.id))
        .limit(1);
      if (!assignment || assignment.status === "assigned") {
        set.status = 404;
        return fail("NOT_FOUND", "ไม่พบงานประเมิน");
      }
      if (!isAdmin && assignment.reviewerId !== currentUser.id) {
        set.status = 403;
        return fail("FORBIDDEN", "ไม่มีสิทธิ์เข้าถึงไฟล์งานประเมินนี้");
      }
      if (!assignment.blindFileUrl || !(await storedFileExists(assignment.blindFileUrl))) {
        set.status = 404;
        return fail("NOT_FOUND", "ไม่พบไฟล์ Blind Review สำหรับรอบนี้");
      }
      const filename = path.basename(assignment.blindFileUrl);
      const filepath = path.resolve(process.cwd(), "uploads", filename);
      const file = Bun.file(filepath);
      const ext = path.extname(filename).toLowerCase() || ".pdf";
      const downloadName = `blind-review-round-${assignment.roundNumber}${ext}`;
      const disposition = query.download === "1" || query.download === "true" ? "attachment" : "inline";
      return new Response(file, {
        headers: {
          "Content-Type": resolveBlindFileContentType(ext, file.type),
          "Content-Disposition": `${disposition}; filename="${downloadName}"`,
          "Content-Length": String(file.size),
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    },
    {
      params: t.Object({ id: t.String() }),
      query: t.Object({
        ticket: t.Optional(t.String()),
        download: t.Optional(t.String()),
      }),
    },
  )
  .use(protectedReviewRoutes);
