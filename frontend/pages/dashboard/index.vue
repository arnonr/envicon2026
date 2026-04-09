<script setup lang="ts">
definePageMeta({ middleware: ["auth"] });

const { user, logout } = useAuth();
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p class="text-gray-500">
          สวัสดี, {{ user?.name }}
        </p>
      </div>
      <UButton color="gray" variant="ghost" @click="logout">
        ออกจากระบบ
      </UButton>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UCard>
        <template #header>
          <h3 class="font-semibold">ข้อมูลบัญชี</h3>
        </template>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-gray-500">อีเมล</dt>
            <dd>{{ user?.email }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500">สังกัด</dt>
            <dd>{{ user?.affiliation || '-' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500">บทบาท</dt>
            <dd>
              <UBadge :color="user?.role === 'admin' ? 'red' : user?.role === 'reviewer' ? 'blue' : 'green'" variant="soft">
                {{ user?.role }}
              </UBadge>
            </dd>
          </div>
        </dl>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="font-semibold">ผลงานที่ส่ง</h3>
        </template>
        <div class="text-center py-8 text-gray-400">
          <p>ยังไม่มีผลงาน</p>
          <UButton to="/submit" color="primary" variant="soft" class="mt-4" size="sm">
            ส่งผลงานใหม่
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
