# Admin Submission Update Notifications — Design Spec

Date: 2026-11-03

## Intent & Why

เพิ่มระบบแจ้งเตือนในหน้าจัดการผลงานของผู้ดูแลระบบ (`/admin` — `frontend/pages/admin/index.vue`) เพื่อให้ Admin ทราบได้ทันทีเมื่อผู้ส่งผลงานอัปเดตไฟล์บทคัดย่อ (PDF/Word), ไฟล์บทความฉบับสมบูรณ์ (Full Paper PDF/Word) หรือแก้ไขข้อมูล/ข้อความบทคัดย่อหลังจากส่งผลงานครั้งแรกแล้ว โดยไม่ต้องไล่กดเปิดดูทีละผลงาน

## Size

**A small change** — เพิ่มคอลัมน์ติดตามการอัปเดตและสถานะการเปิดดูในตาราง `submissions` เดิม พร้อมปรับ API ฝั่ง Backend และตารางหน้า `/admin` ฝั่ง Frontend โดยไม่ต้องสร้างตารางใหม่หรือระบบแจ้งเตือนภายนอก

## Goals, Non-Goals, Anti-Goals

- **Goals:**
  - บันทึกและแสดงสถานะว่าผลงานใดมีการอัปเดตจากผู้ส่งหลังจากส่งผลงานครั้งแรกแล้ว (`status !== "draft"` ตอนเริ่มแก้ไข หรือเป็นการอัปโหลดซ้ำ/ส่งฉบับแก้ไข)
  - แสดงปุ่มกรองด่วน **"มีอัปเดตใหม่ (N)"** บนแถบตัวกรองในหน้า `/admin` เพื่อให้กดดูเฉพาะผลงานที่เพิ่งอัปเดตและยังไม่ได้เปิดอ่านได้ในคลิกเดียว
  - แสดงป้ายกำกับ (Badge) ในแถวตารางใต้ชื่อผลงานว่าอัปเดตอะไรและเมื่อไหร่ (เช่น *"อัปเดตไฟล์ฉบับสมบูรณ์ (PDF, Word)"*, *"แก้ไขข้อมูล/บทคัดย่อ"*) พร้อมเน้นปุ่มลิงก์ไฟล์ (`PDF` / `Word`) ในคอลัมน์ที่เพิ่งเปลี่ยน
  - เคลียร์สถานะแจ้งเตือนอัตโนมัติเมื่อ Admin กดเปิดดูรายละเอียดผลงานนั้นใน `AdminSubmissionDetailModal.vue` (`GET /submissions/:id`)
- **Non-Goals:**
  - ไม่ส่งอีเมลหรือแจ้งเตือนออกนอกหน้าเว็บ Admin
  - ไม่สร้างกล่อง Activity Feed แยกด้านบนตารางหรือกระดิ่งแจ้งเตือนแยกบน Header
- **Anti-Goals:**
  - ห้ามแจ้งเตือนตอนผู้ส่งยังอยู่ในสถานะร่าง (`draft`) หรือตอนส่งผลงานครั้งแรกสุด (`draft -> submitted_round1`)
  - ห้ามแจ้งเตือนเมื่อผู้ดูแลระบบเป็นคนแก้ไขหรือจัดการไฟล์เองผ่าน `POST /admin/submissions/:id/files`
  - ห้ามทำให้รายการช่องไฟล์ที่เปลี่ยนก่อนหน้าหายไป यदिผู้ส่งทยอยอัปเดตหลายครั้งติดต่อกันก่อนที่ Admin จะมาเปิดดู

## Constraints

- ตารางหน้า `/admin` ใช้ Server-side Pagination (`50` รายการต่อหน้า) ดังนั้นตัวกรอง *"มีอัปเดตใหม่"* และการนับจำนวนรายการที่ยังไม่ได้ดูทั้งหมด (`unreadUpdateCount`) ต้องประมวลผลใน SQL ฝั่ง Backend (`backend/src/routes/admin.ts` และ `backend/src/utils/admin-submission-filters.ts`)
- เงื่อนไขตัวกรองใน `frontend/utils/admin-submission-filters.ts` และ `backend/src/utils/admin-submission-filters.ts` ต้องทำงานร่วมกับตัวกรองเดิมและปุ่ม `Export Excel` ได้อย่างถูกต้อง

## Approaches Considered

### UX/UI Approaches
1. **Option A (Chosen): ป้ายกำกับในตาราง + ปุ่มกรองด่วน "มีอัปเดตใหม่" (In-Table Badges + Quick Filter)**
   - ไฮไลต์แถวที่มีการอัปเดตในตารางโดยตรง แสดงป้ายสรุปสิ่งที่เปลี่ยนใต้ชื่อเรื่อง ไฮไลต์ปุ่มไฟล์ที่เพิ่งอัปเดต และมีปุ่มกรองด่วนบนแถบค้นหา
   - *Trade-off:* ไม่เพิ่มกล่องกินพื้นที่ด้านบนตาราง เช็กและกรองงานในตารางได้ทันที แต่เมื่อกดเปิดอ่านแล้วป้ายจะหายไป
