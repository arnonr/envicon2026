# Presentation Format Field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a required "รูปแบบการนำเสนอ" (presentation format) field to the submission form with two options: แบบบรรยาย (oral) and โปสเตอร์ (poster). Shown to all submitters, persisted with versioning, and displayed in every place `submitterType` and `educationLevel` are shown.

**Architecture:** Add `presentationFormat` enum column to `submissions` and `submission_versions` (mirroring `educationLevel`). Backend POST/PUT validation accepts the field; revise handler copies the current value into the new version row. Frontend form gets a `URadioGroup` placed below `educationLevel`. Display layer adds the field to dashboard list, admin list, both detail modals (with version-diff support in the admin modal). Pre-emptively updates `admin.ts` select projections and `admin-reviews.ts` snapshot path based on lessons from the education-level final review.

**Tech Stack:** Drizzle ORM (MySQL), Elysia.js TypeBox validation, Vue 3 + @nuxt/ui

**Reference spec:** `docs/superpowers/specs/2026-06-19-presentation-format-design.md`

**Note:** No test framework is configured in this project (no `*.test.*` / `*.spec.*` files exist). Verification is done by viewing the running app and confirming expected behavior.

**Note on lessons learned from the education-level feature:**
- Drizzle's `db:generate` produces a meta file (`meta/0005_snapshot.json` and `meta/_journal.json`) — these must be committed alongside the migration SQL.
- The `admin.ts` endpoints use explicit column projections; the field must be added to BOTH projections in the same commit to avoid the "column is empty in the UI" bug that the final review caught.
- The `admin-reviews.ts` `ensureCurrentSubmissionVersion` function also needs the field added when admin triggers a new version — same fix that was needed for `educationLevel` (Task 8 of the previous plan).

---

### Task 1: Add `presentationFormat` column to DB schema

**Files:**
- Modify: `backend/src/db/schema.ts:25-50` (submissions table)
- Modify: `backend/src/db/schema.ts:52-70` (submission_versions table)

- [ ] **Step 1: Add column to `submissions` table**

In `backend/src/db/schema.ts`, in the `submissions` table definition, add `presentationFormat` immediately after `educationLevel` (line 35):

```ts
  educationLevel: mysqlEnum("education_level", ["bachelor", "master", "doctorate"]).notNull(),
  presentationFormat: mysqlEnum("presentation_format", ["oral", "poster"]).notNull(),
```

`mysqlEnum` is already imported (line 6).

- [ ] **Step 2: Add column to `submission_versions` table**

In the same file, in the `submissionVersions` table definition, add `presentationFormat` immediately after `educationLevel` (line 65):

```ts
  educationLevel: mysqlEnum("education_level", ["bachelor", "master", "doctorate"]).notNull(),
  presentationFormat: mysqlEnum("presentation_format", ["oral", "poster"]).notNull(),
```

- [ ] **Step 3: Generate migration**

Run: `cd backend && bun run db:generate`
Expected: A new SQL file is created in `backend/drizzle/` (e.g. `0005_<random_name>.sql`). Drizzle's `NOT NULL` without default produces an `ALTER TABLE ... ADD COLUMN ... NOT NULL` which fails on tables with existing rows.

- [ ] **Step 4: Replace the generated migration with backfill steps**

Open the new generated migration file. Replace its entire contents with the following 6-statement sequence (nullable add → backfill → enforce NOT NULL, for both tables). The `--> statement-breakpoint` separator is required by Drizzle between statements.

```sql
ALTER TABLE `submissions` ADD COLUMN `presentation_format` enum('oral','poster') NULL;
--> statement-breakpoint
UPDATE `submissions` SET `presentation_format` = 'oral' WHERE `presentation_format` IS NULL;
--> statement-breakpoint
ALTER TABLE `submissions` MODIFY COLUMN `presentation_format` enum('oral','poster') NOT NULL;
--> statement-breakpoint
ALTER TABLE `submission_versions` ADD COLUMN `presentation_format` enum('oral','poster') NULL;
--> statement-breakpoint
UPDATE `submission_versions` SET `presentation_format` = 'oral' WHERE `presentation_format` IS NULL;
--> statement-breakpoint
ALTER TABLE `submission_versions` MODIFY COLUMN `presentation_format` enum('oral','poster') NOT NULL;
```

