import { Elysia, t } from "elysia";
import { db } from "../db";
import { passwordSetupTokens, reviewerExpertiseTracks, users } from "../db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";
import { jwtPlugin, authPlugin, requireAuth } from "../middleware/auth";
import { ok, fail } from "../utils/response";
import { hashSetupToken, issuePasswordSetupToken } from "../services/password-setup";
import { appUrl, escapeHtml, sendTrackedEmail } from "../services/email";

const PASSWORD_RESET_RESPONSE = "หากอีเมลนี้อยู่ในระบบ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้";

function passwordResetEmailHtml(user: { name: string }, link: string) {
  return `
    <div style="margin:0;padding:0;background:#f6f8fb;font-family:Sarabun,Arial,sans-serif;color:#172033;">
      <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
        <div style="background:#ffffff;border:1px solid #e6ebf2;border-radius:12px;overflow:hidden;">
          <div style="background:#0f766e;padding:24px 28px;color:#ffffff;">
            <div style="font-size:13px;letter-spacing:.04em;text-transform:uppercase;opacity:.9;">ENVICON 2026</div>
            <h1 style="margin:8px 0 0;font-size:24px;line-height:1.35;font-weight:700;">ตั้งรหัสผ่านใหม่</h1>
          </div>
          <div style="padding:28px;">
            <p style="margin:0 0 16px;font-size:16px;line-height:1.75;">เรียน ${escapeHtml(user.name)}</p>
            <p style="margin:0 0 20px;font-size:16px;line-height:1.75;">
              เราได้รับคำขอตั้งรหัสผ่านใหม่สำหรับบัญชี ENVICON 2026 ของท่าน
              กรุณากดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่
            </p>
            <p style="margin:28px 0;text-align:center;">
              <a href="${link}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:13px 24px;border-radius:8px;">
                ตั้งรหัสผ่านใหม่
              </a>
            </p>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#526173;">
              ลิงก์นี้มีอายุ 72 ชั่วโมง และใช้ได้ครั้งเดียวเท่านั้น
            </p>
            <p style="margin:0;font-size:14px;line-height:1.7;color:#526173;">
              หากท่านไม่ได้ร้องขอ สามารถละเว้นอีเมลนี้ได้ รหัสผ่านเดิมจะยังไม่ถูกเปลี่ยนจนกว่าจะมีการตั้งรหัสผ่านใหม่สำเร็จ
            </p>
          </div>
          <div style="border-top:1px solid #e6ebf2;padding:18px 28px;background:#fbfcfe;color:#738095;font-size:12px;line-height:1.6;">
            อีเมลนี้ส่งจากระบบ ENVICON 2026 กรุณาอย่าตอบกลับอีเมลฉบับนี้
          </div>
        </div>
      </div>
    </div>
  `;
}

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)
  .use(authPlugin)
  .post(
    "/register",
    async ({ body, jwt, set }) => {
      const { email, password, name, affiliation, phone } = body;

      // Check if email already exists
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing) {
        set.status = 409;
        return fail("CONFLICT", "Email already registered");
      }

      const passwordHash = await Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: 10,
      });

      const id = crypto.randomUUID();
      await db.insert(users).values({
        id,
        email,
        passwordHash,
        name,
        affiliation: affiliation ?? null,
        phone: phone ?? null,
        role: "author",
      });

      const token = await jwt.sign({ sub: id });

      set.status = 201;
      return ok({ token, user: { id, email, name, affiliation, phone: phone ?? null, role: "author" as const } });
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 }),
        name: t.String({ minLength: 1 }),
        affiliation: t.Optional(t.String()),
        phone: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, jwt, set }) => {
      const { email, password } = body;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user || !user.passwordHash) {
        set.status = 401;
        return fail("UNAUTHORIZED", "Invalid email or password");
      }

      const valid = await Bun.password.verify(password, user.passwordHash);
      if (!valid) {
        set.status = 401;
        return fail("UNAUTHORIZED", "Invalid email or password");
      }

      const token = await jwt.sign({ sub: user.id });

      return ok({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          affiliation: user.affiliation,
          phone: user.phone,
          role: user.role,
        },
      });
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    }
  )
  .post(
    "/forgot-password",
    async ({ body }) => {
      const email = body.email.trim().toLowerCase();
      const [user] = await db
        .select({ id: users.id, email: users.email, name: users.name })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (user) {
        const token = await issuePasswordSetupToken(user.id);
        const link = appUrl(`/auth/reset-password?token=${encodeURIComponent(token)}`);
        await sendTrackedEmail({
          type: "password_reset",
          recipientEmail: user.email,
          relatedId: user.id,
          subject: "ตั้งรหัสผ่านใหม่ ENVICON 2026",
          htmlBody: passwordResetEmailHtml(user, link),
        });
      }

      return ok({ sent: true }, PASSWORD_RESET_RESPONSE);
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
      }),
    }
  )
  .get(
    "/setup-password/:token",
    async ({ params, set }) => {
      const [setup] = await db
        .select({ id: passwordSetupTokens.id, userId: passwordSetupTokens.userId })
        .from(passwordSetupTokens)
        .where(and(
          eq(passwordSetupTokens.tokenHash, await hashSetupToken(params.token)),
          isNull(passwordSetupTokens.usedAt),
          gt(passwordSetupTokens.expiresAt, new Date()),
        ))
        .limit(1);

      if (!setup) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว");
      }

      const [user] = await db
        .select({ name: users.name, email: users.email, role: users.role, affiliation: users.affiliation })
        .from(users)
        .where(eq(users.id, setup.userId))
        .limit(1);
      if (!user) {
        set.status = 404;
        return fail("NOT_FOUND", "ไม่พบบัญชีผู้ใช้");
      }
      let expertiseTracks: number[] = [];
      if (user.role === "reviewer") {
        const rows = await db
          .select({ track: reviewerExpertiseTracks.track })
          .from(reviewerExpertiseTracks)
          .where(eq(reviewerExpertiseTracks.reviewerId, setup.userId));
        expertiseTracks = rows.map((row) => row.track);
      }
      return ok({ ...user, expertiseTracks });
    },
    { params: t.Object({ token: t.String() }) },
  )
  .post(
    "/setup-password",
    async ({ body, set }) => {
      const [setup] = await db
        .select({ id: passwordSetupTokens.id, userId: passwordSetupTokens.userId })
        .from(passwordSetupTokens)
        .where(and(
          eq(passwordSetupTokens.tokenHash, await hashSetupToken(body.token)),
          isNull(passwordSetupTokens.usedAt),
          gt(passwordSetupTokens.expiresAt, new Date()),
        ))
        .limit(1);

      if (!setup) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว");
      }

      const [targetUser] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, setup.userId))
        .limit(1);
      if (!targetUser) {
        set.status = 404;
        return fail("NOT_FOUND", "ไม่พบบัญชีผู้ใช้");
      }

      const passwordHash = await Bun.password.hash(body.password, {
        algorithm: "bcrypt",
        cost: 10,
      });
      const userUpdate: Partial<typeof users.$inferInsert> = { passwordHash };
      if (body.affiliation !== undefined) {
        userUpdate.affiliation = body.affiliation;
      }
      await db.update(users).set(userUpdate).where(eq(users.id, setup.userId));

      if (targetUser.role === "reviewer" && body.expertiseTracks && body.expertiseTracks.length > 0) {
        await db.delete(reviewerExpertiseTracks).where(eq(reviewerExpertiseTracks.reviewerId, setup.userId));
        await db.insert(reviewerExpertiseTracks).values(
          body.expertiseTracks.map((track) => ({ reviewerId: setup.userId, track })),
        );
      }

      await db.update(passwordSetupTokens).set({ usedAt: new Date() }).where(eq(passwordSetupTokens.id, setup.id));
      return ok({ ready: true }, "ตั้งรหัสผ่านสำเร็จ");
    },
    {
      body: t.Object({
        token: t.String(),
        password: t.String({ minLength: 8 }),
        affiliation: t.Optional(t.String({ minLength: 1, maxLength: 500 })),
        expertiseTracks: t.Optional(t.Array(t.Number({ minimum: 1, maximum: 7 }), { minItems: 1 })),
      }),
    },
  )
  .use(requireAuth)
  .get("/me", ({ user }) => {
    return ok({ user });
  });
