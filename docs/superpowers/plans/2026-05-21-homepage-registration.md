# ปุ่มลงทะเบียนเข้าร่วมงาน (Homepage Registration) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a quick registration button on the homepage that opens a modal form collecting fullName, affiliation, phone, email — no login required.

**Architecture:** New `event_registrations` table (decoupled from paid `registrations` system). Public POST endpoint with rate-limiting by email uniqueness. Modal component on homepage triggered by CTA button.

**Tech Stack:** Drizzle ORM (MySQL), Elysia.js, Vue 3 (Composition API), @nuxt/ui UModal + UForm

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `backend/src/db/schema.ts` | Add `eventRegistrations` table |
| Create | `backend/src/routes/public.ts` | Public registration endpoint (no auth) |
| Modify | `backend/src/index.ts` | Mount public routes |
| Create | `frontend/components/home/RegistrationModal.vue` | Modal form component |
| Modify | `frontend/pages/index.vue` | Add registration CTA button + modal |

---

### Task 1: Add `event_registrations` database table

**Files:**
- Modify: `backend/src/db/schema.ts`

- [ ] **Step 1: Add table definition to schema.ts**

Append to `backend/src/db/schema.ts` (after the `revisions` table):

```ts
export const eventRegistrations = mysqlTable("event_registrations", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  affiliation: varchar("affiliation", { length: 500 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

- [ ] **Step 2: Push schema to database**

Run: `cd backend && bun run db:push`
Expected: Schema synced, `event_registrations` table created

- [ ] **Step 3: Commit**

```bash
git add backend/src/db/schema.ts
git commit -m "feat: add event_registrations table for homepage registration"
```

---

### Task 2: Create public registration API endpoint

**Files:**
- Create: `backend/src/routes/public.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Create `backend/src/routes/public.ts`**

```ts
import { Elysia, t } from "elysia";
import { db } from "../db";
import { eventRegistrations } from "../db/schema";
import { eq } from "drizzle-orm";
import { ok, fail } from "../utils/response";

export const publicRoutes = new Elysia({ prefix: "/public" }).post(
  "/register",
  async ({ body, set }) => {
    const [existing] = await db
      .select({ id: eventRegistrations.id })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.email, body.email))
      .limit(1);

    if (existing) {
      set.status = 409;
      return fail("CONFLICT", "อีเมลนี้ลงทะเบียนแล้ว");
    }

    const id = crypto.randomUUID();

    await db.insert(eventRegistrations).values({
      id,
      fullName: body.fullName,
      affiliation: body.affiliation,
      phone: body.phone,
      email: body.email,
    });

    set.status = 201;
    return ok({ id }, "ลงทะเบียนสำเร็จ");
  },
  {
    body: t.Object({
      fullName: t.String({ minLength: 2, maxLength: 255 }),
      affiliation: t.Optional(t.String({ maxLength: 500 })),
      phone: t.Optional(t.String({ maxLength: 20 })),
      email: t.String({ format: "email", maxLength: 255 }),
    }),
  },
);
```

- [ ] **Step 2: Mount public routes in `backend/src/index.ts`**

Add import at top:

```ts
import { publicRoutes } from "./routes/public";
```

Add `.use(publicRoutes)` before `.listen(3001)`:

```ts
  .use(publicRoutes)
  .listen(3001);
```

- [ ] **Step 3: Test endpoint manually**

Run: `cd backend && bun run dev`

Then in another terminal:
```bash
curl -X POST http://localhost:3001/envicon2026/api/public/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"ทดสอบ สมชาย","affiliation":"มจพ.","phone":"0812345678","email":"test@example.com"}'
```

Expected: `{"success":true,"data":{"id":"..."},"message":"ลงทะเบียนสำเร็จ"}`

Duplicate call should return 409.

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/public.ts backend/src/index.ts
git commit -m "feat: add public registration endpoint (no auth required)"
```

---

### Task 3: Create RegistrationModal component

**Files:**
- Create: `frontend/components/home/RegistrationModal.vue`

- [ ] **Step 1: Create modal component**

```vue
<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
const { handleApiCall, showError, showSuccess } = useApiError();

const form = ref({
  fullName: "",
  affiliation: "",
  phone: "",
  email: "",
});

const submitting = ref(false);
const success = ref(false);

async function handleSubmit() {
  submitting.value = true;
  const { error } = await handleApiCall(() =>
    $fetch(`${apiBase}/public/register`, {
      method: "POST",
      body: form.value,
    }),
  );
  submitting.value = false;

  if (error) {
    showError(error);
    return;
  }

  showSuccess("ลงทะเบียนเข้าร่วมงานสำเร็จ");
  success.value = true;
}

