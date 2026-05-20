# Submission Detail Modal — Design Spec

Date: 2026-05-20

## Goal

Replace navigation to `/submissions/[id]` with a modal overlay on the dashboard. Make submission list items clearly clickable.

## Scope

1. **Dashboard list**: improve visual affordance of clickable submission items
2. **Modal**: full submission detail in a single-scroll modal (~600px wide)
3. **Actions in modal**: upload full paper in modal; submit revision navigates to `/submissions/[id]/revise`

## Section 1: Dashboard List Affordance

**Current**: flat `<li>` with `<NuxtLink>` on title text only. No visual clue that item is interactive.

**New**:

- Wrap each submission in a bordered card (`border`, `border-gray-200`, `rounded-lg`)
- Add chevron icon `i-heroicons-chevron-right` on the right side
- Hover state: border changes to `border-primary-300`, light shadow (`shadow-sm`), title color to `text-primary-600`, background `bg-primary-50/50`
- `cursor-pointer` on the whole row
- Click handler opens modal instead of `<NuxtLink>`

### Changes to `frontend/pages/dashboard/index.vue`

- Add `selectedSubmissionId` ref
- Add `modalOpen` ref
- Replace `<NuxtLink>` with a `<div>` with click handler that sets `selectedSubmissionId` and opens modal
- Add `<UModal>` component containing `SubmissionDetailModal`

## Section 2: Modal Component

### New component: `frontend/components/submission/SubmissionDetailModal.vue`

**Props**: `modelValue` (boolean, v-model for open/close), `submissionId` (string)

**Uses UModal from @nuxt/ui** with these settings:
- `ui="{ width: 'sm:max-w-2xl' }"` (~600px)
- `prevent-close: false` (click backdrop or Esc to close)

### Layout (top to bottom, single scroll)

**Header**:
- Title (bold, text-lg)
- TitleEn (if exists, text-sm text-gray-500)
- Status badge (right side)
- Close button ✕

**Body** (scrollable, max-height ~70vh):
1. **Info grid** (2 columns): track, submitted date
2. **Keywords** (if exists): tag-style chips
3. **Abstract** (if exists): text block
4. **Divider**
5. **Files**: abstract download, full paper download (or "no file" label)
6. **Upload zone** (if status=accepted and no full paper): `CommonFileUpload` component
7. **Revision warning** (if status=revision_requested): orange banner with message + "ส่งผลงานที่แก้ไข" button
8. **Revision history** (if revisions exist): list of version + date + download

**Footer**: "ปิด" button

### Data fetching

- On open, fetch `/api/submissions/${submissionId}` (same endpoint as current `[id].vue`)
- Loading spinner while fetching
- Error state if fetch fails

### Actions

- **Upload full paper**: POST to `/api/submissions/${id}/upload-paper`, then refetch
- **Submit revision**: navigates to `/submissions/${id}/revise` (separate page, out of scope for modal — this is a multi-step form)

## Section 3: File Changes Summary

| File | Action |
|------|--------|
| `frontend/pages/dashboard/index.vue` | Modify: replace NuxtLink with click handler, add UModal |
| `frontend/components/submission/SubmissionDetailModal.vue` | Create: new modal component |
| `frontend/pages/submissions/[id].vue` | Keep: still accessible via direct URL for deep linking |

## Out of Scope

- Revision submission form (stays on `/submissions/[id]/revise`)
- Admin/reviewer views
- Deleting submissions
