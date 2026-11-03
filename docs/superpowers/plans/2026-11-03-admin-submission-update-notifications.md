# Admin Submission Update Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Notify Admins in `/admin` when an author updates abstract/full-paper files or submission metadata after initial submission, with a 1-click quick filter pill, per-row change badges, per-file-slot highlights, and automatic mark-as-seen when opening the submission detail modal.

**Architecture:** Add 4 tracking columns (`author_updated_at`, `author_update_summary`, `author_updated_slots`, `admin_seen_at`) to `submissions` in `backend/src/db/schema.ts` with an idempotent startup schema check. Centralize slot accumulation and Thai summary generation in `backend/src/utils/submission-files.ts`, call it from post-draft author mutation routes in `backend/src/routes/submissions.ts`, mark `admin_seen_at` when an admin fetches `GET /submissions/:id`, expose `hasUnreadUpdate` filtering + `unreadUpdateCount` in `GET /admin/submissions`, and render the quick-filter pill and row/file badges in `frontend/pages/admin/index.vue` and `frontend/components/admin/SubmissionDetailModal.vue`.

**Tech Stack:** Bun, Elysia, Drizzle ORM (`mysql-core`) (backend); Nuxt 3, Vue 3 (`<script setup lang="ts">`), `@nuxt/ui`, Tailwind CSS (frontend).

**Spec:** `docs/superpowers/specs/2026-11-03-admin-submission-update-notifications-design.md`

## Global Constraints

- Do not record author update notifications while `submission.status === "draft"` or during the initial transition from `"draft"` to `"submitted_round1"`.
- Do not record author update notifications when an admin manages files via `POST /admin/submissions/:id/files`.
- Server-side pagination (`50` items per page) and `GET /admin/submissions/export` must share `buildAdminSubmissionWhere` in `backend/src/utils/admin-submission-filters.ts`.
- Backend commands must run with **Bun** (`backend/`); frontend commands must run with **Node / npm** (`frontend/`).

## Review Focus

1. **Accumulating multiple author updates before Admin views the submission:** When an author uploads `abstractPdf` first and later uploads `fullPaperWord` while the submission is still unread (`authorUpdatedAt > adminSeenAt` or `adminSeenAt === null`), `buildAuthorUpdateTracking` must union the slots into `["abstractPdf", "fullPaperWord"]` and regenerate `authorUpdateSummary` for both, whereas an update after `adminSeenAt >= authorUpdatedAt` must reset to only the newly changed slots.
2. **Same-second timestamp comparison (`adminSeenAt >= authorUpdatedAt`):** Because MySQL `TIMESTAMP` defaults to second resolution, `hasUnreadAuthorUpdate` must treat `authorUpdatedAt.getTime() <= adminSeenAt.getTime()` as already seen (`false`) and only `authorUpdatedAt.getTime() > adminSeenAt.getTime()` as unread (`true`).
3. **No-op `PUT /submissions/:id` in non-draft status:** Submitting unchanged title/abstract/metadata fields to `PUT /submissions/:id` when `status !== "draft"` must be detected by `hasSubmissionMetadataChanged` and must not set `authorUpdatedAt` or insert a redundant `submission_versions` row.
4. **Malformed or legacy `authorUpdatedSlots` values:** `parseAuthorUpdatedSlots` must return `[]` without throwing on `null`, `""`, invalid JSON, non-array JSON, or unknown slot names.
5. **Existing MySQL databases missing new columns before manual migration:** `ensureSubmissionUpdateColumns()` must check `INFORMATION_SCHEMA.COLUMNS` at backend startup and add any missing tracking columns on `submissions` idempotently so queries never fail with `Unknown column`.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `backend/src/db/schema.ts` | Modify | Add `authorUpdatedAt`, `authorUpdateSummary`, `authorUpdatedSlots`, and `adminSeenAt` columns to `submissions` |
| `backend/drizzle/0016_submission_update_tracking.sql` | Create | SQL migration adding the 4 tracking columns to `submissions` |
| `backend/src/utils/submission-files.ts` | Modify | Provide `AuthorUpdateSlot` helpers (`parseAuthorUpdatedSlots`, `hasUnreadAuthorUpdate`, `formatAuthorUpdateSummary`, `buildAuthorUpdateTracking`, `hasSubmissionMetadataChanged`, `recordMetadataRevisionSnapshot`, `ensureSubmissionUpdateColumns`) |
| `backend/src/index.ts` | Modify | Invoke `ensureSubmissionUpdateColumns()` on startup |
| `backend/src/routes/submissions.ts` | Modify | Record author updates on post-draft file/metadata mutations; return unread update info and set `adminSeenAt` when admin calls `GET /submissions/:id` |
| `backend/src/utils/admin-submission-filters.ts` | Modify | Support `hasUnreadUpdate` (`"1"`) filter in `buildAdminSubmissionWhere` and export `buildUnreadAuthorUpdateSql()` |
| `backend/src/routes/admin.ts` | Modify | Return `hasUnreadUpdate`, `authorUpdatedAt`, `authorUpdateSummary`, `authorUpdatedSlots` per row and `unreadUpdateCount` in `GET /admin/submissions` |
| `frontend/utils/admin-submission-filters.ts` | Modify | Add `hasUnreadUpdate: boolean` to `AdminSubmissionFilterState`, search params builder, and active filter check |
| `frontend/pages/admin/index.vue` | Modify | Render `"มีอัปเดตใหม่ (N)"` quick-filter pill, unread row styling, update summary badge, file-slot `"ใหม่"` badges, and optimistic seen clearing on modal open |
| `frontend/components/admin/SubmissionDetailModal.vue` | Modify | Display an amber alert banner at the top of the modal when opened on a submission that had an unread author update |

