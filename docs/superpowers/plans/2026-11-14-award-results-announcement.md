# Award Results Announcement & Post-Conference Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the official TSHE-CON 2026 academic presentation award results (10 awards across 3 categories) via a new `/awards` page, a prominent homepage section and post-event Hero state on `index.vue`, Navbar/Footer links, and a downloadable 4-page PDF on `guidelines.vue`.

**Architecture:** Copy the 4-page award announcement PDF into `frontend/public/downloads/TSHE-CON-2026-Award-Results.pdf` and define typed static award data (`AWARD_RESULTS_PDF_PATH`, `awardCategories`, `allAwards`) in `frontend/utils/awards-data.ts`. Consume this shared module in the new `frontend/pages/awards.vue` page and `frontend/pages/index.vue`, while linking `/awards` and the PDF from `Navbar.vue`, `Footer.vue`, and `guidelines.vue`.

**Tech Stack:** Nuxt 3, Vue 3 (`<script setup lang="ts">`), Tailwind CSS 3, `@nuxt/ui`

**Spec:** `docs/superpowers/specs/2026-11-14-award-results-announcement-design.md`

## Global Constraints

- Use Node/npm (`npm run build`) for `frontend/` — never Bun.
- Prefix `/downloads/TSHE-CON-2026-Award-Results.pdf` with `useRuntimeConfig().app.baseURL.replace(/\/$/, "")` everywhere so downloads resolve under `/envicon2026`.
- Keep all co-author names and affiliations complete as listed in the official 4-page PDF (`ประกาศผลคะแนน TSHE05 R.2.pdf`).
- Keep the Full Paper Proceeding submission banner (`20 พฤศจิกายน 2569`) intact on `index.vue`.
- Do not let the desktop navigation bar in `Navbar.vue` wrap to two lines: place `"ประกาศผลรางวัล"` (`/awards`) on the top bar and move `"คำแนะนำสำหรับผู้นำเสนอ"` into the `"กำหนดการ"` dropdown.

## Review Focus

- Base URL prefixing: any `<a :href>` for `TSHE-CON-2026-Award-Results.pdf` missing `appBaseUrl` will 404 under `/envicon2026`.
- Complete author lists: `CIRC-O-04` has 9 co-authors and long Thai titles; cards in both `awards.vue` and `index.vue` must wrap cleanly without truncation (`truncate` / `line-clamp` must not hide co-authors).
- Desktop Navbar width: moving `"คำแนะนำสำหรับผู้นำเสนอ"` into `"กำหนดการ"` dropdown while adding `"ประกาศผลรางวัล"` to top-level `navItems` must keep `isGroupActive` highlighting active for `/presenter-guidelines`.
- Post-event Hero state on `index.vue`: the expired `00:00:00` countdown and `"ขยายเวลารับบทคัดย่อถึง 30 ต.ค. 69"` badge must be replaced with the post-conference completion banner and award announcement CTA.
- Static PDF integrity: `frontend/public/downloads/TSHE-CON-2026-Award-Results.pdf` must match the exact 92,166-byte source PDF.

---

### Task 1: Add Official Award Results PDF and Shared Data Module (`awards-data.ts`)

**Files:**
- Create: `frontend/public/downloads/TSHE-CON-2026-Award-Results.pdf`
- Create: `frontend/utils/awards-data.ts`

**Interfaces:**
- Produces:
  - `export const AWARD_RESULTS_PDF_PATH = "/downloads/TSHE-CON-2026-Award-Results.pdf"`
  - `export type AwardCategoryKey = "oral_undergrad" | "oral_grad" | "poster"`
  - `export type AwardTier = "first" | "second" | "third" | "honorable"`
  - `export interface AwardItem { code: string; rankLabel: string; tier: AwardTier; title: string; authors: string; affiliation: string; categoryKey: AwardCategoryKey; categoryTitle: string; }`
  - `export interface AwardCategoryGroup { key: AwardCategoryKey; title: string; shortTitle: string; subtitle: string; badgeClass: string; headerClass: string; awards: AwardItem[]; }`
  - `export const awardCategories: AwardCategoryGroup[]`
  - `export const allAwards: AwardItem[]`

- [ ] **Step 1: Copy the uploaded 4-page PDF to `frontend/public/downloads/TSHE-CON-2026-Award-Results.pdf` and verify byte size**

