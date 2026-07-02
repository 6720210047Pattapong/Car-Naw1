import { Vehicle, Booking, NotificationItem } from './types';

export const initialVehicles: Vehicle[] = [
  {
    id: 'van-01',
    modelTh: 'Toyota Commuter (สรีดสีฟ้า)',
    modelEn: 'Toyota Commuter (Slate Blue)',
    plateNumber: 'กข 1024 พัทลุง',
    type: 'van',
    capacity: 13,
    status: 'available',
    driverNameTh: 'นายสมชาย ใจดี',
    driverNameEn: 'Mr. Somchai Jaidee',
    driverPhone: '081-234-5678',
    fuelTypeTh: 'ดีเซล',
    fuelTypeEn: 'Diesel'
  },
  {
    id: 'van-02',
    modelTh: 'Toyota Majesty Executive VIP',
    modelEn: 'Toyota Majesty Executive VIP',
    plateNumber: 'ฮย 5566 กรุงเทพฯ',
    type: 'van',
    capacity: 10,
    status: 'busy',
    driverNameTh: 'นายวิชัย สุวรรณ',
    driverNameEn: 'Mr. Wichai Suwan',
    driverPhone: '082-998-1122',
    fuelTypeTh: 'ดีเซล',
    fuelTypeEn: 'Diesel'
  },
  {
    id: 'bus-01',
    modelTh: 'Scania Double-Decker Coach',
    modelEn: 'Scania Double-Decker Coach',
    plateNumber: '30-1234 สงขลา',
    type: 'bus',
    capacity: 45,
    status: 'available',
    driverNameTh: 'นายมานพ รักชาติ',
    driverNameEn: 'Mr. Manop Rakchat',
    driverPhone: '089-776-5432',
    fuelTypeTh: 'ดีเซล',
    fuelTypeEn: 'Diesel'
  },
  {
    id: 'sedan-01',
    modelTh: 'Toyota Camry Hybrid',
    modelEn: 'Toyota Camry Hybrid',
    plateNumber: 'กจ 7890 พัทลุง',
    type: 'sedan',
    capacity: 4,
    status: 'available',
    driverNameTh: 'นายกฤษณะ พาชื่น',
    driverNameEn: 'Mr. Kritsana Pachaen',
    driverPhone: '085-443-2211',
    fuelTypeTh: 'เบนซิน',
    fuelTypeEn: 'Gasoline'
  },
  {
    id: 'sedan-02',
    modelTh: 'BYD Seal EV (รถยนต์พลังงานไฟฟ้า)',
    modelEn: 'BYD Seal EV (100% Electric)',
    plateNumber: '9กข 4321 กรุงเทพฯ',
    type: 'sedan',
    capacity: 4,
    status: 'available',
    driverNameTh: 'นางสาวศิริพร อรุณ',
    driverNameEn: 'Ms. Siriporn Arun',
    driverPhone: '086-554-3321',
    fuelTypeTh: 'ไฟฟ้า EV',
    fuelTypeEn: 'Electric EV'
  },
  {
    id: 'pickup-01',
    modelTh: 'Isuzu D-Max Spark ขนสัมภาระ',
    modelEn: 'Isuzu D-Max Cargo Spark',
    plateNumber: 'บย 4455 ตรัง',
    type: 'pickup',
    capacity: 3,
    status: 'available',
    driverNameTh: 'นายสุรพล แซ่ลี้',
    driverNameEn: 'Mr. Surapon Saelee',
    driverPhone: '087-112-2334',
    fuelTypeTh: 'ดีเซล',
    fuelTypeEn: 'Diesel'
  }
];

