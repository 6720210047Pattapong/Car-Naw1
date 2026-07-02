import { UserProfile, Vehicle, Booking, NotificationItem, UserRole } from './types';

// ผู้ใช้ demo สำหรับ fallback เมื่อ server ไม่ตอบสนอง
// ID ต้องตรงกับ database (integer string)
const DEMO_AUTH_USERS = [
  { id: '1', name: 'นายสมเกียรติ ยอดรัก (ประธานสโมสรนักศึกษา)', email: 'student@university.ac.th', phone: '099-111-2233', role: 'student' as UserRole, password: 'student123' },
  { id: '2', name: 'ดร.สุดาพร พงษ์สิทธิ์ (อาจารย์ประจำคณะศึกษาศาสตร์)', email: 'staff@university.ac.th', phone: '088-777-6655', role: 'staff' as UserRole, password: 'staff123' },
  { id: '3', name: 'สมเกียรติ ยานยนต์ (หัวหน้างานพานพาหนะกลาง)', email: 'admin@university.ac.th', phone: '086-444-2211', role: 'admin' as UserRole, password: 'admin123' }
];

const normalizeEmail = (email: string) => email.trim().toLowerCase();

// Helper to build request headers with user context
const getHeaders = (): Record<string, string> => {
  const activeUserStr = localStorage.getItem('booking_sys_active_user');
  if (activeUserStr) {
    try {
      const user = JSON.parse(activeUserStr);
      return {
        'Content-Type': 'application/json',
        'x-user-id': user.id ? String(user.id) : '',
        'x-user-role': user.role || '',
      };
    } catch (e) {
      console.error('[api] Error parsing active user for headers', e);
    }
  }
  return { 'Content-Type': 'application/json' };
};

// Safe JSON error extractor
const extractError = async (res: Response): Promise<string> => {
  try {
    const data = await res.json();
    return data.message || `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
};

export const api = {

  // ---------- AUTH ----------

  async login(email: string, pass: string): Promise<UserProfile> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: pass })
      });
      if (res.ok) return res.json();
      const msg = await extractError(res);
      throw new Error(msg);
    } catch (error) {
      // Fallback to demo users (useful when DB is offline)
      const fallback = DEMO_AUTH_USERS.find(u =>
        normalizeEmail(u.email) === normalizeEmail(email) && u.password === pass
      );
      if (fallback) {
        console.warn('[api] DB unavailable — using demo user fallback');
        return { id: fallback.id, name: fallback.name, email: fallback.email, phone: fallback.phone, role: fallback.role };
      }
      throw error instanceof Error ? error : new Error('เข้าสู่ระบบล้มเหลว');
    }
  },

  async register(name: string, email: string, phone: string, role: UserRole, pass: string): Promise<UserProfile> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email: email.trim().toLowerCase(), phone, role, password: pass })
    });
    if (!res.ok) {
      const msg = await extractError(res);
      throw new Error(msg);
    }
    return res.json();
  },

  // ---------- VEHICLES ----------

  async getVehicles(): Promise<Vehicle[]> {
    const res = await fetch('/api/vehicles', { headers: getHeaders() });
    if (!res.ok) throw new Error('โหลดข้อมูลยานพาหนะล้มเหลว');
    return res.json();
  },

  async createVehicle(vehicle: Omit<Vehicle, 'id'> & { id?: string }): Promise<Vehicle> {
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(vehicle)
    });
    if (!res.ok) {
      const msg = await extractError(res);
      throw new Error(msg);
    }
    return res.json();
  },

  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const res = await fetch(`/api/vehicles/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(vehicle)
    });
    if (!res.ok) {
      const msg = await extractError(res);
      throw new Error(msg);
    }
    return res.json();
  },

  async deleteVehicle(id: string): Promise<boolean> {
    const res = await fetch(`/api/vehicles/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const msg = await extractError(res);
      throw new Error(msg);
    }
    const data = await res.json();
    return data.success;
  },

  // ---------- BOOKINGS ----------

  async getBookings(): Promise<Booking[]> {
    const res = await fetch('/api/bookings', { headers: getHeaders() });
    if (!res.ok) throw new Error('โหลดข้อมูลการจองล้มเหลว');
    return res.json();
  },

  async createBooking(booking: Omit<Booking, 'id' | 'createdAt'> & { id?: string }): Promise<Booking> {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(booking)
    });
    if (!res.ok) {
      const msg = await extractError(res);
      throw new Error(msg);
    }
    return res.json();
  },

  async updateBookingStatus(id: string, status: 'approved' | 'rejected' | 'cancelled', notes?: string): Promise<Booking> {
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, notes })
    });
    if (!res.ok) {
      const msg = await extractError(res);
      throw new Error(msg);
    }
    return res.json();
  },

  // ---------- NOTIFICATIONS ----------

  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch('/api/notifications', { headers: getHeaders() });
    if (!res.ok) throw new Error('โหลดการแจ้งเตือนล้มเหลว');
    return res.json();
  },

  async readAllNotifications(): Promise<boolean> {
    const res = await fetch('/api/notifications/read', {
      method: 'PUT',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('อัปเดตสถานะการแจ้งเตือนล้มเหลว');
    const data = await res.json();
    return data.success;
  },

  async clearAllNotifications(): Promise<boolean> {
    const res = await fetch('/api/notifications', {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('ลบการแจ้งเตือนล้มเหลว');
    const data = await res.json();
    return data.success;
  },

  // ---------- HEALTH CHECK ----------
  async checkHealth(): Promise<{ status: string; db: string }> {
    try {
      const res = await fetch('/api/health');
      return res.json();
    } catch {
      return { status: 'error', db: 'disconnected' };
    }
  }
};
