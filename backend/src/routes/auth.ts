import { Elysia, t } from "elysia";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { jwtPlugin, authPlugin, requireAuth } from "../middleware/auth";
import { ok, fail } from "../utils/response";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)
  .use(authPlugin)
  .post(
    "/register",
    async ({ body, jwt, set }) => {
      const { email, password, name, affiliation } = body;

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
        role: "author",
      });

      const token = await jwt.sign({ sub: id });

      set.status = 201;
      return ok({ token, user: { id, email, name, affiliation, role: "author" as const } });
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 }),
        name: t.String({ minLength: 1 }),
        affiliation: t.Optional(t.String()),
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
  .use(requireAuth)
  .get("/me", ({ user }) => {
    return ok({ user });
  });
