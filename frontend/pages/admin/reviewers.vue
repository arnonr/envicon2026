<script setup lang="ts">
definePageMeta({ middleware: ["auth", "role"] });

interface Reviewer {
  id: string;
  name: string;
  email: string;
  affiliation: string | null;
  active: boolean;
  hasPassword: boolean;
  expertiseTracks: number[];
  maxConcurrentReviews: number;
  activeReviewCount: number;
  completedReviewCount: number;
  invitationStatus: "pending" | "sent" | "failed" | null;
}

const TRACKS: Record<number, string> = {
  1: "วิทยาศาสตร์สิ่งแวดล้อมฯ",
  2: "การจัดการระบบนิเวศฯ",
  3: "เศรษฐกิจหมุนเวียนฯ",
  4: "การเปลี่ยนแปลงสภาพภูมิอากาศฯ",
  5: "เทคโนโลยีดิจิทัลฯ",
  6: "เมืองยั่งยืนฯ",
  7: "สิ่งแวดล้อมและสุขภาพ",
};

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { handleApiCall, showError, showSuccess } = useApiError();
const headers = computed(() => ({ Authorization: `Bearer ${authStore.token}` }));

const reviewers = ref<Reviewer[]>([]);
const loading = ref(true);
const saving = ref(false);
const invitationSending = ref<string | null>(null);
const editingId = ref<string | null>(null);
const form = reactive({
  name: "",
  email: "",
  affiliation: "",
  expertiseTracks: [] as number[],
  maxConcurrentReviews: 5,
  active: true,
});

async function fetchReviewers() {
  loading.value = true;
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: Reviewer[] }>(`${apiBase}/admin/reviewers`, { headers: headers.value }),
  );
  loading.value = false;
  if (error) return showError(error);
  reviewers.value = data!.data;
}

function resetForm() {
  editingId.value = null;
  form.name = "";
  form.email = "";
  form.affiliation = "";
  form.expertiseTracks = [];
  form.maxConcurrentReviews = 5;
  form.active = true;
}

function editReviewer(reviewer: Reviewer) {
  editingId.value = reviewer.id;
  form.name = reviewer.name;
  form.email = reviewer.email;
  form.affiliation = reviewer.affiliation ?? "";
  form.expertiseTracks = [...reviewer.expertiseTracks];
  form.maxConcurrentReviews = reviewer.maxConcurrentReviews;
  form.active = reviewer.active;
}

function toggleTrack(track: number) {
  form.expertiseTracks = form.expertiseTracks.includes(track)
    ? form.expertiseTracks.filter((value) => value !== track)
    : [...form.expertiseTracks, track];
}

async function saveReviewer() {
  if (!form.name.trim() || (!editingId.value && !form.email.trim())) return;
  saving.value = true;
  const payload = {
    name: form.name.trim(),
    affiliation: form.affiliation.trim() || undefined,
    expertiseTracks: form.expertiseTracks,
    maxConcurrentReviews: Number(form.maxConcurrentReviews),
    active: form.active,
  };
  const { error } = await handleApiCall(() =>
    editingId.value
      ? $fetch(`${apiBase}/admin/reviewers/${editingId.value}`, { method: "PATCH", headers: headers.value, body: payload })
      : $fetch(`${apiBase}/admin/reviewers`, { method: "POST", headers: headers.value, body: { ...payload, email: form.email.trim() } }),
  );
  saving.value = false;
  if (error) return showError(error);
  showSuccess(editingId.value ? "แก้ไขผู้รีวิวเรียบร้อย" : "สร้างผู้รีวิวและดำเนินการส่งคำเชิญแล้ว");
  resetForm();
  await fetchReviewers();
}

async function resendInvitation(id: string) {
  invitationSending.value = id;
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: { status: "sent" | "failed"; error?: string } }>(
      `${apiBase}/admin/reviewers/${id}/resend-invitation`,
      { method: "POST", headers: headers.value },
    ),
  );
  invitationSending.value = null;
  if (error) return showError(error);
  if (data!.data.status === "failed") {
    showError({ status: 502, error: data!.data.error || "ส่งอีเมลไม่สำเร็จ" });
  } else {
    showSuccess("ส่งคำเชิญเรียบร้อย");
  }
}

