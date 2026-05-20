import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Mail, Lock, User, Shield, AlertCircle, Building, Heart } from 'lucide-react'
import toast from 'react-hot-toast'

// بيانات المستخدمين (محاكاة قاعدة بيانات)
const users = [
  {
    id: 1,
    email: 'admin@medical.com',
    password: 'admin123',
    name: 'أحمد محمد',
    nameEn: 'Ahmed Mohamed',
    role: 'admin',
    roleAr: 'مدير النظام',
    roleEn: 'System Administrator',
    avatar: null,
    department: 'تقنية المعلومات',
    departmentEn: 'IT Department'
  },
  {
    id: 2,
    email: 'doctor@medical.com',
    password: 'doctor123',
    name: 'د. أحمد علي',
    nameEn: 'Dr. Ahmed Ali',
    role: 'doctor',
    roleAr: 'طبيب',
    roleEn: 'Doctor',
    avatar: null,
    department: 'جراحة العظام',
    departmentEn: 'Orthopedic Department'
  },
  {
    id: 3,
    email: 'reception@medical.com',
    password: 'reception123',
    name: 'نورة عبدالله',
    nameEn: 'Noura Abdullah',
    role: 'reception',
    roleAr: 'موظف استقبال',
    roleEn: 'Receptionist',
    avatar: null,
    department: 'الاستقبال',
    departmentEn: 'Reception Department'
  },
  {
    id: 4,
    email: 'finance@medical.com',
    password: 'finance123',
    name: 'خالد محمد',
    nameEn: 'Khaled Mohamed',
    role: 'finance',
    roleAr: 'مدير مالي',
    roleEn: 'Finance Manager',
    avatar: null,
    department: 'المالية',
    departmentEn: 'Finance Department'
  }
]

export default function Login() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    // محاكاة تأخير الشبكة
    setTimeout(() => {
      const user = users.find(u => u.email === email && u.password === password)
      
      if (user) {
        // حفظ بيانات المستخدم
        const userData = {
          id: user.id,
          name: user.name,
          nameEn: user.nameEn,
          email: user.email,
          role: user.role,
          roleAr: user.roleAr,
          roleEn: user.roleEn,
          department: user.department,
          departmentEn: user.departmentEn,
          avatar: user.avatar,
          loginTime: new Date().toISOString()
        }
        
        localStorage.setItem('mcsos_user', JSON.stringify(userData))
        localStorage.setItem('mcsos_token', 'dummy_token_' + Date.now())
        
        if (rememberMe) {
          localStorage.setItem('mcsos_remember', 'true')
          localStorage.setItem('mcsos_saved_email', email)
        }
        
        toast.success(`مرحباً ${user.name}`)
        
        // توجيه حسب الدور
        if (user.role === 'admin') {
          navigate('/dashboard')
        } else if (user.role === 'doctor') {
          navigate('/doctor')
        } else if (user.role === 'reception') {
          navigate('/')
        } else {
          navigate('/dashboard')
        }
      } else {
        setError(isRTL ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password')
        toast.error(isRTL ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials')
      }
      setLoading(false)
    }, 1000)
  }
  
  // التحقق من وجود جلسة سابقة
  useState(() => {
    const savedUser = localStorage.getItem('mcsos_user')
    if (savedUser) {
      navigate('/dashboard')
    }
    const savedEmail = localStorage.getItem('mcsos_saved_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [navigate])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <button onClick={() => i18n.changeLanguage('ar')} className={`px-3 py-1 rounded-lg text-sm transition ${i18n.language === 'ar' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700/50 text-gray-400'}`}>🇸🇦 العربية</button>
        <button onClick={() => i18n.changeLanguage('en')} className={`px-3 py-1 rounded-lg text-sm transition ${i18n.language === 'en' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700/50 text-gray-400'}`}>🇬🇧 English</button>
        <button onClick={() => i18n.changeLanguage('fr')} className={`px-3 py-1 rounded-lg text-sm transition ${i18n.language === 'fr' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700/50 text-gray-400'}`}>🇫🇷 Français</button>
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl mb-4 shadow-lg">
            <Building size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">MCSOS</h1>
          <p className="text-gray-400 mt-2">{isRTL ? 'نظام إدارة المركز الطبي' : 'Medical Center Management System'}</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          <div className="flex justify-center gap-4 mb-6">
            <div className="text-center"><div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2"><Shield size={24} className="text-blue-400" /></div><p className="text-xs text-gray-400">{isRTL ? 'آمن' : 'Secure'}</p></div>
            <div className="text-center"><div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2"><Heart size={24} className="text-green-400" /></div><p className="text-xs text-gray-400">{isRTL ? 'رعاية صحية' : 'Healthcare'}</p></div>
            <div className="text-center"><div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2"><User size={24} className="text-purple-400" /></div><p className="text-xs text-gray-400">{isRTL ? 'مريض أولاً' : 'Patient First'}</p></div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle size={18} className="text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{isRTL ? 'البريد الإلكتروني' : 'Email Address'}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition"
                  placeholder={isRTL ? 'example@medical.com' : 'example@medical.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{isRTL ? 'كلمة المرور' : 'Password'}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition"
                  placeholder={isRTL ? '********' : '********'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-gray-400">{isRTL ? 'تذكرني' : 'Remember me'}</span>
              </label>
              <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition">{isRTL ? 'نسيت كلمة المرور؟' : 'Forgot password?'}</button>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>{isRTL ? 'تسجيل الدخول' : 'Sign In'}</>
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-center text-sm text-gray-400 mb-3">{isRTL ? 'حسابات تجريبية' : 'Demo Accounts'}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-700/30 rounded-lg p-2 text-center"><p className="text-blue-400 font-semibold">Admin</p><p className="text-gray-500">admin@medical.com</p><p className="text-gray-500">admin123</p></div>
              <div className="bg-gray-700/30 rounded-lg p-2 text-center"><p className="text-green-400 font-semibold">Doctor</p><p className="text-gray-500">doctor@medical.com</p><p className="text-gray-500">doctor123</p></div>
              <div className="bg-gray-700/30 rounded-lg p-2 text-center"><p className="text-yellow-400 font-semibold">Reception</p><p className="text-gray-500">reception@medical.com</p><p className="text-gray-500">reception123</p></div>
              <div className="bg-gray-700/30 rounded-lg p-2 text-center"><p className="text-purple-400 font-semibold">Finance</p><p className="text-gray-500">finance@medical.com</p><p className="text-gray-500">finance123</p></div>
            </div>
          </div>
        </div>
        
        <p className="text-center text-gray-500 text-xs mt-8">
          © 2024 MCSOS - {isRTL ? 'نظام إدارة المركز الطبي' : 'Medical Center Management System'}
        </p>
      </div>
    </div>
  )
}