2. **Option B: กล่องแจ้งเตือนด้านบนหน้าแอดมิน (Top Activity Banner)**
   - *Trade-off:* เห็นรายการแยกด้านบนชัดเจน แต่กินพื้นที่แนวตั้งเหนือตาราง
3. **Option C: ผสมผสาน (In-Table Badges + Quick Filter + กระดิ่งดูประวัติย้อนหลัง)**
   - *Trade-off:* ดูประวัติย้อนหลังได้แม้กดอ่านไปแล้ว แต่มีองค์ประกอบ UI เพิ่มขึ้นเกินความจำเป็นของ Admin

### Backend Data Model Approaches
1. **Approach 1 (Chosen): เก็บสถานะการอัปเดตล่าสุดไว้ที่ตาราง `submissions` โดยตรง (`authorUpdatedAt`, `authorUpdateSummary`, `authorUpdatedSlots`, `adminSeenAt`)**
   - บันทึกเวลา สรุปสิ่งที่เปลี่ยน และรายการช่องที่ถูกแก้ไขลงใน `submissions` ทุกครั้งที่ผู้ส่งแก้ไขหลังส่งครั้งแรก และอัปเดต `adminSeenAt` เมื่อ Admin เปิดดู
   - *Trade-off:* เพิ่ม 4 คอลัมน์ในตาราง `submissions` แต่ทำให้การกรอง/นับจำนวนใน SQL เร็วและสะอาดมาก รองรับการสะสมรายการแก้ไขหลายครั้งก่อน Admin เปิดดูได้ครบถ้วน
2. **Approach 2: เก็บเฉพาะ `adminSeenAt` แล้วคำนวณสดจาก `submission_versions`**
   - *Trade-off:* เพิ่มคอลัมน์ใน `submissions` น้อยกว่า แต่ Query ซับซ้อนกว่ามาก และปัจจุบัน `PUT /submissions/:id` ไม่ได้สร้าง `submission_versions` รวมถึงไม่ได้แยกแยะผู้แก้ไข (ผู้ส่ง vs Admin)

ผู้ใช้งานเลือก **UX Option A** คู่กับ **Backend Approach 1** เพื่อความกระชับ ใช้งานง่ายในตารางเดิม และทำงานได้รวดเร็ว

## Decisions (What Gets Built)

### 1. โครงสร้างฐานข้อมูล (`backend/src/db/schema.ts`)
เพิ่มคอลัมน์ในตาราง `submissions`:
- `authorUpdatedAt`: `timestamp("author_updated_at")` (nullable) — เวลาล่าสุดที่ผู้ส่งอัปเดตไฟล์หรือข้อมูลหลังส่งผลงานครั้งแรก
- `authorUpdateSummary`: `varchar("author_update_summary", { length: 500 })` (nullable) — ข้อความสรุปสิ่งที่เปลี่ยนสำหรับแสดงในป้ายแจ้งเตือน
- `authorUpdatedSlots`: `varchar("author_updated_slots", { length: 255 })` (nullable) — JSON array ของคีย์ที่เปลี่ยนตั้งแต่ Admin เปิดดูครั้งล่าสุด (`"abstractPdf"`, `"abstractWord"`, `"fullPaperPdf"`, `"fullPaperWord"`, `"metadata"`)
- `adminSeenAt`: `timestamp("admin_seen_at")` (nullable) — เวลาล่าสุดที่ Admin เปิดดูรายละเอียดผลงาน

### 2. การดักจับการอัปเดตจากผู้ส่ง (`backend/src/routes/submissions.ts` & `backend/src/utils/submission-files.ts`)
- ดักจับเฉพาะเมื่อสถานะก่อนแก้ไข **ไม่ใช่ `"draft"`** (กล่าวคือ ส่งผลงานรอบแรกไปแล้ว):
  - `POST /submissions/:id/upload-files`: บันทึกช่องไฟล์ที่ผู้ส่งเพิ่งอัปโหลด (`abstractPdf`, `abstractWord`, `fullPaperPdf`, `fullPaperWord`)
  - `POST /submissions/:id/upload-paper`: บันทึกการอัปโหลด `fullPaperPdf`
  - `POST /submissions/:id/revise`: บันทึกช่องไฟล์ที่อัปโหลดใหม่ (หรือหากส่งแก้ไขโดยไม่แนบไฟล์ใหม่ ให้บันทึก `"metadata"`)
  - `POST /submissions/:id/revisions/latest/replace-file`: บันทึกการอัปเดต `fullPaperPdf`
  - `PUT /submissions/:id`: เมื่อสถานะไม่ใช่ `"draft"` และมีการเปลี่ยนแปลงข้อมูลจริง (เช่น ชื่อเรื่อง, บทคัดย่อ, คำสำคัญ, ผู้แต่งร่วม ฯลฯ) ให้บันทึก `"metadata"` พร้อมสร้าง snapshot ลง `submission_versions` เพื่อให้หน้าเปรียบเทียบใน Modal แสดงผลตรงกัน
