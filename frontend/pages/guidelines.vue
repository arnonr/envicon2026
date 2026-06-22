<script setup lang="ts">
interface QuickStat {
  value: string;
  label: string;
  icon: string;
}

const quickStats: QuickStat[] = [
  { value: "300", label: "คำ (Abstract)", icon: "i-heroicons-document-text" },
  { value: "6–10", label: "หน้า (Full Paper)", icon: "i-heroicons-document-duplicate" },
  { value: "20 MB", label: "ขนาดไฟล์สูงสุด", icon: "i-heroicons-cloud-arrow-up" },
  { value: "APA 7", label: "รูปแบบอ้างอิง", icon: "i-heroicons-bookmark" },
];

interface Section {
  id: string;
  number: string;
  title: string;
  titleEn: string;
  desc: string;
  icon: string;
  items: string[];
  ordered?: boolean;
}

const sections: Section[] = [
  {
    id: "abstract",
    number: "01",
    title: "การเตรียมบทคัดย่อ",
    titleEn: "Abstract Preparation",
    desc: "บทคัดย่อควรสื่อสารถึงวัตถุประสงค์ วิธีการ และผลลัพธ์หลักของงานวิจัยอย่างกระชับ",
    icon: "i-heroicons-document-text",
    items: [
      "ความยาวไม่เกิน 300 คำ",
      "ระบุหัวข้อ (Track) ที่ต้องการนำเสนอ",
      "ระบุคำสำคัญ (Keywords) 3–5 คำ",
      "เขียนเป็นภาษาไทยหรือภาษาอังกฤษ",
      "ไฟล์ PDF ขนาดไม่เกิน 5 MB",
    ],
  },
  {
    id: "fullpaper",
    number: "02",
    title: "การเตรียมบทความฉบับสมบูรณ์",
    titleEn: "Full Paper Preparation",
    desc: "บทความฉบับเต็มจัดพิมพ์ตามรูปแบบมาตรฐานเพื่อรักษาความสม่ำเสมอของเอกสาร",
    icon: "i-heroicons-document-duplicate",
    items: [
      "ความยาว 6–10 หน้า (รวมรายการอ้างอิง)",
      "ขนาดกระดาษ A4",
      "Font: TH Sarabun New ขนาด 14 pt",
      "ระยะขอบ: บน 2.54 cm · ล่าง 2.54 cm · ซ้าย 3.17 cm · ขวา 2.54 cm",
      "รูปแบบการอ้างอิง: APA 7th Edition",
      "ไฟล์ PDF ขนาดไม่เกิน 20 MB",
    ],
  },
  {
    id: "structure",
    number: "03",
    title: "โครงสร้างบทความ",
    titleEn: "Paper Structure",
    desc: "องค์ประกอบมาตรฐานที่ผู้ประเมินใช้พิจารณาความครบถ้วนของงานวิจัย",
    icon: "i-heroicons-list-bullet",
    ordered: true,
    items: [
      "ชื่อเรื่อง (Title) — ภาษาไทยและภาษาอังกฤษ",
      "ชื่อผู้เขียน (Authors) และสังกัด",
      "บทคัดย่อ (Abstract) — ภาษาไทยและภาษาอังกฤษ",
      "บทนำ (Introduction)",
      "วิธีการวิจัย (Methodology)",
      "ผลการวิจัยและอภิประผล (Results and Discussion)",
      "สรุปผลการวิจัย (Conclusion)",
      "กิตติกรรมประกาศ (Acknowledgments) — ถ้ามี",
      "เอกสารอ้างอิง (References)",
    ],
  },
];
</script>

