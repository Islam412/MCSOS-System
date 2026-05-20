import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Printer, Plus, Trash2, Edit, Save, X, CheckCircle, User, Stethoscope, Calendar, Clock, Pill, FileText, Hospital, Phone, Mail, MapPin, Building, Syringe, ClipboardList, AlertCircle, Signature, PenTool, UserCheck, Stamp, Upload, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PrescriptionManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language

  const [prescriptions, setPrescriptions] = useState([])
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [showHospitalSettings, setShowHospitalSettings] = useState(false)
  const [signatureType, setSignatureType] = useState('patient')
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])

  const [hospitalInfo, setHospitalInfo] = useState({
    nameAr: 'مستشفى السلام الدولي',
    nameEn: 'Al Salam International Hospital',
    addressAr: 'شارع الملك عبدالعزيز، الرياض',
    addressEn: 'King Abdulaziz Road, Riyadh',
    phone: '+966 12 345 6788',
    email: 'info@alsalamhospital.com',
    licenseNumber: 'HOS-123456',
    logo: null,
    logoPreview: null,
    stamp: null,
    stampPreview: null
  })

  const [formData, setFormData] = useState({
    prescriptionNumber: `RX-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    prescriptionDate: new Date().toISOString().split('T')[0],
    patientId: '',
    patientName: '',
    patientAge: '',
    patientPhone: '',
    patientAddress: '',
    patientSignature: '',
    patientSignatureDate: '',
    doctorId: '',
    doctorName: '',
    doctorSpecialization: '',
    doctorSignature: '',
    doctorSignatureDate: '',
    hospitalStamp: '',
    hospitalStampDate: '',
    // إعدادات إظهار/إخفاء التوقيعات
    showDoctorSignature: true,
    showPatientSignature: true,
    showHospitalStamp: true,
    diagnosis: '',
    notes: '',
    medications: [{ id: 1, name: '', dosage: '', frequency: '', duration: '', durationUnit: 'days', quantity: '', instructions: '', timeOfDay: [] }],
    refillCount: 0,
    isRefillable: false,
    expiryDate: ''
  })

  useEffect(() => {
    loadPatients()
    loadDoctors()
    loadPrescriptions()
    loadHospitalInfo()
  }, [])

  const loadPatients = () => {
    const saved = localStorage.getItem('mcsos_patients_v2')
    if (saved) setPatients(JSON.parse(saved))
    else setPatients([])
    setLoading(false)
  }

  const loadDoctors = () => {
    const saved = localStorage.getItem('mcsos_doctors')
    if (saved) setDoctors(JSON.parse(saved))
    else setDoctors([])
  }

  const loadPrescriptions = () => {
    const saved = localStorage.getItem('mcsos_prescriptions')
    if (saved) setPrescriptions(JSON.parse(saved))
  }

  const loadHospitalInfo = () => {
    const saved = localStorage.getItem('mcsos_hospital_info')
    if (saved) setHospitalInfo(JSON.parse(saved))
  }

  const savePrescriptions = (data) => {
    localStorage.setItem('mcsos_prescriptions', JSON.stringify(data))
    setPrescriptions(data)
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

  const handleStampUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const updated = { ...hospitalInfo, stampPreview: reader.result, stamp: reader.result }
        setHospitalInfo(updated)
        saveHospitalInfo(updated)
        toast.success('تم رفع ختم المستشفى بنجاح')
      }
      reader.readAsDataURL(file)
    }
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

  const handleAddSignature = (type) => {
    setSignatureType(type)
    setShowSignatureModal(true)
  }

  const handleSaveSignature = (signatureData) => {
    const currentDate = new Date().toISOString().split('T')[0]
    if (signatureType === 'patient') {
      setFormData(prev => ({ ...prev, patientSignature: signatureData, patientSignatureDate: currentDate }))
    } else if (signatureType === 'doctor') {
      setFormData(prev => ({ ...prev, doctorSignature: signatureData, doctorSignatureDate: currentDate }))
    } else {
      setFormData(prev => ({ ...prev, hospitalStamp: signatureData, hospitalStampDate: currentDate }))
    }
    setShowSignatureModal(false)
    let name = signatureType === 'patient' ? 'المريض' : signatureType === 'doctor' ? 'الطبيب' : 'المستشفى'
    toast.success(`تم إضافة ${name}`)
  }

  const handleRemoveSignature = (type) => {
    if (type === 'patient') {
      setFormData(prev => ({ ...prev, patientSignature: '', patientSignatureDate: '' }))
    } else if (type === 'doctor') {
      setFormData(prev => ({ ...prev, doctorSignature: '', doctorSignatureDate: '' }))
    } else {
      setFormData(prev => ({ ...prev, hospitalStamp: '', hospitalStampDate: '' }))
    }
    let name = type === 'patient' ? 'المريض' : type === 'doctor' ? 'الطبيب' : 'المستشفى'
    toast.success(`تم إزالة ${name}`)
  }

  const handleAddMedication = () => {
    const newId = Math.max(...formData.medications.map(m => m.id), 0) + 1
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { id: newId, name: '', dosage: '', frequency: '', duration: '', durationUnit: 'days', quantity: '', instructions: '', timeOfDay: [] }]
    }))
  }

  const handleRemoveMedication = (id) => {
    if (formData.medications.length === 1) {
      toast.error('يجب وجود دواء واحد على الأقل')
      return
    }
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m.id !== id)
    }))
  }

  const handleMedicationChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map(m => m.id === id ? { ...m, [field]: value } : m)
    }))
  }

  const handleSavePrescription = () => {
    if (!formData.patientName || !formData.doctorName || formData.medications.length === 0) {
      toast.error('الرجاء إدخال بيانات المريض والطبيب وإضافة دواء واحد على الأقل')
      return
    }

    const validMedications = formData.medications.filter(m => m.name.trim())
    if (validMedications.length === 0) {
      toast.error('الرجاء إضافة دواء واحد على الأقل')
      return
    }

    const newPrescription = {
      id: selectedPrescription?.id || Date.now(),
      ...formData,
      medications: validMedications,
      hospitalName: hospitalInfo.nameAr,
      hospitalAddress: hospitalInfo.addressAr,
      hospitalPhone: hospitalInfo.phone,
      hospitalLogo: hospitalInfo.logoPreview,
      hospitalStampImage: hospitalInfo.stampPreview,
      createdAt: selectedPrescription?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedPrescriptions = selectedPrescription
      ? prescriptions.map(p => p.id === selectedPrescription.id ? newPrescription : p)
      : [newPrescription, ...prescriptions]
    
    savePrescriptions(updatedPrescriptions)
    setShowPrescriptionModal(false)
    resetForm()
    toast.success(selectedPrescription ? 'تم تحديث الروشتة' : 'تم إضافة الروشتة')
  }

  const handleEditPrescription = (prescription) => {
    setSelectedPrescription(prescription)
    setFormData({ ...prescription })
    setShowPrescriptionModal(true)
  }

  const handleDeletePrescription = (id) => {
    if (confirm('هل أنت متأكد من حذف هذه الروشتة؟')) {
      savePrescriptions(prescriptions.filter(p => p.id !== id))
      toast.success('تم حذف الروشتة')
    }
  }

  const resetForm = () => {
    setSelectedPrescription(null)
    setFormData({
      prescriptionNumber: `RX-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      prescriptionDate: new Date().toISOString().split('T')[0],
      patientId: '', patientName: '', patientAge: '', patientPhone: '', patientAddress: '',
      patientSignature: '', patientSignatureDate: '',
      doctorId: '', doctorName: '', doctorSpecialization: '',
      doctorSignature: '', doctorSignatureDate: '',
      hospitalStamp: '', hospitalStampDate: '',
      showDoctorSignature: true,
      showPatientSignature: true,
      showHospitalStamp: true,
      diagnosis: '', notes: '',
      medications: [{ id: 1, name: '', dosage: '', frequency: '', duration: '', durationUnit: 'days', quantity: '', instructions: '', timeOfDay: [] }],
      refillCount: 0, isRefillable: false, expiryDate: ''
    })
  }

  const handlePrint = (prescription) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(getPrintHTML(prescription))
      printWindow.document.close()
      printWindow.print()
    }
    toast.success('جاري الطباعة...')
  }

  const SignatureDraw = ({ onSave, onClose }) => {
    const [isDrawing, setIsDrawing] = useState(false)
    const [ctx, setCtx] = useState(null)
    const [canvas, setCanvas] = useState(null)

    useEffect(() => {
      if (canvas) {
        const context = canvas.getContext('2d')
        context.strokeStyle = '#000'
        context.lineWidth = 2
        context.lineCap = 'round'
        setCtx(context)
      }
    }, [canvas])

    const startDrawing = (e) => {
      setIsDrawing(true)
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) * (canvas.width / rect.width)
      const y = (e.clientY - rect.top) * (canvas.height / rect.height)
      ctx.beginPath()
      ctx.moveTo(x, y)
    }

    const draw = (e) => {
      if (!isDrawing) return
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) * (canvas.width / rect.width)
      const y = (e.clientY - rect.top) * (canvas.height / rect.height)
      ctx.lineTo(x, y)
      ctx.stroke()
    }

    const stopDrawing = () => {
      setIsDrawing(false)
      ctx.beginPath()
    }

    const clearCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    const saveSignature = () => {
      const signatureData = canvas.toDataURL()
      onSave(signatureData)
    }

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">
            {signatureType === 'patient' ? 'توقيع المريض' : signatureType === 'doctor' ? 'توقيع الطبيب' : 'ختم المستشفى'}
          </h2>
          <div className="bg-white rounded-lg p-2">
            <canvas
              ref={ref => setCanvas(ref)}
              width={500}
              height={200}
              style={{ width: '100%', height: '150px', border: '1px solid #ccc', borderRadius: '8px', cursor: 'crosshair' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={clearCanvas} className="flex-1 bg-yellow-500/20 text-yellow-400 py-2 rounded-lg">مسح</button>
            <button onClick={saveSignature} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">حفظ</button>
            <button onClick={onClose} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button>
          </div>
        </div>
      </div>
    )
  }

  const getPrintHTML = (prescription) => {
    const isRTLPrint = isRTL ? 'rtl' : 'ltr'
    
    return `
      <!DOCTYPE html>
      <html dir="${isRTLPrint}" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>روشتة طبية - ${prescription.prescriptionNumber}</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box;}
          body{font-family:'Cairo','Segoe UI',Arial,sans-serif;background:#e0e0e0;padding:15px;display:flex;justify-content:center;min-height:100vh;}
          .prescription{max-width:700px;width:100%;background:white;border-radius:10px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.1);}
          .header{background:linear-gradient(135deg,#1e3a5f,#2563eb);color:white;padding:12px 20px;}
          .header-content{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;}
          .logo-area{display:flex;align-items:center;gap:10px;}
          .logo-img{width:45px;height:45px;background:white;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;}
          .hospital-name{font-size:16px;font-weight:bold;}
          .hospital-details{font-size:9px;opacity:0.85;}
          .prescription-box{background:rgba(255,255,255,0.15);border-radius:8px;padding:6px 15px;text-align:center;}
          .prescription-title{font-size:11px;}
          .prescription-num{font-size:16px;font-weight:bold;}
          .rx-badge{background:#ff9800;padding:2px 10px;border-radius:20px;font-size:10px;margin-top:3px;}
          .info-row{display:flex;justify-content:space-between;padding:6px 12px;background:#f8fafc;border-bottom:1px solid #e5e7eb;font-size:11px;}
          .diagnosis-box{background:#fef3c7;padding:8px 12px;border-bottom:1px solid #e5e7eb;}
          .section-title{font-weight:bold;color:#1e3a5f;padding:8px 12px 4px 12px;font-size:12px;border-bottom:2px solid #2563eb;display:inline-block;margin:0 12px;}
          table{width:96%;margin:10px auto;border-collapse:collapse;font-size:10px;}
          th,td{border:1px solid #e5e7eb;padding:6px 8px;text-align:${isRTLPrint ? 'right' : 'left'};vertical-align:top;}
          th{background:#f1f5f9;font-weight:600;}
          .medication-name{font-weight:bold;color:#1e3a5f;}
          .signatures-section{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:20px 25px;text-align:center;border-top:1px solid #e5e7eb;margin-top:10px;background:#f8fafc;}
          .sign-line{border-top:1px solid #94a3b8;width:120px;margin:8px auto 0;}
          .signature-img{max-width:120px;max-height:50px;margin:5px auto;display:block;}
          .hospital-stamp-img{max-width:100px;max-height:80px;margin:5px auto;display:block;}
          .footer{text-align:center;padding:8px;background:#1e3a5f;color:white;font-size:8px;}
          .doctor-stamp{border:1px dashed #2563eb;padding:5px;border-radius:8px;margin-top:5px;}
          .hidden-signature{display:none;}
          @media print{body{background:white;padding:0;margin:0;}.prescription{box-shadow:none;border-radius:0;}}
        </style>
      </head>
      <body>
        <div class="prescription">
          <div class="header">
            <div class="header-content">
              <div class="logo-area">
                ${prescription.hospitalLogo ? `<img src="${prescription.hospitalLogo}" style="width:45px;height:45px;object-fit:contain;background:white;border-radius:8px;">` : '<div class="logo-img">🏥</div>'}
                <div><div class="hospital-name">${prescription.hospitalName || hospitalInfo.nameAr}</div><div class="hospital-details">${prescription.hospitalAddress || hospitalInfo.addressAr}<br>هاتف: ${prescription.hospitalPhone || hospitalInfo.phone}<br>ترخيص: ${hospitalInfo.licenseNumber}</div></div>
              </div>
              <div class="prescription-box">
                <div class="prescription-title">روشتة طبية</div>
                <div class="prescription-num">${prescription.prescriptionNumber}</div>
                <div class="rx-badge">💊 RX</div>
              </div>
            </div>
          </div>
          
          <div class="info-row"><span>المريض: <strong>${prescription.patientName}</strong></span><span>العمر: ${prescription.patientAge} سنة</span></div>
          <div class="info-row"><span>الطبيب: ${prescription.doctorName}</span><span>التاريخ: ${prescription.prescriptionDate}</span></div>
          ${prescription.doctorSpecialization ? `<div class="info-row"><span>التخصص: ${prescription.doctorSpecialization}</span><span>الجوال: ${prescription.patientPhone || '-'}</span></div>` : ''}
          ${prescription.patientAddress ? `<div class="info-row"><span colspan="2">العنوان: ${prescription.patientAddress}</span></div>` : ''}
          
          ${prescription.diagnosis ? `<div class="diagnosis-box">📋 التشخيص: ${prescription.diagnosis}</div>` : ''}
          
          <div class="section-title">📋 الأدوية الموصوفة</div>
          <table>
            <thead><tr><th style="width:5%">#</th><th style="width:30%">اسم الدواء</th><th style="width:15%">الجرعة</th><th style="width:20%">عدد المرات</th><th style="width:15%">المدة</th><th style="width:15%">تعليمات</th></tr></thead>
            <tbody>
              ${prescription.medications.map((med, idx) => `
              <tr><td style="text-align:center">${idx+1}</td><td class="medication-name">${med.name} ${med.quantity ? `(${med.quantity})` : ''}</td><td>${med.dosage || '-'}</td><td>${med.frequency || '-'}</td><td>${med.duration || '-'} ${med.durationUnit === 'days' ? 'يوم' : med.durationUnit === 'weeks' ? 'أسبوع' : 'شهر'}</td><td>${med.instructions || '-'}</td>
              `).join('')}
            </tbody>
          </table>
          
          ${prescription.notes ? `<div class="diagnosis-box" style="background:#f0fdf4;">📝 ملاحظات: ${prescription.notes}</div>` : ''}
          
          <div class="signatures-section">
            <!-- توقيع المريض -->
            <div>
              <div class="sign-line"></div>
              <p style="margin-top:5px;font-size:10px;">توقيع المريض</p>
              ${prescription.showPatientSignature && prescription.patientSignature ? `<img src="${prescription.patientSignature}" class="signature-img" alt="توقيع المريض">` : '<div style="height:40px;"></div>'}
              ${prescription.patientSignatureDate ? `<p style="font-size:8px;color:#666;">${prescription.patientSignatureDate}</p>` : ''}
            </div>
            
            <!-- توقيع الطبيب -->
            <div>
              <div class="sign-line"></div>
              <p style="margin-top:5px;font-size:10px;">توقيع الطبيب</p>
              ${prescription.showDoctorSignature && prescription.doctorSignature ? `<img src="${prescription.doctorSignature}" class="signature-img" alt="توقيع الطبيب">` : '<div style="height:40px;"></div>'}
              ${prescription.doctorSignatureDate ? `<p style="font-size:8px;color:#666;">${prescription.doctorSignatureDate}</p>` : ''}
              <div class="doctor-stamp"><p style="font-size:9px;">${prescription.doctorName}</p><p style="font-size:8px;color:#2563eb;">${prescription.doctorSpecialization || ''}</p></div>
            </div>
            
            <!-- ختم المستشفى -->
            <div>
              <div class="sign-line"></div>
              <p style="margin-top:5px;font-size:10px;">ختم المستشفى</p>
              ${prescription.showHospitalStamp && (prescription.hospitalStamp || prescription.hospitalStampImage) ? 
                `<img src="${prescription.hospitalStamp || prescription.hospitalStampImage}" class="hospital-stamp-img" alt="ختم المستشفى">` : 
                '<div style="height:40px;"></div>'}
              ${prescription.hospitalStampDate ? `<p style="font-size:8px;color:#666;">${prescription.hospitalStampDate}</p>` : ''}
              <p style="font-size:8px;color:#2563eb;">${hospitalInfo.licenseNumber}</p>
            </div>
          </div>
          
          <div class="footer">
            <p>${prescription.isRefillable ? `🔄 قابل لإعادة الصرف - عدد المرات: ${prescription.refillCount}` : '❌ لا يعاد صرف الروشتة'}</p>
            <p style="margin-top:3px;">تم إنشاء هذه الروشتة بواسطة نظام المركز الطبي MCSOS</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-white">جاري التحميل...</div></div>

  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div><h1 className="text-3xl font-bold gradient-text">الروشتات الطبية</h1><p className="text-gray-400 mt-1">إدارة الروشتات والأدوية الموصوفة</p></div>
        <div className="flex gap-2">
          <button onClick={() => setShowHospitalSettings(true)} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-purple-500/30"><Hospital size={18} /> إعدادات المستشفى</button>
          <button onClick={() => { resetForm(); setShowPrescriptionModal(true); }} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30"><Plus size={18} /> روشتة جديدة</button>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50"><h2 className="text-xl font-bold text-white">قائمة الروشتات</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80"><tr className={`${isRTL ? 'text-right' : 'text-left'}`}><th className="px-4 py-2 text-sm text-gray-300">الرقم</th><th className="px-4 py-2 text-sm text-gray-300">المريض</th><th className="px-4 py-2 text-sm text-gray-300">الطبيب</th><th className="px-4 py-2 text-sm text-gray-300">التاريخ</th><th className="px-4 py-2 text-sm text-gray-300">الأدوية</th><th className="px-4 py-2 text-sm text-gray-300">إجراءات</th></tr></thead>
            <tbody className="divide-y divide-gray-700/50">
              {prescriptions.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">لا توجد روشتات</td></tr>
              ) : (
                prescriptions.map((pres) => (
                  <tr key={pres.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-2 text-blue-400 text-sm">{pres.prescriptionNumber}</td>
                    <td className="px-4 py-2"><div className="font-semibold text-white">{pres.patientName}</div><div className="text-xs text-gray-400">{pres.patientAge} سنة</div></td>
                    <td className="px-4 py-2 text-gray-300 text-sm">{pres.doctorName}</td>
                    <td className="px-4 py-2 text-gray-400 text-sm">{new Date(pres.prescriptionDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-gray-300 text-sm">{pres.medications.filter(m => m.name).length} أدوية</td>
                    <td className="px-4 py-2"><div className="flex gap-2"><button onClick={() => handleEditPrescription(pres)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"><Edit size={16} /></button><button onClick={() => handlePrint(pres)} className="p-1 text-green-400 hover:bg-green-500/20 rounded"><Printer size={16} /></button><button onClick={() => handleDeletePrescription(pres.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 size={16} /></button></div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal إعدادات المستشفى */}
      {showHospitalSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">إعدادات المستشفى</h2><button onClick={() => setShowHospitalSettings(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>
            <div className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-3"><label className="block text-sm text-gray-400 mb-2">شعار المستشفى</label><div className="flex items-center gap-4">{hospitalInfo.logoPreview && <img src={hospitalInfo.logoPreview} alt="الشعار" className="w-20 h-20 object-contain border rounded p-1 bg-white" />}<label className="cursor-pointer bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2"><Upload size={18} /> رفع شعار</label><input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" /></div></div>
              <div className="bg-gray-700/30 rounded-lg p-3"><label className="block text-sm text-gray-400 mb-2">ختم المستشفى</label><div className="flex items-center gap-4">{hospitalInfo.stampPreview && <img src={hospitalInfo.stampPreview} alt="الختم" className="w-20 h-20 object-contain border rounded p-1 bg-white" />}<label className="cursor-pointer bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2"><Stamp size={18} /> رفع ختم</label><input type="file" accept="image/*" onChange={handleStampUpload} className="hidden" /></div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm text-gray-400 mb-1">اسم المستشفى</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={hospitalInfo.nameAr} onChange={(e) => setHospitalInfo({...hospitalInfo, nameAr: e.target.value})} /></div><div><label className="block text-sm text-gray-400 mb-1">العنوان</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={hospitalInfo.addressAr} onChange={(e) => setHospitalInfo({...hospitalInfo, addressAr: e.target.value})} /></div><div><label className="block text-sm text-gray-400 mb-1">رقم الهاتف</label><input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={hospitalInfo.phone} onChange={(e) => setHospitalInfo({...hospitalInfo, phone: e.target.value})} /></div><div><label className="block text-sm text-gray-400 mb-1">رقم الترخيص</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={hospitalInfo.licenseNumber} onChange={(e) => setHospitalInfo({...hospitalInfo, licenseNumber: e.target.value})} /></div></div>
              <div className="flex gap-3 pt-4"><button onClick={() => { saveHospitalInfo(hospitalInfo); setShowHospitalSettings(false); }} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">حفظ</button><button onClick={() => setShowHospitalSettings(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div>
            </div>
          </div>
        </div>
      )}

      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">{selectedPrescription ? 'تعديل روشتة' : 'روشتة جديدة'}</h2><button onClick={() => setShowPrescriptionModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-700/30 rounded-lg">
              <h3 className="col-span-2 font-bold text-white text-lg mb-2">بيانات المريض والطبيب</h3>
              <div><label className="block text-sm text-gray-400 mb-1">المريض *</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientId} onChange={(e) => handleSelectPatient(e.target.value)}><option value="">اختر المريض</option>{patients.map(p => (<option key={p.id} value={p.id}>{currentLang === 'ar' ? p.nameAr : p.nameEn}</option>))}</select></div>
              <div><label className="block text-sm text-gray-400 mb-1">الطبيب *</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.doctorId} onChange={(e) => handleSelectDoctor(e.target.value)}><option value="">اختر الطبيب</option>{doctors.map(d => (<option key={d.id} value={d.id}>{currentLang === 'ar' ? d.nameAr : d.nameEn}</option>))}</select></div>
              <div><label className="block text-sm text-gray-400 mb-1">العمر</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientAge} onChange={(e) => setFormData({...formData, patientAge: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">رقم الجوال</label><input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientPhone} onChange={(e) => setFormData({...formData, patientPhone: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">العنوان</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientAddress} onChange={(e) => setFormData({...formData, patientAddress: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">تاريخ الروشتة</label><input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.prescriptionDate} onChange={(e) => setFormData({...formData, prescriptionDate: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">تاريخ الصلاحية</label><input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} /></div>
            </div>

            {/* التوقيعات - مع خيارات الإظهار/الإخفاء */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-700/30 rounded-lg">
              <h3 className="col-span-3 font-bold text-white text-lg mb-2 flex items-center justify-between">
                <span>التوقيعات والأختام (اختيارية)</span>
                <span className="text-xs text-gray-400">يمكنك إظهار أو إخفاء كل توقيع حسب الرغبة</span>
              </h3>
              
              {/* توقيع المريض */}
              <div className="border border-gray-600 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.showPatientSignature} onChange={(e) => setFormData({...formData, showPatientSignature: e.target.checked})} className="w-4 h-4" />
                    <span className="text-white flex items-center gap-1"><User size={14} /> توقيع المريض</span>
                  </label>
                  <div className="flex gap-1">
                    {formData.showPatientSignature ? <Eye size={14} className="text-green-400" /> : <EyeOff size={14} className="text-gray-500" />}
                    <button onClick={() => handleAddSignature('patient')} className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs flex items-center gap-1"><PenTool size={12} /> إضافة</button>
                  </div>
                </div>
                {formData.patientSignature && (
                  <div className="mt-2 p-2 bg-gray-700 rounded-lg">
                    <img src={formData.patientSignature} alt="توقيع المريض" className="h-10 object-contain" />
                    <button onClick={() => handleRemoveSignature('patient')} className="text-red-400 text-xs mt-1 w-full">إزالة</button>
                  </div>
                )}
                {!formData.patientSignature && <p className="text-xs text-gray-500 mt-2 text-center">لا يوجد توقيع</p>}
              </div>

              {/* توقيع الطبيب */}
              <div className="border border-gray-600 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.showDoctorSignature} onChange={(e) => setFormData({...formData, showDoctorSignature: e.target.checked})} className="w-4 h-4" />
                    <span className="text-white flex items-center gap-1"><Stethoscope size={14} /> توقيع الطبيب</span>
                  </label>
                  <div className="flex gap-1">
                    {formData.showDoctorSignature ? <Eye size={14} className="text-green-400" /> : <EyeOff size={14} className="text-gray-500" />}
                    <button onClick={() => handleAddSignature('doctor')} className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs flex items-center gap-1"><PenTool size={12} /> إضافة</button>
                  </div>
                </div>
                {formData.doctorSignature && (
                  <div className="mt-2 p-2 bg-gray-700 rounded-lg">
                    <img src={formData.doctorSignature} alt="توقيع الطبيب" className="h-10 object-contain" />
                    <button onClick={() => handleRemoveSignature('doctor')} className="text-red-400 text-xs mt-1 w-full">إزالة</button>
                  </div>
                )}
                {!formData.doctorSignature && <p className="text-xs text-gray-500 mt-2 text-center">لا يوجد توقيع</p>}
              </div>

              {/* ختم المستشفى */}
              <div className="border border-gray-600 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.showHospitalStamp} onChange={(e) => setFormData({...formData, showHospitalStamp: e.target.checked})} className="w-4 h-4" />
                    <span className="text-white flex items-center gap-1"><Stamp size={14} /> ختم المستشفى</span>
                  </label>
                  <div className="flex gap-1">
                    {formData.showHospitalStamp ? <Eye size={14} className="text-green-400" /> : <EyeOff size={14} className="text-gray-500" />}
                    <button onClick={() => handleAddSignature('hospital')} className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs flex items-center gap-1"><Stamp size={12} /> إضافة</button>
                  </div>
                </div>
                {formData.hospitalStamp && (
                  <div className="mt-2 p-2 bg-gray-700 rounded-lg">
                    <img src={formData.hospitalStamp} alt="ختم المستشفى" className="h-10 object-contain" />
                    <button onClick={() => handleRemoveSignature('hospital')} className="text-red-400 text-xs mt-1 w-full">إزالة</button>
                  </div>
                )}
                {!formData.hospitalStamp && <p className="text-xs text-gray-500 mt-2 text-center">لا يوجد ختم</p>}
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-700/30 rounded-lg"><label className="block text-sm text-gray-400 mb-1">التشخيص</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} placeholder="أدخل التشخيص الطبي..." /></div>

            <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
              <div className="flex justify-between items-center mb-3"><h3 className="font-bold text-white text-lg flex items-center gap-2"><Pill size={18} className="text-green-400" /> الأدوية الموصوفة</h3><button onClick={handleAddMedication} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm flex items-center gap-1"><Plus size={14} /> إضافة دواء</button></div>
              {formData.medications.map((med, idx) => (
                <div key={med.id} className="bg-gray-700/50 rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-center mb-2"><span className="text-sm text-gray-400">الدواء #{idx+1}</span>{idx > 0 && <button onClick={() => handleRemoveMedication(med.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2"><label className="block text-xs text-gray-400 mb-1">اسم الدواء *</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" placeholder="مثال: بروفين 500mg" value={med.name} onChange={(e) => handleMedicationChange(med.id, 'name', e.target.value)} /></div>
                    <div><label className="block text-xs text-gray-400 mb-1">الجرعة</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" placeholder="مثال: قرص واحد" value={med.dosage} onChange={(e) => handleMedicationChange(med.id, 'dosage', e.target.value)} /></div>
                    <div><label className="block text-xs text-gray-400 mb-1">عدد المرات</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" placeholder="مثال: 3 مرات يومياً" value={med.frequency} onChange={(e) => handleMedicationChange(med.id, 'frequency', e.target.value)} /></div>
                    <div><label className="block text-xs text-gray-400 mb-1">المدة</label><div className="flex gap-2"><input type="number" className="flex-1 p-2 bg-gray-700 rounded-lg text-white" placeholder="المدة" value={med.duration} onChange={(e) => handleMedicationChange(med.id, 'duration', e.target.value)} /><select className="w-24 p-2 bg-gray-700 rounded-lg text-white" value={med.durationUnit} onChange={(e) => handleMedicationChange(med.id, 'durationUnit', e.target.value)}><option value="days">أيام</option><option value="weeks">أسابيع</option><option value="months">شهور</option></select></div></div>
                    <div><label className="block text-xs text-gray-400 mb-1">الكمية</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" placeholder="مثال: 30 قرص" value={med.quantity} onChange={(e) => handleMedicationChange(med.id, 'quantity', e.target.value)} /></div>
                    <div className="md:col-span-2"><label className="block text-xs text-gray-400 mb-1">تعليمات الاستخدام</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="1" placeholder="تعليمات إضافية..." value={med.instructions} onChange={(e) => handleMedicationChange(med.id, 'instructions', e.target.value)} /></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6 p-4 bg-gray-700/30 rounded-lg"><label className="block text-sm text-gray-400 mb-1">ملاحظات إضافية</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="ملاحظات إضافية عن الروشتة..." /></div>

            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-700/30 rounded-lg">
              <div><label className="block text-sm text-gray-400 mb-1">قابل لإعادة الصرف</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.isRefillable} onChange={(e) => setFormData({...formData, isRefillable: e.target.value === 'true'})}><option value="false">لا</option><option value="true">نعم</option></select></div>
              {formData.isRefillable && <div><label className="block text-sm text-gray-400 mb-1">عدد مرات إعادة الصرف</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.refillCount} onChange={(e) => setFormData({...formData, refillCount: parseInt(e.target.value)})} min="0" max="10" /></div>}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-700"><button onClick={handleSavePrescription} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30">حفظ الروشتة</button><button onClick={() => setShowPrescriptionModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500">إلغاء</button></div>
          </div>
        </div>
      )}

      {showSignatureModal && (
        <SignatureDraw 
          onSave={handleSaveSignature}
          onClose={() => setShowSignatureModal(false)}
        />
      )}
    </div>
  )
}
