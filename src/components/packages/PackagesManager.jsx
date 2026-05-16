import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, Plus, Edit, Trash2, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PackagesManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [packages, setPackages] = useState([
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
  ])
  
  const [showModal, setShowModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    nameFr: '',
    price: '',
    sessions: '',
    expiryDays: '',
    services: ''
  })
  
  const getPackageName = (pkg) => {
    if (i18n.language === 'ar') return pkg.nameAr
    if (i18n.language === 'fr') return pkg.nameFr
    return pkg.nameEn
  }
  
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
  
  const handleSavePackage = () => {
    if (!formData.nameAr || !formData.price || !formData.sessions) {
      toast.error(t('packages.fill_required'))
      return
    }
    
    const newPackage = {
      id: editingPackage ? editingPackage.id : Date.now(),
      nameAr: formData.nameAr,
      nameEn: formData.nameEn || formData.nameAr,
      nameFr: formData.nameFr || formData.nameAr,
      price: Number(formData.price),
      sessions: Number(formData.sessions),
      expiryDays: Number(formData.expiryDays) || 30,
      services: formData.services.split(',').map(s => s.trim()),
      isActive: true
    }
    
    if (editingPackage) {
      setPackages(packages.map(p => p.id === editingPackage.id ? newPackage : p))
      toast.success(t('packages.updated'))
    } else {
      setPackages([...packages, newPackage])
      toast.success(t('packages.added'))
    }
    
    setShowModal(false)
  }
  
  const handleDeletePackage = (id) => {
    if (confirm(t('packages.confirm_delete'))) {
      setPackages(packages.filter(p => p.id !== id))
      toast.success(t('packages.deleted'))
    }
  }
  
  const togglePackageStatus = (id) => {
    setPackages(packages.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ))
    toast.success(t('packages.status_updated'))
  }
  
  return (
    <div className="space-y-6">
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            {t('packages.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('packages.subtitle')}</p>
        </div>
        <button
          onClick={handleAddPackage}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={18} />
          {t('packages.add_package')}
        </button>
      </div>
      
      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div key={pkg.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border transition-all ${pkg.isActive ? 'border-gray-200 dark:border-gray-700' : 'border-red-200 dark:border-red-800 opacity-60'}`}>
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 px-6 py-4">
              <h3 className="text-xl font-bold text-white">{getPackageName(pkg)}</h3>
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
                  {pkg.services.map((service, idx) => (
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
        ))}
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
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {t('common.save')}
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
