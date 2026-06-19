# Sponsorship Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public `/sponsorship` page listing 4 sponsorship tiers (Bronze / Silver / Gold / Platinum) with perks, plus a Navbar link to reach it.

**Architecture:** Single static page in `frontend/pages/sponsorship.vue` with hardcoded data and 5 sections (hero, stats, why sponsor, tier cards, CTA). One entry added to the existing Navbar `links` array. No backend, no new components, no auth.

**Tech Stack:** Nuxt 3, Vue 3 (`<script setup>`), @nuxt/ui (`UCard`, `UButton`, `UIcon`), Tailwind CSS 3.

**Test approach:** The project has no test framework configured (see `CLAUDE.md` — no `*.test.*` or `*.spec.*` files). The page is pure presentational content with no business logic, so there is nothing to unit-test. Verification is manual via the dev server in Task 3.

---

## File Structure

| File | Status | Responsibility |
|------|--------|----------------|
| `frontend/pages/sponsorship.vue` | Create | All 5 page sections, hardcoded data, color-class mapping |
| `frontend/components/layout/Navbar.vue` | Modify (1 line) | Add `{ label: "สนับสนุน", to: "/sponsorship" }` to `links` array |

No new components. No new API routes. No backend changes.

---

## Task 1: Create the sponsorship page

**Files:**
- Create: `frontend/pages/sponsorship.vue`

- [ ] **Step 1: Create the file with the full content below**

Create `frontend/pages/sponsorship.vue` containing exactly this content:

```vue
<script setup lang="ts">
const tiers = [
  {
    name: "Bronze",
    nameTh: "บรอนซ์",
    price: 10000,
    color: "neutral",
    featured: false,
    perks: [
      "Logo บนเว็บไซต์งาน",
      "ระบุชื่อใน Proceedings",
      "ใบประกาศนียบัตรขอบคุณ",
    ],
  },
  {
    name: "Silver",
    nameTh: "ซิลเวอร์",
    price: 30000,
    color: "primary",
    featured: true,
    perks: [
      "ทุกอย่างใน Bronze",
      "Logo บน Backdrop งาน",
      "Logo ในสื่อประชาสัมพันธ์",
      "ลงทะเบียนฟรี 2 ท่าน",
    ],
  },
  {
    name: "Gold",
    nameTh: "โกลด์",
    price: 60000,
    color: "amber",
    featured: false,
    perks: [
      "ทุกอย่างใน Silver",
      "Booth ขนาด 2×3 ม.",
      "ลงทะเบียนฟรี 4 ท่าน",
      "พาดหัวข่าวบน Social Media",
    ],
  },
  {
    name: "Platinum",
    nameTh: "แพลทินัม",
    price: 100000,
    color: "blue",
    featured: false,
    perks: [
      "ทุกอย่างใน Gold",
      "Booth ใหญ่ 3×4 ม. (มุม)",
      "ลงทะเบียนฟรี 8 ท่าน",
      "กล่าวเปิด 5 นาที",
    ],
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

const priceLabel: Record<string, string> = {
  Bronze: "เริ่มต้น",
  Gold: "คุ้มค่า",
  Platinum: "พรีเมียม",
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
            <div class="text-xs text-gray-500">
              {{ priceLabel[tier.name] || "" }}
            </div>
            <div
              class="text-3xl font-extrabold mt-1"
              :class="colorMap[tier.color].text"
            >
              ฿{{ tier.price.toLocaleString() }}
            </div>
            <ul class="mt-4 space-y-2 text-xs text-gray-700 leading-relaxed">
              <li
                v-for="(perk, j) in tier.perks"
                :key="j"
                class="flex gap-2"
              >
                <span class="text-primary-600 flex-shrink-0">✓</span>
                <span>{{ perk }}</span>
              </li>
            </ul>
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
```

- [ ] **Step 2: Verify the file is created**

Run: `ls -la frontend/pages/sponsorship.vue && wc -l frontend/pages/sponsorship.vue`

Expected: file exists, ~250 lines.

- [ ] **Step 3: Commit**

```bash
git add frontend/pages/sponsorship.vue
git commit -m "feat(frontend): add sponsorship page with 4 tier cards"
```

---

## Task 2: Add Navbar link

**Files:**
- Modify: `frontend/components/layout/Navbar.vue:4-12` (the `links` array in `<script setup>`)

- [ ] **Step 1: Edit the links array**

In `frontend/components/layout/Navbar.vue`, find this block (currently at lines 4-12):

```ts
const links = [
  { label: "หน้าแรก", to: "/" },
  { label: "เกี่ยวกับ", to: "/about" },
  { label: "คณะกรรมการ", to: "/committee" },
  { label: "กำหนดการ", to: "/important-dates" },
  { label: "ลงทะเบียน", to: "/registration" },
  { label: "แนวทาง", to: "/guidelines" },
  { label: "ติดต่อ", to: "/contact" },
];
```

