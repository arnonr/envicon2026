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
  track: number;
  status: string;
  abstractFileUrl: string | null;
  fullPaperFileUrl: string | null;
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
}>();

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { handleApiCall, showError, showSuccess } = useApiError();

const submission = ref<Submission | null>(null);
const loading = ref(false);
const uploadingPaper = ref(false);

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

const uploadFullPaper = async (file: File) => {
  if (!props.submissionId) return;
  uploadingPaper.value = true;
  const formData = new FormData();
  formData.append('file', file);
  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/submissions/${props.submissionId}/upload-paper`, {
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

const formatDate = (iso: string | null) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
};

const parsedKeywords = computed(() => {
  const kw = submission.value?.keywords;
  if (!kw) return [];
  return kw.split(',').map(k => k.trim()).filter(Boolean);
});

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
              <UButton v-if="submission.abstractFileUrl" size="xs" color="gray" variant="soft" icon="i-heroicons-arrow-down-tray" :to="submission.abstractFileUrl" target="_blank">
                ดาวน์โหลด
              </UButton>
              <span v-else class="text-xs text-gray-400">ยังไม่มีไฟล์</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-gray-400" />
                <span class="text-gray-700">บทความฉบับสมบูรณ์ (Full Paper)</span>
              </div>
              <UButton v-if="submission.fullPaperFileUrl" size="xs" color="gray" variant="soft" icon="i-heroicons-arrow-down-tray" :to="submission.fullPaperFileUrl" target="_blank">
                ดาวน์โหลด
              </UButton>
              <span v-else class="text-xs text-gray-400">ยังไม่มีไฟล์</span>
            </div>
          </div>
        </div>

        <!-- Upload full paper (accepted, no file yet) -->
        <div v-if="submission.status === 'accepted' && !submission.fullPaperFileUrl" class="border border-green-200 rounded-lg p-4 bg-green-50/50">
          <div class="flex items-center gap-2 mb-3">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
            <h3 class="text-sm font-semibold text-green-700">บทคัดย่อได้รับการอนุมัติ — กรุณาส่งบทความฉบับสมบูรณ์</h3>
          </div>
          <CommonFileUpload :loading="uploadingPaper" :max-size-mb="50" @change="uploadFullPaper" />
        </div>

        <!-- Revision requested -->
        <div v-if="submission.status === 'revision_requested'" class="border border-orange-200 rounded-lg p-4 bg-orange-50/50">
          <div class="flex items-center gap-2 mb-3">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-orange-500" />
            <h3 class="text-sm font-semibold text-orange-700">คณะกรรมการขอให้แก้ไขผลงาน</h3>
          </div>
          <p class="text-sm text-gray-600 mb-4">กรุณาตรวจสอบข้อเสนอแนะจากคณะกรรมการและส่งผลงานที่แก้ไขแล้ว</p>
          <UButton color="orange" variant="soft" @click="navigateTo(`/submissions/${submission.id}/revise`)">
            ส่งผลงานที่แก้ไข
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1" />
          </UButton>
        </div>

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
              <UButton size="xs" color="gray" variant="ghost" icon="i-heroicons-arrow-down-tray" :to="rev.fileUrl" target="_blank" />
            </li>
          </ul>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton color="gray" variant="soft" @click="isOpen = false">ปิด</UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
