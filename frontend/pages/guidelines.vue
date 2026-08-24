<script setup lang="ts">
const appBaseUrl = useRuntimeConfig().app.baseURL.replace(/\/$/, "");

const documents = [
  {
    number: "01",
    title: "แบบฟอร์มบทคัดย่อ",
    titleEn: "Abstract Template",
    type: "Microsoft Word · .DOCX",
    icon: "i-heroicons-document-text",
    accent: "from-emerald-400 to-lime-300",
    downloadUrl: `${appBaseUrl}/downloads/abstract-template.docx`,
  },
  {
    number: "02",
    title: "แบบฟอร์มบทคัดย่อ",
    titleEn: "Abstract Template",
    type: "Adobe PDF · .PDF",
    icon: "i-heroicons-document-duplicate",
    accent: "from-sky-400 to-cyan-300",
    downloadUrl: `${appBaseUrl}/downloads/abstract-template.pdf`,
  },
  {
    number: "03",
    title: "แบบฟอร์มบทความฉบับสมบูรณ์",
    titleEn: "Full Paper Template",
    type: "Microsoft Word · .DOCX",
    icon: "i-heroicons-document-text",
    accent: "from-orange-400 to-amber-300",
    downloadUrl: `${appBaseUrl}/downloads/Full%20paper_Template.docx`,
  },
];
</script>

<template>
  <main class="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-stone-50">
    <div class="pointer-events-none absolute -left-40 top-24 h-96 w-96 rounded-full bg-meadow-200/40 blur-3xl" />
    <div class="pointer-events-none absolute -right-32 bottom-20 h-[28rem] w-[28rem] rounded-full bg-sky-100/70 blur-3xl" />

    <section class="relative overflow-hidden bg-meadow-950 text-white">
      <div class="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div class="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-meadow-300/20" />
      <div class="absolute -right-4 -top-12 h-48 w-48 rounded-full border border-meadow-300/20" />

      <div class="relative mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-24">
        <div class="max-w-3xl">
          <div class="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-meadow-200">
            <span class="h-px w-10 bg-meadow-300" />
            ENVICON 2026
          </div>
          <h1 class="font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
            เอกสารดาวน์โหลด
          </h1>
          <p class="mt-5 max-w-xl text-sm leading-relaxed text-meadow-100/80 sm:text-base">
            เอกสารสำคัญสำหรับการจัดทำบทความและส่งผลงานเข้าร่วมการประชุมวิชาการ
          </p>
        </div>

        <div class="mt-10 flex items-center gap-3 text-xs text-meadow-100/70">
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
            <UIcon name="i-heroicons-arrow-down-tray" class="h-4 w-4" />
          </span>
          <span>เลือกเอกสารที่ต้องการดาวน์โหลด</span>
        </div>
      </div>
    </section>

    <section class="relative mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-20">
      <div class="grid gap-6 lg:grid-cols-2">
        <article
          v-for="document in documents"
          :key="document.number"
          class="group relative overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-xl shadow-meadow-950/[0.06] transition-all duration-500 hover:-translate-y-2 hover:border-meadow-300 hover:shadow-2xl hover:shadow-meadow-900/10"
        >
          <div :class="['h-1.5 bg-gradient-to-r', document.accent]" />
          <div class="relative p-7 sm:p-9">
            <div class="absolute right-6 top-3 select-none font-display text-8xl font-bold leading-none text-stone-100 transition-colors duration-500 group-hover:text-meadow-50 sm:right-8">
              {{ document.number }}
            </div>

            <div class="relative flex items-start justify-between gap-5">
              <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-meadow-50 text-meadow-700 ring-1 ring-meadow-100 transition-transform duration-500 group-hover:scale-110 group-hover:bg-meadow-100">
                <UIcon :name="document.icon" class="h-8 w-8" />
              </div>
              <span class="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                {{ document.type }}
              </span>
            </div>

            <div class="relative mt-12">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-meadow-600">
                Document {{ document.number }}
              </p>
              <h2 class="mt-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                {{ document.title }}
              </h2>
              <p class="mt-1 text-sm font-medium text-stone-400">
                {{ document.titleEn }}
              </p>
            </div>

            <div class="relative mt-8 flex items-center justify-between border-t border-stone-100 pt-5">
              <span class="inline-flex items-center gap-2 text-xs font-medium text-stone-400">
                <span class="h-2 w-2 rounded-full bg-emerald-400" />
                พร้อมดาวน์โหลด
              </span>
              <a
                :href="document.downloadUrl"
                :download="document.downloadUrl.split('/').pop()"
                :aria-label="`ดาวน์โหลด ${document.title} รูปแบบ ${document.type}`"
                class="inline-flex min-h-11 items-center gap-2 rounded-xl bg-meadow-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-meadow-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow-500 focus-visible:ring-offset-2"
              >
                ดาวน์โหลด
                <UIcon name="i-heroicons-arrow-down-tray" class="h-4 w-4" />
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
