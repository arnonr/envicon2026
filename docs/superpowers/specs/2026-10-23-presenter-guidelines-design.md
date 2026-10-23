# Presenter Guidelines Page & Navbar Grouping — Design Spec

Date: 2026-10-23

## Intent & Why

ลูกค้าต้องการเพิ่มหน้า **"คำแนะนำสำหรับผู้นำเสนอ" (Guidelines for Research Presenters)** สำหรับงาน TSHE-CON 2026 เพื่อให้ผู้เข้าร่วมนำเสนอผลงานทั้งแบบ Oral และ Poster ทราบระยะเวลาการนำเสนอ สัดส่วนเกณฑ์การพิจารณารางวัล และข้อปฏิบัติในการเตรียมตัว (มีทั้งภาษาไทยและภาษาอังกฤษ) พร้อมทั้งต้องการให้เห็นคำว่า **"คำแนะนำสำหรับผู้นำเสนอ"** บนแถบเมนูหลักโดยตรงโดยไม่ทำให้แถบเมนูที่แน่นอยู่แล้วล้นหรือตัดตกบรรทัด

## Goals, Non-Goals, Anti-Goals

- **Goals:**
  - สร้างหน้าใหม่ `/presenter-guidelines` (`frontend/pages/presenter-guidelines.vue`) แสดงรายละเอียด Oral Presentation และ Poster Presentation ครบถ้วนตามต้นฉบับทั้งภาษาไทยและอังกฤษ
  - แสดงเมนู **"คำแนะนำสำหรับผู้นำเสนอ"** บนแถบหลักของ `frontend/components/layout/Navbar.vue` อย่างชัดเจน
  - จัดกลุ่มเมนูข้อมูลทั่วไป (`เกี่ยวกับ`, `คณะกรรมการ`, `สนับสนุน`) เข้าไว้ใน Dropdown **"เกี่ยวกับงาน"** เพื่อคืนพื้นที่แนวนอนบน Navbar
- **Non-Goals:**
  - ไม่กระทบพาธ `/guidelines` เดิม (`frontend/pages/guidelines.vue`) ซึ่งปัจจุบันใช้แสดงหน้า **"ดาวน์โหลด"** เอกสารเทมเพลต
  - ไม่ต้องมีระบบหลังบ้าน (Backend API / Database) เนื่องจากเป็นข้อมูลประกาศคงที่
- **Anti-Goals:**
  - ห้ามทำให้เมนูบน Desktop Navbar ล้นหรือตัดตกเป็น 2 บรรทัดบนหน้าจอขนาด `md`/`lg`
  - ห้ามตัดทอนเนื้อหาเกณฑ์การให้คะแนนหรือคำแนะนำที่ลูกค้ากำหนดมาทั้งภาษาไทยและภาษาอังกฤษ

## Constraints

- พาธ `/guidelines` ถูกใช้งานโดยหน้า "ดาวน์โหลด" อยู่แล้ว จึงใช้พาธใหม่ `/presenter-guidelines` สำหรับหน้านี้
- ใช้ธีมสีของโปรเจกต์ (`meadow` / `primary` emerald และ `sky` accent) และฟอนต์ Sarabun ตามมาตรฐานของระบบ

## Approaches Considered

### 1. การจัดวางเมนูบน Navbar (`Navbar.vue`)
- **Option A (Chosen): จัดกลุ่มเมนูรองเป็น Dropdown "เกี่ยวกับงาน ▾" และวาง "คำแนะนำสำหรับผู้นำเสนอ" บนแถบหลัก**
  - *ข้อดี:* คำว่า "คำแนะนำสำหรับผู้นำเสนอ" ปรากฏเด่นชัดบนแถบหลักชั้นแรกตามความต้องการของลูกค้า โดยที่ความกว้างรวมของเมนูไม่ล้นหน้าจอโน้ตบุ๊ก
  - *ข้อเสีย:* เมนู `เกี่ยวกับ`, `คณะกรรมการ`, `สนับสนุน` ต้องคลิกเปิดผ่าน Dropdown 1 คลิก
- **Option B: คงทั้ง 9 เมนูในแถวเดียวแบบลดช่องไฟ (Compact)**
  - *ข้อเสีย:* ตัวหนังสือเล็กและเบียดกันมาก ต้องซ่อนเป็น Hamburger ตั้งแต่วิวพอร์ต `< 1280px`
- **Option C: แยก Navbar เป็น 2 แถว (Two-tier Header)**
  - *ข้อเสีย:* กินพื้นที่แนวตั้งของหน้าจอ (`sticky top-0`) มากขึ้นทุกหน้า

### 2. การจัดวางเนื้อหา 2 ภาษาในเพจใหม่ (`presenter-guidelines.vue`)
- **Option A (Chosen): สวิตช์สลับภาษา (`🇹🇭 ภาษาไทย` / `🇬🇧 English`) บนส่วนหัว + การ์ด Oral & Poster วางคู่กัน 2 คอลัมน์**
  - *ข้อดี:* หน้าเพจกระชับ อ่านง่าย เปรียบเทียบเวลาและเกณฑ์รางวัลของ Oral กับ Poster ได้ทันที และสลับดูภาษาไทย/อังกฤษได้ครบถ้วนตามต้นฉบับ
