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
  <div class="max-w-5xl mx-auto px-4 py-16">
    <section class="max-w-4xl mx-auto">
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
    </section>

    <section class="mt-16 border-t border-gray-200 pt-12">
      <div class="text-center mb-10">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">สถานที่จัดงาน</h2>
        <p class="text-gray-500">Venue</p>
      </div>

      <UCard class="mb-8">
        <div class="text-center">
          <h3 class="text-xl font-bold text-gray-900 mb-2">อาคาร 99 อุทยานเทคโนโลยี มจพ.</h3>
          <p class="text-lg text-accent-600 mb-4">KMUTNB Technopark</p>
          <p class="text-gray-600 mb-6">
            มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ<br />
            1518 ถนนประชาราษฎร์ 1 แขวงวงศ์สว่าง เขตบางซื่อ กรุงเทพฯ 10800
          </p>
        </div>
      </UCard>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <UCard class="lg:col-span-3">
          <template #header>
            <h3 class="font-semibold text-lg">แผนที่</h3>
          </template>
          <div class="aspect-video rounded-lg overflow-hidden bg-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6674.084683217916!2d100.51142257509149!3d13.821093636577967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29b9fec733295%3A0xabfe9c6fbd6d88d7!2zS01VVE5CIFRFQ0hOTyBQQVJLIOC4reC4uOC4l-C4ouC4suC4meC5gOC4l-C4hOC5guC4meC5guC4peC4ouC4tSDguKHguKvguLLguKfguLTguJfguKLguLLguKXguLHguKLguYDguJfguITguYLguJnguYLguKXguKLguLXguJ7guKPguLDguIjguK3guKHguYDguIHguKXguYnguLLguJ7guKPguLDguJnguITguKPguYDguKvguJnguLfguK0!5e1!3m2!1sen!2sth!4v1775725654100!5m2!1sen!2sth"
              width="100%" height="100%" style="border: 0" allowfullscreen loading="lazy"
              referrerpolicy="no-referrer-when-downgrade" class="min-h-[300px]"></iframe>
          </div>
        </UCard>

        <UCard class="lg:col-span-2">
          <template #header>
            <h3 class="font-semibold text-lg">การเดินทาง</h3>
          </template>
          <ul class="space-y-3 text-sm text-gray-600">
            <li class="flex gap-3">
              <UIcon name="i-heroicons-truck" class="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <span><strong>รถไฟฟ้า MRT:</strong> สถานีวงศ์สว่าง (ทางออก 4)</span>
            </li>
            <li class="flex gap-3">
              <UIcon name="i-heroicons-truck" class="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <span><strong>รถประจำทาง:</strong> สาย 32, 33, 64, 90, 97, 203</span>
            </li>
            <li class="flex gap-3">
              <UIcon name="i-heroicons-truck" class="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <span><strong>รถยนต์ส่วนตัว:</strong> มีที่จอดรถภายในมหาวิทยาลัย</span>
            </li>
          </ul>
        </UCard>
      </div>
    </section>
  </div>
</template>
