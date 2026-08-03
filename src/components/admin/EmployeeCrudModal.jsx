// src/components/admin/EmployeeCrudModal.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Check, User, Mail, Phone, Briefcase, Clock, DollarSign, Shield, AlertCircle, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EmployeeCrudModal({ isOpen, onClose, onSave, employee, rolesList = [] }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Doctors',
    role: 'Doctor',
    shift: 'Morning (08:00 - 16:00)',
    salary: '',
    status: 'active'
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || employee.category || 'Doctors',
        role: employee.role || employee.position || 'Doctor',
        shift: employee.shift || 'Morning (08:00 - 16:00)',
        salary: employee.salary || '',
        status: employee.status || 'active'
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: 'Doctors',
        role: rolesList.length > 0 ? rolesList[0].key || rolesList[0].name : 'Doctor',
        shift: 'Morning (08:00 - 16:00)',
        salary: '',
        status: 'active'
      })
    }
    setErrors({})
  }, [employee, isOpen, rolesList])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = isRTL ? 'الاسم مطلوب' : 'Name is required'
    if (!formData.phone.trim()) newErrors.phone = isRTL ? 'رقم الهاتف مطلوب' : 'Phone is required'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onSave({
      ...formData,
      id: employee ? employee.id : `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      updatedAt: new Date().toISOString()
    })

    toast.success(
      employee 
        ? t('employee_mgmt.employee_updated', 'تم حفظ تحديثات ملف الموظف بنجاح')
        : t('employee_mgmt.employee_added', 'تمت إضافة ملف الموظف الجديد بنجاح'),
      { icon: '✨', style: { background: '#1f2937', color: '#fff' } }
    )
    onClose()
  }

  const departments = [
    { value: 'Doctors', label: t('employee_mgmt.filter_doctors', 'الأطباء والاستشاريون') },
    { value: 'Nursing', label: t('employee_mgmt.filter_nurses', 'التمريض والرعاية') },
    { value: 'Reception', label: t('employee_mgmt.filter_reception', 'الاستقبال وممثلي خدمة العملاء') },
    { value: 'Finance', label: t('employee_mgmt.filter_finance', 'المالية والحسابات') },
    { value: 'Administration', label: isRTL ? 'الإدارة التنفيذية' : 'Executive Administration' }
  ]

  const shiftOptions = [
    { value: 'Morning (08:00 - 16:00)', label: isRTL ? 'الوردية الصباحية (08:00 - 16:00)' : 'Morning Shift (08:00 - 16:00)' },
    { value: 'Evening (16:00 - 00:00)', label: isRTL ? 'الوردية المسائية (16:00 - 00:00)' : 'Evening Shift (16:00 - 00:00)' },
    { value: 'Full Time', label: isRTL ? 'دوام كامل (Full Time)' : 'Full Time Duty' },
    { value: 'Flexible / On-Call', label: isRTL ? 'ساعات مرنة / تحت الطلب' : 'Flexible / On-Call' }
  ]

  const inputClassName = "w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl shadow-2xl overflow-hidden text-gray-800 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 px-6 py-5 flex items-center justify-between shadow-md text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold tracking-wide text-white">
                {employee 
                  ? t('employee_mgmt.modal_edit_title', 'تحديث الملف الوظيفي للموظف')
                  : t('employee_mgmt.modal_add_title', 'إدراج بيانات موظف جديد بالمركز')
                }
              </h3>
              <p className="text-xs text-indigo-100 mt-0.5 font-normal">
                {employee ? `${employee.name} • ${employee.department || 'Staff'}` : isRTL ? 'أدخل البيانات الأساسية وخصص الصلاحيات الوظيفية' : 'Enter primary staff profile and assign role parameters'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition transform hover:scale-105"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{t('employee_mgmt.name_label', 'الاسم الكامل للموظف')} <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={isRTL ? 'مثال: د. سارة عبد الحميد' : 'e.g., Dr. Sarah Ahmed'}
                className={inputClassName}
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1.5 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{t('employee_mgmt.email_label', 'البريد الإلكتروني المهني')}</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="staff@medical-center.com"
                className={`${inputClassName} dir-ltr text-left`}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('employee_mgmt.phone_label', 'رقم التواصل / الجوال')} <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+20 100 123 4567"
                className={`${inputClassName} dir-ltr text-left font-mono`}
              />
              {errors.phone && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.phone}</p>}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{t('employee_mgmt.dept_label', 'القسم الطبي / الإداري')}</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={inputClassName}
              >
                {departments.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Role (RBAC Link) */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1.5 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{t('employee_mgmt.role_label', 'الدور الوظيفي والصلاحية (RBAC)')}</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2.5 border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200 font-bold rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 transition"
              >
                {rolesList.length > 0 ? (
                  rolesList.map(r => (
                    <option key={r.key || r.id || r.name} value={r.key || r.name}>
                      {r.title || r.name} ({r.permissions ? r.permissions.length : 'RBAC'} {isRTL ? 'صلاحية' : 'perms'})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Admin">{t('rbac.default_admin', 'المدير العام للنظام')}</option>
                    <option value="Doctor">{t('rbac.default_doctor', 'طبيب مختص')}</option>
                    <option value="Receptionist">{t('rbac.default_reception', 'مسؤول استقبال')}</option>
                    <option value="Operations">{t('rbac.default_operations', 'مدير عمليات المركز')}</option>
                    <option value="Finance">{t('rbac.default_finance', 'مسؤول مالي ومحاسبة')}</option>
                    <option value="Nurse">{t('rbac.default_nurse', 'ممرض / ممارس صحي')}</option>
                  </>
                )}
              </select>
            </div>

            {/* Shift & Hours */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>{t('employee_mgmt.shift_label', 'الوردية وساعات العمل')}</span>
              </label>
              <select
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                className={inputClassName}
              >
                {shiftOptions.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Salary / Commission */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('employee_mgmt.salary_label', 'الراتب الأساسي / نسبة العمولة')}</span>
              </label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder={isRTL ? 'مثال: 15,000 EGP / 15% عمولة كشف' : 'e.g., $3,000 / 15% consult com.'}
                className={inputClassName}
              />
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1.5 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>{t('employee_mgmt.status_label', 'حالة حساب الموظف')}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, status: 'active' }))}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    formData.status === 'active'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {t('employee_mgmt.status_active', 'نشط رأس عمل')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, status: 'inactive' }))}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    formData.status === 'inactive'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {t('employee_mgmt.status_inactive', 'إجازة / خارج')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, status: 'suspended' }))}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    formData.status === 'suspended'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {t('employee_mgmt.status_suspended', 'معلق الوصول')}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold text-sm transition"
            >
              {t('employee_mgmt.cancel_btn', 'إلغاء وإغلاق')}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{t('employee_mgmt.save_btn', 'حفظ واعتماد البيانات')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
