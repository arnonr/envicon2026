# Education Level Field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a required "ระดับการศึกษา" (education level) field to the submission form with three options: ปริญญาตรี (bachelor), ปริญญาโท (master), ปริญญาเอก (doctorate). Shown to all submitters, persisted with versioning, and displayed in every place `submitterType` is shown.

**Architecture:** Add `educationLevel` enum column to `submissions` and `submission_versions` (mirroring `submitterType`). Backend POST/PUT validation accepts the field; revise handler copies the current value into the new version row. Frontend form gets a `USelect` placed below the `submitterType` radio. Display layer adds the field to dashboard list, admin list, both detail modals (with version-diff support in the admin modal).

**Tech Stack:** Drizzle ORM (MySQL), Elysia.js TypeBox validation, Vue 3 + @nuxt/ui

**Reference spec:** `docs/superpowers/specs/2026-06-19-education-level-design.md`

**Note:** No test framework is configured in this project (no `*.test.*` / `*.spec.*` files exist). Verification is done by viewing the running app and confirming expected behavior.

---

### Task 1: Add `educationLevel` column to DB schema

**Files:**
- Modify: `backend/src/db/schema.ts:25-50` (submissions table)
- Modify: `backend/src/db/schema.ts:52-70` (submission_versions table)

- [ ] **Step 1: Add column to `submissions` table**

In `backend/src/db/schema.ts`, in the `submissions` table definition, add `educationLevel` immediately after `submitterType` (line 34):

```ts
  submitterType: mysqlEnum("submitter_type", ["student", "general"]).notNull().default("student"),
  educationLevel: mysqlEnum("education_level", ["bachelor", "master", "doctorate"]).notNull(),
```

`mysqlEnum` is already imported (line 6).

- [ ] **Step 2: Add column to `submission_versions` table**

In the same file, in the `submissionVersions` table definition, add `educationLevel` immediately after `submitterType` (line 63):

```ts
  submitterType: mysqlEnum("submitter_type", ["student", "general"]).notNull().default("student"),
  educationLevel: mysqlEnum("education_level", ["bachelor", "master", "doctorate"]).notNull(),
```

- [ ] **Step 3: Generate migration**

Run: `cd backend && bun run db:generate`
Expected: A new SQL file is created in `backend/drizzle/` (e.g. `0004_<random_name>.sql`). Drizzle's `NOT NULL` without default produces an `ALTER TABLE ... ADD COLUMN ... NOT NULL` which fails on tables with existing rows.

- [ ] **Step 4: Replace the generated migration with backfill steps**

Open the new generated migration file. Replace its entire contents with the following 6-statement sequence (nullable add → backfill → enforce NOT NULL, for both tables). The `--> statement-breakpoint` separator is required by Drizzle between statements.

```sql
ALTER TABLE `submissions` ADD COLUMN `education_level` enum('bachelor','master','doctorate') NULL;
--> statement-breakpoint
UPDATE `submissions` SET `education_level` = 'bachelor' WHERE `education_level` IS NULL;
--> statement-breakpoint
ALTER TABLE `submissions` MODIFY COLUMN `education_level` enum('bachelor','master','doctorate') NOT NULL;
--> statement-breakpoint
ALTER TABLE `submission_versions` ADD COLUMN `education_level` enum('bachelor','master','doctorate') NULL;
--> statement-breakpoint
UPDATE `submission_versions` SET `education_level` = 'bachelor' WHERE `education_level` IS NULL;
--> statement-breakpoint
ALTER TABLE `submission_versions` MODIFY COLUMN `education_level` enum('bachelor','master','doctorate') NOT NULL;
```

- [ ] **Step 5: Push schema to database**

Run: `cd backend && bun run db:push`
Expected: Migration applied successfully. Both tables now have `education_level` as `NOT NULL enum`.

- [ ] **Step 6: Verify with a quick query**

Run: `cd backend && bun -e 'import { db } from "./src/db"; import { sql } from "drizzle-orm"; const r = await db.execute(sql.raw("DESCRIBE submissions")); console.log(r[0].find(c => c.Field === "education_level"));'`
Expected: A row showing `education_level` with `Type = enum('bachelor','master','doctorate')` and `Null = NO`.