export const initialBookings: Booking[] = [
  {
    id: 'booking-1',
    vehicleId: 'van-02',
    userId: 'student-1',
    userName: 'นายสมเกียรติ ยอดรัก (ประธานสโมสรนักศึกษา)',
    userRole: 'student',
    userPhone: '099-111-2233',
    purpose: 'นำผู้แทนคณะวิทยาศาสตร์เข้าร่วมแข่งขันทักษะทางวิทยาศาสตร์ระดับภูมิภาคภาคใต้ ณ คณะวิทยาศาสตร์ ม.อ. หาดใหญ่',
    destination: 'คณะวิทยาศาสตร์ มหาวิทยาลัยสงขลานครินทร์ อ.หาดใหญ่ จ.สงขลา',
    startDate: '2026-06-21',
    endDate: '2026-06-21',
    startTime: '08:00',
    endTime: '17:00',
    passengers: 9,
    status: 'approved',
    createdAt: '2026-06-19T09:12:00.000Z'
  },
  {
    id: 'booking-2',
    vehicleId: 'bus-01',
    userId: 'staff-1',
    userName: 'ดร.สุดาพร พงษ์สิทธิ์ (อาจารย์ประจำคณะศึกษาศาสตร์)',
    userRole: 'staff',
    userPhone: '088-777-6655',
    purpose: 'นำพานักศึกษาวิชาชีพครู ชั้นปีที่ 3 จำนวน 38 คน ไปฝึกหัดสังเกตการสอนโรงเรียนสาธิตมหาวิทยาลัยในพัทลุงและตรัง',
    destination: 'โรงเรียนสาธิตและโรงเรียนประถมศึกษาต้นแบบ อ.เมือง จ.ตรัง',
    startDate: '2026-06-24',
    endDate: '2026-06-25',
    startTime: '07:30',
    endTime: '16:30',
    passengers: 38,
    status: 'pending',
    createdAt: '2026-06-19T14:22:00.000Z'
  },
  {
    id: 'booking-3',
    vehicleId: 'sedan-01',
    userId: 'staff-2',
    userName: 'ผศ.ดร.นพดล ทองคง (รองอธิการบดีฝ่ายวิชาการ)',
    userRole: 'staff',
    userPhone: '081-555-4433',
    purpose: 'เดินทางเข้าประชุมเพื่อรายงานแผนยุทธศาสตร์ประจำปี ณ ที่ประชุมร่วมกรรมการบริหารวิทยาลัยฯ',
    destination: 'สำนักงานสภามหาวิทยาลัยทักษิณ วิทยาเขตสงขลา จ.สงขลา',
    startDate: '2026-06-23',
    endDate: '2026-06-23',
    startTime: '09:00',
    endTime: '15:00',
    passengers: 2,
    status: 'pending',
    createdAt: '2026-06-20T07:10:00.000Z'
  },
  {
    id: 'booking-4',
    vehicleId: 'sedan-02',
    userId: 'student-2',
    userName: 'นางสาวศศิธร แก้วมณี (คณะอุตสาหกรรมเกษตร)',
    userRole: 'student',
    userPhone: '093-222-1144',
    purpose: 'ร่วมแข่งขันประกวดนวัตกรรมผลิตภัณฑ์อาหารของสถาบันอุดมศึกษาภาคใต้',
    destination: 'อุทยานวิทยาศาสตร์ภาคใต้ อ.หาดใหญ่ จ.สงขลา',
    startDate: '2026-06-18',
    endDate: '2026-06-18',
    startTime: '08:00',
    endTime: '17:00',
    passengers: 3,
    status: 'approved',
    createdAt: '2026-06-15T10:00:00.000Z'
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'noti-1',
    userId: 'student-1',
    titleTh: 'อนุมัติการจองพาหนะเรียบร้อย',
    titleEn: 'Vehicle Booking Approved',
    messageTh: 'การอนุมัติรถ Toyota Majesty ทะเบียน ฮย 5566 สำหรับการเดินทางไป อ.หาดใหญ่ จ.สงขลา สมบูรณ์แล้ว',
    messageEn: 'Your booking for Toyota Majesty (ฮย 5566) to Hat Yai has been approved.',
    type: 'success',
    read: false,
    createdAt: '2026-06-21T07:15:00.000Z'
  },
  {
    id: 'noti-2',
    userId: 'admin-1',
    titleTh: 'ได้รับคำขอจองคิวใหม่',
    titleEn: 'New Pending Booking Request',
    messageTh: 'ดร.สุดาพร พงษ์สิทธิ์ ได้ส่งคำขอจอง รถโค้ชบัส Scania ทะเบียน 30-1234 ขอนำนักศึกษาฝึกประสบการณ์สังเกตการณ์ช่วยสอน',
    messageEn: 'Dr. Sudaporn Pongsit has requested Coach Bus Scania (30-1234) for student field practice.',
    type: 'info',
    read: false,
    createdAt: '2026-06-21T06:40:00.000Z'
  },
  {
    id: 'noti-3',
    userId: 'admin-1',
    titleTh: 'สถานะการส่งพิกัดระบบ',
    titleEn: 'Applet Running Smoothly',
    messageTh: 'ระบบจองรถทักษิณย่านเพชรเกษมและพัทลุงเปิดทำการเชื่อมโยงข้อมูลแบบเรียลไทม์เรียบร้อย',
    messageEn: 'TSU Car Booking system is up and online with real-time operational dashboard.',
    type: 'info',
    read: true,
    createdAt: '2026-06-21T05:00:00.000Z'
  }
];
