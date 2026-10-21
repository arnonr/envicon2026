<script setup lang="ts">
import type { Creator, SubmissionFormData } from '~/components/submission/SubmissionForm.vue';
import type { SelectedSlotFiles } from '~/components/submission/FileSlotsGrid.vue';

definePageMeta({ middleware: ['auth', 'role'] });

interface DraftSubmission {
  id: string;
  status: string;
  title: string;
  titleEn: string | null;
  abstract: string | null;
  keywords: string | null;
  creators: string | null;
  track: number;
  submitterType: string;
  educationLevel: string;
  presentationFormat: string;
  wantsFullPaper: boolean;
  abstractFileUrl?: string | null;
  abstractWordFileUrl?: string | null;
  fullPaperFileUrl?: string | null;
  fullPaperWordFileUrl?: string | null;
  round1FileType: 'abstract' | 'full_paper' | null;
}

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { handleApiCall, showError, showSuccess } = useApiError();
const route = useRoute();

const step = ref<1 | 2 | 3>(1);
const submissionId = ref<string | null>(null);
const submitting = ref(false);
const uploading = ref(false);
const savingDraft = ref(false);
const loadingDraft = ref(false);
const loadFailed = ref(false);
const linkedEventRegistration = ref(false);

const submissionFormRef = ref<{ creators: Creator[] } | null>(null);
const initialCreators = ref<Creator[]>([]);

const form = ref<SubmissionFormData>({
  title: '',
  title_en: '',
  abstract: '',
  keywords: '',
  track: '',
  submitterType: 'student',
  educationLevel: '',
  presentationFormat: '',
  wantsFullPaper: false,
});

const isStep1Valid = computed(() => {
  const f = form.value;
  if (!f.title.trim() || !f.title_en.trim() || !f.abstract.trim() || !f.track || !f.submitterType || !f.educationLevel || !f.presentationFormat) return false;
  const creators = submissionFormRef.value?.creators ?? initialCreators.value;
  return creators.some(c => c.firstName.trim() && c.lastName.trim() && c.affiliation.trim());
});

const parseCreators = (raw: string | null): Creator[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const checkExisting = async () => {
  const { data } = await handleApiCall(() =>
    $fetch<{ success: true; data: any[] }>(`${apiBase}/submissions`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
  );
  if (data?.data?.length) {
    await navigateTo('/dashboard');
  }
};

const headers = computed(() => ({
  Authorization: `Bearer ${authStore.token}`,
}));

const loadDraft = async (id: string) => {
  loadingDraft.value = true;
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: DraftSubmission }>(`${apiBase}/submissions/${id}`, {
      headers: headers.value,
    })
  );
  loadingDraft.value = false;

  if (error || !data) {
    loadFailed.value = true;
    if (error) showError(error);
    return;
  }

  const draft = data.data;
  if (draft.status !== 'draft') {
    await navigateTo(`/submissions/${id}`);
    return;
  }

  submissionId.value = draft.id;
  form.value = {
    title: draft.title ?? '',
    title_en: draft.titleEn ?? '',
    abstract: draft.abstract ?? '',
    keywords: draft.keywords ?? '',
    track: String(draft.track ?? ''),
    submitterType: (draft.submitterType as 'student' | 'general') ?? 'student',
    educationLevel: draft.educationLevel ?? '',
    presentationFormat: draft.presentationFormat ?? '',
    wantsFullPaper: Boolean(draft.wantsFullPaper),
  };
  initialCreators.value = parseCreators(draft.creators);
  if (draft.round1FileType) {
    round1FileType.value = draft.round1FileType;
    step.value = 2;
  }
};

onMounted(async () => {
  const draftId = route.query.id;
  if (typeof draftId === 'string' && draftId) {
    await loadDraft(draftId);
    return;
  }
  await checkExisting();
  const userEmail = authStore.user?.email;
  if (userEmail) {
    try {
      const res = await $fetch<{
        success: true;
        data: {
          foundInEventRegistration: boolean;
          feeType: 'student' | 'general' | null;
        };
      }>(`${apiBase}/public/check-event-registration?email=${encodeURIComponent(userEmail)}`);
      if (res.data.foundInEventRegistration) {
        linkedEventRegistration.value = true;
        if (res.data.feeType) {
          form.value.submitterType = res.data.feeType;
        }
      }
    } catch {
      // Ignore prefill errors
    }
  }
});