Replace it with:

```ts
const links = [
  { label: "หน้าแรก", to: "/" },
  { label: "เกี่ยวกับ", to: "/about" },
  { label: "คณะกรรมการ", to: "/committee" },
  { label: "กำหนดการ", to: "/important-dates" },
  { label: "ลงทะเบียน", to: "/registration" },
  { label: "สนับสนุน", to: "/sponsorship" },
  { label: "แนวทาง", to: "/guidelines" },
  { label: "ติดต่อ", to: "/contact" },
];
```

The new entry `{ label: "สนับสนุน", to: "/sponsorship" }` is inserted between "ลงทะเบียน" and "แนวทาง" to match the spec'd navbar order.

- [ ] **Step 2: Verify the edit**

Run: `grep -n "สนับสนุน\|/sponsorship" frontend/components/layout/Navbar.vue`

Expected: a single line showing `{ label: "สนับสนุน", to: "/sponsorship" },`.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/layout/Navbar.vue
git commit -m "feat(frontend): add สนับสนุน link to navbar"
```

---

## Task 3: Manual verification in the browser

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server in the background**

Run: `cd frontend && npm run dev`

Expected: server reports it is running on `http://localhost:3000` (Nuxt default). Wait until "ready" or "Local:" appears in the output.

- [ ] **Step 2: Open the page and check each section**

Navigate to `http://localhost:3000/sponsorship` in a browser.

Verify each of the following:

1. **Navbar**: "สนับสนุน" appears between "ลงทะเบียน" and "แนวทาง" in the desktop nav. Mobile menu also has it.
2. **Hero**: dark green gradient background, "SPONSORSHIP OPPORTUNITY" eyebrow visible, large title "ร่วมสนับสนุน ENVICON 2026", date/venue subtitle, two buttons "ดูแพ็กเกจ" (white) and "ติดต่อเรา" (ghost).
3. **Click "ดูแพ็กเกจ"**: page scrolls smoothly to the tier cards section (anchor `#packages`).
4. **Click "ติดต่อเรา"**: navigates to `/contact`.
5. **Stats**: 4 boxes side-by-side on desktop showing 500+ / 200+ / 40+ / 7 with the labels ผู้เข้าร่วมงาน / บทความวิจัย / สถาบันอุดมศึกษา / หัวข้อวิชาการ.
6. **Why Sponsor**: 3 cards with emoji icons (🎯 🤝 🌱) and correct titles/descriptions.
7. **Tier cards**: 4 cards in a single row, in this order: Bronze, Silver, Gold, Platinum.
   - Bronze: plain white card, gray accents, price "฿10,000", 3 perks starting with "Logo บนเว็บไซต์งาน".
   - Silver: green border, green shadow, "⭐ แนะนำ" badge above the card, price "฿30,000", 4 perks starting with "ทุกอย่างใน Bronze".
   - Gold: very subtle amber gradient background, amber accents, price "฿60,000", 4 perks starting with "ทุกอย่างใน Silver".
   - Platinum: very subtle blue gradient background, blue accents, price "฿100,000", 4 perks starting with "ทุกอย่างใน Gold".
8. **CTA**: dark green gradient, title "สนใจเป็นสปอนเซอร์?", subtitle, two pills with email and phone (clicking email opens mail client, clicking phone opens dialer on mobile).
9. **Console**: open DevTools console, verify no errors or warnings.

- [ ] **Step 3: Check responsive layout**

Resize the browser to ~375px wide (mobile).

Verify:
- Hero title still readable (wraps cleanly).
- Stats become 2 columns × 2 rows.
- Why Sponsor cards stack to 1 column.
- Tier cards stack to 1 column (single card per row on small mobile, 2 per row on tablet ~768px).
- CTA pills stack vertically.

Resize to ~768px wide (tablet):
- Tier cards should be 2 per row.

Resize back to desktop (~1280px):
- All 4 tier cards in one row.

- [ ] **Step 4: Stop the dev server**

In the terminal where `npm run dev` is running, press `Ctrl+C`.

- [ ] **Step 5: (Conditional) Fix any issues found**

If anything from Steps 2-3 looks wrong, edit `frontend/pages/sponsorship.vue`, save, and refresh the browser (HMR will reload). Repeat until everything is correct.

Then commit any fixes:

```bash
git add frontend/pages/sponsorship.vue
git commit -m "fix(frontend): address visual issues from sponsorship page review"
```

Skip this step if no fixes were needed.

---

## Done

When all 3 tasks are complete and committed, the feature is shipped. No follow-up work is required.
