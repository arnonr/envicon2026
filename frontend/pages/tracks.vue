<script setup lang="ts">
const tracks = [
  {
    id: 1,
    th: "วิทยาศาสตร์สิ่งแวดล้อมและการควบคุมมลพิษ",
    en: "Environmental Science and Pollution Control",
    desc: "ครอบคลุมงานวิจัยด้านคุณภาพน้ำ อากาศ ดิน การจัดการของเสีย และเทคโนโลยีบำบัดมลพิษ",
    icon: "i-heroicons-beaker",
  },
  {
    id: 2,
    th: "การจัดการระบบนิเวศและทรัพยากรธรรมชาติ",
    en: "Ecosystem and Natural Resource Management",
    desc: "การอนุรักษ์ความหลากหลายทางชีวภาพ การจัดการป่าไม้ ทรัพยากรทางทะเล และพื้นที่ชุ่มน้ำ",
    icon: "i-heroicons-globe-alt",
  },
  {
    id: 3,
    th: "เศรษฐกิจหมุนเวียนและการใช้ทรัพยากรอย่างคุ้มค่า",
    en: "Circular Economy and Resource Efficiency",
    desc: "แนวคิดเศรษฐกิจหมุนเวียน การลดของเสีย การรีไซเคิล และการออกแบบผลิตภัณฑ์ที่ยั่งยืน",
    icon: "i-heroicons-arrow-path",
  },
  {
    id: 4,
    th: "การเปลี่ยนแปลงสภาพภูมิอากาศและเทคโนโลยีคาร์บอนต่ำ",
    en: "Climate Change and Low-Carbon Technology",
    desc: "การปรับตัวและลดผลกระทบจากการเปลี่ยนแปลงสภาพภูมิอากาศ พลังงานสะอาด และเทคโนโลยีคาร์บอนต่ำ",
    icon: "i-heroicons-sun",
  },
  {
    id: 5,
    th: "เทคโนโลยีดิจิทัลและระบบอัจฉริยะเพื่อการติดตามสิ่งแวดล้อม",
    en: "Digital Technology and Intelligent Systems for Environmental Monitoring",
    desc: "IoT, AI, Remote Sensing, GIS และระบบสารสนเทศเพื่อการติดตามและจัดการสิ่งแวดล้อม",
    icon: "i-heroicons-cpu-chip",
  },
  {
    id: 6,
    th: "เมืองยั่งยืน อุตสาหกรรมสีเขียว และการจัดการสิ่งแวดล้อม",
    en: "Sustainable Cities, Green Industry, and Environmental Management",
    desc: "การวางผังเมือง การจัดการสิ่งแวดล้อมในภาคอุตสาหกรรม และการพัฒนาเมืองที่ยั่งยืน",
    icon: "i-heroicons-building-office-2",
  },
  {
    id: 7,
    th: "สิ่งแวดล้อมและสุขภาพ",
    en: "Environment and Health",
    desc: "ผลกระทบของสิ่งแวดล้อมต่อสุขภาพ พิษวิทยาสิ่งแวดล้อม และอาชีวอนามัย",
    icon: "i-heroicons-heart",
  },
];
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-16">
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-3">หัวข้อการนำเสนอผลงาน</h1>
      <p class="text-gray-500 text-lg">Presentation Tracks</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UCard v-for="track in tracks" :key="track.id">
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
            <UIcon :name="track.icon" class="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <div class="text-xs font-bold text-primary-600 mb-1">Track {{ track.id }}</div>
            <h3 class="font-semibold text-gray-900 mb-1">{{ track.th }}</h3>
            <p class="text-sm text-accent-600 mb-2">{{ track.en }}</p>
            <p class="text-sm text-gray-500">{{ track.desc }}</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
