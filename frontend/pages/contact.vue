<script setup lang="ts">
interface ContactMethod {
  id: string;
  label: string;
  labelEn: string;
  value: string;
  href?: string;
  icon: string;
  hint?: string;
}

const contactMethods: ContactMethod[] = [
  {
    id: "email",
    label: "อีเมล",
    labelEn: "Email",
    value: "fiit@technopark.kmutnb.ac.th",
    href: "mailto:fiit@technopark.kmutnb.ac.th",
    icon: "i-heroicons-envelope",
    hint: "ตอบกลับภายใน 1–2 วันทำการ",
  },
  {
    id: "phone",
    label: "โทรศัพท์",
    labelEn: "Phone",
    value: "02-555-2000 ต่อ 1789",
    href: "tel:025552000",
    icon: "i-heroicons-phone",
    hint: "จันทร์–ศุกร์ · 08:00–16:00 น.",
  },
  {
    id: "web",
    label: "เว็บไซต์",
    labelEn: "Website",
    value: "technopark.kmutnb.ac.th/envicon2026",
    href: "https://technopark.kmutnb.ac.th/envicon2026",
    icon: "i-heroicons-globe-alt",
    hint: "ข้อมูลงานประชุมและข่าวสาร",
  },
];

const socialLinks = [
  { name: "Facebook", icon: "i-simple-icons-facebook", href: "#" },
  { name: "YouTube", icon: "i-simple-icons-youtube", href: "#" },
  { name: "Line", icon: "i-simple-icons-line", href: "#" },
];
</script>

