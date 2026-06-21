<script setup lang="ts">
const tiers = [
  {
    name: "Bronze",
    nameTh: "บรอนซ์",
    color: "neutral",
    featured: false,
  },
  {
    name: "Silver",
    nameTh: "ซิลเวอร์",
    color: "primary",
    featured: true,
  },
  {
    name: "Gold",
    nameTh: "โกลด์",
    color: "amber",
    featured: false,
  },
  {
    name: "Platinum",
    nameTh: "แพลทินัม",
    color: "blue",
    featured: false,
  },
];

const stats = [
  { value: "500+", label: "ผู้เข้าร่วมงาน" },
  { value: "200+", label: "บทความวิจัย" },
  { value: "40+", label: "สถาบันอุดมศึกษา" },
  { value: "7", label: "หัวข้อวิชาการ" },
];

const whySponsor = [
  {
    icon: "🎯",
    title: "เข้าถึงกลุ่มเป้าหมาย",
    desc: "นักวิจัย อาจารย์ นิสิตนักศึกษา และผู้เชี่ยวชาญด้านสิ่งแวดล้อมจากทั่วประเทศ",
  },
  {
    icon: "🤝",
    title: "สร้างเครือข่าย",
    desc: "Networking กับสถาบันชั้นนำและองค์กรด้านสิ่งแวดล้อม",
  },
  {
    icon: "🌱",
    title: "แสดงความรับผิดชอบ",
    desc: "ตอกย้ำภาพลักษณ์องค์กรที่ใส่ใจสิ่งแวดล้อมและความยั่งยืน",
  },
];

const colorMap: Record<string, { text: string; border: string; bg: string }> = {
  neutral: { text: "text-gray-700", border: "border-gray-200", bg: "" },
  primary: { text: "text-primary-700", border: "border-primary-100", bg: "" },
  amber: {
    text: "text-amber-700",
    border: "border-amber-100",
    bg: "bg-gradient-to-b from-amber-50/40 to-white",
  },
  blue: {
    text: "text-blue-900",
    border: "border-blue-100",
    bg: "bg-gradient-to-b from-blue-50/40 to-white",
  },
};
</script>

<template>
  <!-- ═══════════ HERO ═══════════ -->
  <section
    class="bg-gradient-to-br from-primary-800 via-primary-700 to-teal-700 text-white"
  >
    <div class="max-w-5xl mx-auto px-8 py-24 text-center">
      <div
        class="text-[11px] tracking-[3px] uppercase font-semibold opacity-70"
      >
        Sponsorship Opportunity
      </div>
      <h1
        class="font-display text-4xl md:text-5xl font-extrabold leading-tight mt-3"
      >
        ร่วมสนับสนุน ENVICON 2026
      </h1>
      <p class="text-base opacity-85 mt-4 max-w-2xl mx-auto">
        งานประชุมวิชาการระดับชาติด้านสิ่งแวดล้อม ครั้งที่ 5<br />
        12–13 พฤศจิกายน 2569 • มจพ.
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <a
          href="#packages"
          class="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-primary-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          ดูแพ็กเกจ
        </a>
        <NuxtLink
          to="/contact"
          class="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-white/30 bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
        >
          ติดต่อเรา
        </NuxtLink>
      </div>
    </div>
  </section>

  <!-- ═══════════ STATS ═══════════ -->
  <section class="bg-white">
    <div class="max-w-5xl mx-auto px-8 py-16">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div v-for="(stat, i) in stats" :key="i">
          <div class="font-display text-4xl font-extrabold text-primary-700">
            {{ stat.value }}
          </div>
          <div class="text-sm text-gray-500 mt-1">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════ WHY SPONSOR ═══════════ -->
  <section class="bg-gray-50">
    <div class="max-w-6xl mx-auto px-8 py-20">
      <div class="text-center mb-12">
        <div class="text-[11px] tracking-[2px] uppercase font-semibold text-primary-700">
          Why Sponsor
        </div>
        <h2 class="font-display text-3xl font-extrabold text-gray-900 mt-2">
          ทำไมต้องร่วมสนับสนุน
        </h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UCard
          v-for="(reason, i) in whySponsor"
          :key="i"
          class="!p-6"
        >
          <div
            class="w-11 h-11 rounded-lg bg-primary-50 flex items-center justify-center text-2xl"
          >
            {{ reason.icon }}
          </div>
          <h3 class="text-base font-semibold text-gray-900 mt-3">
            {{ reason.title }}
          </h3>
          <p class="text-sm text-gray-600 leading-relaxed mt-1">
            {{ reason.desc }}
          </p>
        </UCard>
      </div>
    </div>
  </section>

  <!-- ═══════════ TIER CARDS ═══════════ -->
  <section id="packages" class="bg-white">
    <div class="max-w-6xl mx-auto px-8 py-20">
      <div class="text-center mb-12">
        <div class="text-[11px] tracking-[2px] uppercase font-semibold text-primary-700">
          Packages
        </div>
        <h2 class="font-display text-3xl font-extrabold text-gray-900 mt-2">
          แพ็กเกจสปอนเซอร์
        </h2>
        <p class="text-sm text-gray-500 mt-2">
          4 ระดับ ตามเป้าหมายและงบประมาณของคุณ
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(tier, i) in tiers"
          :key="i"
          class="relative"
        >
          <UCard
            class="!p-6 h-full"
            :class="[
              tier.featured
                ? '!border-2 !border-primary-700 shadow-lg'
                : `${colorMap[tier.color].border} ${colorMap[tier.color].bg}`,
            ]"
          >
            <div
              v-if="tier.featured"
              class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-700 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider"
            >
              ⭐ แนะนำ
            </div>
            <div
              class="text-xs font-bold tracking-widest"
              :class="colorMap[tier.color].text"
            >
              {{ tier.name }}
            </div>
            <div class="text-sm text-gray-500 mt-0.5">{{ tier.nameTh }}</div>
            <div
              class="border-t my-4"
              :class="colorMap[tier.color].border"
            ></div>
            <div
              class="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"
            >
              <span>⏳</span>
              <span>อยู่ระหว่างอัพเดทข้อมูล</span>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════ CTA ═══════════ -->
  <section
    class="bg-gradient-to-br from-primary-800 to-primary-700 text-white"
  >
    <div class="max-w-3xl mx-auto px-8 py-20 text-center">
      <h2 class="font-display text-2xl font-extrabold">
        สนใจเป็นสปอนเซอร์?
      </h2>
      <p class="text-sm opacity-90 mt-3 max-w-xl mx-auto">
        ติดต่อคณะกรรมการจัดงานเพื่อหารือรายละเอียดและจองแพ็กเกจ
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <a
          href="mailto:sponsor@envicon2026.ac.th"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-primary-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          📧 sponsor@envicon2026.ac.th
        </a>
        <a
          href="tel:025552000"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/30 bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
        >
          📞 02-555-2000
        </a>
      </div>
    </div>
  </section>
</template>
