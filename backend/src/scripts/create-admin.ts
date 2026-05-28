import { db } from "../db"
import { users } from "../db/schema"
import { eq } from "drizzle-orm"
import { randomUUID } from "crypto"

async function createAdmin() {
  const email = process.argv[2]
  const password = process.argv[3]
  const name = process.argv[4] || "Admin"

  if (!email || !password) {
    console.error("Usage: bun run src/scripts/create-admin.ts <email> <password> [name]")
    process.exit(1)
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters")
    process.exit(1)
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing.length > 0) {
    // Promote existing user to admin
    await db.update(users).set({ role: "admin" }).where(eq(users.email, email))
    console.log(`Promoted "${email}" to admin`)
    process.exit(0)
  }

  const passwordHash = await Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 })
  await db.insert(users).values({
    id: randomUUID(),
    email,
    passwordHash,
    name,
    role: "admin",
  })

  console.log(`Admin user "${email}" created`)
}

createAdmin().catch((e) => {
  console.error(e)
  process.exit(1)
})
