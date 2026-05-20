import { Elysia, t } from "elysia";
import { db } from "../db";
import { submissions, revisions } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { ok, fail } from "../utils/response";
import { saveFile } from "../services/storage";

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

  // List: author sees own, admin sees all
  .get("/", async ({ user }) => {
    if (user!.role === "admin") {
      const all = await db
        .select()
        .from(submissions)
        .orderBy(desc(submissions.updatedAt));
      return ok(all);
    }
    const own = await db
      .select()
      .from(submissions)
      .where(eq(submissions.authorId, user!.id))
      .orderBy(desc(submissions.updatedAt));
    return ok(own);
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

    if (user!.role === "author" && sub.authorId !== user!.id) {
      set.status = 403;
      return fail("FORBIDDEN", "Access denied");
    }

    const revisionList = await db
      .select()
      .from(revisions)
      .where(eq(revisions.submissionId, params.id))
      .orderBy(desc(revisions.version));

    return ok({ ...sub, revisions: revisionList });
  })

  // Create draft submission
  .post(
    "/",
    async ({ body, user, set }) => {
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
      if (sub.authorId !== user!.id && user!.role !== "admin") {
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
      if (!["draft", "pending_payment"].includes(sub.status)) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "Cannot upload in current status");
      }

      const fileUrl = await saveFile(body.file, `abstract-${params.id}`);

      await db
        .update(submissions)
        .set({ abstractFileUrl: fileUrl, status: "pending_payment", submittedAt: new Date() })
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
        file: t.File({ type: "application/pdf", maxSize: "50mb" }),
      }),
    }
  )

  // Upload full paper PDF
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
        file: t.File({ type: "application/pdf", maxSize: "50mb" }),
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

      await db
        .update(submissions)
        .set({ status: "pending_payment", fullPaperFileUrl: fileUrl })
        .where(eq(submissions.id, params.id));

      return ok({ message: "Revision submitted successfully", version: nextVersion });
    },
    {
      body: t.Object({
        file: t.File({ type: "application/pdf", maxSize: "50mb" }),
        changelog: t.Optional(t.String()),
      }),
    }
  );
