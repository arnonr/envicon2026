<script setup lang="ts">
const appBaseUrl = useRuntimeConfig().app.baseURL.replace(/\/$/, "");
const imagePath = (path: string) => `${appBaseUrl}${path}`;

interface Tier {
  id: string;
  name: string;
  nameTh: string;
  subtitle: string;
  price: number;
  icon: string;
  bg: string;
  accent: string;
  metallic: string;
  featured: boolean;
  badge?: string;
  perks: string[];
}

const tiers: Tier[] = [
  {
    id: "bronze",
    name: "Bronze",
    nameTh: "บรอนซ์",
    subtitle: "ระดับเริ่มต้น",
    price: 10000,
    icon: "i-heroicons-shield-check",
    bg: imagePath("/images/technopark-building.jpg"),
    accent: "from-amber-700 via-orange-700 to-amber-900",
    metallic: "from-amber-700 via-amber-500 to-amber-800",
    featured: false,
    perks: [
      "Logo บนเว็บไซต์งาน",
      "ระบุชื่อใน Proceedings",
      "ใบประกาศนียบัตรขอบคุณ",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    nameTh: "ซิลเวอร์",
    subtitle: "ระดับมาตรฐาน",
    price: 30000,
    icon: "i-heroicons-sparkles",
    bg: imagePath("/images/committee-assets/committee-registration-modern-thai.png"),
    accent: "from-slate-500 via-zinc-400 to-slate-700",
    metallic: "from-slate-400 via-zinc-300 to-slate-600",
    featured: false,
    perks: [
      "ทุกอย่างใน Bronze",
      "Logo บน Backdrop งาน",
      "Logo ในสื่อประชาสัมพันธ์",
      "ลงทะเบียนฟรี 2 ท่าน",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    nameTh: "โกลด์",
    subtitle: "ระดับพรีเมียม",
    price: 60000,
    icon: "i-heroicons-star",
    bg: imagePath("/images/committee-assets/committee-sponsorship-modern-thai.png"),
    accent: "from-yellow-500 via-amber-400 to-orange-500",
    metallic: "from-yellow-400 via-amber-300 to-orange-500",
    featured: true,
    badge: "⭐ แนะนำ",
    perks: [
      "ทุกอย่างใน Silver",
      "Booth ขนาด 2×3 ม.",
      "ลงทะเบียนฟรี 4 ท่าน",
      "พาดหัวข่าวบน Social Media",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    nameTh: "แพลทินัม",
    subtitle: "ระดับสูงสุด",
    price: 100000,
    icon: "i-heroicons-trophy",
    bg: imagePath("/images/tshe-con-low-carbon-tech-hero-20260811.png"),
    accent: "from-cyan-400 via-sky-300 to-indigo-500",
    metallic: "from-cyan-300 via-sky-200 to-indigo-400",
    featured: false,
    perks: [
      "ทุกอย่างใน Gold",
      "Booth ใหญ่ 3×4 ม. (มุม)",
      "ลงทะเบียนฟรี 8 ท่าน",
      "กล่าวเปิด 5 นาที",
    ],
  },
];

const selectedTier = ref<Tier | null>(null);
const tierModalOpen = ref(false);
const formatPrice = (price: number) => new Intl.NumberFormat("th-TH").format(price);

const openTierModal = (tier: Tier) => {
  selectedTier.value = tier;
  tierModalOpen.value = true;
};

interface WhySponsor {
  icon: string;
  title: string;
  desc: string;
  bg: string;
  tag: string;
}

const whySponsor: WhySponsor[] = [
  {
    icon: "i-heroicons-user-group",
    title: "เข้าถึงกลุ่มเป้าหมาย",
    desc: "นักวิจัย อาจารย์ นิสิตนักศึกษา และผู้เชี่ยวชาญด้านสิ่งแวดล้อมจากทั่วประเทศ",
    bg: imagePath("/images/committee-assets/committee-hero-modern-thai.png"),
    tag: "Audience Reach",
  },
  {
    icon: "i-heroicons-globe-alt",
    title: "สร้างเครือข่าย",
    desc: "Networking กับสถาบันชั้นนำและองค์กรด้านสิ่งแวดล้อม",
    bg: imagePath("/images/committee-assets/committee-sponsorship-modern-thai.png"),
    tag: "Networking",
  },
  {
    icon: "i-heroicons-sparkles",
    title: "แสดงความรับผิดชอบ",
    desc: "ตอกย้ำภาพลักษณ์องค์กรที่ใส่ใจสิ่งแวดล้อมและความยั่งยืน",
    bg: imagePath("/images/tshe-con-wellbeing-family-20260811.png"),
    tag: "Sustainability",
  },
];

interface Stat {
  value: string;
  label: string;
  icon: string;
  bg: string;
}

const stats: Stat[] = [
  { value: "500+", label: "ผู้เข้าร่วมงาน", icon: "i-heroicons-users", bg: imagePath("/images/committee-assets/committee-hero-modern-thai.png") },
  { value: "200+", label: "บทความวิจัย", icon: "i-heroicons-document-text", bg: imagePath("/images/committee-assets/committee-academic-modern-thai.png") },
  { value: "40+", label: "สถาบันอุดมศึกษา", icon: "i-heroicons-academic-cap", bg: imagePath("/images/technopark-building.jpg") },
  { value: "7", label: "หัวข้อวิชาการ", icon: "i-heroicons-beaker", bg: imagePath("/images/tshe-con-low-carbon-tech-hero-20260811.png") },
];
</script>

<template>
  <div class="overflow-hidden">
    <!-- ═══════════ HERO ═══════════ -->
    <section class="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-meadow-950">
      <div class="absolute inset-0">
        <img
          :src="imagePath('/images/committee-assets/committee-sponsorship-modern-thai.png')"
          alt="การหารือความร่วมมือและผู้สนับสนุนในบริบทไทย"
          class="w-full h-full object-cover sponsorship-hero-photo"
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-meadow-950/65 via-meadow-900/45 to-meadow-950/90" />
      <div class="absolute inset-0 bg-gradient-to-tr from-meadow-900/50 via-transparent to-sky-900/30" />
      <div class="absolute inset-0 sponsorship-vignette" />

      <!-- Floating orbs -->
      <div class="absolute top-20 right-20 w-72 h-72 rounded-full bg-meadow-400/20 blur-3xl"></div>
      <div class="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-sky-400/15 blur-3xl"></div>

      <div class="relative max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-28 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-lg">
          <span class="w-1.5 h-1.5 rounded-full bg-meadow-300 animate-pulse"></span>
          Sponsorship Opportunity
        </div>
        <h1 class="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-white drop-shadow-2xl">
          ร่วมสนับสนุน
          <span class="block mt-2 bg-gradient-to-r from-meadow-200 via-sky-200 to-cyan-200 bg-clip-text text-transparent">
            TSHE-CON 2026
          </span>
        </h1>
        <p class="mt-6 text-base sm:text-lg text-white/85 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-md">
          การประชุมวิชาการระดับชาติ
          <br class="hidden sm:block" />
          สมาคมสถาบันอุดมศึกษาสิ่งแวดล้อมไทย
          <br class="hidden sm:block" />
          ครั้งที่ 5
          <br class="hidden sm:block" />
          12–13 พฤศจิกายน 2569 · มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <a
            href="#packages"
            class="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-meadow-700 font-semibold shadow-xl shadow-meadow-900/40 hover:shadow-2xl hover:bg-meadow-50 transition-all duration-300"
          >
            ดูแพ็กเกจ
            <UIcon name="i-heroicons-arrow-down" class="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </a>
          <NuxtLink
            to="/contact"
            class="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md text-white font-semibold hover:bg-white/20 transition-all duration-300"
          >
            ติดต่อเรา
          </NuxtLink>
        </div>
      </div>

      <!-- Wave divider -->
      <svg class="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 60" preserveAspectRatio="none" style="height: 60px">
        <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#fafaf9" />
      </svg>
    </section>

    <!-- ═══════════ STATS ═══════════ -->
    <section class="relative bg-stone-50 -mt-1">
      <div class="max-w-6xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          <div
            v-for="(stat, i) in stats"
            :key="i"
            class="group relative h-44 sm:h-48 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-meadow-900/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
          >
            <img :src="stat.bg" :alt="stat.label" class="absolute inset-0 w-full h-full object-cover sponsorship-stat-img" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-meadow-950/95 via-meadow-900/75 to-meadow-900/35" />
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-meadow-400 via-sky-400 to-cyan-400" />

            <div class="relative h-full p-5 lg:p-6 flex flex-col justify-between text-white">
              <div class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 shadow-md self-start">
                <UIcon :name="stat.icon" class="w-5 h-5" />
              </div>
              <div>
                <div class="font-semibold text-4xl sm:text-5xl leading-none tabular-nums drop-shadow-lg">
                  {{ stat.value }}
                </div>
                <div class="mt-2 text-xs font-medium uppercase tracking-[0.15em] text-meadow-200">
                  {{ stat.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ WHY SPONSOR ═══════════ -->
    <section class="relative bg-stone-50">
      <div class="max-w-6xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div class="text-center mb-12 lg:mb-16">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-meadow-100 text-meadow-800 text-xs font-semibold uppercase tracking-[0.25em]">
            <span class="w-1.5 h-1.5 rounded-full bg-meadow-600"></span>
            Why Sponsor
          </div>
          <h2 class="mt-4 text-3xl sm:text-4xl lg:text-5xl font-semibold text-stone-900 leading-tight tracking-tight">
            ทำไมต้องร่วมสนับสนุน
          </h2>
          <p class="mt-3 text-base text-stone-600 max-w-2xl mx-auto">
            โอกาสที่จะสร้างคุณค่าร่วมกับชุมชนวิจัยสิ่งแวดล้อมระดับประเทศ
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            v-for="(reason, i) in whySponsor"
            :key="i"
            class="group relative h-80 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-meadow-900/30 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
          >
            <img :src="reason.bg" :alt="reason.title" class="absolute inset-0 w-full h-full object-cover sponsorship-why-img" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-meadow-950/95 via-meadow-900/65 to-meadow-900/30" />
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-meadow-400 via-sky-400 to-cyan-400" />

            <div class="relative h-full p-6 lg:p-7 flex flex-col text-white">
              <div class="flex items-center justify-between mb-8">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 shadow-lg">
                  <UIcon :name="reason.icon" class="w-6 h-6" />
                </div>
                <div class="text-[10px] font-bold tracking-[0.2em] text-white/85 uppercase">
                  {{ String(i + 1).padStart(2, '0') }}
                </div>
              </div>
              <div class="mt-auto">
                <div class="text-[10px] font-bold text-meadow-300 tracking-[0.2em] uppercase mb-2">
                  {{ reason.tag }}
                </div>
                <h3 class="font-semibold text-xl mb-2 leading-snug drop-shadow-lg">
                  {{ reason.title }}
                </h3>
                <p class="text-sm text-white/85 font-medium leading-relaxed">
                  {{ reason.desc }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ TIER PACKAGES ═══════════ -->
    <section id="packages" class="relative bg-gradient-to-b from-stone-50 to-meadow-50/40">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div class="text-center mb-12 lg:mb-16">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-meadow-100 text-meadow-800 text-xs font-semibold uppercase tracking-[0.25em]">
            <span class="w-1.5 h-1.5 rounded-full bg-meadow-600"></span>
            Packages
          </div>
          <h2 class="mt-4 text-3xl sm:text-4xl lg:text-5xl font-semibold text-stone-900 leading-tight tracking-tight">
            สปอนเซอร์
          </h2>
          <p class="mt-3 text-base text-stone-600 max-w-2xl mx-auto">
            4 ระดับ ตามเป้าหมายและงบประมาณ
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            v-for="(tier, i) in tiers"
            :key="tier.id"
            class="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-meadow-900/30 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
          >
            <!-- Top photo banner -->
            <div class="relative h-44 overflow-hidden">
              <img :src="tier.bg" :alt="tier.name" class="w-full h-full object-cover sponsorship-tier-img" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-meadow-950/90 via-meadow-900/55 to-meadow-900/20" />
              <div :class="['absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r', tier.accent]" />

              <!-- Tier rank -->
              <div class="absolute top-4 left-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-md">
                <span class="text-[10px] font-bold tracking-[0.25em] text-white uppercase">
                  Tier {{ String(i + 1).padStart(2, '0') }}
                </span>
              </div>

              <!-- Featured badge -->
              <div
                v-if="tier.featured && tier.badge"
                class="absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 text-white text-[11px] font-bold tracking-wider shadow-lg"
              >
                {{ tier.badge }}
              </div>

              <!-- Title overlay -->
              <div class="absolute bottom-4 left-5 right-5">
                <div :class="['inline-block text-[10px] font-bold tracking-[0.25em] uppercase mb-1 px-2 py-0.5 rounded-full bg-gradient-to-r text-white', tier.metallic]">
                  {{ tier.subtitle }}
                </div>
                <h3 class="font-semibold text-2xl text-white drop-shadow-lg leading-tight">
                  {{ tier.name }}
                </h3>
                <p class="text-xs text-white/80 font-medium mt-0.5">
                  {{ tier.nameTh }}
                </p>
              </div>
            </div>

            <!-- Body -->
            <div class="relative bg-white p-6">
              <!-- Icon + status -->
              <div class="flex items-start justify-between mb-5">
                <div :class="['inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-md bg-gradient-to-br', tier.metallic]">
                  <UIcon :name="tier.icon" class="w-6 h-6 text-white" />
                </div>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-meadow-50 border border-meadow-200 text-meadow-800 text-[11px] font-semibold">
                  <UIcon name="i-heroicons-banknotes" class="w-3 h-3" />
                  {{ formatPrice(tier.price) }} บาท
                </span>
              </div>

              <p class="text-sm text-stone-600 leading-relaxed">
                ดูสิทธิประโยชน์และรายละเอียดของแพ็กเกจ
                <span class="font-semibold text-stone-900">{{ tier.name }}</span>
              </p>

              <button
                type="button"
                class="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-meadow-700 hover:text-meadow-800 transition-colors"
                @click="openTierModal(tier)"
              >
                ดูรายละเอียด
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <UModal v-model="tierModalOpen" :ui="{ width: 'sm:max-w-2xl' }">
      <div v-if="selectedTier" class="overflow-hidden rounded-lg bg-white">
        <div class="relative h-48 sm:h-56 overflow-hidden">
          <img :src="selectedTier.bg" :alt="selectedTier.name" class="absolute inset-0 w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-meadow-950/90 via-meadow-900/55 to-meadow-900/15" />
          <div :class="['absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r', selectedTier.accent]" />
          <button
            type="button"
            class="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/50"
            aria-label="ปิด"
            @click="tierModalOpen = false"
          >
            <UIcon name="i-heroicons-x-mark" class="h-5 w-5" />
          </button>
          <div class="absolute bottom-5 left-6 right-6 text-white">
            <div :class="['inline-block text-[10px] font-bold tracking-[0.25em] uppercase mb-2 px-2 py-0.5 rounded-full bg-gradient-to-r text-white', selectedTier.metallic]">
              {{ selectedTier.subtitle }}
            </div>
            <h3 class="text-3xl font-semibold leading-tight drop-shadow-lg">
              {{ selectedTier.name }} <span class="text-white/75">{{ selectedTier.nameTh }}</span>
            </h3>
          </div>
        </div>

        <div class="p-6 sm:p-7">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-meadow-700">Sponsorship Package</p>
              <h4 class="mt-1 text-2xl font-semibold text-stone-900">
                {{ formatPrice(selectedTier.price) }} บาท
              </h4>
            </div>
            <NuxtLink
              to="/contact"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-meadow-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-meadow-800"
              @click="tierModalOpen = false"
            >
              ติดต่อเจ้าหน้าที่
              <UIcon name="i-heroicons-arrow-right" class="h-4 w-4" />
            </NuxtLink>
          </div>

          <div class="mt-6 border-t border-stone-200 pt-5">
            <h5 class="text-sm font-semibold text-stone-900">สิทธิประโยชน์ที่จะได้รับ</h5>
            <ul class="mt-4 space-y-3">
              <li
                v-for="perk in selectedTier.perks"
                :key="perk"
                class="flex gap-3 text-sm leading-relaxed text-stone-700"
              >
                <span class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-meadow-100 text-meadow-700">
                  <UIcon name="i-heroicons-check" class="h-3.5 w-3.5" />
                </span>
                <span>{{ perk }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </UModal>

    <!-- ═══════════ CTA ═══════════ -->
    <section class="relative overflow-hidden bg-meadow-950">
      <div class="absolute inset-0">
        <img
          :src="imagePath('/images/committee-assets/committee-hero-modern-thai.png')"
          alt="การประชุมเครือข่ายผู้สนับสนุนและนักวิชาการไทย"
          class="w-full h-full object-cover sponsorship-cta-photo"
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-meadow-950/80 via-meadow-900/65 to-meadow-950/90" />

      <div class="absolute top-10 right-10 w-72 h-72 rounded-full bg-meadow-400/15 blur-3xl"></div>
      <div class="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-sky-400/10 blur-3xl"></div>

      <div class="relative max-w-3xl mx-auto px-6 lg:px-8 py-20 lg:py-24 text-center text-white">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-semibold uppercase tracking-[0.25em] text-meadow-200">
          <span class="w-1.5 h-1.5 rounded-full bg-meadow-300 animate-pulse"></span>
          Get in touch
        </div>
        <h2 class="mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight drop-shadow-xl">
          สนใจเป็นสปอนเซอร์?
        </h2>
        <p class="mt-4 text-base sm:text-lg text-white/85 font-medium leading-relaxed max-w-xl mx-auto">
          ติดต่อเจ้าหน้าที่จัดงานเพื่อหารือรายละเอียด
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <a
            href="mailto:sponsor@envicon2026.ac.th"
            class="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-meadow-700 font-semibold shadow-xl hover:bg-meadow-50 hover:shadow-2xl transition-all duration-300"
          >
            <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
            fiit@technopark.kmutnb.ac.th
          </a>
          <a
            href="tel:0647879444"
            class="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md text-white font-semibold hover:bg-white/20 transition-all duration-300"
          >
            <UIcon name="i-heroicons-phone" class="w-4 h-4" />
            064-787-9444 คุณรมณ
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sponsorship-hero-photo {
  animation: sponsorHeroKenBurns 22s ease-in-out infinite alternate;
}

@keyframes sponsorHeroKenBurns {
  from {
    transform: scale(1) translateY(0);
  }
  to {
    transform: scale(1.08) translateY(-1.5%);
  }
}

.sponsorship-vignette {
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.35) 100%);
}

.sponsorship-stat-img,
.sponsorship-why-img,
.sponsorship-tier-img {
  transition: transform 1100ms ease-out;
}

.group:hover .sponsorship-stat-img,
.group:hover .sponsorship-why-img,
.group:hover .sponsorship-tier-img {
  transform: scale(1.1);
}

.sponsorship-cta-photo {
  animation: ctaKenBurns 24s ease-in-out infinite alternate;
}

@keyframes ctaKenBurns {
  from {
    transform: scale(1.05);
  }
  to {
    transform: scale(1.12);
  }
}
</style>
