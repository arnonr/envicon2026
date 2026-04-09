<script setup lang="ts">
definePageMeta({ layout: "default" });

const { login, register, isLoggedIn } = useAuth();

// Redirect if already logged in
watchEffect(() => {
  if (isLoggedIn.value) navigateTo("/dashboard");
});

const isRegisterMode = ref(false);
const loading = ref(false);
const error = ref("");

const form = reactive({
  email: "",
  password: "",
  name: "",
  affiliation: "",
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = "";

  try {
    if (isRegisterMode.value) {
      await register({
        email: form.email,
        password: form.password,
        name: form.name,
        affiliation: form.affiliation || undefined,
      });
    } else {
      await login(form.email, form.password);
    }
    navigateTo("/dashboard");
  } catch (e: any) {
    error.value =
      e.data?.error || e.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isRegisterMode ? "สร้างบัญชีใหม่" : "เข้าสู่ระบบ" }}
        </h1>
        <p class="text-gray-500 mt-2">ENVICON 2026</p>
      </div>

      <UCard>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UAlert
            v-if="error"
            color="red"
            variant="soft"
            :title="error"
            icon="i-heroicons-exclamation-triangle"
          />

          <!-- Register-only fields -->
          <template v-if="isRegisterMode">
            <UFormGroup label="ชื่อ-นามสกุล" required>
              <UInput
                v-model="form.name"
                placeholder="ดร.สมชาย สิ่งแวดล้อม"
                icon="i-heroicons-user"
                required
              />
            </UFormGroup>

            <UFormGroup label="สังกัด">
              <UInput
                v-model="form.affiliation"
                placeholder="มหาวิทยาลัย..."
                icon="i-heroicons-building-office"
              />
            </UFormGroup>
          </template>

          <UFormGroup label="อีเมล" required>
            <UInput
              v-model="form.email"
              type="email"
              placeholder="email@example.com"
              icon="i-heroicons-envelope"
              required
            />
          </UFormGroup>

          <UFormGroup label="รหัสผ่าน" required>
            <UInput
              v-model="form.password"
              type="password"
              placeholder="อย่างน้อย 8 ตัวอักษร"
              icon="i-heroicons-lock-closed"
              required
              :minlength="isRegisterMode ? 8 : undefined"
            />
          </UFormGroup>

          <UButton
            type="submit"
            color="primary"
            block
            :loading="loading"
            size="lg"
          >
            {{ isRegisterMode ? "สมัครสมาชิก" : "เข้าสู่ระบบ" }}
          </UButton>
        </form>

        <template #footer>
          <div class="text-center text-sm">
            <template v-if="isRegisterMode">
              มีบัญชีอยู่แล้ว?
              <button
                class="text-primary-600 font-semibold hover:underline"
                @click="isRegisterMode = false"
              >
                เข้าสู่ระบบ
              </button>
            </template>
            <template v-else>
              ยังไม่มีบัญชี?
              <button
                class="text-primary-600 font-semibold hover:underline"
                @click="isRegisterMode = true"
              >
                สมัครสมาชิก
              </button>
            </template>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
