// src/pages/admin/EmployeesManagerPage.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Users, Plus, Search, Filter, Edit, Trash2, UserCircle, 
  Shield, Phone, Mail, Award, CheckCircle, Clock, AlertCircle, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import EmployeeCrudModal from '../../components/admin/EmployeeCrudModal'
import { usersService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

export default function EmployeesManagerPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { isOnline } = useServices()

  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState({
    doctors: [],
    reception: [],
    nurses: [],
    finance: [],
    admin: []
  })

  // CRUD & filter state
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false)
  const [selectedEmpForEdit, setSelectedEmpForEdit] = useState(null)
  const [empSearchQuery, setEmpSearchQuery] = useState('')
  const [empDepartmentFilter, setEmpDepartmentFilter] = useState('all')
  const [rbacRolesList, setRbacRolesList] = useState([])

  useEffect(() => {
    loadAllEmployees()
    const savedRoles = localStorage.getItem('mcsos_rbac_roles_matrix')
    if (savedRoles) {
      try { setRbacRolesList(JSON.parse(savedRoles)) } catch (e) { console.error(e) }
    }
  }, [isOnline])

  const loadAllEmployees = async () => {
    setLoading(true)
    try {
      if (!isOnline) {
        loadLocalEmployees()
        setLoading(false)
        return
      }
      const response = await usersService.getUsers()
      let data = Array.isArray(response) ? response : (response?.users || [])
      if (data.length === 0) {
        loadLocalEmployees()
        setLoading(false)
        return
      }
      localStorage.setItem('mcsos_users_v2', JSON.stringify(data))
      groupAndSetEmployees(data)
    } catch (error) {
      console.error('Error loading employees from API:', error)
      loadLocalEmployees()
    } finally {
      setLoading(false)
    }
  }

  const loadLocalEmployees = () => {
    try {
      const saved = localStorage.getItem('mcsos_users_v2')
      let data = saved ? JSON.parse(saved) : []
      if (!Array.isArray(data) || data.length === 0) {
        data = [
          { id: 'EMP-101', name: isRTL ? 'د. سارة عبد الستار' : 'Dr. Sarah Abdel Satar', email: 'sarah.s@mc.com', phone: '+20 100 234 5678', department: 'Doctors', role: 'Doctor', shift: 'Morning (08:00 - 16:00)', status: 'active', salary: '25,000 EGP / 20%' },
          { id: 'EMP-102', name: isRTL ? 'د. حاتم رضوان' : 'Dr. Hatem Radwan', email: 'hatem.r@mc.com', phone: '+20 101 987 6543', department: 'Doctors', role: 'Doctor', shift: 'Evening (16:00 - 00:00)', status: 'active', salary: '28,000 EGP / 25%' },
          { id: 'EMP-103', name: isRTL ? 'منى عبد الرحيم' : 'Mona Abdel Rahim', email: 'mona.recep@mc.com', phone: '+20 102 345 6789', department: 'Reception', role: 'Receptionist', shift: 'Morning (08:00 - 16:00)', status: 'active', salary: '12,000 EGP' },
          { id: 'EMP-104', name: isRTL ? 'طارق فتحي' : 'Tarek Fathy', email: 'tarek.f@mc.com', phone: '+20 105 678 9012', department: 'Finance', role: 'Finance', shift: 'Full Time', status: 'active', salary: '16,000 EGP' },
          { id: 'EMP-105', name: isRTL ? 'مريم صلاح' : 'Maryam Salah', email: 'maryam.s@mc.com', phone: '+20 109 876 5432', department: 'Nursing', role: 'Nurse', shift: 'Evening (16:00 - 00:00)', status: 'inactive', salary: '9,500 EGP' }
        ]
        localStorage.setItem('mcsos_users_v2', JSON.stringify(data))
      }
      groupAndSetEmployees(data)
    } catch (error) {
      console.error('Error loading local employees:', error)
    }
  }

  const groupAndSetEmployees = (data) => {
    const grouped = {
      doctors: data.filter(u => u.department === 'Doctors' || u.role?.toLowerCase().includes('doc') || u.role === 'DOCTOR' || u.role === 'Doctor'),
      reception: data.filter(u => u.department === 'Reception' || u.role?.toLowerCase().includes('recep') || u.role === 'RECEPTIONIST' || u.role === 'Receptionist'),
      finance: data.filter(u => u.department === 'Finance' || u.role?.toLowerCase().includes('fin') || u.role === 'FINANCE' || u.role === 'Finance'),
      nurses: data.filter(u => u.department === 'Nursing' || u.role?.toLowerCase().includes('nurse') || u.role === 'NURSE' || u.role === 'Nurse'),
      admin: data.filter(u => u.department === 'Administration' || u.role === 'Admin' || u.role === 'ADMIN')
    }
    setEmployees(grouped)
  }

  const handleOpenAddEmp = () => {
    setSelectedEmpForEdit(null)
    setIsEmpModalOpen(true)
  }

  const handleOpenEditEmp = (emp) => {
    setSelectedEmpForEdit(emp)
    setIsEmpModalOpen(true)
  }

  const handleSaveEmployee = async (empData) => {
    let allEmps = []
    Object.values(employees).forEach(arr => {
      if (Array.isArray(arr)) allEmps = [...allEmps, ...arr]
    })
    const idx = allEmps.findIndex(e => e.id === empData.id)
    
    if (idx >= 0) {
      allEmps[idx] = empData
      // ✅ مزامنة التحديث مع الـ Backend API عند الاتصال بالإنترنت
      if (isOnline && !String(empData.id).startsWith('EMP-')) {
        try {
          await usersService.updateUser(empData.id, empData)
          if (empData.role) {
            await usersService.assignRole(empData.id, empData.role).catch(err => console.warn('Role assignment notice:', err.message))
          }
          if (empData.status === 'suspended' || empData.status === 'inactive') {
            await usersService.blockUser(empData.id).catch(() => {})
          } else if (empData.status === 'active') {
            await usersService.unblockUser(empData.id).catch(() => {})
          }
        } catch (error) {
          console.error('Failed to update user on server, synced locally:', error)
        }
      }
    } else {
      // ✅ إنشاء موظف جديد على الـ Backend API عند الاتصال بالإنترنت
      if (isOnline) {
        try {
          const created = await usersService.createUser(empData)
          if (created && created.id) {
            empData.id = created.id
          }
          if (empData.role && empData.id) {
            await usersService.assignRole(empData.id, empData.role).catch(() => {})
          }
        } catch (error) {
          console.error('Failed to create user on server, created locally:', error)
        }
      }
      allEmps.push(empData)
    }

    localStorage.setItem('mcsos_users_v2', JSON.stringify(allEmps))
    groupAndSetEmployees(allEmps)
  }

  const handleDeleteEmployee = async (empId) => {
    if (!window.confirm(t('employee_mgmt.delete_confirm_msg', 'هل أنت متأكد من حذف بيانات هذا الموظف نهائياً؟'))) return
    
    // ✅ إرسال طلب الحذف إلى الـ Backend API
    if (isOnline && !String(empId).startsWith('EMP-')) {
      try {
        await usersService.deleteUser(empId)
      } catch (error) {
        console.error('Failed to delete employee from backend server:', error)
      }
    }

    let allEmps = []
    Object.values(employees).forEach(arr => {
      if (Array.isArray(arr)) allEmps = [...allEmps, ...arr]
    })
    allEmps = allEmps.filter(e => e.id !== empId)
    localStorage.setItem('mcsos_users_v2', JSON.stringify(allEmps))
    groupAndSetEmployees(allEmps)
    toast.success(t('employee_mgmt.employee_deleted', 'تم حذف سجل الموظف من القائمة بنجاح'), { style: { background: '#7f1d1d', color: '#fff' } })
  }

  const getFilteredEmployeesList = () => {
    let list = []
    if (empDepartmentFilter === 'all') {
      Object.values(employees).forEach(arr => {
        if (Array.isArray(arr)) list = [...list, ...arr]
      })
    } else if (empDepartmentFilter === 'Doctors') {
      list = employees.doctors || []
    } else if (empDepartmentFilter === 'Reception') {
      list = employees.reception || []
    } else if (empDepartmentFilter === 'Nursing') {
      list = employees.nurses || []
    } else if (empDepartmentFilter === 'Finance') {
      list = employees.finance || []
    } else if (empDepartmentFilter === 'Administration') {
      list = employees.admin || []
    }

    if (empSearchQuery.trim()) {
      const q = empSearchQuery.toLowerCase()
      list = list.filter(e => 
        (e.name || '').toLowerCase().includes(q) || 
        (e.role || '').toLowerCase().includes(q) || 
        (e.department || '').toLowerCase().includes(q) ||
        (e.email || '').toLowerCase().includes(q) ||
        (e.phone || '').includes(q)
      )
    }
    return list
  }

  const totalEmployees = Object.values(employees).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 size={36} className="mx-auto text-indigo-600 dark:text-indigo-400 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 font-semibold">{t('common.loading', 'جاري تحميل سجلات الكوادر والموظفين...')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 animate-fadeIn ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Top Header Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800/40">
            <Users className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white tracking-wide flex flex-wrap items-center gap-2 md:gap-3">
              <span>{t('employee_mgmt.title', 'إدارة شؤون الموظفين والكوادر')}</span>
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800 font-bold">
                {totalEmployees} {t('employee_mgmt.total_count', 'إجمالي منتسبين')}
              </span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-normal">
              {isRTL ? 'إدارة الملفات المهنية للمنتسبين، تحديد الوردية، وربطهم مع مصفوفة الصلاحيات (RBAC)' : 'Manage staff professional records, schedules, status, and role access link'}
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenAddEmp}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition shadow-md flex items-center justify-center gap-2 transform active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>{t('employee_mgmt.add_employee', '➕ إضافة موظف جديد')}</span>
        </button>
      </div>

      {/* Main Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
        {/* Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {[
              { key: 'all', label: t('employee_mgmt.filter_all', 'كافة الأقسام') },
              { key: 'Doctors', label: t('employee_mgmt.filter_doctors', 'الأطباء والاستشاريون') },
              { key: 'Reception', label: t('employee_mgmt.filter_reception', 'الاستقبال وخدمة العملاء') },
              { key: 'Nursing', label: t('employee_mgmt.filter_nurses', 'التمريض والرعاية') },
              { key: 'Finance', label: t('employee_mgmt.filter_finance', 'المالية والحسابات') },
              { key: 'Administration', label: isRTL ? 'الإدارة التنفيذية' : 'Administration' }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setEmpDepartmentFilter(f.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  empDepartmentFilter === f.key
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 mx-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t('employee_mgmt.search_placeholder', 'ابحث بالاسم، الوظيفة أو القسم...')}
              value={empSearchQuery}
              onChange={(e) => setEmpSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-9 text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        {/* Employees List Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 uppercase text-xs border-b border-gray-100 dark:border-gray-700">
              <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <th className="px-5 py-3.5 font-bold">{t('employee_mgmt.name_label', 'الاسم الكامل')}</th>
                <th className="px-5 py-3.5 font-bold">{t('employee_mgmt.dept_label', 'القسم / الإدارة')}</th>
                <th className="px-5 py-3.5 font-bold">{t('employee_mgmt.role_label', 'الدور وصلاحية RBAC')}</th>
                <th className="px-5 py-3.5 font-bold">{t('employee_mgmt.phone_label', 'التواصل')}</th>
                <th className="px-5 py-3.5 font-bold">{t('employee_mgmt.status_label', 'الحالة')}</th>
                <th className="px-5 py-3.5 font-bold text-center">{isRTL ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {getFilteredEmployeesList().length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400 text-sm font-semibold">
                    {t('employee_mgmt.no_employees', 'لا توجد سجلات مطابقة لمعايير البحث الحالية')}
                  </td>
                </tr>
              ) : (
                getFilteredEmployeesList().map((emp, idx) => (
                  <tr key={emp.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-800 dark:text-white flex items-center gap-2.5">
                        <UserCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                        <span>{emp.name}</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                        <span>{emp.email || emp.shift || emp.specialty || ''}</span>
                        {emp.shift && (
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-[10px] text-gray-700 dark:text-gray-300 font-medium">
                            🕒 {emp.shift}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                        {emp.department || (emp.role === 'Doctor' || emp.role === 'DOCTOR' ? 'Doctors' : 'General Staff')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 w-fit">
                        <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>{emp.role || 'Staff'}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-700 dark:text-gray-300 dir-ltr text-left">
                      <div className="flex items-center gap-1.5 justify-end sm:justify-start">
                        <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                        <span>{emp.phone || '+20 100 000 0000'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                        emp.status === 'inactive' 
                          ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' 
                          : emp.status === 'suspended'
                          ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      }`}>
                        {emp.status === 'inactive' 
                          ? t('employee_mgmt.status_inactive', 'إجازة / غير نشط')
                          : emp.status === 'suspended'
                          ? t('employee_mgmt.status_suspended', 'معلق الوصول')
                          : t('employee_mgmt.status_active', 'نشط رأس عمل')
                        }
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditEmp(emp)}
                          className="p-2 bg-gray-100 hover:bg-indigo-50 dark:bg-gray-700 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition border border-gray-200 dark:border-gray-600"
                          title={t('employee_mgmt.edit_employee', 'تعديل البيانات')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
                          className="p-2 bg-gray-100 hover:bg-rose-50 dark:bg-gray-700 dark:hover:bg-rose-900/30 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition border border-gray-200 dark:border-gray-600"
                          title={t('employee_mgmt.delete_employee', 'استبعاد الموظف')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee CRUD Modal Form */}
      <EmployeeCrudModal
        isOpen={isEmpModalOpen}
        onClose={() => setIsEmpModalOpen(false)}
        onSave={handleSaveEmployee}
        employee={selectedEmpForEdit}
        rolesList={rbacRolesList}
      />
    </div>
  )
}
