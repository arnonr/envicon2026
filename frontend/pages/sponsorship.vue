<script setup lang="ts">
interface Tier {
  id: string;
  name: string;
  nameTh: string;
  subtitle: string;
  icon: string;
  bg: string;
  accent: string;
  metallic: string;
  featured: boolean;
  badge?: string;
}

const tiers: Tier[] = [
  {
    id: "bronze",
    name: "Bronze",
    nameTh: "บรอนซ์",
    subtitle: "ระดับเริ่มต้น",
    icon: "i-heroicons-shield-check",
    bg: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&auto=format&fit=crop",
    accent: "from-amber-700 via-orange-700 to-amber-900",
    metallic: "from-amber-700 via-amber-500 to-amber-800",
    featured: false,
  },
  {
    id: "silver",
    name: "Silver",
    nameTh: "ซิลเวอร์",
    subtitle: "ระดับมาตรฐาน",
    icon: "i-heroicons-sparkles",
    bg: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop",
    accent: "from-slate-500 via-zinc-400 to-slate-700",
    metallic: "from-slate-400 via-zinc-300 to-slate-600",
    featured: false,
  },
  {
    id: "gold",
    name: "Gold",
    nameTh: "โกลด์",
    subtitle: "ระดับพรีเมียม",
    icon: "i-heroicons-star",
    bg: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80&auto=format&fit=crop",
    accent: "from-yellow-500 via-amber-400 to-orange-500",
    metallic: "from-yellow-400 via-amber-300 to-orange-500",
    featured: true,
    badge: "⭐ แนะนำ",
  },
  {
    id: "platinum",
    name: "Platinum",
    nameTh: "แพลทินัม",
    subtitle: "ระดับสูงสุด",
    icon: "i-heroicons-trophy",
    bg: "https://images.unsplash.com/photo-1466442929976-97f336a657be?w=1200&q=80&auto=format&fit=crop",
    accent: "from-cyan-400 via-sky-300 to-indigo-500",
    metallic: "from-cyan-300 via-sky-200 to-indigo-400",
    featured: false,
  },
];

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
    bg: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80&auto=format&fit=crop",
    tag: "Audience Reach",
  },
  {
    icon: "i-heroicons-globe-alt",
    title: "สร้างเครือข่าย",
    desc: "Networking กับสถาบันชั้นนำและองค์กรด้านสิ่งแวดล้อม",
    bg: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format&fit=crop",
    tag: "Networking",
  },
  {
    icon: "i-heroicons-sparkles",
    title: "แสดงความรับผิดชอบ",
    desc: "ตอกย้ำภาพลักษณ์องค์กรที่ใส่ใจสิ่งแวดล้อมและความยั่งยืน",
    bg: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80&auto=format&fit=crop",
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
  { value: "500+", label: "ผู้เข้าร่วมงาน", icon: "i-heroicons-users", bg: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80&auto=format&fit=crop" },
  { value: "200+", label: "บทความวิจัย", icon: "i-heroicons-document-text", bg: "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=1200&q=80&auto=format&fit=crop" },
  { value: "40+", label: "สถาบันอุดมศึกษา", icon: "i-heroicons-academic-cap", bg: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80&auto=format&fit=crop" },
  { value: "7", label: "หัวข้อวิชาการ", icon: "i-heroicons-beaker", bg: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&q=80&auto=format&fit=crop" },
];
</script>

<template>
  <div class="overflow-hidden">
    <!-- ═══════════ HERO ═══════════ -->
    <section class="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-meadow-950">
      <div class="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1559223607-a43c990c692c?w=2400&q=80&auto=format&fit=crop"
          alt="Sponsorship & partnership"
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
            ENVICON 2026
          </span>
        </h1>
        <p class="mt-6 text-base sm:text-lg text-white/85 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-md">
          งานประชุมวิชาการระดับชาติด้านสิ่งแวดล้อม ครั้งที่ 5
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
            แพ็กเกจสปอนเซอร์
          </h2>
          <p class="mt-3 text-base text-stone-600 max-w-2xl mx-auto">
            4 ระดับ ตามเป้าหมายและงบประมาณของคุณ
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
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                  <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                  อัพเดทเร็วๆ นี้
                </span>
              </div>

              <p class="text-sm text-stone-600 leading-relaxed">
                รายละเอียดและสิทธิประโยชน์ของแพ็กเกจ
                <span class="font-semibold text-stone-900">{{ tier.name }}</span>
                จะประกาศในเร็วๆ นี้
              </p>

              <a
                href="/contact"
                class="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-meadow-700 hover:text-meadow-800 transition-colors"
              >
                สอบถามรายละเอียด
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ CTA ═══════════ -->
    <section class="relative overflow-hidden bg-meadow-950">
      <div class="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=2400&q=80&auto=format&fit=crop"
          alt="Partnership meeting"
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
          ติดต่อคณะกรรมการจัดงานเพื่อหารือรายละเอียดและจองแพ็กเกจ
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
            href="tel:025552000"
            class="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md text-white font-semibold hover:bg-white/20 transition-all duration-300"
          >
            <UIcon name="i-heroicons-phone" class="w-4 h-4" />
            02-555-2000 ต่อ 1789
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