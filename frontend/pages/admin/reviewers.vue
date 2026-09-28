<script setup lang="ts">
definePageMeta({ middleware: ["auth", "role"] });

interface Reviewer {
  id: string;
  name: string;
  email: string;
  affiliation: string | null;
  active: boolean;
  hasPassword: boolean;
  expertiseTracks: number[];
  maxConcurrentReviews: number;
  activeReviewCount: number;
  completedReviewCount: number;
  invitationStatus: "pending" | "sent" | "failed" | null;
}

const TRACKS: Record<number, string> = {
  1: "วิทยาศาสตร์สิ่งแวดล้อมฯ (Environmental Science)",
  2: "การจัดการระบบนิเวศฯ (Ecosystem Management)",
  3: "เศรษฐกิจหมุนเวียนฯ (Circular Economy)",
  4: "การเปลี่ยนแปลงสภาพภูมิอากาศฯ (Climate Change)",
  5: "เทคโนโลยีดิจิทัลฯ (Digital Technology)",
  6: "เมืองยั่งยืนฯ (Sustainable Cities)",
  7: "สิ่งแวดล้อมและสุขภาพ (Environment and Health)",
};

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { handleApiCall, showError, showSuccess } = useApiError();
const headers = computed(() => ({ Authorization: `Bearer ${authStore.token}` }));

const reviewers = ref<Reviewer[]>([]);
const loading = ref(true);
const saving = ref(false);
const invitationSending = ref<string | null>(null);
const editingId = ref<string | null>(null);
const form = reactive({
  name: "",
  email: "",
  affiliation: "",
  expertiseTracks: [] as number[],
  maxConcurrentReviews: 5,
  active: true,
});

async function fetchReviewers() {
  loading.value = true;
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: Reviewer[] }>(`${apiBase}/admin/reviewers`, { headers: headers.value }),
  );
  loading.value = false;
  if (error) return showError(error);
  reviewers.value = data!.data;
}

function resetForm() {
  editingId.value = null;
  form.name = "";
  form.email = "";
  form.affiliation = "";
  form.expertiseTracks = [];
  form.maxConcurrentReviews = 5;
  form.active = true;
}

function editReviewer(reviewer: Reviewer) {
  editingId.value = reviewer.id;
  form.name = reviewer.name;
  form.email = reviewer.email;
  form.affiliation = reviewer.affiliation ?? "";
  form.expertiseTracks = [...reviewer.expertiseTracks];
  form.maxConcurrentReviews = reviewer.maxConcurrentReviews;
  form.active = reviewer.active;
}

function toggleTrack(track: number) {
  form.expertiseTracks = form.expertiseTracks.includes(track)
    ? form.expertiseTracks.filter((value) => value !== track)
    : [...form.expertiseTracks, track];
}

async function saveReviewer() {
  if (!form.name.trim() || (!editingId.value && !form.email.trim())) return;
  saving.value = true;
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    maxConcurrentReviews: Number(form.maxConcurrentReviews),
    active: form.active,
  };
  if (editingId.value) {
    payload.affiliation = form.affiliation.trim() || null;
    payload.expertiseTracks = form.expertiseTracks;
  }
  const { error } = await handleApiCall(() =>
    editingId.value
      ? $fetch(`${apiBase}/admin/reviewers/${editingId.value}`, { method: "PATCH", headers: headers.value, body: payload })
      : $fetch(`${apiBase}/admin/reviewers`, { method: "POST", headers: headers.value, body: { ...payload, email: form.email.trim().toLowerCase() } }),
  );
  saving.value = false;
  if (error) return showError(error);
  showSuccess(editingId.value ? "แก้ไขผู้รีวิวเรียบร้อย" : "สร้างผู้รีวิวและดำเนินการส่งคำเชิญแล้ว");
  resetForm();
  await fetchReviewers();
}

async function resendInvitation(id: string) {
  invitationSending.value = id;
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: { status: "sent" | "failed"; error?: string } }>(
      `${apiBase}/admin/reviewers/${id}/resend-invitation`,
      { method: "POST", headers: headers.value },
    ),
  );
  invitationSending.value = null;
  if (error) return showError(error);
  if (data!.data.status === "failed") {
    showError({ status: 502, error: data!.data.error || "ส่งอีเมลไม่สำเร็จ" });
  } else {
    showSuccess("ส่งคำเชิญเรียบร้อย");
  }
}

