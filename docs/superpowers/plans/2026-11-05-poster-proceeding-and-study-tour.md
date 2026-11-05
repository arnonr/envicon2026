# Poster Guidelines, Proceeding Announcement & Technical Study Tour Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update poster requirements (A0 portrait, setup/takedown schedule) on presenter guidelines, broadcast the Proceeding submission deadline (Nov 20, 2026) on homepage and important dates, and create a dedicated technical study tour page (`/study-tour`) showcasing 5 KMUTNB facilities with navbar and schedule links.

**Architecture:** Frontend Vue 3/Nuxt 3 content update. Updates `presenter-guidelines.vue` with poster dimensions and scheduling, updates `index.vue` and `important-dates.vue` with the 20 Nov Proceeding deadline, creates a new responsive page `frontend/pages/study-tour.vue` using facility cards with badges and icons, and updates `Navbar.vue` and `program.vue` with navigation hooks.

**Tech Stack:** Nuxt 3, Vue 3 (`<script setup lang="ts">`), `@nuxt/ui` (`UIcon`, `UCard`, `UButton`, `UBadge`), Tailwind CSS (`meadow`, `primary`, `sky`, `amber`, `rose` palettes).

**Spec:** `docs/superpowers/specs/2026-11-05-poster-proceeding-and-study-tour-design.md`

## Global Constraints

- Retain the official conference dates as **12–13 พฤศจิกายน 2569** throughout the project.
- Poster requirements: **A0 portrait (แนวตั้ง)**, 84.1 x 118.9 cm. Poster setup from **12 พ.ย. 2569 เวลา 08:00 น.** onward, removal at **13 พ.ย. 2569 เวลา 16:00 น.**
- Full paper for Proceeding closing date: **20 พฤศจิกายน 2569**.
- Technical study tour date: **13 พฤศจิกายน 2569 เวลา 13:00 – 15:00 น.** covering all 5 centers at KMUTNB.
- Navigation link for study tour must reside inside the **"เกี่ยวกับงาน"** dropdown to preserve horizontal navbar density.

## Review Focus

1. **Poster size orientation accuracy:** Verify both Thai and English copy explicitly specify "A0 แนวตั้ง" / "A0 Portrait orientation", not just "A0".
2. **Mounting & removal times visibility:** Ensure the setup (12 Nov 08:00+) and removal (13 Nov 16:00) hours are cleanly styled in both languages on `/presenter-guidelines`.
3. **Proceeding announcement clarity:** Clearly convey that the Nov 20 deadline is for submitting the final full paper for conference proceedings publication (following presentation).
4. **All 5 facilities included on `/study-tour`:** Confirm the exact names of all 5 centers provided by the client are listed without omission or typos.
5. **Navbar dropdown responsiveness:** Ensure the new item in "เกี่ยวกับงาน" renders properly on both desktop and mobile menus without breaking dropdown click-outside or escape-key behaviors.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `frontend/pages/presenter-guidelines.vue` | Modify | Add A0 Portrait specs, mounting (12 Nov 08:00+) and takedown (13 Nov 16:00) times in TH & EN |
| `frontend/pages/index.vue` | Modify | Update CTA banner and highlights box for Proceeding deadline (20 Nov 2569) |
| `frontend/pages/important-dates.vue` | Modify | Add milestone for Full Paper Proceeding deadline (20 Nov 2569) |
| `frontend/pages/study-tour.vue` | Create | New page displaying the 5 KMUTNB study tour centers with facility cards |
| `frontend/components/layout/Navbar.vue` | Modify | Add "สถานที่ศึกษาดูงาน" to "เกี่ยวกับงาน" dropdown |
| `frontend/pages/program.vue` | Modify | Link Nov 13 13:00-15:00 schedule block to `/study-tour` |

---

### Task 1: Update Poster Guidelines with A0 Portrait and Times (`frontend/pages/presenter-guidelines.vue`)

**Files:**
- Modify: `frontend/pages/presenter-guidelines.vue`

