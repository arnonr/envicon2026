<template>
  <div class="max-w-4xl mx-auto px-4 py-16">
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-3">สถานที่จัดงาน</h1>
      <p class="text-gray-500 text-lg">Venue</p>
    </div>

    <UCard class="mb-8">
      <div class="text-center">
        <h2 class="text-xl font-bold text-gray-900 mb-2">อาคาร 99 อุทยานเทคโนโลยี มจพ.</h2>
        <p class="text-lg text-accent-600 mb-4">KMUTNB Technopark</p>
        <p class="text-gray-600 mb-6">
          มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ<br />
          1518 ถนนประชาราษฎร์ 1 แขวงวงศ์สว่าง เขตบางซื่อ กรุงเทพฯ 10800
        </p>
      </div>
    </UCard>

    <!-- Map -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-lg">แผนที่</h2>
      </template>
      <div class="aspect-video rounded-lg overflow-hidden bg-gray-100">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6674.084683217916!2d100.51142257509149!3d13.821093636577967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29b9fec733295%3A0xabfe9c6fbd6d88d7!2zS01VVE5CIFRFQ0hOTyBQQVJLIOC4reC4uOC4l-C4ouC4suC4meC5gOC4l-C4hOC5guC4meC5guC4peC4ouC4tSDguKHguKvguLLguKfguLTguJfguKLguLLguKXguLHguKLguYDguJfguITguYLguJnguYLguKXguKLguLXguJ7guKPguLDguIjguK3guKHguYDguIHguKXguYnguLLguJ7guKPguLDguJnguITguKPguYDguKvguJnguLfguK0!5e1!3m2!1sen!2sth!4v1775725654100!5m2!1sen!2sth"
          width="100%" height="100%" style="border: 0" allowfullscreen loading="lazy"
          referrerpolicy="no-referrer-when-downgrade" class="min-h-[300px]"></iframe>
      </div>
    </UCard>

    <!-- Getting There -->
    <UCard class="mt-8">
      <template #header>
        <h2 class="font-semibold text-lg">การเดินทาง</h2>
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
</template>
