import { Elysia } from "elysia";
import { getUserFromHeaders } from "./auth";
import { fail } from "../utils/response";

export const requireRole = (roles: string[]) =>
  new Elysia({ name: `role:${roles.join(",")}` })
    .onBeforeHandle({ as: "scoped" }, async ({ headers, set }) => {
      const user = await getUserFromHeaders(headers.authorization);
      if (!user) {
        set.status = 401;
        return fail("UNAUTHORIZED", "Authentication required");
      }
      if (!roles.includes(user.role)) {
        set.status = 403;
        return fail("FORBIDDEN", "Insufficient permissions");
      }
    });

export const requireAdmin = requireRole(["admin"]);
export const requireReviewer = requireRole(["reviewer", "admin"]);
export const requireAuthor = requireRole(["author", "admin"]);
