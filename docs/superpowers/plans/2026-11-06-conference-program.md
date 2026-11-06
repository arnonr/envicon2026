# Conference Program & Presentation Schedule Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the complete 18-page TSHE-CON 2026 Conference Program (Nov 12–13, 2569 schedule, Oral/Poster session rooms, chairs/evaluators, and all 113 papers) on `/program`, provide direct PDF download, and place high-visibility entry links across 5 key locations on the website.

**Architecture:** Pure frontend Nuxt 3 + Vue 3 implementation. Places the official PDF in `frontend/public/downloads/TSHE-CON-2026-Program.pdf`, extracts all structured schedule and paper data into `frontend/utils/program-data.ts`, rebuilds `frontend/pages/program.vue` with interactive tabs (Day 1, Day 2, All 113 Papers) and instant search, and adds entry links/download CTAs in `Navbar.vue`, `Footer.vue`, `guidelines.vue`, `index.vue`, `important-dates.vue`, and `presenter-guidelines.vue`.

**Tech Stack:** Nuxt 3, Vue 3 (`<script setup lang="ts">`), `@nuxt/ui` (`UIcon`, `UCard`, `UButton`, `UBadge`, `UInput`), Tailwind CSS (`meadow`, `primary`, `sky`, `amber`, `rose`).

**Spec:** `docs/superpowers/specs/2026-11-06-conference-program-design.md`

## Global Constraints

- Conference dates: **12–13 พฤศจิกายน 2569** at **อาคาร 99 อุทยานเทคโนโลยี มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ**.
- All download links must prefix `useRuntimeConfig().app.baseURL.replace(/\/$/, "")` so they resolve under `/envicon2026/downloads/TSHE-CON-2026-Program.pdf`.
- All 7 Sessions and all **113 research papers** (74 Oral + 39 Poster) from pages 7–18 of the PDF must be included accurately with their exact codes (`ENV-O-01`..`17`, `ENV-P-01`..`11`, `CIRC-O-01`..`15`, `CIRC-P-01`..`06`, `CLIM-O-01`..`18`, `CLIM-P-01`..`04`, `EH-O-01`..`09`, `EH-P-01`..`05`, `NAT-O-01`..`05`, `NAT-P-01`..`05`, `DIGI-O-01`..`04`, `DIGI-P-01`..`04`, `GREEN-O-01`..`06`, `GREEN_P-01`..`04`).
- Navbar desktop layout must not overflow horizontally; `"กำหนดการ"` becomes a dropdown containing `"โปรแกรมการประชุม (12–13 พ.ย.)"` (`/program`) and `"กำหนดการสำคัญและสถานที่"` (`/important-dates`).

## Review Focus

1. **Paper code & schedule cross-referencing:** Note that Session 7 posters use underscores (`GREEN_P-01` to `GREEN_P-04`) in the PDF while others use hyphens; search and lookup functions must normalize `-` and `_` so searching either `GREEN-P-01` or `GREEN_P-01` works seamlessly.
2. **Multiple dropdowns in `Navbar.vue`:** `Navbar.vue` previously used a single `aboutMenuOpen` boolean for `v-if="item.children"`. With two dropdown items ("เกี่ยวกับงาน" and "กำหนดการ"), it must track `openDropdownLabel: Ref<string | null>` so clicking one dropdown does not open both simultaneously.
3. **Mixed-track rooms in Oral & Poster sessions:** Oral Session 3 Room 2 combines `CIRC-O-14..15` and `DIGI-O-01..04`; Poster Evaluation Columns 4, 6, and 7 combine `DIGI`+`NAT`, `CLIM`+`NAT`, and `GREEN`+`NAT` respectively. The data structure must preserve exact room/column groupings from PDF pages 2–5.
4. **Base URL prefixing on PDF download links:** Ensure every `<a :href="programPdfUrl" download>` uses `useRuntimeConfig().app.baseURL` so production reverse-proxy path `/envicon2026/downloads/TSHE-CON-2026-Program.pdf` never 404s.
5. **Mobile table usability:** Multi-room Oral and Poster tables on `/program` must support both responsive horizontal scrolling and room/track filtering so mobile attendees can read paper titles comfortably.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `frontend/public/downloads/TSHE-CON-2026-Program.pdf` | Create | Official 18-page conference program PDF for direct download |
| `frontend/utils/program-data.ts` | Create | Complete typed dataset for Day 1 & Day 2 schedules, Oral/Poster room matrices, chairs/evaluators, all 113 papers, and lookup helpers |
| `frontend/pages/program.vue` | Modify | Interactive conference program page with PDF download CTA, instant search, Day 1/Day 2/All Papers tabs, and linked paper titles |
| `frontend/components/layout/Navbar.vue` | Modify | Convert "กำหนดการ" into a dropdown with `/program` and `/important-dates`; support independent dropdown states |
| `frontend/components/layout/Footer.vue` | Modify | Add `/program` link in Quick Links |
| `frontend/pages/guidelines.vue` | Modify | Add Document 05 card for downloading the Conference Program PDF |
| `frontend/pages/index.vue` | Modify | Add Program page & PDF download CTAs in Schedule Highlights and Timeline (6 Nov 2569) |
| `frontend/pages/important-dates.vue` | Modify | Add Program page & PDF download buttons on the Nov 6 and Nov 12–13 milestones |
| `frontend/pages/presenter-guidelines.vue` | Modify | Add bilingual top callout banner linking to `/program` and the Program PDF download |

