# Decouple Payment from Submission Review Status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate `paymentStatus` from `submissions.status` so the review workflow can start as soon as the author uploads an abstract PDF, regardless of payment state. Payment remains admin-verified; reviewer UI never sees payment; a `revision_requested` round reuses the existing payment state.

**Architecture:** Add a `paymentStatus` enum (4 values) plus 3 audit columns to `submissions`; remove `pending_payment` and `payment_verifying` from the status enum. `upload-abstract` moves status straight to `submitted`; `upload-slip` only changes `paymentStatus`. A new admin endpoint `PATCH /admin/submissions/:id/payment` handles verify/reject. Reviewer response filters `paymentStatus` out. Frontend gets a new `PaymentStatusBadge`, the author modal's payment section becomes status-driven by `paymentStatus`, and the admin list/modal gain a filter, column, and verify/reject controls. A backfill migration moves existing rows safely.

**Tech Stack:** Drizzle ORM (MySQL), Elysia.js TypeBox validation, Vue 3 + @nuxt/ui, Pinia auth store

**Reference spec:** `docs/superpowers/specs/2026-06-19-decouple-payment-from-review-status-design.md`

**Note:** No test framework is configured in this project (no `*.test.*` / `*.spec.*` files exist). Verification is done by viewing the running app, manual click-through, and DB queries.

**Pre-existing diff:** `backend/src/routes/reviews.ts` and `frontend/pages/reviewer/reviews/[id].vue` have uncommitted changes that hide author info from reviewers. Task 5 (reviews.ts) and Task 8 (SubmissionDetailModal — no overlap) do not conflict with this diff, but Task 5 must commit in the same scope (single commit can include the existing diff too, or a separate commit beforehand — call out in the task).

---

## File Structure

**Backend (5 files modified, 2 new)**
- `backend/src/db/schema.ts` — reduce status enum, add 4 payment columns
- `backend/drizzle/0006_*.sql` (new) — migration with backfill
- `backend/drizzle/meta/0006_snapshot.json` (new) — Drizzle snapshot
- `backend/drizzle/meta/_journal.json` — append new entry
- `backend/src/routes/submissions.ts` — `upload-abstract` + `upload-slip` logic
- `backend/src/routes/admin.ts` — drop enum, list projection + filter, Excel export
- `backend/src/routes/admin-reviews.ts` — new `PATCH /submissions/:id/payment` route
- `backend/src/routes/reviews.ts` — filter `paymentStatus` from reviewer response (combine with pre-existing diff in same commit)

**Frontend (5 files modified, 1 new)**
- `frontend/components/submission/PaymentStatusBadge.vue` (new)
- `frontend/components/submission/StatusBadge.vue` — drop 2 statuses
- `frontend/components/submission/SubmissionDetailModal.vue` — refactor payment section + header badge
- `frontend/pages/submit/index.vue` — step 3 copy
- `frontend/pages/admin/index.vue` — filter + column in list
- `frontend/components/admin/SubmissionDetailModal.vue` — payment section + verify/reject buttons

---

## Task 1: Add `paymentStatus` columns + reduce `submissions.status` enum

**Files:**
- Modify: `backend/src/db/schema.ts:37-46` (status enum), `:25-52` (submissions table)
- Create: `backend/drizzle/0006_*.sql`
- Create: `backend/drizzle/meta/0006_snapshot.json`
- Modify: `backend/drizzle/meta/_journal.json`

- [ ] **Step 1: Reduce `submissions.status` enum in `schema.ts`**

Open `backend/src/db/schema.ts` and replace the `status` enum values (lines 37-46):

```ts
  status: mysqlEnum("status", [
    "draft",
    "submitted",
    "under_review",
    "accepted",
    "rejected",
    "revision_requested",
  ]).notNull().default("draft"),
```

- [ ] **Step 2: Add 4 payment columns to `submissions` table**

In the same `submissions` table definition, immediately after `paymentSlipUrl` (line 49), add:

```ts
  paymentStatus: mysqlEnum("payment_status", [
    "unpaid",
    "pending_verification",
    "verified",
    "rejected",
  ]).notNull().default("unpaid"),
  paymentVerifiedBy: varchar("payment_verified_by", { length: 36 }).references(() => users.id),
  paymentVerifiedAt: timestamp("payment_verified_at"),
  paymentNote: text("payment_note"),
```

`varchar`, `text`, `timestamp`, and `mysqlEnum` are already imported (lines 1-9).

- [ ] **Step 3: Generate the migration with Drizzle**

Run: `cd backend && bun run db:generate`
Expected: Two new files appear in `backend/drizzle/`:
- `0006_<random_name>.sql`
- `meta/0006_snapshot.json`
The `_journal.json` is also updated with a new entry (idx 6).

- [ ] **Step 4: Replace the generated SQL with the safe backfill sequence**

Open the new `0006_*.sql` file. Replace its entire contents with the 4-statement sequence below. The `--> statement-breakpoint` separator is required by Drizzle between statements. Numbering reflects the actual sequence in the file.

