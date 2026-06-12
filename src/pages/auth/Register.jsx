import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Mail, Lock, User, Shield, AlertCircle, Building, Heart, Phone, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'
  
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    agreeTerms: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  // التحقق من صحة البريد الإلكتروني
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }
  
  // التحقق من قوة كلمة المرور
  const getPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.match(/[a-z]/)) strength++
    if (password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    return strength
  }
  
  const getPasswordStrengthText = (strength) => {
    if (strength <= 2) return isRTL ? 'ضعيفة' : 'Weak'
    if (strength <= 3) return isRTL ? 'متوسطة' : 'Medium'
    return isRTL ? 'قوية' : 'Strong'
  }
  
  const getPasswordStrengthColor = (strength) => {
    if (strength <= 2) return 'text-red-400'
    if (strength <= 3) return 'text-yellow-400'
    return 'text-green-400'
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = isRTL ? 'الاسم مطلوب' : 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = isRTL ? 'البريد الإلكتروني غير صالح' : 'Invalid email address'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = isRTL ? 'رقم الجوال مطلوب' : 'Phone number is required'
    } else if (formData.phone.length < 10) {
      newErrors.phone = isRTL ? 'رقم الجوال غير صالح' : 'Invalid phone number'
    }
    
    if (!formData.password) {
      newErrors.password = isRTL ? 'كلمة المرور مطلوبة' : 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = isRTL ? 'كلمة المرور غير متطابقة' : 'Passwords do not match'
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = isRTL ? 'يجب الموافقة على الشروط' : 'You must agree to the terms'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleRegister = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error(isRTL ? 'يرجى تصحيح الأخطاء في النموذج' : 'Please fix the errors in the form')
      return
    }
    
    setLoading(true)
    
    // محاكاة تسجيل حساب جديد
    setTimeout(() => {
      // التحقق إذا كان البريد الإلكتروني موجود مسبقاً
      const existingUsers = JSON.parse(localStorage.getItem('mcsos_registered_users') || '[]')
      if (existingUsers.some(u => u.email === formData.email)) {
        toast.error(isRTL ? 'البريد الإلكتروني موجود مسبقاً' : 'Email already exists')
        setLoading(false)
        return
      }
      
      // إنشاء مستخدم جديد
      const newUser = {
        id: Date.now(),
        name: formData.name,
        nameEn: formData.nameEn || formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        roleAr: formData.role === 'doctor' ? 'طبيب' : formData.role === 'reception' ? 'موظف استقبال' : 'مستخدم',
        roleEn: formData.role === 'doctor' ? 'Doctor' : formData.role === 'reception' ? 'Receptionist' : 'User',
        department: '',
        departmentEn: '',
        avatar: null,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        requiresApproval: true
      }
      
      // حفظ المستخدم
      existingUsers.push(newUser)
      localStorage.setItem('mcsos_registered_users', JSON.stringify(existingUsers))
      
      toast.success(isRTL ? 'تم إنشاء الحساب بنجاح! يرجى انتظار الموافقة' : 'Account created successfully! Please wait for approval')
      
      // توجيه إلى صفحة تسجيل الدخول
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      
      setLoading(false)
    }, 1500)
  }
  
  const passwordStrength = getPasswordStrength(formData.password)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <button onClick={() => i18n.changeLanguage('ar')} className={`px-3 py-1 rounded-lg text-sm transition ${i18n.language === 'ar' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400'}`}>🇸🇦 العربية</button>
        <button onClick={() => i18n.changeLanguage('en')} className={`px-3 py-1 rounded-lg text-sm transition ${i18n.language === 'en' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400'}`}>🇬🇧 English</button>
        <button onClick={() => i18n.changeLanguage('fr')} className={`px-3 py-1 rounded-lg text-sm transition ${i18n.language === 'fr' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400'}`}>🇫🇷 Français</button>
      </div>
      
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl mb-3 shadow-lg shadow-blue-500/20">
            <User size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300 bg-clip-text text-transparent">{isRTL ? 'إنشاء حساب جديد' : 'Create New Account'}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{isRTL ? 'سجل حسابك للبدء في استخدام النظام' : 'Register to start using the system'}</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-4">
            {/* الاسم */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{isRTL ? 'الاسم الكامل' : 'Full Name'} *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition`}
                  placeholder={isRTL ? 'أدخل الاسم الكامل' : 'Enter full name'}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            
            {/* الاسم بالإنجليزي */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{isRTL ? 'الاسم (English)' : 'Name (English)'}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition"
                  placeholder={isRTL ? 'أدخل الاسم بالإنجليزية' : 'Enter name in English'}
                  value={formData.nameEn}
                  onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                />
              </div>
            </div>
            
            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{isRTL ? 'البريد الإلكتروني' : 'Email Address'} *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border ${errors.email ? 'border-red-500' : 'border-gray-600'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition`}
                  placeholder="example@medical.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            
            {/* رقم الجوال */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{isRTL ? 'رقم الجوال' : 'Phone Number'} *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="tel"
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border ${errors.phone ? 'border-red-500' : 'border-gray-600'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition`}
                  placeholder={isRTL ? '05xxxxxxxx' : '05xxxxxxxx'}
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
            
            {/* كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{isRTL ? 'كلمة المرور' : 'Password'} *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-10 pr-12 py-2.5 bg-gray-700/50 border ${errors.password ? 'border-red-500' : 'border-gray-600'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition`}
                  placeholder="********"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${
                        passwordStrength <= 2 ? 'bg-red-500 w-1/3' : passwordStrength <= 3 ? 'bg-yellow-500 w-2/3' : 'bg-green-500 w-full'
                      }`} />
                    </div>
                    <span className={`text-xs ${getPasswordStrengthColor(passwordStrength)}`}>{getPasswordStrengthText(passwordStrength)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{isRTL ? '6 أحرف على الأقل' : 'At least 6 characters'}</p>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>
            
            {/* تأكيد كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'} *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`w-full pl-10 pr-12 py-2.5 bg-gray-700/50 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition`}
                  placeholder="********"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            
            {/* الدور */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{isRTL ? 'نوع الحساب' : 'Account Type'}</label>
              <select
                className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="user">{isRTL ? 'مستخدم عادي' : 'Regular User'}</option>
                <option value="doctor">{isRTL ? 'طبيب' : 'Doctor'}</option>
                <option value="reception">{isRTL ? 'موظف استقبال' : 'Receptionist'}</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">{isRTL ? 'سيتم مراجعة طلبك من قبل المدير' : 'Your request will be reviewed by admin'}</p>
            </div>
            
            {/* الموافقة على الشروط */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({...formData, agreeTerms: e.target.checked})}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="agreeTerms" className="text-sm text-gray-400">
                {isRTL ? 'أوافق على ' : 'I agree to the '}
                <button type="button" className="text-blue-400 hover:text-blue-300">{isRTL ? 'الشروط والأحكام' : 'Terms and Conditions'}</button>
              </label>
            </div>
            {errors.agreeTerms && <p className="text-red-400 text-xs">{errors.agreeTerms}</p>}
            
            {/* زر التسجيل */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>{isRTL ? 'إنشاء حساب' : 'Sign Up'}</>
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-gray-700 text-center">
            <p className="text-sm text-gray-400">
              {isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
              <button onClick={() => navigate('/login')} className="text-blue-400 hover:text-blue-300 font-medium">
                {isRTL ? 'تسجيل الدخول' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
        
        <p className="text-center text-gray-400 dark:text-gray-500 text-xs mt-6">
          2026 © MCSOS - {isRTL ? 'نظام إدارة المركز الطبي' : 'Medical Center Management System'}
        </p>
      </div>
    </div>
  )
}