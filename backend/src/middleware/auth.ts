import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { fail } from "../utils/response";

export const jwtPlugin = new Elysia({ name: "jwt" }).use(
  jwt({
    name: "jwt",
    secret: process.env.JWT_SECRET || "envicon2026-dev-secret",
    exp: "7d",
  })
);

export const authPlugin = new Elysia({ name: "auth" })
  .use(jwtPlugin)
  .derive(async ({ jwt, headers, set }) => {
    const authorization = headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      return { user: null };
    }

    const token = authorization.slice(7);
    const payload = await jwt.verify(token);
    if (!payload || typeof payload.sub !== "string") {
      return { user: null };
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        affiliation: users.affiliation,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    return { user: user ?? null };
  });

export const requireAuth = new Elysia({ name: "requireAuth" })
  .use(authPlugin)
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return fail("UNAUTHORIZED", "Authentication required");
    }
  });
