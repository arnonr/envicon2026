<script setup lang="ts">
interface NavChildItem {
  label: string;
  to: string;
}

interface NavItem {
  label: string;
  to?: string;
  children?: NavChildItem[];
}

const navItems: NavItem[] = [
  { label: "หน้าแรก", to: "/" },
  {
    label: "เกี่ยวกับงาน",
    children: [
      { label: "เกี่ยวกับการประชุม", to: "/about" },
      { label: "คณะกรรมการ", to: "/committee" },
      { label: "ผู้สนับสนุน", to: "/sponsorship" },
    ],
  },
  { label: "กำหนดการ", to: "/important-dates" },
  { label: "คำแนะนำสำหรับผู้นำเสนอ", to: "/presenter-guidelines" },
  { label: "ดาวน์โหลด", to: "/guidelines" },
  { label: "ลงทะเบียน", to: "/registration" },
  { label: "ติดต่อ", to: "/contact" },
];

const route = useRoute();
const { isLoggedIn, user, logout } = useAuth();
const mobileMenuOpen = ref(false);
const aboutMenuOpen = ref(false);
const dropdownContainer = ref<HTMLElement | HTMLElement[] | null>(null);

const accountPath = computed(() =>
  user.value?.role === "admin" ? "/admin" : user.value?.role === "reviewer" ? "/reviewer" : "/dashboard",
);

function isGroupActive(children?: NavChildItem[]) {
  if (!children) return false;
  return children.some((child) => route.path === child.to);
}

function handleDocumentClick(event: MouseEvent) {
  if (!aboutMenuOpen.value) return;
  const target = event.target as Node | null;
  if (!target || !dropdownContainer.value) return;
  const containers = Array.isArray(dropdownContainer.value)
    ? dropdownContainer.value
    : [dropdownContainer.value];
  const clickedInside = containers.some((el) => el?.contains(target));
  if (!clickedInside) {
    aboutMenuOpen.value = false;
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    aboutMenuOpen.value = false;
    mobileMenuOpen.value = false;
  }
}

watch(
  () => route.fullPath,
  () => {
    aboutMenuOpen.value = false;
    mobileMenuOpen.value = false;
  },
);

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-meadow-200/60 shadow-sm">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
          <img src="~/assets/logo.png" alt="TSHE-CON 2026" class="h-10 w-auto" />
        </NuxtLink>

        <!-- Desktop nav -->
        <div class="hidden md:flex items-center gap-1">
          <template v-for="item in navItems" :key="item.label">
            <div v-if="item.children" ref="dropdownContainer" class="relative">
              <button
                type="button"
                class="inline-flex items-center gap-1 px-2.5 lg:px-3 py-2 text-sm rounded-md transition-colors whitespace-nowrap"
                :class="
                  isGroupActive(item.children)
                    ? 'text-meadow-600 font-semibold'
                    : 'text-gray-700 hover:text-meadow-600'
                "
                :aria-expanded="aboutMenuOpen"
                aria-haspopup="true"
                @click.stop="aboutMenuOpen = !aboutMenuOpen"
              >
                <span>{{ item.label }}</span>
                <UIcon
                  name="i-heroicons-chevron-down-20-solid"
                  class="w-4 h-4 transition-transform duration-200"
                  :class="aboutMenuOpen ? 'rotate-180' : ''"
                />
              </button>

              <div
                v-if="aboutMenuOpen"
                class="absolute left-0 mt-1.5 w-48 rounded-xl bg-white py-1.5 shadow-lg ring-1 ring-black/5 border border-meadow-100 z-50"
              >
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-meadow-50 hover:text-meadow-700 transition-colors"
                  active-class="bg-meadow-50/80 text-meadow-700 font-semibold"
                  @click="aboutMenuOpen = false"
                >
                  {{ child.label }}
                </NuxtLink>
              </div>
            </div>

            <NuxtLink
              v-else-if="item.to"
              :to="item.to"
              class="px-2.5 lg:px-3 py-2 text-sm text-gray-700 hover:text-meadow-600 rounded-md transition-colors whitespace-nowrap"
              active-class="text-meadow-600 font-semibold"
            >
              {{ item.label }}
            </NuxtLink>
          </template>
        </div>

        <!-- CTA Buttons -->
        <ClientOnly>
        <div class="hidden md:flex items-center gap-2 shrink-0">
          <UButton v-if="!isLoggedIn" color="primary" variant="solid" size="sm" to="/auth/login?mode=register">
            ลงทะเบียนส่งผลงาน
          </UButton>
          <template v-if="isLoggedIn">
            <UButton :to="accountPath" color="primary" variant="ghost" size="sm">
              {{ user?.name }}
            </UButton>
            <UButton color="gray" variant="ghost" size="sm" @click="logout">
              ออกจากระบบ
            </UButton>
          </template>
          <UButton v-else color="primary" variant="outline" size="sm" to="/auth/login">
            เข้าสู่ระบบ
          </UButton>
        </div>
        </ClientOnly>

        <!-- Mobile menu button -->
        <button class="md:hidden" @click="mobileMenuOpen = !mobileMenuOpen">
          <UIcon :name="mobileMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'" class="w-6 h-6" />
        </button>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden pb-4 space-y-1">
        <template v-for="item in navItems" :key="item.label">
          <div v-if="item.children" class="py-1">
            <div class="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {{ item.label }}
            </div>
            <NuxtLink
              v-for="child in item.children"
              :key="child.to"
              :to="child.to"
              class="block pl-6 pr-3 py-2 text-sm text-gray-700 hover:text-primary-600"
              active-class="text-meadow-600 font-semibold"
              @click="mobileMenuOpen = false"
            >
              {{ child.label }}
            </NuxtLink>
          </div>
          <NuxtLink
            v-else-if="item.to"
            :to="item.to"
            class="block px-3 py-2 text-sm text-gray-700 hover:text-primary-600"
            active-class="text-meadow-600 font-semibold"
            @click="mobileMenuOpen = false"
          >
            {{ item.label }}
          </NuxtLink>
        </template>
        <ClientOnly>
        <div class="flex gap-2 mt-3 px-3">
          <UButton v-if="!isLoggedIn" to="/auth/login?mode=register" color="primary" variant="solid" size="sm" block>
            ลงทะเบียนส่งผลงาน
          </UButton>
          <template v-if="isLoggedIn">
            <UButton :to="accountPath" color="primary" variant="ghost" size="sm" block>
              {{ user?.role === 'admin' ? 'แผงผู้ดูแล' : user?.role === 'reviewer' ? 'งานประเมิน' : 'แดชบอร์ด' }}
            </UButton>
          </template>
          <UButton v-else color="primary" variant="outline" size="sm" block to="/auth/login">
            เข้าสู่ระบบ
          </UButton>
        </div>
        </ClientOnly>
      </div>
    </nav>
  </header>
</template>
