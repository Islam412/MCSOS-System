// إضافة استيراد الخدمات
import { authService } from '../services/api'
import { useServices } from '../context/ServiceContext'

// داخل المكون
const { isOnline } = useServices()

// تحديث دالة handleLogin
const handleLogin = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    if (isOnline) {
      // محاولة الاتصال بالخادم
      const response = await authService.login(email, password)
      
      if (response.user) {
        const userData = response.user
        localStorage.setItem('mcsos_user', JSON.stringify(userData))
        localStorage.setItem('mcsos_token', response.token)
        
        toast.success(`مرحباً ${userData.name}`)
        
        // التوجيه حسب الدور
        const roleRoutes = {
          admin: '/admin',
          doctor: '/doctor-dashboard',
          reception: '/reception-dashboard',
          finance: '/finance',
          patient: '/patient-dashboard',
          user: '/patient-dashboard'
        }
        navigate(roleRoutes[userData.role] || '/dashboard')
      }
    } else {
      // وضع غير متصل - استخدام الحسابات المحلية
      const user = users.find(u => u.email === email && u.password === password)
      if (user) {
        // ... نفس منطق تسجيل الدخول المحلي
      } else {
        setError(isRTL ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password')
        toast.error(isRTL ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials')
      }
    }
  } catch (error) {
    setError(error.message)
    toast.error(error.message)
  } finally {
    setLoading(false)
  }
}