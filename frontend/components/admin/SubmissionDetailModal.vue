<script setup lang="ts">
interface Revision {
  id: string;
  version: number;
  fileUrl: string;
  changelog: string | null;
  submittedAt: string;
  fileAvailable: boolean;
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

interface WorkflowAssignment {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerEmail: string;
  status: "assigned" | "sent" | "in_progress" | "completed";
  dueAt: string | null;
  score: number | null;
  recommendation: string | null;
  commentsToAuthor: string | null;
  commentsToEditor: string | null;
}

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
  fileUrl: string | null;
  changelog: string | null;
  submittedAt: string;
  fileAvailable: boolean;
}

interface WorkflowRound {
  id: string;
  roundNumber: number;
  status: string;
  decision: "accept" | "reject" | "revise" | null;
  adminNote: string | null;
  releasedAt: string | null;
  dispatchedCount: number;
  completedCount: number;
  assignments: WorkflowAssignment[];
  submissionVersion: SubmissionVersion | null;
}

interface WorkflowReviewer {
  id: string;
  name: string;
  email: string;
  expertiseTracks: number[];
  active: boolean;
  activeReviewCount: number;
  maxConcurrentReviews: number;
  matchesTrack: boolean;
  overCapacity: boolean;
}

interface ReviewWorkflow {
  currentRound: WorkflowRound | null;
  rounds: WorkflowRound[];
  versions: SubmissionVersion[];
  reviewers: WorkflowReviewer[];
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

const TRACK_NAMES: Record<number, string> = {
  1: 'วิทยาศาสตร์สิ่งแวดล้อมและการควบคุมมลพิษ',
  2: 'การจัดการระบบนิเวศและทรัพยากรธรรมชาติ',
  3: 'เศรษฐกิจหมุนเวียนและการใช้ทรัพยากรอย่างคุ้มค่า',
  4: 'การเปลี่ยนแปลงสภาพภูมิอากาศและเทคโนโลยีคาร์บอนต่ำ',
  5: 'เทคโนโลยีดิจิทัลและระบบอัจฉริยะเพื่อการติดตามสิ่งแวดล้อม',
  6: 'เมืองยั่งยืน อุตสาหกรรมสีเขียว และการจัดการสิ่งแวดล้อม',
  7: 'สิ่งแวดล้อมและสุขภาพ',
};

const fileLink = (url: string | null) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  try { return new URL(apiBase).origin + url; } catch { return url; }
};

const submission = ref<Submission | null>(null);
const loading = ref(false);
const updating = ref(false);
const slipPreviewOpen = ref(false);
const workflow = ref<ReviewWorkflow | null>(null);
const workflowLoading = ref(false);
const selectedReviewerIds = ref<string[]>([]);
const dueDates = reactive<Record<string, string>>({});
const decision = ref<"" | "accept" | "reject" | "revise">("");
const adminNote = ref("");

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const headers = computed(() => ({
  Authorization: `Bearer ${authStore.token}`,
}));

const formatDate = (iso: string | null) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
};

const submitterLabel = (type: string) =>
  type === 'student' ? 'นิสิต/นักศึกษา' : 'อาจารย์/นักวิจัย/บุคคลทั่วไป';

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

const parsedKeywords = computed(() => {
  const kw = submission.value?.keywords;
  if (!kw) return [];
  return kw.split(',').map(k => k.trim()).filter(Boolean);
});

const decisionLabel = (decision: WorkflowRound["decision"]) =>
  ({ accept: "ผ่านการพิจารณา", reject: "ไม่ผ่าน", revise: "ขอแก้ไข" }[decision ?? ""] ?? "ยังไม่มีผลตัดสิน");

const versionLabel = (version: SubmissionVersion) =>
  version.kind === "initial" ? "ฉบับเริ่มต้น" : `ฉบับแก้ไข ครั้งที่ ${version.version - 1}`;

