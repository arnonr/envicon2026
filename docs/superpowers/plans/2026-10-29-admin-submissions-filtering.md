# Admin Submissions Search & Filtering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable Admins on `/admin` to search submissions by title/author/co-author and filter by presentation format, reviewer (including unassigned), submitter attributes, and file attachment state across both the paginated table and Excel export.

**Architecture:** Extract a shared query validator and Drizzle `SQL` condition builder (`backend/src/utils/admin-submission-filters.ts`) plus a latest-round reviewer summary loader used identically by `GET /admin/submissions` and `GET /admin/submissions/export` in `backend/src/routes/admin.ts`. Update `frontend/pages/admin/index.vue` with a primary filter bar (debounced search input, status, payment, track, presentation format, searchable reviewer selector), a collapsible "ตัวกรองเพิ่มเติม" drawer (submitter type, education level, full-paper intent, file status), a clear-all button, and reviewer names under the table's review progress count.

**Tech Stack:** Bun, Elysia, Drizzle ORM (`mysql-core`), ExcelJS (backend); Nuxt 3, Vue 3 (`<script setup lang="ts">`), `@nuxt/ui` (`UInput`, `USelectMenu`, `UButton`, `UBadge`), Tailwind CSS (frontend).

**Spec:** `docs/superpowers/specs/2026-10-29-admin-submissions-filtering-design.md`

## Global Constraints

- Server-side pagination remains `50` items per page (`GET /admin/submissions`); all search and filter predicates execute in MySQL.
- `GET /admin/submissions` (both `rows` and `count(*)`) and `GET /admin/submissions/export` must share the exact same filter conditions and `LEFT JOIN users ON submissions.author_id = users.id`.
- Reviewer filtering must use `EXISTS` / `NOT EXISTS` subqueries rather than row-multiplying `JOIN`s so `count(*)` and pagination never duplicate submissions.
- Backend commands must run with **Bun** (`backend/`); frontend commands must run with **Node / npm** (`frontend/`).

## Review Focus

