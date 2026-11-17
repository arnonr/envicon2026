# Blind Multi-Round Review Design (Round 2, 3, 4, 5+)

**Date:** 2026-11-17  
**Status:** Draft (pending builder check & user approval)

## 1. Intent & Why

ระบบปัจจุบันรองรับการประเมินเพียง 2 รอบแบบตายตัวผ่าน `submissions.status` (`*_round1`, `*_round2`) และฝั่งผู้ทรงคุณวุฒิ (Reviewer) ยังไม่สามารถดาวน์โหลดไฟล์ผลงานได้เลย (เห็นเฉพาะข้อความบทคัดย่อบนหน้าเว็บ)

หัวหน้าทีมต้องการเปิดรอบประเมินที่ 2 โดยให้ประเมินจาก **เอกสารฉบับเต็ม (Full Paper)** แทนบทคัดย่อ และต้องทำ **Blind Review** โดยให้ Admin ดาวน์โหลดไฟล์ต้นฉบับไปลบชื่อและหน่วยงานของผู้ส่งผลงานออกก่อน แล้วอัปโหลดไฟล์ฉบับปิดบังตัวตนกลับเข้าระบบเพื่อให้ Reviewer ใช้ประเมิน รวมถึงรองรับการส่งกลับแก้ไข (Revise) และเปิดรอบประเมินที่ 3, 4, 5+ ต่อเนื่องไปได้โดยไม่จำกัดจำนวนรอบ

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- รองรับรอบการประเมินได้ไม่จำกัดจำนวนรอบ (Round 1, 2, 3, 4, 5+)
- ตอนสร้างรอบประเมิน Admin เลือกประเภทการประเมินของรอบนั้นได้ (`abstract` หรือ `full_paper`)
- บังคับให้รอบประเมินต้องมีไฟล์ Blind Review (`blindFileUrl`) ที่ Admin อัปโหลดไว้ก่อน จึงจะส่งงานให้ Reviewer ได้
- Reviewer ดาวน์โหลดเฉพาะไฟล์ Blind Review ของรอบนั้นได้ผ่าน endpoint ที่ตรวจสิทธิ์ โดยไม่เห็นข้อมูลผู้แต่งและไฟล์ต้นฉบับ
- แสดงสถานะผลงานคู่กับเลขรอบแบบไดนามิก (เช่น `อยู่ระหว่างประเมิน (รอบ 3)`, `ส่งกลับแก้ไข (รอบ 2)`)
- Admin สร้างรอบถัดไปได้ทันทีเมื่อไม่มีรอบที่กำลังเปิดอยู่ โดยไม่บังคับว่าต้องรอผู้เขียนอัปโหลดไฟล์ใหม่ก่อน

### Non-Goals
- ไม่สร้างระบบลบชื่อ/หน่วยงานในไฟล์ PDF/Word แบบอัตโนมัติ (Admin ดาวน์โหลดไปลบเองแล้วอัปโหลดกลับ)
- ไม่แยกแบบฟอร์ม/เกณฑ์การให้คะแนนระหว่างรอบบทคัดย่อกับรอบฉบับเต็ม (ใช้ฟอร์มประเมินเดิม: `accept` / `revise` / `reject` + `commentsToAuthor`)
- ไม่เปลี่ยนระบบการชำระเงิน (`paymentStatus` ยังแยกอิสระจากสถานะการประเมินตามเดิม)

### Anti-Goals
- ไฟล์ต้นฉบับที่มีชื่อผู้แต่ง/หน่วยงานหลุดไปถึง Reviewer (ทั้งทาง API response และปุ่มดาวน์โหลด)
- ข้อมูลเก่าในฐานข้อมูล (ผลงานที่อยู่ใน `*_round1` หรือ `*_round2`) พังหรือหายหลังปรับสถานะ

## 3. Constraints

- **Stack:** Backend ใช้ Elysia.js (Bun) + Drizzle ORM + MySQL 8; Frontend ใช้ Nuxt 3 + Vue 3 + `@nuxt/ui` + Tailwind CSS 3
- **Existing File Serving:** ปัจจุบัน `backend/src/index.ts` เสิร์ฟไฟล์จาก `uploads/` ผ่าน `/files/:filename` ดังนั้น API ของ Reviewer ต้องไม่คืน URL/filename ของไฟล์ต้นฉบับ และต้องเสิร์ฟไฟล์ Blind ผ่าน endpoint ที่มี Auth check (`GET /reviews/:id/file`)
- **No Test Framework:** โปรเจกต์ไม่มี test suite อัตโนมัติ (ตาม `CLAUDE.md`) การตรวจสอบใช้ TypeScript check / build และ manual flow verification

