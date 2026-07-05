// src/components/packages/PackagesManager.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, Plus, Edit, Trash2, DollarSign, Clock, CheckCircle, XCircle, RefreshCw, Loader2, X } from 'lucide-react'
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
          price: item.price || 0,
          total_sessions: item.total_sessions || 0,
          expiryDays: item.expiry_days || item.expiryDays || 30,
          services: Array.isArray(item.services) 
            ? item.services.map(s => {
                const service = services.find(srv => srv.id === s.service_id)
                return {
                  service_id: s.service_id,
                  service_name: service?.name || s.service_name || 'خدمة',
                  session_count: s.session_count || 1
                }
              })
            : [],
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

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>لا توجد باقات</p>
          </div>
        ) : (
          packages.map(pkg => {
            const isPending = pkg._syncPending === true
            return (
              <div key={pkg.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border transition-all ${pkg.isActive ? 'border-gray-200 dark:border-gray-700' : 'border-red-200 dark:border-red-800 opacity-60'}`}>
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">{getPackageName(pkg)}</h3>
                  {isPending && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                      ⏳ مزامنة
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-green-500" size={20} />
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{pkg.price} ر.س</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="text-blue-500" size={16} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{pkg.expiryDays || 30} يوم</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package size={16} className="text-purple-500" />
                      <span className="font-semibold">{pkg.total_sessions || pkg.sessions || 0} جلسة</span>
                    </div>
                    <div className="space-y-1">
                      {pkg.services && pkg.services.map((service, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle size={12} className="text-green-500" />
                          <span>{service.service_name || service.name || 'خدمة'} ({service.session_count || 1} جلسة)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEditPackage(pkg)}
                      className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      حذف
                    </button>
                    <button
                      onClick={() => togglePackageStatus(pkg.id)}
                      className={`px-3 py-2 rounded-lg transition ${pkg.isActive ? 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    >
                      {pkg.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

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
    </div>
  )
}