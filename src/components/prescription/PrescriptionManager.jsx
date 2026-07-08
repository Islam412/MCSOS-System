// src/components/prescription/PrescriptionManager.jsx
import { useState, useEffect } from 'react'
import { confirmAlert } from '../../utils/confirmAlert'
import { useTranslation } from 'react-i18next'
import { 
  Pill, Plus, Edit, Trash2, Eye, Printer, Download,
  Calendar, Clock, User, Stethoscope, FileText,
  Search, Filter, RefreshCw, Loader2, Save, X,
  CheckCircle, AlertCircle, Phone, Mail, MapPin,
  TrendingUp, Users, Package, Receipt, Building,
  Wallet, Banknote, ArrowUpRight, ArrowDownRight,
  UserPlus, ClipboardList, Syringe, Activity,
  Heart, Brain, Bone, Microscope, Scissors,
  MessageCircle, Send, Copy, Share2, Bookmark
} from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { prescriptionsService, patientsService, doctorsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

// ========== مفاتيح التخزين في localStorage ==========
const STORAGE_KEYS = {
  PRESCRIPTIONS: 'mcsos_prescriptions_v2',
  PATIENTS: 'mcsos_patients_v2',
  DOCTORS: 'mcsos_doctors_v2'
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

// ========== البيانات الافتراضية ==========
const defaultPrescriptions = [
  {
    id: 1,
    prescriptionNumber: 'RX-2024-0001',
    patientId: '550e8400-e29b-41d4-a716-446655440000',
    patientName: 'أحمد محمد',
    doctorId: '550e8400-e29b-41d4-a716-446655440010',
    doctorName: 'د. أحمد علي',
    date: '2024-01-15',
    medications: [
      { name: 'بروفين 500mg', dosage: 'قرص واحد', frequency: '3 مرات يومياً', duration: '5 أيام', instructions: 'تناول بعد الأكل' }
    ],
    notes: 'تناول بعد الأكل',
    status: 'active'
  },
  {
    id: 2,
    prescriptionNumber: 'RX-2024-0002',
    patientId: '550e8400-e29b-41d4-a716-446655440001',
    patientName: 'سارة حسن',
    doctorId: '550e8400-e29b-41d4-a716-446655440011',
    doctorName: 'د. منى حسن',
    date: '2024-01-20',
    medications: [
      { name: 'بانادول 500mg', dosage: 'قرص واحد', frequency: 'عند الحاجة', duration: '3 أيام', instructions: '' }
    ],
    notes: '',
    status: 'active'
  }
]

const defaultPatients = [
  { id: '550e8400-e29b-41d4-a716-446655440000', name: 'أحمد محمد', phone: '0501111111', email: 'ahmed@example.com' },
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'سارة حسن', phone: '0502222222', email: 'sara@example.com' },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'محمود علي', phone: '0503333333', email: 'mahmoud@example.com' }
]

const defaultDoctors = [
  { id: '550e8400-e29b-41d4-a716-446655440010', name: 'د. أحمد علي', specialization: 'جراحة عظام' },
  { id: '550e8400-e29b-41d4-a716-446655440011', name: 'د. منى حسن', specialization: 'علاج طبيعي' },
  { id: '550e8400-e29b-41d4-a716-446655440012', name: 'د. خالد محمود', specialization: 'أعصاب' }
]