- **Option B: แสดงบล็อกภาษาไทยและภาษาอังกฤษเรียงต่อกันในหน้าเดียว**
  - *ข้อเสีย:* หน้าเว็บยาวเป็น 2 เท่าและมีโครงสร้างซ้ำกันด้านบน-ล่าง

## Decisions (What Gets Built)

### 1. โครงสร้างเมนูใน `frontend/components/layout/Navbar.vue`
- **Desktop Navbar:**
  1. `หน้าแรก` (`/`)
  2. `เกี่ยวกับงาน ▾` (Dropdown menu — ไฮไลต์เป็น active เมื่ออยู่ในพาธลูก):
     - `เกี่ยวกับการประชุม` (`/about`)
     - `คณะกรรมการ` (`/committee`)
     - `ผู้สนับสนุน` (`/sponsorship`)
  3. `กำหนดการ` (`/important-dates`)
  4. `คำแนะนำสำหรับผู้นำเสนอ` (`/presenter-guidelines`)
  5. `ดาวน์โหลด` (`/guidelines`)
  6. `ลงทะเบียน` (`/registration`)
  7. `ติดต่อ` (`/contact`)
- **Mobile Navbar:** แสดงรายการเมนูทั้งหมดเรียงลงมา (หรือแบ่งกลุ่มย่อยให้อ่านง่าย) พร้อมลิงก์ไป `/presenter-guidelines`

### 2. โครงสร้างหน้า `frontend/pages/presenter-guidelines.vue`
- **Hero Section (`bg-meadow-950 text-white` สไตล์เดียวกับ `guidelines.vue`):**
  - ป้ายกำกับ `TSHE-CON 2026`
  - หัวข้อหลักและคำโปรยตามภาษาที่เลือก (`lang = ref<'th' | 'en'>('th')`)
  - ปุ่มสลับภาษา `🇹🇭 ภาษาไทย` / `🇬🇧 English` มุมขวาบนของส่วนหัว
- **Cards Section (Grid 2 คอลัมน์บน `lg:grid-cols-2`, 1 คอลัมน์บนมือถือ):**
  - **การ์ดที่ 1: Oral Presentation** (ธีมสี `emerald`/`meadow`)
    - **ระยะเวลา:** รวม 15 นาทีต่อผลงาน (นำเสนอ 10 นาที / ตอบคำถาม 5 นาที) พร้อมหลอดสัดส่วนเวลา
    - **เกณฑ์การพิจารณารางวัล:**
      1. ระเบียบวิธีวิจัย (Research methodology): **30%**
      2. ผลกระทบของงานวิจัยต่อเศรษฐกิจ สังคม สิ่งแวดล้อม และนโยบาย (Research impact on the economy, society, the environment, and policy): **20%**
      3. คุณภาพของสื่อการนำเสนอ (Quality of presentation materials): **10%**
      4. การนำเสนอผลงานวิจัย (Research presentation and delivery): **30%**
      5. การตอบคำถาม (Responses to questions): **10%**
    - **คำแนะนำสำหรับผู้นำเสนอ (Guidelines for Presenters):** ครบทั้ง 5 ข้อตามต้นฉบับ (TH/EN)
  - **การ์ดที่ 2: Poster Presentation** (ธีมสี `sky`/`accent`)
    - **ระยะเวลา:** รวม 15 นาทีต่อผลงาน (นำเสนอ 8 นาที / ตอบคำถาม 7 นาที) พร้อมหลอดสัดส่วนเวลา
    - **เกณฑ์การพิจารณารางวัล:**
      1. ระเบียบวิธีวิจัย (Research methodology): **30%**
      2. ผลกระทบของงานวิจัยต่อเศรษฐกิจ สังคม สิ่งแวดล้อม และนโยบาย (Research impact on the economy, society, the environment, and policy): **20%**
      3. คุณภาพของโปสเตอร์ (Poster quality): **20%**
      4. การนำเสนอผลงานวิจัย (Research presentation and delivery): **15%**
      5. การตอบคำถาม (Responses to questions): **15%**
    - **คำแนะนำสำหรับผู้นำเสนอ (Guidelines for Presenters):** ครบทั้ง 5 ข้อตามต้นฉบับ (TH/EN)
- **Closing Callout Box ด้านล่าง:**
  - แสดงข้อความสรุปท้ายประกาศตามภาษาที่เลือก (TH/EN)

## Left to the Builder (Default Calls)

- เพิ่มลิงก์ `คำแนะนำสำหรับผู้นำเสนอ` (`/presenter-guidelines`) ในส่วน "ลิงก์ด่วน" ของ `frontend/components/layout/Footer.vue` เพื่อให้เข้าถึงได้จากส่วนท้ายเว็บด้วย
- ใช้ `@nuxt/ui` (`UDropdown` หรือ custom hover/click popover ที่เข้ากับดีไซน์ Tailwind ของ `Navbar.vue`) สำหรับเมนู `เกี่ยวกับงาน ▾`
