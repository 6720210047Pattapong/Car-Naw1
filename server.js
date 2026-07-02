import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load .env variables
dotenv.config({ override: true });

// Prevent crashes from unhandled errors
process.on('uncaughtException', (err) => {
    console.error('[Server] Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
    console.error('[Server] Unhandled Rejection:', reason);
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Middleware — อนุญาต frontend ทุก port ในเครื่อง
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, x-user-id, x-user-role');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3008,
    user: process.env.DB_USER || 'earth',
    password: process.env.DB_PASSWORD || 'earth123',
    database: process.env.DB_NAME || 'earth_db',
    charset: 'utf8mb4',
    timezone: '+07:00',
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

// Test DB connection on startup
pool.getConnection()
    .then(async (conn) => {
        await conn.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
        conn.release();
        console.log('✅ MySQL connected with utf8mb4 charset');
        console.log(`   Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3008}`);
        console.log(`   DB:   ${process.env.DB_NAME || 'earth_db'}`);
    })
    .catch((err) => {
        console.error('[DB] ❌ Connection failed:', err.message);
        console.error('   ตรวจสอบการตั้งค่าใน .env และตรวจสอบว่า MySQL กำลังทำงานอยู่');
    });

// Helper: Format Date as YYYY-MM-DD
const formatDate = (dateVal) => {
    if (!dateVal) return '';
    if (typeof dateVal === 'string') return dateVal.split('T')[0];
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper: Map Database Row to Frontend Vehicle Model
function mapVehicle(row) {
    return {
        id: row.id,
        modelTh: row.model_th,
        modelEn: row.model_en,
        plateNumber: row.plate_number,
        type: row.type,
        capacity: row.capacity,
        status: row.status,
        driverNameTh: row.driver_name_th || '',
        driverNameEn: row.driver_name_en || '',
        driverPhone: row.driver_phone || '',
        fuelTypeTh: row.fuel_type_th || '',
        fuelTypeEn: row.fuel_type_en || ''
    };
}

// Helper: Map Database Row to Frontend Booking Model
function mapBooking(row) {
    return {
        id: row.id,
        vehicleId: row.vehicle_id,
        userId: String(row.user_id),
        userName: row.user_name,
        userRole: row.user_role,
        userPhone: row.user_phone,
        purpose: row.purpose,
        destination: row.destination,
        startDate: formatDate(row.start_date),
        endDate: formatDate(row.end_date),
        startTime: typeof row.start_time === 'string' ? row.start_time.substring(0, 5) : '',
        endTime: typeof row.end_time === 'string' ? row.end_time.substring(0, 5) : '',
        passengers: row.passengers,
        status: row.status,
        notes: row.notes || '',
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
    };
}

// Helper: Map Database Row to Frontend Notification Model
function mapNotification(row) {
    return {
        id: row.id,
        userId: String(row.user_id),
        titleTh: row.title_th,
        titleEn: row.title_en,
        messageTh: row.message_th,
        messageEn: row.message_en,
        type: row.type,
        read: Boolean(row.is_read),
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
    };
}

app.get("/", (req, res) => {
    res.json({
        status: "ok",
        message: "University Car Booking System API Running",
        db: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3008,
            name: process.env.DB_NAME || 'earth_db'
        }
    });
});

// ----------------------------------------------------
// AUTHENTICATION APIs
// ----------------------------------------------------

app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" });
    }
    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email.trim().toLowerCase()]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "ไม่พบอีเมลนี้ในระบบ" });
        }
        const user = rows[0];
        if (user.password !== password) {
            return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
        }
        res.json({
            id: String(user.id),
            name: user.fullname,
            email: user.email,
            phone: user.phone || '',
            role: user.role
        });
    } catch (err) {
        console.error('[login]', err);
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/auth/register", async (req, res) => {
    const { name, email, phone, role, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ (ชื่อ, อีเมล, รหัสผ่าน)" });
    }
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const [exists] = await pool.query("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
        if (exists.length > 0) {
            return res.status(400).json({ message: "อีเมลนี้ได้รับการลงทะเบียนในระบบแล้ว" });
        }
        const username = normalizedEmail.split('@')[0];
        const [result] = await pool.query(
            "INSERT INTO users (username, email, password, fullname, phone, role) VALUES (?, ?, ?, ?, ?, ?)",
            [username, normalizedEmail, password, name, phone || '', role || 'student']
        );
        res.status(201).json({
            id: String(result.insertId),
            name,
            email: normalizedEmail,
            phone: phone || '',
            role: role || 'student'
        });
    } catch (err) {
        console.error('[register]', err);
        res.status(500).json({ message: err.message });
    }
});