Run:
```bash
cp "/Users/macbook-arnon/.gemini/antigravity/brain/4e8efde2-f8f3-4970-ae8e-97cfd0d2c1df/.user_uploaded/media_1794626224013_02a73d03.pdf" \
  "/Users/macbook-arnon/Projects/envicon2026/frontend/public/downloads/TSHE-CON-2026-Award-Results.pdf"
cmp -s "/Users/macbook-arnon/.gemini/antigravity/brain/4e8efde2-f8f3-4970-ae8e-97cfd0d2c1df/.user_uploaded/media_1794626224013_02a73d03.pdf" \
  "/Users/macbook-arnon/Projects/envicon2026/frontend/public/downloads/TSHE-CON-2026-Award-Results.pdf" && ls -l "/Users/macbook-arnon/Projects/envicon2026/frontend/public/downloads/TSHE-CON-2026-Award-Results.pdf"
```
Expected: Exit code `0` and file size `92166` bytes.

- [ ] **Step 2: Create `frontend/utils/awards-data.ts` with all 10 awards across 3 categories**

Populate `awardCategories` with exact data from Spec Section 5.1:
1. `oral_undergrad` (`ประเภท Oral Presentation ระดับปริญญาตรี`, 5 รางวัล):
   - `NAT-O-01` (`รางวัลชนะเลิศ`, `tier: "first"`)
   - `CLIM-O-08` (`รางวัลรองชนะเลิศอันดับ 1`, `tier: "second"`)
   - `CIRC-O-04` (`รางวัลชมเชย`, `tier: "honorable"`)
   - `CIRC-O-10` (`รางวัลชมเชย`, `tier: "honorable"`)
   - `EH-O-08` (`รางวัลชมเชย`, `tier: "honorable"`)
2. `oral_grad` (`ประเภท Oral Presentation ระดับบัณฑิตศึกษา`, 2 รางวัล):
   - `CLIM-O-13` (`รางวัลชนะเลิศ`, `tier: "first"`)
   - `ENV-O-04` (`รางวัลรองชนะเลิศอันดับ 1`, `tier: "second"`)
3. `poster` (`ประเภท Poster Presentation`, 3 รางวัล):
   - `EH-P-04` (`รางวัลชนะเลิศ`, `tier: "first"`)
   - `ENV-P-05` (`รางวัลรองชนะเลิศอันดับ 1`, `tier: "second"`)
   - `NAT-P-03` (`รางวัลรองชนะเลิศอันดับ 2`, `tier: "third"`)

- [ ] **Step 3: Commit Task 1**

```bash
git add frontend/public/downloads/TSHE-CON-2026-Award-Results.pdf frontend/utils/awards-data.ts
git commit -m "feat: add award results PDF and structured awards data module"
```

---

### Task 2: Create `/awards` Page and Wire Navigation & Download Links

**Files:**
- Create: `frontend/pages/awards.vue`
- Modify: `frontend/components/layout/Navbar.vue:13-35`
- Modify: `frontend/components/layout/Footer.vue:17-26`
- Modify: `frontend/pages/guidelines.vue:1-64`

**Interfaces:**
- Consumes: `AWARD_RESULTS_PDF_PATH`, `awardCategories`, `allAwards`, `type AwardCategoryKey`, `type AwardTier` from `~/utils/awards-data`
- Produces: route `/awards` (`frontend/pages/awards.vue`)

- [ ] **Step 1: Create `frontend/pages/awards.vue`**

Implement `/awards` with:
- Hero header (`bg-meadow-950 text-white`) displaying conference title, date (`12–13 พฤศจิกายน 2569`), and top-right download card with `<a :href="awardPdfUrl" download="TSHE-CON-2026-Award-Results.pdf">` (`"ดาวน์โหลดประกาศผลรางวัล (PDF · 4 หน้า)"`), plus quick links to `/program` and `/guidelines`.
- Category filter tabs (`"ALL"` | `"oral_undergrad"` | `"oral_grad"` | `"poster"`) with award counts (`ทั้งหมด (10 รางวัล)`, `Oral ปริญญาตรี (5)`, `Oral บัณฑิตศึกษา (2)`, `Poster Presentation (3)`).
- Category sections rendering every `AwardItem` card with tier-styled badge (`first`: gold/amber, `second`: sky/slate, `third`: orange/bronze, `honorable`: emerald/meadow), `code` pill, full `title`, complete `authors`, and `affiliation`.

- [ ] **Step 2: Update `Navbar.vue`, `Footer.vue`, and `guidelines.vue`**

1. In `frontend/components/layout/Navbar.vue`:
   - Add `{ label: "คำแนะนำสำหรับผู้นำเสนอ", to: "/presenter-guidelines" }` to `"กำหนดการ"` `children`.
   - Replace the top-level `"คำแนะนำสำหรับผู้นำเสนอ"` item with `{ label: "ประกาศผลรางวัล", to: "/awards" }`.
