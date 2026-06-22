<template>
  <div class="overflow-hidden bg-gradient-to-b from-sky-100 via-meadow-50 to-white">
    <!-- ═══════════ HERO — Forest Canopy Photo ═══════════ -->
    <section class="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-meadow-950">
      <!-- Background photo: sun-dappled forest canopy -->
      <div class="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2400&q=80&auto=format&fit=crop"
          alt="Sun-dappled forest canopy"
          class="w-full h-full object-cover hero-photo"
        />
      </div>

      <!-- Layered overlays -->
      <div class="absolute inset-0 bg-gradient-to-b from-meadow-950/45 via-meadow-900/30 to-meadow-950/75" />
      <div class="absolute inset-0 bg-gradient-to-tr from-meadow-900/45 via-transparent to-sky-900/25" />
      <div class="absolute inset-0 hero-vignette" />

      <!-- Floating particles -->
      <div class="bubbles-container">
        <div v-for="i in 30" :key="'b' + i" class="bubble bubble--hero" :style="bubbleStyle(i)" />
      </div>

      <!-- Content -->
      <div class="relative z-10 max-w-5xl mx-auto px-6 text-center mt-[-5vh]">
        <div
          class="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/30 rounded-full px-6 py-2.5 mb-8 hero-fade hero-fade--1 shadow-lg shadow-meadow-950/30">
          <span class="w-2.5 h-2.5 rounded-full bg-meadow-400 animate-pulse shadow-sm shadow-meadow-300" />
          <span class="text-sm font-semibold tracking-wide text-white">The 5th National Conference</span>
        </div>

        <h1
          class="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95] mb-6 hero-fade hero-fade--2">
          <span class="block text-white drop-shadow-2xl">Innovative</span>
          <span
            class="block bg-gradient-to-r from-amber-300 via-orange-200 to-rose-200 bg-clip-text text-transparent mt-1 drop-shadow-lg">Environmental</span>
          <span
            class="block bg-gradient-to-r from-sky-300 via-cyan-200 to-blue-200 bg-clip-text text-transparent mt-1 drop-shadow-lg pb-2">Technologies</span>
        </h1>

        <p class="text-lg sm:text-xl text-white/90 font-medium max-w-2xl mx-auto mb-3 hero-fade hero-fade--3 mt-3 drop-shadow-md">
          for a Sustainable and Low-Carbon Future
        </p>
        <p class="text-base text-white/75 max-w-xl mx-auto mb-10 hero-fade hero-fade--4 drop-shadow-md">
          เทคโนโลยีสิ่งแวดล้อมเชิงนวัตกรรมเพื่ออนาคตที่ยั่งยืนและสังคมคาร์บอนต่ำ
        </p>

        <!-- Countdown -->
        <div class="flex items-center justify-center gap-3 sm:gap-5 mb-10 hero-fade hero-fade--5">
          <div v-for="unit in countdown" :key="unit.label" class="countdown-unit countdown-unit--hero">
            <div class="countdown-value countdown-value--hero">{{ unit.value }}</div>
            <div class="countdown-label countdown-label--hero">{{ unit.label }}</div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center hero-fade hero-fade--6">
          <button @click="goToAuthorDashboard"
            class="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-meadow-500 to-meadow-600 font-bold text-white text-lg shadow-2xl shadow-meadow-500/40 hover:shadow-meadow-400/60 hover:scale-[1.04] hover:-translate-y-0.5 transition-all duration-300">
            ส่งบทคัดย่อ
            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          <NuxtLink to="/about"
            class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/40 bg-white/10 backdrop-blur-md text-white font-semibold text-lg hover:bg-white/20 hover:border-white/60 hover:scale-[1.02] transition-all duration-300">
            เกี่ยวกับงาน
          </NuxtLink>
          <button @click="showRegModal = true"
            class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-sky-300/60 bg-sky-400/15 backdrop-blur-md text-white font-semibold text-lg hover:bg-sky-400/25 hover:border-sky-300 hover:scale-[1.02] transition-all duration-300">
            ลงทะเบียนเข้าร่วมงาน
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Scroll hint -->
      <div
        class="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50 hero-fade hero-fade--7">
        <span class="text-xs tracking-[0.2em] uppercase font-medium">Scroll</span>
        <div class="w-px h-8 bg-gradient-to-b from-white/60 to-transparent scroll-line" />
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

    <!-- ═══════════ CTA BANNER — Solar Field Photo ═══════════ -->
    <section class="py-4 bg-meadow-50">
      <div class="max-w-5xl mx-auto px-6">
        <div class="relative overflow-hidden rounded-3xl shadow-2xl shadow-meadow-200/40">
          <!-- Background photo -->
          <div class="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1800&q=80&auto=format&fit=crop"
              alt="Solar panels at sunset"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="absolute inset-0 bg-gradient-to-r from-meadow-900/85 via-meadow-800/70 to-meadow-900/80" />
          <!-- Bubble decorations -->
          <div v-for="i in 8" :key="'cb' + i" class="absolute rounded-full border border-white/20 bg-white/[0.07]"
            :style="ctaBubbleStyle(i)" />

          <div class="relative px-8 py-12 sm:py-16 text-center text-white">
            <div class="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5">
              <span class="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
              <span class="text-xs font-semibold tracking-wide">กำลังเปิดรับผลงาน</span>
            </div>
            <h2 class="font-display text-3xl sm:text-4xl font-bold mb-3">
              เปิดรับบทคัดย่อถึง <span class="text-amber-200 drop-shadow-md">30 กันยายน 2569</span>
            </h2>
            <p class="text-white/80 mb-7 max-w-lg mx-auto">ส่งบทคัดย่อของคุณเพื่อเข้าร่วมนำเสนอในการประชุมวิชาการ</p>
            <button @click="goToAuthorDashboard"
              class="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-meadow-700 font-bold hover:bg-meadow-50 hover:scale-[1.03] shadow-lg transition-all duration-300">
              ส่งบทคัดย่อเลย →
            </button>
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

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="(track, i) in tracks" :key="track.th"
            class="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-meadow-900/30 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 min-h-[280px] flex flex-col">
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
                <div class="text-[10px] font-bold text-white/80 tracking-[0.2em] uppercase">Track {{ String(i + 1).padStart(2, '0') }}</div>
              </div>

              <div class="mt-auto">
                <div class="text-[10px] font-bold text-meadow-300 tracking-[0.2em] uppercase mb-2">{{ track.tag }}</div>
                <h3 class="font-semibold text-lg mb-1.5 leading-snug drop-shadow-lg">{{ track.th }}</h3>
                <p class="text-sm text-white/85 font-medium leading-snug">{{ track.en }}</p>
              </div>
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

    <!-- ═══════════ VENUE — Building Photo Card ═══════════ -->
    <section class="py-24 bg-gradient-to-b from-white to-meadow-50/50">
      <div class="max-w-5xl mx-auto px-6">
        <div class="text-center mb-12">
          <span class="text-xs font-bold tracking-[0.2em] uppercase text-sky-600 mb-3 block">Venue</span>
          <h2 class="font-display text-3xl sm:text-4xl font-bold text-meadow-900">สถานที่จัดงาน</h2>
          <div class="w-16 h-1.5 bg-gradient-to-r from-meadow-400 to-sky-400 rounded-full mx-auto mt-5" />
        </div>

        <div class="grid md:grid-cols-2 gap-6 items-stretch">
          <div class="relative rounded-3xl overflow-hidden shadow-2xl shadow-meadow-200/40 aspect-[4/3] md:aspect-auto md:min-h-[360px]">
            <img
              src="https://www.geodesicdesign.co.th/admin/img_large/8907637.jpg"
              alt="Modern university building"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-meadow-950/60 via-transparent to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div class="text-xs font-semibold tracking-wider uppercase text-meadow-200 mb-1">Conference Hall</div>
              <div class="font-display text-2xl font-bold">อาคาร 99</div>
            </div>
          </div>

          <div class="rounded-3xl border border-meadow-100 bg-white shadow-xl shadow-meadow-100/30 p-8 md:p-10 flex flex-col justify-center">
            <div class="font-display text-2xl font-bold text-meadow-800 mb-2">อุทยานเทคโนโลยี มจพ.</div>
            <div class="text-sm text-sky-600 font-semibold mb-6">KMUTNB Technopark</div>

            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-meadow-100 text-meadow-700 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-wider text-gray-500 font-semibold">สถานที่</div>
                  <div class="text-meadow-800 font-semibold">อาคาร 99 อุทยานเทคโนโลยี มจพ.</div>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-wider text-gray-500 font-semibold">วันจัดงาน</div>
                  <div class="text-meadow-800 font-semibold">12 — 13 พฤศจิกายน 2569</div>
                </div>
              </div>
            </div>

            <NuxtLink to="/venue"
              class="mt-8 inline-flex items-center gap-2 self-start px-6 py-3 rounded-2xl bg-meadow-50 text-meadow-700 font-semibold hover:bg-meadow-100 hover:scale-[1.02] transition-all duration-300 border border-meadow-200">
              ดูแผนที่และการเดินทาง
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <HomeRegistrationModal v-model="showRegModal" />
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const showRegModal = ref(false);

