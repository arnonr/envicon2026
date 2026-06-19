# Accommodation Section — Design Spec

Date: 2026-06-19

## Goal

Add a new "ที่พักใกล้เคียง" (Nearby Accommodation) section to the existing `/important-dates` page, listing 2 hotels near KMUTNB with affiliate booking links. Help out-of-town conference attendees find nearby places to stay without leaving the conference site.

Hotel data is hardcoded. Affiliate disclosure is included to comply with transparency norms.

## Scope

1. New `<section>` appended to `frontend/pages/important-dates.vue`, after the existing venue section (after line 125, before `</div>` closing tag on line 126)
2. Hardcoded hotel data (2 entries) in the same `<script setup>` block
3. Affiliate disclosure line below the cards
4. No new components, no new pages, no backend changes

**Not in scope**: hotel search/filter, pricing API integration, additional hotels beyond the 2 provided, user reviews, availability check.

## Section Placement

The existing `important-dates.vue` already has 2 sections:
- Timeline (lines 1-73) — important dates
- Venue (lines 75-125) — location, map, transportation

The new "ที่พัก" section is appended as a 3rd section after the venue section. Each section is separated by a top border (`border-t border-gray-200 pt-12`), matching the existing pattern.

## Layout

`grid grid-cols-1 md:grid-cols-2 gap-6` — 2 cards side-by-side on tablet+, stacked on mobile. The new section's wrapper matches the existing venue section pattern: `<section class="mt-16 border-t border-gray-200 pt-12">` containing a `<div class="max-w-5xl mx-auto px-4 py-12">`. The `py-12` (smaller than the venue's `py-16`) keeps the page balanced — the accommodation section is supplementary, not a primary focus.

### Section header

```
NEARBY ACCOMMODATION          ← eyebrow, text-[11px] tracking-[2px] text-primary-700 font-semibold
ที่พักใกล้สถานที่จัดงาน           ← h2, text-2xl font-bold text-gray-900 mb-2
โรงแรมแนะนำใกล้ มจพ.             ← subtitle, text-gray-500 text-sm
```

Centered, `mb-10` (matches existing section header spacing).

## Card Design

Each card uses `<UCard class="!p-0 overflow-hidden">` (zero padding wrapper so the image area can be flush).

### Image placeholder (top of card)

`aspect-[16/9] bg-gray-100 flex items-center justify-center`
Centered text: `[ภาพโรงแรม]` in `text-sm text-gray-400`.

When real images become available later, swap the placeholder `<div>` for an `<img>` without changing surrounding structure.

### Content area

`p-5` padding inside the card.

```
[Bella B Hotel]                    ← text-lg font-bold text-gray-900
[โรงแรมใจกลางกรุงเทพ]                 ← text-sm text-gray-500 (Thai subtitle)

⭐ 4.2  ·  ฿1,200/คืน              ← text-sm text-gray-700 (rating + price on one line)

📍 1.2 กม. จาก มจพ. · 🚇 MRT วงศ์สว่าง  ← text-xs text-gray-500 (distance + transport)

[จองผ่าน Agoda →]                  ← UButton color="primary" block, mt-4
```

### Button

`<UButton>` with:
- `color="primary"`
- `variant="solid"`
- `size="md"`
- `block` (full width)
- `:to="hotel.url"` and `external` (NuxtLink with external opens in new tab)

External link uses `<a>` via NuxtLink's `external` prop, which renders with `target="_blank"` and `rel="noopener noreferrer"` for safety.

## Hotel Data

```ts
const hotels = [
  {
    name: "Bella B Hotel",
    nameTh: "โรงแรมใจกลางกรุงเทพ",
    rating: 4.2,
    price: "฿1,200",
    distance: "1.2 กม.",
    transport: "MRT วงศ์สว่าง",
    url: "https://www.agoda.com/th-th/bella-b-hotel_45/hotel/all/bangkok-th.html?countryId=106&finalPriceView=1&isShowMobileAppPrice=false&cid=1919460&numberOfBedrooms=&familyMode=false&adults=1&children=0&rooms=1&maxRooms=0&checkIn=2026-06-28&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=-1&showReviewSubmissionEntry=false&currencyCode=THB&isFreeOccSearch=false&tag=d939ef00-30f1-40e2-865a-42748734786e&tspTypes=16&los=1&searchrequestid=18d073c2-dc02-4765-b624-604ea37b374d&ds=WTt2YJdyiq4sZZ%2BP",
  },
  {
    name: "The Loft Resort Bangkok",
    nameTh: "รีสอร์ตใจกลางเมือง",
    rating: 4.5,
    price: "฿1,800",
    distance: "2.5 กม.",
    transport: "ใกล้ MRT",
    url: "https://www.agoda.com/th-th/the-loft-resort-bangkok/hotel/bangkok-th.html?cid=1844104&ds=S3lYkdED1k3hoXBO",
  },
];
```

**Rating, price, distance, and Thai subtitle are draft values.** The URLs are real (with `cid` affiliate parameters intact). User will replace draft data with real values later.

## Affiliate Disclosure

Directly under the cards grid, centered, small gray text:

```
* ลิงก์นี้เป็น affiliate link — ผู้จัดงานอาจได้รับค่าคอมมิชชั่นเล็กน้อยเมื่อท่านจองผ่านลิงก์ โดยไม่มีค่าใช้จ่ายเพิ่มเติมสำหรับผู้จอง
```

Styling: `text-xs text-gray-400 text-center mt-4 max-w-2xl mx-auto`.

The disclosure is required because the booking URLs contain Agoda affiliate `cid` parameters — clicking them generates commission for the conference organizers at no extra cost to the booker.

## Responsive Behavior

- Mobile (< 768px): cards stack to 1 column
- Tablet+ (≥ 768px): cards in 2 columns side-by-side
- The image placeholder's `aspect-[16/9]` keeps cards visually balanced at any width

## Files Touched

| File | Change |
|------|--------|
| `frontend/pages/important-dates.vue` | Add `hotels` const in `<script setup>`; append new `<section>` block before closing `</div>` |

No new files. No Navbar change (link stays as `/important-dates`). No backend changes.

## Out of Scope / Future Work

- Adding more hotels (can extend the `hotels` array; layout already supports it)
- Real hotel images (requires image hosting or CDN — placeholder for now)
- "Book now" availability check or live pricing
- Filters (price range, distance, amenities)
- User reviews/ratings aggregation