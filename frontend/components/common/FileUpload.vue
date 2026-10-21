<script setup lang="ts">
const props = defineProps<{
  accept?: string;
  maxSizeMb?: number;
  loading?: boolean;
  compact?: boolean;
}>();

const emit = defineEmits<{
  change: [file: File];
  clear: [];
}>();

const toast = useToast();
const isDragging = ref(false);
const selectedFile = ref<File | null>(null);
const inputRef = ref<HTMLInputElement>();

const effectiveAccept = computed(() => props.accept ?? '.pdf');

const allowedExtensions = computed(() =>
  effectiveAccept.value
    .split(',')
    .map(ext => ext.trim().replace(/^\./, '').toLowerCase())
    .filter(Boolean)
);

const acceptLabel = computed(() => {
  const exts = allowedExtensions.value;
  if (exts.length === 1 && exts[0] === 'pdf') return 'PDF เท่านั้น';
  if (exts.includes('doc') || exts.includes('docx')) return 'Word (.doc, .docx) เท่านั้น';
  return 'PDF, PNG, JPG';
});

const handleFile = (file: File) => {
  const ext = (file.name.split('.').pop() ?? '').toLowerCase();
  if (allowedExtensions.value.length && !allowedExtensions.value.includes(ext)) {
    toast.add({
      title: 'นามสกุลไฟล์ไม่ถูกต้อง',
      description: `กรุณาเลือกไฟล์ ${acceptLabel.value}`,
      color: 'red',
    });
    return;
  }
  if (props.maxSizeMb && file.size > props.maxSizeMb * 1024 * 1024) {
    toast.add({ title: 'ไฟล์ใหญ่เกินไป', description: `ขนาดไม่เกิน ${props.maxSizeMb} MB`, color: 'red' });
    return;
  }
  selectedFile.value = file;
  emit('change', file);
};

const clearFile = () => {
  selectedFile.value = null;
  if (inputRef.value) inputRef.value.value = '';
  emit('clear');
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

defineExpose({ clearFile });
</script>

<template>
  <div
    class="border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors select-none"
    :class="[
      compact ? 'p-4' : 'p-8',
      isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400',
    ]"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
    @click="inputRef?.click()"
  >
    <input ref="inputRef" type="file" :accept="effectiveAccept" class="hidden" @change="onInputChange" />

    <div v-if="loading" class="flex flex-col items-center gap-2 text-primary-600">
      <UIcon name="i-heroicons-arrow-up-tray" :class="compact ? 'w-6 h-6' : 'w-8 h-8'" class="animate-bounce" />
      <p class="text-sm">กำลังอัปโหลด...</p>
    </div>
    <div v-else-if="selectedFile" class="flex flex-col items-center gap-1.5">
      <UIcon name="i-heroicons-document-check" :class="compact ? 'w-6 h-6' : 'w-8 h-8'" class="text-primary-600" />
      <p class="font-medium text-gray-800 text-sm break-all line-clamp-1">{{ selectedFile.name }}</p>
      <p class="text-xs text-gray-500">{{ formatSize(selectedFile.size) }}</p>
      <div class="flex items-center gap-3 mt-0.5">
        <span class="text-xs text-primary-500">คลิกเพื่อเปลี่ยนไฟล์</span>
        <button
          type="button"
          class="text-xs text-red-500 hover:text-red-700 hover:underline"
          @click.stop="clearFile"
        >
          ยกเลิกไฟล์นี้
        </button>
      </div>
    </div>
    <div v-else class="flex flex-col items-center gap-1.5">
      <UIcon name="i-heroicons-arrow-up-tray" :class="compact ? 'w-6 h-6' : 'w-8 h-8'" class="text-gray-400" />
      <p class="text-sm text-gray-600">
        ลากและวางไฟล์ หรือ <span class="text-primary-600 font-semibold">คลิกเพื่อเลือก</span>
      </p>
      <p class="text-xs text-gray-400">{{ acceptLabel }}{{ maxSizeMb ? ` · ไม่เกิน ${maxSizeMb} MB` : '' }}</p>
    </div>
  </div>
</template>
