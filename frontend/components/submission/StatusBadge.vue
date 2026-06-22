<script setup lang="ts">
import { STATUS_LABEL, STATUS_COLOR, type SubmissionStatus } from "~/utils/submission-status";

const props = defineProps<{ status: string }>();

const badge = computed(() => {
  const config = STATUS_LABEL[props.status as SubmissionStatus];
  if (config) return { label: config, color: STATUS_COLOR[props.status as SubmissionStatus] };
  return { label: props.status, color: "gray" };
});
</script>

<template>
  <UBadge :color="badge.color as any" variant="soft">{{ badge.label }}</UBadge>
</template>