const creatorsLabel = (raw: string | null) => {
  if (!raw) return "-";
  try {
    const values = JSON.parse(raw) as Creator[];
    return values.map(value => `${value.firstName} ${value.lastName}`.trim()).filter(Boolean).join(", ") || "-";
  } catch {
    return raw;
  }
};

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
    { label: "ไฟล์", before: previous.fileUrl, after: version.fileUrl },
  ];
  return fields.filter(field => (field.before ?? "") !== (field.after ?? ""));
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

const updateStatus = async (newStatus: string, successMsg: string) => {
  if (!props.submissionId) return;
  updating.value = true;
  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/admin/submissions/${props.submissionId}/status`, {
      method: 'PATCH',
      headers: headers.value,
      body: { status: newStatus },
    })
  );
  updating.value = false;
  if (error) { showError(error); return; }
  showSuccess(successMsg);
  emit('status-changed');
  await fetchSubmission();
  await fetchWorkflow();
};

const fetchWorkflow = async () => {
  if (!props.submissionId || !submission.value) {
    workflow.value = null;
    return;
  }
  workflowLoading.value = true;
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: ReviewWorkflow }>(`${apiBase}/admin/submissions/${props.submissionId}/review-workflow`, {
      headers: headers.value,
    })
  );
  workflowLoading.value = false;
  if (error) { showError(error); return; }
  workflow.value = data!.data;
  decision.value = workflow.value.currentRound?.decision ?? "";
  adminNote.value = workflow.value.currentRound?.adminNote ?? "";
  for (const assignment of workflow.value.currentRound?.assignments ?? []) {
    dueDates[assignment.id] = assignment.dueAt?.slice(0, 10) ?? new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  }
};

const createRound = async () => {
  if (!props.submissionId) return;
  updating.value = true;
  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/admin/submissions/${props.submissionId}/review-rounds`, { method: "POST", headers: headers.value })
  );
  updating.value = false;
  if (error) { showError(error); return; }
  showSuccess("เริ่มรอบพิจารณาเรียบร้อย");
  await fetchWorkflow();
};

const assignReviewers = async () => {
  if (!workflow.value?.currentRound || selectedReviewerIds.value.length === 0) return;
  updating.value = true;
  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/admin/review-rounds/${workflow.value!.currentRound!.id}/assignments`, {
      method: "POST",
      headers: headers.value,
      body: { reviewerIds: selectedReviewerIds.value },
    })
  );
  updating.value = false;
  if (error) { showError(error); return; }
  selectedReviewerIds.value = [];
  showSuccess("กำหนดผู้รีวิวเรียบร้อย");
  await fetchWorkflow();
};

const removeAssignment = async (id: string) => {
  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/admin/reviews/${id}`, { method: "DELETE", headers: headers.value })
  );
  if (error) { showError(error); return; }
  await fetchWorkflow();
};

const sendAssignment = async (id: string) => {
  updating.value = true;
  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/admin/reviews/${id}/send`, {
      method: "POST",
      headers: headers.value,
      body: { dueAt: dueDates[id] },
    })
  );
  updating.value = false;
  if (error) { showError(error); return; }
  showSuccess("ส่งอีเมลงานประเมินเรียบร้อย");
  emit("status-changed");
  await fetchSubmission();
  await fetchWorkflow();
};

const saveDecision = async () => {
  if (!workflow.value?.currentRound || !decision.value) return;
  updating.value = true;
  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/admin/review-rounds/${workflow.value!.currentRound!.id}/decision`, {
      method: "PATCH",
      headers: headers.value,
      body: { decision: decision.value, adminNote: adminNote.value || undefined },
    })
  );
  updating.value = false;
  if (error) { showError(error); return; }
  showSuccess("บันทึกผลตัดสินเรียบร้อย");
  await fetchWorkflow();
};

