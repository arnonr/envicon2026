import { Elysia } from "elysia";

export const submissionRoutes = new Elysia({ prefix: "/submissions" })
  .get("/", () => ({ message: "TODO" }))
  .get("/:id", () => ({ message: "TODO" }))
  .post("/", () => ({ message: "TODO" }));