- [ ] **Step 7: Commit**

```bash
git add backend/src/db/schema.ts backend/drizzle/0004_*.sql
git commit -m "feat: add educationLevel column to submissions and submission_versions"
```

---

### Task 2: Add `educationLevel` to backend validation and handlers

**Files:**
- Modify: `backend/src/routes/submissions.ts:122-177` (POST)
- Modify: `backend/src/routes/submissions.ts:243-298` (PUT)
- Modify: `backend/src/routes/submissions.ts:431-512` (revise)

- [ ] **Step 1: Add to POST body validation**

In `backend/src/routes/submissions.ts`, update the POST route's body schema (lines 167-175) — add `educationLevel` after `submitterType`:

```ts
      body: t.Object({
        title: t.String({ minLength: 1 }),
        titleEn: t.Optional(t.String()),
        abstract: t.Optional(t.String()),
        keywords: t.Optional(t.String()),
        creators: t.Optional(t.String()),
        track: t.Number({ minimum: 1, maximum: 7 }),
        submitterType: t.Union([t.Literal("student"), t.Literal("general")]),
        educationLevel: t.Union([t.Literal("bachelor"), t.Literal("master"), t.Literal("doctorate")]),
      }),
```

- [ ] **Step 2: Add to POST insert**

In the POST handler's `db.insert` call (lines 145-155), add `educationLevel` after `submitterType`:

```ts
      await db.insert(submissions).values({
        id,
        authorId: user!.id,
        title: body.title,
        titleEn: body.titleEn ?? null,
        abstract: body.abstract ?? null,
        keywords: body.keywords ?? null,
        creators,
        track: body.track,
        submitterType: body.submitterType,
        educationLevel: body.educationLevel,
      });
```

- [ ] **Step 3: Add to PUT body validation**

Update PUT body schema (lines 288-296) — add `educationLevel` after `submitterType`:

```ts
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1 })),
        titleEn: t.Optional(t.String()),
        abstract: t.Optional(t.String()),
        keywords: t.Optional(t.String()),
        creators: t.Optional(t.String()),
        track: t.Optional(t.Number({ minimum: 1, maximum: 7 })),
        submitterType: t.Optional(t.Union([t.Literal("student"), t.Literal("general")])),
        educationLevel: t.Optional(t.Union([t.Literal("bachelor"), t.Literal("master"), t.Literal("doctorate")])),
      }),
```

- [ ] **Step 4: Add to PUT update set**

Update the PUT handler's `db.update` `.set()` (lines 266-277) — add a spread for `educationLevel`:

```ts
        .set({
          ...(body.title && { title: body.title }),
          ...(body.titleEn !== undefined && { titleEn: body.titleEn }),
          ...(body.abstract !== undefined && { abstract: body.abstract }),
          ...(body.keywords !== undefined && { keywords: body.keywords }),
          ...(body.creators !== undefined && { creators: parseCreators(body.creators) }),
          ...(body.track && { track: body.track }),
          ...(body.submitterType && { submitterType: body.submitterType }),
          ...(body.educationLevel && { educationLevel: body.educationLevel }),
        })
```

- [ ] **Step 5: Snapshot `educationLevel` in the revise handler**

In the POST `/submissions/:id/revise` handler, update the `submissionVersions` insert (lines 481-497) to include `educationLevel` after `submitterType`:

```ts
      await db.insert(submissionVersions).values({
        id: crypto.randomUUID(),
        submissionId: params.id,
        version: snapshotVersion,
        kind: "revision",
        title: sub.title,
        titleEn: sub.titleEn,
        abstract: sub.abstract,
        keywords: sub.keywords,
        creators: sub.creators,
        track: sub.track,
        submitterType: sub.submitterType,
        educationLevel: sub.educationLevel,
        fileUrl,
        changelog: body.changelog ?? null,
        submittedAt: new Date(),
      });
```

- [ ] **Step 6: Verify backend starts**