const releaseDecision = async () => {
  if (!workflow.value?.currentRound) return;
  updating.value = true;
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: { notificationStatus: "sent" | "failed" } }>(
      `${apiBase}/admin/review-rounds/${workflow.value!.currentRound!.id}/release`,
      { method: "POST", headers: headers.value },
    )
  );
  updating.value = false;
  if (error) { showError(error); return; }
  showSuccess(data!.data.notificationStatus === "sent" ? "แจ้งผลเจ้าของผลงานเรียบร้อย" : "บันทึกผลแล้ว แต่อีเมลส่งไม่สำเร็จ");
  emit("status-changed");
  await fetchSubmission();
  await fetchWorkflow();
};

const assignmentLabel = (status: WorkflowAssignment["status"]) =>
  ({ assigned: "ยังไม่ส่ง", sent: "ส่งแล้ว", in_progress: "กำลังกรอก", completed: "ประเมินแล้ว" })[status];

const availableReviewers = computed(() => (workflow.value?.reviewers ?? []).filter(
  (reviewer) => reviewer.active && !workflow.value?.currentRound?.assignments.some((assignment) => assignment.reviewerId === reviewer.id),
));

watch(() => props.modelValue, (open) => {
  if (open) {
    submission.value = null;
    workflow.value = null;
    fetchSubmission().then(fetchWorkflow);
  }
});
</script>

