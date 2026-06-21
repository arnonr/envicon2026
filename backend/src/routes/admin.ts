import { Elysia, t } from "elysia";
import ExcelJS from "exceljs";
import { db } from "../db";
import { registrations, users, submissions, reviews, reviewRounds, eventRegistrations } from "../db/schema";
import { eq, desc, and, inArray, sql } from "drizzle-orm";
import { requireAdmin } from "../middleware/roles";
import { getUserFromHeaders } from "../middleware/auth";
import { ok, fail, paginated } from "../utils/response";
import { calculateFee } from "../utils/fees";

const TRACK_NAMES: Record<number, string> = {
  1: "วิทยาศาสตร์สิ่งแวดล้อมและการควบคุมมลพิษ",
  2: "การจัดการระบบนิเวศและทรัพยากรธรรมชาติ",
  3: "เศรษฐกิจหมุนเวียนและการใช้ทรัพยากรอย่างคุ้มค่า",
  4: "การเปลี่ยนแปลงสภาพภูมิอากาศและเทคโนโลยีคาร์บอนต่ำ",
  5: "เทคโนโลยีดิจิทัลและระบบอัจฉริยะเพื่อการติดตามสิ่งแวดล้อม",
  6: "เมืองยั่งยืน อุตสาหกรรมสีเขียว และการจัดการสิ่งแวดล้อม",
  7: "สิ่งแวดล้อมและสุขภาพ",
};

const STATUS_NAMES: Record<string, string> = {
  draft: "ร่าง",
  submitted: "ส่งแล้ว",
  under_review: "กำลังพิจารณา",
  accepted: "ผ่านการพิจารณา",
  rejected: "ไม่ผ่าน",
  revision_requested: "ขอแก้ไข",
};

const PAYMENT_STATUS_NAMES: Record<string, string> = {
  unpaid: "ยังไม่ชำระ",
  pending_verification: "รอตรวจสอบ",
  verified: "ชำระแล้ว",
  rejected: "ปฏิเสธ",
};

const EDUCATION_LEVEL_NAMES: Record<string, string> = {
  bachelor: "ปริญญาตรี",
  master: "ปริญญาโท",
  doctorate: "ปริญญาเอก",
};

const PRESENTATION_FORMAT_NAMES: Record<string, string> = {
  oral: "แบบบรรยาย",
  poster: "โปสเตอร์",
};

