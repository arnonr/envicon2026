# Sponsorship Page — Design Spec

Date: 2026-06-19

## Goal

Add a public `/sponsorship` page describing 4 sponsorship tiers (Bronze / Silver / Gold / Platinum) and the perks each tier receives. Page is a brochure — no form, no submission, no auth. Goal is to give prospective sponsors enough information to choose a tier and contact the committee.

All content is **draft** and hardcoded in the page component. Editing text later is a code change to that file, not a CMS update.

## Scope

1. New page at `/sponsorship` rendered from `frontend/pages/sponsorship.vue`
2. New Navbar link "สนับสนุน" → `/sponsorship`, placed between "ลงทะเบียน" and "แนวทาง"
3. Hardcoded data (4 tiers, perks, stats, why-sponsor reasons, contact info) in `<script setup>`
4. No backend changes, no new components, no new routes

**Not in scope**: contact form, sponsor application backend, sponsor logo management, payment integration.

## Page Structure

5 sections, top to bottom, single page scroll:

1. **Hero** — full-width gradient banner, page title, conference date/venue, 2 CTA buttons
2. **Stats** — 4 stat boxes in a row
3. **Why Sponsor** — 3 reason cards
4. **4 Tier Cards** — side-by-side row of 4 pricing cards
5. **CTA** — full-width gradient banner with email + phone

## Section 1: Hero

Full-width banner with `linear-gradient(135deg, primary-800 → primary-700 → teal-700)` background, white text, centered. Contents:

- Eyebrow label: `SPONSORSHIP OPPORTUNITY` (uppercase, letter-spacing 3px, small, opacity 0.7)
- Title: `ร่วมสนับสนุน ENVICON 2026` (text-4xl/5xl, font-extrabold)
- Subtitle: `งานประชุมวิชาการระดับชาติด้านสิ่งแวดล้อม ครั้งที่ 5` + newline + `12–13 พฤศจิกายน 2569 • มจพ.` (text-base, opacity 0.85)
- 2 buttons side by side: `ดูแพ็กเกจ` (solid white → scroll to tier section via anchor) and `ติดต่อเรา` (ghost, links to /contact)

Padding `py-24 px-8`.

## Section 2: Stats

White background, 4 stat boxes in a single row (`grid-cols-2 md:grid-cols-4`).

| Value | Label |
|-------|-------|
| 500+  | ผู้เข้าร่วมงาน |
| 200+  | บทความวิจัย |
| 40+   | สถาบันอุดมศึกษา |
| 7     | หัวข้อวิชาการ |

Each stat: large number (`text-4xl font-extrabold text-primary-700`) on top, small gray label below (`text-sm text-gray-500`). Centered.

Padding `py-16 px-8`. Max-width container `max-w-5xl mx-auto`.

## Section 3: Why Sponsor

`bg-gray-50` background, padding `py-20 px-8`. Centered header: `WHY SPONSOR` eyebrow + `ทำไมต้องร่วมสนับสนุน` title. Then 3 cards in `grid-cols-1 md:grid-cols-3 gap-6`:

| Icon (emoji) | Title | Description |
|--------------|-------|-------------|
| 🎯 | เข้าถึงกลุ่มเป้าหมาย | นักวิจัย อาจารย์ นิสิตนักศึกษา และผู้เชี่ยวชาญด้านสิ่งแวดล้อมจากทั่วประเทศ |
| 🤝 | สร้างเครือข่าย | Networking กับสถาบันชั้นนำและองค์กรด้านสิ่งแวดล้อม |
| 🌱 | แสดงความรับผิดชอบ | ตอกย้ำภาพลักษณ์องค์กรที่ใส่ใจสิ่งแวดล้อมและความยั่งยืน |

Card structure: white background, `border border-gray-200 rounded-xl p-6`. Icon in a `w-11 h-11 rounded-lg bg-primary-50` box at the top. Title `text-base font-semibold mt-3`. Description `text-sm text-gray-600 leading-relaxed`.

## Section 4: 4 Tier Cards

White background, padding `py-20 px-8`. Centered header: `PACKAGES` eyebrow + `แพ็กเกจสปอนเซอร์` title + subtitle `4 ระดับ ตามเป้าหมายและงบประมาณของคุณ`.

### Layout

`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`. All 4 cards same width.

### Tier Data

