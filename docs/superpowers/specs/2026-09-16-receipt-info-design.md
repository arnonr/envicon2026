# Receipt Information Design Specification

Date: 2026-09-16  
Status: Approved

---

## 1. Goal

เพิ่มการจัดเก็บและแสดงผลข้อมูลสำหรับออกใบเสร็จรับเงิน ได้แก่ **ชื่อสำหรับออกใบเสร็จ**, **เลขประจำตัวผู้เสียภาษี**, และ **ที่อยู่สำหรับออกใบเสร็จ** ครอบคลุมทั้ง 2 ระบบหลัก:
1. **ผู้ลงทะเบียนส่งผลงาน (Paper Submissions)**
2. **ผู้ลงทะเบียนเข้าร่วมงาน (Event Registrations)**

โดยอำนวยความสะดวกให้ผู้ใช้งานกรอกข้อมูลได้สะดวก ไม่ยุ่งยาก และให้ผู้ดูแลระบบ (Admin/ฝ่ายการเงิน) สามารถตรวจสอบและส่งออกข้อมูลเป็นไฟล์ Excel (.xlsx) เพื่อนำไปออกใบเสร็จได้อย่างครบถ้วน

---

## 2. Scope & Constraints

- **ฟิลด์ข้อมูลที่จัดเก็บ**:
  1. `receiptName` / `receipt_name`: ชื่อบุคคลธรรมดา หรือชื่อหน่วยงาน/องค์กร/บริษัท (จำเป็น)
  2. `receiptTaxId` / `receipt_tax_id`: เลขประจำตัวผู้เสียภาษีอากร 13 หลัก หรือเลขประจำตัวประชาชน (จำเป็น)
  3. `receiptAddress` / `receipt_address`: ที่อยู่สำหรับระบุในใบเสร็จรับเงิน (จำเป็น)
- **ข้อกำหนดเพิ่มเติม**:
  - *ไม่มีฟิลด์สาขา* (ตามที่ระบุ)
  - *ไม่มีตัวเลือกเปิด/ปิดการขอรับใบเสร็จ* (ทุกคนได้รับใบเสร็จ จึงบังคับระบุเมื่อถึงขั้นตอนชำระเงิน)
  - *ไม่มีการแยกประเภทบุคคล/นิติบุคคล* (ใช้ 3 ฟิลด์ทั่วไป รองรับทั้งชื่อบุคคลและชื่อหน่วยงาน)
  - *สำหรับผู้ส่งผลงาน*: กรอกในขั้นตอนอัปโหลดสลิปชำระเงินเท่านั้น โดยไม่รบกวนขั้นตอนส่งบทความวิจัยใน Step 1

---

## 3. Data Model & Database Schema

### 3.1 ตาราง `submissions` (`backend/src/db/schema.ts`)
เพิ่ม 3 คอลัมน์:
```ts
receiptName: varchar("receipt_name", { length: 255 }),
receiptTaxId: varchar("receipt_tax_id", { length: 20 }),
receiptAddress: text("receipt_address"),
```

### 3.2 ตาราง `event_registrations` (`backend/src/db/schema.ts`)
เพิ่ม 3 คอลัมน์:
```ts
receiptName: varchar("receipt_name", { length: 255 }),
receiptTaxId: varchar("receipt_tax_id", { length: 20 }),
receiptAddress: text("receipt_address"),
```

### 3.3 Database Migration
สร้าง Migration ผ่าน Drizzle Kit:
```sql
ALTER TABLE `submissions` ADD `receipt_name` varchar(255);
ALTER TABLE `submissions` ADD `receipt_tax_id` varchar(20);
ALTER TABLE `submissions` ADD `receipt_address` text;

ALTER TABLE `event_registrations` ADD `receipt_name` varchar(255);
ALTER TABLE `event_registrations` ADD `receipt_tax_id` varchar(20);
ALTER TABLE `event_registrations` ADD `receipt_address` text;
```

---

## 4. Backend API Specification

### 4.1 ผู้ลงทะเบียนเข้าร่วมงาน (`POST /envicon2026/api/public/register`)
- **Body validation (TypeBox)**:
  - `fullName`: `t.String({ minLength: 2, maxLength: 255 })`
  - `affiliation`: `t.Optional(t.String({ maxLength: 500 }))`
  - `phone`: `t.Optional(t.String({ maxLength: 20 }))`
  - `email`: `t.String({ format: "email", maxLength: 255 })`
  - `feeType`: `t.Union([t.Literal("student"), t.Literal("general")])`
  - `paymentSlip`: `t.Optional(t.File(...))`
  - `receiptName`: `t.String({ minLength: 1, maxLength: 255 })`
  - `receiptTaxId`: `t.String({ minLength: 1, maxLength: 20 })`
  - `receiptAddress`: `t.String({ minLength: 1 })`
- **Behavior**: บันทึกข้อมูลลงตาราง `event_registrations`

### 4.2 ผู้ส่งผลงานอัปโหลดสลิปชำระเงิน (`POST /envicon2026/api/submissions/:id/upload-slip`)
- **Body validation (TypeBox)**:
  - `file`: `t.File(...)`
  - `receiptName`: `t.String({ minLength: 1, maxLength: 255 })`
  - `receiptTaxId`: `t.String({ minLength: 1, maxLength: 20 })`
  - `receiptAddress`: `t.String({ minLength: 1 })`
- **Behavior**:
  - ตรวจสอบสิทธิ์ Author ของผลงาน
  - ตรวจสอบสถานะว่ายังไม่ได้ `verified`
  - บันทึกไฟล์สลิป ปรับ `paymentStatus = "pending_verification"` และบันทึก `receiptName`, `receiptTaxId`, `receiptAddress` ลงใน `submissions`

