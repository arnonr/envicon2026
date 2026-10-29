<script setup lang="ts">
export interface SelectedSlotFiles {
  abstractPdf: File | null;
  abstractWord: File | null;
  fullPaperPdf: File | null;
  fullPaperWord: File | null;
}

export type SelectedSubmissionFiles = SelectedSlotFiles;

export interface ManagedSlotUrls {
  abstractFileUrl: string | null;
  abstractWordFileUrl: string | null;
  fullPaperFileUrl: string | null;
  fullPaperWordFileUrl: string | null;
}

export interface CurrentSlotUrls {
  abstractFileUrl?: string | null;
  abstractWordFileUrl?: string | null;
  fullPaperFileUrl?: string | null;
  fullPaperWordFileUrl?: string | null;
  round1FileUrl?: string | null;
  round1FileType?: "abstract" | "full_paper" | null;
}

type FileKey = keyof SelectedSlotFiles;
type UrlKey = keyof ManagedSlotUrls;

interface SlotConfig {
  fileKey: FileKey;
  urlKey: UrlKey;
  oppositeUrlKey: UrlKey;
  oppositeCategoryLabel: string;
  badgeLabel: string;
  badgeColor: 'red' | 'blue';
  title: string;
  accept: string;
}

interface SectionConfig {
  title: string;
  icon: string;
  iconClass: string;
  slots: SlotConfig[];
}

const SECTIONS: SectionConfig[] = [
  {
    title: '1. บทคัดย่อ (Abstract)',
    icon: 'i-heroicons-document',
    iconClass: 'text-primary-600',
    slots: [
      {
        fileKey: 'abstractPdf',
        urlKey: 'abstractFileUrl',
        oppositeUrlKey: 'fullPaperFileUrl',
        oppositeCategoryLabel: 'ฉบับสมบูรณ์',
        badgeLabel: 'PDF',
        badgeColor: 'red',
        title: 'ไฟล์บทคัดย่อ (.pdf)',
        accept: '.pdf',
      },
      {
        fileKey: 'abstractWord',
        urlKey: 'abstractWordFileUrl',
        oppositeUrlKey: 'fullPaperWordFileUrl',
        oppositeCategoryLabel: 'ฉบับสมบูรณ์',
        badgeLabel: 'Word',
        badgeColor: 'blue',
        title: 'ไฟล์บทคัดย่อ (.doc, .docx)',
        accept: '.doc,.docx',
      },
    ],
  },
  {
    title: '2. บทความฉบับสมบูรณ์ (Full Paper)',
    icon: 'i-heroicons-document-text',
    iconClass: 'text-emerald-600',
    slots: [
      {
        fileKey: 'fullPaperPdf',
        urlKey: 'fullPaperFileUrl',
        oppositeUrlKey: 'abstractFileUrl',
        oppositeCategoryLabel: 'บทคัดย่อ',
        badgeLabel: 'PDF',
        badgeColor: 'red',
        title: 'ไฟล์ฉบับสมบูรณ์ (.pdf)',
        accept: '.pdf',
      },
      {
        fileKey: 'fullPaperWord',
        urlKey: 'fullPaperWordFileUrl',
        oppositeUrlKey: 'abstractWordFileUrl',
        oppositeCategoryLabel: 'บทคัดย่อ',
        badgeLabel: 'Word',
        badgeColor: 'blue',
        title: 'ไฟล์ฉบับสมบูรณ์ (.doc, .docx)',
        accept: '.doc,.docx',
      },
    ],
  },
];

const props = defineProps<{
  modelValue?: SelectedSlotFiles;
  currentUrls?: CurrentSlotUrls | null;
  abstractFileUrl?: string | null;
  abstractWordFileUrl?: string | null;
  fullPaperFileUrl?: string | null;
  fullPaperWordFileUrl?: string | null;
  editable?: boolean;
  manageExisting?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'update:files': [files: SelectedSlotFiles];
  'update:modelValue': [files: SelectedSlotFiles];
  'update:slotUrls': [urls: ManagedSlotUrls];
}>();

