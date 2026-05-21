import { Elysia, t } from "elysia";
import { db } from "../db";
import { eventRegistrations } from "../db/schema";
import { eq } from "drizzle-orm";
import { ok, fail } from "../utils/response";

export const publicRoutes = new Elysia({ prefix: "/public" }).post(
  "/register",
  async ({ body, set }) => {
    const [existing] = await db
      .select({ id: eventRegistrations.id })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.email, body.email))
      .limit(1);

    if (existing) {
      set.status = 409;
      return fail("CONFLICT", "อีเมลนี้ลงทะเบียนแล้ว");
    }

    const id = crypto.randomUUID();

    await db.insert(eventRegistrations).values({
      id,
      fullName: body.fullName,
      affiliation: body.affiliation,
      phone: body.phone,
      email: body.email,
    });

    set.status = 201;
    return ok({ id }, "ลงทะเบียนสำเร็จ");
  },
  {
    body: t.Object({
      fullName: t.String({ minLength: 2, maxLength: 255 }),
      affiliation: t.Optional(t.String({ maxLength: 500 })),
      phone: t.Optional(t.String({ maxLength: 20 })),
      email: t.String({ format: "email", maxLength: 255 }),
    }),
  },
);