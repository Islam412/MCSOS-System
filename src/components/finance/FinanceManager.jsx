// src/components/finance/FinanceManager.jsx
import { useState, useEffect, useMemo } from 'react'
import { confirmAlert } from '../../utils/confirmAlert'
import { useTranslation } from 'react-i18next'
import { 
  DollarSign, CreditCard, FileText, TrendingUp, Clock, CheckCircle, 
  XCircle, Download, Printer, Users, Calendar, Plus, Trash2, Edit, X, Save,
  ShieldCheck, AlertCircle, Check, RefreshCw, Search, Stethoscope, Activity, Layers, Tag, ArrowUpRight, CheckSquare, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { invoicesService, appointmentsService, packagesService, servicesService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

// ========== مفاتيح التخزين في localStorage ==========
const STORAGE_KEYS = {
  INVOICES: 'mcsos_invoices_v2',
  FINANCE_SESSIONS: 'mcsos_finance_sessions_v1',
  FINANCE_PACKAGES: 'mcsos_finance_packages_v1'
}

const getLocalData = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`Error reading ${key}:`, error)
    return null
  }
}

export default function FinanceManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { isOnline, executeWithOfflineSupport } = useServices()

  // ========== Tabs System ==========
  const [activeTab, setActiveTab] = useState('SESSIONS') // 'SESSIONS', 'PACKAGES', 'INVOICES'

  // ========== State For Sessions & Assignments Payment Verification ==========
  const [sessions, setSessions] = useState([])
  const [servicesMap, setServicesMap] = useState({})
  const [sessionSearchTerm, setSessionSearchTerm] = useState('')
  const [sessionStatusFilter, setSessionStatusFilter] = useState('ALL') // 'ALL', 'PENDING', 'VERIFIED'
  const [verifyingSessionId, setVerifyingSessionId] = useState(null)

  // ========== State For Patient Packages ==========
  const [patientPackages, setPatientPackages] = useState([])
  const [packageSearchTerm, setPackageSearchTerm] = useState('')

  // ========== State For Invoices & Ledger ==========
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    patientName: '',
    amount: '',
    packageName: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending'
  })

  // ========== تحميل وتجهيز البيانات ==========
  useEffect(() => {
    loadAllFinanceData()
  }, [isOnline])

  const loadAllFinanceData = async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([
        loadServicesDirectory(),
        loadSessionsData(),
        loadPatientPackagesData(),
        loadTransactions()
      ])
    } catch (err) {
      console.error('Error in loading finance operations data:', err)
      toast.error(isRTL ? 'حدث خطأ في تحميل بيانات المالية' : 'Error loading finance data')
    } finally {
      setLoading(false)
    }
  }

  // 1. Load Services Directory for accurate price & category naming
  const loadServicesDirectory = async () => {
    try {
      if (isOnline) {
        const res = await servicesService.getServices()
        const data = Array.isArray(res) ? res : (res?.data || [])
        const map = {}
        data.forEach(s => { map[s.id] = s; map[s.name] = s; })
        setServicesMap(map)
      }
    } catch (error) {
      console.warn('Could not fetch services for mapping:', error)
    }
  }

  // 2. Load Sessions with Doctor Assignments & Package linkages
  const loadSessionsData = async () => {
    try {
      let liveSessions = []
      if (isOnline) {
        try {
          const res = await appointmentsService.getAppointments({ limit: 100 })
          liveSessions = Array.isArray(res) ? res : (res?.sessions || res?.data || [])
        } catch (e) {
          console.warn('API sessions fetch failed, using local fallback:', e)
        }
      }

      if (!liveSessions || liveSessions.length === 0) {
        liveSessions = [
          {
            id: 'SESS-101',
            patient_name: isRTL ? 'محمود عبد السلام أحمد' : 'Mahmoud Abdelsalam',
            patient_code: 'MC-2026-01',
            doctor_name: isRTL ? 'د. أحمد رمزي (العلاج الطبيعي)' : 'Dr. Ahmed Ramzy (PT)',
            service_title: isRTL ? 'علاج مائي (Hydrotherapy)' : 'Hydrotherapy',
            category: 'NEURO_PT',
            price: 450,
            session_type: 'ASSESSMENT',
            session_date: '2026-08-04T10:30:00.000Z',
            room_title: isRTL ? 'حمام العلاج المائي 1' : 'Hydro Pool 1',
            package_info: null,
            payment_verified: false,
            notes: isRTL ? 'تقييم أولي - يلزم تأكيد السداد' : 'Initial assessment'
          },
          {
            id: 'SESS-102',
            patient_name: isRTL ? 'فاطمة الزهراء علي' : 'Fatima Alzahraa Ali',
            patient_code: 'MC-2026-14',
            doctor_name: isRTL ? 'د. محمد شاكر (عظام وتأهيل)' : 'Dr. Mohamed Shaker (Ortho)',
            service_title: isRTL ? 'علاج طبيعي عظام جزئين' : '2-Part Ortho PT',
            category: 'ORTHO_PT',
            price: 750,
            session_type: 'THERAPY',
            session_date: '2026-08-04T11:15:00.000Z',
            room_title: isRTL ? 'غرفة العلاج 203' : 'Room 203',
            package_info: isRTL ? 'باكدج عظام (6 جلسات)' : 'Ortho 6-Session Pkg',
            payment_verified: false,
            notes: isRTL ? 'خصم من رصيد الباكدج' : 'Deduct from active package'
          },
          {
            id: 'SESS-103',
            patient_name: isRTL ? 'عمر هشام السيد' : 'Omar Hesham Elsayed',
            patient_code: 'MC-2026-38',
            doctor_name: isRTL ? 'أ. هند محمود (تخاطب)' : 'Spec. Hend (Speech)',
            service_title: isRTL ? 'إختبار ذكاء (IQ Test)' : 'IQ Test Assessment',
            category: 'SPEECH_THERAPY',
            price: 850,
            session_type: 'ASSESSMENT',
            session_date: '2026-08-04T09:00:00.000Z',
            room_title: isRTL ? 'غرفة قياسات 102' : 'Room 102',
            package_info: null,
            payment_verified: true,
            payment_verified_by: isRTL ? 'حسابات المركز (أحمد)' : 'Finance Dept (Ahmed)',
            payment_verified_at: '08:50 صباحاً',
            notes: isRTL ? 'تم سداد الرسوم نقداً' : 'Paid in cash'
          },
        ]
      } else {
        liveSessions = liveSessions.map(s => {
          const patientName = s.patient ? (s.patient.name || `${s.patient.first_name || ''} ${s.patient.last_name || ''}`) : (s.patient_name || 'مريض')
          const doctorName = s.doctor ? s.doctor.name : (s.doctor_name || (isRTL ? 'طبيب المركز' : 'Assigned Doctor'))
          const serviceObj = s.service || (s.service_id && servicesMap[s.service_id])
          return {
            ...s,
            patient_name: patientName,
            doctor_name: doctorName,
            service_title: serviceObj ? serviceObj.name : (s.service_title || (isRTL ? 'كشف طبي مخصص' : 'Medical Consultation')),
            category: serviceObj ? serviceObj.category : 'GENERAL',
            price: serviceObj ? serviceObj.price : (s.price || 450),
            room_title: s.room ? s.room.name : (s.room_title || (isRTL ? 'غرفة الكشف' : 'Treatment Room'))
          }
        })
      }
      setSessions(liveSessions)
    } catch (error) {
      console.error('Error loading sessions for finance:', error)
    }
  }

  // 3. Load Patient Packages for billing confirmation
  const loadPatientPackagesData = async () => {
    try {
      let pkgs = []
      if (isOnline) {
        try {
          pkgs = await packagesService.getAllPatientPackages()
        } catch (e) {
          console.warn('API patient-packages fetch failed, using local:', e)
        }
      }

      if (!pkgs || pkgs.length === 0) {
        pkgs = [
          {
            id: 'PP-501',
            patient_name: isRTL ? 'فاطمة الزهراء علي' : 'Fatima Alzahraa Ali',
            package_title: isRTL ? 'باكدج علاج طبيعي عظام (6 جلسات)' : 'Ortho PT (6 Sessions)',
            total_sessions: 6,
            remaining_sessions: 4,
            final_price: 4200,
            status: 'ACTIVE',
            payment_status: 'PAID',
            created_at: '2026-08-01',
            notes: isRTL ? 'سداد كامل بالفيزا' : 'Full payment via Card'
          },
          {
            id: 'PP-502',
            patient_name: isRTL ? 'محمود عبد السلام أحمد' : 'Mahmoud Abdelsalam',
            package_title: isRTL ? 'باكدج علاج مائي (6 جلسات)' : 'Hydrotherapy (6 Sessions)',
            total_sessions: 6,
            remaining_sessions: 6,
            final_price: 2100,
            status: 'ACTIVE',
            payment_status: 'PENDING',
            created_at: '2026-08-04',
            notes: isRTL ? 'بانتظار التحصيل' : 'Pending collection today'
          },
          {
            id: 'PP-503',
            patient_name: isRTL ? 'سارة كريم فهمي' : 'Sara Karim Fahmy',
            package_title: isRTL ? 'باكدج علاج مائي أطفال (12 جلسة)' : 'Pediatric Hydro (12 Sessions)',
            total_sessions: 12,
            remaining_sessions: 8,
            final_price: 3600,
            status: 'ACTIVE',
            payment_status: 'PAID',
            created_at: '2026-07-20',
            notes: isRTL ? 'مدفوع نقدًا بالكامل' : 'Fully paid in cash'
          }
        ]
      }
      setPatientPackages(pkgs)
    } catch (error) {
      console.error('Error loading patient packages:', error)
    }
  }

  // 4. Load Invoices & General Transactions
  const loadTransactions = async () => {
    try {
      if (isOnline) {
        try {
          const response = await executeWithOfflineSupport(
            () => invoicesService.getInvoices(),
            'invoices',
            getLocalData(STORAGE_KEYS.INVOICES)
          )
          let data = response && response.invoices ? response.invoices : (Array.isArray(response) ? response : null)
          if (data && data.length > 0) {
            const formattedData = data.map(item => ({
              id: item.id || Date.now(),
              patientNameAr: item.patientName || item.patientNameAr || 'مريض',
              patientNameEn: item.patientNameEn || item.patientName || 'Patient',
              patientNameFr: item.patientNameFr || item.patientName || 'Patient',
              amount: item.amount || 0,
              status: item.status || 'pending',
              date: item.date || new Date().toISOString().split('T')[0],
              packageAr: item.packageAr || item.packageName || 'باقة جلسات تأهيلية',
              packageEn: item.packageEn || item.packageName || 'Rehab Package',
              packageFr: item.packageFr || item.packageName || 'Forfait',
              _syncPending: item._syncPending || false
            }))
            setTransactions(formattedData)
            localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(formattedData))
            return
          }
        } catch (apiError) {
          console.warn('API invoices failed, falling back to local data:', apiError)
        }
      }
      loadLocalTransactions()
    } catch (err) {
      loadLocalTransactions()
    }
  }

  const loadLocalTransactions = () => {
    const saved = getLocalData(STORAGE_KEYS.INVOICES)
    if (saved && saved.length > 0) {
      setTransactions(saved)
    } else {
      const defaultTransactions = [
        { id: 'REC-1001', patientNameAr: 'أحمد محمد الصاوي', patientNameEn: 'Ahmed Mohamed', amount: 2100, status: 'paid', date: '2026-08-04', packageAr: 'باكدج علاج مائي (6 جلسات)', packageEn: 'Hydrotherapy Package (6 Sessions)' },
        { id: 'REC-1002', patientNameAr: 'سارة حسن يوسف', patientNameEn: 'Sara Hassan', amount: 4200, status: 'paid', date: '2026-08-03', packageAr: 'باكدج علاج طبيعي عظام (6 جلسات)', packageEn: 'Ortho PT Package (6 Sessions)' },
        { id: 'REC-1003', patientNameAr: 'محمود علي زين', patientNameEn: 'Mahmoud Ali', amount: 850, status: 'pending', date: '2026-08-03', packageAr: 'كشف وإختبار ذكاء - تخاطب', packageEn: 'IQ Assessment - Speech Therapy' },
      ]
      setTransactions(defaultTransactions)
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(defaultTransactions))
    }
  }

  // ========== Helpers for Sleek UI Formatting ==========
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr.replace('T06:00:00.000Z', '').replace('T05:00:00.000Z', '').replace('.000Z', '')
      const datePart = d.toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      const timePart = d.toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      return `${datePart} ${timePart}`
    } catch {
      return dateStr
    }
  }

  const formatShortId = (id) => {
    if (!id) return ''
    const str = id.toString()
    if (str.length > 10 && str.includes('-')) {
      return '#' + str.split('-')[0].toUpperCase()
    }
    return str.length > 8 ? str.substring(0, 8) + '...' : str
  }

  // ========== Confirm & Verify Session Payment Action ==========
  const handleVerifySessionPayment = async (session) => {
    const isConfirmed = await confirmAlert({ 
      title: isRTL ? 'تأكيد تحصيل رسوم الجلسة' : 'Confirm Session Payment', 
      text: isRTL 
        ? `تأكيد استلام أجر الجلسة للمريض (${session.patient_name}) بقيمة ${session.price || 450} ج.م؟ سيتم منح الإذن للطبيب بالبدء فوراً وتوليد فاتورة بالدفاتر.` 
        : `Confirm payment received for (${session.patient_name})? Doctor will be cleared and an official invoice generated.` 
    })
    if (!isConfirmed) return

    setVerifyingSessionId(session.id)
    try {
      if (isOnline && session.id && !session.id.toString().startsWith('SESS-')) {
        await appointmentsService.verifyPayment(session.id, isRTL ? 'حسابات المركز (مؤكد)' : 'Finance Department')
      }

      const verifierLabel = isRTL ? 'مكتب المالية (مؤكد)' : 'Finance Staff'
      const timeLabel = new Date().toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      
      setSessions(prev => prev.map(s => {
        if (s.id === session.id) {
          return {
            ...s,
            payment_verified: true,
            payment_verified_by: verifierLabel,
            payment_verified_at: timeLabel
          }
        }
        return s
      }))

      // Auto-generate official receipt in invoices ledger
      const existingInvoices = getLocalData(STORAGE_KEYS.INVOICES) || transactions || []
      const invoiceId = 'REC-' + Math.floor(1000 + Math.random() * 9000)
      const autoInvoice = {
        id: invoiceId,
        patient_name: session.patient_name,
        patientNameAr: session.patient_name,
        patientNameEn: session.patient_name,
        amount: Number(session.price || 450),
        subtotal: Number(session.price || 450),
        status: 'paid',
        payment_status: 'paid',
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString().split('T')[0],
        packageName: `سداد موعد جلسة: ${session.service_title} (${session.doctor_name})`,
        packageAr: `سداد موعد جلسة: ${session.service_title} (${session.doctor_name})`,
        packageEn: `Session Fee: ${session.service_title} (${session.doctor_name})`,
        _syncPending: !isOnline
      }
      await saveTransactions([autoInvoice, ...existingInvoices])

      toast.success(isRTL ? '✅ تم تأكيد سداد الجلسة وإصدار الإيصال! تم السماح للطبيب بالبدء' : '✅ Payment confirmed! Receipt created & doctor cleared.')
    } catch (err) {
      console.error('Failed to verify session payment:', err)
      toast.error(isRTL ? 'حدث خطأ أثناء تأكيد الدفع' : 'Error verifying payment')
    } finally {
      setVerifyingSessionId(null)
    }
  }

  // ========== Confirm Package Payment Action ==========
  const handleVerifyPackagePayment = async (pkg) => {
    if (!(await confirmAlert({ title: isRTL ? 'تأكيد سداد الباقة' : 'Confirm Package Payment', text: isRTL ? `هل تؤكد استلام دفعة الباقة بالكامل للمريض (${pkg.patient_name}) بقيمة ${pkg.final_price} ج.م؟ سيتم إدراجها فوراً في سجل الفواتير.` : `Confirm package payment of ${pkg.final_price} EGP for ${pkg.patient_name}?` }))) return

    setPatientPackages(prev => prev.map(p => {
      if (p.id === pkg.id) {
        return { ...p, payment_status: 'PAID' }
      }
      return p
    }))

    // Auto-generate official receipt in invoices ledger
    const existingInvoices = getLocalData(STORAGE_KEYS.INVOICES) || transactions || []
    const invoiceId = 'REC-' + Math.floor(1000 + Math.random() * 9000)
    const autoInvoice = {
      id: invoiceId,
      patient_name: pkg.patient_name,
      patientNameAr: pkg.patient_name,
      patientNameEn: pkg.patient_name,
      amount: Number(pkg.final_price || 2100),
      subtotal: Number(pkg.final_price || 2100),
      status: 'paid',
      payment_status: 'paid',
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString().split('T')[0],
      packageName: `تحصيل باكدج: ${pkg.package_title}`,
      packageAr: `تحصيل باكدج: ${pkg.package_title}`,
      packageEn: `Package Fee: ${pkg.package_title}`,
      _syncPending: !isOnline
    }
    await saveTransactions([autoInvoice, ...existingInvoices])

    toast.success(isRTL ? '✅ تم تأكيد سداد الباقة وإدراجها في سجل الفواتير بنجاح!' : '✅ Package payment verified & invoiced successfully!')
  }

  // ========== Invoices Actions ==========
  const saveTransactions = async (newTransactions) => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(newTransactions))
    setTransactions(newTransactions)
    if (isOnline) {
      try {
        const pendingItems = newTransactions.filter(item => item._syncPending)
        for (const item of pendingItems) {
          await invoicesService.createInvoice(item)
        }
        const syncedItems = newTransactions.map(item => ({ ...item, _syncPending: false }))
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(syncedItems))
        setTransactions(syncedItems)
      } catch (error) {
        console.warn('Failed to sync invoices with server:', error)
      }
    }
    window.dispatchEvent(new Event('invoicesUpdated'))
  }

  const handleAddTransaction = async () => {
    if (!newTransaction.patientName || !newTransaction.amount) {
      toast.error(isRTL ? 'الرجاء إدخال اسم المريض والمبلغ' : 'Please enter patient name and amount')
      return
    }
    setIsSubmitting(true)
    try {
      const transactionData = {
        patientName: newTransaction.patientName,
        amount: parseFloat(newTransaction.amount),
        packageName: newTransaction.packageName || (isRTL ? 'باقة جلسات' : 'Sessions Package'),
        date: newTransaction.date || new Date().toISOString().split('T')[0],
        status: newTransaction.status || 'pending'
      }
      let newItem = {
        ...transactionData,
        id: 'REC-' + Math.floor(1000 + Math.random() * 9000),
        patientNameAr: transactionData.patientName,
        patientNameEn: transactionData.patientName,
        patientNameFr: transactionData.patientName,
        packageAr: transactionData.packageName,
        packageEn: transactionData.packageName,
        packageFr: transactionData.packageName,
        _syncPending: !isOnline
      }
      const updated = [newItem, ...transactions]
      await saveTransactions(updated)
      toast.success(isRTL ? 'تم إضافة المعاملة بنجاح' : 'Transaction added successfully')
      setShowAddModal(false)
      setNewTransaction({ patientName: '', amount: '', packageName: '', date: new Date().toISOString().split('T')[0], status: 'pending' })
    } catch (error) {
      toast.error(error.message || (isRTL ? 'حدث خطأ في إضافة المعاملة' : 'Error adding transaction'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkAsPaid = async (id) => {
    try {
      if (isOnline) {
        try { await invoicesService.markAsPaid(id) } catch (e) { console.warn(e) }
      }
      const updated = transactions.map(t => t.id === id ? { ...t, status: 'paid', _syncPending: !isOnline } : t)
      await saveTransactions(updated)
      toast.success(t('finance.payment_success'))
    } catch (error) {
      toast.error(isRTL ? 'حدث خطأ في تحديث الدفع' : 'Error updating payment status')
    }
  }

  const handleDeleteTransaction = async (id) => {
    if (!(await confirmAlert({ title: isRTL ? 'تأكيد' : 'Confirm', text: isRTL ? 'هل أنت متأكد من حذف هذه المعاملة؟' : 'Are you sure you want to delete this transaction?' }))) return
    try {
      if (isOnline) {
        try { await invoicesService.deleteInvoice(id) } catch (e) { console.warn(e) }
      }
      const updated = transactions.filter(t => t.id !== id)
      await saveTransactions(updated)
      toast.success(isRTL ? 'تم حذف المعاملة' : 'Transaction deleted')
    } catch (error) {
      toast.error(isRTL ? 'حدث خطأ في حذف المعاملة' : 'Error deleting transaction')
    }
  }

  const handleViewInvoice = (transaction) => {
    setSelectedTransaction(transaction)
    setShowInvoiceModal(true)
  }

  const handlePrintInvoice = () => {
    window.print()
    toast.success(t('finance.printing'))
  }

  const handleExportReport = async () => {
    try {
      const reportData = JSON.stringify({ sessions, patientPackages, transactions }, null, 2)
      const blob = new Blob([reportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `finance_report_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(t('finance.exporting'))
    } catch (error) {
      toast.error(isRTL ? 'حدث خطأ في التصدير' : 'Error exporting report')
    }
  }

  const getPatientName = (transaction) => {
    const lang = i18n.language
    if (lang === 'ar') return transaction.patientNameAr || transaction.patientName
    return transaction.patientNameEn || transaction.patientName
  }

  const getPackageName = (transaction) => {
    const lang = i18n.language
    if (lang === 'ar') return transaction.packageAr || transaction.packageName
    return transaction.packageEn || transaction.packageName
  }

  // ========== Filtered Lists ==========
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchesSearch = !sessionSearchTerm || 
        s.patient_name?.toLowerCase().includes(sessionSearchTerm.toLowerCase()) || 
        s.doctor_name?.toLowerCase().includes(sessionSearchTerm.toLowerCase()) ||
        s.service_title?.toLowerCase().includes(sessionSearchTerm.toLowerCase())
      
      if (sessionStatusFilter === 'PENDING') return matchesSearch && !s.payment_verified
      if (sessionStatusFilter === 'VERIFIED') return matchesSearch && s.payment_verified
      return matchesSearch
    })
  }, [sessions, sessionSearchTerm, sessionStatusFilter])

  const filteredPatientPackages = useMemo(() => {
    return patientPackages.filter(p => {
      return !packageSearchTerm || 
        p.patient_name?.toLowerCase().includes(packageSearchTerm.toLowerCase()) ||
        p.package_title?.toLowerCase().includes(packageSearchTerm.toLowerCase())
    })
  }, [patientPackages, packageSearchTerm])

  // ========== Calculated KPIs ==========
  const stats = useMemo(() => {
    const pendingSessionsCount = sessions.filter(s => !s.payment_verified).length
    const verifiedSessionsCount = sessions.filter(s => s.payment_verified).length
    const sessionsRevenue = sessions.reduce((acc, s) => acc + (s.payment_verified ? (Number(s.price) || 0) : 0), 0)
    const packagesRevenue = patientPackages.reduce((acc, p) => acc + (p.payment_status === 'PAID' ? (Number(p.final_price) || 0) : 0), 0)
    const invoicesRevenue = transactions.reduce((acc, t) => acc + (t.status === 'paid' ? (Number(t.amount) || 0) : 0), 0)

    return {
      pendingSessionsCount,
      verifiedSessionsCount,
      sessionsRevenue,
      packagesRevenue,
      invoicesRevenue,
      totalCashFlow: sessionsRevenue + packagesRevenue + invoicesRevenue,
      pendingInvoicesAmount: transactions.reduce((acc, t) => acc + (t.status === 'pending' ? (Number(t.amount) || 0) : 0), 0)
    }
  }, [sessions, patientPackages, transactions])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-sm font-bold text-slate-700 dark:text-white">{isRTL ? 'جاري تحميل الحسابات...' : 'Loading financial data...'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-8 text-slate-800 dark:text-gray-100 font-sans max-w-full overflow-hidden">
      {/* Sleek Compact Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-700/80 shadow-xs ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-xl shadow-sm">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-emerald-700 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              {isRTL ? 'المالية والحسابات - تأكيد سداد المواعيد والباكدج' : 'Finance & Payment Verification Center'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium mt-0.5">
              {isRTL ? 'توثيق مدفوعات الجلسات الفورية، التسكين الطبي، وإدارة أرصدة الباقات' : 'Verify instant session payments, doctor clearances, and packages'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl shadow-sm transition text-xs flex items-center gap-1.5 active:scale-95"
          >
            <Plus size={16} />
            <span>{isRTL ? 'معاملة جديدة' : 'New Transaction'}</span>
          </button>
          <button 
            onClick={handleExportReport}
            className="bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200 font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 text-xs"
          >
            <Download size={15} />
            <span>{isRTL ? 'تصدير' : 'Export'}</span>
          </button>
          <button 
            onClick={loadAllFinanceData}
            className="p-2 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200 rounded-xl transition text-xs"
            title={isRTL ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      
      {/* Sleek KPI Stats Cards (High Data Density) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase text-amber-100 tracking-wider">
                {isRTL ? 'جلسات بانتظار التأكيد ⏳' : 'Pending Sessions ⏳'}
              </div>
              <div className="text-2xl font-extrabold mt-1 font-mono">
                {stats.pendingSessionsCount} <span className="text-xs font-sans font-normal">{isRTL ? 'موعد' : 'pending'}</span>
              </div>
            </div>
            <div className="p-2 bg-white/20 rounded-xl shrink-0">
              <Clock size={20} className="animate-pulse" />
            </div>
          </div>
          <div className="text-[10px] text-amber-100/90 mt-2 font-medium bg-black/15 px-2 py-0.5 rounded-md inline-block">
            {isRTL ? 'شرط لبدء التقييم الطبي' : 'Required clearance'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase text-emerald-100 tracking-wider">
                {isRTL ? 'جلسات مؤكدة الدفع اليوم ✅' : 'Verified Today ✅'}
              </div>
              <div className="text-2xl font-extrabold mt-1 font-mono">
                {stats.verifiedSessionsCount} <span className="text-xs font-sans font-normal">{isRTL ? 'مكتمل' : 'cleared'}</span>
              </div>
            </div>
            <div className="p-2 bg-white/20 rounded-xl shrink-0">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="text-[11px] text-emerald-100 mt-2 font-bold font-mono">
            {isRTL ? 'التحصيلات:' : 'Receipts:'} <span className="text-white font-black">{stats.sessionsRevenue.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase text-blue-100 tracking-wider">
                {isRTL ? 'باقات المرضى المفعلة 📦' : 'Active Packages 📦'}
              </div>
              <div className="text-2xl font-extrabold mt-1 font-mono">
                {patientPackages.length} <span className="text-xs font-sans font-normal">{isRTL ? 'باقة' : 'pkgs'}</span>
              </div>
            </div>
            <div className="p-2 bg-white/20 rounded-xl shrink-0">
              <Layers size={20} />
            </div>
          </div>
          <div className="text-[11px] text-blue-100 mt-2 font-bold font-mono">
            {isRTL ? 'أقيام الباقات:' : 'Total:'} <span className="text-white font-black">{stats.packagesRevenue.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-fuchsia-700 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase text-purple-100 tracking-wider">
                {isRTL ? 'إجمالي الفواتير 💰' : 'General Ledger 💰'}
              </div>
              <div className="text-2xl font-extrabold mt-1 font-mono">
                {stats.invoicesRevenue.toLocaleString()} <span className="text-xs font-sans font-normal">{isRTL ? 'ج.م' : 'EGP'}</span>
              </div>
            </div>
            <div className="p-2 bg-white/20 rounded-xl shrink-0">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="text-[11px] text-purple-100 mt-2 font-medium truncate">
            {isRTL ? `قيد الانتظار: ${stats.pendingInvoicesAmount} ج.م` : `Pending: ${stats.pendingInvoicesAmount} EGP`}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-100 dark:bg-gray-800/90 p-1.5 rounded-xl border border-slate-200/80 dark:border-gray-700 flex flex-wrap gap-1.5 text-xs md:text-sm font-bold shadow-xs">
        <button
          onClick={() => setActiveTab('SESSIONS')}
          className={`flex-1 min-w-[180px] py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'SESSIONS'
              ? 'bg-emerald-600 text-white shadow-xs font-black'
              : 'text-slate-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/60'
          }`}
        >
          <ShieldCheck size={17} />
          <span>{isRTL ? 'تأكيد دفع الجلسات والكشوفات' : 'Session Payments & Assignments'}</span>
          {stats.pendingSessionsCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === 'SESSIONS' ? 'bg-white text-emerald-800' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {stats.pendingSessionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('PACKAGES')}
          className={`flex-1 min-w-[180px] py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'PACKAGES'
              ? 'bg-blue-600 text-white shadow-xs font-black'
              : 'text-slate-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/60'
          }`}
        >
          <Layers size={17} />
          <span>{isRTL ? 'باقات الجلسات للمرضى' : 'Patient Packages'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
            activeTab === 'PACKAGES' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300'
          }`}>
            {patientPackages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('INVOICES')}
          className={`flex-1 min-w-[180px] py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'INVOICES'
              ? 'bg-purple-600 text-white shadow-xs font-black'
              : 'text-slate-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/60'
          }`}
        >
          <FileText size={17} />
          <span>{isRTL ? 'سجل الفواتير والمعاملات' : 'Invoices & Ledger'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
            activeTab === 'INVOICES' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300'
          }`}>
            {transactions.length}
          </span>
        </button>
      </div>

      {/* =====================================================================================
          TAB 1: SESSIONS & DOCTOR ASSIGNMENTS PAYMENT VERIFICATION ⭐ (OPTIMIZED DIMENSIONS)
         ===================================================================================== */}
      {activeTab === 'SESSIONS' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Compact Toolbar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input 
                type="text" 
                placeholder={isRTL ? 'ابحث باسم المريض، الطبيب، أو الخدمة...' : 'Search patient, doctor, or service...'}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm text-slate-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition"
                value={sessionSearchTerm}
                onChange={(e) => setSessionSearchTerm(e.target.value)}
              />
              {sessionSearchTerm && (
                <button onClick={() => setSessionSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-gray-700 p-1 rounded-lg text-xs font-extrabold shrink-0">
              <button 
                onClick={() => setSessionStatusFilter('ALL')}
                className={`px-3 py-1 rounded-md transition ${sessionStatusFilter === 'ALL' ? 'bg-white dark:bg-gray-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-gray-300'}`}
              >
                {isRTL ? 'الكل' : 'All'} ({sessions.length})
              </button>
              <button 
                onClick={() => setSessionStatusFilter('PENDING')}
                className={`px-3 py-1 rounded-md transition flex items-center gap-1 ${sessionStatusFilter === 'PENDING' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700 dark:text-amber-400'}`}
              >
                <span>{isRTL ? 'بانتظار التأكيد' : 'Pending'} ({stats.pendingSessionsCount})</span>
              </button>
              <button 
                onClick={() => setSessionStatusFilter('VERIFIED')}
                className={`px-3 py-1 rounded-md transition flex items-center gap-1 ${sessionStatusFilter === 'VERIFIED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 dark:text-emerald-400'}`}
              >
                <span>{isRTL ? 'مؤكد الدفع' : 'Verified'} ({stats.verifiedSessionsCount})</span>
              </button>
            </div>
          </div>

          {/* Table with ZERO Clipping and Perfect Proportions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-gray-800/80 border-b border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 font-extrabold text-[11px] uppercase tracking-wider">
                    <th className="px-4 py-3">{isRTL ? 'المريض والتعريف' : 'Patient Info'}</th>
                    <th className="px-4 py-3">{isRTL ? 'التسكين والخدمة الطبية' : 'Service & Doctor Assignment'}</th>
                    <th className="px-4 py-3">{isRTL ? 'التاريخ والمكان' : 'Date & Room'}</th>
                    <th className="px-4 py-3">{isRTL ? 'الرسوم ومصدر الدفع' : 'Billing & Fee'}</th>
                    <th className="px-4 py-3 text-center">{isRTL ? 'تأكيد الحسابات والإذن' : 'Finance Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800/80 text-xs md:text-sm">
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-gray-400 font-bold">
                        {isRTL ? 'لا توجد جلسات مطابقة' : 'No matching sessions found'}
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((session) => {
                      const isPending = !session.payment_verified
                      const isAssessment = session.session_type === 'ASSESSMENT' || session.session_type === 'تقييم'
                      
                      return (
                        <tr key={session.id} className="hover:bg-slate-50/70 dark:hover:bg-gray-700/30 transition-colors">
                          {/* Patient */}
                          <td className="px-4 py-3 w-[25%] max-w-[220px]">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                                isPending ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              }`}>
                                {session.patient_name ? session.patient_name.charAt(0) : 'P'}
                              </div>
                              <div className="truncate">
                                <div className="font-bold text-slate-900 dark:text-white truncate text-sm">
                                  {session.patient_name}
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-700 px-1.5 py-0.2 rounded">
                                    {session.patient_code || formatShortId(session.id)}
                                  </span>
                                  {isAssessment && (
                                    <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-200 dark:border-indigo-800">
                                      {isRTL ? 'تقييم أولي' : 'Assessment'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Assignment & Service */}
                          <td className="px-4 py-3 w-[25%] max-w-[220px]">
                            <div className="font-bold text-slate-800 dark:text-slate-200 text-xs md:text-sm flex items-center gap-1.5 truncate">
                              <Activity size={14} className="text-blue-500 shrink-0" />
                              <span className="truncate">{session.service_title}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-gray-400 font-semibold mt-0.5 flex items-center gap-1 truncate">
                              <Stethoscope size={12} className="text-purple-500 shrink-0" />
                              <span className="truncate">{session.doctor_name}</span>
                            </div>
                          </td>

                          {/* Room & Time (CLEAN FORMATTED DATES) */}
                          <td className="px-4 py-3 whitespace-nowrap w-[20%]">
                            <div className="font-mono font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1">
                              <Calendar size={13} className="text-slate-400 shrink-0" />
                              <span>{formatDateTime(session.session_date)}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-gray-400 font-medium mt-0.5 truncate">
                              {session.room_title || (isRTL ? 'غرفة العلاج' : 'Room 1')}
                            </div>
                          </td>

                          {/* Billing & Fee */}
                          <td className="px-4 py-3 whitespace-nowrap w-[15%]">
                            {session.package_info ? (
                              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 px-2.5 py-1 rounded-lg w-fit">
                                <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                                  <Layers size={12} />
                                  <span>{isRTL ? 'خصم باكدج' : 'Package'}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="font-mono font-black text-slate-900 dark:text-white text-sm flex items-center gap-1">
                                <span>{session.price ?? 450}</span>
                                <span className="text-[11px] font-sans font-bold text-slate-500 dark:text-gray-400">{isRTL ? 'ج.م' : 'EGP'}</span>
                              </div>
                            )}
                            <div className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">
                              {session.package_info ? (isRTL ? 'رصيد باقة' : 'Covered by Pkg') : (isRTL ? 'دفعة فورية' : 'Direct Fee')}
                            </div>
                          </td>

                          {/* Finance Verification & Action (HIGH VISIBILITY, COMPACT) */}
                          <td className="px-4 py-3 text-center whitespace-nowrap w-[15%]">
                            {isPending ? (
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={() => handleVerifySessionPayment(session)}
                                  disabled={verifyingSessionId === session.id}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3.5 rounded-xl shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 text-xs w-fit mx-auto disabled:opacity-50"
                                  title={isRTL ? 'تأكيد السداد ومنح الإذن للطبيب' : 'Confirm payment & clear doctor'}
                                >
                                  <ShieldCheck size={15} />
                                  <span>{verifyingSessionId === session.id ? (isRTL ? 'جاري...' : '...') : (isRTL ? 'تأكيد السداد' : 'Confirm Pay')}</span>
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold">
                                <CheckCircle size={14} className="text-emerald-600" />
                                <span>{isRTL ? 'مؤكد الدفع' : 'Verified'}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================================
          TAB 2: PATIENT PACKAGES & BILLING (باقات الجلسات للمرضى)
         ===================================================================================== */}
      {activeTab === 'PACKAGES' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex items-center justify-between gap-3 shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input 
                type="text" 
                placeholder={isRTL ? 'ابحث عن اسم مريض أو باكدج...' : 'Search patient or package...'}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm text-slate-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={packageSearchTerm}
                onChange={(e) => setPackageSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-gray-400">
              {isRTL ? `عدد الباقات: ${filteredPatientPackages.length}` : `Count: ${filteredPatientPackages.length}`}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatientPackages.map((pkg) => {
              const isPaid = pkg.payment_status === 'PAID'
              const progress = pkg.total_sessions > 0 ? Math.round(((pkg.total_sessions - (pkg.remaining_sessions || 0)) / pkg.total_sessions) * 100) : 0

              return (
                <div key={pkg.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-slate-200/90 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div className="truncate">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm md:text-base truncate">
                          {pkg.patient_name}
                        </h3>
                        <span className="text-[11px] font-mono text-slate-400 dark:text-gray-500 font-bold">
                          {formatShortId(pkg.id)}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                        isPaid ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}>
                        {isPaid ? (isRTL ? '✅ مدفوع' : 'PAID') : (isRTL ? '⏳ مستحق السداد' : 'PENDING')}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-gray-700/60 rounded-xl border border-slate-200/60 dark:border-gray-600 mb-3">
                      <div className="font-bold text-blue-700 dark:text-blue-300 text-xs md:text-sm mb-1.5 truncate">
                        {pkg.package_title}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-gray-300 font-bold mb-1">
                        <span>{isRTL ? 'المتبقي:' : 'Remaining:'}</span>
                        <span className="font-mono text-xs text-slate-900 dark:text-white font-black">{pkg.remaining_sessions} / {pkg.total_sessions} {isRTL ? 'جلسة' : 'sessions'}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-gray-300">
                      <span>{isRTL ? 'إجمالي سعر الباكدج:' : 'Total Price:'}</span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {pkg.final_price?.toLocaleString()} <span className="text-xs font-sans font-bold">{isRTL ? 'ج.م' : 'EGP'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-2">
                    {!isPaid ? (
                      <button
                        onClick={() => handleVerifyPackagePayment(pkg)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95 text-xs flex items-center justify-center gap-1.5"
                      >
                        <DollarSign size={15} />
                        <span>{isRTL ? 'تأكيد سداد الباكدج' : 'Verify Package Payment'}</span>
                      </button>
                    ) : (
                      <div className="w-full py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-700 dark:text-emerald-300 font-bold text-center text-xs">
                        ✅ {isRTL ? 'مسجل ومؤكد بالخزينة' : 'Verified in Ledger'}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* =====================================================================================
          TAB 3: INVOICES & GENERAL LEDGER (سجل الفواتير والمعاملات العامة)
         ===================================================================================== */}
      {activeTab === 'INVOICES' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-xs overflow-hidden animate-in fade-in duration-200">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-gray-700 flex justify-between items-center bg-slate-50 dark:bg-gray-800/80">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('finance.recent_transactions')}</h2>
              <p className="text-xs text-slate-500 dark:text-gray-400">{isRTL ? 'سجل الفواتير والإيصالات النقدية' : 'General Ledger of all receipts'}</p>
            </div>
            {transactions.filter(t => t._syncPending).length > 0 && (
              <span className="text-amber-600 font-bold px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 rounded-full text-xs border border-amber-200">
                ⏳ {transactions.filter(t => t._syncPending).length} {isRTL ? 'بانتظار المزامنة' : 'pending sync'}
              </span>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 text-xs font-extrabold text-slate-500 dark:text-gray-400 uppercase">
                <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                  <th className="px-5 py-3">{t('reception.patient_details')}</th>
                  <th className="px-5 py-3">{t('packages.title')}</th>
                  <th className="px-5 py-3">{t('finance.amount')}</th>
                  <th className="px-5 py-3">{t('reception.date')}</th>
                  <th className="px-5 py-3">{t('status.active')}</th>
                  <th className="px-5 py-3 text-center">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800 text-xs md:text-sm">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                      {isRTL ? 'لا توجد فواتير' : 'No transactions recorded'}
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-700/40 transition">
                      <td className="px-5 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {getPatientName(transaction)}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 dark:text-gray-500">ID: {formatShortId(transaction.id)}</div>
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-700 dark:text-gray-300">{getPackageName(transaction)}</td>
                      <td className="px-5 py-3 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {transaction.amount} <span className="text-xs font-sans font-bold text-slate-500">{isRTL ? 'ج.م' : 'EGP'}</span>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs font-bold text-slate-600 dark:text-gray-400">{transaction.date}</td>
                      <td className="px-5 py-3">
                        {transaction.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
                            <CheckCircle size={12} /> {t('finance.paid')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
                            <Clock size={12} /> {t('finance.pending_payments')}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleViewInvoice(transaction)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                            title={isRTL ? 'عرض الفاتورة' : 'View Invoice'}
                          >
                            <FileText size={16} />
                          </button>
                          {transaction.status === 'pending' && (
                            <button
                              onClick={() => handleMarkAsPaid(transaction.id)}
                              className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition"
                              title={isRTL ? 'تحديد كمدفوع' : 'Mark as Paid'}
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                            title={isRTL ? 'حذف' : 'Delete'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* ========== Invoice Modal ========== */}
      {showInvoiceModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="text-center flex-1">
                <FileText size={32} className="text-blue-600 dark:text-blue-400 mx-auto mb-1.5" />
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('finance.invoice')}</h2>
                <p className="text-xs text-slate-500 dark:text-gray-400">{isRTL ? 'إيصال استلام دفعة مالية' : 'Receipt'}</p>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-2.5 border-t border-b border-slate-100 dark:border-gray-700 py-4 my-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-gray-400 font-bold">{t('reception.patient_details')}:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{getPatientName(selectedTransaction)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-gray-400 font-bold">{t('packages.title')}:</span>
                <span className="font-bold text-slate-700 dark:text-gray-300">{getPackageName(selectedTransaction)}</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200">
                <span className="text-emerald-800 dark:text-emerald-300 font-black">{t('finance.amount')}:</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{selectedTransaction.amount} {isRTL ? 'ج.م' : 'EGP'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-gray-400 font-bold">{t('reception.date')}:</span>
                <span className="font-bold font-mono text-slate-700 dark:text-gray-300">{selectedTransaction.date}</span>
              </div>
            </div>
            
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={handlePrintInvoice}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 text-xs"
              >
                <Printer size={16} />
                {t('finance.print')}
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="flex-1 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition text-xs"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Add Transaction Modal ========== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Plus size={20} className="text-emerald-600" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{isRTL ? 'إضافة إيصال / معاملة مالية' : 'Add Receipt'}</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-3 text-xs md:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-1">{isRTL ? 'اسم المريض *' : 'Patient Name *'}</label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  placeholder={isRTL ? 'أدخل اسم المريض' : 'Enter patient name'}
                  value={newTransaction.patientName}
                  onChange={(e) => setNewTransaction({...newTransaction, patientName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase mb-1">{isRTL ? 'المبلغ (ج.م) *' : 'Amount (EGP) *'}</label>
                <input
                  type="number"
                  className="w-full p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 rounded-lg font-mono font-bold text-base outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  placeholder="0"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-1">{isRTL ? 'البيان / الخدمة أو الباكدج' : 'Package / Service Title'}</label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  placeholder={isRTL ? 'مثال: باكدج علاج مائي' : 'e.g., Hydrotherapy Package'}
                  value={newTransaction.packageName}
                  onChange={(e) => setNewTransaction({...newTransaction, packageName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-1">{isRTL ? 'التاريخ' : 'Date'}</label>
                <input
                  type="date"
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg font-mono outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-1">{isRTL ? 'حالة التحصيل' : 'Status'}</label>
                <select
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  value={newTransaction.status}
                  onChange={(e) => setNewTransaction({...newTransaction, status: e.target.value})}
                >
                  <option value="pending">{isRTL ? '⏳ قيد الانتظار' : 'Pending'}</option>
                  <option value="paid">{isRTL ? '✅ مدفوع ومؤكد' : 'Paid'}</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2.5 mt-5 pt-3 border-t border-slate-100 dark:border-gray-700">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 font-bold rounded-xl hover:bg-slate-200 transition text-xs"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleAddTransaction}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition text-xs disabled:opacity-50"
              >
                {isSubmitting ? (isRTL ? 'جاري...' : 'Saving...') : (isRTL ? 'حفظ المعاملة' : 'Save Receipt')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}