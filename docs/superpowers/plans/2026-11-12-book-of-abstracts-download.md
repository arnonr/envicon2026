# Book of Abstracts PDF Download Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Host the 156-page *Conference Program & Book of Abstracts* PDF (`TSHE-CON-2026-Book-of-Abstracts.pdf`) and add clearly labeled download buttons alongside the existing 18-page program PDF across `program.vue`, `guidelines.vue`, and `index.vue`.

**Architecture:** Copy the static PDF into `frontend/public/downloads/TSHE-CON-2026-Book-of-Abstracts.pdf` and export `BOOK_OF_ABSTRACTS_PDF_PATH` from `frontend/utils/program-data.ts`. Each target page constructs `${appBaseUrl}${BOOK_OF_ABSTRACTS_PDF_PATH}` via `useRuntimeConfig().app.baseURL` so static asset resolution works under `/envicon2026`.

**Tech Stack:** Nuxt 3, Vue 3 (`<script setup lang="ts">`), Tailwind CSS 3, `@nuxt/ui`

**Spec:** `docs/superpowers/specs/2026-11-12-book-of-abstracts-download-design.md`

## Global Constraints

- Use Node/npm (`npm run build`) for `frontend/` — never Bun.
- Prefix all `/downloads/...` URLs with `useRuntimeConfig().app.baseURL.replace(/\/$/, "")` to support `/envicon2026`.
- Keep `frontend/public/downloads/TSHE-CON-2026-Program.pdf` (18 pages) intact alongside the new 156-page PDF.
- Label paired download buttons explicitly (`18 หน้า` vs `156 หน้า` / `เล่มรวมบทคัดย่อ`) so users never see two ambiguous `"ดาวน์โหลด PDF"` buttons.

## Review Focus

- Base URL prefixing: missing `appBaseUrl` on any `<a :href>` would 404 under `/envicon2026/downloads/...`.
- Paired button labels: every section showing both PDFs must distinguish *กำหนดการ (18 หน้า)* from *เล่มรวมบทคัดย่อ (156 หน้า)*.
- `download` attribute filenames: must be clean ASCII (`TSHE-CON-2026-Book-of-Abstracts.pdf`) without spaces or URL-encoded characters.
- Mobile wrapping: paired download buttons in `program.vue` Hero/footer and `index.vue` Hero/CTA/Schedule/Timeline must wrap cleanly (`flex-wrap` / stacked grid) on 375px viewports without horizontal overflow.
- File integrity: copied PDF in `frontend/public/downloads/TSHE-CON-2026-Book-of-Abstracts.pdf` must match the exact byte size of the uploaded 156-page PDF (~5.6 MB).

---

### Task 1: Add Book of Abstracts PDF and Download Links Across Program, Downloads, and Home Pages

**Files:**
- Create: `frontend/public/downloads/TSHE-CON-2026-Book-of-Abstracts.pdf`
- Modify: `frontend/utils/program-data.ts:1-3`
- Modify: `frontend/pages/program.vue:1-18,143-173,1045-1059`
- Modify: `frontend/pages/guidelines.vue:1-52`
- Modify: `frontend/pages/index.vue:59-80,134-150,284-301,455-472,702-709`

**Interfaces:**
- Consumes: `useRuntimeConfig().app.baseURL` from Nuxt runtime
- Produces: `export const BOOK_OF_ABSTRACTS_PDF_PATH = "/downloads/TSHE-CON-2026-Book-of-Abstracts.pdf"` in `frontend/utils/program-data.ts`

- [ ] **Step 1: Copy the 156-page PDF into `frontend/public/downloads/TSHE-CON-2026-Book-of-Abstracts.pdf` and verify byte size**

Run:
```bash
cp "/Users/macbook-arnon/.gemini/antigravity/brain/0b2dcd22-fa51-4c16-b322-6f5e2b022f36/.user_uploaded/media_1794453605412_3de9e0b7.pdf" \
  "/Users/macbook-arnon/Projects/envicon2026/frontend/public/downloads/TSHE-CON-2026-Book-of-Abstracts.pdf"
cmp -s "/Users/macbook-arnon/.gemini/antigravity/brain/0b2dcd22-fa51-4c16-b322-6f5e2b022f36/.user_uploaded/media_1794453605412_3de9e0b7.pdf" \
  "/Users/macbook-arnon/Projects/envicon2026/frontend/public/downloads/TSHE-CON-2026-Book-of-Abstracts.pdf" && ls -lh "/Users/macbook-arnon/Projects/envicon2026/frontend/public/downloads/TSHE-CON-2026-Book-of-Abstracts.pdf"
```
Expected: Exit code `0` and file size `5.6M`.

