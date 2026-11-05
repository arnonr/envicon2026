# Admin Reviewers Excel Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Excel export feature (`GET /admin/reviewers/export` and an "Export Excel" button on `/admin/reviewers`) that downloads reviewer information, review counts, comma-separated completed paper titles, and comma-separated pending paper titles.

**Architecture:** A new `GET /reviewers/export` endpoint in `backend/src/routes/admin-reviews.ts` (protected by `requireAdmin`) queries `reviewer_profiles` joined with `users`, and `reviews` joined with `submissions`, then constructs a styled `.xlsx` workbook via `ExcelJS`. On the frontend, `frontend/pages/admin/reviewers.vue` adds an "Export Excel" button and blob download handler matching existing admin export patterns.

**Tech Stack:** Bun + Elysia.js + Drizzle ORM + `exceljs` (backend); Nuxt 3 + Vue 3 + `@nuxt/ui` (frontend).

**Spec:** `docs/superpowers/specs/2026-11-05-admin-reviewers-excel-export-design.md`

## Global Constraints

- Route must be protected by `requireAdmin` middleware.
- Register `.get("/reviewers/export", ...)` before `.patch("/reviewers/:id", ...)` so static path `/reviewers/export` is never shadowed by `:id`.
- Split `users.name` at the last whitespace into `firstName` (including any academic title prefix) and `lastName` (empty string if single token).
- Separate paper titles with `", "` (comma + space) in both completed (`status === "completed"`) and uncompleted (`status !== "completed"`) columns.
- Match existing Excel styling (`#047857` header background, bold white text, frozen top row, `autoFilter`, `wrapText: true`).

## Review Focus

1. **Name splitting edge cases:** Single-word names, multiple spaces, or names with academic prefixes (e.g., `"ผศ.ดร. สมชาย ใจดี"`) must split cleanly into `firstName: "ผศ.ดร. สมชาย"` and `lastName: "ใจดี"` without losing characters.
2. **Multiple review rounds for the same submission:** If a reviewer reviewed the same submission across multiple rounds, ensure the title list and counts accurately reflect the review records without throwing errors on null/missing titles.
3. **Empty review lists:** Reviewers with 0 assigned reviews must still appear in the Excel export with `0` counts and `""` (empty string) for both title columns.
4. **Route ordering in Elysia:** `/reviewers/export` must be registered before `/reviewers/:id` routes.
5. **Frontend button state:** The "Export Excel" button must show loading state during download and be disabled when `loading || exporting || reviewers.length === 0`.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `backend/src/routes/admin-reviews.ts` | Modify | Add `splitReviewerName` helper and `GET /reviewers/export` ExcelJS endpoint |
| `frontend/pages/admin/reviewers.vue` | Modify | Add `exportReviewers()` handler and "Export Excel" button in header |

---

### Task 1: Add `GET /admin/reviewers/export` Endpoint (`backend/src/routes/admin-reviews.ts`)

**Files:**
- Modify: `backend/src/routes/admin-reviews.ts`

**Interfaces:**
- Consumes: `reviewerProfiles`, `users`, `reviews`, `submissions` from `../db/schema`; `ExcelJS` from `"exceljs"`
- Produces: `GET /envicon2026/api/admin/reviewers/export` returning `.xlsx` binary response

- [ ] **Step 1: Import `ExcelJS` and add `splitReviewerName` helper in `backend/src/routes/admin-reviews.ts`**

Add `import ExcelJS from "exceljs";` at top of `backend/src/routes/admin-reviews.ts`, and define:
```ts
function splitReviewerName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim().replace(/\s+/g, " ");
  if (!trimmed) return { firstName: "", lastName: "" };
  const lastSpaceIndex = trimmed.lastIndexOf(" ");
  if (lastSpaceIndex === -1) {
    return { firstName: trimmed, lastName: "" };
  }
  return {
    firstName: trimmed.slice(0, lastSpaceIndex).trim(),
    lastName: trimmed.slice(lastSpaceIndex + 1).trim(),
  };
}
```

- [ ] **Step 2: Implement `.get("/reviewers/export", ...)` on `adminReviewRoutes`**

