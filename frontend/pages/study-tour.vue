<script setup lang="ts">
useHead({
  title: "สถานที่ศึกษาดูงาน — TSHE-CON 2026",
  meta: [
    {
      name: "description",
      content:
        "สถานที่ศึกษาดูงานนวัตกรรมและเทคโนโลยี มจพ. ในงานประชุมวิชาการระดับชาติ TSHE-CON 2026 วันที่ 13 พฤศจิกายน 2569",
    },
  ],
});

interface Facility {
  id: number;
  nameTh: string;
  nameEn: string;
  category: string;
  badgeClass: string;
  iconBgClass: string;
  icon: string;
  description: string;
  highlights: string[];
}

const facilities: Facility[] = [
  {
    id: 1,
    nameTh: "ศูนย์ปฏิบัติการสิ่งแวดล้อมและการอนุรักษ์พลังงาน",
    nameEn: "Environment and Energy Conservation Operation Center",
    category: "สิ่งแวดล้อม & การอนุรักษ์พลังงาน",
    badgeClass: "bg-sky-50 text-sky-700 ring-sky-200 border-sky-200",
    iconBgClass: "bg-sky-500 text-white shadow-sky-500/25",
    icon: "i-heroicons-sun",
    description:
      "ศูนย์ปฏิบัติการด้านเทคโนโลยีสิ่งแวดล้อมและการอนุรักษ์พลังงาน มุ่งเน้นการวิจัย พัฒนา และประยุกต์ใช้นวัตกรรมพลังงานสะอาด การจัดการพลังงานอย่างมีประสิทธิภาพ และการลดผลกระทบต่อสิ่งแวดล้อมอย่างยั่งยืน",
    highlights: [
      "เทคโนโลยีการอนุรักษ์พลังงานและการจัดการพลังงานอัจฉริยะในอาคารและอุตสาหกรรม",
      "การตรวจวัด วิเคราะห์ และติดตามคุณภาพสิ่งแวดล้อมด้วยเทคโนโลยีสมัยใหม่",
      "นวัตกรรมพลังงานสะอาดและการลดการปล่อยก๊าซเรือนกระจกเพื่อมุ่งสู่ Net Zero",
    ],
  },
  {
    id: 2,
    nameTh: "ศูนย์ปฏิบัติการระบบอัตโนมัติและหุ่นยนต์",
    nameEn: "Automation and Robotics Center",
    category: "ระบบอัตโนมัติ & หุ่นยนต์",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200 border-emerald-200",
    iconBgClass: "bg-emerald-600 text-white shadow-emerald-600/25",
    icon: "i-heroicons-cpu-chip",
    description:
      "ศูนย์นวัตกรรมชั้นนำด้านระบบอัตโนมัติ หุ่นยนต์อุตสาหกรรม และ Smart Factory 4.0 มุ่งเน้นการบูรณาการปัญญาประดิษฐ์เข้ากับกระบวนการผลิตเพื่อประสิทธิภาพและความปลอดภัยสูงสุด",
    highlights: [
      "หุ่นยนต์อุตสาหกรรมและหุ่นยนต์ทำงานร่วมกับมนุษย์ (Collaborative Robots: Cobots)",
      "ระบบโรงงานอัจฉริยะ Smart Factory เชื่อมต่อ IoT เพื่อประหยัดพลังงาน",
      "ระบบปัญญาประดิษฐ์ตรวจจับและควบคุมคุณภาพการผลิต (AI Computer Vision)",
    ],
  },
  {
    id: 3,
    nameTh: "สถาบันเทคโนโลยีอวกาศนานาชาติเพื่อการพัฒนาเศรษฐกิจ",
    nameEn: "International Institute of Space Technology for Economic Development",
    category: "เทคโนโลยีอวกาศ & สิ่งแวดล้อม",
    badgeClass: "bg-indigo-50 text-indigo-700 ring-indigo-200 border-indigo-200",
    iconBgClass: "bg-indigo-600 text-white shadow-indigo-600/25",
    icon: "i-heroicons-globe-alt",
    description:
      "สถาบันวิจัยและพัฒนาดาวเทียม เทคโนโลยีอวกาศ และการประยุกต์ใช้ข้อมูลภูมิสารสนเทศเชิงพื้นที่เพื่อการบริหารจัดการสิ่งแวดล้อม การติดตามสภาพภูมิอากาศ และการขับเคลื่อนเศรษฐกิจอวกาศยุคใหม่",
    highlights: [
      "การออกแบบและพัฒนาดาวเทียมขนาดเล็ก (CubeSat & Small Satellites)",
      "การวิเคราะห์ข้อมูลภาพถ่ายดาวเทียมเพื่อการจัดการสิ่งแวดล้อมและภัยพิบัติ",
      "การส่งเสริมและพัฒนาระบบนิเวศเศรษฐกิจอวกาศ (New Space Economy)",
    ],
  },
  {
    id: 4,
    nameTh: "ศูนย์การเรียนรู้การบำบัดน้ำเสียจากสารเคมี",
    nameEn: "Chemical Wastewater Treatment Learning Center",
    category: "เทคโนโลยีบำบัดน้ำเสียเคมี",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-200 border-amber-200",
    iconBgClass: "bg-amber-500 text-white shadow-amber-500/25",
    icon: "i-heroicons-beaker",
    description:
      "ศูนย์วิจัยและถ่ายทอดเทคโนโลยีด้านการบำบัดน้ำเสียที่มีสารเคมีอันตรายและโลหะหนักตกค้าง โดยใช้นวัตกรรมการบำบัดขั้นสูงเพื่อฟื้นฟูคุณภาพน้ำและลดผลกระทบต่อระบบนิเวศ",
    highlights: [
      "เทคโนโลยีออกซิเดชันขั้นสูง (Advanced Oxidation Processes - AOPs)",
      "การดูดซับและการแยกโลหะหนักด้วยวัสดุที่เป็นมิตรต่อสิ่งแวดล้อม",
      "การหมุนเวียนน้ำทิ้งกลับมาใช้ใหม่ตามแนวทาง Zero Liquid Discharge",
    ],
  },
  {
    id: 5,
    nameTh: "ศูนย์การเรียนรู้ระบบบำบัดน้ำเสียโรงอาหาร อาคาร 40 ปี มจพ.",
    nameEn: "Canteen Wastewater Treatment Learning Center, 40th Anniversary Building",
    category: "การจัดการสิ่งแวดล้อมชุมชน",
    badgeClass: "bg-teal-50 text-teal-700 ring-teal-200 border-teal-200",
    iconBgClass: "bg-teal-600 text-white shadow-teal-600/25",
    icon: "i-heroicons-sparkles",
    description:
      "ระบบบำบัดน้ำเสียต้นแบบระดับอาคารและโรงอาหาร จัดการน้ำเสียชุมชนและของเสียจากสารอินทรีย์อย่างครบวงจร พร้อมส่งเสริมการใช้ทรัพยากรอย่างคุ้มค่าในมหาวิทยาลัยสีเขียว",
    highlights: [
      "ระบบดักและแยกไขมันประสิทธิภาพสูง ลดปัญหาการอุดตันและมลพิษทางน้ำ",
      "การบำบัดทางชีวภาพด้วยจุลินทรีย์และการเติมอากาศแบบประหยัดพลังงาน",
      "การหมุนเวียนกากตะกอนและไขมันเพื่อผลิตพลังงานชีวภาพและปุ๋ยบำรุงดิน",
    ],
  },
];
</script>

