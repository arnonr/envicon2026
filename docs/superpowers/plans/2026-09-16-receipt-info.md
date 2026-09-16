# Receipt Information Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** เพิ่มการจัดเก็บและแสดงผลข้อมูลสำหรับออกใบเสร็จรับเงิน (`receiptName`, `receiptTaxId`, `receiptAddress`) ให้กับผู้ส่งผลงาน (ตอนอัปโหลดสลิป) และผู้ลงทะเบียนเข้าร่วมงาน (ตอนลงทะเบียน) พร้อมปุ่ม Export Excel ในหน้า Admin

**Architecture:** จัดเก็บข้อมูลใบเสร็จในตาราง `submissions` และ `event_registrations` บน MySQL ผ่าน Drizzle ORM โดยฝั่งผู้ส่งผลงานจะกรอกข้อมูลเมื่อถึงขั้นตอนชำระเงิน/อัปโหลดสลิปเท่านั้น (ไม่รบกวน Step 1 ของการส่งบทความ) ฝั่งผู้เข้าร่วมงานกรอกพร้อมสลิปใน RegistrationModal และผู้ดูแลระบบสามารถตรวจสอบและส่งออกไฟล์ `.xlsx` (ExcelJS) ได้ทั้ง 2 ระบบ

**Tech Stack:** Nuxt 3, Vue 3, Nuxt UI, Tailwind CSS, Elysia.js (Bun), Drizzle ORM, MySQL, ExcelJS

## Global Constraints

- ฟิลด์ข้อมูล 3 ฟิลด์เท่านั้น: `receiptName` (varchar 255), `receiptTaxId` (varchar 20), `receiptAddress` (text)
- ไม่มีฟิลด์สาขา
- ไม่มีการแยกบุคคลธรรมดา/นิติบุคคล
- ไม่มีตัวเลือกเปิด/ปิดการขอรับใบเสร็จ (ทุกคนได้รับใบเสร็จ)
- ฟอร์มส่งผลงาน Step 1 (`SubmissionForm.vue`, `pages/submit/index.vue`) ต้องไม่มีฟิลด์ใบเสร็จ โดยให้กรอกเฉพาะตอนอัปโหลดสลิปชำระเงินใน `SubmissionDetailModal.vue`
- เพิ่มปุ่ม Export Excel สำหรับผู้ลงทะเบียนเข้าร่วมงานใน `pages/admin/registrations.vue` ด้วย

---

### Task 1: Revert/clean Step 1 Submission Form from receipt fields

**Files:**
- Modify: `frontend/components/submission/SubmissionForm.vue`
- Modify: `frontend/pages/submit/index.vue`

**Interfaces:**
- Consumes: Existing form model in `SubmissionForm.vue`
- Produces: `SubmissionFormData` without receipt fields, restoring Step 1 to only paper submission content

- [x] **Step 1: Clean `frontend/components/submission/SubmissionForm.vue`**

Remove `receiptName`, `receiptTaxId`, `receiptAddress` from interface `SubmissionFormData`:
```ts
export interface SubmissionFormData {
  title: string;
  title_en: string;
  abstract: string;
  track: number;
  keywords: string[];
  submitterType: string;
  educationLevel: string;
  presentationFormat: string;
  wantsFullPaper: boolean;
}
```

Remove the receipt information input block from the template:
```vue
    <!-- Remove this block: -->
    <!-- <div class="border-t border-gray-200 pt-5 space-y-4"> ... ข้อมูลสำหรับออกใบเสร็จรับเงิน ... </div> -->
```

- [x] **Step 2: Clean `frontend/pages/submit/index.vue`**

Remove receipt properties from `DraftSubmission`, `form`, `isStep1Valid`, `createSubmission`, `saveDraft`, and `loadDraft`:
```ts
// form initial ref:
const form = ref<SubmissionFormData>({
  title: '',
  title_en: '',
  abstract: '',
  track: 0,
  keywords: [],
  submitterType: '',
  educationLevel: '',
  presentationFormat: '',
  wantsFullPaper: false,
});

// isStep1Valid computed:
const isStep1Valid = computed(() => {
  const f = form.value;
  if (!f.title.trim() || !f.title_en.trim() || !f.abstract.trim() || !f.track || !f.submitterType || !f.educationLevel || !f.presentationFormat) return false;
  const creators = submissionFormRef.value?.creators ?? initialCreators.value;
  return creators.some(c => c.firstName.trim() && c.lastName.trim() && c.affiliation.trim());
});
```

- [x] **Step 3: Verify frontend compiles Step 1 without errors**

Run: `cd frontend && npx vue-tsc --noEmit`

- [x] **Step 4: Commit Task 1**

```bash
git add frontend/components/submission/SubmissionForm.vue frontend/pages/submit/index.vue
git commit -m "refactor(frontend): remove receipt fields from paper submission step 1"
```

---

### Task 2: Backend Event Registrations Excel Export Route

**Files:**
- Modify: `backend/src/routes/admin.ts`