---

### Task 1: Schema, Author Update Tracking Helpers, and Startup Column Ensure

**Files:**
- Modify: `backend/src/db/schema.ts:50-72`
- Create: `backend/drizzle/0016_submission_update_tracking.sql`
- Modify: `backend/src/utils/submission-files.ts`
- Modify: `backend/src/index.ts:11-17`

**Interfaces:**
- Produces from `backend/src/db/schema.ts` on `submissions`:
  - `authorUpdatedAt: timestamp("author_updated_at")`
  - `authorUpdateSummary: varchar("author_update_summary", { length: 500 })`
  - `authorUpdatedSlots: varchar("author_updated_slots", { length: 255 })`
  - `adminSeenAt: timestamp("admin_seen_at")`
- Produces from `backend/src/utils/submission-files.ts`:
  ```ts
  export type AuthorUpdateSlot = "abstractPdf" | "abstractWord" | "fullPaperPdf" | "fullPaperWord" | "metadata";

  export interface AuthorUpdateTrackingFields {
    authorUpdatedAt: Date;
    authorUpdateSummary: string;
    authorUpdatedSlots: string;
  }

  export function parseAuthorUpdatedSlots(raw: string | null | undefined): AuthorUpdateSlot[];
  export function hasUnreadAuthorUpdate(sub: { authorUpdatedAt: Date | string | null; adminSeenAt: Date | string | null }): boolean;
  export function formatAuthorUpdateSummary(slots: AuthorUpdateSlot[]): string;
  export function detectUploadedAuthorSlots(files: FileSlotInputs): AuthorUpdateSlot[];
  export function buildAuthorUpdateTracking(
    sub: { authorUpdatedAt: Date | string | null; adminSeenAt: Date | string | null; authorUpdatedSlots: string | null },
    newSlots: AuthorUpdateSlot[],
    now?: Date,
  ): AuthorUpdateTrackingFields | null;
  export function hasSubmissionMetadataChanged(
    before: Pick<typeof submissions.$inferSelect, "title" | "titleEn" | "abstract" | "keywords" | "creators" | "track" | "submitterType" | "educationLevel" | "presentationFormat" | "wantsFullPaper" | "round1FileType">,
    after: Pick<typeof submissions.$inferSelect, "title" | "titleEn" | "abstract" | "keywords" | "creators" | "track" | "submitterType" | "educationLevel" | "presentationFormat" | "wantsFullPaper" | "round1FileType">,
  ): boolean;
  export function recordMetadataRevisionSnapshot(sub: typeof submissions.$inferSelect, changelog?: string): Promise<void>;
  export function ensureSubmissionUpdateColumns(): Promise<void>;
  ```

