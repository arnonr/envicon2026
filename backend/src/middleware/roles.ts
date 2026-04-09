import { Elysia } from "elysia";
import { requireAuth } from "./auth";
import { fail } from "../utils/response";

export const requireRole = (roles: string[]) =>
  new Elysia({ name: `role:${roles.join(",")}` })
    .use(requireAuth)
    .onBeforeHandle(({ user, set }) => {
      if (!user || !roles.includes(user.role)) {
        set.status = 403;
        return fail("FORBIDDEN", "Insufficient permissions");
      }
    });

export const requireAdmin = requireRole(["admin"]);
export const requireReviewer = requireRole(["reviewer", "admin"]);
export const requireAuthor = requireRole(["author", "admin"]);