function close() {
  isOpen.value = false;
  setTimeout(() => {
    success.value = false;
    form.value = { fullName: "", affiliation: "", phone: "", email: "" };
  }, 300);
}
</script>

<template>
  <UModal v-model="isOpen" @close="close">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-meadow-800">ลงทะเบียนเข้าร่วมงาน</h3>
          <UButton
            icon="i-heroicons-x-mark"
            variant="ghost"
            color="gray"
            @click="close"
          />
        </div>
      </template>

      <!-- Success state -->
      <div v-if="success" class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-meadow-100 flex items-center justify-center">
          <UIcon name="i-heroicons-check-circle" class="w-10 h-10 text-meadow-600" />
        </div>
        <h4 class="text-lg font-semibold text-meadow-800 mb-2">ลงทะเบียนสำเร็จ!</h4>
        <p class="text-gray-500">ขอบคุณที่สนใจเข้าร่วมงาน ENVICON 2026</p>
      </div>

      <!-- Form -->
      <form v-else class="space-y-4" @submit.prevent="handleSubmit">
        <UFormGroup label="ชื่อ-นามสกุล" required>
          <UInput
            v-model="form.fullName"
            placeholder="กรอกชื่อ-นามสกุล"
            required
          />
        </UFormGroup>

        <UFormGroup label="สังกัด">
          <UInput
            v-model="form.affiliation"
            placeholder="มหาวิทยาลัย / องค์กร"
          />
        </UFormGroup>

        <UFormGroup label="เบอร์โทรศัพท์">
          <UInput
            v-model="form.phone"
            placeholder="0XX-XXX-XXXX"
            type="tel"
          />
        </UFormGroup>

        <UFormGroup label="อีเมล" required>
          <UInput
            v-model="form.email"
            placeholder="email@example.com"
            type="email"
            required
          />
        </UFormGroup>

        <UButton
          type="submit"
          color="primary"
          block
          size="lg"
          :loading="submitting"
          class="mt-2"
        >
          ลงทะเบียน
        </UButton>
      </form>
    </UCard>
  </UModal>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/home/RegistrationModal.vue
git commit -m "feat: add RegistrationModal component"
```

---

### Task 4: Integrate registration button into homepage

**Files:**
- Modify: `frontend/pages/index.vue`

- [ ] **Step 1: Add modal state and component import**

In the `<script setup>` section of `frontend/pages/index.vue`, add after line 7 (`const { show: showComingSoon } = useComingSoon();`):

```ts
const showRegModal = ref(false);
```

- [ ] **Step 2: Add modal component in template**

Add just before the closing `</div>` of the root template (before line 243):

```vue
<HomeRegistrationModal v-model="showRegModal" />
```

- [ ] **Step 3: Add registration button in hero section**

In the hero buttons area (around line 71-84), replace the existing button group with one that includes the registration button. Change the `ส่งบทคัดย่อ` button to also add a new registration button:

After the `เกี่ยวกับงาน` NuxtLink (line 83), add:

```vue
<button @click="showRegModal = true"
  class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-sky-300 bg-white/60 backdrop-blur-sm text-sky-700 font-semibold text-lg hover:bg-white/80 hover:border-sky-400 hover:scale-[1.02] transition-all duration-300">
  ลงทะเบียนเข้าร่วมงาน
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
</button>
```

- [ ] **Step 4: Verify in browser**

Run: `cd frontend && npm run dev`
Navigate to `http://localhost:3000/envicon2026/`

Expected:
- Three buttons in hero: ส่งบทคัดย่อ, เกี่ยวกับงาน, ลงทะเบียนเข้าร่วมงาน
- Clicking ลงทะเบียน opens modal with form fields
- Submitting creates registration entry
- Duplicate email shows error toast

- [ ] **Step 5: Commit**

```bash
git add frontend/pages/index.vue
git commit -m "feat: add registration button to homepage hero section"
```

---

## Self-Review

**1. Spec coverage:**
- [x] Button on homepage — Task 4
- [x] Form with ชื่อ-นามสกุล — Task 3 (fullName field)
- [x] Form with สังกัด — Task 3 (affiliation field)
- [x] Form with เบอร์โทรศัพท์ — Task 3 (phone field)
- [x] Form with อีเมล — Task 3 (email field)

**2. Placeholder scan:** No TBD/TODO/fill-in-later patterns found.

**3. Type consistency:** `eventRegistrations` table fields match API body validation and form fields across all tasks.
