import { Elysia, t } from "elysia";
import { and, desc, eq, inArray, ne } from "drizzle-orm";
import { db } from "../db";
import {
  emailNotifications,
  reviewRounds,
  reviewerExpertiseTracks,
  reviewerProfiles,
  reviews,
  submissionVersions,
  submissions,
  users,
} from "../db/schema";
import { getUserFromHeaders } from "../middleware/auth";
import { requireAdmin } from "../middleware/roles";
import { ALL_NON_DRAFT, RE_REVIEW_STATUSES, statusAfterDecision, statusAfterSendReview } from "../utils/submission-status";
import { appUrl, escapeHtml, retryTrackedEmail, sendTrackedEmail } from "../services/email";
import { buildAuthorResultEmail, buildReviewerInvitationEmail, buildReviewAssignmentEmail } from "../services/email-templates";
import { issuePasswordSetupToken } from "../services/password-setup";
import { fail, ok } from "../utils/response";
import { storedFileExists } from "../services/storage";

async function sendInvitation(user: { id: string; email: string; name: string }) {
  const token = await issuePasswordSetupToken(user.id);
  const link = appUrl(`/auth/setup-password?token=${encodeURIComponent(token)}`);
  const { subject, htmlBody } = buildReviewerInvitationEmail({ reviewerName: user.name, setupLink: link });
  return sendTrackedEmail({
    type: "reviewer_invitation",
    recipientEmail: user.email,
    relatedId: user.id,
    subject,
    htmlBody,
  });
}

async function reviewerDirectory(submissionTrack?: number) {
  const profiles = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      affiliation: users.affiliation,
      passwordHash: users.passwordHash,
      maxConcurrentReviews: reviewerProfiles.maxConcurrentReviews,
      active: reviewerProfiles.active,
    })
    .from(reviewerProfiles)
    .innerJoin(users, eq(reviewerProfiles.userId, users.id))
    .orderBy(users.name);
  const profileIds = profiles.map((profile) => profile.id);
  const tracks = profileIds.length
    ? await db.select().from(reviewerExpertiseTracks).where(inArray(reviewerExpertiseTracks.reviewerId, profileIds))
    : [];
  const allReviews = profileIds.length
    ? await db.select({ reviewerId: reviews.reviewerId, status: reviews.status }).from(reviews).where(inArray(reviews.reviewerId, profileIds))
    : [];
  const invitations = profileIds.length
    ? await db
      .select({ relatedId: emailNotifications.relatedId, id: emailNotifications.id, status: emailNotifications.status })
      .from(emailNotifications)
      .where(and(eq(emailNotifications.type, "reviewer_invitation"), inArray(emailNotifications.relatedId, profileIds)))
      .orderBy(desc(emailNotifications.createdAt))
    : [];

  return profiles.map((profile) => {
    const expertiseTracks = tracks.filter((item) => item.reviewerId === profile.id).map((item) => item.track);
    const activeReviewCount = allReviews.filter((item) => item.reviewerId === profile.id && item.status !== "completed").length;
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      affiliation: profile.affiliation,
      active: profile.active === 1,
      hasPassword: Boolean(profile.passwordHash),
      expertiseTracks,
      maxConcurrentReviews: profile.maxConcurrentReviews,
      activeReviewCount,
      completedReviewCount: allReviews.filter((item) => item.reviewerId === profile.id && item.status === "completed").length,
      invitationStatus: invitations.find((invitation) => invitation.relatedId === profile.id)?.status ?? null,
      matchesTrack: submissionTrack ? expertiseTracks.includes(submissionTrack) : undefined,
      overCapacity: activeReviewCount >= profile.maxConcurrentReviews,
    };
  });
}

