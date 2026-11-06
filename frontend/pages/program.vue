<script setup lang="ts">
import {
  PROGRAM_PDF_PATH,
  day1Schedule,
  day2Schedule,
  oralSessionBlocks,
  posterSessionBlock,
  sessionTracks,
  allEnrichedPapers,
  getPaperByCode,
  normalizePaperCode,
  type OralSessionBlock,
} from "~/utils/program-data";

const appBaseUrl = useRuntimeConfig().app.baseURL.replace(/\/$/, "");
const programPdfUrl = `${appBaseUrl}${PROGRAM_PDF_PATH}`;

type MainTab = "day1" | "day2" | "papers";
const activeTab = ref<MainTab>("day1");

const searchQuery = ref("");
const selectedSessionFilter = ref<string>("ALL");
const selectedTypeFilter = ref<"all" | "oral" | "poster">("all");

// Per-oral-block room filter ("ALL" shows full multi-room matrix, or room.id to focus on one room)
const oralRoomFilters = reactive<Record<"oral1" | "oral2" | "oral3", string>>({
  oral1: "ALL",
  oral2: "ALL",
  oral3: "ALL",
});

const posterGroupFilter = ref<string>("ALL");

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase());
const normalizedCodeQuery = computed(() => normalizePaperCode(searchQuery.value));

const searchResults = computed(() => {
  const q = normalizedQuery.value;
  if (!q) return [];
  const codeQ = normalizedCodeQuery.value.toLowerCase();

  return allEnrichedPapers.filter((paper) => {
    const normCode = normalizePaperCode(paper.code).toLowerCase();
    return (
      normCode.includes(codeQ) ||
      paper.code.toLowerCase().includes(q) ||
      paper.title.toLowerCase().includes(q) ||
      paper.author.toLowerCase().includes(q) ||
      paper.sessionNameTh.toLowerCase().includes(q) ||
      paper.sessionCode.toLowerCase().includes(q) ||
      paper.roomLabel.toLowerCase().includes(q) ||
      paper.chairOrEvaluators.some((c) => c.toLowerCase().includes(q))
    );
  });
});

const filteredSessionTracks = computed(() => {
  return sessionTracks
    .filter((track) => selectedSessionFilter.value === "ALL" || track.code === selectedSessionFilter.value)
    .map((track) => ({
      ...track,
      filteredOral:
        selectedTypeFilter.value === "poster" ? [] : track.oralPapers,
      filteredPoster:
        selectedTypeFilter.value === "oral" ? [] : track.posterPapers,
    }))
    .filter((track) => track.filteredOral.length > 0 || track.filteredPoster.length > 0);
});

function getFilteredRooms(block: OralSessionBlock) {
  const selected = oralRoomFilters[block.key];
  if (!selected || selected === "ALL") return block.rooms;
  return block.rooms.filter((r) => r.id === selected);
}

const filteredPosterColumns = computed(() => {
  if (posterGroupFilter.value === "ALL") return posterSessionBlock.columns;
  return posterSessionBlock.columns.filter((c) => c.id === posterGroupFilter.value);
});

