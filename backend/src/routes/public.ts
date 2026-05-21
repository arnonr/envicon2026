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

    try {
      const result = await db.insert(eventRegistrations).values({
        fullName: body.fullName,
        affiliation: body.affiliation,
        phone: body.phone,
        email: body.email,
      });

      const id = (result as any)[0]?.insertId || crypto.randomUUID();
      set.status = 201;
      return ok({ id }, "ลงทะเบียนสำเร็จ");
    } catch (err: any) {
      if (err?.code === "ER_DUP_ENTRY") {
        set.status = 409;
        return fail("CONFLICT", "อีเมลนี้ลงทะเบียนแล้ว");
      }
      throw err;
    }
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