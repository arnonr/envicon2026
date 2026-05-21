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
});

const submitting = ref(false);
const success = ref(false);

async function handleSubmit() {
  submitting.value = true;
  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/public/register`, {
      method: "POST",
      body: form.value,
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
    form.value = { fullName: "", affiliation: "", phone: "", email: "" };
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
            @click="close"
          />
        </div>
      </template>

      <div v-if="success" class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-meadow-100 flex items-center justify-center">
          <UIcon name="i-heroicons-check-circle" class="w-10 h-10 text-meadow-600" />
        </div>
        <h4 class="text-lg font-semibold text-meadow-800 mb-2">ลงทะเบียนสำเร็จ!</h4>
        <p class="text-gray-500">ขอบคุณที่สนใจเข้าร่วมงาน ENVICON 2026</p>
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
