import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./routes/auth";
import { submissionRoutes } from "./routes/submissions";
import { reviewRoutes } from "./routes/reviews";
import { adminRoutes } from "./routes/admin";
import { registrationRoutes } from "./routes/registrations";
import { ok, fail } from "./utils/response";

const app = new Elysia({ prefix: "/envicon2026/api" })
  .use(cors())
  .onError(({ code, error, set }) => {
    console.error(`[${code}]`, error);

    if (code === "VALIDATION") {
      set.status = 400;
      return fail("VALIDATION_ERROR", error.message);
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return fail("NOT_FOUND", "Endpoint not found");
    }

    set.status = 500;
    return fail("INTERNAL_ERROR", "Internal server error");
  })
  .get("/health", () => ok({ status: "ok", timestamp: new Date().toISOString() }))
  .use(authRoutes)
  .use(submissionRoutes)
  .use(reviewRoutes)
  .use(adminRoutes)
  .use(registrationRoutes)
  .listen(3001);

console.log(`🌿 ENVICON 2026 API running at http://localhost:${app.server?.port}`);

export type App = typeof app;
