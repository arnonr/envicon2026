<script setup lang="ts">
import type { Creator, SubmissionFormData } from '~/components/submission/SubmissionForm.vue';
import type { SelectedSlotFiles } from '~/components/submission/FileSlotsGrid.vue';

definePageMeta({ middleware: ['auth', 'role'] });

interface ReleasedResult {
  decision: "accept" | "reject" | "revise";
  adminNote: string | null;
  releasedAt: string;
  commentsToAuthor: string[];
}

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
  wantsFullPaper: number;
  status: string;
  abstractFileUrl: string | null;
  abstractWordFileUrl: string | null;
  fullPaperFileUrl: string | null;
  fullPaperWordFileUrl: string | null;
  round1FileType: "abstract" | "full_paper" | null;
  releasedResult?: ReleasedResult | null;
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
const releasedResult = ref<ReleasedResult | null>(null);
const submissionFormRef = ref<{ creators: Creator[] } | null>(null);
const currentFiles = reactive({
  abstractFileUrl: null as string | null,
  abstractWordFileUrl: null as string | null,
  fullPaperFileUrl: null as string | null,
  fullPaperWordFileUrl: null as string | null,
});
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
const changelog = ref('');
const selectedFiles = ref<SelectedSlotFiles>({
  abstractPdf: null,
  abstractWord: null,
  fullPaperPdf: null,
  fullPaperWord: null,
});
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
  return Boolean(
    values.title.trim()
    && values.title_en.trim()
    && values.abstract.trim()
    && values.track
    && values.submitterType
    && values.educationLevel
    && values.presentationFormat
  );
});

const hasAnyFile = computed(() =>
  Boolean(
    selectedFiles.value.abstractPdf
    || selectedFiles.value.abstractWord
    || selectedFiles.value.fullPaperPdf
    || selectedFiles.value.fullPaperWord
    || currentFiles.abstractFileUrl
    || currentFiles.abstractWordFileUrl
    || currentFiles.fullPaperFileUrl
    || currentFiles.fullPaperWordFileUrl
  )
);

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
  if (data!.data.status !== 'passed_round1_with_revisions' && data!.data.status !== 'passed_round2_with_revisions') {
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
    wantsFullPaper: Boolean(submission.wantsFullPaper),
  };
  currentFiles.abstractFileUrl = submission.abstractFileUrl;
  currentFiles.abstractWordFileUrl = submission.abstractWordFileUrl;
  currentFiles.fullPaperFileUrl = submission.fullPaperFileUrl;
  currentFiles.fullPaperWordFileUrl = submission.fullPaperWordFileUrl;
  releasedResult.value = submission.releasedResult ?? null;
  initialCreators.value = parseCreators(submission.creators);
  loading.value = false;
});

const submitRevision = async () => {
  if (!hasAnyFile.value || !isFormValid.value) return;
  uploading.value = true;
  saving.value = true;

  const creators = (submissionFormRef.value?.creators ?? [])
    .filter(creator => creator.firstName.trim() && creator.lastName.trim() && creator.affiliation.trim());
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
        wantsFullPaper: form.value.wantsFullPaper,
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
  if (selectedFiles.value.abstractPdf) formData.append('abstractPdf', selectedFiles.value.abstractPdf);
  if (selectedFiles.value.abstractWord) formData.append('abstractWord', selectedFiles.value.abstractWord);
  if (selectedFiles.value.fullPaperPdf) formData.append('fullPaperPdf', selectedFiles.value.fullPaperPdf);
  if (selectedFiles.value.fullPaperWord) formData.append('fullPaperWord', selectedFiles.value.fullPaperWord);
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
          <p class="text-sm text-gray-500 mt-0.5">ปรับปรุงข้อมูลตามข้อเสนอแนะ และเลือกอัปโหลดไฟล์ที่แก้ไข (ช่องที่ไม่ได้เลือกไฟล์ใหม่จะคงไฟล์เดิมไว้)</p>
        </div>
      </template>

      <div class="space-y-6">
        <div
          v-if="releasedResult && (releasedResult.adminNote || releasedResult.commentsToAuthor.length)"
          class="border border-orange-200 rounded-lg p-4 bg-orange-50/50 space-y-2 text-sm"
        >
          <p class="font-semibold text-orange-800 flex items-center gap-1.5">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-orange-600" />
            ข้อเสนอแนะเพื่อการแก้ไขจากคณะกรรมการ
          </p>
          <p v-if="releasedResult.adminNote" class="text-gray-700 whitespace-pre-line">
            <span class="font-medium text-gray-600">หมายเหตุจากคณะกรรมการ:</span> {{ releasedResult.adminNote }}
          </p>
          <div v-if="releasedResult.commentsToAuthor.length" class="space-y-1.5 pt-1">
            <p class="font-medium text-gray-600">ความเห็นจากผู้ทรงคุณวุฒิ:</p>
            <p
              v-for="(comment, index) in releasedResult.commentsToAuthor"
              :key="index"
              class="text-gray-700 bg-white border border-orange-100 rounded p-2.5 whitespace-pre-line"
            >
              {{ comment }}
            </p>
          </div>
        </div>

        <div class="space-y-3">
          <div>
            <p class="text-sm font-medium text-gray-700">ไฟล์ผลงานที่แก้ไข / อัปเดต (Word / PDF)</p>
            <p class="text-xs text-gray-500 mt-0.5">
              สามารถอัปโหลดเฉพาะไฟล์ที่มีการแก้ไขหรือต้องการเพิ่มในรอบนี้ได้ ระบบจะบันทึกเป็น Version ใหม่
            </p>
          </div>
          <SubmissionFileSlotsGrid
            editable
            :loading="uploading"
            :abstract-file-url="currentFiles.abstractFileUrl"
            :abstract-word-file-url="currentFiles.abstractWordFileUrl"
            :full-paper-file-url="currentFiles.fullPaperFileUrl"
            :full-paper-word-file-url="currentFiles.fullPaperWordFileUrl"
            @update:files="selectedFiles = $event"
          />
        </div>

        <UFormGroup label="บันทึกการแก้ไข (Changelog)" hint="อธิบายสิ่งที่แก้ไขตามข้อเสนอแนะ (Describe changes made in response to feedback)">
          <UTextarea
            v-model="changelog"
            placeholder="เช่น แก้ไขตามข้อเสนอแนะของคณะกรรมการ ข้อ 1-3, เพิ่มเติมไฟล์บทความฉบับสมบูรณ์..."
            :rows="4"
          />
        </UFormGroup>

        <UDivider />

        <SubmissionForm ref="submissionFormRef" v-model="form" :initial-creators="initialCreators" />
      </div>

      <template #footer>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <UButton color="gray" variant="ghost" :to="`/submissions/${route.params.id}`">
            ยกเลิก
          </UButton>
          <div class="flex items-center gap-3">
            <span v-if="!isFormValid" class="text-xs text-red-500">กรุณากรอกข้อมูลผลงานที่มีเครื่องหมาย * ให้ครบถ้วน</span>
            <span v-else-if="!hasAnyFile" class="text-xs text-red-500">กรุณาแนบไฟล์อย่างน้อย 1 ไฟล์</span>
            <UButton
              color="primary"
              :loading="uploading"
              :disabled="!hasAnyFile || !isFormValid || saving"
              @click="submitRevision"
            >
              บันทึกและส่งผลงานที่แก้ไข
            </UButton>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>
