import { UserProfile, Vehicle, Booking, NotificationItem, UserRole } from './types';

// Helper to get active headers (passing logged-in user id and role to identify user)
const getHeaders = () => {
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
      console.error('Error parsing active user for headers', e);
    }
  }
  return {
    'Content-Type': 'application/json',
  };
};

export const api = {
  // Auth APIs
  async login(email: string, pass: string): Promise<UserProfile> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  async register(name: string, email: string, phone: string, role: UserRole, pass: string): Promise<UserProfile> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, role, password: pass })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    return res.json();
  },

  // Vehicles APIs
  async getVehicles(): Promise<Vehicle[]> {
    const res = await fetch('/api/vehicles', {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load vehicles');
    return res.json();
  },

  async createVehicle(vehicle: Omit<Vehicle, 'id'> & { id?: string }): Promise<Vehicle> {
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(vehicle)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create vehicle');
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
      const err = await res.json();
      throw new Error(err.message || 'Failed to update vehicle');
    }
    return res.json();
  },

  async deleteVehicle(id: string): Promise<boolean> {
    const res = await fetch(`/api/vehicles/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to delete vehicle');
    }
    const data = await res.json();
    return data.success;
  },

  // Bookings APIs
  async getBookings(): Promise<Booking[]> {
    const res = await fetch('/api/bookings', {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load bookings');
    return res.json();
  },

  async createBooking(booking: Omit<Booking, 'id' | 'createdAt'> & { id?: string }): Promise<Booking> {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(booking)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create booking');
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
      const err = await res.json();
      throw new Error(err.message || 'Failed to update booking status');
    }
    return res.json();
  },

  // Notifications APIs
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch('/api/notifications', {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load notifications');
    return res.json();
  },

  async readAllNotifications(): Promise<boolean> {
    const res = await fetch('/api/notifications/read', {
      method: 'PUT',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to mark notifications as read');
    const data = await res.json();
    return data.success;
  },

  async clearAllNotifications(): Promise<boolean> {
    const res = await fetch('/api/notifications', {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to clear notifications');
    const data = await res.json();
    return data.success;
  }
};
