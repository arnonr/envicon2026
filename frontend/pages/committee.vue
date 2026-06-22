<script setup lang="ts">
interface Member {
  prefix: string;
  firstName: string;
  lastName: string;
  affiliation: string;
}

interface CommitteeGroup {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  bg: string;
  accent: string;
  members: Member[];
}

const committees: CommitteeGroup[] = [
  {
    id: "advisory",
    title: "คณะกรรมการอำนวยการ",
    titleEn: "Advisory Committee",
    icon: "i-heroicons-user-group",
    bg: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=80&auto=format&fit=crop",
    accent: "from-meadow-400 via-emerald-400 to-teal-400",
    members: [
      { prefix: "รองศาสตราจารย์ ดร.", firstName: "รัฐชา", lastName: "ชัยชนะ", affiliation: "มหาวิทยาลัยเกษตรศาสตร์" },
      { prefix: "ศาสตราจารย์ ดร.", firstName: "วรณพ", lastName: "วิยกาญจน์", affiliation: "จุฬาลงกรณ์มหาวิทยาลัย" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "พีรพงษ์", lastName: "พรวงศ์ทอง", affiliation: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ" },
    ],
  },
  {
    id: "academic",
    title: "คณะกรรมการฝ่ายวิชาการ",
    titleEn: "Academic Committee",
    icon: "i-heroicons-academic-cap",
    bg: "https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=80&auto=format&fit=crop",
    accent: "from-sky-400 via-cyan-400 to-blue-400",
    members: [
      { prefix: "รองศาสตราจารย์ ดร.", firstName: "อุมา", lastName: "ลางคุลเสน", affiliation: "มหาวิทยาลัยธรรมศาสตร์" },
      { prefix: "รองศาสตราจารย์ ดร.", firstName: "สุเมธ", lastName: "วงศ์เขียว", affiliation: "จุฬาลงกรณ์มหาวิทยาลัย" },
      { prefix: "รองศาสตราจารย์ ดร.", firstName: "ชุลีมาศ", lastName: "บุญไทย อิวาย", affiliation: "มหาวิทยาลัยขอนแก่น" },
      { prefix: "รองศาสตราจารย์ พ.อ.ดร.", firstName: "กิตติภพ", lastName: "พรหมดี", affiliation: "โรงเรียนนายร้อยพระจุลจอมเกล้า" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "พรรณวดี", lastName: "สุวัฒิกะ", affiliation: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "อรประภา", lastName: "ภุมมะกาญจนะ โรแบร์", affiliation: "มหาวิทยาลัยศิลปากร" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "สตรีไทย", lastName: "พุ่มไม้", affiliation: "มหาวิทยาลัยเกษตรศาสตร์" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "ชิดหทัย", lastName: "เพชรช่วย", affiliation: "มหาวิทยาลัยอุบลราชธานี" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "รัชวุฒิ", lastName: "โคตรลาคำ", affiliation: "มหาวิทยาลัยอุบลราชธานี" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "มนพร", lastName: "วงศ์สุนทรชัย", affiliation: "มหาวิทยาลัยธรรมศาสตร์" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "ปฏิพัทธ์", lastName: "วงค์เรือง", affiliation: "มหาวิทยาลัยพะเยา" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "ปิยะวดี", lastName: "ศรีวิชัย", affiliation: "มหาวิทยาลัยพะเยา" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "บงกช", lastName: "วิชาชูเชิด", affiliation: "มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตกำแพงแสน" },
      { prefix: "ดร.", firstName: "นฤพร", lastName: "เพ็ชร์กลาง", affiliation: "มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตกำแพงแสน" },
      { prefix: "ดร.", firstName: "พรเทพ", lastName: "พรรณรักษ์", affiliation: "จุฬาลงกรณ์มหาวิทยาลัย" },
      { prefix: "ดร.", firstName: "ยศวดี", lastName: "ฮะวังจู", affiliation: "จุฬาลงกรณ์มหาวิทยาลัย" },
      { prefix: "ดร.", firstName: "ชิษณุพงษ์", lastName: "ชาติอาษา", affiliation: "จุฬาลงกรณ์มหาวิทยาลัย" },
    ],
  },
  {
    id: "registration",
    title: "ฝ่ายลงทะเบียน",
    titleEn: "Registration Committee",
    icon: "i-heroicons-clipboard-document-list",
    bg: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600&q=80&auto=format&fit=crop",
    accent: "from-amber-400 via-orange-400 to-rose-400",
    members: [
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "สตรีไทย", lastName: "พุ่มไม้", affiliation: "มหาวิทยาลัยเกษตรศาสตร์" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "ชิดหทัย", lastName: "เพชรช่วย", affiliation: "มหาวิทยาลัยอุบลราชธานี" },
      { prefix: "นางสาว", firstName: "ปุณยานุช", lastName: "แดงจะนะ", affiliation: "มหาวิทยาลัยเกษตรศาสตร์" },
      { prefix: "นางสาว", firstName: "ณัฐนริน", lastName: "ทองดี", affiliation: "มหาวิทยาลัยเกษตรศาสตร์" },
      { prefix: "นางสาว", firstName: "อมรรัตน์", lastName: "รักงาม", affiliation: "มหาวิทยาลัยเกษตรศาสตร์" },
    ],
  },
  {
    id: "venue",
    title: "ฝ่ายสถานที่ พิธีการ และการศึกษาดูงาน",
    titleEn: "Venue, Ceremony & Study Visit Committee",
    icon: "i-heroicons-map-pin",
    bg: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1600&q=80&auto=format&fit=crop",
    accent: "from-violet-400 via-purple-400 to-fuchsia-400",
    members: [
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "พีรพงษ์", lastName: "พรวงศ์ทอง", affiliation: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "พรรณวดี", lastName: "สุวัฒิกะ", affiliation: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ" },
      { prefix: "รองศาสตราจารย์ ดร.", firstName: "สุเมธ", lastName: "วงศ์เขียว", affiliation: "จุฬาลงกรณ์มหาวิทยาลัย" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "ชิดหทัย", lastName: "เพชรช่วย", affiliation: "มหาวิทยาลัยอุบลราชธานี" },
      { prefix: "ผู้ช่วยศาสตราจารย์ ดร.", firstName: "อรประภา", lastName: "ภุมมะกาญจนะ โรแบร์", affiliation: "มหาวิทยาลัยศิลปากร" },
    ],
  },
  {
    id: "sponsorship",
    title: "ฝ่ายระดมทุนและสปอนเซอร์",
    titleEn: "Fundraising & Sponsorship Committee",
    icon: "i-heroicons-currency-dollar",
    bg: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1600&q=80&auto=format&fit=crop",
    accent: "from-pink-400 via-rose-400 to-red-400",
    members: [
      { prefix: "รองศาสตราจารย์ พ.อ.ดร.", firstName: "กิตติภพ", lastName: "พรหมดี", affiliation: "โรงเรียนนายร้อยพระจุลจอมเกล้า" },
    ],
  },
];

