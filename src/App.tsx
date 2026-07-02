import React, { useState, useEffect } from 'react';
import {
  Car,
  Calendar,
  Clock,
  User,
  Users,
  MapPin,
  FileText,
  CheckCircle,
  AlertTriangle,
  X,
  Check,
  Trash2,
  Edit3,
  Plus,
  Search,
  Languages,
  Bell,
  Phone,
  ShieldAlert,
  Layers,
  TrendingUp,
  CheckSquare,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle, Booking, NotificationItem, UserRole, VehicleType, UserProfile } from './types';
import { translations } from './translations';
import { initialVehicles, initialBookings, initialNotifications } from './data';
import AuthScreen from './components/AuthScreen';
import { api } from './api';

// Demo profiles for user role switching simulation
const PROFILE_STUDENT = {
  id: 'student-1',
  name: 'นายสมเกียรติ ยอดรัก (ประธานสโมสรนักศึกษา)',
  email: 'student@university.ac.th',
  phone: '099-111-2233'
};

const PROFILE_STAFF = {
  id: 'staff-1',
  name: 'ดร.สุดาพร พงษ์สิทธิ์ (อาจารย์ประจำคณะศึกษาศาสตร์)',
  email: 'staff@university.ac.th',
  phone: '088-777-6655'
};

