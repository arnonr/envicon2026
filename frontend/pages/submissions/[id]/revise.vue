<script setup lang="ts">
import type { Creator, SubmissionFormData } from '~/components/submission/SubmissionForm.vue';

definePageMeta({ middleware: ['auth', 'role'] });

interface Submission {
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
  round1FileType: "abstract" | "full_paper" | null;
}

const route = useRoute();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { handleApiCall, showError, showSuccess } = useApiError();

const loading = ref(true);
const loadFailed = ref(false);
const saving = ref(false);
const initialCreators = ref<Creator[]>([]);
const submissionFormRef = ref<{ creators: Creator[] } | null>(null);
const round1FileType = ref<"abstract" | "full_paper" | null>(null);
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
const changelog = ref('');
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const done = ref(false);

const headers = computed(() => ({
  Authorization: `Bearer ${authStore.token}`,
}));

const parseCreators = (raw: string | null): Creator[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const isFormValid = computed(() => {
  const values = form.value;
  if (!values.title.trim() || !values.title_en.trim() || !values.abstract.trim() || !values.track || !values.submitterType || !values.educationLevel || !values.presentationFormat) {
    return false;
  }
  return (submissionFormRef.value?.creators ?? initialCreators.value)
    .some(creator => creator.firstName.trim() && creator.lastName.trim());
});

onMounted(async () => {
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: Submission }>(
      `${apiBase}/submissions/${route.params.id}`,
      { headers: headers.value }
    )
  );
  if (error) {
    loading.value = false;
    loadFailed.value = true;
    showError(error);
    return;
  }
  if (data!.data.status !== 'revision_requested') {
    await navigateTo(`/submissions/${route.params.id}`);
    return;
  }

  const submission = data!.data;
  form.value = {
    title: submission.title,
    title_en: submission.titleEn ?? '',
    abstract: submission.abstract ?? '',
    keywords: submission.keywords ?? '',
    track: String(submission.track),
    submitterType: submission.submitterType,
    educationLevel: submission.educationLevel,
    presentationFormat: submission.presentationFormat,
  };
  initialCreators.value = parseCreators(submission.creators);
  round1FileType.value = submission.round1FileType;
  loading.value = false;
});

const submitRevision = async () => {
  if (!selectedFile.value || !isFormValid.value) return;
  uploading.value = true;
  saving.value = true;

  const creators = (submissionFormRef.value?.creators ?? [])
    .filter(creator => creator.firstName.trim() && creator.lastName.trim());
  const { error: updateError } = await handleApiCall(() =>
    $fetch(`${apiBase}/submissions/${route.params.id}`, {
      method: 'PUT',
      headers: headers.value,
      body: {
        title: form.value.title.trim(),
        titleEn: form.value.title_en.trim(),
        abstract: form.value.abstract.trim(),
        keywords: form.value.keywords.trim(),
        creators: JSON.stringify(creators),
        track: parseInt(form.value.track),
        submitterType: form.value.submitterType,
        educationLevel: form.value.educationLevel,
        presentationFormat: form.value.presentationFormat,
      },
    })
  );

  saving.value = false;
  if (updateError) {
    uploading.value = false;
    showError(updateError);
    return;
  }

  const formData = new FormData();
  formData.append('file', selectedFile.value);
  if (changelog.value.trim()) {
    formData.append('changelog', changelog.value.trim());
  }

  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/submissions/${route.params.id}/revise`, {
      method: 'POST',
      headers: headers.value,
      body: formData,
    })
  );

  uploading.value = false;
  if (error) { showError(error); return; }

  showSuccess('ส่งผลงานที่แก้ไขเรียบร้อยแล้ว');
  done.value = true;
};
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-12">
    <NuxtLink
      :to="`/submissions/${route.params.id}`"
      class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6"
    >
      <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
      กลับหน้ารายละเอียด
    </NuxtLink>

    <!-- Success state -->
    <div v-if="loading" class="flex justify-center py-20">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
    </div>

    <UCard v-else-if="loadFailed">
      <div class="text-center py-8 space-y-4">
        <p class="text-sm text-gray-500">ไม่สามารถโหลดข้อมูลผลงานสำหรับแก้ไขได้</p>
        <UButton color="gray" variant="soft" to="/dashboard">กลับแดชบอร์ด</UButton>
      </div>
    </UCard>

    <UCard v-else-if="done">
      <div class="flex flex-col items-center py-8 gap-4 text-center">
        <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
          <UIcon name="i-heroicons-check-circle" class="w-10 h-10 text-primary-600" />
        </div>
        <h2 class="text-xl font-semibold text-gray-900">ส่งผลงานที่แก้ไขเรียบร้อยแล้ว</h2>
        <p class="text-sm text-gray-500">คณะกรรมการจะพิจารณาผลงานที่แก้ไขของคุณโดยเร็ว</p>
        <div class="flex gap-3 mt-2">
          <UButton color="gray" variant="soft" :to="`/submissions/${route.params.id}`">ดูรายละเอียด</UButton>
          <UButton color="primary" to="/dashboard">กลับแดชบอร์ด</UButton>
        </div>
      </div>
    </UCard>

    <!-- Revise form -->
    <UCard v-else>
      <template #header>
        <div>
          <h1 class="font-bold text-gray-900">แก้ไขและส่งผลงาน</h1>
          <p class="text-sm text-gray-500 mt-0.5">ปรับปรุงข้อมูลตามข้อเสนอแนะ แล้วแนบไฟล์ PDF ฉบับแก้ไข</p>
        </div>
      </template>

      <div class="space-y-6">
        <SubmissionForm ref="submissionFormRef" v-model="form" :initial-creators="initialCreators" />

        <UDivider />

        <div>
          <p class="text-sm font-medium text-gray-700 mb-2">ไฟล์ผลงานที่แก้ไข (PDF) <span class="text-red-500">*</span></p>
          <p v-if="round1FileType === 'abstract'" class="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md px-3 py-2 mb-3">
            รอบนี้ต้องส่ง<strong>บทความฉบับสมบูรณ์ (Full Paper)</strong>เท่านั้น
          </p>
          <CommonFileUpload
            :loading="uploading"
            :max-size-mb="50"
            @change="selectedFile = $event"
          />
        </div>

        <UFormGroup label="บันทึกการแก้ไข (Changelog)" hint="อธิบายสิ่งที่แก้ไขตามข้อเสนอแนะ">
          <UTextarea
            v-model="changelog"
            placeholder="เช่น แก้ไขตามข้อเสนอแนะของคณะกรรมการ ข้อ 1-3, เพิ่มเติมข้อมูลในส่วนวิธีการวิจัย..."
            :rows="4"
          />
        </UFormGroup>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <UButton color="gray" variant="ghost" :to="`/submissions/${route.params.id}`">
            ยกเลิก
          </UButton>
          <UButton
            color="primary"
            :loading="uploading"
            :disabled="!selectedFile || !isFormValid || saving"
            @click="submitRevision"
          >
            บันทึกและส่งผลงานที่แก้ไข
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
