import { Elysia } from "elysia";

export const registrationRoutes = new Elysia({ prefix: "/registrations" })
  .get("/", () => ({ message: "TODO" }))
  .post("/", () => ({ message: "TODO" }));