function getScheduleTypeBadge(type: string) {
  switch (type) {
    case "registration":
      return { label: "ลงทะเบียน", class: "bg-stone-100 text-stone-700 border-stone-200" };
    case "ceremony":
      return { label: "พิธีการ", class: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    case "keynote":
      return { label: "บรรยายพิเศษ", class: "bg-amber-50 text-amber-800 border-amber-200" };
    case "panel":
      return { label: "เสวนาวิชาการ", class: "bg-sky-50 text-sky-800 border-sky-200" };
    case "oral":
      return { label: "Oral Presentation", class: "bg-meadow-100 text-meadow-900 border-meadow-300" };
    case "poster":
      return { label: "Poster Presentation", class: "bg-purple-100 text-purple-900 border-purple-300" };
    case "tour":
      return { label: "ศึกษาดูงาน", class: "bg-teal-50 text-teal-800 border-teal-200" };
    case "dinner":
      return { label: "กิจกรรมเครือข่าย", class: "bg-rose-50 text-rose-800 border-rose-200" };
    default:
      return { label: "พักเบรก / อาหาร", class: "bg-gray-100 text-gray-600 border-gray-200" };
  }
}
</script>

<template>
  <main class="min-h-screen bg-stone-50 pb-20">
    <!-- ═══════════ HERO HEADER ═══════════ -->
    <section class="relative overflow-hidden bg-meadow-950 text-white">
      <div
        class="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:44px_44px]"
      />
      <div class="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-meadow-500/15 blur-3xl" />
      <div class="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl" />

      <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div class="max-w-3xl">
            <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-meadow-400/30 bg-meadow-900/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-meadow-200">
              <span class="h-2 w-2 rounded-full bg-meadow-400 animate-pulse" />
              CONFERENCE PROGRAM · TSHE-CON 2026
            </div>
            <h1 class="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              กำหนดการประชุมวิชาการและตารางนำเสนอผลงาน
            </h1>
            <p class="mt-3 text-base sm:text-lg font-medium text-meadow-100">
              การประชุมวิชาการระดับชาติ สมาคมสถาบันอุดมศึกษาสิ่งแวดล้อมไทย ครั้งที่ 5
            </p>
            <p class="mt-1 text-sm sm:text-base text-meadow-200/85">
              “เทคโนโลยีสิ่งแวดล้อมเชิงนวัตกรรมเพื่ออนาคตที่ยั่งยืนและสังคมคาร์บอนต่ำ”
            </p>
            <div class="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-meadow-100/90">
              <span class="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5">
                <UIcon name="i-heroicons-calendar-days" class="h-4 w-4 text-meadow-300" />
                วันที่ 12 – 13 พฤศจิกายน 2569
              </span>
              <span class="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5">
                <UIcon name="i-heroicons-map-pin" class="h-4 w-4 text-sky-300" />
                ณ อาคาร 99 อุทยานเทคโนโลยี มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ
              </span>
            </div>
          </div>

          <!-- Download & Quick Links Card -->
          <div class="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md sm:min-w-[320px]">
            <div class="text-xs font-semibold uppercase tracking-wider text-meadow-200">
              เอกสารกำหนดการฉบับสมบูรณ์ (18 หน้า)
            </div>
            <a
              :href="programPdfUrl"
              download="TSHE-CON-2026-Program.pdf"
              class="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-meadow-500 to-emerald-500 px-5 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-meadow-950/40 transition-all hover:from-meadow-400 hover:to-emerald-400 hover:scale-[1.02]"
            >
              <UIcon name="i-heroicons-arrow-down-tray" class="h-5 w-5 shrink-0" />
              ดาวน์โหลดกำหนดการฉบับเต็ม (PDF)
            </a>
            <div class="grid grid-cols-2 gap-2 pt-1">
              <NuxtLink
                to="/presenter-guidelines"
                class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
              >
                <UIcon name="i-heroicons-academic-cap" class="h-4 w-4 text-meadow-300" />
                คำแนะนำผู้นำเสนอ
              </NuxtLink>
              <NuxtLink
                to="/important-dates"
                class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
              >
                <UIcon name="i-heroicons-map" class="h-4 w-4 text-sky-300" />
                วันสำคัญ & สถานที่
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ QUICK SEARCH & NAVIGATION BAR ═══════════ -->
    <section class="sticky top-16 z-30 border-b border-stone-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div class="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <!-- Main 3 Tabs -->
          <div class="flex flex-wrap items-center gap-1.5 sm:gap-2" role="tablist">
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'day1'"
              class="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all"
              :class="
                activeTab === 'day1'
                  ? 'bg-meadow-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              "
              @click="activeTab = 'day1'"
            >
              <UIcon name="i-heroicons-calendar" class="h-4 w-4" />
              <span>วันที่ 12 พ.ย. 2569 (วันแรก)</span>
            </button>

            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'day2'"
              class="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all"
              :class="
                activeTab === 'day2'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              "
              @click="activeTab = 'day2'"
            >
              <UIcon name="i-heroicons-calendar" class="h-4 w-4" />
              <span>วันที่ 13 พ.ย. 2569 (วันที่สอง)</span>
            </button>

            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'papers'"
              class="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all"
              :class="
                activeTab === 'papers'
                  ? 'bg-sky-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              "
              @click="activeTab = 'papers'"
            >
              <UIcon name="i-heroicons-document-magnifying-glass" class="h-4 w-4" />
              <span>รายชื่อผลงานทั้งหมด (113 เรื่อง)</span>
            </button>
          </div>

          <!-- Instant Search Input -->
          <div class="relative flex-1 lg:max-w-md">
            <UIcon
              name="i-heroicons-magnifying-glass"
              class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400"
            />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="ค้นหารหัสผลงาน (เช่น ENV-O-01), ชื่อเรื่อง, ชื่อผู้นำเสนอ..."
              class="w-full rounded-xl border border-stone-300 bg-stone-50 pl-10 pr-9 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-meadow-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-meadow-500/20"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
              aria-label="ล้างคำค้นหา"
              @click="searchQuery = ''"
            >
              <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <!-- ═══════════ INSTANT SEARCH RESULTS OVERLAY PANEL ═══════════ -->
      <section
        v-if="normalizedQuery"
        class="mb-10 rounded-3xl border-2 border-meadow-300 bg-white p-6 shadow-xl"
      >
        <div class="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-magnifying-glass-circle" class="h-6 w-6 text-meadow-600" />
            <h2 class="text-lg font-bold text-stone-900">
              ผลการค้นหาสำหรับ “{{ searchQuery }}”
            </h2>
            <span class="rounded-full bg-meadow-100 px-3 py-0.5 text-xs font-bold text-meadow-800">
              พบ {{ searchResults.length }} ผลงาน
            </span>
          </div>
          <button
            type="button"
            class="text-xs font-semibold text-stone-500 hover:text-stone-800 underline"
            @click="searchQuery = ''"
          >
            ปิดผลการค้นหา
          </button>
        </div>

        <div v-if="searchResults.length === 0" class="py-10 text-center text-stone-500">
          ไม่พบผลงานที่ตรงกับคำค้นหา “{{ searchQuery }}” กรุณาตรวจสอบรหัสผลงานหรือตัวสะกดอีกครั้ง
        </div>

        <div v-else class="grid gap-4 md:grid-cols-2">
          <div
            v-for="item in searchResults"
            :key="item.code"
            class="flex flex-col justify-between rounded-2xl border border-stone-200 bg-stone-50/70 p-4 transition-all hover:border-meadow-400 hover:bg-white hover:shadow-md"
          >
            <div>
              <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-2">
                  <span class="rounded-lg bg-meadow-700 px-2.5 py-1 text-xs font-bold text-white">
                    {{ item.code }}
                  </span>
                  <span
                    class="rounded-full px-2.5 py-0.5 text-xs font-bold border"
                    :class="
                      item.type === 'oral'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-purple-50 text-purple-800 border-purple-200'
                    "
                  >
                    {{ item.type === 'oral' ? 'Oral Presentation' : 'Poster Presentation' }}
                  </span>
                  <span class="text-xs font-semibold text-stone-500">
                    Session {{ item.sessionNumber }} ({{ item.sessionCode }})
                  </span>
                </div>
              </div>

              <h3 class="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                {{ item.title }}
              </h3>
              <p class="mt-1.5 text-xs sm:text-sm font-semibold text-meadow-800">
                👤 ผู้นำเสนอ: {{ item.author }}
              </p>
            </div>

            <div class="mt-3 border-t border-stone-200/80 pt-2.5 text-xs text-stone-600 space-y-1">
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span class="font-semibold text-stone-800">📅 {{ item.dateLabel }}</span>
                <span class="font-semibold text-amber-800">⏰ {{ item.timeSlot }}</span>
              </div>
              <div class="font-medium text-sky-900">📍 {{ item.roomLabel }}</div>
              <div v-if="item.chairOrEvaluators.length" class="text-[11px] text-stone-500">
                {{ item.chairOrEvaluators.join(" · ") }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════ TAB 1: DAY 1 (12 NOV 2569) ═══════════ -->
      <section v-if="activeTab === 'day1'" class="space-y-8">
        <div class="rounded-3xl border border-meadow-200 bg-white shadow-sm overflow-hidden">
          <div class="bg-gradient-to-r from-meadow-800 via-meadow-700 to-teal-800 px-6 py-5 text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <div class="text-xs font-bold uppercase tracking-wider text-meadow-200">Day 1 Schedule</div>
              <h2 class="text-xl sm:text-2xl font-bold">วันพฤหัสบดีที่ 12 พฤศจิกายน 2569</h2>
            </div>
            <span class="rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold text-white">
              08:30 – 20:00 น. · ณ อาคาร 99 อุทยานเทคโนโลยี มจพ.
            </span>
          </div>

          <div class="divide-y divide-stone-200">
            <div
              v-for="(item, idx) in day1Schedule"
              :key="`d1-${idx}`"
              class="p-5 sm:p-6 transition-colors"
              :class="item.type === 'break' ? 'bg-stone-50/70' : 'bg-white'"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
                <!-- Time & Badge -->
                <div class="sm:w-48 shrink-0 flex sm:flex-col items-center sm:items-start justify-between gap-2">
                  <div class="text-sm sm:text-base font-bold text-stone-900 whitespace-nowrap">
                    {{ item.time }} น.
                  </div>
                  <span
                    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    :class="getScheduleTypeBadge(item.type).class"
                  >
                    {{ getScheduleTypeBadge(item.type).label }}
                  </span>
                </div>

                <!-- Detail Content -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                    {{ item.title }}
                  </h3>
                  <p v-if="item.speaker" class="mt-1 text-sm font-medium text-stone-700">
                    {{ item.speaker }}
                  </p>

                  <!-- Panelists / Bullets -->
                  <ul v-if="item.bullets?.length" class="mt-3 space-y-2 rounded-2xl bg-stone-50 border border-stone-200/80 p-4 text-sm">
                    <li
                      v-for="bullet in item.bullets"
                      :key="bullet.title"
                      class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3"
                    >
                      <span class="font-bold text-stone-900">• {{ bullet.title }}</span>
                      <span v-if="bullet.affiliation" class="text-xs sm:text-sm text-stone-600">
                        ({{ bullet.affiliation }})
                      </span>
                    </li>
                  </ul>

                  <p v-if="item.moderator" class="mt-2.5 text-sm font-semibold text-meadow-800">
                    {{ item.moderator }}
                  </p>

                  <!-- Embedded Oral Session Block (Oral 1 or Oral 2) -->
                  <div
                    v-if="item.oralBlockKey && oralSessionBlocks[item.oralBlockKey]"
                    class="mt-5 rounded-2xl border border-meadow-200 bg-meadow-50/30 p-4 sm:p-5"
                  >
                    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div class="text-xs sm:text-sm font-bold text-meadow-900">
                        เลือกดูห้องนำเสนอ (คลิกเลือกห้องเพื่อกรอง หรือดูตารางรวมทุกห้อง):
                      </div>
                      <div class="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          class="rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                          :class="
                            oralRoomFilters[item.oralBlockKey] === 'ALL'
                              ? 'bg-meadow-700 text-white shadow-sm'
                              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                          "
                          @click="oralRoomFilters[item.oralBlockKey] = 'ALL'"
                        >
                          แสดงทุกห้อง ({{ oralSessionBlocks[item.oralBlockKey].rooms.length }})
                        </button>
                        <button
                          v-for="room in oralSessionBlocks[item.oralBlockKey].rooms"
                          :key="room.id"
                          type="button"
                          class="rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                          :class="
                            oralRoomFilters[item.oralBlockKey] === room.id
                              ? 'bg-meadow-700 text-white shadow-sm'
                              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                          "
                          @click="oralRoomFilters[item.oralBlockKey] = room.id"
                        >
                          {{ room.sessionCode === 'SPECIAL' ? 'ประชุมร่วม สอสท.-วศ.' : `${room.sessionCode} (${room.roomName.replace('ห้องประชุม ', '')})` }}
                        </button>
                      </div>
                    </div>

                    <!-- Responsive Multi-Room Table -->
                    <div class="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
                      <table class="min-w-full divide-y divide-stone-200 text-left text-xs sm:text-sm">
                        <thead>
                          <tr class="bg-meadow-900 text-white divide-x divide-meadow-800">
                            <th class="w-28 px-3 py-3 font-bold whitespace-nowrap">Session / เวลา</th>
                            <th
                              v-for="room in getFilteredRooms(oralSessionBlocks[item.oralBlockKey])"
                              :key="`th-${room.id}`"
                              class="min-w-[230px] px-3.5 py-3 align-top"
                            >
                              <div class="inline-block rounded bg-white/15 px-2 py-0.5 text-[11px] font-bold text-meadow-200 mb-1">
                                {{ room.sessionCode }}
                              </div>
                              <div class="font-bold leading-snug text-white">{{ room.sessionTitle }}</div>
                              <div v-if="room.sessionSubtitle" class="text-[11px] font-normal text-meadow-200 mt-0.5">
                                ({{ room.sessionSubtitle }})
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-stone-200">
                          <!-- Room Row -->
                          <tr class="bg-stone-50 divide-x divide-stone-200">
                            <td class="px-3 py-2.5 font-bold text-stone-700">Room</td>
                            <td
                              v-for="room in getFilteredRooms(oralSessionBlocks[item.oralBlockKey])"
                              :key="`rm-${room.id}`"
                              class="px-3.5 py-2.5 font-semibold text-sky-900"
                            >
                              <div>{{ room.roomFloor }}</div>
                              <div>{{ room.roomName }}</div>
                            </td>
                          </tr>
                          <!-- Chair Row -->
                          <tr class="bg-white divide-x divide-stone-200">
                            <td class="px-3 py-2.5 font-bold text-stone-700">Chair</td>
                            <td
                              v-for="room in getFilteredRooms(oralSessionBlocks[item.oralBlockKey])"
                              :key="`ch-${room.id}`"
                              class="px-3.5 py-2.5"
                            >
                              <template v-if="room.chair">
                                <div class="font-bold text-stone-900">{{ room.chair.name }}</div>
                                <div class="text-xs text-stone-500">({{ room.chair.affiliation }})</div>
                              </template>
                              <template v-else-if="room.isSpecialMeeting">
                                <div class="text-xs font-semibold text-amber-800">{{ room.specialMeetingNote }}</div>
                              </template>
                            </td>
                          </tr>
                          <!-- Co-chair Row -->
                          <tr class="bg-stone-50/60 divide-x divide-stone-200">
                            <td class="px-3 py-2.5 font-bold text-stone-700">Co-chair</td>
                            <td
                              v-for="room in getFilteredRooms(oralSessionBlocks[item.oralBlockKey])"
                              :key="`co-${room.id}`"
                              class="px-3.5 py-2.5"
                            >
                              <template v-if="room.coChair">
                                <div class="font-bold text-stone-900">{{ room.coChair.name }}</div>
                                <div class="text-xs text-stone-500">({{ room.coChair.affiliation }})</div>
                              </template>
                              <template v-else-if="room.isSpecialMeeting">
                                <span class="text-xs text-stone-400">—</span>
                              </template>
                            </td>
                          </tr>
                          <!-- Time Slot Rows -->
                          <tr
                            v-for="slot in oralSessionBlocks[item.oralBlockKey].timeSlots"
                            :key="`slot-${item.oralBlockKey}-${slot}`"
                            class="divide-x divide-stone-200 hover:bg-meadow-50/30"
                          >
                            <td class="px-3 py-3 font-bold text-stone-800 whitespace-nowrap align-top">
                              {{ slot }}
                            </td>
                            <td
                              v-for="room in getFilteredRooms(oralSessionBlocks[item.oralBlockKey])"
                              :key="`cell-${room.id}-${slot}`"
                              class="px-3.5 py-3 align-top"
                            >
                              <template v-if="room.isSpecialMeeting">
                                <span class="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900 border border-amber-200">
                                  การประชุมร่วมกันระหว่าง สอสท. และ กรมวิทยาศาสตร์บริการ
                                </span>
                              </template>
                              <template v-else-if="room.slots[slot] && room.slots[slot] !== '-'">
                                <div class="space-y-1">
                                  <span class="inline-block rounded bg-meadow-100 px-2 py-0.5 text-xs font-bold text-meadow-900 border border-meadow-300">
                                    {{ room.slots[slot] }}
                                  </span>
                                  <template v-if="getPaperByCode(room.slots[slot])">
                                    <div class="text-xs font-semibold text-stone-900 leading-snug">
                                      {{ getPaperByCode(room.slots[slot])?.title }}
                                    </div>
                                    <div class="text-[11px] font-medium text-meadow-800">
                                      👤 {{ getPaperByCode(room.slots[slot])?.author }}
                                    </div>
                                  </template>
                                </div>
                              </template>
                              <template v-else>
                                <span class="text-stone-400">—</span>
                              </template>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Embedded Poster Presentation Block (16:30 - 18:00) -->
                  <div
                    v-if="item.isPosterBlock"
                    class="mt-5 rounded-2xl border border-purple-200 bg-purple-50/30 p-4 sm:p-5"
                  >
                    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div class="text-xs sm:text-sm font-bold text-purple-950">
                        ตารางกลุ่มประเมินผลงานแบบ Poster (39 ผลงาน) พร้อมรายชื่อผู้ทรงคุณวุฒิประเมิน:
                      </div>
                      <div class="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          class="rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                          :class="
                            posterGroupFilter === 'ALL'
                              ? 'bg-purple-700 text-white shadow-sm'
                              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                          "
                          @click="posterGroupFilter = 'ALL'"
                        >
                          ทุกกลุ่มประเมิน (7)
                        </button>
                        <button
                          v-for="(col, cIdx) in posterSessionBlock.columns"
                          :key="col.id"
                          type="button"
                          class="rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                          :class="
                            posterGroupFilter === col.id
                              ? 'bg-purple-700 text-white shadow-sm'
                              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                          "
                          @click="posterGroupFilter = col.id"
                        >
                          กลุ่ม {{ cIdx + 1 }}: {{ col.sessionCode }}
                        </button>
                      </div>
                    </div>

                    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <div
                        v-for="(col, cIdx) in filteredPosterColumns"
                        :key="col.id"
                        class="flex flex-col rounded-2xl border border-purple-200 bg-white shadow-sm overflow-hidden"
                      >
                        <div class="bg-purple-900 px-4 py-3 text-white">
                          <div class="text-[11px] font-bold uppercase tracking-wider text-purple-200">
                            กลุ่มประเมินที่ {{ cIdx + 1 }} · {{ col.sessionCode }}
                          </div>
                          <div class="font-bold text-sm leading-snug mt-0.5">
                            {{ col.sessionTitle }}
                          </div>
                        </div>

                        <!-- Evaluators -->
                        <div class="border-b border-stone-200 bg-purple-50/50 px-4 py-3 text-xs space-y-1.5">
                          <div class="font-bold text-purple-900">คณะผู้ประเมิน (Evaluators):</div>
                          <div v-for="ev in col.evaluators" :key="ev.name" class="text-stone-800">
                            <span class="font-semibold">• {{ ev.name }}</span>
                            <span class="text-stone-500"> ({{ ev.affiliation }})</span>
                          </div>
                        </div>

                        <!-- Poster Papers in this Column -->
                        <div class="divide-y divide-stone-100 p-3 flex-1">
                          <div
                            v-for="pCode in col.paperCodes"
                            :key="pCode"
                            class="py-2.5 first:pt-0 last:pb-0"
                          >
                            <div class="flex items-start gap-2">
                              <span class="shrink-0 rounded bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-900 border border-purple-300">
                                {{ pCode }}
                              </span>
                              <div v-if="getPaperByCode(pCode)" class="min-w-0">
                                <div class="text-xs font-semibold text-stone-900 leading-snug">
                                  {{ getPaperByCode(pCode)?.title }}
                                </div>
                                <div class="text-[11px] font-medium text-purple-800 mt-0.5">
                                  👤 {{ getPaperByCode(pCode)?.author }}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════ TAB 2: DAY 2 (13 NOV 2569) ═══════════ -->
      <section v-else-if="activeTab === 'day2'" class="space-y-8">
        <div class="rounded-3xl border border-amber-200 bg-white shadow-sm overflow-hidden">
          <div class="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 px-6 py-5 text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <div class="text-xs font-bold uppercase tracking-wider text-amber-100">Day 2 Schedule</div>
              <h2 class="text-xl sm:text-2xl font-bold">วันศุกร์ที่ 13 พฤศจิกายน 2569</h2>
            </div>
            <span class="rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold text-white">
              08:30 – 16:00 น. · ณ อาคาร 99 อุทยานเทคโนโลยี มจพ.
            </span>
          </div>

          <div class="divide-y divide-stone-200">
            <div
              v-for="(item, idx) in day2Schedule"
              :key="`d2-${idx}`"
              class="p-5 sm:p-6 transition-colors"
              :class="item.type === 'break' ? 'bg-stone-50/70' : 'bg-white'"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
                <div class="sm:w-48 shrink-0 flex sm:flex-col items-center sm:items-start justify-between gap-2">
                  <div class="text-sm sm:text-base font-bold text-stone-900 whitespace-nowrap">
                    {{ item.time }} น.
                  </div>
                  <span
                    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    :class="getScheduleTypeBadge(item.type).class"
                  >
                    {{ getScheduleTypeBadge(item.type).label }}
                  </span>
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                    {{ item.title }}
                  </h3>
                  <p v-if="item.speaker" class="mt-1 text-sm font-medium text-stone-700">
                    {{ item.speaker }}
                  </p>

                  <ul v-if="item.bullets?.length" class="mt-3 space-y-2 rounded-2xl bg-amber-50/60 border border-amber-200/80 p-4 text-sm">
                    <li
                      v-for="bullet in item.bullets"
                      :key="bullet.title"
                      class="font-semibold text-stone-800"
                    >
                      • {{ bullet.title }}
                    </li>
                  </ul>

                  <div v-if="item.link" class="mt-3">
                    <NuxtLink
                      :to="item.link"
                      class="inline-flex items-center gap-1.5 rounded-xl bg-meadow-50 px-4 py-2 text-xs sm:text-sm font-bold text-meadow-800 border border-meadow-300 hover:bg-meadow-100 transition-colors shadow-sm"
                    >
                      <UIcon name="i-heroicons-sparkles" class="h-4 w-4 text-meadow-600" />
                      {{ item.linkText || 'ดูรายละเอียด' }}
                    </NuxtLink>
                  </div>

                  <!-- Embedded Oral Session Block (Oral 3) -->
                  <div
                    v-if="item.oralBlockKey && oralSessionBlocks[item.oralBlockKey]"
                    class="mt-5 rounded-2xl border border-amber-200 bg-amber-50/30 p-4 sm:p-5"
                  >
                    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div class="text-xs sm:text-sm font-bold text-amber-950">
                        เลือกดูห้องนำเสนอ ช่วงที่ 3 (10:15 – 12:00 น.):
                      </div>
                      <div class="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          class="rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                          :class="
                            oralRoomFilters[item.oralBlockKey] === 'ALL'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                          "
                          @click="oralRoomFilters[item.oralBlockKey] = 'ALL'"
                        >
                          แสดงทุกห้อง ({{ oralSessionBlocks[item.oralBlockKey].rooms.length }})
                        </button>
                        <button
                          v-for="room in oralSessionBlocks[item.oralBlockKey].rooms"
                          :key="room.id"
                          type="button"
                          class="rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                          :class="
                            oralRoomFilters[item.oralBlockKey] === room.id
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                          "
                          @click="oralRoomFilters[item.oralBlockKey] = room.id"
                        >
                          {{ room.sessionCode }} ({{ room.roomName.replace('ห้องประชุม ', '') }})
                        </button>
                      </div>
                    </div>

                    <div class="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
                      <table class="min-w-full divide-y divide-stone-200 text-left text-xs sm:text-sm">
                        <thead>
                          <tr class="bg-amber-900 text-white divide-x divide-amber-800">
                            <th class="w-28 px-3 py-3 font-bold whitespace-nowrap">Session / เวลา</th>
                            <th
                              v-for="room in getFilteredRooms(oralSessionBlocks[item.oralBlockKey])"
                              :key="`th3-${room.id}`"
                              class="min-w-[240px] px-3.5 py-3 align-top"
                            >
                              <div class="inline-block rounded bg-white/15 px-2 py-0.5 text-[11px] font-bold text-amber-200 mb-1">
                                {{ room.sessionCode }}
                              </div>
                              <div class="font-bold leading-snug text-white">{{ room.sessionTitle }}</div>
                            </th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-stone-200">
                          <tr class="bg-stone-50 divide-x divide-stone-200">
                            <td class="px-3 py-2.5 font-bold text-stone-700">Room</td>
                            <td
                              v-for="room in getFilteredRooms(oralSessionBlocks[item.oralBlockKey])"
                              :key="`rm3-${room.id}`"
                              class="px-3.5 py-2.5 font-semibold text-sky-900"
                            >
                              <div>{{ room.roomFloor }}</div>
                              <div>{{ room.roomName }}</div>
                            </td>
                          </tr>
                          <tr class="bg-white divide-x divide-stone-200">
                            <td class="px-3 py-2.5 font-bold text-stone-700">Chair</td>
                            <td
                              v-for="room in getFilteredRooms(oralSessionBlocks[item.oralBlockKey])"
                              :key="`ch3-${room.id}`"
                              class="px-3.5 py-2.5"
                            >
                              <div v-if="room.chair" class="font-bold text-stone-900">{{ room.chair.name }}</div>
                              <div v-if="room.chair" class="text-xs text-stone-500">({{ room.chair.affiliation }})</div>
                            </td>
                          </tr>
                          <tr class="bg-stone-50/60 divide-x divide-stone-200">
                            <td class="px-3 py-2.5 font-bold text-stone-700">Co-chair</td>
                            <td
                              v-for="room in getFilteredRooms(oralSessionBlocks[item.oralBlockKey])"
                              :key="`co3-${room.id}`"
                              class="px-3.5 py-2.5"
                            >
                              <div v-if="room.coChair" class="font-bold text-stone-900">{{ room.coChair.name }}</div>
                              <div v-if="room.coChair" class="text-xs text-stone-500">({{ room.coChair.affiliation }})</div>
                            </td>
                          </tr>
                          <tr
                            v-for="slot in oralSessionBlocks[item.oralBlockKey].timeSlots"
                            :key="`slot3-${slot}`"
                            class="divide-x divide-stone-200 hover:bg-amber-50/30"
                          >
                            <td class="px-3 py-3 font-bold text-stone-800 whitespace-nowrap align-top">
                              {{ slot }}
                            </td>
                            <td
                              v-for="room in getFilteredRooms(oralSessionBlocks[item.oralBlockKey])"
                              :key="`cell3-${room.id}-${slot}`"
                              class="px-3.5 py-3 align-top"
                            >
                              <template v-if="room.slots[slot] && room.slots[slot] !== '-'">
                                <div class="space-y-1">
                                  <span class="inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900 border border-amber-300">
                                    {{ room.slots[slot] }}
                                  </span>
                                  <template v-if="getPaperByCode(room.slots[slot])">
                                    <div class="text-xs font-semibold text-stone-900 leading-snug">
                                      {{ getPaperByCode(room.slots[slot])?.title }}
                                    </div>
                                    <div class="text-[11px] font-medium text-amber-900">
                                      👤 {{ getPaperByCode(room.slots[slot])?.author }}
                                    </div>
                                  </template>
                                </div>
                              </template>
                              <template v-else>
                                <span class="text-stone-400">—</span>
                              </template>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════ TAB 3: ALL 113 PAPERS BY SESSION (PAGES 7–18) ═══════════ -->
      <section v-else-if="activeTab === 'papers'" class="space-y-8">
        <!-- Filters Card -->
        <div class="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-lg sm:text-xl font-bold text-stone-900">
                บัญชีรายชื่อผลงานวิจัยที่นำเสนอในงานประชุม (113 ผลงาน)
              </h2>
              <p class="text-xs sm:text-sm text-stone-500">
                แบ่งตาม 7 กลุ่มหัวข้อ (Session 1 – Session 7) ทั้งประเภทบรรยาย (Oral 74 ผลงาน) และโปสเตอร์ (Poster 39 ผลงาน)
              </p>
            </div>

            <!-- Type Filter -->
            <div class="inline-flex rounded-xl bg-stone-100 p-1 self-start">
              <button
                type="button"
                class="rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                :class="selectedTypeFilter === 'all' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'"
                @click="selectedTypeFilter = 'all'"
              >
                ทั้งหมด (113)
              </button>
              <button
                type="button"
                class="rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                :class="selectedTypeFilter === 'oral' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'"
                @click="selectedTypeFilter = 'oral'"
              >
                Oral (74)
              </button>
              <button
                type="button"
                class="rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                :class="selectedTypeFilter === 'poster' ? 'bg-purple-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'"
                @click="selectedTypeFilter = 'poster'"
              >
                Poster (39)
              </button>
            </div>
          </div>

          <!-- Session Track Pills -->
          <div class="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              class="rounded-xl px-3.5 py-2 text-xs font-bold transition-all"
              :class="
                selectedSessionFilter === 'ALL'
                  ? 'bg-sky-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              "
              @click="selectedSessionFilter = 'ALL'"
            >
              ทุกกลุ่มหัวข้อ (7 Sessions)
            </button>
            <button
              v-for="track in sessionTracks"
              :key="track.code"
              type="button"
              class="rounded-xl px-3.5 py-2 text-xs font-bold transition-all"
              :class="
                selectedSessionFilter === track.code
                  ? 'bg-sky-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              "
              @click="selectedSessionFilter = track.code"
            >
              Session {{ track.sessionNumber }}: {{ track.code }} ({{ track.oralPapers.length + track.posterPapers.length }})
            </button>
          </div>
        </div>

        <!-- Session Cards -->
        <div
          v-for="track in filteredSessionTracks"
          :key="track.code"
          class="rounded-3xl border border-stone-200 bg-white shadow-sm overflow-hidden"
        >
          <div :class="['bg-gradient-to-r px-6 py-5 text-white', track.colorClass]">
            <div class="text-xs font-bold uppercase tracking-wider text-white/80">
              Session {{ track.sessionNumber }} · {{ track.code }}
            </div>
            <h3 class="text-xl sm:text-2xl font-bold mt-0.5">
              {{ track.nameTh }}
            </h3>
            <p class="text-xs sm:text-sm text-white/90 mt-0.5">
              ({{ track.nameEn }})
            </p>
          </div>

          <!-- Oral Papers Table -->
          <div v-if="track.filteredOral.length" class="p-5 sm:p-6">
            <div class="mb-3 flex items-center justify-between">
              <span class="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1 text-xs sm:text-sm font-bold text-emerald-900 border border-emerald-200">
                <UIcon name="i-heroicons-microphone" class="h-4 w-4 text-emerald-600" />
                ORAL PRESENTATION ({{ track.filteredOral.length }} ผลงาน)
              </span>
            </div>

            <div class="overflow-x-auto rounded-2xl border border-stone-200">
              <table class="min-w-full divide-y divide-stone-200 text-left text-xs sm:text-sm">
                <thead class="bg-stone-100 text-stone-700">
                  <tr>
                    <th class="w-14 px-4 py-3 font-bold text-center">ลำดับ</th>
                    <th class="w-32 px-4 py-3 font-bold whitespace-nowrap">รหัสผลงาน</th>
                    <th class="px-4 py-3 font-bold">ชื่อเรื่อง</th>
                    <th class="w-52 px-4 py-3 font-bold">ผู้ส่งผลงาน</th>
                    <th class="w-64 px-4 py-3 font-bold">วัน-เวลา และห้องนำเสนอ</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-stone-200 bg-white">
                  <tr
                    v-for="paper in track.filteredOral"
                    :key="paper.code"
                    class="hover:bg-stone-50/80 align-top"
                  >
                    <td class="px-4 py-3 text-center font-semibold text-stone-500">{{ paper.order }}</td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span class="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-900 border border-emerald-300">
                        {{ paper.code }}
                      </span>
                    </td>
                    <td class="px-4 py-3 font-semibold text-stone-900 leading-relaxed">
                      {{ paper.title }}
                    </td>
                    <td class="px-4 py-3 font-medium text-stone-800">
                      {{ paper.author }}
                    </td>
                    <td class="px-4 py-3 text-xs text-stone-600">
                      <template v-if="getPaperByCode(paper.code)">
                        <div class="font-bold text-stone-800">
                          {{ getPaperByCode(paper.code)?.dateLabel }} · {{ getPaperByCode(paper.code)?.timeSlot }}
                        </div>
                        <div class="text-sky-800 font-medium mt-0.5">
                          {{ getPaperByCode(paper.code)?.roomLabel }}
                        </div>
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Poster Papers Table -->
          <div
            v-if="track.filteredPoster.length"
            class="p-5 sm:p-6"
            :class="track.filteredOral.length ? 'border-t border-stone-200 bg-stone-50/40' : ''"
          >
            <div class="mb-3 flex items-center justify-between">
              <span class="inline-flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-1 text-xs sm:text-sm font-bold text-purple-900 border border-purple-200">
                <UIcon name="i-heroicons-photo" class="h-4 w-4 text-purple-600" />
                POSTER PRESENTATION ({{ track.filteredPoster.length }} ผลงาน)
              </span>
            </div>

            <div class="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
              <table class="min-w-full divide-y divide-stone-200 text-left text-xs sm:text-sm">
                <thead class="bg-stone-100 text-stone-700">
                  <tr>
                    <th class="w-14 px-4 py-3 font-bold text-center">ลำดับ</th>
                    <th class="w-32 px-4 py-3 font-bold whitespace-nowrap">รหัสผลงาน</th>
                    <th class="px-4 py-3 font-bold">ชื่อเรื่อง</th>
                    <th class="w-52 px-4 py-3 font-bold">ผู้ส่งผลงาน</th>
                    <th class="w-64 px-4 py-3 font-bold">เวลาและผู้ประเมิน</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-stone-200">
                  <tr
                    v-for="paper in track.filteredPoster"
                    :key="paper.code"
                    class="hover:bg-stone-50/80 align-top"
                  >
                    <td class="px-4 py-3 text-center font-semibold text-stone-500">{{ paper.order }}</td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span class="rounded-md bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-900 border border-purple-300">
                        {{ paper.code }}
                      </span>
                    </td>
                    <td class="px-4 py-3 font-semibold text-stone-900 leading-relaxed">
                      {{ paper.title }}
                    </td>
                    <td class="px-4 py-3 font-medium text-stone-800">
                      {{ paper.author }}
                    </td>
                    <td class="px-4 py-3 text-xs text-stone-600">
                      <template v-if="getPaperByCode(paper.code)">
                        <div class="font-bold text-stone-800">
                          {{ getPaperByCode(paper.code)?.dateLabel }} · {{ getPaperByCode(paper.code)?.timeSlot }}
                        </div>
                        <div class="text-purple-800 mt-0.5">
                          {{ getPaperByCode(paper.code)?.chairOrEvaluators.join(" / ") }}
                        </div>
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom Note & Download Callout -->
      <div class="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-meadow-200 bg-white p-5 shadow-sm">
        <p class="text-xs sm:text-sm text-stone-600">
          <span class="font-bold text-stone-900 underline">หมายเหตุ:</span> กำหนดการอาจเปลี่ยนแปลงได้ตามความเหมาะสม ผู้นำเสนอสามารถดาวน์โหลดเอกสารกำหนดการฉบับเต็มเก็บไว้ตรวจสอบได้
        </p>
        <a
          :href="programPdfUrl"
          download="TSHE-CON-2026-Program.pdf"
          class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-meadow-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-meadow-800 transition-colors"
        >
          <UIcon name="i-heroicons-arrow-down-tray" class="h-4 w-4" />
          ดาวน์โหลดกำหนดการ (PDF)
        </a>
      </div>
    </div>
  </main>
</template>
