# Admin Dashboard: Summary Stats + Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add summary statistics cards and server-side pagination (default 50/page) to the existing admin dashboard at `/admin`.

**Architecture:** Backend `GET /admin/stats` returns counts from all tables using `Promise.all` + `sql\`count(*)\``. Submissions endpoint gains `page`/`limit` query params returning `paginated()` response. Frontend adds stat cards above the table and a pagination bar below.

**Tech Stack:** Elysia.js + Drizzle ORM (backend), Nuxt 3 + @nuxt/ui (frontend)

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `backend/src/routes/admin.ts` | Add stats endpoint, add pagination to submissions |
| Modify | `frontend/pages/admin/index.vue` | Add stat cards + pagination UI + paginated fetch logic |

---

### Task 1: Backend — Implement `/admin/stats` endpoint

**Files:**
- Modify: `backend/src/routes/admin.ts:3-4` (imports), `:11` (replace TODO stats route)

- [ ] **Step 1: Add missing imports**

In `backend/src/routes/admin.ts`, update line 3 to add `reviews`:

```ts
import { registrations, users, submissions, reviews } from "../db/schema";
```

Update line 4 to add `sql`:

```ts
import { eq, desc, and, sql } from "drizzle-orm";
```

- [ ] **Step 2: Replace the stats TODO with real implementation**

Replace line 11:

```ts
// BEFORE
.get("/stats", () => ({ message: "TODO" }))
```

With:

```ts
.get("/stats", async () => {
  const [
    [{ count: totalSubmissions }],
    [{ count: totalRegistrations }],
    [{ count: totalUsers }],
    [{ count: totalReviews }],
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(submissions),
    db.select({ count: sql<number>`count(*)` }).from(registrations),
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(reviews),
  ]);

  const submissionsByStatus = await db
    .select({ status: submissions.status, count: sql<number>`count(*)` })
    .from(submissions)
    .groupBy(submissions.status);

  const registrationsByPayment = await db
    .select({ paymentStatus: registrations.paymentStatus, count: sql<number>`count(*)` })
    .from(registrations)
    .groupBy(registrations.paymentStatus);

  return ok({
    totalSubmissions: Number(totalSubmissions),
    totalRegistrations: Number(totalRegistrations),
    totalUsers: Number(totalUsers),
    totalReviews: Number(totalReviews),
    submissionsByStatus: Object.fromEntries(
      submissionsByStatus.map((s) => [s.status, Number(s.count)])
    ),
    registrationsByPayment: Object.fromEntries(
      registrationsByPayment.map((r) => [r.paymentStatus, Number(r.count)])
    ),
  });
})
```

- [ ] **Step 3: Verify backend compiles**

