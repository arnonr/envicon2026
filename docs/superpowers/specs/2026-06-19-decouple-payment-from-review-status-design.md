# Decouple Payment from Submission Review Status — Design Spec

Date: 2026-06-19

## Goal

Separate the "การชำระเงิน" (payment) concern from the main `submissions.status` lifecycle so that the review workflow can start as soon as the author uploads an abstract PDF, regardless of whether the author has paid. Payment remains required and admin-verified, but timing and gating become admin-controlled (not status-enforced). Reviewers never see payment status. A `revision_requested` round reuses the existing payment state — no re-payment.

## Scope

1. Add `paymentStatus` (+ 3 audit columns) to `submissions` table
2. Remove `pending_payment` and `payment_verifying` from `submissions.status` enum
3. `upload-abstract` now moves status directly to `submitted` (no payment gate)
4. `upload-slip` updates only `paymentStatus` (status หลักไม่ขยับ)
5. New admin endpoint `PATCH /admin/submissions/:id/payment` for verify/reject
6. Frontend: new `PaymentStatusBadge`; payment section in author modal becomes status-driven by `paymentStatus` instead of `status`
7. Admin list gains `paymentStatus` filter and badge column
8. Data migration with safe backfill of existing rows
9. Reviewer response hides `paymentStatus`

## Section 1: Data Model

### Schema (`backend/src/db/schema.ts`)

Reduce `submissions.status` enum (line 37-46):
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

Add to `submissions` table (right after `paymentSlipUrl`):
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

`paymentSlipUrl` stays on the row (for retroactive slip viewing by author/admin).

### State machine — `submissions.status`

```
draft  ──upload-abstract──▶ submitted
                              │
                       admin starts review round
                              ▼
                         under_review
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
        accepted          rejected      revision_requested
            │                                 │
     upload-paper (status ไม่ขยับ)    revise → submitted (เริ่ม round ใหม่)
```

### State machine — `paymentStatus` (อิสระต่อ status)

```
unpaid ──upload-slip──▶ pending_verification ──admin verify──▶ verified
                                  │
                                  └──admin reject──▶ rejected
                                          │
                                          └──upload-slip ใหม่──▶ pending_verification
```

## Section 2: Backend API

### Modified routes

**`POST /submissions/:id/upload-abstract`** (`backend/src/routes/submissions.ts:309`)
- Status guard: เดิม `["draft", "pending_payment"]` → ใหม่ `["draft"]` เท่านั้น
- After save: set `status = "submitted"` (เดิม set เป็น `"pending_payment"`)
- ไม่แตะ `paymentStatus`

**`POST /submissions/:id/upload-slip`** (`backend/src/routes/submissions.ts:395`)
- ลบเช็ค `status === "pending_payment"` — อนุญาตทุก status ที่ `paymentStatus !== "verified"`
- เปลี่ยน update set จาก `paymentSlipUrl, status: "payment_verifying"` → แค่ `paymentSlipUrl, paymentStatus: "pending_verification"`
- ไม่แตะ `status`

**`PATCH /admin/submissions/:id/status`** (`backend/src/routes/admin.ts:381`)
- ลบ `t.Literal("pending_payment")` และ `t.Literal("payment_verifying")` ออกจาก body union
- Admin ไม่ต้อง patch status เพื่อ confirm payment แล้ว (ใช้ endpoint ใหม่แทน)

**`POST /submissions/:id/revise`** (`backend/src/routes/submissions.ts:439`)
- ไม่เปลี่ยน logic — status → `submitted`, `paymentStatus` ไม่แตะ

**`GET /submissions/:id`** — response เพิ่ม `paymentStatus` field (ส่งให้ author/admin)

**`GET /admin/submissions`** (`backend/src/routes/admin.ts:111`)
- Select: เพิ่ม `paymentStatus: submissions.paymentStatus`
- Query: เพิ่ม `paymentStatus?: string` filter (e.g. `?paymentStatus=pending_verification`)

