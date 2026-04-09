<script setup lang="ts">
const dates = [
  {
    title: "เปิดรับบทคัดย่อ (Abstract Submission)",
    date: "1 เมษายน — 30 กันยายน 2569",
    icon: "i-heroicons-pencil-square",
    color: "primary",
    active: true,
  },
  {
    title: "ประกาศผลการพิจารณาบทคัดย่อ",
    date: "7 ตุลาคม 2569",
    icon: "i-heroicons-megaphone",
    color: "accent",
    active: false,
  },
  {
    title: "เปิดรับบทความฉบับสมบูรณ์ (Full Paper)",
    date: "7 — 24 ตุลาคม 2569",
    icon: "i-heroicons-document-text",
    color: "primary",
    active: false,
  },
  {
    title: "ประกาศโปรแกรมการนำเสนอผลงาน",
    date: "31 ตุลาคม 2569",
    icon: "i-heroicons-calendar-days",
    color: "accent",
    active: false,
  },
  {
    title: "วันจัดงานประชุม",
    date: "12 — 13 พฤศจิกายน 2569",
    icon: "i-heroicons-star",
    color: "primary",
    active: false,
  },
];
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-16">
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-3">กำหนดการที่สำคัญ</h1>
      <p class="text-gray-500 text-lg">Important Dates</p>
    </div>

    <div class="relative">
      <!-- Timeline line -->
      <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <div class="space-y-8">
        <div v-for="(item, i) in dates" :key="i" class="relative flex items-start gap-6">
          <!-- Timeline dot -->
          <div
            class="relative z-10 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            :class="item.active ? 'bg-primary-600 ring-4 ring-primary-100' : 'bg-gray-100'"
          >
            <UIcon :name="item.icon" class="w-6 h-6" :class="item.active ? 'text-white' : 'text-gray-400'" />
          </div>

          <!-- Content -->
          <UCard class="flex-1" :class="item.active ? 'ring-2 ring-primary-200' : ''">
            <div>
              <h3 class="font-semibold text-gray-900 text-lg">{{ item.title }}</h3>
              <p class="text-primary-600 font-medium mt-1">{{ item.date }}</p>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>
