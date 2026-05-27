# Admin Submission Detail Modal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a modal to the admin dashboard that shows full submission details (abstract, creators, files, payment slip) with inline status management buttons, replacing the action column in the table.

**Architecture:** New `AdminSubmissionDetailModal.vue` component reuses the existing `GET /api/submissions/:id` endpoint (already admin-accessible). Admin table clicks submission title to open modal; action buttons move from table to modal footer. No backend changes.

**Tech Stack:** Vue 3 Composition API, `<script setup>`, @nuxt/ui (`UModal`, `UBadge`, `UButton`, `UCard`), `$fetch` with `handleApiCall` pattern.

---

### Task 1: Create `AdminSubmissionDetailModal.vue`

**Files:**
- Create: `frontend/components/admin/AdminSubmissionDetailModal.vue`

- [ ] **Step 1: Create the modal component**

```vue
<script setup lang="ts">
interface Revision {
  id: string;
  version: number;
  fileUrl: string;
  changelog: string | null;
  submittedAt: string;
}

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
  paymentSlipUrl: string | null;
  submittedAt: string | null;
  updatedAt: string;
  revisions: Revision[];
}

const props = defineProps<{
  modelValue: boolean;
  submissionId: string | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'status-changed': [];
}>();

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { handleApiCall, showError, showSuccess } = useApiError();

const fileLink = (url: string | null) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  try { return new URL(apiBase).origin + url; } catch { return url; }
};

const submission = ref<Submission | null>(null);
const loading = ref(false);
const updating = ref(false);
const slipPreviewOpen = ref(false);

const TRACK_NAMES: Record<number, string> = {
  1: 'วิทยาศาสตร์สิ่งแวดล้อมและการควบคุมมลพิษ',
  2: 'การจัดการระบบนิเวศและทรัพยากรธรรมชาติ',
  3: 'เศรษฐกิจหมุนเวียนและการใช้ทรัพยากรอย่างคุ้มค่า',
  4: 'การเปลี่ยนแปลงสภาพภูมิอากาศและเทคโนโลยีคาร์บอนต่ำ',
  5: 'เทคโนโลยีดิจิทัลและระบบอัจฉริยะเพื่อการติดตามสิ่งแวดล้อม',
  6: 'เมืองยั่งยืน อุตสาหกรรมสีเขียว และการจัดการสิ่งแวดล้อม',
  7: 'สิ่งแวดล้อมและสุขภาพ',
};

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const headers = computed(() => ({
  Authorization: `Bearer ${authStore.token}`,
}));

interface Creator { firstName: string; lastName: string; }

const parsedCreators = computed<Creator[]>(() => {
  const raw = submission.value?.creators;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
});

const parsedKeywords = computed(() => {
  const kw = submission.value?.keywords;
  if (!kw) return [];
  return kw.split(',').map(k => k.trim()).filter(Boolean);
});

const formatDate = (iso: string | null) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
};

const fetchSubmission = async () => {
  if (!props.submissionId) return;
  loading.value = true;
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: Submission }>(`${apiBase}/submissions/${props.submissionId}`, {
      headers: headers.value,
    })
  );
  loading.value = false;
  if (error) { showError(error); return; }
  submission.value = data!.data;
};

const updateStatus = async (newStatus: string) => {
  if (!submission.value) return;
  updating.value = true;
  const { error } = await handleApiCall(() =>
    $fetch<{ success: true }>(`${apiBase}/admin/submissions/${submission.value!.id}/status`, {
      method: 'PATCH',
      headers: headers.value,
      body: { status: newStatus },
    })
  );
  updating.value = false;
  if (error) { showError(error); return; }
  showSuccess('อัปเดตสถานะสำเร็จ');
  await fetchSubmission();
  emit('status-changed');
};

watch(() => props.modelValue, (open) => {
  if (open) {
    submission.value = null;
    fetchSubmission();
  }
});
</script>

<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
    <UCard>
      <template #header>
        <div v-if="loading" class="flex justify-center py-4">
          <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-gray-400 animate-spin" />
        </div>
        <div v-else-if="submission" class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-lg font-bold text-gray-900 leading-snug">{{ submission.title }}</h2>
            <p v-if="submission.titleEn" class="text-sm text-gray-500 mt-0.5">{{ submission.titleEn }}</p>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <SubmissionStatusBadge :status="submission.status" />
          </div>
        </div>
      </template>

      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
      </div>

      <div v-else-if="submission" class="space-y-4 max-h-[70vh] overflow-y-auto -mx-6 px-6">
        <!-- Info grid -->
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

        <!-- Keywords -->
        <div v-if="parsedKeywords.length" class="flex flex-wrap gap-1.5">
          <UBadge v-for="kw in parsedKeywords" :key="kw" color="gray" variant="soft" size="xs">{{ kw }}</UBadge>
        </div>

        <!-- Creators -->
        <div v-if="parsedCreators.length">
          <h3 class="text-xs text-gray-500 mb-1.5">ผู้สร้างสรรค์ผลงาน</h3>
          <div class="flex flex-wrap gap-1.5">
            <UBadge v-for="(c, i) in parsedCreators" :key="i" color="primary" variant="soft" size="xs">
              {{ c.firstName }} {{ c.lastName }}
            </UBadge>
          </div>
        </div>

        <!-- Abstract -->
        <div v-if="submission.abstract">
          <h3 class="text-xs text-gray-500 mb-1">บทคัดย่อ</h3>
          <p class="text-sm text-gray-700 leading-relaxed">{{ submission.abstract }}</p>
        </div>

        <UDivider />

        <!-- Files -->
        <div>
          <h3 class="text-xs font-semibold text-gray-600 mb-2">ไฟล์ที่แนบ</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-document" class="w-4 h-4 text-gray-400" />
                <span class="text-gray-700">บทคัดย่อ (Abstract)</span>
              </div>
              <a v-if="submission.abstractFileUrl" :href="fileLink(submission.abstractFileUrl)" target="_blank"
                class="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 hover:underline">
                <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
                ดาวน์โหลด
              </a>
              <span v-else class="text-xs text-gray-400">ยังไม่มีไฟล์</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-gray-400" />
                <span class="text-gray-700">บทความฉบับสมบูรณ์ (Full Paper)</span>
              </div>
              <a v-if="submission.fullPaperFileUrl" :href="fileLink(submission.fullPaperFileUrl)" target="_blank"
                class="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 hover:underline">
                <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
                ดาวน์โหลด
              </a>
              <span v-else class="text-xs text-gray-400">ยังไม่มีไฟล์</span>
            </div>
          </div>
        </div>

        <!-- Payment slip -->
        <div v-if="submission.paymentSlipUrl" class="border border-yellow-200 rounded-lg p-4 bg-yellow-50/50 space-y-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-credit-card" class="w-5 h-5 text-yellow-600" />
            <h3 class="text-sm font-semibold text-yellow-700">หลักฐานการชำระเงิน</h3>
          </div>
          <img
            :src="fileLink(submission.paymentSlipUrl)"
            class="w-32 h-auto rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity object-cover"
            @click="slipPreviewOpen = true"
          />
        </div>

        <!-- Slip preview modal -->
        <UModal v-model="slipPreviewOpen" :ui="{ width: 'sm:max-w-3xl' }">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-sm">หลักฐานการชำระเงิน</h3>
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" size="sm" @click="slipPreviewOpen = false" />
              </div>
            </template>
            <div class="flex justify-center">
              <img v-if="submission?.paymentSlipUrl" :src="fileLink(submission.paymentSlipUrl)" class="max-w-full max-h-[70vh] rounded-lg" />
            </div>
          </UCard>
        </UModal>

        <!-- Revision history -->
        <div v-if="submission.revisions.length > 0">
          <h3 class="text-xs font-semibold text-gray-600 mb-2">ประวัติการแก้ไข</h3>
          <ul class="space-y-2">
            <li v-for="rev in submission.revisions" :key="rev.id" class="flex items-start justify-between text-sm">
              <div>
                <span class="font-medium">ครั้งที่ {{ rev.version }}</span>
                <span class="text-gray-400 ml-2">{{ formatDate(rev.submittedAt) }}</span>
                <p v-if="rev.changelog" class="text-gray-500 text-xs mt-0.5">{{ rev.changelog }}</p>
              </div>
              <UButton size="xs" color="gray" variant="ghost" icon="i-heroicons-arrow-down-tray" :to="fileLink(rev.fileUrl)" target="_blank" />
            </li>
          </ul>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <div v-if="submission" class="flex gap-2">
            <UButton v-if="submission.status === 'payment_verifying'" color="green" :loading="updating" @click="updateStatus('submitted')">
              อนุมัติการชำระเงิน
            </UButton>
            <UButton v-if="submission.status === 'submitted'" color="yellow" :loading="updating" @click="updateStatus('under_review')">
              ส่งพิจารณา
            </UButton>
            <template v-if="submission.status === 'under_review'">
              <UButton color="green" :loading="updating" @click="updateStatus('accepted')">ผ่าน</UButton>
              <UButton color="red" :loading="updating" @click="updateStatus('rejected')">ไม่ผ่าน</UButton>
              <UButton color="orange" :loading="updating" @click="updateStatus('revision_requested')">ขอแก้ไข</UButton>
            </template>
          </div>
          <div class="flex-1" />
          <UButton color="gray" variant="soft" @click="isOpen = false">ปิด</UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/admin/AdminSubmissionDetailModal.vue
git commit -m "feat: add AdminSubmissionDetailModal component"
```

