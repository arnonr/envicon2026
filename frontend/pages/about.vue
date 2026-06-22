<script setup lang="ts">
const tracks = [
  {
    id: 1,
    th: "วิทยาศาสตร์สิ่งแวดล้อมและการควบคุมมลพิษ",
    en: "Environmental Science and Pollution Control",
    desc: "ครอบคลุมงานวิจัยด้านคุณภาพน้ำ อากาศ ดิน การจัดการของเสีย และเทคโนโลยีบำบัดมลพิษ",
    icon: "i-heroicons-beaker",
    tag: "Pollution Control",
    bg: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: 2,
    th: "การจัดการระบบนิเวศและทรัพยากรธรรมชาติ",
    en: "Ecosystem and Natural Resource Management",
    desc: "การอนุรักษ์ความหลากหลายทางชีวภาพ การจัดการป่าไม้ ทรัพยากรทางทะเล และพื้นที่ชุ่มน้ำ",
    icon: "i-heroicons-globe-alt",
    tag: "Ecosystem",
    bg: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: 3,
    th: "เศรษฐกิจหมุนเวียนและการใช้ทรัพยากรอย่างคุ้มค่า",
    en: "Circular Economy and Resource Efficiency",
    desc: "แนวคิดเศรษฐกิจหมุนเวียน การลดของเสีย การรีไซเคิล และการออกแบบผลิตภัณฑ์ที่ยั่งยืน",
    icon: "i-heroicons-arrow-path",
    tag: "Circular Economy",
    bg: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: 4,
    th: "การเปลี่ยนแปลงสภาพภูมิอากาศและเทคโนโลยีคาร์บอนต่ำ",
    en: "Climate Change and Low-Carbon Technology",
    desc: "การปรับตัวและลดผลกระทบจากการเปลี่ยนแปลงสภาพภูมิอากาศ พลังงานสะอาด และเทคโนโลยีคาร์บอนต่ำ",
    icon: "i-heroicons-sun",
    tag: "Climate Action",
    bg: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: 5,
    th: "เทคโนโลยีดิจิทัลและระบบอัจฉริยะเพื่อการติดตามสิ่งแวดล้อม",
    en: "Digital Technology and Intelligent Systems for Environmental Monitoring",
    desc: "IoT, AI, Remote Sensing, GIS และระบบสารสนเทศเพื่อการติดตามและจัดการสิ่งแวดล้อม",
    icon: "i-heroicons-cpu-chip",
    tag: "Smart Monitoring",
    bg: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: 6,
    th: "เมืองยั่งยืน อุตสาหกรรมสีเขียว และการจัดการสิ่งแวดล้อม",
    en: "Sustainable Cities, Green Industry, and Environmental Management",
    desc: "การวางผังเมือง การจัดการสิ่งแวดล้อมในภาคอุตสาหกรรม และการพัฒนาเมืองที่ยั่งยืน",
    icon: "i-heroicons-building-office-2",
    tag: "Green City",
    bg: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: 7,
    th: "สิ่งแวดล้อมและสุขภาพ",
    en: "Environment and Health",
    desc: "ผลกระทบของสิ่งแวดล้อมต่อสุขภาพ พิษวิทยาสิ่งแวดล้อม และอาชีวอนามัย",
    icon: "i-heroicons-heart",
    tag: "Well-being",
    bg: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1200&q=80&auto=format&fit=crop",
  },
];

const goals = [
  "เผยแพร่ผลงานวิจัยและนวัตกรรมด้านสิ่งแวดล้อมสู่สาธารณะ",
  "แลกเปลี่ยนความรู้และประสบการณ์ระหว่างนักวิจัยและผู้เชี่ยวชาญ",
  "สร้างเครือข่ายความร่วมมือด้านวิจัยสิ่งแวดล้อมระหว่างสถาบัน",
  "ส่งเสริมการพัฒนาเทคโนโลยีสิ่งแวดล้อมเพื่อสังคมคาร์บอนต่ำ",
];

const highlights = [
  { value: "7", label: "Research Tracks", sub: "หัวข้อการนำเสนอ" },
  { value: "2", label: "วัน", sub: "ของการประชุม" },
  { value: "50+", label: "Sessions", sub: "บรรยายและนำเสนอ" },
  { value: "1,000+", label: "ผู้เข้าร่วม", sub: "ทั่วประเทศ" },
];
</script>

