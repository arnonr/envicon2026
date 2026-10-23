<script setup lang="ts">
type Locale = "th" | "en";

interface EvaluationCriterion {
  index: number;
  label: string;
  percent: number;
  percentLabel: string;
}

interface PresentationSection {
  id: "oral" | "poster";
  number: string;
  title: string;
  icon: string;
  accentGradient: string;
  badgeClass: string;
  iconBgClass: string;
  primaryBarClass: string;
  secondaryBarClass: string;
  durationHeading: string;
  presentLabel: string;
  qaLabel: string;
  totalLabel: string;
  presentRatio: number;
  qaRatio: number;
  criteriaHeading: string;
  criteria: EvaluationCriterion[];
  guidelinesHeading: string;
  guidelines: string[];
}

interface PageCopy {
  badge: string;
  title: string;
  intro: string;
  sections: PresentationSection[];
  closingLines: string[];
}

const lang = ref<Locale>("th");

const copyByLocale: Record<Locale, PageCopy> = {
  th: {
    badge: "TSHECON 2026",
    title: "คำแนะนำสำหรับผู้เข้าร่วมการนำเสนอผลงานวิจัย",
    intro:
      "ขอให้ผู้เข้าร่วมการนำเสนอผลงานวิจัยทุกท่านศึกษารูปแบบการนำเสนอ ระยะเวลา และเกณฑ์การพิจารณารางวัล ดังรายละเอียดต่อไปนี้",
    sections: [
      {
        id: "oral",
        number: "01",
        title: "1. การนำเสนอผลงานแบบ Oral Presentation",
        icon: "i-heroicons-microphone",
        accentGradient: "from-emerald-500 to-meadow-400",
        badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        iconBgClass: "bg-meadow-50 text-meadow-700 ring-meadow-100",
        primaryBarClass: "bg-emerald-500",
        secondaryBarClass: "bg-sky-500",
        durationHeading: "ระยะเวลาการนำเสนอ",
        presentLabel: "นำเสนอผลงานวิจัย 10 นาที",
        qaLabel: "ตอบคำถามจากคณะกรรมการ 5 นาที",
        totalLabel: "รวมเวลาทั้งสิ้น 15 นาทีต่อผลงาน",
        presentRatio: 66.67,
        qaRatio: 33.33,
        criteriaHeading: "เกณฑ์การพิจารณารางวัล",
        criteria: [
          { index: 1, label: "ระเบียบวิธีวิจัย", percent: 30, percentLabel: "ร้อยละ 30" },
          {
            index: 2,
            label: "ผลกระทบของงานวิจัยต่อเศรษฐกิจ สังคม สิ่งแวดล้อม และนโยบาย",
            percent: 20,
            percentLabel: "ร้อยละ 20",
          },
          { index: 3, label: "คุณภาพของสื่อการนำเสนอ", percent: 10, percentLabel: "ร้อยละ 10" },
          { index: 4, label: "การนำเสนอผลงานวิจัย", percent: 30, percentLabel: "ร้อยละ 30" },
          { index: 5, label: "การตอบคำถาม", percent: 10, percentLabel: "ร้อยละ 10" },
        ],
        guidelinesHeading: "คำแนะนำสำหรับผู้นำเสนอ",
        guidelines: [
          "จัดเตรียมสไลด์และตรวจสอบความพร้อมของไฟล์ก่อนถึงเวลานำเสนอ",
          "บริหารเวลาให้เหมาะสม โดยครอบคลุมวัตถุประสงค์ ระเบียบวิธีวิจัย ผลการศึกษา และข้อสรุปที่สำคัญ",
          "เน้นให้เห็นถึงความสำคัญ ความใหม่ และผลกระทบที่คาดว่าจะเกิดขึ้นจากงานวิจัย",
          "เตรียมพร้อมตอบคำถามของคณะกรรมการอย่างชัดเจน กระชับ และมีเหตุผล",
          "ปฏิบัติตามกำหนดการและคำแนะนำของผู้ดำเนินรายการอย่างเคร่งครัด",
        ],
      },
      {
        id: "poster",
        number: "02",
        title: "2. การนำเสนอผลงานแบบ Poster Presentation",
        icon: "i-heroicons-photo",
        accentGradient: "from-sky-500 to-cyan-400",
        badgeClass: "bg-sky-50 text-sky-700 ring-sky-200",
        iconBgClass: "bg-sky-50 text-sky-700 ring-sky-100",
        primaryBarClass: "bg-sky-500",
        secondaryBarClass: "bg-amber-500",
        durationHeading: "ระยะเวลาการนำเสนอ",
        presentLabel: "นำเสนอผลงานวิจัย 8 นาที",
        qaLabel: "ตอบคำถามจากคณะกรรมการ 7 นาที",
        totalLabel: "รวมเวลาทั้งสิ้น 15 นาทีต่อผลงาน",
        presentRatio: 53.33,
        qaRatio: 46.67,
        criteriaHeading: "เกณฑ์การพิจารณารางวัล",
        criteria: [
          { index: 1, label: "ระเบียบวิธีวิจัย", percent: 30, percentLabel: "ร้อยละ 30" },
          {
            index: 2,
            label: "ผลกระทบของงานวิจัยต่อเศรษฐกิจ สังคม สิ่งแวดล้อม และนโยบาย",
            percent: 20,
            percentLabel: "ร้อยละ 20",
          },
          { index: 3, label: "คุณภาพของโปสเตอร์", percent: 20, percentLabel: "ร้อยละ 20" },
          { index: 4, label: "การนำเสนอผลงานวิจัย", percent: 15, percentLabel: "ร้อยละ 15" },
          { index: 5, label: "การตอบคำถาม", percent: 15, percentLabel: "ร้อยละ 15" },
        ],
        guidelinesHeading: "คำแนะนำสำหรับผู้นำเสนอ",
        guidelines: [
          "จัดเตรียมโปสเตอร์ให้มีเนื้อหาครบถ้วน ถูกต้อง อ่านง่าย และมีการจัดวางองค์ประกอบอย่างเหมาะสม",
          "สรุปประเด็นสำคัญของงานวิจัยให้กระชับและสามารถสื่อสารได้ภายในเวลาที่กำหนด",
          "เน้นวัตถุประสงค์ ระเบียบวิธีวิจัย ผลการศึกษา ข้อสรุป และผลกระทบของงานวิจัย",
          "เตรียมพร้อมอธิบายรายละเอียดเพิ่มเติมและตอบคำถามของคณะกรรมการ",
          "อยู่ประจำโปสเตอร์ตามช่วงเวลาที่กำหนด และปฏิบัติตามคำแนะนำของเจ้าหน้าที่",
        ],
      },
    ],
    closingLines: [
      "ขอให้ผู้เข้าร่วมการนำเสนอทุกท่านเตรียมความพร้อมและดำเนินการนำเสนอภายในเวลาที่กำหนด เพื่อให้การดำเนินงานเป็นไปด้วยความเรียบร้อยและมีประสิทธิภาพ",
    ],
  },
  en: {
    badge: "TSHECON 2026",
    title: "Guidelines for Research Presenters",
    intro:
      "All research presenters are requested to review the presentation formats, time allocations, and award evaluation criteria outlined below.",
    sections: [
      {
        id: "oral",
        number: "01",
        title: "1. Oral Presentation",
        icon: "i-heroicons-microphone",
        accentGradient: "from-emerald-500 to-meadow-400",
        badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        iconBgClass: "bg-meadow-50 text-meadow-700 ring-meadow-100",
        primaryBarClass: "bg-emerald-500",
        secondaryBarClass: "bg-sky-500",
        durationHeading: "Presentation Duration",
        presentLabel: "Research presentation: 10 minutes",
        qaLabel: "Questions and answers: 5 minutes",
        totalLabel: "Total time: 15 minutes per presentation",
        presentRatio: 66.67,
        qaRatio: 33.33,
        criteriaHeading: "Award Evaluation Criteria",
        criteria: [
          { index: 1, label: "Research methodology", percent: 30, percentLabel: "30%" },
          {
            index: 2,
            label: "Research impact on the economy, society, the environment, and policy",
            percent: 20,
            percentLabel: "20%",
          },
          { index: 3, label: "Quality of presentation materials", percent: 10, percentLabel: "10%" },
          { index: 4, label: "Research presentation and delivery", percent: 30, percentLabel: "30%" },
          { index: 5, label: "Responses to questions", percent: 10, percentLabel: "10%" },
        ],
        guidelinesHeading: "Guidelines for Presenters",
        guidelines: [
          "Prepare your presentation slides and ensure that all files are ready before your scheduled session.",
          "Manage your time effectively, covering the research objectives, methodology, key findings, and conclusions.",
          "Highlight the significance, novelty, and potential impact of your research.",
          "Be prepared to answer questions from the evaluation committee clearly, concisely, and logically.",
          "Follow the presentation schedule and the instructions provided by the session moderator.",
        ],
      },
      {
        id: "poster",
        number: "02",
        title: "2. Poster Presentation",
        icon: "i-heroicons-photo",
        accentGradient: "from-sky-500 to-cyan-400",
        badgeClass: "bg-sky-50 text-sky-700 ring-sky-200",
        iconBgClass: "bg-sky-50 text-sky-700 ring-sky-100",
        primaryBarClass: "bg-sky-500",
        secondaryBarClass: "bg-amber-500",
        durationHeading: "Presentation Duration",
        presentLabel: "Research presentation: 8 minutes",
        qaLabel: "Questions and answers: 7 minutes",
        totalLabel: "Total time: 15 minutes per presentation",
        presentRatio: 53.33,
        qaRatio: 46.67,
        criteriaHeading: "Award Evaluation Criteria",
        criteria: [
          { index: 1, label: "Research methodology", percent: 30, percentLabel: "30%" },
          {
            index: 2,
            label: "Research impact on the economy, society, the environment, and policy",
            percent: 20,
            percentLabel: "20%",
          },
          { index: 3, label: "Poster quality", percent: 20, percentLabel: "20%" },
          { index: 4, label: "Research presentation and delivery", percent: 15, percentLabel: "15%" },
          { index: 5, label: "Responses to questions", percent: 15, percentLabel: "15%" },
        ],
        guidelinesHeading: "Guidelines for Presenters",
        guidelines: [
          "Ensure that your poster is scientifically accurate, well-organized, easy to read, and visually clear.",
          "Present the key points of your research concisely within the allocated time.",
          "Highlight the research objectives, methodology, findings, conclusions, and potential impact.",
          "Be prepared to elaborate on your research and respond to questions from the evaluation committee.",
          "Remain at your poster during the designated presentation period and follow the instructions provided by the event staff.",
        ],
      },
    ],
    closingLines: [
      "All presenters are encouraged to prepare thoroughly and adhere to the allocated presentation times to ensure the smooth and efficient conduct of TSHECON 2026.",
      "Thank you for your cooperation, and we wish all presenters every success.",
    ],
  },
};