// ----------------------------------------------------
// VEHICLE CRUD APIs
// ----------------------------------------------------

app.get("/api/vehicles", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM vehicles ORDER BY created_at ASC");
        res.json(rows.map(mapVehicle));
    } catch (err) {
        console.error('[GET /api/vehicles]', err);
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/vehicles", async (req, res) => {
    const { id, modelTh, modelEn, plateNumber, type, capacity, status, driverNameTh, driverNameEn, driverPhone, fuelTypeTh, fuelTypeEn } = req.body;
    const vehicleId = id || `vehicle-${Date.now()}`;
    try {
        await pool.query(
            "INSERT INTO vehicles (id, model_th, model_en, plate_number, type, capacity, status, driver_name_th, driver_name_en, driver_phone, fuel_type_th, fuel_type_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [vehicleId, modelTh, modelEn, plateNumber, type, capacity || 10, status || 'available', driverNameTh || '', driverNameEn || '', driverPhone || '', fuelTypeTh || '', fuelTypeEn || '']
        );
        const [rows] = await pool.query("SELECT * FROM vehicles WHERE id = ?", [vehicleId]);
        res.status(201).json(mapVehicle(rows[0]));
    } catch (err) {
        console.error('[POST /api/vehicles]', err);
        res.status(500).json({ message: err.message });
    }
});

app.put("/api/vehicles/:id", async (req, res) => {
    const { id } = req.params;
    const { modelTh, modelEn, plateNumber, type, capacity, status, driverNameTh, driverNameEn, driverPhone, fuelTypeTh, fuelTypeEn } = req.body;
    try {
        const [check] = await pool.query("SELECT id FROM vehicles WHERE id = ?", [id]);
        if (check.length === 0) return res.status(404).json({ message: "ไม่พบยานพาหนะที่ต้องการแก้ไข" });

        await pool.query(
            "UPDATE vehicles SET model_th = ?, model_en = ?, plate_number = ?, type = ?, capacity = ?, status = ?, driver_name_th = ?, driver_name_en = ?, driver_phone = ?, fuel_type_th = ?, fuel_type_en = ? WHERE id = ?",
            [modelTh, modelEn, plateNumber, type, capacity, status, driverNameTh || '', driverNameEn || '', driverPhone || '', fuelTypeTh || '', fuelTypeEn || '', id]
        );
        const [rows] = await pool.query("SELECT * FROM vehicles WHERE id = ?", [id]);
        res.json(mapVehicle(rows[0]));
    } catch (err) {
        console.error('[PUT /api/vehicles/:id]', err);
        res.status(500).json({ message: err.message });
    }
});

app.delete("/api/vehicles/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [activeBookings] = await pool.query(
            "SELECT id FROM bookings WHERE vehicle_id = ? AND status IN ('approved', 'pending') AND end_date >= CURDATE()",
            [id]
        );
        if (activeBookings.length > 0) {
            return res.status(400).json({ message: "ไม่สามารถลบรถได้ เนื่องจากมีตารางการจองที่รออยู่หรืออนุมัติแล้ว" });
        }
        await pool.query("DELETE FROM vehicles WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('[DELETE /api/vehicles/:id]', err);
        res.status(500).json({ message: err.message });
    }
});

// ----------------------------------------------------
// BOOKING APIs
// ----------------------------------------------------

