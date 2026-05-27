# Admin Submission Detail Modal

**Date:** 2026-05-27
**Status:** Approved

## Problem

Admin dashboard แสดงรายการผลงานแค่ตารางสรุป ไม่มีวิธีดูรายละเอียดผลงาน (บทคัดย่อ, ผู้แต่ง, ไฟล์, หลักฐานการชำระเงิน) ปุ่มจัดการสถานะอยู่ในตารางทำให้แถวกว้างและรก

## Solution

สร้าง `AdminSubmissionDetailModal` component ใหม่ คลิกชื่อผลงานในตารางเปิด modal แสดงข้อมูลครบ + ปุ่มจัดการสถานะ เอาปุ่ม action ออกจากตาราง

## Scope

### สร้างใหม่

- `frontend/components/admin/AdminSubmissionDetailModal.vue` — modal แสดงข้อมูลผลงาน + admin actions

### แก้ไข

- `frontend/pages/admin/index.vue` — คลิกชื่อผลงานเปิด modal, เอาคอลัมน์ "จัดการ" ออก

### ไม่แก้ (ใช้ของที่มี)

- `GET /api/submissions/:id` — รองรับ admin เข้าดูทุก submission แล้ว
- `PATCH /api/admin/submissions/:id/status` — status update endpoint มีอยู่แล้ว
- `SubmissionDetailModal.vue` (author) — ไม่กระทบ

## Admin Modal Content

### Header
- ชื่อผลงานภาษาไทย (h2)
- ชื่อผลงานภาษาอังกฤษ (subtitle)
- Status badge

### Info Section
- Track (หัวข้อ)
- ประเภทผู้ส่ง (นิสิต/นักศึกษา หรือ ทั่วไป)
- วันที่ส่ง
- Keywords (เป็น badge chips)

### Creators Section
- รายชื่อผู้แต่งร่วม (เป็น badge chips) — parse จาก JSON `creators` field

### Abstract Section
- ข้อความบทคัดย่อเต็ม

### Files Section
- Abstract PDF — ลิงก์ดาวน์โหลด
- Full Paper PDF — ลิงก์ดาวน์โหลด (ถ้ามี)

### Payment Evidence Section
- แสดง payment slip (รูป/ไฟล์) ถ้ามี
- คลิกเปิดดูขนาดเต็มใน nested modal
- แสดงเฉพาะเมื่อมี `paymentSlipUrl`

### Revision History
- รายการ revisions ถ้ามี (version, date, changelog, download link)

### Admin Actions (footer)
แสดงปุ่มตามสถานะปัจจุบัน:

| Status | Buttons |
|--------|---------|
| `payment_verifying` | "อนุมัติการชำระเงิน" → `submitted` |
| `submitted` | "ส่งพิจารณา" → `under_review` |
| `under_review` | "ผ่าน" → `accepted`, "ไม่ผ่าน" → `rejected`, "ขอแก้ไข" → `revision_requested` |
| อื่นๆ | ไม่แสดงปุ่ม |

หลังกดปุ่ม → เรียก `PATCH /api/admin/submissions/:id/status` → refresh ข้อมูลใน modal + แจ้งเตือนสำเร็จ

## Admin Table Changes

### Before
- 7 คอลัมน์: ผลงาน, ผู้ส่ง, หัวข้อ, ประเภท, สถานะ, จัดการ
- ชื่อผลงานเป็น text ธรรมดา
- คอลัมน์ "จัดการ" มีปุ่ม status action

### After
- 5 คอลัมน์: ผลงาน, ผู้ส่ง, หัวข้อ, ประเภท, สถานะ
- ชื่อผลงานเป็นลิงก์สี primary คลิกได้ เปิด modal
- คอลัมน์ "จัดการ" ถูกเอาออก

## Data Flow

```
คลิกชื่อผลงานในตาราง
  → admin/index.vue ส่ง submission.id ให้ modal
  → modal เรียก GET /api/submissions/:id
  → แสดงข้อมูลใน modal
  → admin กดปุ่ม action
  → modal เรียก PATCH /api/admin/submissions/:id/status
  → refresh ข้อมูล modal + emit event ให้ parent refresh ตาราง
```

## Technical Notes

- ใช้ `UModal` จาก @nuxt/ui (เหมือน `SubmissionDetailModal` เดิม)
- `fileLink()` helper จัดการ relative URL → full URL
- Parse `creators` จาก JSON string, `keywords` จาก comma-separated string
- Loading state ขณะ fetch ข้อมูล
- Error handling ด้วย `handleApiCall` pattern ที่มีอยู่
