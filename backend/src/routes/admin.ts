import { Elysia, t } from "elysia";
import { db } from "../db";
import { registrations, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middleware/roles";
import { ok, fail } from "../utils/response";
import { calculateFee } from "../utils/fees";

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .get("/stats", () => ({ message: "TODO" }))
  .get("/submissions", () => ({ message: "TODO" }))
  .get("/reviewers", () => ({ message: "TODO" }))
  .use(requireAdmin)
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
  );
