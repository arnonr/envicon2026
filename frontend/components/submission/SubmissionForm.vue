<script setup lang="ts">
export interface SubmissionFormData {
  title: string;
  title_en: string;
  abstract: string;
  keywords: string;
  track: string;
  submitterType: string;
  educationLevel: string;
  presentationFormat: string;
  wantsFullPaper: boolean;
}

export interface Creator {
  firstName: string;
  lastName: string;
  affiliation: string;
}

const props = defineProps<{
  modelValue: SubmissionFormData;
  initialCreators?: Creator[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: SubmissionFormData];
}>();

const TRACK_OPTIONS = [
  { label: '1. วิทยาศาสตร์สิ่งแวดล้อมและการควบคุมมลพิษ (Environmental Science and Pollution Control)', value: '1' },
  { label: '2. การจัดการระบบนิเวศและทรัพยากรธรรมชาติ (Ecosystem and Natural Resource Management)', value: '2' },
  { label: '3. เศรษฐกิจหมุนเวียนและการใช้ทรัพยากรอย่างคุ้มค่า (Circular Economy and Resource Efficiency)', value: '3' },
  { label: '4. การเปลี่ยนแปลงสภาพภูมิอากาศและเทคโนโลยีคาร์บอนต่ำ (Climate Change and Low-Carbon Technology)', value: '4' },
  { label: '5. เทคโนโลยีดิจิทัลและระบบอัจฉริยะเพื่อการติดตามสิ่งแวดล้อม (Digital Technology and Smart Environmental Monitoring)', value: '5' },
  { label: '6. เมืองยั่งยืน อุตสาหกรรมสีเขียว และการจัดการสิ่งแวดล้อม (Sustainable Cities, Green Industry and Environmental Management)', value: '6' },
  { label: '7. สิ่งแวดล้อมและสุขภาพ (Environment and Health)', value: '7' },
];

const EDUCATION_OPTIONS = [
  { label: 'ปริญญาตรี (Bachelor\'s Degree)', value: 'bachelor' },
  { label: 'ปริญญาโท (Master\'s Degree)', value: 'master' },
  { label: 'ปริญญาเอก (Doctoral Degree)', value: 'doctorate' },
];

const PRESENTATION_FORMAT_OPTIONS = [
  { label: 'Oral Presentation', value: 'oral' },
  { label: 'Poster Presentation', value: 'poster' },
];

const { studentLabel, generalLabel } = useFees();

const creators = ref<Creator[]>(
  props.initialCreators?.length
    ? props.initialCreators.map(creator => ({ ...creator, affiliation: creator.affiliation ?? '' }))
    : [{ firstName: '', lastName: '', affiliation: '' }]
);

const update = (field: keyof SubmissionFormData, value: string | boolean) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value });
};

const addCreator = () => {
  creators.value.push({ firstName: '', lastName: '', affiliation: '' });
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

    <UFormGroup label="บทคัดย่อ (Abstract)" required hint="ไม่เกิน 250 คำ (Maximum 250 words)">
      <UTextarea :model-value="modelValue.abstract" placeholder="สรุปผลงานวิจัย วัตถุประสงค์ วิธีการ และผลการศึกษา"
        :rows="6" @update:model-value="update('abstract', $event as string)" />
    </UFormGroup>

    <UFormGroup label="คำสำคัญ (Keywords)" hint="คั่นด้วยเครื่องหมายจุลภาค (Separate with commas)">
      <UInput :model-value="modelValue.keywords" placeholder="เช่น สิ่งแวดล้อม, คาร์บอน, นวัตกรรม"
        @update:model-value="update('keywords', $event as string)" />
    </UFormGroup>

    <UFormGroup label="หัวข้อการนำเสนอ (Presentation Track)" required>
      <USelect :model-value="modelValue.track" :options="TRACK_OPTIONS" placeholder="-- เลือกหัวข้อ (Select Track) --"
        @update:model-value="update('track', $event as string)" />
    </UFormGroup>

    <UFormGroup label="ประเภทผู้ส่งผลงาน (Submitter Type)" required>
      <URadioGroup
        :model-value="modelValue.submitterType"
        :options="[
          { label: studentLabel, value: 'student' },
          { label: generalLabel, value: 'general' },
        ]"
        @update:model-value="update('submitterType', $event as string)"
      />
    </UFormGroup>

    <UFormGroup label="ระดับการศึกษา (Education Level)" required>
      <USelect
        :model-value="modelValue.educationLevel"
        :options="EDUCATION_OPTIONS"
        placeholder="-- เลือกระดับการศึกษา (Select Education Level) --"
        @update:model-value="update('educationLevel', $event as string)"
      />
    </UFormGroup>

    <UFormGroup label="รูปแบบการนำเสนอ (Presentation Format)" required>
      <URadioGroup
        :model-value="modelValue.presentationFormat"
        :options="PRESENTATION_FORMAT_OPTIONS"
        @update:model-value="update('presentationFormat', $event as string)"
      />
    </UFormGroup>

    <UFormGroup>
      <UCheckbox
        :model-value="modelValue.wantsFullPaper"
        label="ต้องการส่งบทความฉบับสมบูรณ์ (Full Paper) ด้วย"
        help="หากไม่เลือก ระบบจะรับส่งเฉพาะบทคัดย่อได้ โดยไม่ต้องติดตามขอ Full Paper"
        @update:model-value="update('wantsFullPaper', $event as boolean)"
      />
    </UFormGroup>

    <UFormGroup label="ผู้แต่งร่วม (Co-author)" required>
      <div class="space-y-3">
        <div v-for="(creator, index) in creators" :key="index" class="grid grid-cols-1 sm:grid-cols-[1fr_1fr_2fr_auto] items-start gap-2">
          <UInput
            :model-value="creator.firstName"
            placeholder="ชื่อ"
            class="flex-1"
            @update:model-value="updateCreator(index, 'firstName', $event as string)"
          />
          <UInput
            :model-value="creator.lastName"
            placeholder="นามสกุล"
            @update:model-value="updateCreator(index, 'lastName', $event as string)"
          />
          <UInput
            :model-value="creator.affiliation"
            placeholder="สังกัด (มหาวิทยาลัย/หน่วยงาน)"
            @update:model-value="updateCreator(index, 'affiliation', $event as string)"
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
          เพิ่มผู้แต่งร่วม
        </UButton>
      </div>
    </UFormGroup>
  </div>
</template>
