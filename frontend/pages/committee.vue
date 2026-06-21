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
  members: Member[];
}

const committees: CommitteeGroup[] = [
  {
    id: "advisory",
    title: "คณะกรรมการอำนวยการ",
    titleEn: "Advisory Committee",
    icon: "i-heroicons-user-group",
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
  <div class="min-h-screen bg-stone-50 text-stone-900">
    <!-- ===== Editorial Header ===== -->
    <header class="border-b border-stone-300/80">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 pt-16 lg:pt-24 pb-12 lg:pb-16">
        <!-- Top meta row -->
        <div class="flex items-center gap-4 mb-10 lg:mb-14">
          <span class="font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-stone-500">
            ENVICON · MMXXVI
          </span>
          <div class="flex-1 h-px bg-stone-300"></div>
          <span class="font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-stone-500">
            Vol. 03 / Issue 2026
          </span>
        </div>

        <!-- Display title -->
        <h1 class="font-sarabun font-light text-stone-900 leading-[0.92] tracking-tight text-6xl sm:text-7xl lg:text-[7.5rem]">
          คณะกรรมการ
        </h1>
        <div class="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <span class="font-mono text-xs uppercase tracking-[0.3em] text-stone-500">
            Organizing Committee Directory
          </span>
          <span class="hidden sm:inline-block w-10 h-px bg-stone-400"></span>
          <span class="font-mono text-xs uppercase tracking-[0.3em] text-stone-500">
            {{ totalMembers }} members · {{ committees.length }} committees
          </span>
        </div>

        <!-- Stats grid -->
        <dl class="mt-14 lg:mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-t border-stone-300">
          <div
            v-for="(g, i) in committees"
            :key="g.id"
            class="group relative px-5 py-6 lg:py-8 border-b lg:border-b-0 border-stone-200"
            :class="[
              i < committees.length - 1 ? 'lg:border-r' : '',
              i % 2 === 0 ? 'border-r sm:border-r' : '',
              i < 3 ? 'sm:border-b lg:border-b-0' : '',
            ]"
          >
            <dt class="flex items-baseline gap-2">
              <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-400">
                {{ pad(i + 1) }}
              </span>
              <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-400 truncate">
                — {{ g.titleEn.split(" ")[0] }}
              </span>
            </dt>
            <dd class="mt-3 flex items-baseline gap-2">
              <span class="font-sarabun font-light text-stone-900 leading-none text-5xl lg:text-6xl tabular-nums">
                {{ g.members.length }}
              </span>
              <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500">
                {{ g.members.length === 1 ? "member" : "members" }}
              </span>
            </dd>
            <p class="mt-3 font-sarabun text-sm text-stone-600 leading-snug line-clamp-2">
              {{ g.title }}
            </p>
          </div>
        </dl>
      </div>
    </header>

    <!-- ===== Main: sidebar nav + sections ===== -->
    <div class="max-w-7xl mx-auto px-6 lg:px-12 py-14 lg:py-20">
      <div class="lg:grid lg:grid-cols-[220px_1fr] lg:gap-x-16 xl:gap-x-20">
        <!-- Sticky sidebar nav -->
        <aside class="hidden lg:block">
          <div class="sticky top-8">
            <div class="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-4">
              Contents
            </div>
            <nav class="border-t border-stone-300">
              <a
                v-for="(g, i) in committees"
                :key="g.id"
                :href="`#${g.id}`"
                class="group flex items-baseline gap-3 py-3 border-b border-stone-200 hover:border-stone-900 transition-colors"
              >
                <span class="font-mono text-[10px] text-stone-400 group-hover:text-primary-600 transition-colors tabular-nums w-6">
                  {{ pad(i + 1) }}
                </span>
                <span class="flex-1 font-sarabun text-sm text-stone-700 group-hover:text-stone-900 truncate">
                  {{ g.title }}
                </span>
                <span class="font-mono text-[10px] text-stone-400 group-hover:text-stone-700 tabular-nums">
                  {{ g.members.length }}
                </span>
              </a>
            </nav>

            <div class="mt-6 pt-6 border-t border-stone-300">
              <div class="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">
                Total
              </div>
              <div class="flex items-baseline gap-2">
                <span class="font-sarabun font-light text-3xl text-stone-900 tabular-nums">{{ totalMembers }}</span>
                <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500">members</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Sections -->
        <main class="space-y-20 lg:space-y-28">
          <section
            v-for="(group, gi) in committees"
            :id="group.id"
            :key="group.id"
            class="scroll-mt-12"
          >
            <!-- Section header -->
            <div class="border-t-2 border-stone-900 pt-5 mb-8 lg:mb-10">
              <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-3">
                <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">
                  Section {{ pad(gi + 1) }} · {{ romanNumerals[gi] }}
                </span>
                <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-400">
                  {{ group.titleEn }}
                </span>
              </div>
              <h2 class="font-sarabun font-light text-stone-900 leading-[1.05] tracking-tight text-3xl sm:text-4xl lg:text-5xl">
                {{ group.title }}
              </h2>
              <div class="mt-4 flex items-center gap-3">
                <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-primary-700">
                  {{ group.members.length }} {{ group.members.length === 1 ? "Member" : "Members" }}
                </span>
                <span class="flex-1 h-px bg-stone-200"></span>
              </div>
            </div>

            <!-- Member directory (2 columns) -->
            <div class="grid grid-cols-1 md:grid-cols-2 md:gap-x-10 lg:gap-x-14">
              <div
                v-for="(m, mi) in group.members"
                :key="`${group.id}-${mi}`"
                class="member-row group flex items-baseline gap-4 py-4 lg:py-5 border-b border-stone-200 hover:border-stone-900 transition-colors duration-300 cursor-default"
                :style="{ '--delay': `${mi * 40}ms` }"
              >
                <!-- Index number -->
                <span class="font-mono text-xs text-stone-300 group-hover:text-primary-600 transition-colors duration-300 tabular-nums w-7 flex-shrink-0">
                  {{ pad(mi + 1) }}
                </span>
                <!-- Name + affiliation -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-sarabun leading-snug">
                    <span class="block text-[11px] font-normal text-stone-500 uppercase tracking-[0.15em] mb-0.5">
                      {{ m.prefix }}
                    </span>
                    <span class="block font-medium text-stone-900 text-base lg:text-[17px]">
                      {{ m.firstName }} {{ m.lastName }}
                    </span>
                  </h3>
                  <p class="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500 truncate">
                    {{ m.affiliation }}
                  </p>
                </div>
                <!-- Hover indicator -->
                <span class="hidden sm:block w-1.5 h-1.5 rounded-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0 self-center"></span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>

    <!-- Footer note -->
    <footer class="border-t border-stone-300">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex flex-wrap items-center justify-between gap-4">
        <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">
          End of directory — {{ totalMembers }} entries
        </span>
        <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-400">
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

/* Subtle paper grain texture */
.bg-stone-50 {
  background-color: #faf8f4;
  background-image:
    radial-gradient(at 8% 0%, rgba(120, 113, 108, 0.04) 0px, transparent 50%),
    radial-gradient(at 92% 100%, rgba(120, 113, 108, 0.04) 0px, transparent 50%);
}
</style>