**Interfaces:**
- Consumes: `eventRegistrations` table from `../db/schema.ts`, `ExcelJS`, `absoluteFileUrl()`, `formatExportDate()`
- Produces: Endpoint `GET /admin/registrations/export` returning Excel spreadsheet (`.xlsx`) stream

- [x] **Step 1: Add label mappings for event registrations in `backend/src/routes/admin.ts`**

```ts
const EVENT_PAYMENT_STATUS_NAMES: Record<string, string> = {
  pending_verification: "รอตรวจสอบ",
  confirmed: "ยืนยันแล้ว",
  rejected: "ไม่ผ่าน",
};

const EVENT_FEE_TYPE_NAMES: Record<string, string> = {
  student: "นิสิต/นักศึกษา",
  general: "บุคคลทั่วไป",
};
```

- [x] **Step 2: Add `GET /registrations/export` endpoint in `adminRoutes`**

Insert the endpoint into `adminRoutes`:
```ts
  .get("/registrations/export", async ({ request }) => {
    const rows = await db
      .select({
        id: eventRegistrations.id,
        fullName: eventRegistrations.fullName,
        affiliation: eventRegistrations.affiliation,
        phone: eventRegistrations.phone,
        email: eventRegistrations.email,
        feeType: eventRegistrations.feeType,
        fee: eventRegistrations.fee,
        paymentSlipUrl: eventRegistrations.paymentSlipUrl,
        paymentStatus: eventRegistrations.paymentStatus,
        receiptName: eventRegistrations.receiptName,
        receiptTaxId: eventRegistrations.receiptTaxId,
        receiptAddress: eventRegistrations.receiptAddress,
        createdAt: eventRegistrations.createdAt,
      })
      .from(eventRegistrations)
      .orderBy(desc(eventRegistrations.createdAt));

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "TSHE-CON 2026";
    workbook.created = new Date();
    const worksheet = workbook.addWorksheet("ผู้ลงทะเบียน", {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    worksheet.columns = [
      { header: "ลำดับ", key: "sequence", width: 9 },
      { header: "รหัสลงทะเบียน", key: "id", width: 38 },
      { header: "ชื่อ-นามสกุล", key: "fullName", width: 28 },
      { header: "สังกัด/หน่วยงาน", key: "affiliation", width: 32 },
      { header: "เบอร์โทรศัพท์", key: "phone", width: 18 },
      { header: "อีเมล", key: "email", width: 30 },
      { header: "ประเภทผู้เข้าร่วม", key: "feeType", width: 20 },
      { header: "ค่าลงทะเบียน (บาท)", key: "fee", width: 18 },
      { header: "สถานะการชำระเงิน", key: "paymentStatus", width: 20 },
      { header: "ลิงก์หลักฐานชำระเงิน", key: "paymentSlipUrl", width: 55 },
      { header: "ชื่อสำหรับออกใบเสร็จ", key: "receiptName", width: 30 },
      { header: "เลขประจำตัวผู้เสียภาษี", key: "receiptTaxId", width: 22 },
      { header: "ที่อยู่สำหรับออกใบเสร็จ", key: "receiptAddress", width: 45 },
      { header: "วันที่ลงทะเบียน", key: "createdAt", width: 22 },
    ];

    const origin = new URL(request.url).origin;
    rows.forEach((reg, index) => {
      const paymentSlipUrl = absoluteFileUrl(reg.paymentSlipUrl, origin);
      const row = worksheet.addRow({
        sequence: index + 1,
        id: reg.id,
        fullName: reg.fullName,
        affiliation: reg.affiliation ?? "",
        phone: reg.phone ?? "",
        email: reg.email,
        feeType: EVENT_FEE_TYPE_NAMES[reg.feeType] ?? reg.feeType,
        fee: reg.fee,
        paymentStatus: EVENT_PAYMENT_STATUS_NAMES[reg.paymentStatus] ?? reg.paymentStatus,
        paymentSlipUrl,
        receiptName: reg.receiptName ?? "",
        receiptTaxId: reg.receiptTaxId ?? "",
        receiptAddress: reg.receiptAddress ?? "",
        createdAt: formatExportDate(reg.createdAt),
      });

      if (paymentSlipUrl) {
        const cell = row.getCell("paymentSlipUrl");
        cell.value = { text: paymentSlipUrl, hyperlink: paymentSlipUrl };
        cell.font = { color: { argb: "FF0563C1" }, underline: true };
      }
    });

    worksheet.autoFilter = "A1:N1";
    worksheet.getRow(1).height = 28;
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF047857" } };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    });

    for (const key of ["fullName", "affiliation", "receiptAddress"] as const) {
      worksheet.getColumn(key).alignment = { vertical: "top", wrapText: true };
    }
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.alignment = { vertical: "top" };
    });

    const file = await workbook.xlsx.writeBuffer();
    const filename = `envicon-event-registrations-${new Date().toISOString().slice(0, 10)}.xlsx`;
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  })
```

- [x] **Step 3: Run backend typecheck or check with Bun**

Run: `cd backend && bun run --dry-run src/index.ts`