---

### Task 2: Wire modal into admin page — replace table action column

**Files:**
- Modify: `frontend/pages/admin/index.vue`

- [ ] **Step 1: Add modal state and component to admin page**

Add these to the `<script setup>` section, after the existing `updating` ref (line ~46):

```ts
const detailModalOpen = ref(false);
const detailSubmissionId = ref<string | null>(null);

function openDetail(id: string) {
  detailSubmissionId.value = id;
  detailModalOpen.value = true;
}

function onDetailStatusChanged() {
  fetchSubmissions();
  fetchStats();
}
```

Then in the `<template>`:

1. **Make submission title clickable** — replace the `<td>` for "ผลงาน" (lines 261-264) with:

```html
<td class="py-3 px-3">
  <button class="text-left" @click="openDetail(sub.id)">
    <p class="font-medium line-clamp-1 text-primary-600 hover:text-primary-700 hover:underline">{{ sub.title }}</p>
    <p v-if="sub.titleEn" class="text-xs text-gray-400 line-clamp-1">{{ sub.titleEn }}</p>
  </button>
</td>
```

2. **Remove the "จัดการ" column** — delete the `<th>` for "จัดการ" (line 252) and the entire `<td>` action column (lines 280-326).

3. **Add the modal component** — add before the closing `</div>` of the root element (before line 370):

