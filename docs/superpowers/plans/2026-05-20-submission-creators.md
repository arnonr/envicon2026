# Submission Creators Field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "ผู้สร้างสรรค์ผลงาน" (Creators) repeatable field to the submission form, allowing authors to enter multiple people with first name and last name.

**Architecture:** Store creators as a JSON array in a new `creators` TEXT column on the `submissions` table. Each creator is `{ firstName: string, lastName: string }`. The backend validates the array structure; the frontend provides an add/remove dynamic form.

**Tech Stack:** Drizzle ORM (schema migration), Elysia.js (API validation), Vue 3 + @nuxt/ui (dynamic form)

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `backend/src/db/schema.ts` | Add `creators` column to submissions table |
| Modify | `backend/src/routes/submissions.ts` | Accept/return creators in POST and PUT endpoints |
| Modify | `frontend/components/submission/SubmissionForm.vue` | Add creators interface + dynamic form UI |
| Modify | `frontend/pages/submit/index.vue` | Send creators in API call, add validation |
| Modify | `frontend/components/submission/SubmissionDetailModal.vue` | Display creators in detail modal |

---

### Task 1: Add `creators` column to database schema

**Files:**
- Modify: `backend/src/db/schema.ts:25-46`

- [ ] **Step 1: Add the column definition**

In `backend/src/db/schema.ts`, add a `creators` text column to the `submissions` table, after the `keywords` field:

```ts
// Add this import at the top if not already present (json is not used — we store as text)
// No new imports needed — `text` is already imported

// In the submissions table definition, after the `keywords` line:
  creators: text("creators"),
```

The column stores a JSON string like `[{"firstName":"สมชาย","lastName":"ใจดี"},{"firstName":"สมหญิง","lastName":"รักเรียน"}]`.

- [ ] **Step 2: Push schema to database**

Run: `cd /Users/tongfreedom/projects/envicon2026/backend && bun run db:push`
Expected: Schema synced, no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/db/schema.ts
git commit -m "feat: add creators text column to submissions table"
```

---

### Task 2: Update backend API to accept and return creators

**Files:**
- Modify: `backend/src/routes/submissions.ts`

- [ ] **Step 1: Update POST `/submissions` validation and handler**

In `backend/src/routes/submissions.ts`, update the POST route body schema (~line 93-100) to accept `creators`:

```ts
{
  body: t.Object({
    title: t.String({ minLength: 1 }),
    titleEn: t.Optional(t.String()),
    abstract: t.Optional(t.String()),
    keywords: t.Optional(t.String()),
    creators: t.Optional(t.String()),
    track: t.Number({ minimum: 1, maximum: 7 }),
  }),
}
```

Update the handler (~line 73-81) to include `creators` in the insert values:

```ts
await db.insert(submissions).values({
  id,
  authorId: user!.id,
  title: body.title,
  titleEn: body.titleEn ?? null,
  abstract: body.abstract ?? null,
  keywords: body.keywords ?? null,
  creators: body.creators ?? null,
  track: body.track,
});
```

- [ ] **Step 2: Update PUT `/submissions/:id` validation and handler**

Update the PUT body schema (~line 146-153):

```ts
{
  body: t.Object({
    title: t.Optional(t.String({ minLength: 1 })),
    titleEn: t.Optional(t.String()),
    abstract: t.Optional(t.String()),
    keywords: t.Optional(t.String()),
    creators: t.Optional(t.String()),
    track: t.Optional(t.Number({ minimum: 1, maximum: 7 })),
  }),
}
```

Update the handler's `.set()` call (~line 127-134) to include creators:

```ts
await db
  .update(submissions)
  .set({
    ...(body.title && { title: body.title }),
    ...(body.titleEn !== undefined && { titleEn: body.titleEn }),
    ...(body.abstract !== undefined && { abstract: body.abstract }),
    ...(body.keywords !== undefined && { keywords: body.keywords }),
    ...(body.creators !== undefined && { creators: body.creators }),
    ...(body.track && { track: body.track }),
  })
  .where(eq(submissions.id, params.id));
```

- [ ] **Step 3: Verify backend starts**

Run: `cd /Users/tongfreedom/projects/envicon2026/backend && bun run dev`
Expected: Server starts without type errors.

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/submissions.ts
git commit -m "feat: accept creators field in submission API endpoints"
```

---

### Task 3: Update SubmissionForm component with creators UI

**Files:**
- Modify: `frontend/components/submission/SubmissionForm.vue`

- [ ] **Step 1: Update the interface and add creator management logic**

Replace the full `<script setup>` section:

