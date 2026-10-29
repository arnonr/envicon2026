<script setup lang="ts">
import {
  type AdminSubmissionFilterState,
  buildAdminSubmissionSearchParams,
  countSecondaryAdminFilters,
  hasActiveAdminSubmissionFilters,
} from "~/utils/admin-submission-filters";

definePageMeta({ middleware: ["auth", "role"] });

interface Submission {
  id: string;
  title: string;
  titleEn: string | null;
  track: number;
  submitterType: string;
  educationLevel: string;
  presentationFormat: string;
  wantsFullPaper: number;
  status: string;
  paymentStatus: 'unpaid' | 'pending_verification' | 'verified' | 'rejected';
  abstractFileUrl: string | null;
  abstractWordFileUrl: string | null;
  fullPaperFileUrl: string | null;
  fullPaperWordFileUrl: string | null;
  round1FileUrl: string | null;
  round1FileType: "abstract" | "full_paper" | null;
  paymentSlipUrl: string | null;
  receiptName: string | null;
  receiptTaxId: string | null;
  receiptAddress: string | null;
  submittedAt: string | null;
  updatedAt: string;
  authorName: string | null;
  authorEmail: string | null;
  authorAffiliation: string | null;
  completedReviewCount: number;
  assignedReviewerCount: number;
  reviewerNames: string[];
}

interface ReviewerDirectoryItem {
  id: string;
  name: string;
  email: string;
  active: boolean;
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
const reviewers = ref<ReviewerDirectoryItem[]>([]);
const loading = ref(true);
const exporting = ref(false);
const showAdvancedFilters = ref(false);

const searchInput = ref("");
const debouncedSearch = ref("");
const filterStatus = ref("");
const filterTrack = ref("");
const paymentStatusFilter = ref<string>("");
const filterPresentationFormat = ref("");
const filterReviewerId = ref("");
const filterSubmitterType = ref("");
const filterEducationLevel = ref("");
const filterWantsFullPaper = ref("");
const filterFileStatus = ref("");

let searchTimer: ReturnType<typeof setTimeout> | null = null;
let suppressFilterWatch = false;

const currentFilterState = computed<AdminSubmissionFilterState>(() => ({
  search: debouncedSearch.value,
  status: filterStatus.value,
  paymentStatus: paymentStatusFilter.value,
  track: filterTrack.value,
  presentationFormat: filterPresentationFormat.value,
  reviewerId: filterReviewerId.value,
  submitterType: filterSubmitterType.value,
  educationLevel: filterEducationLevel.value,
  wantsFullPaper: filterWantsFullPaper.value,
  fileStatus: filterFileStatus.value,
}));

const secondaryActiveCount = computed(() => countSecondaryAdminFilters(currentFilterState.value));
const hasAnyActiveFilter = computed(() =>
  hasActiveAdminSubmissionFilters(currentFilterState.value, searchInput.value),
);

const reviewerOptions = computed(() => [
  { value: "", label: "ผู้รีวิวทั้งหมด (All Reviewers)" },
  { value: "unassigned", label: "ยังไม่ได้กำหนดผู้รีวิว (Unassigned)" },
  ...reviewers.value.map((r) => ({
    value: r.id,
    label: r.active ? r.name : `${r.name} (ปิดใช้งาน)`,
  })),
]);

const detailModalOpen = ref(false);
const detailSubmissionId = ref<string | null>(null);

function openDetail(id: string) {
  detailSubmissionId.value = id;
  detailModalOpen.value = true;
}

function onDetailStatusChanged() {
  fetchSubmissions();
  fetchStats();
}

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
  { value: "", label: "ทั้งหมด (สถานะ) (All Status)" },
  { value: "draft", label: "ร่าง (Draft)" },
  { value: "submitted_round1", label: "ส่งรอบที่ 1 แล้ว (Round 1 Submitted)" },
  { value: "under_review_round1", label: "อยู่ระหว่างรีวิวรอบที่ 1 (Round 1 Under Review)" },
  { value: "passed_round1", label: "ผ่านรอบที่ 1 (Round 1 Passed)" },
  { value: "passed_round1_with_revisions", label: "ผ่านรอบที่ 1 แบบมีข้อแก้ไข (Round 1 Passed with Revisions)" },
  { value: "rejected_round1", label: "ไม่ผ่านรอบที่ 1 (Round 1 Rejected)" },
  { value: "submitted_round2", label: "ส่งรอบที่ 2 แล้ว (Round 2 Submitted)" },
  { value: "under_review_round2", label: "อยู่ระหว่างรีวิวรอบที่ 2 (Round 2 Under Review)" },
  { value: "passed_round2", label: "ผ่านรอบที่ 2 (Round 2 Passed)" },
  { value: "passed_round2_with_revisions", label: "ผ่านรอบที่ 2 แบบมีข้อแก้ไข (Round 2 Passed with Revisions)" },
  { value: "rejected_round2", label: "ไม่ผ่านรอบที่ 2 (Round 2 Rejected)" },
];

