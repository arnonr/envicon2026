<script setup lang="ts">
const props = defineProps<{
  accept?: string;
  maxSizeMb?: number;
  loading?: boolean;
}>();

const emit = defineEmits<{ change: [file: File] }>();

const toast = useToast();
const isDragging = ref(false);
const selectedFile = ref<File | null>(null);
const inputRef = ref<HTMLInputElement>();

const handleFile = (file: File) => {
  if (props.maxSizeMb && file.size > props.maxSizeMb * 1024 * 1024) {
    toast.add({ title: 'ไฟล์ใหญ่เกินไป', description: `ขนาดไม่เกิน ${props.maxSizeMb} MB`, color: 'red' });
    return;
  }
  selectedFile.value = file;
  emit('change', file);
};

const onDrop = (e: DragEvent) => {
  isDragging.value = false;
  const file = e.dataTransfer?.files[0];
  if (file) handleFile(file);
};

const onInputChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) handleFile(file);
};

const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
</script>

<template>
  <div
    class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors select-none"
    :class="isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
    @click="inputRef?.click()"
  >
    <input ref="inputRef" type="file" :accept="accept ?? '.pdf'" class="hidden" @change="onInputChange" />

    <div v-if="loading" class="flex flex-col items-center gap-2 text-primary-600">
      <UIcon name="i-heroicons-arrow-up-tray" class="w-8 h-8 animate-bounce" />
      <p class="text-sm">กำลังอัปโหลด...</p>
    </div>
    <div v-else-if="selectedFile" class="flex flex-col items-center gap-2">
      <UIcon name="i-heroicons-document-check" class="w-8 h-8 text-primary-600" />
      <p class="font-medium text-gray-800 text-sm">{{ selectedFile.name }}</p>
      <p class="text-xs text-gray-500">{{ formatSize(selectedFile.size) }}</p>
      <p class="text-xs text-primary-500">คลิกเพื่อเปลี่ยนไฟล์</p>
    </div>
    <div v-else class="flex flex-col items-center gap-2">
      <UIcon name="i-heroicons-arrow-up-tray" class="w-8 h-8 text-gray-400" />
      <p class="text-sm text-gray-600">
        ลากและวางไฟล์ หรือ <span class="text-primary-600 font-semibold">คลิกเพื่อเลือก</span>
      </p>
      <p class="text-xs text-gray-400">PDF เท่านั้น{{ maxSizeMb ? ` · ไม่เกิน ${maxSizeMb} MB` : '' }}</p>
    </div>
  </div>
</template>
