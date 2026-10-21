<script setup lang="ts">
export interface SelectedSlotFiles {
  abstractPdf: File | null;
  abstractWord: File | null;
  fullPaperPdf: File | null;
  fullPaperWord: File | null;
}

const props = defineProps<{
  abstractFileUrl?: string | null;
  abstractWordFileUrl?: string | null;
  fullPaperFileUrl?: string | null;
  fullPaperWordFileUrl?: string | null;
  editable?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'update:files': [files: SelectedSlotFiles];
}>();

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;

const fileLink = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  try { return new URL(apiBase).origin + url; } catch { return url; }
};

const abstractPdfRef = ref<{ clearFile: () => void } | null>(null);
const abstractWordRef = ref<{ clearFile: () => void } | null>(null);
const fullPaperPdfRef = ref<{ clearFile: () => void } | null>(null);
const fullPaperWordRef = ref<{ clearFile: () => void } | null>(null);

const selected = reactive<SelectedSlotFiles>({
  abstractPdf: null,
  abstractWord: null,
  fullPaperPdf: null,
  fullPaperWord: null,
});

const setSlot = (key: keyof SelectedSlotFiles, file: File | null) => {
  selected[key] = file;
  emit('update:files', { ...selected });
};

const clearAll = () => {
  selected.abstractPdf = null;
  selected.abstractWord = null;
  selected.fullPaperPdf = null;
  selected.fullPaperWord = null;
  abstractPdfRef.value?.clearFile();
  abstractWordRef.value?.clearFile();
  fullPaperPdfRef.value?.clearFile();
  fullPaperWordRef.value?.clearFile();
  emit('update:files', { ...selected });
};

defineExpose({ clearAll, selected });
</script>

<template>
  <div class="space-y-5">
    <!-- หมวดบทคัดย่อ -->
    <div class="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/40">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-document" class="w-5 h-5 text-primary-600" />
        <h4 class="font-semibold text-sm text-gray-900">1. บทคัดย่อ (Abstract)</h4>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- Abstract PDF -->
        <div class="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-medium text-gray-700 flex items-center gap-1.5">
              <UBadge color="red" variant="soft" size="xs">PDF</UBadge>
              ไฟล์บทคัดย่อ (.pdf)
            </span>
            <a
              v-if="abstractFileUrl"
              :href="fileLink(abstractFileUrl)"
              target="_blank"
              class="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 hover:underline"
            >
              <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
              ดาวน์โหลดไฟล์ปัจจุบัน
            </a>
            <span v-else class="text-xs text-gray-400">ยังไม่มีไฟล์</span>
          </div>
          <CommonFileUpload
            v-if="editable"
            ref="abstractPdfRef"
            compact
            accept=".pdf"
            :max-size-mb="50"
            :loading="loading"
            @change="setSlot('abstractPdf', $event)"
            @clear="setSlot('abstractPdf', null)"
          />
        </div>

        <!-- Abstract Word -->
        <div class="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-medium text-gray-700 flex items-center gap-1.5">
              <UBadge color="blue" variant="soft" size="xs">Word</UBadge>
              ไฟล์บทคัดย่อ (.doc, .docx)
            </span>
            <a
              v-if="abstractWordFileUrl"
              :href="fileLink(abstractWordFileUrl)"
              target="_blank"
              class="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 hover:underline"
            >
              <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
              ดาวน์โหลดไฟล์ปัจจุบัน
            </a>
            <span v-else class="text-xs text-gray-400">ยังไม่มีไฟล์</span>
          </div>
          <CommonFileUpload
            v-if="editable"
            ref="abstractWordRef"
            compact
            accept=".doc,.docx"
            :max-size-mb="50"
            :loading="loading"
            @change="setSlot('abstractWord', $event)"
            @clear="setSlot('abstractWord', null)"
          />
        </div>
      </div>
    </div>

    <!-- หมวดบทความฉบับสมบูรณ์ -->
    <div class="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/40">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-emerald-600" />
        <h4 class="font-semibold text-sm text-gray-900">2. บทความฉบับสมบูรณ์ (Full Paper)</h4>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- Full Paper PDF -->
        <div class="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-medium text-gray-700 flex items-center gap-1.5">
              <UBadge color="red" variant="soft" size="xs">PDF</UBadge>
              ไฟล์ฉบับสมบูรณ์ (.pdf)
            </span>
            <a
              v-if="fullPaperFileUrl"
              :href="fileLink(fullPaperFileUrl)"
              target="_blank"
              class="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 hover:underline"
            >
              <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
              ดาวน์โหลดไฟล์ปัจจุบัน
            </a>
            <span v-else class="text-xs text-gray-400">ยังไม่มีไฟล์</span>
          </div>
          <CommonFileUpload
            v-if="editable"
            ref="fullPaperPdfRef"
            compact
            accept=".pdf"
            :max-size-mb="50"
            :loading="loading"
            @change="setSlot('fullPaperPdf', $event)"
            @clear="setSlot('fullPaperPdf', null)"
          />
        </div>

        <!-- Full Paper Word -->
        <div class="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-medium text-gray-700 flex items-center gap-1.5">
              <UBadge color="blue" variant="soft" size="xs">Word</UBadge>
              ไฟล์ฉบับสมบูรณ์ (.doc, .docx)
            </span>
            <a
              v-if="fullPaperWordFileUrl"
              :href="fileLink(fullPaperWordFileUrl)"
              target="_blank"
              class="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 hover:underline"
            >
              <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
              ดาวน์โหลดไฟล์ปัจจุบัน
            </a>
            <span v-else class="text-xs text-gray-400">ยังไม่มีไฟล์</span>
          </div>
          <CommonFileUpload
            v-if="editable"
            ref="fullPaperWordRef"
            compact
            accept=".doc,.docx"
            :max-size-mb="50"
            :loading="loading"
            @change="setSlot('fullPaperWord', $event)"
            @clear="setSlot('fullPaperWord', null)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