- [ ] **Step 1: Add the 4 columns to `submissions` in `backend/src/db/schema.ts` and create `backend/drizzle/0016_submission_update_tracking.sql`**

In `backend/src/db/schema.ts` inside `submissions` (before `submittedAt`):
```ts
  authorUpdatedAt: timestamp("author_updated_at"),
  authorUpdateSummary: varchar("author_update_summary", { length: 500 }),
  authorUpdatedSlots: varchar("author_updated_slots", { length: 255 }),
  adminSeenAt: timestamp("admin_seen_at"),
```
Create `backend/drizzle/0016_submission_update_tracking.sql` with `ALTER TABLE submissions ADD ...` for `author_updated_at`, `author_update_summary`, `author_updated_slots`, and `admin_seen_at`.

- [ ] **Step 2: Implement author update tracking helpers and `ensureSubmissionUpdateColumns` in `backend/src/utils/submission-files.ts` and wire startup check in `backend/src/index.ts`**

In `backend/src/utils/submission-files.ts`, implement:
- Canonical slot order `AUTHOR_UPDATE_SLOT_ORDER: AuthorUpdateSlot[] = ["abstractPdf", "abstractWord", "fullPaperPdf", "fullPaperWord", "metadata"]` and labels:
  - `abstractPdf`: `"บทคัดย่อ (PDF)"`
  - `abstractWord`: `"บทคัดย่อ (Word)"`
  - `fullPaperPdf`: `"ฉบับสมบูรณ์ (PDF)"`
  - `fullPaperWord`: `"ฉบับสมบูรณ์ (Word)"`
