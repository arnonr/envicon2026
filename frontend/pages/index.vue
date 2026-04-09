<template>
  <div class="overflow-hidden bg-gradient-to-b from-sky-100 via-meadow-50 to-white">
    <!-- ═══════════ HERO — Sunlit Meadow ═══════════ -->
    <section class="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
      <!-- Sky gradient -->
      <div class="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-meadow-100" />

      <!-- Sun glow -->
      <div
        class="absolute top-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-radial from-amber-200/60 via-amber-100/30 to-transparent animate-sun-pulse" />
      <div
        class="absolute top-[-5%] right-[15%] w-[300px] h-[300px] rounded-full bg-gradient-radial from-yellow-100/80 via-amber-50/40 to-transparent" />

      <!-- Clouds -->
      <div class="cloud cloud--1" />
      <div class="cloud cloud--2" />
      <div class="cloud cloud--3" />

      <!-- Distant hills -->
      <svg class="absolute bottom-[12%] left-0 w-full h-[70%] text-meadow-200/60" viewBox="0 0 1440 320"
        preserveAspectRatio="none">
        <path fill="currentColor" d="M0,224 C360,160 720,280 1080,200 C1260,170 1380,190 1440,200 L1440,320 L0,320 Z" />
      </svg>
      <svg class="absolute bottom-[8%] left-0 w-full h-[65%] text-meadow-300/50" viewBox="0 0 1440 320"
        preserveAspectRatio="none">
        <path fill="currentColor" d="M0,256 C240,180 480,280 720,240 C960,200 1200,260 1440,220 L1440,320 L0,320 Z" />
      </svg>

      <!-- Meadow ground -->
      <div
        class="absolute bottom-0 left-0 right-0 h-[28%]"
        style="background: linear-gradient(to top, #4ade80 0%, #65e292 15%, #86efac 35%, #a8f3c0 55%, #bbf7d0 72%, #d4fae3 87%, transparent 100%)" />


      <!-- Bubbles -->
      <div class="bubbles-container">
        <div v-for="i in 25" :key="'b' + i" class="bubble" :style="bubbleStyle(i)" />
      </div>

      <!-- Content -->
      <div class="relative z-10 max-w-5xl mx-auto px-6 text-center mt-[-5vh]">
        <div
          class="inline-flex items-center gap-2.5 bg-white/70 backdrop-blur-md border border-meadow-200 rounded-full px-6 py-2.5 mb-8 hero-fade hero-fade--1 shadow-sm shadow-meadow-200/50">
          <span class="w-2.5 h-2.5 rounded-full bg-meadow-500 animate-pulse shadow-sm shadow-meadow-400" />
          <span class="text-sm font-semibold tracking-wide text-meadow-700">The 5th National Conference</span>
        </div>

        <h1
          class="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95] mb-6 hero-fade hero-fade--2">
          <span class="block text-meadow-800 drop-shadow-sm">Innovative</span>
          <span
            class="block bg-gradient-to-r from-amber-500 via-orange-400 to-rose-400 bg-clip-text text-transparent mt-1 drop-shadow-sm">Environmental</span>
          <span
            class="block bg-gradient-to-r from-sky-500 via-blue-400 to-indigo-400 bg-clip-text text-transparent mt-1 drop-shadow-sm">Technologies</span>
        </h1>

        <p class="text-lg sm:text-xl text-meadow-700/80 font-medium max-w-2xl mx-auto mb-3 hero-fade hero-fade--3">
          for a Sustainable and Low-Carbon Future
        </p>
        <p class="text-base text-meadow-600/60 max-w-xl mx-auto mb-10 hero-fade hero-fade--4">
          เทคโนโลยีสิ่งแวดล้อมเชิงนวัตกรรมเพื่ออนาคตที่ยั่งยืนและสังคมคาร์บอนต่ำ
        </p>

        <!-- Countdown -->
        <div class="flex items-center justify-center gap-3 sm:gap-5 mb-10 hero-fade hero-fade--5">
          <div v-for="unit in countdown" :key="unit.label" class="countdown-unit">
            <div class="countdown-value">{{ unit.value }}</div>
            <div class="countdown-label">{{ unit.label }}</div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center hero-fade hero-fade--6">
          <NuxtLink to="/submit"
            class="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-meadow-500 to-meadow-600 font-bold text-white text-lg shadow-lg shadow-meadow-300/40 hover:shadow-meadow-400/60 hover:scale-[1.04] hover:-translate-y-0.5 transition-all duration-300">
            ส่งบทคัดย่อ
            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
          <NuxtLink to="/about"
            class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-meadow-300 bg-white/60 backdrop-blur-sm text-meadow-700 font-semibold text-lg hover:bg-white/80 hover:border-meadow-400 hover:scale-[1.02] transition-all duration-300">
            เกี่ยวกับงาน
          </NuxtLink>
        </div>
      </div>

      <!-- Scroll hint -->
      <div
        class="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-meadow-500/40 hero-fade hero-fade--7">
        <span class="text-xs tracking-[0.2em] uppercase font-medium">Scroll</span>
        <div class="w-px h-8 bg-gradient-to-b from-meadow-400/40 to-transparent scroll-line" />
      </div>
    </section>

    <!-- ═══════════ STATS — Soft Meadow Cards ═══════════ -->
    <section class="relative py-20 bg-white">
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-meadow-300 to-transparent" />

      <div class="max-w-5xl mx-auto px-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div v-for="(stat, i) in stats" :key="i"
            class="group relative rounded-3xl p-8 text-center border-2 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1"
            :class="stat.cardClass">
            <div class="font-display text-5xl font-bold mb-2" :class="stat.valueClass">{{ stat.value }}</div>
            <div class="text-sm font-semibold tracking-wide" :class="stat.labelClass">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ CTA BANNER — Fresh Green Wave ═══════════ -->
    <section class="py-4 bg-meadow-50">
      <div class="max-w-5xl mx-auto px-6">
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-meadow-500 via-meadow-400 to-sky-400">
          <!-- Bubble decorations -->
          <div v-for="i in 8" :key="'cb' + i" class="absolute rounded-full border border-white/20 bg-white/[0.07]"
            :style="ctaBubbleStyle(i)" />

          <div class="relative px-8 py-10 sm:py-12 text-center text-white">
            <div class="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5">
              <span class="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
              <span class="text-xs font-semibold tracking-wide">กำลังเปิดรับผลงาน</span>
            </div>
            <h2 class="font-display text-2xl sm:text-3xl font-bold mb-3">
              เปิดรับบทคัดย่อถึง <span class="text-amber-100 drop-shadow-sm">30 กันยายน 2569</span>
            </h2>
            <p class="text-white/75 mb-6 max-w-lg mx-auto">ส่งบทคัดย่อของคุณเพื่อเข้าร่วมนำเสนอในการประชุมวิชาการ</p>
            <NuxtLink to="/submit"
              class="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-meadow-700 font-bold hover:bg-meadow-50 hover:scale-[1.03] shadow-lg transition-all duration-300">
              ส่งบทคัดย่อเลย →
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ TRACKS — Garden of Topics ═══════════ -->
    <section class="py-24 bg-gradient-to-b from-white via-meadow-50/40 to-white relative">
      <!-- Floating bubbles in tracks section -->
      <div v-for="i in 6" :key="'tb' + i" class="absolute rounded-full bg-meadow-200/30 bubble-slow"
        :style="sectionBubbleStyle(i)" />

      <div class="max-w-6xl mx-auto px-6 relative z-10">
        <div class="text-center mb-14">
          <span class="text-xs font-bold tracking-[0.2em] uppercase text-meadow-600 mb-3 block">Research Tracks</span>
          <h2 class="font-display text-3xl sm:text-4xl font-bold text-meadow-900">หัวข้อการนำเสนอผลงาน</h2>
          <div class="w-16 h-1.5 bg-gradient-to-r from-meadow-400 to-sky-400 rounded-full mx-auto mt-5" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="(track, i) in tracks" :key="i"
            class="group relative rounded-2xl p-6 bg-white/80 backdrop-blur-sm border border-meadow-100 shadow-sm hover:shadow-xl hover:shadow-meadow-100/50 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
            <!-- Accent top -->
            <div class="absolute top-0 left-0 right-0 h-1 rounded-t-2xl transition-all duration-500"
              :class="trackColors[i % trackColors.length]" />

            <!-- Hover glow -->
            <div class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              :class="trackGlows[i % trackGlows.length]" />

            <UIcon :name="track.icon"
              class="absolute -bottom-2 -right-2 w-20 h-20 text-meadow-50 group-hover:text-meadow-100 transition-colors duration-500 select-none" />

            <div class="relative">
              <div class="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 shadow-sm"
                :class="trackBadges[i % trackBadges.length]">
                <UIcon :name="track.icon" class="w-5 h-5" />
              </div>
              <h3 class="font-semibold text-meadow-800 mb-2 leading-snug">{{ track.th }}</h3>
              <p class="text-sm text-gray-400 leading-relaxed">{{ track.en }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ TIMELINE — Meadow Path ═══════════ -->
    <section class="py-24 bg-gradient-to-br from-meadow-500 via-meadow-600 to-sky-600 relative overflow-hidden">
      <!-- Texture dots -->
      <div
        class="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')]" />
      <!-- Glow -->
      <div class="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-[120px]" />
      <div class="absolute bottom-0 left-1/4 w-72 h-72 bg-sky-300/20 rounded-full blur-[100px]" />
      <!-- Bubbles -->
      <div v-for="i in 10" :key="'tlb' + i"
        class="absolute rounded-full border border-white/10 bg-white/[0.03] bubble-timeline"
        :style="timelineBubbleStyle(i)" />

      <div class="relative max-w-3xl mx-auto px-6">
        <div class="text-center mb-14">
          <span class="text-xs font-bold tracking-[0.2em] uppercase text-meadow-200/80 mb-3 block">Important
            Dates</span>
          <h2 class="font-display text-3xl sm:text-4xl font-bold text-white">กำหนดการที่สำคัญ</h2>
          <div class="w-16 h-1.5 bg-gradient-to-r from-meadow-300 to-amber-300 rounded-full mx-auto mt-5" />
        </div>

        <div class="relative">
          <!-- Vertical path -->
          <div
            class="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-meadow-300/60 via-meadow-400/20 to-transparent" />

          <div class="space-y-3">
            <div v-for="(item, i) in timeline" :key="i" class="relative flex items-start gap-6">
              <div
                class="relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                :class="item.highlight
                  ? 'bg-amber-400/15 border-amber-400 shadow-lg shadow-amber-400/20'
                  : 'bg-white/[0.08] border-white/40'">
                <UIcon :name="item.icon" class="w-5 h-5" :class="item.highlight ? 'text-amber-300' : 'text-white/60'" />
              </div>
              <div class="flex-1 pb-6 pt-2">
                <div class="font-semibold text-white/90 mb-0.5">{{ item.title }}</div>
                <div class="text-sm" :class="item.highlight ? 'text-amber-200' : 'text-white/60'">{{ item.date
                  }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ VENUE — Fresh Light ═══════════ -->
    <section class="py-24 bg-gradient-to-b from-white to-meadow-50/50">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <span class="text-xs font-bold tracking-[0.2em] uppercase text-sky-600 mb-3 block">Venue</span>
        <h2 class="font-display text-3xl sm:text-4xl font-bold text-meadow-900 mb-8">สถานที่จัดงาน</h2>

        <div
          class="inline-block rounded-3xl border-2 border-meadow-100 bg-white/80 backdrop-blur-sm shadow-lg shadow-meadow-100/30 px-10 py-8">
          <div class="font-display text-xl font-bold text-meadow-800 mb-2">อาคาร 99 อุทยานเทคโนโลยี มจพ.</div>
          <div class="text-gray-500">KMUTNB Technopark</div>
          <div class="flex items-center justify-center gap-2 mt-4 text-meadow-600 font-semibold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>12 — 13 พฤศจิกายน 2569</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// ── Countdown ──
const EVENT_DATE = new Date('2026-11-12T08:00:00+07:00').getTime()

const pad = (n: number) => String(n).padStart(2, '0')

const getCountdown = () => {
  const diff = Math.max(0, EVENT_DATE - Date.now())
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return [
    { value: String(days), label: 'วัน' },
    { value: pad(hours), label: 'ชั่วโมง' },
    { value: pad(minutes), label: 'นาที' },
    { value: pad(seconds), label: 'วินาที' },
  ]
}

const countdown = ref(getCountdown())

onMounted(() => {
  const timer = setInterval(() => { countdown.value = getCountdown() }, 1000)
  onUnmounted(() => clearInterval(timer))
})

const stats = [
  {
    value: "12–13",
    label: "พ.ย. 2569",
    cardClass: "bg-gradient-to-br from-meadow-500 to-meadow-600 border-meadow-500 text-white shadow-lg shadow-meadow-200/50",
    valueClass: "text-white",
    labelClass: "text-meadow-100",
  },
  {
    value: "7",
    label: "Research Tracks",
    cardClass: "bg-white border-meadow-200 shadow-md hover:shadow-xl",
    valueClass: "text-sky-600",
    labelClass: "text-gray-500",
  },
  {
    value: "2",
    label: "วัน",
    cardClass: "bg-gradient-to-br from-amber-400 to-orange-400 border-amber-400 text-white shadow-lg shadow-amber-200/50",
    valueClass: "text-white",
    labelClass: "text-amber-100",
  },
];

const trackColors = [
  "bg-meadow-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-rose-400",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-orange-500",
];

const trackGlows = [
  "bg-gradient-to-br from-meadow-50 to-transparent",
  "bg-gradient-to-br from-sky-50 to-transparent",
  "bg-gradient-to-br from-amber-50 to-transparent",
  "bg-gradient-to-br from-rose-50 to-transparent",
  "bg-gradient-to-br from-violet-50 to-transparent",
  "bg-gradient-to-br from-cyan-50 to-transparent",
  "bg-gradient-to-br from-orange-50 to-transparent",
];

const trackBadges = [
  "bg-meadow-100 text-meadow-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
];

const tracks = [
  { th: "วิทยาศาสตร์สิ่งแวดล้อมและการควบคุมมลพิษ", en: "Environmental Science and Pollution Control", icon: "i-heroicons-beaker" },
  { th: "การจัดการระบบนิเวศและทรัพยากรธรรมชาติ", en: "Ecosystem and Natural Resource Management", icon: "i-heroicons-globe-alt" },
  { th: "เศรษฐกิจหมุนเวียนและการใช้ทรัพยากรอย่างคุ้มค่า", en: "Circular Economy and Resource Efficiency", icon: "i-heroicons-arrow-path" },
  { th: "การเปลี่ยนแปลงสภาพภูมิอากาศและเทคโนโลยีคาร์บอนต่ำ", en: "Climate Change and Low-Carbon Technology", icon: "i-heroicons-cloud" },
  { th: "เทคโนโลยีดิจิทัลและระบบอัจฉริยะเพื่อการติดตามสิ่งแวดล้อม", en: "Digital Technology and Intelligent Systems for Environmental Monitoring", icon: "i-heroicons-cpu-chip" },
  { th: "เมืองยั่งยืน อุตสาหกรรมสีเขียว และการจัดการสิ่งแวดล้อม", en: "Sustainable Cities, Green Industry, and Environmental Management", icon: "i-heroicons-building-office-2" },
  { th: "สิ่งแวดล้อมและสุขภาพ", en: "Environment and Health", icon: "i-heroicons-heart" },
];

const timeline = [
  { title: "เปิดรับบทคัดย่อ", date: "1 เมษายน — 30 กันยายน 2569", highlight: true, icon: "i-heroicons-pencil-square" },
  { title: "ประกาศผลการพิจารณาบทคัดย่อ", date: "7 ตุลาคม 2569", highlight: false, icon: "i-heroicons-megaphone" },
  { title: "เปิดรับบทความฉบับสมบูรณ์", date: "7 — 24 ตุลาคม 2569", highlight: false, icon: "i-heroicons-document-text" },
  { title: "ประกาศโปรแกรมการนำเสนอผลงาน", date: "31 ตุลาคม 2569", highlight: false, icon: "i-heroicons-calendar-days" },
  { title: "วันจัดงานประชุม", date: "12 — 13 พฤศจิกายน 2569", highlight: true, icon: "i-heroicons-academic-cap" },
];

// ── Random helpers ──
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

const bubbleStyle = (_i: number) => {
  const size = rand(12, 55);
  const left = rand(-5, 100);
  const delay = rand(0, 20);
  const duration = rand(12, 28);
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    bottom: `-${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };
};

const grassStyle = (i: number) => {
  const left = (i / 60) * 100 + rand(-1, 1);
  const height = rand(30, 80);
  const delay = rand(0, 4);
  const hue = rand(100, 150);
  return {
    left: `${left}%`,
    height: `${height}px`,
    animationDelay: `${delay}s`,
    background: `linear-gradient(to top, hsl(${hue}, 55%, 45%), hsl(${hue}, 60%, 55%))`,
  };
};

const flowerStyle = (i: number) => {
  const left = rand(2, 95);
  const bottom = rand(0, 12);
  const delay = rand(0, 5);
  const size = rand(14, 22);
  return {
    left: `${left}%`,
    bottom: `${bottom}%`,
    animationDelay: `${delay}s`,
    fontSize: `${size}px`,
  };
};

const ctaBubbleStyle = (_i: number) => {
  const size = rand(20, 80);
  const top = rand(-20, 80);
  const left = rand(-10, 100);
  return {
    width: `${size}px`,
    height: `${size}px`,
    top: `${top}%`,
    left: `${left}%`,
  };
};

const sectionBubbleStyle = (_i: number) => {
  const size = rand(40, 120);
  const left = rand(-5, 95);
  const delay = rand(0, 15);
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    bottom: `-${size}px`,
    animationDelay: `${delay}s`,
  };
};

const timelineBubbleStyle = (_i: number) => {
  const size = rand(15, 50);
  const left = rand(-5, 100);
  const delay = rand(0, 18);
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    bottom: `-${size}px`,
    animationDelay: `${delay}s`,
  };
};
</script>

<style scoped>
/* ── Bubbles ── */
.bubbles-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 5;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.1) 50%, rgba(134, 239, 172, 0.08));
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: bubbleRise linear infinite;
  box-shadow: inset -2px -2px 6px rgba(255, 255, 255, 0.2), 0 0 8px rgba(134, 239, 172, 0.1);
}

@keyframes bubbleRise {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }

  10% {
    opacity: 0.8;
  }

  50% {
    transform: translateY(-50vh) translateX(20px) scale(1.05);
  }

  90% {
    opacity: 0.5;
  }

  100% {
    transform: translateY(-110vh) translateX(-10px) scale(0.9);
    opacity: 0;
  }
}

/* Section bubbles */
.bubble-slow {
  position: absolute;
  border-radius: 50%;
  animation: bubbleRiseSlow linear infinite;
  pointer-events: none;
}

@keyframes bubbleRiseSlow {
  0% {
    transform: translateY(0);
    opacity: 0;
  }

  10% {
    opacity: 0.6;
  }

  90% {
    opacity: 0.3;
  }

  100% {
    transform: translateY(-120vh);
    opacity: 0;
  }
}

/* Timeline bubbles */
.bubble-timeline {
  animation: bubbleRiseTimeline linear infinite;
  pointer-events: none;
}

@keyframes bubbleRiseTimeline {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }

  10% {
    opacity: 0.5;
  }

  90% {
    opacity: 0.2;
  }

  100% {
    transform: translateY(-100vh) scale(0.8);
    opacity: 0;
  }
}

/* ── Grass ── */
.grass-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  pointer-events: none;
  z-index: 3;
}

.grass-blade {
  position: absolute;
  bottom: 0;
  width: 4px;
  border-radius: 2px 2px 0 0;
  transform-origin: bottom center;
  animation: sway 3s ease-in-out infinite;
}

@keyframes sway {

  0%,
  100% {
    transform: rotate(-5deg);
  }

  50% {
    transform: rotate(5deg);
  }
}

/* ── Flowers ── */
.flower {
  position: absolute;
  z-index: 4;
  animation: flowerBob 4s ease-in-out infinite;
}

.flower-head {
  display: block;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

@keyframes flowerBob {

  0%,
  100% {
    transform: translateY(0) rotate(-3deg);
  }

  50% {
    transform: translateY(-5px) rotate(3deg);
  }
}

/* ── Clouds ── */
.cloud {
  position: absolute;
  background: white;
  border-radius: 50%;
  opacity: 0.6;
  filter: blur(1px);
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  background: white;
  border-radius: 50%;
}

.cloud--1 {
  width: 120px;
  height: 40px;
  top: 8%;
  left: -5%;
  animation: cloudDrift 45s linear infinite;
}

.cloud--1::before {
  width: 60px;
  height: 50px;
  top: -25px;
  left: 20px;
}

.cloud--1::after {
  width: 80px;
  height: 45px;
  top: -20px;
  left: 50px;
}

.cloud--2 {
  width: 100px;
  height: 35px;
  top: 12%;
  left: 30%;
  opacity: 0.4;
  animation: cloudDrift 60s linear infinite;
  animation-delay: -20s;
}

.cloud--2::before {
  width: 50px;
  height: 40px;
  top: -20px;
  left: 15px;
}

.cloud--2::after {
  width: 65px;
  height: 38px;
  top: -18px;
  left: 40px;
}

.cloud--3 {
  width: 90px;
  height: 30px;
  top: 5%;
  left: 65%;
  opacity: 0.3;
  animation: cloudDrift 55s linear infinite;
  animation-delay: -35s;
}

.cloud--3::before {
  width: 45px;
  height: 35px;
  top: -18px;
  left: 12px;
}

.cloud--3::after {
  width: 55px;
  height: 32px;
  top: -15px;
  left: 35px;
}

@keyframes cloudDrift {
  from {
    transform: translateX(-200px);
  }

  to {
    transform: translateX(calc(100vw + 200px));
  }
}

/* ── Sun pulse ── */
@keyframes sun-pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* ── Hero fade-in ── */
.hero-fade {
  opacity: 0;
  transform: translateY(24px);
  animation: fadeUp 0.8s ease-out forwards;
}

.hero-fade--1 {
  animation-delay: 0.15s;
}

.hero-fade--2 {
  animation-delay: 0.3s;
}

.hero-fade--3 {
  animation-delay: 0.5s;
}

.hero-fade--4 {
  animation-delay: 0.6s;
}

.hero-fade--5 {
  animation-delay: 0.75s;
}

.hero-fade--6 {
  animation-delay: 0.9s;
}

.hero-fade--7 {
  animation-delay: 1.1s;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Countdown ── */
.countdown-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 1rem;
  padding: 0.75rem 1.25rem;
  min-width: 4.5rem;
  box-shadow: 0 4px 16px rgba(5, 150, 105, 0.1), inset 0 1px 0 rgba(255,255,255,0.8);
}

.countdown-value {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(1.75rem, 5vw, 2.75rem);
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, #059669, #0284c7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-variant-numeric: tabular-nums;
}

.countdown-label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
  margin-top: 0.25rem;
}

/* ── Scroll indicator ── */
.scroll-line {
  animation: scrollPulse 2s ease-in-out infinite;
}

@keyframes scrollPulse {

  0%,
  100% {
    opacity: 0.3;
    transform: scaleY(1);
  }

  50% {
    opacity: 0.8;
    transform: scaleY(1.3);
  }
}
</style>
