import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  User, Mail, Phone, MapPin, Calendar, Clock, Activity, 
  Edit, Save, X, Camera, Lock, Key, LogOut, CheckCircle,
  Shield, Bell, Globe, Moon, Sun, Monitor, Award, TrendingUp,
  Users, Calendar as CalendarIcon, FileText, Stethoscope
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useTheme } from '../../context/ThemeContext'

export default function Profile() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { theme, setTheme } = useTheme()
  
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  
  // بيانات المستخدم (يمكن جلبها من localStorage أو API)
  const [userData, setUserData] = useState({
    name: 'أحمد محمد',
    nameEn: 'Ahmed Mohamed',
    email: 'ahmed@medicalcenter.com',
    phone: '+966 50 123 4567',
    role: 'مدير النظام',
    roleEn: 'System Administrator',
    department: 'تقنية المعلومات',
    departmentEn: 'IT Department',
    joinDate: '2024-01-15',
    lastLogin: '2024-05-20 14:30:00',
    avatar: null,
    bio: 'مدير نظام المركز الطبي، مسؤول عن إدارة النظام والمراقبة',
    bioEn: 'Medical Center System Administrator, responsible for system management and monitoring'
  })
  
  const [editData, setEditData] = useState({ ...userData })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // إحصائيات المستخدم
  const [userStats, setUserStats] = useState({
    totalPatients: 156,
    totalAppointments: 342,
    totalRevenue: 125000,
    completedTasks: 28,
    pendingTasks: 5,
    activeDays: 127
  })
  
  // النشاطات الأخيرة
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, action: 'تسجيل مريض جديد', time: '2024-05-20 10:30:00', type: 'success' },
    { id: 2, action: 'تحديث بيانات طبيب', time: '2024-05-20 09:15:00', type: 'info' },
    { id: 3, action: 'إنشاء فاتورة جديدة', time: '2024-05-19 16:45:00', type: 'success' },
    { id: 4, action: 'تسجيل خروج', time: '2024-05-19 18:00:00', type: 'warning' },
    { id: 5, action: 'تعديل موعد مريض', time: '2024-05-19 14:20:00', type: 'info' },
  ])
  
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUserData({ ...userData, avatar: reader.result })
        toast.success('تم تحديث الصورة الشخصية')
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleSaveProfile = () => {
    setUserData(editData)
    setIsEditing(false)
    toast.success('تم حفظ التغييرات بنجاح')
  }
  
  const handleCancelEdit = () => {
    setEditData({ ...userData })
    setIsEditing(false)
  }
  
  const handleChangePassword = () => {
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
    toast.success('تم تغيير كلمة المرور بنجاح')
    setShowPasswordModal(false)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }
  
  const getActivityIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={16} className="text-green-400" />
      case 'warning': return <Clock size={16} className="text-yellow-400" />
      default: return <Activity size={16} className="text-blue-400" />
    }
  }
  
  const getRoleText = () => {
    return isRTL ? userData.role : userData.roleEn
  }
  
  const getDepartmentText = () => {
    return isRTL ? userData.department : userData.departmentEn
  }
  
  const getBioText = () => {
    return isRTL ? userData.bio : userData.bioEn
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">الملف الشخصي</h1>
          <p className="text-gray-400 mt-1">إدارة معلومات حسابك وإعداداتك الشخصية</p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30">
            <Edit size={18} /> تعديل الملف
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSaveProfile} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-500/30">
              <Save size={18} /> حفظ
            </button>
            <button onClick={handleCancelEdit} className="bg-gray-600/50 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-xl flex items-center gap-2">
              <X size={18} /> إلغاء
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* العمود الأيسر - معلومات أساسية */}
        <div className="lg:col-span-1 space-y-6">
          {/* بطاقة الصورة الشخصية */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center mx-auto overflow-hidden">
                {userData.avatar ? (
                  <img src={userData.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-white" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition">
                <Camera size={16} className="text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <h2 className="text-xl font-bold text-white mt-4">{userData.name}</h2>
            <p className="text-gray-400 text-sm">{getRoleText()}</p>
            <p className="text-gray-500 text-xs mt-1">{getDepartmentText()}</p>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-sm"><span className="text-gray-400">تاريخ الانضمام</span><span className="text-white">{userData.joinDate}</span></div>
              <div className="flex justify-between text-sm mt-2"><span className="text-gray-400">آخر تسجيل دخول</span><span className="text-white">{userData.lastLogin}</span></div>
            </div>
          </div>
          
          {/* إحصائيات سريعة */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-green-400" /> إحصائياتي</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-gray-400">إجمالي المرضى</span><span className="text-white font-bold">{userStats.totalPatients}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400">إجمالي المواعيد</span><span className="text-white font-bold">{userStats.totalAppointments}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400">الإيرادات</span><span className="text-green-400 font-bold">${userStats.totalRevenue}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400">المهام المكتملة</span><span className="text-blue-400 font-bold">{userStats.completedTasks}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400">المهام المعلقة</span><span className="text-yellow-400 font-bold">{userStats.pendingTasks}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400">أيام النشاط</span><span className="text-purple-400 font-bold">{userStats.activeDays}</span></div>
            </div>
          </div>
        </div>
        
        {/* العمود الأيمن - معلومات تفصيلية */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="flex gap-2 border-b border-gray-700 px-6">
              <button onClick={() => setActiveTab('info')} className={`px-4 py-3 text-sm font-medium transition ${activeTab === 'info' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>المعلومات الشخصية</button>
              <button onClick={() => setActiveTab('security')} className={`px-4 py-3 text-sm font-medium transition ${activeTab === 'security' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>الأمان</button>
              <button onClick={() => setActiveTab('preferences')} className={`px-4 py-3 text-sm font-medium transition ${activeTab === 'preferences' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>التفضيلات</button>
              <button onClick={() => setActiveTab('activity')} className={`px-4 py-3 text-sm font-medium transition ${activeTab === 'activity' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>النشاطات</button>
            </div>
            
            <div className="p-6">
              {/* تبويب المعلومات الشخصية */}
              {activeTab === 'info' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="block text-sm text-gray-400 mb-1">الاسم (عربي)</label>{isEditing ? <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} /> : <p className="text-white p-2 bg-gray-700/30 rounded-lg">{userData.name}</p>}</div>
                    <div><label className="block text-sm text-gray-400 mb-1">الاسم (English)</label>{isEditing ? <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editData.nameEn} onChange={(e) => setEditData({...editData, nameEn: e.target.value})} /> : <p className="text-white p-2 bg-gray-700/30 rounded-lg">{userData.nameEn}</p>}</div>
                    <div><label className="block text-sm text-gray-400 mb-1">البريد الإلكتروني</label>{isEditing ? <input type="email" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} /> : <p className="text-white p-2 bg-gray-700/30 rounded-lg">{userData.email}</p>}</div>
                    <div><label className="block text-sm text-gray-400 mb-1">رقم الجوال</label>{isEditing ? <input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} /> : <p className="text-white p-2 bg-gray-700/30 rounded-lg">{userData.phone}</p>}</div>
                    <div><label className="block text-sm text-gray-400 mb-1">المنصب</label>{isEditing ? <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editData.role} onChange={(e) => setEditData({...editData, role: e.target.value})} /> : <p className="text-white p-2 bg-gray-700/30 rounded-lg">{getRoleText()}</p>}</div>
                    <div><label className="block text-sm text-gray-400 mb-1">القسم</label>{isEditing ? <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editData.department} onChange={(e) => setEditData({...editData, department: e.target.value})} /> : <p className="text-white p-2 bg-gray-700/30 rounded-lg">{getDepartmentText()}</p>}</div>
                  </div>
                  <div><label className="block text-sm text-gray-400 mb-1">نبذة عني</label>{isEditing ? <textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="3" value={editData.bio} onChange={(e) => setEditData({...editData, bio: e.target.value})} /> : <p className="text-white p-2 bg-gray-700/30 rounded-lg">{getBioText()}</p>}</div>
                </div>
              )}
              
              {/* تبويب الأمان */}
              {activeTab === 'security' && (
                <div className="space-y-5">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"><div className="flex items-center gap-3"><Shield size={24} className="text-blue-400" /><div><h3 className="font-bold text-white">حماية الحساب</h3><p className="text-sm text-gray-400">حسابك محمي بكلمة مرور قوية</p></div></div></div>
                  <button onClick={() => setShowPasswordModal(true)} className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-3 rounded-xl flex items-center justify-center gap-2 border border-yellow-500/30"><Lock size={18} /> تغيير كلمة المرور</button>
                  <div className="bg-gray-700/30 rounded-lg p-4"><h3 className="font-bold text-white mb-3 flex items-center gap-2"><Bell size={18} className="text-purple-400" /> إعدادات الأمان الإضافية</h3><div className="space-y-3"><div className="flex justify-between items-center"><span className="text-gray-300">المصادقة الثنائية</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" /><div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div><span className="ml-3 text-sm text-gray-400">تعطيل</span></label></div><div className="flex justify-between items-center"><span className="text-gray-300">إشعارات تسجيل الدخول</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" defaultChecked /><div className="w-11 h-6 bg-blue-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div><span className="ml-3 text-sm text-gray-400">مفعل</span></label></div></div></div>
                  <button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-xl flex items-center justify-center gap-2 border border-red-500/30"><LogOut size={18} /> تسجيل الخروج من جميع الأجهزة</button>
                </div>
              )}
              
              {/* تبويب التفضيلات */}
              {activeTab === 'preferences' && (
                <div className="space-y-5">
                  <div className="bg-gray-700/30 rounded-lg p-4"><h3 className="font-bold text-white mb-3 flex items-center gap-2"><Globe size={18} className="text-blue-400" /> اللغة</h3><div className="flex gap-3"><button onClick={() => i18n.changeLanguage('ar')} className={`flex-1 py-2 rounded-lg ${i18n.language === 'ar' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}>العربية</button><button onClick={() => i18n.changeLanguage('en')} className={`flex-1 py-2 rounded-lg ${i18n.language === 'en' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}>English</button><button onClick={() => i18n.changeLanguage('fr')} className={`flex-1 py-2 rounded-lg ${i18n.language === 'fr' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}>Français</button></div></div>
                  <div className="bg-gray-700/30 rounded-lg p-4"><h3 className="font-bold text-white mb-3 flex items-center gap-2"><Monitor size={18} className="text-purple-400" /> المظهر</h3><div className="flex gap-3"><button onClick={() => setTheme('light')} className={`flex-1 py-2 rounded-lg ${theme === 'light' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}><Sun size={16} className="inline mr-1" /> فاتح</button><button onClick={() => setTheme('dark')} className={`flex-1 py-2 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}><Moon size={16} className="inline mr-1" /> داكن</button><button onClick={() => setTheme('system')} className={`flex-1 py-2 rounded-lg ${theme === 'system' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}><Monitor size={16} className="inline mr-1" /> النظام</button></div></div>
                  <div className="bg-gray-700/30 rounded-lg p-4"><h3 className="font-bold text-white mb-3 flex items-center gap-2"><Bell size={18} className="text-yellow-400" /> الإشعارات</h3><div className="space-y-3"><div className="flex justify-between items-center"><span className="text-gray-300">إشعارات البريد الإلكتروني</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" defaultChecked /><div className="w-11 h-6 bg-blue-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div></label></div><div className="flex justify-between items-center"><span className="text-gray-300">إشعارات واتساب</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" /><div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div></label></div><div className="flex justify-between items-center"><span className="text-gray-300">إشعارات التطبيق</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" defaultChecked /><div className="w-11 h-6 bg-blue-600 rounded-full"></div></label></div></div></div>
                </div>
              )}
              
              {/* تبويب النشاطات */}
              {activeTab === 'activity' && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">{getActivityIcon(activity.type)}<div><p className="text-white text-sm">{activity.action}</p><p className="text-xs text-gray-500">{activity.time}</p></div></div>
                      <span className={`text-xs px-2 py-1 rounded-full ${activity.type === 'success' ? 'bg-green-500/20 text-green-400' : activity.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>{activity.type === 'success' ? 'تم بنجاح' : activity.type === 'warning' ? 'تنبيه' : 'معلومات'}</span>
                    </div>
                  ))}
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
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">تغيير كلمة المرور</h2><button onClick={() => setShowPasswordModal(false)}><X size={20} className="text-gray-400" /></button></div>
            <div className="space-y-4"><div><label className="block text-sm text-gray-400 mb-1">كلمة المرور الحالية</label><input type="password" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} /></div><div><label className="block text-sm text-gray-400 mb-1">كلمة المرور الجديدة</label><input type="password" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} /></div><div><label className="block text-sm text-gray-400 mb-1">تأكيد كلمة المرور الجديدة</label><input type="password" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} /></div><div className="flex gap-3 pt-4"><button onClick={handleChangePassword} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg">تغيير</button><button onClick={() => setShowPasswordModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div></div>
          </div>
        </div>
      )}
    </div>
  )
}