1. **MySQL `LIKE` wildcard characters in search input (`%`, `_`, `\`):** Searching `"50%"` or `"paper_1"` must match literal `%` and `_` by escaping `\`, `%`, and `_` via `escapeLikePattern` (`LIKE ... ESCAPE '\\'`).
2. **`count(*)` join parity when searching author fields:** `countResult` in `GET /admin/submissions` must include `.leftJoin(users, eq(submissions.authorId, users.id))` so `search` predicates referencing `users.name` / `users.email` / `users.affiliation` never fail with `Unknown column` in MySQL.
3. **Legacy `round1_file_url` / `round1_file_type` fallback in `fileStatus`:** Legacy submissions with `abstract_file_url IS NULL` and `round1_file_url IS NOT NULL` must count as having an Abstract file when `round1_file_type IS NULL OR round1_file_type != 'full_paper'`, and as having a Full Paper file when `round1_file_type = 'full_paper'`.
4. **`reviewerId = "unassigned"` parity with latest-round `0` badge:** A submission in Round 2 with 0 reviewers assigned in Round 2 (even if Round 1 had reviewers) displays `0` in the table; `"unassigned"` must evaluate against the latest `review_rounds` row (or absence of any `review_rounds`) so filtered rows match `assignedReviewerCount === 0`.
5. **Search debounce race on Clear Filters / pagination:** Clicking `"ล้างตัวกรอง"` while a 300ms search debounce timer is pending must cancel the timer, reset `searchInput` and `debouncedSearch` immediately, reset `currentPage = 1`, and trigger a single fetch without a stale follow-up request.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `backend/src/utils/admin-submission-filters.ts` | Create | Validate admin submission filter query params, build shared Drizzle `SQL` `where` clause (including `LIKE` escaping, reviewer `EXISTS`/`NOT EXISTS`, and legacy-aware `fileStatus`), and load latest-round reviewer progress + names |
| `backend/src/routes/admin.ts` | Modify | Wire `GET /admin/submissions` and `GET /admin/submissions/export` to shared filter helpers, include `reviewerNames` in API response and `"ผู้รีวิว (รอบล่าสุด)"` column in Excel export |
| `frontend/pages/admin/index.vue` | Modify | Render primary filter bar, debounced search, searchable reviewer dropdown (`GET /admin/reviewers` + `"unassigned"`), collapsible `"ตัวกรองเพิ่มเติม"` panel, active badge/clear button, reviewer names in table, and full filter sync on Excel export |

---

### Task 1: Shared Backend Filter Builder, Reviewer Summary, and Admin Routes

**Files:**
- Create: `backend/src/utils/admin-submission-filters.ts`
- Modify: `backend/src/routes/admin.ts:136-409`

**Interfaces:**
- Produces from `backend/src/utils/admin-submission-filters.ts`:
  - `export interface AdminSubmissionFilterQuery`:
    ```ts
    export interface AdminSubmissionFilterQuery {
      search?: string;
      status?: string;
      paymentStatus?: string;
      track?: string;
      presentationFormat?: string;
      reviewerId?: string;
      submitterType?: string;
      educationLevel?: string;
      wantsFullPaper?: string;
      fileStatus?: string;
    }
    ```
  - `export function escapeLikePattern(raw: string): string`
  - `export function buildAdminSubmissionWhere(query: AdminSubmissionFilterQuery): { ok: true; where: SQL | undefined } | { ok: false; error: string }`
  - `export async function loadLatestRoundReviewSummaries(submissionIds: string[]): Promise<Map<string, { assigned: number; completed: number; reviewerNames: string[] }>>`
-Produces from `GET /admin/submissions`: each item in `data` adds `reviewerNames: string[]`; both `GET /admin/submissions` and `GET /admin/submissions/export` accept all 10 filter query parameters.

- [ ] **Step 1: Create `backend/src/utils/admin-submission-filters.ts`**

Implement:
- `escapeLikePattern(raw: string): string` escaping `\`, `%`, and `_` with backslash (`raw.replace(/[\\%_]/g, "\\$&")`).
- Validation of optional enum/numeric query values when non-empty:
  - `status` in `STATUS_LABEL`
  - `paymentStatus` in `["unpaid", "pending_verification", "verified", "rejected"]`
  - `track` integer `1..7`
  - `presentationFormat` in `["oral", "poster"]`
  - `submitterType` in `["student", "general"]`
  - `educationLevel` in `["bachelor", "master", "doctorate"]`
  - `wantsFullPaper` in `["0", "1"]`
  - `fileStatus` in `["has_abstract", "has_full_paper", "missing_full_paper", "no_files"]`
- SQL predicates in `buildAdminSubmissionWhere`:
  - `search` (trimmed, non-empty): case-insensitive `LOWER(col) LIKE '%escaped%' ESCAPE '\\'` OR-group across `submissions.title`, `submissions.titleEn`, `submissions.creators`, `users.name`, `users.email`, `users.affiliation`.
  - Exact column predicates for `status`, `paymentStatus`, `track`, `presentationFormat`, `submitterType`, `educationLevel`, `wantsFullPaper` (`Number(query.wantsFullPaper)`).
  - `reviewerId`:
    - When `"unassigned"`: `NOT EXISTS (SELECT 1 FROM reviews r INNER JOIN review_rounds rr ON rr.id = r.round_id WHERE rr.submission_id = ${submissions.id} AND rr.round_number = (SELECT MAX(rr2.round_number) FROM review_rounds rr2 WHERE rr2.submission_id = ${submissions.id}))`
    - Otherwise (specific reviewer UUID): `EXISTS (SELECT 1 FROM reviews r WHERE r.submission_id = ${submissions.id} AND r.reviewer_id = ${reviewerId})`
  - `fileStatus` using SQL helpers `hasAbstractSql` (`abstract_file_url IS NOT NULL OR abstract_word_file_url IS NOT NULL OR (round1_file_url IS NOT NULL AND (round1_file_type IS NULL OR round1_file_type != 'full_paper'))`) and `hasFullPaperSql` (`full_paper_file_url IS NOT NULL OR full_paper_word_file_url IS NOT NULL OR (round1_file_url IS NOT NULL AND round1_file_type = 'full_paper')`):
    - `"has_abstract"` -> `hasAbstractSql`
    - `"has_full_paper"` -> `hasFullPaperSql`
    - `"missing_full_paper"` -> `submissions.wantsFullPaper = 1 AND NOT (hasFullPaperSql)`
    - `"no_files"` -> `NOT (hasAbstractSql) AND NOT (hasFullPaperSql)`
- `loadLatestRoundReviewSummaries(submissionIds: string[])`: queries `reviewRounds` (`orderBy(desc(reviewRounds.roundNumber))`) to pick latest round per submission, then queries `reviews` inner-joined with `users` (`eq(reviews.reviewerId, users.id)`) for those round IDs (`orderBy(reviews.assignedAt)`), returning `Map<string, { assigned: number; completed: number; reviewerNames: string[] }>`.

- [ ] **Step 2: Verify `admin-submission-filters.ts` SQL generation & validation rules with Bun**

Run a verification script with `MySqlDialect` from `drizzle-orm/mysql-core` asserting:
1. `escapeLikePattern("50%_test\\a")` produces `"50\\%\\_test\\\\a"` and `search: "50%"` binds `"%50\\%%"` (Review Focus #1).
2. `fileStatus: "has_abstract"`, `"has_full_paper"`, `"missing_full_paper"`, and `"no_files"` include `round1_file_url` / `round1_file_type` clauses (Review Focus #3).
3. `reviewerId: "unassigned"` emits `NOT EXISTS` scoped to `MAX(rr2.round_number)` and `reviewerId: "rev-1"` emits `EXISTS` with parameter `"rev-1"` (Review Focus #4).
4. Invalid enum values (e.g. `status: "bogus"`, `fileStatus: "unknown"`, `track: "99"`) return `{ ok: false }`.

- [ ] **Step 3: Wire `GET /admin/submissions` and `GET /admin/submissions/export` in `backend/src/routes/admin.ts`**

In `backend/src/routes/admin.ts`:
- Replace inline `conditions` in both `GET /submissions` and `GET /submissions/export` with `buildAdminSubmissionWhere(query)` (returning `400 VALIDATION_ERROR` when `!filterResult.ok`).
- Add `.leftJoin(users, eq(submissions.authorId, users.id))` to the `count(*)` query in `GET /submissions` (Review Focus #2).
- Replace inline review progress aggregation in `GET /submissions` with `loadLatestRoundReviewSummaries(submissionIds)` and include `reviewerNames: progress?.reviewerNames ?? []` in each returned row.
- Call `loadLatestRoundReviewSummaries(rows.map((r) => r.id))` in `GET /submissions/export`, add `{ header: "ผู้รีวิว (รอบล่าสุด)", key: "reviewerNames", width: 32 }` to `worksheet.columns`, populate `reviewerNames: (summaries.get(submission.id)?.reviewerNames ?? []).join(", ")`, and update `worksheet.autoFilter` to `{ from: { row: 1, column: 1 }, to: { row: 1, column: worksheet.columns.length } }`.
- Expand Elysia `query: t.Object({...})` schema on both endpoints to accept `search`, `status`, `paymentStatus`, `track`, `presentationFormat`, `reviewerId`, `submitterType`, `educationLevel`, `wantsFullPaper`, `fileStatus` (plus `page`, `limit` on `GET /submissions`).

- [ ] **Step 4: Run Backend TypeScript check**

Run: `cd backend && bun x tsc --noEmit` (verify `0` errors in `src/`).

---

### Task 2: Frontend Filter Bar, Collapsible Drawer, Reviewer Display, and Export Sync

**Files:**
- Modify: `frontend/pages/admin/index.vue`

**Interfaces:**
- Consumes:
  - `GET /admin/submissions` (with all 10 filter params + `reviewerNames: string[]` on `Submission`)
  - `GET /admin/submissions/export` (with all 10 filter params)
  - `GET /admin/reviewers` returning `{ success: true; data: Array<{ id: string; name: string; email: string; active: boolean }> }`

- [ ] **Step 1: Add filter state, debounced search, reviewer list loader, and shared `buildFilterParams()` in `frontend/pages/admin/index.vue`**

In `<script setup lang="ts">` of `frontend/pages/admin/index.vue`:
- Extend `Submission` interface with `reviewerNames: string[]`.
- Add primary filter refs: `searchInput = ref("")`, `debouncedSearch = ref("")`, `filterPresentationFormat = ref("")`, `filterReviewerId = ref("")` alongside existing `filterStatus`, `paymentStatusFilter`, `filterTrack`.
- Add secondary filter refs + drawer toggle: `showAdvancedFilters = ref(false)`, `filterSubmitterType = ref("")`, `filterEducationLevel = ref("")`, `filterWantsFullPaper = ref("")`, `filterFileStatus = ref("")`.
- Manage a 300ms debounce timer (`searchTimer: ReturnType<typeof setTimeout> | null = null`) watching `searchInput` to update `debouncedSearch`, and clean it up in `onBeforeUnmount`.
- Implement `secondaryActiveCount = computed(...)` counting non-empty values among `[filterSubmitterType, filterEducationLevel, filterWantsFullPaper, filterFileStatus]`, and `hasAnyActiveFilter = computed(...)` checking `searchInput` / `debouncedSearch` plus all 9 dropdown filters.
- Implement `clearAllFilters()` that clears `searchTimer` first, sets `searchInput.value = ""` and `debouncedSearch.value = ""` synchronously, resets all 9 dropdown refs to `""`, resets `currentPage.value = 1`, and triggers a single `fetchSubmissions()` without double-fetching (Review Focus #5).
- Fetch `GET /admin/reviewers` in `onMounted` (`fetchReviewers()`) to build `reviewerOptions`:
  - `{ value: "", label: "ผู้รีวิวทั้งหมด (All Reviewers)" }`
  - `{ value: "unassigned", label: "ยังไม่ได้กำหนดผู้รีวิว (Unassigned)" }`
  - `...reviewers.map((r) => ({ value: r.id, label: r.active ? r.name : `${r.name} (ปิดใช้งาน)` }))`
- Extract `buildFilterParams(): URLSearchParams` serializing all 10 active filters (`debouncedSearch`, `filterStatus`, `paymentStatusFilter`, `filterTrack`, `filterPresentationFormat`, `filterReviewerId`, `filterSubmitterType`, `filterEducationLevel`, `filterWantsFullPaper`, `filterFileStatus`) and use it in both `fetchSubmissions()` (appending `page` & `limit`) and `exportSubmissions()`.
- Watch `[debouncedSearch, filterStatus, paymentStatusFilter, filterTrack, filterPresentationFormat, filterReviewerId, filterSubmitterType, filterEducationLevel, filterWantsFullPaper, filterFileStatus]` (ignoring suppressed reset inside `clearAllFilters()`) to set `currentPage.value = 1` and call `fetchSubmissions()`.

- [ ] **Step 2: Update template in `frontend/pages/admin/index.vue` with primary bar, collapsible secondary filters, and table reviewer names**

In `<template>` of `frontend/pages/admin/index.vue`:
- Replace the old single-row filter block with a clean filter container (`bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-3`):
  - **Primary row:**
    - `UInput` (`v-model="searchInput"`, `icon="i-heroicons-magnifying-glass"`, `placeholder="ค้นหาชื่อผลงาน, ผู้ส่ง, อีเมล, ผู้แต่งร่วม..."`, clearable trailing `x-mark` button when `searchInput` is non-empty)
    - `USelectMenu` for `filterStatus`, `paymentStatusFilter`, `filterTrack`, `filterPresentationFormat` (`ทั้งหมด (รูปแบบ)` / `แบบบรรยาย (Oral)` / `โปสเตอร์ (Poster)`), and `filterReviewerId` (`searchable`, `searchable-placeholder="ค้นหาชื่อผู้รีวิว..."`)
  - **Action / Toolbar row:**
    - Left: `UButton` `"ตัวกรองเพิ่มเติม"` (`icon="i-heroicons-adjustments-horizontal"`, toggling `showAdvancedFilters`, with `UBadge` showing `secondaryActiveCount` when `> 0`) and `UButton` `"ล้างตัวกรอง"` (`v-if="hasAnyActiveFilter"`, `icon="i-heroicons-x-mark"`, `@click="clearAllFilters"`)
    - Right: result count (`พบผลงาน X รายการ`), `"รีเฟรช"` button, and `"Export Excel"` button
  - **Collapsible secondary panel (`v-if="showAdvancedFilters"`):** 4-column responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-100`) with `USelectMenu` for:
    - `filterSubmitterType`: ทั้งหมด (ประเภทผู้ส่ง) / นิสิต-นักศึกษา / อาจารย์-นักวิจัย-บุคคลทั่วไป
    - `filterEducationLevel`: ทั้งหมด (ระดับการศึกษา) / ปริญญาตรี / ปริญญาโท / ปริญญาเอก
    - `filterWantsFullPaper`: ทั้งหมด (ความประสงค์) / ต้องการส่ง Full Paper / ส่งเฉพาะบทคัดย่อ
    - `filterFileStatus`: ทั้งหมด (ไฟล์แนบ) / มีไฟล์บทคัดย่อ / มีไฟล์ฉบับสมบูรณ์ / ประสงค์ Full Paper แต่ยังไม่มีไฟล์ / ยังไม่มีไฟล์แนบ
- In the table's `"การรีวิวของกรรมการ"` cell: keep `reviewProgressLabel(sub)` and, when `sub.reviewerNames?.length`, render reviewer names underneath (`text-xs text-gray-500 line-clamp-2`, `:title="sub.reviewerNames.join(', ')"`).

- [ ] **Step 3: Build Frontend with Node/npm to verify compilation**

Run: `cd frontend && npm run build`
Expected: Exit code `0` (`✨ Build complete!`), then restore any generated `.nuxt-build` manifest diff (`git checkout -- frontend/.nuxt-build && git clean -fd frontend/.nuxt-build/manifest/meta`).