## 4. Approaches Considered

### แนวทางที่ 1: ปรับ `submissions.status` ให้เป็นกลาง + เก็บ `currentRound` และ `blindFileUrl` ที่ระดับรอบ *(ที่เลือก)*
- แยกสถานะ (`draft`, `submitted`, `under_review`, `accepted`, `revision_requested`, `rejected`) ออกจากเลขรอบ (`submissions.currentRound`)
- เก็บ `reviewType` (`abstract` | `full_paper`) และ `blindFileUrl` ไว้ที่ `review_rounds`
- **ข้อดี:** รองรับรอบ 3, 4, 5+ ได้ตรงตามความจริง ไม่มีหนี้เทคนิค ฟิลเตอร์และรายงานในอนาคตตรงไปตรงมา
- **ข้อเสีย:** ต้องทำ DB migration แปลงค่า `submissions.status` เดิมใน MySQL และอัปเดตจุดเช็กสถานะใน backend/frontend

### แนวทางที่ 2: คง `submissions.status` เดิม (`*_round1`, `*_round2`) แล้วใช้ `*_round2` ซ้ำในรอบ 3+
- **ข้อดี:** ไม่ต้อง migrate enum ของ `submissions.status` เดิม
- **ข้อเสีย:** ชื่อสถานะใน DB ขัดกับเลขรอบจริง (เช่น อยู่รอบ 4 แต่สถานะเป็น `under_review_round2`) ทำให้สับสนเวลาฟิลเตอร์และดูแลต่อยาก

**การตัดสินใจ:** เลือก **แนวทางที่ 1**

## 5. Architecture & Detailed Design

### 5.1 Database Schema & Migration (`backend/src/db/schema.ts`)

1. **`submissions` table:**
   - เพิ่มคอลัมน์ `currentRound: int("current_round").notNull().default(0)` (0 = draft, 1+ = รอบปัจจุบัน)
   - ปรับ enum `status` เป็น:
     `"draft" | "submitted" | "under_review" | "accepted" | "revision_requested" | "rejected"`
2. **`review_rounds` table:**
   - เพิ่มคอลัมน์ `reviewType: mysqlEnum("review_type", ["abstract", "full_paper"]).notNull().default("abstract")`
   - เพิ่มคอลัมน์ `blindFileUrl: varchar("blind_file_url", { length: 500 })`
3. **Data Migration (สำหรับข้อมูลเดิมใน MySQL):**
   - `draft` -> `status = "draft"`, `current_round = 0`
   - `submitted_round1` -> `status = "submitted"`, `current_round = 1`
   - `under_review_round1` -> `status = "under_review"`, `current_round = 1`
   - `passed_round1` -> `status = "accepted"`, `current_round = 1`
   - `passed_round1_with_revisions` -> `status = "revision_requested"`, `current_round = 1`
   - `rejected_round1` -> `status = "rejected"`, `current_round = 1`
   - `submitted_round2` -> `status = "submitted"`, `current_round = 2`
   - `under_review_round2` -> `status = "under_review"`, `current_round = 2`
   - `passed_round2` -> `status = "accepted"`, `current_round = 2`
   - `passed_round2_with_revisions` -> `status = "revision_requested"`, `current_round = 2`
   - `rejected_round2` -> `status = "rejected"`, `current_round = 2`

### 5.2 Status Lifecycle & Dynamic Labels (`submission-status.ts`)