- `parseAuthorUpdatedSlots(raw)`: parses JSON array, filters to valid `AuthorUpdateSlot` values in canonical order, returns `[]` on any error or non-array (Review Focus #4).
- `hasUnreadAuthorUpdate(sub)`: returns `true` iff `sub.authorUpdatedAt` is valid and (`!sub.adminSeenAt` or `new Date(sub.authorUpdatedAt).getTime() > new Date(sub.adminSeenAt).getTime()`) (Review Focus #2).
- `formatAuthorUpdateSummary(slots)`:
  - File slots present & `"metadata"` present: `"อัปเดตไฟล์${fileLabels.join(", ")} และแก้ไขข้อมูลบทคัดย่อ"`
  - Only file slots present: `"อัปเดตไฟล์${fileLabels.join(", ")}"`
  - Only `"metadata"` present: `"แก้ไขข้อมูล/บทคัดย่อ"`
- `buildAuthorUpdateTracking(sub, newSlots, now = new Date())`: returns `null` if `newSlots.length === 0`; merges `parseAuthorUpdatedSlots(sub.authorUpdatedSlots)` with `newSlots` when `hasUnreadAuthorUpdate(sub)` is `true`, otherwise uses only `newSlots` (Review Focus #1).
- `hasSubmissionMetadataChanged(before, after)`: compares trimmed strings (`title`, `titleEn`, `abstract`, `keywords`, `creators`) and scalar fields (`track`, `submitterType`, `educationLevel`, `presentationFormat`, `wantsFullPaper`, `round1FileType`) (Review Focus #3).
- `recordMetadataRevisionSnapshot(sub, changelog = "แก้ไขข้อมูล/บทคัดย่อ")`: ensures initial version 1 exists (if none) and inserts a new `submission_versions` row (`kind: "revision"`) with current `resolveCurrentSlotUrls(sub)` and updates any non-released `review_rounds.submissionVersionId`.
- `ensureSubmissionUpdateColumns()`: queries `INFORMATION_SCHEMA.COLUMNS` for `TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'submissions'` and executes `ALTER TABLE submissions ADD COLUMN ...` for any missing column among `author_updated_at`, `author_update_summary`, `author_updated_slots`, `admin_seen_at` (Review Focus #5). Call `await ensureSubmissionUpdateColumns().catch(...)` in `backend/src/index.ts`.

- [ ] **Step 3: Run unit verification for Task 1 helpers and TypeScript check**

Run:
```bash
cd backend && bun -e '
import assert from "node:assert/strict";
import {
  parseAuthorUpdatedSlots,
  hasUnreadAuthorUpdate,
  formatAuthorUpdateSummary,
  buildAuthorUpdateTracking,
  hasSubmissionMetadataChanged,
} from "./src/utils/submission-files";

assert.deepEqual(parseAuthorUpdatedSlots(null), []);
assert.deepEqual(parseAuthorUpdatedSlots("{bad json"), []);
assert.deepEqual(parseAuthorUpdatedSlots(JSON.stringify(["fullPaperWord", "bogus", "abstractPdf"])), ["abstractPdf", "fullPaperWord"]);

const t1 = new Date("2026-11-03T10:00:00Z");
const t2 = new Date("2026-11-03T10:05:00Z");
assert.equal(hasUnreadAuthorUpdate({ authorUpdatedAt: t1, adminSeenAt: null }), true);
assert.equal(hasUnreadAuthorUpdate({ authorUpdatedAt: t1, adminSeenAt: t1 }), false);
assert.equal(hasUnreadAuthorUpdate({ authorUpdatedAt: t2, adminSeenAt: t1 }), true);

const first = buildAuthorUpdateTracking({ authorUpdatedAt: null, adminSeenAt: null, authorUpdatedSlots: null }, ["abstractPdf"], t1)!;
assert.equal(first.authorUpdateSummary, "อัปเดตไฟล์บทคัดย่อ (PDF)");

const accumulated = buildAuthorUpdateTracking(
  { authorUpdatedAt: t1, adminSeenAt: null, authorUpdatedSlots: first.authorUpdatedSlots },
  ["fullPaperWord", "metadata"],
  t2,
)!;
assert.deepEqual(parseAuthorUpdatedSlots(accumulated.authorUpdatedSlots), ["abstractPdf", "fullPaperWord", "metadata"]);
assert.equal(accumulated.authorUpdateSummary, "อัปเดตไฟล์บทคัดย่อ (PDF), ฉบับสมบูรณ์ (Word) และแก้ไขข้อมูลบทคัดย่อ");

const resetAfterSeen = buildAuthorUpdateTracking(
  { authorUpdatedAt: t1, adminSeenAt: t2, authorUpdatedSlots: accumulated.authorUpdatedSlots },
  ["fullPaperPdf"],
  new Date("2026-11-03T10:10:00Z"),
)!;
assert.deepEqual(parseAuthorUpdatedSlots(resetAfterSeen.authorUpdatedSlots), ["fullPaperPdf"]);
assert.equal(resetAfterSeen.authorUpdateSummary, "อัปเดตไฟล์ฉบับสมบูรณ์ (PDF)");

const baseMeta = {
  title: "A", titleEn: "B", abstract: "C", keywords: "k", creators: null,
  track: 1, submitterType: "student" as const, educationLevel: "master" as const,
  presentationFormat: "oral" as const, wantsFullPaper: 1, round1FileType: "abstract" as const,
};
assert.equal(hasSubmissionMetadataChanged(baseMeta, { ...baseMeta, title: " A " }), false);
assert.equal(hasSubmissionMetadataChanged(baseMeta, { ...baseMeta, abstract: "New" }), true);
console.log("Task 1 assertions passed");
' && bun x tsc --noEmit
```
Expected: `Task 1 assertions passed` and exit code `0`.

- [ ] **Step 4: Commit Task 1**

```bash
git add backend/src/db/schema.ts backend/drizzle/0016_submission_update_tracking.sql backend/src/utils/submission-files.ts backend/src/index.ts
git commit -m "feat(backend): add submission author update tracking schema and helpers"
```

---

### Task 2: Backend Submission Routes, Admin Filter Builder, and Admin Submissions API

**Files:**
- Modify: `backend/src/routes/submissions.ts`
- Modify: `backend/src/utils/admin-submission-filters.ts`
- Modify: `backend/src/routes/admin.ts`

**Interfaces:**
- Consumes: Task 1 helpers from `backend/src/utils/submission-files.ts`
- Produces:
  - `GET /submissions/:id`: returns `hasUnreadUpdate: boolean` and `authorUpdatedSlots: AuthorUpdateSlot[]` (in addition to `authorUpdatedAt` and `authorUpdateSummary` from `sub`), and when `user.role === "admin"`, sets `adminSeenAt = new Date()` in DB.
  - `GET /admin/submissions`: accepts optional `hasUnreadUpdate?: string` (`"1"`), returns `hasUnreadUpdate: boolean` and `authorUpdatedSlots: AuthorUpdateSlot[]` on each item in `data`, and includes `unreadUpdateCount: number` in `meta`.
  - `GET /admin/submissions/export`: accepts optional `hasUnreadUpdate?: string` (`"1"`).

- [ ] **Step 1: Wire author update tracking and admin mark-as-seen into `backend/src/routes/submissions.ts`**

In `backend/src/routes/submissions.ts`:
- `GET /:id`:
  - Compute `const hasUnreadUpdate = hasUnreadAuthorUpdate(sub);` and `const authorUpdatedSlots = hasUnreadUpdate ? parseAuthorUpdatedSlots(sub.authorUpdatedSlots) : [];` before mutating `adminSeenAt`.
  - When `user!.role === "admin"`, update `submissions` with `adminSeenAt: new Date()` where `eq(submissions.id, params.id)`.
  - Include `hasUnreadUpdate` and `authorUpdatedSlots` in the returned `ok({ ... })` payload so `AdminSubmissionDetailModal.vue` can display what was just updated during that modal view.
- `POST /:id/revisions/latest/replace-file`: include `...buildAuthorUpdateTracking(sub, ["fullPaperPdf"])` in `db.update(submissions).set({ ... })`.
- `PUT /:id`:
  - After updating `submissions` and fetching `updated`, if `sub.status !== "draft"` and `updated && hasSubmissionMetadataChanged(sub, updated)`:
    - Compute `const tracking = buildAuthorUpdateTracking(sub, ["metadata"]);`
    - Update `submissions` with `tracking` and call `await recordMetadataRevisionSnapshot(updated);`, then re-assign `updated = { ...updated, ...tracking }`.
- `POST /:id/upload-files`:
  - When `!isInitialSubmit`, compute `const tracking = buildAuthorUpdateTracking(sub, detectUploadedAuthorSlots(files));` and spread `...(tracking ?? {})` into `db.update(submissions).set({ ... })`.
- `POST /:id/upload-paper`:
  - Compute `const tracking = buildAuthorUpdateTracking(sub, ["fullPaperPdf"]);` and spread `...(tracking ?? {})` into `db.update(submissions).set({ ... })`.
- `POST /:id/revise`:
  - Compute `const changedSlots = detectUploadedAuthorSlots(files);` and `const tracking = buildAuthorUpdateTracking(sub, changedSlots.length ? changedSlots : ["metadata"]);` and spread `...(tracking ?? {})` into `db.update(submissions).set({ ... })`.

- [ ] **Step 2: Add `hasUnreadUpdate` SQL predicate in `backend/src/utils/admin-submission-filters.ts` and expose unread data in `backend/src/routes/admin.ts`**

In `backend/src/utils/admin-submission-filters.ts`:
- Add `hasUnreadUpdate?: string;` to `AdminSubmissionFilterQuery`.
- Export `buildUnreadAuthorUpdateSql(): SQL`:
  ```ts
  export function buildUnreadAuthorUpdateSql(): SQL {
    return sql`(${submissions.authorUpdatedAt} IS NOT NULL AND (${submissions.adminSeenAt} IS NULL OR ${submissions.authorUpdatedAt} > ${submissions.adminSeenAt}))`;
  }
  ```
- In `buildAdminSubmissionWhere(query)`: if `query.hasUnreadUpdate !== undefined && query.hasUnreadUpdate !== ""` validate `query.hasUnreadUpdate === "1"` (returning `{ ok: false, error: ... }` otherwise) and push `buildUnreadAuthorUpdateSql()`.

In `backend/src/routes/admin.ts`:
- Add `hasUnreadUpdate: t.Optional(t.String())` to `adminSubmissionFilterQueryFields`.
- In `GET /submissions`:
  - Select `authorUpdatedAt: submissions.authorUpdatedAt`, `authorUpdateSummary: submissions.authorUpdateSummary`, `authorUpdatedSlots: submissions.authorUpdatedSlots`, `adminSeenAt: submissions.adminSeenAt`.
  - Query `unreadCountResult` (`db.select({ count: sql<number>\`count(*)\` }).from(submissions).where(buildUnreadAuthorUpdateSql())`) in parallel inside `Promise.all`.
  - Map each row to include `hasUnreadUpdate: hasUnreadAuthorUpdate(submission)` and `authorUpdatedSlots: hasUnreadAuthorUpdate(submission) ? parseAuthorUpdatedSlots(submission.authorUpdatedSlots) : []`.
  - Return `unreadUpdateCount: Number(unreadCountResult[0]?.count ?? 0)` inside `meta` alongside `page`, `limit`, `total`, `totalPages`.

- [ ] **Step 3: Verify SQL generation and TypeScript compilation for Task 2**

Run:
```bash
cd backend && bun -e '
import assert from "node:assert/strict";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import { buildAdminSubmissionWhere } from "./src/utils/admin-submission-filters";

const dialect = new MySqlDialect();
const valid = buildAdminSubmissionWhere({ hasUnreadUpdate: "1" });
assert.equal(valid.ok, true);
if (valid.ok && valid.where) {
  const q = dialect.sqlToQuery(valid.where);
  assert.match(q.sql, /author_updated_at/);
  assert.match(q.sql, /admin_seen_at/);
}
const invalid = buildAdminSubmissionWhere({ hasUnreadUpdate: "invalid" });
assert.equal(invalid.ok, false);
console.log("Task 2 filter assertions passed");
' && bun x tsc --noEmit
```
Expected: `Task 2 filter assertions passed` and exit code `0`.

- [ ] **Step 4: Commit Task 2**

```bash
git add backend/src/routes/submissions.ts backend/src/utils/admin-submission-filters.ts backend/src/routes/admin.ts
git commit -m "feat(backend): record author updates and expose unread update filter for admin"
```

---

### Task 3: Frontend Quick Filter Pill, In-Table Update Badges, and Detail Modal Banner

**Files:**
- Modify: `frontend/utils/admin-submission-filters.ts`
- Modify: `frontend/pages/admin/index.vue`
- Modify: `frontend/components/admin/SubmissionDetailModal.vue`

**Interfaces:**
- Consumes:
  - `GET /admin/submissions` returning `hasUnreadUpdate`, `authorUpdatedAt`, `authorUpdateSummary`, `authorUpdatedSlots` on each submission row and `meta.unreadUpdateCount: number`.
  - `GET /submissions/:id` returning `hasUnreadUpdate`, `authorUpdatedAt`, `authorUpdateSummary`, `authorUpdatedSlots`.

- [ ] **Step 1: Extend `frontend/utils/admin-submission-filters.ts` with `hasUnreadUpdate`**

In `frontend/utils/admin-submission-filters.ts`:
- Add `hasUnreadUpdate?: boolean;` to `AdminSubmissionFilterState` (default `false` in `createEmptyAdminSubmissionFilters()`).
- In `buildAdminSubmissionSearchParams(state)`: if `state.hasUnreadUpdate`, set `params.set("hasUnreadUpdate", "1")`.
- In `hasActiveAdminSubmissionFilters(state, rawSearchInput)`: include `Boolean(state.hasUnreadUpdate)`.

- [ ] **Step 2: Add quick-filter pill, row highlight, update summary badge, and file-slot badges in `frontend/pages/admin/index.vue`**

In `frontend/pages/admin/index.vue`:
- Extend `Submission` interface with:
  ```ts
  hasUnreadUpdate: boolean;
  authorUpdatedAt: string | null;
  authorUpdateSummary: string | null;
  authorUpdatedSlots: ("abstractPdf" | "abstractWord" | "fullPaperPdf" | "fullPaperWord" | "metadata")[];
  ```
- Add `const unreadUpdateCount = ref(0);` and `const filterHasUnreadUpdate = ref(false);`, include `hasUnreadUpdate: filterHasUnreadUpdate.value` in `currentFilterState`, reset `filterHasUnreadUpdate.value = false` in `clearAllFilters()`, and watch `filterHasUnreadUpdate` alongside the other filter refs.
- In `fetchSubmissions()`, set `unreadUpdateCount.value = data?.meta?.unreadUpdateCount ?? 0;` (add `unreadUpdateCount?: number` to `meta` type).
- In `openDetail(id: string)`:
  - Find the target row in `submissions.value`; if `row && row.hasUnreadUpdate`, set `row.hasUnreadUpdate = false` and decrement `unreadUpdateCount.value = Math.max(0, unreadUpdateCount.value - 1)` so the badge clears immediately on click.
- Add helper `formatRelativeDateTime(iso: string | null): string` returning concise Thai date/time (e.g. `new Date(iso).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })`).
- In the filter toolbar row (next to `"ตัวกรองเพิ่มเติม"`):
  - Render a quick-filter toggle button (`@click="filterHasUnreadUpdate = !filterHasUnreadUpdate"`) showing icon `i-heroicons-bell-alert`, label `"มีอัปเดตใหม่"`, and a badge with `unreadUpdateCount` (highlighted in `amber` when `filterHasUnreadUpdate` is active or `unreadUpdateCount > 0`).
- In `<tbody>` of the submissions table:
  - Apply `:class="sub.hasUnreadUpdate ? 'bg-amber-50/40 border-l-4 border-l-amber-400 hover:bg-amber-50/70' : 'hover:bg-gray-50'"` on `<tr>`.
  - Inside the `"ผลงาน"` cell under the title button, when `sub.hasUnreadUpdate`, render a pill badge (`bg-amber-100 text-amber-800 border border-amber-200`) displaying `sub.authorUpdateSummary || "มีการอัปเดตข้อมูล/ไฟล์"` and `formatRelativeDateTime(sub.authorUpdatedAt)`.
  - Inside the `"ไฟล์บทคัดย่อ"` and `"ไฟล์ฉบับสมบูรณ์"` cells, when `sub.hasUnreadUpdate` and `sub.authorUpdatedSlots?.includes(...)` matches that link (`"abstractPdf"`, `"abstractWord"`, `"fullPaperPdf"`, `"fullPaperWord"`), display a `"ใหม่"` badge next to `PDF` / `Word`.

- [ ] **Step 3: Show recent author update banner inside `frontend/components/admin/SubmissionDetailModal.vue`**

In `frontend/components/admin/SubmissionDetailModal.vue`:
- Add `hasUnreadUpdate?: boolean`, `authorUpdatedAt?: string | null`, `authorUpdateSummary?: string | null`, `authorUpdatedSlots?: string[]` to the `Submission` interface.
- At the top of the modal body (above the title/status section), when `submission.hasUnreadUpdate` is `true`, render an amber alert banner (`bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-900`) showing `submission.authorUpdateSummary || "ผู้ส่งมีการอัปเดตข้อมูล/ไฟล์ผลงาน"` and `formatDateTime(submission.authorUpdatedAt ?? null)`.

- [ ] **Step 4: Verify frontend filter helper and build Frontend with Node/npm**

Run:
```bash
cd backend && bun -e '
import assert from "node:assert/strict";
import {
  buildAdminSubmissionSearchParams,
  createEmptyAdminSubmissionFilters,
  hasActiveAdminSubmissionFilters,
} from "../frontend/utils/admin-submission-filters";

const empty = createEmptyAdminSubmissionFilters();
assert.equal(hasActiveAdminSubmissionFilters(empty, ""), false);
const withUnread = { ...empty, hasUnreadUpdate: true };
assert.equal(hasActiveAdminSubmissionFilters(withUnread, ""), true);
assert.equal(buildAdminSubmissionSearchParams(withUnread).get("hasUnreadUpdate"), "1");
console.log("Task 3 filter assertions passed");
' && cd ../frontend && npm run build
```
Expected: `Task 3 filter assertions passed` and `✨ Build complete!` with exit code `0` (restore any `.nuxt-build` manifest noise if modified).

- [ ] **Step 5: Commit Task 3**

```bash
git add frontend/utils/admin-submission-filters.ts frontend/pages/admin/index.vue frontend/components/admin/SubmissionDetailModal.vue
git commit -m "feat(frontend): display author update badges and quick filter in admin dashboard"
```
