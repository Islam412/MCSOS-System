// src/pages/profile/Profile.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  User, Mail, Phone, MapPin, Calendar, Clock, Activity, 
  Edit, Save, X, Camera, Lock, Key, LogOut, CheckCircle,
  Shield, Bell, Globe, Moon, Sun, Monitor, Award, TrendingUp,
  Users, Calendar as CalendarIcon, FileText, Stethoscope,
  RefreshCw, AlertCircle, Upload, Image as ImageIcon,
  Loader2, Building, Check, Briefcase
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useTheme } from '../../context/ThemeContext'

// ========== استيراد الخدمات ==========
import { authService, usersService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`

// خدمة حفظ واسترجاع بيانات المستخدم
const STORAGE_KEY = 'mcsos_user_profile'

const defaultProfile = {
  id: '',
  name: 'مستخدم',
  nameEn: 'User',
  email: '',
  phone: '',
  role: 'مستخدم',
  roleEn: 'User',
  department: '',
  departmentEn: '',
  joinDate: new Date().toISOString().split('T')[0],
  lastLogin: new Date().toLocaleString(),
  avatar: null,
  bio: '',
  bioEn: '',
  address: '',
  addressEn: '',
  birthday: '',
  gender: 'male',
  socialLinks: {
    twitter: '',
    linkedin: '',
    github: ''
  },
  notifications: {
    email: true,
    whatsapp: false,
    push: true
  },
  twoFactorEnabled: false
}

export default function Profile() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { theme, setTheme } = useTheme()

  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()
  
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // بيانات المستخدم
  const [userData, setUserData] = useState(defaultProfile)
  const [editData, setEditData] = useState({ ...defaultProfile })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [tempAvatar, setTempAvatar] = useState(null)
  
  // إحصائيات المستخدم
  const [userStats, setUserStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    completedTasks: 0,
    pendingTasks: 0,
    activeDays: 0,
    loginCount: 0,
    lastSevenDays: [0, 0, 0, 0, 0, 0, 0]
  })
  
  // النشاطات الأخيرة
  const [recentActivities, setRecentActivities] = useState([])

  // ========== تحميل بيانات المستخدم ==========
  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    setLoading(true)
    try {
      // ✅ أولاً: جلب بيانات المستخدم من localStorage (بيانات تسجيل الدخول)
      const userFromLogin = localStorage.getItem('mcsos_user')
      let loginUser = null
      if (userFromLogin) {
        try {
          loginUser = JSON.parse(userFromLogin)
        } catch (e) {
          console.error('Error parsing user from login:', e)
        }
      }

      // ✅ ثانياً: محاولة جلب البيانات من API
      let apiUser = null
      if (isOnline) {
        try {
          const response = await authService.getMe()
          if (response && response.user) {
            apiUser = response.user
          }
        } catch (apiError) {
          console.warn('API get profile failed:', apiError)
        }
      }

      // ✅ ثالثاً: جلب البيانات المحفوظة مسبقاً
      let savedProfile = null
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          savedProfile = JSON.parse(saved)
        } catch (e) {
          console.error('Error parsing saved profile:', e)
        }
      }

      // ✅ رابعاً: دمج جميع المصادر
      const mergedData = {
        ...defaultProfile,
        ...savedProfile,
        ...(loginUser || {}),
        ...(apiUser || {}),
        // ✅ تعيين القيم بشكل صحيح
        id: apiUser?.id || loginUser?.id || savedProfile?.id || 'user_' + Date.now(),
        name: apiUser?.name || apiUser?.nameAr || loginUser?.name || savedProfile?.name || defaultProfile.name,
        nameEn: apiUser?.nameEn || apiUser?.name || loginUser?.nameEn || savedProfile?.nameEn || defaultProfile.nameEn,
        email: apiUser?.email || loginUser?.email || savedProfile?.email || defaultProfile.email,
        phone: apiUser?.phone || loginUser?.phone || savedProfile?.phone || defaultProfile.phone,
        role: apiUser?.roleAr || apiUser?.role || loginUser?.roleAr || loginUser?.role || savedProfile?.role || defaultProfile.role,
        roleEn: apiUser?.roleEn || apiUser?.role || loginUser?.roleEn || loginUser?.role || savedProfile?.roleEn || defaultProfile.roleEn,
        department: apiUser?.department || loginUser?.department || savedProfile?.department || defaultProfile.department,
        departmentEn: apiUser?.departmentEn || loginUser?.departmentEn || savedProfile?.departmentEn || defaultProfile.departmentEn,
        joinDate: apiUser?.joinDate || loginUser?.joinDate || savedProfile?.joinDate || defaultProfile.joinDate,
        lastLogin: new Date().toLocaleString(),
        avatar: apiUser?.avatar || loginUser?.avatar || savedProfile?.avatar || null,
        bio: apiUser?.bio || savedProfile?.bio || defaultProfile.bio,
        bioEn: apiUser?.bioEn || savedProfile?.bioEn || defaultProfile.bioEn,
        address: apiUser?.address || savedProfile?.address || defaultProfile.address,
        addressEn: apiUser?.addressEn || savedProfile?.addressEn || defaultProfile.addressEn,
        birthday: apiUser?.birthday || savedProfile?.birthday || defaultProfile.birthday,
        gender: apiUser?.gender || savedProfile?.gender || defaultProfile.gender,
        notifications: {
          ...defaultProfile.notifications,
          ...(savedProfile?.notifications || {}),
          ...(apiUser?.notifications || {})
        }
      }

      setUserData(mergedData)
      setEditData(mergedData)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData))

      // ✅ تحميل الإحصائيات والنشاطات
      await loadUserStats(mergedData.id)
      await loadUserActivities()

    } catch (error) {
      console.error('Error loading profile:', error)
      // ✅ في حالة الفشل، استخدام بيانات localStorage
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const data = JSON.parse(saved)
          setUserData(data)
          setEditData(data)
        } catch (e) {
          setUserData(defaultProfile)
          setEditData(defaultProfile)
        }
      } else {
        setUserData(defaultProfile)
        setEditData(defaultProfile)
      }
      toast.error('حدث خطأ في تحميل الملف الشخصي')
    } finally {
      setLoading(false)
    }
  }

  // ========== تحميل إحصائيات المستخدم ==========
  const loadUserStats = async (userId) => {
    try {
      if (isOnline) {
        const response = await fetch(`${API_BASE}/stats/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('mcsos_token')}`,
            'Content-Type': 'application/json'
          }
        })
        if (response.ok) {
          const data = await response.json()
          setUserStats({
            totalPatients: data.totalPatients || 0,
            totalAppointments: data.totalAppointments || 0,
            totalRevenue: data.totalRevenue || 0,
            completedTasks: data.completedTasks || 0,
            pendingTasks: data.pendingTasks || 0,
            activeDays: data.activeDays || 0,
            loginCount: data.loginCount || 0,
            lastSevenDays: data.lastSevenDays || [0, 0, 0, 0, 0, 0, 0]
          })
        }
      }
    } catch (error) {
      console.warn('Error loading user stats:', error)
    }
  }

  // ========== تحميل النشاطات ==========
  const loadUserActivities = async () => {
    try {
      if (isOnline) {
        const response = await fetch(`${API_BASE}/activities/recent`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('mcsos_token')}`,
            'Content-Type': 'application/json'
          }
        })
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            setRecentActivities(data)
          }
        }
      }
    } catch (error) {
      console.warn('Error loading activities:', error)
      // ✅ بيانات افتراضية في حالة الفشل
      setRecentActivities([
        { id: 1, action: 'تسجيل الدخول', time: new Date().toLocaleString(), type: 'success' },
        { id: 2, action: 'فتح الملف الشخصي', time: new Date().toLocaleString(), type: 'info' }
      ])
    }
  }

  // ========== حفظ بيانات المستخدم ==========
  const saveUserData = async (data) => {
    // ✅ حفظ محلياً
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setUserData(data)
    
    // ✅ محاولة المزامنة مع الخادم
    if (isOnline) {
      try {
        await usersService.updateUser(data.id, {
          name: data.name,
          nameEn: data.nameEn,
          phone: data.phone,
          address: data.address,
          addressEn: data.addressEn,
          bio: data.bio,
          bioEn: data.bioEn,
          birthday: data.birthday,
          gender: data.gender,
          notifications: data.notifications,
          avatar: data.avatar
        })
        toast.success('تم حفظ التغييرات بنجاح')
      } catch (error) {
        console.warn('Failed to sync profile with server:', error)
        toast.warning('تم الحفظ محلياً، سيتم المزامنة عند الاتصال')
      }
    }
  }
  
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن لا يتجاوز 2 ميجابايت')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('الرجاء اختيار ملف صورة صالح')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempAvatar(reader.result)
        setShowImageModal(true)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const confirmAvatarUpdate = () => {
    const updated = { ...userData, avatar: tempAvatar }
    saveUserData(updated)
    setEditData(updated)
    setShowImageModal(false)
    setTempAvatar(null)
    toast.success('تم تحديث الصورة الشخصية')
  }
  
  const handleSaveProfile = () => {
    setIsSubmitting(true)
    saveUserData(editData)
    setIsEditing(false)
    setIsSubmitting(false)
  }
  
  const handleCancelEdit = () => {
    setEditData({ ...userData })
    setIsEditing(false)
  }
  
  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('الرجاء ملء جميع الحقول')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('كلمة المرور الجديدة غير متطابقة')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setIsSubmitting(true)
    try {
      if (isOnline) {
        await usersService.changePassword(userData.id, {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      }
      toast.success('تم تغيير كلمة المرور بنجاح')
      setShowPasswordModal(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تغيير كلمة المرور')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteAccount = () => {
    toast.error('هذه الميزة غير متاحة حالياً')
    setShowDeleteConfirm(false)
  }
  
  const getActivityIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'success': return <CheckCircle size={16} className="text-green-400" />
      case 'warning': return <AlertCircle size={16} className="text-yellow-400" />
      default: return <Activity size={16} className="text-blue-400" />
    }
  }
  
  const getRoleText = () => {
    if (isRTL) return userData.role || 'مستخدم'
    return userData.roleEn || userData.role || 'User'
  }
  
  const getDepartmentText = () => {
    if (isRTL) return userData.department || 'غير محدد'
    return userData.departmentEn || userData.department || 'Not specified'
  }
  
  const getBioText = () => {
    if (isRTL) return userData.bio || 'لا توجد نبذة'
    return userData.bioEn || userData.bio || 'No bio available'
  }
  
  const getAddressText = () => {
    if (isRTL) return userData.address || 'لا يوجد عنوان'
    return userData.addressEn || userData.address || 'No address'
  }
  
  const getGenderText = () => {
    if (userData.gender === 'male') return isRTL ? 'ذكر' : 'Male'
    if (userData.gender === 'female') return isRTL ? 'أنثى' : 'Female'
    return '-'
  }

  // ========== تحديث البيانات ==========
  const refreshData = () => {
    loadUserProfile()
    toast.success('تم تحديث البيانات')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-4" />
          <div className="text-white">جاري تحميل الملف الشخصي...</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">الملف الشخصي</h1>
          <p className="text-gray-400 mt-1">
            إدارة معلومات حسابك وإعداداتك الشخصية
            {!isOnline && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                ⚡ غير متصل
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={refreshData} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-500/30 transition">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> تحديث
          </button>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30 transition">
              <Edit size={18} /> تعديل الملف
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSaveProfile} disabled={isSubmitting} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-500/30 transition disabled:opacity-50">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} حفظ
              </button>
              <button onClick={handleCancelEdit} className="bg-gray-600/50 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-xl flex items-center gap-2 transition">
                <X size={18} /> إلغاء
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* العمود الأيسر */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
            <div className="relative inline-block group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center mx-auto overflow-hidden">
                {userData.avatar ? (
                  <img src={userData.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl text-white font-bold">
                    {userData.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition opacity-0 group-hover:opacity-100">
                <Camera size={16} className="text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <h2 className="text-xl font-bold text-white mt-4">{userData.name || 'مستخدم'}</h2>
            <p className="text-gray-400 text-sm">{getRoleText()}</p>
            <p className="text-gray-500 text-xs mt-1">{getDepartmentText()}</p>
            {userData._syncPending && (
              <span className="text-xs text-yellow-400 mt-1 block">⏳ في انتظار المزامنة</span>
            )}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">البريد الإلكتروني</span>
                <span className="text-white">{userData.email || '-'}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-400">رقم الجوال</span>
                <span className="text-white">{userData.phone || '-'}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-400">تاريخ الانضمام</span>
                <span className="text-white">{userData.joinDate || '-'}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-400">آخر تسجيل</span>
                <span className="text-white">{userData.lastLogin || '-'}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-green-400" /> إحصائياتي</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">إجمالي المرضى</span>
                <span className="text-white font-bold">{userStats.totalPatients}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">إجمالي المواعيد</span>
                <span className="text-white font-bold">{userStats.totalAppointments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">الإيرادات</span>
                <span className="text-green-400 font-bold">${userStats.totalRevenue}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">المهام المكتملة</span>
                <span className="text-blue-400 font-bold">{userStats.completedTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">المهام المعلقة</span>
                <span className="text-yellow-400 font-bold">{userStats.pendingTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">أيام النشاط</span>
                <span className="text-purple-400 font-bold">{userStats.activeDays}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* العمود الأيمن */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="flex gap-2 border-b border-gray-700 px-6 overflow-x-auto">
              <button onClick={() => setActiveTab('info')} className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition ${activeTab === 'info' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>المعلومات الشخصية</button>
              <button onClick={() => setActiveTab('security')} className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition ${activeTab === 'security' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>الأمان</button>
              <button onClick={() => setActiveTab('preferences')} className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition ${activeTab === 'preferences' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>التفضيلات</button>
              <button onClick={() => setActiveTab('activity')} className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition ${activeTab === 'activity' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>النشاطات</button>
            </div>
            
            <div className="p-6">
              {/* تبويب المعلومات الشخصية */}
              {activeTab === 'info' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">الاسم (عربي)</label>
                      {isEditing ? 
                        <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} /> : 
                        <p className="text-white p-2 bg-gray-700/30 rounded-lg">{userData.name || '-'}</p>
                      }
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">الاسم (English)</label>
                      {isEditing ? 
                        <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editData.nameEn} onChange={(e) => setEditData({...editData, nameEn: e.target.value})} /> : 
                        <p className="text-white p-2 bg-gray-700/30 rounded-lg">{userData.nameEn || '-'}</p>
                      }
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">البريد الإلكتروني</label>
                      {isEditing ? 
                        <input type="email" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} /> : 
                        <p className="text-white p-2 bg-gray-700/30 rounded-lg">{userData.email || '-'}</p>
                      }
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">رقم الجوال</label>
                      {isEditing ? 
                        <input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} /> : 
                        <p className="text-white p-2 bg-gray-700/30 rounded-lg">{userData.phone || '-'}</p>
                      }
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">المنصب</label>
                      {isEditing ? 
                        <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editData.role} onChange={(e) => setEditData({...editData, role: e.target.value})} /> : 
                        <p className="text-white p-2 bg-gray-700/30 rounded-lg">{getRoleText()}</p>
                      }
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">القسم</label>
                      {isEditing ? 
                        <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editData.department} onChange={(e) => setEditData({...editData, department: e.target.value})} /> : 
                        <p className="text-white p-2 bg-gray-700/30 rounded-lg">{getDepartmentText()}</p>
                      }
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">العنوان</label>
                      {isEditing ? 
                        <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editData.address} onChange={(e) => setEditData({...editData, address: e.target.value})} /> : 
                        <p className="text-white p-2 bg-gray-700/30 rounded-lg">{getAddressText()}</p>
                      }
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">تاريخ الميلاد</label>
                      {isEditing ? 
                        <input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editData.birthday} onChange={(e) => setEditData({...editData, birthday: e.target.value})} /> : 
                        <p className="text-white p-2 bg-gray-700/30 rounded-lg">{userData.birthday || '-'}</p>
                      }
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">النوع</label>
                      {isEditing ? 
                        <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editData.gender} onChange={(e) => setEditData({...editData, gender: e.target.value})}>
                          <option value="male">ذكر</option>
                          <option value="female">أنثى</option>
                        </select> : 
                        <p className="text-white p-2 bg-gray-700/30 rounded-lg">{getGenderText()}</p>
                      }
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">نبذة عني</label>
                    {isEditing ? 
                      <textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="3" value={editData.bio} onChange={(e) => setEditData({...editData, bio: e.target.value})} /> : 
                      <p className="text-white p-2 bg-gray-700/30 rounded-lg">{getBioText()}</p>
                    }
                  </div>
                </div>
              )}
              
              {/* تبويب الأمان */}
              {activeTab === 'security' && (
                <div className="space-y-5">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Shield size={24} className="text-blue-400" />
                      <div>
                        <h3 className="font-bold text-white">حماية الحساب</h3>
                        <p className="text-sm text-gray-400">حسابك محمي بكلمة مرور قوية</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setShowPasswordModal(true)} className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-3 rounded-xl flex items-center justify-center gap-2 border border-yellow-500/30 transition">
                    <Lock size={18} /> تغيير كلمة المرور
                  </button>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Bell size={18} className="text-purple-400" /> إعدادات الأمان الإضافية</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">المصادقة الثنائية</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={userData.twoFactorEnabled} onChange={(e) => { 
                            const updated = { ...userData, twoFactorEnabled: e.target.checked }; 
                            saveUserData(updated); 
                            setEditData(updated); 
                          }} />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ml-3 text-sm text-gray-400">{userData.twoFactorEnabled ? 'مفعل' : 'تعطيل'}</span>
                        </label>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">إشعارات تسجيل الدخول</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-blue-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                          <span className="ml-3 text-sm text-gray-400">مفعل</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setShowDeleteConfirm(true)} className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-xl flex items-center justify-center gap-2 border border-red-500/30 transition">
                    <LogOut size={18} /> تسجيل الخروج من جميع الأجهزة
                  </button>
                </div>
              )}
              
              {/* تبويب التفضيلات */}
              {activeTab === 'preferences' && (
                <div className="space-y-5">
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Globe size={18} className="text-blue-400" /> اللغة</h3>
                    <div className="flex gap-3">
                      <button onClick={() => i18n.changeLanguage('ar')} className={`flex-1 py-2 rounded-lg transition ${i18n.language === 'ar' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}>العربية</button>
                      <button onClick={() => i18n.changeLanguage('en')} className={`flex-1 py-2 rounded-lg transition ${i18n.language === 'en' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}>English</button>
                      <button onClick={() => i18n.changeLanguage('fr')} className={`flex-1 py-2 rounded-lg transition ${i18n.language === 'fr' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}>Français</button>
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Monitor size={18} className="text-purple-400" /> المظهر</h3>
                    <div className="flex gap-3">
                      <button onClick={() => setTheme('light')} className={`flex-1 py-2 rounded-lg transition ${theme === 'light' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}><Sun size={16} className="inline mr-1" /> فاتح</button>
                      <button onClick={() => setTheme('dark')} className={`flex-1 py-2 rounded-lg transition ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}><Moon size={16} className="inline mr-1" /> داكن</button>
                      <button onClick={() => setTheme('system')} className={`flex-1 py-2 rounded-lg transition ${theme === 'system' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}><Monitor size={16} className="inline mr-1" /> النظام</button>
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Bell size={18} className="text-yellow-400" /> الإشعارات</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">إشعارات البريد الإلكتروني</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={userData.notifications?.email} onChange={(e) => { 
                            const updated = { ...userData, notifications: { ...userData.notifications, email: e.target.checked } }; 
                            saveUserData(updated); 
                            setEditData(updated); 
                          }} />
                          <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">إشعارات واتساب</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={userData.notifications?.whatsapp} onChange={(e) => { 
                            const updated = { ...userData, notifications: { ...userData.notifications, whatsapp: e.target.checked } }; 
                            saveUserData(updated); 
                            setEditData(updated); 
                          }} />
                          <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">إشعارات التطبيق</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={userData.notifications?.push} onChange={(e) => { 
                            const updated = { ...userData, notifications: { ...userData.notifications, push: e.target.checked } }; 
                            saveUserData(updated); 
                            setEditData(updated); 
                          }} />
                          <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* تبويب النشاطات */}
              {activeTab === 'activity' && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentActivities.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">لا توجد نشاطات</div>
                  ) : (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg transition hover:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          {getActivityIcon(activity.type)}
                          <div>
                            <p className="text-white text-sm">{activity.action}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${activity.type === 'success' ? 'bg-green-500/20 text-green-400' : activity.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {activity.type === 'success' ? 'تم بنجاح' : activity.type === 'warning' ? 'تنبيه' : 'معلومات'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal تغيير كلمة المرور */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">تغيير كلمة المرور</h2>
              <button onClick={() => setShowPasswordModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">كلمة المرور الحالية</label>
                <input type="password" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">كلمة المرور الجديدة</label>
                <input type="password" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">تأكيد كلمة المرور</label>
                <input type="password" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleChangePassword} disabled={isSubmitting} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg hover:bg-blue-500/30 transition disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin inline ml-1" /> : null}
                  {isSubmitting ? 'جاري التغيير...' : 'تغيير'}
                </button>
                <button onClick={() => setShowPasswordModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal تأكيد الصورة */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700 text-center">
            <ImageIcon size={48} className="mx-auto text-blue-400 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">تأكيد تحديث الصورة</h2>
            <p className="text-gray-400 mb-4">هل أنت متأكد من تحديث صورتك الشخصية؟</p>
            <div className="w-32 h-32 rounded-full mx-auto overflow-hidden mb-4 bg-gray-700">
              <img src={tempAvatar} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-3">
              <button onClick={confirmAvatarUpdate} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">تأكيد</button>
              <button onClick={() => setShowImageModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal حذف الحساب */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700 text-center">
            <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">تسجيل الخروج من جميع الأجهزة</h2>
            <p className="text-gray-400 mb-4">سيتم تسجيل خروجك من جميع الأجهزة الأخرى</p>
            <div className="flex gap-3">
              <button onClick={handleDeleteAccount} className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-lg">تأكيد</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}