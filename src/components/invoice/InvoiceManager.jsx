import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Printer, Plus, Trash2, Edit, Save, X, CheckCircle, User, Stethoscope, DollarSign, FileText, Calendar, Stamp, Building, UserPlus, Upload, Hospital, Settings, Minus, Maximize, ClipboardList, Syringe } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InvoiceManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language

  const [invoices, setInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showPrintOptions, setShowPrintOptions] = useState(false)
  const [showHospitalSettings, setShowHospitalSettings] = useState(false)
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false)
  const [newDoctor, setNewDoctor] = useState({ nameAr: '', nameEn: '', specializationAr: '', specializationEn: '' })
  const [printCopies, setPrintCopies] = useState(1)
  const [invoiceType, setInvoiceType] = useState('examination')

  const [hospitalInfo, setHospitalInfo] = useState({
    nameAr: 'مستشفى السلام الدولي',
    nameEn: 'Al Salam International Hospital',
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
    invoiceType: 'examination',
    procedureName: '',
    surgeryDate: '',
    diagnosis: '',
    items: [{ id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0,
    discount: 0,
    discountType: 'percentage',
    discountAmount: 0,
    total: 0,
    paidAmount: 0,
    remainingAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
    installmentMonths: 1,
    installmentAmount: 0,
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
      setPatients([])
    }
    setLoading(false)
  }

  const loadDoctors = () => {
    const saved = localStorage.getItem('mcsos_doctors')
    if (saved) {
      setDoctors(JSON.parse(saved))
    } else {
      setDoctors([])
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
    let discountAmount = 0
    if (data.discountType === 'percentage') {
      discountAmount = (subtotal * data.discount) / 100
    } else {
      discountAmount = data.discount
    }
    const total = subtotal - discountAmount
    let remainingAmount = total - (data.paidAmount || 0)
    let installmentAmount = 0
    if (data.paymentStatus === 'installment' && data.installmentMonths > 0) {
      installmentAmount = remainingAmount / data.installmentMonths
    }
    setFormData(prev => ({ 
      ...prev, 
      subtotal, 
      discountAmount,
      total,
      remainingAmount,
      installmentAmount
    }))
  }

  const handleDiscountChange = (value) => {
    const updatedForm = { ...formData, discount: parseFloat(value) || 0 }
    calculateTotals(updatedForm)
    setFormData(updatedForm)
  }

  const handlePaidAmountChange = (value) => {
    const paidAmount = parseFloat(value) || 0
    const updatedForm = { ...formData, paidAmount }
    calculateTotals(updatedForm)
    setFormData(updatedForm)
  }

  const handleInstallmentMonthsChange = (value) => {
    const months = parseInt(value) || 1
    const updatedForm = { ...formData, installmentMonths: months }
    calculateTotals(updatedForm)
    setFormData(updatedForm)
  }

  const handlePaymentStatusChange = (status) => {
    const updatedForm = { ...formData, paymentStatus: status }
    if (status === 'paid') {
      updatedForm.paidAmount = formData.total
      updatedForm.remainingAmount = 0
    } else if (status === 'unpaid') {
      updatedForm.paidAmount = 0
      updatedForm.remainingAmount = formData.total
    }
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
      invoiceType: invoiceType,
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
    setInvoiceType(invoice.invoiceType || 'examination')
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
    saveInvoices(invoices.map(i => i.id === id ? { ...i, paymentStatus: 'paid', paidAmount: i.total, remainingAmount: 0 } : i))
    toast.success('تم تحديث حالة الدفع إلى مدفوع')
  }

  const resetForm = () => {
    setSelectedInvoice(null)
    setInvoiceType('examination')
    setFormData({
      patientId: '', patientName: '', patientAge: '', patientPhone: '',
      doctorId: '', doctorName: '', doctorSpecialization: '',
      invoiceNumber: `INV-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      invoiceType: 'examination',
      procedureName: '',
      surgeryDate: '', diagnosis: '',
      items: [{ id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }],
      subtotal: 0, discount: 0, discountType: 'percentage', discountAmount: 0, total: 0,
      paidAmount: 0, remainingAmount: 0,
      paymentMethod: 'cash', paymentStatus: 'unpaid',
      installmentMonths: 1, installmentAmount: 0,
      notes: ''
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
    const invoiceTypeText = invoice.invoiceType === 'surgery' ? 'عملية جراحية' : 'كشف طبي'
    const invoiceTypeIcon = invoice.invoiceType === 'surgery' ? '🔪' : '🩺'
    
    const discountAmountDisplay = invoice.discountType === 'percentage' 
      ? (invoice.subtotal * invoice.discount / 100).toFixed(2)
      : invoice.discount.toFixed(2)
    
    const getPaymentStatusText = (status) => {
      switch(status) {
        case 'paid': return 'مدفوع بالكامل ✅'
        case 'installment': return 'دفع بالتقسيط 📅'
        default: return 'غير مدفوع ❌'
      }
    }
    
    const getPaymentMethodText = (method) => {
      switch(method) {
        case 'cash': return 'كاش'
        case 'card': return 'بطاقة ائتمان'
        case 'bank': return 'تحويل بنكي'
        default: return method
      }
    }
    
    return `
      <!DOCTYPE html>
      <html dir="${isRTLPrint}" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة طبية - ${invoice.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Cairo', 'Segoe UI', Arial, sans-serif; background: #fff; padding: 8px; font-size: 11px; }
          .invoice-container { max-width: 800px; margin: 0 auto; background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #1e3a5f, #2563eb); color: white; padding: 10px 12px; }
          .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
          .logo-area { display: flex; align-items: center; gap: 8px; }
          .logo-img { width: 45px; height: 45px; object-fit: contain; background: white; border-radius: 8px; padding: 3px; }
          .hospital-name { font-size: 14px; font-weight: bold; }
          .hospital-details { font-size: 9px; opacity: 0.9; }
          .invoice-box { background: rgba(255,255,255,0.15); border-radius: 6px; padding: 5px 12px; text-align: center; }
          .invoice-title { font-size: 10px; }
          .invoice-num { font-size: 14px; font-weight: bold; }
          .copy-badge { background: #ff9800; padding: 1px 6px; border-radius: 15px; font-size: 9px; margin-top: 3px; }
          .type-badge { background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 20px; font-size: 10px; display: inline-block; margin-top: 4px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px 12px; background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
          .info-item { display: flex; justify-content: space-between; font-size: 10px; padding: 2px 0; }
          .info-label { font-weight: 600; color: #4b5563; }
          .services-table { width: 100%; border-collapse: collapse; font-size: 10px; }
          .services-table th, .services-table td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: ${isRTLPrint ? 'right' : 'left'}; }
          .services-table th { background: #f3f4f6; font-weight: 600; }
          .totals { padding: 8px 12px; background: #f8fafc; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; }
          .totals-box { width: 280px; }
          .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
          .total-row-border { border-top: 1px solid #d1d5db; padding-top: 6px; margin-top: 4px; }
          .final-total { font-size: 14px; font-weight: bold; color: #2563eb; }
          .payment-notes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px 12px; background: #fff; border-top: 1px solid #e5e7eb; }
          .payment-box, .notes-box { font-size: 10px; }
          .box-title { font-weight: 600; color: #1e3a5f; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; margin-bottom: 5px; font-size: 10px; }
          .installment-details { background: #e0f2fe; padding: 6px; border-radius: 6px; margin-top: 5px; font-size: 9px; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 10px 12px; text-align: center; border-top: 1px solid #e5e7eb; background: #f8fafc; }
          .sign-line { border-top: 1px solid #9ca3af; width: 140px; margin: 5px auto 0; }
          .footer { text-align: center; padding: 8px; background: #f8fafc; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 8px; }
          @media print { body { padding: 0; margin: 0; } .invoice-container { border: none; } }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="header-content">
              <div class="logo-area">
                ${invoice.hospitalLogo ? `<img src="${invoice.hospitalLogo}" class="logo-img" alt="شعار المستشفى">` : '<div class="logo-img" style="background:white;display:flex;align-items:center;justify-content:center"><span style="font-size:22px">🏥</span></div>'}
                <div>
                  <div class="hospital-name">${invoice.hospitalName || hospitalInfo.nameAr}</div>
                  <div class="hospital-details">${invoice.hospitalAddress || hospitalInfo.addressAr}</div>
                  <div class="hospital-details">هاتف: ${invoice.hospitalPhone || hospitalInfo.phone}</div>
                </div>
              </div>
              <div class="invoice-box">
                <div class="invoice-title">فاتورة طبية</div>
                <div class="invoice-num">${invoice.invoiceNumber}</div>
                <div class="type-badge">${invoiceTypeIcon} ${invoiceTypeText}</div>
                ${totalCopies > 1 ? `<div class="copy-badge">نسخة ${copyNumber}/${totalCopies}</div>` : ''}
              </div>
            </div>
          </div>
          
          <div class="info-grid">
            <div>
              <div class="info-item"><span class="info-label">المريض:</span><span>${invoice.patientName}</span></div>
              <div class="info-item"><span class="info-label">العمر:</span><span>${invoice.patientAge} سنة</span></div>
              <div class="info-item"><span class="info-label">الجوال:</span><span>${invoice.patientPhone || '-'}</span></div>
              <div class="info-item"><span class="info-label">التاريخ:</span><span>${invoice.invoiceDate}</span></div>
            </div>
            <div>
              <div class="info-item"><span class="info-label">الطبيب:</span><span>${invoice.doctorName}</span></div>
              ${invoice.doctorSpecialization ? `<div class="info-item"><span class="info-label">التخصص:</span><span>${invoice.doctorSpecialization}</span></div>` : ''}
              <div class="info-item"><span class="info-label">تاريخ العملية:</span><span>${invoice.surgeryDate || '-'}</span></div>
              ${invoice.procedureName ? `<div class="info-item"><span class="info-label">نوع العملية:</span><span>${invoice.procedureName}</span></div>` : ''}
            </div>
          </div>
          
          ${invoice.diagnosis ? `
          <div style="padding: 6px 12px; background: #fef3c7; border-bottom: 1px solid #e5e7eb">
            <div class="info-label" style="margin-bottom:3px">التشخيص:</div>
            <div style="font-size:10px">${invoice.diagnosis}</div>
          </div>` : ''}
          
          <table class="services-table">
            <thead>
              <tr>
                <th style="width:5%">#</th>
                <th style="width:45%">الخدمة</th>
                <th style="width:15%">الكمية</th>
                <th style="width:17%">السعر</th>
                <th style="width:18%">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((item, idx) => `
              <tr>
                <td style="text-align:center">${idx+1}</td>
                <td>${item.description || '-'}</td>
                <td style="text-align:center">${item.quantity}</td>
                <td style="text-align:center">${item.unitPrice.toFixed(2)}</td>
                <td style="text-align:center">${item.total.toFixed(2)}</td>
               </tr>`).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="totals-box">
              <div class="total-row"><span>المجموع الفرعي:</span><span>${invoice.subtotal.toFixed(2)}</span></div>
              ${invoice.discount > 0 ? `<div class="total-row"><span>الخصم (${invoice.discount}${invoice.discountType === 'percentage' ? '%' : ''}):</span><span style="color:red">- ${discountAmountDisplay}</span></div>` : ''}
              <div class="total-row"><span>المبلغ المدفوع:</span><span>${(invoice.paidAmount || 0).toFixed(2)}</span></div>
              <div class="total-row"><span>المبلغ المتبقي:</span><span>${(invoice.remainingAmount || invoice.total).toFixed(2)}</span></div>
              <div class="total-row total-row-border"><span class="final-total">الإجمالي النهائي:</span><span class="final-total">${invoice.total.toFixed(2)}</span></div>
            </div>
          </div>
          
          <div class="payment-notes">
            <div class="payment-box">
              <div class="box-title">معلومات الدفع</div>
              <div class="info-item"><span>الحالة:</span><span>${getPaymentStatusText(invoice.paymentStatus)}</span></div>
              <div class="info-item"><span>الطريقة:</span><span>${getPaymentMethodText(invoice.paymentMethod)}</span></div>
              ${invoice.paymentStatus === 'installment' && invoice.installmentMonths > 0 ? `
              <div class="installment-details">
                <div>📅 تقسيط على ${invoice.installmentMonths} أشهر</div>
                <div>💵 القسط الشهري: ${(invoice.total / invoice.installmentMonths).toFixed(2)}</div>
              </div>` : ''}
            </div>
            <div class="notes-box">
              <div class="box-title">ملاحظات</div>
              <div style="font-size:10px">${invoice.notes || 'لا توجد ملاحظات'}</div>
            </div>
          </div>
          
          <div class="signatures">
            <div><div class="sign-line"></div><p style="margin-top:4px; font-size:9px">توقيع المريض</p></div>
            <div><div class="sign-line"></div><p style="margin-top:4px; font-size:9px">توقيع الطبيب</p></div>
          </div>
          
          <div class="footer">
            <p>شكراً لثقتكم بنا - نتمنى لكم دوام الصحة والعافية</p>
            <p style="margin-top:2px">MCSOS - نظام المركز الطبي</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  const getPaymentStatusBadge = (status) => {
    switch(status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">مدفوع</span>
      case 'installment':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs border border-blue-500/30">تقسيط</span>
      default:
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs border border-yellow-500/30">غير مدفوع</span>
    }
  }

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

      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50"><h2 className="text-xl font-bold text-white">قائمة الفواتير</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80"><tr className={`${isRTL ? 'text-right' : 'text-left'}`}><th className="px-6 py-3 text-sm text-gray-300">الرقم</th><th className="px-6 py-3 text-sm text-gray-300">النوع</th><th className="px-6 py-3 text-sm text-gray-300">المريض</th><th className="px-6 py-3 text-sm text-gray-300">الطبيب</th><th className="px-6 py-3 text-sm text-gray-300">التاريخ</th><th className="px-6 py-3 text-sm text-gray-300">الإجمالي</th><th className="px-6 py-3 text-sm text-gray-300">الحالة</th><th className="px-6 py-3 text-sm text-gray-300">إجراءات</th></tr></thead>
            <tbody className="divide-y divide-gray-700/50">
              {invoices.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-400">لا توجد فواتير</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 text-blue-400 font-mono text-sm">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-600 rounded-full text-xs">{inv.invoiceType === 'surgery' ? 'عملية' : 'كشف'}</span></td>
                    <td className="px-6 py-4"><div className="font-semibold text-white">{inv.patientName}</div><div className="text-sm text-gray-400">{inv.patientAge} سنة</div></td>
                    <td className="px-6 py-4 text-gray-300">{inv.doctorName}</td>
                    <td className="px-6 py-4 text-gray-400">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-green-400">{inv.total.toFixed(2)}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPrintOptions && selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">إعدادات الطباعة</h2><button onClick={() => setShowPrintOptions(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>
            <div className="space-y-6">
              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-2">رقم الفاتورة</p>
                <p className="text-2xl font-bold text-blue-400">{selectedInvoice.invoiceNumber}</p>
                <p className="text-gray-400 text-sm mt-2">المريض: {selectedInvoice.patientName}</p>
                <p className="text-gray-400 text-sm">النوع: {selectedInvoice.invoiceType === 'surgery' ? 'عملية جراحية' : 'كشف طبي'}</p>
                <p className="text-gray-400 text-sm">الإجمالي: {selectedInvoice.total.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <label className="block text-sm text-gray-400 mb-3">عدد النسخ المطلوبة</label>
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => setPrintCopies(Math.max(1, printCopies - 1))} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"><Minus size={20} className="text-white" /></button>
                  <div className="w-20 text-center"><span className="text-3xl font-bold text-white">{printCopies}</span><p className="text-xs text-gray-400">نسخة</p></div>
                  <button onClick={() => setPrintCopies(Math.min(10, printCopies + 1))} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"><Maximize size={20} className="text-white" /></button>
                </div>
                <p className="text-xs text-gray-500 mt-3">الحد الأقصى 10 نسخ</p>
              </div>
              <div className="border-t border-gray-700 pt-4"><div className="flex gap-3"><button onClick={handlePrintWithCopies} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg flex items-center justify-center gap-2"><Printer size={18} /> طباعة {printCopies} نسخة</button><button onClick={() => setShowPrintOptions(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div></div>
            </div>
          </div>
        </div>
      )}

      {showHospitalSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">بيانات المستشفى</h2><button onClick={() => setShowHospitalSettings(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>
            <div className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-3"><label className="block text-sm text-gray-400 mb-2">شعار المستشفى</label><div className="flex items-center gap-4">{hospitalInfo.logoPreview && <img src={hospitalInfo.logoPreview} alt="الشعار" className="w-20 h-20 object-contain border rounded p-1 bg-white" />}<label className="cursor-pointer bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2"><Upload size={18} /> رفع شعار</label><input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" /></div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm text-gray-400 mb-1">اسم المستشفى</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={hospitalInfo.nameAr} onChange={(e) => handleHospitalInfoChange('nameAr', e.target.value)} /></div><div><label className="block text-sm text-gray-400 mb-1">العنوان</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={hospitalInfo.addressAr} onChange={(e) => handleHospitalInfoChange('addressAr', e.target.value)} /></div><div><label className="block text-sm text-gray-400 mb-1">رقم الهاتف</label><input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={hospitalInfo.phone} onChange={(e) => handleHospitalInfoChange('phone', e.target.value)} /></div><div><label className="block text-sm text-gray-400 mb-1">البريد الإلكتروني</label><input type="email" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={hospitalInfo.email} onChange={(e) => handleHospitalInfoChange('email', e.target.value)} /></div></div>
              <div className="flex gap-3 pt-4"><button onClick={() => setShowHospitalSettings(false)} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg">حفظ وإغلاق</button></div>
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">فاتورة جديدة</h2><button onClick={() => setShowInvoiceModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>
            
            <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
              <label className="block text-sm text-gray-400 mb-2">نوع الفاتورة</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="invoiceType" value="examination" checked={invoiceType === 'examination'} onChange={(e) => setInvoiceType(e.target.value)} className="w-4 h-4" /><span className="text-white flex items-center gap-1"><ClipboardList size={16} /> كشف طبي</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="invoiceType" value="surgery" checked={invoiceType === 'surgery'} onChange={(e) => setInvoiceType(e.target.value)} className="w-4 h-4" /><span className="text-white flex items-center gap-1"><Syringe size={16} /> عملية جراحية</span></label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm text-gray-400 mb-1">المريض *</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientId} onChange={(e) => handleSelectPatient(e.target.value)}><option value="">اختر المريض</option>{patients.map(p => (<option key={p.id} value={p.id}>{currentLang === 'ar' ? p.nameAr : p.nameEn}</option>))}</select></div>
              <div className="flex gap-2"><div className="flex-1"><label className="block text-sm text-gray-400 mb-1">الطبيب *</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.doctorId} onChange={(e) => handleSelectDoctor(e.target.value)}><option value="">اختر الطبيب</option>{doctors.map(d => (<option key={d.id} value={d.id}>{currentLang === 'ar' ? d.nameAr : d.nameEn}</option>))}</select></div><button onClick={() => setShowAddDoctorModal(true)} className="mt-7 p-2 bg-green-500/20 text-green-400 rounded-lg"><UserPlus size={18} /></button></div>
              <div><label className="block text-sm text-gray-400 mb-1">العمر</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientAge} onChange={(e) => setFormData({...formData, patientAge: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">{invoiceType === 'surgery' ? 'تاريخ العملية' : 'تاريخ الكشف'}</label><input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.surgeryDate} onChange={(e) => setFormData({...formData, surgeryDate: e.target.value})} /></div>
              {invoiceType === 'surgery' && (<div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">اسم العملية</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" placeholder="مثال: عملية تنظير الركبة" value={formData.procedureName} onChange={(e) => setFormData({...formData, procedureName: e.target.value})} /></div>)}
              <div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">التشخيص</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} /></div>
            </div>

            <div className="mb-4"><div className="flex justify-between items-center mb-2"><h3 className="text-white font-bold">الخدمات</h3><button onClick={handleAddItem} className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm"><Plus size={14} /> إضافة خدمة</button></div>
            {formData.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 mb-2">
                <input type="text" className="col-span-5 p-2 bg-gray-700 rounded-lg text-white" placeholder="الخدمة" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} />
                <input type="number" className="col-span-2 p-2 bg-gray-700 rounded-lg text-white" placeholder="الكمية" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)} />
                <input type="number" className="col-span-3 p-2 bg-gray-700 rounded-lg text-white" placeholder="السعر" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} />
                <div className="col-span-1 text-white text-center">{item.total.toFixed(2)}</div>
                <button onClick={() => handleRemoveItem(item.id)} className="col-span-1 text-red-400"><Trash2 size={16} /></button>
              </div>
            ))}</div>

            <div className="grid grid-cols-2 gap-4 mb-4"><div><label className="block text-sm text-gray-400 mb-1">الخصم</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.discount} onChange={(e) => handleDiscountChange(e.target.value)} /></div><div><label className="block text-sm text-gray-400 mb-1">نوع الخصم</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.discountType} onChange={(e) => { setFormData({...formData, discountType: e.target.value}); calculateTotals({...formData, discountType: e.target.value}); }}><option value="percentage">نسبة مئوية %</option><option value="fixed">قيمة ثابتة</option></select></div></div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm text-gray-400 mb-1">حالة الدفع</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.paymentStatus} onChange={(e) => handlePaymentStatusChange(e.target.value)}>
                <option value="unpaid">غير مدفوع</option>
                <option value="paid">مدفوع بالكامل</option>
                <option value="installment">دفع بالتقسيط</option>
              </select></div>
              <div><label className="block text-sm text-gray-400 mb-1">طريقة الدفع</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}>
                <option value="cash">كاش</option>
                <option value="card">بطاقة ائتمان</option>
                <option value="bank">تحويل بنكي</option>
              </select></div>
            </div>

            {formData.paymentStatus === 'installment' && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                <h4 className="text-blue-400 font-bold text-sm mb-2">📅 تفاصيل التقسيط</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm text-gray-400 mb-1">عدد الأشهر</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.installmentMonths} onChange={(e) => handleInstallmentMonthsChange(e.target.value)} min="1" max="24" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">القسط الشهري</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-gray-300" value={formData.installmentAmount.toFixed(2)} disabled readOnly /></div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm text-gray-400 mb-1">المبلغ المدفوع</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.paidAmount} onChange={(e) => handlePaidAmountChange(e.target.value)} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">المبلغ المتبقي</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-gray-300" value={formData.remainingAmount.toFixed(2)} disabled readOnly /></div>
            </div>

            <div className="bg-gray-700/30 p-3 rounded-lg mb-4">
              <div className="flex justify-between items-center py-1"><span className="text-gray-400">مجموع الخدمات:</span><span className="text-white font-semibold">{formData.subtotal.toFixed(2)}</span></div>
              {formData.discount > 0 && (<div className="flex justify-between items-center py-1"><span className="text-gray-400">الخصم ({formData.discount}{formData.discountType === 'percentage' ? '%' : ''}):</span><span className="text-red-400">- {formData.discountAmount.toFixed(2)}</span></div>)}
              <div className="flex justify-between items-center py-2 mt-2 border-t border-gray-600"><span className="text-lg font-bold text-white">الإجمالي النهائي:</span><span className="text-xl font-bold text-green-400">{formData.total.toFixed(2)}</span></div>
            </div>

            <div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">ملاحظات إضافية</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} /></div>

            <div className="flex gap-3 pt-4 border-t border-gray-700"><button onClick={handleSaveInvoice} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30">حفظ الفاتورة</button><button onClick={() => setShowInvoiceModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500">إلغاء</button></div>
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
    </div>
  )
}
