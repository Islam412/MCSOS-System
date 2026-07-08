import { useState, useEffect } from 'react'
import { confirmAlert } from '../../utils/confirmAlert'
import { useTranslation } from 'react-i18next'
import { 
  Activity, Plus, Edit, Trash2, Search, RefreshCw, X, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { servicesService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

export default function ServicesManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { isOnline } = useServices()

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingService, setEditingService] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    price: '',
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
      toast.error(isRTL ? 'الرجاء ملء الحقول المطلوبة' : 'Please fill all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const data = {
        name: form.name,
        price: parseFloat(form.price),
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
      name: service.name,
      price: service.price || '',
      is_active: service.is_active
    })
    setShowModal(true)
  }

  const handleSaveEdit = async () => {
    if (!form.name || form.price === '') {
      toast.error(isRTL ? 'الرجاء ملء الحقول المطلوبة' : 'Please fill all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const data = {
        name: form.name,
        price: parseFloat(form.price),
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
    if (!(await confirmAlert({ title: 'تأكيد', text: isRTL ? 'هل أنت متأكد من حذف هذه الخدمة؟' : 'Are you sure you want to delete this service?' }))) return

    try {
      await servicesService.deleteService(id)
      toast.success(isRTL ? 'تم حذف الخدمة' : 'Service deleted')
      loadData()
    } catch (error) {
      toast.error(isRTL ? 'حدث خطأ في الحذف' : 'Error deleting service')
    }
  }

  const resetForm = () => {
    setForm({ name: '', price: '', is_active: true })
  }

  const filteredServices = services.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-4" />
          <div className="text-slate-600 dark:text-white">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{isRTL ? 'إدارة الخدمات' : 'Services Management'}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isRTL ? 'إضافة وتعديل وحذف الخدمات الطبية' : 'Add, edit, and delete medical services'}
          </p>
        </div>
        <button 
          onClick={() => { setEditingService(null); resetForm(); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition"
        >
          <Plus size={18} /> {isRTL ? 'إضافة خدمة' : 'Add Service'}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-slate-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder={isRTL ? 'ابحث عن خدمة...' : 'Search for a service...'}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200 rounded-xl flex items-center gap-2 border border-slate-200 dark:border-gray-600 transition"
          >
            <RefreshCw size={18} /> {isRTL ? 'تحديث' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {isRTL ? 'الخدمة' : 'Service'}
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {isRTL ? 'السعر' : 'Price'}
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {isRTL ? 'الحالة' : 'Status'}
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                  {isRTL ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-center mb-3">
                        <Activity size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{isRTL ? 'لا توجد خدمات' : 'No services found'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredServices.map(service => (
                  <tr key={service.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-150 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shrink-0">
                          <Activity size={18} strokeWidth={2} />
                        </div>
                        <div>
                          <span className="block font-semibold text-sm text-gray-900 dark:text-white">
                            {service.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-baseline gap-1">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          {service.price}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {isRTL ? 'ج.م' : 'EGP'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                        service.is_active 
                          ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {service.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleEdit(service)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 rounded-lg transition-colors"
                          title={isRTL ? 'تعديل' : 'Edit'}
                        >
                          <Edit size={16} strokeWidth={2} />
                        </button>
                        <button 
                          onClick={() => handleDelete(service.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-lg transition-colors"
                          title={isRTL ? 'حذف' : 'Delete'}
                        >
                          <Trash2 size={16} strokeWidth={2} />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 border border-slate-200 dark:border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {editingService ? (isRTL ? 'تعديل الخدمة' : 'Edit Service') : (isRTL ? 'إضافة خدمة جديدة' : 'Add New Service')}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                  {isRTL ? 'اسم الخدمة *' : 'Service Name *'}
                </label>
                <input 
                  type="text" 
                  className="w-full p-2 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  value={form.name} 
                  onChange={(e) => setForm({...form, name: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                  {isRTL ? 'السعر *' : 'Price *'}
                </label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full p-2 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  value={form.price} 
                  onChange={(e) => setForm({...form, price: e.target.value})} 
                />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={form.is_active}
                  onChange={(e) => setForm({...form, is_active: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-gray-300">
                  {isRTL ? 'الخدمة نشطة' : 'Service is active'}
                </label>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 px-4 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-xl hover:bg-slate-200 dark:hover:bg-gray-600 transition"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button 
                onClick={editingService ? handleSaveEdit : handleAdd}
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : (isRTL ? 'حفظ' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
