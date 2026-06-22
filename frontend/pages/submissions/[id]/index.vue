<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'role'] });

interface Revision {
  id: string;
  version: number;
  fileUrl: string;
  changelog: string | null;
  submittedAt: string;
  fileAvailable: boolean;
}

interface RoundSummary {
  id: string;
  roundNumber: number;
  status: "assigning" | "in_review" | "ready_for_decision" | "released";
  decision: "accept" | "reject" | "revise" | null;
  adminNote: string | null;
  releasedAt: string | null;
}

interface ReleasedResult {
  decision: "accept" | "reject" | "revise";
  adminNote: string | null;
  releasedAt: string;
  commentsToAuthor: string[];
}

interface Submission {
  id: string;
  title: string;
  titleEn: string | null;
  abstract: string | null;
  keywords: string | null;
  track: number;
  status: string;
  abstractFileUrl: string | null;
  fullPaperFileUrl: string | null;
  round1FileUrl: string | null;
  round1FileType: "abstract" | "full_paper" | null;
  submittedAt: string | null;
  updatedAt: string;
  revisions: Revision[];
  rounds: RoundSummary[];
  currentRoundNumber: number;
  canReplaceLatestRevisionFile: boolean;
  releasedResult: ReleasedResult | null;
}

const route = useRoute();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { handleApiCall, showError, showSuccess } = useApiError();

const submission = ref<Submission | null>(null);
const loading = ref(true);
const uploadingPaper = ref(false);
const replacingRevisionFile = ref(false);

const TRACK_NAMES: Record<number, string> = {
  1: 'วิทยาศาสตร์สิ่งแวดล้อมและการควบคุมมลพิษ',
  2: 'การจัดการระบบนิเวศและทรัพยากรธรรมชาติ',
  3: 'เศรษฐกิจหมุนเวียนและการใช้ทรัพยากรอย่างคุ้มค่า',
  4: 'การเปลี่ยนแปลงสภาพภูมิอากาศและเทคโนโลยีคาร์บอนต่ำ',
  5: 'เทคโนโลยีดิจิทัลและระบบอัจฉริยะเพื่อการติดตามสิ่งแวดล้อม',
  6: 'เมืองยั่งยืน อุตสาหกรรมสีเขียว และการจัดการสิ่งแวดล้อม',
  7: 'สิ่งแวดล้อมและสุขภาพ',
};

const headers = computed(() => ({
  Authorization: `Bearer ${authStore.token}`,
}));

const fetchSubmission = async () => {
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: Submission }>(`${apiBase}/submissions/${route.params.id}`, {
      headers: headers.value,
    })
  );
  loading.value = false;
  if (error) { showError(error); return; }
  submission.value = data!.data;
};

const uploadFullPaper = async (file: File) => {
  uploadingPaper.value = true;
  const formData = new FormData();
  formData.append('file', file);

  const { data, error } = await handleApiCall(() =>
    $fetch(`${apiBase}/submissions/${route.params.id}/upload-paper`, {
      method: 'POST',
      headers: headers.value,
      body: formData,
    })
  );

  uploadingPaper.value = false;
  if (error) { showError(error); return; }
  showSuccess('อัปโหลดบทความฉบับสมบูรณ์เรียบร้อยแล้ว');
  await fetchSubmission();
};