<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-4xl' }">
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
            <dd class="font-medium mt-0.5">{{ submitterLabel(submission.submitterType) }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">วันที่ส่ง</dt>
            <dd class="mt-0.5">{{ formatDate(submission.submittedAt) }}</dd>
          </div>
        </dl>

        <!-- Keywords -->
        <div v-if="parsedKeywords.length" class="flex flex-wrap gap-1.5">
          <UBadge v-for="kw in parsedKeywords" :key="kw" color="gray" variant="soft" size="xs">
            {{ kw }}
          </UBadge>
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
        <div v-if="submission.paymentSlipUrl">
          <h3 class="text-xs font-semibold text-gray-600 mb-2">หลักฐานการชำระเงิน</h3>
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
                <p v-if="!rev.fileAvailable" class="text-red-600 text-xs mt-0.5">ไม่พบไฟล์</p>
              </div>
              <UButton v-if="rev.fileAvailable" size="xs" color="gray" variant="ghost" icon="i-heroicons-arrow-down-tray" :to="fileLink(rev.fileUrl)" target="_blank" />
            </li>
          </ul>
        </div>

        <UDivider />

        <!-- Review history -->
        <div>
          <h3 class="text-sm font-semibold text-gray-800 mb-3">ประวัติการพิจารณา</h3>
          <div v-if="workflowLoading" class="flex justify-center py-4">
            <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 text-gray-400 animate-spin" />
          </div>
          <p v-else-if="!workflow?.rounds.length" class="text-sm text-gray-400">ยังไม่มีรอบพิจารณา</p>
          <div v-else class="space-y-3">
            <div v-for="round in workflow.rounds" :key="round.id" class="border rounded-lg p-3 space-y-3">
              <div class="flex items-center justify-between gap-2">
                <p class="font-medium text-sm">รอบที่ {{ round.roundNumber }}</p>
                <UBadge :color="round.status === 'released' ? 'green' : 'yellow'" variant="soft" size="xs">
                  {{ round.status === 'released' ? decisionLabel(round.decision) : 'กำลังดำเนินการ' }}
                </UBadge>
              </div>
              <p v-if="round.releasedAt" class="text-xs text-gray-500">แจ้งผลเมื่อ {{ formatDate(round.releasedAt) }}</p>
              <p v-if="round.adminNote" class="text-sm whitespace-pre-line">
                <span class="text-gray-500">หมายเหตุจากเจ้าหน้าที่:</span> {{ round.adminNote }}
              </p>
              <div v-if="!round.submissionVersion" class="rounded bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                ไม่มี snapshot ข้อมูลผลงานสำหรับรอบนี้
              </div>
              <div v-for="assignment in round.assignments" :key="assignment.id" class="bg-gray-50 rounded p-3 text-sm space-y-1">
                <p class="font-medium">{{ assignment.reviewerName }}</p>
                <p><span class="text-gray-500">สถานะ:</span> {{ assignmentLabel(assignment.status) }}</p>
                <template v-if="assignment.status === 'completed'">
                  <p><span class="text-gray-500">คะแนน:</span> {{ assignment.score }}/5</p>
                  <p><span class="text-gray-500">ข้อเสนอ:</span> {{ assignment.recommendation }}</p>
                  <p class="whitespace-pre-line"><span class="text-gray-500">ถึงผู้เขียน:</span> {{ assignment.commentsToAuthor }}</p>
                  <p v-if="assignment.commentsToEditor" class="whitespace-pre-line"><span class="text-gray-500">ถึงเจ้าหน้าที่:</span> {{ assignment.commentsToEditor }}</p>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Version history -->
        <div v-if="workflow?.versions.length" class="border border-sky-200 rounded-lg p-4 bg-sky-50/30 space-y-3">
          <h3 class="font-semibold text-sm text-sky-800">ประวัติฉบับผลงานและการเปรียบเทียบ</h3>
          <div v-for="(version, index) in workflow.versions" :key="version.id" class="bg-white border rounded-lg p-3 space-y-2">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="font-medium text-sm">{{ versionLabel(version) }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(version.submittedAt) }}</p>
              </div>
              <a v-if="version.fileUrl && version.fileAvailable" :href="fileLink(version.fileUrl)" target="_blank" class="text-xs text-primary-600 hover:underline">
                ดาวน์โหลด PDF
              </a>
              <span v-else-if="version.fileUrl" class="text-xs text-red-600">ไม่พบไฟล์ PDF</span>
            </div>
            <p v-if="version.changelog" class="text-xs text-gray-600 whitespace-pre-line">{{ version.changelog }}</p>
            <div v-if="comparisonRows(version, index).length" class="border-t pt-2 space-y-2">
              <p class="text-xs font-medium text-gray-600">เปลี่ยนจากฉบับก่อนหน้า</p>
              <div v-for="change in comparisonRows(version, index)" :key="change.label" class="text-xs">
                <p class="font-medium text-gray-600">{{ change.label }}</p>
                <p class="text-red-600 line-through whitespace-pre-line">{{ change.before || '-' }}</p>
                <p class="text-green-700 whitespace-pre-line">{{ change.after || '-' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Review workflow -->
        <div v-if="['submitted', 'under_review'].includes(submission.status)" class="border border-emerald-200 rounded-lg p-4 bg-emerald-50/30 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-sm text-emerald-800">ผู้รีวิวและรอบพิจารณา</h3>
            <UButton v-if="!workflow?.currentRound && !workflowLoading" size="xs" color="primary" :loading="updating" @click="createRound">
              เริ่มรอบพิจารณา
            </UButton>
          </div>
          <div v-if="workflowLoading" class="flex justify-center py-4">
            <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 text-gray-400 animate-spin" />
          </div>
          <template v-else-if="workflow?.currentRound">
            <p class="text-xs text-gray-500">
              รอบที่ {{ workflow.currentRound.roundNumber }} | ส่งงาน {{ workflow.currentRound.dispatchedCount }} คน | ประเมินแล้ว {{ workflow.currentRound.completedCount }} คน
            </p>
            <div class="flex flex-col sm:flex-row gap-2">
              <USelectMenu
                v-model="selectedReviewerIds"
                multiple
                :options="availableReviewers.map((reviewer) => ({
                  value: reviewer.id,
                  label: `${reviewer.name}${reviewer.matchesTrack ? '' : ' (ต่างสาขา)'}${reviewer.overCapacity ? ' (เกินภาระงาน)' : ''}`,
                }))"
                value-attribute="value"
                option-attribute="label"
                placeholder="เลือกผู้รีวิว (เลือกได้หลายคน)"
                class="flex-1"
              />
              <UButton color="primary" variant="soft" :disabled="selectedReviewerIds.length === 0" :loading="updating" @click="assignReviewers">
                เพิ่มผู้รีวิว
              </UButton>
            </div>
            <div v-if="workflow.currentRound.assignments.length === 0" class="text-sm text-gray-400 text-center py-4">
              กรุณาเลือกผู้รีวิวก่อนส่งพิจารณา
            </div>
            <div v-for="assignment in workflow.currentRound.assignments" :key="assignment.id" class="bg-white border rounded-lg p-3 space-y-2">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span class="font-medium text-sm">{{ assignment.reviewerName }}</span>
                  <span class="text-xs text-gray-400 ml-2">{{ assignment.reviewerEmail }}</span>
                </div>
                <UBadge :color="assignment.status === 'completed' ? 'green' : assignment.status === 'assigned' ? 'gray' : 'yellow'" variant="soft" size="xs">
                  {{ assignmentLabel(assignment.status) }}
                </UBadge>
              </div>
              <div v-if="assignment.status === 'assigned'" class="flex flex-wrap items-center gap-2">
                <UInput v-model="dueDates[assignment.id]" type="date" size="sm" />
                <UButton color="primary" size="xs" :loading="updating" @click="sendAssignment(assignment.id)">ส่งพิจารณา</UButton>
                <UButton color="gray" variant="ghost" size="xs" @click="removeAssignment(assignment.id)">ถอดออก</UButton>
              </div>
              <p v-else-if="assignment.dueAt" class="text-xs text-gray-500">กำหนดส่ง {{ formatDate(assignment.dueAt) }}</p>
              <div v-if="assignment.status === 'completed'" class="bg-gray-50 rounded p-3 text-sm space-y-1">
                <p><span class="text-gray-500">คะแนน:</span> {{ assignment.score }}/5</p>
                <p><span class="text-gray-500">ข้อเสนอ:</span> {{ assignment.recommendation }}</p>
                <p><span class="text-gray-500">ถึงผู้เขียน:</span> {{ assignment.commentsToAuthor }}</p>
                <p v-if="assignment.commentsToEditor"><span class="text-gray-500">ถึงเจ้าหน้าที่:</span> {{ assignment.commentsToEditor }}</p>
              </div>
            </div>
            <div
              v-if="workflow.currentRound.dispatchedCount > 0 && workflow.currentRound.completedCount === workflow.currentRound.dispatchedCount"
              class="border-t pt-4 space-y-3"
            >
              <h4 class="font-medium text-sm">สรุปผลและแจ้งเจ้าของผลงาน</h4>
              <USelectMenu
                v-model="decision"
                :options="[
                  { value: 'accept', label: 'ผ่านการพิจารณา' },
                  { value: 'reject', label: 'ไม่ผ่าน' },
                  { value: 'revise', label: 'ขอแก้ไข' },
                ]"
                value-attribute="value"
                option-attribute="label"
                placeholder="เลือกผลตัดสิน"
              />
              <UTextarea v-model="adminNote" :rows="3" placeholder="หมายเหตุถึงเจ้าของผลงาน (ถ้ามี)" />
              <div class="flex gap-2">
                <UButton color="gray" variant="soft" :loading="updating" :disabled="!decision" @click="saveDecision">บันทึกผล</UButton>
                <UButton color="primary" :loading="updating" :disabled="!workflow.currentRound.decision" @click="releaseDecision">แจ้งผลเจ้าของผลงาน</UButton>
              </div>
            </div>
          </template>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <!-- Admin action buttons -->
          <div class="flex gap-2">
            <UButton
              v-if="submission?.status === 'payment_verifying'"
              color="green"
              :loading="updating"
              @click="updateStatus('submitted', 'อนุมัติการชำระเงินเรียบร้อย')"
            >
              อนุมัติการชำระเงิน
            </UButton>

          </div>

          <UButton color="gray" variant="soft" @click="isOpen = false">ปิด</UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