const totalMembers = committees.reduce((sum, g) => sum + g.members.length, 0);

const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function pad(n: number, width = 2): string {
  return String(n).padStart(width, "0");
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-stone-50 via-white to-meadow-50/40 text-stone-900">
    <!-- ===== Hero with photo background ===== -->
    <section class="relative overflow-hidden bg-meadow-950">
      <div class="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=2400&q=80&auto=format&fit=crop"
          alt="Committee gathering"
          class="w-full h-full object-cover committee-hero-photo"
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-meadow-950/70 via-meadow-900/55 to-meadow-950/85" />
      <div class="absolute inset-0 bg-gradient-to-tr from-meadow-900/45 via-transparent to-sky-900/30" />

      <!-- Decorative floating orbs -->
      <div class="absolute top-20 right-20 w-72 h-72 rounded-full bg-meadow-400/20 blur-3xl"></div>
      <div class="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-sky-400/15 blur-3xl"></div>

      <div class="relative max-w-7xl mx-auto px-6 lg:px-12 pt-16 lg:pt-24 pb-14 lg:pb-20">
        <!-- Top meta row -->
        <div class="flex items-center gap-4 mb-8 lg:mb-12">
          <span class="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
            ENVICON · MMXXVI
          </span>
          <div class="flex-1 h-px bg-white/30"></div>
          <span class="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
            Vol. 03 / Issue 2026
          </span>
        </div>

        <!-- Display title -->
        <h1 class="font-semibold text-white leading-[0.95] tracking-tight text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] drop-shadow-2xl">
          คณะกรรมการ
        </h1>
        <div class="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <span class="text-sm font-medium uppercase tracking-[0.3em] text-meadow-200">
            Organizing Committee Directory
          </span>
          <span class="hidden sm:inline-block w-10 h-px bg-white/40"></span>
          <span class="text-sm font-medium uppercase tracking-[0.3em] text-meadow-200">
            {{ totalMembers }} members · {{ committees.length }} committees
          </span>
        </div>

        <!-- Decorative photo chips row -->
        <div class="mt-12 lg:mt-16 grid grid-cols-2 sm:grid-cols-5 gap-3 lg:gap-4">
          <div
            v-for="(g, i) in committees"
            :key="g.id"
            class="committee-chip group relative h-28 lg:h-32 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/20 hover:ring-white/60 transition-all duration-500 hover:scale-[1.04] hover:-translate-y-1 cursor-default"
          >
            <img :src="g.bg" :alt="g.titleEn" class="absolute inset-0 w-full h-full object-cover committee-chip-img" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-meadow-950/90 via-meadow-900/40 to-transparent" />
            <div :class="['absolute top-0 left-0 right-0 h-1 bg-gradient-to-r', g.accent]" />
            <div class="relative h-full p-3 lg:p-4 flex flex-col justify-between text-white">
              <div class="flex items-center justify-between">
                <div class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 backdrop-blur-md border border-white/20 shadow-md">
                  <UIcon :name="g.icon" class="w-4 h-4" />
                </div>
                <span class="text-[11px] font-bold tracking-[0.2em] text-white/90 uppercase">
                  {{ pad(i + 1) }}
                </span>
              </div>
              <div>
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-meadow-200 mb-0.5">
                  {{ g.titleEn.split(" ")[0] }}
                </div>
                <div class="text-base font-bold leading-tight tabular-nums">
                  {{ g.members.length }}
                  <span class="text-[10px] font-medium text-white/70 tracking-[0.15em] uppercase ml-1">
                    {{ g.members.length === 1 ? "member" : "members" }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Wave divider -->
      <svg class="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 60" preserveAspectRatio="none" style="height: 60px">
        <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#fafaf9" />
      </svg>
    </section>

    <!-- ===== Main: sidebar nav + sections ===== -->
    <div class="max-w-7xl mx-auto px-6 lg:px-12 py-14 lg:py-20">
      <div class="lg:grid lg:grid-cols-[220px_1fr] lg:gap-x-16 xl:gap-x-20">
        <!-- Sticky sidebar nav -->
        <aside class="hidden lg:block">
          <div class="sticky top-8">
            <div class="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500 mb-4">
              Contents
            </div>
            <nav class="border-t border-stone-300">
              <a
                v-for="(g, i) in committees"
                :key="g.id"
                :href="`#${g.id}`"
                class="group flex items-center gap-3 py-3 border-b border-stone-200 hover:border-meadow-500 transition-colors"
              >
                <span class="text-xs font-semibold text-stone-400 group-hover:text-meadow-600 transition-colors tabular-nums w-7">
                  {{ pad(i + 1) }}
                </span>
                <span class="flex-1 text-sm font-medium text-stone-700 group-hover:text-meadow-700 truncate">
                  {{ g.title }}
                </span>
                <span class="text-xs font-semibold text-stone-400 group-hover:text-meadow-600 tabular-nums">
                  {{ g.members.length }}
                </span>
              </a>
            </nav>

            <div class="mt-6 pt-6 border-t border-stone-300">
              <div class="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500 mb-2">
                Total
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-meadow-700 tabular-nums">{{ totalMembers }}</span>
                <span class="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">members</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Sections -->
        <main class="space-y-16 lg:space-y-20">
          <article
            v-for="(group, gi) in committees"
            :id="group.id"
            :key="group.id"
            class="scroll-mt-12"
          >
            <!-- Section card with photo accent -->
            <div class="relative rounded-3xl overflow-hidden bg-white shadow-md ring-1 ring-stone-200/70 hover:shadow-2xl hover:shadow-meadow-900/10 transition-all duration-500">
              <!-- Top photo banner -->
              <div class="relative h-32 sm:h-40 lg:h-44 overflow-hidden">
                <img :src="group.bg" :alt="group.titleEn" class="w-full h-full object-cover" loading="lazy" />
                <div class="absolute inset-0 bg-gradient-to-r from-meadow-950/85 via-meadow-900/60 to-meadow-900/25" />
                <div :class="['absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r', group.accent]" />

                <!-- Decorative orbs -->
                <div class="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>

                <!-- Icon + numbering -->
                <div class="absolute top-5 right-5 lg:top-6 lg:right-7 flex items-center gap-2">
                  <span class="text-[11px] font-bold uppercase tracking-[0.25em] text-white/85">
                    Section {{ pad(gi + 1) }}
                  </span>
                  <span class="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 shadow-lg">
                    <UIcon :name="group.icon" class="w-5 h-5 text-white" />
                  </span>
                </div>

                <!-- Title overlay -->
                <div class="absolute bottom-4 left-6 lg:left-8 right-6 lg:right-8 text-white">
                  <div class="text-xs font-semibold uppercase tracking-[0.3em] text-meadow-200 mb-1.5">
                    {{ group.titleEn }}
                  </div>
                  <h2 class="font-semibold leading-[1.1] tracking-tight text-2xl sm:text-3xl lg:text-[2.25rem] drop-shadow-lg">
                    {{ group.title }}
                  </h2>
                </div>
              </div>

              <!-- Member count strip -->
              <div class="px-6 lg:px-8 py-4 flex items-center gap-3 bg-gradient-to-r from-meadow-50/80 via-white to-stone-50 border-b border-stone-200/70">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-meadow-600 text-white text-xs font-semibold uppercase tracking-[0.15em] shadow-sm">
                  {{ group.members.length }} {{ group.members.length === 1 ? "Member" : "Members" }}
                </span>
                <span class="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                  Section {{ romanNumerals[gi] }}
                </span>
                <span class="flex-1 h-px bg-stone-200"></span>
                <span class="text-xs font-semibold uppercase tracking-[0.2em] text-meadow-700">
                  {{ romanNumerals[gi] }} / V
                </span>
              </div>

              <!-- Member directory (2 columns) -->
              <div class="px-6 lg:px-8 py-3 grid grid-cols-1 md:grid-cols-2 md:gap-x-8 lg:gap-x-10">
                <div
                  v-for="(m, mi) in group.members"
                  :key="`${group.id}-${mi}`"
                  class="member-row group flex items-baseline gap-4 py-4 border-b border-stone-100 last:border-b-0 hover:bg-meadow-50/40 -mx-2 px-2 rounded-lg transition-colors duration-300 cursor-default"
                  :style="{ '--delay': `${mi * 40}ms` }"
                >
                  <!-- Index number -->
                  <span class="text-xs font-semibold text-stone-300 group-hover:text-meadow-600 transition-colors duration-300 tabular-nums w-7 flex-shrink-0">
                    {{ pad(mi + 1) }}
                  </span>
                  <!-- Name + affiliation -->
                  <div class="flex-1 min-w-0">
                    <h3 class="leading-snug">
                      <span class="block text-xs font-semibold text-meadow-700 uppercase tracking-[0.12em] mb-0.5">
                        {{ m.prefix }}
                      </span>
                      <span class="block font-semibold text-stone-900 text-base lg:text-[17px]">
                        {{ m.firstName }} {{ m.lastName }}
                      </span>
                    </h3>
                    <p class="mt-1 text-xs font-medium text-stone-500 truncate">
                      {{ m.affiliation }}
                    </p>
                  </div>
                  <!-- Hover indicator -->
                  <span class="hidden sm:block w-2 h-2 rounded-full bg-meadow-500 opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-300 flex-shrink-0 self-center"></span>
                </div>
              </div>
            </div>
          </article>
        </main>
      </div>
    </div>

    <!-- Footer note -->
    <footer class="border-t border-stone-300 bg-stone-50">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex flex-wrap items-center justify-between gap-4">
        <span class="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
          End of directory — {{ totalMembers }} entries
        </span>
        <span class="text-xs font-semibold uppercase tracking-[0.25em] text-meadow-700">
          ENVICON 2026 · Kasetsart University
        </span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@keyframes rowFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.member-row {
  animation: rowFadeIn 0.5s ease-out backwards;
  animation-delay: var(--delay);
}

.committee-hero-photo {
  animation: heroKenBurns 22s ease-in-out infinite alternate;
}

@keyframes heroKenBurns {
  from {
    transform: scale(1) translateY(0);
  }
  to {
    transform: scale(1.08) translateY(-1.5%);
  }
}

.committee-chip-img {
  transition: transform 1100ms ease-out;
}

.committee-chip:hover .committee-chip-img {
  transform: scale(1.12);
}
</style>