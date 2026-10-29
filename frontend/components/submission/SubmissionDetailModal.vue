<script setup lang="ts">
import type { SelectedSubmissionFiles } from '~/components/submission/FileSlotsGrid.vue';

interface Revision {
  id: string;
  version: number;
  fileUrl: string;
  abstractFileUrl: string | null;
  abstractWordFileUrl: string | null;
  fullPaperFileUrl: string | null;
  fullPaperWordFileUrl: string | null;
  changelog: string | null;
  submittedAt: string;
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
  creators: string | null;
  track: number;
  submitterType: string;
  educationLevel: string;
  presentationFormat: string;
  status: string;
  abstractFileUrl: string | null;
  abstractWordFileUrl: string | null;
  fullPaperFileUrl: string | null;
  fullPaperWordFileUrl: string | null;
  round1FileUrl: string | null;
  round1FileType: "abstract" | "full_paper" | null;
  canUpdateFiles?: boolean;
  paymentSlipUrl: string | null;
  paymentStatus: 'unpaid' | 'pending_verification' | 'verified' | 'rejected';
  paymentNote: string | null;
  receiptName: string | null;
  receiptTaxId: string | null;
  receiptAddress: string | null;
  submittedAt: string | null;
  updatedAt: string;
  revisions: Revision[];
  releasedResult: ReleasedResult | null;
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
const uploadingSlip = ref(false);
const slipPreviewOpen = ref(false);

const isEditingFiles = ref(false);
const filesSectionRef = ref<HTMLElement | null>(null);
const savingFiles = ref(false);
const fileUpdateChangelog = ref('');
const fileSlots = ref<SelectedSubmissionFiles>({
  abstractPdf: null,
  abstractWord: null,
  fullPaperPdf: null,
  fullPaperWord: null,
});

const openFileEditor = async () => {
  isEditingFiles.value = true;
  await nextTick();
  filesSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const hasAnyFileToUpload = computed(() =>
  Boolean(
    fileSlots.value.abstractPdf ||
      fileSlots.value.abstractWord ||
      fileSlots.value.fullPaperPdf ||
      fileSlots.value.fullPaperWord
  )
);

const resetFileUpdateForm = () => {
  fileSlots.value = {
    abstractPdf: null,
    abstractWord: null,
    fullPaperPdf: null,
    fullPaperWord: null,
  };
  fileUpdateChangelog.value = '';
  isEditingFiles.value = false;
};

const saveFileUpdates = async () => {
  if (!props.submissionId || !hasAnyFileToUpload.value) return;
  savingFiles.value = true;
  const formData = new FormData();
  if (fileSlots.value.abstractPdf) formData.append('abstractPdf', fileSlots.value.abstractPdf);
  if (fileSlots.value.abstractWord) formData.append('abstractWord', fileSlots.value.abstractWord);
  if (fileSlots.value.fullPaperPdf) formData.append('fullPaperPdf', fileSlots.value.fullPaperPdf);
  if (fileSlots.value.fullPaperWord) formData.append('fullPaperWord', fileSlots.value.fullPaperWord);
  if (fileUpdateChangelog.value.trim()) formData.append('changelog', fileUpdateChangelog.value.trim());

  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/submissions/${props.submissionId}/upload-files`, {
      method: 'POST',
      headers: headers.value,
      body: formData,
    })
  );
  savingFiles.value = false;
  if (error) { showError(error); return; }
  showSuccess('อัปเดตไฟล์ผลงานเรียบร้อยแล้ว');
  resetFileUpdateForm();
  await fetchSubmission();
};

const receiptForm = ref({
  name: '',
  taxId: '',
  address: '',
});

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
  if (
    submission.value.canUpdateFiles
    && [
      'passed_round1',
      'passed_round1_with_revisions',
      'passed_round2_with_revisions',
      'submitted_round2',
      'under_review_round2',
    ].includes(submission.value.status)
  ) {
    isEditingFiles.value = true;
  }
  receiptForm.value = {
    name: submission.value.receiptName || '',
    taxId: submission.value.receiptTaxId || '',
    address: submission.value.receiptAddress || '',
  };
};

const selectedSlipFile = ref<File | null>(null);

const onSlipSelected = (file: File) => {
  selectedSlipFile.value = file;
};

const uploadSlip = async () => {
  if (!props.submissionId || !selectedSlipFile.value) return;

  if (!receiptForm.value.name.trim()) {
    showError({ status: 400, error: 'กรุณาระบุชื่อสำหรับออกใบเสร็จรับเงิน' });
    return;
  }
  if (!receiptForm.value.taxId.trim()) {
    showError({ status: 400, error: 'กรุณาระบุเลขประจำตัวผู้เสียภาษี' });
    return;
  }
  if (!receiptForm.value.address.trim()) {
    showError({ status: 400, error: 'กรุณาระบุที่อยู่สำหรับออกใบเสร็จรับเงิน' });
    return;
  }

  uploadingSlip.value = true;
  const formData = new FormData();
  formData.append('file', selectedSlipFile.value);
  formData.append('receiptName', receiptForm.value.name.trim());
  formData.append('receiptTaxId', receiptForm.value.taxId.trim());
  formData.append('receiptAddress', receiptForm.value.address.trim());

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

const educationLabel = (v: string) =>
  ({ bachelor: 'ปริญญาตรี', master: 'ปริญญาโท', doctorate: 'ปริญญาเอก' } as Record<string, string>)[v] ?? v;

const presentationFormatLabel = (v: string) =>
  ({ oral: 'แบบบรรยาย', poster: 'โปสเตอร์' } as Record<string, string>)[v] ?? v;

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
    resetFileUpdateForm();
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
            <SubmissionPaymentStatusBadge :status="submission.paymentStatus" />
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

        <!-- Keywords -->
        <div v-if="parsedKeywords.length" class="flex flex-wrap gap-1.5">
          <UBadge v-for="kw in parsedKeywords" :key="kw" color="gray" variant="soft" size="xs">
            {{ kw }}
          </UBadge>
        </div>

        <!-- Creators -->
        <div v-if="parsedCreators.length">
        <h3 class="text-xs text-gray-500 mb-1.5">ผู้แต่งร่วม (Co-author)</h3>
          <div class="flex flex-wrap gap-1.5">
            <UBadge v-for="(c, i) in parsedCreators" :key="i" color="primary" variant="soft" size="xs">
              {{ c.firstName }} {{ c.lastName }}<template v-if="c.affiliation"> · {{ c.affiliation }}</template>
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
        <div ref="filesSectionRef">
          <div class="flex items-center justify-between gap-2 mb-2">
            <h3 class="text-xs font-semibold text-gray-600">ไฟล์ที่แนบ</h3>
            <UButton
              v-if="submission.canUpdateFiles && !isEditingFiles"
              color="primary"
              variant="soft"
              size="xs"
              icon="i-heroicons-arrow-up-tray"
              @click="openFileEditor"
            >
              อัปโหลดเพิ่ม / อัปเดตไฟล์
            </UButton>
          </div>
          <SubmissionFileSlotsGrid
            v-model="fileSlots"
            :current-urls="submission"
            :editable="isEditingFiles"
            :loading="savingFiles"
          />
          <div v-if="isEditingFiles" class="mt-3 pt-3 border-t border-gray-100 space-y-3">
            <UFormGroup label="รายละเอียดการอัปเดตไฟล์ (ถ้ามี)" size="sm">
              <UTextarea
                v-model="fileUpdateChangelog"
                :rows="2"
                placeholder="เช่น เพิ่มไฟล์ Word ของบทความฉบับสมบูรณ์ หรืออัปเดตไฟล์ PDF"
              />
            </UFormGroup>
            <div class="flex justify-end gap-2">
              <UButton color="gray" variant="ghost" size="xs" :disabled="savingFiles" @click="resetFileUpdateForm">
                ยกเลิก
              </UButton>
              <UButton
                color="primary"
                size="xs"
                :loading="savingFiles"
                :disabled="!hasAnyFileToUpload"
                @click="saveFileUpdates"
              >
                บันทึกไฟล์เวอร์ชันใหม่
              </UButton>
            </div>
          </div>
        </div>

        <!-- Payment section (status-driven by paymentStatus) -->
        <div v-if="submission.paymentStatus !== 'verified'" class="border border-blue-200 rounded-lg p-4 bg-blue-50/50 space-y-4">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-credit-card" class="w-5 h-5 text-blue-600" />
            <h3 class="text-sm font-semibold text-blue-700">ชำระค่าส่งผลงาน</h3>
            <SubmissionPaymentStatusBadge :status="submission.paymentStatus" class="ml-auto" />
          </div>

          <!-- unpaid: bank info + upload -->
          <template v-if="submission.paymentStatus === 'unpaid'">
            <div class="bg-white rounded-lg p-3 text-sm space-y-1.5">
              <p class="font-semibold text-gray-700">รายละเอียดการโอน</p>
              <div class="flex justify-between">
                <span class="text-gray-500">ธนาคาร</span>
                <span>ธนาคารไทยพาณิชย์ (SCB) สาขาจัตุรัสจามจุรี</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">เลขบัญชี</span>
                <span class="font-mono font-semibold">412-206-6685</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">ชื่อบัญชี</span>
                <span>สมาคมสถาบันอุดมศึกษาสิ่งแวดล้อมไทย (สอสท.)</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">จำนวนเงิน</span>
                <span class="font-semibold text-primary-700">
                  {{ submission.submitterType === 'student' ? fees.student.toLocaleString() : fees.general.toLocaleString() }} บาท
                </span>
              </div>
            </div>
            <div class="bg-white rounded-lg p-3 text-sm space-y-3">
              <p class="font-semibold text-gray-700">ข้อมูลสำหรับออกใบเสร็จรับเงิน</p>
              <UFormGroup label="ชื่อสำหรับออกใบเสร็จ (Receipt Name)" required help="ชื่อ-นามสกุล หรือชื่อหน่วยงาน/บริษัท">
                <UInput v-model="receiptForm.name" placeholder="ระบุชื่อสำหรับออกใบเสร็จ" />
              </UFormGroup>
              <UFormGroup label="เลขประจำตัวผู้เสียภาษี (Tax ID / เลขบัตรประชาชน)" required help="เลขประจำตัวผู้เสียภาษี 13 หลัก">
                <UInput v-model="receiptForm.taxId" placeholder="XXXXXXXXXXXXX" maxlength="20" />
              </UFormGroup>
              <UFormGroup label="ที่อยู่สำหรับออกใบเสร็จ (Receipt Address)" required help="ที่อยู่สำหรับระบุในใบเสร็จรับเงิน">
                <UTextarea v-model="receiptForm.address" placeholder="ระบุที่อยู่สำหรับออกใบเสร็จ" :rows="2" />
              </UFormGroup>
            </div>

            <div>
              <p class="text-xs text-gray-500 mb-2">อัปโหลดหลักฐานการชำระเงิน (สลิปโอนเงิน)</p>
              <p class="text-xs text-gray-500 mb-2">ใบเสร็จจะออกตามข้อมูลที่ระบุด้านบน และรับได้ที่วันประชุม</p>
              <CommonFileUpload :loading="uploadingSlip" :max-size-mb="10" accept=".pdf,.png,.jpg,.jpeg" @change="onSlipSelected" />
              <div class="flex justify-end mt-3">
                <UButton v-if="selectedSlipFile" color="primary" :loading="uploadingSlip" @click="uploadSlip">
                  บันทึก
                  <UIcon name="i-heroicons-check" class="w-4 h-4 ml-1" />
                </UButton>
                <p v-else class="text-xs text-gray-400 self-center">เลือกไฟล์ก่อนบันทึก</p>
              </div>
            </div>
          </template>

          <!-- pending_verification: slip preview only -->
          <template v-else-if="submission.paymentStatus === 'pending_verification'">
            <p class="text-sm text-gray-600">ได้รับหลักฐานการชำระเงินเรียบร้อย กำลังรอเจ้าหน้าที่ตรวจสอบ</p>
            <div class="bg-white rounded-lg p-3 text-sm space-y-1.5 border border-blue-100">
              <p class="font-semibold text-gray-700">ข้อมูลใบเสร็จรับเงิน</p>
              <div class="flex justify-between">
                <span class="text-gray-500">ชื่อ</span>
                <span class="font-medium text-gray-900">{{ submission.receiptName || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">เลขประจำตัวผู้เสียภาษี</span>
                <span class="font-mono text-gray-900">{{ submission.receiptTaxId || '-' }}</span>
              </div>
              <div>
                <span class="text-gray-500">ที่อยู่</span>
                <p class="text-gray-900 mt-0.5 whitespace-pre-line">{{ submission.receiptAddress || '-' }}</p>
              </div>
            </div>
            <div v-if="submission.paymentSlipUrl">
              <p class="text-xs text-gray-500 mb-1.5">หลักฐานการชำระเงิน</p>
              <img
                :src="fileLink(submission.paymentSlipUrl)"
                class="w-32 h-auto rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity object-cover"
                @click="slipPreviewOpen = true"
              />
            </div>
          </template>

          <!-- rejected: note + re-upload -->
          <template v-else-if="submission.paymentStatus === 'rejected'">
            <div class="bg-red-50 border border-red-200 rounded p-3 text-sm">
              <p class="font-semibold text-red-700 mb-1">เหตุผลที่ปฏิเสธ</p>
              <p class="text-red-600 whitespace-pre-line">{{ submission.paymentNote || '-' }}</p>
            </div>
            <div class="bg-white rounded-lg p-3 text-sm space-y-3">
              <p class="font-semibold text-gray-700">ข้อมูลสำหรับออกใบเสร็จรับเงิน</p>
              <UFormGroup label="ชื่อสำหรับออกใบเสร็จ (Receipt Name)" required help="ชื่อ-นามสกุล หรือชื่อหน่วยงาน/บริษัท">
                <UInput v-model="receiptForm.name" placeholder="ระบุชื่อสำหรับออกใบเสร็จ" />
              </UFormGroup>
              <UFormGroup label="เลขประจำตัวผู้เสียภาษี (Tax ID / เลขบัตรประชาชน)" required help="เลขประจำตัวผู้เสียภาษี 13 หลัก">
                <UInput v-model="receiptForm.taxId" placeholder="XXXXXXXXXXXXX" maxlength="20" />
              </UFormGroup>
              <UFormGroup label="ที่อยู่สำหรับออกใบเสร็จ (Receipt Address)" required help="ที่อยู่สำหรับระบุในใบเสร็จรับเงิน">
                <UTextarea v-model="receiptForm.address" placeholder="ระบุที่อยู่สำหรับออกใบเสร็จ" :rows="2" />
              </UFormGroup>
            </div>
            <p class="text-xs text-gray-500">กรุณาอัปโหลดหลักฐานการชำระเงินใหม่</p>
            <CommonFileUpload :loading="uploadingSlip" :max-size-mb="10" accept=".pdf,.png,.jpg,.jpeg" @change="onSlipSelected" />
            <div class="flex justify-end mt-3">
              <UButton v-if="selectedSlipFile" color="primary" :loading="uploadingSlip" @click="uploadSlip">
                อัปโหลดใหม่
                <UIcon name="i-heroicons-arrow-up-tray" class="w-4 h-4 ml-1" />
              </UButton>
            </div>
          </template>
        </div>

        <!-- Verified: replace section with a small success line -->
        <div v-else class="border border-green-200 rounded-lg p-4 bg-green-50/50 space-y-3">
          <div class="flex items-center gap-1.5 text-sm text-green-700">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
            <span class="font-semibold">ชำระเงินเรียบร้อยแล้ว</span>
            <SubmissionPaymentStatusBadge :status="submission.paymentStatus" class="ml-auto" />
          </div>
          <div v-if="submission.receiptName || submission.receiptTaxId || submission.receiptAddress" class="bg-white rounded-lg p-3 text-sm space-y-1.5 border border-green-100">
            <p class="font-semibold text-gray-700">ข้อมูลใบเสร็จรับเงิน</p>
            <div class="flex justify-between">
              <span class="text-gray-500">ชื่อ</span>
              <span class="font-medium text-gray-900">{{ submission.receiptName || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">เลขประจำตัวผู้เสียภาษี</span>
              <span class="font-mono text-gray-900">{{ submission.receiptTaxId || '-' }}</span>
            </div>
            <div>
              <span class="text-gray-500">ที่อยู่</span>
              <p class="text-gray-900 mt-0.5 whitespace-pre-line">{{ submission.receiptAddress || '-' }}</p>
            </div>
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

        <!-- Upload full paper (passed round 1) -->
        <div v-if="submission.status === 'passed_round1'" class="border border-green-200 rounded-lg p-4 bg-green-50/50">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
              <h3 class="text-sm font-semibold text-green-700">บทคัดย่อได้รับการอนุมัติ — กรุณาส่งบทความฉบับสมบูรณ์</h3>
            </div>
            <UButton color="green" variant="soft" size="xs" @click="openFileEditor">
              อัปโหลดไฟล์
            </UButton>
          </div>
        </div>

        <!-- Revision requested -->
        <div v-if="submission.status === 'passed_round1_with_revisions' || submission.status === 'passed_round2_with_revisions'" class="border border-orange-200 rounded-lg p-4 bg-orange-50/50">
          <div class="flex items-center gap-2 mb-3">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-orange-500" />
            <h3 class="text-sm font-semibold text-orange-700">คณะกรรมการขอให้แก้ไขผลงาน</h3>
          </div>
          <p class="text-sm text-gray-600 mb-4">กรุณาตรวจสอบข้อเสนอแนะจากคณะกรรมการและส่งผลงานที่แก้ไขแล้ว</p>
          <UButton color="orange" variant="soft" @click="navigateTo(`/submissions/${submission.id}/revise`)">
            แก้ไขและส่งผลงาน
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1" />
          </UButton>
        </div>

        <!-- Released review result -->
        <div v-if="submission.releasedResult" class="border border-primary-200 rounded-lg p-4 bg-primary-50/30 space-y-3">
          <h3 class="text-sm font-semibold text-primary-700">ผลการพิจารณาและข้อเสนอแนะ</h3>
          <p v-if="submission.releasedResult.adminNote" class="text-sm text-gray-700 whitespace-pre-line">
            <span class="text-gray-500">หมายเหตุจากเจ้าหน้าที่:</span><br />
            {{ submission.releasedResult.adminNote }}
          </p>
          <div v-if="submission.releasedResult.commentsToAuthor.length">
            <p class="text-xs text-gray-500 mb-2">ความคิดเห็นจากผู้รีวิว</p>
            <p
              v-for="(comment, index) in submission.releasedResult.commentsToAuthor"
              :key="index"
              class="text-sm bg-white rounded p-3 mb-2 whitespace-pre-line"
            >
              ผู้รีวิวคนที่ {{ index + 1 }}: {{ comment }}
            </p>
          </div>
        </div>

        <!-- Revision history -->
        <div v-if="submission.revisions.length > 0">
          <h3 class="text-xs font-semibold text-gray-600 mb-2">ประวัติการแก้ไข / อัปเดตไฟล์</h3>
          <ul class="space-y-2">
            <li v-for="rev in submission.revisions" :key="rev.id" class="flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-sm border-b last:border-0 pb-2 last:pb-0">
              <div>
                <span class="font-medium">ครั้งที่ {{ rev.version }}</span>
                <span class="text-gray-400 ml-2">{{ formatDate(rev.submittedAt) }}</span>
                <p v-if="rev.changelog" class="text-gray-500 text-xs mt-0.5">{{ rev.changelog }}</p>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <UButton
                  v-if="rev.abstractFileUrl"
                  size="2xs"
                  color="gray"
                  variant="soft"
                  icon="i-heroicons-arrow-down-tray"
                  :to="fileLink(rev.abstractFileUrl)"
                  target="_blank"
                >
                  บทคัดย่อ PDF
                </UButton>
                <UButton
                  v-if="rev.abstractWordFileUrl"
                  size="2xs"
                  color="blue"
                  variant="soft"
                  icon="i-heroicons-arrow-down-tray"
                  :to="fileLink(rev.abstractWordFileUrl)"
                  target="_blank"
                >
                  บทคัดย่อ Word
                </UButton>
                <UButton
                  v-if="rev.fullPaperFileUrl"
                  size="2xs"
                  color="gray"
                  variant="soft"
                  icon="i-heroicons-arrow-down-tray"
                  :to="fileLink(rev.fullPaperFileUrl)"
                  target="_blank"
                >
                  ฉบับสมบูรณ์ PDF
                </UButton>
                <UButton
                  v-if="rev.fullPaperWordFileUrl"
                  size="2xs"
                  color="blue"
                  variant="soft"
                  icon="i-heroicons-arrow-down-tray"
                  :to="fileLink(rev.fullPaperWordFileUrl)"
                  target="_blank"
                >
                  ฉบับสมบูรณ์ Word
                </UButton>
                <UButton
                  v-if="!rev.abstractFileUrl && !rev.abstractWordFileUrl && !rev.fullPaperFileUrl && !rev.fullPaperWordFileUrl && rev.fileUrl"
                  size="2xs"
                  color="gray"
                  variant="soft"
                  icon="i-heroicons-arrow-down-tray"
                  :to="fileLink(rev.fileUrl)"
                  target="_blank"
                >
                  ดาวน์โหลดไฟล์
                </UButton>
              </div>
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
