# คู่มือการรันและการ Build โปรเจกต์ (Project Guide)

โปรเจกต์ **TSHE-CON 2026 (envicon2026)** มีโครงสร้างเป็น Monorepo โดยแบ่ง Runtime ชัดเจนระหว่าง **Backend** และ **Frontend**:

> **ข้อสังเกตสำคัญ**:
> - **Backend**: ใช้ **Bun** (Elysia.js + Drizzle ORM)
> - **Frontend**: ใช้ **Node.js / npm** (Nuxt 3 + Vue 3) — *ไม่แนะนำให้ใช้ Bun กับ Nuxt ในโปรเจกต์นี้เพื่อป้องกันปัญหาความเข้ากันได้ของ dependencies*

---

## สรุปคำสั่งด่วน (Quick Cheat Sheet)

| ส่วน | Runtime | ติดตั้ง dependencies | รัน Development | การ Build / Production |
| :--- | :--- | :--- | :--- | :--- |
| **Backend** | **Bun** | `bun install` | `bun run dev` | รัน `bun run src/index.ts` ตรงๆ (ไม่ต้อง build) |
| **Frontend** | **Node / npm** | `npm install` | `npm run dev` | `npm run build`<br>รันด้วย `node .output/server/index.mjs` |
| **Full Stack** | **Docker** | — | — | `docker compose up --build` |

---

## 1. Backend (Elysia.js + Drizzle ORM + MySQL)

Backend พัฒนาด้วย **Elysia.js** บน **Bun Runtime**

### การติดตั้ง Dependencies
```bash
cd backend
bun install
```

### การรันใน Development Mode
รันพร้อม Hot Reload บนพอร์ต `3001`:
```bash
cd backend
bun run dev
```

### คำสั่งจัดการฐานข้อมูล (Drizzle ORM)
```bash
cd backend
bun run db:generate   # สร้างไฟล์ migration จาก schema
bun run db:push       # อัปเดตโครงสร้างตารางเข้า MySQL ทันที
```

### การรันใน Production
เนื่องจาก Bun รองรับการรัน TypeScript ได้โดยตรง จึงไม่จำเป็นต้อง compile/build:
```bash
cd backend
bun run src/index.ts
```

---

## 2. Frontend (Nuxt 3 + Vue 3 + Tailwind CSS)

Frontend พัฒนาด้วย **Nuxt 3** และใช้ **Node.js (v20 ขึ้นไป) / npm**

### การติดตั้ง Dependencies
```bash
cd frontend
npm install
```

### การรันใน Development Mode
รัน Nuxt dev server บนพอร์ต `3000`:
```bash
cd frontend
npm run dev
```

### การ Build สำหรับ Production
Nuxt จำเป็นต้อง build เพื่อสร้าง output files:
```bash
cd frontend
npm run build
```
*(คำสั่งนี้จะรัน `NUXT_BUILD_DIR=.nuxt-build nuxt build` และสร้างผลลัพธ์ไว้ที่ `.output/`)*

### การรัน Production Server
หลังจาก build เสร็จแล้ว รันเซิร์ฟเวอร์ด้วย Node:
```bash
cd frontend
node .output/server/index.mjs
# หรือรันผ่านสคริปต์
npm run preview
```

---

## 3. รันทั้งระบบด้วย Docker Compose (แนะนำสำหรับ Production / Staging)

โปรเจกต์มี `docker-compose.yml` ที่ตั้งค่าพร้อมทุกอย่าง (MySQL, Backend, Frontend, Nginx):

```bash
# รันทุก service พร้อม build ใหม่
docker compose up --build

# รันแบบ background (detached mode)
docker compose up -d

# ปิดการทำงาน
docker compose down
```

### บริการและพอร์ตใน Docker:
- **Nginx (Reverse Proxy)**: พอร์ต `80` (เข้าผ่าน `http://localhost/envicon2026/`)
- **Frontend (Nuxt 3)**: พอร์ต `3000`
- **Backend (Bun / Elysia)**: พอร์ต `3001`
- **MySQL 8**: พอร์ต `3308` (map เข้า 3306 ภายใน container)
