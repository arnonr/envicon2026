<script setup lang="ts">
definePageMeta({ middleware: ["auth", "role"] });

interface Submission {
  id: string;
  title: string;
  titleEn: string | null;
  track: number;
  submitterType: string;
  status: string;
  abstractFileUrl: string | null;
  fullPaperFileUrl: string | null;
  paymentSlipUrl: string | null;
  submittedAt: string | null;
  updatedAt: string;
  authorName: string | null;
  authorEmail: string | null;
  authorAffiliation: string | null;
}

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { user } = useAuth();
const { handleApiCall, showError, showSuccess } = useApiError();

interface AdminStats {
  totalSubmissions: number;
  totalRegistrations: number;
  totalUsers: number;
  totalReviews: number;
  submissionsByStatus: Record<string, number>;
  registrationsByPayment: Record<string, number>;
}

const stats = ref<AdminStats | null>(null);
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const PER_PAGE = 50;

const submissions = ref<Submission[]>([]);
const loading = ref(true);
const filterStatus = ref("");
const filterTrack = ref("");
const updating = ref<Set<string>>(new Set());

const TRACK_NAMES: Record<number, string> = {
  1: "วิทยาศาสตร์สิ่งแวดล้อมฯ",
  2: "การจัดการระบบนิเวศฯ",
  3: "เศรษฐกิจหมุนเวียนฯ",
  4: "การเปลี่ยนแปลงสภาพภูมิอากาศฯ",
  5: "เทคโนโลยีดิจิทัลฯ",
  6: "เมืองยั่งยืนฯ",
  7: "สิ่งแวดล้อมและสุขภาพ",
};

