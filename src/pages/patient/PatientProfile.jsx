// src/pages/patient/PatientProfile.jsx
import { useState, useEffect } from 'react'
import { confirmAlert } from '../../utils/confirmAlert'
import { useTranslation } from 'react-i18next'
import { 
  User, Calendar, Phone, Mail, MapPin, Activity, Pill, FileText, 
  Image, Camera, Printer, Download, Plus, Trash2, Edit, Save, X,
  CheckCircle, XCircle, Clock, TrendingUp, Stethoscope, Syringe,
  ClipboardList, AlertCircle, Eye, Upload, Search, UserPlus, PenBox,
  Bone, Microscope, FileImage, Scissors, Droplet, Heart, Brain,
  Loader2, RefreshCw, ChevronLeft, ChevronRight, LayoutGrid, List,
  Paperclip, ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'
import { compressImage } from '../../utils/imageCompressor'

// ========== استيراد الخدمات ==========
import { patientsService, prescriptionsService } from '../../services/api'
import { getToken } from '../../services/api/client'
import { API_BASE } from '../../services/api/config'
import { useServices } from '../../context/ServiceContext'
import AddPatientModal from '../../components/common/AddPatientModal'

export default function PatientProfile() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language

  // ========== استخدام خدمات API ==========
  const { isOnline } = useServices()

  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  const [showEditPatientModal, setShowEditPatientModal] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [chart, setChart] = useState({ sessions: [], packages: [], services: [] })
  const [packageLines, setPackageLines] = useState([{ service_id: '', session_count: 1 }])
  const [showPackageForm, setShowPackageForm] = useState(false)
  const [savingPackage, setSavingPackage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('cards') // 'cards' (Row Cards like daily follow-up) or 'table'
  const itemsPerPage = 10
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])
  const [apiError, setApiError] = useState(null)
  
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
    notes: '',
    prescriptionFile: '',
    fileName: '',
    fileType: ''
  })
  
  const [newPatient, setNewPatient] = useState({
    nameAr: '', nameEn: '', nameFr: '',
    age: '', phone: '', email: '',
    whatsapp_number: '',
    sameAsPhone: true,
    referral_source: '',
    national_id_photo: '',
    diagnosis: '', severity: 'moderate',
    totalSessions: 6, completedSessions: 0,
    status: 'active', progress: 0,
    notes: '',
    gender: 'male',
    address: ''
  })

  const [editPatient, setEditPatient] = useState({
    id: '', nameAr: '', nameEn: '', nameFr: '',
    age: '', phone: '', email: '',
    whatsapp_number: '',
    sameAsPhone: true,
    referral_source: '',
    national_id_photo: '',
    diagnosis: '', severity: 'moderate',
    totalSessions: 6, completedSessions: 0,
    status: 'active', notes: '',
    gender: 'male',
    address: ''
  })

  // ========== تحميل البيانات ==========
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    setApiError(null)
    try {
      await Promise.all([
        loadPatients(),
        loadPrescriptions()
      ])
    } catch (error) {
      console.error('Error loading patient data:', error)
      setApiError(error.message)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const loadChart = async (patientId) => {
    const headers = { Authorization: `Bearer ${getToken()}` }
    try {
      const [sessionsRaw, packagesRaw, servicesRaw] = await Promise.all([
        fetch(`${API_BASE}/sessions/patient/${patientId}?limit=200`, { headers }).then((r) => r.ok ? r.json() : { data: [] }),
        fetch(`${API_BASE}/patient-packages/patient/${patientId}`, { headers }).then((r) => r.ok ? r.json() : []),
        fetch(`${API_BASE}/services`, { headers }).then((r) => r.ok ? r.json() : []),
      ])
      const sessions = sessionsRaw.data || sessionsRaw.sessions || (Array.isArray(sessionsRaw) ? sessionsRaw : [])
      const packages = Array.isArray(packagesRaw) ? packagesRaw : packagesRaw.data || []
      const services = Array.isArray(servicesRaw) ? servicesRaw : servicesRaw.data || []
      setChart({ sessions, packages, services })
    } catch {
      setChart({ sessions: [], packages: [], services: [] })
    }
  }

  useEffect(() => {
    if (!showPatientModal || !selectedPatient?.id) return
    setShowPackageForm(false)
    setPackageLines([{ service_id: '', session_count: 1 }])
    loadChart(selectedPatient.id)
  }, [showPatientModal, selectedPatient?.id])

  const savePackageFromProfile = async () => {
    const lines = packageLines
      .filter((line) => line.service_id)
      .map((line) => ({ service_id: line.service_id, session_count: Number(line.session_count) }))
    if (!lines.length || lines.some((line) => !Number.isInteger(line.session_count) || line.session_count < 1)) {
      toast.error('اختر خدمة وعدد جلساتها')
      return
    }
    if (new Set(lines.map((line) => line.service_id)).size !== lines.length) {
      toast.error('الخدمة متكررة في نفس الباقة')
      return
    }
    setSavingPackage(true)
    try {
      const response = await fetch(`${API_BASE}/patient-packages/custom`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patient_id: selectedPatient.id, lines }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        const message = body?.message
        const text = typeof message === 'string'
          ? message
          : Array.isArray(message)
            ? message.join('، ')
            : message?.ar || message?.en || 'تعذر إضافة الباقة'
        throw new Error(text)
      }
      toast.success('اتضافت الباقة، وبانتظار تأكيد السداد من الحسابات')
      setPackageLines([{ service_id: '', session_count: 1 }])
      setShowPackageForm(false)
      await loadChart(selectedPatient.id)
    } catch (error) {
      toast.error(error.message || 'تعذر إضافة الباقة')
    } finally {
      setSavingPackage(false)
    }
  }

  // ========== تحميل المرضى من API والخادم الحقيقي ==========
  const loadPatients = async () => {
    try {
      console.log('📥 Fetching patients from API...')
      if (isOnline) {
        try {
          const response = await patientsService.getPatients({ limit: 1000 })
          console.log('📥 API response:', response)
          
          let apiPatients = []
          if (Array.isArray(response)) {
            apiPatients = response
          } else if (response?.patients) {
            apiPatients = response.patients
          } else if (response?.data) {
            apiPatients = response.data
          }
          
          if (apiPatients.length > 0) {
            const formattedPatients = apiPatients.map(patient => {
              const effAge = getEffectiveAge(patient)
              return {
                id: patient.id || 'P' + Date.now(),
                nameAr: patient.full_name_ar || (patient.first_name ? `${patient.first_name} ${patient.last_name || ''}`.trim() : 'مريض'),
                nameEn: (patient.first_name || '') + ' ' + (patient.last_name || ''),
                full_name_ar: patient.full_name_ar || '',
                nationality: patient.nationality || 'غير محدد',
                occupation: patient.occupation || 'غير محدد',
                profile_number: patient.profile_number || 'غير متوفر',
                referral_source: patient.referral_source || 'غير محدد',
                national_id_front: patient.national_id_front || patient.national_id_photo || '',
                national_id_back: patient.national_id_back || '',
                phone: patient.phone || '',
                email: patient.email || '',
                diagnosis: patient.diagnosis || '',
                severity: patient.severity || '',
                status: patient.status?.toLowerCase() || 'pending',
                progress: patient.progress || 0,
                totalSessions: patient.totalSessions || 0,
                completedSessions: patient.completedSessions || 0,
                registerDate: patient.registration_date || patient.created_at || new Date().toISOString().split('T')[0],
                _fromAPI: true,
                _syncPending: false,
                notes: patient.notes || '',
                gender: patient.gender || 'male',
                address: patient.address || '',
                images: patient.images || [],
                xrays: patient.xrays || [],
                reports: patient.reports || [],
                ...patient,
                age: effAge
              }
            })
            
            setPatients(formattedPatients)
            localStorage.setItem('mcsos_patients_v2', JSON.stringify(formattedPatients))
            return
          }
        } catch (apiErr) {
          console.warn('⚠️ API request failed:', apiErr.message)
        }
      }

      // في حالة انقطاع النت يتم استرجاع المسجلين محلياً فقط
      const localData = JSON.parse(localStorage.getItem('mcsos_patients_v2') || localStorage.getItem('mcsos_patients') || '[]')
      const cleanLocal = Array.isArray(localData) ? localData.filter(p => !p.id?.startsWith('demo-')) : []
      setPatients(cleanLocal)

    } catch (error) {
      console.error('❌ Error in loadPatients:', error)
      setApiError(error.message)
    }
  }

  // ========== تحميل الروشتات ==========
  const loadPrescriptions = async () => {
    try {
      const saved = localStorage.getItem('mcsos_prescriptions')
      if (saved) {
        const data = JSON.parse(saved)
        if (Array.isArray(data) && data.length > 0) {
          setPrescriptions(data)
          return
        }
      }
      
      const defaultPrescriptions = [
        {
          id: 1,
          prescriptionNumber: 'RX-2024-0001',
          prescriptionDate: '2024-01-15',
          patientId: 'demo-1',
          patientName: 'أحمد محمد',
          medications: [
            { name: 'بروفين 500mg', dosage: 'قرص واحد', frequency: '3 مرات يومياً', duration: '5 أيام', instructions: 'تناول بعد الأكل' }
          ],
          notes: 'تناول بعد الأكل',
          doctorName: 'د. أحمد علي'
        },
        {
          id: 2,
          prescriptionNumber: 'RX-2024-0002',
          prescriptionDate: '2024-01-20',
          patientId: 'demo-2',
          patientName: 'سارة حسن',
          medications: [
            { name: 'بانادول 500mg', dosage: 'قرص واحد', frequency: 'عند الحاجة', duration: '3 أيام', instructions: '' }
          ],
          notes: '',
          doctorName: 'د. منى حسن'
        }
      ]
      setPrescriptions(defaultPrescriptions)
      localStorage.setItem('mcsos_prescriptions', JSON.stringify(defaultPrescriptions))
      
    } catch (error) {
      console.error('Error loading prescriptions:', error)
      setPrescriptions([])
    }
  }

  // ========== تحديث البيانات ==========
  const refreshData = () => {
    loadAllData()
    toast.success('تم تحديث البيانات')
  }

  // ========== دوال مساعدة ==========
  const getPatientName = (patient) => {
    if (!patient) return ''
    const name = patient.nameAr || patient.name || patient.first_name || patient.nameEn || patient.fullName || ''
    return name
  }

  const getEffectiveAge = (patient) => {
    if (!patient) return '-'
    if (patient.age && Number(patient.age) > 0) {
      return Number(patient.age)
    }
    const dob = patient.date_of_birth || patient.dob || patient.birth_date
    if (dob) {
      const birthDate = new Date(dob)
      if (!isNaN(birthDate.getTime())) {
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        if (age > 0 && age < 120) return age
      }
    }
    // حساب عمر افتراضي محدد بدقة بناء على الـ hash في حال استيراد بيانات بدون تاريخ ميلاد
    const str = String(patient.id || patient.phone || patient.full_name_ar || patient.nameAr || 'pt')
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash |= 0
    }
    return 24 + (Math.abs(hash) % 42)
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

  // ========== دوال إدارة المرضى ==========
  const handleAddPatient = async () => {
    if (!newPatient.nameAr || !newPatient.age) {
      toast.error('الرجاء إدخال الاسم والعمر')
      return
    }

    if (!newPatient.national_id_front) {
      toast.error('الرجاء رفع صورة الوجه الأمامي للهوية الوطنية (إلزامي)')
      return
    }

    setIsSubmitting(true)
    try {
      const patientData = {
        first_name: newPatient.nameAr.split(' ')[0] || newPatient.nameAr,
        last_name: newPatient.nameAr.split(' ').slice(1).join(' ') || newPatient.nameAr,
        gender: newPatient.gender || 'male',
        date_of_birth: new Date(new Date().getFullYear() - parseInt(newPatient.age), 0, 1).toISOString().split('T')[0],
        address: newPatient.address || 'غير محدد',
        phone: newPatient.phone || '0500000000',
        whatsapp_number: newPatient.sameAsPhone ? (newPatient.phone || '0500000000') : newPatient.whatsapp_number || newPatient.phone || '0500000000',
        referral_source: newPatient.referral_source || '',
        national_id_front: newPatient.national_id_front || '',
        national_id_back: newPatient.national_id_back || '',
        national_id_photo: newPatient.national_id_front || newPatient.national_id_photo || '',
        emergency_contact: '0500000000',
        email: newPatient.email || 'patient@example.com',
        notes: `التشخيص: ${newPatient.diagnosis || 'قيد التشخيص'} | درجة الحالة: ${newPatient.severity} | عدد الجلسات: ${newPatient.totalSessions || 6}`
      }

      console.log('📤 Sending patient data:', patientData)

      const response = await patientsService.createPatient(patientData)
      console.log('✅ Patient created:', response)
      
      toast.success('تم إضافة المريض بنجاح')
      
      setTimeout(async () => {
        await loadPatients()
      }, 500)

      setShowAddPatientModal(false)
      setNewPatient({
        nameAr: '', nameEn: '', nameFr: '',
        age: '', phone: '', email: '',
        whatsapp_number: '',
        sameAsPhone: true,
        referral_source: '',
        national_id_photo: '',
        diagnosis: '', severity: 'moderate',
        totalSessions: 6, completedSessions: 0,
        status: 'active', progress: 0,
        notes: '',
        gender: 'male',
        address: ''
      })
      
    } catch (error) {
      console.error('❌ Add patient error:', error)
      toast.error(error.message || 'حدث خطأ في إضافة المريض')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditPatient = async () => {
    if (!editPatient.nameAr || !editPatient.age) {
      toast.error('الرجاء إدخال الاسم والعمر')
      return
    }

    setIsSubmitting(true)
    try {
      const patientData = {
        first_name: editPatient.nameAr.split(' ')[0] || editPatient.nameAr,
        last_name: editPatient.nameAr.split(' ').slice(1).join(' ') || editPatient.nameAr,
        gender: editPatient.gender || 'male',
        date_of_birth: new Date(new Date().getFullYear() - parseInt(editPatient.age), 0, 1).toISOString().split('T')[0],
        address: editPatient.address || 'غير محدد',
        phone: editPatient.phone || '0500000000',
        whatsapp_number: editPatient.sameAsPhone ? (editPatient.phone || '0500000000') : editPatient.whatsapp_number || editPatient.phone || '0500000000',
        referral_source: editPatient.referral_source || '',
        national_id_front: editPatient.national_id_front || '',
        national_id_back: editPatient.national_id_back || '',
        national_id_photo: editPatient.national_id_front || editPatient.national_id_photo || '',
        email: editPatient.email || 'patient@example.com',
        notes: editPatient.notes || ''
      }

      await patientsService.updatePatient(editPatient.id, patientData)

      toast.success('تم تحديث بيانات المريض بنجاح')
      
      setTimeout(async () => {
        await loadPatients()
      }, 500)
      
      setShowEditPatientModal(false)
      
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تحديث المريض')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePatient = async (patientId) => {
    if (!confirm('هل أنت متأكد من حذف هذا المريض؟')) return

    try {
      await patientsService.deletePatient(patientId)
      
      toast.success('تم حذف المريض بنجاح')
      
      setTimeout(async () => {
        await loadPatients()
      }, 500)
      
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حذف المريض')
    }
  }

  const updatePatient = (updatedPatient) => {
    const updatedPatients = patients.map(p => p.id === updatedPatient.id ? updatedPatient : p)
    setPatients(updatedPatients)
    setSelectedPatient(updatedPatient)
  }

  // ========== دوال الصور الطبية ==========
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

  const handleUploadImage = async () => {
    if (!selectedFile) {
      toast.error('الرجاء اختيار صورة')
      return
    }
    if (!uploadTitle) {
      toast.error('الرجاء إدخال عنوان للصورة')
      return
    }

    setIsSubmitting(true)
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const newImage = {
          id: Date.now(),
          type: uploadType,
          title: uploadTitle,
          description: uploadDesc,
          data: reader.result,
          fileName: selectedFile.name,
          date: new Date().toISOString()
        }

        if (isOnline) {
          try {
            await patientsService.uploadPatientImage(selectedPatient.id, selectedFile, {
              title: uploadTitle,
              description: uploadDesc,
              type: uploadType
            })
          } catch (error) {
            console.warn('Failed to upload image to server:', error)
          }
        }

        const updatedPatient = {
          ...selectedPatient,
          images: [...(selectedPatient.images || []), newImage],
          _syncPending: !isOnline
        }
        updatePatient(updatedPatient)
        setShowImageUpload(false)
        setSelectedFile(null)
        setUploadTitle('')
        setUploadDesc('')
        toast.success('تم رفع الصورة بنجاح')
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في رفع الصورة')
    } finally {
      setIsSubmitting(false)
    }
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

  // ========== دوال الأشعة ==========
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

  const handleUploadXray = async () => {
    if (!xrayFile && !xrayReport) {
      toast.error('الرجاء اختيار صورة أشعة أو كتابة تقرير')
      return
    }
    if (!xrayTitle) {
      toast.error('الرجاء إدخال عنوان للأشعة')
      return
    }

    setIsSubmitting(true)
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
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

        if (isOnline && xrayFile) {
          try {
            await patientsService.uploadPatientImage(selectedPatient.id, xrayFile, {
              title: xrayTitle,
              description: xrayDesc,
              type: 'xray'
            })
          } catch (error) {
            console.warn('Failed to upload xray to server:', error)
          }
        }

        const updatedPatient = {
          ...selectedPatient,
          xrays: [...(selectedPatient.xrays || []), newXray],
          _syncPending: !isOnline
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
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في رفع الأشعة')
    } finally {
      setIsSubmitting(false)
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

  // ========== دوال التقارير ==========
  const handleAddReport = async () => {
    if (!newReport.title) {
      toast.error('الرجاء إدخال عنوان التقرير')
      return
    }

    setIsSubmitting(true)
    try {
      const newReportObj = {
        id: Date.now(),
        ...newReport,
        date: new Date().toISOString(),
        doctorName: selectedPatient.doctorName || 'غير محدد'
      }

      if (isOnline) {
        const saved = await patientsService.addReport(selectedPatient.id, newReportObj)
        if (saved?.id) newReportObj.id = saved.id
      }

      const updatedPatient = {
        ...selectedPatient,
        reports: [...(selectedPatient.reports || []), newReportObj],
        _syncPending: !isOnline
      }
      updatePatient(updatedPatient)
      setShowReportModal(false)
      setNewReport({ title: '', content: '', type: 'medical' })
      toast.success('تم إضافة التقرير بنجاح')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في إضافة التقرير')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditReport = (report) => {
    setSelectedReport(report)
    setEditReportData({ title: report.title, content: report.content })
    setShowEditReportModal(true)
  }

  const handleSaveReportEdit = async () => {
    if (!editReportData.title) {
      toast.error('الرجاء إدخال عنوان التقرير')
      return
    }

    setIsSubmitting(true)
    try {
      if (isOnline) {
        try {
          await patientsService.updateReport(selectedPatient.id, selectedReport.id, editReportData)
        } catch (error) {
          console.warn('Failed to update report on server:', error)
        }
      }

      const updatedReports = selectedPatient.reports.map(r => 
        r.id === selectedReport.id ? { ...r, title: editReportData.title, content: editReportData.content } : r
      )
      const updatedPatient = { ...selectedPatient, reports: updatedReports, _syncPending: !isOnline }
      updatePatient(updatedPatient)
      setShowEditReportModal(false)
      setSelectedReport(null)
      toast.success('تم تحديث التقرير بنجاح')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تحديث التقرير')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteReport = (reportId) => {
    if (confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
      const updatedReports = selectedPatient.reports.filter(r => r.id !== reportId)
      const updatedPatient = { ...selectedPatient, reports: updatedReports }
      updatePatient(updatedPatient)
      toast.success('تم حذف التقرير بنجاح')
    }
  }

  // ========== دوال الروشتات ==========
  const handleAddPrescription = async () => {
    const validMedications = prescriptionForm.medications.filter(m => m.name.trim())
    if (validMedications.length === 0 && !prescriptionForm.prescriptionFile) {
      toast.error(isRTL ? 'الرجاء إضافة دواء واحد على الأقل أو رفع ملف/صورة الروشتة' : 'Please add at least one medication or upload a prescription file/image')
      return
    }

    setIsSubmitting(true)
    try {
      const newPrescription = {
        id: Date.now(),
        prescriptionNumber: `RX-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        prescriptionDate: new Date().toISOString().split('T')[0],
        patientId: selectedPatient.id,
        patientName: getPatientName(selectedPatient),
        medications: validMedications,
        notes: prescriptionForm.notes || '',
        fileUrl: prescriptionForm.prescriptionFile || null,
        fileName: prescriptionForm.fileName || null,
        fileType: prescriptionForm.fileType || null,
        doctorName: selectedPatient.doctorName || (isRTL ? 'الطبيب المعالج' : 'Attending Doctor')
      }

      const updatedPrescriptions = [newPrescription, ...prescriptions]
      setPrescriptions(updatedPrescriptions)
      localStorage.setItem('mcsos_prescriptions', JSON.stringify(updatedPrescriptions))
      
      const updatedPatient = {
        ...selectedPatient,
        prescriptions: [...(selectedPatient.prescriptions || []), newPrescription.id]
      }
      updatePatient(updatedPatient)
      setShowPrescriptionModal(false)
      setPrescriptionForm({
        medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        notes: '',
        prescriptionFile: '',
        fileName: '',
        fileType: ''
      })
      toast.success(isRTL ? 'تم إضافة الروشتة بنجاح' : 'Prescription added successfully')
    } catch (error) {
      toast.error(error.message || (isRTL ? 'حدث خطأ في إضافة الروشتة' : 'Failed to add prescription'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddMedicationField = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }))
  }

  const handleRemoveMedicationField = (index) => {
    if (prescriptionForm.medications.length === 1) {
      if (prescriptionForm.prescriptionFile) {
        setPrescriptionForm(prev => ({ ...prev, medications: [] }))
        return
      }
      toast.error(isRTL ? 'يجب وجود دواء واحد على الأقل أو إرفاق ملف الروشتة' : 'At least one medication or an attached file is required')
      return
    }
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }))
  }

  const handlePrescriptionFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 15 * 1024 * 1024) {
      toast.error(isRTL ? 'حجم الملف يجب ألا يتجاوز 15 ميجابايت' : 'File size must not exceed 15MB')
      return
    }
    try {
      const base64 = await compressImage(file, 1600, 1600, 0.8)
      setPrescriptionForm(prev => ({
        ...prev,
        prescriptionFile: base64,
        fileName: file.name,
        fileType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')
      }))
      toast.success(isRTL ? 'تم إرفاق ملف الروشتة بنجاح' : 'Prescription file attached')
    } catch (err) {
      toast.error(isRTL ? 'فشل إرفاق الملف' : 'Failed to attach file')
    }
  }

  const handleDirectPrescriptionUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 15 * 1024 * 1024) {
      toast.error(isRTL ? 'حجم الملف يجب ألا يتجاوز 15 ميجابايت' : 'File size must not exceed 15MB')
      return
    }
    try {
      const base64 = await compressImage(file, 1600, 1600, 0.8)
      setPrescriptionForm({
        medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        notes: '',
        prescriptionFile: base64,
        fileName: file.name,
        fileType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')
      })
      setShowPrescriptionModal(true)
      toast.success(isRTL ? 'تم إرفاق الملف، يمكنك حفظ الروشتة أو إضافة ملاحظات' : 'File attached, you can save prescription or add notes')
    } catch (err) {
      toast.error(isRTL ? 'فشل قراءة الملف' : 'Failed to read file')
    }
    e.target.value = ''
  }

  const handleDeletePrescription = (prescriptionId) => {
    if (confirm(isRTL ? 'هل أنت متأكد من حذف هذه الروشتة؟' : 'Are you sure you want to delete this prescription?')) {
      const updated = prescriptions.filter(p => p.id !== prescriptionId)
      setPrescriptions(updated)
      localStorage.setItem('mcsos_prescriptions', JSON.stringify(updated))
      if (selectedPatient?.prescriptions) {
        const updatedPatient = {
          ...selectedPatient,
          prescriptions: selectedPatient.prescriptions.filter(id => id !== prescriptionId)
        }
        updatePatient(updatedPatient)
      }
      toast.success(isRTL ? 'تم حذف الروشتة بنجاح' : 'Prescription deleted successfully')
    }
  }

  const handleMedicationFieldChange = (index, field, value) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.map((m, i) => i === index ? { ...m, [field]: value } : m)
    }))
  }

  // ========== دوال الجلسات ==========
  const handleUpdateSessionProgress = async (increment = true) => {
    let newCompleted = selectedPatient.completedSessions + (increment ? 1 : -1)
    if (newCompleted < 0) newCompleted = 0
    if (newCompleted > selectedPatient.totalSessions) newCompleted = selectedPatient.totalSessions
    const newProgress = (newCompleted / selectedPatient.totalSessions) * 100
    const newStatus = newProgress >= 100 ? 'completed' : newProgress >= 50 ? 'improving' : 'active'

    setIsSubmitting(true)
    try {
      if (isOnline) {
        try {
          await patientsService.updatePatientProgress(selectedPatient.id, {
            completedSessions: newCompleted,
            progress: newProgress,
            status: newStatus
          })
        } catch (apiError) {
          console.warn('API update progress failed:', apiError)
        }
      }

      const updatedPatient = {
        ...selectedPatient,
        completedSessions: newCompleted,
        progress: newProgress,
        status: newStatus,
        _syncPending: !isOnline
      }
      updatePatient(updatedPatient)
      toast.success(increment ? 'تم تسجيل جلسة جديدة' : 'تم تعديل عدد الجلسات')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تحديث الجلسات')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== طباعة التقرير ==========
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
          <div class="section"><div class="section-title">معلومات المريض</div><div class="info-grid"><div class="info-item"><span>الاسم:</span><span>${getPatientName(patient)}</span></div><div class="info-item"><span>العمر:</span><span>${getEffectiveAge(patient)} سنة</span></div><div class="info-item"><span>الجوال:</span><span>${patient.phone || '-'}</span></div><div class="info-item"><span>التشخيص:</span><span>${patient.diagnosis || '-'}</span></div></div></div>
          <div class="section"><div class="section-title">تقدم العلاج</div><div class="info-grid"><div class="info-item"><span>إجمالي الجلسات:</span><span>${patient.totalSessions || 0}</span></div><div class="info-item"><span>الجلسات المكتملة:</span><span>${patient.completedSessions || 0}</span></div><div class="info-item"><span>نسبة التقدم:</span><span>${Math.round(patient.progress || 0)}%</span></div></div><div class="progress-bar"><div class="progress-fill">${Math.round(patient.progress || 0)}%</div></div></div>
          <div class="footer"><p>تم إنشاء هذا التقرير بواسطة نظام المركز الطبي MCSOS</p></div>
        </div>
      </body>
      </html>`
  }

  // ========== تصفية المرضى وتقسيم الصفحات ==========
  const filteredPatients = patients.filter(p => {
    if (!p) return false
    const name = getPatientName(p) || ''
    const phone = p.phone || ''
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           phone.includes(searchTerm)
  })

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-4" />
          <div className="text-white">جاري تحميل بيانات المرضى من الخادم...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>ملف المريض</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            إدارة بيانات المرضى ومتابعة الحالة العلاجية - بيانات من الخادم
            {!isOnline && (
              <span className="inline-block mr-2 px-2.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">
                ⚡ غير متصل - يرجى الاتصال بالإنترنت
              </span>
            )}
            {apiError && (
              <span className="inline-block mr-2 px-2.5 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 rounded-full text-xs font-bold border border-rose-200 dark:border-rose-800">
                ⚠️ خطأ في الخادم
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800/60 shadow-xs transition flex items-center gap-2 transform active:scale-95"
          >
            <RefreshCw size={16} /> <span>تحديث من الخادم</span>
          </button>
          <button
            onClick={() => setShowAddPatientModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-indigo-500/20 transition flex items-center gap-2 transform active:scale-95"
          >
            <UserPlus size={16} /> <span>إضافة مريض جديد</span>
          </button>
        </div>
      </div>

      {/* قائمة المرضى */}
      <div className="space-y-4">
        {/* Header & Controls Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-slate-200/80 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2.5">
              <span>قائمة المرضى</span>
              <span className="text-xs font-mono font-bold px-3 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60">
                {patients.length}
              </span>
            </h2>

            {/* View Mode Toggle Buttons */}
            <div className="flex items-center bg-slate-100 dark:bg-gray-900 p-1 rounded-xl border border-slate-200/80 dark:border-gray-700">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'
                }`}
                title="عرض بطاقات صفوف"
              >
                <LayoutGrid size={15} />
                <span className="hidden sm:inline">بطاقات</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'
                }`}
                title="عرض جدول"
              >
                <List size={15} />
                <span className="hidden sm:inline">جدول</span>
              </button>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="ابحث باسم المريض أو الكود أو الجوال..."
              className="w-full p-2.5 pr-9 pl-4 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-400 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-3 text-slate-400" size={15} />
          </div>
        </div>

        {/* ============================================================ */}
        {/* VIEW 1: Card-Row Layout (matching Daily Follow-up Cards) */}
        {/* ============================================================ */}
        {viewMode === 'cards' && (
          <div className="space-y-3">
            {filteredPatients.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center text-slate-400 dark:text-gray-400 font-medium border border-slate-200/80 dark:border-gray-700 shadow-sm">
                {isOnline ? 'لا يوجد مرضى مسجلين في النظام' : 'غير متصل بالإنترنت'}
              </div>
            ) : (
              currentPatients.map((patient, index) => {
                if (!patient) return null
                const patientName = getPatientName(patient) || 'غير معروف'

                return (
                  <div
                    key={patient.id || Date.now()}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-slate-200/80 dark:border-gray-700 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-indigo-300 dark:hover:border-indigo-700"
                  >
                    {/* Left: Soft Icon Box + Name + Metadata */}
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                        index % 3 === 0 
                          ? 'bg-amber-50 text-amber-600 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40' 
                          : index % 3 === 1 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40' 
                            : 'bg-indigo-50 text-indigo-600 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40'
                      }`}>
                        <User size={22} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => { setSelectedPatient(patient); setShowPatientModal(true); }}
                            className="text-sm font-extrabold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition"
                          >
                            {patientName}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 text-[10px] font-mono font-bold border border-indigo-200/50 dark:border-indigo-800">
                            ID: {patient.patient_code || patient.profile_number || (patient.id ? patient.id.slice(0, 8) : 'N/A')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar size={13} className="text-slate-400" />
                            <span>{getEffectiveAge(patient)} سنة</span>
                          </span>
                          {patient.diagnosis && patient.diagnosis !== 'قيد التشخيص' && (
                            <>
                              <span className="text-slate-300 dark:text-gray-700">•</span>
                              <span className="flex items-center gap-1 font-medium">
                                <Stethoscope size={13} className="text-slate-400" />
                                <span>{patient.diagnosis}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Badge & Action Pill Buttons */}
                    <div className="flex items-center gap-2.5 flex-wrap self-end md:self-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        patient.status === 'pending' || patient.status === 'pending_assessment' 
                          ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60' 
                          : patient.status === 'completed' 
                            ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600' 
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          patient.status === 'pending' || patient.status === 'pending_assessment' ? 'bg-amber-500 animate-pulse' :
                          patient.status === 'completed' ? 'bg-slate-400' : 'bg-emerald-500'
                        }`} />
                        {patient.status === 'pending' || patient.status === 'pending_assessment' 
                          ? 'قيد المراجعة' 
                          : patient.status === 'completed' 
                            ? 'مكتمل' 
                            : 'نشط'}
                      </span>

                      <button
                        onClick={() => { setSelectedPatient(patient); setShowPatientModal(true); }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 transform active:scale-95"
                      >
                        <Eye size={14} />
                        <span>عرض الملف</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditPatient({
                            ...patient,
                            whatsapp_number: patient.whatsapp_number || '',
                            sameAsPhone: !patient.whatsapp_number || patient.whatsapp_number === patient.phone,
                            referral_source: patient.referral_source || '',
                            national_id_photo: patient.national_id_photo || ''
                          });
                          setShowEditPatientModal(true);
                        }}
                        className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:hover:bg-amber-900 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-200 dark:border-amber-800/60 transition flex items-center gap-1.5 transform active:scale-95"
                      >
                        <Edit size={14} />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => handleDeletePatient(patient.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition border border-transparent hover:border-rose-200 dark:hover:border-rose-800/60"
                        title="حذف المريض"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: Table Layout */}
        {/* ============================================================ */}
        {viewMode === 'table' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-gray-700 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse bg-white dark:bg-gray-800">
                <thead className="bg-white dark:bg-gray-900/90 border-b border-slate-200/80 dark:border-gray-700 text-[11px] font-extrabold text-slate-700 dark:text-gray-200 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 bg-white dark:bg-gray-900">المريض</th>
                    <th className="px-5 py-4 bg-white dark:bg-gray-900">العمر</th>
                    <th className="px-5 py-4 bg-white dark:bg-gray-900">التشخيص</th>
                    <th className="px-5 py-4 bg-white dark:bg-gray-900">الجلسات</th>
                    <th className="px-5 py-4 bg-white dark:bg-gray-900">التقدم</th>
                    <th className="px-5 py-4 bg-white dark:bg-gray-900">الحالة</th>
                    <th className="px-6 py-4 text-center bg-white dark:bg-gray-900">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-slate-100 dark:divide-gray-700/60 text-xs">
                  {filteredPatients.length === 0 ? (
                    <tr className="bg-white dark:bg-gray-800">
                      <td colSpan="7" className="px-4 py-16 text-center text-slate-400 dark:text-gray-400 font-medium">
                        {isOnline ? 'لا يوجد مرضى مسجلين في النظام' : 'غير متصل بالإنترنت'}
                      </td>
                    </tr>
                  ) : (
                    currentPatients.map((patient) => {
                      if (!patient) return null
                      const patientName = getPatientName(patient) || 'غير معروف'
                      const nameParts = patientName.trim().split(/\s+/)
                      const initials = (nameParts[0]?.[0] || '') + (nameParts[1]?.[0] || nameParts[0]?.[1] || '')

                      return (
                        <tr
                          key={patient.id || Date.now()}
                          className="bg-white dark:bg-gray-800 hover:bg-slate-50/60 dark:hover:bg-gray-700/40 transition duration-150 ease-in-out group"
                        >
                          <td
                            className="px-6 py-4 font-bold text-slate-900 dark:text-white cursor-pointer"
                            onClick={() => { setSelectedPatient(patient); setShowPatientModal(true); }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0 border border-indigo-200/50 dark:border-indigo-800">
                                {initials.toUpperCase()}
                              </div>
                              <div>
                                <span className="block text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                  {patientName}
                                </span>
                                <span className="block text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                                  ID: {patient.patient_code || patient.profile_number || (patient.id ? patient.id.slice(0, 8) : 'N/A')}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 font-bold text-slate-600 dark:text-gray-300">
                            {getEffectiveAge(patient)}
                          </td>

                          <td className="px-5 py-4 font-semibold text-slate-600 dark:text-gray-300">
                            {patient.diagnosis || '-'}
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-gray-700/70 text-slate-700 dark:text-gray-200 px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold border border-slate-200/70 dark:border-gray-600">
                              <Clock size={12} className="text-indigo-500" />
                              <span>{patient.completedSessions || 0}/{patient.totalSessions || 0}</span>
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-slate-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden border border-slate-200/70 dark:border-gray-600">
                                <div
                                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${patient.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] font-bold font-mono text-slate-500 dark:text-gray-400">
                                {patient.progress || 0}%
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border shadow-xs ${
                              patient.status === 'pending' || patient.status === 'pending_assessment' 
                                ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60' 
                                : patient.status === 'completed' 
                                  ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600' 
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                patient.status === 'pending' || patient.status === 'pending_assessment' ? 'bg-amber-500 animate-pulse' :
                                patient.status === 'completed' ? 'bg-slate-400' : 'bg-emerald-500'
                              }`} />
                              {patient.status === 'pending' || patient.status === 'pending_assessment' 
                                ? 'قيد المراجعة' 
                                : patient.status === 'completed' 
                                  ? 'مكتمل' 
                                  : 'نشط'}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                title="تعديل المريض"
                                onClick={() => {
                                  setEditPatient({
                                    ...patient,
                                    whatsapp_number: patient.whatsapp_number || '',
                                    sameAsPhone: !patient.whatsapp_number || patient.whatsapp_number === patient.phone,
                                    referral_source: patient.referral_source || '',
                                    national_id_photo: patient.national_id_photo || ''
                                  });
                                  setShowEditPatientModal(true);
                                }}
                                className="p-2 text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 rounded-xl border border-amber-200/80 dark:border-amber-800/40 transition shadow-xs transform active:scale-95"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                title="عرض ملف المريض"
                                onClick={() => { setSelectedPatient(patient); setShowPatientModal(true); }}
                                className="p-2 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 rounded-xl border border-indigo-200/80 dark:border-indigo-800/40 transition shadow-xs transform active:scale-95"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                title="حذف المريض"
                                onClick={() => handleDeletePatient(patient.id)}
                                className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 rounded-xl border border-rose-200/80 dark:border-rose-800/40 transition shadow-xs transform active:scale-95"
                              >
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
        )}

        {/* عناصر التنقل بين الصفحات Pagination */}
        {filteredPatients.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/40">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {isRTL ? (
                <>عرض <span className="font-bold text-gray-800 dark:text-white">{indexOfFirstItem + 1}</span> إلى <span className="font-bold text-gray-800 dark:text-white">{Math.min(indexOfLastItem, filteredPatients.length)}</span> من إجمالي <span className="font-bold text-gray-800 dark:text-white">{filteredPatients.length}</span> مريض</>
              ) : (
                <>Showing <span className="font-bold text-gray-800 dark:text-white">{indexOfFirstItem + 1}</span> to <span className="font-bold text-gray-800 dark:text-white">{Math.min(indexOfLastItem, filteredPatients.length)}</span> of <span className="font-bold text-gray-800 dark:text-white">{filteredPatients.length}</span> patients</>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-white text-xs font-bold border border-gray-200 dark:border-gray-600 flex items-center gap-1 shadow-sm transition"
              >
                {isRTL ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
                {isRTL ? 'السابق' : 'Previous'}
              </button>

              <div className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-xs">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentPage}</span>
                <span className="text-gray-400">/</span>
                <span className="font-bold text-gray-600 dark:text-gray-400">{totalPages}</span>
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-white text-xs font-bold border border-gray-200 dark:border-gray-600 flex items-center gap-1 shadow-sm transition"
              >
                {isRTL ? 'التالي' : 'Next'}
                {isRTL ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* مودال إضافة مريض جديد (المكون الموحد UnifiedPatientForm) */}
      {/* ============================================================ */}
      <AddPatientModal
        isOpen={showAddPatientModal}
        onClose={() => setShowAddPatientModal(false)}
        onPatientAdded={(newPatient) => {
          loadPatients()
          if (newPatient) setSelectedPatient(newPatient)
          setShowAddPatientModal(false)
        }}
      />

      {/* ============================================================ */}
      {/* مودال تعديل مريض */}
      {/* ============================================================ */}
      {showEditPatientModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-100 dark:border-gray-700 shadow-2xl text-gray-800 dark:text-white">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700 mb-4">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <span>تعديل بيانات المريض</span>
              </h2>
              <button
                onClick={() => setShowEditPatientModal(false)}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">الاسم بالكامل *</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  value={editPatient.full_name_ar || editPatient.nameAr || ''}
                  onChange={(e) => setEditPatient({...editPatient, full_name_ar: e.target.value, nameAr: e.target.value})}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">العمر *</label>
                <input
                  type="number"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editPatient.age || ''}
                  onChange={(e) => setEditPatient({...editPatient, age: e.target.value})}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">رقم الجوال *</label>
                <input
                  type="tel"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono dir-ltr text-left"
                  value={editPatient.phone || ''}
                  onChange={(e) => setEditPatient({...editPatient, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">النوع</label>
                <select
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editPatient.gender || 'male'}
                  onChange={(e) => setEditPatient({...editPatient, gender: e.target.value})}
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">الجنسية</label>
                <select
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editPatient.nationality || 'مصري - Egypt'}
                  onChange={(e) => setEditPatient({...editPatient, nationality: e.target.value})}
                >
                  <option value="مصري - Egypt">مصري - Egypt</option>
                  <option value="سعودي - Saudi Arabia">سعودي - Saudi Arabia</option>
                  <option value="إماراتي - UAE">إماراتي - UAE</option>
                  <option value="كويتي - Kuwait">كويتي - Kuwait</option>
                  <option value="قطري - Qatar">قطري - Qatar</option>
                  <option value="أردني - Jordan">أردني - Jordan</option>
                  <option value="سوري - Syria">سوري - Syria</option>
                  <option value="لبناني - Lebanon">لبناني - Lebanon</option>
                  <option value="عراقي - Iraq">عراقي - Iraq</option>
                  <option value="فلسطيني - Palestine">فلسطيني - Palestine</option>
                  <option value="أجنبي / آخر - Other">أجنبي / آخر - Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">العنوان</label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editPatient.address || ''}
                  onChange={(e) => setEditPatient({...editPatient, address: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">جهة التحويل</label>
                <select
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editPatient.referral_source || ''}
                  onChange={(e) => setEditPatient({...editPatient, referral_source: e.target.value})}
                >
                  <option value="Social Media">سوشيال ميديا (Social Media)</option>
                  <option value="Google Search">بحث جوجل (Google Search)</option>
                  <option value="Friend">ترشيح صديق (Friend)</option>
                  <option value="Doctor Referral">تحويل طبيب (Doctor Referral)</option>
                  <option value="Advertisement">إعلانات (Advertisement)</option>
                  <option value="Walk-in">زيارة مباشرة (Walk-in)</option>
                  <option value="Other">أخرى (Other)</option>
                </select>
              </div>

              {editPatient.referral_source?.includes('Doctor Referral') && (
                <div className="md:col-span-2">
                  <label className="block font-bold text-indigo-600 dark:text-indigo-400 mb-1">اسم الطبيب المحوّل</label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                    value={editPatient.referral_doctor_name || ''}
                    onChange={(e) => setEditPatient({...editPatient, referral_doctor_name: e.target.value})}
                    placeholder="مثال: د. أحمد فؤاد..."
                  />
                </div>
              )}

              {editPatient.referral_source === 'Friend' && (
                <div className="md:col-span-2">
                  <label className="block font-bold text-indigo-600 dark:text-indigo-400 mb-1">اسم الصديق / المُرشّح</label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                    value={editPatient.referral_friend_name || ''}
                    onChange={(e) => setEditPatient({...editPatient, referral_friend_name: e.target.value})}
                    placeholder="مثال: محمد علي..."
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setShowEditPatientModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-bold transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleEditPatient}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin inline ml-1" /> : null}
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* مودال عرض تفاصيل المريض */}
      {/* ============================================================ */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
          <div dir="rtl" className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E2E8F0] dark:border-slate-700 text-right">
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[#E2E8F0] dark:border-slate-700">
                <div className="min-w-0">
                  <p className="text-[18px] font-semibold leading-7 text-[#0F172A] dark:text-slate-50 truncate">{getPatientName(selectedPatient)}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[13px] leading-5 text-[#64748B] dark:text-slate-400">
                    {(selectedPatient.patient_code || selectedPatient.profile_number) && (
                      <span>{selectedPatient.patient_code || selectedPatient.profile_number}</span>
                    )}
                    {(selectedPatient.status === 'pending' || selectedPatient.status === 'pending_assessment' || selectedPatient.status === 'PENDING_ASSESSMENT' || selectedPatient.status === 'assessment_completed' || selectedPatient.status === 'ASSESSMENT_COMPLETED' || selectedPatient.status === 'assessment_dropoff' || selectedPatient.status === 'ASSESSMENT_DROPOFF') && (
                      <span>
                        {selectedPatient.status === 'assessment_completed' || selectedPatient.status === 'ASSESSMENT_COMPLETED'
                          ? 'اكتمل التقييم'
                          : selectedPatient.status === 'assessment_dropoff' || selectedPatient.status === 'ASSESSMENT_DROPOFF'
                            ? 'لم يكمل التقييم'
                            : 'بانتظار التقييم'}
                      </span>
                    )}
                  </p>
                </div>
                <button type="button" onClick={() => setShowPatientModal(false)} className="h-8 w-8 grid place-items-center text-[#64748B] hover:text-[#0F172A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4F8A]" aria-label="إغلاق">
                  <X size={18} />
                </button>
              </div>

              <div className="flex gap-1 px-4 border-b border-[#E2E8F0] dark:border-slate-700 overflow-x-auto">
                {[
                  ['info', 'معلومات'],
                  ['progress', 'التقدم'],
                  ['xrays', 'الأشعة'],
                  ['prescriptions', 'الروشتات'],
                  ['reports', 'التقارير'],
                  ['images', 'الصور'],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`h-10 px-3 text-sm whitespace-nowrap border-b-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4F8A] ${
                      activeTab === id
                        ? 'border-[#1B4F8A] text-[#1B4F8A] dark:text-blue-200 font-semibold'
                        : 'border-transparent text-[#64748B] font-normal'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-1 gap-y-2 px-5 py-3">
                <button
                  type="button"
                  onClick={() => { setActiveTab('progress'); setShowPackageForm(true) }}
                  className="h-9 px-4 rounded-lg bg-[#1B4F8A] text-sm font-semibold text-white hover:bg-[#174375] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4F8A]"
                >
                  إضافة باقة
                </button>
                <span className="mx-2 h-4 w-px bg-[#E2E8F0] dark:bg-slate-700" aria-hidden="true" />
                <button type="button" onClick={() => setShowXrayModal(true)} className="h-9 px-2 text-sm font-medium text-[#0F172A] dark:text-slate-100 hover:text-[#1B4F8A]">أشعة</button>
                <button type="button" onClick={() => setShowReportModal(true)} className="h-9 px-2 text-sm font-medium text-[#0F172A] dark:text-slate-100 hover:text-[#1B4F8A]">تقرير</button>
                <button type="button" onClick={() => setShowPrescriptionModal(true)} className="h-9 px-2 text-sm font-medium text-[#0F172A] dark:text-slate-100 hover:text-[#1B4F8A]">روشتة</button>
                <span className="mx-2 h-4 w-px bg-[#E2E8F0] dark:bg-slate-700" aria-hidden="true" />
                <button type="button" onClick={handlePrintReport} className="h-9 px-2 text-sm font-medium text-[#0F172A] dark:text-slate-100 hover:text-[#1B4F8A]">طباعة</button>
                <button type="button" onClick={() => {
                    setEditPatient({
                      ...selectedPatient,
                      whatsapp_number: selectedPatient.whatsapp_number || '',
                      sameAsPhone: !selectedPatient.whatsapp_number || selectedPatient.whatsapp_number === selectedPatient.phone,
                      referral_source: selectedPatient.referral_source || '',
                      national_id_photo: selectedPatient.national_id_photo || ''
                    });
                    setShowEditPatientModal(true);
                    setShowPatientModal(false);
                  }} className="h-9 px-2 text-sm font-medium text-[#0F172A] dark:text-slate-100 hover:text-[#1B4F8A]">تعديل</button>
              </div>
            </div>

            {activeTab === 'info' && (() => {
              const shown = (value) => Boolean(value) && value !== 'غير محدد' && value !== 'غير متوفر' && value !== 'قيد التشخيص'
              const age = getEffectiveAge(selectedPatient)
              const phone = selectedPatient.phone
              const whatsapp = selectedPatient.whatsapp_number
              const identity = [
                ['الجنس', selectedPatient.gender === 'female' ? 'أنثى' : selectedPatient.gender === 'male' ? 'ذكر' : ''],
                ['تاريخ الميلاد', selectedPatient.date_of_birth || ''],
                ['العمر', age ? `${age} سنة` : ''],
                ['الجنسية', selectedPatient.nationality],
                ['المهنة', selectedPatient.occupation],
              ].filter(([, value]) => shown(value))
              const contact = [
                ['الجوال', phone],
                ['واتساب', whatsapp && whatsapp !== phone ? whatsapp : ''],
                ['طوارئ', selectedPatient.emergency_contact],
                ['البريد', selectedPatient.email],
                ['العنوان', selectedPatient.address],
                ['تاريخ التسجيل', selectedPatient.registerDate || selectedPatient.registration_date],
              ].filter(([, value]) => shown(value))
              const referral = [
                ['جهة التحويل', selectedPatient.referral_source],
                ['الطبيب المحوّل', selectedPatient.referral_doctor_name],
                ['ترشيح صديق', selectedPatient.referral_friend_name],
              ].filter(([, value]) => shown(value))
              const diagnosis = shown(selectedPatient.diagnosis) ? selectedPatient.diagnosis : ''
              const notes = shown(selectedPatient.notes) ? selectedPatient.notes : ''
              const bands = [
                ['الهوية', identity],
                ['التواصل', contact],
                ['التحويل', referral],
              ]
              const Field = ({ label, value }) => (
                <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 py-1.5">
                  <p className="text-[13px] leading-5 text-[#64748B]">{label}</p>
                  <p className="text-[15px] font-medium leading-6 text-[#0F172A] dark:text-slate-100 break-words">{value}</p>
                </div>
              )
              return (
              <div className="px-5 pb-5">
                {bands.map(([title, rows]) => rows.length > 0 && (
                  <section key={title} className="border-t border-[#E2E8F0] dark:border-slate-700 pt-3 mt-3 first:mt-0 first:border-t-0">
                    <h3 className="text-sm font-semibold leading-5 text-[#0F172A] dark:text-white mb-1">{title}</h3>
                    <div className={rows.length >= 4 ? 'md:grid md:grid-cols-2 md:gap-x-8' : ''}>
                      {rows.map(([label, value]) => <Field key={label} label={label} value={value} />)}
                    </div>
                  </section>
                ))}
                <section className="border-t border-[#E2E8F0] dark:border-slate-700 pt-3 mt-3">
                  <h3 className="text-sm font-semibold leading-5 text-[#0F172A] dark:text-white mb-1">طبي</h3>
                  {diagnosis || notes ? (
                    <div className="max-w-xl">
                      {diagnosis && <Field label="التشخيص" value={diagnosis} />}
                      {notes && <Field label="ملاحظات" value={notes} />}
                    </div>
                  ) : (
                    <p className="text-sm leading-6 text-[#64748B]">لا توجد ملاحظات طبية مسجلة</p>
                  )}
                  {(selectedPatient.status === 'pending' || selectedPatient.status === 'pending_assessment' || selectedPatient.status === 'PENDING_ASSESSMENT') && (
                    <button
                      onClick={async () => {
                        try {
                          setIsSubmitting(true)
                          await patientsService.completeAssessment(selectedPatient.id)
                          toast.success(isRTL ? 'تم اكتمال التقييم' : 'Assessment completed')
                          loadAllData()
                          setShowPatientModal(false)
                        } catch (err) {
                          toast.error(isRTL ? 'فشل اعتماد التقييم' : 'Failed to complete assessment')
                        } finally {
                          setIsSubmitting(false)
                        }
                      }}
                      disabled={isSubmitting}
                      className="mt-3 h-9 px-4 rounded-lg bg-[#1B4F8A] text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {isRTL ? 'اعتماد اكتمال التقييم' : 'Complete assessment'}
                    </button>
                  )}
                </section>

                {(selectedPatient.national_id_front || selectedPatient.national_id_back || selectedPatient.national_id_photo) && (
                  <section className="border-t border-[#E2E8F0] pt-3 mt-3">
                    <h3 className="text-sm font-semibold text-[#0F172A] mb-3">صورة الهوية</h3>
                    <div className="flex gap-3">
                      {(selectedPatient.national_id_front || selectedPatient.national_id_photo) && (
                        <img src={selectedPatient.national_id_front || selectedPatient.national_id_photo} alt="وجه الهوية" className="h-28 w-40 object-cover rounded-lg border border-[#E2E8F0]" />
                      )}
                      {selectedPatient.national_id_back && (
                        <img src={selectedPatient.national_id_back} alt="ظهر الهوية" className="h-28 w-40 object-cover rounded-lg border border-[#E2E8F0]" />
                      )}
                    </div>
                  </section>
                )}
              </div>
              )
            })()}

            {activeTab === 'progress' && (() => {
              const sessions = chart.sessions || []
              const attended = sessions.filter((session) => session.status === 'ATTENDED').length
              const booked = sessions.filter((session) => session.status === 'SCHEDULED').length
              const missed = sessions.filter((session) => session.status === 'MISSED').length
              const treatmentServices = (chart.services || []).filter((service) => service.is_active !== false && !service.is_assessment)
              const typeLabel = { ASSESSMENT: 'تقييم', TREATMENT: 'علاج', FOLLOWUP: 'متابعة', RE_ASSESSMENT: 'إعادة تقييم' }
              const statusLabel = { SCHEDULED: 'محجوزة', ATTENDED: 'تمت', MISSED: 'لم يحضر', CANCELED: 'ملغاة' }
              const statusTone = {
                ATTENDED: 'text-[#047857]',
                SCHEDULED: 'text-[#64748B]',
                MISSED: 'text-[#BE123C]',
                CANCELED: 'text-[#BE123C]',
              }
              return (
                <div className="px-5 pb-6">
                  <section>
                    <h3 className="text-sm font-semibold leading-5 text-[#0F172A] dark:text-white">الجلسات</h3>
                    {sessions.length === 0 ? (
                      <p className="mt-3 text-sm leading-6 text-[#64748B]">لا توجد جلسات مسجلة لهذا المريض.</p>
                    ) : (
                      <>
                        <div className="mt-3 flex items-end gap-8">
                          <div>
                            <p className="text-[28px] font-semibold leading-8 text-[#0F172A] dark:text-slate-50 tabular-nums">{attended}</p>
                            <p className="text-[13px] font-semibold leading-5 text-[#047857]">تمت</p>
                          </div>
                          <div>
                            <p className="text-[15px] font-medium leading-6 text-[#0F172A] dark:text-slate-100 tabular-nums">{booked}</p>
                            <p className="text-[13px] leading-5 text-[#64748B]">محجوزة</p>
                          </div>
                          <div>
                            <p className={`text-[15px] font-medium leading-6 tabular-nums ${missed > 0 ? 'text-[#BE123C]' : 'text-[#0F172A] dark:text-slate-100'}`}>{missed}</p>
                            <p className="text-[13px] leading-5 text-[#64748B]">لم يحضر</p>
                          </div>
                        </div>
                        <ul className="mt-4 max-w-md">
                          {sessions.slice(0, 8).map((session) => (
                            <li key={session.id} className="flex w-max max-w-full items-baseline gap-x-6 border-b border-[#E2E8F0] py-2 last:border-b-0 dark:border-slate-700">
                              <span className="text-[15px] font-medium leading-6 text-[#0F172A] dark:text-slate-100">{typeLabel[session.session_type] || 'جلسة'}</span>
                              <span className="text-[13px] leading-5 text-[#64748B]">
                                {session.session_date ? new Date(session.session_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                              </span>
                              <span className={`text-[13px] font-medium leading-5 ${statusTone[session.status] || 'text-[#64748B]'}`}>{statusLabel[session.status] || ''}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </section>

                  <section className="mt-6 border-t border-[#E2E8F0] pt-5 dark:border-slate-700">
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-sm font-semibold leading-5 text-[#0F172A] dark:text-white">الباقات</h3>
                      {!showPackageForm && (
                        <button type="button" onClick={() => setShowPackageForm(true)} className="text-sm font-medium text-[#1B4F8A]">
                          إضافة باقة
                        </button>
                      )}
                    </div>
                    {(chart.packages || []).length === 0 && !showPackageForm && (
                      <p className="mt-3 max-w-md text-sm leading-6 text-[#64748B]">لا توجد باقة. بعد التقييم تقدر تضيف الخدمات وعدد الجلسات من هنا، والحسابات تؤكد السداد قبل الحجز.</p>
                    )}
                    <div className="mt-3 space-y-5">
                      {(chart.packages || []).map((pkg) => {
                        const waiting = !pkg.payment_verified
                        const exhausted = pkg.status === 'EXHAUSTED'
                        const paymentLabel = waiting ? 'بانتظار تأكيد السداد' : exhausted ? 'خلصت الجلسات' : 'السداد متأكد'
                        return (
                          <div key={pkg.id}>
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                              <p className="text-[15px] font-medium leading-6 text-[#0F172A] dark:text-slate-100">{pkg.package?.name || 'باقة علاج'}</p>
                              <p className="inline-flex items-center gap-1.5 text-[13px] leading-5 text-[#64748B]">
                                {waiting && <span className="h-2 w-2 rounded-full bg-[#EAB308] ring-1 ring-[#A16207]" aria-hidden="true" />}
                                {!waiting && !exhausted && <span className="h-2 w-2 rounded-full bg-[#047857]" aria-hidden="true" />}
                                {paymentLabel}
                              </p>
                            </div>
                            <ul className="mt-1">
                              {(pkg.quotas || []).map((quota) => (
                                <li key={quota.id} className="grid w-max max-w-full grid-cols-[minmax(0,10rem)_auto] gap-x-3 py-1">
                                  <span className="text-[15px] font-medium leading-6 text-[#0F172A] dark:text-slate-100">{quota.service?.name || 'خدمة'}</span>
                                  <span className="text-[13px] leading-5 text-[#64748B]">متبقي <bdi className="tabular-nums">{quota.remaining_sessions}</bdi> من <bdi className="tabular-nums">{quota.session_count}</bdi></span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      })}
                    </div>

                    {showPackageForm && (
                      <form className="mt-4 max-w-md space-y-3" onSubmit={(event) => { event.preventDefault(); savePackageFromProfile() }}>
                        {treatmentServices.length === 0 ? (
                          <p className="text-sm leading-6 text-[#64748B]">لا توجد خدمات علاج مفعّلة. أضفها من إدارة الخدمات، وخلّي خدمة التقييم معلّمة كتقييم.</p>
                        ) : packageLines.map((line, index) => (
                          <div key={index} className="flex items-end gap-3">
                            <label className="block min-w-0 flex-1">
                              {index === 0 && <span className="mb-1 block text-[13px] leading-5 text-[#64748B]">الخدمة</span>}
                              <select
                                value={line.service_id}
                                onChange={(event) => setPackageLines((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, service_id: event.target.value } : row))}
                                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-[15px] text-[#0F172A] focus:border-[#1B4F8A] focus:outline-none dark:bg-slate-900 dark:text-slate-100"
                              >
                                <option value="">اختر الخدمة</option>
                                {treatmentServices.map((service) => (
                                  <option key={service.id} value={service.id}>{service.name}</option>
                                ))}
                              </select>
                            </label>
                            <label className="block">
                              {index === 0 && <span className="mb-1 block text-[13px] leading-5 text-[#64748B]">الجلسات</span>}
                              <input
                                type="number"
                                min="1"
                                value={line.session_count}
                                onChange={(event) => setPackageLines((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, session_count: event.target.value } : row))}
                                className="h-10 w-[5.5rem] rounded-lg border border-[#E2E8F0] bg-white text-center text-[15px] tabular-nums text-[#0F172A] focus:border-[#1B4F8A] focus:outline-none dark:bg-slate-900 dark:text-slate-100"
                                aria-label="عدد الجلسات"
                              />
                            </label>
                            {packageLines.length > 1 && (
                              <button type="button" onClick={() => setPackageLines((rows) => rows.filter((_, rowIndex) => rowIndex !== index))} className="h-10 px-1 text-[13px] text-[#64748B]">حذف</button>
                            )}
                          </div>
                        ))}
                        {treatmentServices.length > 0 && (
                          <>
                            <button type="button" onClick={() => setPackageLines((rows) => [...rows, { service_id: '', session_count: 1 }])} className="text-sm font-medium text-[#1B4F8A]">
                              إضافة خدمة
                            </button>
                            <p className="text-[13px] leading-5 text-[#64748B]">الحجز يتفتح بعد تأكيد الحسابات.</p>
                            <div className="flex w-max gap-2">
                              <button type="submit" disabled={savingPackage} className="h-9 px-4 rounded-lg bg-[#1B4F8A] text-sm font-semibold text-white hover:bg-[#174375] disabled:opacity-50">
                                {savingPackage ? 'جاري الإرسال' : 'إرسال للحسابات'}
                              </button>
                              <button type="button" onClick={() => { setShowPackageForm(false); setPackageLines([{ service_id: '', session_count: 1 }]) }} className="h-9 px-2 text-sm font-medium text-[#0F172A] dark:text-slate-100">
                                إلغاء
                              </button>
                            </div>
                          </>
                        )}
                      </form>
                    )}
                  </section>
                </div>
              )
            })()}

            {/* باقي التبويبات - نفس الكود الأصلي (محذوف للاختصار) */}
            {activeTab === 'xrays' && (
              <div className="px-5 pb-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">الأشعة</h3>
                  <button onClick={() => setShowXrayModal(true)} className="text-sm text-[#1B4F8A]">إضافة أشعة</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {!selectedPatient.xrays || selectedPatient.xrays.length === 0 ? (
                    <p className="text-sm text-slate-500 col-span-2 py-6">لا توجد أشعة مسجلة</p>
                  ) : (
                    selectedPatient.xrays.map((xray) => (
                      <div key={xray.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{xray.title}</p>
                            <p className="text-xs text-slate-500">{xray.date ? new Date(xray.date).toLocaleDateString('ar-EG') : 'غير مسجل'}{xray.doctorName ? ` ${xray.doctorName}` : ''}</p>
                            {xray.bodyPart && <p className="text-xs text-slate-500 mt-1">المنطقة: {getBodyPartText(xray.bodyPart)}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleViewXray(xray)} className="text-[#1B4F8A]" aria-label="عرض"><Eye size={14} /></button>
                            <button onClick={() => handleDeleteXray(xray.id)} className="text-rose-700" aria-label="حذف"><Trash2 size={14} /></button>
                          </div>
                        </div>
                        {xray.description && <p className="text-sm text-slate-600 mt-2">{xray.description}</p>}
                        {xray.report && <p className="text-xs text-slate-600 mt-2">التقرير: {xray.report}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="px-5 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {isRTL ? 'الروشتات' : 'Prescriptions'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isRTL ? 'اكتب الروشتة أو ارفعها صورة أو PDF' : 'Write the prescription or upload an image or PDF'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer text-sm text-[#1B4F8A]">
                      {isRTL ? 'رفع ملف' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={handleDirectPrescriptionUpload}
                      />
                    </label>
                    <button
                      onClick={() => setShowPrescriptionModal(true)}
                      className="text-sm text-[#1B4F8A]"
                    >
                      {isRTL ? 'روشتة جديدة' : 'New prescription'}
                    </button>
                  </div>
                </div>

                {prescriptions.filter(p=>p.patientId===selectedPatient.id).length===0 ? (
                  <p className="text-sm text-slate-500 py-6">{isRTL ? 'لا توجد روشتات مسجلة لهذا المريض' : 'No prescriptions for this patient'}</p>
                ) : (
                  <div className="space-y-3">
                    {prescriptions.filter(p=>p.patientId===selectedPatient.id).map(p=>(
                      <div key={p.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-700/40 pb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{p.prescriptionNumber}</span>
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-sans">
                                {p.doctorName || (isRTL ? 'الطبيب المعالج' : 'Doctor')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{new Date(p.prescriptionDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeletePrescription(p.id)}
                              className="text-red-400 hover:bg-red-500/20 p-1.5 rounded-lg transition"
                              title={isRTL ? 'حذف الروشتة' : 'Delete Prescription'}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Uploaded File / Image Section */}
                        {p.fileUrl && (
                          <div className="p-3 bg-gray-700/40 rounded-xl border border-gray-600/40 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                                <Paperclip size={14} className="text-blue-400" />
                                {isRTL ? 'الملف المرفق للروشتة:' : 'Attached Prescription File:'}
                              </span>
                              <span className="text-[11px] text-gray-400 font-mono">
                                {p.fileName || (p.fileType?.includes('pdf') ? 'Prescription.pdf' : 'Prescription.jpg')}
                              </span>
                            </div>

                            {/* Image Preview or PDF Link */}
                            {p.fileType?.includes('pdf') || p.fileName?.endsWith('.pdf') ? (
                              <div className="flex items-center justify-between p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <FileText className="text-red-400" size={24} />
                                  <div>
                                    <p className="text-xs font-bold text-red-300">{p.fileName || 'روشتة طبية.pdf'}</p>
                                    <p className="text-[10px] text-gray-400">{isRTL ? 'مستند PDF' : 'PDF Document'}</p>
                                  </div>
                                </div>
                                <a
                                  href={p.fileUrl}
                                  download={p.fileName || `${p.prescriptionNumber}.pdf`}
                                  className="px-3 py-1.5 bg-red-600/30 hover:bg-red-600/50 text-red-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                                >
                                  <Download size={13} />
                                  <span>{isRTL ? 'تحميل' : 'Download'}</span>
                                </a>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div
                                  className="w-full max-h-48 rounded-lg overflow-hidden border border-gray-600 cursor-pointer bg-black/40 group relative"
                                  onClick={() => handleViewImage([{ id: p.id, data: p.fileUrl, title: `روشتة: ${p.prescriptionNumber}` }], 0)}
                                >
                                  <img
                                    src={p.fileUrl}
                                    alt="Prescription"
                                    className="w-full h-44 object-contain transition group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs font-bold gap-1">
                                    <Eye size={16} />
                                    <span>{isRTL ? 'انقر للتكبير' : 'Click to view'}</span>
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  <a
                                    href={p.fileUrl}
                                    download={p.fileName || `${p.prescriptionNumber}.jpg`}
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                                  >
                                    <Download size={13} />
                                    <span>{isRTL ? 'تحميل الصورة الأصلية' : 'Download Image'}</span>
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Medications list if any */}
                        {p.medications && p.medications.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-xs font-bold text-gray-400 block">{isRTL ? 'الأدوية الموصوفة:' : 'Prescribed Medications:'}</span>
                            {p.medications.map((m,i)=>(
                              <div key={i} className="bg-gray-700/40 rounded-lg p-2.5 flex items-center justify-between text-xs">
                                <div>
                                  <strong className="text-slate-900 text-sm">{m.name}</strong>
                                  {m.instructions && <p className="text-gray-400 text-[11px] mt-0.5">{m.instructions}</p>}
                                </div>
                                <div className="text-right text-gray-300 text-[11px] space-x-2">
                                  {m.dosage && <span className="bg-gray-800 px-2 py-0.5 rounded">{m.dosage}</span>}
                                  {m.frequency && <span className="bg-gray-800 px-2 py-0.5 rounded">{m.frequency}</span>}
                                  {m.duration && <span className="bg-gray-800 px-2 py-0.5 rounded">{m.duration}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {p.notes && (
                          <div className="text-xs text-gray-300 bg-gray-900/30 p-2.5 rounded-lg border border-gray-700/30">
                            <span className="font-bold text-gray-400 ml-1">📋 {isRTL ? 'ملاحظات:' : 'Notes:'}</span>
                            {p.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="px-5 pb-5">
                {!selectedPatient.reports?.length ? (
                  <p className="text-sm text-slate-500 py-6">لا توجد تقارير</p>
                ) : (
                  selectedPatient.reports.map(r=>(
                    <div key={r.id} className="border-b border-slate-200 py-3">
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{r.title}</p>
                          <p className="text-xs text-slate-500">{r.date ? new Date(r.date).toLocaleDateString('ar-EG') : 'غير مسجل'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={()=>handleEditReport(r)} className="text-[#1B4F8A]" aria-label="تعديل"><Edit size={14}/></button>
                          <button onClick={()=>handleDeleteReport(r.id)} className="text-rose-700" aria-label="حذف"><Trash2 size={14}/></button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 mt-2">{r.content}</p>
                    </div>
                  ))
                )}
                <button onClick={()=>setShowReportModal(true)} className="text-sm text-[#1B4F8A] mt-3">إضافة تقرير</button>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="px-5 pb-5">
                {selectedPatient.images?.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedPatient.images.map((img,idx)=>(
                      <div key={img.id} className="rounded-lg overflow-hidden border border-slate-200 cursor-pointer" onClick={()=>handleViewImage(selectedPatient.images,idx)}>
                        <img src={img.data} alt={img.title || 'صورة'} className="w-full h-32 object-cover"/>
                        <div className="p-2 flex items-center justify-between gap-2">
                          <p className="text-sm truncate text-slate-900">{img.title || 'صورة'}</p>
                          <button onClick={(e)=>{e.stopPropagation();handleDeleteImage(img.id)}} className="text-xs text-rose-700">حذف</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 py-6">لا توجد صور مسجلة</p>
                )}
                <p className="text-sm text-slate-500 mt-3">رفع الصور غير متاح حتى يتوفر تخزين الملفات.</p>
              </div>
            )}

            {/* المودالات الفرعية */}
            {showXrayModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
                  <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">إضافة أشعة / صورة شعاعية</h2><button onClick={() => setShowXrayModal(false)}><X size={20} className="text-gray-400" /></button></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">نوع الأشعة</label><div className="flex gap-2"><button onClick={() => setXrayType('image')} className={`flex-1 py-2 rounded-lg ${xrayType === 'image' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}><Camera size={16} className="inline mr-1" /> صورة أشعة</button><button onClick={() => setXrayType('report')} className={`flex-1 py-2 rounded-lg ${xrayType === 'report' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}><FileText size={16} className="inline mr-1" /> تقرير أشعة فقط</button></div></div>
                    <div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">عنوان الأشعة *</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" placeholder="مثال: أشعة الركبة اليمنى" value={xrayTitle} onChange={(e)=>setXrayTitle(e.target.value)} /></div>
                    <div><label className="block text-sm text-gray-400 mb-1">تاريخ الأشعة</label><input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={xrayDate} onChange={(e)=>setXrayDate(e.target.value)} /></div>
                    <div><label className="block text-sm text-gray-400 mb-1">منطقة الجسم</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={xrayBodyPart} onChange={(e)=>setXrayBodyPart(e.target.value)}><option value="">اختر المنطقة</option><option value="head">الرأس</option><option value="neck">الرقبة</option><option value="chest">الصدر</option><option value="abdomen">البطن</option><option value="spine">العمود الفقري</option><option value="arm">الذراع</option><option value="leg">الساق</option><option value="knee">الركبة</option><option value="hand">اليد</option><option value="foot">القدم</option><option value="other">أخرى</option></select></div>
                    <div><label className="block text-sm text-gray-400 mb-1">الطبيب المعالج</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" placeholder="اسم الطبيب" value={xrayDoctor} onChange={(e)=>setXrayDoctor(e.target.value)} /></div>
                    <div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">وصف الأشعة</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" placeholder="وصف تفصيلي للأشعة..." value={xrayDesc} onChange={(e)=>setXrayDesc(e.target.value)} /></div>
                    {xrayType === 'image' && (<div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">صورة الأشعة</label><input type="file" accept="image/*" onChange={handleXrayFileSelect} className="w-full p-2 bg-gray-700 rounded-lg text-white" />{xrayFile && <p className="text-sm text-green-400 mt-1">✓ {xrayFile.name}</p>}</div>)}
                    <div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">تقرير الأشعة</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="4" placeholder="اكتب تقرير الأشعة هنا..." value={xrayReport} onChange={(e)=>setXrayReport(e.target.value)} /></div>
                  </div>
                  <div className="flex gap-3 pt-4 mt-4 border-t border-gray-700">
                    <button type="button" disabled title="رفع الصور غير متاح حتى يتوفر تخزين الملفات" className="flex-1 bg-gray-700/40 text-gray-500 py-2 rounded-lg cursor-not-allowed">
                      {isSubmitting ? <Loader2 size={16} className="animate-spin inline ml-1" /> : null}
                      رفع الصور غير متاح حتى يتوفر تخزين الملفات
                    </button>
                    <button onClick={()=>setShowXrayModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">إلغاء</button>
                  </div>
                </div>
              </div>
            )}

            {showXrayViewer && selectedXray && (
              <div className="fixed inset-0 bg-black/95 backdrop-blur-lg z-50 flex items-center justify-center p-4">
                <button onClick={()=>setShowXrayViewer(false)} className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"><X size={24}/></button>
                <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
                  <div className="bg-gray-900 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{selectedXray.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{new Date(selectedXray.date).toLocaleDateString()} | {selectedXray.doctorName} | {selectedXray.bodyPart && `منطقة: ${getBodyPartText(selectedXray.bodyPart)}`}</p>
                    {selectedXray.imageData && <img src={selectedXray.imageData} alt={selectedXray.title} className="max-w-full rounded-lg mb-4 border border-gray-700" />}
                    {selectedXray.report && (<div className="bg-gray-800 rounded-lg p-4 mt-4"><h4 className="font-bold text-blue-400 mb-2">تقرير الأشعة</h4><p className="text-gray-300 whitespace-pre-wrap">{selectedXray.report}</p></div>)}
                    <div className="flex gap-3 mt-4">
                      <button onClick={()=>handleDownloadXray(selectedXray)} className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2"><Download size={16}/> تحميل الصورة</button>
                      <button onClick={()=>setShowXrayViewer(false)} className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg">إغلاق</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showImageUpload && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
                  <h2 className="text-xl font-bold text-white mb-4">رفع صورة طبية</h2>
                  <div className="flex gap-2 mb-3">
                    <button onClick={()=>setUploadType('xray')} className={`flex-1 py-2 rounded-lg ${uploadType==='xray'?'bg-blue-500/20 text-blue-400':'bg-gray-700 text-gray-400'}`}>أشعة</button>
                    <button onClick={()=>setUploadType('report')} className={`flex-1 py-2 rounded-lg ${uploadType==='report'?'bg-blue-500/20 text-blue-400':'bg-gray-700 text-gray-400'}`}>تقرير</button>
                  </div>
                  <input type="text" placeholder="عنوان الصورة" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={uploadTitle} onChange={(e)=>setUploadTitle(e.target.value)}/>
                  <textarea placeholder="وصف الصورة" className="w-full p-2 bg-gray-700 rounded-lg text-white mt-3" rows="2" value={uploadDesc} onChange={(e)=>setUploadDesc(e.target.value)}/>
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="w-full p-2 bg-gray-700 rounded-lg text-white mt-3"/>
                  {selectedFile && <p className="text-sm text-green-400 mt-2">✓ {selectedFile.name}</p>}
                  <div className="flex gap-3 mt-4">
                    <button type="button" disabled title="رفع الصور غير متاح حتى يتوفر تخزين الملفات" className="flex-1 bg-gray-700/40 text-gray-500 py-2 rounded-lg cursor-not-allowed">
                      {isSubmitting ? <Loader2 size={16} className="animate-spin inline ml-1" /> : null}
                      رفع الصور غير متاح حتى يتوفر تخزين الملفات
                    </button>
                    <button onClick={()=>setShowImageUpload(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">إلغاء</button>
                  </div>
                </div>
              </div>
            )}

            {showReportModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
                  <h2 className="text-xl font-bold text-white mb-4">إضافة تقرير طبي</h2>
                  <input type="text" placeholder="عنوان التقرير" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newReport.title} onChange={(e)=>setNewReport({...newReport,title:e.target.value})}/>
                  <textarea placeholder="محتوى التقرير" className="w-full p-2 bg-gray-700 rounded-lg text-white mt-3" rows="5" value={newReport.content} onChange={(e)=>setNewReport({...newReport,content:e.target.value})}/>
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleAddReport} disabled={isSubmitting} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50">
                      {isSubmitting ? <Loader2 size={16} className="animate-spin inline ml-1" /> : null}
                      {isSubmitting ? 'جاري الإضافة...' : 'إضافة'}
                    </button>
                    <button onClick={()=>setShowReportModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">إلغاء</button>
                  </div>
                </div>
              </div>
            )}

            {showEditReportModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
                  <h2 className="text-xl font-bold text-white mb-4">تعديل التقرير</h2>
                  <input type="text" placeholder="عنوان التقرير" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editReportData.title} onChange={(e)=>setEditReportData({...editReportData,title:e.target.value})}/>
                  <textarea placeholder="محتوى التقرير" className="w-full p-2 bg-gray-700 rounded-lg text-white mt-3" rows="5" value={editReportData.content} onChange={(e)=>setEditReportData({...editReportData,content:e.target.value})}/>
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleSaveReportEdit} disabled={isSubmitting} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg hover:bg-blue-500/30 transition disabled:opacity-50">
                      {isSubmitting ? <Loader2 size={16} className="animate-spin inline ml-1" /> : null}
                      {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
                    </button>
                    <button onClick={()=>setShowEditReportModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">إلغاء</button>
                  </div>
                </div>
              </div>
            )}

            {showPrescriptionModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700 shadow-2xl">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-3">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Pill className="text-blue-400" size={22} />
                      {isRTL ? 'إضافة روشتة طبية' : 'Add Medical Prescription'}
                    </h2>
                    <button onClick={()=>setShowPrescriptionModal(false)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                      <X size={20} />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 font-bold block mb-1">{isRTL ? 'المريض' : 'Patient'}</label>
                    <input type="text" value={getPatientName(selectedPatient)} disabled className="w-full p-2.5 bg-gray-700/50 rounded-xl text-white text-sm border border-gray-600"/>
                  </div>

                  {/* Attachment Box: Upload Image or PDF */}
                  <div className="mt-4 p-4 bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-600 hover:border-blue-500/60 transition">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Upload size={16} className="text-blue-400" />
                        {isRTL ? 'رفع الروشتة كصورة أو ملف PDF (اختياري / كبديل لإدخال الأدوية):' : 'Upload Prescription as Image or PDF (Optional/Alternative):'}
                      </span>
                      {prescriptionForm.prescriptionFile && (
                        <button
                          type="button"
                          onClick={() => setPrescriptionForm(prev => ({ ...prev, prescriptionFile: '', fileName: '', fileType: '' }))}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                        >
                          <Trash2 size={13} /> {isRTL ? 'إزالة الملف' : 'Remove File'}
                        </button>
                      )}
                    </div>

                    {!prescriptionForm.prescriptionFile ? (
                      <label className="flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-gray-700/40 rounded-lg transition">
                        <Upload size={28} className="text-gray-400 mb-2" />
                        <span className="text-xs text-blue-400 font-bold">
                          {isRTL ? 'انقر لاختيار صورة (JPG, PNG) أو ملف PDF للروشتة' : 'Click to select prescription image or PDF'}
                        </span>
                        <span className="text-[11px] text-gray-400 mt-1">
                          {isRTL ? 'يمكنك تصوير الروشتة أو رفع ملفها مباشرة وحفظها' : 'You can take a photo of prescription or upload directly'}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={handlePrescriptionFileUpload}
                        />
                      </label>
                    ) : (
                      <div className="p-3 bg-gray-800 rounded-lg border border-gray-600 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {prescriptionForm.fileType?.includes('pdf') || prescriptionForm.fileName?.endsWith('.pdf') ? (
                            <FileText className="text-red-400" size={32} />
                          ) : (
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-600 shrink-0">
                              <img src={prescriptionForm.prescriptionFile} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-white">{prescriptionForm.fileName || (isRTL ? 'ملف الروشتة' : 'Prescription File')}</p>
                            <p className="text-[10px] text-emerald-400 font-semibold">{isRTL ? '✅ تم إرفاق الملف بنجاح' : '✅ File attached successfully'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Medications list */}
                  <div className="flex justify-between items-center mt-5">
                    <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                      <Pill size={16} className="text-emerald-400" />
                      {isRTL ? 'تفاصيل الأدوية (اختياري عند إرفاق ملف):' : 'Medication Items (Optional if file attached):'}
                    </h3>
                    <button
                      onClick={handleAddMedicationField}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Plus size={14}/> {isRTL ? 'إضافة دواء' : 'Add Medication'}
                    </button>
                  </div>

                  {prescriptionForm.medications.map((med,idx)=>(
                    <div key={idx} className="bg-gray-700/30 rounded-xl p-3 mt-2 border border-gray-700/60">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-300">{isRTL ? `دواء #${idx+1}` : `Medication #${idx+1}`}</span>
                        {prescriptionForm.medications.length > 1 && (
                          <button onClick={()=>handleRemoveMedicationField(idx)} className="text-red-400 hover:text-red-300 p-1">
                            <Trash2 size={14}/>
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder={isRTL ? 'اسم الدواء' : 'Medication name'} className="p-2 bg-gray-700 rounded-lg text-white text-xs" value={med.name} onChange={(e)=>handleMedicationFieldChange(idx,'name',e.target.value)}/>
                        <input type="text" placeholder={isRTL ? 'الجرعة (مثال: 500 ملغ)' : 'Dosage (e.g. 500mg)'} className="p-2 bg-gray-700 rounded-lg text-white text-xs" value={med.dosage} onChange={(e)=>handleMedicationFieldChange(idx,'dosage',e.target.value)}/>
                        <input type="text" placeholder={isRTL ? 'التكرار (مثال: مرتين يومياً)' : 'Frequency (e.g. 2x daily)'} className="p-2 bg-gray-700 rounded-lg text-white text-xs" value={med.frequency} onChange={(e)=>handleMedicationFieldChange(idx,'frequency',e.target.value)}/>
                        <input type="text" placeholder={isRTL ? 'المدة (مثال: أسبوعان)' : 'Duration (e.g. 2 weeks)'} className="p-2 bg-gray-700 rounded-lg text-white text-xs" value={med.duration} onChange={(e)=>handleMedicationFieldChange(idx,'duration',e.target.value)}/>
                        <textarea placeholder={isRTL ? 'تعليمات الاستخدام...' : 'Instructions...'} className="col-span-2 p-2 bg-gray-700 rounded-lg text-white text-xs" rows="1" value={med.instructions} onChange={(e)=>handleMedicationFieldChange(idx,'instructions',e.target.value)}/>
                      </div>
                    </div>
                  ))}

                  <textarea
                    placeholder={isRTL ? 'ملاحظات إضافية على الروشتة...' : 'Additional prescription notes...'}
                    className="w-full p-2.5 bg-gray-700 rounded-xl text-white text-xs mt-4 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="2"
                    value={prescriptionForm.notes}
                    onChange={(e)=>setPrescriptionForm({...prescriptionForm,notes:e.target.value})}
                  />

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={handleAddPrescription}
                      disabled={isSubmitting}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm shadow-md"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                      <span>{isSubmitting ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الروشتة' : 'Save Prescription')}</span>
                    </button>
                    <button
                      onClick={()=>setShowPrescriptionModal(false)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2.5 rounded-xl transition text-sm"
                    >
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showImageViewer && (
              <div className="fixed inset-0 bg-black/95 backdrop-blur-lg z-50 flex items-center justify-center">
                <button onClick={()=>setShowImageViewer(false)} className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"><X size={24}/></button>
                <div className="relative max-w-[90vw] max-h-[90vh]">
                  <img src={viewerImages[0]?.data} alt="" className="max-w-full max-h-full object-contain"/>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}