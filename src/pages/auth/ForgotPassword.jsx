import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle, Building, Shield, Heart, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'
  
  const [email, setEmail] = useState('')
  const [step, setStep] = useState(1)
  const [verificationCode, setVerificationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }
  
  const handleSendCode = (e) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError(isRTL ? 'الرجاء إدخال البريد الإلكتروني' : 'Please enter your email')
      return
    }
    
    if (!validateEmail(email)) {
      setError(isRTL ? 'البريد الإلكتروني غير صالح' : 'Invalid email address')
      return
    }
    
    setLoading(true)
    
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('mcsos_users') || '[]')
      const existingUsers = JSON.parse(localStorage.getItem('mcsos_registered_users') || '[]')
      const allUsers = [...users, ...existingUsers]
      
      const userExists = allUsers.some(u => u.email === email) || 
                         ['admin@medical.com', 'doctor@medical.com', 'reception@medical.com', 'finance@medical.com'].includes(email)
      
      if (!userExists) {
        setError(isRTL ? 'لا يوجد حساب مرتبط بهذا البريد الإلكتروني' : 'No account found with this email')
        setLoading(false)
        return
      }
      
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setGeneratedCode(code)
      console.log('Verification code:', code)
      
      toast.success(isRTL ? 'تم إرسال رمز التحقق إلى بريدك الإلكتروني' : 'Verification code sent to your email')
      setStep(2)
      setLoading(false)
    }, 1500)
  }
  
  const handleVerifyCode = (e) => {
    e.preventDefault()
    setError('')
    
    if (!verificationCode) {
      setError(isRTL ? 'الرجاء إدخال رمز التحقق' : 'Please enter verification code')
      return
    }
    
    if (verificationCode !== generatedCode) {
      setError(isRTL ? 'رمز التحقق غير صحيح' : 'Invalid verification code')
      return
    }
    
    toast.success(isRTL ? 'تم التحقق من الرمز بنجاح' : 'Code verified successfully')
    setStep(3)
  }
  
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
  
  const handleResetPassword = (e) => {
    e.preventDefault()
    setError('')
    
    if (!newPassword) {
      setError(isRTL ? 'الرجاء إدخال كلمة المرور الجديدة' : 'Please enter new password')
      return
    }
    
    if (newPassword.length < 6) {
      setError(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError(isRTL ? 'كلمة المرور غير متطابقة' : 'Passwords do not match')
      return
    }
    
    setLoading(true)
    
    setTimeout(() => {
      toast.success(isRTL ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully')
      setSuccess(true)
      
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      
      setLoading(false)
    }, 1500)
  }
  
  const passwordStrength = getPasswordStrength(newPassword)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <button onClick={() => i18n.changeLanguage('ar')} className={`px-3 py-1 rounded-lg text-sm transition ${i18n.language === 'ar' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400'}`}>🇸🇦 العربية</button>
        <button onClick={() => i18n.changeLanguage('en')} className={`px-3 py-1 rounded-lg text-sm transition ${i18n.language === 'en' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400'}`}>🇬🇧 English</button>
        <button onClick={() => i18n.changeLanguage('fr')} className={`px-3 py-1 rounded-lg text-sm transition ${i18n.language === 'fr' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400'}`}>🇫🇷 Français</button>
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
            <Building size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300 bg-clip-text text-transparent">MCSOS</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{isRTL ? 'استعادة كلمة المرور' : 'Reset Password'}</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{isRTL ? 'تم تغيير كلمة المرور' : 'Password Changed'}</h2>
              <p className="text-gray-400 mb-4">{isRTL ? 'تم تغيير كلمة المرور بنجاح، سيتم توجيهك إلى صفحة تسجيل الدخول' : 'Password changed successfully, you will be redirected to login page'}</p>
              <button onClick={() => navigate('/login')} className="text-blue-400 hover:text-blue-300">
                {isRTL ? 'تسجيل الدخول' : 'Sign In'}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-500'}`}>1</div>
                  <span className={`text-sm ${step >= 1 ? 'text-white' : 'text-gray-500'}`}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</span>
                </div>
                <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-700'}`} />
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-500'}`}>2</div>
                  <span className={`text-sm ${step >= 2 ? 'text-white' : 'text-gray-500'}`}>{isRTL ? 'التحقق' : 'Verify'}</span>
                </div>
                <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-700'}`} />
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-500'}`}>3</div>
                  <span className={`text-sm ${step >= 3 ? 'text-white' : 'text-gray-500'}`}>{isRTL ? 'جديد' : 'New'}</span>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-400" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              
              {step === 1 && (
                <form onSubmit={handleSendCode} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{isRTL ? 'البريد الإلكتروني' : 'Email Address'}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="email"
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition"
                        placeholder={isRTL ? 'example@medical.com' : 'example@medical.com'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{isRTL ? 'سيتم إرسال رمز التحقق إلى بريدك الإلكتروني' : 'A verification code will be sent to your email'}</p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><Send size={18} /> {isRTL ? 'إرسال رمز التحقق' : 'Send Verification Code'}</>
                    )}
                  </button>
                </form>
              )}
              
              {step === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{isRTL ? 'رمز التحقق' : 'Verification Code'}</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition text-center text-2xl tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{isRTL ? 'تم إرسال الرمز إلى بريدك الإلكتروني' : 'Code sent to your email'}</p>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> {isRTL ? 'تحقق' : 'Verify'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleSendCode}
                    className="w-full text-blue-400 hover:text-blue-300 text-sm py-2"
                  >
                    {isRTL ? 'إعادة إرسال الرمز' : 'Resend code'}
                  </button>
                </form>
              )}
              
              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{isRTL ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition"
                        placeholder="********"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    {newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-300 ${
                              passwordStrength <= 2 ? 'bg-red-500 w-1/3' : passwordStrength <= 3 ? 'bg-yellow-500 w-2/3' : 'bg-green-500 w-full'
                            }`} />
                          </div>
                          <span className={`text-xs ${getPasswordStrengthColor(passwordStrength)}`}>{getPasswordStrengthText(passwordStrength)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition"
                        placeholder="********"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-300 text-sm"
                    >
                      {showPassword ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'إظهار' : 'Show')}
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>{isRTL ? 'تغيير كلمة المرور' : 'Reset Password'}</>
                    )}
                  </button>
                </form>
              )}
              
              <div className="mt-6 text-center">
                <button onClick={() => navigate('/login')} className="text-gray-400 hover:text-gray-300 text-sm flex items-center justify-center gap-1">
                  <ArrowLeft size={14} /> {isRTL ? 'العودة إلى تسجيل الدخول' : 'Back to Sign In'}
                </button>
              </div>
            </>
          )}
        </div>
        
        <p className="text-center text-gray-400 dark:text-gray-500 text-xs mt-8">
          2026 © MCSOS - {isRTL ? 'نظام إدارة المركز الطبي' : 'Medical Center Management System'}
        </p>
      </div>
    </div>
  )
}