- **Backend (`backend/src/utils/submission-status.ts`) & Frontend (`frontend/utils/submission-status.ts`):**
  - `canEdit(status)`: `draft` | `revision_requested`
  - `canRevise(status)`: `revision_requested`
  - `canCameraReady(status)`: `accepted`
  - `canReplaceFile(status)`: `submitted`
  - `canUpdateFiles(status)`: `status !== "rejected"`
  - `statusAfterSendReview()` -> `"under_review"`
  - `statusAfterDecision(decision)`:
    - `"accept"` -> `"accepted"`
    - `"reject"` -> `"rejected"`
    - `"revise"` -> `"revision_requested"`
  - `statusAfterFileUpload(currentStatus, hasUploadedFullPaper, latestReleasedReviewType)`:
    - `"draft"` -> `"submitted"` (และตั้ง `currentRound = 1`)
    - `"revision_requested"` -> `"submitted"` (คง `currentRound` เดิมจนกว่า Admin จะสร้างรอบใหม่)
    - `"accepted"` และ `hasUploadedFullPaper` และ `latestReleasedReviewType === "abstract"` -> `"submitted"` (ผู้เขียนส่งฉบับเต็มหลังผ่านรอบบทคัดย่อ)
    - `"accepted"` เมื่อ `latestReleasedReviewType === "full_paper"` -> คง `"accepted"` ไว้ (เป็นการอัปโหลดไฟล์ camera-ready หลังผ่านรอบฉบับเต็มแล้ว ไม่ย้อนสถานะกลับเป็น `submitted`) *(หมายเหตุ: เป็นการตัดสินใจของผู้ออกแบบเพื่อแยกผ่านบทคัดย่อกับผ่านฉบับเต็มอย่างชัดเจน)*
  - **Dynamic Label Helper:** `getStatusLabel(status, currentRound)` เช่น:
    - `draft` -> `"ฉบับร่าง"`
    - `submitted` -> `รอส่งประเมิน (รอบ ${round})`
    - `under_review` -> `อยู่ระหว่างประเมิน (รอบ ${round})`
    - `accepted` -> `ผ่านการพิจารณา (รอบ ${round})`
    - `revision_requested` -> `ส่งกลับแก้ไข (รอบ ${round})`
    - `rejected` -> `ไม่ผ่านการพิจารณา (รอบ ${round})`

### 5.3 Multi-Round Creation & Blind File Workflow (`backend/src/routes/admin-reviews.ts`)

1. **สร้างรอบประเมิน (`POST /admin/submissions/:id/review-rounds`):**
   - Body: `{ reviewType: "abstract" | "full_paper" }` (ค่า default `"abstract"` ถ้าเป็นรอบ 1 หรือให้ Admin เลือกเสมอ)
   - เงื่อนไข:
     - `submission.status !== "draft"` และ `submission.status !== "rejected"`
     - ไม่มี `review_rounds` ที่ `status !== "released"` ค้างอยู่ (409 Conflict)
     - **ไม่บังคับ** ต้องรอให้ผู้เขียนอัปโหลดไฟล์ใหม่ก่อน (Admin สร้างรอบ 2, 3, 4, 5+ ต่อได้ทันทีตราบใดที่รอบก่อนหน้า `released` แล้ว และไม่ใช่ `rejected`)
   - เมื่อสร้างสำเร็จ:
     - คำนวณ `nextRound = (latest?.roundNumber ?? 0) + 1`
     - เรียก `ensureCurrentSubmissionVersion(submission)` เพื่อ snapshot เวอร์ชันล่าสุดเข้า `review_rounds.submissionVersionId`
     - อัปเดต `submissions.currentRound = nextRound` (ถ้า `submission.status` เดิมเป็น `accepted` หรือ `revision_requested` ปรับเป็น `submitted` เพื่อให้เห็นว่ากำลังเตรียมส่งรอบใหม่)

2. **อัปโหลดไฟล์ Blind Review (`POST /admin/review-rounds/:roundId/blind-file`):**
   - รับไฟล์ (PDF หรือ Word เช่นเดียวกับไฟล์ผลงาน, max 50 MB)
   - อนุญาตให้อัปโหลด/เปลี่ยนไฟล์ Blind ได้ตราบใดที่ `round.status !== "released"`
   - บันทึกไฟล์ผ่าน `saveFile(file, "blind-r" + round.roundNumber + "-" + round.submissionId)` และเก็บ URL ลง `review_rounds.blindFileUrl`

3. **ส่งงานให้ Reviewer (`POST /admin/reviews/:id/send`):**
   - **บังคับ:** ตรวจสอบ `round.blindFileUrl` และ `storedFileExists(round.blindFileUrl)` ถ้าไม่มี ให้คืน `400 VALIDATION_ERROR` (เช่น `"กรุณาอัปโหลดไฟล์ Blind Review สำหรับรอบนี้ก่อนส่งงานให้ผู้ทรงคุณวุฒิ"`)
   - เมื่อส่งสำเร็จ: อัปเดต `review_rounds.status = "in_review"` และ `submissions.status = "under_review"`

4. **ตัดสินและปล่อยผล (`POST /admin/review-rounds/:roundId/decision` และ `/release`):**
   - ใช้ `statusAfterDecision(round.decision)` อัปเดต `submissions.status` โดยคง `submissions.currentRound = round.roundNumber`
   - รองรับรอบ 1, 2, 3, 4, 5+ เหมือนกันทุกรอบ