2. In `frontend/components/layout/Footer.vue`:
   - Add `<li><NuxtLink to="/awards" class="hover:text-primary-400 transition-colors">ประกาศผลรางวัลการนำเสนอ</NuxtLink></li>` to the quick links list.
3. In `frontend/pages/guidelines.vue`:
   - Import `AWARD_RESULTS_PDF_PATH` from `~/utils/awards-data` and add Document `07` (`title: "ประกาศผลรางวัลการนำเสนอผลงานวิชาการ"`, `titleEn: "Academic Presentation Award Results (4 Pages)"`, `type: "Adobe PDF · .PDF (90 KB)"`, `icon: "i-heroicons-trophy"`, `accent: "from-amber-400 to-yellow-300"`, `downloadUrl: `${appBaseUrl}${AWARD_RESULTS_PDF_PATH}``, `viewOnlineUrl: "/awards"`).

- [ ] **Step 3: Commit Task 2**

```bash
git add frontend/pages/awards.vue frontend/components/layout/Navbar.vue frontend/components/layout/Footer.vue frontend/pages/guidelines.vue
git commit -m "feat: add awards page and link from navbar, footer, and downloads"
```

---

### Task 3: Update Homepage (`index.vue`) with Post-Event Hero, Award Results Section, and Timeline Entry

**Files:**
- Modify: `frontend/pages/index.vue`

**Interfaces:**
- Consumes: `AWARD_RESULTS_PDF_PATH`, `awardCategories` from `~/utils/awards-data`

- [ ] **Step 1: Update Hero section, add Award Results section, and update Timeline in `frontend/pages/index.vue`**

1. Import `AWARD_RESULTS_PDF_PATH, awardCategories` from `~/utils/awards-data` and define `const awardResultsPdfUrl = `${appBaseUrl}${AWARD_RESULTS_PDF_PATH}`;`.
2. In the Hero section (`lines 26-80`):
   - Replace the `"ขยายเวลารับบทคัดย่อถึง 30 ต.ค. 69"` pill with `"ประกาศผลรางวัลการนำเสนอผลงานวิชาการ"` (`bg-amber-400 text-meadow-950`).
   - Replace the expired `00:00:00` countdown block with a post-conference completion banner thanking attendees and congratulating award recipients (`12–13 พฤศจิกายน 2569 · งานประชุมเสร็จสิ้นเรียบร้อยแล้ว`).
   - Update Hero CTA buttons: primary gold button `<NuxtLink to="/awards">` (`"ประกาศผลรางวัลการนำเสนอ"`, icon `i-heroicons-trophy`), secondary button `<a :href="bookOfAbstractsPdfUrl" download="TSHE-CON-2026-Book-of-Abstracts.pdf">` (`"เล่มรวมบทคัดย่อ (PDF)"`), and `<NuxtLink to="/program">` (`"โปรแกรมการประชุม"`).
3. Insert the new **Award Results Section (`#awards-section`)** immediately after the Hero section:
   - Section header with `"Award Results · TSHE-CON 2026"`, heading `"ประกาศผลรางวัลการนำเสนอผลงานวิชาการ"`, and action buttons (`<NuxtLink to="/awards">` `"ดูหน้าประกาศผลฉบับเต็ม"` + `<a :href="awardResultsPdfUrl" download="TSHE-CON-2026-Award-Results.pdf">` `"ดาวน์โหลดประกาศผล (PDF)"`).
   - 3 category blocks (`awardCategories`) showing all 10 winning papers with rank badge, paper code (`NAT-O-01`, etc.), title, full authors list, and affiliation.
4. In `timeline` (`lines 856-896`) and template (`lines 470-495`):
   - Add `"ประกาศผลรางวัลการนำเสนอผลงานวิชาการ"` (`date: "13 พฤศจิกายน 2569"`, `icon: "i-heroicons-trophy"`, `awardsLink: true`) with buttons linking to `/awards` and downloading `TSHE-CON-2026-Award-Results.pdf`.

- [ ] **Step 2: Run Frontend build to verify TypeScript, routes, and static assets**

Run:
```bash
cd /Users/macbook-arnon/Projects/envicon2026/frontend && npm run build
```
Expected: Build exits `0` with no errors and `.output/public/downloads/TSHE-CON-2026-Award-Results.pdf` present.

- [ ] **Step 3: Commit Task 3**

```bash
git add frontend/pages/index.vue
git commit -m "feat: add award results section and post-event hero state to homepage"
```
