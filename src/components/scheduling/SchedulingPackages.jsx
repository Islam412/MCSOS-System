import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, Plus, User, Stethoscope, Clock, CheckCircle, Loader2, X, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { packagesService, servicesService } from '../../services/api'

export default function SchedulingPackages() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [sessions, setSessions] = useState([])
  const [packages, setPackages] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('existing') // 'existing' | 'custom'

  const [form, setForm] = useState({
    package_id: '',
    discount_type: 'fixed',
    discount_amount: 0,
    notes: '',
    auto_book: false,
    schedule_pattern: 'sat_mon_wed',
    // Custom package fields
    custom_name: '',
    custom_price: '',
    custom_services: [] // { service_id: '', session_count: 1 }
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sessionsRes, packagesRes, servicesRes] = await Promise.all([
        packagesService.getCompletedFirstSessions(),
        packagesService.getPackages(),
        servicesService.getServices()
      ])
      setSessions(Array.isArray(sessionsRes) ? sessionsRes : [])
      setPackages(Array.isArray(packagesRes) ? packagesRes : (packagesRes.data || []))
      // servicesService.getServices() returns array if parsed or object with data
      setServices(Array.isArray(servicesRes) ? servicesRes : (servicesRes?.data || []))
    } catch (error) {
      console.error('Failed to fetch data', error)
      toast.error(isRTL ? 'فشل جلب البيانات' : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignClick = (session) => {
    setSelectedSession(session)
    setModalMode('existing')
    setForm({
      package_id: '',
      discount_type: 'fixed',
      discount_amount: 0,
      notes: '',
      auto_book: false,
      schedule_pattern: 'sat_mon_wed',
      custom_name: '',
      custom_price: '',
      custom_services: []
    })
    setShowModal(true)
  }

  const handleAssignSubmit = async () => {
    if (modalMode === 'existing' && !form.package_id) {
      toast.error(isRTL ? 'يرجى اختيار الباقة' : 'Please select a package')
      return
    }

    if (modalMode === 'custom') {
      if (!form.custom_name || !form.custom_price || form.custom_services.length === 0) {
        toast.error(isRTL ? 'يرجى إكمال بيانات الباقة المخصصة' : 'Please complete custom package details')
        return
      }
    }

    setSubmitting(true)
    try {
      let finalPackageId = form.package_id;
      
      if (modalMode === 'custom') {
        const totalSessions = form.custom_services.reduce((acc, s) => acc + Number(s.session_count), 0)
        // Ensure services match the expected API format (array of {service_id, session_count})
        // Wait, packagesService.createPackage might expect something else. Let's send the correct payload format.
        // `createPackage` in the frontend sends `{ name, description, price, total_sessions, services }`
        // We will just directly call the standard createPackage payload.
        const res = await packagesService.createPackage({
          name: form.custom_name,
          price: form.custom_price,
          total_sessions: totalSessions,
          services: form.custom_services.map(s => ({
             service_id: s.service_id,
             session_count: Number(s.session_count)
          })),
          is_custom: true
        });
        // The res object may contain the package in .id or .data.id
        finalPackageId = res?.data?.id || res?.id;
        
        if (!finalPackageId) {
          throw new Error('Could not retrieve new package ID');
        }
      }

      await packagesService.assignPackage({
        patient_id: selectedSession.patient_id,
        package_id: finalPackageId,
        discount_type: form.discount_type,
        discount_amount: Number(form.discount_amount),
        notes: form.notes,
        auto_book: form.auto_book
      })
      toast.success(isRTL ? 'تم تعيين الباقة بنجاح' : 'Package assigned successfully')
      setShowModal(false)
      fetchData() // Refresh list
    } catch (error) {
      console.error('Failed to assign package', error)
      toast.error(error.message || (isRTL ? 'فشل تعيين الباقة' : 'Failed to assign package'))
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate custom package price automatically
  useEffect(() => {
    if (modalMode === 'custom' && form.custom_services.length > 0 && services.length > 0) {
      const totalPrice = form.custom_services.reduce((acc, curr) => {
        const s = services.find(x => x.id === curr.service_id)
        if (s) {
          return acc + (Number(s.price || 0) * Number(curr.session_count || 1))
        }
        return acc
      }, 0)
      setForm(prev => ({ ...prev, custom_price: totalPrice }))
    } else if (modalMode === 'custom' && form.custom_services.length === 0) {
      setForm(prev => ({ ...prev, custom_price: '' }))
    }
  }, [form.custom_services, services, modalMode])

  const selectedPackage = packages.find(p => p.id === form.package_id)
  let finalPrice = 0
  
  if (modalMode === 'existing') {
    finalPrice = Number(selectedPackage?.price || 0)
  } else {
    finalPrice = Number(form.custom_price || 0)
  }

  if (form.discount_amount > 0) {
    if (form.discount_type === 'percentage') {
      finalPrice = finalPrice - (finalPrice * (form.discount_amount / 100))
    } else {
      finalPrice = finalPrice - form.discount_amount
    }
    if (finalPrice < 0) finalPrice = 0
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Package className="text-blue-500" />
          {isRTL ? 'مرضى يحتاجون إلى باقات' : 'Patients Requiring Packages'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {isRTL 
            ? 'قائمة بالمرضى الذين أنهوا جلستهم اليوم ولا يمتلكون باقة نشطة.' 
            : 'List of patients who finished their session today and do not have an active package.'}
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-3 opacity-50" />
            <p className="text-gray-500 font-medium">
              {isRTL ? 'لا يوجد مرضى حالياً' : 'No patients currently'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map(session => (
              <div key={session.id} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {session.patient?.first_name ? `${session.patient.first_name} ${session.patient.last_name}` : (isRTL ? 'مريض غير معروف' : 'Unknown Patient')}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock size={12} />
                        {new Date(session.session_date).toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2">
                    <Stethoscope size={14} className="text-gray-400" />
                    <span>{session.doctor?.user?.name || session.doctor?.name || (isRTL ? 'طبيب غير معروف' : 'Unknown Doctor')}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleAssignClick(session)}
                  className="w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white py-2.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  {isRTL ? 'إضافة باقة مخصصة' : 'Add Custom Package'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isRTL ? 'تعيين باقة للمريض' : 'Assign Package to Patient'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-900/50 rounded-xl">
              <button
                onClick={() => setModalMode('existing')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                  modalMode === 'existing' 
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {isRTL ? 'باقة موجودة' : 'Existing Package'}
              </button>
              <button
                onClick={() => setModalMode('custom')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                  modalMode === 'custom' 
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {isRTL ? 'باقة مخصصة' : 'Custom Package'}
              </button>
            </div>

            <div className="space-y-5 max-h-[60vh] overflow-y-auto px-1">
              {modalMode === 'existing' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'اختر الباقة' : 'Select Package'}
                  </label>
                  <select
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={form.package_id}
                    onChange={(e) => setForm({ ...form, package_id: e.target.value })}
                    disabled={submitting}
                  >
                    <option value="">{isRTL ? 'اختر الباقة...' : 'Select a package...'}</option>
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.price} {isRTL ? 'ج.م' : 'EGP'}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {isRTL ? 'اسم الباقة' : 'Package Name'}
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={form.custom_name}
                      onChange={(e) => setForm({ ...form, custom_name: e.target.value })}
                      placeholder={isRTL ? 'مثال: باقة علاج طبيعي مخصصة' : 'e.g. Custom Physio Package'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {isRTL ? 'سعر الباقة (قبل الخصم)' : 'Package Price (Before discount)'}
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={form.custom_price}
                      onChange={(e) => setForm({ ...form, custom_price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {isRTL ? 'الخدمات المشمولة' : 'Included Services'}
                      </label>
                      <button 
                        type="button"
                        onClick={() => setForm({ ...form, custom_services: [...form.custom_services, { service_id: '', session_count: 1 }] })}
                        className="text-xs text-blue-600 font-bold hover:underline"
                      >
                        {isRTL ? '+ إضافة خدمة' : '+ Add Service'}
                      </button>
                    </div>
                    
                    {form.custom_services.map((item, idx) => (
                      <div key={idx} className="flex gap-2 mb-2 items-center">
                        <select
                          className="flex-1 p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900"
                          value={item.service_id}
                          onChange={(e) => {
                            const newServices = [...form.custom_services];
                            newServices[idx].service_id = e.target.value;
                            setForm({ ...form, custom_services: newServices });
                          }}
                        >
                          <option value="">{isRTL ? 'اختر...' : 'Select...'}</option>
                          {services.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          className="w-20 p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900"
                          value={item.session_count}
                          onChange={(e) => {
                            const newServices = [...form.custom_services];
                            newServices[idx].session_count = Number(e.target.value);
                            setForm({ ...form, custom_services: newServices });
                          }}
                        />
                        <button 
                          onClick={() => {
                            const newServices = [...form.custom_services];
                            newServices.splice(idx, 1);
                            setForm({ ...form, custom_services: newServices });
                          }}
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {form.custom_services.length === 0 && (
                      <p className="text-xs text-gray-400 italic">
                        {isRTL ? 'لم يتم إضافة خدمات' : 'No services added'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {((modalMode === 'existing' && selectedPackage) || modalMode === 'custom') && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{isRTL ? 'سعر الباقة الأساسي:' : 'Original Price:'}</span>
                    <span className="font-bold text-lg">{modalMode === 'existing' ? selectedPackage?.price : form.custom_price || 0} {isRTL ? 'ج.م' : 'EGP'}</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {isRTL ? 'نوع الخصم' : 'Discount Type'}
                      </label>
                      <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, discount_type: 'fixed' })}
                          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                            form.discount_type === 'fixed'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          {isRTL ? 'مبلغ ثابت' : 'Fixed Amount'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, discount_type: 'percentage' })}
                          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                            form.discount_type === 'percentage'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          {isRTL ? 'نسبة مئوية (%)' : 'Percentage (%)'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {isRTL ? 'قيمة الخصم' : 'Discount Value'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={form.discount_amount}
                          onChange={(e) => setForm({ ...form, discount_amount: Number(e.target.value) })}
                          disabled={submitting}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                          {form.discount_type === 'percentage' ? '%' : (isRTL ? 'ج.م' : 'EGP')}
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex justify-between items-center border border-blue-100 dark:border-blue-800/30">
                      <span className="text-blue-800 dark:text-blue-300 font-bold">{isRTL ? 'السعر النهائي:' : 'Final Price:'}</span>
                      <span className="font-extrabold text-2xl text-blue-600 dark:text-blue-400">
                        {finalPrice.toFixed(2)} {isRTL ? 'ج.م' : 'EGP'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <label className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-blue-100 dark:border-blue-800/30">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white"
                    checked={form.auto_book}
                    onChange={(e) => setForm({ ...form, auto_book: e.target.checked })}
                  />
                  <div>
                    <span className="block font-bold text-gray-900 dark:text-white">
                      {isRTL ? 'حجز المواعيد تلقائياً' : 'Auto-book Appointments'}
                    </span>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      {isRTL 
                        ? 'سيقوم النظام بحجز مواعيد الجلسات المتبقية تلقائياً بناءً على أقرب مواعيد متاحة للطبيب.'
                        : 'The system will automatically book the remaining sessions based on the next available slots for the doctor.'}
                    </span>
                  </div>
                </label>

                {/* Section 8: Smart Auto-Booking Suggestions */}
                {form.auto_book && (
                  <div className="p-4 bg-gradient-to-r from-amber-500/10 to-indigo-500/10 rounded-xl border border-amber-500/20 dark:border-amber-500/30 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm mb-1">
                      <span>{t('booking_suggestions.title', '💡 اقتراحات الحجز التلقائي الذكي')}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                      {t('booking_suggestions.desc', 'يقوم النظام باقتراح أفضل الأوقات بناءً على جداول الأطباء وشغور الغرف')}
                    </p>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'sat_mon_wed', label: t('booking_suggestions.sat_mon_wed', 'السبت - الإثنين - الأربعاء (3 أيام/أسبوع)') },
                        { id: 'sun_tue_thu', label: t('booking_suggestions.sun_tue_thu', 'الأحد - الثلاثاء - الخميس (3 أيام/أسبوع)') },
                        { id: 'daily_no_fri', label: t('booking_suggestions.daily_no_fri', 'يومياً (ما عدا الجمعة)') }
                      ].map(pattern => (
                        <label 
                          key={pattern.id}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                            form.schedule_pattern === pattern.id 
                              ? 'bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500 shadow-sm font-black' 
                              : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name="schedule_pattern"
                            className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                            checked={form.schedule_pattern === pattern.id}
                            onChange={() => setForm({ ...form, schedule_pattern: pattern.id })}
                          />
                          <span>{pattern.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                      <span>✓ {t('booking_suggestions.suggested_time', 'الوقت المقترح: 10:00 صباحاً - غرفة العلاج الطبيعي 1')}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}
                </label>
                <textarea
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  rows="3"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  disabled={submitting}
                  placeholder={isRTL ? 'أضف أي ملاحظات هنا...' : 'Add any notes here...'}
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleAssignSubmit}
                disabled={submitting || (modalMode === 'existing' && !form.package_id) || (modalMode === 'custom' && (!form.custom_name || form.custom_services.length === 0))}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                {isRTL ? 'تأكيد التعيين' : 'Confirm Assignment'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="flex-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-bold"
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
