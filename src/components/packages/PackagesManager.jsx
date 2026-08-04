// src/components/packages/PackagesManager.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, Plus, Edit, Trash2, DollarSign, Clock, CheckCircle, XCircle, RefreshCw, Loader2, X, LayoutGrid, List } from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { packagesService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

// ========== مفتاح التخزين في localStorage ==========
const STORAGE_KEYS = {
  PACKAGES: 'mcsos_packages_v2',
  SERVICES: 'mcsos_services_v2'
}

// ========== دالة مساعدة للوصول إلى localStorage ==========
const getLocalData = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`Error reading ${key}:`, error)
    return null
  }
}

export default function PackagesManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()

  const [packages, setPackages] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assigningPackage, setAssigningPackage] = useState(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [targetPatientName, setTargetPatientName] = useState('')
  const [assignDoctorName, setAssignDoctorName] = useState('د. أحمد رمزي (العلاج الطبيعي والتأهيل)')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    nameFr: '',
    price: '',
    expiryDays: '',
    services: [{ service_id: '', session_count: 1 }]
  })

  // ========== الباقات الافتراضية (للاحتياطي) ==========
  const defaultPackages = [
    {
      id: 1,
      nameAr: 'باقة أساسية',
      nameEn: 'Basic Package',
      nameFr: 'Forfait Basique',
      price: 500,
      sessions: 4,
      expiryDays: 30,
      services: ['تقييم طبي', 'جلسة علاج', 'متابعة'],
      isActive: true
    }
  ]

  // ========== تحميل البيانات ==========
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadServices(),
        loadPackages()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  // ========== تحميل الخدمات من API ==========
  const loadServices = async () => {
    try {
      if (isOnline) {
        const token = localStorage.getItem('mcsos_token')
        console.log('🔑 Token:', token ? 'موجود' : 'غير موجود')
        
        const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`
        const response = await fetch(`${API_BASE}/services`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('mcsos_token')}`,
            'Content-Type': 'application/json'
          }
        })
        
        console.log('📡 Services API Response Status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('📦 Services Data:', data)
          
          let servicesList = []
          if (data && data.services) {
            servicesList = data.services
          } else if (Array.isArray(data)) {
            servicesList = data
          } else if (data && data.data && Array.isArray(data.data)) {
            servicesList = data.data
          }
          
          if (servicesList.length > 0) {
            console.log('✅ Services loaded from API:', servicesList.length)
            console.log('📋 Service IDs (UUIDs):', servicesList.map(s => ({ id: s.id, name: s.name })))
            setServices(servicesList)
            localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(servicesList))
            return
          }
        } else {
          console.warn('⚠️ Failed to load services:', await response.text())
        }
      }
      
      // استخدام localStorage كاحتياطي
      const saved = getLocalData(STORAGE_KEYS.SERVICES)
      if (saved && saved.length > 0) {
        console.log('📂 Services from localStorage:', saved.length)
        // ✅ التحقق من أن الـ IDs هي UUIDs صالحة
        const hasValidUUIDs = saved.some(s => {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          return uuidRegex.test(s.id)
        })
        
        if (hasValidUUIDs) {
          setServices(saved)
        } else {
          console.warn('⚠️ Saved services have invalid UUIDs, using defaults')
          // استخدام UUIDs وهمية صالحة
          const defaultServices = [
            { id: '550e8400-e29b-41d4-a716-446655440000', name: 'تقييم طبي', nameEn: 'Medical Assessment', price: 100 },
            { id: '550e8400-e29b-41d4-a716-446655440001', name: 'جلسة علاج طبيعي', nameEn: 'Physical Therapy Session', price: 150 },
            { id: '550e8400-e29b-41d4-a716-446655440002', name: 'متابعة', nameEn: 'Follow-up', price: 50 }
          ]
          setServices(defaultServices)
          localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(defaultServices))
        }
      } else {
        // بيانات افتراضية للاختبار - مع UUIDs صالحة
        const defaultServices = [
          { id: '550e8400-e29b-41d4-a716-446655440000', name: 'تقييم طبي', nameEn: 'Medical Assessment', price: 100 },
          { id: '550e8400-e29b-41d4-a716-446655440001', name: 'جلسة علاج طبيعي', nameEn: 'Physical Therapy Session', price: 150 },
          { id: '550e8400-e29b-41d4-a716-446655440002', name: 'متابعة', nameEn: 'Follow-up', price: 50 }
        ]
        console.log('📂 Using default services with UUIDs')
        setServices(defaultServices)
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(defaultServices))
      }
    } catch (error) {
      console.error('❌ Error loading services:', error)
      const saved = getLocalData(STORAGE_KEYS.SERVICES)
      if (saved && saved.length > 0) {
        setServices(saved)
      }
    }
  }

  // ========== تحميل الباقات ==========
  const loadPackages = async () => {
    try {
      if (isOnline) {
        const response = await packagesService.getPackages()
        
        let data = []
        if (response && response.packages) {
          data = response.packages
        } else if (response && Array.isArray(response)) {
          data = response
        } else {
          loadLocalPackages()
          return
        }

        // ✅ تنسيق البيانات من API إلى الشكل المستخدم في الواجهة
        const formattedData = data.map(item => ({
          id: item.id || Date.now(),
          nameAr: item.name || item.nameAr || 'باقة',
          nameEn: item.name || item.nameEn || 'Package',
          nameFr: item.name || item.nameFr || 'Forfait',
          description: item.description || '',
          price: item.price || 0,
          total_sessions: item.total_sessions || 0,
          expiryDays: item.expiry_days || item.expiryDays || 30,
          services: (Array.isArray(item.package_services) ? item.package_services : Array.isArray(item.services) ? item.services : []).map(s => {
            const service = services.find(srv => srv.id === s.service_id)
            return {
              service_id: s.service_id,
              service_name: s.service?.name || service?.name || s.service_name || 'خدمة',
              session_count: s.session_count || 1
            }
          }),
          isActive: item.is_active !== undefined ? item.is_active : true,
          _syncPending: item._syncPending || false
        }))

        setPackages(formattedData)
        localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(formattedData))
      } else {
        loadLocalPackages()
      }
    } catch (error) {
      console.error('Error loading packages:', error)
      loadLocalPackages()
    }
  }

  const loadLocalPackages = () => {
    const saved = getLocalData(STORAGE_KEYS.PACKAGES)
    if (saved && saved.length > 0) {
      setPackages(saved)
    } else {
      setPackages(defaultPackages)
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(defaultPackages))
    }
  }

  // ========== حفظ الباقات ==========
  const savePackages = async (newPackages) => {
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(newPackages))
    setPackages(newPackages)

    if (isOnline) {
      const pending = newPackages.filter(item => item._syncPending)
      for (const item of pending) {
        try {
          await packagesService.createPackage(item)
          const synced = newPackages.map(p =>
            p.id === item.id ? { ...p, _syncPending: false } : p
          )
          localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(synced))
          setPackages(synced)
        } catch (error) {
          console.warn('Failed to sync package:', error)
        }
      }
    }
  }

  // ========== الحصول على اسم الباقة حسب اللغة ==========
  const getPackageName = (pkg) => {
    if (i18n.language === 'ar') return pkg.nameAr
    if (i18n.language === 'fr') return pkg.nameFr
    return pkg.nameEn
  }

  // ========== فتح نموذج الإضافة ==========
  const handleAddPackage = () => {
    setEditingPackage(null)
    setFormData({
      nameAr: '',
      nameEn: '',
      nameFr: '',
      price: '',
      expiryDays: '',
      services: [{ service_id: '', session_count: 1 }]
    })
    setShowModal(true)
  }

  // ========== فتح نموذج التعديل ==========
  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg)
    setFormData({
      nameAr: pkg.nameAr,
      nameEn: pkg.nameEn,
      nameFr: pkg.nameFr,
      price: pkg.price,
      expiryDays: pkg.expiryDays || 30,
      services: pkg.services && pkg.services.length > 0 
        ? pkg.services.map(s => ({ 
            service_id: s.service_id, 
            session_count: s.session_count || 1 
          }))
        : [{ service_id: '', session_count: 1 }]
    })
    setShowModal(true)
  }

  // ========== دوال إدارة الخدمات في النموذج ==========
  const handleAddServiceRow = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { service_id: '', session_count: 1 }]
    }))
  }

  const handleRemoveServiceRow = (index) => {
    if (formData.services.length === 1) {
      toast.error('يجب وجود خدمة واحدة على الأقل')
      return
    }
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }))
  }

  const handleServiceChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((s, i) => 
        i === index ? { ...s, [field]: value } : s
      )
    }))
  }

  // ========== حفظ الباقة ==========
  const handleSavePackage = async () => {
    if (!formData.nameAr || !formData.price) {
      toast.error('الرجاء إدخال الاسم والسعر')
      return
    }

    // التحقق من وجود خدمات
    const validServices = formData.services.filter(s => s.service_id)
    if (validServices.length === 0) {
      toast.error('الرجاء إضافة خدمة واحدة على الأقل')
      return
    }

    setIsSubmitting(true)
    try {
      // ✅ تحويل الخدمات إلى الشكل المطلوب من الـ API
      const servicesPayload = validServices.map(s => ({
        service_id: s.service_id, // يجب أن يكون UUID صحيح
        session_count: Number(s.session_count) || 1
      }))

      // ✅ حساب إجمالي عدد الجلسات
      const totalSessions = servicesPayload.reduce((sum, s) => sum + s.session_count, 0)

      const packageData = {
        name: formData.nameAr,
        nameAr: formData.nameAr,
        nameEn: formData.nameEn || formData.nameAr,
        nameFr: formData.nameFr || formData.nameAr,
        price: Number(formData.price),
        expiry_days: Number(formData.expiryDays) || 30,
        total_sessions: totalSessions,
        services: servicesPayload,
        is_active: true
      }

      console.log('📤 Sending package data:', JSON.stringify(packageData, null, 2))

      let newPackage

      if (isOnline) {
        try {
          if (editingPackage) {
            const response = await packagesService.updatePackage(editingPackage.id, packageData)
            newPackage = response?.package || response
          } else {
            const response = await packagesService.createPackage(packageData)
            newPackage = response?.package || response
          }
        } catch (apiError) {
          console.warn('API save failed, saving locally:', apiError)
          newPackage = {
            ...packageData,
            id: editingPackage?.id || Date.now(),
            _syncPending: true
          }
          toast.warning('تم الحفظ محلياً، سيتم المزامنة عند الاتصال')
        }
      } else {
        newPackage = {
          ...packageData,
          id: editingPackage?.id || Date.now(),
          _syncPending: true
        }
        toast.info('تم الحفظ في وضع عدم الاتصال')
      }

      let updatedPackages
      if (editingPackage) {
        updatedPackages = packages.map(p => p.id === editingPackage.id ? { ...newPackage, id: editingPackage.id } : p)
      } else {
        updatedPackages = [newPackage, ...packages]
      }

      await savePackages(updatedPackages)
      toast.success(editingPackage ? 'تم تحديث الباقة' : 'تم إضافة الباقة')
      setShowModal(false)
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حفظ الباقة')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== حذف باقة ==========
  const handleDeletePackage = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الباقة؟')) return

    try {
      if (isOnline) {
        try {
          await packagesService.deletePackage(id)
        } catch (apiError) {
          console.warn('API delete failed, removing locally:', apiError)
        }
      }

      const updated = packages.filter(p => p.id !== id)
      await savePackages(updated)
      toast.success('تم حذف الباقة')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حذف الباقة')
    }
  }

  // ========== تغيير حالة الباقة ==========
  const togglePackageStatus = async (id) => {
    try {
      const pkg = packages.find(p => p.id === id)
      if (!pkg) return

      const newStatus = !pkg.isActive

      if (isOnline) {
        try {
          await packagesService.updatePackageStatus(id, newStatus)
        } catch (apiError) {
          console.warn('API status update failed, updating locally:', apiError)
        }
      }

      const updated = packages.map(p =>
        p.id === id ? { ...p, isActive: newStatus, _syncPending: !isOnline } : p
      )
      await savePackages(updated)
      toast.success('تم تحديث حالة الباقة')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تحديث حالة الباقة')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-4" />
          <div className="text-white">جاري التحميل...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            إدارة الباقات
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            إنشاء وإدارة باقات الخدمات
            {!isOnline && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                ⚡ غير متصل
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadAllData}
            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-purple-500/30 transition"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> تحديث
          </button>
          <button
            onClick={handleAddPackage}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={18} />
            إضافة باقة
          </button>
        </div>
      </div>

      {/* Search Bar & View Mode Toggle for Packages */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-slate-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:flex-1 flex items-center gap-3">
          <input
            type="text"
            placeholder={isRTL ? 'ابحث في الباقات الجاهزة بالاسم أو الخدمة...' : 'Search template packages by name or service...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-gray-700/70 border border-slate-200 dark:border-gray-600 rounded-xl text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute left-3 md:left-auto md:right-3 p-1.5 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>
        
        {/* View Switcher */}
        <div className="flex bg-slate-100 dark:bg-gray-900/50 p-1 rounded-xl shrink-0 w-full md:w-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'grid' 
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50'
            }`}
          >
            <LayoutGrid size={16} /> <span className="hidden md:inline">{isRTL ? 'كروت' : 'Grid'}</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'table' 
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50'
            }`}
          >
            <List size={16} /> <span className="hidden md:inline">{isRTL ? 'جدول' : 'Table'}</span>
          </button>
        </div>
      </div>

      {/* Packages Grid View */}
      {viewMode === 'grid' && (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {packages.filter(p => p.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-16 bg-white dark:bg-gray-800/50 rounded-3xl border border-slate-200/60 dark:border-gray-700/50 shadow-sm flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-4 border border-slate-100 dark:border-gray-700">
              <Package size={40} className="text-slate-300 dark:text-gray-600" />
            </div>
            <p className="text-slate-600 dark:text-gray-400 font-bold text-lg">لا توجد باقات مطابقة للبحث</p>
          </div>
        ) : (
          packages.filter(p => p.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase())).map(pkg => {
            const isPending = pkg._syncPending === true
            return (
              <div key={pkg.id} className={`group bg-white dark:bg-gray-800/90 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:hover:shadow-indigo-900/10 flex flex-col overflow-hidden ${pkg.isActive ? 'border-slate-200/80 dark:border-gray-700/60 shadow-xl shadow-slate-200/40 dark:shadow-none' : 'border-rose-200 dark:border-rose-900/50 opacity-75'}`}>
                
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-slate-50/80 to-transparent dark:from-gray-800 dark:to-transparent border-b border-slate-100 dark:border-gray-700/50">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
                        <Package size={24} strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{getPackageName(pkg)}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${pkg.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'}`}>
                            {pkg.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                          {isPending && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                              ⏳ مزامنة
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Price & Duration */}
                  <div className="flex items-center justify-between mb-5 bg-slate-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-slate-100 dark:border-gray-700/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">{isRTL ? 'السعر' : 'Price'}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{pkg.price}</span>
                        <span className="text-xs font-bold text-slate-500 dark:text-gray-400">{isRTL ? 'ج.م' : 'EGP'}</span>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-gray-700"></div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">{isRTL ? 'الصلاحية' : 'Validity'}</span>
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-gray-300 font-bold">
                        <Clock size={14} className="text-indigo-500" />
                        <span>{pkg.expiryDays || 30} {isRTL ? 'يوم' : 'Days'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {pkg.description && (
                    <p className="text-xs font-medium text-slate-600 dark:text-gray-400 mb-5 leading-relaxed bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100/50 dark:border-indigo-800/30">
                      {pkg.description}
                    </p>
                  )}

                  {/* Sessions details */}
                  <div className="mb-5 flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-extrabold flex items-center gap-1.5 border border-purple-200 dark:border-purple-800/50">
                        <Package size={14} />
                        <span>{pkg.total_sessions || pkg.sessions || 0} {isRTL ? 'إجمالي الجلسات' : 'Total Sessions'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {pkg.services && pkg.services.map((service, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-gray-700/50">
                          <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                          <span className="flex-1 truncate">{service.service_name || service.name || 'خدمة'}</span>
                          <span className="px-2 py-0.5 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded text-xs font-bold shrink-0">
                            {service.session_count || 1} {isRTL ? 'جلسة' : 'Session'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto space-y-3">
                    <button
                      onClick={() => {
                        setAssigningPackage(pkg);
                        setAssignModalOpen(true);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                    >
                      <Package size={16} />
                      {isRTL ? 'تسكين الباقة لمريض' : 'Assign Package to Patient'}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPackage(pkg)}
                        className="flex-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-400 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs font-bold border border-amber-200 dark:border-amber-800/50"
                      >
                        <Edit size={14} />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="flex-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs font-bold border border-rose-200 dark:border-rose-800/50"
                      >
                        <Trash2 size={14} />
                        حذف
                      </button>
                      <button
                        onClick={() => togglePackageStatus(pkg.id)}
                        className={`px-4 py-2.5 rounded-xl transition-colors border text-xs font-bold flex items-center justify-center ${pkg.isActive ? 'bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-gray-600' : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'}`}
                        title={pkg.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                      >
                        {pkg.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
      )}

      {/* Packages Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700/80 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-gray-800/80 border-b border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 font-bold text-[11px] uppercase tracking-wider text-right rtl:text-right">
                  <th className="px-6 py-4">{isRTL ? 'الباقة' : 'Package'}</th>
                  <th className="px-4 py-4 text-center">{isRTL ? 'السعر' : 'Price'}</th>
                  <th className="px-4 py-4 text-center">{isRTL ? 'الجلسات' : 'Sessions'}</th>
                  <th className="px-4 py-4 text-center">{isRTL ? 'الصلاحية' : 'Validity'}</th>
                  <th className="px-4 py-4">{isRTL ? 'تفاصيل الخدمات' : 'Services Detail'}</th>
                  <th className="px-4 py-4 text-center">{isRTL ? 'الحالة' : 'Status'}</th>
                  <th className="px-6 py-4 text-center">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 text-sm">
                {packages.filter(p => p.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-gray-800/80 rounded-2xl flex items-center justify-center mb-3 border border-slate-100 dark:border-gray-700 text-slate-400">
                          <Package size={30} />
                        </div>
                        <p className="text-slate-600 dark:text-gray-400 font-bold text-base">لا توجد باقات مطابقة للبحث</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  packages.filter(p => p.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase())).map(pkg => {
                    const isPending = pkg._syncPending === true
                    return (
                      <tr key={pkg.id} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors duration-150 group text-right rtl:text-right">
                        {/* Package Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm shrink-0">
                              <Package size={18} strokeWidth={2} />
                            </div>
                            <div>
                              <span className="block font-black text-slate-900 dark:text-white text-sm">
                                {getPackageName(pkg)}
                              </span>
                              {pkg.description && (
                                <span className="block text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-[200px] truncate" title={pkg.description}>
                                  {pkg.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        {/* Price */}
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-baseline gap-1 bg-slate-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-700/50">
                            <span className="font-black text-slate-900 dark:text-white text-sm">{pkg.price}</span>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400">{isRTL ? 'ج.م' : 'EGP'}</span>
                          </div>
                        </td>

                        {/* Sessions Count */}
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <span className="font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1 rounded-lg text-xs border border-purple-100 dark:border-purple-800/30">
                            {pkg.total_sessions || pkg.sessions || 0} {isRTL ? 'جلسة' : 'S'}
                          </span>
                        </td>

                        {/* Validity */}
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5 font-bold text-slate-600 dark:text-slate-300 text-xs">
                            <Clock size={14} className="text-slate-400" />
                            <span>{pkg.expiryDays || 30} {isRTL ? 'يوم' : 'D'}</span>
                          </div>
                        </td>

                        {/* Services Detail List */}
                        <td className="px-4 py-4 max-w-[200px]">
                          <div className="flex flex-col gap-1.5">
                            {pkg.services && pkg.services.slice(0, 2).map((service, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-gray-300 bg-slate-50 dark:bg-gray-800/50 p-1.5 rounded-lg border border-slate-100 dark:border-gray-700/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                                <span className="truncate flex-1">{service.service_name || service.name || 'خدمة'}</span>
                                <span className="bg-slate-200 dark:bg-gray-700 px-1.5 rounded text-[10px]">{service.session_count || 1}</span>
                              </div>
                            ))}
                            {pkg.services && pkg.services.length > 2 && (
                              <span className="text-[10px] font-bold text-indigo-500">+{pkg.services.length - 2} {isRTL ? 'خدمات أخرى' : 'more'}</span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${pkg.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'}`}>
                              {pkg.isActive ? 'نشط' : 'غير نشط'}
                            </span>
                            {isPending && (
                              <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                                ⏳ مزامنة
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setAssigningPackage(pkg);
                                setAssignModalOpen(true);
                              }}
                              className="w-8 h-8 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors border border-indigo-200 dark:border-indigo-800/50 shadow-sm hover:shadow-md"
                              title={isRTL ? 'تسكين الباقة لمريض' : 'Assign Package'}
                            >
                              <Package size={14} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => handleEditPackage(pkg)}
                              className="w-8 h-8 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-colors border border-amber-200 dark:border-amber-800/50"
                              title={isRTL ? 'تعديل' : 'Edit'}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeletePackage(pkg.id)}
                              className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-colors border border-rose-200 dark:border-rose-800/50"
                              title={isRTL ? 'حذف' : 'Delete'}
                            >
                              <Trash2 size={14} />
                            </button>
                            <button
                              onClick={() => togglePackageStatus(pkg.id)}
                              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors ${pkg.isActive ? 'bg-slate-50 hover:bg-slate-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-500 dark:text-gray-400 border-slate-200 dark:border-gray-600' : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'}`}
                              title={pkg.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                            >
                              {pkg.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Package */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingPackage ? 'تعديل باقة' : 'إضافة باقة جديدة'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الباقة (عربي) *</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg dark:bg-gray-900"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الباقة (English)</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg dark:bg-gray-900"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">السعر (ر.س) *</label>
                  <input
                    type="number"
                    className="w-full p-3 border rounded-lg dark:bg-gray-900"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">مدة الصلاحية (أيام)</label>
                  <input
                    type="number"
                    className="w-full p-3 border rounded-lg dark:bg-gray-900"
                    value={formData.expiryDays}
                    onChange={(e) => setFormData({...formData, expiryDays: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الخدمات *</label>
                  <button
                    type="button"
                    onClick={handleAddServiceRow}
                    className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    <Plus size={14} className="inline mr-1" /> إضافة خدمة
                  </button>
                </div>

                {formData.services.map((service, index) => (
                  <div key={index} className="flex gap-3 mb-2 items-center">
                    <select
                      className="flex-1 p-3 border rounded-lg dark:bg-gray-900"
                      value={service.service_id}
                      onChange={(e) => handleServiceChange(index, 'service_id', e.target.value)}
                    >
                      <option value="">اختر خدمة</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name || s.nameAr || s.nameEn || 'خدمة'} - {s.price || 0} ر.س
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      className="w-24 p-3 border rounded-lg dark:bg-gray-900"
                      placeholder="عدد"
                      value={service.session_count}
                      onChange={(e) => handleServiceChange(index, 'session_count', e.target.value)}
                    />
                    {formData.services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveServiceRow(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleSavePackage}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 py-2 rounded-lg hover:bg-gray-400"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 7: Treatment Package Assignment Modal */}
      {assignModalOpen && assigningPackage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-5 text-left rtl:text-right">
            <div className="flex justify-between items-center border-b pb-3.5 border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-black text-indigo-950 dark:text-white flex items-center gap-2">
                <Package className="text-purple-600" size={24} />
                {isRTL ? 'تسكين باقة علاجية لمريض (Phase 7)' : 'Assign Package to Patient'}
              </h3>
              <button onClick={() => setAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800 flex justify-between items-center text-xs font-extrabold">
              <span className="text-purple-900 dark:text-purple-300">{getPackageName(assigningPackage)}</span>
              <span className="text-sm font-black text-green-600 dark:text-green-400">{assigningPackage.price} ر.س</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">{isRTL ? 'الاسم الكامل للمريض (Full Name):' : 'Patient Full Name:'}</label>
                <input
                  type="text"
                  placeholder={isRTL ? 'ابحث أو أدخل اسم المريض رباعي...' : 'Enter Patient Name...'}
                  value={targetPatientName}
                  onChange={(e) => setTargetPatientName(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-extrabold outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">{isRTL ? 'الطبيب الموصي بالباقة (Assessment Doctor):' : 'Recommending Doctor:'}</label>
                <input
                  type="text"
                  value={assignDoctorName}
                  onChange={(e) => setAssignDoctorName(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-extrabold outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-300 font-medium space-y-1">
                <div className="font-extrabold flex items-center gap-1">
                  ⚠️ {isRTL ? 'ربط نظام المدفوعات والفواتير (Phase 12):' : 'Payment & Invoice Linking:'}
                </div>
                <div>
                  {isRTL ? 'بمجرد التسكين سيتم إدراج الباقة في ملف المريض وتوجيه إشعار لقسم الحسابات والمالية لإصدار فاتورة السداد وتجهيز متابعة الجلسات المتبقية.' : 'Assigning will create an invoice for finance and initiate package monitoring.'}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  if (!targetPatientName.trim()) {
                    toast.error(isRTL ? 'يرجى إدخال اسم المريض أولاً' : 'Please enter patient name');
                    return;
                  }
                  toast.success(isRTL ? `🎉 تم تسكين الباقة بنجاح للمريض "${targetPatientName}" وإصدار فاتورة متابعة!` : 'Package assigned successfully!');
                  setAssignModalOpen(false);
                  setTargetPatientName('');
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-extrabold text-xs shadow-md transition"
              >
                ✔ {isRTL ? 'تأكيد تسكين الباقة للمريض' : 'Confirm & Assign'}
              </button>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-300 transition"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}