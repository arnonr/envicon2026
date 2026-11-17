# Blind Multi-Round Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable unlimited review rounds (2, 3, 4, 5+) with per-round review type selection (`abstract` | `full_paper`), mandatory Admin-uploaded Blind Review files before dispatching to reviewers, and dynamic round+status display across backend and frontend.

**Architecture:** Normalize `submissions.status` to round-agnostic states (`draft`, `submitted`, `under_review`, `accepted`, `revision_requested`, `rejected`) paired with `submissions.currentRound`. Store `reviewType` and `blindFileUrl` on `review_rounds`, enforce blind-file presence on `POST /admin/reviews/:id/send`, and stream blind files exclusively via an authenticated `GET /reviews/:id/file` endpoint so original author-identifying files never reach reviewers.

**Tech Stack:** Bun + Elysia.js + Drizzle ORM + MySQL 8 (`backend/`), Nuxt 3 + Vue 3 + `@nuxt/ui` + Tailwind CSS 3 (`frontend/`).

**Spec:** `docs/superpowers/specs/2026-11-17-blind-multi-round-review-design.md`

## Global Constraints

- Do NOT expose original file URLs (`abstractFileUrl`, `fullPaperFileUrl`, `round1FileUrl`, `versionFileUrl`) or author metadata (`authorName`, `authorEmail`, `authorAffiliation`, `creators`, `paymentStatus`) to non-admin reviewers.
- Preserve existing `submissions` rows by migrating `*_round1` and `*_round2` statuses to normalized statuses + `current_round` (1 or 2) without data loss.
- Do NOT require author re-upload before Admin creates Round 2, 3, 4, 5+.
- Distinguish `accepted` after an `abstract` round (allows uploading full paper -> transitions to `submitted`) from `accepted` after a `full_paper` round (camera-ready upload -> keeps `accepted`).
- No automated test framework exists in this repo (`CLAUDE.md`); verify each task with TypeScript typechecking (`bunx tsc --noEmit` in `backend/`, `npx nuxi typecheck` in `frontend/`) and targeted runtime/API checks.

## Review Focus

- **Author uploads camera-ready file after Round 2+ Full Paper `accept`:** Must NOT revert `submissions.status` from `accepted` back to `submitted`; only `accepted` where latest released round has `reviewType === "abstract"` transitions to `submitted`.
- **Admin sends review without uploading `blindFileUrl`:** `POST /admin/reviews/:id/send` must reject with `400 VALIDATION_ERROR` and never mark the review as `sent` or send an email.
- **Reviewer requests `GET /reviews/:id/file` for an unowned or `assigned` (unsent) review:** Must return `403` / `404` and never leak the file.
- **Existing MySQL rows with `*_round1` / `*_round2`:** Migration must backfill `current_round` and normalized `status` before shrinking the `submissions.status` enum so MySQL does not truncate or fail.
- **Admin creates Round 3, 4, 5+ immediately after `revision_requested` or `accepted`:** `POST /admin/submissions/:id/review-rounds` must succeed whenever no non-released round exists and `submission.status` is not `draft` or `rejected`, updating `submissions.currentRound` and setting `submissions.status = "submitted"`.

---

### Task 1: Database Schema, Migration & Status Helpers

**Files:**
- Modify: `backend/src/db/schema.ts:25-120`
- Modify: `backend/src/utils/submission-status.ts:1-100`
- Create: `backend/drizzle/` migration (via `bun run db:generate` or manual SQL migration script)

**Interfaces:**
- Produces in `backend/src/db/schema.ts`:
  - `SubmissionStatus`: `"draft" | "submitted" | "under_review" | "accepted" | "revision_requested" | "rejected"`
  - `submissions.currentRound`: `int("current_round").notNull().default(0)`
  - `reviewRounds.reviewType`: `mysqlEnum("review_type", ["abstract", "full_paper"]).notNull().default("abstract")`
  - `reviewRounds.blindFileUrl`: `varchar("blind_file_url", { length: 500 })`