export default function PrescriptionManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language

  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()

  const [prescriptions, setPrescriptions] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingPrescription, setEditingPrescription] = useState(null)
  const [viewingPrescription, setViewingPrescription] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // ========== نموذج الروشتة ==========
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    date: new Date().toISOString().split('T')[0],
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: ''
  })

  // ========== إحصائيات ==========
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    completed: 0
  })

  // ========== تحميل البيانات ==========
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadPatients(),
        loadDoctors(),
        loadPrescriptions()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  // ========== تحميل المرضى ==========
  const loadPatients = async () => {
    try {
      if (isOnline) {
        try {
          const response = await executeWithOfflineSupport(
            () => patientsService.getPatients(),
            'patients',
            getLocalData(STORAGE_KEYS.PATIENTS)
          )
          
          let data = []
          if (response && response.patients) {
            data = response.patients
          } else if (Array.isArray(response)) {
            data = response
          }
          
          if (data.length > 0) {
            setPatients(data)
            localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(data))
            return
          }
        } catch (apiError) {
          console.warn('API patients failed:', apiError)
        }
      }
      
      const saved = getLocalData(STORAGE_KEYS.PATIENTS)
      if (saved && saved.length > 0) {
        setPatients(saved)
      } else {
        setPatients(defaultPatients)
        localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(defaultPatients))
      }
    } catch (error) {
      console.error('Error loading patients:', error)
      const saved = getLocalData(STORAGE_KEYS.PATIENTS)
      setPatients(saved && saved.length > 0 ? saved : defaultPatients)
    }
  }

  // ========== تحميل الأطباء ==========
  const loadDoctors = async () => {
    try {
      if (isOnline) {
        try {
          const response = await executeWithOfflineSupport(
            () => doctorsService.getDoctors(),
            'doctors',
            getLocalData(STORAGE_KEYS.DOCTORS)
          )
          
          let data = []
          if (response && response.doctors) {
            data = response.doctors
          } else if (Array.isArray(response)) {
            data = response
          }
          
          if (data.length > 0) {
            setDoctors(data)
            localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(data))
            return
          }
        } catch (apiError) {
          console.warn('API doctors failed:', apiError)
        }
      }
      
      const saved = getLocalData(STORAGE_KEYS.DOCTORS)
      if (saved && saved.length > 0) {
        setDoctors(saved)
      } else {
        setDoctors(defaultDoctors)
        localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(defaultDoctors))
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
      const saved = getLocalData(STORAGE_KEYS.DOCTORS)
      setDoctors(saved && saved.length > 0 ? saved : defaultDoctors)
    }
  }

  // ========== تحميل الروشتات ==========
  const loadPrescriptions = async () => {
    try {
      if (isOnline) {
        try {
          const response = await executeWithOfflineSupport(
            () => prescriptionsService.getPrescriptions(),
            'prescriptions',
            getLocalData(STORAGE_KEYS.PRESCRIPTIONS)
          )
          
          let data = []
          if (response && response.prescriptions) {
            data = response.prescriptions
          } else if (Array.isArray(response)) {
            data = response
          }
          
          if (data.length > 0) {
            const formattedData = data.map(item => ({
              id: item.id || Date.now(),
              prescriptionNumber: item.prescriptionNumber || item.prescription_number || `RX-${String(item.id).padStart(4, '0')}`,
              patientId: item.patient_id || item.patientId || '',
              patientName: item.patient_name || item.patient?.name || getPatientNameLocal(item.patient_id || item.patientId),
              doctorId: item.doctor_id || item.doctorId || '',
              doctorName: item.doctor_name || item.doctor?.name || getDoctorNameLocal(item.doctor_id || item.doctorId),
              date: item.date || item.created_at || new Date().toISOString().split('T')[0],
              medications: item.medications || item.medicines || [],
              notes: item.notes || '',
              status: item.status || 'active',
              _syncPending: item._syncPending || false
            }))
            
            setPrescriptions(formattedData)
            localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(formattedData))
            calculateStats(formattedData)
            return
          }
        } catch (apiError) {
          console.warn('API prescriptions failed:', apiError)
        }
      }
      
      const saved = getLocalData(STORAGE_KEYS.PRESCRIPTIONS)
      if (saved && saved.length > 0) {
        setPrescriptions(saved)
        calculateStats(saved)
      } else {
        setPrescriptions(defaultPrescriptions)
        localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(defaultPrescriptions))
        calculateStats(defaultPrescriptions)
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error)
      const saved = getLocalData(STORAGE_KEYS.PRESCRIPTIONS)
      setPrescriptions(saved && saved.length > 0 ? saved : defaultPrescriptions)
      calculateStats(saved && saved.length > 0 ? saved : defaultPrescriptions)
    }
  }

  // ========== دوال مساعدة محلية ==========
  const getPatientNameLocal = (patientId) => {
    const patient = patients.find(p => p.id === patientId)
    return patient ? (patient.name || patient.nameAr || patient.nameEn || 'مريض') : 'مريض'
  }

  const getDoctorNameLocal = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId)
    return doctor ? (doctor.name || doctor.nameAr || doctor.nameEn || 'طبيب') : 'طبيب'
  }

  // ========== حساب الإحصائيات ==========
  const calculateStats = (data) => {
    setStats({
      total: data.length,
      active: data.filter(p => p.status === 'active' || p.status === 'active').length,
      expired: data.filter(p => p.status === 'expired' || p.status === 'completed').length,
      completed: data.filter(p => p.status === 'completed').length
    })
  }

  // ========== حفظ الروشتات ==========
  const savePrescriptions = async (newPrescriptions) => {
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(newPrescriptions))
    setPrescriptions(newPrescriptions)
    calculateStats(newPrescriptions)

    if (isOnline) {
      const pending = newPrescriptions.filter(item => item._syncPending)
      for (const item of pending) {
        try {
          const payload = {
            patient_id: item.patientId,
            doctor_id: item.doctorId,
            date: item.date,
            medications: item.medications,
            notes: item.notes || ''
          }
          await prescriptionsService.createPrescription(payload)
          const synced = newPrescriptions.map(p =>
            p.id === item.id ? { ...p, _syncPending: false } : p
          )
          localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(synced))
          setPrescriptions(synced)
          calculateStats(synced)
        } catch (error) {
          console.warn('Failed to sync prescription:', error)
        }
      }
    }
  }

  // ========== دوال مساعدة ==========
  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30"><CheckCircle size={12} className="inline mr-1" /> نشطة</span>
      case 'completed':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30"><CheckCircle size={12} className="inline mr-1" /> مكتملة</span>
      case 'expired':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30"><AlertCircle size={12} className="inline mr-1" /> منتهية</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">{status}</span>
    }
  }

  // ========== فتح نموذج إضافة روشتة ==========
  const handleAddPrescription = () => {
    setEditingPrescription(null)
    setFormData({
      patient_id: '',
      doctor_id: '',
      date: new Date().toISOString().split('T')[0],
      medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      notes: ''
    })
    setShowPrescriptionModal(true)
  }

  // ========== فتح نموذج تعديل روشتة ==========
  const handleEditPrescription = (prescription) => {
    setEditingPrescription(prescription)
    setFormData({
      patient_id: prescription.patientId || '',
      doctor_id: prescription.doctorId || '',
      date: prescription.date || new Date().toISOString().split('T')[0],
      medications: prescription.medications && prescription.medications.length > 0 
        ? prescription.medications.map(m => ({
            name: m.name || '',
            dosage: m.dosage || '',
            frequency: m.frequency || '',
            duration: m.duration || '',
            instructions: m.instructions || ''
          }))
        : [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      notes: prescription.notes || ''
    })
    setShowPrescriptionModal(true)
  }

  // ========== عرض تفاصيل الروشتة ==========
  const handleViewPrescription = (prescription) => {
    setViewingPrescription(prescription)
    setShowViewModal(true)
  }

  // ========== دوال إدارة الأدوية ==========
  const handleAddMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }))
  }

  const handleRemoveMedication = (index) => {
    if (formData.medications.length === 1) {
      toast.error('يجب وجود دواء واحد على الأقل')
      return
    }
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }))
  }

  const handleMedicationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }))
  }

  // ========== حفظ الروشتة ==========
  const handleSavePrescription = async () => {
    if (!formData.patient_id) {
      toast.error('الرجاء اختيار المريض')
      return
    }
    if (!formData.doctor_id) {
      toast.error('الرجاء اختيار الطبيب')
      return
    }

    const validMedications = formData.medications.filter(m => m.name.trim())
    if (validMedications.length === 0) {
      toast.error('الرجاء إضافة دواء واحد على الأقل')
      return
    }

    setIsSubmitting(true)
    try {
      const prescriptionData = {
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        date: formData.date,
        medications: validMedications.map(m => ({
          name: m.name,
          dosage: m.dosage || '',
          frequency: m.frequency || '',
          duration: m.duration || '',
          instructions: m.instructions || ''
        })),
        notes: formData.notes || '',
        status: 'active'
      }

      console.log('📤 Sending prescription data:', JSON.stringify(prescriptionData, null, 2))

      let newPrescription

      if (isOnline) {
        try {
          if (editingPrescription) {
            const response = await prescriptionsService.updatePrescription(editingPrescription.id, prescriptionData)
            newPrescription = response?.prescription || response
          } else {
            const response = await prescriptionsService.createPrescription(prescriptionData)
            newPrescription = response?.prescription || response
          }
        } catch (apiError) {
          console.warn('API save failed, saving locally:', apiError)
          newPrescription = {
            ...prescriptionData,
            id: editingPrescription?.id || Date.now(),
            prescriptionNumber: `RX-${String(Date.now()).slice(-4)}`,
            patientName: getPatientNameLocal(formData.patient_id),
            doctorName: getDoctorNameLocal(formData.doctor_id),
            _syncPending: true
          }
          toast.warning('تم الحفظ محلياً، سيتم المزامنة عند الاتصال')
        }
      } else {
        newPrescription = {
          ...prescriptionData,
          id: editingPrescription?.id || Date.now(),
          prescriptionNumber: `RX-${String(Date.now()).slice(-4)}`,
          patientName: getPatientNameLocal(formData.patient_id),
          doctorName: getDoctorNameLocal(formData.doctor_id),
          _syncPending: true
        }
        toast.info('تم الحفظ في وضع عدم الاتصال')
      }

      let updatedPrescriptions
      if (editingPrescription) {
        updatedPrescriptions = prescriptions.map(p => p.id === editingPrescription.id ? { ...newPrescription, id: editingPrescription.id } : p)
      } else {
        updatedPrescriptions = [newPrescription, ...prescriptions]
      }

      await savePrescriptions(updatedPrescriptions)
      toast.success(editingPrescription ? 'تم تحديث الروشتة' : 'تم إضافة الروشتة')
      setShowPrescriptionModal(false)
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حفظ الروشتة')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== حذف روشتة ==========
  const handleDeletePrescription = async (id) => {
    if (!(await confirmAlert({ title: 'تأكيد', text: 'هل أنت متأكد من حذف هذه الروشتة؟' }))) return

    try {
      if (isOnline) {
        try {
          await prescriptionsService.deletePrescription(id)
        } catch (apiError) {
          console.warn('API delete failed, removing locally:', apiError)
        }
      }

      const updated = prescriptions.filter(p => p.id !== id)
      await savePrescriptions(updated)
      toast.success('تم حذف الروشتة')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حذف الروشتة')
    }
  }

  // ========== طباعة الروشتة ==========
  const handlePrintPrescription = (prescription) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(getPrescriptionHTML(prescription))
      printWindow.document.close()
      printWindow.print()
    }
    toast.success('جاري طباعة الروشتة...')
  }

  // ========== توليد HTML للطباعة ==========
  const getPrescriptionHTML = (prescription) => {
    return `<!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>روشتة طبية - ${prescription.prescriptionNumber}</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box;}
          body{font-family:'Cairo',Arial,sans-serif;background:#e0e0e0;padding:20px;display:flex;justify-content:center;}
          .prescription{max-width:700px;width:100%;background:white;border-radius:10px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.1);}
          .header{background:linear-gradient(135deg,#1e3a5f,#2563eb);color:white;padding:20px;text-align:center;}
          .title{font-size:24px;font-weight:bold;}
          .prescription-number{font-size:14px;opacity:0.8;margin-top:5px;}
          .section{padding:15px 20px;border-bottom:1px solid #e5e7eb;}
          .section-title{font-weight:bold;color:#1e3a5f;font-size:16px;margin-bottom:10px;border-bottom:2px solid #2563eb;display:inline-block;}
          .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;}
          .info-item{display:flex;justify-content:space-between;padding:3px 0;}
          .medication-item{background:#f3f4f6;padding:12px;margin:8px 0;border-radius:8px;border-left:3px solid #2563eb;}
          .med-name{font-weight:bold;color:#1e3a5f;font-size:16px;}
          .med-detail{font-size:14px;color:#4b5563;margin-top:4px;}
          .footer{text-align:center;padding:15px;background:#f8fafc;color:#6b7280;font-size:10px;}
          @media print{body{background:white;padding:0;}.prescription{box-shadow:none;border-radius:0;}}
        </style>
      </head>
      <body>
        <div class="prescription">
          <div class="header">
            <div class="title">روشتة طبية</div>
            <div class="prescription-number">رقم الروشتة: ${prescription.prescriptionNumber}</div>
          </div>
          <div class="section">
            <div class="info-grid">
              <div class="info-item"><span>المريض:</span><strong>${prescription.patientName || 'مريض'}</strong></div>
              <div class="info-item"><span>الطبيب:</span><strong>${prescription.doctorName || 'طبيب'}</strong></div>
              <div class="info-item"><span>التاريخ:</span><strong>${prescription.date}</strong></div>
              <div class="info-item"><span>الحالة:</span><strong>${prescription.status === 'active' ? 'نشطة' : 'مكتملة'}</strong></div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">الأدوية الموصوفة</div>
            ${(prescription.medications || []).map((med, idx) => `
              <div class="medication-item">
                <div class="med-name">${idx + 1}. ${med.name}</div>
                <div class="med-detail">الجرعة: ${med.dosage || '-'} | عدد المرات: ${med.frequency || '-'} | المدة: ${med.duration || '-'}</div>
                ${med.instructions ? `<div class="med-detail">تعليمات: ${med.instructions}</div>` : ''}
              </div>
            `).join('')}
          </div>
          ${prescription.notes ? `
            <div class="section">
              <div class="section-title">ملاحظات</div>
              <p style="margin-top:10px;">${prescription.notes}</p>
            </div>
          ` : ''}
          <div class="footer">
            <p>تم إنشاء هذه الروشتة بواسطة نظام MCSOS</p>
          </div>
        </div>
      </body>
      </html>`
  }

  // ========== تحديث البيانات ==========
  const refreshData = () => {
    loadAllData()
    toast.success('تم تحديث البيانات')
  }

  // ========== تصفية الروشتات ==========
  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.prescriptionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || p.status?.toLowerCase() === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-4" />
          <div className="text-white">جاري التحميل...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">إدارة الروشتات</h1>
          <p className="text-gray-400 mt-1">
            إنشاء وإدارة الروشتات الطبية
            {!isOnline && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                ⚡ غير متصل
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={refreshData} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-purple-500/30 transition">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> تحديث
          </button>
          <button onClick={handleAddPrescription} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-500/30 transition">
            <Plus size={18} /> روشتة جديدة
          </button>
        </div>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">إجمالي الروشتات</p><p className="text-2xl font-bold text-white">{stats.total}</p></div>
            <div className="p-2 bg-blue-500/20 rounded-xl"><FileText className="text-blue-400" size={24} /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">نشطة</p><p className="text-2xl font-bold text-green-400">{stats.active}</p></div>
            <div className="p-2 bg-green-500/20 rounded-xl"><CheckCircle className="text-green-400" size={24} /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl p-4 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">منتهية</p><p className="text-2xl font-bold text-yellow-400">{stats.expired}</p></div>
            <div className="p-2 bg-yellow-500/20 rounded-xl"><AlertCircle className="text-yellow-400" size={24} /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-4 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">مكتملة</p><p className="text-2xl font-bold text-purple-400">{stats.completed}</p></div>
            <div className="p-2 bg-purple-500/20 rounded-xl"><CheckCircle className="text-purple-400" size={24} /></div>
          </div>
        </div>
      </div>

      {/* بحث وتصفية */}
      <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input type="text" placeholder="ابحث عن روشتة..." className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 transition" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 transition" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">جميع الحالات</option>
            <option value="active">نشطة</option>
            <option value="completed">مكتملة</option>
            <option value="expired">منتهية</option>
          </select>
        </div>
      </div>

      {/* جدول الروشتات */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">قائمة الروشتات ({filteredPrescriptions.length})</h2>
          <span className="text-sm text-gray-400">
            {prescriptions.filter(p => p._syncPending).length > 0 && (
              <span className="text-yellow-400">⏳ {prescriptions.filter(p => p._syncPending).length} في انتظار المزامنة</span>
            )}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <th className="px-4 py-3 text-sm text-gray-300">رقم الروشتة</th>
                <th className="px-4 py-3 text-sm text-gray-300">المريض</th>
                <th className="px-4 py-3 text-sm text-gray-300">الطبيب</th>
                <th className="px-4 py-3 text-sm text-gray-300">التاريخ</th>
                <th className="px-4 py-3 text-sm text-gray-300">الأدوية</th>
                <th className="px-4 py-3 text-sm text-gray-300">الحالة</th>
                <th className="px-4 py-3 text-sm text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredPrescriptions.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">لا توجد روشتات</td></tr>
              ) : (
                filteredPrescriptions.map((prescription) => {
                  const isPending = prescription._syncPending === true
                  return (
                    <tr key={prescription.id} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3">
                        <span className="text-blue-400 font-mono">{prescription.prescriptionNumber}</span>
                        {isPending && (
                          <span className="block text-[8px] text-yellow-400">⏳ مزامنة</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">{prescription.patientName}</td>
                      <td className="px-4 py-3 text-gray-300">{prescription.doctorName}</td>
                      <td className="px-4 py-3 text-gray-300">{prescription.date}</td>
                      <td className="px-4 py-3 text-gray-300">{prescription.medications?.length || 0} دواء</td>
                      <td className="px-4 py-3">{getStatusBadge(prescription.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleViewPrescription(prescription)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition" title="عرض"><Eye size={16} /></button>
                          <button onClick={() => handleEditPrescription(prescription)} className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded transition" title="تعديل"><Edit size={16} /></button>
                          <button onClick={() => handlePrintPrescription(prescription)} className="p-1 text-purple-400 hover:bg-purple-500/20 rounded transition" title="طباعة"><Printer size={16} /></button>
                          <button onClick={() => handleDeletePrescription(prescription.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded transition" title="حذف"><Trash2 size={16} /></button>
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

      {/* Modal إضافة/تعديل روشتة */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{editingPrescription ? 'تعديل روشتة' : 'روشتة جديدة'}</h2>
              <button onClick={() => setShowPrescriptionModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
            </div>

            <div className="space-y-4">
              {/* معلومات المريض والطبيب */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">المريض *</label>
                  <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patient_id} onChange={(e) => setFormData({...formData, patient_id: e.target.value})}>
                    <option value="">اختر المريض</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name || p.nameAr || p.nameEn || 'مريض'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">الطبيب *</label>
                  <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.doctor_id} onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}>
                    <option value="">اختر الطبيب</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name || d.nameAr || d.nameEn || 'طبيب'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">التاريخ</label>
                  <input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>

              {/* الأدوية */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm text-gray-400">الأدوية *</label>
                  <button onClick={handleAddMedication} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm hover:bg-green-500/30 transition flex items-center gap-1">
                    <Plus size={14} /> إضافة دواء
                  </button>
                </div>
                {formData.medications.map((med, index) => (
                  <div key={index} className="bg-gray-700/30 rounded-lg p-3 mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">دواء #{index + 1}</span>
                      {index > 0 && <button onClick={() => handleRemoveMedication(index)} className="text-red-400"><Trash2 size={16} /></button>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="md:col-span-2">
                        <input type="text" placeholder="اسم الدواء" className="w-full p-2 bg-gray-700 rounded-lg text-white text-sm" value={med.name} onChange={(e) => handleMedicationChange(index, 'name', e.target.value)} />
                      </div>
                      <div>
                        <input type="text" placeholder="الجرعة" className="w-full p-2 bg-gray-700 rounded-lg text-white text-sm" value={med.dosage} onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)} />
                      </div>
                      <div>
                        <input type="text" placeholder="عدد المرات" className="w-full p-2 bg-gray-700 rounded-lg text-white text-sm" value={med.frequency} onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)} />
                      </div>
                      <div>
                        <input type="text" placeholder="المدة" className="w-full p-2 bg-gray-700 rounded-lg text-white text-sm" value={med.duration} onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <input type="text" placeholder="تعليمات" className="w-full p-2 bg-gray-700 rounded-lg text-white text-sm" value={med.instructions} onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ملاحظات */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">ملاحظات</label>
                <textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="3" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="ملاحظات إضافية..." />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button onClick={handleSavePrescription} disabled={isSubmitting} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin inline mr-1" /> : <Save size={16} className="inline mr-1" />}
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button onClick={() => setShowPrescriptionModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal عرض تفاصيل الروشتة */}
      {showViewModal && viewingPrescription && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">تفاصيل الروشتة</h2>
              <div className="flex gap-2">
                <button onClick={() => handlePrintPrescription(viewingPrescription)} className="p-1 text-purple-400 hover:bg-purple-500/20 rounded transition" title="طباعة"><Printer size={18} /></button>
                <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-gray-400">رقم الروشتة:</span> <span className="text-white font-mono">{viewingPrescription.prescriptionNumber}</span></div>
                  <div><span className="text-gray-400">المريض:</span> <span className="text-white">{viewingPrescription.patientName}</span></div>
                  <div><span className="text-gray-400">الطبيب:</span> <span className="text-white">{viewingPrescription.doctorName}</span></div>
                  <div><span className="text-gray-400">التاريخ:</span> <span className="text-white">{viewingPrescription.date}</span></div>
                  <div><span className="text-gray-400">الحالة:</span> {getStatusBadge(viewingPrescription.status)}</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">الأدوية</h3>
                <div className="space-y-2">
                  {(viewingPrescription.medications || []).map((med, idx) => (
                    <div key={idx} className="bg-gray-700/30 rounded-lg p-3 border border-gray-600">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">{med.name}</p>
                          <div className="text-sm text-gray-400 space-y-1 mt-1">
                            <p>الجرعة: {med.dosage || '-'}</p>
                            <p>عدد المرات: {med.frequency || '-'}</p>
                            <p>المدة: {med.duration || '-'}</p>
                            {med.instructions && <p>تعليمات: {med.instructions}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {viewingPrescription.notes && (
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <span className="text-gray-400">ملاحظات:</span>
                  <p className="text-white mt-1">{viewingPrescription.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => handlePrintPrescription(viewingPrescription)} className="flex-1 bg-purple-500/20 text-purple-400 py-2 rounded-lg hover:bg-purple-500/30 transition flex items-center justify-center gap-2">
                  <Printer size={16} /> طباعة
                </button>
                <button onClick={() => setShowViewModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}