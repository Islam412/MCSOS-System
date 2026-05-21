import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Users, UserPlus, Search, Filter, Eye, Edit, Trash2, 
  CheckCircle, XCircle, RefreshCw, Download, Printer,
  Mail, Phone, Calendar, Shield, UserCheck, UserX,
  Clock, AlertCircle, Star, Award, Target, Settings,
  Lock, Key, Unlock, Plus, X, Save, UserCog, UserRound
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function UsersManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [resetPasswordData, setResetPasswordData] = useState({ newPassword: '', confirmPassword: '' })
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '', nameEn: '', email: '', password: '', role: 'patient', phone: ''
  })

  // الحسابات الافتراضية
  const systemUsers = [
    { id: 1, name: 'أحمد محمد', nameEn: 'Ahmed Mohamed', email: 'admin@medical.com', role: 'admin', roleAr: 'مدير النظام', status: 'active', phone: '0501111111', joinDate: '2024-01-01', lastLogin: '2024-05-20', isSystem: true },
    { id: 2, name: 'د. أحمد علي', nameEn: 'Dr. Ahmed Ali', email: 'doctor@medical.com', role: 'doctor', roleAr: 'طبيب', status: 'active', phone: '0502222222', joinDate: '2024-01-01', lastLogin: '2024-05-20', isSystem: true },
    { id: 3, name: 'نورة عبدالله', nameEn: 'Noura Abdullah', email: 'reception@medical.com', role: 'reception', roleAr: 'موظف استقبال', status: 'active', phone: '0503333333', joinDate: '2024-01-01', lastLogin: '2024-05-20', isSystem: true },
    { id: 4, name: 'خالد محمد', nameEn: 'Khaled Mohamed', email: 'finance@medical.com', role: 'finance', roleAr: 'مدير مالي', status: 'active', phone: '0504444444', joinDate: '2024-01-01', lastLogin: '2024-05-19', isSystem: true },
    { id: 5, name: 'أحمد محمد', nameEn: 'Ahmed Mohamed', email: 'patient@medical.com', role: 'patient', roleAr: 'مريض', status: 'active', phone: '0505555555', joinDate: '2024-01-15', lastLogin: '2024-05-18', isSystem: true },
    { id: 6, name: 'عمر خالد', nameEn: 'Omar Khaled', email: 'user@medical.com', role: 'user', roleAr: 'مستخدم', status: 'active', phone: '0506666666', joinDate: '2024-02-01', lastLogin: '2024-05-17', isSystem: true }
  ]

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    const savedUsers = localStorage.getItem('mcsos_all_users')
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    } else {
      setUsers(systemUsers)
      localStorage.setItem('mcsos_all_users', JSON.stringify(systemUsers))
    }
    setLoading(false)
  }

  const saveUsers = (usersList) => {
    localStorage.setItem('mcsos_all_users', JSON.stringify(usersList))
    setUsers(usersList)
  }

  const getRoleBadge = (role) => {
    const roles = {
      admin: { name: 'مدير النظام', color: 'bg-purple-500/20 text-purple-400' },
      doctor: { name: 'طبيب', color: 'bg-blue-500/20 text-blue-400' },
      reception: { name: 'استقبال', color: 'bg-green-500/20 text-green-400' },
      finance: { name: 'مالية', color: 'bg-yellow-500/20 text-yellow-400' },
      patient: { name: 'مريض', color: 'bg-pink-500/20 text-pink-400' },
      user: { name: 'مستخدم', color: 'bg-gray-500/20 text-gray-400' }
    }
    const r = roles[role] || roles.user
    return <span className={`px-2 py-1 rounded-full text-xs border ${r.color}`}>{r.name}</span>
  }

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✓ نشط</span>
    } else if (status === 'pending') {
      return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">⏳ قيد المراجعة</span>
    }
    return <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">✗ محظور</span>
  }

  const handleBlockUser = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user?.isSystem) {
      toast.error('لا يمكن حظر الحسابات الأساسية للنظام')
      return
    }
    const updated = users.map(user => 
      user.id === userId ? { ...user, status: user.status === 'active' ? 'blocked' : 'active' } : user
    )
    saveUsers(updated)
    toast.success(user?.status === 'active' ? 'تم حظر الحساب' : 'تم إلغاء حظر الحساب')
  }

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user?.isSystem) {
      toast.error('لا يمكن حذف الحسابات الأساسية للنظام')
      return
    }
    if (window.confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
      const updated = users.filter(user => user.id !== userId)
      saveUsers(updated)
      toast.success('تم حذف الحساب')
    }
  }

  const handleResetPassword = (user) => {
    setSelectedUser(user)
    setResetPasswordData({ newPassword: '', confirmPassword: '' })
    setShowResetPasswordModal(true)
  }

  const handleSaveNewPassword = () => {
    if (!resetPasswordData.newPassword) {
      toast.error('الرجاء إدخال كلمة المرور الجديدة')
      return
    }
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      toast.error('كلمة المرور غير متطابقة')
      return
    }
    if (resetPasswordData.newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }
    
    toast.success(`تم تغيير كلمة المرور للمستخدم ${selectedUser.name}`)
    setShowResetPasswordModal(false)
  }

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('الرجاء إدخال الاسم والبريد الإلكتروني وكلمة المرور')
      return
    }
    
    const newId = Math.max(...users.map(u => u.id), 0) + 1
    const user = {
      id: newId,
      name: newUser.name,
      nameEn: newUser.nameEn || newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      roleAr: newUser.role === 'admin' ? 'مدير' : newUser.role === 'doctor' ? 'طبيب' : newUser.role === 'reception' ? 'استقبال' : newUser.role === 'finance' ? 'مالية' : 'مستخدم',
      status: 'active',
      phone: newUser.phone || '',
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: null,
      isSystem: false
    }
    
    const updated = [...users, user]
    saveUsers(updated)
    toast.success('تم إضافة المستخدم بنجاح')
    setShowAddUserModal(false)
    setNewUser({ name: '', nameEn: '', email: '', password: '', role: 'patient', phone: '' })
  }

  const exportUsers = () => {
    const exportData = users.map(user => ({
      الاسم: user.name,
      'البريد الإلكتروني': user.email,
      'نوع الحساب': user.roleAr,
      'رقم الجوال': user.phone || '',
      'تاريخ التسجيل': user.joinDate,
      'آخر تسجيل': user.lastLogin || 'لم يسجل بعد',
      الحالة: user.status === 'active' ? 'نشط' : 'محظور'
    }))
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('تم تصدير بيانات المستخدمين')
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    doctor: users.filter(u => u.role === 'doctor').length,
    reception: users.filter(u => u.role === 'reception').length,
    finance: users.filter(u => u.role === 'finance').length,
    patient: users.filter(u => u.role === 'patient').length,
    user: users.filter(u => u.role === 'user').length,
    active: users.filter(u => u.status === 'active').length
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-white">جاري التحميل...</div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h1 className="text-3xl font-bold gradient-text">إدارة المستخدمين</h1><p className="text-gray-400 mt-1">جميع حسابات المستخدمين المسجلة في النظام</p></div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddUserModal(true)} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-500/30"><UserPlus size={18} /> مستخدم جديد</button>
          <button onClick={exportUsers} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30"><Download size={18} /> تصدير</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-white">{stats.total}</p><p className="text-xs text-gray-400">إجمالي المستخدمين</p></div>
        <div className="bg-purple-500/10 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-purple-400">{stats.admin}</p><p className="text-xs text-gray-400">مديرين</p></div>
        <div className="bg-blue-500/10 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-blue-400">{stats.doctor}</p><p className="text-xs text-gray-400">أطباء</p></div>
        <div className="bg-green-500/10 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-green-400">{stats.reception}</p><p className="text-xs text-gray-400">استقبال</p></div>
        <div className="bg-yellow-500/10 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-yellow-400">{stats.finance}</p><p className="text-xs text-gray-400">مالية</p></div>
        <div className="bg-pink-500/10 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-pink-400">{stats.patient}</p><p className="text-xs text-gray-400">مرضى</p></div>
        <div className="bg-gray-500/10 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-gray-400">{stats.user}</p><p className="text-xs text-gray-400">مستخدمين</p></div>
      </div>

      <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input type="text" placeholder="ابحث بالاسم أو البريد..." className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <select className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}><option value="all">جميع الأدوار</option><option value="admin">مدير</option><option value="doctor">طبيب</option><option value="reception">استقبال</option><option value="finance">مالية</option><option value="patient">مريض</option><option value="user">مستخدم</option></select>
          <select className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}><option value="all">جميع الحالات</option><option value="active">نشط</option><option value="blocked">محظور</option></select>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50"><h2 className="text-xl font-bold text-white">قائمة المستخدمين ({filteredUsers.length})</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80"><tr className={`${isRTL ? 'text-right' : 'text-left'}`}><th className="px-4 py-3 text-sm text-gray-300">#</th><th className="px-4 py-3 text-sm text-gray-300">المستخدم</th><th className="px-4 py-3 text-sm text-gray-300">البريد الإلكتروني</th><th className="px-4 py-3 text-sm text-gray-300">نوع الحساب</th><th className="px-4 py-3 text-sm text-gray-300">رقم الجوال</th><th className="px-4 py-3 text-sm text-gray-300">تاريخ التسجيل</th><th className="px-4 py-3 text-sm text-gray-300">آخر تسجيل</th><th className="px-4 py-3 text-sm text-gray-300">الحالة</th><th className="px-4 py-3 text-sm text-gray-300">إجراءات</th></tr></thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredUsers.map((user, idx) => (<tr key={user.id} className="hover:bg-gray-700/30"><td className="px-4 py-3 text-gray-400">{idx + 1}</td><td className="px-4 py-3"><div className="font-semibold text-white">{user.name}</div><div className="text-xs text-gray-500">{user.nameEn || ''}</div></td><td className="px-4 py-3 text-gray-300 dir-ltr text-sm">{user.email}</td><td className="px-4 py-3">{getRoleBadge(user.role)}</td><td className="px-4 py-3 text-gray-300 dir-ltr">{user.phone || '—'}</td><td className="px-4 py-3 text-gray-300">{user.joinDate}</td><td className="px-4 py-3 text-gray-300">{user.lastLogin || '—'}</td><td className="px-4 py-3">{getStatusBadge(user.status)}</td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => handleResetPassword(user)} className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded"><Key size={16} /></button><button onClick={() => handleBlockUser(user.id)} className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded">{user.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}</button>{!user.isSystem && <button onClick={() => handleDeleteUser(user.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 size={16} /></button>}</div></td></tr>))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddUserModal && (<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">إضافة مستخدم جديد</h2><button onClick={() => setShowAddUserModal(false)}><X size={20} className="text-gray-400" /></button></div><div className="space-y-4"><input type="text" placeholder="الاسم الكامل *" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} /><input type="email" placeholder="البريد الإلكتروني *" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} /><input type="password" placeholder="كلمة المرور *" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} /><input type="tel" placeholder="رقم الجوال" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} /><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}><option value="admin">مدير</option><option value="doctor">طبيب</option><option value="reception">استقبال</option><option value="finance">مالية</option><option value="patient">مريض</option><option value="user">مستخدم</option></select><div className="flex gap-3 pt-4"><button onClick={handleAddUser} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">إضافة</button><button onClick={() => setShowAddUserModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div></div></div></div>)}

      {showResetPasswordModal && selectedUser && (<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">تغيير كلمة المرور - {selectedUser.name}</h2><button onClick={() => setShowResetPasswordModal(false)}><X size={20} className="text-gray-400" /></button></div><div className="space-y-4"><input type="password" placeholder="كلمة المرور الجديدة" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={resetPasswordData.newPassword} onChange={(e) => setResetPasswordData({...resetPasswordData, newPassword: e.target.value})} /><input type="password" placeholder="تأكيد كلمة المرور" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={resetPasswordData.confirmPassword} onChange={(e) => setResetPasswordData({...resetPasswordData, confirmPassword: e.target.value})} /><div className="flex gap-3 pt-4"><button onClick={handleSaveNewPassword} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">حفظ</button><button onClick={() => setShowResetPasswordModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div></div></div></div>)}
    </div>
  )
}