const currentCopy = computed(() => copyByLocale[lang.value]);
</script>

<template>
  <main class="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-stone-50">
    <div class="pointer-events-none absolute -left-40 top-24 h-96 w-96 rounded-full bg-meadow-200/40 blur-3xl" />
    <div class="pointer-events-none absolute -right-32 bottom-20 h-[28rem] w-[28rem] rounded-full bg-sky-100/70 blur-3xl" />

    <!-- Hero -->
    <section class="relative overflow-hidden bg-meadow-950 text-white">
      <div
        class="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:44px_44px]"
      />
      <div class="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-meadow-300/20" />
      <div class="absolute -right-4 -top-12 h-48 w-48 rounded-full border border-meadow-300/20" />

      <div class="relative mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div class="max-w-3xl">
            <div class="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-meadow-200">
              <span class="h-px w-10 bg-meadow-300" />
              {{ currentCopy.badge }}
            </div>
            <h1 class="font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              {{ currentCopy.title }}
            </h1>
            <p class="mt-4 max-w-2xl text-sm leading-relaxed text-meadow-100/85 sm:text-base">
              {{ currentCopy.intro }}
            </p>
          </div>

          <!-- Language Switch -->
          <div
            class="inline-flex shrink-0 self-start rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-md"
            role="group"
            aria-label="Language selector"
          >
            <button
              type="button"
              class="rounded-full px-4 py-2 text-xs font-bold transition-all sm:text-sm"
              :class="
                lang === 'th'
                  ? 'bg-meadow-500 text-white shadow-sm'
                  : 'text-meadow-100/80 hover:text-white'
              "
              @click="lang = 'th'"
            >
              🇹🇭 ภาษาไทย
            </button>
            <button
              type="button"
              class="rounded-full px-4 py-2 text-xs font-bold transition-all sm:text-sm"
              :class="
                lang === 'en'
                  ? 'bg-meadow-500 text-white shadow-sm'
                  : 'text-meadow-100/80 hover:text-white'
              "
              @click="lang = 'en'"
            >
              🇬🇧 English
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Cards -->
    <section class="relative mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
      <div class="grid gap-8 lg:grid-cols-2">
        <article
          v-for="section in currentCopy.sections"
          :key="section.id"
          class="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-xl shadow-meadow-950/[0.06] transition-all duration-300 hover:border-meadow-300"
        >
          <div :class="['h-2 bg-gradient-to-r', section.accentGradient]" />

          <div class="relative flex flex-1 flex-col p-6 sm:p-8">
            <div
              class="pointer-events-none absolute right-6 top-4 select-none font-display text-7xl font-bold leading-none text-stone-100"
            >
              {{ section.number }}
            </div>

            <!-- Card Header -->
            <div class="relative flex items-start gap-4">
              <div
                :class="[
                  'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1',
                  section.iconBgClass,
                ]"
              >
                <UIcon :name="section.icon" class="h-7 w-7" />
              </div>
              <div class="pr-12">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1',
                    section.badgeClass,
                  ]"
                >
                  {{ section.totalLabel }}
                </span>
                <h2 class="mt-2 text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
                  {{ section.title }}
                </h2>
              </div>
            </div>

            <!-- Duration Block -->
            <div class="mt-7 rounded-2xl border border-stone-200/80 bg-stone-50/90 p-5">
              <div class="mb-3 flex items-center gap-2 text-sm font-bold text-stone-800">
                <UIcon name="i-heroicons-clock" class="h-5 w-5 text-meadow-600" />
                <span>{{ section.durationHeading }}</span>
              </div>

              <div class="mb-3 flex h-3 w-full overflow-hidden rounded-full bg-stone-200">
                <div :class="section.primaryBarClass" :style="{ width: `${section.presentRatio}%` }" />
                <div :class="section.secondaryBarClass" :style="{ width: `${section.qaRatio}%` }" />
              </div>

              <div class="grid gap-2 text-xs sm:grid-cols-2 sm:text-sm">
                <div class="flex items-center gap-2 text-stone-700">
                  <span :class="['h-2.5 w-2.5 shrink-0 rounded-full', section.primaryBarClass]" />
                  <span>{{ section.presentLabel }}</span>
                </div>
                <div class="flex items-center gap-2 text-stone-700">
                  <span :class="['h-2.5 w-2.5 shrink-0 rounded-full', section.secondaryBarClass]" />
                  <span>{{ section.qaLabel }}</span>
                </div>
              </div>
              <p class="mt-2.5 border-t border-stone-200/80 pt-2 text-xs font-semibold text-stone-600">
                {{ section.totalLabel }}
              </p>
            </div>

            <!-- Award Evaluation Criteria -->
            <div class="mt-7">
              <div class="mb-3.5 flex items-center gap-2 text-sm font-bold text-stone-800">
                <UIcon name="i-heroicons-trophy" class="h-5 w-5 text-amber-500" />
                <h3>{{ section.criteriaHeading }}</h3>
              </div>

              <ol class="space-y-3">
                <li
                  v-for="item in section.criteria"
                  :key="item.index"
                  class="rounded-xl border border-stone-100 bg-stone-50/60 px-4 py-3"
                >
                  <div class="flex items-start justify-between gap-3 text-sm">
                    <span class="font-medium text-stone-700">
                      {{ item.index }}. {{ item.label }}
                    </span>
                    <span class="shrink-0 font-bold text-stone-900">
                      {{ item.percentLabel }}
                    </span>
                  </div>
                  <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-200/80">
                    <div
                      :class="['h-full rounded-full', section.primaryBarClass]"
                      :style="{ width: `${item.percent}%` }"
                    />
                  </div>
                </li>
              </ol>
            </div>

            <!-- Presenter Guidelines -->
            <div class="mt-7 flex-1">
              <div class="mb-3.5 flex items-center gap-2 text-sm font-bold text-stone-800">
                <UIcon name="i-heroicons-check-badge" class="h-5 w-5 text-meadow-600" />
                <h3>{{ section.guidelinesHeading }}</h3>
              </div>

              <ul class="space-y-2.5">
                <li
                  v-for="(tip, idx) in section.guidelines"
                  :key="idx"
                  class="flex items-start gap-2.5 text-sm leading-relaxed text-stone-700"
                >
                  <UIcon
                    name="i-heroicons-check-circle"
                    class="mt-0.5 h-5 w-5 shrink-0 text-meadow-600"
                  />
                  <span>{{ tip }}</span>
                </li>
              </ul>
            </div>
          </div>
        </article>
      </div>

      <!-- Closing Note -->
      <div
        class="mt-10 rounded-2xl border border-meadow-200/80 bg-gradient-to-r from-meadow-50 via-white to-sky-50 p-6 shadow-sm sm:p-8"
      >
        <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-meadow-600 text-white shadow-md shadow-meadow-600/20"
          >
            <UIcon name="i-heroicons-information-circle" class="h-6 w-6" />
          </div>
          <div class="space-y-1.5 text-sm leading-relaxed text-stone-700 sm:text-base">
            <p v-for="(line, idx) in currentCopy.closingLines" :key="idx" class="font-medium">
              {{ line }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