---

### Task 1: Add Official Program PDF & Structured Data Module (`frontend/public/downloads/TSHE-CON-2026-Program.pdf`, `frontend/utils/program-data.ts`)

**Files:**
- Create: `frontend/public/downloads/TSHE-CON-2026-Program.pdf`
- Create: `frontend/utils/program-data.ts`

**Interfaces:**
- Produces:
  - Static asset `/downloads/TSHE-CON-2026-Program.pdf`
  - `PROGRAM_PDF_PATH = "/downloads/TSHE-CON-2026-Program.pdf"`
  - `PaperItem`, `SessionTrackData`, `GeneralScheduleItem`, `OralSessionBlock`, `PosterEvaluationColumn` interfaces
  - `day1Schedule: GeneralScheduleItem[]`, `day2Schedule: GeneralScheduleItem[]`
  - `oralSessionBlocks: Record<"oral1" | "oral2" | "oral3", OralSessionBlock>`
  - `posterSessionBlock: PosterSessionBlock`
  - `sessionTracks: SessionTrackData[]` (all 7 sessions, 113 papers)
  - `normalizePaperCode(code: string): string`
  - `getPaperByCode(code: string): EnrichedPaperItem | undefined`
  - `allEnrichedPapers: EnrichedPaperItem[]`

- [ ] **Step 1: Copy the official PDF into `frontend/public/downloads/`**

Run:
```bash
cp "/Users/macbook-arnon/Downloads/TSHE-CONFERENCE 5th PROGRAM 12-13 Nov 2026.pdf" "/Users/macbook-arnon/Projects/envicon2026/frontend/public/downloads/TSHE-CON-2026-Program.pdf"
```
Expected: File exists at `frontend/public/downloads/TSHE-CON-2026-Program.pdf` (~403 KB).

- [ ] **Step 2: Create `frontend/utils/program-data.ts` with complete schedule, room matrices, and all 113 papers**

Include:
1. **Day 1 (12 พฤศจิกายน 2569) & Day 2 (13 พฤศจิกายน 2569)** general schedule items with exact times, speaker names/titles, panelist names/affiliations (ศ.ดร.วรณพ วิยกาญจน์, ผศ.ดร.ศุภกาญจน์ จันทร์แดง, รศ.ดร.อุมา ลางคุลเสน, ผศ.ดร.สตรีไทย พุ่มไม้, พ.อ.รศ.ดร.กิตติภพ พรหมดี, ดำเนินรายการโดย รศ.ดร.รัฐชา ชัยชนะ), and Day 2 study tour 5 centers with `/study-tour` link.
2. **Oral Presentation ช่วงที่ 1 (12 พ.ย. 13:00–14:15, 20 ผลงาน)** + special column `การประชุมร่วมกันระหว่าง สอสท. และ กรมวิทยาศาสตร์บริการ` (`ห้องประชุมชั้น 3 ศูนย์ ISAAC`).
3. **Oral Presentation ช่วงที่ 2 (12 พ.ย. 14:30–16:30, 35 ผลงาน)** across 5 rooms (`ENV`, `CIRC`, `CLIM`, `NAT`, `GREEN`).
4. **Poster Presentation (12 พ.ย. 16:30–18:00, 39 ผลงาน)** across 7 evaluation columns with both evaluators per column.
5. **Oral Presentation ช่วงที่ 3 (13 พ.ย. 10:15–12:00, 19 ผลงาน)** across 4 rooms (`ENV`, `CIRC & DIGI`, `CLIM`, `EH`).
6. **All 113 papers** across Sessions 1–7 (`ENV`, `CIRC`, `CLIM`, `EH`, `NAT`, `DIGI`, `GREEN`), plus `normalizePaperCode` that normalizes `_` and `-` so `GREEN_P-01` and `GREEN-P-01` both match, and `allEnrichedPapers` which attaches `date`, `time`, `room`, and `chairsOrEvaluators` to every paper.

