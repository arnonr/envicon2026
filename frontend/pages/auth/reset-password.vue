<script setup lang="ts">
definePageMeta({ layout: "default" });

const route = useRoute();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const { handleApiCall, showError, showSuccess } = useApiError();

const token = computed(() => String(route.query.token || ""));
const account = ref<{ name: string; email: string } | null>(null);
const loading = ref(true);
const saving = ref(false);
const password = ref("");
const confirmPassword = ref("");
const completed = ref(false);
const errors = reactive({
  password: "",
  confirmPassword: "",
});

function validatePasswordForm() {
  errors.password = "";
  errors.confirmPassword = "";
  if (password.value.length < 8) {
    errors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
    return false;
  }
  if (password.value !== confirmPassword.value) {
    errors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    return false;
  }
  return true;
}

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
  account.value = data!.data;
});

async function submit() {
  if (!validatePasswordForm()) return;
  saving.value = true;
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: { ready: boolean; token?: string; user?: any } }>(
      `${apiBase}/auth/setup-password`,
      {
        method: "POST",
        body: { token: token.value, password: password.value },
      },
    ),
  );
  saving.value = false;
  if (error) {
    showError(error);
    return;
  }
  completed.value = true;
  showSuccess("ตั้งรหัสผ่านใหม่สำเร็จ");

  if (data?.data?.token && data?.data?.user) {
    const authStore = useAuthStore();
    authStore.setAuth(data.data.token, data.data.user);
    const targetPath =
      data.data.user.role === "reviewer"
        ? "/reviewer"
        : data.data.user.role === "admin"
        ? "/admin"
        : "/dashboard";
    setTimeout(() => {
      navigateTo(targetPath);
    }, 2000);
  }
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center py-12 px-4">
    <UCard class="w-full max-w-md">
      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
      </div>
      <div v-else-if="completed" class="text-center space-y-4 py-5">
        <UIcon name="i-heroicons-check-circle" class="w-14 h-14 text-green-500 mx-auto" />
        <h1 class="text-xl font-bold text-gray-900">ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว</h1>
        
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center space-y-1">
          <p class="text-xs text-gray-500 font-medium">อีเมลสำหรับเข้าสู่ระบบของคุณ (Username):</p>
          <p class="font-mono text-base font-bold text-primary-700 select-all">{{ account?.email }}</p>
        </div>

        <p class="text-xs text-gray-500 flex items-center justify-center gap-1">
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin text-primary-500" />
          ระบบกำลังนำท่านเข้าสู่ระบบอัตโนมัติ...
        </p>

        <div class="pt-2">
          <UButton
            :to="account?.email ? `/auth/login?email=${encodeURIComponent(account.email)}` : '/auth/login'"
            color="primary"
            block
            size="lg"
          >
            เข้าสู่ระบบทันที
          </UButton>
        </div>
      </div>
      <form v-else-if="account" class="space-y-4" @submit.prevent="submit">
        <div>
          <h1 class="text-xl font-semibold">ตั้งรหัสผ่านใหม่</h1>
          <p class="text-sm text-gray-500 mt-1">{{ account.name }} ({{ account.email }})</p>
        </div>
        <UFormGroup label="รหัสผ่านใหม่ (New Password)" required :error="errors.password">
          <UInput
            v-model="password"
            type="password"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            autocomplete="new-password"
            @input="errors.password = ''"
          />
        </UFormGroup>
        <UFormGroup label="ยืนยันรหัสผ่าน (Confirm Password)" required :error="errors.confirmPassword">
          <UInput
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            @input="errors.confirmPassword = ''"
          />
        </UFormGroup>
        <UButton type="submit" block color="primary" :loading="saving">บันทึกรหัสผ่านใหม่</UButton>
      </form>
      <div v-else class="text-center py-8 text-gray-500">
        ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว
      </div>
    </UCard>
  </div>
</template>
