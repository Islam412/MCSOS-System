// src/components/admin/RbacPermissionsMatrix.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Shield, Check, X, Plus, Trash2, Edit, AlertCircle, Sparkles, 
  Search, Lock, Unlock, CheckCircle2, Sliders, Layers, FileText, Users, DollarSign, Box, Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'
import { usersService } from '../../services/api'

export default function RbacPermissionsMatrix({ onRolesUpdated, currentRole, onSelectRole }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Standard permission definitions clustered by domain
  const permissionDomains = [
    {
      id: 'scheduling',
      icon: Calendar,
      title: t('rbac.domain_scheduling', 'مواعيد الحجوزات والاستقبال'),
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
      permissions: [
        { key: 'perm_create_booking', label: t('rbac.perm_create_booking', 'إنشاء وإدارة المواعيد الطبية') },
        { key: 'perm_cancel_booking', label: t('rbac.perm_cancel_booking', 'إلغاء الحجوزات أو نقل المواعيد') },
        { key: 'perm_override_capacity', label: t('rbac.perm_override_capacity', 'استثناء وتجاوز الحد الأقصى للسعة الطبية') },
        { key: 'perm_record_noshow', label: t('rbac.perm_record_noshow', 'تسجيل حالات غياب المرضى دون إشعار') }
      ]
    },
    {
      id: 'clinical',
      icon: FileText,
      title: t('rbac.domain_clinical', 'الرعاية الطبية والملفات المرضية'),
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300',
      permissions: [
        { key: 'perm_view_medical_records', label: t('rbac.perm_view_medical_records', 'الوصول للسجلات والتشخيصات الطبية الكاملة') },
        { key: 'perm_edit_clinical_notes', label: t('rbac.perm_edit_clinical_notes', 'كتابة وتعديل التقارير العلاجية والجلسات') },
        { key: 'perm_manage_treatment_plans', label: t('rbac.perm_manage_treatment_plans', 'إدارة خطط العلاج وتقييم التقدم') }
      ]
    },
    {
      id: 'finance',
      icon: DollarSign,
      title: t('rbac.domain_finance', 'الإدارة المالية والفواتير'),
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300',
      permissions: [
        { key: 'perm_create_invoice', label: t('rbac.perm_create_invoice', 'إصدار الفواتير وتسجيل سندات الصرف') },
        { key: 'perm_apply_discount', label: t('rbac.perm_apply_discount', 'منح الخصومات الاستثنائية والاعتمادات') },
        { key: 'perm_issue_refund', label: t('rbac.perm_issue_refund', 'الموافقة على استرداد الدفعات المالية') },
        { key: 'perm_view_revenue', label: t('rbac.perm_view_revenue', 'عرض التقارير المالية وصافي الإيرادات') }
      ]
    },
    {
      id: 'inventory',
      icon: Box,
      title: t('rbac.domain_inventory', 'المخزون والمستلزمات الطبية'),
      color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50/80 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-900/40',
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-300',
      permissions: [
        { key: 'perm_adjust_inventory', label: t('rbac.perm_adjust_inventory', 'تعديل كميات المخزون والصرف الطبي') },
        { key: 'perm_approve_orders', label: t('rbac.perm_approve_orders', 'اعتماد طلبات شراء المستلزمات الطبية') }
      ]
    },
    {
      id: 'admin',
      icon: Shield,
      title: t('rbac.domain_admin', 'إدارة النظام وإعدادات الحسابات'),
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50/80 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40',
      iconBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300',
      permissions: [
        { key: 'perm_manage_users', label: t('rbac.perm_manage_users', 'إضافة وتعديل وحذف ملفات الموظفين (CRUD)') },
        { key: 'perm_manage_roles', label: t('rbac.perm_manage_roles', 'إنشاء الأدوار وتخصيص صلاحيات RBAC') },
        { key: 'perm_view_audit', label: t('rbac.perm_view_audit', 'مطالعة سجلات الحوكمة وتتبع حركة النظام') }
      ]
    }
  ]

  const allPermissionKeys = permissionDomains.flatMap(d => d.permissions.map(p => p.key))

  // System Default Roles & their standard capabilities
  const getSystemRoles = () => [
    {
      id: 'SYS_ADMIN',
      key: 'Admin',
      title: t('rbac.default_admin', 'المدير العام للنظام'),
      isSystem: true,
      description: isRTL ? 'تحكم كامل في كافة خصائص الإدارة والنظام' : 'Full superuser access to all operational features',
      permissions: [...allPermissionKeys],
      badgeColor: 'bg-purple-600 text-white shadow-sm'
    },
    {
      id: 'SYS_DOCTOR',
      key: 'Doctor',
      title: t('rbac.default_doctor', 'طبيب مختص'),
      isSystem: true,
      description: isRTL ? 'إدارة الجلسات الطبية، الملفات، وكتابة التقارير والتوصيات' : 'Manage medical sessions, patient files, diagnoses and clinical treatments',
      permissions: ['perm_view_medical_records', 'perm_edit_clinical_notes', 'perm_manage_treatment_plans', 'perm_record_noshow'],
      badgeColor: 'bg-emerald-600 text-white shadow-sm'
    },
    {
      id: 'SYS_RECEPTIONIST',
      key: 'Receptionist',
      title: t('rbac.default_reception', 'مسؤول استقبال'),
      isSystem: true,
      description: isRTL ? 'إدارة حجز المواعيد، تسجيل الحضور، ومتابعة قوائم الانتظار' : 'Manage patient scheduling, attendance verification and waiting room queues',
      permissions: ['perm_create_booking', 'perm_cancel_booking', 'perm_record_noshow', 'perm_create_invoice'],
      badgeColor: 'bg-blue-600 text-white shadow-sm'
    },
    {
      id: 'SYS_FINANCE',
      key: 'Finance',
      title: t('rbac.default_finance', 'مسؤول مالي ومحاسبة'),
      isSystem: true,
      description: isRTL ? 'المحاسبة العامة، سندات القبض والصرف، وعرض التقارير المالية' : 'Accounts billing, payment vouchers, refunds, and revenue analytics',
      permissions: ['perm_create_invoice', 'perm_apply_discount', 'perm_issue_refund', 'perm_view_revenue', 'perm_view_audit'],
      badgeColor: 'bg-amber-600 text-white shadow-sm'
    },
    {
      id: 'SYS_OPERATIONS',
      key: 'Operations Manager',
      title: t('rbac.default_operations', 'مدير عمليات المركز'),
      isSystem: true,
      description: isRTL ? 'الإشراف على إشغال العيادات ومخزون المستلزمات وتوزيع الوردية' : 'Oversee clinic utilization, inventory supplies, and schedule optimizations',
      permissions: ['perm_create_booking', 'perm_cancel_booking', 'perm_override_capacity', 'perm_adjust_inventory', 'perm_approve_orders', 'perm_view_audit'],
      badgeColor: 'bg-cyan-600 text-white shadow-sm'
    },
    {
      id: 'SYS_NURSE',
      key: 'Nurse',
      title: t('rbac.default_nurse', 'ممرض / ممارس صحي'),
      isSystem: true,
      description: isRTL ? 'مساعدة الأطباء في الجلسات ومتابعة القياسات الحيوية للمرضى' : 'Assist physicians during treatment sessions and track vital patient metrics',
      permissions: ['perm_view_medical_records', 'perm_adjust_inventory', 'perm_record_noshow'],
      badgeColor: 'bg-rose-600 text-white shadow-sm'
    }
  ]

  const [roles, setRoles] = useState([])
  const [activeRoleId, setActiveRoleId] = useState('SYS_ADMIN')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newRoleData, setNewRoleData] = useState({ name: '', description: '' })

  // Load from local storage or defaults
  useEffect(() => {
    const savedRoles = localStorage.getItem('mcsos_rbac_roles_matrix')
    let initializedRoles = getSystemRoles()
    
    if (savedRoles) {
      try {
        const parsed = JSON.parse(savedRoles)
        const currentSystem = getSystemRoles()
        const merged = parsed.map(savedRole => {
          if (savedRole.isSystem) {
            const sys = currentSystem.find(s => s.id === savedRole.id) || savedRole
            return { ...savedRole, title: sys.title, description: sys.description, badgeColor: sys.badgeColor }
          }
          return savedRole
        })
        initializedRoles = merged
      } catch (e) {
        console.error('Failed to parse RBAC roles from storage', e)
      }
    }
    
    setRoles(initializedRoles)
    if (onRolesUpdated) onRolesUpdated(initializedRoles)
  }, [i18n.language])

  const currentActiveRole = roles.find(r => r.id === activeRoleId) || roles[0]

  const saveMatrixState = (updatedRoles) => {
    setRoles(updatedRoles)
    localStorage.setItem('mcsos_rbac_roles_matrix', JSON.stringify(updatedRoles))
    if (onRolesUpdated) onRolesUpdated(updatedRoles)
    // ✅ مزامنة إعدادات الصلاحيات مع الـ Backend
    try {
      usersService.saveRbacMatrix(updatedRoles).catch(() => {})
    } catch (e) {
      console.error('RBAC sync error:', e)
    }
  }

  const handleTogglePermission = (roleId, permissionKey) => {
    const updated = roles.map(role => {
      if (role.id !== roleId) return role
      const hasPerm = role.permissions.includes(permissionKey)
      const newPerms = hasPerm
        ? role.permissions.filter(k => k !== permissionKey)
        : [...role.permissions, permissionKey]
      return { ...role, permissions: newPerms }
    })
    saveMatrixState(updated)
  }

  const handleSelectAllInDomain = (roleId, domainPermKeys, select) => {
    const updated = roles.map(role => {
      if (role.id !== roleId) return role
      const otherPerms = role.permissions.filter(k => !domainPermKeys.includes(k))
      const newPerms = select ? [...otherPerms, ...domainPermKeys] : otherPerms
      return { ...role, permissions: newPerms }
    })
    saveMatrixState(updated)
  }

  const handleCreateRole = (e) => {
    e.preventDefault()
    if (!newRoleData.name.trim()) {
      toast.error(isRTL ? 'يرجى كتابة اسم الدور الوظيفي الجديد' : 'Please provide a Role Title')
      return
    }

    const newRole = {
      id: `CUST_ROLE_${Date.now()}`,
      key: newRoleData.name.trim(),
      title: newRoleData.name.trim(),
      isSystem: false,
      description: newRoleData.description.trim() || (isRTL ? 'دور وظيفي مخصص داخل النظام' : 'Custom functional user role'),
      permissions: ['perm_create_booking', 'perm_view_medical_records'],
      badgeColor: 'bg-indigo-600 text-white shadow-sm'
    }

    const updated = [...roles, newRole]
    saveMatrixState(updated)
    setActiveRoleId(newRole.id)
    setIsAddModalOpen(false)
    setNewRoleData({ name: '', description: '' })
    toast.success(t('rbac.role_created', 'تم إنشاء الدور الوظيفي بنجاح'), { icon: '✨', style: { background: '#1f2937', color: '#fff' } })
  }

  const handleDeleteRole = (roleId, roleTitle) => {
    if (!window.confirm(t('rbac.delete_role_confirm', 'هل أنت متأكد من حذف هذا الدور المخصص؟'))) return
    const updated = roles.filter(r => r.id !== roleId)
    saveMatrixState(updated)
    if (activeRoleId === roleId) {
      setActiveRoleId(updated[0]?.id || 'SYS_ADMIN')
    }
    toast.success(`${t('rbac.role_deleted', 'تم حذف الدور الوظيفي بنجاح')} (${roleTitle})`, { style: { background: '#7f1d1d', color: '#fff' } })
  }

  const handleConfirmSave = () => {
    toast.success(t('rbac.perm_updated', 'تم تأكيد تعديلات الصلاحيات بنجاح'), { icon: '🛡️', style: { background: '#065f46', color: '#fff' } })
  }

  return (
    <div className={`space-y-6 animate-fadeIn ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Top Banner Card & Role Selector */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-100 dark:border-purple-800/40">
              <Shield className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white tracking-wide flex flex-wrap items-center gap-2 md:gap-3">
                <span>{t('rbac.title', '🛡️ الصلاحيات والأدوار (RBAC)')}</span>
                <span className="px-3 py-1 text-xs rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800 font-bold">
                  Enterprise Security
                </span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-normal">
                {t('rbac.subtitle', 'مصفوفة التحكم في الصلاحيات وإدارة الأدوار الوظيفية داخل المركز الطبي')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full md:w-auto px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition shadow-md flex items-center justify-center gap-2 transform active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>{t('rbac.add_role', '➕ إضافة دور وظيفي جديد')}</span>
          </button>
        </div>

        {/* Role Cards Switcher Grid */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider uppercase flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{t('rbac.system_roles', 'الأدوار الأساسية والمخصصة')} ({roles.length})</span>
            </h3>
            <span className="text-xs text-gray-400">{isRTL ? 'اختر الدور لتخصيص صلاحياته أدناه:' : 'Select role card to modify matrix below:'}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            {roles.map(role => {
              const isSelected = role.id === activeRoleId
              return (
                <div
                  key={role.id}
                  onClick={() => {
                    setActiveRoleId(role.id)
                    if (onSelectRole) onSelectRole(role)
                  }}
                  className={`cursor-pointer rounded-2xl p-4 transition duration-200 border relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-600 dark:border-purple-400 shadow-md transform scale-[1.02]'
                      : 'bg-gray-50 dark:bg-gray-900/60 hover:bg-gray-100 dark:hover:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-2.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${role.badgeColor}`}>
                        {role.title}
                      </span>
                      {!role.isSystem && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id, role.title); }}
                          className="p-1 text-gray-400 hover:text-rose-500 rounded-lg transition"
                          title={isRTL ? 'حذف الدور' : 'Delete Custom Role'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 mb-3">
                      {role.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2.5 border-t border-gray-200/60 dark:border-gray-700/60 text-xs">
                    <span className="text-purple-700 dark:text-purple-300 font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{role.permissions.length} / {allPermissionKeys.length}</span>
                    </span>
                    <span className="text-gray-400 text-[10px] font-semibold">
                      {role.isSystem ? (isRTL ? 'قياسي' : 'System') : (isRTL ? 'مخصص' : 'Custom')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Active Role Configuration Section */}
      {currentActiveRole && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 dark:border-gray-700 gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-2xl ${currentActiveRole.badgeColor} shadow-md`}>
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span>{currentActiveRole.title}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                    {currentActiveRole.key}
                  </span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{currentActiveRole.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 mx-3 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t('rbac.search_permissions', 'البحث داخل قائمة الصلاحيات...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-9 text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>
              <button
                onClick={handleConfirmSave}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center gap-2 transform active:scale-95 flex-shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>{t('rbac.save_changes', 'حفظ التعديلات في المصفوفة')}</span>
              </button>
            </div>
          </div>

          {/* Permission Domains Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {permissionDomains.map(domain => {
              const Icon = domain.icon
              const filteredPerms = domain.permissions.filter(p => 
                p.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.key.toLowerCase().includes(searchTerm.toLowerCase())
              )

              if (filteredPerms.length === 0 && searchTerm) return null

              const domainKeys = domain.permissions.map(p => p.key)
              const allSelected = domainKeys.every(k => currentActiveRole.permissions.includes(k))

              return (
                <div key={domain.id} className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${domain.color}`}>
                  <div>
                    <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-gray-200/60 dark:border-gray-700/60">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${domain.iconBg}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-base text-gray-800 dark:text-white">{domain.title}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => handleSelectAllInDomain(currentActiveRole.id, domainKeys, !allSelected)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                            allSelected
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {allSelected ? t('rbac.deselect_all', 'إلغاء التحديد') : t('rbac.select_all', 'تحديد الكل')}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {filteredPerms.map(perm => {
                        const isChecked = currentActiveRole.permissions.includes(perm.key)
                        return (
                          <label
                            key={perm.key}
                            onClick={(e) => {
                              e.preventDefault()
                              handleTogglePermission(currentActiveRole.id, perm.key)
                            }}
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-white dark:bg-gray-800 border-purple-500 dark:border-purple-500 shadow-sm ring-1 ring-purple-500/20'
                                : 'bg-gray-50/80 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700/70 hover:bg-white dark:hover:bg-gray-800'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 transition-colors flex-shrink-0 ${
                              isChecked ? 'bg-purple-600 border-purple-600 text-white shadow-sm' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-semibold transition ${isChecked ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                {perm.label}
                              </div>
                              <div className="text-[11px] font-mono text-gray-400 dark:text-gray-500 mt-0.5">
                                {perm.key}
                              </div>
                            </div>
                            <div className="text-xs flex-shrink-0 mt-0.5">
                              {isChecked ? <Unlock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Lock className="w-4 h-4 text-gray-400" />}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200/60 dark:border-gray-700/60 text-right">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      {domainKeys.filter(k => currentActiveRole.permissions.includes(k)).length} / {domainKeys.length} {isRTL ? 'صلاحيات مفعلة في هذا القسم' : 'enabled'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal for Creating Custom Role */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-2xl space-y-5 text-gray-800 dark:text-white">
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>{t('rbac.add_role', '➕ إضافة دور وظيفي جديد')}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1.5">
                  {t('rbac.role_name', 'اسم الدور الوظيفي')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newRoleData.name}
                  onChange={(e) => setNewRoleData({ ...newRoleData, name: e.target.value })}
                  placeholder={isRTL ? 'مثال: مراقب مالي وأرشيف' : 'e.g., Financial Auditor'}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1.5">
                  {t('rbac.role_desc', 'وصف المسؤوليات')}
                </label>
                <textarea
                  value={newRoleData.description}
                  onChange={(e) => setNewRoleData({ ...newRoleData, description: e.target.value })}
                  rows={3}
                  placeholder={isRTL ? 'اكتب نبذة عن نطاق عمل صاحب هذا الدور...' : 'Brief summary of operational scope and access requirements...'}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                ></textarea>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-2xl p-3 text-xs text-purple-900 dark:text-purple-200 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                <span>
                  {isRTL ? 'عند إنشاء الدور، سيتم منحه بعض صلاحيات البداية القياسية، يمكنك تعديلها فوراً من المصفوفة بعد الحفز.' : 'Upon creation, default starting permissions will be assigned. You can configure exact checks immediately in the matrix.'}
                </span>
              </div>

              <div className="pt-3.5 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold text-sm transition"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition shadow-md flex items-center gap-2"
                >
                  <Check size={18} />
                  <span>{isRTL ? 'اعتماد الدور الوظيفي' : 'Create Role'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
