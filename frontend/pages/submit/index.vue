<script setup lang="ts">
import type { SubmissionFormData } from '~/components/submission/SubmissionForm.vue';

definePageMeta({ middleware: ['auth', 'role'] });

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { handleApiCall, showError, showSuccess } = useApiError();

const step = ref<1 | 2 | 3>(1);
const submissionId = ref<string | null>(null);
const submitting = ref(false);
const uploading = ref(false);

const submissionFormRef = ref<{ creators: { firstName: string; lastName: string }[] } | null>(null);

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

const isStep1Valid = computed(() => {
  const f = form.value;
  if (!f.title.trim() || !f.title_en.trim() || !f.abstract.trim() || !f.track || !f.submitterType || !f.educationLevel || !f.presentationFormat) return false;
  const creators = submissionFormRef.value?.creators ?? [];
  return creators.some(c => c.firstName.trim() && c.lastName.trim());
});

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

onMounted(() => {
  checkExisting();
});

const createSubmission = async () => {
  if (!isStep1Valid.value) return;
  submitting.value = true;

  const creators = submissionFormRef.value?.creators ?? [];
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
        submitterType: form.value.submitterType,
        educationLevel: form.value.educationLevel,
        presentationFormat: form.value.presentationFormat,
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

const selectedFile = ref<File | null>(null);

const onFileSelected = (file: File) => {
  selectedFile.value = file;
};

const uploadAbstract = async () => {
  if (!submissionId.value || !selectedFile.value) return;
  uploading.value = true;

  const formData = new FormData();
  formData.append('file', selectedFile.value);

  const { data, error } = await handleApiCall(() =>
    $fetch(`${apiBase}/submissions/${submissionId.value}/upload-abstract`, {
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

  showSuccess('ส่งบทคัดย่อเรียบร้อยแล้ว');
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
      <span>อัปโหลด PDF</span>
      <span>เสร็จสิ้น</span>
    </div>

    <!-- Step 1: Form -->
    <UCard v-if="step === 1">
      <template #header>
        <h2 class="font-semibold text-gray-900">ขั้นตอนที่ 1: ข้อมูลผลงาน</h2>
      </template>

      <SubmissionForm ref="submissionFormRef" v-model="form" />

      <template #footer>
        <div class="flex justify-end">
          <UButton color="primary" :loading="submitting" :disabled="!isStep1Valid" @click="createSubmission">
            ถัดไป: อัปโหลด PDF
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1" />
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Step 2: Upload -->
    <UCard v-else-if="step === 2">
      <template #header>
        <h2 class="font-semibold text-gray-900">ขั้นตอนที่ 2: อัปโหลดไฟล์บทคัดย่อ</h2>
      </template>

      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          กรุณาอัปโหลดไฟล์ PDF บทคัดย่อ (Abstract) ขนาดไม่เกิน 50 MB
        </p>
        <CommonFileUpload :loading="uploading" :max-size-mb="50" @change="onFileSelected" />
      </div>

      <template #footer>
        <div class="flex justify-between">
          <UButton color="gray" variant="ghost" @click="step = 1">
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
            ย้อนกลับ
          </UButton>
          <UButton
            v-if="selectedFile"
            color="primary"
            :loading="uploading"
            @click="uploadAbstract"
          >
            บันทึก
            <UIcon name="i-heroicons-check" class="w-4 h-4 ml-1" />
          </UButton>
          <p v-else class="text-xs text-gray-400 self-center">เลือกไฟล์ก่อนบันทึก</p>
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
        <h3 class="text-xl font-semibold text-gray-900">ส่งบทคัดย่อเรียบร้อยแล้ว!</h3>
        <p class="text-gray-500 text-sm max-w-sm">
          ขณะนี้ผลงานของคุณอยู่ในสถานะ<strong>รอชำระเงิน</strong> กรุณาชำระเงินค่าส่งผลงานเพื่อดำเนินการต่อไป
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
  </div>
</template>