<template>
  <div class="overflow-hidden">
    <!-- ═══════════ HERO — Looking up at trees ═══════════ -->
    <section class="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-meadow-950">
      <div class="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=2400&q=80&auto=format&fit=crop"
          alt="Forest canopy from below"
          class="w-full h-full object-cover about-hero-photo"
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-meadow-950/55 via-meadow-900/40 to-meadow-950/85" />
      <div class="absolute inset-0 bg-gradient-to-tr from-meadow-900/40 via-transparent to-sky-900/25" />
      <div class="absolute inset-0 about-vignette" />

      <!-- Floating particles -->
      <div class="about-particles">
        <div v-for="i in 20" :key="'ap' + i" class="about-particle" :style="aboutParticleStyle(i)" />
      </div>

      <div class="relative z-10 max-w-4xl mx-auto px-6 text-center text-white py-20">
        <div
          class="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/30 rounded-full px-6 py-2.5 mb-8">
          <span class="w-2.5 h-2.5 rounded-full bg-meadow-400 animate-pulse" />
          <span class="text-sm font-semibold tracking-wide">About The Conference</span>
        </div>
        <h1 class="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6">
          <span class="block text-white drop-shadow-2xl leading-[1.1] pb-2">เกี่ยวกับ</span>
          <span
            class="block bg-gradient-to-r from-meadow-300 via-sky-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-lg leading-[1.1]">การประชุมวิชาการ</span>
        </h1>
        <p class="text-xl sm:text-2xl text-white/95 font-medium drop-shadow-md">
          Innovative Environmental Technologies
        </p>
        <p class="text-base sm:text-lg text-white/75 max-w-2xl mx-auto mt-3 drop-shadow-md">
          for a Sustainable and Low-Carbon Future
        </p>
        <div class="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
          <span class="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90">
            ครั้งที่ 5
          </span>
          <span class="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90">
            ระดับชาติ
          </span>
          <span class="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90">
            12 — 13 พฤศจิกายน 2569
          </span>
        </div>
      </div>
    </section>

    <!-- ═══════════ HIGHLIGHTS — Stat Strip ═══════════ -->
    <section class="relative py-14 bg-meadow-900 text-white overflow-hidden">
      <div
        class="absolute inset-0 opacity-[0.08] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')]" />
      <div class="relative max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="(item, i) in highlights" :key="i" class="text-center">
          <div class="font-display text-4xl sm:text-5xl font-extrabold bg-gradient-to-br from-meadow-300 to-sky-300 bg-clip-text text-transparent">
            {{ item.value }}
          </div>
          <div class="text-sm font-semibold text-white mt-1">{{ item.label }}</div>
          <div class="text-xs text-white/60 mt-0.5">{{ item.sub }}</div>
        </div>
      </div>
    </section>

    <!-- ═══════════ OVERVIEW — Conference intro with photo ═══════════ -->
    <section class="relative py-24 bg-white">
      <div class="max-w-6xl mx-auto px-6">
        <div class="grid md:grid-cols-5 gap-12 items-center">
          <div class="md:col-span-3">
            <span class="text-xs font-bold tracking-[0.2em] uppercase text-meadow-600 mb-3 block">Overview</span>
            <h2 class="font-display text-3xl sm:text-4xl font-bold text-meadow-900 mb-6 leading-tight">
              การประชุมวิชาการระดับชาติ ครั้งที่ 5
            </h2>
            <p class="text-lg text-gray-700 leading-relaxed mb-5">
              <strong class="text-meadow-700">ENVICON 2026</strong> จัดขึ้นภายใต้หัวข้อ
              <em class="text-meadow-800">"Innovative Environmental Technologies for a Sustainable and Low-Carbon Future"</em>
              เพื่อเป็นเวทีแลกเปลี่ยนความรู้ ผลงานวิจัย และนวัตกรรมด้านสิ่งแวดล้อม
              ระหว่างนักวิจัย อาจารย์ นิสิตนักศึกษา และผู้เชี่ยวชาญจากสถาบันอุดมศึกษาทั่วประเทศ
            </p>
            <blockquote class="relative border-l-4 border-meadow-500 pl-5 italic text-meadow-800 text-lg my-6">
              "เทคโนโลยีสิ่งแวดล้อมเชิงนวัตกรรมเพื่ออนาคตที่ยั่งยืนและสังคมคาร์บอนต่ำ"
            </blockquote>
            <div class="flex flex-wrap gap-3 mt-8">
              <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-meadow-50 text-meadow-700 text-sm font-semibold border border-meadow-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Peer-reviewed
              </span>
              <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 text-sky-700 text-sm font-semibold border border-sky-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Single-blind review
              </span>
              <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold border border-amber-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Open access
              </span>
            </div>
          </div>

          <div class="md:col-span-2 relative">
            <div class="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-meadow-200/40">
              <img
                src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&q=80&auto=format&fit=crop"
                alt="Wind turbines against golden sky"
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-meadow-950/70 via-transparent to-transparent" />
              <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div class="text-xs uppercase tracking-wider text-meadow-200 mb-1">Clean Energy</div>
                <div class="font-display text-2xl font-bold">พลังงานสะอาด</div>
                <div class="text-white/80 text-sm mt-1">ขับเคลื่อนอนาคตที่ยั่งยืน</div>
              </div>
            </div>
            <!-- Decorative offset card -->
            <div class="absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl bg-meadow-100 -z-10 hidden md:block" />
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ ASSOCIATION — Mission with photo ═══════════ -->
    <section class="relative py-24 bg-gradient-to-b from-meadow-50/60 via-white to-meadow-50/40 overflow-hidden">
      <!-- Subtle photo backdrop -->
      <div class="absolute inset-0 opacity-[0.04] pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=2000&q=80&auto=format&fit=crop"
          alt=""
          class="w-full h-full object-cover"
        />
      </div>

      <div class="relative max-w-6xl mx-auto px-6">
        <div class="grid md:grid-cols-5 gap-12 items-center">
          <div class="md:col-span-2 order-2 md:order-1 relative">
            <div class="grid grid-cols-2 gap-4">
              <div class="relative aspect-square rounded-3xl overflow-hidden shadow-xl shadow-meadow-200/30 translate-y-6">
                <img
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80&auto=format&fit=crop"
                  alt="Hands holding a plant"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="relative aspect-square rounded-3xl overflow-hidden shadow-xl shadow-meadow-200/30">
                <img
                  src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80&auto=format&fit=crop"
                  alt="Research laboratory"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div class="md:col-span-3 order-1 md:order-2">
            <span class="text-xs font-bold tracking-[0.2em] uppercase text-meadow-600 mb-3 block">The Association</span>
            <h2 class="font-display text-3xl sm:text-4xl font-bold text-meadow-900 mb-3 leading-tight">
              สมาคมสถาบันอุดมศึกษาสิ่งแวดล้อมไทย
            </h2>
            <p class="text-meadow-700 italic font-semibold mb-6">
              Association of Thai Higher Education Environmental Institutions
            </p>
            <p class="text-gray-700 leading-relaxed mb-6">
              เป็นเครือข่ายความร่วมมือระหว่างสถาบันอุดมศึกษาที่มีการเรียนการสอนและวิจัยด้านสิ่งแวดล้อม
              มุ่งเน้นการพัฒนาองค์ความรู้และสร้างบุคลากรด้านสิ่งแวดล้อมเพื่อการพัฒนาที่ยั่งยืน
            </p>

            <div class="space-y-3">
              <div v-for="(goal, i) in goals" :key="i" class="flex items-start gap-3 group">
                <span
                  class="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-meadow-500 to-meadow-600 flex items-center justify-center mt-0.5 shadow-md shadow-meadow-300/40">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span class="text-gray-700 leading-relaxed">{{ goal }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ TRACKS — Enhanced cards ═══════════ -->
    <section class="relative py-24 bg-white">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-14">
          <span class="text-xs font-bold tracking-[0.2em] uppercase text-meadow-600 mb-3 block">Research Tracks</span>
          <h2 class="font-display text-3xl sm:text-4xl font-bold text-meadow-900">หัวข้อการนำเสนอผลงาน</h2>
          <div class="w-16 h-1.5 bg-gradient-to-r from-meadow-400 to-sky-400 rounded-full mx-auto mt-5" />
          <p class="text-gray-500 mt-5 max-w-2xl mx-auto">
            7 หัวข้อหลักครอบคลุมทุกมิติของงานวิจัยด้านสิ่งแวดล้อมและเทคโนโลยีคาร์บอนต่ำ
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="track in tracks" :key="track.id"
            class="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-meadow-900/30 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 min-h-[300px] flex flex-col">
            <div class="absolute inset-0 overflow-hidden">
              <img :src="track.bg" :alt="track.en"
                class="w-full h-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110"
                loading="lazy" />
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-meadow-950/95 via-meadow-900/70 to-meadow-900/25" />
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-meadow-400 via-sky-400 to-cyan-400" />

            <div class="relative p-6 flex flex-col h-full text-white">
              <div class="flex items-center justify-between mb-6">
                <div
                  class="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 shadow-lg">
                  <UIcon :name="track.icon" class="w-5 h-5" />
                </div>
                <div class="text-[10px] font-bold text-white/80 tracking-[0.2em] uppercase">Track {{ String(track.id).padStart(2, '0') }}</div>
              </div>

              <div class="mt-auto">
                <div class="text-[10px] font-bold text-meadow-300 tracking-[0.2em] uppercase mb-2">{{ track.tag }}</div>
                <h3 class="font-semibold text-lg mb-1.5 leading-snug drop-shadow-lg">{{ track.th }}</h3>
                <p class="text-sm text-white/85 font-medium mb-2 leading-snug">{{ track.en }}</p>
                <p class="text-sm text-white/70 leading-relaxed">{{ track.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ CTA — Photo banner ═══════════ -->
    <section class="py-12 bg-meadow-50">
      <div class="max-w-5xl mx-auto px-6">
        <div class="relative overflow-hidden rounded-3xl shadow-2xl">
          <div class="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1800&q=80&auto=format&fit=crop"
              alt="Ocean and sustainability"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="absolute inset-0 bg-gradient-to-r from-meadow-900/85 via-meadow-800/70 to-meadow-900/85" />

          <div class="relative px-8 py-14 sm:py-16 text-center text-white">
            <h2 class="font-display text-3xl sm:text-4xl font-bold mb-3">
              พร้อมร่วมขับเคลื่อนอนาคตสิ่งแวดล้อมไทยแล้วหรือยัง?
            </h2>
            <p class="text-white/80 mb-7 max-w-xl mx-auto">
              ส่งผลงานวิจัยของคุณเข้าร่วมนำเสนอในการประชุมวิชาการระดับชาติ ENVICON 2026
            </p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <NuxtLink to="/dashboard"
                class="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-meadow-700 font-bold hover:bg-meadow-50 hover:scale-[1.03] shadow-lg transition-all duration-300">
                ส่งบทคัดย่อ
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </NuxtLink>
              <NuxtLink to="/registration"
                class="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl border-2 border-white/40 bg-white/10 backdrop-blur-md text-white font-bold hover:bg-white/20 hover:border-white/60 hover:scale-[1.02] transition-all duration-300">
                ลงทะเบียนเข้าร่วมงาน
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
const seededRange = (index: number, salt: number, min: number, max: number) => {
  const value = Math.sin(index * 73.13 + salt * 19.37) * 10000;
  const fraction = value - Math.floor(value);
  return min + fraction * (max - min);
};

const aboutParticleStyle = (i: number) => {
  const size = seededRange(i, 31, 6, 28);
  const left = seededRange(i, 32, -2, 100);
  const delay = seededRange(i, 33, 0, 18);
  const duration = seededRange(i, 34, 14, 30);
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    bottom: `-${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };
};

export default { name: 'AboutPage' };
</script>

<style scoped>
.about-hero-photo {
  animation: aboutKenBurns 32s ease-in-out infinite alternate;
}

@keyframes aboutKenBurns {
  0% {
    transform: scale(1) translate(0, 0);
  }

  100% {
    transform: scale(1.1) translate(1%, -1.5%);
  }
}

.about-vignette {
  background: radial-gradient(ellipse at 50% 45%, transparent 25%, rgba(2, 44, 34, 0.55) 100%);
  pointer-events: none;
}

.about-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 5;
}

.about-particle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05) 60%, transparent);
  border: 1px solid rgba(255, 255, 255, 0.15);
  animation: aboutParticleRise linear infinite;
  box-shadow: inset -1px -1px 3px rgba(255, 255, 255, 0.1), 0 0 10px rgba(255, 255, 255, 0.05);
}

@keyframes aboutParticleRise {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }

  10% {
    opacity: 0.6;
  }

  50% {
    transform: translateY(-50vh) translateX(15px) scale(1.05);
  }

  90% {
    opacity: 0.3;
  }

  100% {
    transform: translateY(-110vh) translateX(-10px) scale(0.85);
    opacity: 0;
  }
}
</style>