### 4.3 ดูรายละเอียดผลงาน (`GET /envicon2026/api/submissions/:id`)
- ส่งคืนข้อมูล `receiptName`, `receiptTaxId`, `receiptAddress` กลับไปด้วย (สำหรับ Author และ Admin)

### 4.4 ผู้ดูแลระบบดูรายชื่อผู้เข้าร่วมงาน (`GET /envicon2026/api/admin/registrations`)
- Select ข้อมูล `receiptName`, `receiptTaxId`, `receiptAddress` คืนกลับมาในรายการ

### 4.5 ส่งออก Excel สำหรับผลงาน (`GET /envicon2026/api/admin/submissions/export`)
- เพิ่มคอลัมน์ในไฟล์ Excel:
  - "ชื่อสำหรับออกใบเสร็จ" (`receiptName`)
  - "เลขประจำตัวผู้เสียภาษี" (`receiptTaxId`)
  - "ที่อยู่สำหรับออกใบเสร็จ" (`receiptAddress`)

### 4.6 ส่งออก Excel สำหรับผู้ลงทะเบียนเข้าร่วมงาน (`GET /envicon2026/api/admin/registrations/export`)
- สิทธิ์: Admin เท่านั้น
- สร้างไฟล์ `.xlsx` ด้วย ExcelJS ประกอบด้วยคอลัมน์:
  1. ลำดับ (Sequence)
  2. รหัสลงทะเบียน (ID)
  3. ชื่อ-นามสกุล (Full Name)
  4. สังกัด/หน่วยงาน (Affiliation)
  5. เบอร์โทรศัพท์ (Phone)
  6. อีเมล (Email)
  7. ประเภทผู้เข้าร่วม (Participant Type)
  8. ยอดค่าลงทะเบียน (Fee)
  9. สถานะการชำระเงิน (Payment Status)
  10. ลิงก์หลักฐานการชำระเงิน (Payment Slip Link)
  11. ชื่อสำหรับออกใบเสร็จ (Receipt Name)
  12. เลขประจำตัวผู้เสียภาษี (Receipt Tax ID)
  13. ที่อยู่สำหรับออกใบเสร็จ (Receipt Address)
  14. วันที่ลงทะเบียน (Registered At)

---

## 5. Frontend User Experience & UI

### 5.1 Modal ลงทะเบียนเข้าร่วมงาน (`RegistrationModal.vue`)
- เพิ่มส่วน "ข้อมูลสำหรับออกใบเสร็จรับเงิน (Receipt Information)":
  - ปุ่มตัวช่วย "ใช้ชื่อเดียวกับผู้ลงทะเบียน"
  - ช่องกรอก: ชื่อสำหรับออกใบเสร็จ (Required)
  - ช่องกรอก: เลขประจำตัวผู้เสียภาษี (Required, max 20)
  - ช่องกรอก: ที่อยู่สำหรับออกใบเสร็จ (Required, Textarea)
- แสดงข้อความ: "ใบเสร็จจะออกตามข้อมูลที่ท่านระบุไว้ด้านบน และรับได้ที่วันประชุม"

### 5.2 ฟอร์มส่งผลงานวิชาการ (`SubmissionForm.vue` & `submit/index.vue`)
- คงขั้นตอนส่งผลงานวิจัยใน Step 1 ให้เน้นเฉพาะข้อมูลผลงานวิชาการและผู้แต่งร่วม (ไม่บังคับกรอกข้อมูลใบเสร็จในขั้นตอนนี้)

### 5.3 Modal รายละเอียดและชำระเงินผลงาน (`SubmissionDetailModal.vue`)
- สถานะ `unpaid` / `rejected`: แสดงฟอร์มกรอกข้อมูลใบเสร็จรับเงินคู่กับช่องอัปโหลดสลิป
- สถานะ `pending_verification` / `verified`: แสดงการ์ดสรุปข้อมูลใบเสร็จรับเงินที่ได้บันทึกไว้

### 5.4 ผู้ดูแลระบบตรวจสอบผลงาน (`admin/SubmissionDetailModal.vue`)
- ในส่วนการชำระเงิน แสดงข้อมูลใบเสร็จรับเงิน (ชื่อ, เลขผู้เสียภาษี, ที่อยู่) ที่ผู้ส่งผลงานระบุไว้

### 5.5 ผู้ดูแลระบบจัดการผู้ลงทะเบียนเข้าร่วมงาน (`admin/registrations.vue`)
- เพิ่มคอลัมน์ "ข้อมูลใบเสร็จ" ในตารางแสดงข้อมูล
- เพิ่มปุ่ม "Export Excel" ที่แถบด้านบน เพื่อดาวน์โหลดรายชื่อพร้อมข้อมูลใบเสร็จทั้งหมด

---

## 6. Verification Plan

1. **Database**: ตรวจสอบการรัน migration คอลัมน์ใหม่ใน MySQL
2. **Backend**:
   - ตรวจสอบ TypeBox validation เมื่อส่งข้อมูลครบ/ไม่ครบ
   - ทดสอบ endpoint `GET /admin/registrations/export` ว่าดาวน์โหลดไฟล์ `.xlsx` ถูกต้อง
3. **Frontend**:
   - ทดสอบเปิด Modal ลงทะเบียนเข้าร่วมงาน กรอกข้อมูลใบเสร็จ และส่งข้อมูล
   - ทดสอบอัปโหลดสลิปผลงานพร้อมข้อมูลใบเสร็จ
   - ทดสอบหน้า Admin ทั้งสองหน้าว่าแสดงผลและกด Export Excel ได้ถูกต้อง
