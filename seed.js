// seed.js — รันด้วย: node seed.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3008,
    user: process.env.DB_USER || 'earth',
    password: process.env.DB_PASSWORD || 'earth123',
    database: process.env.DB_NAME || 'earth_db',
    charset: 'utf8mb4',
});

await conn.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");

console.log('✓ Connected to MySQL with utf8mb4');

// ล้างข้อมูลเก่า
await conn.query("SET FOREIGN_KEY_CHECKS = 0");
await conn.query("TRUNCATE TABLE notifications");
await conn.query("TRUNCATE TABLE bookings");
await conn.query("TRUNCATE TABLE vehicles");
await conn.query("TRUNCATE TABLE users");
await conn.query("SET FOREIGN_KEY_CHECKS = 1");
console.log('✓ Cleared old data');

// ใส่ข้อมูลผู้ใช้งาน
await conn.query(`INSERT INTO users (id, username, email, password, fullname, phone, role) VALUES
(1, 'student', 'student@university.ac.th', 'student123', 'นายสมเกียรติ ยอดรัก (ประธานสโมสรนักศึกษา)', '099-111-2233', 'student'),
(2, 'staff', 'staff@university.ac.th', 'staff123', 'ดร.สุดาพร พงษ์สิทธิ์ (อาจารย์ประจำคณะศึกษาศาสตร์)', '088-777-6655', 'staff'),
(3, 'admin', 'admin@university.ac.th', 'admin123', 'สมเกียรติ ยานยนต์ (หัวหน้างานพาหนะกลาง)', '086-444-2211', 'admin')`);
console.log('✓ Users inserted');

// ใส่ข้อมูลยานพาหนะ
await conn.query(`INSERT INTO vehicles (id, model_th, model_en, plate_number, type, capacity, status, driver_name_th, driver_name_en, driver_phone, fuel_type_th, fuel_type_en) VALUES
('van-01', 'Toyota Commuter (สีฟ้า)', 'Toyota Commuter (Slate Blue)', 'กข 1024 พัทลุง', 'van', 13, 'available', 'นายสมชาย ใจดี', 'Mr. Somchai Jaidee', '081-234-5678', 'ดีเซล', 'Diesel'),
('van-02', 'Toyota Majesty Executive VIP', 'Toyota Majesty Executive VIP', 'ฮย 5566 กรุงเทพฯ', 'van', 10, 'busy', 'นายวิชัย สุวรรณ', 'Mr. Wichai Suwan', '082-998-1122', 'ดีเซล', 'Diesel'),
('bus-01', 'Scania Double-Decker Coach', 'Scania Double-Decker Coach', '30-1234 สงขลา', 'bus', 45, 'available', 'นายมานพ รักชาติ', 'Mr. Manop Rakchat', '089-776-5432', 'ดีเซล', 'Diesel'),
('sedan-01', 'Toyota Camry Hybrid', 'Toyota Camry Hybrid', 'กจ 7890 พัทลุง', 'sedan', 4, 'available', 'นายกฤษณะ พาชื่น', 'Mr. Kritsana Pachaen', '085-443-2211', 'เบนซิน', 'Gasoline'),
('sedan-02', 'BYD Seal EV (รถยนต์ไฟฟ้า)', 'BYD Seal EV (100% Electric)', '9กข 4321 กรุงเทพฯ', 'sedan', 4, 'available', 'นางสาวศิริพร อรุณ', 'Ms. Siriporn Arun', '086-554-3321', 'ไฟฟ้า EV', 'Electric EV'),
('pickup-01', 'Isuzu D-Max Spark ขนสัมภาระ', 'Isuzu D-Max Cargo Spark', 'บย 4455 ตรัง', 'pickup', 3, 'available', 'นายสุรพล แซ่ลี้', 'Mr. Surapon Saelee', '087-112-2334', 'ดีเซล', 'Diesel')`);
console.log('✓ Vehicles inserted');

// ใส่ข้อมูลการจอง
await conn.query(`INSERT INTO bookings (id, vehicle_id, user_id, user_name, user_role, user_phone, purpose, destination, start_date, end_date, start_time, end_time, passengers, status, notes, created_at) VALUES
('booking-1', 'van-02', 1, 'นายสมเกียรติ ยอดรัก (ประธานสโมสรนักศึกษา)', 'student', '099-111-2233', 'นำผู้แทนคณะวิทยาศาสตร์เข้าร่วมแข่งขันทักษะวิทยาศาสตร์ระดับภูมิภาค', 'คณะวิทยาศาสตร์ มหาวิทยาลัยสงขลานครินทร์ อ.หาดใหญ่ จ.สงขลา', '2026-06-21', '2026-06-21', '08:00:00', '17:00:00', 9, 'approved', NULL, '2026-06-19 09:12:00'),
('booking-2', 'bus-01', 2, 'ดร.สุดาพร พงษ์สิทธิ์ (อาจารย์ประจำคณะศึกษาศาสตร์)', 'staff', '088-777-6655', 'นำนักศึกษาวิชาชีพครูชั้นปีที่ 3 ไปฝึกหัดสังเกตการสอน', 'โรงเรียนสาธิตและโรงเรียนประถมศึกษาต้นแบบ อ.เมือง จ.ตรัง', '2026-06-24', '2026-06-25', '07:30:00', '16:30:00', 38, 'pending', NULL, '2026-06-19 14:22:00')`);
console.log('✓ Bookings inserted');

// ใส่การแจ้งเตือน
await conn.query(`INSERT INTO notifications (id, user_id, title_th, title_en, message_th, message_en, type, is_read, created_at) VALUES
('noti-1', 1, 'อนุมัติการจองพาหนะเรียบร้อย', 'Vehicle Booking Approved', 'อนุมัติรถ Toyota Majesty ทะเบียน ฮย 5566 สำหรับการเดินทางไป อ.หาดใหญ่ จ.สงขลา สมบูรณ์แล้ว', 'Your booking for Toyota Majesty (ฮย 5566) to Hat Yai has been approved.', 'success', FALSE, '2026-06-21 07:15:00'),
('noti-2', 3, 'ได้รับคำขอจองคิวใหม่', 'New Pending Booking Request', 'ดร.สุดาพร พงษ์สิทธิ์ ได้ส่งคำขอจอง รถโค้ชบัส Scania ทะเบียน 30-1234', 'Dr. Sudaporn Pongsit has requested Coach Bus Scania (30-1234) for student field practice.', 'info', FALSE, '2026-06-21 06:40:00')`);
console.log('✓ Notifications inserted');

await conn.end();
console.log('\n🎉 Seed completed! ข้อมูลถูก insert ด้วย UTF-8 ถูกต้องแล้ว');
