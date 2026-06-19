import { Elysia, t } from "elysia";
import { and, eq, ne } from "drizzle-orm";
import { db } from "../db";
import { reviewRounds, reviews, revisions, submissionVersions, submissions, users } from "../db/schema";
import { getUserFromHeaders } from "../middleware/auth";
import { requireReviewer } from "../middleware/roles";
import { fail, ok } from "../utils/response";

export const reviewRoutes = new Elysia({ prefix: "/reviews" })
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
        score: reviews.score,
        recommendation: reviews.recommendation,
        roundNumber: reviewRounds.roundNumber,
        title: submissions.title,
        titleEn: submissions.titleEn,
        track: submissions.track,
      })
      .from(reviews)
      .innerJoin(reviewRounds, eq(reviews.roundId, reviewRounds.id))
      .innerJoin(submissions, eq(reviews.submissionId, submissions.id))
      .where(where);
    return ok(assignments);
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
          score: reviews.score,
          recommendation: reviews.recommendation,
          commentsToAuthor: reviews.commentsToAuthor,
          commentsToEditor: reviews.commentsToEditor,
          dueAt: reviews.dueAt,
          completedAt: reviews.completedAt,
          roundNumber: reviewRounds.roundNumber,
          submissionId: submissions.id,
          title: submissions.title,
          titleEn: submissions.titleEn,
          abstract: submissions.abstract,
          keywords: submissions.keywords,
          creators: submissions.creators,
          track: submissions.track,
          submitterType: submissions.submitterType,
          abstractFileUrl: submissions.abstractFileUrl,
          fullPaperFileUrl: submissions.fullPaperFileUrl,
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
      const response: Record<string, unknown> = {
        ...assignment,
        title: hasSnapshot ? assignment.versionTitle : assignment.title,
        titleEn: hasSnapshot ? assignment.versionTitleEn : assignment.titleEn,
        abstract: hasSnapshot ? assignment.versionAbstract : assignment.abstract,
        keywords: hasSnapshot ? assignment.versionKeywords : assignment.keywords,
        track: hasSnapshot ? assignment.versionTrack : assignment.track,
        submitterType: hasSnapshot ? assignment.versionSubmitterType : assignment.submitterType,
        fullPaperFileUrl: hasSnapshot ? assignment.versionFileUrl : assignment.fullPaperFileUrl,
        submittedAt: hasSnapshot ? assignment.versionSubmittedAt : assignment.submittedAt,
        revisions: revisionList,
      };
      if (isAdmin) {
        response.creators = resolvedCreators;
      } else {
        delete response.authorName;
        delete response.authorAffiliation;
        delete response.creators;
        delete response.paymentStatus;
      }
      delete response.versionCreators;
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
        score: body.score ?? null,
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
        score: t.Optional(t.Number({ minimum: 1, maximum: 5 })),
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
        score: body.score,
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
        score: t.Number({ minimum: 1, maximum: 5 }),
        recommendation: t.Union([t.Literal("accept"), t.Literal("reject"), t.Literal("revise")]),
        commentsToAuthor: t.String({ minLength: 1 }),
        commentsToEditor: t.Optional(t.String()),
      }),
    },
  );
