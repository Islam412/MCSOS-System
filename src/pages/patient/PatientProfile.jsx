import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  User, Calendar, Phone, Mail, MapPin, Activity, Pill, FileText, 
  Image, Camera, Printer, Download, Plus, Trash2, Edit, Save, X,
  CheckCircle, XCircle, Clock, TrendingUp, Stethoscope, Syringe,
  ClipboardList, AlertCircle, Eye, Upload, Search
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function PatientProfile() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language

  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [uploadType, setUploadType] = useState('xray')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDesc, setUploadDesc] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [viewerImages, setViewerImages] = useState([])
  const [showReportModal, setShowReportModal] = useState(false)
  const [newReport, setNewReport] = useState({ title: '', content: '', type: 'medical' })
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [prescriptions, setPrescriptions] = useState([])
  const [prescriptionForm, setPrescriptionForm] = useState({
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: ''
  })

  useEffect(() => {
    loadPatients()
    loadPrescriptions()
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

  const updatePatient = (updatedPatient) => {
    const updatedPatients = patients.map(p => p.id === updatedPatient.id ? updatedPatient : p)
    setPatients(updatedPatients)
    localStorage.setItem('mcsos_patients_v2', JSON.stringify(updatedPatients))
    setSelectedPatient(updatedPatient)
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
    
    return `
      <!DOCTYPE html>
      <html dir="${isRTLPrint}" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير حالة المريض - ${getPatientName(patient)}</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box;}
          body{font-family:'Cairo',Arial,sans-serif;background:#e0e0e0;padding:20px;}
          .report{max-width:800px;margin:0 auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.1);}
          .header{background:linear-gradient(135deg,#1e3a5f,#2563eb);color:white;padding:20px;text-align:center;}
          .header h1{font-size:24px;margin-bottom:5px;}
          .section{padding:15px 20px;border-bottom:1px solid #e5e7eb;}
          .section-title{font-weight:bold;color:#1e3a5f;font-size:18px;margin-bottom:15px;border-bottom:2px solid #2563eb;display:inline-block;}
          .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;}
          .info-item{display:flex;justify-content:space-between;padding:5px 0;}
          .progress-bar{background:#e5e7eb;border-radius:10px;height:20px;margin:10px 0;}
          .progress-fill{background:#2563eb;border-radius:10px;height:20px;width:${patient.progress || 0}%;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;}
          table{width:100%;border-collapse:collapse;margin-top:10px;}
          th,td{border:1px solid #e5e7eb;padding:8px;text-align:${isRTLPrint ? 'right' : 'left'};}
          .footer{text-align:center;padding:15px;background:#f8fafc;color:#6b7280;font-size:10px;}
          @media print{body{background:white;padding:0;}.report{box-shadow:none;border-radius:0;}}
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
      </html>
    `
  }

  const filteredPatients = patients.filter(p => 
    getPatientName(p).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone && p.phone.includes(searchTerm))
  )

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-white">جاري التحميل...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold gradient-text">ملف المريض</h1><p className="text-gray-400 mt-1">إدارة بيانات المرضى ومتابعة الحالة</p></div>
      </div>

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
            <thead className="bg-gray-800/80"><tr><th className="px-4 py-3 text-sm text-gray-300">المريض</th><th className="px-4 py-3 text-sm text-gray-300">العمر</th><th className="px-4 py-3 text-sm text-gray-300">التشخيص</th><th className="px-4 py-3 text-sm text-gray-300">الجلسات</th><th className="px-4 py-3 text-sm text-gray-300">التقدم</th><th className="px-4 py-3 text-sm text-gray-300">الحالة</th><th className="px-4 py-3 text-sm text-gray-300">إجراءات</th></tr></thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredPatients.length === 0 ? <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">لا يوجد مرضى</td></tr> : filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-700/30 cursor-pointer" onClick={() => { setSelectedPatient(patient); setShowPatientModal(true); }}>
                  <td className="px-4 py-3 font-semibold text-white">{getPatientName(patient)}</td>
                  <td className="px-4 py-3 text-gray-300">{patient.age}</td>
                  <td className="px-4 py-3 text-gray-300">{patient.diagnosis || '-'}</td>
                  <td className="px-4 py-3 text-gray-300">{patient.completedSessions || 0}/{patient.totalSessions || 0}</td>
                  <td className="px-4 py-3"><div className="w-24 bg-gray-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${patient.progress || 0}%` }}></div></div></td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">{patient.status === 'completed' ? 'مكتمل' : 'نشط'}</span></td>
                  <td className="px-4 py-3"><button onClick={(e) => { e.stopPropagation(); setSelectedPatient(patient); setShowPatientModal(true); }} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"><Eye size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">{getPatientName(selectedPatient)}</h2>
              <div className="flex gap-2">
                <button onClick={handlePrintReport} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm"><Printer size={16} /> تقرير</button>
                <button onClick={() => setShowPrescriptionModal(true)} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm"><Pill size={16} /> روشتة</button>
                <button onClick={() => setShowReportModal(true)} className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-lg text-sm"><FileText size={16} /> تقرير</button>
                <button onClick={() => setShowImageUpload(true)} className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-lg text-sm"><Upload size={16} /> صورة</button>
                <button onClick={() => setShowPatientModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} /></button>
              </div>
            </div>

            <div className="flex gap-2 border-b border-gray-700 mb-4">
              <button onClick={() => setActiveTab('info')} className={`px-4 py-2 text-sm rounded-t-lg ${activeTab === 'info' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>معلومات</button>
              <button onClick={() => setActiveTab('progress')} className={`px-4 py-2 text-sm rounded-t-lg ${activeTab === 'progress' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>التقدم</button>
              <button onClick={() => setActiveTab('prescriptions')} className={`px-4 py-2 text-sm rounded-t-lg ${activeTab === 'prescriptions' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>الروشتات</button>
              <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 text-sm rounded-t-lg ${activeTab === 'reports' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>التقارير</button>
              <button onClick={() => setActiveTab('images')} className={`px-4 py-2 text-sm rounded-t-lg ${activeTab === 'images' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>الصور</button>
            </div>

            {activeTab === 'info' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-4"><h3 className="font-bold text-white mb-3">المعلومات الشخصية</h3><div className="space-y-2"><div className="flex justify-between"><span className="text-gray-400">الاسم:</span><span className="text-white">{getPatientName(selectedPatient)}</span></div><div className="flex justify-between"><span className="text-gray-400">العمر:</span><span className="text-white">{selectedPatient.age} سنة</span></div><div className="flex justify-between"><span className="text-gray-400">الجوال:</span><span className="text-white">{selectedPatient.phone || '-'}</span></div></div></div>
                <div className="bg-gray-700/30 rounded-lg p-4"><h3 className="font-bold text-white mb-3">المعلومات الطبية</h3><div className="space-y-2"><div className="flex justify-between"><span className="text-gray-400">التشخيص:</span><span className="text-white">{selectedPatient.diagnosis || '-'}</span></div><div className="flex justify-between"><span className="text-gray-400">درجة الحالة:</span><span className={getSeverityColor(selectedPatient.severity)}>{getSeverityText(selectedPatient.severity)}</span></div></div></div>
              </div>
            )}

            {activeTab === 'progress' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 text-center"><div className="text-5xl font-bold text-white mb-2">{Math.round(selectedPatient.progress || 0)}%</div><p className="text-gray-300">نسبة التقدم</p><div className="w-full bg-gray-700 rounded-full h-3 mt-4"><div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" style={{ width: `${selectedPatient.progress || 0}%` }}></div></div></div>
                <div className="grid grid-cols-2 gap-4"><div className="bg-gray-700/30 rounded-lg p-4 text-center"><div className="text-2xl font-bold text-white">{selectedPatient.totalSessions || 0}</div><div className="text-sm text-gray-400">إجمالي الجلسات</div></div><div className="bg-gray-700/30 rounded-lg p-4 text-center"><div className="text-2xl font-bold text-green-400">{selectedPatient.completedSessions || 0}</div><div className="text-sm text-gray-400">الجلسات المكتملة</div></div></div>
                <div className="flex gap-4 justify-center"><button onClick={() => handleUpdateSessionProgress(true)} className="bg-green-500/20 text-green-400 px-6 py-2 rounded-lg">تسجيل حضور +1</button><button onClick={() => handleUpdateSessionProgress(false)} className="bg-red-500/20 text-red-400 px-6 py-2 rounded-lg">تعديل -1</button></div>
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="space-y-3">
                {prescriptions.filter(p => p.patientId === selectedPatient.id).length === 0 ? <p className="text-gray-400 text-center py-8">لا توجد روشتات</p> : prescriptions.filter(p => p.patientId === selectedPatient.id).map((pres) => (
                  <div key={pres.id} className="bg-gray-700/30 rounded-lg p-4"><p className="font-bold text-white">{pres.prescriptionNumber}</p><p className="text-sm text-gray-400">{new Date(pres.prescriptionDate).toLocaleDateString()}</p><div className="mt-2 space-y-2">{pres.medications.map((med, idx) => (<div key={idx} className="bg-gray-800 rounded-lg p-2"><p className="font-semibold text-white">{med.name}</p><p className="text-xs text-gray-400">{med.dosage} | {med.frequency} | {med.duration}</p></div>))}</div></div>
                ))}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-3">
                {selectedPatient.reports?.length === 0 ? <p className="text-gray-400 text-center py-8">لا توجد تقارير</p> : selectedPatient.reports.map((report) => (
                  <div key={report.id} className="bg-gray-700/30 rounded-lg p-4"><p className="font-bold text-white">{report.title}</p><p className="text-sm text-gray-400">{new Date(report.date).toLocaleDateString()}</p><p className="text-gray-300 mt-2">{report.content}</p></div>
                ))}
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedPatient.images?.map((img, idx) => (<div key={img.id} className="bg-gray-700/50 rounded-lg overflow-hidden cursor-pointer" onClick={() => handleViewImage(selectedPatient.images, idx)}><img src={img.data} alt={img.title} className="w-full h-32 object-cover" /><div className="p-2"><p className="text-sm text-white truncate">{img.title}</p><button onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }} className="text-red-400 text-xs">حذف</button></div></div>))}
                </div>
                {(!selectedPatient.images || selectedPatient.images.length === 0) && <p className="text-gray-400 text-center py-8">لا توجد صور</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {showImageUpload && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">رفع صورة طبية</h2>
            <div className="space-y-3">
              <div className="flex gap-2"><button onClick={() => setUploadType('xray')} className="flex-1 py-2 rounded-lg bg-blue-500/20 text-blue-400">أشعة</button><button onClick={() => setUploadType('report')} className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-400">تقرير</button></div>
              <input type="text" placeholder="عنوان الصورة" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} />
              <textarea placeholder="وصف الصورة" className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} />
              <input type="file" accept="image/*" onChange={handleFileSelect} className="w-full p-2 bg-gray-700 rounded-lg text-white" />
              {selectedFile && <p className="text-sm text-green-400">✓ {selectedFile.name}</p>}
              <div className="flex gap-3 pt-4"><button onClick={handleUploadImage} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">رفع</button><button onClick={() => setShowImageUpload(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">إضافة تقرير طبي</h2>
            <div className="space-y-3"><input type="text" placeholder="عنوان التقرير" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newReport.title} onChange={(e) => setNewReport({...newReport, title: e.target.value})} /><textarea placeholder="محتوى التقرير" className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="5" value={newReport.content} onChange={(e) => setNewReport({...newReport, content: e.target.value})} /><div className="flex gap-3"><button onClick={handleAddReport} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">إضافة</button><button onClick={() => setShowReportModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div></div>
          </div>
        </div>
      )}

      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">إضافة روشتة طبية</h2>
            <div className="space-y-4">
              <div><label className="block text-sm text-gray-400 mb-1">المريض</label><input type="text" value={getPatientName(selectedPatient)} disabled className="w-full p-2 bg-gray-700/50 rounded-lg text-white" /></div>
              <div className="flex justify-between"><h3 className="text-white font-bold">الأدوية</h3><button onClick={handleAddMedicationField} className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm"><Plus size={14} /> إضافة دواء</button></div>
              {prescriptionForm.medications.map((med, idx) => (<div key={idx} className="bg-gray-700/30 rounded-lg p-3"><div className="flex justify-between mb-2"><span>دواء #{idx+1}</span>{idx > 0 && <button onClick={() => handleRemoveMedicationField(idx)} className="text-red-400"><Trash2 size={14} /></button>}</div><div className="grid grid-cols-2 gap-2"><input type="text" placeholder="اسم الدواء" className="p-2 bg-gray-700 rounded-lg text-white text-sm" value={med.name} onChange={(e) => handleMedicationFieldChange(idx, 'name', e.target.value)} /><input type="text" placeholder="الجرعة" className="p-2 bg-gray-700 rounded-lg text-white text-sm" value={med.dosage} onChange={(e) => handleMedicationFieldChange(idx, 'dosage', e.target.value)} /><input type="text" placeholder="عدد المرات" className="p-2 bg-gray-700 rounded-lg text-white text-sm" value={med.frequency} onChange={(e) => handleMedicationFieldChange(idx, 'frequency', e.target.value)} /><input type="text" placeholder="المدة" className="p-2 bg-gray-700 rounded-lg text-white text-sm" value={med.duration} onChange={(e) => handleMedicationFieldChange(idx, 'duration', e.target.value)} /><textarea placeholder="تعليمات" className="w-full p-2 bg-gray-700 rounded-lg text-white text-sm" rows="1" value={med.instructions} onChange={(e) => handleMedicationFieldChange(idx, 'instructions', e.target.value)} /></div></div>))}
              <textarea placeholder="ملاحظات" className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={prescriptionForm.notes} onChange={(e) => setPrescriptionForm({...prescriptionForm, notes: e.target.value})} />
              <div className="flex gap-3 pt-4"><button onClick={handleAddPrescription} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">حفظ</button><button onClick={() => setShowPrescriptionModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div>
            </div>
          </div>
        </div>
      )}

      {showImageViewer && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-lg z-50 flex items-center justify-center">
          <button onClick={() => setShowImageViewer(false)} className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"><X size={24} /></button>
          <div className="relative max-w-[90vw] max-h-[90vh]"><img src={viewerImages[0]?.data} alt="" className="max-w-full max-h-full object-contain" /></div>
        </div>
      )}
    </div>
  )
}
