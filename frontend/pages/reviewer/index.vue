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
const { handleApiCall, showError, showSuccess } = useApiError();
const loading = ref(true);
const assignments = ref<ReviewAssignment[]>([]);

const changePasswordModalOpen = ref(false);
const changingPassword = ref(false);
const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const passwordErrors = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

function openChangePasswordModal() {
  passwordForm.currentPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
  passwordErrors.currentPassword = "";
  passwordErrors.newPassword = "";
  passwordErrors.confirmPassword = "";
  changePasswordModalOpen.value = true;
}

function validateChangePassword() {
  passwordErrors.currentPassword = "";
  passwordErrors.newPassword = "";
  passwordErrors.confirmPassword = "";
  let valid = true;

  if (!passwordForm.currentPassword) {
    passwordErrors.currentPassword = "กรุณากรอกรหัสผ่านปัจจุบัน";
    valid = false;
  }
  if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
    passwordErrors.newPassword = "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร";
    valid = false;
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = "รหัสผ่านใหม่ไม่ตรงกัน";
    valid = false;
  }
  return valid;
}

async function handleChangePassword() {
  if (!validateChangePassword()) return;
  changingPassword.value = true;

  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/auth/change-password`, {
      method: "POST",
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      },
    }),
  );
  changingPassword.value = false;
  if (error) {
    showError(error);
    return;
  }

  showSuccess("เปลี่ยนรหัสผ่านสำเร็จแล้ว");
  changePasswordModalOpen.value = false;
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
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">งานประเมินผลงาน</h1>
        <p class="text-gray-500 text-sm mt-0.5">
          สวัสดี, {{ user?.name }}
          <span v-if="user?.email" class="text-gray-400 font-mono text-xs">({{ user.email }})</span>
        </p>
      </div>
      <div>
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-key"
          size="sm"
          @click="openChangePasswordModal"
        >
          เปลี่ยนรหัสผ่าน
        </UButton>
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

    <!-- Modal เปลี่ยนรหัสผ่าน -->
    <UModal v-model="changePasswordModalOpen" :ui="{ width: 'sm:max-w-md' }">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-key" class="w-5 h-5 text-primary-600" />
            <h3 class="font-semibold text-gray-900">เปลี่ยนรหัสผ่าน (Change Password)</h3>
          </div>
        </template>

        <form class="space-y-4" novalidate @submit.prevent="handleChangePassword">
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 space-y-1">
            <p>ผู้ใช้งาน: <span class="font-medium text-gray-900">{{ user?.name }}</span></p>
            <p>อีเมล (Username): <span class="font-mono text-gray-900 font-semibold">{{ user?.email }}</span></p>
          </div>

          <UFormGroup label="รหัสผ่านปัจจุบัน" required :error="passwordErrors.currentPassword">
            <UInput
              v-model="passwordForm.currentPassword"
              type="password"
              placeholder="กรอกรหัสผ่านเดิม"
              autocomplete="current-password"
            />
          </UFormGroup>

          <UFormGroup label="รหัสผ่านใหม่" required :error="passwordErrors.newPassword" help="อย่างน้อย 8 ตัวอักษร">
            <UInput
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="อย่างน้อย 8 ตัวอักษร"
              autocomplete="new-password"
            />
          </UFormGroup>

          <UFormGroup label="ยืนยันรหัสผ่านใหม่" required :error="passwordErrors.confirmPassword">
            <UInput
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              autocomplete="new-password"
            />
          </UFormGroup>

          <div class="flex justify-end gap-2 pt-2">
            <UButton color="gray" variant="ghost" @click="changePasswordModalOpen = false">
              ยกเลิก
            </UButton>
            <UButton type="submit" color="primary" :loading="changingPassword">
              บันทึกรหัสผ่านใหม่
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
