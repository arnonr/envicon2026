# Payment Info Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show payment instructions (QR code placeholder, bank account, upload slip) in the submission detail modal when status is `pending_payment`.

**Architecture:** Add `paymentSlipUrl` column to `submissions` table. Add backend route `POST /submissions/:id/upload-slip`. Add payment info section to `SubmissionDetailModal.vue` visible only when `status === 'pending_payment'`.

**Tech Stack:** Drizzle ORM (MySQL), Elysia.js TypeBox, Vue 3 + @nuxt/ui, useFees composable

---

### Task 1: Add `paymentSlipUrl` column to DB schema

**Files:**
- Modify: `backend/src/db/schema.ts` (submissions table, after `fullPaperFileUrl`)

- [ ] **Step 1: Add column**

In `backend/src/db/schema.ts`, add after line 44 (`fullPaperFileUrl: ...`):

```ts
  paymentSlipUrl: varchar("payment_slip_url", { length: 500 }),
```

- [ ] **Step 2: Push schema**

Run: `cd backend && bun run db:push`
Expected: Schema synced.

- [ ] **Step 3: Commit**

```bash
git add backend/src/db/schema.ts
git commit -m "feat: add paymentSlipUrl column to submissions table"
```

---

### Task 2: Add `upload-slip` backend route

**Files:**
- Modify: `backend/src/routes/submissions.ts` (add new route after upload-paper)

- [ ] **Step 1: Add route**

In `backend/src/routes/submissions.ts`, add the following route **before** the `// Submit revision` comment (before the `/:id/revise` POST route):

```ts
  // Upload payment slip
  .post(
    "/:id/upload-slip",
    async ({ params, body, user, set }) => {
      const [sub] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);

      if (!sub) {
        set.status = 404;
        return fail("NOT_FOUND", "Submission not found");
      }
      if (sub.authorId !== user!.id) {
        set.status = 403;
        return fail("FORBIDDEN", "Access denied");
      }
      if (sub.status !== "pending_payment") {
        set.status = 400;
        return fail("VALIDATION_ERROR", "Cannot upload slip in current status");
      }

      const fileUrl = await saveFile(body.file, `slip-${params.id}`);

      await db
        .update(submissions)
        .set({ paymentSlipUrl: fileUrl })
        .where(eq(submissions.id, params.id));

      const [updated] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, params.id))
        .limit(1);

      return ok(updated);
    },
    {
      body: t.Object({
        file: t.File({ type: ["application/pdf", "image/png", "image/jpeg"], maxSize: "10mb" }),
      }),
    }
  )
```

- [ ] **Step 2: Verify backend starts**

Run: `cd backend && bun run dev`
Expected: Server starts without errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/routes/submissions.ts
git commit -m "feat: add upload-slip endpoint for payment evidence"
```

---

### Task 3: Add payment info section to SubmissionDetailModal

**Files:**
- Modify: `frontend/components/submission/SubmissionDetailModal.vue`

- [ ] **Step 1: Add `paymentSlipUrl` to Submission interface**

The current interface (around line 10-24):

```ts
interface Submission {
  id: string;
  title: string;
  titleEn: string | null;
  abstract: string | null;
  keywords: string | null;
  creators: string | null;
  track: number;
  submitterType: string;
  status: string;
  abstractFileUrl: string | null;
  fullPaperFileUrl: string | null;
  submittedAt: string | null;
  updatedAt: string;
  revisions: Revision[];
}
```

Add `paymentSlipUrl` after `fullPaperFileUrl`:

```ts
  fullPaperFileUrl: string | null;
  paymentSlipUrl: string | null;
```

- [ ] **Step 2: Add upload state variable**

After the existing `uploadingPaper` ref (around line 42):

```ts
const uploadingPaper = ref(false);
```

Add:

```ts
const uploadingSlip = ref(false);
```

- [ ] **Step 3: Add uploadSlip handler function**

After the `uploadFullPaper` function (around line 92), add:

```ts
const uploadSlip = async (file: File) => {
  if (!props.submissionId) return;
  uploadingSlip.value = true;
  const formData = new FormData();
  formData.append('file', file);
  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/submissions/${props.submissionId}/upload-slip`, {
      method: 'POST',
      headers: headers.value,
      body: formData,
    })
  );
  uploadingSlip.value = false;
  if (error) { showError(error); return; }
  showSuccess('อัปโหลดหลักฐานการชำระเงินเรียบร้อยแล้ว');
  await fetchSubmission();
};
```

- [ ] **Step 4: Add payment info section to template**

In the template, add the following block **after** the Files section (after the `</div>` that closes the files section, around line 217) and **before** the `<!-- Upload full paper -->` block (around line 219):

```vue
        <!-- Payment info (pending_payment) -->
        <div v-if="submission.status === 'pending_payment'" class="border border-blue-200 rounded-lg p-4 bg-blue-50/50 space-y-4">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-credit-card" class="w-5 h-5 text-blue-600" />
            <h3 class="text-sm font-semibold text-blue-700">ชำระค่าส่งผลงาน</h3>
          </div>

          <!-- QR Code placeholder -->
          <div class="flex justify-center">
            <div class="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <span class="text-xs text-gray-400">QR Code</span>
            </div>
          </div>

          <!-- Bank transfer details -->
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

          <!-- Upload slip -->
          <div v-if="!submission.paymentSlipUrl">
            <p class="text-xs text-gray-500 mb-2">อัปโหลดหลักฐานการชำระเงิน (สลิปโอนเงิน)</p>
            <CommonFileUpload :loading="uploadingSlip" :max-size-mb="10" accept=".pdf,.png,.jpg,.jpeg" @change="uploadSlip" />
          </div>
          <div v-else class="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg p-3">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
            <span>อัปโหลดหลักฐานการชำระเงินเรียบร้อย</span>
            <UButton size="xs" color="gray" variant="soft" icon="i-heroicons-arrow-down-tray" :to="submission.paymentSlipUrl" target="_blank" class="ml-auto">
              ดูหลักฐาน
            </UButton>
          </div>
        </div>
```

- [ ] **Step 5: Update CommonFileUpload to accept accept prop**

The current `CommonFileUpload.vue` (at `frontend/components/common/FileUpload.vue`) already has an `accept` prop but defaults to `.pdf`. The usage above passes `accept=".pdf,.png,.jpg,.jpeg"`. Check that the component's `input` element uses it:

Line 50 currently has:
```html
<input ref="inputRef" type="file" :accept="accept ?? '.pdf'" class="hidden" @change="onInputChange" />
```

This already works with the `accept` prop. Also update the hint text. Line 67:
```html
<p class="text-xs text-gray-400">PDF เท่านั้น{{ maxSizeMb ? ` · ไม่เกิน ${maxSizeMb} MB` : '' }}</p>
```

Change to:
```html
<p class="text-xs text-gray-400">{{ accept === '.pdf' ? 'PDF เท่านั้น' : 'PDF, PNG, JPG' }}{{ maxSizeMb ? ` · ไม่เกิน ${maxSizeMb} MB` : '' }}</p>
```

- [ ] **Step 6: Verify**

Run: `cd frontend && npm run dev`
Open a submission with `pending_payment` status in the dashboard modal. Verify payment info section appears with QR placeholder, bank details, and upload button.

- [ ] **Step 7: Commit**

```bash
git add frontend/components/submission/SubmissionDetailModal.vue frontend/components/common/FileUpload.vue
git commit -m "feat: add payment info section to submission detail modal"
```
