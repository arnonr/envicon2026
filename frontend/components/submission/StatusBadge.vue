<script setup lang="ts">
import { getStatusLabel, STATUS_COLOR, STATUS_LABEL, type SubmissionStatus } from "~/utils/submission-status";

const props = defineProps<{ status: string; currentRound?: number }>();

const badge = computed(() => {
  const config = STATUS_LABEL[props.status as SubmissionStatus];
  if (config) {
    return {
      label: getStatusLabel(props.status, props.currentRound),
      color: STATUS_COLOR[props.status as SubmissionStatus],
    };
  }
  return { label: props.status, color: "gray" };
});
</script>

<template>
  <UBadge :color="badge.color as any" variant="soft">{{ badge.label }}</UBadge>
</template>
