<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const { handleApiCall, showError, showSuccess } = useApiError();

const form = ref({
  fullName: "",
  affiliation: "",
  phone: "",
  email: "",
  feeType: "general" as "student" | "general",
});

const feeTable = [
  { type: "student" as const, label: "นิสิต/นักศึกษา", earlyBird: 500, regular: 700 },
  { type: "general" as const, label: "อาจารย์/นักวิจัย/บุคคลทั่วไป", earlyBird: 2000, regular: 2500 },
];
const payment = {
  bank: "ธนาคารกรุงไทย",
  accountName: "กรุณาระบุชื่อบัญชี",
  accountNumber: "กรุณาระบุเลขบัญชี",
  qrImage: "/images/payment-qr-placeholder.svg",
};
const currentFee = computed(() => {
  const row = feeTable.find((item) => item.type === form.value.feeType)!;
  return new Date() <= new Date("2026-10-14T23:59:59+07:00") ? row.earlyBird : row.regular;
});
const paymentSlip = ref<File | null>(null);
const submitting = ref(false);
const success = ref(false);

function onFileChange(event: Event) {
  paymentSlip.value = (event.target as HTMLInputElement).files?.[0] || null;
}

async function handleSubmit() {
  if (submitting.value) return;

  if (form.value.fullName.trim().length < 2) {
    showError({ status: 400, error: "กรุณากรอกชื่อ-นามสกุลอย่างน้อย 2 ตัวอักษร" });
    return;
  }

  submitting.value = true;
  if (!paymentSlip.value) {
    submitting.value = false;
    showError({ status: 400, error: "กรุณาแนบหลักฐานการชำระเงิน" });
    return;
  }

  const body = new FormData();
  body.append("fullName", form.value.fullName);
  body.append("affiliation", form.value.affiliation);
  body.append("phone", form.value.phone);
  body.append("email", form.value.email);
  body.append("feeType", form.value.feeType);
  body.append("paymentSlip", paymentSlip.value);

  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/public/register`, {
      method: "POST",
      body,
    }),
  );
  submitting.value = false;

  if (error) {
    showError(error);
    return;
  }

  showSuccess("ลงทะเบียนเข้าร่วมงานสำเร็จ");
  success.value = true;
}

function close() {
  isOpen.value = false;
  setTimeout(() => {
    success.value = false;
    form.value = { fullName: "", affiliation: "", phone: "", email: "", feeType: "general" };
    paymentSlip.value = null;
  }, 300);
}
</script>

<template>
  <UModal v-model="isOpen" @close="close">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-meadow-800">ลงทะเบียนเข้าร่วมงาน</h3>
          <UButton
            icon="i-heroicons-x-mark"
            variant="ghost"
            color="gray"
            aria-label="ปิด"
            @click="close"
          />
        </div>
      </template>

      <div v-if="success" class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-meadow-100 flex items-center justify-center">
          <UIcon name="i-heroicons-check-circle" class="w-10 h-10 text-meadow-600" />
        </div>
        <h4 class="text-lg font-semibold text-meadow-800 mb-2">ลงทะเบียนสำเร็จ!</h4>
        <p class="text-gray-500 mb-4">ขอบคุณที่สนใจเข้าร่วมงาน TSHE-CON 2026</p>
        <UButton color="primary" @click="close">ปิด</UButton>
      </div>

      <form v-else class="space-y-4" @submit.prevent="handleSubmit">
        <UFormGroup label="ชื่อ-นามสกุล" required>
          <UInput
            v-model="form.fullName"
            placeholder="กรอกชื่อ-นามสกุล"
            required
          />
        </UFormGroup>

        <UFormGroup label="สังกัด">
          <UInput
            v-model="form.affiliation"
            placeholder="มหาวิทยาลัย / องค์กร"
          />
        </UFormGroup>

        <UFormGroup label="เบอร์โทรศัพท์">
          <UInput
            v-model="form.phone"
            placeholder="0XX-XXX-XXXX"
            type="tel"
          />
        </UFormGroup>

        <UFormGroup label="อีเมล" required>
          <UInput
            v-model="form.email"
            placeholder="email@example.com"
            type="email"
            required
          />
        </UFormGroup>

        <UFormGroup label="ประเภทผู้เข้าร่วม" required>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              v-for="fee in feeTable"
              :key="fee.type"
              class="flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors"
              :class="form.feeType === fee.type ? 'border-meadow-500 bg-meadow-50' : 'border-gray-200'"
            >
              <input v-model="form.feeType" type="radio" name="event-fee-type" :value="fee.type" />
              <span class="text-sm">{{ fee.label }}<br /><strong>{{ currentFee.toLocaleString() }} บาท</strong></span>
            </label>
          </div>
        </UFormGroup>

        <div class="rounded-xl border border-meadow-100 bg-meadow-50 p-4">
          <div class="flex flex-col sm:flex-row gap-4 items-center">
            <img :src="payment.qrImage" alt="QR สำหรับชำระค่าลงทะเบียน" class="w-32 h-32 rounded-lg bg-white p-2" />
            <div class="text-sm text-gray-700 space-y-1">
              <p class="font-semibold text-meadow-800">ชำระค่าลงทะเบียน {{ currentFee.toLocaleString() }} บาท</p>
              <p>{{ payment.bank }}</p>
              <p>ชื่อบัญชี: {{ payment.accountName }}</p>
              <p>เลขบัญชี: {{ payment.accountNumber }}</p>
            </div>
          </div>
        </div>

        <UFormGroup label="แนบหลักฐานการชำระเงิน" required>
          <input
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            required
            class="block w-full rounded-lg border border-gray-300 p-2 text-sm"
            @change="onFileChange"
          />
          <p class="text-xs text-gray-500 mt-1">รองรับ JPG, PNG หรือ PDF ขนาดไม่เกิน 10 MB</p>
        </UFormGroup>

        <UButton
          type="submit"
          color="primary"
          block
          size="lg"
          :loading="submitting"
          class="mt-2"
        >
          ลงทะเบียน
        </UButton>
      </form>
    </UCard>
  </UModal>
</template>