In `backend/src/routes/admin-reviews.ts` right after `.get("/reviewers", async () => ok(await reviewerDirectory()))`:
1. Query all reviewers from `reviewerProfiles` innerJoin `users` ordered by `users.name`.
2. Query all reviews for those reviewer IDs from `reviews` innerJoin `submissions` (`eq(reviews.submissionId, submissions.id)`), selecting `reviewerId: reviews.reviewerId`, `status: reviews.status`, `title: submissions.title`, ordered by `reviews.assignedAt`.
3. Create `ExcelJS.Workbook` with worksheet `"ผู้รีวิว"` (`views: [{ state: "frozen", ySplit: 1 }]`) and columns:
   - `ลำดับ` (`sequence`, width: 9)
   - `ชื่อ` (`firstName`, width: 26)
   - `นามสกุล` (`lastName`, width: 24)
   - `ต้นสังกัด` (`affiliation`, width: 34)
   - `อีเมล` (`email`, width: 30)
   - `จำนวนงานที่ประเมินทั้งหมด` (`totalCount`, width: 22)
   - `จำนวนงานที่ประเมินแล้ว` (`completedCount`, width: 22)
   - `จำนวนงานที่ยังไม่ประเมิน` (`pendingCount`, width: 22)
   - `รายชื่องานที่ประเมินแล้ว` (`completedTitles`, width: 55)
   - `รายชื่องานที่ยังไม่ประเมิน` (`pendingTitles`, width: 55)
4. Populate rows, apply header styling (`#047857`, bold white font, autoFilter, `wrapText: true`), and return `new Response(new Uint8Array(file), { headers: ... })`.

- [ ] **Step 3: Verify backend TypeScript syntax**

Run: `cd backend && bun build src/index.ts --outdir /tmp/envicon-build-check`
Expected: Build succeeds with 0 errors.

- [ ] **Step 4: Commit Task 1**

```bash
git add backend/src/routes/admin-reviews.ts
git commit -m "feat(backend): add GET /admin/reviewers/export Excel endpoint"
```

---

### Task 2: Add Export Excel Button in Admin Reviewers Page (`frontend/pages/admin/reviewers.vue`)

**Files:**
- Modify: `frontend/pages/admin/reviewers.vue`

**Interfaces:**
- Consumes: `GET ${apiBase}/admin/reviewers/export`
- Produces: UI button and `.xlsx` file download trigger

- [ ] **Step 1: Add `exporting` state and `exportReviewers` function in `frontend/pages/admin/reviewers.vue`**

In `<script setup lang="ts">` of `frontend/pages/admin/reviewers.vue`:
```ts
const exporting = ref(false);

async function exportReviewers() {
  exporting.value = true;
  const { data, error } = await handleApiCall(() =>
    $fetch<Blob>(`${apiBase}/admin/reviewers/export`, {
      headers: headers.value,
      responseType: "blob",
    }),
  );
  exporting.value = false;
  if (error) return showError(error);

  const url = URL.createObjectURL(data!);
  const link = document.createElement("a");
  link.href = url;
  link.download = `envicon-reviewers-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showSuccess("ดาวน์โหลดไฟล์ Excel สำเร็จ");
}
```

- [ ] **Step 2: Add "Export Excel" button to page header in `frontend/pages/admin/reviewers.vue`**

Update the header `<div class="flex items-center justify-between mb-8">` to include:
```vue
      <div class="flex items-center gap-2">
        <UButton
          icon="i-heroicons-arrow-down-tray"
          color="emerald"
          variant="soft"
          :loading="exporting"
          :disabled="loading || exporting || reviewers.length === 0"
          @click="exportReviewers"
        >
          Export Excel
        </UButton>
        <UButton color="gray" variant="ghost" to="/admin">กลับแผงผู้ดูแล</UButton>
      </div>
```

- [ ] **Step 3: Verify frontend build**

Run: `cd frontend && npx nuxi prepare`
Expected: Types generated in `.nuxt` with no errors.

- [ ] **Step 4: Commit Task 2**

```bash
git add frontend/pages/admin/reviewers.vue
git commit -m "feat(frontend): add Export Excel button on admin reviewers page"
```
