# API Specification — ENVICON 2026

**Base URL**: `/envicon2026/api`  
**Auth**: Bearer JWT token ใน header `Authorization: Bearer <token>`  
**Response format**: `{ success: true, data: {...} }` หรือ `{ success: false, error: { code, message } }`

---

## Auth (`/auth`)

| Method | Path | Auth | Body / Params | Response | คำอธิบาย |
|---|---|---|---|---|---|
| POST | `/auth/register` | - | `{ email, password, name, affiliation? }` | `{ token, user }` | สมัครสมาชิก (default role: author) |
| POST | `/auth/login` | - | `{ email, password }` | `{ token, user }` | เข้าสู่ระบบ |
| POST | `/auth/forgot-password` | - | `{ email }` | `{ sent }` | ขออีเมลตั้งรหัสผ่านใหม่ โดยตอบข้อความกลางเสมอ |
| GET | `/auth/setup-password/:token` | - | - | `{ name, email }` | ตรวจ token สำหรับ invitation/reset password |
| POST | `/auth/setup-password` | - | `{ token, password }` | `{ ready }` | ตั้งรหัสผ่านครั้งแรกหรือตั้งรหัสผ่านใหม่ |
| GET | `/auth/me` | Required | - | `{ user }` | ดึงข้อมูลผู้ใช้ปัจจุบัน |

### Validation
- `email`: format email
- `password`: minLength 8
- `name`: minLength 1

---

## Submissions (`/submissions`)

| Method | Path | Auth | Role | Body / Params | Response | คำอธิบาย |
|---|---|---|---|---|---|---|
| GET | `/submissions` | Required | author | query: `?status=` | `{ submissions[] }` | รายการบทความของผู้ใช้ |
| GET | `/submissions/:id` | Required | author | - | `{ submission }` | รายละเอียดบทความ |
| POST | `/submissions` | Required | author | `{ title, abstract, keywords, track }` | `{ submission }` | สร้างบทความใหม่ (status: draft) |
| PUT | `/submissions/:id` | Required | author | `{ title?, abstract?, keywords?, track? }` | `{ submission }` | แก้ไขบทความ (เฉพาะ draft/revision_requested) |
| POST | `/submissions/:id/submit` | Required | author | - | `{ submission }` | ส่งบทความ (draft -> submitted) |
| POST | `/submissions/:id/upload-abstract` | Required | author | `file` (multipart, PDF) | `{ fileUrl }` | อัปโหลดไฟล์ abstract |
| POST | `/submissions/:id/upload-fullpaper` | Required | author | `file` (multipart, PDF) | `{ fileUrl }` | อัปโหลดไฟล์ full paper |

---

## Revisions (`/submissions/:id/revisions`)

| Method | Path | Auth | Role | Body / Params | Response | คำอธิบาย |
|---|---|---|---|---|---|---|
| GET | `/submissions/:id/revisions` | Required | author | - | `{ revisions[] }` | ประวัติเวอร์ชันของบทความ |
| POST | `/submissions/:id/revisions` | Required | author | `{ file (multipart), changelog }` | `{ revision }` | ส่ง revision ใหม่ |

---

## Reviews (`/reviews`)

| Method | Path | Auth | Role | Body / Params | Response | คำอธิบาย |
|---|---|---|---|---|---|---|
| GET | `/reviews` | Required | reviewer | - | `{ reviews[] }` | รายการ review ที่ได้รับมอบหมาย |
| GET | `/reviews/:id` | Required | reviewer/admin | - | `{ review, submission, author }` | รายละเอียด review แบบ single-blind; ไม่คืนหลักฐานชำระเงิน |
| PUT | `/reviews/:id/draft` | Required | reviewer | `{ score?, recommendation?, commentsToAuthor?, commentsToEditor? }` | `{ review }` | บันทึกร่าง (`sent` -> `in_progress`) |
| POST | `/reviews/:id/submit` | Required | reviewer | `{ score, recommendation, commentsToAuthor, commentsToEditor? }` | `{ review }` | ส่งผลสุดท้ายและล็อกการแก้ไข |

### Review Fields
- `score`: int (1-5)
- `recommendation`: "accept" | "reject" | "revise"
- `commentsToAuthor`: text (ผู้เขียนเห็น)
- `commentsToEditor`: text (เฉพาะ admin เห็น)

