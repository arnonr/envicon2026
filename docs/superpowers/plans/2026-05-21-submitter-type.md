# Submitter Type Field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "submitter type" field (`submitterType`) to the submission form with two options: นิสิต/นักศึกษา (student) and อาจารย์/นักวิจัย/บุคคลทั่วไป (general).

**Architecture:** Add `submitterType` enum column to `submissions` table. Expose it in backend POST/PUT validation. Add radio select to `SubmissionForm.vue`. Display in dashboard list and detail modal.

**Tech Stack:** Drizzle ORM (MySQL), Elysia.js TypeBox validation, Vue 3 + @nuxt/ui

---

### Task 1: Add `submitterType` column to DB schema

**Files:**
- Modify: `backend/src/db/schema.ts:25-47`

- [ ] **Step 1: Add column to submissions table**

In `backend/src/db/schema.ts`, add `submitterType` after the `track` column (line 33):

```ts
  track: int("track").notNull(),
  submitterType: mysqlEnum("submitter_type", ["student", "general"]).notNull().default("student"),
```

Import `mysqlEnum` is already present (line 6).

- [ ] **Step 2: Push schema to database**

Run: `cd backend && bun run db:push`
Expected: Schema synced, `submitter_type` column added with default `'student'`.

- [ ] **Step 3: Commit**

```bash
git add backend/src/db/schema.ts
git commit -m "feat: add submitterType column to submissions table"
```

---

### Task 2: Add `submitterType` to backend validation and handlers

**Files:**
- Modify: `backend/src/routes/submissions.ts:73-119` (POST)
- Modify: `backend/src/routes/submissions.ts:123-175` (PUT)

- [ ] **Step 1: Add to POST body validation and handler**

In `backend/src/routes/submissions.ts`, update the POST route's body schema (line 111-118) — add `submitterType`:

```ts
      body: t.Object({
        title: t.String({ minLength: 1 }),
        titleEn: t.Optional(t.String()),
        abstract: t.Optional(t.String()),
        keywords: t.Optional(t.String()),
        creators: t.Optional(t.String()),
        track: t.Number({ minimum: 1, maximum: 7 }),
        submitterType: t.Union([t.Literal("student"), t.Literal("general")]),
      }),
```

In the POST handler's `db.insert` call (line 90-99), add `submitterType`:

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
      });
```

- [ ] **Step 2: Add to PUT body validation and handler**

Update PUT body schema (line 166-174):

```ts
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1 })),
        titleEn: t.Optional(t.String()),
        abstract: t.Optional(t.String()),
        keywords: t.Optional(t.String()),
        creators: t.Optional(t.String()),
        track: t.Optional(t.Number({ minimum: 1, maximum: 7 })),
        submitterType: t.Optional(t.Union([t.Literal("student"), t.Literal("general")])),
      }),
```

Update PUT handler's `db.update` `.set()` (line 147-154) — add spread:

```ts
        .set({
          ...(body.title && { title: body.title }),
          ...(body.titleEn !== undefined && { titleEn: body.titleEn }),
          ...(body.abstract !== undefined && { abstract: body.abstract }),
          ...(body.keywords !== undefined && { keywords: body.keywords }),
          ...(body.creators !== undefined && { creators: parseCreators(body.creators) }),
          ...(body.track && { track: body.track }),
          ...(body.submitterType && { submitterType: body.submitterType }),
        })
```

- [ ] **Step 3: Verify backend starts**

Run: `cd backend && bun run dev`
Expected: Server starts without errors on `:3001`.

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/submissions.ts
git commit -m "feat: add submitterType to submission create/update API"
```

---

### Task 3: Add `submitterType` to frontend form

**Files:**
- Modify: `frontend/components/submission/SubmissionForm.vue:2-8` (interface)
- Modify: `frontend/components/submission/SubmissionForm.vue:55-117` (template)
- Modify: `frontend/pages/submit/index.vue:18-24` (initial form data)
- Modify: `frontend/pages/submit/index.vue:65-72` (POST body)

- [ ] **Step 1: Add field to SubmissionFormData interface**

In `frontend/components/submission/SubmissionForm.vue`, update the interface (line 2-8):

```ts
export interface SubmissionFormData {
  title: string;
  title_en: string;
  abstract: string;
  keywords: string;
  track: string;
  submitterType: string;
}
```

- [ ] **Step 2: Add radio select to form template**

In `SubmissionForm.vue` template, add a new `UFormGroup` **after** the Track select (after line 80) and **before** the Creators section (line 82):

```vue
    <UFormGroup label="ประเภทผู้ส่งผลงาน" required>
      <URadioGroup
        :model-value="modelValue.submitterType"
        :options="[
          { label: 'นิสิต/นักศึกษา', value: 'student' },
          { label: 'อาจารย์/นักวิจัย/บุคคลทั่วไป', value: 'general' },
        ]"
        @update:model-value="update('submitterType', $event as string)"
      />
    </UFormGroup>
```

