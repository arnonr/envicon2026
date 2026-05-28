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
  showSuccess("ตั้งรหัสผ่านใหม่สำเร็จ");
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
        <h1 class="text-xl font-semibold">ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว</h1>
        <UButton to="/auth/login" color="primary">เข้าสู่ระบบ</UButton>
      </div>
      <form v-else-if="account" class="space-y-4" @submit.prevent="submit">
        <div>
          <h1 class="text-xl font-semibold">ตั้งรหัสผ่านใหม่</h1>
          <p class="text-sm text-gray-500 mt-1">{{ account.name }} ({{ account.email }})</p>
        </div>
        <UFormGroup label="รหัสผ่านใหม่" required :error="errors.password">
          <UInput
            v-model="password"
            type="password"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            autocomplete="new-password"
            @input="errors.password = ''"
          />
        </UFormGroup>
        <UFormGroup label="ยืนยันรหัสผ่าน" required :error="errors.confirmPassword">
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