const createSubmission = async () => {
  if (!isStep1Valid.value) return;
  submitting.value = true;

  const creators = submissionFormRef.value?.creators ?? initialCreators.value;
  const creatorsJson = JSON.stringify(
    creators.filter(c => c.firstName.trim() && c.lastName.trim() && c.affiliation.trim())
  );

  const body = {
    title: form.value.title.trim(),
    titleEn: form.value.title_en.trim(),
    abstract: form.value.abstract.trim(),
    keywords: form.value.keywords.trim() || undefined,
    creators: creatorsJson,
    track: parseInt(form.value.track),
    submitterType: form.value.submitterType,
    educationLevel: form.value.educationLevel,
    presentationFormat: form.value.presentationFormat,
    wantsFullPaper: form.value.wantsFullPaper,
    ...(submissionId.value && { round1FileType: round1FileType.value }),
  };

  const { data, error } = await handleApiCall(() =>
    submissionId.value
      ? $fetch<{ success: true; data: { id: string } }>(`${apiBase}/submissions/${submissionId.value}`, {
        method: 'PUT',
        headers: headers.value,
        body,
      })
      : $fetch<{ success: true; data: { id: string } }>(`${apiBase}/submissions`, {
        method: 'POST',
        headers: headers.value,
        body,
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

const saveDraft = async () => {
  savingDraft.value = true;

  const creators = submissionFormRef.value?.creators ?? [];
  const creatorsJson = JSON.stringify(
    creators.filter(c => c.firstName.trim() && c.lastName.trim() && c.affiliation.trim())
  );
  const baseBody = {
    title: form.value.title.trim(),
    titleEn: form.value.title_en.trim(),
    abstract: form.value.abstract.trim(),
    keywords: form.value.keywords.trim() || undefined,
    creators: creatorsJson,
    track: parseInt(form.value.track),
    submitterType: form.value.submitterType,
    educationLevel: form.value.educationLevel,
    presentationFormat: form.value.presentationFormat,
    wantsFullPaper: form.value.wantsFullPaper,
  };

  try {
    if (!submissionId.value) {
      const { data, error } = await handleApiCall(() =>
        $fetch<{ success: true; data: { id: string } }>(`${apiBase}/submissions`, {
          method: 'POST',
          headers: headers.value,
          body: baseBody,
        })
      );
      if (error) { showError(error); return; }
      submissionId.value = data!.data.id;
    } else {
      const { error } = await handleApiCall(() =>
        $fetch(`${apiBase}/submissions/${submissionId.value}`, {
          method: 'PUT',
          headers: headers.value,
          body: {
            ...baseBody,
            ...(step.value === 2 && { round1FileType: round1FileType.value }),
          },
        })
      );
      if (error) { showError(error); return; }
    }
    showSuccess('บันทึกแบบร่างเรียบร้อย');
    await navigateTo('/dashboard');
  } finally {
    savingDraft.value = false;
  }
};

const selectedFiles = ref<SelectedSlotFiles>({
  abstractPdf: null,
  abstractWord: null,
  fullPaperPdf: null,
  fullPaperWord: null,
});
const round1FileType = ref<'abstract' | 'full_paper'>('abstract');

const hasAnySelectedFile = computed(() =>
  Boolean(
    selectedFiles.value.abstractPdf
    || selectedFiles.value.abstractWord
    || selectedFiles.value.fullPaperPdf
    || selectedFiles.value.fullPaperWord
  )
);

const onFilesUpdated = (files: SelectedSlotFiles) => {
  selectedFiles.value = files;
};

const uploadInitialFiles = async () => {
  if (!submissionId.value || !hasAnySelectedFile.value) return;
  uploading.value = true;

  const formData = new FormData();
  if (selectedFiles.value.abstractPdf) formData.append('abstractPdf', selectedFiles.value.abstractPdf);
  if (selectedFiles.value.abstractWord) formData.append('abstractWord', selectedFiles.value.abstractWord);
  if (selectedFiles.value.fullPaperPdf) formData.append('fullPaperPdf', selectedFiles.value.fullPaperPdf);
  if (selectedFiles.value.fullPaperWord) formData.append('fullPaperWord', selectedFiles.value.fullPaperWord);

  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/submissions/${submissionId.value}/upload-files`, {
      method: 'POST',
      headers: headers.value,
      body: formData,
    })
  );

  uploading.value = false;

  if (error) {
    showError(error);
    return;
  }

  showSuccess('ส่งไฟล์ผลงานเรียบร้อยแล้ว');
  step.value = 3;
};
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-12">
    <!-- Header -->
    <div class="mb-8">
      <NuxtLink to="/dashboard" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
        กลับแดชบอร์ด
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">ส่งผลงานวิชาการ</h1>
    </div>

    <!-- Steps indicator -->
    <div class="flex items-center gap-2 mb-8">
      <template v-for="n in 3" :key="n">
        <div class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors"
          :class="step >= n ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'">
          {{ n }}
        </div>
        <div v-if="n < 3" class="flex-1 h-0.5" :class="step > n ? 'bg-primary-600' : 'bg-gray-200'" />
      </template>
    </div>
    <div class="flex justify-between text-xs text-gray-500 mb-8 -mt-6">
      <span>ข้อมูลผลงาน</span>
      <span>อัปโหลดไฟล์</span>
      <span>เสร็จสิ้น</span>
    </div>

    <!-- Loading draft -->
    <div v-if="loadingDraft" class="flex justify-center py-20">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
    </div>

    <UCard v-else-if="loadFailed">
      <div class="text-center py-8 space-y-4">
        <p class="text-sm text-gray-500">ไม่สามารถโหลดข้อมูลผลงานเพื่อทำต่อได้</p>
        <UButton color="gray" variant="soft" to="/dashboard">กลับแดชบอร์ด</UButton>
      </div>
    </UCard>

    <template v-else>
    <!-- Step 1: Form -->
    <UCard v-if="step === 1">
      <template #header>
        <h2 class="font-semibold text-gray-900">ขั้นตอนที่ 1: ข้อมูลผลงาน</h2>
      </template>

      <UAlert
        v-if="linkedEventRegistration"
        icon="i-heroicons-check-circle"
        color="blue"
        variant="soft"
        class="mb-4"
        title="พบข้อมูลการลงทะเบียนเข้าร่วมงานเดิมของคุณ"
        description="เมื่อสร้างผลงาน ระบบจะดึงหลักฐานการชำระเงิน (สลิป) และข้อมูลใบเสร็จรับเงินที่คุณเคยแจ้งไว้มาผูกกับผลงานนี้ให้อัตโนมัติ"
      />

      <SubmissionForm ref="submissionFormRef" v-model="form" :initial-creators="initialCreators" />

      <template #footer>
        <div class="flex justify-between">
          <UButton color="gray" variant="ghost" :loading="savingDraft" @click="saveDraft">
            <UIcon name="i-heroicons-bookmark" class="w-4 h-4 mr-1" />
            บันทึกแบบร่าง
          </UButton>
          <UButton color="primary" :loading="submitting" :disabled="!isStep1Valid" @click="createSubmission">
            ถัดไป: อัปโหลดไฟล์
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1" />
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Step 2: Upload -->
    <UCard v-else-if="step === 2">
      <template #header>
        <div>
          <h2 class="font-semibold text-gray-900">ขั้นตอนที่ 2: อัปโหลดไฟล์ผลงาน (Word / PDF)</h2>
          <p class="text-xs text-gray-500 mt-1">
            อัปโหลดไฟล์ที่มีอย่างน้อย 1 ไฟล์เพื่อส่งผลงาน (สามารถเข้ามาอัปโหลดเพิ่มเติมหรืออัปเดตไฟล์ในภายหลังได้)
          </p>
        </div>
      </template>

      <SubmissionFileSlotsGrid
        editable
        :loading="uploading"
        @update:files="onFilesUpdated"
      />

      <template #footer>
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <UButton color="gray" variant="ghost" @click="step = 1">
              <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
              ย้อนกลับ
            </UButton>
            <UButton color="gray" variant="ghost" :loading="savingDraft" @click="saveDraft">
              <UIcon name="i-heroicons-bookmark" class="w-4 h-4 mr-1" />
              บันทึกแบบร่าง
            </UButton>
          </div>
          <div class="flex items-center gap-2">
            <p v-if="!hasAnySelectedFile" class="text-xs text-gray-400">เลือกอย่างน้อย 1 ไฟล์ก่อนส่ง</p>
            <UButton
              v-else
              color="primary"
              :loading="uploading"
              @click="uploadInitialFiles"
            >
              ส่งผลงาน
              <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4 ml-1" />
            </UButton>
          </div>
        </div>
      </template>
    </UCard>

    <!-- Step 3: Success -->
    <UCard v-else>
      <template #header>
        <h2 class="font-semibold text-gray-900">ขั้นตอนที่ 3: ส่งเรียบร้อย</h2>
      </template>

      <div class="flex flex-col items-center py-8 gap-4 text-center">
        <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
          <UIcon name="i-heroicons-check-circle" class="w-10 h-10 text-primary-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900">
          ส่งผลงานเรียบร้อยแล้ว!
        </h3>
        <p class="text-gray-500 text-sm max-w-sm">
          ขณะนี้ผลงานของคุณอยู่ในสถานะ<strong>ส่งแล้ว</strong> รอคณะกรรมการพิจารณา (สามารถอัปเดตไฟล์เพิ่มเติมหรือชำระเงินภายหลังได้จากหน้ารายละเอียดผลงาน)
        </p>
      </div>

      <template #footer>
        <div class="flex justify-center gap-3">
          <UButton color="gray" variant="soft" :to="`/submissions/${submissionId}`">
            ดูรายละเอียด
          </UButton>
          <UButton color="primary" to="/dashboard">
            กลับแดชบอร์ด
          </UButton>
        </div>
      </template>
    </UCard>
    </template>
  </div>
</template>