const STATUS_OPTIONS = [
  { value: "", label: "ทั้งหมด" },
  { value: "draft", label: "ร่าง" },
  { value: "pending_payment", label: "รอชำระเงิน" },
  { value: "payment_verifying", label: "รอตรวจสอบการชำระเงิน" },
  { value: "submitted", label: "ส่งแล้ว" },
  { value: "under_review", label: "กำลังพิจารณา" },
  { value: "accepted", label: "ผ่านการพิจารณา" },
  { value: "rejected", label: "ไม่ผ่าน" },
  { value: "revision_requested", label: "ขอแก้ไข" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "gray",
  pending_payment: "orange",
  payment_verifying: "yellow",
  submitted: "blue",
  under_review: "yellow",
  accepted: "green",
  rejected: "red",
  revision_requested: "orange",
};

async function fetchSubmissions() {
  loading.value = true;
  const params = new URLSearchParams();
  if (filterStatus.value) params.set("status", filterStatus.value);
  if (filterTrack.value) params.set("track", filterTrack.value);
  params.set("page", String(currentPage.value));
  params.set("limit", String(PER_PAGE));
  const qs = params.toString();
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: Submission[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(
      `${apiBase}/admin/submissions${qs ? `?${qs}` : ""}`,
      { headers: { Authorization: `Bearer ${authStore.token}` } },
    ),
  );
  loading.value = false;
  if (error) {
    showError(error);
    return;
  }
  submissions.value = data?.data ?? [];
  totalPages.value = data?.meta?.totalPages ?? 1;
  totalItems.value = data?.meta?.total ?? 0;
}

async function updateStatus(id: string, status: string) {
  updating.value.add(id);
  const { error } = await handleApiCall(() =>
    $fetch<{ success: true }>(
      `${apiBase}/admin/submissions/${id}/status`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${authStore.token}` },
        body: { status },
      },
    ),
  );
  updating.value.delete(id);
  if (error) {
    showError(error);
    return;
  }
  showSuccess("อัปเดตสถานะสำเร็จ");
  fetchSubmissions();
}

async function fetchStats() {
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: AdminStats }>(
      `${apiBase}/admin/stats`,
      { headers: { Authorization: `Bearer ${authStore.token}` } },
    ),
  );
  if (!error && data) {
    stats.value = data.data;
  }
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchSubmissions();
}

watch([filterStatus, filterTrack], () => {
  currentPage.value = 1;
  fetchSubmissions();
});
onMounted(() => {
  fetchStats();
  fetchSubmissions();
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">แผงผู้ดูแลระบบ</h1>
        <p class="text-gray-500">สวัสดี, {{ user?.name }}</p>
      </div>
      <UButton color="gray" variant="ghost" @click="navigateTo('/')">กลับหน้าแรก</UButton>
    </div>

    <!-- Admin nav cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <UCard class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateTo('/admin/registrations')">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <UIcon name="i-heroicons-clipboard-document-check" class="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p class="font-medium text-sm">จัดการการลงทะเบียน</p>
            <p class="text-xs text-gray-400">ตรวจสอบการชำระเงิน</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Summary Stats -->
    <div v-if="stats" class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <UCard>
        <div class="text-center">
          <p class="text-3xl font-bold text-emerald-600">{{ stats.totalSubmissions }}</p>
          <p class="text-xs text-gray-500 mt-1">ผลงานที่ส่ง</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-3xl font-bold text-blue-600">{{ stats.totalRegistrations }}</p>
          <p class="text-xs text-gray-500 mt-1">การลงทะเบียน</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-3xl font-bold text-purple-600">{{ stats.totalUsers }}</p>
          <p class="text-xs text-gray-500 mt-1">ผู้ใช้งาน</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-3xl font-bold text-amber-600">{{ stats.totalReviews }}</p>
          <p class="text-xs text-gray-500 mt-1">รายงานการรีวิว</p>
        </div>
      </UCard>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-6">
      <USelectMenu
        v-model="filterStatus"
        :options="STATUS_OPTIONS"
        value-attribute="value"
        option-attribute="label"
        placeholder="สถานะ"
        size="sm"
        class="w-48"
      />
      <USelectMenu
        v-model="filterTrack"
        :options="[
          { value: '', label: 'ทุกหัวข้อ' },
          ...Object.entries(TRACK_NAMES).map(([k, v]) => ({ value: k, label: v })),
        ]"
        value-attribute="value"
        option-attribute="label"
        placeholder="หัวข้อ"
        size="sm"
        class="w-56"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
    </div>

    <!-- Empty -->
    <div v-else-if="submissions.length === 0" class="text-center py-12 text-gray-400">
      <p>ไม่มีผลงาน</p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b text-left">
            <th class="py-3 px-3">ผลงาน</th>
            <th class="py-3 px-3">ผู้ส่ง</th>
            <th class="py-3 px-3 text-center">หัวข้อ</th>
            <th class="py-3 px-3 text-center">ประเภท</th>
            <th class="py-3 px-3 text-center">สถานะ</th>
            <th class="py-3 px-3 text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="sub in submissions"
            :key="sub.id"
            class="border-b last:border-0 hover:bg-gray-50"
          >
            <td class="py-3 px-3">
              <p class="font-medium line-clamp-1">{{ sub.title }}</p>
              <p v-if="sub.titleEn" class="text-xs text-gray-400 line-clamp-1">{{ sub.titleEn }}</p>
            </td>
            <td class="py-3 px-3">
              <p class="text-gray-700">{{ sub.authorName || "-" }}</p>
              <p class="text-xs text-gray-400">{{ sub.authorEmail || "-" }}</p>
            </td>
            <td class="py-3 px-3 text-center text-gray-500">
              {{ TRACK_NAMES[sub.track] || sub.track }}
            </td>
            <td class="py-3 px-3 text-center text-gray-500">
              {{ sub.submitterType === "student" ? "นิสิต/นักศึกษา" : "ทั่วไป" }}
            </td>
            <td class="py-3 px-3 text-center">
              <UBadge :color="(STATUS_COLORS[sub.status] || 'gray') as any" variant="soft" size="xs">
                {{ STATUS_OPTIONS.find((s) => s.value === sub.status)?.label || sub.status }}
              </UBadge>
            </td>
            <td class="py-3 px-3 text-center">
              <UButton
                v-if="sub.status === 'payment_verifying'"
                color="green"
                size="xs"
                :loading="updating.has(sub.id)"
                @click="updateStatus(sub.id, 'submitted')"
              >
                อนุมัติ
              </UButton>
              <UButton
                v-else-if="sub.status === 'submitted'"
                color="yellow"
                size="xs"
                :loading="updating.has(sub.id)"
                @click="updateStatus(sub.id, 'under_review')"
              >
                ส่งพิจารณา
              </UButton>
              <div v-else-if="sub.status === 'under_review'" class="flex gap-1 justify-center">
                <UButton
                  color="green"
                  size="xs"
                  :loading="updating.has(sub.id)"
                  @click="updateStatus(sub.id, 'accepted')"
                >
                  ผ่าน
                </UButton>
                <UButton
                  color="red"
                  size="xs"
                  :loading="updating.has(sub.id)"
                  @click="updateStatus(sub.id, 'rejected')"
                >
                  ไม่ผ่าน
                </UButton>
                <UButton
                  color="orange"
                  size="xs"
                  :loading="updating.has(sub.id)"
                  @click="updateStatus(sub.id, 'revision_requested')"
                >
                  แก้ไข
                </UButton>
              </div>
              <span v-else class="text-gray-300 text-xs">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 px-3">
      <p class="text-sm text-gray-500">
        แสดง {{ (currentPage - 1) * PER_PAGE + 1 }}-{{ Math.min(currentPage * PER_PAGE, totalItems) }} จาก {{ totalItems }} รายการ
      </p>
      <div class="flex gap-1">
        <UButton
          size="xs"
          color="gray"
          variant="soft"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          ก่อนหน้า
        </UButton>
        <template v-for="p in totalPages" :key="p">
          <UButton
            v-if="p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1"
            size="xs"
            :color="p === currentPage ? 'primary' : 'gray'"
            :variant="p === currentPage ? 'solid' : 'soft'"
            @click="goToPage(p)"
          >
            {{ p }}
          </UButton>
          <span v-else-if="Math.abs(p - currentPage) === 2" class="px-1 text-gray-400 text-xs self-end">...</span>
        </template>
        <UButton
          size="xs"
          color="gray"
          variant="soft"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          ถัดไป
        </UButton>
      </div>
    </div>
  </div>
</template>
