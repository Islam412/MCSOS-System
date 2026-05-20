import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Printer, Plus, Trash2, Edit, Save, X, CheckCircle, User, Stethoscope, DollarSign, FileText, Calendar, Stamp, Building, UserPlus, Upload } from 'lucide-react'
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
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false)
  const [newDoctor, setNewDoctor] = useState({ nameAr: '', nameEn: '', specializationAr: '', specializationEn: '' })

  const [clinicInfo, setClinicInfo] = useState({
    nameAr: 'مركز الطب الحديث',
    nameEn: 'Modern Medical Center',
    addressAr: 'شارع الملك فهد، الرياض، المملكة العربية السعودية',
    addressEn: 'King Fahd Road, Riyadh, Saudi Arabia',
    phone: '+966 12 345 6789',
    email: 'info@modernmedical.com'
  })

  const [hospitalStamp, setHospitalStamp] = useState({
    nameAr: 'مستشفى السلام',
    nameEn: 'Al Salam Hospital',
    addressAr: 'شارع الملك عبدالعزيز، الرياض',
    addressEn: 'King Abdulaziz Road, Riyadh',
    phone: '+966 12 345 6788',
    logo: null,
    logoPreview: null
  })

  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientAge: '',
    patientPhone: '',
    doctorId: '',
    doctorName: '',
    doctorSpecialization: '',
    invoiceNumber: `INV-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    surgeryDate: '',
    diagnosis: '',
    items: [{ id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0,
    discount: 0,
    discountType: 'percentage',
    total: 0,
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
    notes: ''
  })

  useEffect(() => {
    loadPatients()
    loadInvoices()
    loadDoctors()
    loadClinicInfo()
    loadHospitalLogo()
  }, [])

  const loadPatients = () => {
    const saved = localStorage.getItem('mcsos_patients_v2')
    if (saved) {
      setPatients(JSON.parse(saved))
    } else {
      setPatients([
        { id: 1, nameAr: 'أحمد محمد', nameEn: 'Ahmed Mohamed', age: 35, phone: '0501234567' },
        { id: 2, nameAr: 'سارة حسن', nameEn: 'Sara Hassan', age: 28, phone: '0507654321' }
      ])
    }
    setLoading(false)
  }

  const loadDoctors = () => {
    const saved = localStorage.getItem('mcsos_doctors')
    if (saved) {
      setDoctors(JSON.parse(saved))
    } else {
      setDoctors([
        { id: 1, nameAr: 'د. أحمد علي', nameEn: 'Dr. Ahmed Ali', specializationAr: 'جراحة عظام', specializationEn: 'Orthopedic' },
        { id: 2, nameAr: 'د. منى حسن', nameEn: 'Dr. Mona Hassan', specializationAr: 'علاج طبيعي', specializationEn: 'Physical Therapy' }
      ])
    }
  }

  const loadInvoices = () => {
    const saved = localStorage.getItem('mcsos_invoices')
    if (saved) setInvoices(JSON.parse(saved))
  }

  const loadClinicInfo = () => {
    const saved = localStorage.getItem('mcsos_clinic_info')
    if (saved) setClinicInfo(JSON.parse(saved))
  }

  const loadHospitalLogo = () => {
    const savedLogo = localStorage.getItem('hospital_logo')
    if (savedLogo) setHospitalStamp(prev => ({ ...prev, logoPreview: savedLogo }))
  }

  const saveInvoices = (data) => {
    localStorage.setItem('mcsos_invoices', JSON.stringify(data))
    setInvoices(data)
  }

  const saveDoctors = (data) => {
    localStorage.setItem('mcsos_doctors', JSON.stringify(data))
    setDoctors(data)
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setHospitalStamp(prev => ({ ...prev, logoPreview: reader.result }))
        localStorage.setItem('hospital_logo', reader.result)
        toast.success('تم رفع شعار المستشفى بنجاح')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddDoctor = () => {
    if (!newDoctor.nameAr || !newDoctor.specializationAr) {
      toast.error('الرجاء إدخال اسم الطبيب والتخصص')
      return
    }
    const doctor = {
      id: Date.now(),
      nameAr: newDoctor.nameAr,
      nameEn: newDoctor.nameEn || newDoctor.nameAr,
      specializationAr: newDoctor.specializationAr,
      specializationEn: newDoctor.specializationEn || newDoctor.specializationAr
    }
    saveDoctors([...doctors, doctor])
    setShowAddDoctorModal(false)
    setNewDoctor({ nameAr: '', nameEn: '', specializationAr: '', specializationEn: '' })
    toast.success('تم إضافة الطبيب بنجاح')
  }

  const handleSelectPatient = (patientId) => {
    const patient = patients.find(p => p.id == patientId)
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patientId: patient.id,
        patientName: currentLang === 'ar' ? patient.nameAr : patient.nameEn,
        patientAge: patient.age,
        patientPhone: patient.phone || ''
      }))
    }
  }

  const handleSelectDoctor = (doctorId) => {
    const doctor = doctors.find(d => d.id == doctorId)
    if (doctor) {
      setFormData(prev => ({
        ...prev,
        doctorId: doctor.id,
        doctorName: currentLang === 'ar' ? doctor.nameAr : doctor.nameEn,
        doctorSpecialization: (currentLang === 'ar' ? doctor.specializationAr : doctor.specializationEn) || ''
      }))
    }
  }

  const handleAddItem = () => {
    const newId = Math.max(...formData.items.map(i => i.id), 0) + 1
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: newId, description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }))
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
    let discountAmount = data.discountType === 'percentage' ? (subtotal * data.discount) / 100 : data.discount
    const total = subtotal - discountAmount
    setFormData(prev => ({ ...prev, subtotal, total }))
  }

  const handleDiscountChange = (value) => {
    const updatedForm = { ...formData, discount: value }
    calculateTotals(updatedForm)
    setFormData(updatedForm)
  }

  const handleSaveInvoice = () => {
    if (!formData.patientName || !formData.doctorName || formData.items.length === 0) {
      toast.error('الرجاء إدخال بيانات المريض والطبيب وإضافة خدمة')
      return
    }
    const newInvoice = {
      id: selectedInvoice?.id || Date.now(),
      ...formData,
      hospitalName: hospitalStamp.nameAr,
      createdAt: selectedInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updatedInvoices = selectedInvoice
      ? invoices.map(i => i.id === selectedInvoice.id ? newInvoice : i)
      : [newInvoice, ...invoices]
    saveInvoices(updatedInvoices)
    setShowInvoiceModal(false)
    resetForm()
    toast.success(selectedInvoice ? 'تم تحديث الفاتورة' : 'تم إضافة الفاتورة')
  }

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setFormData({ ...invoice })
    setShowInvoiceModal(true)
  }

  const handleDeleteInvoice = (id) => {
    if (confirm('هل أنت متأكد من الحذف؟')) {
      saveInvoices(invoices.filter(i => i.id !== id))
      toast.success('تم حذف الفاتورة')
    }
  }

  const handleMarkAsPaid = (id) => {
    saveInvoices(invoices.map(i => i.id === id ? { ...i, paymentStatus: 'paid' } : i))
    toast.success('تم تحديث حالة الدفع إلى مدفوع')
  }

  const resetForm = () => {
    setSelectedInvoice(null)
    setFormData({
      patientId: '', patientName: '', patientAge: '', patientPhone: '',
      doctorId: '', doctorName: '', doctorSpecialization: '',
      invoiceNumber: `INV-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      surgeryDate: '', diagnosis: '',
      items: [{ id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }],
      subtotal: 0, discount: 0, discountType: 'percentage', total: 0,
      paymentMethod: 'cash', paymentStatus: 'unpaid', notes: ''
    })
  }

  const handlePrint = (invoice) => {
    setSelectedInvoice(invoice)
    setShowPrintPreview(true)
    setTimeout(() => { window.print(); setShowPrintPreview(false) }, 100)
  }

  const getPaymentStatusBadge = (status) => status === 'paid'
    ? <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">مدفوع</span>
    : <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs border border-yellow-500/30">غير مدفوع</span>

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-white">جاري التحميل...</div></div>

  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div><h1 className="text-3xl font-bold gradient-text">الفواتير الطبية</h1><p className="text-gray-400 mt-1">إدارة الفواتير وكشوف العمليات</p></div>
        <button onClick={() => { resetForm(); setShowInvoiceModal(true); }} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30"><Plus size={18} /> فاتورة جديدة</button>
      </div>

      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50"><h2 className="text-xl font-bold text-white">قائمة الفواتير</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80"><tr className={`${isRTL ? 'text-right' : 'text-left'}`}><th className="px-6 py-3 text-sm text-gray-300">الرقم</th><th className="px-6 py-3 text-sm text-gray-300">المريض</th><th className="px-6 py-3 text-sm text-gray-300">الطبيب</th><th className="px-6 py-3 text-sm text-gray-300">التاريخ</th><th className="px-6 py-3 text-sm text-gray-300">الإجمالي</th><th className="px-6 py-3 text-sm text-gray-300">الحالة</th><th className="px-6 py-3 text-sm text-gray-300">إجراءات</th></tr></thead>
            <tbody className="divide-y divide-gray-700/50">
              {invoices.length === 0 ? <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">لا توجد فواتير</td></tr> : invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-700/30">
                  <td className="px-6 py-4 text-blue-400 font-mono text-sm">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4"><div className="font-semibold text-white">{inv.patientName}</div><div className="text-sm text-gray-400">{inv.patientAge} سنة</div></td>
                  <td className="px-6 py-4 text-gray-300">{inv.doctorName}</td>
                  <td className="px-6 py-4 text-gray-400">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-semibold text-green-400">{inv.total.toFixed(2)} ر.س</td>
                  <td className="px-6 py-4">{getPaymentStatusBadge(inv.paymentStatus)}</td>
                  <td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => handleEditInvoice(inv)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"><Edit size={16} /></button><button onClick={() => handlePrint(inv)} className="p-1 text-green-400 hover:bg-green-500/20 rounded"><Printer size={16} /></button><button onClick={() => handleMarkAsPaid(inv.id)} className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded"><CheckCircle size={16} /></button><button onClick={() => handleDeleteInvoice(inv.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 size={16} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">فاتورة جديدة</h2><button onClick={() => setShowInvoiceModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
              <h3 className="text-blue-400 font-bold text-sm mb-2">📊 طريقة حساب الفاتورة</h3>
              <p className="text-gray-300 text-xs">الإجمالي = مجموع (سعر الخدمة × الكمية) - الخصم</p>
              <p className="text-gray-400 text-xs mt-1">لا توجد ضريبة مضافة على الخدمات الطبية</p>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
              <label className="block text-sm text-gray-400 mb-2">شعار المستشفى</label>
              <div className="flex items-center gap-4">
                {hospitalStamp.logoPreview && <img src={hospitalStamp.logoPreview} alt="شعار المستشفى" className="w-16 h-16 object-contain border rounded p-1 bg-white" />}
                <label className="cursor-pointer bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2"><Upload size={18} /> رفع شعار</label>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm text-gray-400 mb-1">المريض *</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientId} onChange={(e) => handleSelectPatient(e.target.value)}><option value="">اختر المريض</option>{patients.map(p => (<option key={p.id} value={p.id}>{currentLang === 'ar' ? p.nameAr : p.nameEn} - {p.age} سنة</option>))}</select></div>
              <div className="flex gap-2"><div className="flex-1"><label className="block text-sm text-gray-400 mb-1">الطبيب *</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.doctorId} onChange={(e) => handleSelectDoctor(e.target.value)}><option value="">اختر الطبيب</option>{doctors.map(d => (<option key={d.id} value={d.id}>{currentLang === 'ar' ? d.nameAr : d.nameEn}</option>))}</select></div><button onClick={() => setShowAddDoctorModal(true)} className="mt-7 p-2 bg-green-500/20 text-green-400 rounded-lg"><UserPlus size={18} /></button></div>
              <div><label className="block text-sm text-gray-400 mb-1">العمر</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientAge} onChange={(e) => setFormData({...formData, patientAge: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">الجوال</label><input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientPhone} onChange={(e) => setFormData({...formData, patientPhone: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">التاريخ</label><input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.invoiceDate} onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">تاريخ العملية</label><input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.surgeryDate} onChange={(e) => setFormData({...formData, surgeryDate: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">التشخيص</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} /></div>
            </div>

            <div className="mb-4"><div className="flex justify-between items-center mb-2"><h3 className="text-white font-bold">الخدمات</h3><button onClick={handleAddItem} className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm"><Plus size={14} /> إضافة</button></div>
            {formData.items.map((item) => (<div key={item.id} className="grid grid-cols-12 gap-2 mb-2"><input type="text" className="col-span-5 p-2 bg-gray-700 rounded-lg text-white text-sm" placeholder="الخدمة" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} /><input type="number" className="col-span-2 p-2 bg-gray-700 rounded-lg text-white text-sm" placeholder="الكمية" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)} /><input type="number" className="col-span-3 p-2 bg-gray-700 rounded-lg text-white text-sm" placeholder="السعر" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} /><div className="col-span-1 text-white text-sm">{item.total.toFixed(2)}</div><button onClick={() => handleRemoveItem(item.id)} className="col-span-1 text-red-400"><Trash2 size={16} /></button></div>))}</div>

            <div className="grid grid-cols-2 gap-4 mb-4"><div><label className="block text-sm text-gray-400 mb-1">الخصم</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.discount} onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)} /></div><div><label className="block text-sm text-gray-400 mb-1">نوع الخصم</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})}><option value="percentage">نسبة مئوية</option><option value="fixed">قيمة ثابتة</option></select></div></div>

            <div className="bg-gray-700/30 p-3 rounded-lg mb-4"><div className="flex justify-between"><span className="text-gray-400">المجموع:</span><span className="text-white">{formData.subtotal.toFixed(2)} ر.س</span></div>{formData.discount > 0 && (<div className="flex justify-between"><span className="text-gray-400">الخصم:</span><span className="text-red-400">- {formData.discountType === 'percentage' ? ((formData.subtotal * formData.discount) / 100).toFixed(2) : formData.discount} ر.س</span></div>)}<div className="flex justify-between pt-2 border-t border-gray-600 mt-2"><span className="text-lg font-bold text-white">الإجمالي:</span><span className="text-xl font-bold text-green-400">{formData.total.toFixed(2)} ر.س</span></div></div>

            <div className="grid grid-cols-2 gap-4 mb-4"><div><label className="block text-sm text-gray-400 mb-1">حالة الدفع</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.paymentStatus} onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}><option value="unpaid">غير مدفوع</option><option value="paid">مدفوع</option></select></div><div><label className="block text-sm text-gray-400 mb-1">طريقة الدفع</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}><option value="cash">كاش</option><option value="card">بطاقة</option><option value="bank">تحويل</option></select></div></div>
            <div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">ملاحظات</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} /></div>

            <div className="flex gap-3 pt-4 border-t border-gray-700"><button onClick={handleSaveInvoice} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">حفظ</button><button onClick={() => setShowInvoiceModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div>
          </div>
        </div>
      )}

      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">إضافة طبيب</h2><button onClick={() => setShowAddDoctorModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>
            <div className="space-y-3"><input type="text" placeholder="الاسم" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.nameAr} onChange={(e) => setNewDoctor({...newDoctor, nameAr: e.target.value})} /><input type="text" placeholder="التخصص" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.specializationAr} onChange={(e) => setNewDoctor({...newDoctor, specializationAr: e.target.value})} /><div className="flex gap-3 pt-4"><button onClick={handleAddDoctor} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">إضافة</button><button onClick={() => setShowAddDoctorModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div></div>
          </div>
        </div>
      )}

      {showPrintPreview && selectedInvoice && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto p-8" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {hospitalStamp.logoPreview && <img src={hospitalStamp.logoPreview} alt="الشعار" className="w-16 h-16 object-contain bg-white rounded-lg p-1" />}
                  <div><h1 className="text-2xl font-bold">{selectedInvoice.hospitalName || hospitalStamp.nameAr}</h1><p className="text-blue-100 text-sm">{hospitalStamp.addressAr}</p><p className="text-blue-100 text-sm">هاتف: {hospitalStamp.phone}</p></div>
                </div>
                <div className="text-left"><div className="bg-white/20 rounded-lg p-3"><p className="text-sm">فاتورة طبية</p><p className="text-xl font-bold">{selectedInvoice.invoiceNumber}</p></div></div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border rounded-lg p-4 bg-gray-50"><h3 className="font-bold text-blue-700 border-b pb-2 mb-2">بيانات المريض</h3><p><span className="font-semibold">الاسم:</span> {selectedInvoice.patientName}</p><p><span className="font-semibold">العمر:</span> {selectedInvoice.patientAge} سنة</p><p><span className="font-semibold">الجوال:</span> {selectedInvoice.patientPhone || '-'}</p><p><span className="font-semibold">التاريخ:</span> {selectedInvoice.invoiceDate}</p></div>
                <div className="border rounded-lg p-4 bg-gray-50"><h3 className="font-bold text-green-700 border-b pb-2 mb-2">بيانات الطبيب</h3><p><span className="font-semibold">الاسم:</span> {selectedInvoice.doctorName}</p>{selectedInvoice.doctorSpecialization && <p><span className="font-semibold">التخصص:</span> {selectedInvoice.doctorSpecialization}</p>}<p><span className="font-semibold">تاريخ العملية:</span> {selectedInvoice.surgeryDate || '-'}</p></div>
              </div>
              {selectedInvoice.diagnosis && (<div className="mb-6"><h3 className="font-semibold mb-2">التشخيص</h3><div className="border rounded-lg p-3 bg-gray-50">{selectedInvoice.diagnosis}</div></div>)}
              <div className="mb-6"><h3 className="font-semibold mb-2">الخدمات</h3><table className="w-full border-collapse"><thead className="bg-gray-100"><tr><th className="border p-2 text-center">#</th><th className="border p-2 text-right">الخدمة</th><th className="border p-2 text-center">الكمية</th><th className="border p-2 text-right">السعر</th><th className="border p-2 text-right">الإجمالي</th></tr></thead><tbody>{selectedInvoice.items.map((item, idx) => (<tr key={idx}><td className="border p-2 text-center">{idx+1}</td><td className="border p-2">{item.description || '-'}</td><td className="border p-2 text-center">{item.quantity}</td><td className="border p-2 text-right">{item.unitPrice.toFixed(2)}</td><td className="border p-2 text-right font-semibold">{item.total.toFixed(2)}</td></tr>))}</tbody><tfoot><tr><td colSpan="4" className="border p-2 text-right font-bold">المجموع</td><td className="border p-2 text-right font-bold">{selectedInvoice.subtotal.toFixed(2)}</td></tr>{selectedInvoice.discount > 0 && (<tr><td colSpan="4" className="border p-2 text-right font-bold text-red-600">الخصم ({selectedInvoice.discount}{selectedInvoice.discountType === 'percentage' ? '%' : ' ر.س'})</td><td className="border p-2 text-right text-red-600">- {selectedInvoice.discountType === 'percentage' ? ((selectedInvoice.subtotal * selectedInvoice.discount) / 100).toFixed(2) : selectedInvoice.discount}</td></tr>)}<tr className="bg-blue-50"><td colSpan="4" className="border p-2 text-right font-bold text-lg">الإجمالي</td><td className="border p-2 text-right font-bold text-lg text-blue-600">{selectedInvoice.total.toFixed(2)} ر.س</td></tr></tfoot></table></div>
              <div className="grid grid-cols-2 gap-4 mb-6"><div className="border rounded-lg p-3"><h3 className="font-semibold mb-2">الدفع</h3><p>الحالة: {selectedInvoice.paymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع'}</p><p>الطريقة: {selectedInvoice.paymentMethod === 'cash' ? 'كاش' : selectedInvoice.paymentMethod === 'card' ? 'بطاقة' : 'تحويل'}</p></div><div className="border rounded-lg p-3"><h3 className="font-semibold mb-2">ملاحظات</h3><p>{selectedInvoice.notes || '-'}</p></div></div>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t"><div className="text-center"><div className="border-t-2 border-gray-300 w-40 mx-auto pt-2"></div><p className="text-sm text-gray-500">توقيع المريض</p></div><div className="text-center"><div className="border-t-2 border-gray-300 w-40 mx-auto pt-2"></div><p className="text-sm text-gray-500">توقيع الطبيب</p></div></div>
              <div className="text-center mt-6 pt-4 border-t"><p className="text-gray-500">شكراً لثقتكم بنا</p><p className="text-gray-400 text-xs mt-2">MCSOS - نظام المركز الطبي</p></div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4 pb-8"><button onClick={() => window.print()} className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2"><Printer size={18} /> طباعة</button><button onClick={() => setShowPrintPreview(false)} className="bg-gray-500 text-white px-6 py-2 rounded-lg">إغلاق</button></div>
        </div>
      )}
    </div>
  )
}
