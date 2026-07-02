CREATE DATABASE IF NOT EXISTS earth_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE earth_db;

-- ปิดการตรวจสอบ Foreign Key ชั่วคราวเพื่อความสะดวกในการ Drop ตารางเก่า
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS login_logs;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. ตารางผู้ใช้งาน
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(255),
    phone VARCHAR(50),
    role ENUM('admin', 'student', 'staff') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. ตาราง Token
CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. ตารางบันทึกการเข้าสู่ระบบ
CREATE TABLE login_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    ip_address VARCHAR(100),
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. ตารางยานพาหนะ
CREATE TABLE vehicles (
    id VARCHAR(100) PRIMARY KEY,
    model_th VARCHAR(255) NOT NULL,
    model_en VARCHAR(255) NOT NULL,
    plate_number VARCHAR(100) NOT NULL,
    type ENUM('van', 'bus', 'sedan', 'pickup') NOT NULL,
    capacity INT NOT NULL,
    status ENUM('available', 'maintenance', 'busy') DEFAULT 'available',
    driver_name_th VARCHAR(255),
    driver_name_en VARCHAR(255),
    driver_phone VARCHAR(50),
    fuel_type_th VARCHAR(100),
    fuel_type_en VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. ตารางการจอง
CREATE TABLE bookings (
    id VARCHAR(100) PRIMARY KEY,
    vehicle_id VARCHAR(100) NOT NULL,
    user_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role ENUM('admin', 'student', 'staff') NOT NULL,
    user_phone VARCHAR(50) NOT NULL,
    purpose TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    passengers INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. ตารางการแจ้งเตือน
CREATE TABLE notifications (
    id VARCHAR(100) PRIMARY KEY,
    user_id INT NOT NULL,
    title_th VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    message_th TEXT NOT NULL,
    message_en TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- แทรกข้อมูลเริ่มต้นผู้ใช้งาน
INSERT INTO users (id, username, email, password, fullname, phone, role) VALUES
(1, 'student', 'student@university.ac.th', 'student123', 'นายสมเกียรติ ยอดรัก (ประธานสโมสรนักศึกษา)', '099-111-2233', 'student'),
(2, 'staff', 'staff@university.ac.th', 'staff123', 'ดร.สุดาพร พงษ์สิทธิ์ (อาจารย์ประจำคณะศึกษาศาสตร์)', '088-777-6655', 'staff'),
(3, 'admin', 'admin@university.ac.th', 'admin123', 'สมเกียรติ ยานยนต์ (หัวหน้างานพานพาหนะกลาง)', '086-444-2211', 'admin');

-- แทรกข้อมูลเริ่มต้นยานพาหนะ
INSERT INTO vehicles (id, model_th, model_en, plate_number, type, capacity, status, driver_name_th, driver_name_en, driver_phone, fuel_type_th, fuel_type_en) VALUES
('van-01', 'Toyota Commuter (สีฟ้า)', 'Toyota Commuter (Slate Blue)', 'กข 1024 พัทลุง', 'van', 13, 'available', 'นายสมชาย ใจดี', 'Mr. Somchai Jaidee', '081-234-5678', 'ดีเซล', 'Diesel'),
('van-02', 'Toyota Majesty Executive VIP', 'Toyota Majesty Executive VIP', 'ฮย 5566 กรุงเทพฯ', 'van', 10, 'busy', 'นายวิชัย สุวรรณ', 'Mr. Wichai Suwan', '082-998-1122', 'ดีเซล', 'Diesel'),
('bus-01', 'Scania Double-Decker Coach', 'Scania Double-Decker Coach', '30-1234 สงขลา', 'bus', 45, 'available', 'นายมานพ รักชาติ', 'Mr. Manop Rakchat', '089-776-5432', 'ดีเซล', 'Diesel'),
('sedan-01', 'Toyota Camry Hybrid', 'Toyota Camry Hybrid', 'กจ 7890 พัทลุง', 'sedan', 4, 'available', 'นายกฤษณะ พาชื่น', 'Mr. Kritsana Pachaen', '085-443-2211', 'เบนซิน', 'Gasoline'),
('sedan-02', 'BYD Seal EV (รถยนต์ไฟฟ้า)', 'BYD Seal EV (100% Electric)', '9กข 4321 กรุงเทพฯ', 'sedan', 4, 'available', 'นางสาวศิริพร อรุณ', 'Ms. Siriporn Arun', '086-554-3321', 'ไฟฟ้า EV', 'Electric EV'),
('pickup-01', 'Isuzu D-Max Spark ขนสัมภาระ', 'Isuzu D-Max Cargo Spark', 'บย 4455 ตรัง', 'pickup', 3, 'available', 'นายสุรพล แซ่ลี้', 'Mr. Surapon Saelee', '087-112-2334', 'ดีเซล', 'Diesel');

-- แทรกข้อมูลเริ่มต้นการจอง
INSERT INTO bookings (id, vehicle_id, user_id, user_name, user_role, user_phone, purpose, destination, start_date, end_date, start_time, end_time, passengers, status, notes, created_at) VALUES
('booking-1', 'van-02', 1, 'นายสมเกียรติ ยอดรัก (ประธานสโมสรนักศึกษา)', 'student', '099-111-2233', 'นำผู้แทนคณะวิทยาศาสตร์เข้าร่วมแข่งขันทักษะทางวิทยาศาสตร์ระดับภูมิภาคภาคใต้ ณ คณะวิทยาศาสตร์ ม.อ. หาดใหญ่', 'คณะวิทยาศาสตร์ มหาวิทยาลัยสงขลานครินทร์ อ.หาดใหญ่ จ.สงขลา', '2026-06-21', '2026-06-21', '08:00:00', '17:00:00', 9, 'approved', NULL, '2026-06-19 09:12:00'),
('booking-2', 'bus-01', 2, 'ดร.สุดาพร พงษ์สิทธิ์ (อาจารย์ประจำคณะศึกษาศาสตร์)', 'staff', '088-777-6655', 'นำพานักศึกษาวิชาชีพครู ชั้นปีที่ 3 จำนวน 38 คน ไปฝึกหัดสังเกตการสอนโรงเรียนสาธิตมหาวิทยาลัยในพัทลุงและตรัง', 'โรงเรียนสาธิตและโรงเรียนประถมศึกษาต้นแบบ อ.เมือง จ.ตรัง', '2026-06-24', '2026-06-25', '07:30:00', '16:30:00', 38, 'pending', NULL, '2026-06-19 14:22:00');

-- แทรกข้อมูลเริ่มต้นการแจ้งเตือน
INSERT INTO notifications (id, user_id, title_th, title_en, message_th, message_en, type, is_read, created_at) VALUES
('noti-1', 1, 'อนุมัติการจองพาหนะเรียบร้อย', 'Vehicle Booking Approved', 'การอนุมัติรถ Toyota Majesty ทะเบียน ฮย 5566 สำหรับการเดินทางไป อ.หาดใหญ่ จ.สงขลา สมบูรณ์แล้ว', 'Your booking for Toyota Majesty (ฮย 5566) to Hat Yai has been approved.', 'success', FALSE, '2026-06-21 07:15:00'),
('noti-2', 3, 'ได้รับคำขอจองคิวใหม่', 'New Pending Booking Request', 'ดร.สุดาพร พงษ์สิทธิ์ ได้ส่งคำขอจอง รถโค้ชบัส Scania ทะเบียน 30-1234 ขอนำนักศึกษาฝึกประสบการณ์สังเกตการณ์ช่วยสอน', 'Dr. Sudaporn Pongsit has requested Coach Bus Scania (30-1234) for student field practice.', 'info', FALSE, '2026-06-21 06:40:00'),
('noti-3', 3, 'สถานะการส่งพิกัดระบบ', 'Applet Running Smoothly', 'ระบบจองรถทักษิณย่านเพชรเกษมและพัทลุงเปิดทำการเชื่อมโยงข้อมูลแบบเรียลไทม์เรียบร้อย', 'TSU Car Booking system is up and online with real-time operational dashboard.', 'info', TRUE, '2026-06-21 05:00:00');