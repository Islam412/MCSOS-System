import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Printer, Plus, Trash2, Edit, Save, X, CheckCircle, User, Stethoscope, DollarSign, FileText, Calendar, Stamp, Building, UserPlus, Upload, Hospital, Settings, Minus, Maximize, ClipboardList, Syringe } from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { invoicesService, patientsService, doctorsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

// ========== مفاتيح التخزين في localStorage ==========
const STORAGE_KEYS = {
  INVOICES: 'mcsos_invoices_v2',
  PATIENTS: 'mcsos_patients_v2',
  DOCTORS: 'mcsos_doctors_v2',
  HOSPITAL_INFO: 'mcsos_hospital_info_v2'
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

export default function InvoiceManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language

  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [hospitalInfo, setHospitalInfo] = useState({
    nameAr: 'مستشفى السلام الدولي',
    nameEn: 'Al Salam International Hospital',
    addressAr: 'شارع الملك عبدالعزيز، الرياض',
    addressEn: 'King Abdulaziz Road, Riyadh',
    phone: '+966 12 345 6788',
    email: 'info@alsalamhospital.com',
    logo: null,
    logoPreview: null
  })

  const [formData, setFormData] = useState({
    patientId: '', patientName: '', patientAge: '', patientPhone: '',
    doctorId: '', doctorName: '', doctorSpecialization: '',
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
    downPayment: 0,
    remainingAfterDown: 0,
    interestRate: 0,
    interestAmount: 0,
    totalWithInterest: 0,
    installmentMonths: 1,
    monthlyInstallment: 0,
    paidAmount: 0,
    remainingAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
    notes: ''
  })

  // ========== تحميل البيانات من API ==========
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    await Promise.all([
      loadPatients(),
      loadInvoices(),
      loadDoctors(),
      loadHospitalInfo()
    ])
    setLoading(false)
  }

  // ========== تحميل المرضى من API ==========
  const loadPatients = async () => {
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => patientsService.getPatients(),
          'patients',
          getLocalData(STORAGE_KEYS.PATIENTS)
        )
        const data = response?.patients || response || []
        setPatients(data)
        localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(data))
      } else {
        const saved = getLocalData(STORAGE_KEYS.PATIENTS)
        setPatients(saved || [])
      }
    } catch (error) {
      console.error('Error loading patients:', error)
      toast.error('حدث خطأ في تحميل المرضى')
      const saved = getLocalData(STORAGE_KEYS.PATIENTS)
      setPatients(saved || [])
    }
  }

  // ========== تحميل الأطباء من API ==========
  const loadDoctors = async () => {
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => doctorsService.getDoctors(),
          'doctors',
          getLocalData(STORAGE_KEYS.DOCTORS)
        )
        const data = response?.doctors || response || []
        setDoctors(data)
        localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(data))
      } else {
        const saved = getLocalData(STORAGE_KEYS.DOCTORS)
        setDoctors(saved || [])
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
      toast.error('حدث خطأ في تحميل الأطباء')
      const saved = getLocalData(STORAGE_KEYS.DOCTORS)
      setDoctors(saved || [])
    }
  }

  // ========== تحميل الفواتير من API ==========
  const loadInvoices = async () => {
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => invoicesService.getInvoices(),
          'invoices',
          getLocalData(STORAGE_KEYS.INVOICES)
        )
        const data = response?.invoices || response || []
        setInvoices(data)
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(data))
      } else {
        const saved = getLocalData(STORAGE_KEYS.INVOICES)
        setInvoices(saved || [])
      }
    } catch (error) {
      console.error('Error loading invoices:', error)
      toast.error('حدث خطأ في تحميل الفواتير')
      const saved = getLocalData(STORAGE_KEYS.INVOICES)
      setInvoices(saved || [])
    }
  }

  // ========== تحميل معلومات المستشفى ==========
  const loadHospitalInfo = () => {
    const saved = getLocalData(STORAGE_KEYS.HOSPITAL_INFO)
    if (saved) {
      setHospitalInfo(saved)
    } else {
      localStorage.setItem(STORAGE_KEYS.HOSPITAL_INFO, JSON.stringify(hospitalInfo))
    }
  }

  // ========== حفظ الفواتير (محلي + API) ==========
  const saveInvoices = (data) => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(data))
    setInvoices(data)

    // مزامنة العناصر المعلقة مع الخادم
    if (isOnline) {
      const pending = data.filter(item => item._syncPending)
      pending.forEach(async (item) => {
        try {
          await invoicesService.createInvoice(item)
          const synced = data.map(i =>
            i.id === item.id ? { ...i, _syncPending: false } : i
          )
          localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(synced))
          setInvoices(synced)
        } catch (error) {
          console.warn('Failed to sync invoice:', error)
        }
      })
    }
  }

  // ========== حفظ الأطباء (محلي + API) ==========
  const saveDoctors = (data) => {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(data))
    setDoctors(data)

    if (isOnline) {
      data.forEach(async (doctor) => {
        if (doctor._syncPending) {
          try {
            await doctorsService.createDoctor(doctor)
            const synced = data.map(d =>
              d.id === doctor.id ? { ...d, _syncPending: false } : d
            )
            localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(synced))
            setDoctors(synced)
          } catch (error) {
            console.warn('Failed to sync doctor:', error)
          }
        }
      })
    }
  }

  // ========== حفظ معلومات المستشفى ==========
  const saveHospitalInfo = (data) => {
    localStorage.setItem(STORAGE_KEYS.HOSPITAL_INFO, JSON.stringify(data))
    setHospitalInfo(data)
  }

  // ========== رفع شعار المستشفى ==========
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

  // ========== إضافة طبيب جديد ==========
  const handleAddDoctor = async () => {
    if (!newDoctor.nameAr || !newDoctor.specializationAr) {
      toast.error('الرجاء إدخال اسم الطبيب والتخصص')
      return
    }

    try {
      const doctorData = {
        nameAr: newDoctor.nameAr,
        nameEn: newDoctor.nameEn || newDoctor.nameAr,
        specializationAr: newDoctor.specializationAr,
        specializationEn: newDoctor.specializationEn || newDoctor.specializationAr
      }

      let newDoctorData
      if (isOnline) {
        try {
          const response = await doctorsService.createDoctor(doctorData)
          newDoctorData = response?.doctor || response
        } catch (apiError) {
          console.warn('API create failed, saving locally:', apiError)
          newDoctorData = { ...doctorData, id: Date.now(), _syncPending: true }
        }
      } else {
        newDoctorData = { ...doctorData, id: Date.now(), _syncPending: true }
      }

      saveDoctors([...doctors, newDoctorData])
      setShowAddDoctorModal(false)
      setNewDoctor({ nameAr: '', nameEn: '', specializationAr: '', specializationEn: '' })
      toast.success('تم إضافة الطبيب بنجاح')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في إضافة الطبيب')
    }
  }

  // ========== اختيار مريض ==========
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

  // ========== اختيار طبيب ==========
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

  // ========== إدارة العناصر (الخدمات) ==========
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
          const qty = parseFloat(updated.quantity) || 0
          const price = parseFloat(updated.unitPrice) || 0
          updated.total = qty * price
        }
        return updated
      }
      return item
    })
    const updatedForm = { ...formData, items: newItems }
    calculateTotals(updatedForm)
    setFormData(updatedForm)
  }

  // ========== حساب الإجماليات ==========
  const calculateTotals = (data) => {
    let subtotal = 0
    for (const item of data.items) {
      const qty = parseFloat(item.quantity) || 0
      const price = parseFloat(item.unitPrice) || 0
      subtotal += qty * price
    }
    
    let discountAmount = 0
    const discount = parseFloat(data.discount) || 0
    if (data.discountType === 'percentage') {
      discountAmount = (subtotal * discount) / 100
    } else {
      discountAmount = discount
    }
    
    const total = subtotal - discountAmount
    const downPayment = parseFloat(data.downPayment) || 0
    let remainingAfterDown = total - downPayment
    if (remainingAfterDown < 0) remainingAfterDown = 0
    
    const interestRate = parseFloat(data.interestRate) || 0
    const interestAmount = (remainingAfterDown * interestRate) / 100
    const totalWithInterest = remainingAfterDown + interestAmount
    
    let monthlyInstallment = 0
    const installmentMonths = parseInt(data.installmentMonths) || 1
    if (data.paymentStatus === 'installment' && installmentMonths > 0 && totalWithInterest > 0) {
      monthlyInstallment = totalWithInterest / installmentMonths
    }
    
    const paidAmount = parseFloat(data.paidAmount) || 0
    let remainingAmount = totalWithInterest - paidAmount
    if (remainingAmount < 0) remainingAmount = 0
    
    setFormData(prev => ({ 
      ...prev, 
      subtotal, 
      discountAmount,
      total,
      remainingAfterDown,
      interestAmount,
      totalWithInterest,
      monthlyInstallment,
      remainingAmount
    }))
  }

  // ========== دوال تغيير القيم ==========
  const handleDiscountChange = (value) => {
    const updatedForm = { ...formData, discount: parseFloat(value) || 0 }
    calculateTotals(updatedForm)
    setFormData(updatedForm)
  }

  const handleDownPaymentChange = (value) => {
    const updatedForm = { ...formData, downPayment: parseFloat(value) || 0 }
    calculateTotals(updatedForm)
    setFormData(updatedForm)
  }

  const handleInterestRateChange = (value) => {
    const updatedForm = { ...formData, interestRate: parseFloat(value) || 0 }
    calculateTotals(updatedForm)
    setFormData(updatedForm)
  }

  const handleInstallmentMonthsChange = (value) => {
    const updatedForm = { ...formData, installmentMonths: parseInt(value) || 1 }
    calculateTotals(updatedForm)
    setFormData(updatedForm)
  }

  const handlePaidAmountChange = (value) => {
    const updatedForm = { ...formData, paidAmount: parseFloat(value) || 0 }
    calculateTotals(updatedForm)
    setFormData(updatedForm)
  }

  const handlePaymentStatusChange = (status) => {
    const updatedForm = { ...formData, paymentStatus: status }
    if (status === 'paid') {
      updatedForm.paidAmount = formData.totalWithInterest
      updatedForm.remainingAmount = 0
    } else if (status === 'unpaid') {
      updatedForm.paidAmount = 0
      updatedForm.remainingAmount = formData.totalWithInterest
    }
    calculateTotals(updatedForm)
    setFormData(updatedForm)
  }

  // ========== حفظ الفاتورة ==========
  const handleSaveInvoice = async () => {
    if (!formData.patientName || !formData.doctorName || formData.items.length === 0) {
      toast.error('الرجاء إدخال بيانات المريض والطبيب وإضافة خدمة')
      return
    }

    setIsSubmitting(true)
    try {
      calculateTotals(formData)
      
      const invoiceData = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        patientAge: parseInt(formData.patientAge) || 0,
        patientPhone: formData.patientPhone || '',
        doctorId: formData.doctorId,
        doctorName: formData.doctorName,
        doctorSpecialization: formData.doctorSpecialization || '',
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        invoiceType: invoiceType,
        procedureName: formData.procedureName || '',
        surgeryDate: formData.surgeryDate || '',
        diagnosis: formData.diagnosis || '',
        items: formData.items.filter(item => item.description),
        subtotal: formData.subtotal,
        discount: formData.discount || 0,
        discountType: formData.discountType || 'percentage',
        total: formData.total,
        downPayment: formData.downPayment || 0,
        interestRate: formData.interestRate || 0,
        installmentMonths: formData.installmentMonths || 1,
        paidAmount: formData.paidAmount || 0,
        remainingAmount: formData.remainingAmount || 0,
        paymentMethod: formData.paymentMethod || 'cash',
        paymentStatus: formData.paymentStatus || 'unpaid',
        notes: formData.notes || ''
      }

      let response
      if (isOnline) {
        try {
          if (selectedInvoice) {
            response = await invoicesService.updateInvoice(selectedInvoice.id, invoiceData)
          } else {
            response = await invoicesService.createInvoice(invoiceData)
          }
        } catch (apiError) {
          console.warn('API save failed, saving locally:', apiError)
        }
      }

      const newInvoice = {
        id: selectedInvoice?.id || Date.now(),
        ...invoiceData,
        hospitalName: hospitalInfo.nameAr,
        hospitalAddress: hospitalInfo.addressAr,
        hospitalPhone: hospitalInfo.phone,
        hospitalLogo: hospitalInfo.logoPreview,
        createdAt: selectedInvoice?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _syncPending: !isOnline
      }

      const updatedInvoices = selectedInvoice
        ? invoices.map(i => i.id === selectedInvoice.id ? newInvoice : i)
        : [newInvoice, ...invoices]
      
      saveInvoices(updatedInvoices)
      setShowInvoiceModal(false)
      resetForm()
      toast.success(selectedInvoice ? 'تم تحديث الفاتورة' : 'تم إضافة الفاتورة')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حفظ الفاتورة')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== تعديل فاتورة ==========
  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setInvoiceType(invoice.invoiceType || 'examination')
    setFormData({ ...invoice })
    setShowInvoiceModal(true)
  }

  // ========== حذف فاتورة ==========
  const handleDeleteInvoice = async (id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    
    try {
      if (isOnline) {
        try {
          await invoicesService.deleteInvoice(id)
        } catch (apiError) {
          console.warn('API delete failed, removing locally:', apiError)
        }
      }
      const updated = invoices.filter(i => i.id !== id)
      saveInvoices(updated)
      toast.success('تم حذف الفاتورة')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حذف الفاتورة')
    }
  }

  // ========== تحديث حالة الدفع ==========
  const handleMarkAsPaid = async (id) => {
    try {
      if (isOnline) {
        try {
          await invoicesService.markAsPaid(id)
        } catch (apiError) {
          console.warn('API mark as paid failed, updating locally:', apiError)
        }
      }
      const updated = invoices.map(i => 
        i.id === id ? { ...i, paymentStatus: 'paid', paidAmount: i.totalWithInterest || i.total, remainingAmount: 0, _syncPending: !isOnline } : i
      )
      saveInvoices(updated)
      toast.success('تم تحديث حالة الدفع إلى مدفوع')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تحديث حالة الدفع')
    }
  }

  // ========== إعادة تعيين النموذج ==========
  const resetForm = () => {
    setSelectedInvoice(null)
    setInvoiceType('examination')
    setFormData({
      patientId: '', patientName: '', patientAge: '', patientPhone: '',
      doctorId: '', doctorName: '', doctorSpecialization: '',
      invoiceNumber: `INV-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      invoiceType: 'examination',
      procedureName: '', surgeryDate: '', diagnosis: '',
      items: [{ id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }],
      subtotal: 0, discount: 0, discountType: 'percentage', discountAmount: 0, total: 0,
      downPayment: 0, remainingAfterDown: 0,
      interestRate: 0, interestAmount: 0, totalWithInterest: 0,
      installmentMonths: 1, monthlyInstallment: 0,
      paidAmount: 0, remainingAmount: 0,
      paymentMethod: 'cash', paymentStatus: 'unpaid',
      notes: ''
    })
  }

  // ========== خيارات الطباعة ==========
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
      }, i * 200)
    }
    toast.success(`جاري طباعة ${printCopies} نسخة`)
  }

  // ========== HTML الطباعة ==========
  const getPrintHTML = (invoice, copyNumber, totalCopies) => {
    const isRTLPrint = isRTL ? 'rtl' : 'ltr'
    const invoiceTypeText = invoice.invoiceType === 'surgery' ? 'عملية جراحية' : 'كشف طبي'
    const invoiceTypeIcon = invoice.invoiceType === 'surgery' ? '🔪' : '🩺'
    
    let subtotal = 0
    for (const item of invoice.items) {
      const qty = parseFloat(item.quantity) || 0
      const price = parseFloat(item.unitPrice) || 0
      subtotal += qty * price
    }
    
    const discountAmount = invoice.discountType === 'percentage' 
      ? (subtotal * (invoice.discount || 0) / 100)
      : (invoice.discount || 0)
    const total = subtotal - discountAmount
    const downPayment = invoice.downPayment || 0
    const remainingAfterDown = total - downPayment
    const interestAmount = (remainingAfterDown * (invoice.interestRate || 0)) / 100
    const totalWithInterest = remainingAfterDown + interestAmount
    const paidAmount = invoice.paidAmount || 0
    const remainingAmount = totalWithInterest - paidAmount
    const monthlyInstallment = (invoice.paymentStatus === 'installment' && invoice.installmentMonths > 0 && totalWithInterest > 0)
      ? (totalWithInterest / invoice.installmentMonths).toFixed(2)
      : '0.00'
    
    const getPaymentStatusText = (status) => {
      switch(status) {
        case 'paid': return 'مدفوع بالكامل ✅'
        case 'installment': return `تقسيط ${invoice.installmentMonths} شهر`
        default: return 'غير مدفوع ❌'
      }
    }
    
    const getPaymentMethodText = (method) => {
      switch(method) {
        case 'cash': return 'كاش'
        case 'card': return 'بطاقة'
        case 'bank': return 'تحويل'
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
          *{margin:0;padding:0;box-sizing:border-box;}
          body{font-family:'Cairo',Arial,sans-serif;background:#e0e0e0;padding:10px;display:flex;justify-content:center;min-height:100vh;}
          .invoice{max-width:650px;width:100%;background:white;border-radius:8px;overflow:hidden;box-shadow:0 3px 15px rgba(0,0,0,0.1);}
          .header{background:linear-gradient(135deg,#1e3a5f,#2563eb);color:white;padding:8px 15px;}
          .header-content{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;}
          .logo-area{display:flex;align-items:center;gap:8px;}
          .logo-img{width:35px;height:35px;background:white;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:20px;}
          .hospital-name{font-size:14px;font-weight:bold;}
          .hospital-details{font-size:8px;opacity:0.85;}
          .invoice-box{background:rgba(255,255,255,0.15);border-radius:6px;padding:4px 12px;text-align:center;}
          .invoice-num{font-size:14px;font-weight:bold;}
          .type-badge{background:rgba(255,255,255,0.2);padding:1px 8px;border-radius:15px;font-size:9px;margin-top:2px;}
          .copy-badge{background:#ff9800;padding:1px 6px;border-radius:12px;font-size:8px;margin-top:2px;}
          .info-row{display:flex;justify-content:space-between;padding:4px 10px;background:#f8fafc;border-bottom:1px solid #e5e7eb;font-size:10px;}
          .diagnosis{background:#fef3c7;padding:4px 10px;font-size:10px;border-bottom:1px solid #e5e7eb;}
          table{width:100%;border-collapse:collapse;font-size:9px;}
          th,td{border:1px solid #e5e7eb;padding:4px 6px;text-align:${isRTLPrint ? 'right' : 'left'};}
          th{background:#f1f5f9;font-weight:600;}
          .totals{padding:6px 10px;background:#f8fafc;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;}
          .totals-box{width:100%;max-width:320px;${isRTLPrint ? 'margin-right:auto' : 'margin-left:auto'};}
          .total-row{display:flex;justify-content:space-between;padding:2px 0;font-size:9px;}
          .total-row-border{border-top:1px solid #cbd5e1;padding-top:4px;margin-top:2px;}
          .final-total{font-size:12px;font-weight:bold;color:#2563eb;}
          .discount-text{color:#dc2626;}
          .interest-text{color:#f59e0b;}
          .payment-section{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 10px;background:white;}
          .payment-card,.notes-card{background:#f8fafc;border-radius:6px;padding:6px 8px;}
          .card-title{font-weight:bold;color:#1e3a5f;border-bottom:1px solid #2563eb;padding-bottom:2px;margin-bottom:4px;font-size:10px;display:inline-block;}
          .installment-details{background:#dbeafe;border-radius:4px;padding:4px 6px;margin-top:4px;font-size:8px;}
          .signatures{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:8px 20px;text-align:center;border-top:1px solid #e5e7eb;background:#f8fafc;}
          .sign-line{border-top:1px solid #94a3b8;width:100px;margin:4px auto 0;}
          .footer{text-align:center;padding:6px;background:#1e3a5f;color:white;font-size:7px;}
          @media print{body{background:white;padding:0;margin:0;}.invoice{box-shadow:none;border-radius:0;}}
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div class="header-content">
              <div class="logo-area">
                ${invoice.hospitalLogo ? `<img src="${invoice.hospitalLogo}" class="logo-img" style="object-fit:contain;width:35px;height:35px;">` : '<div class="logo-img">🏥</div>'}
                <div><div class="hospital-name">${invoice.hospitalName || hospitalInfo.nameAr}</div><div class="hospital-details">${invoice.hospitalAddress || hospitalInfo.addressAr}<br>هاتف: ${invoice.hospitalPhone || hospitalInfo.phone}</div></div>
              </div>
              <div class="invoice-box">
                <div>فاتورة طبية</div>
                <div class="invoice-num">${invoice.invoiceNumber}</div>
                <div class="type-badge">${invoiceTypeIcon} ${invoiceTypeText}</div>
                ${totalCopies > 1 ? `<div class="copy-badge">نسخة ${copyNumber}/${totalCopies}</div>` : ''}
              </div>
            </div>
          </div>
          
          <div class="info-row"><span>المريض: ${invoice.patientName}</span><span>العمر: ${invoice.patientAge} سنة</span></div>
          <div class="info-row"><span>الطبيب: ${invoice.doctorName}</span><span>التاريخ: ${invoice.invoiceDate}</span></div>
          ${invoice.doctorSpecialization ? `<div class="info-row"><span>التخصص: ${invoice.doctorSpecialization}</span><span>تاريخ العملية: ${invoice.surgeryDate || '-'}</span></div>` : ''}
          ${invoice.procedureName ? `<div class="info-row"><span colspan="2">العملية: ${invoice.procedureName}</span></div>` : ''}
          ${invoice.diagnosis ? `<div class="diagnosis">📋 التشخيص: ${invoice.diagnosis}</div>` : ''}
          
          <table style="width:96%;margin:6px auto;">
            <thead><tr><th style="width:8%">#</th><th>الخدمة</th><th style="width:15%">الكمية</th><th style="width:20%">السعر</th><th style="width:20%">الإجمالي</th></tr></thead>
            <tbody>${invoice.items.map((item, idx) => {
              const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
              return `<tr><td style="text-align:center">${idx+1}</td><td>${item.description || '-'}</td><td style="text-align:center">${item.quantity}</td><td style="text-align:center">${(parseFloat(item.unitPrice) || 0).toFixed(2)}</td><td style="text-align:center;font-weight:bold">${itemTotal.toFixed(2)}</td>`
            }).join('')}</tbody>
          </table>
          
          <div class="totals">
            <div class="totals-box">
              <div class="total-row"><span>المجموع:</span><span>${subtotal.toFixed(2)}</span></div>
              ${invoice.discount > 0 ? `<div class="total-row"><span>الخصم (${invoice.discount}${invoice.discountType === 'percentage' ? '%' : ''}):</span><span class="discount-text">- ${discountAmount.toFixed(2)}</span></div>` : ''}
              <div class="total-row"><span>بعد الخصم:</span><span>${total.toFixed(2)}</span></div>
              ${downPayment > 0 ? `<div class="total-row"><span>المقدم:</span><span class="discount-text">- ${downPayment.toFixed(2)}</span></div>` : ''}
              <div class="total-row"><span>المتبقي:</span><span>${remainingAfterDown.toFixed(2)}</span></div>
              ${invoice.interestRate > 0 ? `<div class="total-row"><span>فائدة (${invoice.interestRate}%):</span><span class="interest-text">+ ${interestAmount.toFixed(2)}</span></div>` : ''}
              <div class="total-row total-row-border"><span class="final-total">الإجمالي:</span><span class="final-total">${totalWithInterest.toFixed(2)}</span></div>
              <div class="total-row"><span>المدفوع:</span><span>${paidAmount.toFixed(2)}</span></div>
              <div class="total-row"><span>المتبقي:</span><span style="color:${remainingAmount > 0 ? '#dc2626' : '#10b981'}">${remainingAmount.toFixed(2)}</span></div>
              ${invoice.paymentStatus === 'installment' && invoice.installmentMonths > 0 && totalWithInterest > 0 ? `<div class="total-row"><span>القسط (${invoice.installmentMonths} شهر):</span><span style="color:#2563eb;font-weight:bold">${monthlyInstallment}</span></div>` : ''}
            </div>
          </div>
          
          <div class="payment-section">
            <div class="payment-card"><div class="card-title">💰 الدفع</div><div style="font-size:9px">الحالة: ${getPaymentStatusText(invoice.paymentStatus)}</div><div style="font-size:9px">الطريقة: ${getPaymentMethodText(invoice.paymentMethod)}</div></div>
            <div class="notes-card"><div class="card-title">📝 ملاحظات</div><div style="font-size:9px">${invoice.notes || '-'}</div></div>
          </div>
          
          <div class="signatures"><div><div class="sign-line"></div><p style="margin-top:3px;font-size:8px">توقيع المريض</p></div><div><div class="sign-line"></div><p style="margin-top:3px;font-size:8px">توقيع الطبيب</p></div></div>
          <div class="footer"><p>شكراً لثقتكم بنا - نتمنى لكم دوام الصحة والعافية</p><p>MCSOS - نظام المركز الطبي</p></div>
        </div>
      </body>
      </html>
    `
  }

  // ========== حالة الدفع ==========
  const getPaymentStatusBadge = (status) => {
    switch(status) {
      case 'paid': return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">مدفوع</span>
      case 'installment': return <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">تقسيط</span>
      default: return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">غير مدفوع</span>
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
      {/* Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold gradient-text">الفواتير الطبية</h1>
          <p className="text-gray-400 mt-1">
            إدارة الفواتير وكشوف العمليات
            {!isOnline && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                ⚡ غير متصل
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowHospitalSettings(true)} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-purple-500/30">
            <Hospital size={18} /> بيانات المستشفى
          </button>
          <button onClick={() => { resetForm(); setShowInvoiceModal(true); }} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30">
            <Plus size={18} /> فاتورة جديدة
          </button>
          <button onClick={loadAllData} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-500/30">
            تحديث
          </button>
        </div>
      </div>

      {/* قائمة الفواتير */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">قائمة الفواتير</h2>
          <span className="text-sm text-gray-400">
            {invoices.filter(i => i._syncPending).length > 0 && (
              <span className="text-yellow-400">⏳ {invoices.filter(i => i._syncPending).length} في انتظار المزامنة</span>
            )}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr>
                <th className="px-3 py-2 text-xs text-gray-300">الرقم</th>
                <th className="px-3 py-2 text-xs text-gray-300">النوع</th>
                <th className="px-3 py-2 text-xs text-gray-300">المريض</th>
                <th className="px-3 py-2 text-xs text-gray-300">الطبيب</th>
                <th className="px-3 py-2 text-xs text-gray-300">التاريخ</th>
                <th className="px-3 py-2 text-xs text-gray-300">الإجمالي</th>
                <th className="px-3 py-2 text-xs text-gray-300">الحالة</th>
                <th className="px-3 py-2 text-xs text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-400">لا توجد فواتير</td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const isPending = inv._syncPending === true
                  return (
                    <tr key={inv.id} className="hover:bg-gray-700/30">
                      <td className="px-3 py-2 text-blue-400 text-xs">
                        {inv.invoiceNumber}
                        {isPending && (
                          <span className="block text-[8px] text-yellow-400">⏳ مزامنة</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 bg-gray-600 rounded-full text-xs">
                          {inv.invoiceType === 'surgery' ? 'عملية' : 'كشف'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-semibold text-white text-sm">{inv.patientName}</div>
                        <div className="text-xs text-gray-400">{inv.patientAge} سنة</div>
                      </td>
                      <td className="px-3 py-2 text-gray-300 text-xs">{inv.doctorName}</td>
                      <td className="px-3 py-2 text-gray-400 text-xs">
                        {new Date(inv.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 font-semibold text-green-400 text-xs">
                        {inv.total?.toFixed(2) || 0}
                      </td>
                      <td className="px-3 py-2">{getPaymentStatusBadge(inv.paymentStatus)}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <button onClick={() => handleEditInvoice(inv)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => openPrintOptions(inv)} className="p-1 text-green-400 hover:bg-green-500/20 rounded">
                            <Printer size={14} />
                          </button>
                          <button onClick={() => handleMarkAsPaid(inv.id)} className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded">
                            <CheckCircle size={14} />
                          </button>
                          <button onClick={() => handleDeleteInvoice(inv.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                            <Trash2 size={14} />
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

      {/* ========== باقي المودالات (نفس الكود الأصلي) ========== */}
      {/* Print Options Modal */}
      {showPrintOptions && selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">إعدادات الطباعة</h2>
              <button onClick={() => setShowPrintOptions(false)} className="p-1 hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-2">رقم الفاتورة</p>
                <p className="text-2xl font-bold text-blue-400">{selectedInvoice.invoiceNumber}</p>
                <p className="text-gray-400 text-sm mt-2">المريض: {selectedInvoice.patientName}</p>
                <p className="text-gray-400 text-sm">الإجمالي: {selectedInvoice.total?.toFixed(2) || 0}</p>
              </div>
              <div className="text-center">
                <label className="block text-sm text-gray-400 mb-3">عدد النسخ</label>
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => setPrintCopies(Math.max(1, printCopies - 1))} className="p-2 bg-gray-700 rounded-lg">
                    <Minus size={20} className="text-white" />
                  </button>
                  <div className="w-20 text-center">
                    <span className="text-3xl font-bold text-white">{printCopies}</span>
                    <p className="text-xs text-gray-400">نسخة</p>
                  </div>
                  <button onClick={() => setPrintCopies(Math.min(10, printCopies + 1))} className="p-2 bg-gray-700 rounded-lg">
                    <Maximize size={20} className="text-white" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">الحد الأقصى 10 نسخ</p>
              </div>
              <div className="border-t border-gray-700 pt-4">
                <div className="flex gap-3">
                  <button onClick={handlePrintWithCopies} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg flex items-center justify-center gap-2">
                    <Printer size={18} /> طباعة {printCopies} نسخة
                  </button>
                  <button onClick={() => setShowPrintOptions(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hospital Settings Modal */}
      {showHospitalSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">بيانات المستشفى</h2>
              <button onClick={() => setShowHospitalSettings(false)} className="p-1 hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-3">
                <label className="block text-sm text-gray-400 mb-2">شعار المستشفى</label>
                <div className="flex items-center gap-4">
                  {hospitalInfo.logoPreview && (
                    <img src={hospitalInfo.logoPreview} alt="الشعار" className="w-20 h-20 object-contain border rounded p-1 bg-white" />
                  )}
                  <label className="cursor-pointer bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2">
                    <Upload size={18} /> رفع شعار
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">اسم المستشفى</label>
                  <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={hospitalInfo.nameAr} onChange={(e) => handleHospitalInfoChange('nameAr', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">العنوان</label>
                  <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={hospitalInfo.addressAr} onChange={(e) => handleHospitalInfoChange('addressAr', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">رقم الهاتف</label>
                  <input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={hospitalInfo.phone} onChange={(e) => handleHospitalInfoChange('phone', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">البريد الإلكتروني</label>
                  <input type="email" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={hospitalInfo.email} onChange={(e) => handleHospitalInfoChange('email', e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowHospitalSettings(false)} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg">حفظ وإغلاق</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{selectedInvoice ? 'تعديل فاتورة' : 'فاتورة جديدة'}</h2>
              <button onClick={() => setShowInvoiceModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
              <label className="block text-sm text-gray-400 mb-2">نوع الفاتورة</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="invoiceType" value="examination" checked={invoiceType === 'examination'} onChange={(e) => setInvoiceType(e.target.value)} className="w-4 h-4" />
                  <span className="text-white flex items-center gap-1"><ClipboardList size={16} /> كشف طبي</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="invoiceType" value="surgery" checked={invoiceType === 'surgery'} onChange={(e) => setInvoiceType(e.target.value)} className="w-4 h-4" />
                  <span className="text-white flex items-center gap-1"><Syringe size={16} /> عملية جراحية</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">المريض *</label>
                <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientId} onChange={(e) => handleSelectPatient(e.target.value)}>
                  <option value="">اختر المريض</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{currentLang === 'ar' ? p.nameAr : p.nameEn}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">الطبيب *</label>
                  <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.doctorId} onChange={(e) => handleSelectDoctor(e.target.value)}>
                    <option value="">اختر الطبيب</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{currentLang === 'ar' ? d.nameAr : d.nameEn}</option>
                    ))}
                  </select>
                </div>
                <button onClick={() => setShowAddDoctorModal(true)} className="mt-7 p-2 bg-green-500/20 text-green-400 rounded-lg">
                  <UserPlus size={18} />
                </button>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">العمر</label>
                <input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientAge} onChange={(e) => setFormData({...formData, patientAge: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">{invoiceType === 'surgery' ? 'تاريخ العملية' : 'تاريخ الكشف'}</label>
                <input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.surgeryDate} onChange={(e) => setFormData({...formData, surgeryDate: e.target.value})} />
              </div>
              {invoiceType === 'surgery' && (
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">اسم العملية</label>
                  <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" placeholder="مثال: عملية تنظير الركبة" value={formData.procedureName} onChange={(e) => setFormData({...formData, procedureName: e.target.value})} />
                </div>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">التشخيص</label>
                <textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-bold">الخدمات</h3>
                <button onClick={handleAddItem} className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">
                  <Plus size={14} /> إضافة خدمة
                </button>
              </div>
              {formData.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 mb-2">
                  <input type="text" className="col-span-5 p-2 bg-gray-700 rounded-lg text-white" placeholder="الخدمة" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} />
                  <input type="number" className="col-span-2 p-2 bg-gray-700 rounded-lg text-white" placeholder="الكمية" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} />
                  <input type="number" className="col-span-3 p-2 bg-gray-700 rounded-lg text-white" placeholder="السعر" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)} />
                  <div className="col-span-1 text-white text-center">{(parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)}</div>
                  <button onClick={() => handleRemoveItem(item.id)} className="col-span-1 text-red-400"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">الخصم</label>
                <input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.discount} onChange={(e) => handleDiscountChange(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">نوع الخصم</label>
                <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.discountType} onChange={(e) => { setFormData({...formData, discountType: e.target.value}); calculateTotals({...formData, discountType: e.target.value}); }}>
                  <option value="percentage">نسبة مئوية %</option>
                  <option value="fixed">قيمة ثابتة</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">حالة الدفع</label>
                <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.paymentStatus} onChange={(e) => handlePaymentStatusChange(e.target.value)}>
                  <option value="unpaid">غير مدفوع</option>
                  <option value="paid">مدفوع بالكامل</option>
                  <option value="installment">دفع بالتقسيط</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">طريقة الدفع</label>
                <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}>
                  <option value="cash">كاش</option>
                  <option value="card">بطاقة</option>
                  <option value="bank">تحويل</option>
                </select>
              </div>
            </div>

            {formData.paymentStatus === 'installment' && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                <h4 className="text-blue-400 font-bold text-sm mb-2">📅 تفاصيل التقسيط</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">المبلغ المقدم</label>
                    <input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.downPayment} onChange={(e) => handleDownPaymentChange(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">عدد الأشهر</label>
                    <input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.installmentMonths} onChange={(e) => handleInstallmentMonthsChange(e.target.value)} min="1" max="24" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">نسبة الفائدة %</label>
                    <input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.interestRate} onChange={(e) => handleInterestRateChange(e.target.value)} step="0.5" />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm p-2 bg-gray-700/30 rounded">
                  <div className="text-gray-400">المتبقي بعد المقدم:</div>
                  <div className="text-white">{formData.remainingAfterDown.toFixed(2)}</div>
                  <div className="text-gray-400">قيمة الفائدة:</div>
                  <div className="text-yellow-400">{formData.interestAmount.toFixed(2)}</div>
                  <div className="text-gray-400">الإجمالي مع الفائدة:</div>
                  <div className="text-blue-400">{formData.totalWithInterest.toFixed(2)}</div>
                  <div className="text-gray-400">القسط الشهري:</div>
                  <div className="text-green-400">{formData.monthlyInstallment.toFixed(2)}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">المبلغ المدفوع</label>
                <input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.paidAmount} onChange={(e) => handlePaidAmountChange(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">المبلغ المتبقي</label>
                <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-gray-300" value={formData.remainingAmount.toFixed(2)} disabled readOnly />
              </div>
            </div>

            <div className="bg-gray-700/30 p-3 rounded-lg mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">مجموع الخدمات:</span>
                <span className="text-white font-semibold">{formData.subtotal.toFixed(2)}</span>
              </div>
              {formData.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">الخصم ({formData.discount}{formData.discountType === 'percentage' ? '%' : ''}):</span>
                  <span className="text-red-400">- {formData.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-600 pt-2 mt-2">
                <span className="font-bold text-white">الإجمالي النهائي:</span>
                <span className="font-bold text-green-400">{formData.paymentStatus === 'installment' ? formData.totalWithInterest.toFixed(2) : formData.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">ملاحظات</label>
              <textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-700">
              <button onClick={handleSaveInvoice} disabled={isSubmitting} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
              </button>
              <button onClick={() => setShowInvoiceModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">إضافة طبيب</h2>
              <button onClick={() => setShowAddDoctorModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="الاسم" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.nameAr} onChange={(e) => setNewDoctor({...newDoctor, nameAr: e.target.value})} />
              <input type="text" placeholder="التخصص" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.specializationAr} onChange={(e) => setNewDoctor({...newDoctor, specializationAr: e.target.value})} />
              <div className="flex gap-3 pt-4">
                <button onClick={handleAddDoctor} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">إضافة</button>
                <button onClick={() => setShowAddDoctorModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}