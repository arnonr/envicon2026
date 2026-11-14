<script setup lang="ts">
import {
  AWARD_RESULTS_PDF_PATH,
  awardCategories,
  allAwards,
  type AwardCategoryKey,
  type AwardTier,
} from "~/utils/awards-data";
import { BOOK_OF_ABSTRACTS_PDF_PATH } from "~/utils/program-data";

const appBaseUrl = useRuntimeConfig().app.baseURL.replace(/\/$/, "");
const awardPdfUrl = `${appBaseUrl}${AWARD_RESULTS_PDF_PATH}`;
const bookOfAbstractsPdfUrl = `${appBaseUrl}${BOOK_OF_ABSTRACTS_PDF_PATH}`;

const selectedCategory = ref<"ALL" | AwardCategoryKey>("ALL");

const filteredCategories = computed(() => {
  if (selectedCategory.value === "ALL") return awardCategories;
  return awardCategories.filter((cat) => cat.key === selectedCategory.value);
});

function getTierStyles(tier: AwardTier) {
  switch (tier) {
    case "first":
      return {
        card: "border-amber-300 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 shadow-md shadow-amber-900/5",
        badge: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm",
        icon: "i-heroicons-trophy-solid",
        iconWrap: "bg-amber-100 text-amber-700 ring-amber-300",
      };
    case "second":
      return {
        card: "border-sky-200 bg-gradient-to-br from-sky-50/70 via-white to-stone-50/40 shadow-sm",
        badge: "bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-sm",
        icon: "i-heroicons-star-solid",
        iconWrap: "bg-sky-100 text-sky-700 ring-sky-200",
      };
    case "third":
      return {
        card: "border-orange-200 bg-gradient-to-br from-orange-50/70 via-white to-stone-50/40 shadow-sm",
        badge: "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm",
        icon: "i-heroicons-star-solid",
        iconWrap: "bg-orange-100 text-orange-700 ring-orange-200",
      };
    default:
      return {
        card: "border-meadow-200 bg-white shadow-sm",
        badge: "bg-meadow-700 text-white",
        icon: "i-heroicons-sparkles-solid",
        iconWrap: "bg-meadow-100 text-meadow-700 ring-meadow-200",
      };
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
      <div class="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
      <div class="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-meadow-500/20 blur-3xl" />

      <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div class="max-w-3xl">
            <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-200">
              <UIcon name="i-heroicons-trophy" class="h-4 w-4 text-amber-300" />
              OFFICIAL AWARD RESULTS · TSHE-CON 2026
            </div>
            <h1 class="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              ประกาศผลรางวัลการนำเสนอผลงานวิชาการ
            </h1>
            <p class="mt-3 text-base sm:text-lg font-medium text-meadow-100">
              การประชุมวิชาการระดับชาติ สมาคมสถาบันอุดมศึกษาสิ่งแวดล้อมไทย ครั้งที่ 5
            </p>
            <p class="mt-1 text-sm sm:text-base text-meadow-200/85">
              ระหว่างวันที่ 12 – 13 พฤศจิกายน พ.ศ. 2569 ณ อาคาร 99 อุทยานเทคโนโลยี มจพ.
            </p>
            <div class="mt-5 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-meadow-100/90">
              <span class="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-1.5 font-semibold">
                <UIcon name="i-heroicons-academic-cap" class="h-4 w-4 text-amber-300" />
                Oral ปริญญาตรี 5 รางวัล
              </span>
              <span class="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-1.5 font-semibold">
                <UIcon name="i-heroicons-academic-cap" class="h-4 w-4 text-sky-300" />
                Oral บัณฑิตศึกษา 2 รางวัล
              </span>
              <span class="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-1.5 font-semibold">
                <UIcon name="i-heroicons-photo" class="h-4 w-4 text-purple-300" />
                Poster Presentation 3 รางวัล
              </span>
            </div>
          </div>

          <!-- Download & Quick Links Card -->
          <div class="flex flex-col gap-2.5 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md sm:min-w-[340px]">
            <div class="text-xs font-semibold uppercase tracking-wider text-amber-200">
              เอกสารประกาศผลอย่างเป็นทางการ (PDF)
            </div>
            <a
              :href="awardPdfUrl"
              download="TSHE-CON-2026-Award-Results.pdf"
              class="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 px-5 py-3.5 text-sm sm:text-base font-bold text-meadow-950 shadow-lg shadow-amber-950/30 transition-all hover:from-amber-300 hover:to-yellow-300 hover:scale-[1.02]"
            >
              <UIcon name="i-heroicons-arrow-down-tray" class="h-5 w-5 shrink-0" />
              ดาวน์โหลดประกาศผลรางวัล (PDF · 4 หน้า)
            </a>
            <a
              :href="bookOfAbstractsPdfUrl"
              download="TSHE-CON-2026-Book-of-Abstracts.pdf"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-300/40 bg-sky-500/20 px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition-all hover:bg-sky-500/30"
            >
              <UIcon name="i-heroicons-book-open" class="h-4 w-4 shrink-0 text-sky-200" />
              เล่มรวมบทคัดย่อฉบับเต็ม (158 หน้า)
            </a>
            <div class="grid grid-cols-2 gap-2 pt-1">
              <NuxtLink
                to="/program"
                class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
              >
                <UIcon name="i-heroicons-calendar-days" class="h-4 w-4 text-meadow-300" />
                ตารางการนำเสนอ
              </NuxtLink>
              <NuxtLink
                to="/guidelines"
                class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
              >
                <UIcon name="i-heroicons-folder-arrow-down" class="h-4 w-4 text-amber-300" />
                เอกสารดาวน์โหลด
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ FILTER TABS BAR ═══════════ -->
    <section class="sticky top-16 z-30 border-b border-stone-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div class="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-1.5 sm:gap-2" role="tablist">
            <button
              type="button"
              role="tab"
              :aria-selected="selectedCategory === 'ALL'"
              class="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all"
              :class="
                selectedCategory === 'ALL'
                  ? 'bg-meadow-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              "
              @click="selectedCategory = 'ALL'"
            >
              <UIcon name="i-heroicons-trophy" class="h-4 w-4" />
              <span>ทั้งหมด ({{ allAwards.length }} รางวัล)</span>
            </button>

            <button
              v-for="cat in awardCategories"
              :key="cat.key"
              type="button"
              role="tab"
              :aria-selected="selectedCategory === cat.key"
              class="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all"
              :class="
                selectedCategory === cat.key
                  ? 'bg-meadow-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              "
              @click="selectedCategory = cat.key"
            >
              <span>{{ cat.shortTitle }} ({{ cat.awards.length }})</span>
            </button>
          </div>

          <a
            :href="awardPdfUrl"
            download="TSHE-CON-2026-Award-Results.pdf"
            class="inline-flex items-center gap-1.5 rounded-xl border border-meadow-200 bg-meadow-50 px-3.5 py-2 text-xs font-bold text-meadow-800 hover:bg-meadow-100 transition-colors"
          >
            <UIcon name="i-heroicons-arrow-down-tray" class="h-4 w-4 text-meadow-700" />
            ดาวน์โหลดประกาศ PDF
          </a>
        </div>
      </div>
    </section>

    <!-- ═══════════ AWARD CATEGORIES CONTENT ═══════════ -->
    <div class="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 space-y-10">
      <section
        v-for="category in filteredCategories"
        :key="category.key"
        class="rounded-3xl border border-stone-200 bg-white shadow-sm overflow-hidden"
      >
        <div
          class="bg-gradient-to-r px-6 py-5 text-white flex flex-wrap items-center justify-between gap-4"
          :class="category.headerClass"
        >
          <div>
            <div class="text-xs font-bold uppercase tracking-wider text-white/80">
              {{ category.subtitle }}
            </div>
            <h2 class="text-xl sm:text-2xl font-bold mt-0.5">
              {{ category.title }}
            </h2>
          </div>
          <span class="rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold text-white">
            รวม {{ category.awards.length }} รางวัล
          </span>
        </div>

        <div class="p-5 sm:p-7 space-y-4">
          <article
            v-for="award in category.awards"
            :key="award.code"
            class="rounded-2xl border-2 p-5 sm:p-6 transition-all"
            :class="getTierStyles(award.tier).card"
          >
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1"
                :class="getTierStyles(award.tier).iconWrap"
              >
                <UIcon :name="getTierStyles(award.tier).icon" class="h-6 w-6" />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-2.5">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs sm:text-sm font-bold"
                    :class="getTierStyles(award.tier).badge"
                  >
                    {{ award.rankLabel }}
                  </span>
                  <span class="inline-flex items-center rounded-lg bg-stone-900 px-3 py-1 text-xs sm:text-sm font-bold text-white">
                    รหัสผลงาน : {{ award.code }}
                  </span>
                </div>

                <h3 class="text-base sm:text-lg font-bold text-stone-900 leading-relaxed">
                  {{ award.title }}
                </h3>

                <div class="mt-3 space-y-1.5 border-t border-stone-200/80 pt-3 text-xs sm:text-sm">
                  <div class="text-stone-800 leading-relaxed">
                    <span class="font-bold text-meadow-900">ผู้แต่ง :</span>
                    {{ award.authors }}
                  </div>
                  <div class="text-stone-700 leading-relaxed">
                    <span class="font-bold text-sky-900">สังกัด :</span>
                    {{ award.affiliation }}
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>