- [x] **Step 4: Commit Task 2**

```bash
git add backend/src/routes/admin.ts
git commit -m "feat(backend): add excel export endpoint for event registrations"
```

---

### Task 3: Frontend Event Registrations Admin Page Export Excel Button

**Files:**
- Modify: `frontend/pages/admin/registrations.vue`

**Interfaces:**
- Consumes: `$fetch<Blob>(\`${apiBase}/admin/registrations/export\`)`
- Produces: Export Excel button in registrations header, downloading `.xlsx` file

- [x] **Step 1: Add export state and function in `frontend/pages/admin/registrations.vue`**

```ts
const exporting = ref(false);

async function exportRegistrations() {
  exporting.value = true;
  const { data, error } = await handleApiCall(() =>
    $fetch<Blob>(`${apiBase}/admin/registrations/export`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
      responseType: "blob",
    }),
  );
  exporting.value = false;
  if (error) {
    showError(error);
    return;
  }
  if (!data) return;

  const objectUrl = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `envicon-event-registrations-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
  showSuccess("ดาวน์โหลดไฟล์ Excel สำเร็จ");
}
```

- [x] **Step 2: Add Export button to header template in `frontend/pages/admin/registrations.vue`**

```vue
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">ข้อมูลผู้ลงทะเบียนเข้าร่วมงาน</h1>
        <p class="text-sm text-gray-500 mt-1">รายชื่อผู้เข้าร่วมงาน สถานะการชำระเงิน และข้อมูลใบเสร็จรับเงิน</p>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          color="emerald"
          icon="i-heroicons-arrow-down-tray"
          :loading="exporting"
          :disabled="loading || exporting || registrations.length === 0"
          @click="exportRegistrations"
        >
          Export Excel
        </UButton>
        <UButton color="gray" variant="ghost" to="/">กลับหน้าแรก</UButton>
      </div>
    </div>
```

- [x] **Step 3: Test export button click in UI / check no syntax errors**

- [x] **Step 4: Commit Task 3**

```bash
git add frontend/pages/admin/registrations.vue
git commit -m "feat(frontend): add export excel button on event registrations admin page"
```

---

### Task 4: Finalize & Verify Receipt Information across Modals

**Files:**
- Modify: `backend/src/routes/submissions.ts`
- Modify: `backend/src/routes/public.ts`
- Modify: `frontend/components/home/RegistrationModal.vue`
- Modify: `frontend/components/submission/SubmissionDetailModal.vue`
- Modify: `frontend/components/admin/SubmissionDetailModal.vue`

**Interfaces:**
- Consumes: `receiptName`, `receiptTaxId`, `receiptAddress` in API payloads and responses
- Produces: Consistent UI & validation across public registrations and author slip uploads

- [x] **Step 1: Check `backend/src/routes/submissions.ts`**

Verify `POST /submissions/:id/upload-slip` properly updates `receiptName`, `receiptTaxId`, `receiptAddress`.

- [x] **Step 2: Check `frontend/components/home/RegistrationModal.vue`**

Ensure fields:
- Receipt Name (with "ใช้ชื่อเดียวกับผู้ลงทะเบียน" button)
- Receipt Tax ID (13 digits or ID card number, max 20)
- Receipt Address (Textarea)
- Note: "ใบเสร็จจะออกตามข้อมูลที่ท่านระบุไว้ด้านบน และรับได้ที่วันประชุม"

- [x] **Step 3: Check `frontend/components/submission/SubmissionDetailModal.vue`**

Ensure:
- When status is `unpaid` or `rejected`: Form fields for receipt name, tax ID, and address are shown and sent with FormData on slip upload.
- When status is `pending_verification` or `verified`: Display receipt summary card.

- [x] **Step 4: Check `frontend/components/admin/SubmissionDetailModal.vue`**

Ensure:
- Admin sees the Receipt Information card under payment section with name, tax ID, and address.

- [x] **Step 5: Commit Task 4**

```bash
git add backend/src/routes/submissions.ts backend/src/routes/public.ts frontend/components/home/RegistrationModal.vue frontend/components/submission/SubmissionDetailModal.vue frontend/components/admin/SubmissionDetailModal.vue
git commit -m "feat: complete receipt information workflow across modals"
```

---

### Task 5: Database Migration & End-to-End Build Verification

**Files:**
- Check: `backend/src/db/schema.ts`
- Check: `backend/drizzle/0013_stiff_brother_voodoo.sql`
- Verify: Whole project build

- [x] **Step 1: Verify database schema state**

Ensure `bun run db:push` or migration files are in sync with MySQL.

- [x] **Step 2: Run frontend build**

Run: `cd frontend && npm run build`
Expected: Build passes with 0 errors.

- [x] **Step 3: Run backend check**

Run: `cd backend && bun run --dry-run src/index.ts` (or check import/type validity).

- [x] **Step 4: Commit database migration artifacts**

```bash
git add backend/drizzle/ backend/src/db/schema.ts
git commit -m "chore(db): add receipt columns migration"
```
