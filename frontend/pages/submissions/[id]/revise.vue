<script setup lang="ts">
definePageMeta({ middleware: ['auth'] });

const route = useRoute();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const authStore = useAuthStore();
const { handleApiCall, showError, showSuccess } = useApiError();

const submissionTitle = ref('');
const changelog = ref('');
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const done = ref(false);

const headers = computed(() => ({
  Authorization: `Bearer ${authStore.token}`,
}));

// Load submission title
onMounted(async () => {
  const { data } = await handleApiCall(() =>
    $fetch<{ success: true; data: { title: string; status: string } }>(
      `${apiBase}/submissions/${route.params.id}`,
      { headers: headers.value }
    )
  );
  if (data?.data.status !== 'revision_requested') {
    await navigateTo(`/submissions/${route.params.id}`);
    return;
  }
  submissionTitle.value = data.data.title;
});

const submitRevision = async () => {
  if (!selectedFile.value) return;
  uploading.value = true;

  const formData = new FormData();
  formData.append('file', selectedFile.value);
  if (changelog.value.trim()) {
    formData.append('changelog', changelog.value.trim());
  }

  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/submissions/${route.params.id}/revise`, {
      method: 'POST',
      headers: headers.value,
      body: formData,
    })
  );

  uploading.value = false;
  if (error) { showError(error); return; }

  showSuccess('ส่งผลงานที่แก้ไขเรียบร้อยแล้ว');
  done.value = true;
};
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-12">
    <NuxtLink
      :to="`/submissions/${route.params.id}`"
      class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6"
    >
      <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
      กลับหน้ารายละเอียด
    </NuxtLink>

    <!-- Success state -->
    <UCard v-if="done">
      <div class="flex flex-col items-center py-8 gap-4 text-center">
        <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
          <UIcon name="i-heroicons-check-circle" class="w-10 h-10 text-primary-600" />
        </div>
        <h2 class="text-xl font-semibold text-gray-900">ส่งผลงานที่แก้ไขเรียบร้อยแล้ว</h2>
        <p class="text-sm text-gray-500">คณะกรรมการจะพิจารณาผลงานที่แก้ไขของคุณโดยเร็ว</p>
        <div class="flex gap-3 mt-2">
          <UButton color="gray" variant="soft" :to="`/submissions/${route.params.id}`">ดูรายละเอียด</UButton>
          <UButton color="primary" to="/dashboard">กลับแดชบอร์ด</UButton>
        </div>
      </div>
    </UCard>

    <!-- Revise form -->
    <UCard v-else>
      <template #header>
        <div>
          <h1 class="font-bold text-gray-900">ส่งผลงานที่แก้ไข</h1>
          <p v-if="submissionTitle" class="text-sm text-gray-500 mt-0.5 line-clamp-1">{{ submissionTitle }}</p>
        </div>
      </template>

      <div class="space-y-6">
        <div>
          <p class="text-sm font-medium text-gray-700 mb-2">ไฟล์ผลงานที่แก้ไข (PDF) <span class="text-red-500">*</span></p>
          <CommonFileUpload
            :loading="uploading"
            :max-size-mb="50"
            @change="selectedFile = $event"
          />
        </div>

        <UFormGroup label="บันทึกการแก้ไข (Changelog)" hint="อธิบายสิ่งที่แก้ไขตามข้อเสนอแนะ">
          <UTextarea
            v-model="changelog"
            placeholder="เช่น แก้ไขตามข้อเสนอแนะของคณะกรรมการ ข้อ 1-3, เพิ่มเติมข้อมูลในส่วนวิธีการวิจัย..."
            :rows="4"
          />
        </UFormGroup>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <UButton color="gray" variant="ghost" :to="`/submissions/${route.params.id}`">
            ยกเลิก
          </UButton>
          <UButton
            color="primary"
            :loading="uploading"
            :disabled="!selectedFile"
            @click="submitRevision"
          >
            ส่งผลงานที่แก้ไข
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