- [ ] **Step 5: Push schema to database**

Run: `cd backend && bun run db:push`
Expected: Migration applied successfully. Both tables now have `presentation_format` as `NOT NULL enum`.

- [ ] **Step 6: Include the Drizzle meta files in the commit**

The `bun run db:generate` step also auto-generates `backend/drizzle/meta/0005_snapshot.json` and updates `backend/drizzle/meta/_journal.json`. The project convention is to commit these alongside the migration SQL (verified across migrations 0001-0004). Stage them now:

```bash
git add backend/drizzle/meta/_journal.json backend/drizzle/meta/0005_snapshot.json
```

- [ ] **Step 7: Verify with a quick query**

Run: `cd backend && bun -e 'import { db } from "./src/db"; import { sql } from "drizzle-orm"; const r = await db.execute(sql.raw("DESCRIBE submissions")); console.log(r[0].find(c => c.Field === "presentation_format"));'`
Expected: A row showing `presentation_format` with `Type = enum('oral','poster')` and `Null = NO`.

- [ ] **Step 8: Commit**

```bash
git add backend/src/db/schema.ts backend/drizzle/0005_*.sql
git commit -m "feat: add presentationFormat column to submissions and submission_versions"
```

---

### Task 2: Add `presentationFormat` to backend API and projections

This task bundles three changes that the education-level feature learned must go together:
1. POST/PUT/revise validation in `submissions.ts`
2. Snapshot in `admin-reviews.ts` (pre-emptive, to avoid the Task 8 issue from the previous plan)
3. Select projections in `admin.ts` (pre-emptive, to avoid the final review critical issue from the previous plan)

**Files:**
- Modify: `backend/src/routes/submissions.ts:122-177` (POST)
- Modify: `backend/src/routes/submissions.ts:243-298` (PUT)
- Modify: `backend/src/routes/submissions.ts:431-512` (revise)
- Modify: `backend/src/routes/admin-reviews.ts:102-110` (snapshot)
- Modify: `backend/src/routes/admin.ts:21-31` (add Thai label map)
- Modify: `backend/src/routes/admin.ts:100-145` (list projection)
- Modify: `backend/src/routes/admin.ts:193-290` (export projection + Excel)

- [ ] **Step 1: Add to POST body validation in `submissions.ts`**

Update the POST route's body schema (lines 167-175) — add `presentationFormat` after `educationLevel`:

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
        presentationFormat: t.Union([t.Literal("oral"), t.Literal("poster")]),
      }),
```

- [ ] **Step 2: Add to POST insert in `submissions.ts`**

In the POST handler's `db.insert` call (lines 145-155), add `presentationFormat` after `educationLevel`:

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
        presentationFormat: body.presentationFormat,
      });
```

- [ ] **Step 3: Add to PUT body validation in `submissions.ts`**

Update PUT body schema (lines 288-296):

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
        presentationFormat: t.Optional(t.Union([t.Literal("oral"), t.Literal("poster")])),
      }),
```

- [ ] **Step 4: Add to PUT update set in `submissions.ts`**

Update the PUT handler's `db.update` `.set()` (lines 266-277) — add a spread for `presentationFormat`:

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
          ...(body.presentationFormat && { presentationFormat: body.presentationFormat }),
        })
```

- [ ] **Step 5: Snapshot `presentationFormat` in the revise handler**

In the POST `/submissions/:id/revise` handler, update the `submissionVersions` insert (lines 481-497) to include `presentationFormat` after `educationLevel`:

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
        presentationFormat: sub.presentationFormat,
        fileUrl,
        changelog: body.changelog ?? null,
        submittedAt: new Date(),
      });
```

- [ ] **Step 6: Pre-emptively add to `admin-reviews.ts` snapshot**

In `backend/src/routes/admin-reviews.ts`, in the `ensureCurrentSubmissionVersion` function, find the `submissionVersions` insert (added in `27ed34f` during the previous plan's Task 8 fix) and add `presentationFormat: submission.presentationFormat` after `educationLevel: submission.educationLevel`.

The exact block to update is similar to:
```ts
      educationLevel: submission.educationLevel,
      presentationFormat: submission.presentationFormat,
      submitterType: submission.submitterType,