```sql
ALTER TABLE `submissions` ADD `payment_status` enum('unpaid','pending_verification','verified','rejected') NOT NULL DEFAULT 'unpaid';
--> statement-breakpoint
ALTER TABLE `submissions` ADD `payment_verified_by` varchar(36);
--> statement-breakpoint
ALTER TABLE `submissions` ADD `payment_verified_at` timestamp;
--> statement-breakpoint
ALTER TABLE `submissions` ADD `payment_note` text;
--> statement-breakpoint
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_payment_verified_by_fk` FOREIGN KEY (`payment_verified_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
UPDATE `submissions` SET `status` = 'submitted', `payment_status` = 'pending_verification' WHERE `status` IN ('pending_payment', 'payment_verifying');
--> statement-breakpoint
UPDATE `submissions` SET `payment_status` = 'verified' WHERE `status` = 'submitted' AND `payment_slip_url` IS NOT NULL AND `payment_slip_url` != '';
--> statement-breakpoint
ALTER TABLE `submissions` MODIFY COLUMN `status` enum('draft','submitted','under_review','accepted','rejected','revision_requested') NOT NULL DEFAULT 'draft';
```

- [ ] **Step 5: Push the migration to the database**

Run: `cd backend && bun run db:push`
Expected: All 4 statements apply successfully. The `submissions` table has new columns and a reduced `status` enum.

- [ ] **Step 6: Verify the migration with raw SQL**

Run: `cd backend && bun -e 'import { db } from "./src/db"; import { sql } from "drizzle-orm"; const r = await db.execute(sql.raw("SELECT status, payment_status, COUNT(*) AS c FROM submissions GROUP BY status, payment_status ORDER BY status, payment_status")); console.log(r[0]);'`
Expected: No row with `status` of `pending_payment` or `payment_verifying`. The `draft` rows show `payment_status = 'unpaid'`. Submitted rows show either `pending_verification` or `verified`.

- [ ] **Step 7: Stage and commit**

```bash
cd /Users/macbook-arnon/Projects/envicon2026
git add backend/src/db/schema.ts backend/drizzle/0006_*.sql backend/drizzle/meta/0006_snapshot.json backend/drizzle/meta/_journal.json
git commit -m "feat(db): decouple paymentStatus from submissions.status enum"
```

---

## Task 2: Update `submissions.ts` — `upload-abstract` + `upload-slip`

**Files:**
- Modify: `backend/src/routes/submissions.ts:309-351` (upload-abstract)
- Modify: `backend/src/routes/submissions.ts:395-437` (upload-slip)

- [ ] **Step 1: Change `upload-abstract` status guard + target**

In `backend/src/routes/submissions.ts`, find the `POST /:id/upload-abstract` handler. Replace the `if (!["draft", "pending_payment"].includes(...))` guard (around line 326) with:

```ts
      if (sub.status !== "draft") {
        set.status = 400;
        return fail("VALIDATION_ERROR", "Cannot upload in current status");
      }
```

Then change the `.set({ abstractFileUrl: fileUrl, status: "pending_payment", ... })` call (around line 335) to:

```ts
      await db
        .update(submissions)
        .set({ abstractFileUrl: fileUrl, status: "submitted", submittedAt: new Date() })
        .where(eq(submissions.id, params.id));
```

- [ ] **Step 2: Change `upload-slip` guard + update set**

In the same file, find the `POST /:id/upload-slip` handler. Replace the `if (sub.status !== "pending_payment")` guard (around line 412) with:

```ts
      if (sub.paymentStatus === "verified") {
        set.status = 400;
        return fail("VALIDATION_ERROR", "ชำระเงินเรียบร้อยแล้ว ไม่ต้องอัปโหลดเพิ่ม");
      }
```

Then change the `.set({ paymentSlipUrl: fileUrl, status: "payment_verifying" })` call (around line 421) to:

```ts
      await db
        .update(submissions)
        .set({ paymentSlipUrl: fileUrl, paymentStatus: "pending_verification" })
        .where(eq(submissions.id, params.id));
```

- [ ] **Step 3: Smoke-test both endpoints with `curl`**

Start the dev server in another terminal: `cd backend && bun run dev`
Wait for `🌿 ENVICON 2026 API running at http://localhost:3001`.

In the project shell, run a smoke test (replace `$TOKEN` with a real author JWT — get one by logging in via the running frontend, or seed an author via SQL and use the auth endpoint):

```bash
# 1. Create a fresh submission as author
SUB_ID=$(curl -s -X POST http://localhost:3001/envicon2026/api/submissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"smoke test","titleEn":"smoke test","abstract":"x","track":1,"submitterType":"student","educationLevel":"bachelor","presentationFormat":"oral"}' \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["data"]["id"])')
echo "Created: $SUB_ID"

# 2. Upload a tiny PDF (must be valid PDF magic bytes: %PDF-1.4)
echo '%PDF-1.4' > /tmp/smoke.pdf
curl -s -X POST http://localhost:3001/envicon2026/api/submissions/$SUB_ID/upload-abstract \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/smoke.pdf;type=application/pdf" | python3 -m json.tool
# Expected: response.data.status == "submitted" (NOT "pending_payment")

# 3. Upload a fake slip
echo 'fake' > /tmp/slip.png
curl -s -X POST http://localhost:3001/envicon2026/api/submissions/$SUB_ID/upload-slip \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/slip.png;type=image/png" | python3 -m json.tool
# Expected: response.data.paymentStatus == "pending_verification", response.data.status still "submitted"
```

- [ ] **Step 4: Stage and commit**

```bash
cd /Users/macbook-arnon/Projects/envicon2026
git add backend/src/routes/submissions.ts
git commit -m "feat(submissions): upload-abstract goes to submitted; upload-slip updates paymentStatus only"
```

---

## Task 3: Update `admin.ts` — drop enum, list filter/projection, Excel column

**Files:**
- Modify: `backend/src/routes/admin.ts:21-30` (status label map)
- Modify: `backend/src/routes/admin.ts:111-205` (list endpoint)
- Modify: `backend/src/routes/admin.ts:206-336` (export endpoint)
- Modify: `backend/src/routes/admin.ts:381-429` (PATCH status endpoint)

- [ ] **Step 1: Remove the 2 labels from `STATUS_NAMES`**

In `backend/src/routes/admin.ts` (lines 21-30), remove the `pending_payment` and `payment_verifying` entries:

```ts
const STATUS_NAMES: Record<string, string> = {
  draft: "ร่าง",
  submitted: "ส่งแล้ว",
  under_review: "กำลังพิจารณา",
  accepted: "ผ่านการพิจารณา",
  rejected: "ไม่ผ่าน",
  revision_requested: "ขอแก้ไข",
};
```

- [ ] **Step 2: Add a `PAYMENT_STATUS_NAMES` map**

Immediately after the `STATUS_NAMES` map (around line 30), add:

```ts
const PAYMENT_STATUS_NAMES: Record<string, string> = {
  unpaid: "ยังไม่ชำระ",
  pending_verification: "รอตรวจสอบ",
  verified: "ชำระแล้ว",
  rejected: "ปฏิเสธ",
};
```

- [ ] **Step 3: Add `paymentStatus` to list projection + query filter**

In the `GET /submissions` handler, add `paymentStatus: submissions.paymentStatus` to the `.select({...})` block (after `paymentSlipUrl`, around line 135). Then in the `query: t.Object({...})` schema (around line 199), add:

```ts
      paymentStatus: t.Optional(t.String()),
```

Then add a condition in the `conditions` array (after the `track` line, around line 114):

```ts
    if (query.paymentStatus) conditions.push(eq(submissions.paymentStatus, query.paymentStatus as typeof submissions.paymentStatus.enumValues[number]));
```

- [ ] **Step 4: Add `paymentStatus` to Excel export select + worksheet column**

In the `GET /submissions/export` handler, add `paymentStatus: submissions.paymentStatus` to the `.select({...})` block (after `paymentSlipUrl`, around line 228).

In the `worksheet.columns` array (after the "ลิงก์หลักฐานชำระเงิน" column, around line 265), add:

```ts
      { header: "สถานะการชำระเงิน", key: "paymentStatus", width: 20 },
```

In the row mapper `worksheet.addRow({...})` call (after `paymentSlipUrl: absoluteFileUrl(...)` line, around line 273), add:

```ts
        paymentStatus: PAYMENT_STATUS_NAMES[submission.paymentStatus] ?? submission.paymentStatus,
```

Change `worksheet.autoFilter = "A1:T1";` (line 308) to:

```ts
    worksheet.autoFilter = "A1:U1";
```

- [ ] **Step 5: Drop the 2 enum values from `PATCH /submissions/:id/status`**

In the `body: t.Object({...})` schema of the PATCH handler (lines 416-426), remove the `pending_payment` and `payment_verifying` literals:

```ts
      body: t.Object({
        status: t.Union([
          t.Literal("draft"),
          t.Literal("submitted"),
          t.Literal("under_review"),
          t.Literal("accepted"),
          t.Literal("rejected"),
          t.Literal("revision_requested"),
        ]),
      }),
```

- [ ] **Step 6: Smoke-test the list + export endpoints**

```bash
# Login as admin to get a token (or seed one), then:
curl -s "http://localhost:3001/envicon2026/api/admin/submissions?paymentStatus=pending_verification" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -c 'import sys,json; d=json.load(sys.stdin); print("count:", len(d["data"]), "first paymentStatus:", d["data"][0]["paymentStatus"] if d["data"] else "n/a")'
# Expected: list contains only rows with paymentStatus == "pending_verification"

# Test export
curl -s "http://localhost:3001/envicon2026/api/admin/submissions/export" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -o /tmp/submissions.xlsx
# Open /tmp/submissions.xlsx in any spreadsheet app — last column header should be "สถานะการชำระเงิน"
```

- [ ] **Step 7: Stage and commit**

```bash
cd /Users/macbook-arnon/Projects/envicon2026
git add backend/src/routes/admin.ts
git commit -m "feat(admin): drop payment statuses from main enum; add paymentStatus filter/column"
```

---

## Task 4: Add `PATCH /admin/submissions/:id/payment` endpoint

**Files:**
- Modify: `backend/src/routes/admin-reviews.ts` (append new route inside the existing `adminReviewRoutes` plugin, after the existing `release` route around line 577)

- [ ] **Step 1: Add imports**

At the top of `backend/src/routes/admin-reviews.ts`, the `t` import is on line 1. The `eq` import is on line 2. Verify both are present; if not, ensure they are. The handler needs `submissions` from schema (line 11), `getUserFromHeaders` (line 14), and `requireAdmin` (line 15) — all already imported.

- [ ] **Step 2: Append the new PATCH route after the `release` route**

Find the end of the `release` route (closing `}` and `,` after `{ params: t.Object({ roundId: t.String() }) },` around line 576-577). Insert the new route before the next route (the `email-notifications/:id/retry` POST):

```ts
  .patch(
    "/submissions/:id/payment",
    async ({ params, body, headers, set }) => {
      const admin = (await getUserFromHeaders(headers.authorization))!;
      const [sub] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);
      if (!sub) {
        set.status = 404;
        return fail("NOT_FOUND", "ไม่พบผลงาน");
      }
      if (sub.paymentStatus !== "pending_verification") {
        set.status = 400;
        return fail(
          "VALIDATION_ERROR",
          `ไม่สามารถดำเนินการได้ สถานะการชำระเงินปัจจุบันคือ ${sub.paymentStatus}`,
        );
      }
      if (body.paymentStatus === "rejected" && !body.note?.trim()) {
        set.status = 400;
        return fail("VALIDATION_ERROR", "กรุณาระบุเหตุผลในการปฏิเสธ");
      }
      await db
        .update(submissions)
        .set({
          paymentStatus: body.paymentStatus,
          paymentVerifiedBy: admin.id,
          paymentVerifiedAt: new Date(),
          paymentNote: body.paymentStatus === "rejected" ? body.note : null,
        })
        .where(eq(submissions.id, params.id));
      const [updated] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);
      return ok(updated);
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        paymentStatus: t.Union([t.Literal("verified"), t.Literal("rejected")]),
        note: t.Optional(t.String()),
      }),
    },
  )
```

- [ ] **Step 3: Smoke-test the endpoint**

```bash
# Use the SUB_ID from Task 2's smoke test (or any submission with paymentStatus=pending_verification)

# 1. Verify success
curl -s -X PATCH http://localhost:3001/envicon2026/api/admin/submissions/$SUB_ID/payment \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentStatus":"verified"}' | python3 -c 'import sys,json; d=json.load(sys.stdin); print("status:", d["data"]["paymentStatus"], "verifiedBy:", d["data"]["paymentVerifiedBy"])'
# Expected: "verified", admin user id

# 2. Re-verify should fail (already verified)
curl -s -X PATCH http://localhost:3001/envicon2026/api/admin/submissions/$SUB_ID/payment \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentStatus":"verified"}'
# Expected: 400 with VALIDATION_ERROR

# 3. Reject without note should fail
# Create a fresh submission, upload slip, then:
curl -s -X PATCH http://localhost:3001/envicon2026/api/admin/submissions/$NEW_SUB_ID/payment \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentStatus":"rejected"}'
# Expected: 400 with "กรุณาระบุเหตุผล"

# 4. Reject with note should succeed
curl -s -X PATCH http://localhost:3001/envicon2026/api/admin/submissions/$NEW_SUB_ID/payment \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentStatus":"rejected","note":"สลิปไม่ชัด"}' | python3 -c 'import sys,json; d=json.load(sys.stdin); print("status:", d["data"]["paymentStatus"], "note:", d["data"]["paymentNote"])'
# Expected: "rejected", "สลิปไม่ชัด"
```

- [ ] **Step 4: Stage and commit**

```bash
cd /Users/macbook-arnon/Projects/envicon2026
git add backend/src/routes/admin-reviews.ts
git commit -m "feat(admin): add PATCH /submissions/:id/payment for verify/reject"
```

---

## Task 5: Hide `paymentStatus` from reviewer response

**Files:**
- Modify: `backend/src/routes/reviews.ts` (around lines 50-130, the GET /:id handler)

**Note:** This file has uncommitted changes that hide author info from reviewers. Commit those first if you want a clean history, OR include them in the same commit. Recommended: commit the existing diff separately first, then apply this task as a focused change.

- [ ] **Step 0: Commit the pre-existing diff (if not already committed)**

```bash
cd /Users/macbook-arnon/Projects/envicon2026
git status --short
# If reviews.ts and reviewer/reviews/[id].vue still show as modified, commit them now:
git add backend/src/routes/reviews.ts frontend/pages/reviewer/reviews/[id].vue
git commit -m "feat(reviews): hide author info from reviewer response"
```

- [ ] **Step 1: Add `paymentStatus` to the reviewer select**

In `backend/src/routes/reviews.ts`, find the `.select({...})` call in the `GET /:id` handler. Add `paymentStatus: submissions.paymentStatus` to the selected fields (alongside other submission fields):

```ts
        paymentStatus: submissions.paymentStatus,
```

- [ ] **Step 2: Filter `paymentStatus` from the reviewer response**

In the same handler, the existing reviewer-filter block (added in the previous commit) looks like:

```ts
      if (isAdmin) {
        response.creators = resolvedCreators;
      } else {
        delete response.authorName;
        delete response.authorAffiliation;
        delete response.creators;
      }
```

Extend the `else` branch to also delete `paymentStatus`:

```ts
      if (isAdmin) {
        response.creators = resolvedCreators;
      } else {
        delete response.authorName;
        delete response.authorAffiliation;
        delete response.creators;
        delete response.paymentStatus;
      }
```

(The existing `delete response.versionCreators;` line is already there — keep it.)

- [ ] **Step 3: Smoke-test as reviewer**

```bash
# Login as a reviewer who has a review assignment on SUB_ID, then:
curl -s http://localhost:3001/envicon2026/api/reviews/$REVIEW_ID \
  -H "Authorization: Bearer $REVIEWER_TOKEN" | python3 -c 'import sys,json; d=json.load(sys.stdin)["data"]; print("paymentStatus in response:", "paymentStatus" in d)'
# Expected: False

# Login as admin and try the same:
curl -s http://localhost:3001/envicon2026/api/reviews/$REVIEW_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -c 'import sys,json; d=json.load(sys.stdin)["data"]; print("paymentStatus in response:", "paymentStatus" in d)'
# Expected: True
```

- [ ] **Step 4: Stage and commit**

```bash
cd /Users/macbook-arnon/Projects/envicon2026
git add backend/src/routes/reviews.ts
git commit -m "feat(reviews): hide paymentStatus from reviewer response"
```

---

## Task 6: Add `PaymentStatusBadge` component

**Files:**
- Create: `frontend/components/submission/PaymentStatusBadge.vue`

- [ ] **Step 1: Create the new component**

Create `frontend/components/submission/PaymentStatusBadge.vue` with the following content (mirror the structure of `StatusBadge.vue`):

```vue
<script setup lang="ts">
const props = defineProps<{ status: string }>();

const CONFIG = {
  unpaid: { label: 'ยังไม่ชำระ', color: 'gray' },
  pending_verification: { label: 'รอตรวจสอบ', color: 'yellow' },
  verified: { label: 'ชำระแล้ว', color: 'green' },
  rejected: { label: 'ปฏิเสธ', color: 'red' },
} as const;

const badge = computed(() =>
  CONFIG[props.status as keyof typeof CONFIG] ?? { label: props.status, color: 'gray' }
);
</script>

<template>
  <UBadge :color="badge.color as any" variant="soft" size="xs">
    <UIcon v-if="status === 'verified'" name="i-heroicons-check-circle" class="w-3 h-3 mr-0.5" />
    {{ badge.label }}
  </UBadge>
</template>
```

- [ ] **Step 2: Stage and commit**

```bash
cd /Users/macbook-arnon/Projects/envicon2026
git add frontend/components/submission/PaymentStatusBadge.vue
git commit -m "feat(frontend): add PaymentStatusBadge component"
```

---

## Task 7: Remove old statuses from `StatusBadge.vue`

**Files:**
- Modify: `frontend/components/submission/StatusBadge.vue:4-13`

- [ ] **Step 1: Drop the 2 status entries**

Open `frontend/components/submission/StatusBadge.vue` and replace the `STATUS_CONFIG` object (lines 4-13):

```ts
const STATUS_CONFIG = {
  draft: { label: 'ร่าง', color: 'gray' },
  submitted: { label: 'ส่งแล้ว', color: 'blue' },
  under_review: { label: 'กำลังพิจารณา', color: 'yellow' },
  accepted: { label: 'ผ่านการพิจารณา', color: 'green' },
  rejected: { label: 'ไม่ผ่าน', color: 'red' },
  revision_requested: { label: 'ขอแก้ไข', color: 'orange' },
} as const;
```

- [ ] **Step 2: Stage and commit**

```bash
cd /Users/macbook-arnon/Projects/envicon2026
git add frontend/components/submission/StatusBadge.vue
git commit -m "refactor(frontend): drop payment statuses from StatusBadge"
```

---

## Task 8: Refactor `SubmissionDetailModal.vue` payment section

**Files:**
- Modify: `frontend/components/submission/SubmissionDetailModal.vue`

- [ ] **Step 1: Add `paymentStatus` to the `Submission` interface**

Find the `Submission` interface (lines 17-36). Add the field after `paymentSlipUrl`:

```ts
  paymentSlipUrl: string | null;
  paymentStatus: 'unpaid' | 'pending_verification' | 'verified' | 'rejected';
  paymentNote: string | null;
  submittedAt: string | null;
```

- [ ] **Step 2: Add `PaymentStatusBadge` to the modal header**

In the header `<template #header>` block (around line 190), find the existing `<SubmissionStatusBadge>` element. Add a `<PaymentStatusBadge>` next to it (inside the same flex container):

```vue
          <div class="flex items-center gap-2 flex-shrink-0">
            <SubmissionStatusBadge :status="submission.status" />
            <PaymentStatusBadge :status="submission.paymentStatus" />
          </div>
```

- [ ] **Step 3: Replace the existing payment blocks with a single status-driven block**

Find the two existing payment blocks:
- The "Payment info (pending_payment)" block (lines 282-330, `v-if="submission.status === 'pending_payment'"`)
- The "Payment verifying" block (lines 333-347, `v-if="submission.status === 'payment_verifying'"`)

Delete both. Replace them with one block gated on `paymentStatus !== 'verified'`:

```vue
        <!-- Payment section (status-driven by paymentStatus) -->
        <div v-if="submission.paymentStatus !== 'verified'" class="border border-blue-200 rounded-lg p-4 bg-blue-50/50 space-y-4">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-credit-card" class="w-5 h-5 text-blue-600" />
            <h3 class="text-sm font-semibold text-blue-700">ชำระค่าส่งผลงาน</h3>
            <PaymentStatusBadge :status="submission.paymentStatus" class="ml-auto" />
          </div>

          <!-- unpaid: QR + bank + upload -->
          <template v-if="submission.paymentStatus === 'unpaid'">
            <div class="flex justify-center">
              <div class="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <span class="text-xs text-gray-400">QR Code</span>
              </div>
            </div>
            <div class="bg-white rounded-lg p-3 text-sm space-y-1.5">
              <p class="font-semibold text-gray-700">รายละเอียดการโอน</p>
              <div class="flex justify-between">
                <span class="text-gray-500">ธนาคาร</span>
                <span>กสิกรไทย (KBANK)</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">เลขบัญชี</span>
                <span class="font-mono">XXX-X-XXXXX-X</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">ชื่อบัญชี</span>
                <span>สมาคมสถาบันอุดมศึกษาสิ่งแวดล้อมไทย</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">จำนวนเงิน</span>
                <span class="font-semibold text-primary-700">
                  {{ submission.submitterType === 'student' ? fees.student.toLocaleString() : fees.general.toLocaleString() }} บาท
                </span>
              </div>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-2">อัปโหลดหลักฐานการชำระเงิน (สลิปโอนเงิน)</p>
              <CommonFileUpload :loading="uploadingSlip" :max-size-mb="10" accept=".pdf,.png,.jpg,.jpeg" @change="onSlipSelected" />
              <div class="flex justify-end mt-3">
                <UButton v-if="selectedSlipFile" color="primary" :loading="uploadingSlip" @click="uploadSlip">
                  บันทึก
                  <UIcon name="i-heroicons-check" class="w-4 h-4 ml-1" />
                </UButton>
                <p v-else class="text-xs text-gray-400 self-center">เลือกไฟล์ก่อนบันทึก</p>
              </div>
            </div>
          </template>

          <!-- pending_verification: slip preview only -->
          <template v-else-if="submission.paymentStatus === 'pending_verification'">
            <p class="text-sm text-gray-600">ได้รับหลักฐานการชำระเงินเรียบร้อย กำลังรอเจ้าหน้าที่ตรวจสอบ</p>
            <div v-if="submission.paymentSlipUrl">
              <p class="text-xs text-gray-500 mb-1.5">หลักฐานการชำระเงิน</p>
              <img
                :src="fileLink(submission.paymentSlipUrl)"
                class="w-32 h-auto rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity object-cover"
                @click="slipPreviewOpen = true"
              />
            </div>
          </template>

          <!-- rejected: note + re-upload -->
          <template v-else-if="submission.paymentStatus === 'rejected'">
            <div class="bg-red-50 border border-red-200 rounded p-3 text-sm">
              <p class="font-semibold text-red-700 mb-1">เหตุผลที่ปฏิเสธ</p>
              <p class="text-red-600 whitespace-pre-line">{{ submission.paymentNote || '-' }}</p>
            </div>
            <p class="text-xs text-gray-500">กรุณาอัปโหลดหลักฐานการชำระเงินใหม่</p>
            <CommonFileUpload :loading="uploadingSlip" :max-size-mb="10" accept=".pdf,.png,.jpg,.jpeg" @change="onSlipSelected" />
            <div class="flex justify-end mt-3">
              <UButton v-if="selectedSlipFile" color="primary" :loading="uploadingSlip" @click="uploadSlip">
                อัปโหลดใหม่
                <UIcon name="i-heroicons-arrow-up-tray" class="w-4 h-4 ml-1" />
              </UButton>
            </div>
          </template>
        </div>

        <!-- Verified: replace section with a small success line -->
        <div v-else class="flex items-center gap-1.5 text-sm text-green-700 px-1">
          <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
          <span>ชำระเงินเรียบร้อย</span>
        </div>
```

- [ ] **Step 4: Manual click-through verification**

Start the frontend dev server: `cd frontend && npm run dev`
Open `http://localhost:3000/dashboard` in a browser, log in as an author, click an existing submission to open the modal.

Expected: 
- Header shows both `SubmissionStatusBadge` and `PaymentStatusBadge`
- If `paymentStatus === 'unpaid'`: section shows QR + bank details + upload control
- If `paymentStatus === 'pending_verification'`: section shows "รอตรวจสอบ" + slip thumbnail
- If `paymentStatus === 'rejected'`: section shows red note + re-upload control
- If `paymentStatus === 'verified'`: section is hidden, green "ชำระเงินเรียบร้อย" line shows instead

- [ ] **Step 5: Stage and commit**

```bash
cd /Users/macbook-arnon/Projects/envicon2026
git add frontend/components/submission/SubmissionDetailModal.vue
git commit -m "feat(frontend): refactor payment section to be paymentStatus-driven"
```

---

## Task 9: Update `submit/index.vue` step 3 copy

**Files:**
- Modify: `frontend/pages/submit/index.vue:215-218`

- [ ] **Step 1: Change the step 3 success message**

Find the paragraph inside the "Step 3" `<UCard>` (around line 215-218):

```vue
        <p class="text-gray-500 text-sm max-w-sm">
          ขณะนี้ผลงานของคุณอยู่ในสถานะ<strong>รอชำระเงิน</strong> กรุณาชำระเงินค่าส่งผลงานเพื่อดำเนินการต่อไป
        </p>
```

Replace with:

```vue
        <p class="text-gray-500 text-sm max-w-sm">
          ขณะนี้ผลงานของคุณอยู่ในสถานะ<strong>ส่งแล้ว</strong> รอคณะกรรมการพิจารณา (สามารถชำระเงินภายหลังได้จากหน้ารายละเอียดผลงาน)
        </p>
```

- [ ] **Step 2: Manual click-through verification**

In a browser, log in as an author, go through the full submission flow. After step 3, verify the new copy shows.

- [ ] **Step 3: Stage and commit**

```bash
cd /Users/macbook-arnon/Projects/envicon2026
git add frontend/pages/submit/index.vue
git commit -m "feat(frontend): update submit step 3 copy to reflect submitted status"
```

---

## Task 10: Update `pages/admin/index.vue` — filter + column

**Files:**
- Modify: `frontend/pages/admin/index.vue` (Submission interface, table header, table row, filter bar)

- [ ] **Step 1: Add `paymentStatus` to the admin `Submission` interface**

In the `<script setup>` of `pages/admin/index.vue`, find the `Submission` interface. Add the field after `status`:

```ts
  status: string;
  paymentStatus: 'unpaid' | 'pending_verification' | 'verified' | 'rejected';
```

- [ ] **Step 2: Add a `paymentStatus` filter dropdown**

Find the existing filter bar (`<select>` or filter group) that contains the `status` filter. Add a new `<select>` for payment status immediately after it. The exact markup depends on the existing pattern in the file — match it. If the existing filter uses `<select class="..." v-model="statusFilter">`, add a parallel one:

```vue
<select v-model="paymentStatusFilter" class="border border-gray-300 rounded px-3 py-1.5 text-sm">
  <option value="">ทั้งหมด (การชำระเงิน)</option>
  <option value="unpaid">ยังไม่ชำระ</option>
  <option value="pending_verification">รอตรวจสอบ</option>
  <option value="verified">ชำระแล้ว</option>
  <option value="rejected">ปฏิเสธ</option>
</select>
```

Add the corresponding `ref` at the top of `<script setup>`:

```ts
const paymentStatusFilter = ref<string>('');
```

Wire it into the API call: pass `paymentStatus: paymentStatusFilter.value` as a query param when non-empty, alongside the existing `status` filter.

- [ ] **Step 3: Add a "การชำระเงิน" table column**

In the `<thead>`, add a `<th>` after the "สถานะ" column:

```vue
<th class="text-left px-4 py-2 font-semibold text-gray-700">การชำระเงิน</th>
```

In the `<tbody>`, add a `<td>` after the existing status `<td>`:

```vue
<td class="px-4 py-2">
  <PaymentStatusBadge :status="sub.paymentStatus" />
</td>
```

- [ ] **Step 4: Manual click-through verification**

Open `http://localhost:3000/admin` as admin, verify:
- New "การชำระเงิน" column appears in the table with badges
- Filter dropdown appears, changing it updates the table

- [ ] **Step 5: Stage and commit**

```bash
cd /Users/macbook-arnon/Projects/envicon2026
git add frontend/pages/admin/index.vue
git commit -m "feat(admin): add paymentStatus filter and column to submissions list"
```

---

## Task 11: Add verify/reject controls in admin submission modal

**Files:**
- Modify: `frontend/components/admin/SubmissionDetailModal.vue` (Submission interface, add payment section + verify/reject controls)

- [ ] **Step 1: Add payment fields to the admin `Submission` interface**

In `<script setup>`, find the `Submission` interface. Add the fields:

```ts
  paymentStatus: 'unpaid' | 'pending_verification' | 'verified' | 'rejected';
  paymentNote: string | null;
  paymentSlipUrl: string | null;
  paymentVerifiedAt: string | null;
```

- [ ] **Step 2: Add reactive state for the reject modal**

In the same `<script setup>`, add:

```ts
const rejectModalOpen = ref(false);
const rejectNote = ref('');
const rejectSubmitting = ref(false);
const showSuccess = (msg: string) => { /* use existing toast or implement */ };
const showError = (err: unknown) => { /* use existing toast or implement */ };
const { handleApiCall } = useApiError();
```

(If `useApiError` is not already imported, add `const { handleApiCall, showError, showSuccess } = useApiError();` near the top.)

- [ ] **Step 3: Add the verify and reject handlers**

In the same `<script setup>`, add:

```ts
const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();

const verifyPayment = async () => {
  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/admin/submissions/${props.submissionId}/payment`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { paymentStatus: 'verified' },
    })
  );
  if (error) { showError(error); return; }
  showSuccess('ยืนยันการชำระเงินเรียบร้อย');
  await fetchSubmission();
};

