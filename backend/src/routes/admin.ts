import { Elysia } from "elysia";

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .get("/stats", () => ({ message: "TODO" }))
  .get("/submissions", () => ({ message: "TODO" }))
  .get("/reviewers", () => ({ message: "TODO" }))
  .get("/registrations", () => ({ message: "TODO" }));