onMounted(fetchReviewers);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">จัดการผู้รีวิว</h1>
        <p class="text-sm text-gray-500">สร้างบัญชี กำหนดสาขาความเชี่ยวชาญ และติดตามภาระงาน</p>
      </div>
      <UButton color="gray" variant="ghost" to="/admin">กลับแผงผู้ดูแล</UButton>
    </div>

    <div class="grid lg:grid-cols-[360px_1fr] gap-6">
      <UCard>
        <template #header>
          <h2 class="font-semibold">{{ editingId ? "แก้ไขผู้รีวิว" : "เพิ่มผู้รีวิว" }}</h2>
        </template>
        <form class="space-y-4" @submit.prevent="saveReviewer">
          <UFormGroup label="ชื่อ-นามสกุล" required>
            <UInput v-model="form.name" />
          </UFormGroup>
          <UFormGroup label="อีเมล" required>
            <UInput v-model="form.email" type="email" :disabled="Boolean(editingId)" />
          </UFormGroup>
          <UFormGroup label="สังกัด">
            <UInput v-model="form.affiliation" />
          </UFormGroup>
          <UFormGroup label="จำนวนงานแนะนำสูงสุด">
            <UInput v-model.number="form.maxConcurrentReviews" type="number" min="1" />
          </UFormGroup>
          <UFormGroup label="สาขาความเชี่ยวชาญ">
            <label v-for="(label, track) in TRACKS" :key="track" class="flex gap-2 text-sm mb-2">
              <input type="checkbox" :checked="form.expertiseTracks.includes(Number(track))" @change="toggleTrack(Number(track))" />
              <span>{{ label }}</span>
            </label>
          </UFormGroup>
          <label v-if="editingId" class="flex items-center gap-2 text-sm">
            <input v-model="form.active" type="checkbox" />
            เปิดรับงานรีวิวใหม่
          </label>
          <div class="flex gap-2">
            <UButton type="submit" color="primary" :loading="saving">{{ editingId ? "บันทึก" : "สร้างและส่งคำเชิญ" }}</UButton>
            <UButton v-if="editingId" color="gray" variant="soft" @click="resetForm">ยกเลิก</UButton>
          </div>
        </form>
      </UCard>

      <UCard>
        <div v-if="loading" class="flex justify-center py-12">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
        </div>
        <div v-else-if="reviewers.length === 0" class="text-center py-12 text-gray-400">ยังไม่มีผู้รีวิว</div>
        <div v-else class="space-y-4">
          <div v-for="reviewer in reviewers" :key="reviewer.id" class="border rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <p class="font-medium">{{ reviewer.name }}</p>
                <UBadge :color="reviewer.active ? 'green' : 'gray'" variant="soft" size="xs">{{ reviewer.active ? "เปิดรับงาน" : "ปิดรับงาน" }}</UBadge>
                <UBadge :color="reviewer.hasPassword ? 'blue' : 'yellow'" variant="soft" size="xs">{{ reviewer.hasPassword ? "เปิดใช้งานแล้ว" : "รอตั้งรหัสผ่าน" }}</UBadge>
                <UBadge v-if="reviewer.invitationStatus === 'failed'" color="red" variant="soft" size="xs">ส่งคำเชิญไม่สำเร็จ</UBadge>
              </div>
              <p class="text-sm text-gray-500">{{ reviewer.email }} {{ reviewer.affiliation ? ` | ${reviewer.affiliation}` : "" }}</p>
              <div class="flex flex-wrap gap-1 mt-2">
                <UBadge v-for="track in reviewer.expertiseTracks" :key="track" color="primary" variant="soft" size="xs">{{ TRACKS[track] }}</UBadge>
              </div>
              <p class="text-xs text-gray-500 mt-2">งานค้าง {{ reviewer.activeReviewCount }}/{{ reviewer.maxConcurrentReviews }} | เสร็จแล้ว {{ reviewer.completedReviewCount }}</p>
            </div>
            <div class="flex gap-2 items-start">
              <UButton size="xs" color="gray" variant="soft" @click="editReviewer(reviewer)">แก้ไข</UButton>
              <UButton size="xs" color="primary" variant="soft" :loading="invitationSending === reviewer.id" @click="resendInvitation(reviewer.id)">ส่งคำเชิญซ้ำ</UButton>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
