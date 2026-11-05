# Admin Reviewers Excel Export — Design Spec

**Date:** 2026-11-05
**Topic:** ระบบดาวน์โหลดไฟล์ Excel รายชื่อผู้ประเมิน (Reviewers) และสถานะงานที่ประเมิน

---

## 1. Intent & Why

ผู้ดูแลระบบ (Admin) ต้องการดาวน์โหลดข้อมูลผู้รีวิว (Reviewers) ออกมาเป็นไฟล์ Excel เพื่อสรุปภาระงานและติดตามสถานะการประเมินบทความของแต่ละท่าน โดยต้องการทราบชื่อ, นามสกุล, ต้นสังกัด, จำนวนงานที่ประเมิน, รายชื่องานที่ประเมินแล้ว (คั่นด้วยคอมม่า) และรายชื่องานที่ยังไม่ได้ประเมิน

---

## 2. Goals, Non-Goals, Anti-Goals

### Goals
- สร้าง API Endpoint `GET /envicon2026/api/admin/reviewers/export` สำหรับสร้างไฟล์ `.xlsx` ด้วย `ExcelJS`
- แสดงคอลัมน์ครบถ้วน: ลำดับ, ชื่อ, นามสกุล, ต้นสังกัด, อีเมล, จำนวนงานที่ประเมินทั้งหมด, จำนวนงานที่ประเมินแล้ว, จำนวนงานที่ยังไม่ประเมิน, รายชื่องานที่ประเมินแล้ว (คั่นด้วย `, `), และรายชื่องานที่ยังไม่ประเมิน (คั่นด้วย `, `)
- เพิ่มปุ่ม **"Export Excel"** บนหน้า `/admin/reviewers` (`frontend/pages/admin/reviewers.vue`)

### Non-Goals
- ไม่แก้ไขโครงสร้างตารางฐานข้อมูล (`users`, `reviewer_profiles`, `reviews`, `submissions`)
- ไม่เปลี่ยนแปลงการทำงานของการเพิ่ม/แก้ไขผู้รีวิวเดิม

### Anti-Goals
- ไม่ให้ผู้ใช้งานที่ไม่ได้เป็น Admin เรียกใช้งาน Endpoint นี้ได้ (ป้องกันด้วย `requireAdmin`)

---

## 3. Constraints

- ใช้ไลบรารี `exceljs` ที่มีอยู่ใน `backend/package.json`
- รูปแบบตาราง Excel ใช้มาตรฐานเดียวกับ `/admin/submissions/export` และ `/admin/registrations/export` (แถวหัวตารางสีเขียว `#047857` ตัวอักษรสีขาว ตัวหนา, Freeze แถวแรก, เปิด AutoFilter และ Wrap Text)
- การแยกชื่อและนามสกุลจาก `users.name`: แยกด้วยช่องว่างสุดท้าย (คำหลังสุดเป็น `นามสกุล` และส่วนหน้าทั้งหมดรวมคำนำหน้าทางวิชาการเป็น `ชื่อ` หากไม่มีช่องว่างให้ใส่ในช่อง `ชื่อ` ทั้งหมด)

---

## 4. Approaches Considered

- **แนวทาง A (เลือกโดยผู้ใช้): สร้าง Backend Endpoint `GET /admin/reviewers/export` ด้วย `ExcelJS` + ปุ่มดาวน์โหลดบนหน้า `/admin/reviewers`**
  - *ข้อดี:* ดึงชื่อบทความจากตาราง `submissions` ได้โดยตรงในคราวเดียว จัดรูปแบบ `.xlsx` ได้มาตรฐานเดียวกับระบบเดิมทั้งหมด
- **แนวทาง B: สร้างไฟล์จากฝั่ง Frontend**
  - *ข้อเสีย:* ข้อมูลในหน้า `/admin/reviewers` เดิมไม่มีชื่อบทความ ต้องแก้ Backend เพิ่มอยู่ดี

---

## 5. Details of What Gets Built

### 5.1 Backend (`backend/src/routes/admin-reviews.ts`)
- เพิ่ม Route `GET /reviewers/export` ภายใต้ `adminReviewRoutes` (มี prefix `/admin` และ `requireAdmin` อยู่แล้ว)
- ดึงข้อมูลผู้รีวิวจาก `reviewerProfiles` innerJoin `users` เรียงตาม `users.name`
- ดึงรายการรีวิวทั้งหมดของผู้รีวิวจาก `reviews` innerJoin `submissions` (ดึง `reviewerId`, `status`, `submissionTitle: submissions.title`)
- แยกกลุ่มงานของแต่ละผู้รีวิว:
  - **ประเมินแล้ว (`status === "completed"`):** นับจำนวน และนำชื่อบทความมาต่อกันด้วย `", "`
  - **ยังไม่ประเมิน (`status !== "completed"`):** นับจำนวน และนำชื่อบทความมาต่อกันด้วย `", "`
- สร้างไฟล์ Excel ชื่อแผ่นงาน `"ผู้รีวิว"` และส่งกลับเป็น二进制 Buffer พร้อม Header `Content-Disposition: attachment; filename="envicon-reviewers-YYYY-MM-DD.xlsx"`

### 5.2 Frontend (`frontend/pages/admin/reviewers.vue`)
- เพิ่ม state `const exporting = ref(false)`
- เพิ่มฟังก์ชัน `exportReviewers()` เรียก `$fetch<Blob>(`${apiBase}/admin/reviewers/export`, { headers: headers.value, responseType: "blob" })` แล้วสั่งดาวน์โหลดไฟล์ `envicon-reviewers-YYYY-MM-DD.xlsx`
- เพิ่มปุ่ม `Export Excel` (`icon="i-heroicons-arrow-down-tray"`, `color="emerald"`, `variant="soft"`) บริเวณส่วนหัวของหน้าคู่กับปุ่ม "กลับแผงผู้ดูแล"