const resetModalOpen = ref(false);
const resetStep = ref<"form" | "result">("form");
const targetReviewer = ref<Reviewer | null>(null);
const newPasswordInput = ref("");
const resetting = ref(false);
const displayedPassword = ref("");
const copied = ref(false);

function openResetPasswordModal(reviewer: Reviewer) {
  targetReviewer.value = reviewer;
  newPasswordInput.value = "";
  displayedPassword.value = "";
  resetStep.value = "form";
  copied.value = false;
  resetModalOpen.value = true;
}

function generateRandomPassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*";
  const all = upper + lower + digits + special;

  const array = new Uint8Array(10);
  crypto.getRandomValues(array);
  const chars = [
    upper[array[0] % upper.length],
    lower[array[1] % lower.length],
    digits[array[2] % digits.length],
    special[array[3] % special.length],
  ];
  for (let i = 4; i < 10; i++) {
    chars.push(all[array[i] % all.length]);
  }
  for (let i = chars.length - 1; i > 0; i--) {
    const j = array[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  newPasswordInput.value = chars.join("");
}

async function copyToClipboard(text: string) {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 3000);
  } catch {
    showError({ status: 500, error: "ไม่สามารถคัดลอกได้ กรุณาคัดลอกด้วยตนเอง" });
  }
}

async function copyPassword() {
  if (!displayedPassword.value) return;
  await copyToClipboard(displayedPassword.value);
  showSuccess("คัดลอกรหัสผ่านเรียบร้อย");
}

async function copyAllLoginInfo() {
  if (!targetReviewer.value) return;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const loginUrl = `${origin}/envicon2026/auth/login`;
  const text = `ข้อมูลเข้าสู่ระบบกรรมการ ENVICON 2026\nผู้ใช้งาน: ${targetReviewer.value.name}\nอีเมล: ${targetReviewer.value.email}\nรหัสผ่าน: ${displayedPassword.value}\nเข้าสู่ระบบได้ที่: ${loginUrl}`;
  await copyToClipboard(text);
  showSuccess("คัดลอกข้อมูลเข้าสู่ระบบเรียบร้อย");
}

