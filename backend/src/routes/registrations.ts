import { Elysia, t } from "elysia";
import { db } from "../db";
import { registrations, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { ok, fail } from "../utils/response";
import { calculateFee } from "../utils/fees";

export const registrationRoutes = new Elysia({ prefix: "/registrations" })
  .use(requireAuth)
  .post(
    "/",
    async ({ user, body, set }) => {
      if (!user) return;

      const [existing] = await db
        .select({ id: registrations.id })
        .from(registrations)
        .where(eq(registrations.userId, user.id))
        .limit(1);

      if (existing) {
        set.status = 409;
        return fail("CONFLICT", "คุณลงทะเบียนแล้ว");
      }

      const fee = calculateFee(body.type);
      const id = crypto.randomUUID();

      await db.insert(registrations).values({
        id,
        userId: user.id,
        type: body.type,
      });

      set.status = 201;
      return ok({
        id,
        type: body.type,
        fee,
        paymentStatus: "pending",
      });
    },
    {
      body: t.Object({
        type: t.Union([t.Literal("student"), t.Literal("general")]),
      }),
    },
  )
  .get("/", async ({ user, set }) => {
    if (!user) return;

    const [reg] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.userId, user.id))
      .limit(1);

    if (!reg) {
      set.status = 404;
      return fail("NOT_FOUND", "ยังไม่ได้ลงทะเบียน");
    }

    const fee = calculateFee(reg.type as "student" | "general");
    return ok({ ...reg, fee });
  });