**`GET /admin/submissions/export`** (`backend/src/routes/admin.ts:206`)
- เพิ่ม `paymentStatus` ใน select
- เพิ่ม column "สถานะการชำระเงิน" ใน worksheet
- เพิ่ม `PAYMENT_STATUS_NAMES` map (unpaid=ยังไม่ชำระ, pending_verification=รอตรวจสอบ, verified=ชำระแล้ว, rejected=ปฏิเสธ)
- Bump autoFilter range ตามจำนวน column ใหม่

### New route

**`PATCH /admin/submissions/:id/payment`**
```ts
// backend/src/routes/admin-reviews.ts (หรือแยกไฟล์ถ้า prefer)
.patch(
  "/submissions/:id/payment",
  async ({ params, body, headers, set }) => {
    const admin = (await getUserFromHeaders(headers.authorization))!;
    const [sub] = await db.select().from(submissions)
      .where(eq(submissions.id, params.id)).limit(1);
    if (!sub) { set.status = 404; return fail("NOT_FOUND", "ไม่พบผลงาน"); }

    if (sub.paymentStatus !== "pending_verification") {
      set.status = 400;
      return fail("VALIDATION_ERROR",
        `ไม่สามารถดำเนินการได้ สถานะการชำระเงินปัจจุบันคือ ${sub.paymentStatus}`);
    }
    if (body.paymentStatus === "rejected" && !body.note?.trim()) {
      set.status = 400;
      return fail("VALIDATION_ERROR", "กรุณาระบุเหตุผลในการปฏิเสธ");
    }

    await db.update(submissions).set({
      paymentStatus: body.paymentStatus,
      paymentVerifiedBy: admin.id,
      paymentVerifiedAt: new Date(),
      paymentNote: body.paymentStatus === "rejected" ? body.note : null,
    }).where(eq(submissions.id, params.id));

    const [updated] = await db.select().from(submissions)
      .where(eq(submissions.id, params.id)).limit(1);
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

ต้อง `.use(requireAdmin)` (admin-reviews มี `.use(requireAdmin)` อยู่แล้ว).

### Reviewer response (`backend/src/routes/reviews.ts`)

ไฟล์นี้มี diff ค้างอยู่ — เพิ่มใน commit เดียวกัน: filter `paymentStatus` ออกจาก reviewer response (select ไม่ดึงมาเลย หรือ delete key ก่อน return ในส่วนที่ไม่ใช่ admin).

## Section 3: Frontend

### A. New component `components/submission/PaymentStatusBadge.vue`

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

### B. `components/submission/StatusBadge.vue`

- ลบ `pending_payment` และ `payment_verifying` ออกจาก `STATUS_CONFIG`

### C. `components/submission/SubmissionDetailModal.vue` — refactor payment section

- เพิ่ม `paymentStatus: 'unpaid' | 'pending_verification' | 'verified' | 'rejected'` ใน `Submission` interface
- ลบเงื่อนไข `v-if="submission.status === 'pending_payment'"` และ `v-if="submission.status === 'payment_verifying'"`
- เพิ่ม Payment section ที่แสดงตอน `paymentStatus !== 'verified'`:

```vue
<!-- Payment section (always visible unless verified) -->
<div v-if="submission.paymentStatus !== 'verified'"
  class="border border-blue-200 rounded-lg p-4 bg-blue-50/50 space-y-4">
  <div class="flex items-center gap-2 mb-2">
    <UIcon name="i-heroicons-credit-card" class="w-5 h-5 text-blue-600" />
    <h3 class="text-sm font-semibold text-blue-700">ชำระค่าส่งผลงาน</h3>
    <PaymentStatusBadge :status="submission.paymentStatus" class="ml-auto" />
  </div>

  <!-- unpaid: แสดง QR + bank + upload -->
  <template v-if="submission.paymentStatus === 'unpaid'">
    <!-- ...QR + bank details เหมือนเดิม... -->
    <CommonFileUpload :loading="uploadingSlip" :max-size-mb="10"
      accept=".pdf,.png,.jpg,.jpeg" @change="onSlipSelected" />
    <div class="flex justify-end mt-3">
      <UButton v-if="selectedSlipFile" color="primary" :loading="uploadingSlip" @click="uploadSlip">
        บันทึก <UIcon name="i-heroicons-check" class="w-4 h-4 ml-1" />
      </UButton>
      <p v-else class="text-xs text-gray-400 self-center">เลือกไฟล์ก่อนบันทึก</p>
    </div>
  </template>

  <!-- pending_verification: แสดงข้อความ + slip preview -->
  <template v-else-if="submission.paymentStatus === 'pending_verification'">
    <p class="text-sm text-gray-600">ได้รับหลักฐานการชำระเงินเรียบร้อย กำลังรอเจ้าหน้าที่ตรวจสอบ</p>
    <div v-if="submission.paymentSlipUrl">
      <img :src="fileLink(submission.paymentSlipUrl)"
        class="w-32 h-auto rounded-lg border border-gray-200 cursor-pointer"
        @click="slipPreviewOpen = true" />
    </div>
  </template>

  <!-- rejected: แสดง note + ปุ่มอัปโหลดใหม่ -->
  <template v-else-if="submission.paymentStatus === 'rejected'">
    <div class="bg-red-50 border border-red-200 rounded p-3 text-sm">
      <p class="font-semibold text-red-700 mb-1">เหตุผลที่ปฏิเสธ</p>
      <p class="text-red-600 whitespace-pre-line">{{ submission.paymentNote || '-' }}</p>
    </div>
    <p class="text-xs text-gray-500">กรุณาอัปโหลดหลักฐานการชำระเงินใหม่</p>
    <CommonFileUpload :loading="uploadingSlip" :max-size-mb="10"
      accept=".pdf,.png,.jpg,.jpeg" @change="onSlipSelected" />
    <div class="flex justify-end mt-3">
      <UButton v-if="selectedSlipFile" color="primary" :loading="uploadingSlip" @click="uploadSlip">
        อัปโหลดใหม่ <UIcon name="i-heroicons-arrow-up-tray" class="w-4 h-4 ml-1" />
      </UButton>
    </div>
  </template>
