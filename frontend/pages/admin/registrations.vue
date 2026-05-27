<script setup lang="ts">
definePageMeta({ middleware: ["auth", "role"] });

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { handleApiCall, showError, showSuccess } = useApiError();

interface Registration {
  id: string;
  fullName: string;
  affiliation: string | null;
  phone: string | null;
  email: string;
  createdAt: string;
}

const registrations = ref<Registration[]>([]);
const loading = ref(true);

async function fetchRegistrations() {
  loading.value = true;
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: Registration[] }>(
      `${apiBase}/admin/registrations`,
      { headers: { Authorization: `Bearer ${authStore.token}` } },
    ),
  );
  loading.value = false;
  if (error) {
    showError(error);
    return;
  }
  if (data) registrations.value = data.data;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

onMounted(fetchRegistrations);
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-12">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-gray-900">ข้อมูลผู้ลงทะเบียนเข้าร่วมงาน</h1>
      <UButton color="gray" variant="ghost" to="/">กลับหน้าแรก</UButton>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
    </div>

    <!-- Empty -->
    <div v-else-if="registrations.length === 0" class="text-center py-12 text-gray-400">
      <p>ไม่มีข้อมูลการลงทะเบียน</p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b text-left">
            <th class="py-3 px-3">ชื่อ</th>
            <th class="py-3 px-3">อีเมล</th>
            <th class="py-3 px-3">สังกัด</th>
            <th class="py-3 px-3">เบอร์โทร</th>
            <th class="py-3 px-3 text-center">วันที่ลงทะเบียน</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="reg in registrations"
            :key="reg.id"
            class="border-b last:border-0 hover:bg-gray-50"
          >
            <td class="py-3 px-3 font-medium">{{ reg.fullName }}</td>
            <td class="py-3 px-3 text-gray-500">{{ reg.email }}</td>
            <td class="py-3 px-3 text-gray-500">{{ reg.affiliation || "-" }}</td>
            <td class="py-3 px-3 text-gray-500">{{ reg.phone || "-" }}</td>
            <td class="py-3 px-3 text-center text-gray-500">{{ formatDate(reg.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
