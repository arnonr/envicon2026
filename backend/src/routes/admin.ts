import { Elysia, t } from "elysia";
import { db } from "../db";
import { registrations, users, submissions, reviews } from "../db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAdmin } from "../middleware/roles";
import { ok, fail } from "../utils/response";
import { calculateFee } from "../utils/fees";

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .use(requireAdmin)
  .get("/stats", async () => {
    const [
      subsCount,
      regsCount,
      usersCount,
      reviewsCount,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(submissions),
      db.select({ count: sql<number>`count(*)` }).from(registrations),
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(reviews),
    ]);

    const submissionsByStatus = await db
      .select({ status: submissions.status, count: sql<number>`count(*)` })
      .from(submissions)
      .groupBy(submissions.status);

    const registrationsByPayment = await db
      .select({ paymentStatus: registrations.paymentStatus, count: sql<number>`count(*)` })
      .from(registrations)
      .groupBy(registrations.paymentStatus);

    return ok({
      totalSubmissions: Number(subsCount[0]?.count ?? 0),
      totalRegistrations: Number(regsCount[0]?.count ?? 0),
      totalUsers: Number(usersCount[0]?.count ?? 0),
      totalReviews: Number(reviewsCount[0]?.count ?? 0),
      submissionsByStatus: Object.fromEntries(
        submissionsByStatus.map((s) => [s.status, Number(s.count)])
      ),
      registrationsByPayment: Object.fromEntries(
        registrationsByPayment.map((r) => [r.paymentStatus, Number(r.count)])
      ),
    });
  })
  .get("/submissions", async ({ query }) => {
    const conditions = [];
    if (query.status) conditions.push(eq(submissions.status, query.status));
    if (query.track) conditions.push(eq(submissions.track, Number(query.track)));

    const rows = await db
      .select({
        id: submissions.id,
        title: submissions.title,
        titleEn: submissions.titleEn,
        track: submissions.track,
        submitterType: submissions.submitterType,
        status: submissions.status,
        abstractFileUrl: submissions.abstractFileUrl,
        fullPaperFileUrl: submissions.fullPaperFileUrl,
        paymentSlipUrl: submissions.paymentSlipUrl,
        submittedAt: submissions.submittedAt,
        updatedAt: submissions.updatedAt,
        authorName: users.name,
        authorEmail: users.email,
        authorAffiliation: users.affiliation,
      })
      .from(submissions)
      .leftJoin(users, eq(submissions.authorId, users.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(submissions.updatedAt));

    return ok(rows);
  }, {
    query: t.Object({
      status: t.Optional(t.String()),
      track: t.Optional(t.String()),
    }),
  })
  .get("/reviewers", () => ({ message: "TODO" }))
  .get("/registrations", async ({ query }) => {
    let rows = await db
      .select({
        id: registrations.id,
        userId: registrations.userId,
        type: registrations.type,
        paymentStatus: registrations.paymentStatus,
        confirmedBy: registrations.confirmedBy,
        registeredAt: registrations.registeredAt,
        userName: users.name,
        userEmail: users.email,
        userAffiliation: users.affiliation,
        userPhone: users.phone,
      })
      .from(registrations)
      .leftJoin(users, eq(registrations.userId, users.id));

    if (query.paymentStatus) {
      rows = rows.filter((r) => r.paymentStatus === query.paymentStatus);
    }

    const result = rows.map((r) => ({
      ...r,
      fee: calculateFee(r.type as "student" | "general"),
    }));

    return ok(result);
  }, {
    query: t.Object({
      paymentStatus: t.Optional(t.String()),
    }),
  })
  .put(
    "/registrations/:id/confirm",
    async ({ user, params, set }) => {
      if (!user) return;

      const [reg] = await db
        .select()
        .from(registrations)
        .where(eq(registrations.id, params.id))
        .limit(1);

      if (!reg) {
        set.status = 404;
        return fail("NOT_FOUND", "ไม่พบข้อมูลการลงทะเบียน");
      }

      await db
        .update(registrations)
        .set({ paymentStatus: "confirmed", confirmedBy: user.id })
        .where(eq(registrations.id, params.id));

      return ok({ id: reg.id, paymentStatus: "confirmed" });
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .patch(
    "/submissions/:id/status",
    async ({ params, body, set }) => {
      const [existing] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);

      if (!existing) {
        set.status = 404;
        return fail("NOT_FOUND", "ไม่พบข้อมูลการส่งบทความ");
      }

      const [updated] = await db
        .update(submissions)
        .set({ status: body.status })
        .where(eq(submissions.id, params.id))
        .returning();

      return ok(updated);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        status: t.Union([
          t.Literal("draft"),
          t.Literal("pending_payment"),
          t.Literal("payment_verifying"),
          t.Literal("submitted"),
          t.Literal("under_review"),
          t.Literal("accepted"),
          t.Literal("rejected"),
          t.Literal("revision_requested"),
        ]),
      }),
    },
  );
