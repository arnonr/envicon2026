import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { jwtVerify } from "jose";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { fail } from "../utils/response";

const JWT_SECRET = process.env.JWT_SECRET || "envicon2026-dev-secret";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// For auth routes that need to sign tokens
export const jwtPlugin = new Elysia({ name: "jwt" }).use(
  jwt({ name: "jwt", secret: JWT_SECRET, exp: "7d" })
);

// Verifies Bearer token, returns user from DB or null
export async function getUserFromHeaders(authorization: string | undefined) {
  if (!authorization?.startsWith("Bearer ")) return null;
  try {
    const { payload } = await jwtVerify(authorization.slice(7), SECRET_KEY);
    if (typeof payload.sub !== "string") return null;
    const [user] = await db
      .select({ id: users.id, email: users.email, name: users.name, affiliation: users.affiliation, phone: users.phone, role: users.role })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);
    return user ?? null;
  } catch {
    return null;
  }
}

// Apply directly to each protected route group:
// .use(requireAuth) → scoped derive + guard propagate to parent instance
export const requireAuth = new Elysia()
  .derive({ as: "scoped" }, async ({ headers }) => ({
    user: await getUserFromHeaders(headers.authorization),
  }))
  .onBeforeHandle({ as: "scoped" }, ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return fail("UNAUTHORIZED", "Authentication required");
    }
  });

// Alias used in authRoutes for deriving user
export const authPlugin = new Elysia({ name: "authPlugin" }).derive(
  { as: "scoped" },
  async ({ headers }) => ({ user: await getUserFromHeaders(headers.authorization) })
);