async function confirmResetPassword() {
  if (!targetReviewer.value) return;
  if (newPasswordInput.value.trim() && newPasswordInput.value.trim().length < 8) {
    showError({ status: 400, error: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร" });
    return;
  }

  resetting.value = true;
  const payload = newPasswordInput.value.trim() ? { password: newPasswordInput.value.trim() } : {};
  const { data, error } = await handleApiCall(() =>
    $fetch<{ success: true; data: { id: string; name: string; email: string; password: string } }>(
      `${apiBase}/admin/reviewers/${targetReviewer.value!.id}/reset-password`,
      {
        method: "POST",
        headers: headers.value,
        body: payload,
      },
    ),
  );
  resetting.value = false;
  if (error) return showError(error);

  displayedPassword.value = data!.data.password;
  resetStep.value = "result";
  showSuccess("รีเซ็ตรหัสผ่านเรียบร้อยแล้ว");
  await fetchReviewers();
}

onMounted(fetchReviewers);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">จัดการผู้รีวิว</h1>
        <p class="text-sm text-gray-500">สร้างบัญชี กำหนดสาขาความเชี่ยวชาญ และติดตามภาระงาน</p>
      </div>
      <UButton color="gray" variant="ghost" to="/admin">กลับแผงผู้ดูแล</UButton>
    </div>

    <div class="grid lg:grid-cols-[360px_1fr] gap-6">
      <UCard>
        <template #header>
          <h2 class="font-semibold">{{ editingId ? "แก้ไขผู้รีวิว" : "เพิ่มผู้รีวิว" }}</h2>
        </template>
        <form novalidate class="space-y-4" @submit.prevent="saveReviewer">
          <UFormGroup label="ชื่อ-นามสกุล (Full Name)" required>
            <UInput v-model="form.name" />
          </UFormGroup>
          <UFormGroup label="อีเมล (Email)" required>
            <UInput v-model.trim="form.email" type="email" :disabled="Boolean(editingId)" />
          </UFormGroup>
          <UFormGroup label="จำนวนงานแนะนำสูงสุด (Maximum Concurrent Reviews)">
            <UInput v-model.number="form.maxConcurrentReviews" type="number" min="1" />
          </UFormGroup>
          <template v-if="editingId">
            <UFormGroup label="สังกัด (Affiliation)">
              <UInput v-model="form.affiliation" placeholder="ปล่อยว่างได้หากผู้รีวิวยังไม่ได้ระบุ" />
            </UFormGroup>
            <UFormGroup label="สาขาความเชี่ยวชาญ (Areas of Expertise)">
              <label v-for="(label, track) in TRACKS" :key="track" class="flex gap-2 text-sm mb-2">
                <input type="checkbox" :checked="form.expertiseTracks.includes(Number(track))" @change="toggleTrack(Number(track))" />
                <span>{{ label }}</span>
              </label>
            </UFormGroup>
            <label class="flex items-center gap-2 text-sm">
              <input v-model="form.active" type="checkbox" />
              เปิดรับงานรีวิวใหม่
            </label>
          </template>
          <p v-else class="text-xs text-gray-500">
            สังกัดและสาขาความเชี่ยวชาญจะให้ผู้รีวิวระบุเองในขั้นตอนตั้งรหัสผ่านครั้งแรก
          </p>
          <div class="flex gap-2">
            <UButton type="submit" color="primary" :loading="saving">{{ editingId ? "บันทึก" : "สร้างและส่งคำเชิญ" }}</UButton>
            <UButton v-if="editingId" color="gray" variant="soft" @click="resetForm">ยกเลิก</UButton>
          </div>
        </form>
      </UCard>

      <UCard>
        <div v-if="loading" class="flex justify-center py-12">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
        </div>
        <div v-else-if="reviewers.length === 0" class="text-center py-12 text-gray-400">ยังไม่มีผู้รีวิว</div>
        <div v-else class="space-y-4">
          <div v-for="reviewer in reviewers" :key="reviewer.id" class="border rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <p class="font-medium">{{ reviewer.name }}</p>
                <UBadge :color="reviewer.active ? 'green' : 'gray'" variant="soft" size="xs">{{ reviewer.active ? "เปิดรับงาน" : "ปิดรับงาน" }}</UBadge>
                <UBadge :color="reviewer.hasPassword ? 'blue' : 'yellow'" variant="soft" size="xs">{{ reviewer.hasPassword ? "เปิดใช้งานแล้ว" : "รอตั้งรหัสผ่าน" }}</UBadge>
                <UBadge v-if="reviewer.invitationStatus === 'failed'" color="red" variant="soft" size="xs">ส่งคำเชิญไม่สำเร็จ</UBadge>
              </div>
              <p class="text-sm text-gray-500">
                {{ reviewer.email }}
                <span v-if="reviewer.affiliation"> | {{ reviewer.affiliation }}</span>
                <span v-else class="text-gray-400"> | ยังไม่ได้ระบุสังกัด</span>
              </p>
              <div class="flex flex-wrap gap-1 mt-2">
                <template v-if="reviewer.expertiseTracks.length">
                  <UBadge v-for="track in reviewer.expertiseTracks" :key="track" color="primary" variant="soft" size="xs">{{ TRACKS[track] }}</UBadge>
                </template>
                <UBadge v-else color="yellow" variant="soft" size="xs">ยังไม่ได้ระบุสาขาความเชี่ยวชาญ</UBadge>
              </div>
              <p class="text-xs text-gray-500 mt-2">งานค้าง {{ reviewer.activeReviewCount }}/{{ reviewer.maxConcurrentReviews }} | เสร็จแล้ว {{ reviewer.completedReviewCount }}</p>
            </div>
            <div class="flex flex-wrap gap-2 items-start">
              <UButton size="xs" color="gray" variant="soft" @click="editReviewer(reviewer)">แก้ไข</UButton>
              <UButton size="xs" color="amber" variant="soft" icon="i-heroicons-key" @click="openResetPasswordModal(reviewer)">รีเซ็ตรหัสผ่าน</UButton>
              <UButton size="xs" color="primary" variant="soft" :loading="invitationSending === reviewer.id" @click="resendInvitation(reviewer.id)">ส่งคำเชิญซ้ำ</UButton>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Modal รีเซ็ตรหัสผ่านกรรมการ -->
    <UModal v-model="resetModalOpen" :ui="{ width: 'sm:max-w-md' }">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-key" class="w-5 h-5 text-amber-500" />
            <h3 class="font-semibold text-gray-900">รีเซ็ตรหัสผ่านกรรมการ</h3>
          </div>
        </template>

        <!-- ขั้นตอนที่ 1: กำหนดรหัสผ่าน หรือสุ่มรหัสผ่าน -->
        <div v-if="resetStep === 'form'" class="space-y-4">
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
            <p class="font-medium text-gray-900">{{ targetReviewer?.name }}</p>
            <p class="text-gray-500 text-xs mt-0.5">{{ targetReviewer?.email }}</p>
            <p v-if="targetReviewer?.affiliation" class="text-gray-500 text-xs">{{ targetReviewer?.affiliation }}</p>
          </div>

          <UFormGroup
            label="รหัสผ่านใหม่ (New Password)"
            help="สามารถคลิก 'สุ่มรหัส' เพื่อให้ระบบสุ่มรหัสผ่านให้ หรือพิมพ์เองอย่างน้อย 8 ตัวอักษร (หากเว้นว่างไว้ ระบบจะสุ่มให้อัตโนมัติ)"
          >
            <div class="flex gap-2">
              <UInput
                v-model="newPasswordInput"
                type="text"
                placeholder="เว้นว่างไว้เพื่อสุ่มอัตโนมัติ"
                class="flex-1 font-mono"
              />
              <UButton
                color="gray"
                variant="soft"
                size="sm"
                icon="i-heroicons-arrow-path"
                @click="generateRandomPassword"
              >
                สุ่มรหัส
              </UButton>
            </div>
          </UFormGroup>

          <div class="rounded-md bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 flex gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p class="font-medium">ข้อควรระวัง:</p>
              <p class="mt-0.5">เมื่อรีเซ็ตแล้ว รหัสผ่านเดิมจะถูกเปลี่ยนทันที และระบบจะแสดงรหัสผ่านใหม่เพื่อให้ Admin นำไปแจ้งกรรมการ</p>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <UButton color="gray" variant="ghost" @click="resetModalOpen = false">ยกเลิก</UButton>
            <UButton
              color="amber"
              :loading="resetting"
              @click="confirmResetPassword"
            >
              ยืนยันรีเซ็ตรหัสผ่าน
            </UButton>
          </div>
        </div>

        <!-- ขั้นตอนที่ 2: แสดงรหัสผ่านใหม่ให้ Admin ทราบ -->
        <div v-else class="space-y-4">
          <div class="text-center py-1">
            <div class="w-12 h-12 rounded-full bg-green-100 text-green-600 mx-auto flex items-center justify-center mb-2">
              <UIcon name="i-heroicons-check" class="w-6 h-6" />
            </div>
            <h4 class="font-semibold text-gray-900 text-base">รีเซ็ตรหัสผ่านสำเร็จ</h4>
            <p class="text-xs text-gray-500 mt-1">
              กรรมการ: <span class="font-medium text-gray-800">{{ targetReviewer?.name }}</span> ({{ targetReviewer?.email }})
            </p>
          </div>

          <div class="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 text-center">
            <p class="text-xs font-medium text-amber-900 mb-1">รหัสผ่านใหม่สำหรับเข้าสู่ระบบ</p>
            <div class="flex items-center justify-center gap-2 mt-2">
              <code class="font-mono text-xl font-bold tracking-wider text-gray-900 bg-white px-3 py-1.5 rounded border border-amber-200 select-all">
                {{ displayedPassword }}
              </code>
              <UButton
                :color="copied ? 'green' : 'amber'"
                :icon="copied ? 'i-heroicons-check' : 'i-heroicons-clipboard-document'"
                size="sm"
                @click="copyPassword"
              >
                {{ copied ? "คัดลอกแล้ว" : "คัดลอกรหัสผ่าน" }}
              </UButton>
            </div>
          </div>

          <div class="space-y-2">
            <UButton
              block
              color="gray"
              variant="outline"
              size="sm"
              icon="i-heroicons-document-duplicate"
              @click="copyAllLoginInfo"
            >
              คัดลอกข้อความแจ้งกรรมการ (อีเมล + รหัสผ่าน + ลิงก์)
            </UButton>
          </div>

          <div class="rounded-md bg-blue-50 p-3 text-xs text-blue-800 border border-blue-200 flex gap-2">
            <UIcon name="i-heroicons-information-circle" class="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
            <div>
              <p class="font-medium">คำแนะนำสำหรับ Admin:</p>
              <p class="mt-0.5">โปรดคัดลอกรหัสผ่านนี้ส่งให้กรรมการทางช่องทางติดต่อส่วนตัว เนื่องจากระบบจะไม่แสดงรหัสผ่านนี้อีกครั้งเพื่อความปลอดภัย</p>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <UButton color="primary" @click="resetModalOpen = false">ปิดหน้าต่าง</UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>
