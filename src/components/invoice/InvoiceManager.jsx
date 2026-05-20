import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Printer, Plus, Trash2, Edit, Save, X, Search, CheckCircle, User, Stethoscope, DollarSign, FileText, Calendar, Clock, Stamp, Building, Signature } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InvoiceManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language

  const [invoices, setInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])

  // بيانات العيادة
  const [clinicInfo, setClinicInfo] = useState({
    nameAr: 'مركز الطب الحديث',
    nameEn: 'Modern Medical Center',
    addressAr: 'شارع الملك فهد، الرياض، المملكة العربية السعودية',
    addressEn: 'King Fahd Road, Riyadh, Saudi Arabia',
    phone: '+966 12 345 6789',
    email: 'info@modernmedical.com',
    licenseNumber: '123456789',
    commercialRegister: 'CR-123456'
  })

  // بيانات ختم المستشفى
  const [hospitalStamp, setHospitalStamp] = useState({
    nameAr: 'مستشفى السلام',
    nameEn: 'Al Salam Hospital',
    addressAr: 'شارع الملك عبدالعزيز، الرياض',
    addressEn: 'King Abdulaziz Road, Riyadh',
    phone: '+966 12 345 6788',
    licenseNumber: 'HOS-123456'
  })

  // قائمة الأطباء المتاحين
  const availableDoctors = [
    { id: 1, nameAr: 'د. أحمد علي', nameEn: 'Dr. Ahmed Ali', specializationAr: 'جراحة عظام', specializationEn: 'Orthopedic', licenseNumber: 'DOC-001', signature: '' },
    { id: 2, nameAr: 'د. منى حسن', nameEn: 'Dr. Mona Hassan', specializationAr: 'علاج طبيعي', specializationEn: 'Physical Therapy', licenseNumber: 'DOC-002', signature: '' },
    { id: 3, nameAr: 'د. خالد محمود', nameEn: 'Dr. Khaled Mahmoud', specializationAr: 'أعصاب', specializationEn: 'Neurology', licenseNumber: 'DOC-003', signature: '' },
    { id: 4, nameAr: 'د. نورة سعيد', nameEn: 'Dr. Noura Saeed', specializationAr: 'أطفال', specializationEn: 'Pediatrics', licenseNumber: 'DOC-004', signature: '' },
    { id: 5, nameAr: 'د. محمد عبدالله', nameEn: 'Dr. Mohamed Abdullah', specializationAr: 'جراحة عامة', specializationEn: 'General Surgery', licenseNumber: 'DOC-005', signature: '' }
  ]

  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientAge: '',
    patientPhone: '',
    doctorId: '',
    doctorName: '',
    doctorLicense: '',
    hospitalName: '',
    hospitalLicense: '',
    invoiceNumber: `INV-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    procedureType: 'surgery',
    procedureName: '',
    procedureDescription: '',
    diagnosis: '',
    surgeryDate: '',
    surgeryTime: '',
    items: [
      { id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }
    ],
    subtotal: 0,
    discount: 0,
    discountType: 'percentage',
    total: 0,
    paidAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
    notes: ''
  })

  // تحميل البيانات
  useEffect(() => {
    loadPatients()
    loadInvoices()
    loadDoctors()
    loadClinicInfo()
  }, [])

  const loadPatients = () => {
    const saved = localStorage.getItem('mcsos_patients_v2')
    if (saved) {
      const allPatients = JSON.parse(saved)
      setPatients(allPatients)
    }
    setLoading(false)
  }

  const loadDoctors = () => {
    const saved = localStorage.getItem('mcsos_doctors')
    if (saved) {
      setDoctors(JSON.parse(saved))
    } else {
      setDoctors(availableDoctors)
    }
  }

  const loadInvoices = () => {
    const saved = localStorage.getItem('mcsos_invoices')
    if (saved) {
      setInvoices(JSON.parse(saved))
    }
  }

  const loadClinicInfo = () => {
    const saved = localStorage.getItem('mcsos_clinic_info')
    if (saved) {
      setClinicInfo(JSON.parse(saved))
    }
  }

  const saveInvoices = (data) => {
    localStorage.setItem('mcsos_invoices', JSON.stringify(data))
    setInvoices(data)
  }

  const handleSelectPatient = (patientId) => {
    const patient = patients.find(p => p.id == patientId)
    if (patient) {
      setFormData({
        ...formData,
        patientId: patient.id,
        patientName: currentLang === 'ar' ? patient.nameAr : patient.nameEn,
        patientAge: patient.age,
        patientPhone: patient.phone || ''
      })
    }
  }

  const handleSelectDoctor = (doctorId) => {
    const doctor = doctors.find(d => d.id == doctorId)
    if (doctor) {
      setFormData({
        ...formData,
        doctorId: doctor.id,
        doctorName: currentLang === 'ar' ? doctor.nameAr : doctor.nameEn,
        doctorLicense: doctor.licenseNumber || `DOC-${doctor.id.toString().padStart(3, '0')}`
      })
    }
  }

  const handleAddItem = () => {
    const newId = Math.max(...formData.items.map(i => i.id), 0) + 1
    setFormData({
      ...formData,
      items: [...formData.items, { id: newId, description: '', quantity: 1, unitPrice: 0, total: 0 }]
    })
  }

  const handleRemoveItem = (id) => {
    if (formData.items.length === 1) {
      toast.error('يجب وجود عنصر واحد على الأقل')
      return
    }
    const newItems = formData.items.filter(i => i.id !== id)
    const updatedForm = { ...formData, items: newItems }
    calculateTotals(updatedForm)
    setFormData(updatedForm)
  }

  const handleItemChange = (id, field, value) => {
    const newItems = formData.items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = (updated.quantity || 0) * (updated.unitPrice || 0)
        }
        return updated
      }
      return item
    })
    const updatedForm = { ...formData, items: newItems }
    calculateTotals(updatedForm)
    setFormData(updatedForm)
  }

  const calculateTotals = (data) => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.total || 0), 0)
    let discountAmount = 0
    if (data.discountType === 'percentage') {
      discountAmount = (subtotal * data.discount) / 100
    } else {
      discountAmount = data.discount
    }
    const total = subtotal - discountAmount

    setFormData({
      ...data,
      subtotal,
      total
    })
  }

  const handleDiscountChange = (value) => {
    const updatedForm = { ...formData, discount: value }
    calculateTotals(updatedForm)
  }

  const handleSaveInvoice = () => {
    if (!formData.patientName || !formData.doctorName || formData.items.length === 0) {
      toast.error('الرجاء إدخال بيانات المريض والطبيب وإضافة خدمة واحدة على الأقل')
      return
    }

    const newInvoice = {
      id: selectedInvoice?.id || Date.now(),
      ...formData,
      hospitalName: hospitalStamp.nameAr,
      hospitalLicense: hospitalStamp.licenseNumber,
      createdAt: selectedInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    let updatedInvoices
    if (selectedInvoice) {
      updatedInvoices = invoices.map(i => i.id === selectedInvoice.id ? newInvoice : i)
    } else {
      updatedInvoices = [newInvoice, ...invoices]
    }

    saveInvoices(updatedInvoices)
    setShowInvoiceModal(false)
    resetForm()
    toast.success(selectedInvoice ? 'تم تحديث الفاتورة بنجاح' : 'تم إضافة الفاتورة بنجاح')
  }

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setFormData({ ...invoice })
    setShowInvoiceModal(true)
  }

  const handleDeleteInvoice = (id) => {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      const updated = invoices.filter(i => i.id !== id)
      saveInvoices(updated)
      toast.success('تم حذف الفاتورة بنجاح')
    }
  }

  const handleMarkAsPaid = (id) => {
    const updated = invoices.map(i => 
      i.id === id ? { ...i, paymentStatus: 'paid', paidAmount: i.total } : i
    )
    saveInvoices(updated)
    toast.success('تم تحديث حالة الدفع إلى مدفوع')
  }

  const resetForm = () => {
    setSelectedInvoice(null)
    setFormData({
      patientId: '',
      patientName: '',
      patientAge: '',
      patientPhone: '',
      doctorId: '',
      doctorName: '',
      doctorLicense: '',
      hospitalName: '',
      hospitalLicense: '',
      invoiceNumber: `INV-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      procedureType: 'surgery',
      procedureName: '',
      procedureDescription: '',
      diagnosis: '',
      surgeryDate: '',
      surgeryTime: '',
      items: [{ id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }],
      subtotal: 0,
      discount: 0,
      discountType: 'percentage',
      total: 0,
      paidAmount: 0,
      paymentMethod: 'cash',
      paymentStatus: 'unpaid',
      notes: ''
    })
  }

  const handlePrint = (invoice) => {
    setSelectedInvoice(invoice)
    setShowPrintPreview(true)
    setTimeout(() => {
      window.print()
      setShowPrintPreview(false)
    }, 100)
  }

  const getPaymentStatusBadge = (status) => {
    if (status === 'paid') {
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">مدفوع</span>
    }
    return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs border border-yellow-500/30">غير مدفوع</span>
  }

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id == doctorId)
    if (!doctor) return 'غير محدد'
    return currentLang === 'ar' ? doctor.nameAr : doctor.nameEn
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-white">جاري التحميل...</div></div>
  }

  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold gradient-text">الفواتير الطبية</h1>
          <p className="text-gray-400 mt-1">إدارة الفواتير وكشوف العمليات</p>
        </div>
        <button onClick={() => { resetForm(); setShowInvoiceModal(true); }} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30">
          <Plus size={18} /> فاتورة جديدة
        </button>
      </div>

      {/* قائمة الفواتير */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50">
          <h2 className="text-xl font-bold text-white">قائمة الفواتير</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <th className="px-6 py-3 text-sm text-gray-300">رقم الفاتورة</th>
                <th className="px-6 py-3 text-sm text-gray-300">المريض</th>
                <th className="px-6 py-3 text-sm text-gray-300">الطبيب</th>
                <th className="px-6 py-3 text-sm text-gray-300">التاريخ</th>
                <th className="px-6 py-3 text-sm text-gray-300">الإجمالي</th>
                <th className="px-6 py-3 text-sm text-gray-300">الحالة</th>
                <th className="px-6 py-3 text-sm text-gray-300">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {invoices.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">لا توجد فواتير</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 text-blue-400 font-mono text-sm">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4"><div className="font-semibold text-white">{inv.patientName}</div><div className="text-sm text-gray-400">{inv.patientAge} سنة</div></td>
                    <td className="px-6 py-4 text-gray-300">{inv.doctorName}</td>
                    <td className="px-6 py-4 text-gray-400">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-green-400">{inv.total.toFixed(2)} ر.س</td>
                    <td className="px-6 py-4">{getPaymentStatusBadge(inv.paymentStatus)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEditInvoice(inv)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"><Edit size={16} /></button>
                        <button onClick={() => handlePrint(inv)} className="p-1 text-green-400 hover:bg-green-500/20 rounded"><Printer size={16} /></button>
                        <button onClick={() => handleMarkAsPaid(inv.id)} className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded"><CheckCircle size={16} /></button>
                        <button onClick={() => handleDeleteInvoice(inv.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal إضافة/تعديل فاتورة */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{selectedInvoice ? 'تعديل فاتورة' : 'فاتورة جديدة'}</h2>
              <button onClick={() => setShowInvoiceModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
            </div>

            {/* كيفية حساب الفاتورة */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
              <h3 className="text-blue-400 font-bold text-sm mb-2">📊 طريقة حساب الفاتورة</h3>
              <p className="text-gray-300 text-xs">الإجمالي = مجموع (سعر الخدمة × الكمية) - الخصم</p>
              <p className="text-gray-400 text-xs mt-1">ملاحظة: لا توجد ضريبة مضافة على الخدمات الطبية</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">المريض *</label>
                <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientId} onChange={(e) => handleSelectPatient(e.target.value)}>
                  <option value="">اختر المريض</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{currentLang === 'ar' ? p.nameAr : p.nameEn} - {p.age} سنة</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">الطبيب المعالج *</label>
                <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.doctorId} onChange={(e) => handleSelectDoctor(e.target.value)}>
                  <option value="">اختر الطبيب</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{currentLang === 'ar' ? d.nameAr : d.nameEn} - {currentLang === 'ar' ? d.specializationAr : d.specializationEn}</option>
                  ))}
                </select>
              </div>

              <div><label className="block text-sm text-gray-400 mb-1">العمر</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientAge} onChange={(e) => setFormData({...formData, patientAge: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">رقم الجوال</label><input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientPhone} onChange={(e) => setFormData({...formData, patientPhone: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">تاريخ الفاتورة</label><input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.invoiceDate} onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">تاريخ العملية</label><input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.surgeryDate} onChange={(e) => setFormData({...formData, surgeryDate: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">التشخيص</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">ملاحظات إضافية</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} /></div>
            </div>

            {/* الخدمات */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2"><h3 className="text-white font-bold">الخدمات والرسوم</h3><button onClick={handleAddItem} className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm"><Plus size={14} /> إضافة خدمة</button></div>
              {formData.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 mb-2">
                  <input type="text" className="col-span-5 p-2 bg-gray-700 rounded-lg text-white text-sm" placeholder="الخدمة" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} />
                  <input type="number" className="col-span-2 p-2 bg-gray-700 rounded-lg text-white text-sm" placeholder="الكمية" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)} />
                  <input type="number" className="col-span-3 p-2 bg-gray-700 rounded-lg text-white text-sm" placeholder="السعر (ر.س)" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} />
                  <div className="col-span-1 text-white text-sm">{item.total.toFixed(2)}</div>
                  <button onClick={() => handleRemoveItem(item.id)} className="col-span-1 text-red-400"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            {/* الخصم */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm text-gray-400 mb-1">الخصم</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.discount} onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">نوع الخصم</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})}><option value="percentage">نسبة مئوية %</option><option value="fixed">قيمة ثابتة (ر.س)</option></select></div>
            </div>

            {/* الإجماليات */}
            <div className="bg-gray-700/30 p-3 rounded-lg mb-4">
              <div className="flex justify-between"><span className="text-gray-400">مجموع الخدمات:</span><span className="text-white">{formData.subtotal.toFixed(2)} ر.س</span></div>
              {formData.discount > 0 && (
                <div className="flex justify-between"><span className="text-gray-400">الخصم ({formData.discount}{formData.discountType === 'percentage' ? '%' : ' ر.س'}):</span><span className="text-red-400">- {formData.discountType === 'percentage' ? ((formData.subtotal * formData.discount) / 100).toFixed(2) : formData.discount} ر.س</span></div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-600 mt-2"><span className="text-lg font-bold text-white">الإجمالي النهائي:</span><span className="text-xl font-bold text-green-400">{formData.total.toFixed(2)} ر.س</span></div>
            </div>

            {/* حالة الدفع */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm text-gray-400 mb-1">حالة الدفع</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.paymentStatus} onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}><option value="unpaid">غير مدفوع</option><option value="paid">مدفوع</option><option value="partial">مدفوع جزئياً</option></select></div>
              <div><label className="block text-sm text-gray-400 mb-1">طريقة الدفع</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}><option value="cash">كاش</option><option value="card">بطاقة ائتمان</option><option value="bank">تحويل بنكي</option></select></div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-700">
              <button onClick={handleSaveInvoice} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30">حفظ الفاتورة</button>
              <button onClick={() => setShowInvoiceModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الطباعة مع ختم الدكتور والمستشفى */}
      {showPrintPreview && selectedInvoice && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            {/* رأس الفاتورة - بيانات المستشفى */}
            <div className="text-center mb-6 border-b pb-4">
              <div className="flex justify-between items-start mb-4">
                <div className="text-left">
                  <div className="border-2 border-gray-400 p-2 rounded-lg inline-block">
                    <Stamp size={48} className="text-gray-500 mx-auto" />
                    <p className="text-xs text-gray-500 mt-1">ختم المستشفى</p>
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <h1 className="text-2xl font-bold text-blue-800">{selectedInvoice.hospitalName || hospitalStamp.nameAr}</h1>
                  <p className="text-gray-600">{selectedInvoice.hospitalAddress || hospitalStamp.addressAr}</p>
                  <p className="text-gray-500 text-sm">هاتف: {hospitalStamp.phone} | ترخيص: {selectedInvoice.hospitalLicense || hospitalStamp.licenseNumber}</p>
                </div>
                <div className="text-right">
                  <div className="border-2 border-gray-400 p-2 rounded-lg inline-block">
                    <Building size={48} className="text-gray-500 mx-auto" />
                    <p className="text-xs text-gray-500 mt-1">شعار المستشفى</p>
                  </div>
                </div>
              </div>
              <h2 className="text-xl font-bold mt-2">فاتورة طبية</h2>
              <p className="text-gray-500">رقم: {selectedInvoice.invoiceNumber} | تاريخ: {selectedInvoice.invoiceDate}</p>
            </div>

            {/* معلومات المريض والطبيب */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border p-3 rounded bg-gray-50">
                <p className="font-bold text-blue-700 border-b pb-1 mb-2">بيانات المريض</p>
                <p><span className="font-semibold">الاسم:</span> {selectedInvoice.patientName}</p>
                <p><span className="font-semibold">العمر:</span> {selectedInvoice.patientAge} سنة</p>
                <p><span className="font-semibold">الجوال:</span> {selectedInvoice.patientPhone || 'غير محدد'}</p>
                <p><span className="font-semibold">التشخيص:</span> {selectedInvoice.diagnosis || 'غير محدد'}</p>
              </div>
              <div className="border p-3 rounded bg-gray-50">
                <p className="font-bold text-green-700 border-b pb-1 mb-2">بيانات الطبيب المعالج</p>
                <p><span className="font-semibold">الاسم:</span> {selectedInvoice.doctorName}</p>
                <p><span className="font-semibold">التخصص:</span> {selectedInvoice.doctorSpecialization || 'غير محدد'}</p>
                <p><span className="font-semibold">رخصة مزاولة المهنة:</span> {selectedInvoice.doctorLicense || 'غير محدد'}</p>
                <div className="mt-2 pt-2 border-t border-dashed">
                  <div className="flex items-center gap-2">
                    <Signature size={20} className="text-gray-500" />
                    <div className="border-b border-gray-400 w-32 h-8"></div>
                    <span className="text-xs text-gray-500">توقيع الطبيب</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Stamp size={20} className="text-gray-500" />
                    <div className="border-2 border-gray-400 rounded w-16 h-16 flex items-center justify-center">
                      <span className="text-xs text-gray-400">ختم الطبيب</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* تفاصيل الخدمات */}
            <div className="mb-6">
              <h3 className="font-bold mb-2 bg-gray-100 p-2 rounded">تفاصيل الخدمات المقدمة</h3>
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr><th className="border p-2 text-right">#</th><th className="border p-2 text-right">الخدمة</th><th className="border p-2 text-center">الكمية</th><th className="border p-2 text-right">السعر (ر.س)</th><th className="border p-2 text-right">الإجمالي (ر.س)</th></tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}><td className="border p-2 text-center">{idx + 1}</td><td className="border p-2">{item.description || 'خدمة غير محددة'}</td><td className="border p-2 text-center">{item.quantity}</td><td className="border p-2 text-right">{item.unitPrice.toFixed(2)}</td><td className="border p-2 text-right font-semibold">{item.total.toFixed(2)}</td></tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr><td colSpan="4" className="border p-2 text-right font-bold">المجموع</td><td className="border p-2 text-right font-bold">{selectedInvoice.subtotal.toFixed(2)}</td></tr>
                  {selectedInvoice.discount > 0 && (<tr><td colSpan="4" className="border p-2 text-right font-bold text-red-600">الخصم ({selectedInvoice.discount}{selectedInvoice.discountType === 'percentage' ? '%' : ' ر.س'})</td><td className="border p-2 text-right text-red-600">- {selectedInvoice.discountType === 'percentage' ? ((selectedInvoice.subtotal * selectedInvoice.discount) / 100).toFixed(2) : selectedInvoice.discount}</td></tr>)}
                  <tr className="bg-blue-50"><td colSpan="4" className="border p-2 text-right font-bold text-lg">الإجمالي النهائي</td><td className="border p-2 text-right font-bold text-lg text-blue-600">{selectedInvoice.total.toFixed(2)} ر.س</td></tr>
                </tfoot>
              </table>
            </div>

            {/* معلومات الدفع */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border p-3 rounded"><p className="font-bold">معلومات الدفع</p><p>الحالة: {selectedInvoice.paymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع'}</p><p>الطريقة: {selectedInvoice.paymentMethod === 'cash' ? 'كاش' : selectedInvoice.paymentMethod === 'card' ? 'بطاقة ائتمان' : 'تحويل بنكي'}</p></div>
              <div className="border p-3 rounded"><p className="font-bold">ملاحظات</p><p>{selectedInvoice.notes || 'لا توجد ملاحظات'}</p></div>
            </div>

            {/* ختم المستشفى والدكتور في الأسفل */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <div className="border-2 border-gray-300 rounded-lg p-3 inline-block">
                  <Stamp size={40} className="text-gray-500 mx-auto mb-2" />
                  <p className="text-sm font-bold">ختم المستشفى</p>
                  <p className="text-xs text-gray-500">{hospitalStamp.nameAr}</p>
                  <p className="text-xs text-gray-500">ترخيص: {hospitalStamp.licenseNumber}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-2 border-gray-300 rounded-lg p-3 inline-block">
                  <Signature size={40} className="text-gray-500 mx-auto mb-2" />
                  <p className="text-sm font-bold">توقيع الطبيب المعالج</p>
                  <div className="border-b border-gray-400 w-32 mx-auto mt-2 mb-1"></div>
                  <p className="text-xs text-gray-500">{selectedInvoice.doctorName}</p>
                  <p className="text-xs text-gray-500">رخصة: {selectedInvoice.doctorLicense}</p>
                </div>
              </div>
            </div>

            <div className="text-center pt-6 mt-4 border-t">
              <p>شكراً لثقتكم بنا - نتمنى لكم دوام الصحة والعافية</p>
              <p className="text-gray-400 text-sm mt-2">تم إنشاء هذه الفاتورة بواسطة نظام المركز الطبي MCSOS</p>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-8 pb-8">
            <button onClick={() => window.print()} className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2"><Printer size={18} /> طباعة</button>
            <button onClick={() => setShowPrintPreview(false)} className="bg-gray-500 text-white px-6 py-2 rounded-lg">إغلاق</button>
          </div>
        </div>
      )}
    </div>
  )
}
