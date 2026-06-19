# Committee Page — Design Spec

Date: 2026-06-19

## Goal

Add a public-facing `/committee` page that lists all members of the conference organizing committee, grouped by their committee role. Add a corresponding "คณะกรรมการ" entry to the main navbar so the page is discoverable from any other public page.

## Scope

1. New page `frontend/pages/committee.vue` — single page with 5 sections, one per committee group
2. Add navbar link "คณะกรรมการ" → `/committee` in `frontend/components/layout/Navbar.vue`
3. All committee data lives inline in the page component (no backend, no API)
4. Visual: person cards with initials avatar, academic title, and affiliation

Out of scope: backend storage, search/filter, photos, individual member detail pages, multi-language toggle.

## Data Shape

All data is declared inline in `<script setup lang="ts">` as a typed const:

```ts
interface Member {
  prefix: string   // academic rank + "ดร." (e.g. "รองศาสตราจารย์ ดร.", "ผู้ช่วยศาสตราจารย์ ดร.", "ดร.", "นางสาว")
  firstName: string
  lastName: string
  affiliation: string
}

interface CommitteeGroup {
  id: string       // stable id for v-for key
  title: string    // Thai title
  titleEn: string  // English title
  icon: string     // Heroicon name (e.g. "i-heroicons-user-group")
  members: Member[]
}

const committees: CommitteeGroup[] = [ /* 5 groups */ ]
```

Members are de-duplicated by full name within a group. The same person can appear in multiple groups (this is intentional — they hold multiple committee positions).

## Section Order (top to bottom)

1. **คณะกรรมการอำนวยการ** — Advisory Committee (3 members)
2. **คณะกรรมการฝ่ายวิชาการ** — Academic Committee (17 members)
3. **ฝ่ายลงทะเบียน** — Registration Committee (5 members)
4. **ฝ่ายสถานที่ พิธีการ และการศึกษาดูงาน** — Venue, Ceremony & Study Visit Committee (5 members)
5. **ฝ่ายระดมทุนและสปอนเซอร์** — Fundraising & Sponsorship Committee (1 member)

## Page Layout

```
┌─────────────────────────────────────────────┐
│            [Header: centered]               │
│  คณะกรรมการ                                 │
│  Organizing Committee                       │
│  ──────── thin primary underline ────────   │
├─────────────────────────────────────────────┤
│  Section: คณะกรรมการอำนวยการ                │
│  [icon box] Title (TH)                      │
│              Subtitle (EN, gray)             │
│  ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │ Init │ │ Init │ │ Init │   3-col grid    │
│  │ Name │ │ Name │ │ Name │                  │
│  │ Aff  │ │ Aff  │ │ Aff  │                  │
│  └──────┘ └──────┘ └──────┘                  │
├─────────────────────────────────────────────┤
│  Section 2: ... (same pattern)              │
└─────────────────────────────────────────────┘
```

- Container: `max-w-6xl mx-auto px-4 py-16`
- Section spacing: `mt-16` between groups
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

## Header (top of page)

- Title: `text-3xl font-bold text-gray-900`
- Subtitle: `text-gray-500 text-lg` (English)
- Decorative thin underline: `w-24 h-1 bg-primary-500 mx-auto mt-4 rounded-full`
- Centered text block, `mb-16`

## Section Header (per group)

- Flex row, items-center
- Icon container: `w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center`
- Icon: `w-6 h-6 text-primary-600`
- Title: `text-xl font-bold text-gray-900`
- English title: `text-sm text-gray-500` (on the line below the Thai title)
- Below the header row: `h-px bg-gray-200 mb-8` divider

## Person Card

- Uses `UCard` from @nuxt/ui with `class="p-4"`
- Hover: `transition-shadow hover:shadow-md`
- Layout inside the card:
  - Top row: 56px circle avatar + name block
    - Avatar: `w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-lg` showing initials (first letter of firstName + first letter of lastName, uppercase)
    - Name block: stack of:
      - `text-base font-semibold text-gray-900` — `${prefix} ${firstName} ${lastName}` (full name with prefix)
      - `text-sm text-gray-500` — affiliation
- No photo, no link, no description.

### Initials rule

Use the first character of `firstName` and the first character of `lastName`, both uppercased, joined with no separator. Example: `firstName: "รัฐชา"`, `lastName: "ชัยชนะ"` → initials = `รช`. If `firstName` is a single Thai name, still use first character only. If either is missing, fall back to single initial from the available name.

## Navbar Update

In `frontend/components/layout/Navbar.vue`, insert one entry into the `links` array between "เกี่ยวกับ" and "กำหนดการ":

```ts
{ label: "คณะกรรมการ", to: "/committee" }
```

The mobile menu uses the same `links` array, so it picks up the new entry automatically.

## Styling Constraints

- Use existing Tailwind palette from `frontend/tailwind.config.ts`: `primary` (emerald), `accent` (sky), `meadow` (green). No new colors.
- Use existing components from @nuxt/ui first (`UCard`, `UIcon`). No new component libraries.
- Match the visual register of `pages/important-dates.vue` and `pages/about.vue` — academic, calm, generous whitespace.

## Responsive Behavior

- < 768px: 1 column, full-width cards
- 768px–1024px (md): 2 columns
- > 1024px (lg): 3 columns
- Card content (avatar + name) stays horizontal at all sizes.

## Accessibility

- Page is one `<main>` page (provided by `layouts/default.vue`)
- One `<h1>` (page title), one `<h2>` per section, one `<h3>` per person name
- Icons in section headers are `aria-hidden="true"`; the visual name alone carries meaning
- Avatar circles show initials as text, not images, so they are screen-reader-friendly

## Files Changed

- **New**: `frontend/pages/committee.vue`
- **Modified**: `frontend/components/layout/Navbar.vue` (add 1 line to `links` array)

No backend changes. No new components. No new dependencies.

## Verification

- `cd frontend && npm run dev`
- Visit `http://localhost:3000/committee` — see 5 sections, all members listed
- Resize to mobile width — verify cards stack to 1 column
- Hover a card — see shadow appear
- Click "คณะกรรมการ" in navbar — navigate to `/committee`
- No console errors
