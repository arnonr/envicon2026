<script setup lang="ts">
const { show: showComingSoon } = useComingSoon();

const fees = [
  {
    category: "นิสิต/นักศึกษา",
    earlyBird: "500 บาท",
    regular: "700 บาท",
  },
  {
    category: "อาจารย์/นักวิจัย/บุคคลทั่วไป",
    earlyBird: "2,000 บาท",
    regular: "2,500 บาท",
  },
];
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-16">
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-3">ลงทะเบียน</h1>
      <p class="text-gray-500 text-lg">Registration</p>
    </div>

    <!-- Fee Table -->
    <UCard class="mb-8">
      <template #header>
        <h2 class="font-semibold text-lg">อัตราค่าลงทะเบียน</h2>
      </template>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3 px-4">ประเภท</th>
              <th class="text-center py-3 px-4">
                <div>Early Bird</div>
                <div class="text-xs text-gray-400 font-normal">ก่อน 14 ต.ค. 2569</div>
              </th>
              <th class="text-center py-3 px-4">
                <div>Regular</div>
                <div class="text-xs text-gray-400 font-normal">หลัง 14 ต.ค. 2569</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fee in fees" :key="fee.category" class="border-b last:border-0">
              <td class="py-3 px-4 font-medium">{{ fee.category }}</td>
              <td class="py-3 px-4 text-center text-primary-600 font-semibold">{{ fee.earlyBird }}</td>
              <td class="py-3 px-4 text-center">{{ fee.regular }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Payment Info -->
    <UCard class="mb-8">
      <template #header>
        <h2 class="font-semibold text-lg">วิธีการชำระเงิน</h2>
      </template>
      <div class="space-y-3 text-sm text-gray-600">
        <p>Coming Soon</p>
      </div>
    </UCard>

    <!-- CTA -->
    <div class="text-center">
      <UButton color="primary" size="lg" @click="showComingSoon">
        ลงทะเบียนเข้าร่วมงาน
      </UButton>
    </div>
  </div>
</template>