```

If the structure differs, read the file and add the line in the same place where `educationLevel: submission.educationLevel` is.

- [ ] **Step 7: Add Thai label map in `admin.ts`**

In `backend/src/routes/admin.ts`, after the `EDUCATION_LEVEL_NAMES` constant (added during the previous plan), add:

```ts
const PRESENTATION_FORMAT_NAMES: Record<string, string> = {
  oral: "แบบบรรยาย",
  poster: "โปสเตอร์",
};
```

- [ ] **Step 8: Add to list projection in `admin.ts`**

In `backend/src/routes/admin.ts`, in the GET `/submissions` handler's `.select({...})` block (lines 113-128), add `educationLevel: submissions.educationLevel,` and `presentationFormat: submissions.presentationFormat,` after `submitterType`:

```ts
      db
        .select({
          id: submissions.id,
          title: submissions.title,
          titleEn: submissions.titleEn,
          track: submissions.track,
          submitterType: submissions.submitterType,
          educationLevel: submissions.educationLevel,
          presentationFormat: submissions.presentationFormat,
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
```

(Note: the previous plan's Task 9 fix should have already added `educationLevel` to this projection. If the file already has it, just add `presentationFormat` after.)

- [ ] **Step 9: Add to export projection in `admin.ts`**

In `backend/src/routes/admin.ts`, in the GET `/submissions/export` handler's `.select({...})` block (lines 200-218), add `educationLevel` and `presentationFormat` after `submitterType`:

```ts
    const rows = await db
      .select({
        id: submissions.id,
        title: submissions.title,
        titleEn: submissions.titleEn,
        creators: submissions.creators,
        abstract: submissions.abstract,
        keywords: submissions.keywords,
        track: submissions.track,
        submitterType: submissions.submitterType,
        educationLevel: submissions.educationLevel,
        presentationFormat: submissions.presentationFormat,
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
      .orderBy(desc(submissions.updatedAt));
```

(If `educationLevel` is already there, just add `presentationFormat` after.)

- [ ] **Step 10: Add Excel column header in `admin.ts`**

In the worksheet columns array (lines 230-249), add two new columns after the "ประเภทผู้ส่ง" column. If `educationLevel` is already there (from the previous plan's Task 9 fix), insert `presentationFormat` after it. If neither is there, add both:

```ts
      { header: "ประเภทผู้ส่ง", key: "submitterType", width: 28 },
      { header: "ระดับการศึกษา", key: "educationLevel", width: 18 },
      { header: "รูปแบบการนำเสนอ", key: "presentationFormat", width: 18 },
      { header: "หัวข้อ", key: "track", width: 52 },
```

- [ ] **Step 11: Add Excel row mapper entries in `admin.ts`**

In the row mapper block (lines 256-275), add the two new entries after `submitterType`:

```ts
        submitterType: submission.submitterType === "student" ? "นิสิต/นักศึกษา" : "อาจารย์/นักวิจัย/บุคคลทั่วไป",
        educationLevel: EDUCATION_LEVEL_NAMES[submission.educationLevel] ?? submission.educationLevel,
        presentationFormat: PRESENTATION_FORMAT_NAMES[submission.presentationFormat] ?? submission.presentationFormat,
        track: TRACK_NAMES[submission.track] ?? String(submission.track),
```

(If `educationLevel` mapping is already there from the previous plan's fix, just add `presentationFormat` after it.)

- [ ] **Step 12: Update the autoFilter range in `admin.ts`**

Update the autoFilter range to include the two new columns. If `A1:S1` is current (from previous plan), bump to `A1:U1`. If `A1:R1`, bump to `A1:T1`. Check the current value before editing:

```ts
    worksheet.autoFilter = "A1:U1";
```

(Or whatever range covers all columns: count the columns in the `worksheet.columns` array and use `A1:X1` where X is the count + 1.)

- [ ] **Step 13: Verify backend starts**

Run: `cd backend && bun run dev`
Expected: Server starts on `:3001` with no TypeScript errors. Press Ctrl-C to stop.

- [ ] **Step 14: Commit**

```bash
git add backend/src/routes/submissions.ts backend/src/routes/admin-reviews.ts backend/src/routes/admin.ts
git commit -m "feat: add presentationFormat to submission create/update/revise and admin projections"
```

---

### Task 3: Add `presentationFormat` to frontend form

**Files:**
- Modify: `frontend/components/submission/SubmissionForm.vue:1-10` (interface)
- Modify: `frontend/components/submission/SubmissionForm.vue:36-45` (script)
- Modify: `frontend/components/submission/SubmissionForm.vue:107-115` (template)
- Modify: `frontend/pages/submit/index.vue:18-26` (initial form data)
- Modify: `frontend/pages/submit/index.vue:28-33` (isStep1Valid)
- Modify: `frontend/pages/submit/index.vue:62-78` (POST body)

- [ ] **Step 1: Add field to `SubmissionFormData` interface**

In `frontend/components/submission/SubmissionForm.vue`, update the interface (lines 2-10):

```ts
export interface SubmissionFormData {
  title: string;
  title_en: string;
  abstract: string;
  keywords: string;
  track: string;
  submitterType: string;
  educationLevel: string;
  presentationFormat: string;
}
```

- [ ] **Step 2: Add `PRESENTATION_FORMAT_OPTIONS` constant**

In the same file, after the `EDUCATION_OPTIONS` constant (line 40), add:

```ts
const PRESENTATION_FORMAT_OPTIONS = [
  { label: 'แบบบรรยาย', value: 'oral' },
  { label: 'โปสเตอร์', value: 'poster' },
];
```

- [ ] **Step 3: Add `URadioGroup` to the template**

In `SubmissionForm.vue` template, add a new `UFormGroup` **immediately after** the educationLevel `UFormGroup` (after line 115, which closes the `</UFormGroup>`) and **before** the creators `UFormGroup` (which starts at line 117):

```vue
    <UFormGroup label="รูปแบบการนำเสนอ" required>
      <URadioGroup
        :model-value="modelValue.presentationFormat"
        :options="PRESENTATION_FORMAT_OPTIONS"
        @update:model-value="update('presentationFormat', $event as string)"
      />
    </UFormGroup>
```

(Use `URadioGroup` — same as `submitterType` above — because there are only 2 options; `USelect` would be awkward.)

- [ ] **Step 4: Add initial value in submit page**

In `frontend/pages/submit/index.vue`, update the form initial data (lines 18-26):

```ts
const form = ref<SubmissionFormData>({
  title: '',
  title_en: '',
  abstract: '',
  keywords: '',
  track: '',
  submitterType: 'student',
  educationLevel: '',
  presentationFormat: '',
});
```

- [ ] **Step 5: Add to validation**

Update `isStep1Valid` (lines 28-33) to require `presentationFormat`:

```ts
const isStep1Valid = computed(() => {
  const f = form.value;
  if (!f.title.trim() || !f.title_en.trim() || !f.abstract.trim() || !f.track || !f.submitterType || !f.educationLevel || !f.presentationFormat) return false;
  const creators = submissionFormRef.value?.creators ?? [];
  return creators.some(c => c.firstName.trim() && c.lastName.trim());
});
```

- [ ] **Step 6: Include in POST body**

In the `createSubmission` handler (lines 62-78), add `presentationFormat` to the body after `educationLevel`:

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
        presentationFormat: form.value.presentationFormat,
      },
```

- [ ] **Step 7: Verify the form renders**

Run: `cd frontend && npm run dev`
Navigate to `http://localhost:3000/submit` (must be logged in as author). Verify:
- A "รูปแบบการนำเสนอ" radio group appears below "ระดับการศึกษา"
- Two options: แบบบรรยาย, โปสเตอร์
- "ถัดไป" button is disabled until a value is picked

- [ ] **Step 8: Commit**

```bash
git add frontend/components/submission/SubmissionForm.vue frontend/pages/submit/index.vue
git commit -m "feat: add presentation format radio to submission form"
```

---

### Task 4: Add `presentationFormat` to the revise page

**Files:**
- Modify: `frontend/pages/submissions/[id]/revise.vue:6-16` (Submission interface)
- Modify: `frontend/pages/submissions/[id]/revise.vue:28-37` (form init)
- Modify: `frontend/pages/submissions/[id]/revise.vue:55-63` (validation)
- Modify: `frontend/pages/submissions/[id]/revise.vue:82-93` (prefill)
- Modify: `frontend/pages/submissions/[id]/revise.vue:102-118` (PUT body)

- [ ] **Step 1: Add to the `Submission` interface**

In `frontend/pages/submissions/[id]/revise.vue`, update the `Submission` interface (lines 6-16) — add `presentationFormat: string` after `educationLevel`:

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
  presentationFormat: string;
  status: string;
}
```

- [ ] **Step 2: Add to form initial state**

Update the `form` ref (lines 28-37):

```ts
const form = ref<SubmissionFormData>({
  title: '',
  title_en: '',
  abstract: '',
  keywords: '',
  track: '',
  submitterType: 'student',
  educationLevel: '',
  presentationFormat: '',
});
```

- [ ] **Step 3: Add to validation**

Update the `isFormValid` computed (lines 55-63) to require `presentationFormat`:

```ts
const isFormValid = computed(() => {
  const values = form.value;
  if (!values.title.trim() || !values.title_en.trim() || !values.abstract.trim() || !values.track || !values.submitterType || !values.educationLevel || !values.presentationFormat) {
    return false;
  }
  return (submissionFormRef.value?.creators ?? initialCreators.value)
    .some(creator => creator.firstName.trim() && creator.lastName.trim());
});
```

- [ ] **Step 4: Add to prefill from loaded submission**

In the `onMounted` block where `form.value` is assigned (lines 83-93), add `presentationFormat`:

```ts
  form.value = {
    title: submission.title,
    title_en: submission.titleEn ?? '',
    abstract: submission.abstract ?? '',
    keywords: submission.keywords ?? '',
    track: String(submission.track),
    submitterType: submission.submitterType,
    educationLevel: submission.educationLevel,
    presentationFormat: submission.presentationFormat,
  };
```

- [ ] **Step 5: Add to PUT body**

In the `submitRevision` handler's PUT body (lines 106-118), add `presentationFormat` after `educationLevel`:

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
        presentationFormat: form.value.presentationFormat,
      },
```

- [ ] **Step 6: Verify the revise form**

In a browser, navigate to a submission with status `revision_requested` and open the revise page. Verify the presentation format is pre-filled with the value from the previous submission.

- [ ] **Step 7: Commit**

```bash
git add frontend/pages/submissions/[id]/revise.vue
git commit -m "feat: add presentation format to submission revise page"
```

---

### Task 5: Display `presentationFormat` in the dashboard

**Files:**
- Modify: `frontend/pages/dashboard/index.vue:4-16` (Submission interface)
- Modify: `frontend/pages/dashboard/index.vue:60-70` (helpers)
- Modify: `frontend/pages/dashboard/index.vue:155-167` (list item)

- [ ] **Step 1: Add to the `Submission` interface**

In `frontend/pages/dashboard/index.vue`, update the `Submission` interface (lines 4-16) — add `presentationFormat: string` after `educationLevel`:

```ts
interface Submission {
  id: string;
  title: string;
  track: number;
  submitterType: string;
  educationLevel: string;
  presentationFormat: string;
  creators: string | null;
  status: string;
  abstractFileUrl: string | null;
  fullPaperFileUrl: string | null;
  submittedAt: string | null;
  updatedAt: string;
}
```

- [ ] **Step 2: Add label helper**

After the `educationLabel` function (added during the previous plan's Task 5), add:

```ts
function presentationFormatLabel(v: string): string {
  return ({ oral: 'แบบบรรยาย', poster: 'โปสเตอร์' } as Record<string, string>)[v] ?? v;
}
```

- [ ] **Step 3: Show in submission list line**

In the submission list item's meta `<p>` (lines 155-167), add presentation format to the end of the dotted list:

```vue
                <p class="text-xs text-gray-400 mt-0.5">
                  ประเภท {{ TRACK_NAMES[sub.track] || sub.track }}
                  <template v-if="getCreatorCount(sub.creators)"> · ผู้สร้างสรรค์ {{ getCreatorCount(sub.creators) }} คน</template>
                  · {{ sub.submitterType === 'student' ? `นิสิต/นักศึกษา (${fees.student.toLocaleString()} บาท)` : `อาจารย์/นักวิจัย/บุคคลทั่วไป (${fees.general.toLocaleString()} บาท)` }}
                  · {{ educationLabel(sub.educationLevel) }}
                  · {{ presentationFormatLabel(sub.presentationFormat) }}
                </p>
```

- [ ] **Step 4: Verify display**

Navigate to `/dashboard`. Verify each submission's list item now ends with `· แบบบรรยาย` (or whichever format was selected).

- [ ] **Step 5: Commit**

```bash
git add frontend/pages/dashboard/index.vue
git commit -m "feat: display presentation format in dashboard submission list"
```

---

### Task 6: Display `presentationFormat` in author detail modal

**Files:**
- Modify: `frontend/components/submission/SubmissionDetailModal.vue:17-35` (Submission interface)
- Modify: `frontend/components/submission/SubmissionDetailModal.vue:138-148` (helpers)
- Modify: `frontend/components/submission/SubmissionDetailModal.vue:194-218` (info grid)

- [ ] **Step 1: Add to the `Submission` interface**

In `frontend/components/submission/SubmissionDetailModal.vue`, in the `Submission` interface (lines 17-35), add `presentationFormat: string` after `educationLevel`:

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
  presentationFormat: string;
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

After the `educationLabel` const arrow (added during the previous plan's Task 6), add:

```ts
const presentationFormatLabel = (v: string) =>
  ({ oral: 'แบบบรรยาย', poster: 'โปสเตอร์' } as Record<string, string>)[v] ?? v;
```

- [ ] **Step 3: Add a cell to the info grid**

In the info grid `<dl>` (lines 194-218), add a new `<div>` directly after the `educationLevel` cell (after line 210) and before the `submittedAt` cell (line 211):

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
            <dt class="text-gray-500">รูปแบบการนำเสนอ</dt>
            <dd class="font-medium mt-0.5">{{ presentationFormatLabel(submission.presentationFormat) }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">วันที่ส่ง</dt>
            <dd class="mt-0.5">{{ formatDate(submission.submittedAt) }}</dd>
          </div>
        </dl>
```

- [ ] **Step 4: Verify display**

Open the dashboard, click a submission. The modal should now show a "รูปแบบการนำเสนอ" row in the info grid.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/submission/SubmissionDetailModal.vue
git commit -m "feat: display presentation format in author detail modal"
```

---

### Task 7: Display `presentationFormat` in admin views (list, modal, version diff)

**Files:**
- Modify: `frontend/pages/admin/index.vue:4-22` (Submission interface)
- Modify: `frontend/pages/admin/index.vue:96-115` (helpers)
- Modify: `frontend/pages/admin/index.vue:323-335` (table header — add new column)
- Modify: `frontend/pages/admin/index.vue:350-365` (table cell)
- Modify: `frontend/components/admin/SubmissionDetailModal.vue:11-28` (Submission interface)
- Modify: `frontend/components/admin/SubmissionDetailModal.vue:42-58` (SubmissionVersion interface)
- Modify: `frontend/components/admin/SubmissionDetailModal.vue:147-160` (helpers)
- Modify: `frontend/components/admin/SubmissionDetailModal.vue:191-210` (version diff)
- Modify: `frontend/components/admin/SubmissionDetailModal.vue:380-410` (info grid)

- [ ] **Step 1: Add to admin list page `Submission` interface**

In `frontend/pages/admin/index.vue`, in the `Submission` interface (lines 4-22), add `presentationFormat: string` after `educationLevel`:

```ts
interface Submission {
  id: string;
  title: string;
  titleEn: string | null;
  track: number;
  submitterType: string;
  educationLevel: string;
  presentationFormat: string;
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

After the `educationLabel` function (added during the previous plan's Task 7), add:

```ts
function presentationFormatLabel(v: string): string {
  return ({ oral: 'แบบบรรยาย', poster: 'โปสเตอร์' } as Record<string, string>)[v] ?? v;
}
```

- [ ] **Step 3: Add a column header to the admin table**

In `<thead>` (around line 323-335, where `<th>ระดับการศึกษา</th>` is from the previous plan), add a new column header after it:

```vue
            <th class="py-3 px-3 text-center">ระดับการศึกษา</th>
            <th class="py-3 px-3 text-center">รูปแบบการนำเสนอ</th>
            <th class="py-3 px-3 text-center">การรีวิวของกรรมการ</th>
```

(If `ระดับการศึกษา` is not already there, add it first per the previous plan's Task 7, then add `รูปแบบการนำเสนอ` after it.)

- [ ] **Step 4: Add a cell to the admin table**

In `<tbody>` (around line 350-365, where `educationLabel(sub.educationLevel)` is shown), add a new `<td>` directly after the education-level cell:

```vue
            <td class="py-3 px-3 text-center text-gray-500">
              {{ educationLabel(sub.educationLevel) }}
            </td>
            <td class="py-3 px-3 text-center text-gray-500">
              {{ presentationFormatLabel(sub.presentationFormat) }}
            </td>
```

(If the education-level cell isn't there, add it per the previous plan's Task 7 first.)

- [ ] **Step 5: Add to admin modal `Submission` interface**

In `frontend/components/admin/SubmissionDetailModal.vue`, in the `Submission` interface (lines 11-28), add `presentationFormat: string` after `educationLevel`:

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
  presentationFormat: string;
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

In the same file, in the `SubmissionVersion` interface (lines 42-58), add `presentationFormat: string` after `educationLevel`:

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
  presentationFormat: string;
  fileUrl: string | null;
  changelog: string | null;
  submittedAt: string;
  fileAvailable: boolean;
}
```

- [ ] **Step 7: Add `presentationFormatLabel` helper to admin modal**

After the `educationLabel` const arrow (added during the previous plan's Task 7), add:

```ts
const presentationFormatLabel = (v: string) =>
  ({ oral: 'แบบบรรยาย', poster: 'โปสเตอร์' } as Record<string, string>)[v] ?? v;
```

- [ ] **Step 8: Add to version diff table**

In the `comparisonRows` function (lines 188-210), add a new field after the education-level entry (added in the previous plan's Task 7):

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
    { label: "รูปแบบการนำเสนอ", before: presentationFormatLabel(previous.presentationFormat), after: presentationFormatLabel(version.presentationFormat) },
    { label: "ไฟล์", before: previous.fileUrl, after: version.fileUrl },
  ];
  return fields.filter(field => (field.before ?? "") !== (field.after ?? ""));
};
```

- [ ] **Step 9: Add to admin modal info grid**

In the admin modal info grid `<dl>` (lines 383-410), add a new `<div>` directly after the `educationLevel` cell (added in the previous plan's Task 7):

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
            <dt class="text-gray-500">รูปแบบการนำเสนอ</dt>
            <dd class="font-medium mt-0.5">{{ presentationFormatLabel(submission.presentationFormat) }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">วันที่ส่ง</dt>
            <dd class="mt-0.5">{{ formatDate(submission.submittedAt) }}</dd>
          </div>
        </dl>
```

(If `educationLevel` cell isn't there, add it per the previous plan's Task 7 first.)

- [ ] **Step 10: Verify display**

Log in as admin. Open `/admin`. Verify the submission table now has a "รูปแบบการนำเสนอ" column showing the value. Click a submission to open the modal. Verify the info grid shows "รูปแบบการนำเสนอ" and the version diff (if a submission has multiple versions) shows the field. Also test the Excel export — verify the new column appears with the Thai label.

- [ ] **Step 11: Commit**

```bash
git add frontend/pages/admin/index.vue frontend/components/admin/SubmissionDetailModal.vue
git commit -m "feat: display presentation format in admin list, detail modal, and version diff"
```

---

### Task 8: Final verification

- [ ] **Step 1: Type-check backend**

Run: `cd backend && bun --bun tsc --noEmit`
Expected: No TypeScript errors.

- [ ] **Step 2: Type-check frontend**

Run: `cd frontend && npx vue-tsc --noEmit 2>&1 | grep -E "(presentationFormat|admin.ts|admin-reviews|submissionVersions|admin/SubmissionDetailModal|admin/index|dashboard/index|revise|submit/index|SubmissionForm)" | head -40`
Expected: No errors related to the presentation format work.

- [ ] **Step 3: End-to-end smoke test**

1. Start the stack: `docker compose up --build` (or run backend + frontend dev servers separately)
2. Log in as an author who does not have a submission yet
3. Navigate to `/submit`, fill out the form including the new "รูปแบบการนำเสนอ" radio
4. Submit, upload PDF
5. Log in as admin, open the submission — confirm presentation format appears in the list table, info grid, and (if a revision exists) the version diff
6. Click "Export Excel" — confirm the new column appears with the Thai label
7. (If a `revision_requested` exists) Log back in as the author, navigate to revise, confirm the field is pre-filled

- [ ] **Step 4: Final commit if any drift**

If step 1-3 surfaced small fixes, commit them. Otherwise this task is a no-op.