async function ensureCurrentSubmissionVersion(submission: typeof submissions.$inferSelect) {
  const [latestVersion] = await db
    .select()
    .from(submissionVersions)
    .where(eq(submissionVersions.submissionId, submission.id))
    .orderBy(desc(submissionVersions.version))
    .limit(1);
  if (latestVersion) return latestVersion;

  const version = {
    id: crypto.randomUUID(),
    submissionId: submission.id,
    version: 1,
    kind: "initial" as const,
    title: submission.title,
    titleEn: submission.titleEn,
    abstract: submission.abstract,
    keywords: submission.keywords,
    creators: submission.creators,
    track: submission.track,
    educationLevel: submission.educationLevel,
    presentationFormat: submission.presentationFormat,
    submitterType: submission.submitterType,
    fileUrl: submission.fullPaperFileUrl ?? submission.abstractFileUrl,
    changelog: null,
    submittedAt: submission.submittedAt ?? new Date(),
  };
  await db.insert(submissionVersions).values(version);
  return version;
}

export const adminReviewRoutes = new Elysia({ prefix: "/admin" })
  .use(requireAdmin)
  .get("/reviewers", async () => ok(await reviewerDirectory()))
  .post(
    "/reviewers",
    async ({ body, set }) => {
      const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, body.email)).limit(1);
      if (existing) {
        set.status = 409;
        return fail("CONFLICT", "อีเมลนี้มีบัญชีในระบบแล้ว");
      }

      const id = crypto.randomUUID();
      await db.insert(users).values({
        id,
        name: body.name,
        email: body.email,
        role: "reviewer",
      });
      await db.insert(reviewerProfiles).values({
        userId: id,
        maxConcurrentReviews: body.maxConcurrentReviews,
      });

      const email = await sendInvitation({ id, name: body.name, email: body.email });
      set.status = 201;
      return ok({ id, invitationStatus: email.status });
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ format: "email" }),
        maxConcurrentReviews: t.Number({ minimum: 1 }),
      }),
    },
  )
  .patch(
    "/reviewers/:id",
    async ({ params, body, set }) => {
      const [profile] = await db.select().from(reviewerProfiles).where(eq(reviewerProfiles.userId, params.id)).limit(1);
      if (!profile) {
        set.status = 404;
        return fail("NOT_FOUND", "ไม่พบผู้รีวิว");
      }

      await db
        .update(users)
        .set({ name: body.name, affiliation: body.affiliation ?? null })
        .where(eq(users.id, params.id));
      await db
        .update(reviewerProfiles)
        .set({ maxConcurrentReviews: body.maxConcurrentReviews, active: body.active ? 1 : 0 })
        .where(eq(reviewerProfiles.userId, params.id));
      await db.delete(reviewerExpertiseTracks).where(eq(reviewerExpertiseTracks.reviewerId, params.id));
      if (body.expertiseTracks.length) {
        await db.insert(reviewerExpertiseTracks).values(
          body.expertiseTracks.map((track) => ({ reviewerId: params.id, track })),
        );
      }
      return ok({ id: params.id });
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.String({ minLength: 1 }),
        affiliation: t.Optional(t.String()),
        expertiseTracks: t.Array(t.Number({ minimum: 1, maximum: 7 })),
        maxConcurrentReviews: t.Number({ minimum: 1 }),
        active: t.Boolean(),
      }),
    },
  )
  .post(
    "/reviewers/:id/resend-invitation",
    async ({ params, set }) => {
      const [reviewer] = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(and(eq(users.id, params.id), eq(users.role, "reviewer")))
        .limit(1);
      if (!reviewer) {
        set.status = 404;
        return fail("NOT_FOUND", "ไม่พบผู้รีวิว");
      }
      return ok(await sendInvitation(reviewer));
    },
    { params: t.Object({ id: t.String() }) },
  )
  .get(
    "/submissions/:id/review-workflow",
    async ({ params, set }) => {
      const [submission] = await db
        .select({ id: submissions.id, track: submissions.track, status: submissions.status })
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);
      if (!submission) {
        set.status = 404;
        return fail("NOT_FOUND", "ไม่พบผลงาน");
      }

      const roundRows = await db
        .select({
          id: reviewRounds.id,
          submissionId: reviewRounds.submissionId,
          submissionVersionId: reviewRounds.submissionVersionId,
          roundNumber: reviewRounds.roundNumber,
          status: reviewRounds.status,
          decision: reviewRounds.decision,
          adminNote: reviewRounds.adminNote,
          decidedAt: reviewRounds.decidedAt,
          releasedAt: reviewRounds.releasedAt,
          createdAt: reviewRounds.createdAt,
          versionId: submissionVersions.id,
          version: submissionVersions.version,
          versionKind: submissionVersions.kind,
          versionTitle: submissionVersions.title,
          versionTitleEn: submissionVersions.titleEn,
          versionAbstract: submissionVersions.abstract,
          versionKeywords: submissionVersions.keywords,
          versionCreators: submissionVersions.creators,
          versionTrack: submissionVersions.track,
          versionSubmitterType: submissionVersions.submitterType,
          versionFileUrl: submissionVersions.fileUrl,
          versionChangelog: submissionVersions.changelog,
          versionSubmittedAt: submissionVersions.submittedAt,
        })
        .from(reviewRounds)
        .leftJoin(submissionVersions, eq(reviewRounds.submissionVersionId, submissionVersions.id))
        .where(eq(reviewRounds.submissionId, submission.id))
        .orderBy(reviewRounds.roundNumber);
      const rounds = await Promise.all(roundRows.map(async (round) => {
        const assignments = await db
          .select({
            id: reviews.id,
            reviewerId: reviews.reviewerId,
            reviewerName: users.name,
            reviewerEmail: users.email,
            status: reviews.status,
            dueAt: reviews.dueAt,
            sentAt: reviews.sentAt,
            recommendation: reviews.recommendation,
            commentsToAuthor: reviews.commentsToAuthor,
            commentsToEditor: reviews.commentsToEditor,
            completedAt: reviews.completedAt,
          })
          .from(reviews)
          .innerJoin(users, eq(reviews.reviewerId, users.id))
          .where(eq(reviews.roundId, round.id))
          .orderBy(reviews.assignedAt);
        const dispatched = assignments.filter((assignment) => assignment.status !== "assigned");
        return {
          id: round.id,
          submissionId: round.submissionId,
          submissionVersionId: round.submissionVersionId,
          roundNumber: round.roundNumber,
          status: round.status,
          decision: round.decision,
          adminNote: round.adminNote,
          decidedAt: round.decidedAt,
          releasedAt: round.releasedAt,
          createdAt: round.createdAt,
          assignments,
          dispatchedCount: dispatched.length,
          completedCount: dispatched.filter((assignment) => assignment.status === "completed").length,
          submissionVersion: round.versionId
            ? {
              id: round.versionId,
              version: round.version,
              kind: round.versionKind,
              title: round.versionTitle,
              titleEn: round.versionTitleEn,
              abstract: round.versionAbstract,
              keywords: round.versionKeywords,
              creators: round.versionCreators,
              track: round.versionTrack,
              submitterType: round.versionSubmitterType,
              fileUrl: round.versionFileUrl,
              changelog: round.versionChangelog,
              submittedAt: round.versionSubmittedAt,
            }
            : null,
        };
      }));
      const currentRound = [...rounds].reverse().find((round) => round.status !== "released") ?? null;
      const versionRows = await db
        .select()
        .from(submissionVersions)
        .where(eq(submissionVersions.submissionId, submission.id))
        .orderBy(submissionVersions.version);
      const versions = await Promise.all(versionRows.map(async (version) => ({
        ...version,
        fileAvailable: await storedFileExists(version.fileUrl),
      })));
      return ok({
        submission,
        rounds,
        versions,
        currentRound,
        reviewers: await reviewerDirectory(submission.track),
      });
    },
    { params: t.Object({ id: t.String() }) },
  )
  .post(
    "/submissions/:id/review-rounds",
    async ({ params, set }) => {
      const [submission] = await db.select().from(submissions).where(eq(submissions.id, params.id)).limit(1);
      if (!submission || (!ALL_NON_DRAFT.includes(submission.status) && !RE_REVIEW_STATUSES.includes(submission.status as never))) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "ผลงานยังไม่พร้อมเริ่มรอบพิจารณา");
      }
      const isReReview = RE_REVIEW_STATUSES.includes(submission.status as never);
      const [openRound] = await db
        .select({ id: reviewRounds.id })
        .from(reviewRounds)
        .where(and(eq(reviewRounds.submissionId, params.id), ne(reviewRounds.status, "released")))
        .limit(1);
      if (openRound) {
        set.status = 409;
        return fail("CONFLICT", "มีรอบพิจารณาที่กำลังดำเนินการอยู่แล้ว");
      }
      const [latest] = await db
        .select({ roundNumber: reviewRounds.roundNumber })
        .from(reviewRounds)
        .where(eq(reviewRounds.submissionId, params.id))
        .orderBy(desc(reviewRounds.roundNumber))
        .limit(1);
      const version = await ensureCurrentSubmissionVersion(submission);
      const id = crypto.randomUUID();
      await db.insert(reviewRounds).values({
        id,
        submissionId: params.id,
        submissionVersionId: version.id,
        roundNumber: (latest?.roundNumber ?? 0) + 1,
      });
      return ok({ id, isReReview });
    },
    { params: t.Object({ id: t.String() }) },
  )
  .post(
    "/review-rounds/:roundId/assignments",
    async ({ params, body, set }) => {
      const [round] = await db.select().from(reviewRounds).where(eq(reviewRounds.id, params.roundId)).limit(1);
      if (!round || !["assigning", "in_review"].includes(round.status)) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "รอบพิจารณานี้ไม่สามารถเพิ่มผู้รีวิวได้");
      }
      const candidates = await db
        .select({ userId: reviewerProfiles.userId, active: reviewerProfiles.active })
        .from(reviewerProfiles)
        .where(inArray(reviewerProfiles.userId, body.reviewerIds));
      if (candidates.length !== body.reviewerIds.length || candidates.some((candidate) => candidate.active !== 1)) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "เลือกผู้รีวิวที่ไม่พร้อมรับงาน");
      }
      const existing = await db.select({ reviewerId: reviews.reviewerId }).from(reviews).where(eq(reviews.roundId, round.id));
      const newReviewerIds = [...new Set(body.reviewerIds)].filter((id) => !existing.some((item) => item.reviewerId === id));
      if (!newReviewerIds.length) {
        set.status = 409;
        return fail("CONFLICT", "ผู้รีวิวที่เลือกอยู่ในรอบนี้แล้ว");
      }
      await db.insert(reviews).values(
        newReviewerIds.map((reviewerId) => ({
          id: crypto.randomUUID(),
          submissionId: round.submissionId,
          roundId: round.id,
          reviewerId,
        })),
      );
      return ok({ added: newReviewerIds.length });
    },
    {
      params: t.Object({ roundId: t.String() }),
      body: t.Object({ reviewerIds: t.Array(t.String(), { minItems: 1 }) }),
    },
  )
  .delete(
    "/reviews/:id",
    async ({ params, set }) => {
      const [review] = await db.select().from(reviews).where(eq(reviews.id, params.id)).limit(1);
      if (!review) {
        set.status = 404;
        return fail("NOT_FOUND", "ไม่พบการมอบหมาย");
      }
      if (review.status !== "assigned") {
        set.status = 400;
        return fail("VALIDATION_ERROR", "ไม่สามารถถอดผู้รีวิวหลังส่งงานแล้ว");
      }
      await db.delete(reviews).where(eq(reviews.id, review.id));
      return ok({ removed: true });
    },
    { params: t.Object({ id: t.String() }) },
  )
  .post(
    "/reviews/:id/send",
    async ({ params, body, set }) => {
      const [assignment] = await db
        .select({
          id: reviews.id,
          status: reviews.status,
          roundId: reviews.roundId,
          submissionId: reviews.submissionId,
          title: submissions.title,
          abstractFileUrl: submissions.abstractFileUrl,
          fullPaperFileUrl: submissions.fullPaperFileUrl,
          round1FileUrl: submissions.round1FileUrl,
          versionFileUrl: submissionVersions.fileUrl,
          roundNumber: reviewRounds.roundNumber,
          reviewerId: users.id,
          reviewerName: users.name,
          reviewerEmail: users.email,
          passwordHash: users.passwordHash,
        })
        .from(reviews)
        .innerJoin(submissions, eq(reviews.submissionId, submissions.id))
        .innerJoin(users, eq(reviews.reviewerId, users.id))
        .leftJoin(reviewRounds, eq(reviews.roundId, reviewRounds.id))
        .leftJoin(submissionVersions, eq(reviewRounds.submissionVersionId, submissionVersions.id))
        .where(eq(reviews.id, params.id))
        .limit(1);
      if (!assignment || assignment.status !== "assigned") {
        set.status = 400;
        return fail("VALIDATION_ERROR", "งานนี้ถูกส่งไปแล้วหรือไม่พบการมอบหมาย");
      }
      if ((assignment.roundNumber ?? 1) >= 2 && !assignment.fullPaperFileUrl) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "ต้องแนบไฟล์ฉบับสมบูรณ์ก่อนเริ่มรอบที่ 2");
      }
      const reviewFileUrl = assignment.versionFileUrl
        ?? assignment.fullPaperFileUrl
        ?? assignment.round1FileUrl
        ?? assignment.abstractFileUrl;
      if (!await storedFileExists(reviewFileUrl)) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "ไม่พบไฟล์ผลงานสำหรับรอบพิจารณานี้ กรุณาให้เจ้าของผลงานแนบไฟล์ใหม่ก่อนส่งพิจารณา");
      }

      const reviewLink = appUrl(`/reviewer/reviews/${assignment.id}`);
      const setupLink = assignment.passwordHash
        ? undefined
        : appUrl(`/auth/setup-password?token=${encodeURIComponent(await issuePasswordSetupToken(assignment.reviewerId))}`);
      const { subject, htmlBody } = buildReviewAssignmentEmail({
        reviewerName: assignment.reviewerName,
        title: assignment.title,
        dueDate: new Date(body.dueAt).toLocaleDateString("th-TH"),
        reviewLink,
        setupLink,
        roundNumber: assignment.roundNumber ?? 1,
      });
      const email = await sendTrackedEmail({
        type: "review_assignment",
        recipientEmail: assignment.reviewerEmail,
        relatedId: assignment.id,
        subject,
        htmlBody,
      });
      if (email.status === "failed") {
        set.status = 502;
        return fail("EMAIL_DELIVERY_FAILED", email.error);
      }

      await db
        .update(reviews)
        .set({ status: "sent", dueAt: new Date(body.dueAt), sentAt: new Date() })
        .where(eq(reviews.id, assignment.id));
      await db.update(reviewRounds).set({ status: "in_review" }).where(eq(reviewRounds.id, assignment.roundId));
      await db.update(submissions).set({ status: statusAfterSendReview(assignment.roundNumber ?? 1) }).where(eq(submissions.id, assignment.submissionId));
      return ok({ sent: true });
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ dueAt: t.String({ format: "date" }) }),
    },
  )
  .patch(
    "/review-rounds/:roundId/decision",
    async ({ params, body, headers, set }) => {
      const currentUser = (await getUserFromHeaders(headers.authorization))!;
      const [round] = await db.select().from(reviewRounds).where(eq(reviewRounds.id, params.roundId)).limit(1);
      if (!round) {
        set.status = 404;
        return fail("NOT_FOUND", "ไม่พบรอบพิจารณา");
      }
      const assignments = await db.select({ status: reviews.status }).from(reviews).where(eq(reviews.roundId, round.id));
      const dispatched = assignments.filter((assignment) => assignment.status !== "assigned");
      if (!dispatched.length || dispatched.some((assignment) => assignment.status !== "completed")) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "ต้องรอผลประเมินจากผู้รีวิวที่ส่งงานครบทุกคนก่อน");
      }
      await db.update(reviewRounds).set({
        status: "ready_for_decision",
        decision: body.decision,
        adminNote: body.adminNote ?? null,
        decidedBy: currentUser.id,
        decidedAt: new Date(),
      }).where(eq(reviewRounds.id, round.id));
      return ok({ saved: true });
    },
    {
      params: t.Object({ roundId: t.String() }),
      body: t.Object({
        decision: t.Union([t.Literal("accept"), t.Literal("reject"), t.Literal("revise")]),
        adminNote: t.Optional(t.String()),
      }),
    },
  )
  .post(
    "/review-rounds/:roundId/release",
    async ({ params, set }) => {
      const [round] = await db
        .select({
          id: reviewRounds.id,
          submissionId: reviewRounds.submissionId,
          decision: reviewRounds.decision,
          adminNote: reviewRounds.adminNote,
          status: reviewRounds.status,
          roundNumber: reviewRounds.roundNumber,
          title: submissions.title,
          authorName: users.name,
          authorEmail: users.email,
        })
        .from(reviewRounds)
        .innerJoin(submissions, eq(reviewRounds.submissionId, submissions.id))
        .innerJoin(users, eq(submissions.authorId, users.id))
        .where(eq(reviewRounds.id, params.roundId))
        .limit(1);
      if (!round || round.status !== "ready_for_decision" || !round.decision) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "ยังไม่มีผลตัดสินที่พร้อมแจ้ง");
      }
      const status = statusAfterDecision(round.roundNumber, round.decision ?? "accept");
      await db.update(reviewRounds).set({ status: "released", releasedAt: new Date() }).where(eq(reviewRounds.id, round.id));
      await db.update(submissions).set({ status }).where(eq(submissions.id, round.submissionId));

      const completedReviews = await db
        .select({ commentsToAuthor: reviews.commentsToAuthor })
        .from(reviews)
        .where(and(eq(reviews.roundId, round.id), eq(reviews.status, "completed")))
        .orderBy(reviews.completedAt);

      const reviewerComments = completedReviews
        .map((r, i) => ({ reviewerIndex: i + 1, comment: r.commentsToAuthor ?? "" }))
        .filter((r) => r.comment.trim() !== "");

      const { subject, htmlBody } = buildAuthorResultEmail({
        authorName: round.authorName,
        title: round.title,
        submissionId: round.submissionId,
        decision: round.decision,
        adminNote: round.adminNote,
        reviewerComments,
        roundNumber: round.roundNumber,
      });

      const notification = await sendTrackedEmail({
        type: "author_result",
        recipientEmail: round.authorEmail,
        relatedId: round.id,
        subject,
        htmlBody,
      });
      return ok({ released: true, notificationStatus: notification.status });
    },
    { params: t.Object({ roundId: t.String() }) },
  )
  .patch(
    "/submissions/:id/payment",
    async ({ params, body, headers, set }) => {
      const admin = (await getUserFromHeaders(headers.authorization))!;
      const [sub] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);
      if (!sub) {
        set.status = 404;
        return fail("NOT_FOUND", "ไม่พบผลงาน");
      }
      if (sub.paymentStatus !== "pending_verification") {
        set.status = 400;
        return fail(
          "VALIDATION_ERROR",
          `ไม่สามารถดำเนินการได้ สถานะการชำระเงินปัจจุบันคือ ${sub.paymentStatus}`,
        );
      }
      if (body.paymentStatus === "rejected" && !body.note?.trim()) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "กรุณาระบุเหตุผลในการปฏิเสธ");
      }
      await db
        .update(submissions)
        .set({
          paymentStatus: body.paymentStatus,
          paymentVerifiedBy: admin.id,
          paymentVerifiedAt: new Date(),
          paymentNote: body.paymentStatus === "rejected" ? body.note : null,
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
      params: t.Object({ id: t.String() }),
      body: t.Object({
        paymentStatus: t.Union([t.Literal("verified"), t.Literal("rejected")]),
        note: t.Optional(t.String()),
      }),
    },
  )
  .post(
    "/email-notifications/:id/retry",
    async ({ params, set }) => {
      const [notification] = await db.select().from(emailNotifications).where(eq(emailNotifications.id, params.id)).limit(1);
      if (!notification) {
        set.status = 404;
        return fail("NOT_FOUND", "ไม่พบรายการอีเมล");
      }
      return ok(await retryTrackedEmail(notification.id));
    },
    { params: t.Object({ id: t.String() }) },
  );
