<script setup lang="ts">
const props = defineProps<{ status: string }>();

const STATUS_CONFIG = {
  draft: { label: 'ร่าง', color: 'gray' },
  submitted: { label: 'ส่งแล้ว', color: 'blue' },
  under_review: { label: 'กำลังพิจารณา', color: 'yellow' },
  accepted: { label: 'ผ่านการพิจารณา', color: 'green' },
  rejected: { label: 'ไม่ผ่าน', color: 'red' },
  revision_requested: { label: 'ขอแก้ไข', color: 'orange' },
} as const;

const badge = computed(() =>
  STATUS_CONFIG[props.status as keyof typeof STATUS_CONFIG] ?? { label: props.status, color: 'gray' }
);
</script>

<template>
  <UBadge :color="badge.color as any" variant="soft">{{ badge.label }}</UBadge>
</template>
