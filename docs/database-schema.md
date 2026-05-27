# Database Schema — ENVICON 2026

## ER Diagram (Mermaid)

```mermaid
erDiagram
    users ||--o{ submissions : "author_id"
    users ||--o{ reviews : "reviewer_id"
    users ||--|| reviewer_profiles : "user_id"
    users ||--o{ reviewer_expertise_tracks : "reviewer_id"
    users ||--o{ password_setup_tokens : "user_id"
    users ||--o{ registrations : "user_id"
    users ||--o{ registrations : "confirmed_by"
    submissions ||--o{ review_rounds : "submission_id"
    review_rounds ||--o{ reviews : "round_id"
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
        varchar(36) round_id FK
        varchar(36) reviewer_id FK
        int score
        enum recommendation "accept | reject | revise"
        text comments_to_author
        text comments_to_editor
        enum status "assigned | sent | in_progress | completed"
        timestamp due_at
        timestamp sent_at
        timestamp assigned_at
        timestamp completed_at
    }

    review_rounds {
        varchar(36) id PK
        varchar(36) submission_id FK
        int round_number
        enum status "assigning | in_review | ready_for_decision | released"
        enum decision "accept | reject | revise"
        text admin_note
        timestamp decided_at
        timestamp released_at
    }

    reviewer_profiles {
        varchar(36) user_id PK
        int max_concurrent_reviews
        int active
    }

    reviewer_expertise_tracks {
        int id PK
        varchar(36) reviewer_id FK
        int track
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
| `review_rounds` | UUID | รอบพิจารณาและผลตัดสินที่ admin เผยแพร่แก่ผู้ส่ง |
| `reviews` | UUID | งานประเมินราย reviewer ในแต่ละรอบ (single-blind) |
| `reviewer_profiles` | user UUID | สถานะ active และ capacity ของ reviewer |
| `reviewer_expertise_tracks` | auto_increment int | สาขาความเชี่ยวชาญหลายค่าในแต่ละ reviewer |
| `password_setup_tokens` | UUID | invitation token แบบ hash สำหรับตั้งรหัสผ่าน |
| `email_notifications` | UUID | audit/retry ของ invitation, assignment และผลตัดสิน |
| `registrations` | UUID | การลงทะเบียนเข้าร่วมงาน พร้อมสถานะชำระเงิน |
| `revisions` | UUID | ประวัติเวอร์ชันไฟล์ของแต่ละ submission |

## ความสัมพันธ์ (Foreign Keys)

| FK Column | From Table | To Table | ความหมาย |
|---|---|---|---|
| `author_id` | submissions | users | ผู้เขียนบทความ |
| `submission_id` | review_rounds | submissions | บทความในรอบพิจารณา |
| `round_id` | reviews | review_rounds | รอบของ assignment/result |
| `reviewer_id` | reviews | users | ผู้ review |
| `user_id` | reviewer_profiles | users | profile ของ reviewer |
| `reviewer_id` | reviewer_expertise_tracks | users | สาขาความเชี่ยวชาญของ reviewer |
| `user_id` | registrations | users | ผู้ลงทะเบียน |
| `confirmed_by` | registrations | users | admin ที่ยืนยันการชำระเงิน |
| `submission_id` | revisions | submissions | บทความที่มีการแก้ไข |
