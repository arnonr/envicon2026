# TSHE-CON 2026 Conference Website — Implementation Plan

## Context

Building a conference website for the 5th National Conference of the Thai Association of Higher Education Environmental Institutions. The site needs both a public-facing promotional website (Nuxt 3, Modern Scroll Landing) and a full peer review submission system (Elysia.js + MySQL). Deployed via Docker Compose on KMUTNB university server.

**Full spec**: `docs/superpowers/specs/2026-04-09-envicon2026-website-design.md`

---

## Phase 1: Project Scaffolding & Infrastructure

### 1.1 Initialize project structure
- `frontend/` — `npx nuxi@latest init frontend` (Nuxt 3)
- `backend/` — `bun init` + install Elysia.js
- Root `package.json` with scripts to run both
- `.gitignore`, `.env.example`

### 1.2 Frontend base setup
- Install: Tailwind CSS, `@nuxt/ui`, Pinia, `@elysiajs/eden`
- Configure `nuxt.config.ts`: modules, runtime config (API base URL)
- Create `assets/css/main.css` with color theme (green #059669, blue #0284c7, white)
- Create layout components: `components/layout/Navbar.vue`, `Footer.vue`

### 1.3 Backend base setup
- Install: `elysia`, `@elysiajs/cors`, `@elysiajs/jwt`, `@elysiajs/static`, `drizzle-orm`, `mysql2`
- Create `src/index.ts` — Elysia app entry with CORS, JWT plugin
- Create `src/db/index.ts` — Drizzle connection to MySQL
- Create `src/db/schema.ts` — All tables (users, submissions, reviews, reviewer_assignments, registrations, revisions)
- Run `drizzle-kit push` to create tables

### 1.4 Docker Compose
- `docker-compose.yml`: MySQL 8, Nuxt (node), Elysia (bun), Nginx
- `nginx.conf`: reverse proxy `/envicon2026/api/*` → Elysia, `/envicon2026/*` → Nuxt

**Verify**: `docker compose up` — Nuxt serves on port, Elysia responds to `/api/health`, MySQL accessible

---

## Phase 2: Authentication System

### 2.1 Backend auth routes
- `src/routes/auth.ts`:
  - `POST /api/auth/register` — email + password registration
  - `POST /api/auth/login` — email + password login, return JWT
  - `GET /api/auth/me` — get current user from JWT
  - `POST /api/auth/logout`
  - OAuth endpoints: `GET /api/auth/google`, `GET /api/auth/google/callback` (same for GitHub)
- `src/middleware/auth.ts` — JWT verification middleware
- `src/middleware/roles.ts` — role-based access control (author, reviewer, admin)
- Password hashing with `bun` built-in or `bcrypt`

### 2.2 Frontend auth
- `pages/auth/login.vue` — Login form (email+password) + OAuth buttons (Google, GitHub)
- `stores/auth.ts` — Pinia store: login, logout, user state, JWT token
- `composables/useAuth.ts` — auth helper (isLoggedIn, hasRole, etc.)
- `composables/useApi.ts` — Eden Treaty client with auth header
- `middleware/auth.ts` (Nuxt route middleware) — protect dashboard routes
- `middleware/role.ts` — check role before accessing reviewer/admin pages

**Verify**: Register → login → access protected route → logout. OAuth flow with Google/GitHub.

---

## Phase 3: Public Pages (Promotional Website)

### 3.1 Homepage (Modern Scroll Landing)
- `pages/index.vue` — Compose from components:
  - `components/home/Hero.vue` — centered text, gradient title, subtitle
  - `components/home/StatsCounter.vue` — animated counters (date, tracks, days)
  - `components/home/CtaBanner.vue` — gradient CTA with deadline + submit button
  - `components/home/TracksSection.vue` — 7 track cards with icons
  - `components/home/Timeline.vue` — horizontal important dates timeline
  - `components/home/VenuePreview.vue` — venue photo + map link
  - `components/home/Sponsors.vue` — sponsor logo grid

### 3.2 Information pages
- `pages/about.vue` — About conference + association
- `pages/tracks.vue` — 7 tracks with full descriptions
- `pages/important-dates.vue` — Timeline detail page
- `pages/registration.vue` — Fees table (Early Bird / Regular, Student / General)
- `pages/venue.vue` — Venue details, map embed, directions
- `pages/keynote-speakers.vue` — Speaker profiles (placeholder until announced)
- `pages/program.vue` — Program page (shows "ประกาศเร็วๆ นี้" until 31 Oct)
- `pages/guidelines.vue` — Paper guidelines + downloadable templates
- `pages/contact.vue` — Contact form + email + map

**Verify**: All public pages render correctly. SSR works. Navigation between pages. Responsive on mobile.

---

## Phase 4: Submission System (Author)

### 4.1 Backend submission routes
- `src/routes/submissions.ts`:
  - `POST /api/submissions` — create submission (abstract)
  - `GET /api/submissions` — list own submissions (author) or all (admin)
  - `GET /api/submissions/:id` — get submission detail
  - `PUT /api/submissions/:id` — update submission
  - `POST /api/submissions/:id/upload-abstract` — upload abstract file (PDF)
  - `POST /api/submissions/:id/upload-paper` — upload full paper (PDF)
  - `POST /api/submissions/:id/revise` — submit revision
- `src/services/storage.ts` — file upload handling, save to `/uploads/`
- Input validation with Elysia `t.` (typebox)

### 4.2 Frontend submission pages
- `pages/dashboard/index.vue` — Author dashboard: list of submissions with status badges
- `pages/submit/index.vue` — Multi-step submission form:
  - Step 1: Title, abstract text, keywords, track selection
  - Step 2: Upload abstract PDF
  - Step 3: Confirmation
- `pages/submissions/[id].vue` — Submission detail: status, review feedback (anonymous), files
- `pages/submissions/[id]/revise.vue` — Upload revised paper + changelog
- `components/submission/SubmissionForm.vue` — reusable form
- `components/submission/StatusBadge.vue` — color-coded status
- `components/common/FileUpload.vue` — drag & drop PDF upload

**Verify**: Create submission → upload abstract → view status → submit full paper → view review feedback → submit revision.

---

## Phase 5: Review System (Reviewer + Admin)

### 5.1 Backend review routes
- `src/routes/reviews.ts`:
  - `GET /api/reviews` — list assigned reviews (reviewer)
  - `GET /api/reviews/:id` — get review detail + submission (without author info for double-blind)
  - `PUT /api/reviews/:id` — submit review (score, recommendation, comments)
- `src/routes/admin.ts`:
  - `GET /api/admin/submissions` — all submissions with filters
  - `POST /api/admin/submissions/:id/assign-reviewer` — assign reviewer to submission
  - `PUT /api/admin/submissions/:id/decision` — accept/reject/revise
  - `GET /api/admin/reviewers` — list reviewers with assignment counts
  - `GET /api/admin/stats` — dashboard statistics
- `src/services/review.ts` — reviewer assignment logic (match by track, balance load)

### 5.2 Frontend reviewer pages
- `pages/reviewer/index.vue` — List of assigned papers with due dates
- `pages/reviewer/[id].vue` — Review form: read paper (download PDF), score (1-5), recommendation dropdown, comments to author, comments to editor
- `pages/reviewer/history.vue` — Past completed reviews
- `components/review/ReviewForm.vue` — review input form
- `components/review/ScoreCard.vue` — visual score display

### 5.3 Frontend admin pages
- `pages/admin/index.vue` — Dashboard: submission stats, review progress, registration counts
- `pages/admin/submissions.vue` — DataTable of all submissions, filter by status/track, assign reviewers, make decisions
- `pages/admin/reviewers.vue` — Manage reviewers: add/remove, view expertise, assign papers
- `pages/admin/registrations.vue` — Registration list, confirm payment button
- `pages/admin/users.vue` — User management, role assignment
- `components/common/DataTable.vue` — reusable sortable/filterable table

**Verify**: Admin assigns reviewer → reviewer receives paper → reviewer submits review → admin sees review → admin makes decision → author sees result.

---

## Phase 6: Registration & Email Notifications

### 6.1 Registration system
- `src/routes/registrations.ts`:
  - `POST /api/registrations` — register for conference
  - `GET /api/registrations` — list (admin) or own (user)
  - `PUT /api/registrations/:id/confirm` — admin confirms payment
- `pages/registration.vue` — update to include registration form (after login)
- Fees auto-calculated based on date (Early Bird vs Regular) and user type

### 6.2 Email notifications
- `src/services/email.ts` — email sender (Nodemailer / Resend)
- Email triggers: account created, abstract submitted, abstract decision, paper submitted, review assigned, review completed, decision sent, revision received
- Simple HTML email templates

**Verify**: Register → receive confirmation email. Submit paper → admin notified. Decision made → author notified.

---

## Phase 7: Polish & Deployment

### 7.1 Frontend polish
- Responsive design check (mobile, tablet, desktop)
- SEO meta tags (Nuxt `useHead` / `useSeoMeta`)
- Loading states, error handling
- Thai/English language consideration (primarily Thai UI with English academic terms)

### 7.2 Security
- Rate limiting on auth routes
- File upload validation (PDF only, max size)
- CSRF protection
- Input sanitization

### 7.3 Docker deployment
- Finalize `docker-compose.yml` for production
- Nginx config with SSL (Let's Encrypt)
- Environment variables for production
- Database backup strategy
- `README.md` with deployment instructions

**Verify**: Full end-to-end flow on Docker. SSL works. All roles can complete their workflows.

---

## Critical Files

| File | Purpose |
|------|---------|
| `frontend/nuxt.config.ts` | Nuxt configuration, modules, API proxy |
| `frontend/assets/css/main.css` | Theme colors, Tailwind config |
| `frontend/composables/useApi.ts` | Eden Treaty client |
| `backend/src/index.ts` | Elysia app entry point |
| `backend/src/db/schema.ts` | Drizzle ORM schema (all tables) |
| `backend/src/routes/auth.ts` | Authentication endpoints |
| `backend/src/routes/submissions.ts` | Submission CRUD + upload |
| `backend/src/routes/reviews.ts` | Review endpoints |
| `backend/src/routes/admin.ts` | Admin management endpoints |
| `backend/src/services/review.ts` | Reviewer assignment logic |
| `backend/src/services/email.ts` | Email notification service |
| `docker-compose.yml` | Container orchestration |
| `nginx.conf` | Reverse proxy configuration |

## Verification Plan

After each phase:
1. Run `bun test` in backend (unit tests for routes/services)
2. Run `bun run dev` in frontend — check pages render
3. Test API endpoints with manual requests or a REST client
4. Full E2E test after Phase 6: Author submits → Admin assigns → Reviewer reviews → Decision → Author sees result
