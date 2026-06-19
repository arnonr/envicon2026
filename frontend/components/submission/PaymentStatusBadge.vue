<script setup lang="ts">
const props = defineProps<{ status: string }>();

const CONFIG = {
  unpaid: { label: 'ยังไม่ชำระ', color: 'gray' },
  pending_verification: { label: 'รอตรวจสอบ', color: 'yellow' },
  verified: { label: 'ชำระแล้ว', color: 'green' },
  rejected: { label: 'ปฏิเสธ', color: 'red' },
} as const;

const badge = computed(() =>
  CONFIG[props.status as keyof typeof CONFIG] ?? { label: props.status, color: 'gray' }
);
</script>

<template>
  <UBadge :color="badge.color as any" variant="soft" size="xs">
    <UIcon v-if="status === 'verified'" name="i-heroicons-check-circle" class="w-3 h-3 mr-0.5" />
    {{ badge.label }}
  </UBadge>
</template>
