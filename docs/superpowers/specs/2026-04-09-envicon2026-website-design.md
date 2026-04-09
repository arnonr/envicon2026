# ENVICON 2026 — Conference Website Design Spec

## Context

The 5th National Conference of the Thai Association of Higher Education Environmental Institutions (ENVICON 2026) needs a website that serves two purposes: (1) promote the event and provide information to potential attendees, and (2) manage the full paper submission and peer review workflow. The event is scheduled for 12-13 November 2569 (2026) at KMUTNB Technopark. The website will be hosted at `technopark.kmutnb.ac.th/envicon2026`.

## Theme & Branding

- **Theme**: "Innovative Environmental Technologies for a Sustainable and Low-Carbon Future"
- **Colors**: Green (#059669), Blue (#0284c7), White — representing environment and clean technology
- **Visual style**: Modern scroll-based landing page with gradient accents, stat counters, and parallax-lite sections
- **Visuals**: Icons related to CO2 reduction, smart monitoring, circular economy

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Nuxt 3 (SSR) + Tailwind CSS + Nuxt UI |
| Backend | Elysia.js (Bun runtime) |
| ORM | Drizzle ORM |
| Database | MySQL 8 |
| Auth | Email + Password + OAuth (Google, GitHub) — 3 roles: author, reviewer, admin |
| Type Safety | Eden Treaty (Nuxt ↔ Elysia end-to-end types) |
| File Storage | Local disk (`/uploads/`) |
| State Management | Pinia |
| Deployment | Docker Compose (Nuxt + Elysia + MySQL + Nginx) on university server |

## Architecture

```
Nginx (reverse proxy + SSL)
├── /envicon2026/*        → Nuxt 3 (SSR)
└── /envicon2026/api/*    → Elysia.js (Bun)
                               └── MySQL 8 (Drizzle ORM)
                               └── /uploads/ (file storage)
```

- Nginx handles SSL termination and routes traffic
- Nuxt runs in SSR mode for SEO on public pages
- Elysia.js serves the REST API on a separate port
- Eden Treaty provides end-to-end type safety between frontend and backend

## Database Schema

### users
- id (UUID PK), email, password_hash, name, affiliation
- role: `author` | `reviewer` | `admin`
- oauth_provider, oauth_id (nullable)
- created_at, updated_at

### submissions
- id (UUID PK), author_id → users
- title, abstract, keywords, track (1-7)
- status: `draft` | `submitted` | `under_review` | `accepted` | `rejected` | `revision_requested`
- abstract_file_url, full_paper_file_url (nullable)
- submitted_at, updated_at

### reviews
- id (UUID PK), submission_id → submissions, reviewer_id → users
- score (1-5), recommendation: `accept` | `reject` | `revise`
- comments_to_author, comments_to_editor
- status: `pending` | `completed`
- assigned_at, completed_at

### reviewer_assignments
- id (PK), reviewer_id → users, track (expertise area), max_papers

### registrations
- id (UUID PK), user_id → users
- type: `student` | `general`
- payment_status: `pending` | `confirmed`
- confirmed_by → users (admin who confirmed)
- registered_at

### revisions
- id (UUID PK), submission_id → submissions
- version (int), file_url, changelog
- submitted_at

## Peer Review Workflow

1. **Author submits abstract** (1 Apr – 30 Sep 2569)
2. **Admin reviews abstract** → accept or reject (announced 7 Oct)
3. **Author submits full paper** (7–24 Oct 2569)
4. **Admin assigns reviewers** based on track expertise
5. **Reviewers review paper** — score (1-5) + recommendation + comments
6. **Admin makes decision** based on review scores: accept, reject, or request revision
7. **Author submits revision** if requested (loop back to step 5)
8. **Program announced** (31 Oct 2569)

**Double-blind review**: Reviewers cannot see author identity; authors cannot see reviewer identity. Admin can see all.

## Site Map

### Public Pages (no login required)
- `/` — Homepage (Modern Scroll Landing)
- `/about` — About the conference and association
- `/tracks` — 7 presentation tracks with descriptions
- `/important-dates` — Key dates timeline
- `/registration` — Registration info and fees
- `/venue` — Venue info + map (KMUTNB Technopark)
- `/keynote-speakers` — Keynote speaker profiles
- `/program` — Presentation program (published 31 Oct)
- `/guidelines` — Paper writing guidelines + templates
- `/contact` — Contact information
- `/auth/login` — Login / Register page

### Author Dashboard (role: author)
- `/dashboard` — Overview of own submissions
- `/submit` — Submit abstract or full paper
- `/submissions/:id` — View submission status + review feedback
- `/submissions/:id/revise` — Submit revised version

### Reviewer Dashboard (role: reviewer)
- `/reviewer` — List of assigned papers to review
- `/reviewer/:id` — Read paper + submit review (score, comments)
- `/reviewer/history` — Past reviews

### Admin Dashboard (role: admin)
- `/admin` — Overview dashboard with stats
- `/admin/submissions` — Manage all submissions, filter by status/track
- `/admin/reviewers` — Manage reviewers, assign papers to reviewers
- `/admin/registrations` — Manage registrations, confirm payments
- `/admin/users` — User management
- `/admin/settings` — System settings (deadlines, tracks, email templates)

## Homepage Design (Modern Scroll Landing — Option C)

- **Sticky navbar**: Logo left, CTA buttons (ส่งผลงาน, ลงทะเบียน) right, green accent border
- **Hero section**: Centered text, gradient text for title, clean typography
- **Stats counters**: Date (12-13), Tracks (7), Days (2) — colored cards with counters
- **CTA banner**: Gradient green-to-blue with deadline reminder + submit button
- **Tracks section**: Full-page scroll section with 7 track cards
- **Timeline section**: Horizontal timeline of important dates
- **Venue section**: Map + venue photo
- **Sponsors section**: Logo grid
- **Footer**: Contact info, quick links, social media

## Registration & Payment

- Registration through the website (form with user type selection)
- Payment is manual (on-site or bank transfer)
- Admin confirms payment manually through the admin dashboard
- Registration info displayed: Early Bird vs Regular rates, student vs general

## Email Notifications

Triggered on key events:
- Account registration confirmation
- Abstract submission received
- Abstract accepted/rejected
- Full paper submission received
- Review assigned to reviewer
- Review completed (notify admin)
- Decision sent to author (accept/reject/revise)
- Revision received

## Project Structure

```
envicon2026/
├── frontend/                    # Nuxt 3
│   ├── nuxt.config.ts
│   ├── app.vue
│   ├── pages/                   # File-based routing
│   ├── components/
│   │   ├── layout/              # Navbar, Footer, Sidebar
│   │   ├── home/                # Hero, Stats, Timeline, Tracks
│   │   ├── submission/          # SubmissionForm, StatusBadge
│   │   ├── review/              # ReviewForm, ScoreCard
│   │   └── common/              # FileUpload, DataTable
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useApi.ts            # Eden Treaty client
│   │   └── useSubmission.ts
│   ├── stores/                  # Pinia
│   │   ├── auth.ts
│   │   └── submission.ts
│   └── assets/css/main.css
│
├── backend/                     # Elysia.js (Bun)
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/              # auth, submissions, reviews, registrations, admin
│   │   ├── middleware/          # auth (JWT), roles (RBAC)
│   │   ├── db/                  # Drizzle schema, migrations, connection
│   │   ├── services/            # email, storage, review assignment
│   │   └── utils/               # validators (Elysia t.)
│   └── uploads/
│
├── docker-compose.yml
├── nginx.conf
└── .env.example
```

## Presentation Tracks

1. Environmental Science and Pollution Control
2. Ecosystem and Natural Resource Management
3. Circular Economy and Resource Efficiency
4. Climate Change and Low-Carbon Technology
5. Digital Technology and Intelligent Systems for Environmental Monitoring
6. Sustainable Cities, Green Industry, and Environmental Management
7. Environment and Health

## Registration Fees

| Category | Early Bird (before 14 Oct) | Regular |
|----------|---------------------------|---------|
| Student | 500 THB | 700 THB |
| General (Faculty/Researcher) | 2,000 THB | 2,500 THB |

## Key Dates

- Abstract submission: 1 Apr – 30 Sep 2569
- Abstract results: 7 Oct 2569
- Full paper submission: 7–24 Oct 2569
- Program announced: 31 Oct 2569
- Conference: 12–13 Nov 2569
