import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Languages, 
  Sparkles,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole, UserProfile } from '../types';
import { api } from '../api';


interface AuthScreenProps {
  lang: 'th' | 'en';
  setLang: (l: 'th' | 'en') => void;
  onLoginSuccess: (user: UserProfile) => void;
  demoUsers: UserProfile[];
  onAddUser: (user: UserProfile) => void;
}

export default function AuthScreen({ 
  lang, 
  setLang, 
  onLoginSuccess, 
  demoUsers,
  onAddUser 
}: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // --- Password Strength Estimator ---
  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length === 0) return { score: 0, textEn: 'None', textTh: 'กรุณากรอกรหัส', color: 'bg-slate-200' };
    if (pass.length >= 6) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) {
      return { score, textEn: 'Weak', textTh: 'รหัสผ่านค่อนข้างอ่อนแอ', color: 'bg-rose-500' };
    } else if (score === 2 || score === 3) {
      return { score, textEn: 'Moderate', textTh: 'รหัสผ่านปลอดภัยปานกลาง', color: 'bg-amber-500' };
    } else {
      return { score, textEn: 'Strong & Safe', textTh: 'รหัสผ่านปลอดภัยสูงมาก', color: 'bg-emerald-500' };
    }
  };

  const strength = checkPasswordStrength(regPassword);

  // Localization internal dictionary
  const localized = {
    title: { th: 'ระบบบริการยานพาหนะกองกลาง', en: 'University Car Booking Center' },
    subtitle: { th: 'มหาวิทยาลัยแห่งการเรียนรู้และการพัฒนาชุมชน', en: 'Phalathung Campus Unified Logistics & Reservations' },
    loginTab: { th: 'เข้าสู่ระบบผู้ใช้งาน', en: 'Account Sign In' },
    registerTab: { th: 'ลงทะเบียนขอสิทธิ์ใช้งาน', en: 'Secure Sign Up' },
    emailLabel: { th: 'อีเมลมหาวิทยาลัย (@university.ac.th / @tsu.ac.th)', en: 'University Email Domain' },
    passwordLabel: { th: 'รหัสผ่านทางผ่านความมั่นคง', en: 'Security Password' },
    confirmPasswordLabel: { th: 'ยืนยันรหัสผ่านอีกครั้ง', en: 'Confirm Password' },
    nameLabel: { th: 'ชื่อ-นามสกุลจริง (ภาษาไทย หรือ อังกฤษ)', en: 'Full Active Legal Name' },
    phoneLabel: { th: 'หมายเลขโทรศัพท์มือถือติดต่อสถานะด่วน', en: 'Mobile Phone (Status Updates)' },
    roleLabel: { th: 'เลือกบทบาทเจ้าของการทำธุรกรรม', en: 'Affiliation Role Type' },
    registerBtn: { th: 'สมัครสมาชิกและเปิดบัญชีให้ปลอดภัย', en: 'Register Verified Account' },
    loginBtn: { th: 'ตรวจสอบตัวตนเพื่อเปิดใช้งาน', en: 'Verify Identity & Sign In' },
    studentOpt: { th: 'นักศึกษา (สำหรับกิจกรรม / วิชาการ)', en: 'University Student Association' },
    staffOpt: { th: 'อาจารย์ / บุคลากร (สำหรับภารกิจราชการ)', en: 'Academic Professor / University Staff' },
    adminOpt: { th: 'ผู้ดูแลระบบและฝ่ายจัดตารางรถกองกลาง', en: 'Fleet & Logistics Executive' },
    demoTitle: { th: 'ทางลัดประวัติข้อมูลสำหรับการตรวจสอบ (Demo Accounts)', en: 'Bypassing Gate / Demo Test Credentials' },
    strengthLabel: { th: 'ระดับวิเคราะห์ความแกร่งของรหัสผ่าน', en: 'System Password Security Assessment' },
    matchError: { th: 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน', en: 'Passwords do not match.' },
    lengthError: { th: 'รหัสผ่านควรมีความยาวไม่ต่ำกว่า 6 ตัวอักษร', en: 'Password must be at least 6 characters.' },
    regSuccessful: { th: 'บัญชีระบบขอสิทธิ์ของคุณถูกลงทะเบียนอย่างปลอดภัยแล้ว! กรุณาเข้าสู่ระบบ', en: 'Account security review registered! Please log in now.' },
    userNotFound: { th: 'ไม่พบบัญชีผู้ใช้พาสเวิร์ดไม่ถูกต้อง หรือ กรุณาใช้รหัสผ่านทดสอบ', en: 'Invalid credentials or non-existent user profile.' },
    phoneHint: { th: 'ตัวอย่าง: 08x-xxxxxxx', en: 'Format: 08x-xxxxxxx' }
  };

  const getT = (key: keyof typeof localized) => {
    return localized[key][lang];
  };

  // --- Handlers ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const user = await api.login(loginEmail, loginPassword);
      onLoginSuccess(user);
    } catch (err: any) {
      console.error(err);
      setLoginError(getT('userNotFound'));
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    // Validations
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setRegError(lang === 'th' ? 'กรุณากรอกข้อมูลจำเป็นให้ครบถ้วน' : 'Please fill in all required fields.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError(getT('lengthError'));
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError(getT('matchError'));
      return;
    }

    try {
      const newUser = await api.register(regName, regEmail, regPhone, regRole, regPassword);
      onAddUser(newUser);
      setRegSuccess(getT('regSuccessful'));
      
      // Reset fields & auto-switch to login tab after brief interval
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegConfirmPassword('');
      setTimeout(() => {
        setActiveTab('login');
        setLoginEmail(newUser.email);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setRegError(lang === 'th' ? 'อีเมลนี้ได้รับการลงทะเบียนเข้าสู่สารบบแล้ว หรือรูปแบบข้อมูลไม่ถูกต้อง' : err.message);
    }
  };

  // Populate form with helper accounts for easy sandbox testing
  const presetDemoAccount = (u: UserProfile, defaultPass: string) => {
    setLoginEmail(u.email);
    setLoginPassword(defaultPass);
    setLoginError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative antialiased text-slate-100 overflow-hidden">
      
      {/* Absolute decorative gradient highlights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-rose-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating Language Switcher for consistency */}
      <div className="max-w-md w-full mx-auto flex justify-end mb-4">
        <button
          onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 bg-slate-800/80 text-slate-350 hover:bg-slate-800 rounded-lg font-bold text-xs cursor-pointer transition-all hover:text-white"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{lang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}</span>
        </button>
      </div>

      <div className="max-w-md w-full mx-auto space-y-6">
        
        {/* Animated Brand Cover */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/20 mb-1">
            <span className="text-xl font-bold tracking-wider text-white select-none">🚙</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-heading">
            {getT('title')}
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            {getT('subtitle')}
          </p>
        </div>

        {/* Auth Module Panel */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Top Panel Tab Toggles */}
          <div className="flex border-b border-slate-850 p-1 bg-slate-900/60">
            <button
              onClick={() => {
                setActiveTab('login');
                setLoginError('');
                setRegError('');
              }}
              className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
              }`}
            >
              🔑 {getT('loginTab')}
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setLoginError('');
                setRegError('');
              }}
              className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
              }`}
            >
              🛡️ {getT('registerTab')}
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* 1. LOGIN MODE VIEW */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                {loginError && (
                  <div className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-200 text-xs font-semibold flex items-start gap-2 animate-shake">
                    <X className="w-4 h-4 mt-0.5 text-rose-400 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    {getT('emailLabel')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. somkiat.y@university.ac.th"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-950 rounded-lg text-xs font-semibold text-white transition-all placeholder:text-slate-600 shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    {getT('passwordLabel')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-950 rounded-lg text-xs font-semibold text-white transition-all placeholder:text-slate-600 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-350 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg text-xs shadow-lg shadow-blue-500/10 cursor-pointer hover:shadow-xl transition-all"
                >
                  {getT('loginBtn')}
                </button>
              </form>
            )}

            {/* 2. REGISTRATION MODE VIEW */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
                {regError && (
                  <div className="p-3.5 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-xs font-semibold flex items-start gap-2 animate-shake">
                    <X className="w-4 h-4 mt-0.5 text-rose-400 flex-shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-xl text-xs font-semibold flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    {getT('nameLabel')} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder={lang === 'th' ? "เช่น ดร.วิศิษฐ์ แสนสุข" : "e.g. Dr. Wisit Sansook"}
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-950 rounded-lg text-xs font-semibold text-white transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                      {getT('emailLabel')} *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. name@university.ac.th"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-950 rounded-lg text-xs font-semibold text-white transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                      {getT('phoneLabel')} *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder={getT('phoneHint')}
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-950 rounded-lg text-xs font-semibold text-white transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    {getT('roleLabel')} *
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full py-2.5 px-3 bg-slate-900 border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-950 rounded-lg text-xs font-bold text-slate-200 transition-all cursor-pointer"
                  >
                    <option value="student">🎓 {getT('studentOpt')}</option>
                    <option value="staff">🏫 {getT('staffOpt')}</option>
                    <option value="admin">👮 {getT('adminOpt')}</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                      {getT('passwordLabel')} *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-950 rounded-lg text-xs font-semibold text-white transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                      {getT('confirmPasswordLabel')} *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-950 rounded-lg text-xs font-semibold text-white transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Secure strength indicator */}
                {regPassword.length > 0 && (
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-850 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>{getT('strengthLabel')}:</span>
                      <span className="font-heading text-slate-300">
                        {lang === 'th' ? strength.textTh : strength.textEn}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-850 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`} 
                        style={{ width: `${(strength.score / 4) * 100}%` }}
                      ></div>
                    </div>
                    {/* Password tips */}
                    <p className="text-[9px] text-slate-500 leading-normal">
                      🛡️ {lang === 'th' 
                        ? 'รหัสผ่านที่มีทั้งตัวอักษรใหญ่-เล็ก, ตัวเลขอย่างน้อย 1 ตัว และอักขระสัญลักษณ์พิเศษ จะเปิดระบบคุ้มกันสูงสุด' 
                        : 'Secure code contains uppercase notes, a digit parameter, and specialty glyph credentials.'}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg text-xs shadow-md shadow-blue-500/10 cursor-pointer hover:shadow-lg transition-all"
                >
                  {getT('registerBtn')}
                </button>
              </form>
            )}

          </div>

          {/* Preset Demo Switchess Panel (Extremely test-friendly metadata selector) */}
          <div className="bg-slate-900 p-5 border-t border-slate-850 text-left">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>{getT('demoTitle')}</span>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {demoUsers.map((u) => {
                const defaultPass = u.role === 'student' ? 'student123' : u.role === 'staff' ? 'staff123' : 'admin123';
                return (
                  <button
                    key={u.id}
                    onClick={() => presetDemoAccount(u, defaultPass)}
                    className="flex justify-between items-center bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-left cursor-pointer transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200 leading-tight group-hover:text-blue-400 transition-colors">{u.name}</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">{u.email}</p>
                    </div>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-slate-850 border border-slate-700 text-slate-300' :
                      u.role === 'staff' ? 'bg-blue-950 border border-blue-900 text-blue-300' : 'bg-slate-850/60 text-slate-400'
                    }`}>
                      {u.role}
                    </span>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 flex items-start gap-1.5 text-slate-500 text-[10px] bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
              <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="leading-normal">
                {lang === 'th' 
                  ? 'ระบบลงทะเบียนเสมือนจริงนี้ บันทึกข้อมูลปลอดภัยถาวรใน LocalStorage ทำให้คุณสามารถสลับทดสอบ และลงชื่อเข้าด้วยยูสเวอร์ที่คุณเพิ่งสมัครเองได้จริง 100%' 
                  : 'Registrations are preserved securely inside local client cookies/caches. Authenticate manually or bypass using bypass triggers above.'}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Footer information */}
      <div className="mt-8 text-center text-[10px] text-slate-500 font-mono">
        Phalatung University Car Pool System • Secure TLS Simulation
      </div>

    </div>
  );
}