</div>

<!-- Verified badge ใน header -->
<div v-else class="flex items-center gap-1.5 text-sm text-green-700">
  <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
  <span>ชำระเงินเรียบร้อย</span>
</div>
```

- เพิ่ม `PaymentStatusBadge` ใน header modal (ข้างๆ `SubmissionStatusBadge`)

### D. `pages/submit/index.vue` — step 3 copy

```ts
// เดิม: "อยู่ในสถานะรอชำระเงิน กรุณาชำระเงินค่าส่งผลงาน"
// ใหม่:
"ขณะนี้ผลงานของคุณอยู่ในสถานะส่งแล้ว รอคณะกรรมการพิจารณา (สามารถชำระเงินภายหลังได้จากหน้ารายละเอียดผลงาน)"
```

### E. `pages/admin/index.vue` (admin list)

- `Submission` interface: เพิ่ม `paymentStatus: string`
- เพิ่ม column header "การชำระเงิน" (ถัดจาก column "สถานะ")
- เพิ่ม `<td>` cell: `<PaymentStatusBadge :status="sub.paymentStatus" />`
- เพิ่ม filter dropdown ใน filter bar: `paymentStatus` (ทั้งหมด / unpaid / pending_verification / verified / rejected)
- เพิ่มปุ่ม "✓ ยืนยัน" / "✗ ปฏิเสธ" ใน admin submission detail modal (visible เฉพาะ `paymentStatus === 'pending_verification'`)
  - กด verify → `PATCH .../payment` body `{ paymentStatus: "verified" }`
  - กด reject → เปิด UModal เล็กให้กรอก note → `PATCH .../payment` body `{ paymentStatus: "rejected", note }`

### F. `pages/reviewer/reviews/[id].vue`

- ไม่เปลี่ยน (reviewer ไม่เห็น payment)

### G. `frontend/composables/useApi.ts`

- เพิ่ม `paymentStatus: 'unpaid' | 'pending_verification' | 'verified' | 'rejected'` ใน Eden Treaty response type ผ่าน backend inference (จะ auto-generate หลัง schema update)

## Section 4: Data Migration

ไฟล์ migration ใหม่ (generated จาก `cd backend && bun run db:generate`, แก้ SQL ตามด้านล่าง):

```sql
-- 1. เพิ่ม column ใหม่ (default 'unpaid' เพื่อไม่ให้ error บน row เก่า)
ALTER TABLE submissions
  ADD COLUMN payment_status ENUM('unpaid','pending_verification','verified','rejected')
    NOT NULL DEFAULT 'unpaid',
  ADD COLUMN payment_verified_by VARCHAR(36),
  ADD COLUMN payment_verified_at TIMESTAMP NULL,
  ADD COLUMN payment_note TEXT;

