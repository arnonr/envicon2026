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
| GET | `/reviews/:id` | Required | reviewer | - | `{ review, submission (no author info) }` | รายละเอียด review (double-blind) |
| PUT | `/reviews/:id` | Required | reviewer | `{ score, recommendation, commentsToAuthor, commentsToEditor? }` | `{ review }` | ส่งผล review (pending -> completed) |

### Review Fields
- `score`: int (1-10)
- `recommendation`: "accept" | "reject" | "revise"
- `commentsToAuthor`: text (ผู้เขียนเห็น)
- `commentsToEditor`: text (เฉพาะ admin เห็น)

---

## Admin (`/admin`)

| Method | Path | Auth | Role | Body / Params | Response | คำอธิบาย |
|---|---|---|---|---|---|---|
| GET | `/admin/stats` | Required | admin | - | `{ totalSubmissions, byStatus, totalUsers, totalRegistrations }` | สถิติรวม |
| GET | `/admin/submissions` | Required | admin | query: `?status=&track=` | `{ submissions[] }` | รายการบทความทั้งหมด |
| PUT | `/admin/submissions/:id/status` | Required | admin | `{ status }` | `{ submission }` | เปลี่ยนสถานะบทความ |
| POST | `/admin/submissions/:id/assign-reviewer` | Required | admin | `{ reviewerId }` | `{ review }` | มอบหมาย reviewer |
| GET | `/admin/reviewers` | Required | admin | - | `{ reviewers[] }` | รายชื่อ reviewer ทั้งหมด |
| POST | `/admin/reviewers/assignments` | Required | admin | `{ reviewerId, track, maxPapers? }` | `{ assignment }` | กำหนด track ให้ reviewer |
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