const replaceMissingRevisionFile = async (file: File) => {
  replacingRevisionFile.value = true;
  const formData = new FormData();
  formData.append('file', file);
  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/submissions/${route.params.id}/revisions/latest/replace-file`, {
      method: 'POST',
      headers: headers.value,
      body: formData,
    })
  );
  replacingRevisionFile.value = false;
  if (error) { showError(error); return; }
  showSuccess('แนบไฟล์ผลงานฉบับแก้ไขใหม่เรียบร้อยแล้ว');
  await fetchSubmission();
};

const formatDate = (iso: string | null) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
};

onMounted(fetchSubmission);
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-12">
    <!-- Back to dashboard -->
    <NuxtLink to="/dashboard" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
      <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
      กลับแดชบอร์ด
    </NuxtLink>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
    </div>

    <template v-else-if="submission">
      <!-- Title + Status -->
      <div class="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 class="text-xl font-bold text-gray-900 leading-snug">{{ submission.title }}</h1>
          <p v-if="submission.titleEn" class="text-sm text-gray-500 mt-0.5">{{ submission.titleEn }}</p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <SubmissionRoundIndicator v-if="submission.currentRoundNumber > 0" :round-number="submission.currentRoundNumber" />
          <SubmissionStatusBadge :status="submission.status" />
        </div>
      </div>

      <!-- Info Card -->
      <UCard class="mb-6">
        <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt class="text-gray-500">สาขา</dt>
            <dd class="font-medium mt-0.5">{{ TRACK_NAMES[submission.track] }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">วันที่ส่ง</dt>
            <dd class="mt-0.5">{{ formatDate(submission.submittedAt) }}</dd>
          </div>
          <div v-if="submission.keywords" class="col-span-2">
            <dt class="text-gray-500">คำสำคัญ</dt>
            <dd class="mt-0.5">{{ submission.keywords }}</dd>
          </div>
          <div v-if="submission.abstract" class="col-span-2">
            <dt class="text-gray-500">บทคัดย่อ</dt>
            <dd class="mt-1 text-gray-700 leading-relaxed">{{ submission.abstract }}</dd>
          </div>
        </dl>
      </UCard>

      <!-- Files -->
      <UCard class="mb-6">
        <template #header>
          <h3 class="font-semibold text-sm">ไฟล์ที่แนบ</h3>
        </template>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm">
              <UIcon name="i-heroicons-document" class="w-4 h-4 text-gray-400" />
              <span class="text-gray-700">
                ไฟล์รอบที่ 1
                <span v-if="submission.round1FileType === 'abstract'" class="text-xs text-gray-500 ml-1">(เฉพาะบทคัดย่อ)</span>
                <span v-else-if="submission.round1FileType === 'full_paper'" class="text-xs text-gray-500 ml-1">(บทความฉบับสมบูรณ์)</span>
              </span>
            </div>
            <UButton
              v-if="submission.round1FileUrl"
              size="xs"
              color="gray"
              variant="soft"
              icon="i-heroicons-arrow-down-tray"
              :to="submission.round1FileUrl"
              target="_blank"
            >
              ดาวน์โหลด
            </UButton>
            <span v-else class="text-xs text-gray-400">ยังไม่มีไฟล์</span>
          </div>

          <div v-if="submission.fullPaperFileUrl" class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm">
              <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-gray-400" />
              <span class="text-gray-700">บทความฉบับสมบูรณ์ (Full Paper)</span>
            </div>
            <UButton
              size="xs"
              color="gray"
              variant="soft"
              icon="i-heroicons-arrow-down-tray"
              :to="submission.fullPaperFileUrl"
              target="_blank"
            >
              ดาวน์โหลด
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Upload Full Paper (when passed round 1) -->
      <UCard v-if="submission.status === 'passed_round1' && !submission.fullPaperFileUrl" class="mb-6">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
            <h3 class="font-semibold text-sm text-green-700">บทคัดย่อได้รับการอนุมัติ — กรุณาส่งบทความฉบับสมบูรณ์</h3>
          </div>
        </template>
        <CommonFileUpload
          :loading="uploadingPaper"
          :max-size-mb="50"
          @change="uploadFullPaper"
        />
      </UCard>

      <!-- Revision requested -->
      <UCard v-if="submission.status === 'passed_round1_with_revisions' || submission.status === 'passed_round2_with_revisions'" class="mb-6 border-orange-200">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-orange-500" />
            <h3 class="font-semibold text-sm text-orange-700">คณะกรรมการขอให้แก้ไขผลงาน</h3>
          </div>
        </template>
        <p class="text-sm text-gray-600 mb-4">
          กรุณาตรวจสอบข้อเสนอแนะจากคณะกรรมการและส่งผลงานที่แก้ไขแล้ว
        </p>
        <UButton color="orange" variant="soft" :to="`/submissions/${submission.id}/revise`">
          แก้ไขและส่งผลงาน
          <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1" />
        </UButton>
      </UCard>

      <UCard v-if="submission.releasedResult" class="mb-6 border-primary-200">
        <template #header>
          <h3 class="font-semibold text-sm">ผลการพิจารณาและข้อเสนอแนะ</h3>
        </template>
        <div class="space-y-3 text-sm">
          <p v-if="submission.releasedResult.adminNote" class="whitespace-pre-line">
            <span class="text-gray-500">หมายเหตุจากเจ้าหน้าที่:</span><br />
            {{ submission.releasedResult.adminNote }}
          </p>
          <div v-if="submission.releasedResult.commentsToAuthor.length">
            <p class="text-gray-500 mb-2">ความคิดเห็นจากผู้รีวิว</p>
            <div v-for="(comment, index) in submission.releasedResult.commentsToAuthor" :key="index" class="bg-gray-50 rounded-lg p-3 mb-2 whitespace-pre-line">
              ผู้รีวิวคนที่ {{ index + 1 }}: {{ comment }}
            </div>
          </div>
        </div>
      </UCard>

      <UCard v-if="submission.canReplaceLatestRevisionFile" class="mb-6 border-red-200">
        <template #header>
          <div class="flex items-center gap-2 text-red-700">
            <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5" />
            <h3 class="font-semibold text-sm">ไม่พบไฟล์ผลงานฉบับแก้ไขล่าสุด</h3>
          </div>
        </template>
        <p class="text-sm text-gray-600 mb-4">
          กรุณาแนบไฟล์ PDF ฉบับแก้ไขอีกครั้งก่อนเริ่มการพิจารณารอบถัดไป
        </p>
        <CommonFileUpload
          :loading="replacingRevisionFile"
          :max-size-mb="50"
          @change="replaceMissingRevisionFile"
        />
      </UCard>

      <!-- Revision history -->
      <UCard v-if="submission.revisions.length > 0">
        <template #header>
          <h3 class="font-semibold text-sm">ประวัติการแก้ไข</h3>
        </template>
        <ul class="space-y-3">
          <li
            v-for="rev in submission.revisions"
            :key="rev.id"
            class="flex items-start justify-between text-sm"
          >
            <div>
              <span class="font-medium">ผลงานฉบับแก้ไขครั้งที่ {{ rev.version }}</span>
              <span class="text-gray-400 ml-2">{{ formatDate(rev.submittedAt) }}</span>
              <p v-if="rev.changelog" class="text-gray-500 text-xs mt-0.5">{{ rev.changelog }}</p>
              <p v-if="!rev.fileAvailable" class="text-red-600 text-xs mt-0.5">ไม่พบไฟล์ กรุณาแนบใหม่ก่อนส่งพิจารณา</p>
            </div>
            <UButton
              v-if="rev.fileAvailable"
              size="xs"
              color="gray"
              variant="ghost"
              icon="i-heroicons-arrow-down-tray"
              :to="rev.fileUrl"
              target="_blank"
            />
          </li>
        </ul>
      </UCard>

      <!-- Review rounds timeline -->
      <UCard v-if="submission.rounds.length > 0" class="mb-6">
        <template #header>
          <h3 class="font-semibold text-sm">รอบการพิจารณา</h3>
        </template>
        <ol class="space-y-3">
          <li
            v-for="round in submission.rounds"
            :key="round.id"
            class="flex items-start gap-3 text-sm border-l-2 pl-3"
            :class="round.status === 'released' ? 'border-primary-400' : 'border-yellow-400'"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium">รอบที่ {{ round.roundNumber }}</span>
                <UBadge
                  :color="round.status === 'released' ? (round.decision === 'accept' ? 'green' : round.decision === 'reject' ? 'red' : 'orange') : 'yellow'"
                  variant="soft"
                  size="xs"
                >
                  {{ round.status === 'released'
                    ? (round.decision === 'accept' ? 'ผ่านการพิจารณา' : round.decision === 'reject' ? 'ไม่ผ่าน' : 'ขอแก้ไข')
                    : 'กำลังดำเนินการ' }}
                </UBadge>
              </div>
              <p v-if="round.releasedAt" class="text-xs text-gray-400 mt-0.5">แจ้งผลเมื่อ {{ formatDate(round.releasedAt) }}</p>
              <p v-if="round.adminNote" class="text-xs text-gray-600 mt-1 whitespace-pre-line">{{ round.adminNote }}</p>
            </div>
          </li>
        </ol>
      </UCard>
    </template>
  </div>
</template>
