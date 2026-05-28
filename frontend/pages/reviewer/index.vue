<script setup lang="ts">
definePageMeta({ middleware: ["auth", "role"] });

interface ReviewAssignment {
  id: string;
  status: "sent" | "in_progress" | "completed";
  dueAt: string | null;
  completedAt: string | null;
  roundNumber: number;
  title: string;
  titleEn: string | null;
  track: number;
}

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { user } = useAuth();
const { handleApiCall, showError } = useApiError();
const loading = ref(true);
const assignments = ref<ReviewAssignment[]>([]);

const TRACK_NAMES: Record<number, string> = {
  1: "วิทยาศาสตร์สิ่งแวดล้อมฯ",
  2: "การจัดการระบบนิเวศฯ",
  3: "เศรษฐกิจหมุนเวียนฯ",
  4: "การเปลี่ยนแปลงสภาพภูมิอากาศฯ",
  5: "เทคโนโลยีดิจิทัลฯ",
  6: "เมืองยั่งยืนฯ",
  7: "สิ่งแวดล้อมและสุขภาพ",
};
const pending = computed(() => assignments.value.filter((item) => item.status !== "completed"));
const completed = computed(() => assignments.value.filter((item) => item.status === "completed"));

function dueLabel(dueAt: string | null) {
  if (!dueAt) return "-";
  const date = new Date(dueAt);
  const overdue = date.getTime() < Date.now();
  return `${date.toLocaleDateString("th-TH")} ${overdue ? "(เกินกำหนด)" : ""}`;
}

onMounted(async () => {
  if (!authStore.initialized) {
    authStore.loadFromStorage();
  }
  if (!authStore.token) {
    loading.value = false;
    await navigateTo(`/auth/login?redirect=${encodeURIComponent("/reviewer")}`);
    return;
  }

  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: ReviewAssignment[] }>(`${apiBase}/reviews`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    }),
  );
  loading.value = false;
  if (error) return showError(error);
  assignments.value = data!.data;
});
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">งานประเมินผลงาน</h1>
        <p class="text-gray-500">สวัสดี, {{ user?.name }}</p>
      </div>
    </div>
    <div v-if="loading" class="flex justify-center py-16">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
    </div>
    <template v-else>
      <UCard class="mb-6">
        <template #header><h2 class="font-semibold">รอประเมิน / กำลังประเมิน ({{ pending.length }})</h2></template>
        <div v-if="pending.length === 0" class="text-center py-8 text-gray-400">ไม่มีงานที่รอดำเนินการ</div>
        <div v-else class="space-y-3">
          <NuxtLink v-for="item in pending" :key="item.id" :to="`/reviewer/reviews/${item.id}`" class="block border rounded-lg p-4 hover:bg-gray-50">
            <div class="flex justify-between gap-3">
              <div>
                <p class="font-medium">{{ item.title }}</p>
                <p class="text-xs text-gray-500">รอบที่ {{ item.roundNumber }} | {{ TRACK_NAMES[item.track] }}</p>
              </div>
              <div class="text-right">
                <UBadge :color="item.status === 'in_progress' ? 'yellow' : 'blue'" variant="soft">{{ item.status === "in_progress" ? "กำลังกรอก" : "รอประเมิน" }}</UBadge>
                <p class="text-xs text-gray-500 mt-1">กำหนดส่ง {{ dueLabel(item.dueAt) }}</p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </UCard>
      <UCard>
        <template #header><h2 class="font-semibold">ประเมินแล้ว ({{ completed.length }})</h2></template>
        <div v-if="completed.length === 0" class="text-center py-8 text-gray-400">ยังไม่มีผลประเมินที่ส่งแล้ว</div>
        <NuxtLink v-for="item in completed" :key="item.id" :to="`/reviewer/reviews/${item.id}`" class="block border rounded-lg p-4 mb-3 hover:bg-gray-50">
          <div class="flex justify-between">
            <p class="font-medium">{{ item.title }}</p>
            <UBadge color="green" variant="soft">ประเมินแล้ว</UBadge>
          </div>
        </NuxtLink>
      </UCard>
    </template>
  </div>
</template>
