import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Printer, Plus, Trash2, Edit, Save, X, CheckCircle, User, Stethoscope, DollarSign, FileText, Calendar, Stamp, Building, UserPlus, Upload, Hospital, Settings, Copy, FileCheck, Minus, Maximize } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InvoiceManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language

  const [invoices, setInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [showPrintOptions, setShowPrintOptions] = useState(false)
  const [showHospitalSettings, setShowHospitalSettings] = useState(false)
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false)
  const [newDoctor, setNewDoctor] = useState({ nameAr: '', nameEn: '', specializationAr: '', specializationEn: '' })
  const [printCopies, setPrintCopies] = useState(1)

  const [hospitalInfo, setHospitalInfo] = useState({
    nameAr: 'مستشفى السلام',
    nameEn: 'Al Salam Hospital',
    addressAr: 'شارع الملك عبدالعزيز، الرياض، المملكة العربية السعودية',
    addressEn: 'King Abdulaziz Road, Riyadh, Saudi Arabia',
    phone: '+966 12 345 6788',
    email: 'info@alsalamhospital.com',
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
    loadHospitalInfo()
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

  const loadHospitalInfo = () => {
    const saved = localStorage.getItem('mcsos_hospital_info')
    if (saved) setHospitalInfo(JSON.parse(saved))
  }

  const saveInvoices = (data) => {
    localStorage.setItem('mcsos_invoices', JSON.stringify(data))
    setInvoices(data)
  }

  const saveDoctors = (data) => {
    localStorage.setItem('mcsos_doctors', JSON.stringify(data))
    setDoctors(data)
  }

  const saveHospitalInfo = (data) => {
    localStorage.setItem('mcsos_hospital_info', JSON.stringify(data))
    setHospitalInfo(data)
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const updated = { ...hospitalInfo, logoPreview: reader.result, logo: reader.result }
        setHospitalInfo(updated)
        saveHospitalInfo(updated)
        toast.success('تم رفع شعار المستشفى بنجاح')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleHospitalInfoChange = (field, value) => {
    const updated = { ...hospitalInfo, [field]: value }
    setHospitalInfo(updated)
    saveHospitalInfo(updated)
    toast.success('تم تحديث بيانات المستشفى')
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
      hospitalName: hospitalInfo.nameAr,
      hospitalAddress: hospitalInfo.addressAr,
      hospitalPhone: hospitalInfo.phone,
      hospitalLogo: hospitalInfo.logoPreview,
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

  const openPrintOptions = (invoice) => {
    setSelectedInvoice(invoice)
    setPrintCopies(1)
    setShowPrintOptions(true)
  }

  const handlePrintWithCopies = () => {
    setShowPrintOptions(false)
    for (let i = 0; i < printCopies; i++) {
      setTimeout(() => {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(getPrintHTML(selectedInvoice, i + 1, printCopies))
          printWindow.document.close()
          printWindow.print()
        }
      }, i * 300)
    }
    toast.success(`جاري طباعة ${printCopies} نسخة`)
  }

  const getPrintHTML = (invoice, copyNumber, totalCopies) => {
    const isRTLPrint = isRTL ? 'rtl' : 'ltr'
    return `
      <!DOCTYPE html>
      <html dir="${isRTLPrint}" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة طبية - ${invoice.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Cairo', Arial, sans-serif; background: #fff; padding: 20px; }
          .invoice-container { max-width: 1100px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #1e3a5f, #2563eb); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
          .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; }
          .logo-area { display: flex; align-items: center; gap: 15px; }
          .logo-img { width: 70px; height: 70px; object-fit: contain; background: white; border-radius: 10px; padding: 5px; }
          .hospital-name { font-size: 22px; font-weight: bold; }
          .copy-badge { background: #ff9800; color: white; padding: 3px 10px; border-radius: 20px; font-size: 12px; margin-left: 10px; }
          .info-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .info-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; background: #f9fafb; }
          .info-title { font-weight: bold; color: #1e3a5f; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 10px; }
          .info-row { margin: 8px 0; display: flex; justify-content: space-between; }
          .services-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .services-table th, .services-table td { border: 1px solid #e5e7eb; padding: 10px; text-align: ${isRTLPrint ? 'right' : 'left'}; }
          .services-table th { background: #f3f4f6; }
          .totals { background: #f9fafb; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
          .final-total { font-size: 20px; font-weight: bold; color: #2563eb; border-top: 2px solid #e5e7eb; padding-top: 10px; margin-top: 10px; }
          .payment-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; text-align: center; }
          .sign-line { border-top: 1px solid #9ca3af; width: 200px; margin: 10px auto 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
          @media print { body { padding: 0; margin: 0; } }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="header-content">
              <div class="logo-area">
                ${invoice.hospitalLogo ? `<img src="${invoice.hospitalLogo}" class="logo-img" alt="شعار المستشفى">` : '<div class="logo-img" style="background:white;display:flex;align-items:center;justify-content:center"><span style="font-size:30px">🏥</span></div>'}
                <div>
                  <div class="hospital-name">${invoice.hospitalName || hospitalInfo.nameAr}</div>
                  <div style="font-size:12px">${invoice.hospitalAddress || hospitalInfo.addressAr} | هاتف: ${invoice.hospitalPhone || hospitalInfo.phone}</div>
                </div>
              </div>
              <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:10px 20px;text-align:center">
                <div>فاتورة طبية</div>
                <div style="font-size:20px;font-weight:bold">${invoice.invoiceNumber}</div>
                ${totalCopies > 1 ? `<div class="copy-badge">نسخة ${copyNumber}/${totalCopies}</div>` : ''}
              </div>
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-card">
              <div class="info-title">بيانات المريض</div>
              <div class="info-row"><span>الاسم:</span><span>${invoice.patientName}</span></div>
              <div class="info-row"><span>العمر:</span><span>${invoice.patientAge} سنة</span></div>
              <div class="info-row"><span>الجوال:</span><span>${invoice.patientPhone || '-'}</span></div>
              <div class="info-row"><span>التاريخ:</span><span>${invoice.invoiceDate}</span></div>
            </div>
            <div class="info-card">
              <div class="info-title">بيانات الطبيب</div>
              <div class="info-row"><span>الاسم:</span><span>${invoice.doctorName}</span></div>
              ${invoice.doctorSpecialization ? `<div class="info-row"><span>التخصص:</span><span>${invoice.doctorSpecialization}</span></div>` : ''}
              <div class="info-row"><span>تاريخ العملية:</span><span>${invoice.surgeryDate || '-'}</span></div>
            </div>
          </div>
          
          ${invoice.diagnosis ? `<div class="info-card" style="margin-bottom:20px"><div class="info-title">التشخيص</div><div>${invoice.diagnosis}</div></div>` : ''}
          
          <table class="services-table">
            <thead><tr><th>#</th><th>الخدمة</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
            <tbody>
              ${invoice.items.map((item, idx) => `<tr><td class="text-center">${idx+1}</td><td>${item.description || '-'}</td><td class="text-center">${item.quantity}</td><td>${item.unitPrice.toFixed(2)} ر.س</td><td>${item.total.toFixed(2)} ر.س</td>`).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row"><span>مجموع الخدمات:</span><span>${invoice.subtotal.toFixed(2)} ر.س</span></div>
            ${invoice.discount > 0 ? `<div class="total-row"><span>الخصم (${invoice.discount}${invoice.discountType === 'percentage' ? '%' : ' ر.س'}):</span><span style="color:red">- ${invoice.discountType === 'percentage' ? ((invoice.subtotal * invoice.discount) / 100).toFixed(2) : invoice.discount} ر.س</span></div>` : ''}
            <div class="total-row final-total"><span>الإجمالي النهائي:</span><span>${invoice.total.toFixed(2)} ر.س</span></div>
          </div>
          
          <div class="payment-section">
            <div class="info-card"><div class="info-title">معلومات الدفع</div><div class="info-row"><span>الحالة:</span><span>${invoice.paymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع'}</span></div><div class="info-row"><span>الطريقة:</span><span>${invoice.paymentMethod === 'cash' ? 'كاش' : invoice.paymentMethod === 'card' ? 'بطاقة' : 'تحويل'}</span></div></div>
            <div class="info-card"><div class="info-title">ملاحظات</div><div>${invoice.notes || 'لا توجد'}</div></div>
          </div>
          
          <div class="signatures">
            <div><div class="sign-line"></div><p style="margin-top:8px">توقيع المريض</p></div>
            <div><div class="sign-line"></div><p style="margin-top:8px">توقيع الطبيب</p></div>
          </div>
          
          <div class="footer">
            <p>شكراً لثقتكم بنا - نتمنى لكم دوام الصحة والعافية</p>
            <p style="margin-top:5px">MCSOS - نظام المركز الطبي</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  const getPaymentStatusBadge = (status) => status === 'paid'
    ? <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">مدفوع</span>
    : <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs border border-yellow-500/30">غير مدفوع</span>

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-white">جاري التحميل...</div></div>

  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div><h1 className="text-3xl font-bold gradient-text">الفواتير الطبية</h1><p className="text-gray-400 mt-1">إدارة الفواتير وكشوف العمليات</p></div>
        <div className="flex gap-2">
          <button onClick={() => setShowHospitalSettings(true)} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-purple-500/30"><Hospital size={18} /> بيانات المستشفى</button>
          <button onClick={() => { resetForm(); setShowInvoiceModal(true); }} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30"><Plus size={18} /> فاتورة جديدة</button>
        </div>
      </div>

      {/* قائمة الفواتير */}
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
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEditInvoice(inv)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"><Edit size={16} /></button>
                      <button onClick={() => openPrintOptions(inv)} className="p-1 text-green-400 hover:bg-green-500/20 rounded"><Printer size={16} /></button>
                      <button onClick={() => handleMarkAsPaid(inv.id)} className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded"><CheckCircle size={16} /></button>
                      <button onClick={() => handleDeleteInvoice(inv.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal اختيار عدد النسخ */}
      {showPrintOptions && selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">إعدادات الطباعة</h2>
              <button onClick={() => setShowPrintOptions(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-2">رقم الفاتورة</p>
                <p className="text-2xl font-bold text-blue-400">{selectedInvoice.invoiceNumber}</p>
                <p className="text-gray-400 text-sm mt-2">المريض: {selectedInvoice.patientName}</p>
              </div>
              
              <div className="text-center">
                <label className="block text-sm text-gray-400 mb-3">عدد النسخ المطلوبة</label>
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={() => setPrintCopies(Math.max(1, printCopies - 1))}
                    className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                  >
                    <Minus size={20} className="text-white" />
                  </button>
                  <div className="w-20 text-center">
                    <span className="text-3xl font-bold text-white">{printCopies}</span>
                    <p className="text-xs text-gray-400">نسخة</p>
                  </div>
                  <button 
                    onClick={() => setPrintCopies(Math.min(10, printCopies + 1))}
                    className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                  >
                    <Maximize size={20} className="text-white" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">الحد الأقصى 10 نسخ</p>
              </div>
              
              <div className="border-t border-gray-700 pt-4 mt-2">
                <div className="flex gap-3">
                  <button onClick={handlePrintWithCopies} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 flex items-center justify-center gap-2">
                    <Printer size={18} /> طباعة {printCopies} نسخة
                  </button>
                  <button onClick={() => setShowPrintOptions(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500">
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* باقي المودالات (اختصاراً) */}
      {showHospitalSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">بيانات المستشفى</h2><button onClick={() => setShowHospitalSettings(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>
            <div className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-3"><label className="block text-sm text-gray-400 mb-2">شعار المستشفى</label><div className="flex items-center gap-4">{hospitalInfo.logoPreview && <img src={hospitalInfo.logoPreview} alt="الشعار" className="w-20 h-20 object-contain border rounded p-1 bg-white" />}<label className="cursor-pointer bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2"><Upload size={18} /> رفع شعار</label><input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" /></div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm text-gray-400 mb-1">اسم المستشفى (عربي)</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={hospitalInfo.nameAr} onChange={(e) => handleHospitalInfoChange('nameAr', e.target.value)} /></div><div><label className="block text-sm text-gray-400 mb-1">العنوان</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={hospitalInfo.addressAr} onChange={(e) => handleHospitalInfoChange('addressAr', e.target.value)} /></div><div><label className="block text-sm text-gray-400 mb-1">رقم الهاتف</label><input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={hospitalInfo.phone} onChange={(e) => handleHospitalInfoChange('phone', e.target.value)} /></div><div><label className="block text-sm text-gray-400 mb-1">البريد الإلكتروني</label><input type="email" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={hospitalInfo.email} onChange={(e) => handleHospitalInfoChange('email', e.target.value)} /></div></div>
              <div className="flex gap-3 pt-4"><button onClick={() => setShowHospitalSettings(false)} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg">حفظ وإغلاق</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Modal إضافة فاتورة - مختصر */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">فاتورة جديدة</h2><button onClick={() => setShowInvoiceModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm text-gray-400 mb-1">المريض *</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientId} onChange={(e) => handleSelectPatient(e.target.value)}><option value="">اختر المريض</option>{patients.map(p => (<option key={p.id} value={p.id}>{currentLang === 'ar' ? p.nameAr : p.nameEn}</option>))}</select></div>
              <div className="flex gap-2"><div className="flex-1"><label className="block text-sm text-gray-400 mb-1">الطبيب *</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.doctorId} onChange={(e) => handleSelectDoctor(e.target.value)}><option value="">اختر الطبيب</option>{doctors.map(d => (<option key={d.id} value={d.id}>{currentLang === 'ar' ? d.nameAr : d.nameEn}</option>))}</select></div><button onClick={() => setShowAddDoctorModal(true)} className="mt-7 p-2 bg-green-500/20 text-green-400 rounded-lg"><UserPlus size={18} /></button></div>
              <div><label className="block text-sm text-gray-400 mb-1">العمر</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientAge} onChange={(e) => setFormData({...formData, patientAge: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">تاريخ العملية</label><input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.surgeryDate} onChange={(e) => setFormData({...formData, surgeryDate: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">التشخيص</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} /></div>
            </div>
            <div className="mb-4"><div className="flex justify-between items-center mb-2"><h3 className="text-white font-bold">الخدمات</h3><button onClick={handleAddItem} className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm"><Plus size={14} /> إضافة</button></div>
            {formData.items.map((item) => (<div key={item.id} className="grid grid-cols-12 gap-2 mb-2"><input type="text" className="col-span-5 p-2 bg-gray-700 rounded-lg text-white" placeholder="الخدمة" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} /><input type="number" className="col-span-2 p-2 bg-gray-700 rounded-lg text-white" placeholder="الكمية" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)} /><input type="number" className="col-span-3 p-2 bg-gray-700 rounded-lg text-white" placeholder="السعر" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} /><div className="col-span-1 text-white">{item.total.toFixed(2)}</div><button onClick={() => handleRemoveItem(item.id)} className="col-span-1 text-red-400"><Trash2 size={16} /></button></div>))}</div>
            <div className="grid grid-cols-2 gap-4 mb-4"><div><label className="block text-sm text-gray-400 mb-1">الخصم</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.discount} onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)} /></div><div><label className="block text-sm text-gray-400 mb-1">نوع الخصم</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})}><option value="percentage">نسبة مئوية</option><option value="fixed">قيمة ثابتة</option></select></div></div>
            <div className="bg-gray-700/30 p-3 rounded-lg mb-4"><div className="flex justify-between"><span className="text-gray-400">المجموع:</span><span className="text-white">{formData.subtotal.toFixed(2)} ر.س</span></div>{formData.discount > 0 && (<div className="flex justify-between"><span className="text-gray-400">الخصم:</span><span className="text-red-400">- {(formData.discountType === 'percentage' ? (formData.subtotal * formData.discount / 100) : formData.discount).toFixed(2)} ر.س</span></div>)}<div className="flex justify-between pt-2 border-t border-gray-600 mt-2"><span className="text-lg font-bold text-white">الإجمالي:</span><span className="text-xl font-bold text-green-400">{formData.total.toFixed(2)} ر.س</span></div></div>
            <div className="grid grid-cols-2 gap-4 mb-4"><div><label className="block text-sm text-gray-400 mb-1">حالة الدفع</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.paymentStatus} onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}><option value="unpaid">غير مدفوع</option><option value="paid">مدفوع</option></select></div><div><label className="block text-sm text-gray-400 mb-1">طريقة الدفع</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}><option value="cash">كاش</option><option value="card">بطاقة</option><option value="bank">تحويل</option></select></div></div>
            <div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">ملاحظات</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} /></div>
            <div className="flex gap-3 pt-4 border-t border-gray-700"><button onClick={handleSaveInvoice} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">حفظ</button><button onClick={() => setShowInvoiceModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div>
          </div>
        </div>
      )}

      {/* Modal إضافة طبيب */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">إضافة طبيب</h2><button onClick={() => setShowAddDoctorModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>
            <div className="space-y-3"><input type="text" placeholder="الاسم" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.nameAr} onChange={(e) => setNewDoctor({...newDoctor, nameAr: e.target.value})} /><input type="text" placeholder="التخصص" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.specializationAr} onChange={(e) => setNewDoctor({...newDoctor, specializationAr: e.target.value})} /><div className="flex gap-3 pt-4"><button onClick={handleAddDoctor} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">إضافة</button><button onClick={() => setShowAddDoctorModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div></div>
          </div>
        </div>
      )}
    </div>
  )
}