<template>
  <div class="overflow-hidden bg-stone-50">
    <!-- ═══════════ HERO ═══════════ -->
    <section class="relative bg-stone-50 border-b border-stone-200">
      <div class="max-w-6xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        <div class="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-14 items-center">
          <!-- Text side -->
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-meadow-50 text-meadow-700 text-xs font-semibold uppercase tracking-[0.25em] border border-meadow-200/60">
              <span class="w-1.5 h-1.5 rounded-full bg-meadow-500"></span>
              Submission Guidelines
            </div>
            <h1 class="mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight text-stone-900">
              แนวทาง
              <span class="block mt-1 text-stone-500">การเขียนบทความ</span>
            </h1>
            <p class="mt-5 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
              เกณฑ์มาตรฐานสำหรับการจัดทำบทคัดย่อและบทความฉบับสมบูรณ์
              เพื่อให้งานวิจัยของท่านผ่านการประเมินอย่างราบรื่น
            </p>

            <!-- Quick stats inline -->
            <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                v-for="(s, i) in quickStats"
                :key="i"
                class="rounded-xl bg-white border border-stone-200 px-4 py-3 shadow-sm hover:border-meadow-300 hover:shadow-md transition-all duration-300"
              >
                <div class="flex items-center gap-2 mb-1.5">
                  <UIcon :name="s.icon" class="w-3.5 h-3.5 text-meadow-600" />
                  <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500">
                    {{ s.label }}
                  </span>
                </div>
                <div class="font-semibold text-xl text-stone-900 tabular-nums">
                  {{ s.value }}
                </div>
              </div>
            </div>
          </div>

          <!-- Photo side -->
          <div class="relative h-64 lg:h-96 rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80&auto=format&fit=crop"
              alt="Writing and research"
              class="absolute inset-0 w-full h-full object-cover guidelines-hero-img"
              loading="eager"
            />
            <div class="absolute inset-0 bg-gradient-to-tr from-meadow-900/30 via-transparent to-stone-900/15" />
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-meadow-400 via-meadow-500 to-meadow-600" />
            <div class="absolute bottom-4 left-4 right-4">
              <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-md text-[10px] font-semibold uppercase tracking-[0.2em] text-meadow-700">
                <UIcon name="i-heroicons-pencil-square" class="w-3 h-3" />
                Academic Writing
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ SECTIONS ═══════════ -->
    <section class="bg-white">
      <div class="max-w-5xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        <div class="space-y-5">
          <article
            v-for="section in sections"
            :id="section.id"
            :key="section.id"
            class="group relative bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg hover:border-meadow-300/60 transition-all duration-500 scroll-mt-12 overflow-hidden"
          >
            <!-- Top accent -->
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-meadow-300 via-meadow-500 to-meadow-300 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

            <div class="p-6 sm:p-8 lg:p-10">
              <!-- Header -->
              <div class="flex items-start gap-5 mb-6">
                <!-- Number + icon -->
                <div class="flex-shrink-0">
                  <div class="relative w-14 h-14 rounded-xl bg-meadow-50 border border-meadow-200/60 flex items-center justify-center group-hover:bg-meadow-100 transition-colors duration-500">
                    <UIcon :name="section.icon" class="w-6 h-6 text-meadow-600" />
                    <span class="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-stone-900 text-white text-[10px] font-bold tracking-wider tabular-nums shadow-sm">
                      {{ section.number }}
                    </span>
                  </div>
                </div>

                <!-- Title -->
                <div class="flex-1 min-w-0">
                  <div class="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400 mb-1">
                    Section · {{ section.titleEn }}
                  </div>
                  <h2 class="font-semibold text-xl sm:text-2xl text-stone-900 leading-tight">
                    {{ section.title }}
                  </h2>
                  <p class="mt-2 text-sm text-stone-600 leading-relaxed max-w-2xl">
                    {{ section.desc }}
                  </p>
                </div>
              </div>

              <!-- List -->
              <component
                :is="section.ordered ? 'ol' : 'ul'"
                :class="[
                  'text-sm text-stone-700 leading-relaxed',
                  section.ordered ? 'list-decimal pl-5 space-y-2.5' : 'space-y-2.5',
                ]"
              >
                <li
                  v-for="(item, i) in section.items"
                  :key="i"
                  class="pl-1 marker:text-meadow-500 marker:font-semibold"
                >
                  <span class="marker:hidden">{{ item }}</span>
                </li>
              </component>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ═══════════ CTA / DOWNLOAD ═══════════ -->
    <section class="bg-stone-50 border-t border-stone-200">
      <div class="max-w-5xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        <div class="relative rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm">
          <!-- Top accent -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-stone-300 via-meadow-400 to-stone-300" />

          <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center p-6 sm:p-8 lg:p-10">
            <!-- Text -->
            <div>
              <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-semibold uppercase tracking-[0.2em] mb-3">
                <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                Coming Soon
              </div>
              <h3 class="font-semibold text-xl sm:text-2xl text-stone-900 leading-tight">
                ดาวน์โหลด Template บทความ
              </h3>
              <p class="mt-2 text-sm text-stone-600 leading-relaxed max-w-xl">
                ไฟล์ต้นแบบสำหรับจัดทำบทความฉบับสมบูรณ์ตามรูปแบบที่กำหนด
                จะพร้อมให้ดาวน์โหลดในเร็วๆ นี้
              </p>
            </div>

            <!-- Button -->
            <div class="flex md:flex-col items-start md:items-end gap-3">
              <button
                disabled
                class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-200 text-stone-500 font-semibold text-sm cursor-not-allowed"
              >
                <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
                ดาวน์โหลด Template
              </button>
              <span class="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                .docx · A4 · TH/EN
              </span>
            </div>
          </div>
        </div>

        <!-- Help -->
        <div class="mt-8 text-center">
          <p class="text-sm text-stone-500">
            มีข้อสงสัยเพิ่มเติม?
            <NuxtLink to="/contact" class="font-semibold text-meadow-700 hover:text-meadow-800 transition-colors">
              ติดต่อคณะกรรมการ
            </NuxtLink>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.guidelines-hero-img {
  transition: transform 1200ms ease-out;
}

.group:hover .guidelines-hero-img {
  transform: scale(1.05);
}
</style>