const initialResolvedUrls = computed<ManagedSlotUrls>(() => ({
  abstractFileUrl:
    props.abstractFileUrl
    ?? props.currentUrls?.abstractFileUrl
    ?? (props.currentUrls?.round1FileType !== 'full_paper' ? props.currentUrls?.round1FileUrl : null)
    ?? null,
  abstractWordFileUrl:
    props.abstractWordFileUrl ?? props.currentUrls?.abstractWordFileUrl ?? null,
  fullPaperFileUrl:
    props.fullPaperFileUrl
    ?? props.currentUrls?.fullPaperFileUrl
    ?? (props.currentUrls?.round1FileType === 'full_paper' ? props.currentUrls?.round1FileUrl : null)
    ?? null,
  fullPaperWordFileUrl:
    props.fullPaperWordFileUrl ?? props.currentUrls?.fullPaperWordFileUrl ?? null,
}));

const workingUrls = reactive<ManagedSlotUrls>({
  abstractFileUrl: null,
  abstractWordFileUrl: null,
  fullPaperFileUrl: null,
  fullPaperWordFileUrl: null,
});

const syncWorkingUrls = () => {
  workingUrls.abstractFileUrl = initialResolvedUrls.value.abstractFileUrl;
  workingUrls.abstractWordFileUrl = initialResolvedUrls.value.abstractWordFileUrl;
  workingUrls.fullPaperFileUrl = initialResolvedUrls.value.fullPaperFileUrl;
  workingUrls.fullPaperWordFileUrl = initialResolvedUrls.value.fullPaperWordFileUrl;
  emit('update:slotUrls', { ...workingUrls });
};

watch(initialResolvedUrls, syncWorkingUrls, { immediate: true });

const isManaging = computed(() => Boolean(props.editable && props.manageExisting));

const displayedUrl = (urlKey: UrlKey): string | null =>
  isManaging.value ? workingUrls[urlKey] : initialResolvedUrls.value[urlKey];

const isMovedIntoSlot = (urlKey: UrlKey): boolean =>
  isManaging.value
  && Boolean(workingUrls[urlKey])
  && workingUrls[urlKey] !== initialResolvedUrls.value[urlKey];

const isMarkedForRemoval = (urlKey: UrlKey, fileKey: FileKey): boolean =>
  isManaging.value
  && Boolean(initialResolvedUrls.value[urlKey])
  && !workingUrls[urlKey]
  && !selected[fileKey];

const canRestoreSlot = (urlKey: UrlKey, fileKey: FileKey): boolean => {
  if (!isMarkedForRemoval(urlKey, fileKey)) return false;
  const original = initialResolvedUrls.value[urlKey];
  if (!original) return false;
  return !Object.values(workingUrls).includes(original);
};

const moveOrSwapSlot = (urlKey: UrlKey, oppositeUrlKey: UrlKey) => {
  const source = workingUrls[urlKey];
  if (!source) return;
  const target = workingUrls[oppositeUrlKey];
  workingUrls[oppositeUrlKey] = source;
  workingUrls[urlKey] = target ?? null;
  emit('update:slotUrls', { ...workingUrls });
};

const removeSlot = (urlKey: UrlKey) => {
  workingUrls[urlKey] = null;
  emit('update:slotUrls', { ...workingUrls });
};

const restoreSlot = (urlKey: UrlKey) => {
  workingUrls[urlKey] = initialResolvedUrls.value[urlKey];
  emit('update:slotUrls', { ...workingUrls });
};

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;

const fileLink = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  try { return new URL(apiBase).origin + url; } catch { return url; }
};

const uploadRefs: Record<FileKey, { clearFile: () => void } | null> = {
  abstractPdf: null,
  abstractWord: null,
  fullPaperPdf: null,
  fullPaperWord: null,
};

const setUploadRef = (key: FileKey, el: unknown) => {
  uploadRefs[key] = (el as { clearFile: () => void } | null) ?? null;
};

const selected = reactive<SelectedSlotFiles>({
  abstractPdf: null,
  abstractWord: null,
  fullPaperPdf: null,
  fullPaperWord: null,
});

