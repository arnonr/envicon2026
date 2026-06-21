<script setup lang="ts">
const props = defineProps<{ roundNumber: number }>();
</script>

<template>
  <UBadge color="primary" variant="soft" size="xs">
    รอบที่ {{ props.roundNumber }}
  </UBadge>
</template>