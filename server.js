import express from "express";
import mysql from "mysql2/promise";

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
        console.log('MySQL connected with utf8mb4 charset ✓');
    })
    .catch((err) => console.error('[DB] Connection failed:', err.message));

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
    res.send("University Car Booking System API Running...");
});

// ----------------------------------------------------
// AUTHENTICATION APIs
// ----------------------------------------------------

app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง / User not found" });
        }
        const user = rows[0];
        // For simplicity, directly checking the password string
        if (user.password !== password) {
            return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง / Password mismatch" });
        }
        res.json({
            id: String(user.id),
            name: user.fullname,
            email: user.email,
            phone: user.phone,
            role: user.role
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/auth/register", async (req, res) => {
    const { name, email, phone, role, password } = req.body;
    try {
        const [exists] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (exists.length > 0) {
            return res.status(400).json({ message: "อีเมลนี้ได้รับการลงทะเบียนในระบบแล้ว" });
        }
        const username = email.split('@')[0];
        const [result] = await pool.query(
            "INSERT INTO users (username, email, password, fullname, phone, role) VALUES (?, ?, ?, ?, ?, ?)",
            [username, email, password, name, phone, role]
        );
        res.status(201).json({
            id: String(result.insertId),
            name,
            email,
            phone,
            role
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// ----------------------------------------------------
// VEHICLE CRUD APIs
// ----------------------------------------------------

app.get("/api/vehicles", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM vehicles");
        res.json(rows.map(mapVehicle));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/vehicles", async (req, res) => {
    const { id, modelTh, modelEn, plateNumber, type, capacity, status, driverNameTh, driverNameEn, driverPhone, fuelTypeTh, fuelTypeEn } = req.body;
    const vehicleId = id || `vehicle-${Date.now()}`;
    try {
        await pool.query(
            "INSERT INTO vehicles (id, model_th, model_en, plate_number, type, capacity, status, driver_name_th, driver_name_en, driver_phone, fuel_type_th, fuel_type_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [vehicleId, modelTh, modelEn, plateNumber, type, capacity, status, driverNameTh, driverNameEn, driverPhone, fuelTypeTh, fuelTypeEn]
        );
        const [rows] = await pool.query("SELECT * FROM vehicles WHERE id = ?", [vehicleId]);
        res.status(201).json(mapVehicle(rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

app.put("/api/vehicles/:id", async (req, res) => {
    const { id } = req.params;
    const { modelTh, modelEn, plateNumber, type, capacity, status, driverNameTh, driverNameEn, driverPhone, fuelTypeTh, fuelTypeEn } = req.body;
    try {
        await pool.query(
            "UPDATE vehicles SET model_th = ?, model_en = ?, plate_number = ?, type = ?, capacity = ?, status = ?, driver_name_th = ?, driver_name_en = ?, driver_phone = ?, fuel_type_th = ?, fuel_type_en = ? WHERE id = ?",
            [modelTh, modelEn, plateNumber, type, capacity, status, driverNameTh, driverNameEn, driverPhone, fuelTypeTh, fuelTypeEn, id]
        );
        const [rows] = await pool.query("SELECT * FROM vehicles WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Vehicle not found" });
        res.json(mapVehicle(rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

app.delete("/api/vehicles/:id", async (req, res) => {
    const { id } = req.params;
    try {
        // Check if vehicle has any future approved bookings
        const [activeBookings] = await pool.query(
            "SELECT id FROM bookings WHERE vehicle_id = ? AND status = 'approved' AND end_date >= CURDATE()",
            [id]
        );
        if (activeBookings.length > 0) {
            return res.status(400).json({ message: "ไม่สามารถลบรถได้ เนื่องจากมีตารางการจองที่อนุมัติแล้วรอใช้งานอยู่ / Vehicle has active future bookings" });
        }

        await pool.query("DELETE FROM vehicles WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
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
        let query = "SELECT * FROM bookings ORDER BY start_date DESC, id DESC";
        let params = [];
        if (userRole !== 'admin' && userId) {
            query = "SELECT * FROM bookings WHERE user_id = ? ORDER BY start_date DESC, id DESC";
            params = [userId];
        }
        const [rows] = await pool.query(query, params);
        res.json(rows.map(mapBooking));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/bookings", async (req, res) => {
    const { id, vehicleId, userId, userName, userRole, userPhone, purpose, destination, startDate, endDate, startTime, endTime, passengers, notes } = req.body;
    const bookingId = id || `booking-${Date.now()}`;
    const status = userRole === 'staff' ? 'approved' : 'pending';
    try {
        // Overlap checks
        // An overlap exists if:
        // (startA < endB) AND (endA > startB)
        // With timestamps: start = `${startDate}T${startTime}`, end = `${endDate}T${endTime}`
        // In SQL, we can construct datetime or date/time comparisons
        const [conflicts] = await pool.query(
            `SELECT * FROM bookings 
             WHERE vehicle_id = ? 
             AND status IN ('pending', 'approved') 
             AND NOT (
                 end_date < ? 
                 OR start_date > ? 
                 OR (end_date = ? AND end_time <= ?) 
                 OR (start_date = ? AND start_time >= ?)
             )`,
            [vehicleId, startDate, endDate, startDate, startTime + ':00', endDate, endTime + ':00']
        );

        if (conflicts.length > 0) {
            return res.status(400).json({ message: "ขออภัย ยานพาหนะนี้ถูกจองคาบเกี่ยวเวลาเดียวกันไปแล้ว" });
        }

        await pool.query(
            "INSERT INTO bookings (id, vehicle_id, user_id, user_name, user_role, user_phone, purpose, destination, start_date, end_date, start_time, end_time, passengers, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [bookingId, vehicleId, userId, userName, userRole, userPhone, purpose, destination, startDate, endDate, startTime, endTime, passengers, notes || null]
        );

        // Notifications dispatch
        const formattedCarResult = await pool.query("SELECT plate_number FROM vehicles WHERE id = ?", [vehicleId]);
        const carPlate = formattedCarResult[0].length > 0 ? formattedCarResult[0][0].plate_number : '';

        // 1. User Notification
        const userNotiId = `noti-u-${Date.now()}`;
        const notiUserMsgTh = status === 'approved' 
            ? `อนุมัติการจองพาหนะเรียบร้อย` 
            : `ยื่นคำขอจองคิวรถสำเร็จ`;
        const notiUserMsgEn = status === 'approved'
            ? `Vehicle Booking Approved`
            : `Booking Request Submitted`;
        
        const notiUserDetailTh = status === 'approved'
            ? `การจองรถ ${carPlate} สำหรับเดินทางไป "${destination}" ได้รับการอนุมัติแล้ว`
            : `คุณได้ยื่นคำขอจองรถ ${carPlate} เพื่อเดินทางไป "${destination}" เรียบร้อยแล้ว ขณะนี้อยู่ระหว่างรอผู้ดูแลระบบตรวจสอบ`;
        const notiUserDetailEn = status === 'approved'
            ? `Your booking for vehicle ${carPlate} to "${destination}" has been approved.`
            : `Your booking request for ${carPlate} to "${destination}" has been submitted and is pending administrator approval.`;

        await pool.query(
            "INSERT INTO notifications (id, user_id, title_th, title_en, message_th, message_en, type, is_read) VALUES (?, ?, ?, ?, ?, ?, 'info', FALSE)",
            [userNotiId, userId, notiUserMsgTh, notiUserMsgEn, notiUserDetailTh, notiUserDetailEn]
        );

        // 2. Admin Notification
        const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
        const adminNotiId = `noti-a-${Date.now()}`;
        for (const admin of admins) {
            await pool.query(
                "INSERT INTO notifications (id, user_id, title_th, title_en, message_th, message_en, type, is_read) VALUES (?, ?, ?, ?, ?, ?, 'info', FALSE)",
                [adminNotiId + '-' + admin.id, admin.id, `คำขอจองคิวรถใหม่ (${carPlate})`, `New booking request (${carPlate})`, `${userName} ได้ส่งยื่นข้อคำขอจองใช้รถ มุ่งหน้าสู่ "${destination}"`, `${userName} submitted a request to travel to "${destination}"`]
            );
        }

        const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [bookingId]);
        res.status(201).json(mapBooking(rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

app.put("/api/bookings/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    try {
        const [bookings] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
        if (bookings.length === 0) return res.status(404).json({ message: "Booking not found" });
        const booking = bookings[0];

        await pool.query(
            "UPDATE bookings SET status = ?, notes = ? WHERE id = ?",
            [status, notes || null, id]
        );

        // Retrieve vehicle plate
        const [vehicles] = await pool.query("SELECT plate_number FROM vehicles WHERE id = ?", [booking.vehicle_id]);
        const carPlate = vehicles.length > 0 ? vehicles[0].plate_number : '';

        // Add Notification for the owner
        const thTitle = status === 'approved' ? 'อนุมัติการจองพาหนะแล้ว' : status === 'rejected' ? 'ปฏิเสธคำขอจองคิวรถ' : 'คำขอจองรถยกเลิกแล้ว';
        const enTitle = status === 'approved' ? 'Booking Request Approved' : status === 'rejected' ? 'Booking Request Rejected' : 'Booking Cancelled';
        
        const thMsg = status === 'approved' 
          ? `การจองใช้ยานพาหนะเลขทะเบียน ${carPlate} เพื่อเดินทางไป "${booking.destination}" ได้รับการพิจารณาอนุมัติเรียบร้อยโดยผู้จัดระบบ พนักงานขับรถจะติดต่อคุณโดยเร็ว`
          : `การจองใช้ยานพาหนะเลขอักษร ${carPlate} ได้รับการปฏิเสธ เนื่องจาก: "${notes || 'ข้อมูลยังไม่เพียงพอ'}"`;
        const enMsg = status === 'approved'
          ? `Your booking for vehicle ${carPlate} to "${booking.destination}" is approved. Our driver will contact you shortly.`
          : `Your booking for vehicle ${carPlate} was rejected due to: "${notes || 'No reason provided'}"`;

        const userNotiId = `noti-${Date.now()}`;
        await pool.query(
            "INSERT INTO notifications (id, user_id, title_th, title_en, message_th, message_en, type, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)",
            [userNotiId, booking.user_id, thTitle, enTitle, thMsg, enMsg, status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning']
        );

        // Update Fleet Vehicle Busy Status temporarily if approved for currently active date range
        if (status === 'approved') {
            const today = new Date().toISOString().split('T')[0];
            const startDateStr = formatDate(booking.start_date);
            const endDateStr = formatDate(booking.end_date);
            if (startDateStr <= today && endDateStr >= today) {
                await pool.query("UPDATE vehicles SET status = 'busy' WHERE id = ?", [booking.vehicle_id]);
            }
        } else if (status === 'cancelled' || status === 'rejected') {
            // Revert busy state if needed
            await pool.query("UPDATE vehicles SET status = 'available' WHERE id = ? AND status = 'busy'", [booking.vehicle_id]);
        }

        const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
        res.json(mapBooking(rows[0]));
    } catch (err) {
        console.error(err);
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
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

app.put("/api/notifications/read", async (req, res) => {
    const userId = req.headers['x-user-id'];
    try {
        if (!userId) return res.status(400).json({ message: "Missing user identification header" });
        await pool.query("UPDATE notifications SET is_read = TRUE WHERE user_id = ?", [userId]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

app.delete("/api/notifications", async (req, res) => {
    const userId = req.headers['x-user-id'];
    try {
        if (!userId) return res.status(400).json({ message: "Missing user identification header" });
        await pool.query("DELETE FROM notifications WHERE user_id = ?", [userId]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});