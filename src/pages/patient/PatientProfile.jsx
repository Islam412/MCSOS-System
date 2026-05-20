import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  User, Calendar, Phone, Mail, MapPin, Activity, Pill, FileText, 
  Image, Camera, Printer, Download, Plus, Trash2, Edit, Save, X,
  CheckCircle, XCircle, Clock, TrendingUp, Stethoscope, Syringe,
  ClipboardList, AlertCircle, Eye, Upload, Search, UserPlus, PenBox,
  Bone, Microscope, FileImage, Scissors, Droplet, Heart, Brain
} from 'lucide-react'
import toast from 'react-hot-toast'

const defaultPatients = [
  {
    id: 1,
    nameAr: 'أحمد محمد',
    nameEn: 'Ahmed Mohamed',
    nameFr: 'Ahmed Mohamed',
    age: 35,
    phone: '0501234567',
    email: 'ahmed@example.com',
    diagnosis: 'تمزق في الرباط الصليبي',
    severity: 'moderate',
    totalSessions: 12,
    completedSessions: 5,
    status: 'active',
    progress: 41.7,
    notes: 'يستجيب بشكل جيد للعلاج',
    images: [],
    xrays: [],
    reports: [],
    prescriptions: []
  }
]

export default function PatientProfile() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language

  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  const [showEditPatientModal, setShowEditPatientModal] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // حالات الصور الطبية العادية
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [uploadType, setUploadType] = useState('xray')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDesc, setUploadDesc] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [viewerImages, setViewerImages] = useState([])
  
  // حالات الأشعة
  const [showXrayModal, setShowXrayModal] = useState(false)
  const [xrayType, setXrayType] = useState('image')
  const [xrayTitle, setXrayTitle] = useState('')
  const [xrayDesc, setXrayDesc] = useState('')
  const [xrayDate, setXrayDate] = useState(new Date().toISOString().split('T')[0])
  const [xrayBodyPart, setXrayBodyPart] = useState('')
  const [xrayDoctor, setXrayDoctor] = useState('')
  const [xrayFile, setXrayFile] = useState(null)
  const [xrayReport, setXrayReport] = useState('')
  const [showXrayViewer, setShowXrayViewer] = useState(false)
  const [selectedXray, setSelectedXray] = useState(null)
  
  // حالات التقارير والروشتات
  const [showReportModal, setShowReportModal] = useState(false)
  const [showEditReportModal, setShowEditReportModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [newReport, setNewReport] = useState({ title: '', content: '', type: 'medical' })
  const [editReportData, setEditReportData] = useState({ title: '', content: '' })
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [prescriptions, setPrescriptions] = useState([])
  const [prescriptionForm, setPrescriptionForm] = useState({
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: ''
  })
  
  const [newPatient, setNewPatient] = useState({
    nameAr: '', nameEn: '', nameFr: '',
    age: '', phone: '', email: '',
    diagnosis: '', severity: 'moderate',
    totalSessions: 6, completedSessions: 0,
    status: 'active', progress: 0,
    notes: ''
  })

  const [editPatient, setEditPatient] = useState({
    id: '', nameAr: '', nameEn: '', nameFr: '',
    age: '', phone: '', email: '',
    diagnosis: '', severity: 'moderate',
    totalSessions: 6, completedSessions: 0,
    status: 'active', notes: ''
  })

  useEffect(() => {
    loadPatients()
    loadPrescriptions()
  }, [])

  const loadPatients = () => {
    const saved = localStorage.getItem('mcsos_patients_v2')
    if (saved && JSON.parse(saved).length > 0) {
      setPatients(JSON.parse(saved))
    } else {
      setPatients(defaultPatients)
      localStorage.setItem('mcsos_patients_v2', JSON.stringify(defaultPatients))
    }
    setLoading(false)
  }

  const loadPrescriptions = () => {
    const saved = localStorage.getItem('mcsos_prescriptions')
    if (saved) {
      setPrescriptions(JSON.parse(saved))
    } else {
      setPrescriptions([])
    }
  }

  const getPatientName = (patient) => {
    if (currentLang === 'ar') return patient.nameAr
    if (currentLang === 'fr') return patient.nameFr
    return patient.nameEn
  }

  const getSeverityText = (severity) => {
    const map = { mild: 'بسيط', moderate: 'متوسط', severe: 'شديد' }
    return map[severity] || severity
  }

  const getSeverityColor = (severity) => {
    const map = { mild: 'text-green-400', moderate: 'text-yellow-400', severe: 'text-red-400' }
    return map[severity] || 'text-gray-400'
  }

  const getBodyPartText = (part) => {
    const map = {
      head: 'الرأس', neck: 'الرقبة', chest: 'الصدر', abdomen: 'البطن',
      spine: 'العمود الفقري', arm: 'الذراع', leg: 'الساق', knee: 'الركبة',
      hand: 'اليد', foot: 'القدم', other: 'أخرى'
    }
    return map[part] || part
  }

  // دوال إدارة المرضى
  const handleAddPatient = () => {
    if (!newPatient.nameAr || !newPatient.age) {
      toast.error('الرجاء إدخال الاسم والعمر')
      return
    }
    const patient = {
      id: Date.now(),
      nameAr: newPatient.nameAr,
      nameEn: newPatient.nameEn || newPatient.nameAr,
      nameFr: newPatient.nameFr || newPatient.nameAr,
      age: parseInt(newPatient.age),
      phone: newPatient.phone || '',
      email: newPatient.email || '',
      diagnosis: newPatient.diagnosis || 'قيد التشخيص',
      severity: newPatient.severity,
      totalSessions: parseInt(newPatient.totalSessions) || 6,
      completedSessions: 0,
      status: 'active',
      progress: 0,
      notes: newPatient.notes || '',
      images: [],
      xrays: [],
      reports: [],
      prescriptions: []
    }
    const updatedPatients = [...patients, patient]
    setPatients(updatedPatients)
    localStorage.setItem('mcsos_patients_v2', JSON.stringify(updatedPatients))
    setShowAddPatientModal(false)
    setNewPatient({
      nameAr: '', nameEn: '', nameFr: '',
      age: '', phone: '', email: '',
      diagnosis: '', severity: 'moderate',
      totalSessions: 6, completedSessions: 0,
      status: 'active', progress: 0,
      notes: ''
    })
    toast.success('تم إضافة المريض بنجاح')
  }

  const handleEditPatient = () => {
    if (!editPatient.nameAr || !editPatient.age) {
      toast.error('الرجاء إدخال الاسم والعمر')
      return
    }
    const updatedPatients = patients.map(p => 
      p.id === editPatient.id ? {
        ...p,
        nameAr: editPatient.nameAr,
        nameEn: editPatient.nameEn || editPatient.nameAr,
        nameFr: editPatient.nameFr || editPatient.nameAr,
        age: parseInt(editPatient.age),
        phone: editPatient.phone || '',
        email: editPatient.email || '',
        diagnosis: editPatient.diagnosis || p.diagnosis,
        severity: editPatient.severity,
        totalSessions: parseInt(editPatient.totalSessions) || p.totalSessions,
        notes: editPatient.notes || ''
      } : p
    )
    setPatients(updatedPatients)
    localStorage.setItem('mcsos_patients_v2', JSON.stringify(updatedPatients))
    if (selectedPatient && selectedPatient.id === editPatient.id) {
      setSelectedPatient(updatedPatients.find(p => p.id === editPatient.id))
    }
    setShowEditPatientModal(false)
    toast.success('تم تحديث بيانات المريض بنجاح')
  }

  const handleDeletePatient = (patientId) => {
    if (confirm('هل أنت متأكد من حذف هذا المريض؟')) {
      const updatedPatients = patients.filter(p => p.id !== patientId)
      setPatients(updatedPatients)
      localStorage.setItem('mcsos_patients_v2', JSON.stringify(updatedPatients))
      if (selectedPatient && selectedPatient.id === patientId) {
        setShowPatientModal(false)
        setSelectedPatient(null)
      }
      toast.success('تم حذف المريض بنجاح')
    }
  }

  const updatePatient = (updatedPatient) => {
    const updatedPatients = patients.map(p => p.id === updatedPatient.id ? updatedPatient : p)
    setPatients(updatedPatients)
    localStorage.setItem('mcsos_patients_v2', JSON.stringify(updatedPatients))
    setSelectedPatient(updatedPatient)
  }

  // دوال الصور الطبية العادية
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('الرجاء اختيار ملف صورة صالح')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUploadImage = () => {
    if (!selectedFile) {
      toast.error('الرجاء اختيار صورة')
      return
    }
    if (!uploadTitle) {
      toast.error('الرجاء إدخال عنوان للصورة')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      const newImage = {
        id: Date.now(),
        type: uploadType,
        title: uploadTitle,
        description: uploadDesc,
        data: reader.result,
        fileName: selectedFile.name,
        date: new Date().toISOString()
      }
      const updatedPatient = {
        ...selectedPatient,
        images: [...(selectedPatient.images || []), newImage]
      }
      updatePatient(updatedPatient)
      setShowImageUpload(false)
      setSelectedFile(null)
      setUploadTitle('')
      setUploadDesc('')
      toast.success('تم رفع الصورة بنجاح')
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleDeleteImage = (imageId) => {
    if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
      const updatedImages = selectedPatient.images.filter(img => img.id !== imageId)
      const updatedPatient = { ...selectedPatient, images: updatedImages }
      updatePatient(updatedPatient)
      toast.success('تم حذف الصورة بنجاح')
    }
  }

  const handleViewImage = (images, startIndex = 0) => {
    setViewerImages(images)
    setShowImageViewer(true)
  }

  // دوال الأشعة
  const handleXrayFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن لا يتجاوز 10 ميجابايت')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('الرجاء اختيار ملف صورة صالح')
        return
      }
      setXrayFile(file)
    }
  }

  const handleUploadXray = () => {
    if (!xrayFile && !xrayReport) {
      toast.error('الرجاء اختيار صورة أشعة أو كتابة تقرير')
      return
    }
    if (!xrayTitle) {
      toast.error('الرجاء إدخال عنوان للأشعة')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const newXray = {
        id: Date.now(),
        type: xrayType,
        title: xrayTitle,
        description: xrayDesc,
        bodyPart: xrayBodyPart,
        doctorName: xrayDoctor || selectedPatient.doctorName || 'الطبيب المعالج',
        date: xrayDate,
        imageData: xrayFile ? reader.result : null,
        report: xrayReport,
        fileName: xrayFile ? xrayFile.name : null
      }
      const updatedPatient = {
        ...selectedPatient,
        xrays: [...(selectedPatient.xrays || []), newXray]
      }
      updatePatient(updatedPatient)
      setShowXrayModal(false)
      setXrayFile(null)
      setXrayTitle('')
      setXrayDesc('')
      setXrayBodyPart('')
      setXrayDoctor('')
      setXrayReport('')
      setXrayType('image')
      setXrayDate(new Date().toISOString().split('T')[0])
      toast.success('تم رفع الأشعة بنجاح')
    }
    if (xrayFile) {
      reader.readAsDataURL(xrayFile)
    } else {
      reader.onloadend()
    }
  }

  const handleDeleteXray = (xrayId) => {
    if (confirm('هل أنت متأكد من حذف هذه الأشعة؟')) {
      const updatedXrays = selectedPatient.xrays.filter(x => x.id !== xrayId)
      const updatedPatient = { ...selectedPatient, xrays: updatedXrays }
      updatePatient(updatedPatient)
      toast.success('تم حذف الأشعة بنجاح')
    }
  }

  const handleViewXray = (xray) => {
    setSelectedXray(xray)
    setShowXrayViewer(true)
  }

  const handleDownloadXray = (xray) => {
    if (xray.imageData) {
      const link = document.createElement('a')
      link.href = xray.imageData
      link.download = xray.fileName || `xray_${xray.id}.jpg`
      link.click()
      toast.success('جاري تحميل الصورة...')
    } else {
      toast.error('لا توجد صورة للتحميل')
    }
  }

  // دوال التقارير
  const handleAddReport = () => {
    if (!newReport.title) {
      toast.error('الرجاء إدخال عنوان التقرير')
      return
    }
    const newReportObj = {
      id: Date.now(),
      ...newReport,
      date: new Date().toISOString(),
      doctorName: selectedPatient.doctorName || 'غير محدد'
    }
    const updatedPatient = {
      ...selectedPatient,
      reports: [...(selectedPatient.reports || []), newReportObj]
    }
    updatePatient(updatedPatient)
    setShowReportModal(false)
    setNewReport({ title: '', content: '', type: 'medical' })
    toast.success('تم إضافة التقرير بنجاح')
  }

  const handleEditReport = (report) => {
    setSelectedReport(report)
    setEditReportData({ title: report.title, content: report.content })
    setShowEditReportModal(true)
  }

  const handleSaveReportEdit = () => {
    if (!editReportData.title) {
      toast.error('الرجاء إدخال عنوان التقرير')
      return
    }
    const updatedReports = selectedPatient.reports.map(r => 
      r.id === selectedReport.id ? { ...r, title: editReportData.title, content: editReportData.content } : r
    )
    const updatedPatient = { ...selectedPatient, reports: updatedReports }
    updatePatient(updatedPatient)
    setShowEditReportModal(false)
    setSelectedReport(null)
    toast.success('تم تحديث التقرير بنجاح')
  }

  const handleDeleteReport = (reportId) => {
    if (confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
      const updatedReports = selectedPatient.reports.filter(r => r.id !== reportId)
      const updatedPatient = { ...selectedPatient, reports: updatedReports }
      updatePatient(updatedPatient)
      toast.success('تم حذف التقرير بنجاح')
    }
  }

  // دوال الروشتات
  const handleAddPrescription = () => {
    const validMedications = prescriptionForm.medications.filter(m => m.name.trim())
    if (validMedications.length === 0) {
      toast.error('الرجاء إضافة دواء واحد على الأقل')
      return
    }
    const newPrescription = {
      id: Date.now(),
      prescriptionNumber: `RX-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      prescriptionDate: new Date().toISOString().split('T')[0],
      patientId: selectedPatient.id,
      patientName: getPatientName(selectedPatient),
      medications: validMedications,
      notes: prescriptionForm.notes,
      doctorName: selectedPatient.doctorName || 'الطبيب المعالج'
    }
    const updatedPrescriptions = [newPrescription, ...prescriptions]
    localStorage.setItem('mcsos_prescriptions', JSON.stringify(updatedPrescriptions))
    setPrescriptions(updatedPrescriptions)
    const updatedPatient = {
      ...selectedPatient,
      prescriptions: [...(selectedPatient.prescriptions || []), newPrescription.id]
    }
    updatePatient(updatedPatient)
    setShowPrescriptionModal(false)
    setPrescriptionForm({ medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }], notes: '' })
    toast.success('تم إضافة الروشتة بنجاح')
  }

  const handleAddMedicationField = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }))
  }

  const handleRemoveMedicationField = (index) => {
    if (prescriptionForm.medications.length === 1) {
      toast.error('يجب وجود دواء واحد على الأقل')
      return
    }
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }))
  }

  const handleMedicationFieldChange = (index, field, value) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.map((m, i) => i === index ? { ...m, [field]: value } : m)
    }))
  }

  // دوال الجلسات
  const handleUpdateSessionProgress = (increment = true) => {
    let newCompleted = selectedPatient.completedSessions + (increment ? 1 : -1)
    if (newCompleted < 0) newCompleted = 0
    if (newCompleted > selectedPatient.totalSessions) newCompleted = selectedPatient.totalSessions
    const newProgress = (newCompleted / selectedPatient.totalSessions) * 100
    const newStatus = newProgress >= 100 ? 'completed' : newProgress >= 50 ? 'improving' : 'active'
    const updatedPatient = {
      ...selectedPatient,
      completedSessions: newCompleted,
      progress: newProgress,
      status: newStatus
    }
    updatePatient(updatedPatient)
    toast.success(increment ? 'تم تسجيل جلسة جديدة' : 'تم تعديل عدد الجلسات')
  }

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(getReportHTML(selectedPatient))
      printWindow.document.close()
      printWindow.print()
    }
    toast.success('جاري طباعة التقرير...')
  }

  const getReportHTML = (patient) => {
    const patientPrescriptions = prescriptions.filter(p => p.patientId === patient.id)
    const isRTLPrint = isRTL ? 'rtl' : 'ltr'
    return `<!DOCTYPE html>
      <html dir="${isRTLPrint}" lang="ar">
      <head><meta charset="UTF-8"><title>تقرير حالة المريض - ${getPatientName(patient)}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'Cairo',Arial,sans-serif;background:#e0e0e0;padding:20px;}
        .report{max-width:800px;margin:0 auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.1);}
        .header{background:linear-gradient(135deg,#1e3a5f,#2563eb);color:white;padding:20px;text-align:center;}
        .section{padding:15px 20px;border-bottom:1px solid #e5e7eb;}
        .section-title{font-weight:bold;color:#1e3a5f;font-size:18px;margin-bottom:15px;border-bottom:2px solid #2563eb;display:inline-block;}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;}
        .info-item{display:flex;justify-content:space-between;padding:5px 0;}
        .progress-bar{background:#e5e7eb;border-radius:10px;height:20px;margin:10px 0;}
        .progress-fill{background:#2563eb;border-radius:10px;height:20px;width:${patient.progress || 0}%;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;}
        .footer{text-align:center;padding:15px;background:#f8fafc;color:#6b7280;font-size:10px;}
        @media print{body{background:white;padding:0;}.report{box-shadow:none;border-radius:0;}
      </style>
      </head>
      <body>
        <div class="report">
          <div class="header"><h1>تقرير حالة المريض</h1><p>${new Date().toLocaleDateString()}</p></div>
          <div class="section"><div class="section-title">معلومات المريض</div><div class="info-grid"><div class="info-item"><span>الاسم:</span><span>${getPatientName(patient)}</span></div><div class="info-item"><span>العمر:</span><span>${patient.age} سنة</span></div><div class="info-item"><span>الجوال:</span><span>${patient.phone || '-'}</span></div><div class="info-item"><span>التشخيص:</span><span>${patient.diagnosis || '-'}</span></div></div></div>
          <div class="section"><div class="section-title">تقدم العلاج</div><div class="info-grid"><div class="info-item"><span>إجمالي الجلسات:</span><span>${patient.totalSessions || 0}</span></div><div class="info-item"><span>الجلسات المكتملة:</span><span>${patient.completedSessions || 0}</span></div><div class="info-item"><span>نسبة التقدم:</span><span>${Math.round(patient.progress || 0)}%</span></div></div><div class="progress-bar"><div class="progress-fill">${Math.round(patient.progress || 0)}%</div></div></div>
          <div class="footer"><p>تم إنشاء هذا التقرير بواسطة نظام المركز الطبي MCSOS</p></div>
        </div>
      </body>
      </html>`
  }

  const filteredPatients = patients.filter(p => 
    getPatientName(p).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone && p.phone.includes(searchTerm))
  )

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-white">جاري التحميل...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h1 className="text-3xl font-bold gradient-text">ملف المريض</h1><p className="text-gray-400 mt-1">إدارة بيانات المرضى ومتابعة الحالة العلاجية</p></div>
        <button onClick={() => setShowAddPatientModal(true)} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-500/30">
          <UserPlus size={18} /> إضافة مريض جديد
        </button>
      </div>

      {/* قائمة المرضى */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <h2 className="text-xl font-bold text-white">قائمة المرضى</h2>
            <div className="relative w-full md:w-64">
              <input type="text" placeholder="ابحث عن مريض..." className="w-full p-2 pl-8 bg-gray-700 rounded-lg text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr><th className="px-4 py-3 text-sm text-gray-300">المريض</th><th className="px-4 py-3 text-sm text-gray-300">العمر</th><th className="px-4 py-3 text-sm text-gray-300">التشخيص</th><th className="px-4 py-3 text-sm text-gray-300">الجلسات</th><th className="px-4 py-3 text-sm text-gray-300">التقدم</th><th className="px-4 py-3 text-sm text-gray-300">الحالة</th><th className="px-4 py-3 text-sm text-gray-300">إجراءات</th></tr></thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredPatients.length === 0 ? <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">لا يوجد مرضى</td></tr> : filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-semibold text-white cursor-pointer" onClick={() => { setSelectedPatient(patient); setShowPatientModal(true); }}>{getPatientName(patient)}</td>
                  <td className="px-4 py-3 text-gray-300">{patient.age}</td>
                  <td className="px-4 py-3 text-gray-300">{patient.diagnosis || '-'}</td>
                  <td className="px-4 py-3 text-gray-300">{patient.completedSessions || 0}/{patient.totalSessions || 0}</td>
                  <td className="px-4 py-3"><div className="w-24 bg-gray-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${patient.progress || 0}%` }}></div></div></td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">{patient.status === 'completed' ? 'مكتمل' : 'نشط'}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => { setEditPatient({ ...patient }); setShowEditPatientModal(true); }} className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded"><Edit size={16} /></button><button onClick={() => { setSelectedPatient(patient); setShowPatientModal(true); }} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"><Eye size={16} /></button><button onClick={() => handleDeletePatient(patient.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 size={16} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* المودالات - تم اختصارها */}
      {showAddPatientModal && (<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"><div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">إضافة مريض جديد</h2><button onClick={() => setShowAddPatientModal(false)}><X size={20} className="text-gray-400" /></button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label>الاسم (عربي) *</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newPatient.nameAr} onChange={(e) => setNewPatient({...newPatient, nameAr: e.target.value})} /></div><div><label>العمر *</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newPatient.age} onChange={(e) => setNewPatient({...newPatient, age: e.target.value})} /></div><div><label>رقم الجوال</label><input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newPatient.phone} onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})} /></div><div><label>عدد الجلسات</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newPatient.totalSessions} onChange={(e) => setNewPatient({...newPatient, totalSessions: e.target.value})} /></div><div className="md:col-span-2"><label>التشخيص</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newPatient.diagnosis} onChange={(e) => setNewPatient({...newPatient, diagnosis: e.target.value})} /></div><div><label>درجة الحالة</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newPatient.severity} onChange={(e) => setNewPatient({...newPatient, severity: e.target.value})}><option value="mild">بسيط</option><option value="moderate">متوسط</option><option value="severe">شديد</option></select></div></div><div className="flex gap-3 pt-4"><button onClick={handleAddPatient} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">إضافة</button><button onClick={() => setShowAddPatientModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div></div></div>)}

      {showEditPatientModal && (<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"><div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">تعديل بيانات المريض</h2><button onClick={() => setShowEditPatientModal(false)}><X size={20} className="text-gray-400" /></button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label>الاسم (عربي) *</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editPatient.nameAr} onChange={(e) => setEditPatient({...editPatient, nameAr: e.target.value})} /></div><div><label>العمر *</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editPatient.age} onChange={(e) => setEditPatient({...editPatient, age: e.target.value})} /></div><div><label>رقم الجوال</label><input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editPatient.phone} onChange={(e) => setEditPatient({...editPatient, phone: e.target.value})} /></div><div><label>عدد الجلسات</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editPatient.totalSessions} onChange={(e) => setEditPatient({...editPatient, totalSessions: e.target.value})} /></div><div className="md:col-span-2"><label>التشخيص</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editPatient.diagnosis} onChange={(e) => setEditPatient({...editPatient, diagnosis: e.target.value})} /></div><div><label>درجة الحالة</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editPatient.severity} onChange={(e) => setEditPatient({...editPatient, severity: e.target.value})}><option value="mild">بسيط</option><option value="moderate">متوسط</option><option value="severe">شديد</option></select></div></div><div className="flex gap-3 pt-4"><button onClick={handleEditPatient} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg">حفظ</button><button onClick={() => setShowEditPatientModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div></div></div>)}

      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">{getPatientName(selectedPatient)}</h2>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => { setEditPatient({ ...selectedPatient }); setShowEditPatientModal(true); setShowPatientModal(false); }} className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-lg text-sm"><Edit size={16} /> تعديل</button>
                <button onClick={handlePrintReport} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm"><Printer size={16} /> تقرير</button>
                <button onClick={() => setShowPrescriptionModal(true)} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm"><Pill size={16} /> روشتة</button>
                <button onClick={() => setShowReportModal(true)} className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-lg text-sm"><FileText size={16} /> تقرير طبي</button>
                <button onClick={() => setShowXrayModal(true)} className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-sm"><Bone size={16} /> أشعة</button>
                <button onClick={() => setShowImageUpload(true)} className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-lg text-sm"><Camera size={16} /> صورة</button>
                <button onClick={() => setShowPatientModal(false)}><X size={20} /></button>
              </div>
            </div>

            <div className="flex gap-2 border-b border-gray-700 mb-4 overflow-x-auto">
              <button onClick={() => setActiveTab('info')} className={`px-4 py-2 text-sm rounded-t-lg ${activeTab === 'info' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>معلومات</button>
              <button onClick={() => setActiveTab('progress')} className={`px-4 py-2 text-sm rounded-t-lg ${activeTab === 'progress' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>التقدم</button>
              <button onClick={() => setActiveTab('xrays')} className={`px-4 py-2 text-sm rounded-t-lg ${activeTab === 'xrays' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>الأشعة</button>
              <button onClick={() => setActiveTab('prescriptions')} className={`px-4 py-2 text-sm rounded-t-lg ${activeTab === 'prescriptions' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>الروشتات</button>
              <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 text-sm rounded-t-lg ${activeTab === 'reports' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>التقارير</button>
              <button onClick={() => setActiveTab('images')} className={`px-4 py-2 text-sm rounded-t-lg ${activeTab === 'images' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>الصور</button>
            </div>

            {activeTab === 'info' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-gray-700/30 rounded-lg p-4"><h3 className="font-bold text-white mb-3">المعلومات الشخصية</h3><div>الاسم: {getPatientName(selectedPatient)}</div><div>العمر: {selectedPatient.age} سنة</div><div>الجوال: {selectedPatient.phone || '-'}</div></div><div className="bg-gray-700/30 rounded-lg p-4"><h3 className="font-bold text-white mb-3">المعلومات الطبية</h3><div>التشخيص: {selectedPatient.diagnosis || '-'}</div><div>درجة الحالة: {getSeverityText(selectedPatient.severity)}</div><div>ملاحظات: {selectedPatient.notes || '-'}</div></div></div>)}

            {activeTab === 'progress' && (<div><div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 text-center"><div className="text-5xl font-bold text-white">{Math.round(selectedPatient.progress || 0)}%</div><div className="progress-bar mt-4"><div className="progress-fill" style={{width:`${selectedPatient.progress||0}%`}}>{Math.round(selectedPatient.progress||0)}%</div></div></div><div className="grid grid-cols-2 gap-4 mt-4"><div className="bg-gray-700/30 rounded-lg p-4 text-center"><div className="text-2xl font-bold text-white">{selectedPatient.totalSessions || 0}</div><div>إجمالي الجلسات</div></div><div className="bg-gray-700/30 rounded-lg p-4 text-center"><div className="text-2xl font-bold text-green-400">{selectedPatient.completedSessions || 0}</div><div>الجلسات المكتملة</div></div></div><div className="flex gap-4 justify-center mt-4"><button onClick={()=>handleUpdateSessionProgress(true)} className="bg-green-500/20 text-green-400 px-6 py-2 rounded-lg">تسجيل حضور +1</button><button onClick={()=>handleUpdateSessionProgress(false)} className="bg-red-500/20 text-red-400 px-6 py-2 rounded-lg">تعديل -1</button></div></div>)}

            {/* تبويب الأشعة */}
            {activeTab === 'xrays' && (<div className="space-y-4"><div className="flex justify-between items-center"><h3 className="text-lg font-semibold text-white">الأشعة والصور الشعاعية</h3><button onClick={() => setShowXrayModal(true)} className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-sm"><Plus size={14} /> إضافة أشعة</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{selectedPatient.xrays?.length === 0 ? <p className="text-gray-400 text-center col-span-2 py-8">لا توجد أشعة مسجلة</p> : selectedPatient.xrays.map((xray) => (<div key={xray.id} className="bg-gray-700/50 rounded-lg overflow-hidden border border-gray-600"><div className="p-3 bg-gray-800"><div className="flex justify-between items-start"><div><p className="font-bold text-white">{xray.title}</p><p className="text-xs text-gray-400">{new Date(xray.date).toLocaleDateString()} - {xray.doctorName}</p>{xray.bodyPart && <p className="text-xs text-blue-400 mt-1">منطقة: {getBodyPartText(xray.bodyPart)}</p>}</div><div className="flex gap-2"><button onClick={() => handleViewXray(xray)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"><Eye size={14} /></button><button onClick={() => handleDeleteXray(xray.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 size={14} /></button></div></div>{xray.description && <p className="text-sm text-gray-400 mt-2">{xray.description}</p>}{xray.report && <div className="mt-2 p-2 bg-gray-700 rounded-lg"><p className="text-xs text-gray-300"><span className="font-semibold">تقرير الأشعة:</span> {xray.report}</p></div>}</div></div>))}</div></div>)}

            {activeTab === 'prescriptions' && (<div>{prescriptions.filter(p=>p.patientId===selectedPatient.id).length===0?<p className="text-gray-400 text-center py-8">لا توجد روشتات</p>:prescriptions.filter(p=>p.patientId===selectedPatient.id).map(p=><div key={p.id} className="bg-gray-700/30 rounded-lg p-4 mb-2"><p className="font-bold">{p.prescriptionNumber}</p><p>{new Date(p.prescriptionDate).toLocaleDateString()}</p><div>{p.medications.map((m,i)=><div key={i} className="bg-gray-800 rounded-lg p-2 mt-1"><strong>{m.name}</strong> - {m.dosage} - {m.frequency}</div>)}</div></div>)}</div>)}

            {activeTab === 'reports' && (<div>{selectedPatient.reports?.length===0?<p className="text-gray-400 text-center py-8">لا توجد تقارير</p>:selectedPatient.reports.map(r=><div key={r.id} className="bg-gray-700/30 rounded-lg p-4 mb-2"><div className="flex justify-between"><div><p className="font-bold">{r.title}</p><p className="text-sm">{new Date(r.date).toLocaleDateString()}</p></div><div className="flex gap-2"><button onClick={()=>handleEditReport(r)} className="text-yellow-400"><Edit size={14}/></button><button onClick={()=>handleDeleteReport(r.id)} className="text-red-400"><Trash2 size={14}/></button></div></div><p>{r.content}</p></div>)}<button onClick={()=>setShowReportModal(true)} className="w-full bg-blue-500/20 text-blue-400 py-2 rounded-lg mt-2"><Plus size={16}/> إضافة تقرير</button></div>)}

            {activeTab === 'images' && (<div><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{selectedPatient.images?.map((img,idx)=><div key={img.id} className="bg-gray-700/50 rounded-lg overflow-hidden cursor-pointer" onClick={()=>handleViewImage(selectedPatient.images,idx)}><img src={img.data} className="w-full h-32 object-cover"/><div className="p-2"><p className="text-sm truncate">{img.title}</p><button onClick={(e)=>{e.stopPropagation();handleDeleteImage(img.id)}} className="text-red-400 text-xs">حذف</button></div></div>)}</div><button onClick={()=>setShowImageUpload(true)} className="w-full bg-orange-500/20 text-orange-400 py-2 rounded-lg mt-4"><Upload size={16}/> رفع صورة</button></div>)}
          </div>
        </div>
      )}

      {/* مودال رفع الأشعة */}
      {showXrayModal && (<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"><div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">إضافة أشعة / صورة شعاعية</h2><button onClick={() => setShowXrayModal(false)}><X size={20} className="text-gray-400" /></button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">نوع الأشعة</label><div className="flex gap-2"><button onClick={() => setXrayType('image')} className={`flex-1 py-2 rounded-lg ${xrayType === 'image' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}><Camera size={16} className="inline mr-1" /> صورة أشعة</button><button onClick={() => setXrayType('report')} className={`flex-1 py-2 rounded-lg ${xrayType === 'report' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}><FileText size={16} className="inline mr-1" /> تقرير أشعة فقط</button></div></div><div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">عنوان الأشعة *</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" placeholder="مثال: أشعة الركبة اليمنى" value={xrayTitle} onChange={(e)=>setXrayTitle(e.target.value)} /></div><div><label className="block text-sm text-gray-400 mb-1">تاريخ الأشعة</label><input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={xrayDate} onChange={(e)=>setXrayDate(e.target.value)} /></div><div><label className="block text-sm text-gray-400 mb-1">منطقة الجسم</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={xrayBodyPart} onChange={(e)=>setXrayBodyPart(e.target.value)}><option value="">اختر المنطقة</option><option value="head">الرأس</option><option value="neck">الرقبة</option><option value="chest">الصدر</option><option value="abdomen">البطن</option><option value="spine">العمود الفقري</option><option value="arm">الذراع</option><option value="leg">الساق</option><option value="knee">الركبة</option><option value="hand">اليد</option><option value="foot">القدم</option><option value="other">أخرى</option></select></div><div><label className="block text-sm text-gray-400 mb-1">الطبيب المعالج</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" placeholder="اسم الطبيب" value={xrayDoctor} onChange={(e)=>setXrayDoctor(e.target.value)} /></div><div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">وصف الأشعة</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" placeholder="وصف تفصيلي للأشعة..." value={xrayDesc} onChange={(e)=>setXrayDesc(e.target.value)} /></div>{xrayType === 'image' && (<div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">صورة الأشعة</label><input type="file" accept="image/*" onChange={handleXrayFileSelect} className="w-full p-2 bg-gray-700 rounded-lg text-white" />{xrayFile && <p className="text-sm text-green-400 mt-1">✓ {xrayFile.name}</p>}</div>)}<div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">تقرير الأشعة</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="4" placeholder="اكتب تقرير الأشعة هنا..." value={xrayReport} onChange={(e)=>setXrayReport(e.target.value)} /></div></div><div className="flex gap-3 pt-4 mt-4 border-t border-gray-700"><button onClick={handleUploadXray} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">حفظ الأشعة</button><button onClick={()=>setShowXrayModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div></div></div>)}

      {/* مودال عرض الأشعة */}
      {showXrayViewer && selectedXray && (<div className="fixed inset-0 bg-black/95 backdrop-blur-lg z-50 flex items-center justify-center p-4"><button onClick={()=>setShowXrayViewer(false)} className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"><X size={24}/></button><div className="max-w-4xl w-full max-h-[90vh] overflow-auto"><div className="bg-gray-900 rounded-2xl p-6"><h3 className="text-xl font-bold text-white mb-2">{selectedXray.title}</h3><p className="text-gray-400 text-sm mb-4">{new Date(selectedXray.date).toLocaleDateString()} | {selectedXray.doctorName} | {selectedXray.bodyPart && `منطقة: ${getBodyPartText(selectedXray.bodyPart)}`}</p>{selectedXray.imageData && <img src={selectedXray.imageData} alt={selectedXray.title} className="max-w-full rounded-lg mb-4 border border-gray-700" />}{selectedXray.report && (<div className="bg-gray-800 rounded-lg p-4 mt-4"><h4 className="font-bold text-blue-400 mb-2">تقرير الأشعة</h4><p className="text-gray-300 whitespace-pre-wrap">{selectedXray.report}</p></div>)}<div className="flex gap-3 mt-4"><button onClick={()=>handleDownloadXray(selectedXray)} className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2"><Download size={16}/> تحميل الصورة</button><button onClick={()=>setShowXrayViewer(false)} className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg">إغلاق</button></div></div></div></div>)}

      {showImageUpload && (<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-gray-800 rounded-2xl max-w-md w-full p-6"><h2 className="text-xl font-bold text-white mb-4">رفع صورة طبية</h2><div className="flex gap-2 mb-3"><button onClick={()=>setUploadType('xray')} className={`flex-1 py-2 rounded-lg ${uploadType==='xray'?'bg-blue-500/20 text-blue-400':'bg-gray-700 text-gray-400'}`}>أشعة</button><button onClick={()=>setUploadType('report')} className={`flex-1 py-2 rounded-lg ${uploadType==='report'?'bg-blue-500/20 text-blue-400':'bg-gray-700 text-gray-400'}`}>تقرير</button></div><input type="text" placeholder="عنوان الصورة" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={uploadTitle} onChange={(e)=>setUploadTitle(e.target.value)}/><textarea placeholder="وصف الصورة" className="w-full p-2 bg-gray-700 rounded-lg text-white mt-3" rows="2" value={uploadDesc} onChange={(e)=>setUploadDesc(e.target.value)}/><input type="file" accept="image/*" onChange={handleFileSelect} className="w-full p-2 bg-gray-700 rounded-lg text-white mt-3"/>{selectedFile && <p className="text-sm text-green-400 mt-2">✓ {selectedFile.name}</p>}<div className="flex gap-3 mt-4"><button onClick={handleUploadImage} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">رفع</button><button onClick={()=>setShowImageUpload(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div></div></div>)}

      {showReportModal && (<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-gray-800 rounded-2xl max-w-md w-full p-6"><h2 className="text-xl font-bold text-white mb-4">إضافة تقرير طبي</h2><input type="text" placeholder="عنوان التقرير" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newReport.title} onChange={(e)=>setNewReport({...newReport,title:e.target.value})}/><textarea placeholder="محتوى التقرير" className="w-full p-2 bg-gray-700 rounded-lg text-white mt-3" rows="5" value={newReport.content} onChange={(e)=>setNewReport({...newReport,content:e.target.value})}/><div className="flex gap-3 mt-4"><button onClick={handleAddReport} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">إضافة</button><button onClick={()=>setShowReportModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div></div></div>)}

      {showEditReportModal && (<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-gray-800 rounded-2xl max-w-md w-full p-6"><h2 className="text-xl font-bold text-white mb-4">تعديل التقرير</h2><input type="text" placeholder="عنوان التقرير" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editReportData.title} onChange={(e)=>setEditReportData({...editReportData,title:e.target.value})}/><textarea placeholder="محتوى التقرير" className="w-full p-2 bg-gray-700 rounded-lg text-white mt-3" rows="5" value={editReportData.content} onChange={(e)=>setEditReportData({...editReportData,content:e.target.value})}/><div className="flex gap-3 mt-4"><button onClick={handleSaveReportEdit} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg">حفظ</button><button onClick={()=>setShowEditReportModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div></div></div>)}

      {showPrescriptionModal && (<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"><div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"><h2 className="text-xl font-bold text-white mb-4">إضافة روشتة طبية</h2><div><label>المريض</label><input type="text" value={getPatientName(selectedPatient)} disabled className="w-full p-2 bg-gray-700/50 rounded-lg text-white"/></div><div className="flex justify-between mt-4"><h3 className="text-white font-bold">الأدوية</h3><button onClick={handleAddMedicationField} className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm"><Plus size={14}/> إضافة دواء</button></div>{prescriptionForm.medications.map((med,idx)=><div key={idx} className="bg-gray-700/30 rounded-lg p-3 mt-2"><div className="flex justify-between"><span>دواء #{idx+1}</span>{idx>0 && <button onClick={()=>handleRemoveMedicationField(idx)} className="text-red-400"><Trash2 size={14}/></button>}</div><div className="grid grid-cols-2 gap-2 mt-2"><input type="text" placeholder="اسم الدواء" className="p-2 bg-gray-700 rounded-lg text-white text-sm" value={med.name} onChange={(e)=>handleMedicationFieldChange(idx,'name',e.target.value)}/><input type="text" placeholder="الجرعة" className="p-2 bg-gray-700 rounded-lg text-white text-sm" value={med.dosage} onChange={(e)=>handleMedicationFieldChange(idx,'dosage',e.target.value)}/><input type="text" placeholder="عدد المرات" className="p-2 bg-gray-700 rounded-lg text-white text-sm" value={med.frequency} onChange={(e)=>handleMedicationFieldChange(idx,'frequency',e.target.value)}/><input type="text" placeholder="المدة" className="p-2 bg-gray-700 rounded-lg text-white text-sm" value={med.duration} onChange={(e)=>handleMedicationFieldChange(idx,'duration',e.target.value)}/><textarea placeholder="تعليمات" className="col-span-2 p-2 bg-gray-700 rounded-lg text-white text-sm" rows="1" value={med.instructions} onChange={(e)=>handleMedicationFieldChange(idx,'instructions',e.target.value)}/></div></div>)}<textarea placeholder="ملاحظات" className="w-full p-2 bg-gray-700 rounded-lg text-white mt-4" rows="2" value={prescriptionForm.notes} onChange={(e)=>setPrescriptionForm({...prescriptionForm,notes:e.target.value})}/><div className="flex gap-3 mt-4"><button onClick={handleAddPrescription} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">حفظ</button><button onClick={()=>setShowPrescriptionModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div></div></div>)}

      {showImageViewer && (<div className="fixed inset-0 bg-black/95 backdrop-blur-lg z-50 flex items-center justify-center"><button onClick={()=>setShowImageViewer(false)} className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"><X size={24}/></button><div className="relative max-w-[90vw] max-h-[90vh]"><img src={viewerImages[0]?.data} alt="" className="max-w-full max-h-full object-contain"/></div></div>)}
    </div>
  )
}
