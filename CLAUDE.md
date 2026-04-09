# ENVICON 2026 — Conference Website

เว็บไซต์การประชุมวิชาการระดับชาติ ครั้งที่ 5 สมาคมสถาบันอุดมศึกษาสิ่งแวดล้อมไทย  
Theme: "Innovative Environmental Technologies for a Sustainable and Low-Carbon Future"

## Rules

1. ตอบให้สั้นที่สุดเพื่อประหยัด Token — หากต้องอธิบายให้ใช้ภาษาไทย
2. Do not explain the code unless asked. Just provide the code.
3. When modifying existing files, output only the diff or the specific block of code that needs to change, not the entire file.
4. ยึดหลักการเขียนโค้ดแบบ Clean Code เสมอ: ตั้งชื่อสื่อความหมาย, ฟังก์ชันสั้น ทำงานเดียว, ไม่ซ้ำซ้อน (DRY), จัดโครงสร้างชัดเจน

## Architecture

Monorepo with two apps + shared infra:

```
frontend/   — Nuxt 3 + Vue 3 + Tailwind CSS + @nuxt/ui + Pinia
backend/    — Elysia.js (Bun) + Drizzle ORM + MySQL 8
nginx.conf  — Reverse proxy (all under /envicon2026/)
docker-compose.yml — MySQL, Backend, Frontend, Nginx
```

**API prefix**: `/envicon2026/api`  
**Frontend base URL**: `/envicon2026`  
**Type-safe client**: Eden Treaty (`frontend/composables/useApi.ts` imports `App` type from backend)

## Tech Stack

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| Runtime     | **Bun** (backend), **Node** (frontend/Nuxt)     |
| Backend     | Elysia.js, @elysiajs/cors, @elysiajs/jwt        |
| ORM         | Drizzle ORM (MySQL dialect)                      |
| Database    | MySQL 8                                          |
| Frontend    | Nuxt 3, Vue 3 (Composition API + `<script setup>`) |
| UI          | @nuxt/ui, Tailwind CSS 3                         |
| State       | Pinia (@pinia/nuxt)                              |
| Auth        | JWT (Elysia JWT plugin), role-based (author/reviewer/admin) |

## Commands

```bash
# Backend
cd backend && bun install          # Install deps
cd backend && bun run dev          # Dev server (hot reload) on :3001
cd backend && bun run db:generate  # Generate Drizzle migrations
cd backend && bun run db:push      # Push schema to MySQL

# Frontend
cd frontend && npm install         # Install deps
cd frontend && npm run dev         # Dev server on :3000

# Docker (full stack)
docker compose up                  # Start all services
docker compose up --build          # Rebuild and start
```

## Key Conventions

### Backend (Elysia.js + Bun)

- Use **Bun** for everything: `bun install`, `bun run`, `bun test`, `bunx`
- Bun auto-loads `.env` — do NOT use `dotenv`
- Routes go in `backend/src/routes/` as Elysia plugin functions
- DB schema in `backend/src/db/schema.ts` (Drizzle ORM)
- DB connection in `backend/src/db/index.ts`
- Middleware in `backend/src/middleware/` (auth.ts, roles.ts)
- Services (business logic) in `backend/src/services/`
- Use Elysia's `t.` (TypeBox) for request validation
- Export `App` type from `backend/src/index.ts` for Eden Treaty

### Frontend (Nuxt 3)

- Pages in `frontend/pages/` — file-based routing
- Components in `frontend/components/` — organized by feature folder (home/, layout/, submission/, review/, common/)
- Composables in `frontend/composables/` — useApi, useAuth
- Stores in `frontend/stores/` — Pinia stores
- Middleware in `frontend/middleware/` — route guards (auth, role)
- Layouts in `frontend/layouts/`
- Use `<script setup lang="ts">` for all Vue components
- Use `$fetch` or Eden Treaty for API calls (not axios)
- Use Nuxt auto-imports (no manual import for Vue/Nuxt composables)

### Styling

- **Color palette**: primary (green #059669), accent (blue #0284c7), white
- Custom color scales defined in `frontend/tailwind.config.ts`
- Use @nuxt/ui components first, then Tailwind utilities
- Thai language UI with English academic terminology

### Database Schema

6 tables: `users`, `submissions`, `reviews`, `reviewer_assignments`, `registrations`, `revisions`

- UUIDs as primary keys (varchar 36)
- Roles: author, reviewer, admin
- Submission statuses: draft → submitted → under_review → accepted/rejected/revision_requested
- Review statuses: pending → completed
- Double-blind review (reviewer cannot see author info)

## API Routes Structure

```
/envicon2026/api/health              — Health check
/envicon2026/api/auth/*              — Register, login, me, logout
/envicon2026/api/submissions/*       — CRUD, file uploads, revisions
/envicon2026/api/reviews/*           — Reviewer assigned reviews
/envicon2026/api/admin/*             — Admin management
/envicon2026/api/registrations/*     — Conference registration
```

## File Upload

- Stored in `backend/uploads/`
- PDF only, max 50MB (nginx client_max_body_size)
- Storage service in `backend/src/services/storage.ts`

## Development Notes

- Implementation plan at `docs/implementation-plan.md`
- Event info at `event-info.md`
- Backend has its own `CLAUDE.md` with Bun-specific guidance — follow it
- When modifying DB schema, run `bun run db:push` to sync
- Eden Treaty provides end-to-end type safety between frontend and backend
