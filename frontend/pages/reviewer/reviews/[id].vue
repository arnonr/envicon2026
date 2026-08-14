<script setup lang="ts">
definePageMeta({ middleware: ["auth", "role"] });

interface ReviewDetail {
  id: string;
  status: "sent" | "in_progress" | "completed";
  recommendation: "accept" | "reject" | "revise" | null;
  commentsToAuthor: string | null;
  dueAt: string | null;
  roundNumber: number;
  title: string;
  titleEn: string | null;
  abstract: string | null;
  keywords: string | null;
  track: number;
  presentationFormat: "oral" | "poster";
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
});
const recommendationOptions = [
  { value: "accept", label: "ผ่านการพิจารณา (Accept)" },
  { value: "reject", label: "ไม่ผ่าน (Reject)" },
  { value: "revise", label: "ผ่านการพิจารณาแบบแก้ไข" },
];
const TRACK_NAMES: Record<number, string> = {
  1: "วิทยาศาสตร์สิ่งแวดล้อมและการควบคุมมลพิษ",
  2: "การจัดการระบบนิเวศและความหลากหลายทางชีวภาพ",
  3: "เศรษฐกิจหมุนเวียนและการใช้ทรัพยากรอย่างยั่งยืน",
  4: "การเปลี่ยนแปลงสภาพภูมิอากาศและการลดก๊าซเรือนกระจก",
  5: "เทคโนโลยีดิจิทัลและระบบอัจฉริยะเพื่อการติดตามสิ่งแวดล้อม",
  6: "เมืองยั่งยืน อุตสาหกรรมสีเขียว และการจัดการสิ่งแวดล้อม",
  7: "สิ่งแวดล้อมและสุขภาพ",
};

function presentationFormatLabel(value: ReviewDetail["presentationFormat"]) {
  return value === "oral" ? "Oral Presentation" : "Poster Presentation";
}

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
      },
    }),
  );
  saving.value = false;
  if (error) return showError(error);
  showSuccess("ส่งผลประเมินเรียบร้อย");
  await navigateTo("/reviewer");
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
          <div><dt class="text-gray-500">สาขาที่ส่งผลงาน</dt><dd class="mt-1 font-medium">{{ TRACK_NAMES[review.track] ?? review.track }}</dd></div>
          <div><dt class="text-gray-500">รูปแบบการนำเสนอ</dt><dd class="mt-1 font-medium">{{ presentationFormatLabel(review.presentationFormat) }}</dd></div>
          <div v-if="review.abstract" class="sm:col-span-2"><dt class="text-gray-500">บทคัดย่อ</dt><dd class="mt-1 whitespace-pre-line">{{ review.abstract }}</dd></div>
        </dl>
      </UCard>
      <UCard>
        <template #header><h2 class="font-semibold">แบบประเมิน รอบที่ {{ review.roundNumber }}</h2></template>
        <div class="space-y-4">
          <UFormGroup label="ข้อเสนอแนะผลพิจารณา (Recommendation)" required>
            <USelectMenu v-model="form.recommendation" :options="recommendationOptions" value-attribute="value" option-attribute="label" :disabled="review.status === 'completed'" />
          </UFormGroup>
          <UFormGroup label="ความคิดเห็นถึงผู้เขียน (Comments to Author)" required>
            <UTextarea v-model="form.commentsToAuthor" :rows="5" :disabled="review.status === 'completed'" />
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