- Produces in `backend/src/utils/submission-status.ts`:
  - `getStatusLabel(status: SubmissionStatus, currentRound: number): string`
  - `statusAfterDecision(decision: "accept" | "reject" | "revise"): SubmissionStatus`
  - `statusAfterSendReview(): SubmissionStatus`
  - `statusAfterReviseUpload(currentStatus: SubmissionStatus): SubmissionStatus | null`
  - `statusAfterFileUpload(currentStatus: SubmissionStatus, hasUploadedFullPaper: boolean, latestReleasedReviewType?: "abstract" | "full_paper" | null): SubmissionStatus | null`
  - `canEdit`, `canRevise`, `canCameraReady`, `canReplaceFile`, `canUpdateFiles`, `isUnderReview`, `isSubmitted`, `isTerminal`, `ALL_NON_DRAFT`, `RE_REVIEW_STATUSES`, `TERMINAL_STATUSES`

- [ ] **Step 1: Update `backend/src/db/schema.ts`**
  - Add `currentRound: int("current_round").notNull().default(0)` to `submissions`.
  - Change `submissions.status` enum to `["draft", "submitted", "under_review", "accepted", "revision_requested", "rejected"]`.
  - Add `reviewType: mysqlEnum("review_type", ["abstract", "full_paper"]).notNull().default("abstract")` and `blindFileUrl: varchar("blind_file_url", { length: 500 })` to `reviewRounds`.
  - Update `STATUS_LABEL` and `STATUS_COLOR` in `schema.ts` to use the 6 normalized statuses.

- [ ] **Step 2: Update `backend/src/utils/submission-status.ts`**
  - Remove `ROUND_OF` and all `*_round1` / `*_round2` references.
  - Implement `statusAfterDecision(decision)`, `statusAfterSendReview()`, `statusAfterReviseUpload(currentStatus)`, `statusAfterFileUpload(currentStatus, hasUploadedFullPaper, latestReleasedReviewType)`, and `getStatusLabel(status, currentRound)`.
  - Ensure `statusAfterFileUpload("accepted", true, "abstract")` returns `"submitted"`, while `statusAfterFileUpload("accepted", true, "full_paper")` returns `null` (keeps `"accepted"`).

- [ ] **Step 3: Create and verify DB migration SQL**
  - Write a safe MySQL migration (add `current_round`, `review_type`, `blind_file_url`; temporarily widen or `MODIFY COLUMN status VARCHAR(64)`; run `UPDATE submissions SET current_round = ..., status = ...` mapping all `*_round1` / `*_round2` rows; then `MODIFY COLUMN status ENUM('draft','submitted','under_review','accepted','revision_requested','rejected') NOT NULL DEFAULT 'draft'`).
  - Run `cd backend && bunx tsc --noEmit` (note: route files will error until Tasks 2–3 update them; verify `schema.ts` and `submission-status.ts` have zero errors).

- [ ] **Step 4: Commit**
  ```bash
  git add backend/src/db/schema.ts backend/src/utils/submission-status.ts backend/drizzle/
  git commit -m "feat(db): normalize submission status, add currentRound and blind review fields"
  ```

---

### Task 2: Backend Submission & Admin Status Routes

**Files:**
- Modify: `backend/src/routes/submissions.ts:160-225, 490-750, 910-980`
- Modify: `backend/src/routes/admin.ts:11, 625-672`

**Interfaces:**
- Consumes: `backend/src/utils/submission-status.ts` (`statusAfterFileUpload`, `statusAfterReviseUpload`, `canUpdateFiles`, `canCameraReady`, `canRevise`, `canReplaceFile`, `canEdit`, `ALL_NON_DRAFT`)
- Produces:
  - `GET /submissions/:id` returns `currentRound`, `latestReleasedReviewType: "abstract" | "full_paper" | null`, and `rounds` including `reviewType`.
  - `POST /submissions/:id/upload-files`, `POST /submissions/:id/upload-abstract`, `POST /submissions/:id/upload-round1-file`, `POST /submissions/:id/upload-paper`, `POST /submissions/:id/revise` all use normalized statuses (`"submitted"`) and set `currentRound: 1` when transitioning from `"draft"`.