### 5.4 Reviewer Access & Blind File Download (`backend/src/routes/reviews.ts`)

- `GET /reviews/:id` และ `GET /reviews` (รายการงาน):
  - คืน `roundNumber`, `reviewType` (`"abstract" | "full_paper"`), และ `hasBlindFile: Boolean(round.blindFileUrl)`
  - ลบฟิลด์ข้อมูลผู้แต่ง (`authorName`, `authorEmail`, `authorAffiliation`, `creators`, `paymentStatus`) และลบ URL ไฟล์ต้นฉบับทั้งหมดออกเหมือนเดิม
  - ยังคงแสดง `title`, `titleEn`, `abstract`, `keywords`, `track`, `presentationFormat` ตามปกติ
- `GET /reviews/:id/file`:
  - ตรวจสิทธิ์ JWT: เฉพาะ Reviewer เจ้าของงาน (`review.reviewerId === currentUser.id` และ `review.status !== "assigned"`) หรือ Admin เท่านั้น
  - อ่านไฟล์จาก `round.blindFileUrl` (ถ้าไม่มีคืน 404) และส่งไฟล์กลับพร้อม header `Content-Disposition` โดยไม่เปิดเผยชื่อไฟล์/URL ต้นฉบับ

### 5.5 Frontend Changes

1. **Admin (`frontend/components/admin/SubmissionDetailModal.vue`, `frontend/pages/admin/index.vue`):**
   - ปุ่ม "สร้างรอบประเมิน" มีตัวเลือกประเภทการประเมิน (`บทคัดย่อ` / `ฉบับเต็ม`)
   - ในการ์ดรอบประเมินปัจจุบัน แสดงประเภทการประเมินของรอบ + ส่วนอัปโหลด/ดู/เปลี่ยน **ไฟล์ Blind Review ประจำรอบ**
   - ถ้ายังไม่อัปโหลดไฟล์ Blind ปุ่ม "ส่งงานให้ผู้ทรงคุณวุฒิ" แสดงคำเตือน/ป้องกันไม่ให้ส่ง
   - แสดงป้ายสถานะคู่กับ `currentRound` แบบไดนามิก และอัปเดตตัวเลือก filter สถานะในหน้า `/admin` ให้ตรงกับ enum ใหม่
2. **Reviewer (`frontend/pages/reviewer/reviews/[id].vue`, `frontend/pages/reviewer/index.vue`):**
   - แสดงป้ายประเภทการประเมินของรอบ (`ประเมินบทคัดย่อ` หรือ `ประเมินฉบับเต็ม`)
   - แสดงปุ่ม **"ดาวน์โหลดเอกสารสำหรับประเมิน (Blind Review)"** ที่เรียก `GET /reviews/:id/file` พร้อม Authorization header แล้วดาวน์โหลด/เปิดไฟล์
   - คงฟอร์มประเมินเดิม (`accept` / `revise` / `reject` + `commentsToAuthor`)
3. **Author (`frontend/pages/dashboard/index.vue`, `frontend/components/submission/SubmissionDetailModal.vue`, `frontend/pages/submissions/[id]/revise.vue`):**
   - แสดงสถานะคู่กับ `currentRound` แบบไดนามิก
   - เปิดให้ส่งไฟล์แก้ไขได้ทุกครั้งที่ `status === "revision_requested"` ไม่ว่าอยู่รอบที่เท่าไร
   - เมื่อ `status === "accepted"`: เช็ก `reviewType` ของรอบล่าสุดที่ `released` แล้ว — ถ้าเป็น `"abstract"` แสดงแบนเนอร์/ปุ่มให้อัปโหลดฉบับเต็มเพื่อเข้ารอบถัดไป; ถ้าเป็น `"full_paper"` แสดงสถานะผ่านการพิจารณาฉบับเต็ม (อัปโหลด camera-ready ได้โดยสถานะยังคงเป็น `accepted`)

## 6. Left to the Builder

- รูปแบบ UI ของตัวเลือก `reviewType` (radio/select) และช่องอัปโหลด `blindFileUrl` ใน `AdminSubmissionDetailModal`
- การจัดการ filename / MIME type header ของ `GET /reviews/:id/file` ให้รองรับทั้ง `.pdf`, `.doc`, `.docx`
- การอัปเดต type definition / Eden Treaty types และข้อความแจ้งเตือนภาษาไทยให้สอดคล้องกับหน้าเดิม
