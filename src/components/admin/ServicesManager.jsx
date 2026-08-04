import { useState, useEffect, useMemo } from 'react'
import { confirmAlert } from '../../utils/confirmAlert'
import { useTranslation } from 'react-i18next'
import { 
  Activity, Plus, Edit, Trash2, Search, RefreshCw, X, Loader2,
  Layers, Brain, Bone, Baby, MessageSquare, Apple, Stethoscope, Clock,
  DollarSign, FileText, Tag
} from 'lucide-react'
import toast from 'react-hot-toast'
import { servicesService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

const CATEGORIES = [
  { id: 'ALL', labelAr: 'جميع الخدمات', labelEn: 'All Services', icon: Layers, color: 'bg-slate-700 text-white', hover: 'hover:bg-slate-600' },
  { id: 'NEURO_PT', labelAr: 'علاج طبيعي أعصاب', labelEn: 'Neuro PT', icon: Brain, color: 'bg-blue-600 text-white', hover: 'hover:bg-blue-500', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  { id: 'ORTHO_PT', labelAr: 'علاج طبيعي عظام', labelEn: 'Ortho PT', icon: Bone, color: 'bg-emerald-600 text-white', hover: 'hover:bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  { id: 'PEDIATRIC_PT', labelAr: 'علاج طبيعي أطفال', labelEn: 'Pediatric PT', icon: Baby, color: 'bg-purple-600 text-white', hover: 'hover:bg-purple-500', badge: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  { id: 'SPEECH_THERAPY', labelAr: 'التخاطب', labelEn: 'Speech Therapy', icon: MessageSquare, color: 'bg-amber-600 text-white', hover: 'hover:bg-amber-500', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  { id: 'NUTRITION', labelAr: 'التغذية', labelEn: 'Nutrition', icon: Apple, color: 'bg-rose-600 text-white', hover: 'hover:bg-rose-500', badge: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
  { id: 'GENERAL', labelAr: 'خدمات عامة وكشوفات', labelEn: 'General & Consults', icon: Stethoscope, color: 'bg-indigo-600 text-white', hover: 'hover:bg-indigo-500', badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
]

export default function ServicesManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { isOnline } = useServices()

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [editingService, setEditingService] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    category: 'GENERAL',
    price: '',
    duration: '',
    price_package_6: '',
    price_package_12: '',
    notes: '',
    sort_order: 100,
    is_active: true
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      if (isOnline) {
        const response = await servicesService.getServices()
        const data = Array.isArray(response) ? response : (response?.data || [])
        setServices(data)
      } else {
        toast.error(isRTL ? 'لا يوجد اتصال بالإنترنت' : 'No internet connection')
      }
    } catch (error) {
      console.error('Error loading services:', error)
      toast.error(isRTL ? 'حدث خطأ في تحميل البيانات' : 'Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!form.name || form.price === '') {
      toast.error(isRTL ? 'الرجاء ملء اسم الخدمة والسعر الأساسي' : 'Please fill service name and base price')
      return
    }

    setIsSubmitting(true)
    try {
      const data = {
        name: form.name,
        category: form.category || 'GENERAL',
        price: parseFloat(form.price),
        duration: form.duration || null,
        price_package_6: form.price_package_6 !== '' ? parseFloat(form.price_package_6) : null,
        price_package_12: form.price_package_12 !== '' ? parseFloat(form.price_package_12) : null,
        notes: form.notes || null,
        sort_order: form.sort_order ? parseInt(form.sort_order) : 100,
        is_active: form.is_active
      }

      await servicesService.createService(data)
      toast.success(isRTL ? 'تم إضافة الخدمة بنجاح' : 'Service added successfully')
      
      setShowModal(false)
      resetForm()
      loadData()
    } catch (error) {
      toast.error(isRTL ? 'حدث خطأ في الإضافة' : 'Error adding service')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setForm({
      name: service.name || '',
      category: service.category || 'GENERAL',
      price: service.price ?? '',
      duration: service.duration || '',
      price_package_6: service.price_package_6 ?? '',
      price_package_12: service.price_package_12 ?? '',
      notes: service.notes || '',
      sort_order: service.sort_order ?? 100,
      is_active: service.is_active ?? true
    })
    setShowModal(true)
  }

  const handleSaveEdit = async () => {
    if (!form.name || form.price === '') {
      toast.error(isRTL ? 'الرجاء ملء اسم الخدمة والسعر الأساسي' : 'Please fill service name and base price')
      return
    }

    setIsSubmitting(true)
    try {
      const data = {
        name: form.name,
        category: form.category || 'GENERAL',
        price: parseFloat(form.price),
        duration: form.duration || null,
        price_package_6: form.price_package_6 !== '' && form.price_package_6 != null ? parseFloat(form.price_package_6) : null,
        price_package_12: form.price_package_12 !== '' && form.price_package_12 != null ? parseFloat(form.price_package_12) : null,
        notes: form.notes || null,
        sort_order: form.sort_order ? parseInt(form.sort_order) : 100,
        is_active: form.is_active
      }

      await servicesService.updateService(editingService.id, data)
      toast.success(isRTL ? 'تم تحديث الخدمة بنجاح' : 'Service updated successfully')
      
      setShowModal(false)
      setEditingService(null)
      resetForm()
      loadData()
    } catch (error) {
      toast.error(isRTL ? 'حدث خطأ في التحديث' : 'Error updating service')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!(await confirmAlert({ title: 'تأكيد الحذف', text: isRTL ? 'هل أنت متأكد من حذف هذه الخدمة نهائياً من قائمة أسعار المركز؟' : 'Are you sure you want to permanently delete this service?' }))) return

    try {
      await servicesService.deleteService(id)
      toast.success(isRTL ? 'تم حذف الخدمة' : 'Service deleted')
      loadData()
    } catch (error) {
      toast.error(isRTL ? 'حدث خطأ في الحذف' : 'Error deleting service')
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      category: selectedCategory !== 'ALL' ? selectedCategory : 'GENERAL',
      price: '',
      duration: '',
      price_package_6: '',
      price_package_12: '',
      notes: '',
      sort_order: 100,
      is_active: true
    })
  }

  const getCategoryMeta = (catId) => {
    return CATEGORIES.find(c => c.id === catId) || CATEGORIES.find(c => c.id === 'GENERAL')
  }

  const categoryCounts = useMemo(() => {
    const counts = { ALL: services.length }
    services.forEach(s => {
      const c = s.category || 'GENERAL'
      counts[c] = (counts[c] || 0) + 1
    })
    return counts
  }, [services])

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'ALL' || (s.category || 'GENERAL') === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [services, searchTerm, selectedCategory])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={36} className="mx-auto text-blue-500 animate-spin mb-4" />
          <div className="text-slate-600 dark:text-white font-medium">{isRTL ? 'جاري تحميل بيان الخدمات والأسعار...' : 'Loading services & pricing...'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
                {isRTL ? 'بيان أسعار الخدمات الطبية والتأهيلية' : 'Medical & Rehab Services Directory'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                {isRTL ? 'دليل شامل بالخدمات المصنفة وأسعار الجلسات المنفردة وأسعار جلسات الباكدج (6 و 12 جلسة)' : 'Comprehensive categorized directory with session pricing & package tier discounts'}
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => { setEditingService(null); resetForm(); setShowModal(true); }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 shrink-0"
        >
          <Plus size={19} strokeWidth={2.5} /> {isRTL ? 'إضافة خدمة جديدة' : 'Add New Service'}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon
          const isSelected = selectedCategory === cat.id
          const count = categoryCounts[cat.id] || 0
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap shrink-0 shadow-sm ${
                isSelected 
                  ? `${cat.color} shadow-md ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900`
                  : 'bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/80'
              }`}
            >
              <Icon size={18} strokeWidth={2.2} />
              <span>{isRTL ? cat.labelAr : cat.labelEn}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                isSelected 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-slate-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={19} />
            <input 
              type="text" 
              placeholder={isRTL ? 'ابحث عن اسم خدمة، مدة، أو ملاحظة...' : 'Search by service name, duration, or notes...'}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-gray-700/70 border border-slate-200 dark:border-gray-600 rounded-xl text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
          <button 
            onClick={loadData}
            className="px-5 py-2.5 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200 font-semibold rounded-xl flex items-center gap-2 border border-slate-200 dark:border-gray-600 transition shrink-0"
          >
            <RefreshCw size={17} /> {isRTL ? 'تحديث الأسعار' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-800/80 border-b border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
                <th className="px-6 py-4">{isRTL ? 'الخدمة والتصنيف' : 'Service & Category'}</th>
                <th className="px-4 py-4">{isRTL ? 'المدة' : 'Duration'}</th>
                <th className="px-4 py-4">{isRTL ? 'سعر الجلسة' : 'Session Price'}</th>
                <th className="px-4 py-4">{isRTL ? 'باكدج 6 جلسات' : '6-Session Pkg'}</th>
                <th className="px-4 py-4">{isRTL ? 'باكدج 12 جلسة+' : '12+ Session Pkg'}</th>
                <th className="px-4 py-4">{isRTL ? 'ملاحظات' : 'Notes'}</th>
                <th className="px-4 py-4">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="px-6 py-4 text-right">{isRTL ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800 text-sm">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-gray-800/80 rounded-2xl flex items-center justify-center mb-3 text-slate-400 border border-slate-200 dark:border-gray-700">
                        <Activity size={30} />
                      </div>
                      <p className="text-slate-700 dark:text-gray-200 font-bold text-base">{isRTL ? 'لا توجد خدمات مطابقة للبحث' : 'No matching services found'}</p>
                      <p className="text-slate-400 dark:text-gray-500 text-xs mt-1">{isRTL ? 'حاول تغيير معايير البحث أو اختيار تصنيف آخر' : 'Try modifying search criteria or select another category'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredServices.map(service => {
                  const catMeta = getCategoryMeta(service.category)
                  const CatIcon = catMeta.icon
                  return (
                    <tr key={service.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors duration-150 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className={`flex items-center justify-center w-11 h-11 rounded-2xl ${catMeta.badge} border shadow-sm shrink-0`}>
                            <CatIcon size={20} strokeWidth={2.2} />
                          </div>
                          <div>
                            <span className="block font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {service.name}
                            </span>
                            <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${catMeta.badge}`}>
                              {isRTL ? catMeta.labelAr : catMeta.labelEn}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap">
                        {service.duration ? (
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                            <Clock size={15} className="text-slate-400 dark:text-slate-500" />
                            <span>{service.duration}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-gray-600 font-bold">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-baseline gap-1 bg-slate-50 dark:bg-gray-800/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-700 w-fit font-mono">
                          <span className="font-black text-slate-900 dark:text-white text-base">
                            {service.price ?? 0}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-gray-400 font-sans">
                            {isRTL ? 'ج.م' : 'EGP'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        {service.price_package_6 ? (
                          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 px-3 py-1.5 rounded-xl w-fit">
                            <div className="flex items-baseline gap-1 text-purple-700 dark:text-purple-300 font-mono">
                              <span className="font-black text-sm">{service.price_package_6}</span>
                              <span className="text-[11px] font-bold font-sans">{isRTL ? 'ج/جلسة' : '/session'}</span>
                            </div>
                            <div className="text-[11px] text-purple-500 dark:text-purple-400 font-semibold mt-0.5">
                              {isRTL ? `إجمالي: ${service.price_package_6 * 6} ج` : `Total: ${service.price_package_6 * 6} EGP`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-gray-600 font-bold px-2">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        {service.price_package_12 ? (
                          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl w-fit">
                            <div className="flex items-baseline gap-1 text-emerald-700 dark:text-emerald-300 font-mono">
                              <span className="font-black text-sm">{service.price_package_12}</span>
                              <span className="text-[11px] font-bold font-sans">{isRTL ? 'ج/جلسة' : '/session'}</span>
                            </div>
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                              {isRTL ? `إجمالي: ${service.price_package_12 * 12} ج` : `Total: ${service.price_package_12 * 12} EGP`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-gray-600 font-bold px-2">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4 max-w-[160px] truncate">
                        {service.notes ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-semibold border border-amber-200 dark:border-amber-800/40" title={service.notes}>
                            <Tag size={12} className="shrink-0" />
                            <span className="truncate">{service.notes}</span>
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-gray-600">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                          service.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-800/40' 
                            : 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-400 border border-slate-200'
                        }`}>
                          {service.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'موقوف' : 'Inactive')}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleEdit(service)}
                            className="p-2.5 bg-slate-100 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-blue-900/30 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 rounded-xl transition-all shadow-sm"
                            title={isRTL ? 'تعديل الخدمة والأسعار' : 'Edit'}
                          >
                            <Edit size={16} strokeWidth={2.2} />
                          </button>
                          <button 
                            onClick={() => handleDelete(service.id)}
                            className="p-2.5 bg-slate-100 hover:bg-red-100 dark:bg-gray-700 dark:hover:bg-red-900/30 text-slate-700 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 rounded-xl transition-all shadow-sm"
                            title={isRTL ? 'حذف' : 'Delete'}
                          >
                            <Trash2 size={16} strokeWidth={2.2} />
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

      {/* Modal for Add / Edit Service & Pricing */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl p-6 md:p-8 border border-slate-200 dark:border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                  {editingService ? <Edit size={22} /> : <Plus size={22} />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white">
                    {editingService ? (isRTL ? 'تعديل أجور وتفاصيل الخدمة' : 'Edit Service Pricing & Details') : (isRTL ? 'إضافة خدمة طبية جديدة' : 'Add New Medical Service')}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                    {isRTL ? 'قم بضبط أسعار الجلسة المنفردة والأسعار المتدرجة داخل الباكدج' : 'Configure single session and package tier pricing'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                  {isRTL ? 'اسم الخدمة الطبية / التأهيلية *' : 'Service Name *'}
                </label>
                <input 
                  type="text" 
                  placeholder={isRTL ? 'مثال: علاج مائي، جلسة إتزان، حجامة...' : 'e.g., Hydrotherapy, Balance session...'}
                  className="w-full p-3 bg-slate-50 dark:bg-gray-700/80 border border-slate-200 dark:border-gray-600 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={form.name} 
                  onChange={(e) => setForm({...form, name: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                  {isRTL ? 'تصنيف الخدمة' : 'Service Category'}
                </label>
                <select
                  className="w-full p-3 bg-slate-50 dark:bg-gray-700/80 border border-slate-200 dark:border-gray-600 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                >
                  {CATEGORIES.filter(c => c.id !== 'ALL').map(c => (
                    <option key={c.id} value={c.id}>
                      {isRTL ? c.labelAr : c.labelEn}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                  {isRTL ? 'المدة المعتادة للجلسة' : 'Duration String'}
                </label>
                <input 
                  type="text" 
                  placeholder={isRTL ? 'مثال: 30 د - 1 ساعة، 45 د...' : 'e.g., 30 - 45 min'}
                  className="w-full p-3 bg-slate-50 dark:bg-gray-700/80 border border-slate-200 dark:border-gray-600 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={form.duration} 
                  onChange={(e) => setForm({...form, duration: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide mb-1.5 text-blue-600 dark:text-blue-400">
                  {isRTL ? 'سعر الجلسة المنفردة (ج.م) *' : 'Base Session Price (EGP) *'}
                </label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="0"
                  className="w-full p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl text-slate-900 dark:text-white font-black text-lg focus:ring-2 focus:ring-blue-500 outline-none transition font-mono"
                  value={form.price} 
                  onChange={(e) => setForm({...form, price: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide mb-1.5 text-purple-600 dark:text-purple-400">
                  {isRTL ? 'سعر الجلسة في باكدج (6 جلسات)' : '6-Session Package Price/Session'}
                </label>
                <input 
                  type="number" 
                  min="0"
                  placeholder={isRTL ? 'اتركه فارغاً إن لم يوجد باكدج' : 'Optional'}
                  className="w-full p-3 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-xl text-slate-900 dark:text-white font-black text-lg focus:ring-2 focus:ring-purple-500 outline-none transition font-mono"
                  value={form.price_package_6} 
                  onChange={(e) => setForm({...form, price_package_6: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide mb-1.5 text-emerald-600 dark:text-emerald-400">
                  {isRTL ? 'سعر الجلسة في باكدج (12+ جلسة)' : '12-Session Package Price/Session'}
                </label>
                <input 
                  type="number" 
                  min="0"
                  placeholder={isRTL ? 'اتركه فارغاً إن لم يوجد باكدج' : 'Optional'}
                  className="w-full p-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl text-slate-900 dark:text-white font-black text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition font-mono"
                  value={form.price_package_12} 
                  onChange={(e) => setForm({...form, price_package_12: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                  {isRTL ? 'ترتيب العرض (رقم)' : 'Sort Order'}
                </label>
                <input 
                  type="number" 
                  className="w-full p-3 bg-slate-50 dark:bg-gray-700/80 border border-slate-200 dark:border-gray-600 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition font-mono"
                  value={form.sort_order} 
                  onChange={(e) => setForm({...form, sort_order: e.target.value})} 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                  {isRTL ? 'ملاحظات / شروط خاصة' : 'Notes / Special Conditions'}
                </label>
                <input 
                  type="text" 
                  placeholder={isRTL ? 'مثال: 12 كاس للحجامة، حسب المكان للجلسات المنزلية...' : 'Optional notes displayed on price list'}
                  className="w-full p-3 bg-slate-50 dark:bg-gray-700/80 border border-slate-200 dark:border-gray-600 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={form.notes} 
                  onChange={(e) => setForm({...form, notes: e.target.value})} 
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-gray-700/50 rounded-2xl border border-slate-200 dark:border-gray-600 cursor-pointer hover:bg-slate-100 transition">
                  <input 
                    type="checkbox" 
                    checked={form.is_active}
                    onChange={(e) => setForm({...form, is_active: e.target.checked})}
                    className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded-lg focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-slate-800 dark:text-gray-200">
                    {isRTL ? 'الخدمة نشطة ومتاحة للحجز والربط بالفاتورة' : 'Service is active and available for booking'}
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-gray-700 flex gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 px-5 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-gray-600 transition text-sm"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button 
                onClick={editingService ? handleSaveEdit : handleAdd}
                disabled={isSubmitting}
                className="flex-1 py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 disabled:opacity-50 transition transform active:scale-95 text-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : (isRTL ? 'حفظ البيانات' : 'Save Details')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