Run: `cd backend && bun run dev`
Expected: Server starts on `:3001` with no TypeScript errors. Press Ctrl-C to stop.

- [ ] **Step 7: Commit**

```bash
git add backend/src/routes/submissions.ts
git commit -m "feat: add educationLevel to submission create/update/revise API"
```

---

### Task 3: Add `educationLevel` to frontend form

**Files:**
- Modify: `frontend/components/submission/SubmissionForm.vue:1-9` (interface)
- Modify: `frontend/components/submission/SubmissionForm.vue:25-60` (script)
- Modify: `frontend/components/submission/SubmissionForm.vue:90-100` (template)
- Modify: `frontend/pages/submit/index.vue:18-25` (initial form data)
- Modify: `frontend/pages/submit/index.vue:27-32` (isStep1Valid)
- Modify: `frontend/pages/submit/index.vue:62-76` (POST body)

- [ ] **Step 1: Add field to `SubmissionFormData` interface**

In `frontend/components/submission/SubmissionForm.vue`, update the interface (lines 2-9):

```ts
export interface SubmissionFormData {
  title: string;
  title_en: string;
  abstract: string;
  keywords: string;
  track: string;
  submitterType: string;
  educationLevel: string;
}
```

- [ ] **Step 2: Add `EDUCATION_OPTIONS` constant**

In the same file, after the `TRACK_OPTIONS` constant (line 33), add:

```ts
const EDUCATION_OPTIONS = [
  { label: 'ปริญญาตรี', value: 'bachelor' },
  { label: 'ปริญญาโท', value: 'master' },
  { label: 'ปริญญาเอก', value: 'doctorate' },
];
```

- [ ] **Step 3: Add `USelect` to the template**

In `SubmissionForm.vue` template, add a new `UFormGroup` **immediately after** the submitterType `UFormGroup` (after line 99, which closes the `</UFormGroup>`) and **before** the creators `UFormGroup` (which starts at line 101):

```vue
    <UFormGroup label="ระดับการศึกษา" required>
      <USelect
        :model-value="modelValue.educationLevel"
        :options="EDUCATION_OPTIONS"
        placeholder="-- เลือกระดับการศึกษา --"
        @update:model-value="update('educationLevel', $event as string)"
      />
    </UFormGroup>
```

- [ ] **Step 4: Add initial value in submit page**

In `frontend/pages/submit/index.vue`, update the form initial data (lines 18-25):

```ts
const form = ref<SubmissionFormData>({
  title: '',
  title_en: '',
  abstract: '',
  keywords: '',
  track: '',
  submitterType: 'student',
  educationLevel: '',
});
```

- [ ] **Step 5: Add to validation**

Update `isStep1Valid` (lines 27-32) to require `educationLevel`:

```ts
const isStep1Valid = computed(() => {
  const f = form.value;
  if (!f.title.trim() || !f.title_en.trim() || !f.abstract.trim() || !f.track || !f.submitterType || !f.educationLevel) return false;
  const creators = submissionFormRef.value?.creators ?? [];
  return creators.some(c => c.firstName.trim() && c.lastName.trim());
});
```

- [ ] **Step 6: Include in POST body**

In the `createSubmission` handler (lines 62-76), add `educationLevel` to the body after `submitterType`:

```ts
      body: {
        title: form.value.title.trim(),
        titleEn: form.value.title_en.trim(),
        abstract: form.value.abstract.trim(),
        keywords: form.value.keywords.trim() || undefined,
        creators: creatorsJson,
        track: parseInt(form.value.track),
        submitterType: form.value.submitterType,
        educationLevel: form.value.educationLevel,
      },
```

- [ ] **Step 7: Verify the form renders**

Run: `cd frontend && npm run dev`
Navigate to `http://localhost:3000/submit` (must be logged in as author). Verify:
- A "ระดับการศึกษา" select appears below "ประเภทผู้ส่งผลงาน"
- Three options: ปริญญาตรี, ปริญญาโท, ปริญญาเอก
- "ถัดไป" button is disabled until a value is picked

- [ ] **Step 8: Commit**