function formatExportDate(value: Date | string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCreators(raw: string | null) {
  if (!raw) return "";
  try {
    const creators: unknown = JSON.parse(raw);
    if (!Array.isArray(creators)) return "";
    return creators
      .map((creator) => {
        if (!creator || typeof creator !== "object") return "";
        const firstName = "firstName" in creator && typeof creator.firstName === "string" ? creator.firstName : "";
        const lastName = "lastName" in creator && typeof creator.lastName === "string" ? creator.lastName : "";
        return `${firstName} ${lastName}`.trim();
      })
      .filter(Boolean)
      .join(", ");
  } catch {
    return "";
  }
}

function absoluteFileUrl(url: string | null, origin: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return new URL(url, origin).toString();
}

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .use(requireAdmin)
  .get("/stats", async () => {
    const [
      subsCount,
      regsCount,
      usersCount,
      reviewsCount,
      submissionsByStatus,
      registrationsByPayment,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(submissions),
      db.select({ count: sql<number>`count(*)` }).from(registrations),
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(reviews),
      db.select({ status: submissions.status, count: sql<number>`count(*)` })
        .from(submissions).groupBy(submissions.status),
      db.select({ paymentStatus: registrations.paymentStatus, count: sql<number>`count(*)` })
        .from(registrations).groupBy(registrations.paymentStatus),
    ]);

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
  .get("/submissions", async ({ query, set }) => {
    const conditions = [];
    if (query.status) {
      if (!(query.status in STATUS_NAMES)) {
        set.status = 400;
        return fail("VALIDATION_ERROR", `Invalid status: ${query.status}`);
      }
      conditions.push(eq(submissions.status, query.status as typeof submissions.status.enumValues[number]));
    }
    if (query.paymentStatus) conditions.push(eq(submissions.paymentStatus, query.paymentStatus as typeof submissions.paymentStatus.enumValues[number]));
    if (query.track) conditions.push(eq(submissions.track, Number(query.track)));

    const where = conditions.length ? and(...conditions) : undefined;

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const offset = (page - 1) * limit;

    const [rows, countResult] = await Promise.all([
      db
        .select({
          id: submissions.id,
          title: submissions.title,
          titleEn: submissions.titleEn,
          track: submissions.track,
          submitterType: submissions.submitterType,
          educationLevel: submissions.educationLevel,
          presentationFormat: submissions.presentationFormat,
          status: submissions.status,
          abstractFileUrl: submissions.abstractFileUrl,
          fullPaperFileUrl: submissions.fullPaperFileUrl,
          paymentSlipUrl: submissions.paymentSlipUrl,
          paymentStatus: submissions.paymentStatus,
          submittedAt: submissions.submittedAt,
          updatedAt: submissions.updatedAt,
          authorName: users.name,
          authorEmail: users.email,
          authorAffiliation: users.affiliation,
        })
        .from(submissions)
        .leftJoin(users, eq(submissions.authorId, users.id))
        .where(where)
        .orderBy(desc(submissions.updatedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(submissions)
        .where(where),
    ]);

    const submissionIds = rows.map((submission) => submission.id);
    const roundRows = submissionIds.length
      ? await db
        .select({
          id: reviewRounds.id,
          submissionId: reviewRounds.submissionId,
        })
        .from(reviewRounds)
        .where(inArray(reviewRounds.submissionId, submissionIds))
        .orderBy(desc(reviewRounds.roundNumber))
      : [];
    const latestRoundBySubmission = new Map<string, string>();
    for (const round of roundRows) {
      if (!latestRoundBySubmission.has(round.submissionId)) {
        latestRoundBySubmission.set(round.submissionId, round.id);
      }
    }

    const latestRoundIds = [...latestRoundBySubmission.values()];
    const reviewRows = latestRoundIds.length
      ? await db
        .select({ roundId: reviews.roundId, status: reviews.status })
        .from(reviews)
        .where(inArray(reviews.roundId, latestRoundIds))
      : [];
    const progressByRound = new Map<string, { assigned: number; completed: number }>();
    for (const review of reviewRows) {
      const progress = progressByRound.get(review.roundId) ?? { assigned: 0, completed: 0 };
      progress.assigned += 1;
      if (review.status === "completed") progress.completed += 1;
      progressByRound.set(review.roundId, progress);
    }

    const rowsWithReviewProgress = rows.map((submission) => {
      const roundId = latestRoundBySubmission.get(submission.id);
      const progress = roundId ? progressByRound.get(roundId) : undefined;
      return {
        ...submission,
        completedReviewCount: progress?.completed ?? 0,
        assignedReviewerCount: progress?.assigned ?? 0,
      };
    });

    return paginated(rowsWithReviewProgress, page, limit, Number(countResult[0]?.count ?? 0));
  }, {
    query: t.Object({
      status: t.Optional(t.String()),
      paymentStatus: t.Optional(t.String()),
      track: t.Optional(t.String()),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })
  .get("/submissions/export", async ({ query, request, set }) => {
    const conditions = [];
    if (query.status) {
      if (!(query.status in STATUS_NAMES)) {
        set.status = 400;
        return fail("VALIDATION_ERROR", `Invalid status: ${query.status}`);
      }
      conditions.push(eq(submissions.status, query.status as typeof submissions.status.enumValues[number]));
    }
    if (query.track) conditions.push(eq(submissions.track, Number(query.track)));

    const where = conditions.length ? and(...conditions) : undefined;
    const rows = await db
      .select({
        id: submissions.id,
        title: submissions.title,
        titleEn: submissions.titleEn,
        creators: submissions.creators,
        abstract: submissions.abstract,
        keywords: submissions.keywords,
        track: submissions.track,
        submitterType: submissions.submitterType,
        educationLevel: submissions.educationLevel,
        presentationFormat: submissions.presentationFormat,
        status: submissions.status,
        abstractFileUrl: submissions.abstractFileUrl,
        fullPaperFileUrl: submissions.fullPaperFileUrl,
        paymentSlipUrl: submissions.paymentSlipUrl,
        paymentStatus: submissions.paymentStatus,
        submittedAt: submissions.submittedAt,
        updatedAt: submissions.updatedAt,
        authorName: users.name,
        authorEmail: users.email,
        authorAffiliation: users.affiliation,
      })
      .from(submissions)
      .leftJoin(users, eq(submissions.authorId, users.id))
      .where(where)
      .orderBy(desc(submissions.updatedAt));

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "ENVICON 2026";
    workbook.created = new Date();
    const worksheet = workbook.addWorksheet("ผลงาน", {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    worksheet.columns = [
      { header: "ลำดับ", key: "sequence", width: 9 },
      { header: "รหัสผลงาน", key: "id", width: 38 },
      { header: "ชื่อเรื่องภาษาไทย", key: "title", width: 44 },
      { header: "ชื่อเรื่องภาษาอังกฤษ", key: "titleEn", width: 44 },
      { header: "รายชื่อผู้จัดทำ", key: "creators", width: 36 },
      { header: "ชื่อผู้ส่ง", key: "authorName", width: 28 },
      { header: "อีเมลผู้ส่ง", key: "authorEmail", width: 30 },
      { header: "สังกัด", key: "authorAffiliation", width: 32 },
      { header: "ประเภทผู้ส่ง", key: "submitterType", width: 28 },
      { header: "ระดับการศึกษา", key: "educationLevel", width: 18 },
      { header: "รูปแบบการนำเสนอ", key: "presentationFormat", width: 18 },
      { header: "หัวข้อ", key: "track", width: 52 },
      { header: "สถานะ", key: "status", width: 28 },
      { header: "คำสำคัญ", key: "keywords", width: 35 },
      { header: "บทคัดย่อ", key: "abstract", width: 70 },
      { header: "วันที่ส่ง", key: "submittedAt", width: 22 },
      { header: "วันที่แก้ไขล่าสุด", key: "updatedAt", width: 22 },
      { header: "ลิงก์ไฟล์บทคัดย่อ", key: "abstractFileUrl", width: 55 },
      { header: "ลิงก์ไฟล์ฉบับเต็ม", key: "fullPaperFileUrl", width: 55 },
      { header: "ลิงก์หลักฐานชำระเงิน", key: "paymentSlipUrl", width: 55 },
      { header: "สถานะการชำระเงิน", key: "paymentStatus", width: 20 },
    ];

    const origin = new URL(request.url).origin;
    rows.forEach((submission, index) => {
      const abstractFileUrl = absoluteFileUrl(submission.abstractFileUrl, origin);
      const fullPaperFileUrl = absoluteFileUrl(submission.fullPaperFileUrl, origin);
      const paymentSlipUrl = absoluteFileUrl(submission.paymentSlipUrl, origin);
      const row = worksheet.addRow({
        sequence: index + 1,
        id: submission.id,
        title: submission.title,
        titleEn: submission.titleEn ?? "",
        creators: formatCreators(submission.creators),
        authorName: submission.authorName ?? "",
        authorEmail: submission.authorEmail ?? "",
        authorAffiliation: submission.authorAffiliation ?? "",
        submitterType: submission.submitterType === "student" ? "นิสิต/นักศึกษา" : "อาจารย์/นักวิจัย/บุคคลทั่วไป",
        educationLevel: EDUCATION_LEVEL_NAMES[submission.educationLevel] ?? submission.educationLevel,
        presentationFormat: PRESENTATION_FORMAT_NAMES[submission.presentationFormat] ?? submission.presentationFormat,
        track: TRACK_NAMES[submission.track] ?? String(submission.track),
        status: STATUS_NAMES[submission.status] ?? submission.status,
        keywords: submission.keywords ?? "",
        abstract: submission.abstract ?? "",
        submittedAt: formatExportDate(submission.submittedAt),
        updatedAt: formatExportDate(submission.updatedAt),
        abstractFileUrl,
        fullPaperFileUrl,
        paymentSlipUrl,
        paymentStatus: PAYMENT_STATUS_NAMES[submission.paymentStatus] ?? submission.paymentStatus,
      });

      for (const [key, url] of [
        ["abstractFileUrl", abstractFileUrl],
        ["fullPaperFileUrl", fullPaperFileUrl],
        ["paymentSlipUrl", paymentSlipUrl],
      ] as const) {
        if (!url) continue;
        const cell = row.getCell(key);
        cell.value = { text: url, hyperlink: url };
        cell.font = { color: { argb: "FF0563C1" }, underline: true };
      }
    });

    worksheet.autoFilter = "A1:U1";
    worksheet.getRow(1).height = 28;
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF047857" } };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    });
    for (const key of ["title", "titleEn", "creators", "keywords", "abstract"] as const) {
      worksheet.getColumn(key).alignment = { vertical: "top", wrapText: true };
    }
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.alignment = { vertical: "top" };
    });

    const file = await workbook.xlsx.writeBuffer();
    const filename = `envicon-submissions-${new Date().toISOString().slice(0, 10)}.xlsx`;
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }, {
    query: t.Object({
      status: t.Optional(t.String()),
      track: t.Optional(t.String()),
    }),
  })
  .get("/registrations", async () => {
    const rows = await db
      .select({
        id: eventRegistrations.id,
        fullName: eventRegistrations.fullName,
        affiliation: eventRegistrations.affiliation,
        phone: eventRegistrations.phone,
        email: eventRegistrations.email,
        createdAt: eventRegistrations.createdAt,
      })
      .from(eventRegistrations)
      .orderBy(desc(eventRegistrations.createdAt));

    return ok(rows);
  })
  .put(
    "/registrations/:id/confirm",
    async ({ headers, params, set }) => {
      const user = (await getUserFromHeaders(headers.authorization))!;

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
      if (body.status === "under_review" || ["accepted", "rejected", "revision_requested"].includes(body.status)) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "กรุณาเริ่มพิจารณา ตัดสิน และแจ้งผลผ่านกระบวนการรีวิว");
      }

      await db
        .update(submissions)
        .set({ status: body.status })
        .where(eq(submissions.id, params.id));

      const [updated] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);

      return ok(updated);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        status: t.Union([
          t.Literal("draft"),
          t.Literal("submitted"),
          t.Literal("under_review"),
          t.Literal("accepted"),
          t.Literal("rejected"),
          t.Literal("revision_requested"),
        ]),
      }),
    },
  );