<template>
  <main class="min-h-screen bg-stone-50">
    <!-- ═══════════ HERO SECTION ═══════════ -->
    <section class="relative overflow-hidden bg-meadow-950 text-white py-16 sm:py-24">
      <div class="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-meadow-500/20 blur-3xl" />
      <div class="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />

      <div class="relative max-w-5xl mx-auto px-6 text-center">
        <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-meadow-300 backdrop-blur-md border border-white/15 mb-6">
          <UIcon name="i-heroicons-sparkles" class="h-4 w-4" />
          <span>กิจกรรมพิเศษ · Technical Study Tour</span>
        </div>

        <h1 class="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          สถานที่ศึกษาดูงานนวัตกรรมและเทคโนโลยี
        </h1>
        <p class="text-base sm:text-xl text-meadow-100 max-w-3xl mx-auto leading-relaxed">
          มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ (มจพ.)
        </p>

        <!-- Tour Quick Facts Card -->
        <div class="mt-8 inline-block w-full max-w-2xl text-left rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 sm:p-6 shadow-xl">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0 text-meadow-300">
                <UIcon name="i-heroicons-calendar" class="w-5 h-5" />
              </div>
              <div>
                <span class="text-xs text-white/70 block">วันที่จัดกิจกรรม</span>
                <span class="font-bold text-white">13 พ.ย. 2569</span>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0 text-amber-300">
                <UIcon name="i-heroicons-clock" class="w-5 h-5" />
              </div>
              <div>
                <span class="text-xs text-white/70 block">เวลาศึกษาดูงาน</span>
                <span class="font-bold text-white">13:00 – 15:00 น.</span>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0 text-sky-300">
                <UIcon name="i-heroicons-map-pin" class="w-5 h-5" />
              </div>
              <div>
                <span class="text-xs text-white/70 block">จุดรวมพล / เริ่มต้น</span>
                <span class="font-bold text-white">อาคาร 99 อุทยานฯ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ FACILITY CARDS SECTION ═══════════ -->
    <section class="max-w-6xl mx-auto px-6 py-16 sm:py-20">
      <div class="text-center mb-12">
        <h2 class="text-2xl sm:text-3xl font-bold text-stone-900 mb-3">
          5 ศูนย์และสถาบันชั้นนำในการศึกษาดูงาน
        </h2>
        <p class="text-stone-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          เปิดโอกาสให้ผู้เข้าร่วมการประชุม TSHE-CON 2026 ได้สัมผัสงานวิจัย ห้องปฏิบัติการจริง และเทคโนโลยีที่เป็นมิตรต่อสิ่งแวดล้อม
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <article
          v-for="facility in facilities"
          :key="facility.id"
          class="group relative flex flex-col rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-meadow-300"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-4 mb-5">
            <div
              :class="[
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-105',
                facility.iconBgClass,
              ]"
            >
              <UIcon :name="facility.icon" class="h-7 w-7" />
            </div>
            <span
              :class="[
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1',
                facility.badgeClass,
              ]"
            >
              {{ facility.category }}
            </span>
          </div>

          <!-- Titles -->
          <h3 class="text-lg sm:text-xl font-bold text-stone-900 leading-snug mb-1">
            {{ facility.nameTh }}
          </h3>
          <p class="text-xs font-medium text-stone-400 mb-4">
            {{ facility.nameEn }}
          </p>

          <!-- Description -->
          <p class="text-sm text-stone-600 leading-relaxed mb-6">
            {{ facility.description }}
          </p>

          <!-- Highlights -->
          <div class="mt-auto border-t border-stone-100 pt-4">
            <span class="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5 block">
              จุดเด่นและไฮไลต์ที่น่าสนใจ:
            </span>
            <ul class="space-y-2">
              <li
                v-for="(hl, idx) in facility.highlights"
                :key="idx"
                class="flex items-start gap-2 text-xs sm:text-sm text-stone-700 leading-relaxed"
              >
                <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-meadow-600 mt-0.5 shrink-0" />
                <span>{{ hl }}</span>
              </li>
            </ul>
          </div>
        </article>
      </div>

      <!-- ═══════════ NOTICE & CALLOUT ═══════════ -->
      <div class="mt-12 rounded-3xl border border-meadow-200 bg-gradient-to-r from-meadow-50 via-white to-sky-50 p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl bg-meadow-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-meadow-600/20">
              <UIcon name="i-heroicons-information-circle" class="w-6 h-6" />
            </div>
            <div>
              <h4 class="font-bold text-stone-900 text-base sm:text-lg mb-1">
                คำแนะนำสำหรับผู้เข้าร่วมการศึกษาดูงาน
              </h4>
              <p class="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
                กิจกรรมศึกษาดูงานเป็นส่วนหนึ่งของการประชุมวิชาการ TSHE-CON 2026 โดยไม่มีค่าใช้จ่ายเพิ่มเติมสำหรับผู้ลงทะเบียน โปรดพร้อมกัน ณ จุดรวมพล อาคาร 99 อุทยานเทคโนโลยี มจพ. ในเวลา 12:50 น. เพื่อออกเดินทางพร้อมวิทยากรประจำกลุ่ม
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 shrink-0">
            <UButton
              to="/program"
              color="primary"
              variant="solid"
              size="md"
              class="font-semibold shadow-md"
            >
              <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 mr-1.5" />
              ดูกำหนดการประชุม
            </UButton>
            <UButton
              to="/"
              color="gray"
              variant="outline"
              size="md"
              class="font-semibold"
            >
              หน้าแรก
            </UButton>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