```bash
git add frontend/components/submission/SubmissionForm.vue frontend/pages/submit/index.vue
git commit -m "feat: add education level select to submission form"
```

---

### Task 4: Add `educationLevel` to the revise page

**Files:**
- Modify: `frontend/pages/submissions/[id]/revise.vue:6-15` (Submission interface)
- Modify: `frontend/pages/submissions/[id]/revise.vue:28-35` (form init)
- Modify: `frontend/pages/submissions/[id]/revise.vue:55-62` (validation)
- Modify: `frontend/pages/submissions/[id]/revise.vue:82-90` (prefill)
- Modify: `frontend/pages/submissions/[id]/revise.vue:102-114` (PUT body)

- [ ] **Step 1: Add to the `Submission` interface**

In `frontend/pages/submissions/[id]/revise.vue`, update the `Submission` interface (lines 6-15) — add `educationLevel: string` after `submitterType`:

```ts
interface Submission {
  title: string;
  titleEn: string | null;
  abstract: string | null;
  keywords: string | null;
  creators: string | null;
  track: number;
  submitterType: string;
  educationLevel: string;
  status: string;
}
```

- [ ] **Step 2: Add to form initial state**

Update the `form` ref (lines 28-35):

```ts
const form = ref<SubmissionFormData>({
  title: '',
  title_en: '',
  abstract: '',
  keywords: '',
  track: '',
  submitterType: 'student',
  educationLevel: '',
});
```

- [ ] **Step 3: Add to validation**

Update the `isFormValid` computed (lines 55-62) to require `educationLevel`:

```ts
const isFormValid = computed(() => {
  const values = form.value;
  if (!values.title.trim() || !values.title_en.trim() || !values.abstract.trim() || !values.track || !values.submitterType || !values.educationLevel) {
    return false;
  }
  return (submissionFormRef.value?.creators ?? initialCreators.value)
    .some(creator => creator.firstName.trim() && creator.lastName.trim());
});
```

- [ ] **Step 4: Add to prefill from loaded submission**

In the `onMounted` block where `form.value` is assigned (lines 83-90), add `educationLevel`:

```ts
  form.value = {
    title: submission.title,
    title_en: submission.titleEn ?? '',
    abstract: submission.abstract ?? '',
    keywords: submission.keywords ?? '',
    track: String(submission.track),
    submitterType: submission.submitterType,
    educationLevel: submission.educationLevel,
  };
```

- [ ] **Step 5: Add to PUT body**

In the `submitRevision` handler's PUT body (lines 106-114), add `educationLevel` after `submitterType`:

```ts
      body: {
        title: form.value.title.trim(),
        titleEn: form.value.title_en.trim(),
        abstract: form.value.abstract.trim(),
        keywords: form.value.keywords.trim(),
        creators: JSON.stringify(creators),
        track: parseInt(form.value.track),
        submitterType: form.value.submitterType,
        educationLevel: form.value.educationLevel,
      },
```

- [ ] **Step 6: Verify the revise form**

In a browser, navigate to a submission with status `revision_requested` and open the revise page. Verify the education level is pre-filled with the value from the previous submission.

- [ ] **Step 7: Commit**

```bash
git add frontend/pages/submissions/[id]/revise.vue
git commit -m "feat: add education level to submission revise page"
```

---

### Task 5: Display `educationLevel` in the dashboard

**Files:**
- Modify: `frontend/pages/dashboard/index.vue:4-15` (Submission interface)
- Modify: `frontend/pages/dashboard/index.vue:50-58` (helpers)
- Modify: `frontend/pages/dashboard/index.vue:155-160` (list item)

- [ ] **Step 1: Add to the `Submission` interface**

In `frontend/pages/dashboard/index.vue`, update the `Submission` interface (lines 4-15) — add `educationLevel: string` after `submitterType`:

```ts
interface Submission {
  id: string;
  title: string;
  track: number;
  submitterType: string;
  educationLevel: string;
  creators: string | null;
  status: string;
  abstractFileUrl: string | null;
  fullPaperFileUrl: string | null;
  submittedAt: string | null;
  updatedAt: string;
}
```

- [ ] **Step 2: Add label helper**