- [ ] **Step 2: Export `BOOK_OF_ABSTRACTS_PDF_PATH` in `frontend/utils/program-data.ts`**

Add right after `PROGRAM_PDF_PATH`:
```ts
export const BOOK_OF_ABSTRACTS_PDF_PATH = "/downloads/TSHE-CON-2026-Book-of-Abstracts.pdf";
```

- [ ] **Step 3: Add Book of Abstracts download buttons to `frontend/pages/program.vue`**

1. Import `BOOK_OF_ABSTRACTS_PDF_PATH` from `~/utils/program-data` and define:
   `const bookOfAbstractsPdfUrl = `${appBaseUrl}${BOOK_OF_ABSTRACTS_PDF_PATH}`;`
2. In the Hero top-right download card (`lines 143-173`):
   - Update heading label to `"เอกสารการประชุมวิชาการ (PDF)"`
   - Primary button (`sky`/`emerald` highlight): `<a :href="bookOfAbstractsPdfUrl" download="TSHE-CON-2026-Book-of-Abstracts.pdf">` with icon `i-heroicons-book-open` and text `"เล่มรวมบทคัดย่อฉบับเต็ม (156 หน้า)"`
   - Secondary button: `<a :href="programPdfUrl" download="TSHE-CON-2026-Program.pdf">` with icon `i-heroicons-arrow-down-tray` and text `"เฉพาะกำหนดการและตารางนำเสนอ (18 หน้า)"`
3. In the bottom callout (`lines 1045-1059`):
   - Wrap buttons in `<div class="flex flex-wrap items-center gap-2.5 shrink-0">`:
     - Book of Abstracts button: `"เล่มรวมบทคัดย่อ (156 หน้า)"` (`download="TSHE-CON-2026-Book-of-Abstracts.pdf"`)
     - Program button: `"กำหนดการ (18 หน้า)"` (`download="TSHE-CON-2026-Program.pdf"`)

- [ ] **Step 4: Add Document `06` card to `frontend/pages/guidelines.vue`**

Import `BOOK_OF_ABSTRACTS_PDF_PATH` (or construct `${appBaseUrl}/downloads/TSHE-CON-2026-Book-of-Abstracts.pdf`) and append item `06` to `documents` (also clarify item `05` subtitle with `18 Pages`):
- `number: "06"`
- `title: "เอกสารประกอบการประชุมและเล่มรวมบทคัดย่อ"`
- `titleEn: "Conference Program & Book of Abstracts (156 Pages)"`
- `type: "Adobe PDF · .PDF (5.6 MB)"`
- `icon: "i-heroicons-book-open"`
- `accent: "from-sky-500 to-indigo-400"`
- `downloadUrl: `${appBaseUrl}${BOOK_OF_ABSTRACTS_PDF_PATH}``
- `viewOnlineUrl: "/program"`

- [ ] **Step 5: Add Book of Abstracts & Program CTAs to `frontend/pages/index.vue`**

1. Import `BOOK_OF_ABSTRACTS_PDF_PATH` from `~/utils/program-data` (or define `const bookOfAbstractsPdfUrl = `${appBaseUrl}/downloads/TSHE-CON-2026-Book-of-Abstracts.pdf`;`).
2. In Hero CTA row (`lines 59-80`):
   - Replace the expired `"ส่งบทคัดย่อ"` button with `<NuxtLink to="/program">` (`"โปรแกรมการประชุม"`, icon `i-heroicons-calendar-days`) and add `<a :href="bookOfAbstractsPdfUrl" download="TSHE-CON-2026-Book-of-Abstracts.pdf">` (`"เล่มรวมบทคัดย่อ (PDF)"`, icon `i-heroicons-book-open`), keeping `"ลงทะเบียนเข้าร่วมงาน"` alongside them (`flex-wrap`).
3. In CTA Banner (`lines 134-150`), Schedule Highlights Box (`lines 284-301`), and Timeline (`lines 455-472`):
   - Add `<a :href="bookOfAbstractsPdfUrl" download="TSHE-CON-2026-Book-of-Abstracts.pdf">` labeled `"เล่มรวมบทคัดย่อ (PDF)"` alongside the existing program link/button, and clarify existing program PDF buttons as `"กำหนดการ (18 หน้า)"`.

- [ ] **Step 6: Build and verify Frontend**

Run:
```bash
cd /Users/macbook-arnon/Projects/envicon2026/frontend && npm run build
```
Expected: Build succeeds (`exit 0`) and `.output/public/downloads/TSHE-CON-2026-Book-of-Abstracts.pdf` exists (`5.6M`).
