<script setup lang="ts">
definePageMeta({ middleware: ['auth'] });

interface Submission {
  id: string;
  title: string;
  track: number;
  creators: string | null;
  status: string;
  abstractFileUrl: string | null;
  fullPaperFileUrl: string | null;
  submittedAt: string | null;
  updatedAt: string;
}

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { user, logout } = useAuth();
const { handleApiCall, showError } = useApiError();

const submissions = ref<Submission[]>([]);
const loading = ref(true);

interface Registration {
  id: string;
  type: "student" | "general";
  fee: number;
  paymentStatus: "pending" | "confirmed";
}

const registration = ref<Registration | null>(null);
const regLoading = ref(true);

const selectedSubmissionId = ref<string | null>(null);
const modalOpen = ref(false);

const openSubmissionModal = (id: string) => {
  selectedSubmissionId.value = id;
  modalOpen.value = true;
};

const getCreatorCount = (raw: string | null): number => {
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
};

const TRACK_NAMES: Record<number, string> = {
  1: 'วิทยาศาสตร์สิ่งแวดล้อมฯ',
  2: 'การจัดการระบบนิเวศฯ',
  3: 'เศรษฐกิจหมุนเวียนฯ',
  4: 'การเปลี่ยนแปลงสภาพภูมิอากาศฯ',
  5: 'เทคโนโลยีดิจิทัลฯ',
  6: 'เมืองยั่งยืนฯ',
  7: 'สิ่งแวดล้อมและสุขภาพ',
};

onMounted(async () => {
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: Submission[] }>(`${apiBase}/submissions`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
  );
  loading.value = false;
  if (error) {
    showError(error);
    return;
  }
  submissions.value = data?.data ?? [];

  const { data: regData } = await handleApiCall(() =>
    $fetch<{ success: true; data: Registration }>(`${apiBase}/registrations`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    }),
  );
  regLoading.value = false;
  if (regData) registration.value = regData.data;
});
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p class="text-gray-500">สวัสดี, {{ user?.name }}</p>
      </div>
      <UButton color="gray" variant="ghost" @click="logout">ออกจากระบบ</UButton>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <!-- Account info -->
      <UCard>
        <template #header>
          <h3 class="font-semibold text-sm">ข้อมูลบัญชี</h3>
        </template>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-gray-500">อีเมล</dt>
            <dd class="truncate ml-2">{{ user?.email }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500">เบอร์โทร</dt>
            <dd>{{ user?.phone || '-' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500">สังกัด</dt>
            <dd>{{ user?.affiliation || '-' }}</dd>
          </div>
          <div class="flex justify-between items-center">
            <dt class="text-gray-500">บทบาท</dt>
            <dd>
              <UBadge :color="user?.role === 'admin' ? 'red' : user?.role === 'reviewer' ? 'blue' : 'green'"
                variant="soft" size="xs">
                {{ user?.role }}
              </UBadge>
            </dd>
          </div>
        </dl>
      </UCard>

      <!-- Stats -->
      <UCard class="md:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-sm">ผลงานของฉัน</h3>
            <UButton
              v-if="submissions.length === 0"
              color="primary"
              size="xs"
              to="/submit"
              icon="i-heroicons-plus"
            >
              ส่งผลงานใหม่
            </UButton>
            <span v-else class="text-xs text-gray-400">
              ส่งผลงานได้ 1 ผลงานเท่านั้น
            </span>
          </div>
        </template>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-8">
          <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-gray-400 animate-spin" />
        </div>

        <!-- Empty state -->
        <div v-else-if="submissions.length === 0" class="text-center py-8 text-gray-400">
          <UIcon name="i-heroicons-document-text" class="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p class="text-sm">ยังไม่มีผลงาน</p>
          <UButton color="primary" variant="soft" size="sm" class="mt-3" to="/submit">
            ส่งผลงานแรก
          </UButton>
        </div>

        <!-- List -->
        <div v-else class="space-y-2">
          <div
            v-for="sub in submissions"
            :key="sub.id"
            class="border border-gray-200 rounded-lg p-3 cursor-pointer transition-all hover:border-primary-300 hover:shadow-sm hover:bg-primary-50/50"
            @click="openSubmissionModal(sub.id)"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-900 line-clamp-1">
                  {{ sub.title }}
                </p>
                <p class="text-xs text-gray-400 mt-0.5">
                  ประเภท {{ TRACK_NAMES[sub.track] || sub.track }}
                  <template v-if="getCreatorCount(sub.creators)"> · ผู้สร้างสรรค์ {{ getCreatorCount(sub.creators) }} คน</template>
                </p>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <SubmissionStatusBadge :status="sub.status" />
                <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Registration -->
    <UCard class="mb-8">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-sm">การลงทะเบียนเข้าร่วมงาน</h3>
          <NuxtLink v-if="!registration" to="/registration" class="text-xs text-primary-600 hover:underline">
            ลงทะเบียน
          </NuxtLink>
        </div>
      </template>
      <div v-if="regLoading" class="flex justify-center py-4">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 text-gray-400 animate-spin" />
      </div>
      <div v-else-if="registration" class="flex items-center justify-between text-sm">
        <div>
          <p>
            {{ registration.type === "student" ? "นิสิต/นักศึกษา" : "อาจารย์/นักวิจัย/บุคคลทั่วไป" }}
            — {{ registration.fee.toLocaleString() }} บาท
          </p>
        </div>
        <UBadge :color="registration.paymentStatus === 'confirmed' ? 'green' : 'yellow'" variant="soft" size="xs">
          {{ registration.paymentStatus === "confirmed" ? "ยืนยันแล้ว" : "รอตรวจสอบ" }}
        </UBadge>
      </div>
      <p v-else class="text-sm text-gray-400 text-center py-2">
        ยังไม่ได้ลงทะเบียน
        <NuxtLink to="/registration" class="text-primary-600 hover:underline ml-1">ลงทะเบียนเลย</NuxtLink>
      </p>
    </UCard>

    <!-- Submission Detail Modal -->
    <SubmissionDetailModal
      v-model="modalOpen"
      :submission-id="selectedSubmissionId"
    />

    <!-- Quick links -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UCard class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateTo('/guidelines')">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
            <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-accent-600" />
          </div>
          <div>
            <p class="font-medium text-sm">คู่มือการส่งผลงาน</p>
            <p class="text-xs text-gray-400">Template และข้อกำหนด</p>
          </div>
        </div>
      </UCard>
      <UCard class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateTo('/important-dates')">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
            <UIcon name="i-heroicons-calendar-days" class="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p class="font-medium text-sm">กำหนดการสำคัญ</p>
            <p class="text-xs text-gray-400">ตรวจสอบวันที่ Deadline</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