const PAYMENT_OPTIONS = [
  { value: "", label: "ทั้งหมด (การชำระเงิน)" },
  { value: "unpaid", label: "ยังไม่ชำระ (Unpaid)" },
  { value: "pending_verification", label: "รอตรวจสอบ (Pending Verification)" },
  { value: "verified", label: "ชำระแล้ว (Verified)" },
  { value: "rejected", label: "ปฏิเสธ (Rejected)" },
];

const PRESENTATION_FORMAT_OPTIONS = [
  { value: "", label: "ทั้งหมด (รูปแบบนำเสนอ)" },
  { value: "oral", label: "แบบบรรยาย (Oral)" },
  { value: "poster", label: "โปสเตอร์ (Poster)" },
];

const SUBMITTER_TYPE_OPTIONS = [
  { value: "", label: "ทั้งหมด (ประเภทผู้ส่ง)" },
  { value: "student", label: "นิสิต/นักศึกษา" },
  { value: "general", label: "อาจารย์/นักวิจัย/บุคคลทั่วไป" },
];

const EDUCATION_LEVEL_OPTIONS = [
  { value: "", label: "ทั้งหมด (ระดับการศึกษา)" },
  { value: "bachelor", label: "ปริญญาตรี" },
  { value: "master", label: "ปริญญาโท" },
  { value: "doctorate", label: "ปริญญาเอก" },
];

const WANTS_FULL_PAPER_OPTIONS = [
  { value: "", label: "ทั้งหมด (ความประสงค์)" },
  { value: "1", label: "ต้องการส่ง Full Paper" },
  { value: "0", label: "ส่งเฉพาะบทคัดย่อ" },
];

const FILE_STATUS_OPTIONS = [
  { value: "", label: "ทั้งหมด (สถานะไฟล์แนบ)" },
  { value: "has_abstract", label: "มีไฟล์บทคัดย่อ" },
  { value: "has_full_paper", label: "มีไฟล์ฉบับสมบูรณ์" },
  { value: "missing_full_paper", label: "ประสงค์ Full Paper แต่ยังไม่มีไฟล์" },
  { value: "no_files", label: "ยังไม่มีไฟล์แนบเลย" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "gray",
  submitted_round1: "blue",
  under_review_round1: "amber",
  passed_round1: "green",
  passed_round1_with_revisions: "teal",
  rejected_round1: "red",
  submitted_round2: "blue",
  under_review_round2: "amber",
  passed_round2: "emerald",
  passed_round2_with_revisions: "teal",
  rejected_round2: "red",
};

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function educationLabel(v: string): string {
  return ({ bachelor: 'ปริญญาตรี', master: 'ปริญญาโท', doctorate: 'ปริญญาเอก' } as Record<string, string>)[v] ?? v;
}

function presentationFormatLabel(v: string): string {
  return ({ oral: 'แบบบรรยาย', poster: 'โปสเตอร์' } as Record<string, string>)[v] ?? v;
}

function fileHref(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  try { return new URL(apiBase).origin + url; } catch { return url; }
}

function abstractFileHref(sub: Submission): string | null {
  if (sub.abstractFileUrl) return fileHref(sub.abstractFileUrl);
  if (sub.round1FileUrl && sub.round1FileType !== "full_paper") return fileHref(sub.round1FileUrl);
  return null;
}

function fullPaperFileHref(sub: Submission): string | null {
  if (sub.fullPaperFileUrl) return fileHref(sub.fullPaperFileUrl);
  if (sub.round1FileUrl && sub.round1FileType === "full_paper") return fileHref(sub.round1FileUrl);
  return null;
}

function reviewProgressLabel(submission: Submission) {
  if (submission.assignedReviewerCount === 0) return "0";
  return `${submission.completedReviewCount}/${submission.assignedReviewerCount}`;
}

async function fetchSubmissions() {
  loading.value = true;
  const params = buildAdminSubmissionSearchParams(currentFilterState.value);
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

async function fetchReviewers() {
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: ReviewerDirectoryItem[] }>(
      `${apiBase}/admin/reviewers`,
      { headers: { Authorization: `Bearer ${authStore.token}` } },
    ),
  );
  if (!error && data) {
    reviewers.value = data.data;
  }
}