app.get("/api/bookings", async (req, res) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];
    try {
        let query, params = [];
        if (userRole === 'admin') {
            query = "SELECT * FROM bookings ORDER BY created_at DESC, id DESC";
        } else if (userId) {
            query = "SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC, id DESC";
            params = [userId];
        } else {
            return res.json([]);
        }
        const [rows] = await pool.query(query, params);
        res.json(rows.map(mapBooking));
    } catch (err) {
        console.error('[GET /api/bookings]', err);
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/bookings", async (req, res) => {
    const {
        id, vehicleId, userId, userName, userRole, userPhone,
        purpose, destination, startDate, endDate, startTime, endTime,
        passengers, notes
    } = req.body;

    // Validate required fields
    if (!vehicleId || !userId || !userName || !userRole || !purpose || !destination || !startDate || !endDate || !startTime || !endTime) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลการจองให้ครบถ้วน" });
    }

    // Convert userId to integer (DB expects INT)
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
        return res.status(400).json({ message: "รหัสผู้ใช้ไม่ถูกต้อง — กรุณาเข้าสู่ระบบใหม่" });
    }

    const bookingId = id || `booking-${Date.now()}`;
    // Staff gets auto-approved, others are pending
    const status = userRole === 'staff' ? 'approved' : 'pending';

    try {
        // Check for booking conflicts (time overlap)
        const [conflicts] = await pool.query(
            `SELECT id FROM bookings 
             WHERE vehicle_id = ? 
             AND status IN ('pending', 'approved') 
             AND NOT (
                 end_date < ? 
                 OR start_date > ? 
                 OR (end_date = ? AND end_time <= ?) 
                 OR (start_date = ? AND start_time >= ?)
             )`,
            [
                vehicleId,
                startDate, endDate,
                startDate, startTime + ':00',
                endDate, endTime + ':00'
            ]
        );

        if (conflicts.length > 0) {
            return res.status(400).json({ message: "ขออภัย ยานพาหนะนี้ถูกจองในช่วงเวลาดังกล่าวไปแล้ว" });
        }

        // ✅ FIX: ใส่ status ในค่า VALUES ด้วย (bug เดิมลืมใส่)
        await pool.query(
            `INSERT INTO bookings 
             (id, vehicle_id, user_id, user_name, user_role, user_phone, purpose, destination, start_date, end_date, start_time, end_time, passengers, status, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                bookingId, vehicleId, userIdInt, userName, userRole, userPhone || '',
                purpose, destination, startDate, endDate,
                startTime, endTime,
                parseInt(passengers) || 1,
                status,        // ← ค่า status ที่ถูกลืมในเวอร์ชันเก่า!
                notes || null
            ]
        );

        // --- ส่ง Notification ให้ผู้จอง ---
        const [vehicleRows] = await pool.query("SELECT plate_number FROM vehicles WHERE id = ?", [vehicleId]);
        const carPlate = vehicleRows.length > 0 ? vehicleRows[0].plate_number : vehicleId;

        const userNotiId = `noti-u-${Date.now()}`;
        const notiTitleTh = status === 'approved' ? 'อนุมัติการจองพาหนะเรียบร้อย' : 'ยื่นคำขอจองรถสำเร็จ';
        const notiTitleEn = status === 'approved' ? 'Vehicle Booking Approved' : 'Booking Request Submitted';
        const notiMsgTh = status === 'approved'
            ? `การจองรถ ${carPlate} ไป "${destination}" ได้รับการอนุมัติแล้ว`
            : `คุณยื่นคำขอจองรถ ${carPlate} ไป "${destination}" เรียบร้อย รอผู้ดูแลระบบตรวจสอบ`;
        const notiMsgEn = status === 'approved'
            ? `Your booking for ${carPlate} to "${destination}" has been approved.`
            : `Your booking request for ${carPlate} to "${destination}" has been submitted and is pending approval.`;

        await pool.query(
            "INSERT INTO notifications (id, user_id, title_th, title_en, message_th, message_en, type, is_read) VALUES (?, ?, ?, ?, ?, ?, 'info', FALSE)",
            [userNotiId, userIdInt, notiTitleTh, notiTitleEn, notiMsgTh, notiMsgEn]
        );

        // --- ส่ง Notification ให้ Admin ทุกคน ---
        const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
        for (const admin of admins) {
            const adminNotiId = `noti-a-${Date.now()}-${admin.id}`;
            await pool.query(
                "INSERT INTO notifications (id, user_id, title_th, title_en, message_th, message_en, type, is_read) VALUES (?, ?, ?, ?, ?, ?, 'info', FALSE)",
                [
                    adminNotiId, admin.id,
                    `คำขอจองรถใหม่ (${carPlate})`, `New Booking Request (${carPlate})`,
                    `${userName} ส่งคำขอจองรถมุ่งหน้าสู่ "${destination}"`,
                    `${userName} submitted a booking request to travel to "${destination}"`
                ]
            );
        }

        const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [bookingId]);
        res.status(201).json(mapBooking(rows[0]));
    } catch (err) {
        console.error('[POST /api/bookings]', err);
        res.status(500).json({ message: `เกิดข้อผิดพลาดในฐานข้อมูล: ${err.message}` });
    }
});

app.put("/api/bookings/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) return res.status(400).json({ message: "กรุณาระบุสถานะ" });

    try {
        const [bookings] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
        if (bookings.length === 0) return res.status(404).json({ message: "ไม่พบรายการจองนี้" });
        const booking = bookings[0];

        await pool.query(
            "UPDATE bookings SET status = ?, notes = ? WHERE id = ?",
            [status, notes || booking.notes || null, id]
        );

        const [vehicles] = await pool.query("SELECT plate_number FROM vehicles WHERE id = ?", [booking.vehicle_id]);
        const carPlate = vehicles.length > 0 ? vehicles[0].plate_number : booking.vehicle_id;

        const thTitle = status === 'approved' ? 'อนุมัติการจองพาหนะแล้ว'
            : status === 'rejected' ? 'ปฏิเสธคำขอจองรถ'
            : 'ยกเลิกการจองรถแล้ว';
        const enTitle = status === 'approved' ? 'Booking Approved'
            : status === 'rejected' ? 'Booking Rejected'
            : 'Booking Cancelled';
        const thMsg = status === 'approved'
            ? `การจองรถ ${carPlate} ไป "${booking.destination}" ได้รับการอนุมัติแล้ว คนขับจะติดต่อคุณเร็วๆ นี้`
            : `การจองรถ ${carPlate} ถูก${status === 'rejected' ? 'ปฏิเสธ' : 'ยกเลิก'} เหตุผล: "${notes || 'ไม่ระบุ'}"`;
        const enMsg = status === 'approved'
            ? `Your booking for ${carPlate} to "${booking.destination}" has been approved. The driver will contact you shortly.`
            : `Your booking for ${carPlate} was ${status}. Reason: "${notes || 'Not specified'}"`;

        const userNotiId = `noti-${Date.now()}`;
        await pool.query(
            "INSERT INTO notifications (id, user_id, title_th, title_en, message_th, message_en, type, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)",
            [
                userNotiId, booking.user_id,
                thTitle, enTitle, thMsg, enMsg,
                status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning'
            ]
        );

        // อัปเดตสถานะรถ
        if (status === 'approved') {
            const today = new Date().toISOString().split('T')[0];
            const startDateStr = formatDate(booking.start_date);
            const endDateStr = formatDate(booking.end_date);
            if (startDateStr <= today && endDateStr >= today) {
                await pool.query("UPDATE vehicles SET status = 'busy' WHERE id = ?", [booking.vehicle_id]);
            }
        } else if (status === 'cancelled' || status === 'rejected') {
            await pool.query("UPDATE vehicles SET status = 'available' WHERE id = ? AND status = 'busy'", [booking.vehicle_id]);
        }

        const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
        res.json(mapBooking(rows[0]));
    } catch (err) {
        console.error('[PUT /api/bookings/:id/status]', err);
        res.status(500).json({ message: err.message });
    }
});

// ----------------------------------------------------
// NOTIFICATION APIs
// ----------------------------------------------------

app.get("/api/notifications", async (req, res) => {
    const userId = req.headers['x-user-id'];
    try {
        if (!userId) return res.json([]);
        const [rows] = await pool.query(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC",
            [userId]
        );
        res.json(rows.map(mapNotification));
    } catch (err) {
        console.error('[GET /api/notifications]', err);
        res.status(500).json({ message: err.message });
    }
});

app.put("/api/notifications/read", async (req, res) => {
    const userId = req.headers['x-user-id'];
    try {
        if (!userId) return res.status(400).json({ message: "Missing x-user-id header" });
        await pool.query("UPDATE notifications SET is_read = TRUE WHERE user_id = ?", [userId]);
        res.json({ success: true });
    } catch (err) {
        console.error('[PUT /api/notifications/read]', err);
        res.status(500).json({ message: err.message });
    }
});

app.delete("/api/notifications", async (req, res) => {
    const userId = req.headers['x-user-id'];
    try {
        if (!userId) return res.status(400).json({ message: "Missing x-user-id header" });
        await pool.query("DELETE FROM notifications WHERE user_id = ?", [userId]);
        res.json({ success: true });
    } catch (err) {
        console.error('[DELETE /api/notifications]', err);
        res.status(500).json({ message: err.message });
    }
});

// ----------------------------------------------------
// Health Check API
// ----------------------------------------------------
app.get("/api/health", async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const [result] = await conn.query("SELECT 1 AS ok, NOW() AS time");
        conn.release();
        res.json({
            status: "ok",
            db: "connected",
            time: result[0].time,
            env: {
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3008,
                name: process.env.DB_NAME || 'earth_db',
            }
        });
    } catch (err) {
        res.status(500).json({ status: "error", db: "disconnected", error: err.message });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});