After the `TRACK_NAMES` constant (line 58), add:

```ts
function educationLabel(v: string): string {
  return ({ bachelor: 'ปริญญาตรี', master: 'ปริญญาโท', doctorate: 'ปริญญาเอก' } as Record<string, string>)[v] ?? v;
}
```

- [ ] **Step 3: Show in submission list line**

In the submission list item's meta `<p>` (line 155-160), add education level to the end of the dotted list:

```vue
                <p class="text-xs text-gray-400 mt-0.5">
                  ประเภท {{ TRACK_NAMES[sub.track] || sub.track }}
                  <template v-if="getCreatorCount(sub.creators)"> · ผู้สร้างสรรค์ {{ getCreatorCount(sub.creators) }} คน</template>
                  · {{ sub.submitterType === 'student' ? `นิสิต/นักศึกษา (${fees.student.toLocaleString()} บาท)` : `อาจารย์/นักวิจัย/บุคคลทั่วไป (${fees.general.toLocaleString()} บาท)` }}
                  · {{ educationLabel(sub.educationLevel) }}
                </p>
```

- [ ] **Step 4: Verify display**

Navigate to `/dashboard`. Verify each submission's list item now ends with `· ปริญญาตรี` (or whichever level was selected).

- [ ] **Step 5: Commit**

```bash
git add frontend/pages/dashboard/index.vue
git commit -m "feat: display education level in dashboard submission list"
```

---

### Task 6: Display `educationLevel` in author detail modal

**Files:**
- Modify: `frontend/components/submission/SubmissionDetailModal.vue:17-34` (Submission interface)
- Modify: `frontend/components/submission/SubmissionDetailModal.vue:138-145` (helpers)
- Modify: `frontend/components/submission/SubmissionDetailModal.vue:194-207` (info grid)

- [ ] **Step 1: Add to the `Submission` interface**

In `frontend/components/submission/SubmissionDetailModal.vue`, in the `Submission` interface (lines 17-34), add `educationLevel: string` after `submitterType`:

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
  educationLevel: string;
  status: string;
  abstractFileUrl: string | null;
  fullPaperFileUrl: string | null;
  paymentSlipUrl: string | null;
  submittedAt: string | null;
  updatedAt: string;
  revisions: Revision[];
  releasedResult: ReleasedResult | null;
}
```

- [ ] **Step 2: Add label helper**

After the `formatDate` function (line 141), add:

```ts
const educationLabel = (v: string) =>
  ({ bachelor: 'ปริญญาตรี', master: 'ปริญญาโท', doctorate: 'ปริญญาเอก' } as Record<string, string>)[v] ?? v;
