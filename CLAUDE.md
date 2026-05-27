# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

1. ตอบให้สั้นที่สุดเพื่อประหยัด Token — หากต้องอธิบายให้ใช้ภาษาไทย
2. Do not explain the code unless asked. Just provide the code.
3. When modifying existing files, output only the diff or the specific block of code that needs to change, not the entire file.
4. ยึดหลักการเขียนโค้ดแบบ Clean Code เสมอ: ตั้งชื่อสื่อความหมาย, ฟังก์ชันสั้น ทำงานเดียว, ไม่ซ้ำซ้อน (DRY), จัดโครงสร้างชัดเจน

## Architecture

Monorepo — two apps + shared infra:

```
frontend/   — Nuxt 3 + Vue 3 + Tailwind CSS + @nuxt/ui + Pinia
backend/    — Elysia.js (Bun) + Drizzle ORM + MySQL 8
nginx.conf  — Reverse proxy (all under /envicon2026/)
docker-compose.yml — MySQL, Backend, Frontend, Nginx
```

**API prefix**: `/envicon2026/api`
**Frontend base URL**: `/envicon2026`

## Commands

```bash
# Backend (uses Bun, NOT Node)
cd backend && bun install
cd backend && bun run dev          # Dev server :3001 (hot reload)
cd backend && bun run db:generate  # Generate Drizzle migrations
cd backend && bun run db:push      # Push schema to MySQL

# Frontend (uses Node/npm, NOT Bun)
cd frontend && npm install
cd frontend && npm run dev         # Dev server :3000

# Docker (full stack)
docker compose up --build
```

No test framework is configured in either app. No `*.test.*` or `*.spec.*` files exist.

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

## Backend Patterns

### Route Structure

Routes are Elysia plugin functions in `backend/src/routes/`. Each uses `Elysia({ prefix })` and is composed via `.use()` in `backend/src/index.ts`, which exports `App` type.

**7 route plugins**: `authRoutes` (`/auth`), `submissionRoutes` (`/submissions`), `reviewRoutes` (`/reviews`), `adminRoutes` and `adminReviewRoutes` (`/admin`), `registrationRoutes` (`/registrations`), `publicRoutes` (`/public`)

### Type-Safe API Client

Eden Treaty provides end-to-end type safety. `frontend/composables/useApi.ts` imports `App` type from `backend/src/index.ts`. Frontend gets full autocomplete on all API routes.

### Response Helpers (`backend/src/utils/response.ts`)

All API responses use standardized shapes via `ok(data)`, `fail(error, message?)`, `paginated(data, page, limit, total)`. Always `{ success: true/false }` as discriminant.

### Auth Middleware (`backend/src/middleware/`)

- `requireAuth` — scoped derive + onBeforeHandle, returns 401 if invalid/missing JWT
- `requireRole(roles[])` — composes `requireAuth` + role check, returns 403
- `requireAdmin`, `requireReviewer`, `requireAuthor` — convenience aliases
- JWT_SECRET defaults to `"envicon2026-dev-secret"` in dev
- `Bun.password.verify` for bcrypt verification (no external bcrypt lib)

### Submission Status Lifecycle

```
draft → pending_payment → payment_verifying → submitted → under_review → accepted
                                                               ├→ rejected
                                                               └→ revision_requested → submitted → (new review round)
```

Transitions:
- `draft` → `pending_payment`: author uploads abstract PDF
- `pending_payment` → `payment_verifying`: author uploads payment slip
- `payment_verifying` → `submitted`: admin confirms payment
- `submitted` → `under_review`: admin sends an assigned review to the first reviewer
- `under_review` → `accepted`/`rejected`/`revision_requested`: admin releases a recorded decision after all sent reviews complete
- `revision_requested` → `submitted`: author uploads revised paper for a new review round without paying again

**One submission per author** — enforced at creation and checked on `/submit` page mount.

### Dual Registration Systems

1. **Conference registration** (`registrations` table) — authenticated, linked to user, has fee calculation
2. **Public event registration** (`event_registrations` table) — unauthenticated, no login required, no fee

### Fee Calculation (`backend/src/utils/fees.ts`)

Early bird deadline: `2026-10-14T23:59:59+07:00`. Student: 500/700, General: 2000/2500 (early/regular).

## Frontend Patterns

### Auth Flow

- `useAuth()` composable wraps `$fetch` calls (not Eden) for auth endpoints
- `stores/auth.ts` (Pinia) stores token + user in localStorage
- `plugins/auth.client.ts` restores session on app load
- `middleware/auth.ts` protects routes, redirects to `/auth/login`
- `middleware/role.ts` guards admin/reviewer routes by role

### API Error Handling (`composables/useApiError.ts`)

`handleApiCall<T>(apiCall)` — try/catch wrapper that auto-logs out on 401, standardizes errors. `showError(error)` / `showSuccess(message)` for toast notifications.

### Styling

- **Color palette**: primary (emerald #059669), accent (sky #0284c7), meadow (#22c55e) — each with 50-950 shades in `tailwind.config.ts`
- Font: Sarabun (Thai + English)
- Use @nuxt/ui components first, then Tailwind utilities
- Thai language UI with English academic terminology

## Database

Review workflow tables in `backend/src/db/schema.ts` include `review_rounds`, expanded `reviews`, `reviewer_profiles`, `reviewer_expertise_tracks`, `password_setup_tokens`, and `email_notifications`, in addition to submissions, users, registrations, and revisions.

- UUIDs as primary keys (varchar 36) for review rounds/reviews and most domain records
- Roles: author, reviewer, admin
- Single-blind review: reviewers can see author information; authors receive released comments anonymously
- `submissions.creators` stored as JSON text (array of `{firstName, lastName}`, max 20)

## API Routes

```
/envicon2026/api/health              — Health check
/envicon2026/api/auth/*              — Register, login, setup password, me
/envicon2026/api/submissions/*       — CRUD, file uploads, revisions, released result visibility
/envicon2026/api/reviews/*           — Reviewer assignment list, draft and final evaluation
/envicon2026/api/admin/*             — Stats, submissions, registrations, reviewer and review-round workflow
/envicon2026/api/registrations/*     — Conference registration (authenticated)
/envicon2026/api/public/*            — Public event registration (no auth)
```

## File Upload

- Stored in `backend/uploads/`, served via `Bun.file()` at `/envicon2026/api/files/:filename`
- Abstract/paper: PDF only, max 50MB
- Payment slip: PDF/PNG/JPEG, max 10MB
- Storage service: `backend/src/services/storage.ts`

## Implementation Status

**Complete**: Auth, submissions lifecycle, admin dashboard, reviewer management and round-based review workflow, reviewer portal, SMTP notification audit, conference registration, public registration, landing page

**Not implemented**: Automatic due-date reminders, conflict-of-interest declarations, configurable rubrics, rate limiting

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`arnonr/envicon2026`). Uses `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout. `CONTEXT.md` + `docs/adr/` at repo root. See `docs/agents/domain.md`.