const goToAuthorDashboard = async () => {
  if (!authStore.initialized) {
    authStore.loadFromStorage();
  }

  await navigateTo(authStore.isLoggedIn ? "/dashboard" : "/auth/login?redirect=/dashboard");
};

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

const countdown = useState("home-countdown", () => getCountdown())

onMounted(() => {
  countdown.value = getCountdown()
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

const tracks = [
  {
    th: "วิทยาศาสตร์สิ่งแวดล้อมและการควบคุมมลพิษ",
    en: "Environmental Science and Pollution Control",
    icon: "i-heroicons-beaker",
    tag: "Pollution Control",
    bg: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&q=80&auto=format&fit=crop",
  },
  {
    th: "การจัดการระบบนิเวศและทรัพยากรธรรมชาติ",
    en: "Ecosystem and Natural Resource Management",
    icon: "i-heroicons-globe-alt",
    tag: "Ecosystem",
    bg: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80&auto=format&fit=crop",
  },
  {
    th: "เศรษฐกิจหมุนเวียนและการใช้ทรัพยากรอย่างคุ้มค่า",
    en: "Circular Economy and Resource Efficiency",
    icon: "i-heroicons-arrow-path",
    tag: "Circular Economy",
    bg: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&q=80&auto=format&fit=crop",
  },
  {
    th: "การเปลี่ยนแปลงสภาพภูมิอากาศและเทคโนโลยีคาร์บอนต่ำ",
    en: "Climate Change and Low-Carbon Technology",
    icon: "i-heroicons-cloud",
    tag: "Climate Action",
    bg: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80&auto=format&fit=crop",
  },
  {
    th: "เทคโนโลยีดิจิทัลและระบบอัจฉริยะเพื่อการติดตามสิ่งแวดล้อม",
    en: "Digital Technology and Intelligent Systems for Environmental Monitoring",
    icon: "i-heroicons-cpu-chip",
    tag: "Smart Monitoring",
    bg: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&auto=format&fit=crop",
  },
  {
    th: "เมืองยั่งยืน อุตสาหกรรมสีเขียว และการจัดการสิ่งแวดล้อม",
    en: "Sustainable Cities, Green Industry, and Environmental Management",
    icon: "i-heroicons-building-office-2",
    tag: "Green City",
    bg: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&q=80&auto=format&fit=crop",
  },
  {
    th: "สิ่งแวดล้อมและสุขภาพ",
    en: "Environment and Health",
    icon: "i-heroicons-heart",
    tag: "Well-being",
    bg: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1200&q=80&auto=format&fit=crop",
  },
];

const timeline = [
  { title: "เปิดรับบทคัดย่อ", date: "1 เมษายน — 30 กันยายน 2569", highlight: true, icon: "i-heroicons-pencil-square" },
  { title: "ประกาศผลการพิจารณาบทคัดย่อ", date: "7 ตุลาคม 2569", highlight: false, icon: "i-heroicons-megaphone" },
  { title: "เปิดรับบทความฉบับสมบูรณ์", date: "7 — 24 ตุลาคม 2569", highlight: false, icon: "i-heroicons-document-text" },
  { title: "ประกาศโปรแกรมการนำเสนอผลงาน", date: "31 ตุลาคม 2569", highlight: false, icon: "i-heroicons-calendar-days" },
  { title: "วันจัดงานประชุม", date: "12 — 13 พฤศจิกายน 2569", highlight: true, icon: "i-heroicons-academic-cap" },
];

// Stable decoration positions keep SSR and hydration output identical.
const seededRange = (index: number, salt: number, min: number, max: number) => {
  const value = Math.sin(index * 73.13 + salt * 19.37) * 10000;
  const fraction = value - Math.floor(value);
  return min + fraction * (max - min);
};

const bubbleStyle = (i: number) => {
  const size = seededRange(i, 1, 12, 55);
  const left = seededRange(i, 2, -5, 100);
  const delay = seededRange(i, 3, 0, 20);
  const duration = seededRange(i, 4, 12, 28);
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
  const left = (i / 60) * 100 + seededRange(i, 5, -1, 1);
  const height = seededRange(i, 6, 30, 80);
  const delay = seededRange(i, 7, 0, 4);
  const hue = seededRange(i, 8, 100, 150);
  return {
    left: `${left}%`,
    height: `${height}px`,
    animationDelay: `${delay}s`,
    background: `linear-gradient(to top, hsl(${hue}, 55%, 45%), hsl(${hue}, 60%, 55%))`,
  };
};

const flowerStyle = (i: number) => {
  const left = seededRange(i, 9, 2, 95);
  const bottom = seededRange(i, 10, 0, 12);
  const delay = seededRange(i, 11, 0, 5);
  const size = seededRange(i, 12, 14, 22);
  return {
    left: `${left}%`,
    bottom: `${bottom}%`,
    animationDelay: `${delay}s`,
    fontSize: `${size}px`,
  };
};

const ctaBubbleStyle = (i: number) => {
  const size = seededRange(i, 13, 20, 80);
  const top = seededRange(i, 14, -20, 80);
  const left = seededRange(i, 15, -10, 100);
  return {
    width: `${size}px`,
    height: `${size}px`,
    top: `${top}%`,
    left: `${left}%`,
  };
};

const sectionBubbleStyle = (i: number) => {
  const size = seededRange(i, 16, 40, 120);
  const left = seededRange(i, 17, -5, 95);
  const delay = seededRange(i, 18, 0, 15);
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    bottom: `-${size}px`,
    animationDelay: `${delay}s`,
  };
};

const timelineBubbleStyle = (i: number) => {
  const size = seededRange(i, 19, 15, 50);
  const left = seededRange(i, 20, -5, 100);
  const delay = seededRange(i, 21, 0, 18);
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
/* ── Hero photo ── */
.hero-photo {
  animation: kenBurns 28s ease-in-out infinite alternate;
}

@keyframes kenBurns {
  0% {
    transform: scale(1) translate(0, 0);
  }

  100% {
    transform: scale(1.08) translate(-1%, -1%);
  }
}

.hero-vignette {
  background: radial-gradient(ellipse at 50% 45%, transparent 25%, rgba(2, 44, 34, 0.55) 100%);
  pointer-events: none;
}

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

.bubble--hero {
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.05) 60%, transparent);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: inset -1px -1px 4px rgba(255, 255, 255, 0.15), 0 0 12px rgba(255, 255, 255, 0.06);
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
  box-shadow: 0 4px 16px rgba(5, 150, 105, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.countdown-unit--hero {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(14px);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 24px rgba(2, 44, 34, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
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

.countdown-value--hero {
  background: linear-gradient(135deg, #ffffff, #bbf7d0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 8px rgba(2, 44, 34, 0.35));
}

.countdown-label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
  margin-top: 0.25rem;
}

.countdown-label--hero {
  color: rgba(255, 255, 255, 0.85);
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