<template>
  <div class="overflow-hidden bg-stone-50">
    <!-- ═══════════ HERO ═══════════ -->
    <section class="relative bg-white border-b border-stone-200">
      <div class="max-w-6xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        <div class="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-14 items-center">
          <!-- Text side -->
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-meadow-50 text-meadow-700 text-xs font-semibold uppercase tracking-[0.25em] border border-meadow-200/60">
              <span class="w-1.5 h-1.5 rounded-full bg-meadow-500"></span>
              Get in Touch
            </div>
            <h1 class="mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight text-stone-900">
              ติดต่อ
              <span class="block mt-1 text-stone-500">คณะกรรมการ</span>
            </h1>
            <p class="mt-5 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
              หากมีข้อสงสัยเกี่ยวกับการส่งบทความ การลงทะเบียน หรือการเป็นสปอนเซอร์
              สามารถติดต่อคณะกรรมการจัดงานได้ตามช่องทางด้านล่าง
            </p>

            <!-- Social quick row -->
            <div class="mt-7 flex items-center gap-2">
              <span class="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400 mr-1">
                Follow
              </span>
              <a
                v-for="s in socialLinks"
                :key="s.name"
                :href="s.href"
                :aria-label="s.name"
                class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-stone-100 text-stone-600 hover:bg-meadow-100 hover:text-meadow-700 transition-colors duration-300"
              >
                <UIcon :name="s.icon" class="w-4 h-4" />
              </a>
            </div>
          </div>

          <!-- Photo side -->
          <div class="relative h-64 lg:h-96 rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://www.geodesicdesign.co.th/admin/img_large/2779544.jpg"
              alt="Bangkok cityscape"
              class="absolute inset-0 w-full h-full object-cover contact-hero-img"
              loading="eager"
            />
            <div class="absolute inset-0 bg-gradient-to-tr from-meadow-900/35 via-transparent to-stone-900/20" />
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-meadow-400 via-meadow-500 to-meadow-600" />
            <!-- Address pill overlay -->
            <div class="absolute bottom-4 left-4 right-4">
              <div class="rounded-xl bg-white/90 backdrop-blur-md border border-white/60 p-4 shadow-lg">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-meadow-100 text-meadow-700">
                    <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-[10px] font-semibold uppercase tracking-[0.2em] text-meadow-700 mb-0.5">
                      Location · KMUTNB
                    </div>
                    <p class="text-xs text-stone-700 leading-relaxed">
                      อาคาร 99 อุทยานเทคโนโลยี มจพ. · ถ.ประชาราษฎร์ 1 · บางซื่อ · กรุงเทพฯ 10800
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ CONTACT METHODS ═══════════ -->
    <section class="bg-stone-50">
      <div class="max-w-6xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        <div class="flex items-end justify-between mb-8">
          <div>
            <div class="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400 mb-1">
              Channels · 03
            </div>
            <h2 class="font-semibold text-2xl sm:text-3xl text-stone-900 leading-tight">
              ช่องทางติดต่อ
            </h2>
          </div>
          <span class="hidden sm:inline-block text-xs font-medium text-stone-500 uppercase tracking-[0.15em]">
            ตอบกลับภายใน 1–2 วันทำการ
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <component
            v-for="m in contactMethods"
            :key="m.id"
            :is="m.href ? 'a' : 'div'"
            :href="m.href"
            class="group relative bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg hover:border-meadow-300/60 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
          >
            <!-- Top accent -->
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-meadow-300 via-meadow-500 to-meadow-300 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

            <div class="p-6">
              <!-- Icon + number -->
              <div class="flex items-start justify-between mb-5">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-meadow-50 border border-meadow-200/60 text-meadow-600 group-hover:bg-meadow-100 group-hover:scale-110 transition-all duration-500">
                  <UIcon :name="m.icon" class="w-5 h-5" />
                </div>
                <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-300 group-hover:text-meadow-600 transition-colors tabular-nums">
                  {{ String(contactMethods.indexOf(m) + 1).padStart(2, '0') }}
                </span>
              </div>

              <!-- Label -->
              <div class="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400 mb-1">
                {{ m.labelEn }} · {{ m.label }}
              </div>
              <div class="font-semibold text-base text-stone-900 break-all leading-snug">
                {{ m.value }}
              </div>

              <!-- Hint -->
              <p v-if="m.hint" class="mt-3 text-xs text-stone-500 leading-relaxed">
                {{ m.hint }}
              </p>

              <!-- Action indicator -->
              <div v-if="m.href" class="mt-5 flex items-center gap-1.5 text-xs font-semibold text-meadow-700 group-hover:text-meadow-800 transition-colors">
                <span>เปิดช่องทาง</span>
                <UIcon name="i-heroicons-arrow-up-right" class="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </div>
            </div>
          </component>
        </div>
      </div>
    </section>

    <!-- ═══════════ ADDRESS / MAP ═══════════ -->
    <section class="bg-white border-t border-stone-200">
      <div class="max-w-6xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
          <!-- Address text -->
          <div class="bg-stone-50 rounded-2xl border border-stone-200 p-6 sm:p-8">
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white text-stone-600 text-[10px] font-semibold uppercase tracking-[0.2em] border border-stone-200 mb-5">
              <UIcon name="i-heroicons-map-pin" class="w-3 h-3" />
              Headquarter
            </div>
            <h3 class="font-semibold text-xl sm:text-2xl text-stone-900 leading-tight mb-3">
              อุทยานเทคโนโลยี มจพ.
            </h3>
            <p class="text-sm text-stone-600 leading-relaxed">
              อาคาร 99 อุทยานเทคโนโลยี<br />
              มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ<br />
              1518 ถนนประชาราษฎร์ 1 แขวงวงศ์สว่าง<br />
              เขตบางซื่อ กรุงเทพฯ 10800
            </p>

            <div class="mt-6 grid grid-cols-2 gap-3">
              <div class="rounded-xl bg-white border border-stone-200 p-3">
                <div class="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400 mb-1">
                  BTS · MRT
                </div>
                <div class="text-sm font-semibold text-stone-900">
 MRT บางซื่อ
                </div>
              </div>
              <div class="rounded-xl bg-white border border-stone-200 p-3">
                <div class="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400 mb-1">
                  Hours
                </div>
                <div class="text-sm font-semibold text-stone-900">
                  Mon–Fri · 08:00–16:00
                </div>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=อาคาร+99+อุทยานเทคโนโลยี+มจพ"
              target="_blank"
              rel="noopener"
              class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-meadow-600 text-white text-sm font-semibold hover:bg-meadow-700 transition-colors shadow-sm"
            >
              <UIcon name="i-heroicons-map" class="w-4 h-4" />
              เปิด Google Maps
              <UIcon name="i-heroicons-arrow-up-right" class="w-3.5 h-3.5" />
            </a>
          </div>

          <!-- Photo map -->
          <div class="relative h-80 lg:h-auto min-h-[400px] rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
            <img
              src="https://www.geodesicdesign.co.th/admin/img_large/6761665.jpg"
              alt="KMUTNB Technopark"
              class="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-meadow-950/80 via-meadow-900/40 to-transparent" />
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-meadow-400 via-meadow-500 to-meadow-600" />

            <!-- Pin overlay -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
              <div class="relative">
                <div class="w-12 h-12 rounded-full bg-meadow-500 border-4 border-white shadow-xl flex items-center justify-center text-white animate-bounce">
                  <UIcon name="i-heroicons-map-pin" class="w-5 h-5" />
                </div>
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-7 w-3 h-3 bg-meadow-500 rotate-45 border-r border-b border-white/40"></div>
              </div>
            </div>

            <!-- Bottom info -->
            <div class="absolute bottom-0 left-0 right-0 p-5 text-white">
              <div class="text-[10px] font-semibold uppercase tracking-[0.25em] text-meadow-200 mb-1">
                ENVICON 2026 · Venue
              </div>
              <div class="font-semibold text-lg leading-tight">
                มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.contact-hero-img {
  transition: transform 1200ms ease-out;
}

.group:hover .contact-hero-img {
  transform: scale(1.05);
}
</style>