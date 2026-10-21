import { Elysia, t } from "elysia";
import { db } from "../db";
import { eventRegistrations, users } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { ok, fail } from "../utils/response";
import { saveFile } from "../services/storage";
import { calculateFee } from "../utils/fees";
import { findEventRegistrationByEmail, syncEventRegistrationToUserSubmissions } from "../services/event-registration-sync";

// Set to true when event registration payment collection is enabled again.
const EVENT_REGISTRATION_PAYMENT_ENABLED = true;

export const publicRoutes = new Elysia({ prefix: "/public" })
  .get(
    "/check-event-registration",
    async ({ query }) => {
      const email = query.email.trim().toLowerCase();
      if (!email) {
        return ok({ foundInEventRegistration: false, hasUserAccount: false, prefill: null });
      }

      const [reg, [existingUser]] = await Promise.all([
        findEventRegistrationByEmail(email),
        db
          .select({ id: users.id })
          .from(users)
          .where(sql`LOWER(TRIM(${users.email})) = ${email}`)
          .limit(1),
      ]);

      const foundInEventRegistration = Boolean(reg);
      const hasUserAccount = Boolean(existingUser);

      return ok({
        foundInEventRegistration,
        hasUserAccount,
        feeType: reg?.feeType ?? null,
        prefill:
          foundInEventRegistration && !hasUserAccount && reg
            ? {
                fullName: reg.fullName,
                affiliation: reg.affiliation ?? "",
                phone: reg.phone ?? "",
                feeType: reg.feeType,
              }
            : null,
      });
    },
    {
      query: t.Object({
        email: t.String(),
      }),
    },
  )
  .post(
  "/register",
  async ({ body, set }) => {
    const cleanEmail = body.email.trim().toLowerCase();
    const existing = await findEventRegistrationByEmail(cleanEmail);

    if (existing) {
      set.status = 409;
      return fail("CONFLICT", "อีเมลนี้ลงทะเบียนแล้ว");
    }

    try {
      const result = await db.insert(eventRegistrations).values({
        fullName: body.fullName.trim(),
        affiliation: body.affiliation?.trim() || null,
        phone: body.phone?.trim() || null,
        email: cleanEmail,
        feeType: body.feeType,
        fee: EVENT_REGISTRATION_PAYMENT_ENABLED ? calculateFee(body.feeType) : 0,
        paymentSlipUrl: EVENT_REGISTRATION_PAYMENT_ENABLED && body.paymentSlip
          ? await saveFile(body.paymentSlip, `event-slip-${crypto.randomUUID()}`)
          : null,
        paymentStatus: EVENT_REGISTRATION_PAYMENT_ENABLED ? "pending_verification" : "confirmed",
        receiptName: body.receiptName.trim(),
        receiptTaxId: body.receiptTaxId.trim(),
        receiptAddress: body.receiptAddress.trim(),
      });

      const [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(sql`LOWER(TRIM(${users.email})) = ${cleanEmail}`)
        .limit(1);
      if (existingUser) {
        await syncEventRegistrationToUserSubmissions(existingUser.id, cleanEmail);
      }

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
      feeType: t.Union([t.Literal("student"), t.Literal("general")]),
      paymentSlip: t.Optional(t.File({ type: ["application/pdf", "image/png", "image/jpeg"], maxSize: 10 * 1024 * 1024 })),
      receiptName: t.String({ minLength: 1, maxLength: 255 }),
      receiptTaxId: t.String({ minLength: 1, maxLength: 20 }),
      receiptAddress: t.String({ minLength: 1 }),
    }),
  },
);
