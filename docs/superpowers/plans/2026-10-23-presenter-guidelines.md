# Presenter Guidelines Page & Navbar Grouping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public `/presenter-guidelines` page (Thai & English toggle, Oral & Poster cards) and place "คำแนะนำสำหรับผู้นำเสนอ" on the top-level navbar while grouping secondary event pages under a "เกี่ยวกับงาน" dropdown.

**Architecture:** A new standalone page `frontend/pages/presenter-guidelines.vue` holds static bilingual content (`th` / `en`) and renders a hero header with a language switch, two comparison cards (Oral & Poster) with visual duration and evaluation criteria bars, and a closing callout. `frontend/components/layout/Navbar.vue` is updated to support a dropdown group (`เกี่ยวกับงาน ▾`) for `/about`, `/committee`, and `/sponsorship` while adding `/presenter-guidelines` ("คำแนะนำสำหรับผู้นำเสนอ") at the top level. `frontend/components/layout/Footer.vue` gets a quick link to `/presenter-guidelines`.

**Tech Stack:** Nuxt 3, Vue 3 (`<script setup lang="ts">`), `@nuxt/ui` (`UIcon`, `UButton`), Tailwind CSS (`meadow`, `primary`, `sky`, `stone` palettes).

**Spec:** `docs/superpowers/specs/2026-10-23-presenter-guidelines-design.md`

## Global Constraints

- Do not modify or replace `/guidelines` (`frontend/pages/guidelines.vue`), which serves the "ดาวน์โหลด" page.
- Top-level desktop navbar must display the exact label `"คำแนะนำสำหรับผู้นำเสนอ"` without wrapping onto two lines at desktop widths (`md`/`lg`+).
- Preserve all Thai and English copy, durations (Oral: 10+5=15 min, Poster: 8+7=15 min), and award evaluation percentages (Oral: 30/20/10/30/10%, Poster: 30/20/20/15/15%) verbatim from the spec.
- Per `CLAUDE.md`, no automated test framework is configured; verification uses Nuxt build/typecheck and runtime inspection.

## Review Focus

1. **Dropdown navigation state persistence:** Clicking a link inside the `เกี่ยวกับงาน ▾` dropdown must close the dropdown menu on route change (`watch(() => route.fullPath)` or `@click` handler).
2. **Active parent highlight on dropdown:** Visiting `/about`, `/committee`, or `/sponsorship` should visually mark the `เกี่ยวกับงาน ▾` trigger as active (`text-meadow-600 font-semibold`).
3. **Click-outside dismissal:** Opening `เกี่ยวกับงาน ▾` and clicking elsewhere on the page or pressing `Escape` should close the dropdown.
4. **Desktop horizontal overflow at `md`–`lg` widths:** Navbar links must have `whitespace-nowrap` so `"คำแนะนำสำหรับผู้นำเสนอ"` never breaks mid-word.
5. **Bilingual completeness:** Switching `lang` between `'th'` and `'en'` must update the hero title/subtitle, Oral & Poster headers, duration labels, 5 evaluation criteria items, 5 presenter guidelines items, and closing note.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `frontend/pages/presenter-guidelines.vue` | Create | Bilingual (TH/EN) Presenter Guidelines page with Oral & Poster cards |
| `frontend/components/layout/Navbar.vue` | Modify | Group `/about`, `/committee`, `/sponsorship` into `เกี่ยวกับงาน ▾` dropdown and add `คำแนะนำสำหรับผู้นำเสนอ` (`/presenter-guidelines`) |
| `frontend/components/layout/Footer.vue` | Modify | Add `คำแนะนำสำหรับผู้นำเสนอ` (`/presenter-guidelines`) to Quick Links |

---

### Task 1: Create `/presenter-guidelines` page (`frontend/pages/presenter-guidelines.vue`)

**Files:**
- Create: `frontend/pages/presenter-guidelines.vue`

**Interfaces:**
- Consumes: `@nuxt/ui` `UIcon`
- Produces: Route `/presenter-guidelines`