**Interfaces:**
- Consumes: `copyByLocale` in `frontend/pages/presenter-guidelines.vue`
- Produces: Updated copy and display for Poster presentation

- [ ] **Step 1: Update Thai and English poster guidelines and schedule**

In `frontend/pages/presenter-guidelines.vue`:
1. In `copyByLocale.th.sections` (where `id === 'poster'`), update guidelines:
   - "จัดเตรียมโปสเตอร์ขนาด **A0 แนวตั้ง (Portrait)** ขนาด 84.1 x 118.9 ซม. ให้มีเนื้อหาครบถ้วน ถูกต้อง อ่านง่าย และมีการจัดวางองค์ประกอบอย่างเหมาะสม"
   - Add mounting schedule: "ผู้นำเสนอสามารถเริ่มติดโปสเตอร์ได้ในวันที่ **12 พฤศจิกายน 2569 เวลา 08:00 น. เป็นต้นไป**"
   - Add removal schedule: "สามารถปลดและเก็บโปสเตอร์ได้ในวันที่ **13 พฤศจิกายน 2569 เวลา 16:00 น.**"
2. In `copyByLocale.en.sections` (where `id === 'poster'`), update guidelines:
   - "Prepare your poster in **A0 size, Portrait orientation** (84.1 × 118.9 cm), ensuring that it is scientifically accurate, well-organized, easy to read, and visually clear."
   - "Poster mounting begins on **November 12, 2026 from 08:00 onward**."
   - "Poster removal takes place on **November 13, 2026 at 16:00**."
3. In the template for the poster card, add a dedicated schedule badge/callout highlighting the setup and removal times so presenters see them immediately.

- [ ] **Step 2: Verify changes in `presenter-guidelines.vue`**

Run: `git diff frontend/pages/presenter-guidelines.vue`
Expected: Diff shows portrait orientation and exact mounting/removal dates in both Thai and English.

- [ ] **Step 3: Commit Task 1**

```bash
git add frontend/pages/presenter-guidelines.vue
git commit -m "feat(guidelines): add A0 portrait orientation and poster mounting schedule"
```

---

### Task 2: Update Homepage & Important Dates with Proceeding Deadline (`frontend/pages/index.vue`, `frontend/pages/important-dates.vue`)

**Files:**
- Modify: `frontend/pages/index.vue`
- Modify: `frontend/pages/important-dates.vue`

**Interfaces:**
- Consumes: Announcement banners & important dates arrays
- Produces: Public messaging for Proceeding deadline

- [ ] **Step 1: Update Homepage CTA Banner and Schedule Box**

In `frontend/pages/index.vue`:
1. Update CTA Banner (around line 125):
   - Tag: change to "กำหนดการสำคัญ" (Important Notice) with vibrant badge
   - Title: "ปิดรับบทความฉบับเต็มเพื่อลง Proceeding <span class=\"text-amber-200 drop-shadow-md\">20 พฤศจิกายน 2569</span>"
   - Description: "สำหรับผู้นำเสนอผลงานที่ผ่านการพิจารณา สามารถนำส่งบทความฉบับสมบูรณ์ (Full Paper) เพื่อตีพิมพ์ในรายงานสืบเนื่องจากการประชุมวิชาการ (Proceeding) ได้ถึงวันที่ 20 พ.ย. 2569"
2. In Schedule Highlights Box:
   - Replace outdated abstract submission slot with a highlighted card:
     - Tag: "ปิดรับ Proceeding"
     - Date: "20 พ.ย. 69"
     - Note: "ปิดรับบทความฉบับเต็มเพื่อลง Proceeding"

- [ ] **Step 2: Update `important-dates.vue`**

In `frontend/pages/important-dates.vue`:
Add or update the milestone for Proceeding full paper submission:
```ts
{
  title: "ปิดรับบทความฉบับเต็มเพื่อลง Proceeding",
  date: "20 พฤศจิกายน 2569",
  description: "กำหนดส่งบทความฉบับสมบูรณ์ (Full Paper) สำหรับผู้ผ่านการพิจารณาเพื่อตีพิมพ์ในรายงานสืบเนื่องจากการประชุม",
  highlight: true,
}
```