```ts
const tiers = [
  {
    name: "Bronze",
    nameTh: "บรอนซ์",
    price: 10000,
    color: "neutral",         // gray/neutral — no warm accent
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
    color: "primary",         // featured tier — primary green
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
    color: "amber",           // gold
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
    color: "blue",            // platinum — deep blue
    featured: false,
    perks: [
      "ทุกอย่างใน Gold",
      "Booth ใหญ่ 3×4 ม. (มุม)",
      "ลงทะเบียนฟรี 8 ท่าน",
      "กล่าวเปิด 5 นาที",
    ],
  },
];
```

### Card Visual

**Default card** (Bronze, Gold, Platinum):
- Base: `border border-gray-200 rounded-xl p-6 bg-white`
- Bronze: plain white, gray accent (`text-gray-700`, `border-gray-200` divider)
- Gold: `bg-gradient-to-b from-amber-50/40 to-white` subtle, amber accent (`text-amber-700`, `border-amber-100` divider)
- Platinum: `bg-gradient-to-b from-blue-50/40 to-white` subtle, blue accent (`text-blue-900`, `border-blue-100` divider)
- Eyebrow tier name: `text-xs font-bold tracking-widest` in the tier's accent color
- Thai subtitle: `text-sm text-gray-500`
- Divider line: `border-t` in the tier's accent (or `border-gray-200` for Bronze)
- Small label above price: "เริ่มต้น" (Bronze) / "คุ้มค่า" (Gold) / "พรีเมียม" (Platinum)
- Price: `text-3xl font-extrabold` in the tier's accent color, formatted as `฿10,000` via `toLocaleString()`
- Perks list: `text-xs text-gray-700 leading-relaxed` with `✓` prefix

**Featured card** (Silver):
- `border-2 border-primary-700 rounded-xl p-6 bg-white shadow-lg`
- "⭐ แนะนำ" badge: positioned absolute, `top: -12px`, centered, `bg-primary-700 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider`
- Uses primary green for all accents (eyebrow, price, divider)
- Slightly visually elevated via shadow (no scale change — alignment must stay in grid)

Each card is wrapped in `<UCard>` from @nuxt/ui for consistent padding/hover. The featured variant uses a wrapper with relative positioning for the badge.

## Section 5: CTA

Full-width `bg-gradient-to-br from-primary-800 to-primary-700` background, white text, centered. Padding `py-20 px-8`.

- Title: `สนใจเป็นสปอนเซอร์?` (text-2xl font-extrabold)
- Subtitle: `ติดต่อคณะกรรมการจัดงานเพื่อหารือรายละเอียดและจองแพ็กเกจ` (text-sm opacity 0.9)
- 2 contact pills side by side: `📧 sponsor@envicon2026.ac.th` (white solid, primary-700 text) and `📞 02-555-2000` (white ghost, border-white/30)

`02-555-2000` and `sponsor@envicon2026.ac.th` are placeholder values matching the pattern in `/contact`.

## Navbar Update

`frontend/components/layout/Navbar.vue` — add `{ label: "สนับสนุน", to: "/sponsorship" }` to the `links` array. Position: after "ลงทะเบียน" and before "แนวทาง" (so the order is: หน้าแรก, เกี่ยวกับ, คณะกรรมการ, กำหนดการ, ลงทะเบียน, สนับสนุน, แนวทาง, ติดต่อ).

The same `links` array drives the mobile menu, so no separate change needed there.

## Responsive Behavior

- Hero: title `text-4xl md:text-5xl`, buttons stack on mobile
- Stats: `grid-cols-2 md:grid-cols-4` (2x2 on mobile, 1x4 on desktop)
- Why Sponsor: `grid-cols-1 md:grid-cols-3`
- Tier Cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` (stack → 2x2 → 1x4)
- CTA: pills stack on mobile, side-by-side on `sm:`

Featured Silver card stays in the 4-wide grid (no scale, no row break) — it must occupy the 2nd position regardless of viewport.

## Files Touched

| File | Change |
|------|--------|
| `frontend/pages/sponsorship.vue` | **New** — entire page (single file) |
| `frontend/components/layout/Navbar.vue` | Add 1 entry to `links` array |

## Out of Scope / Future Work

- Sponsor application form (would need backend endpoint, validation, email notification — see issue tracker)
- Sponsor logo management / gallery
- Per-tier confirmation page with PDF download
- Multi-language (EN) version