const submitReject = async () => {
  if (!rejectNote.value.trim()) return;
  rejectSubmitting.value = true;
  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/admin/submissions/${props.submissionId}/payment`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { paymentStatus: 'rejected', note: rejectNote.value },
    })
  );
  rejectSubmitting.value = false;
  if (error) { showError(error); return; }
  showSuccess('ปฏิเสธการชำระเงินเรียบร้อย');
  rejectModalOpen.value = false;
  rejectNote.value = '';
  await fetchSubmission();
};
```

- [ ] **Step 4: Add the payment section to the template**

In `<template>`, add a new section before the existing "ข้อมูลผลงาน" details (find an appropriate insertion point — e.g., right after the header `<UCard>` opens):

```vue
<div class="border border-gray-200 rounded-lg p-4 space-y-3">
  <div class="flex items-center justify-between">
    <h3 class="text-sm font-semibold text-gray-700">การชำระเงิน</h3>
    <PaymentStatusBadge :status="submission.paymentStatus" />
  </div>

  <div v-if="submission.paymentSlipUrl" class="text-sm">
    <span class="text-gray-500">หลักฐาน: </span>
    <a :href="submission.paymentSlipUrl" target="_blank" class="text-primary-600 hover:underline">เปิดดูสลิป</a>
  </div>

  <div v-if="submission.paymentStatus === 'rejected' && submission.paymentNote" class="bg-red-50 border border-red-200 rounded p-3 text-sm">
    <p class="font-semibold text-red-700 mb-1">เหตุผลที่ปฏิเสธ</p>
    <p class="text-red-600 whitespace-pre-line">{{ submission.paymentNote }}</p>
  </div>

  <div v-if="submission.paymentStatus === 'pending_verification'" class="flex gap-2">
    <UButton color="green" size="sm" @click="verifyPayment">✓ ยืนยันการชำระเงิน</UButton>
    <UButton color="red" variant="soft" size="sm" @click="rejectModalOpen = true">✗ ปฏิเสธ</UButton>
  </div>
</div>
```

- [ ] **Step 5: Add the reject reason modal**

After the main modal's closing tag, add:

```vue
<UModal v-model="rejectModalOpen" :ui="{ width: 'sm:max-w-md' }">
  <UCard>
    <template #header>
      <h3 class="font-semibold text-sm">ปฏิเสธการชำระเงิน</h3>
    </template>
    <div class="space-y-3">
      <p class="text-sm text-gray-600">กรุณาระบุเหตุผล (ผู้ส่งจะเห็นข้อความนี้)</p>
      <UTextarea v-model="rejectNote" :rows="4" placeholder="เช่น สลิปไม่ชัด, ยอดเงินไม่ครบ" />
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="gray" variant="ghost" @click="rejectModalOpen = false">ยกเลิก</UButton>
        <UButton color="red" :loading="rejectSubmitting" :disabled="!rejectNote.trim()" @click="submitReject">ปฏิเสธ</UButton>
      </div>
    </template>
  </UCard>
</UModal>
```

- [ ] **Step 6: Manual click-through verification**

Open `http://localhost:3000/admin`, click a submission with `paymentStatus === 'pending_verification'`. Verify:
- "การชำระเงิน" section shows with pending_verification badge
- Verify button works (changes status to verified, success toast shows)
- Reject button opens the reason modal; submitting changes status to rejected and the note appears in the author modal

- [ ] **Step 7: Stage and commit**

```bash
cd /Users/macbook-arnon/Projects/envicon2026
git add frontend/components/admin/SubmissionDetailModal.vue
git commit -m "feat(admin): add payment verify/reject controls in submission modal"
```

---

## Task 12: End-to-end smoke test + cleanup

**Files:** none (verification only)

- [ ] **Step 1: Full E2E flow as author**

1. Reset the database to a clean state OR use an author with no existing submission
2. Create a new submission, fill the form, upload abstract
3. Verify status is now `submitted` (not `pending_payment`) in both the modal and admin view
4. Verify the payment section in the modal shows `unpaid` with QR
5. Upload a slip
6. Verify status is still `submitted` and `paymentStatus` is `pending_verification`
7. Verify the slip thumbnail shows in the modal

- [ ] **Step 2: Full E2E flow as admin**

1. Log in as admin, open the submission in the admin list
2. Filter by `paymentStatus=pending_verification` — the submission should appear
3. Open the admin modal, click "✓ ยืนยันการชำระเงิน"
4. Verify the status changes to `verified`
5. Open another submission with `pending_verification`, click "✗ ปฏิเสธ", enter a reason
6. Verify the status changes to `rejected` and the note is saved
7. Export the Excel — verify the new "สถานะการชำระเงิน" column appears

- [ ] **Step 3: Reviewer flow (no payment info leaked)**

1. Log in as a reviewer who has a review assignment on a submission
2. Open the review detail page
3. Verify the page does NOT show any payment status / slip / note

- [ ] **Step 4: Verify the migration verification query (recap)**

```bash
cd /Users/macbook-arnon/Projects/envicon2026/backend
bun -e 'import { db } from "./src/db"; import { sql } from "drizzle-orm"; const r = await db.execute(sql.raw("SELECT id, status, payment_status FROM submissions WHERE status IN (\"pending_payment\", \"payment_verifying\")")); console.log("rows with old status:", r[0].length);'
# Expected: 0
```

- [ ] **Step 5: Final commit (only if you have uncommitted changes)**

If anything is uncommitted, commit it. Otherwise, skip this step.

```bash
cd /Users/macbook-arnon/Projects/envicon2026
git status --short
# If clean, done. Otherwise commit.
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Section 1 (Data Model) → Task 1
- [x] Section 2 (API — modified routes: upload-abstract, upload-slip, PATCH /status, revise, GET /submissions, GET /export, GET /:id) → Tasks 2, 3, 8
- [x] Section 2 (API — new PATCH /payment) → Task 4
- [x] Section 2 (API — reviewer response) → Task 5
- [x] Section 3A (PaymentStatusBadge) → Task 6
- [x] Section 3B (StatusBadge) → Task 7
- [x] Section 3C (SubmissionDetailModal) → Task 8
- [x] Section 3D (submit step 3 copy) → Task 9
- [x] Section 3E (admin list + admin modal) → Tasks 10, 11
- [x] Section 3F (reviewer unchanged) → confirmed in Task 12
- [x] Section 4 (Migration) → Task 1
- [x] Section 5 (Edge cases) → smoke tests in Tasks 2, 4, 8, 11, 12
- [x] Section 6 (Testing approach + roadmap) → Task 12

**Type consistency:**
- `paymentStatus` values: `unpaid | pending_verification | verified | rejected` — used consistently in schema.ts, admin.ts (`PAYMENT_STATUS_NAMES`), admin-reviews.ts (PATCH route), reviews.ts (delete), SubmissionDetailModal.vue (interface + template branches), admin/index.vue (interface + select options), admin/SubmissionDetailModal.vue (interface + template)
- `paymentNote` field name: used in schema.ts, admin-reviews.ts, SubmissionDetailModal.vue (read in rejected branch), admin/SubmissionDetailModal.vue
- `paymentSlipUrl` field name: unchanged from existing schema
- `paymentVerifiedBy` / `paymentVerifiedAt`: only used in schema.ts and admin-reviews.ts (write-only — never read by frontend in this spec)

**No placeholders:** Each step has concrete code or commands. The only "TBD-like" item is the existing-diff commit in Task 5 Step 0, which is explicit.