Run: `cd /Users/tongfreedom/projects/envicon2026/backend && bun run dev`
Expected: Server starts without TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/admin.ts
git commit -m "feat: implement admin stats endpoint with counts and breakdowns"
```

---

### Task 2: Backend — Add server-side pagination to `/admin/submissions`

**Files:**
- Modify: `backend/src/routes/admin.ts:6` (add `paginated` import), `:12-45` (submissions route)

- [ ] **Step 1: Add `paginated` import**

Update line 6:

```ts
import { ok, fail, paginated } from "../utils/response";
```

- [ ] **Step 2: Replace submissions route with paginated version**

Replace lines 12–45 (the `.get("/submissions", ...)` block including its query schema) with:

```ts
.get("/submissions", async ({ query }) => {
  const conditions = [];
  if (query.status) conditions.push(eq(submissions.status, query.status));
  if (query.track) conditions.push(eq(submissions.track, Number(query.track)));

  const where = conditions.length ? and(...conditions) : undefined;

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
  const offset = (page - 1) * limit;

  const [rows, [{ count: total }]] = await Promise.all([
    db
      .select({
        id: submissions.id,
        title: submissions.title,
        titleEn: submissions.titleEn,
        track: submissions.track,
        submitterType: submissions.submitterType,
        status: submissions.status,
        abstractFileUrl: submissions.abstractFileUrl,
        fullPaperFileUrl: submissions.fullPaperFileUrl,
        paymentSlipUrl: submissions.paymentSlipUrl,
        submittedAt: submissions.submittedAt,
        updatedAt: submissions.updatedAt,
        authorName: users.name,
        authorEmail: users.email,
        authorAffiliation: users.affiliation,
      })
      .from(submissions)
      .leftJoin(users, eq(submissions.authorId, users.id))
      .where(where)
      .orderBy(desc(submissions.updatedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(submissions)
      .where(where),
  ]);

  return paginated(rows, page, limit, Number(total));
}, {
  query: t.Object({
    status: t.Optional(t.String()),
    track: t.Optional(t.String()),
    page: t.Optional(t.String()),
    limit: t.Optional(t.String()),
  }),
})
```

- [ ] **Step 3: Verify backend compiles**

Run: `cd /Users/tongfreedom/projects/envicon2026/backend && bun run dev`
Expected: Server starts without errors.

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/admin.ts
git commit -m "feat: add server-side pagination to admin submissions endpoint"
```

---

### Task 3: Frontend — Add stats cards and pagination to admin dashboard

**Files:**
- Modify: `frontend/pages/admin/index.vue`

- [ ] **Step 1: Add stats type, state variables, and fetch function**

After line 5 (`const { handleApiCall, showError, showSuccess } = useApiError();`), add:

```ts
interface AdminStats {
  totalSubmissions: number;
  totalRegistrations: number;
  totalUsers: number;
  totalReviews: number;
  submissionsByStatus: Record<string, number>;
  registrationsByPayment: Record<string, number>;
}

const stats = ref<AdminStats | null>(null);
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const PER_PAGE = 50;
```

Add new function after the existing `updateStatus` function (after line 105):

```ts
async function fetchStats() {
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: AdminStats }>(
      `${apiBase}/admin/stats`,
      { headers: { Authorization: `Bearer ${authStore.token}` } },
    ),
  );
  if (!error && data) {
    stats.value = data.data;
  }
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchSubmissions();
}
```

- [ ] **Step 2: Update `fetchSubmissions` to handle paginated response and send page/limit**

Replace the existing `fetchSubmissions` function (lines 66–84) with:

```ts
async function fetchSubmissions() {
  loading.value = true;
  const params = new URLSearchParams();
  if (filterStatus.value) params.set("status", filterStatus.value);
  if (filterTrack.value) params.set("track", filterTrack.value);
  params.set("page", String(currentPage.value));
  params.set("limit", String(PER_PAGE));
  const qs = params.toString();
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: Submission[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(
      `${apiBase}/admin/submissions${qs ? `?${qs}` : ""}`,
      { headers: { Authorization: `Bearer ${authStore.token}` } },
    ),
  );
  loading.value = false;
  if (error) {
    showError(error);
    return;
  }
  submissions.value = data?.data ?? [];
  totalPages.value = data?.meta?.totalPages ?? 1;
  totalItems.value = data?.meta?.total ?? 0;
}
```

- [ ] **Step 3: Update watch and onMounted**

Replace line 107 (`watch([filterStatus, filterTrack], fetchSubmissions);`) with:

```ts
watch([filterStatus, filterTrack], () => {
  currentPage.value = 1;
  fetchSubmissions();
});
```

Replace line 108 (`onMounted(fetchSubmissions);`) with:

```ts
onMounted(() => {
  fetchStats();
  fetchSubmissions();
});
```

- [ ] **Step 4: Add stats cards to template**

Insert after the admin nav cards closing `</div>` (after line 134, before `<!-- Filters -->`):

```html
<!-- Summary Stats -->
<div v-if="stats" class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
  <UCard>
    <div class="text-center">
      <p class="text-3xl font-bold text-emerald-600">{{ stats.totalSubmissions }}</p>
      <p class="text-xs text-gray-500 mt-1">ผลงานที่ส่ง</p>
    </div>
  </UCard>
  <UCard>
    <div class="text-center">
      <p class="text-3xl font-bold text-blue-600">{{ stats.totalRegistrations }}</p>
      <p class="text-xs text-gray-500 mt-1">การลงทะเบียน</p>
    </div>
  </UCard>
  <UCard>
    <div class="text-center">
      <p class="text-3xl font-bold text-purple-600">{{ stats.totalUsers }}</p>
      <p class="text-xs text-gray-500 mt-1">ผู้ใช้งาน</p>
    </div>
  </UCard>
  <UCard>
    <div class="text-center">
      <p class="text-3xl font-bold text-amber-600">{{ stats.totalReviews }}</p>
      <p class="text-xs text-gray-500 mt-1">รายงานการรีวิว</p>
    </div>
  </UCard>
</div>
```

- [ ] **Step 5: Add pagination bar to template**

Insert after the table closing `</div>` (after the line `</div>` that wraps the `<table>`), before the final `</div>`:

```html
<!-- Pagination -->
<div v-if="totalPages > 1" class="flex items-center justify-between mt-4 px-3">
  <p class="text-sm text-gray-500">
    แสดง {{ submissions.length }} จาก {{ totalItems }} รายการ
  </p>
  <div class="flex gap-1">
    <UButton
      size="xs"
      color="gray"
      variant="soft"
      :disabled="currentPage <= 1"
      @click="goToPage(currentPage - 1)"
    >
      ก่อนหน้า
    </UButton>
    <template v-for="p in totalPages" :key="p">
      <UButton
        v-if="p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1"
        size="xs"
        :color="p === currentPage ? 'primary' : 'gray'"
        :variant="p === currentPage ? 'solid' : 'soft'"
        @click="goToPage(p)"
      >
        {{ p }}
      </UButton>
      <span v-else-if="Math.abs(p - currentPage) === 2" class="px-1 text-gray-400 text-xs self-end">...</span>
    </template>
    <UButton
      size="xs"
      color="gray"
      variant="soft"
      :disabled="currentPage >= totalPages"
      @click="goToPage(currentPage + 1)"
    >
      ถัดไป
    </UButton>
  </div>
</div>
```

- [ ] **Step 6: Verify frontend compiles and works**

Run: `cd /Users/tongfreedom/projects/envicon2026/frontend && npm run dev`
Expected: Dev server starts, no compilation errors. Navigate to `/admin` — stats cards show counts, table shows 50 rows max with pagination.

- [ ] **Step 7: Commit**

```bash
git add frontend/pages/admin/index.vue
git commit -m "feat: add summary stats cards and pagination to admin dashboard"
```

---

## Self-Review

**1. Spec coverage:**
- Summary statistics with counts: Task 1 (backend) + Task 3 Step 4 (frontend cards)
- Pagination per_page default 50: Task 2 (backend limit=50 default) + Task 3 Step 2 (frontend PER_PAGE=50)
- Pagination UI: Task 3 Step 5

**2. Placeholder scan:** No TBDs, TODOs, or placeholder steps found.

**3. Type consistency:**
- `AdminStats` interface matches `ok()` response shape from stats endpoint
- `paginated()` helper returns `PaginatedResponse<T>` with `meta.page/limit/total/totalPages` — frontend destructures same fields
- `sql<number>` typed correctly for count queries
- Submission interface unchanged, compatible with both old and new response shapes