```

- [ ] **Step 3: Add a cell to the info grid**

In the info grid `<dl>` (lines 194-207), add a new `<div>` directly after the submitter-type cell (after line 202) and before the submitted-date cell (line 203):

```vue
        <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt class="text-gray-500">สาขา</dt>
            <dd class="font-medium mt-0.5">{{ TRACK_NAMES[submission.track] ?? submission.track }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">ประเภทผู้ส่ง</dt>
            <dd class="font-medium mt-0.5">{{ submission.submitterType === 'student' ? `นิสิต/นักศึกษา (${fees.student.toLocaleString()} บาท)` : `อาจารย์/นักวิจัย/บุคคลทั่วไป (${fees.general.toLocaleString()} บาท)` }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">ระดับการศึกษา</dt>
            <dd class="font-medium mt-0.5">{{ educationLabel(submission.educationLevel) }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">วันที่ส่ง</dt>
            <dd class="mt-0.5">{{ formatDate(submission.submittedAt) }}</dd>
          </div>
        </dl>
```

- [ ] **Step 4: Verify display**

Open the dashboard, click a submission. The modal should now show a "ระดับการศึกษา" row in the info grid.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/submission/SubmissionDetailModal.vue
git commit -m "feat: display education level in author detail modal"
```

---

### Task 7: Display `educationLevel` in admin views

**Files:**
- Modify: `frontend/pages/admin/index.vue:4-21` (Submission interface)
- Modify: `frontend/pages/admin/index.vue:96-103` (helpers)
- Modify: `frontend/pages/admin/index.vue:323` (table header — add new column)
- Modify: `frontend/pages/admin/index.vue:350-352` (table cell)
- Modify: `frontend/components/admin/SubmissionDetailModal.vue:11-27` (Submission interface)
- Modify: `frontend/components/admin/SubmissionDetailModal.vue:42-57` (SubmissionVersion interface)
- Modify: `frontend/components/admin/SubmissionDetailModal.vue:147-148` (helpers)
- Modify: `frontend/components/admin/SubmissionDetailModal.vue:191-201` (version diff)
- Modify: `frontend/components/admin/SubmissionDetailModal.vue:380-400` (info grid)

- [ ] **Step 1: Add to admin list page `Submission` interface**

In `frontend/pages/admin/index.vue`, in the `Submission` interface (lines 4-21), add `educationLevel: string` after `submitterType`:

```ts
interface Submission {
  id: string;
  title: string;
  titleEn: string | null;
  track: number;
  submitterType: string;
  educationLevel: string;
  status: string;
  abstractFileUrl: string | null;
  fullPaperFileUrl: string | null;
  paymentSlipUrl: string | null;
  submittedAt: string | null;
  updatedAt: string;
  authorName: string | null;
  authorEmail: string | null;
  authorAffiliation: string | null;
  completedReviewCount: number;
  assignedReviewerCount: number;
}
```

- [ ] **Step 2: Add label helper**

After the `formatDate` function (line 103), add:

```ts
function educationLabel(v: string): string {
  return ({ bachelor: 'ปริญญาตรี', master: 'ปริญญาโท', doctorate: 'ปริญญาเอก' } as Record<string, string>)[v] ?? v;
}
```

- [ ] **Step 3: Add a column header to the admin table**

In `<thead>` (line 323 area, where `<th class="py-3 px-3 text-center">ประเภท</th>` is), add a new column header after it:

```vue
            <th class="py-3 px-3 text-center">ประเภท</th>
            <th class="py-3 px-3 text-center">ระดับการศึกษา</th>
            <th class="py-3 px-3 text-center">การรีวิวของกรรมการ</th>
```

- [ ] **Step 4: Add a cell to the admin table**

In `<tbody>` (lines 350-352 area, where `sub.submitterType` is shown), add a new `<td>` directly after the submitter-type cell:

```vue
            <td class="py-3 px-3 text-center text-gray-500">
              {{ sub.submitterType === "student" ? "นิสิต/นักศึกษา" : "ทั่วไป" }}
            </td>
            <td class="py-3 px-3 text-center text-gray-500">
              {{ educationLabel(sub.educationLevel) }}
            </td>
```

- [ ] **Step 5: Add to admin modal `Submission` interface**

In `frontend/components/admin/SubmissionDetailModal.vue`, in the `Submission` interface (lines 11-27), add `educationLevel: string` after `submitterType`:

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
  educationLevel: string;
  status: string;
  abstractFileUrl: string | null;
  fullPaperFileUrl: string | null;
  paymentSlipUrl: string | null;
  submittedAt: string | null;
  updatedAt: string;
  revisions: Revision[];
}
```

- [ ] **Step 6: Add to admin modal `SubmissionVersion` interface**

In the same file, in the `SubmissionVersion` interface (lines 42-57), add `educationLevel: string` after `submitterType`:

```ts
interface SubmissionVersion {
  id: string;
  version: number;
  kind: "initial" | "revision";
  title: string;
  titleEn: string | null;
  abstract: string | null;
  keywords: string | null;
  creators: string | null;
  track: number;
  submitterType: string;
  educationLevel: string;
  fileUrl: string | null;
  changelog: string | null;
  submittedAt: string;
  fileAvailable: boolean;
}
```

- [ ] **Step 7: Add `educationLabel` helper to admin modal**

After the `submitterLabel` function (lines 147-148), add:

```ts
const educationLabel = (v: string) =>
  ({ bachelor: 'ปริญญาตรี', master: 'ปริญญาโท', doctorate: 'ปริญญาเอก' } as Record<string, string>)[v] ?? v;
```

- [ ] **Step 8: Add to version diff table**

In the `comparisonRows` function (lines 188-202), add a new field after the submitter-type entry:

```ts
const comparisonRows = (version: SubmissionVersion, index: number) => {
  const previous = workflow.value?.versions[index - 1];
  if (!previous) return [];
  const fields = [
    { label: "ชื่อเรื่องภาษาไทย", before: previous.title, after: version.title },
    { label: "ชื่อเรื่องภาษาอังกฤษ", before: previous.titleEn, after: version.titleEn },
    { label: "บทคัดย่อ", before: previous.abstract, after: version.abstract },
    { label: "คำสำคัญ", before: previous.keywords, after: version.keywords },
    { label: "ผู้สร้างสรรค์", before: creatorsLabel(previous.creators), after: creatorsLabel(version.creators) },
    { label: "สาขา", before: TRACK_NAMES[previous.track] ?? String(previous.track), after: TRACK_NAMES[version.track] ?? String(version.track) },
    { label: "ประเภทผู้ส่ง", before: submitterLabel(previous.submitterType), after: submitterLabel(version.submitterType) },
    { label: "ระดับการศึกษา", before: educationLabel(previous.educationLevel), after: educationLabel(version.educationLevel) },
    { label: "ไฟล์", before: previous.fileUrl, after: version.fileUrl },
  ];
  return fields.filter(field => (field.before ?? "") !== (field.after ?? ""));
};
```

- [ ] **Step 9: Add to admin modal info grid**

In the admin modal info grid `<dl>` (lines 383-396), add a new `<div>` directly after the submitter-type cell (after the closing `</div>` of the submitter-type block at line 391) and before the date cell at line 392:

```vue
        <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt class="text-gray-500">สาขา</dt>
            <dd class="font-medium mt-0.5">{{ TRACK_NAMES[submission.track] ?? submission.track }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">ประเภทผู้ส่ง</dt>
            <dd class="font-medium mt-0.5">{{ submitterLabel(submission.submitterType) }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">ระดับการศึกษา</dt>
            <dd class="font-medium mt-0.5">{{ educationLabel(submission.educationLevel) }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">วันที่ส่ง</dt>
            <dd class="mt-0.5">{{ formatDate(submission.submittedAt) }}</dd>
          </div>
        </dl>
```

- [ ] **Step 10: Verify display**

Log in as admin. Open `/admin`. Verify the submission table now has a "ระดับการศึกษา" column showing the value. Click a submission to open the modal. Verify the info grid shows "ระดับการศึกษา" and the version diff (if a submission has multiple versions) shows the field.

- [ ] **Step 11: Commit**

```bash
git add frontend/pages/admin/index.vue frontend/components/admin/SubmissionDetailModal.vue
git commit -m "feat: display education level in admin list, detail modal, and version diff"
```

---

### Task 8: Final verification

- [ ] **Step 1: Type-check backend**

Run: `cd backend && bun --bun tsc --noEmit`
Expected: No TypeScript errors. (If `tsc` is not configured, run `cd backend && bun run dev` and confirm the server starts cleanly.)

- [ ] **Step 2: Type-check frontend**

Run: `cd frontend && npx nuxi typecheck` (or `cd frontend && npm run build` if typecheck is not a separate script).
Expected: No type errors. The new `educationLevel` field is present in all relevant `Submission` interfaces.

- [ ] **Step 3: End-to-end smoke test**

1. Start the stack: `docker compose up --build` (or run backend + frontend dev servers separately)
2. Log in as an author who does not have a submission yet
3. Navigate to `/submit`, fill out the form including the new "ระดับการศึกษา" select
4. Submit, upload PDF
5. Log in as admin, open the submission — confirm education level appears in the list table, info grid, and (if a revision exists) the version diff
6. (If a `revision_requested` exists) Log back in as the author, navigate to revise, confirm the field is pre-filled

- [ ] **Step 4: Final commit if any drift**

If step 1-3 surfaced small fixes, commit them. Otherwise this task is a no-op.