- [ ] **Step 3: Verify `program-data.ts` paper counts and lookups**

Run:
```bash
bun -e 'import { allEnrichedPapers, sessionTracks } from "./frontend/utils/program-data"; console.log("Tracks:", sessionTracks.length, "Total papers:", allEnrichedPapers.length);'
```
Expected: `Tracks: 7 Total papers: 113` and every paper has its schedule info resolved.

---

### Task 2: Rebuild Interactive Conference Program Page (`frontend/pages/program.vue`)

**Files:**
- Modify: `frontend/pages/program.vue`

**Interfaces:**
- Consumes: `PROGRAM_PDF_PATH`, `day1Schedule`, `day2Schedule`, `oralSessionBlocks`, `posterSessionBlock`, `sessionTracks`, `allEnrichedPapers`, `getPaperByCode` from `~/utils/program-data`
- Produces: Interactive `/program` page (Approach A)

- [ ] **Step 1: Implement `frontend/pages/program.vue` with Approach A layout**

Build `frontend/pages/program.vue` with:
1. **Hero Section:**
   - Conference badge (`TSHE-CON 2026 · OFFICIAL PROGRAM`), title, theme, date (`12–13 พฤศจิกายน 2569`), venue (`ณ อาคาร 99 อุทยานเทคโนโลยี มจพ.`).
   - Primary CTA button: **ดาวน์โหลดกำหนดการฉบับเต็ม (PDF)** (`:href="programPdfUrl" download="TSHE-CON-2026-Program.pdf"`)
   - Secondary CTA button: **คำแนะนำสำหรับผู้นำเสนอ** (`to="/presenter-guidelines"`) and **กำหนดการสำคัญและสถานที่** (`to="/important-dates"`).
2. **Quick Search Bar & Instant Filter Results:**
   - Input to search by paper code (e.g. `ENV-O-01`, `GREEN_P-01`), paper title, author name, or chair/evaluator name.
   - When `searchQuery.trim()` is non-empty, display matching papers immediately with badges for Paper Code, Type (Oral/Poster), Session, Date & Time, Room, Chair/Evaluator, Title, and Author.
3. **Interactive View Switcher (3 Main Tabs):**
   - `day1`: **วันที่ 12 พ.ย. 2569** (Plenary schedule + Oral ช่วงที่ 1 + Oral ช่วงที่ 2 + Poster Presentation + Dinner)
   - `day2`: **วันที่ 13 พ.ย. 2569** (Plenary schedule + Oral ช่วงที่ 3 + Study Tour 5 centers + Closing & Awards)
   - `papers`: **รายชื่อผลงานทั้งหมด (113 เรื่อง · 7 Sessions)**
4. **Rich Oral & Poster Session Renderers:**
   - For each Oral session (`oral1`, `oral2`, `oral3`), allow toggling between **ตารางรวมทุกห้อง (Matrix View)** (showing rooms, Chairs, Co-chairs, and clickable/hoverable paper codes with presenter names) and **รายละเอียดแยกตามห้อง (Room Detail View)** (showing full paper titles and authors for each 15-minute slot).
   - For the Poster session (`16:30–18:00`), show all 7 evaluation groups with their Evaluators and the list of posters (code + title + author) in each group.
5. **All Papers Directory Tab (`papers`):**
   - Filter pills for Session (`ทั้งหมด`, `ENV`, `CIRC`, `CLIM`, `EH`, `NAT`, `DIGI`, `GREEN`) and format (`ทั้งหมด`, `Oral (74)`, `Poster (39)`).
   - Displays each session header and responsive table of papers with Order, Code, Title, Presenter, and Scheduled Time/Room.

- [ ] **Step 2: Verify `frontend/pages/program.vue` compiles cleanly**

Run: `git status frontend/pages/program.vue`
Expected: Modified `frontend/pages/program.vue` with no syntax errors.

