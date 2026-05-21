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
}>();

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { handleApiCall, showError, showSuccess } = useApiError();
const { fees } = useFees();

const fileLink = (url: string | null) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  try { return new URL(apiBase).origin + url; } catch { return url; }
};

const submission = ref<Submission | null>(null);
const loading = ref(false);
const uploadingPaper = ref(false);
const uploadingSlip = ref(false);
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

const selectedSlipFile = ref<File | null>(null);

const onSlipSelected = (file: File) => {
  selectedSlipFile.value = file;
};

const uploadSlip = async () => {
  if (!props.submissionId || !selectedSlipFile.value) return;
  uploadingSlip.value = true;
  const formData = new FormData();
  formData.append('file', selectedSlipFile.value);
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
  selectedSlipFile.value = null;
  await fetchSubmission();
};

const formatDate = (iso: string | null) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
};

import type { Creator } from '~/components/submission/SubmissionForm.vue';

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
            <dd class="font-medium mt-0.5">{{ submission.submitterType === 'student' ? `นิสิต/นักศึกษา (${fees.student.toLocaleString()} บาท)` : `อาจารย์/นักวิจัย/บุคคลทั่วไป (${fees.general.toLocaleString()} บาท)` }}</dd>
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
          <div>
            <p class="text-xs text-gray-500 mb-2">อัปโหลดหลักฐานการชำระเงิน (สลิปโอนเงิน)</p>
            <CommonFileUpload :loading="uploadingSlip" :max-size-mb="10" accept=".pdf,.png,.jpg,.jpeg" @change="onSlipSelected" />
            <div class="flex justify-end mt-3">
              <UButton v-if="selectedSlipFile" color="primary" :loading="uploadingSlip" @click="uploadSlip">
                บันทึก
                <UIcon name="i-heroicons-check" class="w-4 h-4 ml-1" />
              </UButton>
              <p v-else class="text-xs text-gray-400 self-center">เลือกไฟล์ก่อนบันทึก</p>
            </div>
          </div>
        </div>

        <!-- Payment verifying -->
        <div v-if="submission.status === 'payment_verifying'" class="border border-yellow-200 rounded-lg p-4 bg-yellow-50/50 space-y-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-clock" class="w-5 h-5 text-yellow-600" />
            <h3 class="text-sm font-semibold text-yellow-700">รอตรวจสอบการชำระเงิน</h3>
          </div>
          <p class="text-sm text-gray-600">ได้รับหลักฐานการชำระเงินเรียบร้อย กำลังรอเจ้าหน้าที่ตรวจสอบ</p>
          <div v-if="submission.paymentSlipUrl">
            <p class="text-xs text-gray-500 mb-1.5">หลักฐานการชำระเงิน</p>
            <img
              :src="fileLink(submission.paymentSlipUrl)"
              class="w-32 h-auto rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity object-cover"
              @click="slipPreviewOpen = true"
            />
          </div>
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