- [ ] **Step 1: Update `backend/src/routes/submissions.ts`**
  - Replace hardcoded `"submitted_round1"` / `"submitted_round2"` with `"submitted"`, setting `currentRound: 1` when `sub.status === "draft"`.
  - In `GET /submissions/:id`, include `reviewType: reviewRounds.reviewType` in `roundSummaries`, compute `latestReleasedReviewType` from the latest released round (if any), and return `latestReleasedReviewType` + `currentRound: sub.currentRound`.
  - In `upload-files` and `upload-paper`, query the latest released round's `reviewType` and pass it as the 3rd argument to `statusAfterFileUpload(sub.status, hasUploadedFullPaper, latestReleasedReviewType)`.

- [ ] **Step 2: Update `backend/src/routes/admin.ts`**
  - Update `PATCH /submissions/:id/status` to accept `"draft" | "submitted"` and forbid `["under_review", "accepted", "revision_requested", "rejected"]`.

- [ ] **Step 3: Verify TypeScript**
  - Check `backend/src/routes/submissions.ts` and `backend/src/routes/admin.ts` compile cleanly once Task 3 completes.

- [ ] **Step 4: Commit**
  ```bash
  git add backend/src/routes/submissions.ts backend/src/routes/admin.ts
  git commit -m "feat(api): update submission and admin routes for normalized statuses"
  ```

---

### Task 3: Backend Multi-Round Creation, Blind File Upload & Reviewer File Endpoint

**Files:**
- Modify: `backend/src/routes/admin-reviews.ts:465-595, 648-940`
- Modify: `backend/src/routes/reviews.ts:1-150`

**Interfaces:**
- Consumes: `saveFile`, `storedFileExists` from `backend/src/services/storage.ts`; `statusAfterSendReview`, `statusAfterDecision` from `backend/src/utils/submission-status.ts`
- Produces:
  - `POST /admin/submissions/:id/review-rounds` — body `{ reviewType: "abstract" | "full_paper" }`; creates next `roundNumber` (1, 2, 3, ...), sets `submissions.currentRound = nextRound` and `submissions.status = "submitted"` (when not already `"submitted"`).
  - `POST /admin/review-rounds/:roundId/blind-file` — multipart `{ file: File }` (`.pdf`, `.doc`, `.docx`, max 50MB); saves via `saveFile(file, "blind-r" + round.roundNumber + "-" + round.submissionId)`, updates `reviewRounds.blindFileUrl` (allowed when `round.status !== "released"`).
  - `GET /admin/review-rounds/:roundId/blind-file` (or reuse `/files/` for admin) — allows admin to preview/verify uploaded blind file.
  - `POST /admin/reviews/:id/send` — requires `round.blindFileUrl` and `await storedFileExists(round.blindFileUrl)`, else returns `400 VALIDATION_ERROR`.
  - `GET /reviews` & `GET /reviews/:id` — returns `reviewType`, `hasBlindFile: Boolean(round.blindFileUrl)`, `blindFileName` (sanitized label e.g. `blind-round-${roundNumber}.${ext}`), while still stripping all original file URLs and author fields for non-admins.
  - `GET /reviews/:id/file` — authenticated (`requireAuth` / `getUserFromHeaders`); allows assigned reviewer (`review.reviewerId === currentUser.id && review.status !== "assigned"`) or admin; streams `round.blindFileUrl` with `Content-Disposition: inline; filename="..."`.

- [ ] **Step 1: Update `backend/src/routes/admin-reviews.ts`**
  - Include `reviewType` and `blindFileUrl` in `GET /admin/submissions/:id/review-workflow` round objects (`blindFileAvailable: await storedFileExists(round.blindFileUrl)`).
  - Update `POST /admin/submissions/:id/review-rounds` to accept `body: t.Object({ reviewType: t.Union([t.Literal("abstract"), t.Literal("full_paper")]) })` (allow when `submission.status !== "draft" && submission.status !== "rejected"` and no open round exists; update `submissions.currentRound` and `submissions.status = "submitted"`).
  - Add `POST /admin/review-rounds/:roundId/blind-file` with file extension validation (`.pdf`, `.doc`, `.docx`) and 50MB limit.
  - Update `POST /admin/reviews/:id/send` to require `assignment.blindFileUrl` and `storedFileExists(assignment.blindFileUrl)` instead of checking original author files; update `submissions.status` using `statusAfterSendReview()`.
  - Update `POST /admin/review-rounds/:roundId/release` to call `statusAfterDecision(round.decision ?? "accept")`.