- **การสะสมรายการที่เปลี่ยน (Accumulation before seen):** หากผลงานนั้นมีสถานะยังไม่ได้เปิดดู (`authorUpdatedAt > adminSeenAt`) แล้วผู้ส่งอัปเดตซ้ำอีกครั้ง ระบบจะนำรายการใน `authorUpdatedSlots` เดิมมารวม (union) กับช่องที่เปลี่ยนใหม่ แล้วสร้างข้อความ `authorUpdateSummary` ใหม่ให้ครอบคลุมทั้งหมด แต่ถ้า Admin เคยเปิดดูไปแล้ว (`adminSeenAt >= authorUpdatedAt`) จะเริ่มนับเฉพาะสิ่งที่เปลี่ยนในรอบใหม่ทันที

### 3. การเคลียร์สถานะเมื่อ Admin เปิดดู (`backend/src/routes/submissions.ts`)
- ใน `GET /submissions/:id` เมื่อ `user.role === "admin"`:
  - คำนวณสถานะ `hasUnreadUpdate`, `authorUpdatedAt`, `authorUpdateSummary`, `authorUpdatedSlots` ส่งกลับไปให้ `AdminSubmissionDetailModal.vue` ใช้แสดงผลในรอบที่เปิดอยู่นั้นได้ด้วย
  - อัปเดต `submissions.adminSeenAt = new Date()` ในฐานข้อมูลทันที เพื่อเคลียร์สถานะแจ้งเตือนในตาราง

### 4. การดึงข้อมูล กรอง และแสดงผลในหน้า `/admin` (`backend/src/routes/admin.ts`, `frontend/pages/admin/index.vue`)
- `GET /admin/submissions`:
  - รองรับ query parameter `hasUnreadUpdate=1` ใน `buildAdminSubmissionWhere` (`authorUpdatedAt IS NOT NULL AND (adminSeenAt IS NULL OR authorUpdatedAt > adminSeenAt)`)
  - คำนวณ `unreadUpdateCount` (จำนวนผลงานทั้งหมดที่มีอัปเดตใหม่ยังไม่ได้ดูในระบบ) แนบกลับไปใน `meta` ของ response
  - ในแต่ละแถว ส่ง `hasUnreadUpdate: boolean`, `authorUpdatedAt`, `authorUpdateSummary`, `authorUpdatedSlots: string[]`
- หน้าตาราง `frontend/pages/admin/index.vue`:
  - แสดงปุ่มกรองด่วน **"มีอัปเดตใหม่ (N)"** บนแถบตัวกรอง (แสดงตัวเลข `unreadUpdateCount` และสามารถกดสลับเปิด/ปิดตัวกรอง `hasUnreadUpdate` ได้)
  - แถวที่มี `hasUnreadUpdate === true`:
    - ไฮไลต์พื้นหลังสีเหลืองอ่อน (`bg-amber-50/40`) และเส้นขอบซ้ายสีเหลืองอำพัน (`border-l-4 border-l-amber-400`)
    - ใต้ชื่อผลงาน แสดงป้ายกำกับระบุ `authorUpdateSummary` และเวลาที่อัปเดต
    - ในคอลัมน์ **"ไฟล์บทคัดย่อ"** และ **"ไฟล์ฉบับสมบูรณ์"** หากช่องไฟล์นั้นอยู่ใน `authorUpdatedSlots` ให้แสดงป้ายเน้นว่าเป็นไฟล์ที่เพิ่งอัปเดตใหม่
  - เมื่อ Admin คลิกชื่อผลงานเพื่อเปิด `AdminSubmissionDetailModal` ให้เคลียร์สถานะ `hasUnreadUpdate` ของแถวนั้นในตารางและลดตัวนับ `unreadUpdateCount` ทันทีโดยไม่ต้องรอรีเฟรชทั้งหน้า

## Left to the Builder (Default Calls)

- สร้างฟังก์ชันช่วยจัดการใน `backend/src/utils/submission-files.ts` (เช่น `computeAuthorUpdateTracking`) เพื่อรวมศูนย์การรวม `authorUpdatedSlots` และการสร้างข้อความภาษาไทยของ `authorUpdateSummary` (เช่น *"อัปเดตไฟล์บทคัดย่อ (PDF), ฉบับสมบูรณ์ (Word)"* หรือ *"แก้ไขข้อมูล/บทคัดย่อ"*)
- ใน `AdminSubmissionDetailModal.vue` หากเปิดเข้ามาในจังหวะที่ผลงานมี `hasUnreadUpdate` ให้แสดงแบนเนอร์เล็กๆ ด้านบน Modal บอกว่าผู้ส่งเพิ่งอัปเดตอะไรมาเมื่อไหร่ เพื่อให้ Admin เห็นจุดที่เปลี่ยนได้ทันทีแม้ตัวแจ้งเตือนในตารางจะถูกเคลียร์ไปแล้ว
