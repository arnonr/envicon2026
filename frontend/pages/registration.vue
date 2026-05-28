<script setup lang="ts">
const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { handleApiCall, showError, showSuccess } = useApiError();

const selectedType = ref<"student" | "general">("student");
const loading = ref(false);
const submitting = ref(false);

interface Registration {
  id: string;
  type: "student" | "general";
  fee: number;
  paymentStatus: "pending" | "confirmed";
  registeredAt: string;
}

const registration = ref<Registration | null>(null);
const notRegistered = ref(false);

const feeTable = [
  { category: "นิสิต/นักศึกษา", type: "student" as const, earlyBird: 500, regular: 700 },
  { category: "อาจารย์/นักวิจัย/บุคคลทั่วไป", type: "general" as const, earlyBird: 2000, regular: 2500 },
];

const currentFee = computed(() => {
  const row = feeTable.find((f) => f.type === selectedType.value);
  if (!row) return 0;
  const deadline = new Date("2026-10-14T23:59:59+07:00");
  return new Date() <= deadline ? row.earlyBird : row.regular;
});

async function fetchRegistration() {
  if (!authStore.token) return;
  loading.value = true;
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: Registration }>(`${apiBase}/registrations`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    }),
  );
  loading.value = false;
  if (error?.status === 404) {
    notRegistered.value = true;
    return;
  }
  if (error) {
    showError(error);
    return;
  }
  if (data) {
    registration.value = data.data;
  }
}

async function handleSubmit() {
  submitting.value = true;
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: Registration }>(`${apiBase}/registrations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { type: selectedType.value },
    }),
  );
  submitting.value = false;
  if (error) {
    showError(error);
    return;
  }
  showSuccess("ลงทะเบียนสำเร็จ");
  if (data) {
    registration.value = data.data;
    notRegistered.value = false;
  }
}

onMounted(() => {
  if (authStore.isLoggedIn) fetchRegistration();
});
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-16">
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-3">ลงทะเบียนส่งผลงาน</h1>
      <p class="text-gray-500 text-lg">Registration</p>
    </div>

    <!-- Fee Table -->
    <UCard class="mb-8">
      <template #header>
        <h2 class="font-semibold text-lg">อัตราค่าลงทะเบียนส่งผลงาน</h2>
      </template>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3 px-4">ประเภท</th>
              <th class="text-center py-3 px-4">
                <div>Early Bird</div>
                <div class="text-xs text-gray-400 font-normal">ก่อน 14 ต.ค. 2569</div>
              </th>
              <th class="text-center py-3 px-4">
                <div>Regular</div>
                <div class="text-xs text-gray-400 font-normal">หลัง 14 ต.ค. 2569</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fee in feeTable" :key="fee.type" class="border-b last:border-0">
              <td class="py-3 px-4 font-medium">{{ fee.category }}</td>
              <td class="py-3 px-4 text-center text-primary-600 font-semibold">
                {{ fee.earlyBird.toLocaleString() }} บาท
              </td>
              <td class="py-3 px-4 text-center">
                {{ fee.regular.toLocaleString() }} บาท
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-gray-400 animate-spin" />
    </div>

    <!-- Registration Form (not logged in) -->
    <UCard v-else-if="!authStore.isLoggedIn" class="mb-8">
      <div class="text-center py-6 text-gray-500">
        <p>กรุณาเข้าสู่ระบบเพื่อลงทะเบียนส่งผลงาน</p>
        <UButton color="primary" class="mt-4" to="/auth/login">เข้าสู่ระบบ</UButton>
      </div>
    </UCard>

    <!-- Registration Form (logged in, not registered) -->
    <UCard v-else-if="notRegistered" class="mb-8">
      <template #header>
        <h2 class="font-semibold text-lg">ลงทะเบียนส่งผลงาน</h2>
      </template>
      <div class="space-y-4">
        <URadio
          v-for="fee in feeTable"
          :key="fee.type"
          v-model="selectedType"
          :value="fee.type"
          :label="fee.category"
        />
        <div class="bg-gray-50 rounded-lg p-4 text-center">
          <p class="text-sm text-gray-500">ค่าลงทะเบียน</p>
          <p class="text-2xl font-bold text-primary-600">{{ currentFee.toLocaleString() }} บาท</p>
        </div>
        <UButton color="primary" block size="lg" :loading="submitting" @click="handleSubmit">
          ลงทะเบียน
        </UButton>
      </div>
    </UCard>


  </div>
</template>