- [ ] **Step 1: Create `frontend/pages/presenter-guidelines.vue` with bilingual data (`th` / `en`) and template**

Define `type Locale = "th" | "en"` and `const lang = ref<Locale>("th")` in `<script setup lang="ts">`, with exact copy from the spec:
- **Thai (`th`)**:
  - Heading: `"คำแนะนำสำหรับผู้เข้าร่วมการนำเสนอผลงานวิจัย"`
  - Intro: `"ขอให้ผู้เข้าร่วมการนำเสนอผลงานวิจัยทุกท่านศึกษารูปแบบการนำเสนอ ระยะเวลา และเกณฑ์การพิจารณารางวัล ดังรายละเอียดต่อไปนี้"`
  - Section 1 (`Oral`): `"1. การนำเสนอผลงานแบบ Oral Presentation"`, duration `นำเสนอผลงานวิจัย 10 นาที` / `ตอบคำถามจากคณะกรรมการ 5 นาที` / `รวมเวลาทั้งสิ้น 15 นาทีต่อผลงาน`, criteria `ระเบียบวิธีวิจัย (ร้อยละ 30)`, `ผลกระทบของงานวิจัยต่อเศรษฐกิจ สังคม สิ่งแวดล้อม และนโยบาย (ร้อยละ 20)`, `คุณภาพของสื่อการนำเสนอ (ร้อยละ 10)`, `การนำเสนอผลงานวิจัย (ร้อยละ 30)`, `การตอบคำถาม (ร้อยละ 10)`, and all 5 Thai bullet guidelines.
  - Section 2 (`Poster`): `"2. การนำเสนอผลงานแบบ Poster Presentation"`, duration `นำเสนอผลงานวิจัย 8 นาที` / `ตอบคำถามจากคณะกรรมการ 7 นาที` / `รวมเวลาทั้งสิ้น 15 นาทีต่อผลงาน`, criteria `ระเบียบวิธีวิจัย (ร้อยละ 30)`, `ผลกระทบของงานวิจัยต่อเศรษฐกิจ สังคม สิ่งแวดล้อม และนโยบาย (ร้อยละ 20)`, `คุณภาพของโปสเตอร์ (ร้อยละ 20)`, `การนำเสนอผลงานวิจัย (ร้อยละ 15)`, `การตอบคำถาม (ร้อยละ 15)`, and all 5 Thai bullet guidelines.
  - Closing: `"ขอให้ผู้เข้าร่วมการนำเสนอทุกท่านเตรียมความพร้อมและดำเนินการนำเสนอภายในเวลาที่กำหนด เพื่อให้การดำเนินงานเป็นไปด้วยความเรียบร้อยและมีประสิทธิภาพ"`
- **English (`en`)**:
  - Heading: `"Guidelines for Research Presenters"`
  - Intro: `"All research presenters are requested to review the presentation formats, time allocations, and award evaluation criteria outlined below."`
  - Section 1 (`Oral`): `"1. Oral Presentation"`, duration `Research presentation: 10 minutes` / `Questions and answers: 5 minutes` / `Total time: 15 minutes per presentation`, criteria `Research methodology (30%)`, `Research impact on the economy, society, the environment, and policy (20%)`, `Quality of presentation materials (10%)`, `Research presentation and delivery (30%)`, `Responses to questions (10%)`, and all 5 English bullet guidelines.
  - Section 2 (`Poster`): `"2. Poster Presentation"`, duration `Research presentation: 8 minutes` / `Questions and answers: 7 minutes` / `Total time: 15 minutes per presentation`, criteria `Research methodology (30%)`, `Research impact on the economy, society, the environment, and policy (20%)`, `Poster quality (20%)`, `Research presentation and delivery (15%)`, `Responses to questions (15%)`, and all 5 English bullet guidelines.
  - Closing: `"All presenters are encouraged to prepare thoroughly and adhere to the allocated presentation times to ensure the smooth and efficient conduct of TSHECON 2026."` + `"Thank you for your cooperation, and we wish all presenters every success."`