- [ ] **Step 2: Update `backend/src/routes/reviews.ts`**
  - Add `reviewType: reviewRounds.reviewType` and `blindFileUrl: reviewRounds.blindFileUrl` to `GET /reviews` and `GET /reviews/:id` queries; expose `hasBlindFile: Boolean(row.blindFileUrl)` and delete `blindFileUrl` along with all original file URLs from the JSON response.
  - Add `GET /reviews/:id/file` endpoint with JWT auth check (`reviewer` owning the sent/in_progress/completed review, or `admin`), returning `Bun.file(filepath)` with appropriate `Content-Type` and `Content-Disposition` header.

- [ ] **Step 3: Run backend typecheck**
  - Run: `cd backend && bunx tsc --noEmit`
  - Expected: Exit code 0 with zero TypeScript errors.

- [ ] **Step 4: Commit**
  ```bash
  git add backend/src/routes/admin-reviews.ts backend/src/routes/reviews.ts
  git commit -m "feat(api): add multi-round reviewType, blind file upload, and authenticated reviewer file download"
  ```

---

### Task 4: Frontend Status Helpers & Author / Admin Status Display

**Files:**
- Modify: `frontend/utils/submission-status.ts:1-70`
- Modify: `frontend/pages/admin/index.vue:155-230, 855-865`
- Modify: `frontend/pages/dashboard/index.vue:175-190`
- Modify: `frontend/pages/submissions/[id]/index.vue:50-135, 290-320`
- Modify: `frontend/pages/submissions/[id]/revise.vue:120-135`
- Modify: `frontend/components/submission/SubmissionDetailModal.vue` (if referencing old status strings)

**Interfaces:**
- Consumes: `status`, `currentRound`, `latestReleasedReviewType` from backend API responses
- Produces in `frontend/utils/submission-status.ts`:
  - `SubmissionStatus`: `"draft" | "submitted" | "under_review" | "accepted" | "revision_requested" | "rejected"`
  - `getStatusLabel(status: SubmissionStatus, currentRound?: number): string`
  - `STATUS_COLOR: Record<SubmissionStatus, string>`
  - `canEdit`, `canRevise`, `canCameraReady`, `canUpdateFiles`

- [ ] **Step 1: Update `frontend/utils/submission-status.ts`**
  - Mirror the normalized `SubmissionStatus` type, `STATUS_COLOR`, `getStatusLabel(status, currentRound)`, and helper predicates from `backend/src/utils/submission-status.ts`.

- [ ] **Step 2: Update `frontend/pages/admin/index.vue`**
  - Update `STATUS_OPTIONS` filter dropdown to the normalized statuses (`submitted`, `under_review`, `accepted`, `revision_requested`, `rejected`).
  - Update `STATUS_COLORS` and status badge rendering to use `getStatusLabel(sub.status, sub.currentRound)`.

- [ ] **Step 3: Update Author pages (`dashboard/index.vue`, `submissions/[id]/index.vue`, `submissions/[id]/revise.vue`, `SubmissionDetailModal.vue`)**
  - Replace all `'passed_round1_with_revisions'` / `'passed_round2_with_revisions'` checks with `status === 'revision_requested'`.
  - Replace `'passed_round1'` full-paper upload banner check with `status === 'accepted' && latestReleasedReviewType === 'abstract'`.
  - Display `getStatusLabel(status, currentRound)` in badges.

- [ ] **Step 4: Commit**
  ```bash
  git add frontend/utils/submission-status.ts frontend/pages/admin/index.vue frontend/pages/dashboard/index.vue frontend/pages/submissions/ frontend/components/submission/
  git commit -m "feat(ui): update frontend status helpers and dynamic round labels"
  ```

---

### Task 5: Admin Review-Round & Blind File UI (`AdminSubmissionDetailModal`)

**Files:**
- Modify: `frontend/components/admin/SubmissionDetailModal.vue:105-145, 370-470, 920-1140`

**Interfaces:**
- Consumes:
  - `POST /admin/submissions/:id/review-rounds` with `{ reviewType }`
  - `POST /admin/review-rounds/:roundId/blind-file` with `FormData` (`file`)
  - `POST /admin/reviews/:id/send`