const setSlot = (key: FileKey, file: File | null) => {
  selected[key] = file;
  const next = { ...selected };
  emit('update:files', next);
  emit('update:modelValue', next);
};

const clearAll = () => {
  selected.abstractPdf = null;
  selected.abstractWord = null;
  selected.fullPaperPdf = null;
  selected.fullPaperWord = null;
  uploadRefs.abstractPdf?.clearFile();
  uploadRefs.abstractWord?.clearFile();
  uploadRefs.fullPaperPdf?.clearFile();
  uploadRefs.fullPaperWord?.clearFile();
  const next = { ...selected };
  emit('update:files', next);
  emit('update:modelValue', next);
};

const resetAll = () => {
  clearAll();
  syncWorkingUrls();
};

defineExpose({ clearAll, resetAll, selected, workingUrls });
</script>

<template>
  <div class="space-y-5">
    <div
      v-for="section in SECTIONS"
      :key="section.title"
      class="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/40"
    >
      <div class="flex items-center gap-2">
        <UIcon :name="section.icon" class="w-5 h-5" :class="section.iconClass" />
        <h4 class="font-semibold text-sm text-gray-900">{{ section.title }}</h4>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          v-for="slot in section.slots"
          :key="slot.fileKey"
          class="bg-white border border-gray-200 rounded-lg p-3 space-y-2"
        >
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <span class="text-xs font-medium text-gray-700 flex items-center gap-1.5">
              <UBadge :color="slot.badgeColor" variant="soft" size="xs">{{ slot.badgeLabel }}</UBadge>
              {{ slot.title }}
            </span>

            <div class="flex items-center gap-1.5">
              <UBadge v-if="isMovedIntoSlot(slot.urlKey) && !selected[slot.fileKey]" color="amber" variant="soft" size="xs">
                ย้ายมาช่องนี้
              </UBadge>
              <a
                v-if="displayedUrl(slot.urlKey)"
                :href="fileLink(displayedUrl(slot.urlKey))"
                target="_blank"
                class="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 hover:underline"
              >
                <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
                ดาวน์โหลดไฟล์ปัจจุบัน
              </a>
              <UBadge v-else-if="isMarkedForRemoval(slot.urlKey, slot.fileKey)" color="red" variant="soft" size="xs">
                จะลบเมื่อบันทึก
              </UBadge>
              <span v-else class="text-xs text-gray-400">ยังไม่มีไฟล์</span>
            </div>
          </div>

          <div
            v-if="isManaging && !selected[slot.fileKey] && (workingUrls[slot.urlKey] || canRestoreSlot(slot.urlKey, slot.fileKey))"
            class="flex items-center justify-end gap-1.5 pt-0.5"
          >
            <template v-if="workingUrls[slot.urlKey]">
              <UButton
                size="2xs"
                color="gray"
                variant="soft"
                icon="i-heroicons-arrows-right-left"
                :disabled="loading"
                @click="moveOrSwapSlot(slot.urlKey, slot.oppositeUrlKey)"
              >
                {{ workingUrls[slot.oppositeUrlKey] ? `สลับกับ${slot.oppositeCategoryLabel}` : `ย้ายไป${slot.oppositeCategoryLabel}` }}
              </UButton>
              <UButton
                size="2xs"
                color="red"
                variant="soft"
                icon="i-heroicons-trash"
                :disabled="loading"
                @click="removeSlot(slot.urlKey)"
              >
                ลบไฟล์
              </UButton>
            </template>
            <UButton
              v-else-if="canRestoreSlot(slot.urlKey, slot.fileKey)"
              size="2xs"
              color="gray"
              variant="soft"
              icon="i-heroicons-arrow-uturn-left"
              :disabled="loading"
              @click="restoreSlot(slot.urlKey)"
            >
              ยกเลิกการลบ
            </UButton>
          </div>

          <CommonFileUpload
            v-if="editable"
            :ref="(el) => setUploadRef(slot.fileKey, el)"
            compact
            :accept="slot.accept"
            :max-size-mb="50"
            :loading="loading"
            @change="setSlot(slot.fileKey, $event)"
            @clear="setSlot(slot.fileKey, null)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
