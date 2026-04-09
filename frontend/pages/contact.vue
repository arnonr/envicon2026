<template>
  <div class="max-w-4xl mx-auto px-4 py-16">
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-3">ติดต่อเรา</h1>
      <p class="text-gray-500 text-lg">Contact Us</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-1 gap-8">
      <!-- Contact Info -->
      <div class="space-y-6">
        <UCard>
          <template #header>
            <h2 class="font-semibold">ข้อมูลติดต่อ</h2>
          </template>
          <ul class="space-y-4 text-sm">
            <li class="flex gap-3">
              <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-primary-600 flex-shrink-0" />
              <div>
                <div class="font-medium">อีเมล</div>
                <a href="mailto:fiit@technopark.kmutnb.ac.th" class="text-primary-600 hover:underline">
                  fiit@technopark.kmutnb.ac.th
                </a>
              </div>
            </li>
            <li class="flex gap-3">
              <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-primary-600 flex-shrink-0" />
              <div>
                <div class="font-medium">ที่อยู่</div>
                <p class="text-gray-500">
                  อาคาร 99 อุทยานเทคโนโลยี มจพ.<br />
                  1518 ถ.ประชาราษฎร์ 1 แขวงวงศ์สว่าง<br />
                  เขตบางซื่อ กรุงเทพฯ 10800
                </p>
              </div>
            </li>
            <li class="flex gap-3">
              <UIcon name="i-heroicons-globe-alt" class="w-5 h-5 text-primary-600 flex-shrink-0" />
              <div>
                <div class="font-medium">เว็บไซต์</div>
                <span class="text-gray-500">technopark.kmutnb.ac.th/envicon2026</span>
              </div>
            </li>
          </ul>
        </UCard>
      </div>

      <!-- Contact Form -->
      <!-- <UCard>
        <template #header>
          <h2 class="font-semibold">ส่งข้อความ</h2>
        </template>
        <form class="space-y-4" @submit.prevent>
          <UFormGroup label="ชื่อ">
            <UInput placeholder="ชื่อ-นามสกุล" icon="i-heroicons-user" />
          </UFormGroup>
          <UFormGroup label="อีเมล">
            <UInput type="email" placeholder="email@example.com" icon="i-heroicons-envelope" />
          </UFormGroup>
          <UFormGroup label="หัวข้อ">
            <UInput placeholder="หัวข้อที่ต้องการสอบถาม" />
          </UFormGroup>
          <UFormGroup label="ข้อความ">
            <UTextarea placeholder="รายละเอียด..." :rows="4" />
          </UFormGroup>
          <UButton type="submit" color="primary" block>
            ส่งข้อความ
          </UButton>
        </form>
      </UCard> -->
    </div>
  </div>
</template>
