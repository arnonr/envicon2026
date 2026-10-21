<script setup lang="ts">
definePageMeta({ layout: "default" });

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const { register, login, isLoggedIn } = useAuth();

function resolveRedirect(defaultPath: string) {
  const raw = typeof route.query.redirect === "string" ? route.query.redirect.trim() : "";
  const cleaned = raw.replace(/^\/envicon2026(?=\/|$)/, "");
  return cleaned.startsWith("/") ? cleaned : defaultPath;
}

if (isLoggedIn.value) {
  const authStore = useAuthStore();
  const defaultRedirect = authStore.isAdmin ? "/admin" : authStore.user?.role === "reviewer" ? "/reviewer" : "/dashboard";
  router.replace(resolveRedirect(defaultRedirect));
}
const { handleApiCall, showError, showSuccess } = useApiError();

const isRegisterMode = ref(route.query.mode === "register");
const loading = ref(false);
const showPassword = ref(false);
const serverError = ref("");
const eventRegNotice = ref("");

const form = reactive({
  name: "",
  affiliation: "",
  phone: "",
  email: typeof route.query.email === "string" ? route.query.email : "",
  password: "",
});

async function checkAttendeeEmail(rawEmail: string): Promise<boolean> {
  const email = rawEmail.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    eventRegNotice.value = "";
    return false;
  }
  try {
    const res = await $fetch<{
      success: true;
      data: {
        foundInEventRegistration: boolean;
        hasUserAccount: boolean;
        prefill: { fullName: string; affiliation: string; phone: string; feeType: string } | null;
      };
    }>(`${apiBase}/public/check-event-registration?email=${encodeURIComponent(email)}`);
    if (res.data.foundInEventRegistration && !res.data.hasUserAccount && res.data.prefill) {
      if (!form.name.trim()) form.name = res.data.prefill.fullName;
      if (!form.affiliation.trim()) form.affiliation = res.data.prefill.affiliation;
      if (!form.phone.trim()) form.phone = res.data.prefill.phone;
      errors.name = "";
      eventRegNotice.value =
        "พบข้อมูลการลงทะเบียนเข้าร่วมงานของอีเมลนี้แล้ว — ระบบได้ดึงชื่อ สังกัด และเบอร์โทรมาให้อัตโนมัติ (หลักฐานการชำระเงินและข้อมูลใบเสร็จเดิมจะถูกเชื่อมโยงเข้ากับผลงานทันที)";
      return true;
    }
    eventRegNotice.value = "";
    return false;
  } catch {
    return false;
  }
}

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
  if (field === "email") {
    const email = form.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "กรุณากรอกอีเมลที่ถูกต้อง";
    }
  }
  if (field === "password" && form.password.length > 0 && form.password.length < 8) {
    errors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  }
}

async function onBlur(field: "name" | "email" | "password") {
  touched[field] = true;
  if (field === "email") {
    form.email = form.email.trim();
    if (isRegisterMode.value) {
      await checkAttendeeEmail(form.email);
    }
  }
  if (field === "name") {
    form.name = form.name.trim();
  }
  validateField(field);
}