- [ ] **Step 3: Add initial value in submit page**

In `frontend/pages/submit/index.vue`, add `submitterType` to the form initial data (line 18-24):

```ts
const form = ref<SubmissionFormData>({
  title: '',
  title_en: '',
  abstract: '',
  keywords: '',
  track: '',
  submitterType: 'student',
});
```

- [ ] **Step 4: Include in POST body**

In `frontend/pages/submit/index.vue`, add `submitterType` to the POST body (line 65-72):

```ts
      body: {
        title: form.value.title.trim(),
        titleEn: form.value.title_en.trim(),
        abstract: form.value.abstract.trim(),
        keywords: form.value.keywords.trim() || undefined,
        creators: creatorsJson,
        track: parseInt(form.value.track),
        submitterType: form.value.submitterType,
      },
```

- [ ] **Step 5: Add to validation**

In `frontend/pages/submit/index.vue`, update `isStep1Valid` (line 26-31) to require `submitterType`:

```ts
const isStep1Valid = computed(() => {
  const f = form.value;
  if (!f.title.trim() || !f.title_en.trim() || !f.abstract.trim() || !f.track || !f.submitterType) return false;
  const creators = submissionFormRef.value?.creators ?? [];
  return creators.some(c => c.firstName.trim() && c.lastName.trim());
});
```

- [ ] **Step 6: Verify form renders and submits**

Run: `cd frontend && npm run dev`
Navigate to `/submit`. Verify radio buttons appear with both options, default "นิสิต/นักศึกษา" selected.

- [ ] **Step 7: Commit**

```bash
git add frontend/components/submission/SubmissionForm.vue frontend/pages/submit/index.vue
git commit -m "feat: add submitter type radio select to submission form"
```

---

### Task 4: Display `submitterType` in dashboard and detail modal

**Files:**
- Modify: `frontend/pages/dashboard/index.vue:4-14` (interface)
- Modify: `frontend/pages/dashboard/index.vue` (submission list item)
- Modify: `frontend/components/submission/SubmissionDetailModal.vue:10-24` (interface)
- Modify: `frontend/components/submission/SubmissionDetailModal.vue:150-158` (info grid)

- [ ] **Step 1: Add to dashboard Submission interface**

In `frontend/pages/dashboard/index.vue`, update the `Submission` interface — add after `track`:

```ts
interface Submission {
  id: string;
  title: string;
  track: number;
  submitterType: string;
  creators: string | null;
  status: string;
  abstractFileUrl: string | null;
  fullPaperFileUrl: string | null;
  submittedAt: string | null;
  updatedAt: string;
}
```

- [ ] **Step 2: Show type badge in dashboard submission list**

In `frontend/pages/dashboard/index.vue`, inside the submission list item's `<p class="text-xs text-gray-400 mt-0.5">` (around line 166), add the submitter type label:

```vue
                <p class="text-xs text-gray-400 mt-0.5">
                  ประเภท {{ TRACK_NAMES[sub.track] || sub.track }}
                  <template v-if="getCreatorCount(sub.creators)"> · ผู้สร้างสรรค์ {{ getCreatorCount(sub.creators) }} คน</template>
                  · {{ sub.submitterType === 'student' ? 'นิสิต/นักศึกษา' : 'อาจารย์/นักวิจัย/บุคคลทั่วไป' }}
                </p>
```

- [ ] **Step 3: Add to SubmissionDetailModal interface**

In `frontend/components/submission/SubmissionDetailModal.vue`, update the `Submission` interface — add after `track`:

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

- [ ] **Step 4: Show in modal info grid**

In `SubmissionDetailModal.vue`, inside the `<dl class="grid grid-cols-2">` info grid (around line 150-158), add a new row:

```vue
        <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt class="text-gray-500">สาขา</dt>
            <dd class="font-medium mt-0.5">{{ TRACK_NAMES[submission.track] ?? submission.track }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">ประเภทผู้ส่ง</dt>
            <dd class="font-medium mt-0.5">{{ submission.submitterType === 'student' ? 'นิสิต/นักศึกษา' : 'อาจารย์/นักวิจัย/บุคคลทั่วไป' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">วันที่ส่ง</dt>
            <dd class="mt-0.5">{{ formatDate(submission.submittedAt) }}</dd>
          </div>
        </dl>
```

- [ ] **Step 5: Verify display**

Navigate to `/dashboard`. Submit a new paper or view existing submission. Verify submitter type shows in list and modal.

- [ ] **Step 6: Commit**

```bash
git add frontend/pages/dashboard/index.vue frontend/components/submission/SubmissionDetailModal.vue
git commit -m "feat: display submitter type in dashboard list and detail modal"
```
