// src/components/packages/PackagesManager.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, Plus, Edit, Trash2, DollarSign, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { packagesService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

// ========== مفتاح التخزين في localStorage ==========
const STORAGE_KEYS = {
  PACKAGES: 'mcsos_packages_v2'
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
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    nameFr: '',
    price: '',
    sessions: '',
    expiryDays: '',
    services: ''
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
    },
    {
      id: 2,
      nameAr: 'باقة متقدمة',
      nameEn: 'Advanced Package',
      nameFr: 'Forfait Avancé',
      price: 900,
      sessions: 8,
      expiryDays: 45,
      services: ['تقييم طبي', 'جلسات علاج', 'تقرير طبي', 'متابعة أسبوعية'],
      isActive: true
    },
    {
      id: 3,
      nameAr: 'باقة شاملة',
      nameEn: 'Comprehensive Package',
      nameFr: 'Forfait Complet',
      price: 1500,
      sessions: 12,
      expiryDays: 60,
      services: ['تقييم شامل', 'جلسات علاج مكثفة', 'تقرير مفصل', 'متابعة شهرية', 'استشارات'],
      isActive: true
    }
  ]

  // ========== تحميل البيانات ==========
  useEffect(() => {
    loadPackages()
  }, [])

  // ========== تحميل الباقات من localStorage ==========
  const loadLocalPackages = () => {
    const saved = getLocalData(STORAGE_KEYS.PACKAGES)
    if (saved && saved.length > 0) {
      setPackages(saved)
    } else {
      setPackages(defaultPackages)
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(defaultPackages))
    }
  }

  // ========== دالة تحميل البيانات المتكاملة ==========
  const loadPackages = async () => {
    setLoading(true)
    try {
      if (isOnline) {
        try {
          const response = await executeWithOfflineSupport(
            () => packagesService.getPackages(),
            'packages',
            getLocalData(STORAGE_KEYS.PACKAGES)
          )

          // التحقق من هيكل الاستجابة
          let data = []
          if (response && response.packages) {
            data = response.packages
          } else if (response && Array.isArray(response)) {
            data = response
          } else {
            loadLocalPackages()
            return
          }

          // تنسيق البيانات
          const formattedData = data.map(item => ({
            id: item.id || Date.now(),
            nameAr: item.nameAr || item.name || 'باقة',
            nameEn: item.nameEn || item.name || 'Package',
            nameFr: item.nameFr || item.name || 'Forfait',
            price: item.price || 0,
            sessions: item.sessions || 0,
            expiryDays: item.expiryDays || 30,
            services: item.services || [],
            isActive: item.isActive !== undefined ? item.isActive : true,
            _syncPending: item._syncPending || false
          }))

          setPackages(formattedData)
          localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(formattedData))
        } catch (apiError) {
          console.warn('API request failed, falling back to local data:', apiError)
          loadLocalPackages()
        }
      } else {
        loadLocalPackages()
      }
    } catch (error) {
      console.error('Error loading packages:', error)
      toast.error('حدث خطأ في تحميل الباقات')
      loadLocalPackages()
    } finally {
      setLoading(false)
    }
  }

  // ========== حفظ الباقات (محلي + API) ==========
  const savePackages = async (newPackages) => {
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(newPackages))
    setPackages(newPackages)

    // مزامنة العناصر المعلقة مع الخادم
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
      sessions: '',
      expiryDays: '',
      services: ''
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
      sessions: pkg.sessions,
      expiryDays: pkg.expiryDays,
      services: pkg.services.join(', ')
    })
    setShowModal(true)
  }

  // ========== حفظ الباقة (إضافة أو تعديل) ==========
  const handleSavePackage = async () => {
    if (!formData.nameAr || !formData.price || !formData.sessions) {
      toast.error(t('packages.fill_required'))
      return
    }

    setIsSubmitting(true)
    try {
      const packageData = {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn || formData.nameAr,
        nameFr: formData.nameFr || formData.nameAr,
        price: Number(formData.price),
        sessions: Number(formData.sessions),
        expiryDays: Number(formData.expiryDays) || 30,
        services: formData.services.split(',').map(s => s.trim()).filter(s => s),
        isActive: true
      }

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
      toast.success(editingPackage ? t('packages.updated') : t('packages.added'))
      setShowModal(false)
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حفظ الباقة')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== حذف باقة ==========
  const handleDeletePackage = async (id) => {
    if (!confirm(t('packages.confirm_delete'))) return

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
      toast.success(t('packages.deleted'))
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
      toast.success(t('packages.status_updated'))
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تحديث حالة الباقة')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white">جاري التحميل...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header مع حالة الاتصال */}
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            {t('packages.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('packages.subtitle')}
            {!isOnline && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                ⚡ غير متصل
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadPackages}
            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-purple-500/30 transition"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> تحديث
          </button>
          <button
            onClick={handleAddPackage}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={18} />
            {t('packages.add_package')}
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
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{pkg.price} {t('packages.currency')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="text-blue-500" size={16} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{pkg.expiryDays} {t('packages.days')}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package size={16} className="text-purple-500" />
                      <span className="font-semibold">{pkg.sessions} {t('packages.sessions')}</span>
                    </div>
                    <div className="space-y-1">
                      {pkg.services && pkg.services.map((service, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle size={12} className="text-green-500" />
                          <span>{service}</span>
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
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      {t('common.delete')}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingPackage ? t('packages.edit_package') : t('packages.add_package')}</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder={t('packages.name_ar')}
                className="w-full p-3 border rounded-lg dark:bg-gray-900"
                value={formData.nameAr}
                onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
              />
              <input
                type="text"
                placeholder={t('packages.name_en')}
                className="w-full p-3 border rounded-lg dark:bg-gray-900"
                value={formData.nameEn}
                onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
              />
              <input
                type="text"
                placeholder={t('packages.name_fr')}
                className="w-full p-3 border rounded-lg dark:bg-gray-900"
                value={formData.nameFr}
                onChange={(e) => setFormData({...formData, nameFr: e.target.value})}
              />
              <input
                type="number"
                placeholder={t('packages.price')}
                className="w-full p-3 border rounded-lg dark:bg-gray-900"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
              <input
                type="number"
                placeholder={t('packages.sessions_count')}
                className="w-full p-3 border rounded-lg dark:bg-gray-900"
                value={formData.sessions}
                onChange={(e) => setFormData({...formData, sessions: e.target.value})}
              />
              <input
                type="number"
                placeholder={t('packages.expiry_days')}
                className="w-full p-3 border rounded-lg dark:bg-gray-900"
                value={formData.expiryDays}
                onChange={(e) => setFormData({...formData, expiryDays: e.target.value})}
              />
              <textarea
                placeholder={t('packages.services_list')}
                className="w-full p-3 border rounded-lg dark:bg-gray-900"
                rows="3"
                value={formData.services}
                onChange={(e) => setFormData({...formData, services: e.target.value})}
              />

              <div className="flex gap-3">
                <button
                  onClick={handleSavePackage}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'جاري الحفظ...' : t('common.save')}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 py-2 rounded-lg hover:bg-gray-400"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}