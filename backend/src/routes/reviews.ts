import { Elysia } from "elysia";

export const reviewRoutes = new Elysia({ prefix: "/reviews" })
  .get("/", () => ({ message: "TODO" }))
  .get("/:id", () => ({ message: "TODO" }))
  .put("/:id", () => ({ message: "TODO" }));
