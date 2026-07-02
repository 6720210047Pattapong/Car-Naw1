# 🚗 ระบบจองรถกองกลาง — University Car Booking System

ระบบจองรถยนต์สำหรับมหาวิทยาลัย รองรับ 3 บทบาท: นักศึกษา / บุคลากร / ผู้ดูแลระบบ  
พัฒนาด้วย React + TypeScript + Express.js + MySQL

---

## ✨ ฟีเจอร์หลัก

- 🔐 ระบบล็อกอิน/ลงทะเบียนผ่าน MySQL
- 🚐 จองรถกองกลาง พร้อมตรวจสอบช่วงเวลาซ้อนทับ
- ✅ Admin อนุมัติ/ปฏิเสธคำขอจอง
- 🔔 ระบบการแจ้งเตือน Real-time
- 🌐 รองรับ 2 ภาษา (ไทย/อังกฤษ)
- 📊 แดชบอร์ดรายงานสถิติ

---

## 🚀 รันด้วย GitHub Codespaces (แนะนำ!)

> ไม่ต้องติดตั้งอะไรเลย — รันได้ทันทีในเบราว์เซอร์

1. กด **`<> Code`** → **`Codespaces`** → **`Create codespace on main`**
2. รอ ~2 นาที ระบบจะตั้งค่า MySQL + seed ข้อมูล + รัน server ทุกอย่างอัตโนมัติ
3. เปิดเว็บที่ port **3010** (จะ pop-up อัตโนมัติ)

---

## 💻 รันในเครื่องตัวเอง

### ข้อกำหนด
- Node.js 18+
- MySQL 8.0 (port 3008)

### ขั้นตอน

```bash
# 1. Clone โปรเจกต์
git clone https://github.com/YOUR_USERNAME/Earth-main.git
cd Earth-main

# 2. ติดตั้ง dependencies
npm install

# 3. ตั้งค่า environment
cp .env.example .env
# แก้ไขค่าใน .env ให้ตรงกับ MySQL ของคุณ

# 4. สร้างฐานข้อมูลและตาราง
mysql -u root -p < database.sql

# 5. Seed ข้อมูลเริ่มต้น
npx tsx seed.js

# 6. รัน Backend (terminal 1)
npx tsx server.js

# 7. รัน Frontend (terminal 2)
npm run dev
```

เปิดเว็บที่ http://localhost:3010

---

## 👥 บัญชีทดสอบ

| บทบาท | Email | Password |
|--------|-------|----------|
| นักศึกษา | student@university.ac.th | student123 |
| บุคลากร | staff@university.ac.th | staff123 |
| ผู้ดูแลระบบ | admin@university.ac.th | admin123 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Backend | Express.js |
| Database | MySQL 8.0 |
| Build Tool | Vite 6 |

---

## 📁 โครงสร้างโปรเจกต์

```
Earth-main/
├── .devcontainer/      # GitHub Codespaces config
│   ├── devcontainer.json
│   └── startup.sh
├── src/
│   ├── App.tsx         # หน้าหลักของแอป
│   ├── api.ts          # API client (fetch to backend)
│   ├── components/     # React components
│   ├── types.ts        # TypeScript types
│   ├── translations.ts # ข้อความ 2 ภาษา
│   └── data.ts         # ข้อมูล fallback
├── server.js           # Express.js API server
├── database.sql        # สร้างตาราง MySQL
├── seed.js             # ข้อมูลเริ่มต้น
├── .env.example        # ตัวอย่างการตั้งค่า
└── package.json
```

---

## 🔗 API Endpoints

| Method | Path | คำอธิบาย |
|--------|------|----------|
| POST | /api/auth/login | เข้าสู่ระบบ |
| POST | /api/auth/register | ลงทะเบียน |
| GET | /api/vehicles | รายการรถ |
| POST | /api/bookings | ส่งคำขอจอง |
| PUT | /api/bookings/:id/status | อัปเดตสถานะ |
| GET | /api/notifications | การแจ้งเตือน |
| GET | /api/health | ตรวจสอบ DB |