- [ ] **Step 3: Verify changes in `index.vue` and `important-dates.vue`**

Run: `git diff frontend/pages/index.vue frontend/pages/important-dates.vue`
Expected: Clean updates reflecting Nov 20, 2569 Proceeding deadline.

- [ ] **Step 4: Commit Task 2**

```bash
git add frontend/pages/index.vue frontend/pages/important-dates.vue
git commit -m "feat(home): announce full paper proceeding deadline on Nov 20, 2569"
```

---

### Task 3: Create Technical Study Tour Page (`frontend/pages/study-tour.vue`)

**Files:**
- Create: `frontend/pages/study-tour.vue`

**Interfaces:**
- Consumes: `@nuxt/ui` components (`UCard`, `UIcon`, `UBadge`, `UButton`)
- Produces: Route `/study-tour`

- [ ] **Step 1: Create `frontend/pages/study-tour.vue` with 5 facilities**

Implement `frontend/pages/study-tour.vue` containing:
1. **Header Section:**
   - Tag: "กิจกรรมพิเศษ · Special Technical Visit"
   - Main Title: "สถานที่ศึกษาดูงานนวัตกรรมและเทคโนโลยี มจพ."
   - Subtitle: "การเยี่ยมชมศูนย์วิจัยและห้องปฏิบัติการชั้นนำ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ"
   - Schedule Callout Card:
     - Date: วันที่ 13 พฤศจิกายน 2569
     - Time: เวลา 13:00 – 15:00 น.
     - Assembly point: อาคาร 99 อุทยานเทคโนโลยี มจพ.
2. **Facility Cards Grid (5 facilities):**
   - **Facility 1:** ศูนย์ปฏิบัติการเทคโนโลยีนวัตกรรมยานยนต์สมัยใหม่และระบบขนส่งทางราง
     - Tag: `ยานยนต์สมัยใหม่และระบบราง`
     - Icon: `i-heroicons-truck`
     - Highlights: นวัตกรรมยานยนต์ไฟฟ้า (EV), แบตเตอรี่และการประจุพลังงาน, โครงสร้างและระบบความปลอดภัยรถไฟความเร็วสูง
   - **Facility 2:** ศูนย์ปฏิบัติการระบบอัตโนมัติและหุ่นยนต์
     - Tag: `ระบบอัตโนมัติและหุ่นยนต์`
     - Icon: `i-heroicons-cpu-chip`
     - Highlights: ระบบอัตโนมัติในโรงงานอัจฉริยะ (Industry 4.0), แขนกลหุ่นยนต์อุตสาหกรรม, AI วิชันในกระบวนการตรวจสอบ
   - **Facility 3:** สถาบันเทคโนโลยีอวกาศนานาชาติเพื่อการพัฒนาเศรษฐกิจ
     - Tag: `เทคโนโลยีอวกาศ`
     - Icon: `i-heroicons-globe-alt`
     - Highlights: ดาวเทียมและเศรษฐกิจอวกาศ (New Space), การประยุกต์ข้อมูลภูมิสารสนเทศเพื่อการจัดการสิ่งแวดล้อมและสภาพภูมิอากาศ
   - **Facility 4:** ศูนย์การเรียนรู้การบำบัดน้ำเสียจากสารเคมี
     - Tag: `เทคโนโลยีสิ่งแวดล้อม`
     - Icon: `i-heroicons-beaker`
     - Highlights: กระบวนการออกซิเดชันขั้นสูง (AOPs), การกำจัดโลหะหนักและสารเคมีอันตราย, การนำน้ำกลับมาใช้ใหม่
   - **Facility 5:** ศูนย์การเรียนรู้ระบบบำบัดน้ำเสียโรงอาหาร อาคาร 40 ปี มจพ
     - Tag: `การจัดการสิ่งแวดล้อมชุมชน`
     - Icon: `i-heroicons-sparkles`
     - Highlights: ระบบบำบัดน้ำเสียชุมชนและสถานประกอบการอาหาร, ระบบดักไขมันประสิทธิภาพสูง, เศรษฐกิจหมุนเวียนและพลังงานชีวภาพ
