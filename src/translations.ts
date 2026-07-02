import { LanguageDictionary } from './types';

export const translations: LanguageDictionary = {
  // Navigation & General
  appTitle: {
    th: 'ระบบจองรถมหาวิทยาลัย',
    en: 'University Car Booking',
  },
  appSubtitle: {
    th: 'ระบบบริการยานพาหนะสำหรับบุคลากรและนักศึกษา',
    en: 'Vehicle coordination system for staff and students',
  },
  roleSelector: {
    th: 'บทบาทปัจจุบัน',
    en: 'Current Role',
  },
  student: {
    th: 'นักศึกษา',
    en: 'Student',
  },
  staff: {
    th: 'อาจารย์ / บุคลากร',
    en: 'Professor / Staff',
  },
  admin: {
    th: 'ผู้ดูแลระบบ',
    en: 'Admin',
  },
  switchRole: {
    th: 'เปลี่ยนบทบาท',
    en: 'Switch Role',
  },
  searchPlaceholder: {
    th: 'ค้นหายานพาหนะ (รุ่น, ทะเบียน, คนขับ)...',
    en: 'Search vehicle (model, plate, driver)...',
  },
  filterAll: {
    th: 'ทั้งหมด',
    en: 'All Types',
  },
  noData: {
    th: 'ไม่พบข้อมูล',
    en: 'No Data Found',
  },

  // Tabs
  tabBookings: {
    th: 'รายการจองของฉัน',
    en: 'My Bookings',
  },
  tabNewBooking: {
    th: 'จองรถใหม่',
    en: 'Book a Vehicle',
  },
  tabVehicles: {
    th: 'ข้อมูลยานพาหนะ',
    en: 'Vehicles Info',
  },
  tabAdminBookings: {
    th: 'การอนุมัติจองรถ',
    en: 'Approval Board',
  },
  tabAdminVehicles: {
    th: 'จัดการยานพาหนะ',
    en: 'Manage Vehicles',
  },
  tabReports: {
    th: 'รายงานและสถิติ',
    en: 'Reports & Stats',
  },

  // Vehicle Details & Types
  van: {
    th: 'รถตู้',
    en: 'Van',
  },
  bus: {
    th: 'รถบัส / รถทัวร์',
    en: 'Coach Bus',
  },
  sedan: {
    th: 'รถเก๋ง',
    en: 'Sedan Car',
  },
  pickup: {
    th: 'รถกระบะ / รถขนกระเป๋า',
    en: 'Pickup Truck',
  },
  capacity: {
    th: 'ความจุผู้โดยสาร',
    en: 'Passenger Capacity',
  },
  seats: {
    th: 'ที่นั่ง',
    en: 'seats',
  },
  driver: {
    th: 'พนักงานขับรถ',
    en: 'Driver Name',
  },
  fuelType: {
    th: 'ประเภทเชื้อเพลิง',
    en: 'Fuel Type',
  },
  gasoline: {
    th: 'เบนซิน',
    en: 'Gasoline',
  },
  diesel: {
    th: 'ดีเซล',
    en: 'Diesel',
  },
  electric: {
    th: 'ไฟฟ้า EV',
    en: 'Electric (EV)',
  },

  // Statuses
  available: {
    th: 'ว่างพร้อมใช้งาน',
    en: 'Available',
  },
  maintenance: {
    th: 'ปิดปรับปรุง / ซ่อมบำรุง',
    en: 'In Maintenance',
  },
  busy: {
    th: 'ไม่ว่าง / กำลังปฏิบัติงาน',
    en: 'On Duty',
  },
  pending: {
    th: 'รออนุมัติ',
    en: 'Pending',
  },
  approved: {
    th: 'อนุมัติแล้ว',
    en: 'Approved',
  },
  rejected: {
    th: 'ปฏิเสธ',
    en: 'Rejected',
  },
  cancelled: {
    th: 'ยกเลิกแล้ว',
    en: 'Cancelled',
  },

  // Booking Form
  bookingFormTitle: {
    th: 'แบบฟอร์มการจองยานพาหนะ',
    en: 'Vehicle Reservation Form',
  },
  selectCar: {
    th: 'เลือกรถที่ต้องการจอง',
    en: 'Select Target Vehicle',
  },
  noCarAvail: {
    th: 'ขออภัย ไม่มียานพาหนะที่ตรงเงื่อนไขว่างในวันดังกล่าว',
    en: 'No vehicle is available for the chosen date',
  },
  purpose: {
    th: 'วัตถุประสงค์ในการเดินทาง',
    en: 'Purpose of Travel',
  },
  purposePlaceHolder: {
    th: 'เช่น ไปร่วมสัมมนากิจกรรมนักศึกษา, ไปศึกษาดูงาน',
    en: 'e.g. Attending conference, student field trip',
  },
  destination: {
    th: 'สถานที่ปลายทาง (โปรดระบุจังหวัด/อำเภอ)',
    en: 'Destination Detail',
  },
  destPlaceHolder: {
    th: 'เช่น มหาวิทยาลัยทักษิณ วิทยาเขตพัทลุง',
    en: 'e.g. Thaksin University, Phatthalung Campus',
  },
  startDate: {
    th: 'วันที่เริ่มใช้งาน',
    en: 'Start Date',
  },
  endDate: {
    th: 'วันที่สิ้นสุดการใช้งาน',
    en: 'End Date',
  },
  startTime: {
    th: 'เวลาเริ่มปฏิบัติงาน',
    en: 'Departure Time',
  },
  endTime: {
    th: 'เวลากลับถึงสถาบัน',
    en: 'Expected Return Time',
  },
  passengersCount: {
    th: 'จำนวนผู้โดยสาร (ไม่เกินความจุรถ)',
    en: 'Number of Passengers (Must fit vehicle capacity)',
  },
  submitBooking: {
    th: 'ยืนยันและส่งคำขอจองรถ',
    en: 'Submit Reservation Request',
  },
  validationDateErr: {
    th: 'วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด',
    en: 'Start date cannot be after end date',
  },
  validationCapErr: {
    th: 'จำนวนผู้โดยสารสำหรับผู้จอง เกินความจุของรถที่เลือก',
    en: 'Passenger count exceeds the vehicle capacity',
  },
  validationTimeErr: {
    th: 'เวลาเริ่มต้นต้องมาก่อนเวลาสิ้นสุดสำหรับประเภทวันเดียวกัน',
    en: 'Start time must be before end time on the same date',
  },
  bookingSuccess: {
    th: 'ส่งข้อมูลการจองเรียบร้อยแล้ว! กำลังรอแอดมินพิจารณาอนุมัติ',
    en: 'Booking request submitted! Awaiting administrator approval.',
  },

  // Admin Dashboard Actions & Text
  adminPanel: {
    th: 'กระดานอนุมัติการจองพาหนะ (สำหรับผู้ดูแล)',
    en: 'Car Booking Approval Panel (Admin)',
  },
  vehicleManager: {
    th: 'จัดการรายการยานพาหนะเสริม',
    en: 'Vehicle Fleet Configurator',
  },
  name: {
    th: 'ชื่อหน่วยงาน / ชื่อผู้จอง',
    en: 'Requestor Name',
  },
  role: {
    th: 'ประเภทผู้จอง',
    en: 'Requestor Class',
  },
  phone: {
    th: 'เบอร์โทรศัทพ์ติดต่อ',
    en: 'Phone Number',
  },
  action: {
    th: 'การดำเนินการ',
    en: 'Action Panel',
  },
  approve: {
    th: 'อนุมัติ',
    en: 'Approve',
  },
  reject: {
    th: 'ปฏิเสธ',
    en: 'Reject',
  },
  cancel: {
    th: 'ยกเลิก',
    en: 'Cancel',
  },
  statusUpdated: {
    th: 'อัปเดตสถานะการจองสำเร็จ',
    en: 'Booking status successfully adjusted',
  },

  // Add/Edit Vehicle Form
  addNewCar: {
    th: 'เพิ่มยานพาหนะใหม่',
    en: 'Add New Fleet Vehicle',
  },
  addCarBtn: {
    th: 'บันทึกข้อมูลรถใหม่',
    en: 'Save Vehicle Information',
  },
  fieldPlate: {
    th: 'เลขทะเบียนรถ',
    en: 'Plate Number',
  },
  fieldModelTh: {
    th: 'ยี่ห้อ/รุ่น (ภาษาไทย)',
    en: 'Make & Model (Thai)',
  },
  fieldModelEn: {
    th: 'ยี่ห้อ/รุ่น (ภาษาอังกฤษ)',
    en: 'Make & Model (English)',
  },
  fieldCapacity: {
    th: 'จำนวนที่นั่งสูงสุด',
    en: 'Max Capacity (Seats)',
  },
  fieldDriverTh: {
    th: 'ชื่อผู้ขับขี่ (ภาษาไทย)',
    en: 'Driver Name (Thai)',
  },
  fieldDriverEn: {
    th: 'ชื่อผู้ขับขี่ (ภาษาอังกฤษ)',
    en: 'Driver Name (English)',
  },
  fieldDriverPhone: {
    th: 'เบอร์ติดต่อผู้ขับขี่',
    en: 'Driver Contact Phone',
  },
  fieldFuelTh: {
    th: 'ประเภทเชื้อเพลิง (TH)',
    en: 'Fuel Type (Thai)',
  },
  fieldFuelEn: {
    th: 'ประเภทเชื้อเพลิง (EN)',
    en: 'Fuel Type (English)',
  },
  editCar: {
    th: 'แก้ไขยานพาหนะ',
    en: 'Edit Fleet Vehicle',
  },
  deleteConfirm: {
    th: 'คุณต้องการลบยานพาหนะนี้ใช่หรือไม่?',
    en: 'Are you sure you want to delete this vehicle?',
  },

  // Reports Translation
  statTotalBookings: {
    th: 'การจองทั้งหมด',
    en: 'Total Reservations',
  },
  statApproved: {
    th: 'อนุมัติเรียบร้อย',
    en: 'Approved Trips',
  },
  statPending: {
    th: 'รอนุมัติ/พิจารณา',
    en: 'Pending Review',
  },
  statUtilisation: {
    th: 'อัตราการเรียกใช้งานรถ',
    en: 'Fleet Utilization Rate',
  },
  chartBookingByType: {
    th: 'สถิติสัดส่วนจำแนกตามประเภทยานพาหนะ',
    en: 'Usage Ratio Classified by Vehicle Type',
  },
  chartStatusBreakdown: {
    th: 'ความคืบหน้าสถานะคำร้องการจองทั้งหมด',
    en: 'Overview of Reservation Status Progress',
  },
  topDestinations: {
    th: 'เส้นทางปลายทางยอดนิยมที่มีการจองสูงสุด',
    en: 'Popular Flight Destinated Routes',
  },
  notificationCenter: {
    th: 'การแจ้งเตือนระบบ',
    en: 'Alert System Logs',
  },
  clearAll: {
    th: 'ล้างทั้งหมด',
    en: 'Clear All Logs',
  },
  allRead: {
    th: 'อ่านทั้งหมดแล้ว',
    en: 'Mark All Read',
  }
};
