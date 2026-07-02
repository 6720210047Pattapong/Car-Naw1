#!/bin/bash
# startup.sh — รันอัตโนมัติเมื่อเปิด Codespace

set -e

echo "🔧 Setting up MySQL for Car Booking System..."

# รอให้ MySQL พร้อม
sleep 3

# สร้าง DB, user, และตาราง
sudo mysql -u root << 'EOF'
CREATE DATABASE IF NOT EXISTS earth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'earth'@'localhost' IDENTIFIED BY 'earth123';
GRANT ALL PRIVILEGES ON earth_db.* TO 'earth'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "✅ MySQL database 'earth_db' and user 'earth' created"

# Import schema
sudo mysql -u root earth_db < /workspaces/Earth-main/database.sql 2>/dev/null || true
echo "✅ Schema imported"

# Seed ข้อมูลเริ่มต้น
cd /workspaces/Earth-main
npx tsx seed.js
echo "✅ Seed data inserted"

# รัน Backend (background)
npx tsx server.js &
echo "✅ Backend server started on port 5001"

# รัน Frontend (background)
npm run dev &
echo "✅ Frontend started on port 3010"

echo ""
echo "🚀 App ready!"
echo "   Frontend: http://localhost:3010"
echo "   API:      http://localhost:5001/api/health"
