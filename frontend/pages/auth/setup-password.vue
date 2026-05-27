<script setup lang="ts">
definePageMeta({ layout: "default" });

const route = useRoute();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const { handleApiCall, showError, showSuccess } = useApiError();

const token = computed(() => String(route.query.token || ""));
const reviewer = ref<{ name: string; email: string } | null>(null);
const loading = ref(true);
const saving = ref(false);
const password = ref("");
const confirmPassword = ref("");
const completed = ref(false);

onMounted(async () => {
  if (!token.value) {
    loading.value = false;
    return;
  }
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: { name: string; email: string } }>(
      `${apiBase}/auth/setup-password/${encodeURIComponent(token.value)}`,
    ),
  );
  loading.value = false;
  if (error) {
    showError(error);
    return;
  }
  reviewer.value = data!.data;
});

async function submit() {
  if (password.value.length < 8) {
    showError({ status: 400, error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" });
    return;
  }
  if (password.value !== confirmPassword.value) {
    showError({ status: 400, error: "รหัสผ่านไม่ตรงกัน" });
    return;
  }
  saving.value = true;
  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/auth/setup-password`, {
      method: "POST",
      body: { token: token.value, password: password.value },
    }),
  );
  saving.value = false;
  if (error) {
    showError(error);
    return;
  }
  completed.value = true;
  showSuccess("ตั้งรหัสผ่านสำเร็จ");
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center py-12 px-4">
    <UCard class="w-full max-w-md">
      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
      </div>
      <div v-else-if="completed" class="text-center space-y-4 py-5">
        <UIcon name="i-heroicons-check-circle" class="w-12 h-12 text-green-500 mx-auto" />
        <h1 class="text-xl font-semibold">ตั้งรหัสผ่านเรียบร้อยแล้ว</h1>
        <UButton to="/auth/login" color="primary">เข้าสู่ระบบผู้รีวิว</UButton>
      </div>
      <form v-else-if="reviewer" class="space-y-4" @submit.prevent="submit">
        <div>
          <h1 class="text-xl font-semibold">ตั้งรหัสผ่านผู้รีวิว</h1>
          <p class="text-sm text-gray-500 mt-1">{{ reviewer.name }} ({{ reviewer.email }})</p>
        </div>
        <UFormGroup label="รหัสผ่านใหม่" required>
          <UInput v-model="password" type="password" placeholder="อย่างน้อย 8 ตัวอักษร" />
        </UFormGroup>
        <UFormGroup label="ยืนยันรหัสผ่าน" required>
          <UInput v-model="confirmPassword" type="password" />
        </UFormGroup>
        <UButton type="submit" block color="primary" :loading="saving">บันทึกรหัสผ่าน</UButton>
      </form>
      <div v-else class="text-center py-8 text-gray-500">
        ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว
      </div>
    </UCard>
  </div>
</template>