Render:
1. Hero section (`bg-meadow-950 text-white` matching `guidelines.vue`) with `TSHECON 2026` badge, title, intro text, and a pill language toggle (`🇹🇭 ภาษาไทย` / `🇬🇧 English`) that toggles `lang`.
2. Main content (`max-w-6xl mx-auto px-6 py-12 lg:px-8 lg:py-20`): `grid gap-8 lg:grid-cols-2` with one card per presentation format (`Oral` accented in emerald/meadow, `Poster` accented in sky), each containing:
   - Visual duration breakdown bar (`66.7% / 33.3%` for Oral `10+5`, `53.3% / 46.7%` for Poster `8+7`)
   - Award Evaluation Criteria list with percentage badges and proportional progress bars
   - Presenter Guidelines checklist with icons
3. Closing banner card at the bottom of the section.

- [ ] **Step 2: Verify `presenter-guidelines.vue` compiles without errors**

Run: `cd frontend && npx nuxi typecheck` (or `npm run build` check if typecheck is unavailable)
Expected: No syntax or template compilation errors in `frontend/pages/presenter-guidelines.vue`.

- [ ] **Step 3: Commit Task 1**

```bash
git add frontend/pages/presenter-guidelines.vue
git commit -m "feat: add presenter guidelines page with TH/EN toggle"
```

---

### Task 2: Update `Navbar.vue` and `Footer.vue` navigation

**Files:**
- Modify: `frontend/components/layout/Navbar.vue:1-90`
- Modify: `frontend/components/layout/Footer.vue:15-25`

**Interfaces:**
- Consumes: `/presenter-guidelines` route from Task 1

- [ ] **Step 1: Update `frontend/components/layout/Navbar.vue` to group `เกี่ยวกับงาน ▾` and add `คำแนะนำสำหรับผู้นำเสนอ`**

In `frontend/components/layout/Navbar.vue`:
- Replace the flat 8-link array with structured navigation items supporting children:
  - `หน้าแรก` (`/`)
  - `เกี่ยวกับงาน` (dropdown with children: `{ label: "เกี่ยวกับการประชุม", to: "/about" }`, `{ label: "คณะกรรมการ", to: "/committee" }`, `{ label: "ผู้สนับสนุน", to: "/sponsorship" }`)
  - `กำหนดการ` (`/important-dates`)
  - `คำแนะนำสำหรับผู้นำเสนอ` (`/presenter-guidelines`)
  - `ดาวน์โหลด` (`/guidelines`)
  - `ลงทะเบียน` (`/registration`)
  - `ติดต่อ` (`/contact`)
- Add dropdown state (`aboutMenuOpen = ref(false)`), active-route detection via `useRoute()` so `เกี่ยวกับงาน` highlights when `['/about', '/committee', '/sponsorship'].includes(route.path)`, auto-close on route change and outside click / Escape key, and `whitespace-nowrap` on nav links.
- In the mobile menu (`v-if="mobileMenuOpen"`), render all links including the sub-items under `เกี่ยวกับงาน` and `คำแนะนำสำหรับผู้นำเสนอ`, closing `mobileMenuOpen` on click.

- [ ] **Step 2: Add `คำแนะนำสำหรับผู้นำเสนอ` to `frontend/components/layout/Footer.vue`**

In `frontend/components/layout/Footer.vue` under "ลิงก์ด่วน", add:
```vue
<li><NuxtLink to="/presenter-guidelines" class="hover:text-primary-400 transition-colors">คำแนะนำสำหรับผู้นำเสนอ</NuxtLink></li>
```

- [ ] **Step 3: Verify build / runtime rendering**

Run: `cd frontend && npm run build`
Expected: Nuxt build succeeds with zero errors.

- [ ] **Step 4: Commit Task 2**

```bash
git add frontend/components/layout/Navbar.vue frontend/components/layout/Footer.vue
git commit -m "feat: add presenter guidelines to navbar and group about dropdown"
```
