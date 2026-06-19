<script setup lang="ts">
definePageMeta({ layout: "default" });

const route = useRoute();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const { handleApiCall, showError, showSuccess } = useApiError();

const TRACKS: Record<number, string> = {
  1: "วิทยาศาสตร์สิ่งแวดล้อมฯ",
  2: "การจัดการระบบนิเวศฯ",
  3: "เศรษฐกิจหมุนเวียนฯ",
  4: "การเปลี่ยนแปลงสภาพภูมิอากาศฯ",
  5: "เทคโนโลยีดิจิทัลฯ",
  6: "เมืองยั่งยืนฯ",
  7: "สิ่งแวดล้อมและสุขภาพ",
};

const token = computed(() => String(route.query.token || ""));
interface SetupAccount {
  name: string;
  email: string;
  role: "author" | "reviewer" | "admin";
  affiliation: string | null;
  expertiseTracks: number[];
}
const account = ref<SetupAccount | null>(null);
const loading = ref(true);
const saving = ref(false);
const password = ref("");
const confirmPassword = ref("");
const affiliation = ref("");
const expertiseTracks = ref<number[]>([]);
const completed = ref(false);
const errors = reactive({
  password: "",
  confirmPassword: "",
  affiliation: "",
  expertiseTracks: "",
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

function validateReviewerForm() {
  errors.affiliation = "";
  errors.expertiseTracks = "";
  if (account.value?.role !== "reviewer") return true;
  if (!affiliation.value.trim()) {
    errors.affiliation = "กรุณากรอกสังกัด/หน่วยงาน";
    return false;
  }
  if (expertiseTracks.value.length === 0) {
    errors.expertiseTracks = "กรุณาเลือกสาขาความเชี่ยวชาญอย่างน้อย 1 สาขา";
    return false;
  }
  return true;
}

function toggleTrack(track: number) {
  expertiseTracks.value = expertiseTracks.value.includes(track)
    ? expertiseTracks.value.filter((value) => value !== track)
    : [...expertiseTracks.value, track];
}

onMounted(async () => {
  if (!token.value) {
    loading.value = false;
    return;
  }
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: SetupAccount }>(
      `${apiBase}/auth/setup-password/${encodeURIComponent(token.value)}`,
    ),
  );
  loading.value = false;
  if (error) {
    showError(error);
    return;
  }
  account.value = data!.data;
  affiliation.value = data!.data.affiliation ?? "";
  expertiseTracks.value = [...data!.data.expertiseTracks];
});

async function submit() {
  if (!validatePasswordForm()) return;
  if (!validateReviewerForm()) return;
  saving.value = true;
  const body: Record<string, unknown> = {
    token: token.value,
    password: password.value,
  };
  if (account.value?.role === "reviewer") {
    body.affiliation = affiliation.value.trim();
    body.expertiseTracks = expertiseTracks.value;
  }
  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/auth/setup-password`, {
      method: "POST",
      body,
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
        <UButton to="/auth/login" color="primary">เข้าสู่ระบบ</UButton>
      </div>
      <form v-else-if="account" class="space-y-4" @submit.prevent="submit">
        <div>
          <h1 class="text-xl font-semibold">ตั้งรหัสผ่าน</h1>
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

        <template v-if="account.role === 'reviewer'">
          <div class="border-t border-gray-200 pt-4 space-y-4">
            <p class="text-sm text-gray-600">
              กรุณากรอกข้อมูลของท่านเพื่อให้ผู้จัดงานสามารถมอบหมายผลงานที่ตรงกับความเชี่ยวชาญได้อย่างเหมาะสม
            </p>
            <UFormGroup label="สังกัด/หน่วยงาน" required :error="errors.affiliation">
              <UInput
                v-model="affiliation"
                placeholder="เช่น มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ"
                @input="errors.affiliation = ''"
              />
            </UFormGroup>
            <UFormGroup label="สาขาความเชี่ยวชาญ" required :error="errors.expertiseTracks">
              <div class="space-y-2">
                <label v-for="(label, track) in TRACKS" :key="track" class="flex gap-2 text-sm">
                  <input
                    type="checkbox"
                    :checked="expertiseTracks.includes(Number(track))"
                    @change="toggleTrack(Number(track)); errors.expertiseTracks = ''"
                  />
                  <span>{{ label }}</span>
                </label>
              </div>
            </UFormGroup>
          </div>
        </template>

        <UButton type="submit" block color="primary" :loading="saving">บันทึกรหัสผ่าน</UButton>
      </form>
      <div v-else class="text-center py-8 text-gray-500">
        ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว
      </div>
    </UCard>
  </div>
</template>
