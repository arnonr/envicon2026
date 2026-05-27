import { Elysia, t } from "elysia";
import { db } from "../db";
import { passwordSetupTokens, users } from "../db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";
import { jwtPlugin, authPlugin, requireAuth } from "../middleware/auth";
import { ok, fail } from "../utils/response";
import { hashSetupToken } from "../services/password-setup";

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
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, setup.userId))
        .limit(1);
      return ok(user);
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

      const passwordHash = await Bun.password.hash(body.password, {
        algorithm: "bcrypt",
        cost: 10,
      });
      await db.update(users).set({ passwordHash }).where(eq(users.id, setup.userId));
      await db.update(passwordSetupTokens).set({ usedAt: new Date() }).where(eq(passwordSetupTokens.id, setup.id));
      return ok({ ready: true }, "ตั้งรหัสผ่านสำเร็จ");
    },
    {
      body: t.Object({
        token: t.String(),
        password: t.String({ minLength: 8 }),
      }),
    },
  )
  .use(requireAuth)
  .get("/me", ({ user }) => {
    return ok({ user });
  });
