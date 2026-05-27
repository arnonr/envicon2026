<script setup lang="ts">
definePageMeta({ layout: "default" });

const route = useRoute();
const router = useRouter();
const { register, login, isLoggedIn } = useAuth();

if (isLoggedIn.value) {
  const authStore = useAuthStore();
  router.replace(authStore.isAdmin ? "/admin" : authStore.user?.role === "reviewer" ? "/reviewer" : "/dashboard");
}
const { handleApiCall, showError, showSuccess } = useApiError();

const isRegisterMode = ref(route.query.mode === "register");
const loading = ref(false);
const showPassword = ref(false);
const serverError = ref("");

const form = reactive({
  name: "",
  affiliation: "",
  phone: "",
  email: "",
  password: "",
});

const errors = reactive({
  name: "",
  email: "",
  password: "",
});

const touched = reactive({
  name: false,
  email: false,
  password: false,
});

function validateField(field: "name" | "email" | "password") {
  errors[field] = "";
  if (field === "name" && isRegisterMode.value && !form.name.trim()) {
    errors.name = "กรุณากรอกชื่อ-นามสกุล";
  }
  if (field === "email" && (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))) {
    errors.email = "กรุณากรอกอีเมลที่ถูกต้อง";
  }
  if (field === "password" && form.password.length > 0 && form.password.length < 8) {
    errors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  }
}

function onBlur(field: "name" | "email" | "password") {
  touched[field] = true;
  validateField(field);
}

function switchMode(register: boolean) {
  isRegisterMode.value = register;
  errors.name = "";
  errors.email = "";
  errors.password = "";
  touched.name = false;
  touched.email = false;
  touched.password = false;
  serverError.value = "";
}

function validate(): boolean {
  let valid = true;
  errors.name = "";
  errors.email = "";
  errors.password = "";

  if (isRegisterMode.value && !form.name.trim()) {
    errors.name = "กรุณากรอกชื่อ-นามสกุล";
    valid = false;
  }
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "กรุณากรอกอีเมลที่ถูกต้อง";
    valid = false;
  }
  if (form.password.length < 8) {
    errors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
    valid = false;
  }
  return valid;
}

function getErrorMessage(error: any): string {
  const status = error?.status;
  const msg = error?.message || error?.error || "";
  if (status === 409) return "อีเมลนี้ถูกใช้ลงทะเบียนแล้ว";
  if (status === 401) return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  if (msg) return msg;
  return "เกิดข้อผิดพลาด กรุณาลองใหม่";
}

async function handleSubmit() {
  if (!validate()) return;
  loading.value = true;

  if (isRegisterMode.value) {
    const { error } = await handleApiCall(() =>
      register({
        email: form.email,
        password: form.password,
        name: form.name,
        affiliation: form.affiliation || undefined,
        phone: form.phone || undefined,
      }),
    );
    if (error) {
      serverError.value = getErrorMessage(error);
      loading.value = false;
      return;
    }
    showSuccess("ลงทะเบียนสำเร็จ");
  } else {
    const { error } = await handleApiCall(() =>
      login(form.email, form.password),
    );
    if (error) {
      serverError.value = getErrorMessage(error);
      loading.value = false;
      return;
    }
  }

  const authStore = useAuthStore();
  const defaultRedirect = authStore.isAdmin ? "/admin" : authStore.user?.role === "reviewer" ? "/reviewer" : "/dashboard";
  const redirect = (route.query.redirect as string) || defaultRedirect;
  router.push(redirect);
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isRegisterMode ? "ลงทะเบียนเพื่อส่งผลงาน" : "เข้าสู่ระบบ" }}
        </h1>
        <p class="text-gray-500 mt-2">ENVICON 2026</p>
      </div>

      <UCard>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UAlert v-if="serverError" icon="i-heroicons-exclamation-triangle" color="red" variant="soft" :title="serverError" :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link' }" @close="serverError = ''" />
          <template v-if="isRegisterMode">
            <UFormGroup label="ชื่อ-นามสกุล" :error="touched.name ? errors.name : ''">
              <UInput
                v-model="form.name"
                placeholder="ดร.สมชาย สิ่งแวดล้อม"
                icon="i-heroicons-user"
                @blur="onBlur('name')"
              />
            </UFormGroup>
            <UFormGroup label="สังกัด">
              <UInput v-model="form.affiliation" placeholder="มหาวิทยาลัย..." icon="i-heroicons-building-office" />
            </UFormGroup>
            <UFormGroup label="เบอร์โทรศัพท์">
              <UInput v-model="form.phone" placeholder="08X-XXX-XXXX" icon="i-heroicons-phone" />
            </UFormGroup>
          </template>

          <UFormGroup label="อีเมล" :error="touched.email ? errors.email : ''">
            <UInput
              v-model="form.email"
              type="email"
              placeholder="email@example.com"
              icon="i-heroicons-envelope"
              @blur="onBlur('email')"
            />
          </UFormGroup>

          <UFormGroup label="รหัสผ่าน" :error="touched.password ? errors.password : ''">
            <UInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="อย่างน้อย 8 ตัวอักษร"
              icon="i-heroicons-lock-closed"
              @blur="onBlur('password')"
            >
              <template #trailing>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-600 px-2"
                  @click="showPassword = !showPassword"
                >
                  <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
                </button>
              </template>
            </UInput>
          </UFormGroup>

          <UButton type="submit" color="primary" block size="lg" :loading="loading">
            {{ isRegisterMode ? "ลงทะเบียน" : "เข้าสู่ระบบ" }}
          </UButton>
        </form>

        <template #footer>
          <div class="text-center text-sm">
            <template v-if="isRegisterMode">
              มีบัญชีอยู่แล้ว?
              <button class="text-primary-600 font-semibold hover:underline" @click="switchMode(false)">
                เข้าสู่ระบบ
              </button>
            </template>
            <template v-else>
              ยังไม่มีบัญชี?
              <button class="text-primary-600 font-semibold hover:underline" @click="switchMode(true)">
                ลงทะเบียน
              </button>
            </template>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