async function switchMode(register: boolean) {
  isRegisterMode.value = register;
  errors.name = "";
  errors.email = "";
  errors.password = "";
  touched.name = false;
  touched.email = false;
  touched.password = false;
  serverError.value = "";
  if (register && form.email.trim()) {
    await checkAttendeeEmail(form.email);
  } else {
    eventRegNotice.value = "";
  }
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
  const email = form.email.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
  form.email = form.email.trim();
  if (form.name) form.name = form.name.trim();
  if (!validate()) return;
  loading.value = true;

  if (isRegisterMode.value) {
    const { error } = await handleApiCall(() =>
      register({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        name: form.name.trim(),
        affiliation: form.affiliation?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
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
      login(form.email.trim().toLowerCase(), form.password),
    );
    if (error) {
      if (error.error === "EVENT_REGISTERED_NO_ACCOUNT") {
        isRegisterMode.value = true;
        serverError.value = "";
        await checkAttendeeEmail(form.email);
        if (!eventRegNotice.value) {
          eventRegNotice.value =
            "อีเมลนี้ลงทะเบียนเป็นผู้เข้าร่วมงานไว้แล้ว กรุณาตรวจสอบข้อมูลและกด 'ลงทะเบียน' ด้านล่างเพื่อตั้งรหัสผ่านสำหรับส่งผลงาน";
        }
        loading.value = false;
        return;
      }
      serverError.value = getErrorMessage(error);
      loading.value = false;
      return;
    }
  }

  const authStore = useAuthStore();
  const defaultRedirect = authStore.isAdmin ? "/admin" : authStore.user?.role === "reviewer" ? "/reviewer" : "/dashboard";
  router.push(resolveRedirect(defaultRedirect));
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isRegisterMode ? "ลงทะเบียนเพื่อส่งผลงาน" : "เข้าสู่ระบบ" }}
        </h1>
        <p class="text-gray-500 mt-2">TSHE-CON 2026</p>
      </div>

      <UCard>
        <form novalidate @submit.prevent="handleSubmit" class="space-y-4">
          <UAlert v-if="serverError" icon="i-heroicons-exclamation-triangle" color="red" variant="soft" :title="serverError" :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link' }" @close="serverError = ''" />
          <UAlert
            v-if="eventRegNotice"
            icon="i-heroicons-information-circle"
            color="blue"
            variant="soft"
            :description="eventRegNotice"
          />

          <UFormGroup label="อีเมล (Email)" :error="touched.email ? errors.email : ''">
            <UInput
              v-model.trim="form.email"
              type="email"
              placeholder="email@example.com"
              icon="i-heroicons-envelope"
              autocomplete="email"
              @blur="onBlur('email')"
            />
          </UFormGroup>

          <template v-if="isRegisterMode">
            <UFormGroup label="ชื่อ-นามสกุล (Full Name)" :error="touched.name ? errors.name : ''">
              <UInput
                v-model="form.name"
                placeholder="ดร.สมชาย สิ่งแวดล้อม"
                icon="i-heroicons-user"
                @blur="onBlur('name')"
              />
            </UFormGroup>
            <UFormGroup label="สังกัด (Affiliation)">
              <UInput v-model="form.affiliation" placeholder="มหาวิทยาลัย..." icon="i-heroicons-building-office" />
            </UFormGroup>
            <UFormGroup label="เบอร์โทรศัพท์ (Phone Number)">
              <UInput v-model="form.phone" placeholder="08X-XXX-XXXX" icon="i-heroicons-phone" />
            </UFormGroup>
          </template>

          <UFormGroup label="รหัสผ่าน (Password)" :error="touched.password ? errors.password : ''">
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

          <div v-if="!isRegisterMode" class="flex justify-end -mt-2">
            <NuxtLink to="/auth/forgot-password" class="text-sm font-medium text-primary-600 hover:underline">
              ลืมรหัสผ่าน / ขอลิงก์ตั้งรหัสผ่านใหม่?
            </NuxtLink>
          </div>

          <UButton type="submit" color="primary" block size="lg" :loading="loading">
            {{ isRegisterMode ? "ลงทะเบียน" : "เข้าสู่ระบบ" }}
          </UButton>
        </form>

        <template #footer>
          <div class="text-center text-sm space-y-2">
            <div>
              <template v-if="isRegisterMode">
                มีบัญชีอยู่แล้ว?
                <button class="text-primary-600 font-semibold hover:underline" @click="switchMode(false)">
                  เข้าสู่ระบบ
                </button>
              </template>
              <template v-else>
                ยังไม่มีบัญชีสำหรับส่งผลงาน?
                <button class="text-primary-600 font-semibold hover:underline" @click="switchMode(true)">
                  ลงทะเบียน / เปลี่ยนเป็นผู้นำเสนอ
                </button>
              </template>
            </div>
            <p v-if="!isRegisterMode" class="text-xs text-gray-500">
              หากเคยลงทะเบียนเป็นผู้เข้าร่วมงานไว้แล้ว สามารถกด <strong>ลงทะเบียน / เปลี่ยนเป็นผู้นำเสนอ</strong> ด้วยอีเมลเดิมเพื่อตั้งรหัสผ่านส่งผลงานได้ทันที
            </p>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
