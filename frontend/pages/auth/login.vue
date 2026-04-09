<script setup lang="ts">
definePageMeta({ layout: "default" });

const { show: showComingSoon } = useComingSoon();

const isRegisterMode = ref(false);

const handleSubmit = () => showComingSoon();
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
          <!-- Register-only fields -->
          <template v-if="isRegisterMode">
            <UFormGroup label="ชื่อ-นามสกุล">
              <UInput placeholder="ดร.สมชาย สิ่งแวดล้อม" icon="i-heroicons-user" disabled />
            </UFormGroup>
            <UFormGroup label="สังกัด">
              <UInput placeholder="มหาวิทยาลัย..." icon="i-heroicons-building-office" disabled />
            </UFormGroup>
          </template>

          <UFormGroup label="อีเมล">
            <UInput type="email" placeholder="email@example.com" icon="i-heroicons-envelope" disabled />
          </UFormGroup>

          <UFormGroup label="รหัสผ่าน">
            <UInput type="password" placeholder="อย่างน้อย 8 ตัวอักษร" icon="i-heroicons-lock-closed" disabled />
          </UFormGroup>

          <UButton type="submit" color="primary" block size="lg">
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