---

### Task 3: Add High-Visibility Entry Links & Download Buttons Across 5 Key Spots (`Navbar.vue`, `Footer.vue`, `guidelines.vue`, `index.vue`, `important-dates.vue`, `presenter-guidelines.vue`)

**Files:**
- Modify: `frontend/components/layout/Navbar.vue`
- Modify: `frontend/components/layout/Footer.vue`
- Modify: `frontend/pages/guidelines.vue`
- Modify: `frontend/pages/index.vue`
- Modify: `frontend/pages/important-dates.vue`
- Modify: `frontend/pages/presenter-guidelines.vue`

**Interfaces:**
- Consumes: `/program` route and `/downloads/TSHE-CON-2026-Program.pdf`
- Produces: 5 high-visibility navigation and download entry points

- [ ] **Step 1: Update `Navbar.vue` and `Footer.vue`**

1. In `frontend/components/layout/Navbar.vue`:
   - Change `{ label: "กำหนดการ", to: "/important-dates" }` into a dropdown group:
     ```ts
     {
       label: "กำหนดการ",
       children: [
         { label: "โปรแกรมการประชุม (12–13 พ.ย.)", to: "/program" },
         { label: "กำหนดการสำคัญและสถานที่", to: "/important-dates" },
       ],
     },
     ```
   - Replace `const aboutMenuOpen = ref(false)` with `const openDropdownLabel = ref<string | null>(null)` so each dropdown (`เกี่ยวกับงาน` and `กำหนดการ`) toggles independently (`openDropdownLabel === item.label`).
2. In `frontend/components/layout/Footer.vue`:
   - Add `<li><NuxtLink to="/program" class="hover:text-primary-400 transition-colors">โปรแกรมการประชุม (12–13 พ.ย.)</NuxtLink></li>` to Quick Links.

- [ ] **Step 2: Add Conference Program PDF card to `frontend/pages/guidelines.vue`**

In `frontend/pages/guidelines.vue`:
- Add Document `05` (or place at the top/prominent position in `documents` array) for **"กำหนดการและตารางนำเสนอผลงาน"** (`Official Conference Program & Schedule`, `Adobe PDF · .PDF`, `downloadUrl: ${appBaseUrl}/downloads/TSHE-CON-2026-Program.pdf`) and a quick link button to view `/program` online.

- [ ] **Step 3: Add Program & PDF Download CTAs to `frontend/pages/index.vue`, `frontend/pages/important-dates.vue`, and `frontend/pages/presenter-guidelines.vue`**

1. In `frontend/pages/index.vue`:
   - In the Schedule Highlights Box (around line 265–281), make the `ประกาศโปรแกรมนำเสนอ (6 พ.ย. 69)` and `วันจัดงานประชุมวิชาการ (12–13 พ.ย. 69)` box include direct buttons to **ดูตารางนำเสนอ (`/program`)** and **ดาวน์โหลดกำหนดการ (PDF)**.
   - In the Timeline section (around line 410–436 and `timeline` array around line 810), add action links on `"ประกาศโปรแกรมการนำเสนอผลงาน"` (`6 พฤศจิกายน 2569`) and `"วันจัดงานประชุม"` (`12 — 13 พฤศจิกายน 2569`) to open `/program` and download the PDF.
2. In `frontend/pages/important-dates.vue`:
   - Add `link: "/program"` and `downloadPdf: true` on `"ประกาศโปรแกรมการนำเสนอผลงาน"` (`6 พฤศจิกายน 2569`) as well as `"วันจัดงานประชุม"`, rendering both **"ดูโปรแกรมการประชุม"** and **"ดาวน์โหลดกำหนดการ (PDF)"** buttons.
3. In `frontend/pages/presenter-guidelines.vue`:
   - Add a bilingual callout bar right below the Hero section with buttons to **ตรวจสอบตารางเวลาและห้องนำเสนอ (`/program`)** and **ดาวน์โหลดกำหนดการฉบับเต็ม (PDF)** (and English equivalents when `lang === 'en'`).

---

### Task 4: End-to-End Verification

**Files:**
- Check all created and modified files

- [ ] **Step 1: Run Nuxt typecheck / build verification**

Run:
```bash
cd /Users/macbook-arnon/Projects/envicon2026/frontend && npx nuxi prepare && npm run build
```
Expected: Nuxt client and server bundles build with exit code 0 and no broken imports or template errors.
