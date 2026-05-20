<script setup lang="ts">
export interface SubmissionFormData {
  title: string;
  title_en: string;
  abstract: string;
  keywords: string;
  track: string;
}

export interface Creator {
  firstName: string;
  lastName: string;
}

const props = defineProps<{
  modelValue: SubmissionFormData;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: SubmissionFormData];
}>();

const TRACK_OPTIONS = [
  { label: '1. วิทยาศาสตร์สิ่งแวดล้อมและการควบคุมมลพิษ', value: '1' },
  { label: '2. การจัดการระบบนิเวศและทรัพยากรธรรมชาติ', value: '2' },
  { label: '3. เศรษฐกิจหมุนเวียนและการใช้ทรัพยากรอย่างคุ้มค่า', value: '3' },
  { label: '4. การเปลี่ยนแปลงสภาพภูมิอากาศและเทคโนโลยีคาร์บอนต่ำ', value: '4' },
  { label: '5. เทคโนโลยีดิจิทัลและระบบอัจฉริยะเพื่อการติดตามสิ่งแวดล้อม', value: '5' },
  { label: '6. เมืองยั่งยืน อุตสาหกรรมสีเขียว และการจัดการสิ่งแวดล้อม', value: '6' },
  { label: '7. สิ่งแวดล้อมและสุขภาพ', value: '7' },
];

const creators = ref<Creator[]>([{ firstName: '', lastName: '' }]);

const update = (field: keyof SubmissionFormData, value: string) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value });
};

const addCreator = () => {
  creators.value.push({ firstName: '', lastName: '' });
};

const removeCreator = (index: number) => {
  if (creators.value.length <= 1) return;
  creators.value.splice(index, 1);
};

const updateCreator = (index: number, field: keyof Creator, value: string) => {
  creators.value[index] = { ...creators.value[index], [field]: value };
};

defineExpose({ creators });
</script>

<template>
  <div class="space-y-5">
    <UFormGroup label="ชื่อเรื่องภาษาไทย (Title TH)" required>
      <UInput :model-value="modelValue.title" placeholder="ชื่อเรื่องผลงานวิจัย"
        @update:model-value="update('title', $event as string)" />
    </UFormGroup>

    <UFormGroup label="ชื่อเรื่องภาษาอังกฤษ (Title EN)" required>
      <UInput :model-value="modelValue.title_en" placeholder="Research title in English"
        @update:model-value="update('title_en', $event as string)" />
    </UFormGroup>

    <UFormGroup label="บทคัดย่อ (Abstract)" required hint="ไม่เกิน 250 คำ">
      <UTextarea :model-value="modelValue.abstract" placeholder="สรุปผลงานวิจัย วัตถุประสงค์ วิธีการ และผลการศึกษา"
        :rows="6" @update:model-value="update('abstract', $event as string)" />
    </UFormGroup>

    <UFormGroup label="คำสำคัญ (Keywords)" hint="คั่นด้วยเครื่องหมายจุลภาค (,)">
      <UInput :model-value="modelValue.keywords" placeholder="เช่น สิ่งแวดล้อม, คาร์บอน, นวัตกรรม"
        @update:model-value="update('keywords', $event as string)" />
    </UFormGroup>

    <UFormGroup label="ประเภทกาการนำเสนอ (Track)" required>
      <USelect :model-value="modelValue.track" :options="TRACK_OPTIONS" placeholder="-- เลือกประเภท --"
        @update:model-value="update('track', $event as string)" />
    </UFormGroup>

    <UFormGroup label="ผู้สร้างสรรค์ผลงาน (Creators)" required>
      <div class="space-y-3">
        <div v-for="(creator, index) in creators" :key="index" class="flex items-start gap-2">
          <UInput
            :model-value="creator.firstName"
            placeholder="ชื่อ"
            class="flex-1"
            @update:model-value="updateCreator(index, 'firstName', $event as string)"
          />
          <UInput
            :model-value="creator.lastName"
            placeholder="นามสกุล"
            class="flex-1"
            @update:model-value="updateCreator(index, 'lastName', $event as string)"
          />
          <UButton
            v-if="creators.length > 1"
            color="red"
            variant="soft"
            icon="i-heroicons-x-mark"
            size="sm"
            @click="removeCreator(index)"
          />
        </div>
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-plus"
          size="sm"
          @click="addCreator"
        >
          เพิ่มผู้สร้างสรรค์ผลงาน
        </UButton>
      </div>
    </UFormGroup>
  </div>
</template>