```html
<!-- Submission detail modal -->
<AdminAdminSubmissionDetailModal
  v-model="detailModalOpen"
  :submission-id="detailSubmissionId"
  @status-changed="onDetailStatusChanged"
/>
```

**Note on component name:** Nuxt auto-imports from `components/admin/AdminSubmissionDetailModal.vue` as `<AdminAdminSubmissionDetailModal>` (directory prefix + filename). If you prefer a shorter name, move the component to `frontend/components/AdminSubmissionDetailModal.vue` and use `<AdminSubmissionDetailModal>`.

- [ ] **Step 2: Verify in browser**

Run: `cd frontend && npm run dev`
1. Login as admin
2. Navigate to `/admin`
3. Verify table has 5 columns (no "จัดการ")
4. Click a submission title
5. Verify modal opens with full details
6. Verify admin action buttons appear based on status
7. Test a status change

- [ ] **Step 3: Commit**

```bash
git add frontend/pages/admin/index.vue
git commit -m "feat: wire admin submission modal, remove table action column"
```

---

## Self-Review

**Spec coverage:** Every section from the spec (header, info, keywords, creators, abstract, files, payment slip with preview, revision history, status actions) has a corresponding implementation in Task 1. Task 2 wires the modal and removes the table column. No gaps.

**Placeholder scan:** No TBD/TODO/vague steps. All code blocks contain complete implementations.

**Type consistency:** `Submission` interface is identical between the modal and the API response shape. `fileLink()` helper signature matches usage. `updateStatus()` calls the correct endpoint with correct body shape. Event name `status-changed` matches the emit declaration and the handler `onDetailStatusChanged`.
