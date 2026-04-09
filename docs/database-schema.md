# Database Schema — ENVICON 2026

## ER Diagram (Mermaid)

```mermaid
erDiagram
    users ||--o{ submissions : "author_id"
    users ||--o{ reviews : "reviewer_id"
    users ||--o{ reviewer_assignments : "reviewer_id"
    users ||--o{ registrations : "user_id"
    users ||--o{ registrations : "confirmed_by"
    submissions ||--o{ reviews : "submission_id"
    submissions ||--o{ revisions : "submission_id"

    users {
        varchar(36) id PK
        varchar(255) email UK
        varchar(255) password_hash
        varchar(255) name
        varchar(500) affiliation
        enum role "author | reviewer | admin"
        varchar(50) oauth_provider
        varchar(255) oauth_id
        timestamp created_at
        timestamp updated_at
    }

    submissions {
        varchar(36) id PK
        varchar(36) author_id FK
        varchar(500) title
        text abstract
        varchar(500) keywords
        int track
        enum status "draft | submitted | under_review | accepted | rejected | revision_requested"
        varchar(500) abstract_file_url
        varchar(500) full_paper_file_url
        timestamp submitted_at
        timestamp updated_at
    }

    reviews {
        varchar(36) id PK
        varchar(36) submission_id FK
        varchar(36) reviewer_id FK
        int score
        enum recommendation "accept | reject | revise"
        text comments_to_author
        text comments_to_editor
        enum status "pending | completed"
        timestamp assigned_at
        timestamp completed_at
    }

    reviewer_assignments {
        int id PK "auto_increment"
        varchar(36) reviewer_id FK
        int track
        int max_papers "default: 5"
    }

    registrations {
        varchar(36) id PK
        varchar(36) user_id FK
        enum type "student | general"
        enum payment_status "pending | confirmed"
        varchar(36) confirmed_by FK
        timestamp registered_at
    }

    revisions {
        varchar(36) id PK
        varchar(36) submission_id FK
        int version
        varchar(500) file_url
        text changelog
        timestamp submitted_at
    }
```

## สรุปตาราง

| ตาราง | PK | คำอธิบาย |
|---|---|---|
| `users` | UUID (varchar 36) | ผู้ใช้ทุก role (author, reviewer, admin) |
| `submissions` | UUID | บทความที่ส่ง — มี lifecycle: draft -> submitted -> under_review -> accepted/rejected/revision_requested |
| `reviews` | UUID | ผลการ review แต่ละครั้ง (double-blind) |
| `reviewer_assignments` | auto_increment int | กำหนด track และจำนวน paper สูงสุดต่อ reviewer |
| `registrations` | UUID | การลงทะเบียนเข้าร่วมงาน พร้อมสถานะชำระเงิน |
| `revisions` | UUID | ประวัติเวอร์ชันไฟล์ของแต่ละ submission |

## ความสัมพันธ์ (Foreign Keys)

| FK Column | From Table | To Table | ความหมาย |
|---|---|---|---|
| `author_id` | submissions | users | ผู้เขียนบทความ |
| `submission_id` | reviews | submissions | บทความที่ถูก review |
| `reviewer_id` | reviews | users | ผู้ review |
| `reviewer_id` | reviewer_assignments | users | ผู้ review ที่ถูกมอบหมาย track |
| `user_id` | registrations | users | ผู้ลงทะเบียน |
| `confirmed_by` | registrations | users | admin ที่ยืนยันการชำระเงิน |
| `submission_id` | revisions | submissions | บทความที่มีการแก้ไข |
