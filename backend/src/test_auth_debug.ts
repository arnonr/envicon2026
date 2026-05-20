import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZjQyZDkzYS0wOTFlLTQxNmEtYTIxMS00ZDBmMzIzZWExY2EiLCJleHAiOjE3NzYzMzc2MTksImlhdCI6MTc3NTczMjgxOX0.xVrjT-u2f-yyCznyh9zKBp93PIbLpcCUf5MYQnSJxb8";

const app = new Elysia()
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET || "envicon2026-dev-secret", exp: "7d" }))
  .derive(async ({ jwt, headers }) => {
    console.log("DERIVE CALLED - jwt:", typeof jwt, "headers.auth:", headers.authorization?.slice(0, 20));
    const authorization = headers.authorization;
    if (!authorization?.startsWith("Bearer ")) return { user: null };
    const token = authorization.slice(7);
    const payload = await jwt.verify(token);
    console.log("PAYLOAD:", JSON.stringify(payload));
    if (!payload || typeof payload.sub !== "string") return { user: null };
    const [user] = await db.select({ id: users.id, email: users.email, role: users.role })
      .from(users).where(eq(users.id, payload.sub)).limit(1);
    console.log("USER FROM DB:", JSON.stringify(user));
    return { user: user ?? null };
  })
  .get("/test", ({ user }) => {
    console.log("HANDLER user:", JSON.stringify(user));
    return { user };
  })
  .listen(3099);

await new Promise(r => setTimeout(r, 300));
const res = await fetch("http://localhost:3099/test", {
  headers: { Authorization: `Bearer ${TOKEN}` }
});
const body = await res.json();
console.log("BODY:", JSON.stringify(body));
process.exit(0);
