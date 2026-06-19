<script setup lang="ts">
definePageMeta({ middleware: ["auth", "role"] });

interface ReviewDetail {
  id: string;
  status: "sent" | "in_progress" | "completed";
  recommendation: "accept" | "reject" | "revise" | null;
  commentsToAuthor: string | null;
  commentsToEditor: string | null;
  dueAt: string | null;
  roundNumber: number;
  title: string;
  titleEn: string | null;
  abstract: string | null;
  keywords: string | null;
  track: number;
  abstractFileUrl: string | null;
  fullPaperFileUrl: string | null;
  authorName?: string | null;
  authorEmail?: string | null;
  authorAffiliation?: string | null;
}

const route = useRoute();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { handleApiCall, showError, showSuccess } = useApiError();
const headers = computed(() => authStore.token ? { Authorization: `Bearer ${authStore.token}` } : undefined);
const review = ref<ReviewDetail | null>(null);
const loading = ref(true);
const saving = ref(false);
const form = reactive({
  recommendation: "" as "" | "accept" | "reject" | "revise",
  commentsToAuthor: "",
  commentsToEditor: "",
});
const recommendationOptions = [
  { value: "accept", label: "ผ่านการพิจารณา" },
  { value: "reject", label: "ไม่ผ่าน" },
  { value: "revise", label: "ขอแก้ไข" },
];

async function fetchReview() {
  if (!authStore.initialized) {
    authStore.loadFromStorage();
  }
  if (!authStore.token) {
    loading.value = false;
    await navigateTo(`/auth/login?redirect=${encodeURIComponent(route.fullPath)}`);
    return;
  }

  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: ReviewDetail }>(`${apiBase}/reviews/${route.params.id}`, { headers: headers.value }),
  );
  loading.value = false;
  if (error) return showError(error);
  review.value = data!.data;
  form.recommendation = review.value.recommendation ?? "";
  form.commentsToAuthor = review.value.commentsToAuthor ?? "";
  form.commentsToEditor = review.value.commentsToEditor ?? "";
}

async function saveDraft() {
  saving.value = true;
  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/reviews/${route.params.id}/draft`, {
      method: "PUT",
      headers: headers.value,
      body: {
        recommendation: form.recommendation || undefined,
        commentsToAuthor: form.commentsToAuthor || undefined,
        commentsToEditor: form.commentsToEditor || undefined,
      },
    }),
  );
  saving.value = false;
  if (error) return showError(error);
  showSuccess("บันทึกร่างเรียบร้อย");
  await fetchReview();
}

async function submitReview() {
  if (!form.recommendation || !form.commentsToAuthor.trim()) {
    showError({ status: 400, error: "กรุณาเลือกผลแนะนำและกรอกข้อเสนอแนะถึงผู้เขียน" });
    return;
  }
  const confirmed = await useModalConfirm({
    title: "ยืนยันการส่งผลประเมิน",
    message: "หลังส่งแล้วจะไม่สามารถแก้ไขได้",
    confirmText: "ส่งผลประเมิน",
    cancelText: "ยกเลิก",
    type: "warning",
  });
  if (!confirmed) return;
  saving.value = true;
  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/reviews/${route.params.id}/submit`, {
      method: "POST",
      headers: headers.value,
      body: {
        recommendation: form.recommendation,
        commentsToAuthor: form.commentsToAuthor,
        commentsToEditor: form.commentsToEditor || undefined,
      },
    }),
  );
  saving.value = false;
  if (error) return showError(error);
  showSuccess("ส่งผลประเมินเรียบร้อย");
  await navigateTo("/reviewer");
}

function fileLink(url: string | null) {
  if (!url) return "";
  return url.startsWith("http") ? url : new URL(apiBase).origin + url;
}

onMounted(fetchReview);
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <NuxtLink to="/reviewer" class="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1">
      <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" /> กลับรายการงานประเมิน
    </NuxtLink>
    <div v-if="loading" class="flex justify-center py-20">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
    </div>
    <template v-else-if="review">
      <div class="flex justify-between gap-4 mb-6">
        <div>
          <h1 class="text-xl font-bold">{{ review.title }}</h1>
          <p v-if="review.titleEn" class="text-gray-500">{{ review.titleEn }}</p>
        </div>
        <UBadge :color="review.status === 'completed' ? 'green' : 'yellow'" variant="soft">
          {{ review.status === "completed" ? "ส่งผลแล้ว" : "รอประเมิน" }}
        </UBadge>
      </div>
      <UCard class="mb-6">
        <dl class="grid sm:grid-cols-2 gap-3 text-sm">
          <div v-if="review.authorName">
            <dt class="text-gray-500">ผู้ส่ง</dt>
            <dd>{{ review.authorName }} ({{ review.authorEmail }})</dd>
          </div>
          <div v-else>
            <dt class="text-gray-500">ผู้ส่ง</dt>
            <dd>ซ่อนชื่อผู้ส่งเพื่อความยุติธรรม (อีเมล: {{ review.authorEmail }})</dd>
          </div>
          <div v-if="review.authorAffiliation">
            <dt class="text-gray-500">สังกัด</dt>
            <dd>{{ review.authorAffiliation }}</dd>
          </div>
          <div v-if="review.keywords" class="sm:col-span-2"><dt class="text-gray-500">คำสำคัญ</dt><dd>{{ review.keywords }}</dd></div>
          <div v-if="review.abstract" class="sm:col-span-2"><dt class="text-gray-500">บทคัดย่อ</dt><dd class="mt-1 whitespace-pre-line">{{ review.abstract }}</dd></div>
        </dl>
        <div class="flex gap-2 mt-4">
          <UButton v-if="review.abstractFileUrl" :to="fileLink(review.abstractFileUrl)" target="_blank" size="xs" color="gray" variant="soft">ไฟล์บทคัดย่อ</UButton>
          <UButton v-if="review.fullPaperFileUrl" :to="fileLink(review.fullPaperFileUrl)" target="_blank" size="xs" color="gray" variant="soft">ไฟล์ฉบับแก้ไข/ฉบับเต็ม</UButton>
        </div>
      </UCard>
      <UCard>
        <template #header><h2 class="font-semibold">แบบประเมิน รอบที่ {{ review.roundNumber }}</h2></template>
        <div class="space-y-4">
          <UFormGroup label="ข้อเสนอแนะผลพิจารณา" required>
            <USelectMenu v-model="form.recommendation" :options="recommendationOptions" value-attribute="value" option-attribute="label" :disabled="review.status === 'completed'" />
          </UFormGroup>
          <UFormGroup label="ความคิดเห็นถึงผู้เขียน" required>
            <UTextarea v-model="form.commentsToAuthor" :rows="5" :disabled="review.status === 'completed'" />
          </UFormGroup>
          <UFormGroup label="ความคิดเห็นถึงเจ้าหน้าที่ (ไม่แสดงแก่ผู้เขียน)">
            <UTextarea v-model="form.commentsToEditor" :rows="4" :disabled="review.status === 'completed'" />
          </UFormGroup>
          <div v-if="review.status !== 'completed'" class="flex gap-2">
            <UButton color="gray" variant="soft" :loading="saving" @click="saveDraft">บันทึกร่าง</UButton>
            <UButton color="primary" :loading="saving" @click="submitReview">ส่งผลประเมิน</UButton>
          </div>
        </div>
      </UCard>
    </template>
  </div>
</template>