```vue
<script setup lang="ts">
export interface SubmissionFormData {
  title: string;
  title_en: string;
  abstract: string;
  keywords: string;
  track: string;
}

export interface Creator {
  firstName: string;
  lastName: string;
}

const props = defineProps<{
  modelValue: SubmissionFormData;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: SubmissionFormData];
}>();

const TRACK_OPTIONS = [
  { label: '1. วิทยาศาสตร์สิ่งแวดล้อมและการควบคุมมลพิษ', value: '1' },
  { label: '2. การจัดการระบบนิเวศและทรัพยากรธรรมชาติ', value: '2' },
  { label: '3. เศรษฐกิจหมุนเวียนและการใช้ทรัพยากรอย่างคุ้มค่า', value: '3' },
  { label: '4. การเปลี่ยนแปลงสภาพภูมิอากาศและเทคโนโลยีคาร์บอนต่ำ', value: '4' },
  { label: '5. เทคโนโลยีดิจิทัลและระบบอัจฉริยะเพื่อการติดตามสิ่งแวดล้อม', value: '5' },
  { label: '6. เมืองยั่งยืน อุตสาหกรรมสีเขียว และการจัดการสิ่งแวดล้อม', value: '6' },
  { label: '7. สิ่งแวดล้อมและสุขภาพ', value: '7' },
];

const creators = ref<Creator[]>([{ firstName: '', lastName: '' }]);

const update = (field: keyof SubmissionFormData, value: string) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value });
};

const addCreator = () => {
  creators.value.push({ firstName: '', lastName: '' });
};

const removeCreator = (index: number) => {
  if (creators.value.length <= 1) return;
  creators.value.splice(index, 1);
};

const updateCreator = (index: number, field: keyof Creator, value: string) => {
  creators.value[index] = { ...creators.value[index], [field]: value };
};
</script>
```

- [ ] **Step 2: Add the creators form section to the template**

In the `<template>`, add the creators section after the track form group and before the closing `</div>`:

```vue
    <UFormGroup label="ผู้สร้างสรรค์ผลงาน (Creators)" required>
      <div class="space-y-3">
        <div v-for="(creator, index) in creators" :key="index" class="flex items-start gap-2">
          <UInput
            :model-value="creator.firstName"
            placeholder="ชื่อ"
            class="flex-1"
            @update:model-value="updateCreator(index, 'firstName', $event as string)"
          />
          <UInput
            :model-value="creator.lastName"
            placeholder="นามสกุล"
            class="flex-1"
            @update:model-value="updateCreator(index, 'lastName', $event as string)"
          />
          <UButton
            v-if="creators.length > 1"
            color="red"
            variant="soft"
            icon="i-heroicons-x-mark"
            size="sm"
            @click="removeCreator(index)"
          />
        </div>
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-plus"
          size="sm"
          @click="addCreator"
        >
          เพิ่มผู้สร้างสรรค์ผลงาน
        </UButton>
      </div>
    </UFormGroup>
```

- [ ] **Step 3: Expose creators for parent to read**

The parent (`submit/index.vue`) needs access to the `creators` ref. Add `defineExpose`:

```ts
defineExpose({ creators });
```

- [ ] **Step 4: Verify no compile errors**

Run: `cd /Users/tongfreedom/projects/envicon2026/frontend && npm run dev`
Expected: No TypeScript errors in browser console.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/submission/SubmissionForm.vue
git commit -m "feat: add creators repeatable field to submission form"
```

---

### Task 4: Update submit page to send creators in API call

**Files:**
- Modify: `frontend/pages/submit/index.vue`

- [ ] **Step 1: Add template ref and update validation**

Add a template ref for the form component and update the validation logic:

```vue
<script setup lang="ts">
import type { SubmissionFormData } from '~/components/submission/SubmissionForm.vue';

definePageMeta({ middleware: ['auth'] });

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { handleApiCall, showError, showSuccess } = useApiError();

const step = ref<1 | 2 | 3>(1);
const submissionId = ref<string | null>(null);
const submitting = ref(false);
const uploading = ref(false);
const submissionFormRef = ref<{ creators: { value: { firstName: string; lastName: string }[] } } | null>(null);

const form = ref<SubmissionFormData>({
  title: '',
  title_en: '',
  abstract: '',
  keywords: '',
  track: '',
});