- [ ] **Step 1: Add `reviewType` selection when creating a round**
  - Add `newRoundReviewType = ref<"abstract" | "full_paper">(...)` (default `"full_paper"` when `rounds.length >= 1`, else `"abstract"`).
  - Render a clean selector (`บทคัดย่อ (Abstract)` / `ฉบับเต็ม (Full Paper)`) next to or inside the "สร้างรอบประเมิน" action.
  - Send `{ reviewType: newRoundReviewType.value }` in `POST /admin/submissions/:id/review-rounds`.

- [ ] **Step 2: Add Blind File upload & status in current round card**
  - Show `reviewType` badge on each round card (`ประเมินบทคัดย่อ` / `ประเมินฉบับเต็ม`).
  - In `currentRound`, show blind file status (`อัปโหลดไฟล์ Blind แล้ว` with preview link, or warning `ยังไม่ได้อัปโหลดไฟล์ Blind Review`) and a file input + upload button calling `POST /admin/review-rounds/:roundId/blind-file`.
  - Disable or guard the "ส่งงานให้ผู้ทรงคุณวุฒิ" button when `!workflow.currentRound.blindFileAvailable` with a clear tooltip/hint.

- [ ] **Step 3: Commit**
  ```bash
  git add frontend/components/admin/SubmissionDetailModal.vue
  git commit -m "feat(admin-ui): add reviewType selector and blind file upload per round"
  ```

---

### Task 6: Reviewer Blind File Download & Review Type UI

**Files:**
- Modify: `frontend/pages/reviewer/index.vue`
- Modify: `frontend/pages/reviewer/reviews/[id].vue:1-164`

**Interfaces:**
- Consumes: `GET /reviews`, `GET /reviews/:id` (`reviewType`, `hasBlindFile`), `GET /reviews/:id/file` (with `Authorization: Bearer <token>`)

- [ ] **Step 1: Update `frontend/pages/reviewer/index.vue`**
  - Add `reviewType: "abstract" | "full_paper"` to the list item interface and show a badge (`บทคัดย่อ` / `ฉบับเต็ม`) alongside `รอบที่ {{ item.roundNumber }}`.

- [ ] **Step 2: Update `frontend/pages/reviewer/reviews/[id].vue`**
  - Add `reviewType` and `hasBlindFile` to `ReviewDetail`.
  - Show a badge for `reviewType` (`ประเมินบทคัดย่อ` / `ประเมินฉบับเต็ม`) in the header.
  - Add a **"ดาวน์โหลดเอกสารสำหรับประเมิน (Blind Review)"** button that fetches `${apiBase}/reviews/${route.params.id}/file` with `Authorization: Bearer ${authStore.token}`, creates a Blob URL, and triggers download / opens in a new tab.
  - Show a fallback message if `!review.hasBlindFile`.

- [ ] **Step 3: Run frontend typecheck & build verification**
  - Run: `cd frontend && npx nuxi typecheck`
  - Expected: Exit code 0 with no type errors.

- [ ] **Step 4: Commit**
  ```bash
  git add frontend/pages/reviewer/
  git commit -m "feat(reviewer-ui): display round reviewType and authenticated blind file download"
  ```

---

## Self-Review Checklist (Completed)

1. **Spec coverage:**
   - Unlimited rounds (1, 2, 3, 4, 5+) -> Tasks 1, 2, 3, 4, 5
   - Per-round `reviewType` (`abstract` | `full_paper`) -> Tasks 1, 3, 5, 6
   - Mandatory `blindFileUrl` before sending to reviewer -> Tasks 1, 3, 5
   - Reviewer downloads only blind file via auth endpoint -> Tasks 3, 6
   - Dynamic round+status labels -> Tasks 1, 4
   - `accepted` (`abstract` vs `full_paper`) distinction -> Tasks 1, 2, 4
2. **Type consistency:** `SubmissionStatus`, `currentRound`, `reviewType`, `blindFileUrl`, `hasBlindFile`, `latestReleasedReviewType`, `getStatusLabel` match across all tasks.
3. **Review Focus coverage:** All 5 failure modes are explicitly called out in Global Constraints / Review Focus and mapped to owning tasks.