const PROFILE_ADMIN = {
  id: 'admin-01',
  name: 'สมเกียรติ ยานยนต์ (หัวหน้างานพานพาหนะกลาง)',
  email: 'admin@university.ac.th',
  phone: '086-444-2211'
};

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  // --- States ---
  const [lang, setLang] = useState<'th' | 'en'>(() => {
    const saved = localStorage.getItem('booking_sys_lang');
    return (saved as 'th' | 'en') || 'th';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('booking_sys_active_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate user ID must be numeric (DB uses INT) — clear stale data if not
        if (parsed && parsed.id && !isNaN(parseInt(String(parsed.id), 10))) {
          return parsed;
        } else {
          // ID เก่าแบบ 'student-1' ใช้ไม่ได้กับ DB — force re-login
          console.warn('[App] Stale user ID in localStorage, clearing for fresh login');
          localStorage.removeItem('booking_sys_active_user');
        }
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('booking_sys_registered_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { ...PROFILE_STUDENT, role: 'student', password: 'student123' },
      { ...PROFILE_STAFF, role: 'staff', password: 'staff123' },
      { ...PROFILE_ADMIN, role: 'admin', password: 'admin123' }
    ];
  });

  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('booking_sys_role');
    return (saved as UserRole) || 'student';
  });

  const [currentTab, setCurrentTab] = useState<string>(() => {
    return role === 'admin' ? 'admin-bookings' : 'bookings';
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('booking_sys_vehicles');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialVehicles;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('booking_sys_bookings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialBookings;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('booking_sys_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialNotifications;
  });

  // Navigation states & Search/Filter
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [searchCar, setSearchCar] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchBooking, setSearchBooking] = useState('');
  const [searchAdminBooking, setSearchAdminBooking] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('all');

  // Booking Form State
  const [formData, setFormData] = useState({
    vehicleId: '',
    purpose: '',
    destination: '',
    startDate: '',
    endDate: '',
    startTime: '08:30',
    endTime: '16:30',
    passengers: 1,
    notes: ''
  });

  // Admin Vehicle Form State
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [carFormData, setCarFormData] = useState({
    modelTh: '',
    modelEn: '',
    plateNumber: '',
    type: 'van' as VehicleType,
    capacity: 10,
    status: 'available' as 'available' | 'maintenance' | 'busy',
    driverNameTh: '',
    driverNameEn: '',
    driverPhone: '',
    fuelTypeTh: 'ดีเซล',
    fuelTypeEn: 'Diesel'
  });

  // Alert Modal state
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error' | null, text: string }>({ type: null, text: '' });
  const [rejectionModalBooking, setRejectionModalBooking] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Save states to localstorage
  useEffect(() => {
    localStorage.setItem('booking_sys_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('booking_sys_role', role);
  }, [role]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('booking_sys_active_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('booking_sys_active_user');
    }
  }, [currentUser]);

  // DB status state
  const [dbStatus, setDbStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  // Fetch vehicles, bookings, and notifications from the MySQL API on mount or user changes
  useEffect(() => {
    // Check DB health first
    api.checkHealth().then(health => {
      setDbStatus(health.db === 'connected' ? 'ok' : 'error');
    }).catch(() => setDbStatus('error'));

    if (currentUser) {
      const loadInitialData = async () => {
        try {
          const fetchedVehicles = await api.getVehicles();
          setVehicles(fetchedVehicles);

          const fetchedBookings = await api.getBookings();
          setBookings(fetchedBookings);

          const fetchedNotis = await api.getNotifications();
          setNotifications(fetchedNotis);
        } catch (e) {
          console.error("Failed to load initial data from MySQL:", e);
        }
      };
      loadInitialData();
    }
  }, [currentUser]);

  // Adjust default tab when role changes
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (currentUser) {
      const updatedUser = { ...currentUser, role: newRole };
      setCurrentUser(updatedUser);
    }
    if (newRole === 'admin') {
      setCurrentTab('admin-bookings');
    } else {
      setCurrentTab('bookings');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('booking_sys_active_user');
    setAlertMsg({ type: 'success', text: lang === 'th' ? 'ออกจากระบบเรียบร้อยแล้ว' : 'Successfully signed out.' });
  };

  const activeUserProfile = () => {
    if (currentUser) return currentUser;
    if (role === 'student') return PROFILE_STUDENT;
    if (role === 'staff') return PROFILE_STAFF;
    return PROFILE_ADMIN;
  };

  const t = (key: string) => {
    return translations[key]?.[lang] || key;
  };

  // Check date overlap logic
  const checkVehicleAvailability = (vehicleId: string, startD: string, endD: string, startT: string, endT: string, skipBookingId?: string): boolean => {
    if (!startD || !endD) return true;

    // Parse requested periods
    const reqStart = new Date(`${startD}T${startT || '00:00'}`);
    const reqEnd = new Date(`${endD}T${endT || '23:59'}`);

    // If dates are invalid
    if (isNaN(reqStart.getTime()) || isNaN(reqEnd.getTime())) return true;

    // Filter approved or pending bookings
    const activeBookings = bookings.filter(b =>
      b.vehicleId === vehicleId &&
      b.id !== skipBookingId &&
      (b.status === 'approved' || b.status === 'pending')
    );

    for (const b of activeBookings) {
      const bStart = new Date(`${b.startDate}T${b.startTime}`);
      const bEnd = new Date(`${b.endDate}T${b.endTime}`);

      // Overlap check
      if (reqStart < bEnd && reqEnd > bStart) {
        return false; // Overlap detected!
      }
    }
    return true;
  };

  // Automatically select a vehicle that fits current search dates & times
  const getAvailableVehiclesList = () => {
    const { startDate, endDate, startTime, endTime, passengers } = formData;
    return vehicles.filter(car => {
      // Must match capacities
      if (car.capacity < passengers) return false;
      // Must be in operational state
      if (car.status === 'maintenance') return false;
      // Calendar overlap
      if (startDate && endDate) {
        return checkVehicleAvailability(car.id, startDate, endDate, startTime, endTime);
      }
      return true;
    });
  };

  // Form Submission
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const { vehicleId, purpose, destination, startDate, endDate, startTime, endTime, passengers } = formData;

    if (!vehicleId || !purpose || !destination || !startDate || !endDate) {
      setAlertMsg({ type: 'error', text: lang === 'th' ? 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน' : 'Please fill in all mandatory fields.' });
      return;
    }

    // Verify dates order
    const dStart = new Date(`${startDate}T${startTime}`);
    const dEnd = new Date(`${endDate}T${endTime}`);
    if (dStart >= dEnd) {
      setAlertMsg({ type: 'error', text: t('validationDateErr') });
      return;
    }

    // Prevent booking in the past
    const todayStr = getTodayDateString();
    if (startDate < todayStr) {
      setAlertMsg({
        type: 'error',
        text: lang === 'th'
          ? 'ไม่สามารถเลือกวันที่เริ่มใช้งานย้อนหลังได้'
          : 'Cannot select a start date in the past.'
      });
      return;
    }

    if (startDate === todayStr) {
      const now = new Date();
      const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (startTime < currentHourMin) {
        setAlertMsg({
          type: 'error',
          text: lang === 'th'
            ? 'เวลาเริ่มต้นที่เลือกผ่านไปแล้ว กรุณาเลือกเวลาปัจจุบันหรือในอนาคต'
            : 'The selected start time has already passed. Please choose a current or future time.'
        });
        return;
      }
    }

    const selectedCar = vehicles.find(v => v.id === vehicleId);
    if (!selectedCar) return;

    if (passengers > selectedCar.capacity) {
      setAlertMsg({ type: 'error', text: t('validationCapErr') });
      return;
    }

    // Double check overlap
    const isAvail = checkVehicleAvailability(vehicleId, startDate, endDate, startTime, endTime);
    if (!isAvail) {
      setAlertMsg({
        type: 'error',
        text: lang === 'th' ? 'ขออภัย ยานพาหนะนี้ถูกจองคาบเกี่ยวเวลาเดียวกันไปแล้ว' : 'Sorry, this vehicle is already reserved for the selected timeframe.'
      });
      return;
    }

    const user = activeUserProfile();

    try {
      await api.createBooking({
        vehicleId,
        userId: user.id,
        userName: user.name,
        userRole: role,
        userPhone: user.phone,
        purpose,
        destination,
        startDate,
        endDate,
        startTime,
        endTime,
        passengers,
        status: 'pending',
        notes: formData.notes
      });

      // Reload bookings and notifications from backend MySQL
      const fetchedBookings = await api.getBookings();
      setBookings(fetchedBookings);
      const fetchedNotis = await api.getNotifications();
      setNotifications(fetchedNotis);

      // Clear Form & Alert
      setFormData({
        vehicleId: '',
        purpose: '',
        destination: '',
        startDate: '',
        endDate: '',
        startTime: '08:30',
        endTime: '16:30',
        passengers: 1,
        notes: ''
      });

      setAlertMsg({ type: 'success', text: t('bookingSuccess') });
      setCurrentTab('bookings');
    } catch (err: any) {
      console.error('[Booking Error]', err);
      // แสดง error จริงจาก server แทนที่จะซ่อน
      const errMsg = err?.message || (lang === 'th' ? 'เกิดข้อผิดพลาดในการส่งคำขอจองคิวรถ' : 'Booking request failed');
      setAlertMsg({ type: 'error', text: errMsg });
    }
  };

  // Handle Booking Status Update (Admin Actions)
  const handleUpdateBookingStatus = async (bookingId: string, nextStatus: 'approved' | 'rejected' | 'cancelled', rejectNotes?: string) => {
    try {
      await api.updateBookingStatus(bookingId, nextStatus, rejectNotes);

      // Reload bookings, notifications, and vehicles from backend MySQL
      const fetchedBookings = await api.getBookings();
      setBookings(fetchedBookings);
      const fetchedNotis = await api.getNotifications();
      setNotifications(fetchedNotis);
      const fetchedVehicles = await api.getVehicles();
      setVehicles(fetchedVehicles);

      setAlertMsg({ type: 'success', text: t('statusUpdated') });
    } catch (err: any) {
      console.error(err);
      setAlertMsg({ type: 'error', text: lang === 'th' ? 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' : err.message });
    }
  };

  // Open rejection details collector
  const openRejectionDialog = (booking: Booking) => {
    setRejectionModalBooking(booking);
    setRejectionReason('');
  };

  const handleConfirmRejectionSubmit = () => {
    if (rejectionModalBooking) {
      handleUpdateBookingStatus(rejectionModalBooking.id, 'rejected', rejectionReason || 'เหตุผลตามดุลยพินิจกองบริการยานพาหนะกลาง');
      setRejectionModalBooking(null);
    }
  };

  // Manage Vehicle (Create/Update/Delete Cars for Admin)
  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    const { modelTh, modelEn, plateNumber, type, capacity, status, driverNameTh, driverNameEn, driverPhone, fuelTypeTh, fuelTypeEn } = carFormData;

    if (!modelTh || !modelEn || !plateNumber || !driverNameTh || !driverNameEn || !driverPhone) {
      setAlertMsg({ type: 'error', text: lang === 'th' ? 'กรุณากรอกข้อมูลยานพาหนะให้ครบถ้วนทุกช่อง' : 'Please input all vehicle fields.' });
      return;
    }

    try {
      if (editingCarId) {
        // Edit mode
        await api.updateVehicle(editingCarId, {
          modelTh, modelEn, plateNumber, type, capacity: Number(capacity), status, driverNameTh, driverNameEn, driverPhone, fuelTypeTh, fuelTypeEn
        });
        setEditingCarId(null);
        setAlertMsg({ type: 'success', text: lang === 'th' ? 'อัปเดตข้อมูลรถกองกลางสำเร็จ' : 'Vehicle info updated successfully.' });
      } else {
        // Add mode
        await api.createVehicle({
          modelTh, modelEn, plateNumber, type, capacity: Number(capacity), status, driverNameTh, driverNameEn, driverPhone, fuelTypeTh, fuelTypeEn
        });
        setAlertMsg({ type: 'success', text: lang === 'th' ? 'เพิ่มยานพาหนะใหม่เข้าสู่ระบบเรียบร้อย' : 'New fleet vehicle registered successfully.' });
      }

      // Reload vehicles list from backend MySQL
      const fetchedVehicles = await api.getVehicles();
      setVehicles(fetchedVehicles);

      // Reset Form
      setIsAddingCar(false);
      setCarFormData({
        modelTh: '', modelEn: '', plateNumber: '', type: 'van', capacity: 10, status: 'available',
        driverNameTh: '', driverNameEn: '', driverPhone: '', fuelTypeTh: 'ดีเซล', fuelTypeEn: 'Diesel'
      });
    } catch (err: any) {
      console.error(err);
      setAlertMsg({ type: 'error', text: lang === 'th' ? 'เกิดข้อผิดพลาดในการบันทึกข้อมูลรถ' : err.message });
    }
  };

  const handleEditCarClick = (car: Vehicle) => {
    setEditingCarId(car.id);
    setCarFormData({
      modelTh: car.modelTh,
      modelEn: car.modelEn,
      plateNumber: car.plateNumber,
      type: car.type,
      capacity: car.capacity,
      status: car.status,
      driverNameTh: car.driverNameTh,
      driverNameEn: car.driverNameEn,
      driverPhone: car.driverPhone,
      fuelTypeTh: car.fuelTypeTh,
      fuelTypeEn: car.fuelTypeEn
    });
    setIsAddingCar(true);
  };

  const handleDeleteCar = async (carId: string) => {
    if (confirm(t('deleteConfirm'))) {
      try {
        await api.deleteVehicle(carId);
        // Reload vehicles from backend MySQL
        const fetchedVehicles = await api.getVehicles();
        setVehicles(fetchedVehicles);
        setAlertMsg({ type: 'success', text: lang === 'th' ? 'ลบยานพาหนะที่เลือกสำเร็จ' : 'Vehicle deleted successfully.' });
      } catch (err: any) {
        console.error(err);
        setAlertMsg({ type: 'error', text: lang === 'th' ? 'ไม่สามารถลบรถได้ เนื่องจากมีตารางการจองที่อนุมัติแล้วรอใช้งานอยู่' : err.message });
      }
    }
  };

  // Mark all notifications as read or clear
  const handleMarkAllRead = async () => {
    try {
      await api.readAllNotifications();
      const fetchedNotis = await api.getNotifications();
      setNotifications(fetchedNotis);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await api.clearAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper lists & search logic
  const filteredVehicles = vehicles.filter(car => {
    const query = searchCar.toLowerCase();
    const matchesSearch =
      car.modelTh.toLowerCase().includes(query) ||
      car.modelEn.toLowerCase().includes(query) ||
      car.plateNumber.toLowerCase().includes(query) ||
      car.driverNameTh.toLowerCase().includes(query) ||
      car.driverNameEn.toLowerCase().includes(query);

    if (typeFilter === 'all') return matchesSearch;
    return matchesSearch && car.type === typeFilter;
  });

  const userNotifications = notifications.filter(n => n.userId === activeUserProfile().id);

  const unreadNotificationCount = userNotifications.filter(n => !n.read).length;

  // --- Reports calculations ---
  const totalBookingsCount = bookings.length;
  const approvedBookingsCount = bookings.filter(b => b.status === 'approved').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;

  // Fleet utilization calculations
  const totalFleetSize = vehicles.length;
  const busyOrMaintenanceFleet = vehicles.filter(v => v.status !== 'available').length;
  const utilizationPercentage = totalFleetSize > 0 ? Math.round((busyOrMaintenanceFleet / totalFleetSize) * 100) : 0;

  // Destination stats calculations
  const getDestinationLeaderboard = () => {
    const destCounts: { [dest: string]: number } = {};
    bookings.forEach(b => {
      // Clean up strings to make stats look organized
      let dest = b.destination.split(' ')[0] || b.destination;
      // Truncate long names for chart readability
      if (dest.length > 25) dest = dest.substring(0, 22) + '...';
      destCounts[dest] = (destCounts[dest] || 0) + 1;
    });

    return Object.entries(destCounts)
      .map(([dest, count]) => ({ destination: dest, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  // Utilization by car type
  const getUtilizationByCarType = () => {
    const stats: { [key in VehicleType]: { total: number, bookings: number } } = {
      van: { total: 0, bookings: 0 },
      bus: { total: 0, bookings: 0 },
      sedan: { total: 0, bookings: 0 },
      pickup: { total: 0, bookings: 0 },
    };

    vehicles.forEach(v => {
      if (stats[v.type]) stats[v.type].total += 1;
    });

    bookings.forEach(b => {
      const matchCar = vehicles.find(v => v.id === b.vehicleId);
      if (matchCar && stats[matchCar.type]) {
        stats[matchCar.type].bookings += 1;
      }
    });

    return Object.entries(stats).map(([type, value]) => ({
      type: type as VehicleType,
      labelTh: t(type),
      bookingsCount: value.bookings
    }));
  };

  if (!currentUser) {
    const handleLoginSuccess = (user: UserProfile) => {
      setCurrentUser(user);
      setRole(user.role);
      if (user.role === 'admin') {
        setCurrentTab('admin-bookings');
      } else {
        setCurrentTab('bookings');
      }
      setAlertMsg({
        type: 'success',
        text: lang === 'th' ? `ยินดีต้อนรับกลับมา คุณ ${user.name}` : `Welcome back, ${user.name}`
      });
    };

    const handleRegisterAddUser = (user: UserProfile) => {
      const updatedUsers = [...users, user];
      setUsers(updatedUsers);
    };

    return (
      <AuthScreen
        lang={lang}
        setLang={setLang}
        onLoginSuccess={handleLoginSuccess}
        demoUsers={users}
        onAddUser={handleRegisterAddUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative antialiased">

      {/* Alert Banner / Modal Notification */}
      <AnimatePresence>
        {alertMsg.type && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-xl shadow-xl flex items-center justify-between space-x-3 w-11/12 max-w-lg border ${alertMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
          >
            <div className="flex items-center space-x-3">
              {alertMsg.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{alertMsg.text}</span>
            </div>
            <button
              onClick={() => setAlertMsg({ type: null, text: '' })}
              className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Header */}
      <header id="main-app-header" className="bg-white border-b border-slate-200 sticky top-0 z-40 h-20 flex items-center shadow-sm">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              <Car className="w-5.5 h-5.5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none text-slate-900 font-heading tracking-tight flex items-center gap-2">
                <span>{t('appTitle')}</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t('appSubtitle')}</span>
                {/* DB Status Badge */}
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                  dbStatus === 'ok' ? 'bg-emerald-100 text-emerald-700' :
                  dbStatus === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-500'
                }`} title="Database connection status">
                  <span className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'ok' ? 'bg-emerald-500' : dbStatus === 'error' ? 'bg-red-500' : 'bg-slate-400'}`}></span>
                  {dbStatus === 'ok' ? 'DB Connected' : dbStatus === 'error' ? 'DB Offline' : 'DB...'}
                </span>
              </div>
            </div>
          </div>


          {/* Right Header Navigation */}
          <div className="flex items-center space-x-4">

            {/* Bilingual Translation Language Switcher */}
            <button
              onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold text-xs cursor-pointer transition-all hover:text-slate-900"
              title="Switch Language / สลับภาษา"
            >
              <Languages className="w-3.5 h-3.5 text-slate-505" />
              <span>{lang === 'th' ? 'EN' : 'TH'}</span>
            </button>

            {/* Notification triggers */}
            <div className="relative">
              <button
                onClick={() => setIsNotiOpen(!isNotiOpen)}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center relative transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {/* Notification Overlay Menu */}
              <AnimatePresence>
                {isNotiOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden"
                  >
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 font-display flex items-center">
                        <Bell className="w-3.5 h-3.5 text-slate-550 mr-1" />
                        {t('notificationCenter')}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          {t('allRead')}
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={handleClearAllNotifications}
                          className="text-[10px] font-bold text-slate-550 hover:underline cursor-pointer"
                        >
                          {t('clearAll')}
                        </button>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {userNotifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          {lang === 'th' ? 'ไม่มีการแจ้งเตือนใหม่' : 'No new notifications.'}
                        </div>
                      ) : (
                        userNotifications.map(n => (
                          <div
                            key={n.id}
                            className={`p-3.5 text-xs transition-colors ${n.read ? 'bg-white' : 'bg-blue-50/40'}`}
                          >
                            <div className="flex items-start justify-between space-x-1 mb-1">
                              <span className={`font-semibold ${n.type === 'success' ? 'text-emerald-700' :
                                  n.type === 'error' ? 'text-rose-700' :
                                    n.type === 'warning' ? 'text-amber-700' : 'text-slate-700'
                                }`}>
                                {lang === 'th' ? n.titleTh : n.titleEn}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {lang === 'th' ? n.messageTh : n.messageEn}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile badge details and Logout */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-1.5 pr-3 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 ring-2 ring-white">
                <User className="w-4.5 h-4.5" />
              </div>
              <div className="hidden md:block text-left overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate max-w-[130px] leading-tight select-none">
                  {activeUserProfile().name}
                </p>
                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider font-bold select-none">
                  {t(role)}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="px-2 py-1 bg-rose-50 border border-rose-200 hover:bg-rose-100/80 text-rose-600 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                title={lang === 'th' ? 'ออกจากระบบความมั่นคง' : 'Secure Exit / Logout'}
              >
                <span>{lang === 'th' ? 'ออกจากระบบ' : 'Logout'}</span>
              </button>
            </div>

          </div>
        </div>
      </header>



      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">

        {/* Navigation Sidebar Panel */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-2 sticky top-28 text-left">

            {/* Section label */}
            <div className="px-1.5 mb-2.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase">
                {t('switchRole')}: {t(role)}
              </span>
            </div>

            {/* Standard User Actions (Student / Staff) */}
            {(role === 'student' || role === 'staff') && (
              <>
                <button
                  onClick={() => setCurrentTab('bookings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${currentTab === 'bookings'
                      ? 'bg-blue-50 text-blue-700 shadow-none border-none'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <Calendar className={`w-4 h-4 ${currentTab === 'bookings' ? 'text-blue-700' : 'text-slate-400'}`} />
                  <span className="font-heading">{t('tabBookings')}</span>
                  <span className="ml-auto bg-slate-100 text-slate-700 text-[10px] py-0.5 px-2 rounded-full font-mono font-bold">
                    {bookings.filter(b => b.userId === activeUserProfile().id).length}
                  </span>
                </button>

                <button
                  onClick={() => setCurrentTab('new-booking')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${currentTab === 'new-booking'
                      ? 'bg-blue-50 text-blue-700 shadow-none border-none'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <Plus className={`w-4 h-4 ${currentTab === 'new-booking' ? 'text-blue-700' : 'text-slate-400'}`} />
                  <span className="font-heading">{t('tabNewBooking')}</span>
                </button>
              </>
            )}

            {/* Admin only actions */}
            {role === 'admin' && (
              <>
                <button
                  onClick={() => setCurrentTab('admin-bookings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${currentTab === 'admin-bookings'
                      ? 'bg-slate-100 text-slate-900 shadow-none border-none'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <CheckSquare className={`w-4 h-4 ${currentTab === 'admin-bookings' ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span className="font-heading">{t('tabAdminBookings')}</span>
                  {pendingBookingsCount > 0 && (
                    <span className="ml-auto bg-red-650 text-red-700 bg-red-50 text-[10px] font-bold py-0.5 px-2 rounded-full">
                      {pendingBookingsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setCurrentTab('admin-vehicles')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${currentTab === 'admin-vehicles'
                      ? 'bg-slate-100 text-slate-900 shadow-none border-none'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <Car className={`w-4 h-4 ${currentTab === 'admin-vehicles' ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span className="font-heading">{t('tabAdminVehicles')}</span>
                  <span className="ml-auto bg-slate-200 text-slate-600 text-[10px] py-0.5 px-1.5 rounded-full font-mono font-bold">
                    {vehicles.length}
                  </span>
                </button>
              </>
            )}

            {/* Shared Informational Panels */}
            <hr className="my-3 border-slate-200" />

            <button
              onClick={() => setCurrentTab('vehicles')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${currentTab === 'vehicles'
                  ? 'bg-blue-50 text-blue-700 shadow-none border-none'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <Info className={`w-4 h-4 ${currentTab === 'vehicles' ? 'text-blue-700' : 'text-slate-400'}`} />
              <span className="font-heading">{t('tabVehicles')}</span>
            </button>

            <button
              onClick={() => setCurrentTab('reports')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${currentTab === 'reports'
                  ? 'bg-blue-50 text-blue-700 shadow-none border-none'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <TrendingUp className={`w-4 h-4 ${currentTab === 'reports' ? 'text-blue-700' : 'text-slate-400'}`} />
              <span className="font-heading">{t('tabReports')}</span>
            </button>

            {/* Simulated Live status panel */}
            <div className="p-4 bg-slate-50 rounded-xl mt-4 border border-slate-200 text-[11px] text-slate-500 leading-relaxed text-left space-y-1.5">
              <div className="flex items-center space-x-1.5 text-slate-800 font-bold">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>{lang === 'th' ? 'สภาพแวดล้อม' : 'State Engine'}</span>
              </div>
              <p className="text-[11px] text-slate-550">{lang === 'th' ? '• เชื่อมฐานข้อมูลจำลองด้วย LocalStorage การกระทำใดๆ จะสลักลงหน้าจอทันที' : '• Backed by local storage simulated state. Full client reactivity.'}</p>
            </div>

          </nav>
        </aside>

        {/* Dynamic Inner Workspace Content */}
        <section className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >

              {/* TAB: MY BOOKINGS (For students and staff) */}
              {currentTab === 'bookings' && (
                <div id="bookings-window" className="space-y-4 text-left">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 heading-font">{t('tabBookings')}</h2>
                      <p className="text-xs text-slate-500">
                        {lang === 'th' ? 'ตรวจสอบประวัติและติดตามสถานะอนุมัติคิวจองรถ มอ.' : 'Observe history and active review statuses of your fleet submissions.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('new-booking')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-xs hover:shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer max-w-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('tabNewBooking')}</span>
                    </button>
                  </div>

                  {bookings.filter(b => b.userId === activeUserProfile().id).length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center shadow-sm">
                      <Calendar className="w-10 h-10 text-slate-300 mb-3" />
                      <p className="text-sm font-bold">{lang === 'th' ? 'ยังไม่มีคิวจองประวัติของคุณในขณะนี้' : 'No reservation records on your account.'}</p>
                      <p className="text-xs text-slate-400 mt-1">{lang === 'th' ? 'ลองเดินทางร่วมกิจกรรมโดยกดปุ่ม จองรถใหม่ ด้านบน' : 'Build a journey catalog by clicking the Book a Vehicle button'}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search & Filter Bar */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <div className="relative flex-1 w-full">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="text"
                            placeholder={lang === 'th' ? 'ค้นหาการจอง (จุดหมาย, วัตถุประสงค์, ทะเบียน, คนขับ)...' : 'Search booking (destination, purpose, plate, driver)...'}
                            value={searchBooking}
                            onChange={(e) => setSearchBooking(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-slate-50 text-xs font-semibold border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-lg w-full transition-all text-slate-700"
                          />
                        </div>
                        <div className="w-full sm:w-auto flex gap-2">
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-50 text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 cursor-pointer transition-all w-full text-slate-700"
                          >
                            <option value="all">📁 {lang === 'th' ? 'ทุกสถานะ' : 'All Statuses'}</option>
                            <option value="pending">⏳ {lang === 'th' ? 'รออนุมัติ' : 'Pending'}</option>
                            <option value="approved">✅ {lang === 'th' ? 'อนุมัติแล้ว' : 'Approved'}</option>
                            <option value="rejected">❌ {lang === 'th' ? 'ปฏิเสธ' : 'Rejected'}</option>
                            <option value="cancelled">🚫 {lang === 'th' ? 'ยกเลิกแล้ว' : 'Cancelled'}</option>
                          </select>
                        </div>
                      </div>

                      {bookings
                        .filter(b => b.userId === activeUserProfile().id)
                        .filter(b => {
                          const query = searchBooking.toLowerCase();
                          const car = vehicles.find(v => v.id === b.vehicleId);
                          const carModel = car ? (lang === 'th' ? car.modelTh : car.modelEn).toLowerCase() : '';
                          const carPlate = car ? car.plateNumber.toLowerCase() : '';
                          const carDriver = car ? (lang === 'th' ? car.driverNameTh : car.driverNameEn).toLowerCase() : '';

                          const matchesSearch =
                            b.destination.toLowerCase().includes(query) ||
                            b.purpose.toLowerCase().includes(query) ||
                            carModel.includes(query) ||
                            carPlate.includes(query) ||
                            carDriver.includes(query);

                          const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
                          return matchesSearch && matchesStatus;
                        }).length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                          <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm font-semibold">{lang === 'th' ? 'ไม่พบข้อมูลการจองที่ตรงกับการค้นหา' : 'No bookings match your search filters.'}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-5">
                          {bookings
                            .filter(b => b.userId === activeUserProfile().id)
                            .filter(b => {
                              const query = searchBooking.toLowerCase();
                              const car = vehicles.find(v => v.id === b.vehicleId);
                              const carModel = car ? (lang === 'th' ? car.modelTh : car.modelEn).toLowerCase() : '';
                              const carPlate = car ? car.plateNumber.toLowerCase() : '';
                              const carDriver = car ? (lang === 'th' ? car.driverNameTh : car.driverNameEn).toLowerCase() : '';

                              const matchesSearch =
                                b.destination.toLowerCase().includes(query) ||
                                b.purpose.toLowerCase().includes(query) ||
                                carModel.includes(query) ||
                                carPlate.includes(query) ||
                                carDriver.includes(query);

                              const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
                              return matchesSearch && matchesStatus;
                            })
                            .map(b => {
                              const car = vehicles.find(v => v.id === b.vehicleId);
                              return (
                                <div
                                  key={b.id}
                                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow relative overflow-hidden"
                                >
                                  {/* Left part: description */}
                                  <div className="space-y-4 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      {/* Status indicators */}
                                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${b.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                          b.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            b.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                                        }`}>
                                        {t(b.status)}
                                      </span>
                                      <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                        ID: {b.id}
                                      </span>
                                    </div>

                                    <div className="space-y-1.5">
                                      <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                                        <MapPin className="w-4.5 h-4.5 text-slate-400 flex-shrink-0" />
                                        <span>{b.destination}</span>
                                      </h3>
                                      <p className="text-xs text-slate-600 font-sans">
                                        <strong className="text-slate-700 font-semibold">{t('purpose')}:</strong> {b.purpose}
                                      </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs pt-3.5 border-t border-slate-100 text-slate-500 font-medium">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span>{b.startDate === b.endDate ? b.startDate : `${b.startDate} - ${b.endDate}`}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span>{b.startTime} - {b.endTime}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <span>{b.passengers} {t('seats')}</span>
                                      </div>
                                    </div>

                                    {/* Vehicle associated detail */}
                                    {car && (
                                      <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between text-xs text-slate-600 border border-slate-200">
                                        <div className="flex items-center gap-2.5">
                                          <div className="bg-white p-2 rounded-lg border border-slate-200 text-blue-600">
                                            <Car className="w-4.5 h-4.5" />
                                          </div>
                                          <div>
                                            <p className="font-bold text-slate-800 font-heading">{lang === 'th' ? car.modelTh : car.modelEn}</p>
                                            <p className="text-[10px] font-mono text-slate-500 font-semibold">{car.plateNumber} • Capacity {car.capacity}</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-bold text-[11px] text-slate-700">{lang === 'th' ? car.driverNameTh : car.driverNameEn}</p>
                                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center justify-end">
                                            <Phone className="w-2.5 h-2.5 mr-0.5" />
                                            {car.driverPhone}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Admin Rejection Reason notes projection */}
                                    {b.notes && b.status === 'rejected' && (
                                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-800">
                                        <strong>{lang === 'th' ? 'เหตุผลที่ปฏิเสธ:' : 'Reason for rejection:'}</strong> {b.notes}
                                      </div>
                                    )}
                                  </div>

                                  {/* Right part: action */}
                                  <div className="flex items-start md:items-end justify-end">
                                    {b.status === 'pending' && (
                                      <button
                                        onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                                        className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:text-rose-650 hover:bg-rose-50 hover:border-rose-200 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                        <span>{t('cancel')}</span>
                                      </button>
                                    )}
                                  </div>

                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: CREATE NEW BOOKING */}
              {currentTab === 'new-booking' && (
                <div id="booking-creator-window" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-left space-y-6">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 font-heading flex items-center gap-2">
                      <Calendar className="w-5.5 h-5.5 text-blue-600" />
                      <span>{t('bookingFormTitle')}</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'th' ? 'กรอกรายละเอียดจัดยานพาหนะ คณะกรรมการระบบตรวจสอบสถานะความจุและตารางทับซ้อนอัตโนมัติ' : 'Coordinate trip parameters. Live system filters vehicle slots using deep validation.'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmitBooking} className="space-y-5">

                    {/* Time & Dates selector grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t('startDate')} *</label>
                        <input
                          type="date"
                          required
                          min={getTodayDateString()}
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full text-xs font-semibold border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-lg p-2.5 bg-slate-50 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t('endDate')} *</label>
                        <input
                          type="date"
                          required
                          min={formData.startDate || getTodayDateString()}
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full text-xs font-semibold border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-lg p-2.5 bg-slate-50 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t('startTime')} *</label>
                        <input
                          type="time"
                          required
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          className="w-full text-xs font-semibold border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-lg p-2.5 bg-slate-50 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t('endTime')} *</label>
                        <input
                          type="time"
                          required
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          className="w-full text-xs font-semibold border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-lg p-2.5 bg-slate-50 transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Passenger count limitation check */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t('passengersCount')} *</label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          required
                          value={formData.passengers}
                          onChange={(e) => setFormData({ ...formData, passengers: Number(e.target.value) })}
                          className="w-full text-xs font-semibold border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-lg p-2.5 bg-slate-50 transition-all outline-none"
                        />
                      </div>

                      {/* Travel Destination detail */}
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t('destination')} *</label>
                        <input
                          type="text"
                          required
                          placeholder={t('destPlaceHolder')}
                          value={formData.destination}
                          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                          className="w-full text-xs font-semibold border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-lg p-2.5 bg-slate-50 transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Purpose details */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t('purpose')} *</label>
                      <textarea
                        rows={2}
                        required
                        placeholder={t('purposePlaceHolder')}
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        className="w-full text-xs font-semibold border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-lg p-2.5 bg-slate-50 transition-all outline-none"
                      />
                    </div>

                    {/* LIVE DYNAMIC SYSTEM: Available Vehicles corresponding to dates parameter */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-450 tracking-widest font-mono block mb-3 uppercase">
                        {lang === 'th' ? 'ผลลัพธ์การคัดกรองยานพาหนะที่ตรงต้องการและว่างใช้งาน' : 'FILTERED AVAILABLE VEHICLES MATCHING SCHEDULE'}
                      </span>

                      {getAvailableVehiclesList().length === 0 ? (
                        <div className="p-4 bg-amber-50 text-amber-800 rounded-xl flex items-center gap-2 text-xs border border-amber-200">
                          <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0" />
                          <span className="font-semibold">{t('noCarAvail')}</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                          {getAvailableVehiclesList().map(car => (
                            <button
                              key={car.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, vehicleId: car.id })}
                              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${formData.vehicleId === car.id
                                  ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-100 shadow-sm'
                                  : 'bg-white border-slate-200 hover:border-slate-350 hover:shadow-xs'
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-600 uppercase tracking-wide">
                                  {t(car.type)}
                                </span>
                                <span className="text-[10px] font-bold text-slate-700 font-mono">
                                  {car.plateNumber}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 mt-2.5 truncate font-heading">
                                {lang === 'th' ? car.modelTh : car.modelEn}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-mono mt-1">
                                {t('capacity')}: {car.capacity} {t('seats')}
                              </p>
                              <div className="flex items-center justify-between border-t border-slate-100 mt-2.5 pt-2 text-[10px] text-slate-500 font-medium">
                                <span>👤 {lang === 'th' ? car.driverNameTh : car.driverNameEn}</span>
                                <span>⚡ {lang === 'th' ? car.fuelTypeTh : car.fuelTypeEn}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Extra Comments or logs */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{lang === 'th' ? 'หมายเหตุอื่นๆ' : 'Extra Requirements / Notes'}</label>
                      <input
                        type="text"
                        placeholder={lang === 'th' ? 'เช่น ของต้องการรถเครื่องปรับอากาศเย็นพิเศษ, รถเข็นเก้าอี้วิลแชร์' : 'e.g. Needs specialized space, wheelchair support'}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full text-xs font-semibold border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-lg p-2.5 bg-slate-50 transition-all outline-none"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={!formData.vehicleId}
                      className={`w-full py-3.5 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 ${formData.vehicleId
                          ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                          : 'bg-slate-300 cursor-not-allowed shadow-none'
                        }`}
                    >
                      <Check className="w-4.5 h-4.5" />
                      <span>{t('submitBooking')}</span>
                    </button>

                  </form>
                </div>
              )}

              {/* TAB: VEHICLES FLEET INFO PANEL */}
              {currentTab === 'vehicles' && (
                <div id="fleet-viewer-window" className="space-y-6 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 font-heading">{t('tabVehicles')}</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {lang === 'th' ? 'รายชื่อโรงจอดรถมหาวิทยาลัยพัทลุง ตารางความจุ และคนขับขี่' : 'Browse active university automotive assets, drivers, capacities, and scheduling states.'}
                      </p>
                    </div>

                    {/* Search & filters controls */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          placeholder={t('searchPlaceholder')}
                          value={searchCar}
                          onChange={(e) => setSearchCar(e.target.value)}
                          className="pl-10 pr-4 py-2.5 bg-slate-50 text-xs font-semibold border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-lg w-full sm:w-60 transition-all"
                        />
                      </div>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-slate-50 text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 cursor-pointer transition-all"
                      >
                        <option value="all">🚙 {t('filterAll')}</option>
                        <option value="van">🚐 {t('van')}</option>
                        <option value="bus">🚌 {t('bus')}</option>
                        <option value="sedan">🚗 {t('sedan')}</option>
                        <option value="pickup">🛻 {t('pickup')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.length === 0 ? (
                      <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
                        {t('noData')}
                      </div>
                    ) : (
                      filteredVehicles.map(car => (
                        <div
                          key={car.id}
                          className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-5 space-y-4 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                {t(car.type)}
                              </span>
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border ${car.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  car.status === 'maintenance' ? 'bg-amber-50 text-amber-750 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                {t(car.status)}
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-slate-900 mt-4.5 font-heading">
                              {lang === 'th' ? car.modelTh : car.modelEn}
                            </h3>
                            <p className="text-xs text-slate-405 font-mono font-bold mt-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block">{car.plateNumber}</p>

                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
                              <div>
                                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('capacity')}</span>
                                <span className="font-bold text-slate-800 font-heading">{car.capacity} {t('seats')}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('fuelType')}</span>
                                <span className="font-bold text-slate-800 font-heading">{lang === 'th' ? car.fuelTypeTh : car.fuelTypeEn}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mt-3 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('driver')}</p>
                              <p className="font-bold text-slate-800 mt-0.5 font-heading leading-tight">{lang === 'th' ? car.driverNameTh : car.driverNameEn}</p>
                            </div>
                            <a
                              href={`tel:${car.driverPhone}`}
                              className="bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-500 hover:bg-slate-50 p-2.5 rounded-lg transition-all flex items-center shadow-xs"
                              title="Call Driver"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: ADMIN BOOKINGS BOARD */}
              {currentTab === 'admin-bookings' && role === 'admin' && (
                <div id="admin-board-window" className="space-y-6 text-left">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 font-heading">{t('adminPanel')}</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'th' ? 'คัดกรองคำจอง ตรวจจราจร ตรวจความขัดแย้งเวลา และอนุมัติ/ปฎิเสธ เพื่อความลื่นไหล' : 'Observe, manage conflicts, and adjust booking validation flags securely.'}
                    </p>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-550 shadow-sm">
                      {t('noData')}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search & Filter Controls for Admin */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <div className="relative flex-1 w-full">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="text"
                            placeholder={lang === 'th' ? 'ค้นหารายการจอง (ชื่อผู้จอง, จุดหมาย, วัตถุประสงค์, ทะเบียนรถ, คนขับ)...' : 'Search bookings (requester, destination, purpose, plate, driver)...'}
                            value={searchAdminBooking}
                            onChange={(e) => setSearchAdminBooking(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-slate-50 text-xs font-semibold border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-lg w-full transition-all text-slate-700"
                          />
                        </div>
                        <div className="w-full sm:w-auto flex gap-2">
                          <select
                            value={adminStatusFilter}
                            onChange={(e) => setAdminStatusFilter(e.target.value)}
                            className="bg-slate-50 text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 cursor-pointer transition-all w-full text-slate-700"
                          >
                            <option value="all">📁 {lang === 'th' ? 'ทุกสถานะ' : 'All Statuses'}</option>
                            <option value="pending">⏳ {lang === 'th' ? 'รออนุมัติ' : 'Pending'}</option>
                            <option value="approved">✅ {lang === 'th' ? 'อนุมัติแล้ว' : 'Approved'}</option>
                            <option value="rejected">❌ {lang === 'th' ? 'ปฏิเสธ' : 'Rejected'}</option>
                            <option value="cancelled">🚫 {lang === 'th' ? 'ยกเลิกแล้ว' : 'Cancelled'}</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-widest border-b border-slate-200">
                              <tr>
                                <th className="px-5 py-4">{t('name')}</th>
                                <th className="px-5 py-4">{lang === 'th' ? 'ยานพาหนะ' : 'Vehicle Target'}</th>
                                <th className="px-5 py-4">{lang === 'th' ? 'กำหนดการ' : 'Schedule Window'}</th>
                                <th className="px-5 py-4">{lang === 'th' ? 'ความจุ/จุดเดินทาง' : 'Trip Destination'}</th>
                                <th className="px-5 py-4 text-center">สถานะ</th>
                                <th className="px-5 py-4 text-center">{t('action')}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {bookings
                                .filter(b => {
                                  const query = searchAdminBooking.toLowerCase();
                                  const car = vehicles.find(v => v.id === b.vehicleId);
                                  const carModel = car ? (lang === 'th' ? car.modelTh : car.modelEn).toLowerCase() : '';
                                  const carPlate = car ? car.plateNumber.toLowerCase() : '';
                                  const carDriver = car ? (lang === 'th' ? car.driverNameTh : car.driverNameEn).toLowerCase() : '';

                                  const matchesSearch =
                                    b.userName.toLowerCase().includes(query) ||
                                    b.destination.toLowerCase().includes(query) ||
                                    b.purpose.toLowerCase().includes(query) ||
                                    carModel.includes(query) ||
                                    carPlate.includes(query) ||
                                    carDriver.includes(query) ||
                                    b.userRole.toLowerCase().includes(query);

                                  const matchesStatus = adminStatusFilter === 'all' || b.status === adminStatusFilter;
                                  return matchesSearch && matchesStatus;
                                })
                                .map(b => {
                                  const car = vehicles.find(v => v.id === b.vehicleId);
                                  return (
                                    <tr key={b.id} className="hover:bg-slate-50/40 transition-colors">
                                      {/* Operator profile */}
                                      <td className="px-5 py-4">
                                        <p className="font-bold text-slate-900 text-sm font-heading">{b.userName}</p>
                                        <p className="text-[10px] text-slate-400 flex items-center mt-1">
                                          <span className="font-bold uppercase bg-slate-100 py-0.5 px-2 rounded-md mr-2 text-slate-600 text-[9px] border border-slate-200">
                                            {t(b.userRole)}
                                          </span>
                                          📞 {b.userPhone}
                                        </p>
                                      </td>

                                      {/* Vehicle target */}
                                      <td className="px-5 py-4">
                                        {car ? (
                                          <div>
                                            <p className="font-bold text-slate-800 font-heading">{lang === 'th' ? car.modelTh : car.modelEn}</p>
                                            <p className="text-[10px] font-mono text-slate-500 font-semibold mt-0.5">{car.plateNumber}</p>
                                          </div>
                                        ) : (
                                          <p className="text-slate-400 font-semibold">-</p>
                                        )}
                                      </td>

                                      {/* Schedule details */}
                                      <td className="px-5 py-4 font-mono text-slate-600 font-medium">
                                        <div className="flex items-center space-x-1.5 mb-1 text-slate-700 font-bold">
                                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                          <span>{b.startDate}</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5">
                                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                                          <span>{b.startTime} - {b.endTime}</span>
                                        </div>
                                      </td>

                                      {/* Destination details & Purpose */}
                                      <td className="px-5 py-4 max-w-xs">
                                        <p className="font-bold text-slate-900 truncate mb-1 flex items-center gap-1.5 font-heading">
                                          <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                                          <span>{b.destination}</span>
                                        </p>
                                        <p className="text-[10px] text-slate-500 truncate leading-relaxed">{b.purpose}</p>
                                      </td>

                                      {/* State indicator status */}
                                      <td className="px-5 py-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border tracking-wide ${b.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-250 animate-pulse' :
                                            b.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' :
                                              b.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-250' : 'bg-slate-50 text-slate-500 border-slate-200'
                                          }`}>
                                          {t(b.status)}
                                        </span>
                                      </td>

                                      {/* Action Buttons for admins */}
                                      <td className="px-5 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                          {b.status === 'pending' ? (
                                            <>
                                              <button
                                                onClick={() => handleUpdateBookingStatus(b.id, 'approved')}
                                                className="px-2.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm shadow-emerald-500/10 cursor-pointer"
                                                title="Approve Booking"
                                              >
                                                <Check className="w-3 h-3" />
                                                <span>{t('approve')}</span>
                                              </button>
                                              <button
                                                onClick={() => openRejectionDialog(b)}
                                                className="px-2.5 py-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm shadow-rose-500/10 cursor-pointer"
                                                title="Reject Booking"
                                              >
                                                <X className="w-3 h-3 text-white" />
                                                <span>{t('reject')}</span>
                                              </button>
                                            </>
                                          ) : b.status === 'approved' ? (
                                            <button
                                              onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                                              className="px-2 py-1.5 border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                            >
                                              <X className="w-3 h-3" />
                                              <span>{t('cancel')}</span>
                                            </button>
                                          ) : (
                                            <span className="text-[11px] text-slate-400 font-semibold italic">{t(b.status)}</span>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: ADMIN VEHICLES MANAGEMENT */}
              {currentTab === 'admin-vehicles' && role === 'admin' && (
                <div id="admin-vehicles-window" className="space-y-6 text-left">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 font-heading">{t('tabAdminVehicles')}</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {lang === 'th' ? 'กระดาน CRUD ยานพาหนะส่วนกลาง รงแรม และบัญชีคนสับรถ' : 'Operate fleet additions, drivers profiles detail, plate coordinates and fuel stats.'}
                      </p>
                    </div>

                    {!isAddingCar && (
                      <button
                        onClick={() => {
                          setEditingCarId(null);
                          setCarFormData({
                            modelTh: '', modelEn: '', plateNumber: '', type: 'van', capacity: 10, status: 'available',
                            driverNameTh: '', driverNameEn: '', driverPhone: '', fuelTypeTh: 'ดีเซล', fuelTypeEn: 'Diesel'
                          });
                          setIsAddingCar(true);
                        }}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t('addNewCar')}</span>
                      </button>
                    )}
                  </div>

                  {/* Add / Edit Vehicle form drawer */}
                  {isAddingCar && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900 font-heading">
                          {editingCarId ? t('editCar') : t('addNewCar')}
                        </h3>
                        <button
                          onClick={() => setIsAddingCar(false)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveCar} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('fieldPlate')} *</label>
                            <input
                              type="text"
                              required
                              placeholder="เช่น กข 1234 พัทลุง"
                              value={carFormData.plateNumber}
                              onChange={(e) => setCarFormData({ ...carFormData, plateNumber: e.target.value })}
                              className="w-full text-xs font-medium border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 bg-slate-50 rounded-lg p-2.5 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('fieldCapacity')} *</label>
                            <input
                              type="number"
                              required
                              value={carFormData.capacity}
                              onChange={(e) => setCarFormData({ ...carFormData, capacity: Number(e.target.value) })}
                              className="w-full text-xs font-medium border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 bg-slate-50 rounded-lg p-2.5 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{lang === 'th' ? 'ประเภทรถ' : 'Car Type'} *</label>
                            <select
                              value={carFormData.type}
                              onChange={(e) => setCarFormData({ ...carFormData, type: e.target.value as VehicleType })}
                              className="w-full text-xs font-bold border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 bg-slate-50 rounded-lg p-2.5 transition-all"
                            >
                              <option value="van">🚐 {t('van')}</option>
                              <option value="bus">🚌 {t('bus')}</option>
                              <option value="sedan">🚗 {t('sedan')}</option>
                              <option value="pickup">🛻 {t('pickup')}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">สถานะใช้งาน *</label>
                            <select
                              value={carFormData.status}
                              onChange={(e) => setCarFormData({ ...carFormData, status: e.target.value as 'available' | 'maintenance' | 'busy' })}
                              className="w-full text-xs font-bold border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 bg-slate-50 rounded-lg p-2.5 transition-all"
                            >
                              <option value="available">🟢 {t('available')}</option>
                              <option value="maintenance">🟡 {t('maintenance')}</option>
                              <option value="busy">🔴 {t('busy')}</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('fieldModelTh')} *</label>
                            <input
                              type="text"
                              required
                              placeholder="เช่น โตโยต้า คอมมิวเตอร์"
                              value={carFormData.modelTh}
                              onChange={(e) => setCarFormData({ ...carFormData, modelTh: e.target.value })}
                              className="w-full text-xs font-medium border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 bg-slate-50 rounded-lg p-2.5 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('fieldModelEn')} *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Toyota Commuter"
                              value={carFormData.modelEn}
                              onChange={(e) => setCarFormData({ ...carFormData, modelEn: e.target.value })}
                              className="w-full text-xs font-medium border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 bg-slate-50 rounded-lg p-2.5 transition-all"
                            />
                          </div>
                        </div>

                        {/* Driver credentials */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('fieldDriverTh')} *</label>
                            <input
                              type="text"
                              required
                              placeholder="เช่น นายมานพ สุขสันต์"
                              value={carFormData.driverNameTh}
                              onChange={(e) => setCarFormData({ ...carFormData, driverNameTh: e.target.value })}
                              className="w-full text-xs font-medium border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 bg-slate-50 rounded-lg p-2.5 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('fieldDriverEn')} *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Mr. Manop Suksan"
                              value={carFormData.driverNameEn}
                              onChange={(e) => setCarFormData({ ...carFormData, driverNameEn: e.target.value })}
                              className="w-full text-xs font-medium border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 bg-slate-50 rounded-lg p-2.5 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('fieldDriverPhone')} *</label>
                            <input
                              type="text"
                              required
                              placeholder="เช่น 081-000-0000"
                              value={carFormData.driverPhone}
                              onChange={(e) => setCarFormData({ ...carFormData, driverPhone: e.target.value })}
                              className="w-full text-xs font-medium border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 bg-slate-50 rounded-lg p-2.5 transition-all"
                            />
                          </div>
                        </div>

                        {/* Fuel configurations */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('fieldFuelTh')}</label>
                            <input
                              type="text"
                              value={carFormData.fuelTypeTh}
                              onChange={(e) => setCarFormData({ ...carFormData, fuelTypeTh: e.target.value })}
                              className="w-full text-xs font-medium border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 bg-slate-50 rounded-lg p-2.5 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('fieldFuelEn')}</label>
                            <input
                              type="text"
                              value={carFormData.fuelTypeEn}
                              onChange={(e) => setCarFormData({ ...carFormData, fuelTypeEn: e.target.value })}
                              className="w-full text-xs font-medium border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 bg-slate-50 rounded-lg p-2.5 transition-all"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-bold text-white text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                        >
                          {editingCarId ? (lang === 'th' ? 'บันทึกการแก้ไข' : 'Save Changes') : t('addCarBtn')}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Fleet Grid for admin */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map(car => (
                      <div
                        key={car.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                              {t(car.type)}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border ${car.status === 'available' ? 'bg-emerald-50 text-emerald-750 border-emerald-200' :
                                car.status === 'maintenance' ? 'bg-amber-50 text-amber-750 border-amber-200' : 'bg-rose-50 text-rose-705 border-rose-200'
                              }`}>
                              {t(car.status)}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 mt-4.5 font-heading">
                            {lang === 'th' ? car.modelTh : car.modelEn}
                          </h3>
                          <p className="text-xs text-slate-405 font-mono font-bold mt-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block">{car.plateNumber}</p>

                          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                            <p className="flex items-center gap-1">
                              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">👥 {t('capacity')}:</span>
                              <strong className="text-slate-800 font-bold font-heading">{car.capacity} {t('seats')}</strong>
                            </p>
                            <p className="flex items-center gap-1">
                              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">👤 {t('driver')}:</span>
                              <strong className="text-slate-800 font-bold font-heading">{lang === 'th' ? car.driverNameTh : car.driverNameEn}</strong>
                              <span className="text-slate-400 font-mono">({car.driverPhone})</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100">
                          <button
                            onClick={() => handleEditCarClick(car)}
                            className="flex-1 py-2 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-500 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{lang === 'th' ? 'แก้ไข' : 'Edit'}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCar(car.id)}
                            className="py-2 px-3 border border-slate-200 text-rose-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-lg transition-all flex items-center justify-center cursor-pointer"
                            title="Delete Vehicle"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB: REPORTS & STATS PANEL WITH BEAUTIFUL SVGS */}
              {currentTab === 'reports' && (
                <div id="reports-window" className="space-y-6 text-left">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 heading-font">{t('tabReports')}</h2>
                    <p className="text-xs text-slate-500">
                      {lang === 'th' ? 'รายงานผลเชิงวิเคราะห์ ประสิทธิภาพและสถิติดิจิตอลสถิติการใช้ยานพาหนะกองกลาง' : 'Interactive real-time SVG charting dashboard classifying vehicle parameters.'}
                    </p>
                  </div>

                  {/* Summary Metric cards widgets */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

                    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex items-center space-x-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{t('statTotalBookings')}</p>
                        <p className="text-2xl font-black font-display text-slate-900 mt-0.5">{totalBookingsCount}</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex items-center space-x-4">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <CheckSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{t('statApproved')}</p>
                        <p className="text-2xl font-black font-display text-slate-900 mt-0.5">{approvedBookingsCount}</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex items-center space-x-4">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <Clock className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{t('statPending')}</p>
                        <p className="text-2xl font-black font-display text-slate-900 mt-0.5">{pendingBookingsCount}</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex items-center space-x-4">
                      <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{t('statUtilisation')}</p>
                        <p className="text-2xl font-black font-display text-slate-900 mt-0.5">{utilizationPercentage}%</p>
                      </div>
                    </div>

                  </div>

                  {/* Grid Layout containing beautiful SVGs */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Visual Bar chart of vehicle usage class */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-display mb-4">
                        📈 {t('chartBookingByType')}
                      </h3>

                      <div className="flex flex-col space-y-4 pt-2">
                        {getUtilizationByCarType().map((item, idx) => {
                          const maxBookings = Math.max(...getUtilizationByCarType().map(x => x.bookingsCount), 1);
                          const percentageBar = Math.round((item.bookingsCount / maxBookings) * 100);

                          return (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-semibold text-slate-700">
                                <span className="flex items-center">
                                  <span className={`w-2.5 h-2.5 rounded-full mr-2 ${item.type === 'van' ? 'bg-blue-500' :
                                      item.type === 'bus' ? 'bg-orange-500' :
                                        item.type === 'sedan' ? 'bg-emerald-500' : 'bg-indigo-500'
                                    }`} />
                                  {item.labelTh} ({item.type.toUpperCase()})
                                </span>
                                <span>{item.bookingsCount} (Trips)</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentageBar}%` }}
                                  transition={{ duration: 0.6 }}
                                  className={`h-full rounded-full ${item.type === 'van' ? 'bg-blue-500' :
                                      item.type === 'bus' ? 'bg-orange-500' :
                                        item.type === 'sedan' ? 'bg-emerald-500' : 'bg-indigo-600'
                                    }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Donut Style Chart via SVG */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-display mb-3">
                        🎯 {t('chartStatusBreakdown')}
                      </h3>

                      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-3">
                        {/* Circular Donut Diagram */}
                        <div className="relative w-36 h-36">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            {/* Base Gray */}
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />

                            {/* Segment 1: Approved */}
                            <circle
                              cx="18" cy="18" r="15.915"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="3.2"
                              strokeDasharray={`${totalBookingsCount > 0 ? (approvedBookingsCount / totalBookingsCount) * 100 : 0} ${100 - (totalBookingsCount > 0 ? (approvedBookingsCount / totalBookingsCount) * 100 : 0)}`}
                              strokeDashoffset="0"
                            />

                            {/* Segment 2: Pending */}
                            <circle
                              cx="18" cy="18" r="15.915"
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="3.2"
                              strokeDasharray={`${totalBookingsCount > 0 ? (pendingBookingsCount / totalBookingsCount) * 100 : 0} ${100 - (totalBookingsCount > 0 ? (pendingBookingsCount / totalBookingsCount) * 100 : 0)}`}
                              strokeDashoffset={`-${totalBookingsCount > 0 ? (approvedBookingsCount / totalBookingsCount) * 100 : 0}`}
                            />
                          </svg>

                          {/* Inner Label centered */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-black text-slate-800 font-display">{totalBookingsCount}</span>
                            <span className="text-[10px] text-slate-400 tracking-wider">REQS</span>
                          </div>
                        </div>

                        {/* Chart Legends */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-slate-600">{t('approved')}: <strong>{approvedBookingsCount}</strong></span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-slate-600">{t('pending')}: <strong>{pendingBookingsCount}</strong></span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-slate-300" />
                            <span className="text-slate-600">{lang === 'th' ? 'ปฏิเสธ/ยกเลิก' : 'Cancelled/Other'}: <strong>{bookings.filter(b => b.status === 'rejected' || b.status === 'cancelled').length}</strong></span>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* Leaderboard panel list destinations */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-display mb-4">
                      📍 {t('topDestinations')}
                    </h3>

                    {getDestinationLeaderboard().length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">{t('noData')}</p>
                    ) : (
                      <div className="space-y-3">
                        {getDestinationLeaderboard().map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs pb-2 border-b border-slate-50 last:border-0">
                            <div className="flex items-center space-x-3">
                              <span className="w-5 h-5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="font-semibold text-slate-800">{item.destination}</span>
                            </div>
                            <span className="bg-slate-100 font-mono text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                              {item.count} ถอนจอง / Trips
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-display text-sm font-semibold text-slate-300">
            {t('appTitle')} • {lang === 'th' ? 'คณะผู้บริหารจัดการยานพาหนะกองกลาง' : 'Office of University Logistics'}
          </p>
          <p className="opacity-70">
            {lang === 'th'
              ? 'ระบบประสานแผนยานยนต์อัจฉริยะ รองรับแอดมิน นักศึกษา และหน่วยงานปฏิบัติการกองขัดเกลาการจอง'
              : 'Intelligent automotive reservation portal. Built fully compliant with all client role restrictions.'}
          </p>
          <p className="text-[10px] opacity-40 font-mono">
            © 2026 TSU Logistics Inc. Platform Sandbox Mode.
          </p>
        </div>
      </footer>

      {/* MODAL: ADMIN ADDS REJECTION COMMENT (For administrative reasons) */}
      <AnimatePresence>
        {rejectionModalBooking && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-rose-100 p-6 shadow-2xl max-w-md w-full text-left space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-rose-50">
                <h3 className="text-sm font-bold text-slate-900 font-display flex items-center space-x-1">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>{lang === 'th' ? 'ระบุเหตุผลในการปฏิเสธคำจอง' : 'Provide Rejection Explanation'}</span>
                </h3>
                <button
                  onClick={() => setRejectionModalBooking(null)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">
                  {lang === 'th' ? 'พิมพ์อธิบายเพื่อให้ผู้จองเห็นแนวทางแก้ไขคำยื่นจองคิวรถกองกลาง:' : 'This explanation will be logged and visible to the requestor:'}
                </p>
                <textarea
                  rows={3}
                  required
                  placeholder={lang === 'th' ? 'เช่น ทะเบียนนี้ว่างแต่คนขับลาพักร้อน, หรือจำกัดที่นั่งเกินความปลอดภัย' : 'e.g. Driver is on vacation leave, or passenger list violates safety capacities'}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full text-xs border border-slate-200 focus:outline-none focus:border-rose-600 rounded-xl p-3 bg-slate-50"
                />
              </div>

              <div className="flex space-x-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectionModalBooking(null)}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRejectionSubmit}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {t('reject')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