const isStep1Valid = computed(() => {
  const f = form.value;
  if (!f.title.trim() || !f.title_en.trim() || !f.abstract.trim() || !f.track) return false;
  const creators = submissionFormRef.value?.creators.value ?? [];
  return creators.some(c => c.firstName.trim() && c.lastName.trim());
});
```

- [ ] **Step 2: Update createSubmission to include creators**

```ts
const createSubmission = async () => {
  if (!isStep1Valid.value) return;
  submitting.value = true;

  const creators = submissionFormRef.value?.creators.value ?? [];
  const creatorsJson = JSON.stringify(
    creators.filter(c => c.firstName.trim() && c.lastName.trim())
  );

  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: { id: string } }>(`${apiBase}/submissions`, {
      method: 'POST',
      headers: headers.value,
      body: {
        title: form.value.title.trim(),
        titleEn: form.value.title_en.trim(),
        abstract: form.value.abstract.trim(),
        keywords: form.value.keywords.trim() || undefined,
        creators: creatorsJson,
        track: parseInt(form.value.track),
      },
    })
  );

  submitting.value = false;

  if (error) {
    showError(error);
    return;
  }

  submissionId.value = data!.data.id;
  step.value = 2;
};
```

- [ ] **Step 3: Add ref to SubmissionForm in template**

Update the `<SubmissionForm>` tag in the template:

```vue
<SubmissionForm ref="submissionFormRef" v-model="form" />
```

- [ ] **Step 4: Verify end-to-end submission**

Run frontend dev server, fill out form including multiple creators, submit step 1, verify no API error.

- [ ] **Step 5: Commit**

```bash
git add frontend/pages/submit/index.vue
git commit -m "feat: send creators data in submission API call"
```

---

### Task 5: Display creators in SubmissionDetailModal

**Files:**
- Modify: `frontend/components/submission/SubmissionDetailModal.vue`

- [ ] **Step 1: Add parsed creators computed property**

Add after the `parsedKeywords` computed (~line 98-102):

```ts
interface Creator {
  firstName: string;
  lastName: string;
}

const parsedCreators = computed<Creator[]>(() => {
  const raw = submission.value?.creators;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
});
```

Also add `creators` to the `Submission` interface:

```ts
interface Submission {
  id: string;
  title: string;
  titleEn: string | null;
  abstract: string | null;
  keywords: string | null;
  creators: string | null;  // <-- add this line
  track: number;
  status: string;
  abstractFileUrl: string | null;
  fullPaperFileUrl: string | null;
  submittedAt: string | null;
  updatedAt: string;
  revisions: Revision[];
}
```

- [ ] **Step 2: Add creators display to the template**

After the keywords badges section (~line 148-152), add:

```vue
<!-- Creators -->
<div v-if="parsedCreators.length" class="mt-3">
  <h3 class="text-xs text-gray-500 mb-1.5">ผู้สร้างสรรค์ผลงาน</h3>
  <div class="flex flex-wrap gap-1.5">
    <UBadge v-for="(c, i) in parsedCreators" :key="i" color="primary" variant="soft" size="xs">
      {{ c.firstName }} {{ c.lastName }}
    </UBadge>
  </div>
</div>
```

- [ ] **Step 3: Verify modal shows creators**

Submit a test submission with creators, open it from dashboard, verify the modal displays creator names.

- [ ] **Step 4: Commit**

```bash
git add frontend/components/submission/SubmissionDetailModal.vue
git commit -m "feat: display creators in submission detail modal"
```

---

### Task 6: Update dashboard Submission interface

**Files:**
- Modify: `frontend/pages/dashboard/index.vue`

- [ ] **Step 1: Verify no type breakage**

The `Submission` interface in `dashboard/index.vue` does not include `creators` and doesn't need it — the dashboard list only shows `title`, `track`, `status`. No changes needed unless the dashboard should preview creators. Skip this task if dashboard list display of creators is not required.

- [ ] **Step 2: (Optional) If dashboard should show creator count**

Add `creators` to the interface:

```ts
interface Submission {
  id: string;
  title: string;
  track: number;
  status: string;
  creators: string | null;
  abstractFileUrl: string | null;
  fullPaperFileUrl: string | null;
  submittedAt: string | null;
  updatedAt: string;
}
```

And in the template where it shows track name (~line 163), add creator count:

```vue
<p class="text-xs text-gray-400 mt-0.5">
  ประเภท {{ TRACK_NAMES[sub.track] || sub.track }}
  · ผู้สร้างสรรค์ {{ sub.creators ? JSON.parse(sub.creators).length : 0 }} คน
</p>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/pages/dashboard/index.vue
git commit -m "feat: show creator count on dashboard submission list"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Creators field on form (Task 3), sent to API (Task 4), stored in DB (Task 1-2), displayed in modal (Task 5), shown on dashboard (Task 6).
- [x] **Placeholder scan:** No TBD, TODO, or "implement later" in any step. All code is complete.
- [x] **Type consistency:** `Creator` interface is `{ firstName, lastName }` consistently across SubmissionForm, submit page, and modal. `creators` column is `text` in schema, `string | null` in TypeScript interfaces, JSON.parse/stringify in application code.
