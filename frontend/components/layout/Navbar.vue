<script setup lang="ts">
const { show: showComingSoon } = useComingSoon();

const links = [
  { label: "หน้าแรก", to: "/" },
  { label: "เกี่ยวกับ", to: "/about" },
  { label: "หัวข้อ", to: "/tracks" },
  { label: "กำหนดการ", to: "/important-dates" },
  { label: "ลงทะเบียน", to: "/registration" },
  { label: "สถานที่", to: "/venue" },
  { label: "แนวทาง", to: "/guidelines" },
  { label: "ติดต่อ", to: "/contact" },
];

const { isLoggedIn, user, logout } = useAuth();
const mobileMenuOpen = ref(false);
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-meadow-200/60 shadow-sm">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <img src="~/assets/logo.png" alt="ENVICON 2026" class="h-10 w-auto" />
        </NuxtLink>

        <!-- Desktop nav -->
        <div class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="px-3 py-2 text-sm text-gray-700 hover:text-meadow-600 rounded-md transition-colors"
            active-class="text-meadow-600 font-semibold"
          >
            {{ link.label }}
          </NuxtLink>
        </div>

        <!-- CTA Buttons -->
        <div class="hidden md:flex items-center gap-2">
          <UButton color="primary" variant="solid" size="sm" @click="showComingSoon">
            ส่งผลงาน
          </UButton>
          <template v-if="isLoggedIn">
            <UButton to="/dashboard" color="primary" variant="ghost" size="sm">
              {{ user?.name }}
            </UButton>
            <UButton color="gray" variant="ghost" size="sm" @click="logout">
              ออกจากระบบ
            </UButton>
          </template>
          <UButton v-else color="primary" variant="outline" size="sm" @click="showComingSoon">
            เข้าสู่ระบบ
          </UButton>
        </div>

        <!-- Mobile menu button -->
        <button class="md:hidden" @click="mobileMenuOpen = !mobileMenuOpen">
          <UIcon :name="mobileMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'" class="w-6 h-6" />
        </button>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden pb-4">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="block px-3 py-2 text-sm text-gray-700 hover:text-primary-600"
          @click="mobileMenuOpen = false"
        >
          {{ link.label }}
        </NuxtLink>
        <div class="flex gap-2 mt-3 px-3">
          <UButton color="primary" variant="solid" size="sm" block @click="showComingSoon">
            ส่งผลงาน
          </UButton>
          <template v-if="isLoggedIn">
            <UButton to="/dashboard" color="primary" variant="ghost" size="sm" block>
              แดชบอร์ด
            </UButton>
          </template>
          <UButton v-else color="primary" variant="outline" size="sm" block @click="showComingSoon">
            เข้าสู่ระบบ
          </UButton>
        </div>
      </div>
    </nav>
  </header>
</template>