Reviewer เห็นข้อมูลผู้ส่งตามนโยบาย single-blind ส่วนเจ้าของผลงานเห็น `commentsToAuthor` แบบไม่ระบุชื่อหลัง admin กด release เท่านั้น

---

## Admin (`/admin`)

| Method | Path | Auth | Role | Body / Params | Response | คำอธิบาย |
|---|---|---|---|---|---|---|
| GET | `/admin/stats` | Required | admin | - | `{ totalSubmissions, byStatus, totalUsers, totalRegistrations }` | สถิติรวม |
| GET | `/admin/submissions` | Required | admin | query: `?status=&track=` | `{ submissions[] }` | รายการบทความทั้งหมด |
| PUT | `/admin/submissions/:id/status` | Required | admin | `{ status }` | `{ submission }` | เปลี่ยนสถานะบทความ |
| GET | `/admin/submissions/:id/review-workflow` | Required | admin | - | `{ round, assignments, reviewers }` | สถานะรอบพิจารณาและ reviewer ที่เลือกได้ |
| POST | `/admin/submissions/:id/review-rounds` | Required | admin | - | `{ round }` | เริ่มรอบพิจารณาใหม่ |
| POST | `/admin/review-rounds/:id/assignments` | Required | admin | `{ reviewerIds[] }` | `{ reviews[] }` | เพิ่ม reviewer ในรอบ |
| DELETE | `/admin/reviews/:id` | Required | admin | - | `{ message }` | ถอด assignment ที่ยังไม่ส่ง |
| POST | `/admin/reviews/:id/send` | Required | admin | `{ dueAt }` | `{ review }` | ส่งอีเมลมอบหมายรายบุคคล |
| PATCH | `/admin/review-rounds/:roundId/decision` | Required | admin | `{ decision, adminNote? }` | `{ round }` | บันทึกผลเมื่อ review ที่ส่งครบแล้ว |
| POST | `/admin/review-rounds/:roundId/release` | Required | admin | - | `{ round, notificationStatus }` | แจ้งผลแก่เจ้าของและเปลี่ยนสถานะผลงาน |
| GET | `/admin/reviewers` | Required | admin | - | `{ reviewers[] }` | รายชื่อ reviewer ทั้งหมด |
| POST | `/admin/reviewers` | Required | admin | `{ name, email, affiliation?, tracks[], maxConcurrentReviews }` | `{ reviewer }` | สร้าง reviewer และส่ง invitation |
| PATCH | `/admin/reviewers/:id` | Required | admin | `{ name?, affiliation?, tracks?, maxConcurrentReviews?, active? }` | `{ reviewer }` | แก้ reviewer profile |
| POST | `/admin/reviewers/:id/resend-invitation` | Required | admin | - | `{ notificationStatus }` | ออก invitation token ใหม่ |
| GET | `/admin/registrations` | Required | admin | query: `?paymentStatus=` | `{ registrations[] }` | รายการลงทะเบียนทั้งหมด |
| PUT | `/admin/registrations/:id/confirm` | Required | admin | - | `{ registration }` | ยืนยันการชำระเงิน |

---

## Registrations (`/registrations`)

| Method | Path | Auth | Role | Body / Params | Response | คำอธิบาย |
|---|---|---|---|---|---|---|
| GET | `/registrations` | Required | any | - | `{ registration }` | ดูสถานะการลงทะเบียนของตนเอง |
| POST | `/registrations` | Required | any | `{ type }` | `{ registration }` | ลงทะเบียนเข้าร่วมงาน |

### Registration Types
- `student` — นักศึกษา
- `general` — บุคคลทั่วไป

---

## Health Check

| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/health` | - | `{ status: "ok" }` |

---

## Error Codes

| HTTP Status | Code | ความหมาย |
|---|---|---|
| 400 | `BAD_REQUEST` | ข้อมูลไม่ถูกต้อง |
| 401 | `UNAUTHORIZED` | ไม่ได้เข้าสู่ระบบ หรือ token หมดอายุ |
| 403 | `FORBIDDEN` | ไม่มีสิทธิ์เข้าถึง |
| 404 | `NOT_FOUND` | ไม่พบข้อมูล |
| 409 | `CONFLICT` | ข้อมูลซ้ำ (เช่น email ซ้ำ) |
| 500 | `INTERNAL_ERROR` | ข้อผิดพลาดภายในระบบ |