function flushSearchNow() {
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
  debouncedSearch.value = searchInput.value.trim();
}

async function clearSearchInput() {
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
  suppressFilterWatch = true;
  searchInput.value = "";
  await nextTick();
  suppressFilterWatch = false;
  if (debouncedSearch.value !== "") {
    debouncedSearch.value = "";
  }
}

async function clearAllFilters() {
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
  const hadAppliedFilter = hasActiveAdminSubmissionFilters(currentFilterState.value, "");
  suppressFilterWatch = true;
  searchInput.value = "";
  debouncedSearch.value = "";
  filterStatus.value = "";
  paymentStatusFilter.value = "";
  filterTrack.value = "";
  filterPresentationFormat.value = "";
  filterReviewerId.value = "";
  filterSubmitterType.value = "";
  filterEducationLevel.value = "";
  filterWantsFullPaper.value = "";
  filterFileStatus.value = "";
  await nextTick();
  suppressFilterWatch = false;
  if (hadAppliedFilter || currentPage.value !== 1) {
    currentPage.value = 1;
    await fetchSubmissions();
  }
}

async function exportSubmissions() {
  if (searchTimer) {
    flushSearchNow();
  }
  exporting.value = true;
  const params = buildAdminSubmissionSearchParams({
    ...currentFilterState.value,
    search: searchInput.value.trim(),
  });
  const qs = params.toString();
  const { data, error } = await handleApiCall(() =>
    $fetch<Blob>(`${apiBase}/admin/submissions/export${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
      responseType: "blob",
    }),
  );
  exporting.value = false;
  if (error) {
    showError(error);
    return;
  }
  if (!data) return;

  const objectUrl = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `envicon-submissions-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
  showSuccess("ดาวน์โหลดไฟล์ Excel สำเร็จ");
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchSubmissions();
}

async function refreshOnFocus() {
  await Promise.all([fetchSubmissions(), fetchStats(), fetchReviewers()]);
}

watch(searchInput, (val) => {
  if (suppressFilterWatch) return;
  if (searchTimer) clearTimeout(searchTimer);
  const trimmed = val.trim();
  if (!trimmed && !debouncedSearch.value) return;
  searchTimer = setTimeout(() => {
    searchTimer = null;
    debouncedSearch.value = trimmed;
  }, 300);
});

watch(
  [
    debouncedSearch,
    filterStatus,
    paymentStatusFilter,
    filterTrack,
    filterPresentationFormat,
    filterReviewerId,
    filterSubmitterType,
    filterEducationLevel,
    filterWantsFullPaper,
    filterFileStatus,
  ],
  () => {
    if (suppressFilterWatch) return;
    currentPage.value = 1;
    fetchSubmissions();
  },
);

onMounted(() => {
  fetchStats();
  fetchReviewers();
  fetchSubmissions();
  window.addEventListener("focus", refreshOnFocus);
});
onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer);
  window.removeEventListener("focus", refreshOnFocus);
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
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <UCard class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateTo('/admin/registrations')">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <UIcon name="i-heroicons-clipboard-document-check" class="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p class="font-medium text-sm">จัดการข้อมูลผู้ลงทะเบียนเข้าร่วมงาน</p>
            <p class="text-xs text-gray-400">ตรวจสอบข้อมูลผู้เข้าร่วมงาน</p>
          </div>
        </div>
      </UCard>
      <UCard class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateTo('/admin')">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
            <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <p class="font-medium text-sm">จัดการผลงาน</p>
            <p class="text-xs text-gray-400">ดูและจัดการสถานะผลงาน</p>
          </div>
        </div>
      </UCard>
      <UCard class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateTo('/admin/reviewers')">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p class="font-medium text-sm">จัดการผู้รีวิว</p>
            <p class="text-xs text-gray-400">กำหนดผู้ประเมินและความเชี่ยวชาญ</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Summary Stats -->
    <div v-if="stats" class="grid grid-cols-3 sm:grid-cols-3 gap-4 mb-8">
      <UCard>
        <div class="text-center">
          <p class="text-3xl font-bold text-emerald-600">{{ stats.totalSubmissions }}</p>
          <p class="text-xs text-gray-500 mt-1">ผลงานที่ส่ง</p>
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
    <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
      <div class="flex flex-wrap items-center gap-3">
        <UInput
          v-model="searchInput"
          icon="i-heroicons-magnifying-glass"
          placeholder="ค้นหาชื่อผลงาน, ผู้ส่ง, อีเมล, ผู้แต่งร่วม..."
          size="sm"
          class="w-full sm:w-72 lg:w-80"
          :ui="{ icon: { trailing: { pointer: '' } } }"
          @keydown.enter.prevent="flushSearchNow"
        >
          <template #trailing>
            <UButton
              v-show="searchInput !== ''"
              color="gray"
              variant="link"
              icon="i-heroicons-x-mark-20-solid"
              :padded="false"
              @click="clearSearchInput"
            />
          </template>
        </UInput>

        <USelectMenu
          v-model="filterStatus"
          :options="STATUS_OPTIONS"
          value-attribute="value"
          option-attribute="label"
          placeholder="สถานะ (Status)"
          size="sm"
          class="w-full sm:w-48"
        />

        <USelectMenu
          v-model="paymentStatusFilter"
          :options="PAYMENT_OPTIONS"
          value-attribute="value"
          option-attribute="label"
          placeholder="การชำระเงิน (Payment)"
          size="sm"
          class="w-full sm:w-44"
        />

        <USelectMenu
          v-model="filterTrack"
          :options="[
            { value: '', label: 'ทุกหัวข้อ (All Tracks)' },
            ...Object.entries(TRACK_NAMES).map(([k, v]) => ({ value: k, label: v })),
          ]"
          value-attribute="value"
          option-attribute="label"
          placeholder="หัวข้อ (Track)"
          size="sm"
          class="w-full sm:w-52"
        />

        <USelectMenu
          v-model="filterPresentationFormat"
          :options="PRESENTATION_FORMAT_OPTIONS"
          value-attribute="value"
          option-attribute="label"
          placeholder="รูปแบบการนำเสนอ"
          size="sm"
          class="w-full sm:w-44"
        />

        <USelectMenu
          v-model="filterReviewerId"
          :options="reviewerOptions"
          value-attribute="value"
          option-attribute="label"
          searchable
          searchable-placeholder="ค้นหาชื่อผู้รีวิว..."
          placeholder="ผู้รีวิว (Reviewer)"
          size="sm"
          class="w-full sm:w-56"
        />
      </div>

      <div
        v-if="showAdvancedFilters"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-100"
      >
        <USelectMenu
          v-model="filterSubmitterType"
          :options="SUBMITTER_TYPE_OPTIONS"
          value-attribute="value"
          option-attribute="label"
          placeholder="ประเภทผู้ส่ง"
          size="sm"
        />

        <USelectMenu
          v-model="filterEducationLevel"
          :options="EDUCATION_LEVEL_OPTIONS"
          value-attribute="value"
          option-attribute="label"
          placeholder="ระดับการศึกษา"
          size="sm"
        />

        <USelectMenu
          v-model="filterWantsFullPaper"
          :options="WANTS_FULL_PAPER_OPTIONS"
          value-attribute="value"
          option-attribute="label"
          placeholder="ความประสงค์ Full Paper"
          size="sm"
        />

        <USelectMenu
          v-model="filterFileStatus"
          :options="FILE_STATUS_OPTIONS"
          value-attribute="value"
          option-attribute="label"
          placeholder="สถานะไฟล์แนบ"
          size="sm"
        />
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
        <div class="flex items-center gap-2">
          <UButton
            size="xs"
            :color="showAdvancedFilters || secondaryActiveCount > 0 ? 'primary' : 'gray'"
            :variant="showAdvancedFilters || secondaryActiveCount > 0 ? 'soft' : 'ghost'"
            icon="i-heroicons-adjustments-horizontal"
            @click="showAdvancedFilters = !showAdvancedFilters"
          >
            <span>ตัวกรองเพิ่มเติม</span>
            <UBadge
              v-if="secondaryActiveCount > 0"
              color="primary"
              variant="solid"
              size="xs"
              class="ml-1"
            >
              {{ secondaryActiveCount }}
            </UBadge>
          </UButton>

          <UButton
            v-if="hasAnyActiveFilter"
            size="xs"
            color="red"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="clearAllFilters"
          >
            ล้างตัวกรอง
          </UButton>
        </div>

        <div class="flex items-center gap-3">
          <p v-if="!loading" class="text-sm text-gray-500">
            พบผลงาน <span class="font-semibold text-gray-700">{{ totalItems.toLocaleString() }}</span> รายการ
          </p>
          <UButton
            color="gray"
            variant="soft"
            size="sm"
            icon="i-heroicons-arrow-path"
            :loading="loading"
            @click="refreshOnFocus"
          >
            รีเฟรช
          </UButton>
          <UButton
            color="green"
            variant="soft"
            size="sm"
            icon="i-heroicons-arrow-down-tray"
            :loading="exporting"
            :disabled="loading || exporting || totalItems === 0"
            @click="exportSubmissions"
          >
            Export Excel
          </UButton>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
    </div>

    <!-- Empty -->
    <div v-else-if="submissions.length === 0" class="text-center py-12 text-gray-400 space-y-2">
      <p>{{ hasAnyActiveFilter ? "ไม่พบผลงานที่ตรงกับเงื่อนไขการค้นหา" : "ไม่มีผลงาน" }}</p>
      <UButton
        v-if="hasAnyActiveFilter"
        size="xs"
        color="gray"
        variant="soft"
        @click="clearAllFilters"
      >
        ล้างตัวกรองทั้งหมด
      </UButton>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b text-left">
            <th class="py-3 px-3">ผลงาน</th>
            <th class="py-3 px-3">ผู้ส่ง</th>
            <th class="py-3 px-3 text-center">วันที่ส่ง</th>
            <th class="py-3 px-3 text-center">หัวข้อ</th>
            <th class="py-3 px-3 text-center">ประเภท</th>
            <th class="py-3 px-3 text-center">ระดับการศึกษา</th>
            <th class="py-3 px-3 text-center">รูปแบบการนำเสนอ</th>
            <th class="py-3 px-3 text-center">ความประสงค์</th>
            <th class="py-3 px-3 text-center">การรีวิวของกรรมการ</th>
            <th class="py-3 px-3 text-center">สถานะ</th>
            <th class="py-3 px-3 text-center">ไฟล์บทคัดย่อ</th>
            <th class="py-3 px-3 text-center">ไฟล์ฉบับสมบูรณ์</th>
            <th class="py-3 px-3 text-center">การชำระเงิน</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="sub in submissions"
            :key="sub.id"
            class="border-b last:border-0 hover:bg-gray-50"
          >
            <td class="py-3 px-3">
              <button class="text-left" @click="openDetail(sub.id)">
                <p class="font-medium line-clamp-1 text-primary-600 hover:text-primary-700 hover:underline">{{ sub.title }}</p>
                <p v-if="sub.titleEn" class="text-xs text-gray-400 line-clamp-1">{{ sub.titleEn }}</p>
              </button>
            </td>
            <td class="py-3 px-3">
              <p class="text-gray-700">{{ sub.authorName || "-" }}</p>
              <p class="text-xs text-gray-400">{{ sub.authorEmail || "-" }}</p>
            </td>
            <td class="py-3 px-3 text-center text-gray-500">
              {{ formatDate(sub.submittedAt) }}
            </td>
            <td class="py-3 px-3 text-center text-gray-500">
              {{ TRACK_NAMES[sub.track] || sub.track }}
            </td>
            <td class="py-3 px-3 text-center text-gray-500">
              {{ sub.submitterType === "student" ? "นิสิต/นักศึกษา" : "ทั่วไป" }}
            </td>
            <td class="py-3 px-3 text-center text-gray-500">
              {{ educationLabel(sub.educationLevel) }}
            </td>
            <td class="py-3 px-3 text-center text-gray-500">
              {{ presentationFormatLabel(sub.presentationFormat) }}
            </td>
            <td class="py-3 px-3 text-center">
              <UBadge :color="sub.wantsFullPaper ? 'blue' : 'gray'" variant="soft" size="xs">
                {{ sub.wantsFullPaper ? 'ต้องการ Full Paper' : 'เฉพาะบทคัดย่อ' }}
              </UBadge>
            </td>
            <td class="py-3 px-3 text-center">
              <p class="text-gray-700 font-medium">{{ reviewProgressLabel(sub) }}</p>
              <p
                v-if="sub.reviewerNames?.length"
                class="text-xs text-gray-500 line-clamp-2 max-w-[11rem] mx-auto mt-0.5"
                :title="sub.reviewerNames.join(', ')"
              >
                {{ sub.reviewerNames.join(", ") }}
              </p>
            </td>
            <td class="py-3 px-3 text-center">
              <UBadge :color="(STATUS_COLORS[sub.status] || 'gray') as any" variant="soft" size="xs">
                {{ STATUS_OPTIONS.find((s) => s.value === sub.status)?.label || sub.status }}
              </UBadge>
            </td>
            <td class="py-3 px-3 text-center">
              <div v-if="abstractFileHref(sub) || sub.abstractWordFileUrl" class="flex items-center justify-center gap-2">
                <a
                  v-if="abstractFileHref(sub)"
                  :href="abstractFileHref(sub) ?? '#'"
                  target="_blank"
                  class="inline-flex items-center gap-0.5 text-primary-600 hover:text-primary-700 hover:underline text-xs"
                  title="ดาวน์โหลดบทคัดย่อ (PDF)"
                >
                  <UIcon name="i-heroicons-document-text" class="w-3.5 h-3.5" />
                  <span>PDF</span>
                </a>
                <a
                  v-if="sub.abstractWordFileUrl"
                  :href="fileHref(sub.abstractWordFileUrl) ?? '#'"
                  target="_blank"
                  class="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-700 hover:underline text-xs"
                  title="ดาวน์โหลดบทคัดย่อ (Word)"
                >
                  <UIcon name="i-heroicons-document" class="w-3.5 h-3.5" />
                  <span>Word</span>
                </a>
              </div>
              <span v-else class="text-xs text-gray-300">—</span>
            </td>
            <td class="py-3 px-3 text-center">
              <div v-if="fullPaperFileHref(sub) || sub.fullPaperWordFileUrl" class="flex items-center justify-center gap-2">
                <a
                  v-if="fullPaperFileHref(sub)"
                  :href="fullPaperFileHref(sub) ?? '#'"
                  target="_blank"
                  class="inline-flex items-center gap-0.5 text-primary-600 hover:text-primary-700 hover:underline text-xs"
                  title="ดาวน์โหลดบทความฉบับสมบูรณ์ (PDF)"
                >
                  <UIcon name="i-heroicons-document-arrow-down" class="w-3.5 h-3.5" />
                  <span>PDF</span>
                </a>
                <a
                  v-if="sub.fullPaperWordFileUrl"
                  :href="fileHref(sub.fullPaperWordFileUrl) ?? '#'"
                  target="_blank"
                  class="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-700 hover:underline text-xs"
                  title="ดาวน์โหลดบทความฉบับสมบูรณ์ (Word)"
                >
                  <UIcon name="i-heroicons-document" class="w-3.5 h-3.5" />
                  <span>Word</span>
                </a>
              </div>
              <span v-else class="text-xs text-gray-300">—</span>
            </td>
            <td class="py-3 px-3 text-center">
              <SubmissionPaymentStatusBadge :status="sub.paymentStatus" />
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
    <!-- Submission detail modal -->
    <AdminSubmissionDetailModal
      v-model="detailModalOpen"
      :submission-id="detailSubmissionId"
      @status-changed="onDetailStatusChanged"
    />
  </div>
</template>
