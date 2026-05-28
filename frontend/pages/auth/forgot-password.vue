<script setup lang="ts">
definePageMeta({ layout: "default" });

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const { handleApiCall, showError } = useApiError();

const email = ref("");
const loading = ref(false);
const completed = ref(false);
const error = ref("");
const successMessage = ref("หากอีเมลนี้อยู่ในระบบ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้");

function validate() {
  error.value = "";
  if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = "กรุณากรอกอีเมลที่ถูกต้อง";
    return false;
  }
  return true;
}

async function submit() {
  if (!validate()) return;
  loading.value = true;
  const { data, error: apiError } = await handleApiCall(() =>
    $fetch<{ success: true; data: { sent: boolean }; message?: string }>(`${apiBase}/auth/forgot-password`, {
      method: "POST",
      body: { email: email.value },
    }),
  );
  loading.value = false;
  if (apiError) {
    showError(apiError);
    return;
  }
  successMessage.value = data?.message || successMessage.value;
  completed.value = true;
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">ลืมรหัสผ่าน</h1>
        <p class="text-gray-500 mt-2">ENVICON 2026</p>
      </div>

      <UCard>
        <div v-if="completed" class="text-center space-y-4 py-5">
          <UIcon name="i-heroicons-envelope-open" class="w-12 h-12 text-primary-500 mx-auto" />
          <h2 class="text-xl font-semibold">ตรวจสอบอีเมลของท่าน</h2>
          <p class="text-sm text-gray-600">{{ successMessage }}</p>
          <UButton to="/auth/login" color="primary">กลับไปเข้าสู่ระบบ</UButton>
        </div>

        <form v-else class="space-y-4" @submit.prevent="submit">
          <UFormGroup label="อีเมล" :error="error">
            <UInput
              v-model="email"
              type="email"
              placeholder="email@example.com"
              icon="i-heroicons-envelope"
              autocomplete="email"
              @blur="validate"
            />
          </UFormGroup>

          <UButton type="submit" block color="primary" size="lg" :loading="loading">
            ส่งลิงก์ตั้งรหัสผ่านใหม่
          </UButton>
        </form>

        <template #footer>
          <div class="text-center text-sm">
            จำรหัสผ่านได้แล้ว?
            <NuxtLink to="/auth/login" class="text-primary-600 font-semibold hover:underline">
              เข้าสู่ระบบ
            </NuxtLink>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