ALTER TABLE submissions
  ADD CONSTRAINT submissions_payment_verified_by_fk
    FOREIGN KEY (payment_verified_by) REFERENCES users(id);

-- 2. Backfill: pending_payment/payment_verifying → submitted + pending_verification
UPDATE submissions
SET status = 'submitted',
    payment_status = 'pending_verification'
WHERE status IN ('pending_payment', 'payment_verifying');

-- 3. ที่เคย verify แล้ว (มี paymentSlipUrl + status=submitted) → verified
UPDATE submissions
SET payment_status = 'verified'
WHERE status = 'submitted'
  AND payment_slip_url IS NOT NULL
  AND payment_slip_url != '';

-- 4. ลบ enum values เก่าออกจาก status
ALTER TABLE submissions
  MODIFY COLUMN status ENUM(
    'draft', 'submitted', 'under_review',
    'accepted', 'rejected', 'revision_requested'
  ) NOT NULL DEFAULT 'draft';
```

Apply: `cd backend && bun run db:push` (สร้าง `meta/0006_snapshot.json` + `meta/_journal.json`)

### Verification query (รันหลัง migrate)

```sql
-- ต้องได้ 0 row
SELECT id, status FROM submissions
WHERE status IN ('pending_payment', 'payment_verifying');

-- ต้องสมเหตุสมผล (ทุก submitted มี paymentStatus เป็น pending_verification หรือ verified)
SELECT status, payment_status, COUNT(*)
FROM submissions GROUP BY status, payment_status ORDER BY status, payment_status;
```

## Section 5: Edge Cases

### Author flow

| สถานการณ์ | พฤติกรรม |
|---|---|
| Author จ่ายตอน `status=draft` (ก่อนอัปโหลด abstract) | API อนุญาต `upload-slip` ทุก status ที่ paymentStatus≠verified; paymentStatus=pending_verification. Status ยังคง draft (UI ยังไม่แสดง payment section เพราะ abstract ยังไม่ครบ — รออัปโหลด abstract ก่อน) |
| Author อัปโหลด slip ซ้ำตอน pending_verification | อนุญาต — overwrite URL, คง pending_verification |
| Author อัปโหลด slip ตอน verified | 400 "ชำระเงินเรียบร้อยแล้ว ไม่ต้องอัปโหลดเพิ่ม" |
| Author อัปโหลด slip ตอน rejected | อนุญาต — กลับเป็น pending_verification, `paymentNote` เก็บเฉพาะครั้งล่าสุด |
| Author revise ตอน paymentStatus=rejected | `revise` endpoint ทำงานปกติ (status → submitted), paymentStatus คงเดิม. ผู้ส่งต้องอัปโหลด slip แยก |

### Admin flow

| สถานการณ์ | พฤติกรรม |
|---|---|
| Admin verify payment ตอน paymentStatus ≠ pending_verification | 400 "ไม่สามารถยืนยันได้ สถานะปัจจุบันคือ X" |
| Admin reject โดยไม่ใส่ note | 400 "กรุณาระบุเหตุผลในการปฏิเสธ" |
| Admin release decision (accepted/rejected/revision_requested) ตอน payment ยังไม่ verified | อนุญาต (admin เป็น gatekeeper). UI แสดง warning "ผลงานนี้ยังไม่ชำระเงิน ต้องการปล่อยผลหรือไม่?" |
| Admin start review round ตอน payment=unpaid | อนุญาต. UI แสดง badge "ยังไม่ชำระเงิน" ใน submission detail แต่ไม่บล็อกปุ่ม |

### Reviewer flow

| สถานการณ์ | พฤติกรรม |
|---|---|
| Reviewer เห็น `paymentStatus` ใน `GET /reviews/:id` | ไม่เห็น — filter ออกจาก response |
| Revision รอบใหม่ + payment=rejected | ไม่บล็อก. Admin เห็น badge ใน dashboard |

## Section 6: Testing & Migration Safety

**Backend smoke (curl/Postman)**
- `POST /submissions` (author) → `POST .../upload-abstract` → status = `submitted` (ไม่ใช่ pending_payment)
- `POST .../upload-slip` ตอน status=submitted → paymentStatus = pending_verification, status ยังเป็น submitted
- `PATCH /admin/submissions/:id/payment` verify → paymentStatus = verified
- `POST /admin/submissions/:id/review-rounds` ตอน paymentStatus=unpaid → 201 (ไม่ error)
- `PATCH /admin/submissions/:id/payment` ตอน status=verified → 400
- `GET /reviews/:id` (reviewer) → response ไม่มี paymentStatus

**Frontend click-through**
- Author: submit abstract → modal เปิดได้ → เห็น payment section (unpaid) → upload slip → pending_verification → verified (section หายไป)
- Admin: list เห็น PaymentStatusBadge → filter ทำงาน → verify/reject modal flow → reject แล้ว author เห็น note
- Reviewer: เปิด review detail → ไม่เห็น payment
- Browser DevTools: ตรวจ response shape ของทุก endpoint

**Migration safety**
- Staging DB copy (dump ปัจจุบัน: `dump-envicon2026-202605251353.sql`) ก่อน apply จริง
- ตรวจ row count ก่อน/หลัง migrate: จำนวน submission ต้องเท่าเดิม
- Rollback: restore จาก backup SQL ถ้า verification query ไม่ผ่าน

## File Change Summary

| File | Action |
|------|--------|
| `backend/src/db/schema.ts` | ลด status enum, เพิ่ม 4 columns |
| `backend/drizzle/0006_*.sql` (new) | Generated + แก้ SQL ตาม Section 4 |
| `backend/src/routes/submissions.ts` | upload-abstract (status=submitted), upload-slip (status guard removed, paymentStatus only) |
| `backend/src/routes/admin.ts` | ลบ enum 2 ตัวจาก PATCH /status, เพิ่ม paymentStatus ใน list + export, เพิ่ม filter |
| `backend/src/routes/admin-reviews.ts` | New route `PATCH /submissions/:id/payment` |
| `backend/src/routes/reviews.ts` | Filter paymentStatus ออกจาก reviewer response (รวมกับ diff ที่ค้างอยู่) |
| `frontend/components/submission/PaymentStatusBadge.vue` | New component |
| `frontend/components/submission/StatusBadge.vue` | ลบ 2 status |
| `frontend/components/submission/SubmissionDetailModal.vue` | Refactor payment section, เพิ่ม PaymentStatusBadge ใน header |
| `frontend/pages/submit/index.vue` | Step 3 copy |
| `frontend/pages/admin/index.vue` | Filter + column + verify/reject modal |
| `frontend/composables/useApi.ts` | (auto ผ่าน Eden Treaty) |

## Out of Scope

- Email notification เมื่อ payment verified/rejected (admin สื่อสารเอง)
- `submission_payment_audit` table (full history — เก็บแค่ `paymentNote` ล่าสุดพอ)
- Auto-reject payment ถ้าเกิน deadline
- E-commerce integration (Stripe/PromptPay auto-verify)
- เปลี่ยน UI flow ให้ผู้ส่งเลือก "จ่ายทันที" หรือ "จ่ายทีหลัง" (UI แสดง section ตลอดจนกว่า verified)
- ลบ `paymentSlipUrl` column (เก็บไว้ — admin ใช้ดู slip ย้อนหลัง)