3. **Participant Notice / CTA:**
   - Note on registration/participation for conference attendees.
   - Link back to Program (`/program`) and Home (`/`).

- [ ] **Step 2: Verify `frontend/pages/study-tour.vue` syntax**

Run: `node -c frontend/pages/study-tour.vue 2>/dev/null || git status`
Check that file exists and template tags are balanced.

- [ ] **Step 3: Commit Task 3**

```bash
git add frontend/pages/study-tour.vue
git commit -m "feat(tour): create technical study tour page with 5 KMUTNB facilities"
```

---

### Task 4: Connect Study Tour Page in Navbar and Program (`frontend/components/layout/Navbar.vue`, `frontend/pages/program.vue`)

**Files:**
- Modify: `frontend/components/layout/Navbar.vue`
- Modify: `frontend/pages/program.vue`

**Interfaces:**
- Consumes: `/study-tour` route
- Produces: Seamless user navigation to study tour details

- [ ] **Step 1: Add "สถานที่ศึกษาดูงาน" to Navbar dropdown**

In `frontend/components/layout/Navbar.vue`:
Add item to `navItems` under `label: "เกี่ยวกับงาน"`:
```ts
{
  label: "เกี่ยวกับงาน",
  children: [
    { label: "เกี่ยวกับการประชุม", to: "/about" },
    { label: "คณะกรรมการ", to: "/committee" },
    { label: "ผู้สนับสนุน", to: "/sponsorship" },
    { label: "สถานที่ศึกษาดูงาน", to: "/study-tour" },
  ],
},
```
Verify desktop and mobile navigation both iterate over `children` and display the new link correctly.

- [ ] **Step 2: Link Nov 13 afternoon slot in `program.vue` to `/study-tour`**

In `frontend/pages/program.vue`:
In `schedule` array for day 2 (`วันที่ 13 พฤศจิกายน 2569`):
Update the `detail` for `"13:00 – 15:00"` to feature a clickable link or NuxtLink button to `/study-tour`:
"เยี่ยมชมศึกษาดูงาน 5 ศูนย์นวัตกรรม มจพ. (ศูนย์ยานยนต์สมัยใหม่และระบบราง, ศูนย์หุ่นยนต์, สถาบันอวกาศ, ศูนย์บำบัดน้ำเสียเคมี, และศูนย์บำบัดน้ำเสียโรงอาหาร)" along with a link button to `/study-tour`.

- [ ] **Step 3: Verify navigation and link consistency**

Run: `git diff frontend/components/layout/Navbar.vue frontend/pages/program.vue`
Expected: Navbar dropdown and program schedule both reference `/study-tour`.

- [ ] **Step 4: Commit Task 4**

```bash
git add frontend/components/layout/Navbar.vue frontend/pages/program.vue
git commit -m "feat(nav): integrate study tour into navbar dropdown and program schedule"
```

---

### Task 5: End-to-End Build Verification

**Files:**
- Check all modified/created files

- [ ] **Step 1: Run frontend build or syntax check**

Run: `cd frontend && npx nuxi prepare`
Verify Nuxt builds type definitions and resolves routes cleanly.

- [ ] **Step 2: Verify git diff is clean and complete**

Run: `git status && git diff origin/main`
Verify all 5 requirements are met:
1. Poster A0 vertical specified
2. Poster mounting (12 Nov 08:00+) and takedown (13 Nov 16:00) specified
3. Proceeding deadline (20 Nov 2569) broadcasted on home and important dates
4. Study tour page created with 5 centers
5. Navbar dropdown and program schedule linked
