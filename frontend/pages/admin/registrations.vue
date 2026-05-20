<script setup lang="ts">
definePageMeta({ middleware: ["auth", "role"] });

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { handleApiCall, showError, showSuccess } = useApiError();

interface Registration {
  id: string;
  userId: string;
  type: "student" | "general";
  fee: number;
  paymentStatus: "pending" | "confirmed";
  confirmedBy: string | null;
  registeredAt: string;
  userName: string | null;
  userEmail: string | null;
  userAffiliation: string | null;
  userPhone: string | null;
}

const registrations = ref<Registration[]>([]);
const loading = ref(true);
const filterStatus = ref<string>("");
const confirming = ref<string | null>(null);

async function fetchRegistrations() {
  loading.value = true;
  const query = filterStatus.value ? `?paymentStatus=${filterStatus.value}` : "";
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: Registration[] }>(
      `${apiBase}/admin/registrations${query}`,
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

async function confirmPayment(id: string) {
  confirming.value = id;
  const { error } = await handleApiCall(() =>
    $fetch<{ success: true }>(`${apiBase}/admin/registrations/${id}/confirm`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${authStore.token}` },
    }),
  );
  confirming.value = null;
  if (error) {
    showError(error);
    return;
  }
  showSuccess("ยืนยันการชำระเงินสำเร็จ");
  fetchRegistrations();
}

watch(filterStatus, fetchRegistrations);
onMounted(fetchRegistrations);
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-12">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-gray-900">จัดการการลงทะเบียน</h1>
      <UButton color="gray" variant="ghost" to="/dashboard">กลับ</UButton>
    </div>

    <!-- Filter -->
    <div class="flex gap-2 mb-6">
      <UButton
        :color="filterStatus === '' ? 'primary' : 'gray'"
        :variant="filterStatus === '' ? 'solid' : 'soft'"
        size="sm"
        @click="filterStatus = ''"
      >
        ทั้งหมด
      </UButton>
      <UButton
        :color="filterStatus === 'pending' ? 'yellow' : 'gray'"
        :variant="filterStatus === 'pending' ? 'solid' : 'soft'"
        size="sm"
        @click="filterStatus = 'pending'"
      >
        รอตรวจสอบ
      </UButton>
      <UButton
        :color="filterStatus === 'confirmed' ? 'green' : 'gray'"
        :variant="filterStatus === 'confirmed' ? 'solid' : 'soft'"
        size="sm"
        @click="filterStatus = 'confirmed'"
      >
        ยืนยันแล้ว
      </UButton>
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
            <th class="py-3 px-3 text-center">ประเภท</th>
            <th class="py-3 px-3 text-right">ค่าธรรมเนียม</th>
            <th class="py-3 px-3 text-center">สถานะ</th>
            <th class="py-3 px-3 text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="reg in registrations"
            :key="reg.id"
            class="border-b last:border-0 hover:bg-gray-50"
          >
            <td class="py-3 px-3 font-medium">{{ reg.userName || "-" }}</td>
            <td class="py-3 px-3 text-gray-500">{{ reg.userEmail || "-" }}</td>
            <td class="py-3 px-3 text-gray-500">{{ reg.userAffiliation || "-" }}</td>
            <td class="py-3 px-3 text-gray-500">{{ reg.userPhone || "-" }}</td>
            <td class="py-3 px-3 text-center">
              {{ reg.type === "student" ? "นิสิต/นักศึกษา" : "ทั่วไป" }}
            </td>
            <td class="py-3 px-3 text-right font-semibold">{{ reg.fee.toLocaleString() }} บาท</td>
            <td class="py-3 px-3 text-center">
              <UBadge
                :color="reg.paymentStatus === 'confirmed' ? 'green' : 'yellow'"
                variant="soft"
                size="xs"
              >
                {{ reg.paymentStatus === "confirmed" ? "ยืนยันแล้ว" : "รอตรวจสอบ" }}
              </UBadge>
            </td>
            <td class="py-3 px-3 text-center">
              <UButton
                v-if="reg.paymentStatus === 'pending'"
                color="green"
                size="xs"
                :loading="confirming === reg.id"
                @click="confirmPayment(reg.id)"
              >
                ยืนยัน
              </UButton>
              <span v-else class="text-gray-300 text-xs">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
