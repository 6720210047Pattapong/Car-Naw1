export type UserRole = 'student' | 'staff' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  password?: string; // LocalStorage simulated secure credentials
}

export type VehicleType = 'van' | 'bus' | 'sedan' | 'pickup';

export interface Vehicle {
  id: string;
  modelTh: string;
  modelEn: string;
  plateNumber: string;
  type: VehicleType;
  capacity: number;
  status: 'available' | 'maintenance' | 'busy';
  driverNameTh: string;
  driverNameEn: string;
  driverPhone: string;
  fuelTypeTh: string;
  fuelTypeEn: string;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Booking {
  id: string;
  vehicleId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userPhone: string;
  purpose: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  passengers: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string; // ISO string
}

export interface NotificationItem {
  id: string;
  userId?: string; // Isolated owner of this notification
  titleTh: string;
  titleEn: string;
  messageTh: string;
  messageEn: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface LanguageDictionary {
  [key: string]: {
    th: string;
    en: string;
  };
}
