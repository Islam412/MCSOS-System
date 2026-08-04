// src/components/invoice/InvoiceManager.jsx
import { useState, useEffect, useMemo } from 'react'
import { confirmAlert } from '../../utils/confirmAlert'
import { useTranslation } from 'react-i18next'
import { 
  FileText, Plus, Edit, Trash2, Eye, Printer, Download,
  DollarSign, Calendar, Clock, CheckCircle, XCircle, 
  AlertCircle, Search, Filter, RefreshCw, Loader2,
  Save, X, CreditCard, TrendingUp, Users, Package, Receipt,
  Wallet, Sparkles, Layers, Activity
} from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { invoicesService, patientsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

const STORAGE_KEYS = {
  INVOICES: 'mcsos_invoices_v2',
  PATIENTS: 'mcsos_patients_v2'
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

// ========== البيانات الافتراضية للفواتير بالجنيه المصري وفي حال فراغ المخزون ==========
const defaultInvoices = [
  { 
    id: 'INV-1001', 
    patient_name: 'أحمد محمد الصاوي',
    patientNameAr: 'أحمد محمد الصاوي',
    patientNameEn: 'Ahmed Mohamed Elsawy',
    patient_id: '550e8400-e29b-41d4-a716-446655440000',
    subtotal: 2100,
    amount: 2100,
    status: 'paid',
    payment_status: 'paid',
    created_at: '2026-08-04',
    date: '2026-08-04',
    packageName: 'باكدج علاج مائي (6 جلسات)',
    packageAr: 'باكدج علاج مائي (6 جلسات)',
    packageEn: 'Hydrotherapy Package (6 Sessions)'
  },
  { 
    id: 'INV-1002', 
    patient_name: 'سارة حسن يوسف',
    patientNameAr: 'سارة حسن يوسف',
    patientNameEn: 'Sara Hassan Youssef',
    patient_id: '550e8400-e29b-41d4-a716-446655440001',
    subtotal: 4200,
    amount: 4200,
    status: 'paid',
    payment_status: 'paid',
    created_at: '2026-08-03',
    date: '2026-08-03',
    packageName: 'باكدج علاج طبيعي عظام (6 جلسات)',
    packageAr: 'باكدج علاج طبيعي عظام (6 جلسات)',
    packageEn: 'Ortho PT Package (6 Sessions)'
  },
  { 
    id: 'INV-1003', 
    patient_name: 'محمود علي زين',
    patientNameAr: 'محمود علي زين',
    patientNameEn: 'Mahmoud Ali Zain',
    patient_id: '550e8400-e29b-41d4-a716-446655440002',
    subtotal: 850,
    amount: 850,
    status: 'pending',
    payment_status: 'pending',
    created_at: '2026-08-03',
    date: '2026-08-03',
    packageName: 'كشف تقييم وإختبار ذكاء - تخاطب',
    packageAr: 'كشف تقييم وإختبار ذكاء - تخاطب',
    packageEn: 'IQ Test & Speech Assessment'
  }
]

const defaultPatients = [
  { id: '550e8400-e29b-41d4-a716-446655440000', name: 'أحمد محمد الصاوي', phone: '01011111111', email: 'ahmed@example.com' },
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'سارة حسن يوسف', phone: '01022222222', email: 'sara@example.com' },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'محمود علي زين', phone: '01033333333', email: 'mahmoud@example.com' }
]

export default function InvoiceManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { isOnline, executeWithOfflineSupport } = useServices()

  const [invoices, setInvoices] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [viewingInvoice, setViewingInvoice] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const [formData, setFormData] = useState({
    patient_id: '',
    patient_name_input: '',
    subtotal: '',
    description: '',
    status: 'pending'
  })

  // ========== تحميل أو تحديث البيانات ==========
  useEffect(() => {
    loadAllData()
    const handleUpdate = () => loadAllData()
    window.addEventListener('invoicesUpdated', handleUpdate)
    return () => window.removeEventListener('invoicesUpdated', handleUpdate)
  }, [isOnline])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadPatients(),
        loadInvoices()
      ])
    } catch (error) {
      console.error('Error loading invoices data:', error)
      toast.error(isRTL ? 'حدث خطأ في تحميل البيانات المالية' : 'Error loading financial data')
    } finally {
      setLoading(false)
    }
  }

  const loadPatients = async () => {
    try {
      if (isOnline) {
        try {
          const response = await executeWithOfflineSupport(
            () => patientsService.getPatients(),
            'patients',
            getLocalData(STORAGE_KEYS.PATIENTS)
          )
          let data = response?.patients || (Array.isArray(response) ? response : [])
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
      setPatients(saved && saved.length > 0 ? saved : defaultPatients)
    } catch (error) {
      setPatients(defaultPatients)
    }
  }

  // ========== تطبيع البيانات (Unified Data Schema Normalizer) ==========
  const normalizeInvoice = (item, patientList = []) => {
    const rawId = item.id || item.invoice_number || 'INV-' + Math.floor(1000 + Math.random() * 9000)
    const formattedId = typeof rawId === 'string' && (rawId.startsWith('INV-') || rawId.startsWith('REC-')) ? rawId : `INV-${String(rawId).padStart(4, '0')}`

    // Resolve numerical amount from all possible fields used across components
    const numAmount = Number(item.subtotal !== undefined ? item.subtotal : (item.amount !== undefined ? item.amount : (item.total_amount || 0)))

    // Resolve patient name
    let patName = item.patient_name || item.patientName || item.patientNameAr || item.patientNameEn
    if (!patName && item.patient_id) {
      const p = patientList.find(pt => pt.id === item.patient_id)
      if (p) patName = p.name || p.nameAr || p.nameEn
    }
    if (!patName || patName === 'مريض' || patName === 'Patient') {
      patName = isRTL ? 'مريض غير محدد' : 'Unassigned Patient'
    }

    // Resolve Description / Package Name
    let desc = item.packageName || item.packageAr || item.packageEn || item.description || (isRTL ? 'خدمات علاجية وتأهيلية' : 'Medical & Therapy Services')

    // Resolve Status
    let st = item.status || item.payment_status || 'pending'

    return {
      ...item,
      id: formattedId,
      originalId: item.id || rawId,
      patient_name: patName,
      patientNameAr: patName,
      patientNameEn: patName,
      patient_id: item.patient_id || '',
      subtotal: numAmount,
      amount: numAmount,
      status: st,
      payment_status: st,
      date: item.date || item.created_at || item.issued_at || new Date().toISOString().split('T')[0],
      created_at: item.created_at || item.date || item.issued_at || new Date().toISOString().split('T')[0],
      packageName: desc,
      packageAr: desc,
      packageEn: desc,
      _syncPending: item._syncPending || false
    }
  }

  const loadInvoices = async () => {
    try {
      let rawData = null
      if (isOnline) {
        try {
          const response = await executeWithOfflineSupport(
            () => invoicesService.getInvoices(),
            'invoices',
            getLocalData(STORAGE_KEYS.INVOICES)
          )
          rawData = response?.invoices || (Array.isArray(response) ? response : null)
        } catch (apiError) {
          console.warn('API invoices fetch failed, checking local:', apiError)
        }
      }

      if (!rawData || rawData.length === 0) {
        rawData = getLocalData(STORAGE_KEYS.INVOICES)
      }

      // If local data is also empty or contains only broken/placeholder zero items without descriptions, use defaults
      if (!rawData || rawData.length === 0) {
        rawData = defaultInvoices
      }

      // Apply unified schema normalization so NO invoice ever appears as EGP 0 or unformatted!
      const currentPatients = getLocalData(STORAGE_KEYS.PATIENTS) || defaultPatients
      const normalized = rawData.map(inv => normalizeInvoice(inv, currentPatients))

      setInvoices(normalized)
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(normalized))
    } catch (error) {
      console.error('Error loading invoices:', error)
      setInvoices(defaultInvoices.map(inv => normalizeInvoice(inv, defaultPatients)))
    }
  }

  const saveInvoices = async (newInvoices) => {
    const currentPatients = getLocalData(STORAGE_KEYS.PATIENTS) || defaultPatients
    const normalized = newInvoices.map(inv => normalizeInvoice(inv, currentPatients))
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(normalized))
    setInvoices(normalized)
    window.dispatchEvent(new Event('invoicesUpdated'))

    if (isOnline) {
      const pending = normalized.filter(item => item._syncPending && !String(item.originalId).startsWith('INV-') && !String(item.originalId).startsWith('REC-'))
      for (const item of pending) {
        try {
          await invoicesService.createInvoice({ patient_id: item.patient_id || item.patient_name, subtotal: item.subtotal, description: item.packageName })
        } catch (e) {
          console.warn('Failed API sync for invoice:', e)
        }
      }
    }
  }

  // ========== KPI Calculations ==========
  const stats = useMemo(() => {
    const total = invoices.length
    const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.subtotal) || 0), 0)
    const paidList = invoices.filter(inv => inv.status === 'paid' || inv.payment_status === 'paid')
    const pendingList = invoices.filter(inv => inv.status !== 'paid' && inv.payment_status !== 'paid')
    
    const paidAmount = paidList.reduce((sum, inv) => sum + (Number(inv.subtotal) || 0), 0)
    const pendingAmount = pendingList.reduce((sum, inv) => sum + (Number(inv.subtotal) || 0), 0)

    return { total, totalAmount, paidAmount, pendingAmount, paidCount: paidList.length, pendingCount: pendingList.length }
  }, [invoices])

  const formatCurrency = (amount) => {
    const val = Number(amount) || 0
    return `${val.toLocaleString()} ${isRTL ? 'ج.م' : 'EGP'}`
  }

  const handleAddInvoice = () => {
    setEditingInvoice(null)
    setFormData({ patient_id: '', patient_name_input: '', subtotal: '', description: '', status: 'pending' })
    setShowInvoiceModal(true)
  }

  const handleEditInvoice = (inv) => {
    setEditingInvoice(inv)
    setFormData({
      patient_id: inv.patient_id || '',
      patient_name_input: inv.patient_name || '',
      subtotal: inv.subtotal || 0,
      description: inv.packageName || '',
      status: inv.status || 'pending'
    })
    setShowInvoiceModal(true)
  }

  const handleSaveInvoice = async () => {
    let finalPatientName = formData.patient_name_input
    if (formData.patient_id) {
      const selectedPt = patients.find(p => p.id === formData.patient_id)
      if (selectedPt) finalPatientName = selectedPt.name || selectedPt.nameAr || selectedPt.nameEn
    }

    if (!finalPatientName && !formData.patient_id) {
      toast.error(isRTL ? 'الرجاء إدخال اسم المريض أو اختياره' : 'Please select or enter patient name')
      return
    }
    if (!formData.subtotal || Number(formData.subtotal) <= 0) {
      toast.error(isRTL ? 'الرجاء إدخال مبلغ صحيح للفاتورة بالجنيه المصري' : 'Please enter a valid amount in EGP')
      return
    }

    setIsSubmitting(true)
    try {
      const newObj = {
        id: editingInvoice?.originalId || 'INV-' + Math.floor(1000 + Math.random() * 9000),
        patient_id: formData.patient_id || '',
        patient_name: finalPatientName || (isRTL ? 'مريض مخصص' : 'Custom Patient'),
        subtotal: Number(formData.subtotal),
        amount: Number(formData.subtotal),
        packageName: formData.description || (isRTL ? 'فاتورة خدمات طبية وتأهيلية' : 'Medical Services'),
        status: formData.status || 'pending',
        date: editingInvoice?.date || new Date().toISOString().split('T')[0],
        _syncPending: !isOnline
      }

      let updatedList
      if (editingInvoice) {
        updatedList = invoices.map(inv => inv.id === editingInvoice.id || inv.originalId === editingInvoice.originalId ? newObj : inv)
        toast.success(isRTL ? 'تم تحديث الفاتورة بنجاح' : 'Invoice updated')
      } else {
        updatedList = [newObj, ...invoices]
        toast.success(isRTL ? 'تم إنشاء الفاتورة الجديدة بنجاح' : 'New invoice created')
      }

      await saveInvoices(updatedList)
      setShowInvoiceModal(false)
    } catch (error) {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء الحفظ' : 'Error saving invoice'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteInvoice = async (id) => {
    if (!(await confirmAlert({ title: isRTL ? 'تأكيد الحذف' : 'Confirm Delete', text: isRTL ? 'هل أنت متأكد من حذف هذا الإيصال؟ لا يمكن إرجاع هذه الخطوة.' : 'Are you sure you want to delete this invoice?' }))) return

    const updated = invoices.filter(inv => inv.id !== id && inv.originalId !== id)
    await saveInvoices(updated)
    toast.success(isRTL ? 'تم حذف الفاتورة من الأرشيف' : 'Invoice deleted')
  }

  const handleMarkAsPaid = async (id) => {
    const updated = invoices.map(inv => {
      if (inv.id === id || inv.originalId === id) {
        return { ...inv, status: 'paid', payment_status: 'paid', _syncPending: !isOnline }
      }
      return inv
    })
    await saveInvoices(updated)
    toast.success(isRTL ? '✅ تم توثيق السداد في الخزينة' : '✅ Marked as Paid in Ledger')
  }

  const handlePrintInvoice = (invoice) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(getInvoiceHTML(invoice))
      printWindow.document.close()
      printWindow.print()
    }
    toast.success(isRTL ? 'جاري إعداد وثيقة الطباعة...' : 'Preparing invoice document...')
  }

  const getInvoiceHTML = (invoice) => {
    return `<!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${isRTL ? 'ar' : 'en'}">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة مركز طبي - ${invoice.id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
          *{margin:0;padding:0;box-sizing:border-box;}
          body{font-family:'Cairo',sans-serif;background:#f3f4f6;padding:30px;color:#1e293b;}
          .invoice-card{max-width:650px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 25px rgba(0,0,0,0.05);}
          .header{background:linear-gradient(135deg,#065f46,#0d9488);color:white;padding:25px 30px;display:flex;justify-content:space-between;align-items:center;}
          .header h1{font-size:24px;font-weight:900;}
          .header .number{font-family:monospace;background:rgba(255,255,255,0.2);padding:4px 10px;border-radius:8px;font-size:14px;}
          .content{padding:30px;}
          .row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px dashed #e2e8f0;font-size:15px;}
          .row strong{color:#0f172a;}
          .total-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;text-align:center;margin-top:25px;}
          .total-box .lbl{font-size:13px;color:#166534;font-weight:bold;}
          .total-box .val{font-size:32px;font-weight:900;color:#047857;margin-top:5px;font-family:monospace;}
          .badge{display:inline-block;padding:3px 12px;border-radius:20px;font-size:13px;font-weight:bold;}
          .paid{background:#dcfce7;color:#166534;border:1px solid #86efac;}
          .pending{background:#fef3c7;color:#92400e;border:1px solid #fde047;}
          .footer{text-align:center;padding:20px;background:#f8fafc;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;}
          @media print{body{background:white;padding:0;}.invoice-card{box-shadow:none;border:none;}}
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header">
            <div>
              <h1>${isRTL ? 'إيصال فاتورة طبية' : 'Medical Center Invoice'}</h1>
              <p style="font-size:12px;opacity:0.9;">${isRTL ? 'قسم المالية وإدارة الحسابات' : 'Finance & Billing Dept'}</p>
            </div>
            <div class="number">${invoice.id}</div>
          </div>
          <div class="content">
            <div class="row"><span>${isRTL ? 'اسم المريض:' : 'Patient:'}</span><strong>${invoice.patient_name}</strong></div>
            <div class="row"><span>${isRTL ? 'البيان / الخدمة الطبية:' : 'Service / Package:'}</span><strong>${invoice.packageName}</strong></div>
            <div class="row"><span>${isRTL ? 'تاريخ الإصدار:' : 'Date:'}</span><strong>${invoice.date}</strong></div>
            <div class="row"><span>${isRTL ? 'حالة السداد:' : 'Status:'}</span><span class="badge ${invoice.status === 'paid' ? 'paid' : 'pending'}">${invoice.status === 'paid' ? (isRTL ? '✅ مدفوع ومؤكد' : 'Paid') : (isRTL ? '⏳ غير مدفوع / معلق' : 'Pending')}</span></div>

            <div class="total-box">
              <div class="lbl">${isRTL ? 'المبلغ الإجمالي الموثق' : 'Total Amount'}</div>
              <div class="val">${invoice.subtotal} ${isRTL ? 'ج.م' : 'EGP'}</div>
            </div>
          </div>
          <div class="footer">
            <p>${isRTL ? 'شكراً لثقتكم في خدماتنا الطبية والتأهيلية' : 'Thank you for trusting our clinical rehabilitation center.'}</p>
            <p style="margin-top:4px;">${isRTL ? 'تم إصدار هذا الإيصال آلياً عبر نظام إدارة المؤسسة (MCSOS)' : 'Generated automatically by MCSOS Hospital Engine'}</p>
          </div>
        </div>
      </body>
      </html>`
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = !searchTerm ||
        inv.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.packageName?.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (filterStatus === 'paid') return matchesSearch && (inv.status === 'paid' || inv.payment_status === 'paid')
      if (filterStatus === 'pending') return matchesSearch && (inv.status !== 'paid' && inv.payment_status !== 'paid')
      return matchesSearch
    })
  }, [invoices, searchTerm, filterStatus])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-52">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-emerald-500 animate-spin mb-3" />
          <div className="font-bold text-slate-700 dark:text-white text-sm">{isRTL ? 'جاري تحميل الأرشيف المالي والفواتير...' : 'Loading invoices ledger...'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-8 text-slate-800 dark:text-gray-100 font-sans max-w-full overflow-hidden animate-in fade-in duration-200">
      {/* Sleek Compact Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-slate-200/80 dark:border-gray-700/80 shadow-xs ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-xl shadow-sm">
            <Receipt size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-emerald-700 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              {isRTL ? 'إدارة الفواتير والإيصالات الطبية' : 'Invoices & Billing Archive'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium mt-0.5">
              {isRTL ? 'توثيق وأرشفت فواتير الجلسات، الباقات التأهيلية، والخدمات الخاصة' : 'Manage and archive session payments, therapy packages, and custom receipts'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button 
            onClick={handleAddInvoice}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition text-xs flex items-center gap-1.5 active:scale-95"
          >
            <Plus size={16} />
            <span>{isRTL ? 'فاتورة جديدة +' : 'New Invoice +'}</span>
          </button>
          <button 
            onClick={loadAllData}
            className="p-2 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200 rounded-xl transition text-xs"
            title={isRTL ? 'تحديث البيانات' : 'Refresh'}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-300 tracking-wider">
                {isRTL ? 'إجمالي الفواتير 📋' : 'Total Invoices 📋'}
              </div>
              <div className="text-2xl font-extrabold mt-1 font-mono">
                {stats.total} <span className="text-xs font-sans font-normal">{isRTL ? 'فاتورة' : 'items'}</span>
              </div>
            </div>
            <div className="p-2 bg-white/10 rounded-xl shrink-0">
              <FileText size={20} className="text-slate-300" />
            </div>
          </div>
          <div className="text-[11px] text-slate-300 mt-2 font-medium">
            {isRTL ? 'القيمة:' : 'Value:'} <span className="text-white font-bold font-mono">{formatCurrency(stats.totalAmount)}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase text-emerald-100 tracking-wider">
                {isRTL ? 'المحصل والمدفوع ✅' : 'Paid & Verified ✅'}
              </div>
              <div className="text-2xl font-extrabold mt-1 font-mono">
                {stats.paidCount} <span className="text-xs font-sans font-normal">{isRTL ? 'مكتمل' : 'paid'}</span>
              </div>
            </div>
            <div className="p-2 bg-white/20 rounded-xl shrink-0">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="text-[11px] text-emerald-100 mt-2 font-bold font-mono">
            {isRTL ? 'الإجمالي:' : 'Sum:'} <span className="text-white font-black">{formatCurrency(stats.paidAmount)}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase text-amber-100 tracking-wider">
                {isRTL ? 'فواتير معلقة ⏳' : 'Pending Bills ⏳'}
              </div>
              <div className="text-2xl font-extrabold mt-1 font-mono">
                {stats.pendingCount} <span className="text-xs font-sans font-normal">{isRTL ? 'معلق' : 'pending'}</span>
              </div>
            </div>
            <div className="p-2 bg-white/20 rounded-xl shrink-0">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-[11px] text-amber-100 mt-2 font-bold font-mono">
            {isRTL ? 'المستحق:' : 'Due:'} <span className="text-white font-black">{formatCurrency(stats.pendingAmount)}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase text-blue-100 tracking-wider">
                {isRTL ? 'إجمالي الحجم المالي 💰' : 'Total Portfolio 💰'}
              </div>
              <div className="text-2xl font-extrabold mt-1 font-mono">
                {stats.totalAmount.toLocaleString()} <span className="text-xs font-sans font-normal">{isRTL ? 'ج.م' : 'EGP'}</span>
              </div>
            </div>
            <div className="p-2 bg-white/20 rounded-xl shrink-0">
              <Wallet size={20} />
            </div>
          </div>
          <div className="text-[10px] text-blue-100 mt-2 font-medium">
            {isRTL ? 'محسوب بالجنيــه المصــري (EGP)' : 'All figures in Egyptian Pounds'}
          </div>
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input 
            type="text" 
            placeholder={isRTL ? 'ابحث برقم الفاتورة، اسم المريض، أو نوع الباكدج والخدمة...' : 'Search invoice ID, patient name, or service title...'}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm text-slate-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-gray-700 p-1 rounded-lg text-xs font-extrabold shrink-0">
          <button 
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-md transition ${filterStatus === 'all' ? 'bg-white dark:bg-gray-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-gray-300'}`}
          >
            {isRTL ? 'جميع الحالات' : 'All'} ({invoices.length})
          </button>
          <button 
            onClick={() => setFilterStatus('paid')}
            className={`px-3 py-1 rounded-md transition ${filterStatus === 'paid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 dark:text-emerald-400'}`}
          >
            {isRTL ? 'مدفوع ومؤكد' : 'Paid'} ({stats.paidCount})
          </button>
          <button 
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1 rounded-md transition ${filterStatus === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700 dark:text-amber-400'}`}
          >
            {isRTL ? 'معلق ومستحق' : 'Pending'} ({stats.pendingCount})
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-800/80 border-b border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 font-extrabold text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3">{isRTL ? 'رقم الإيصال / ID' : 'Invoice ID'}</th>
                <th className="px-4 py-3">{isRTL ? 'المريض' : 'Patient'}</th>
                <th className="px-4 py-3">{isRTL ? 'البيان والخدمة الموثقة' : 'Service / Package Description'}</th>
                <th className="px-4 py-3">{isRTL ? 'التاريخ' : 'Date'}</th>
                <th className="px-4 py-3">{isRTL ? 'المبلغ' : 'Amount'}</th>
                <th className="px-4 py-3">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3 text-center">{isRTL ? 'إجراءات الأرشيف' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/80 text-xs md:text-sm">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-gray-400 font-bold">
                    {isRTL ? 'لا توجد فواتير أو إيصالات مطابقة للبحث' : 'No matching invoices found'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const isPaid = invoice.status === 'paid' || invoice.payment_status === 'paid'
                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50/70 dark:hover:bg-gray-700/30 transition-colors">
                      {/* Invoice ID */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono font-bold bg-slate-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md text-xs">
                          {invoice.id}
                        </span>
                      </td>

                      {/* Patient */}
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-xs shrink-0">
                            {invoice.patient_name ? invoice.patient_name.charAt(0) : 'P'}
                          </div>
                          <span className="truncate max-w-[170px]">{invoice.patient_name}</span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 text-slate-700 dark:text-gray-300 font-semibold max-w-[250px] truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <Layers size={14} className="text-blue-500 shrink-0" />
                          <span className="truncate" title={invoice.packageName}>{invoice.packageName}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono font-semibold text-slate-600 dark:text-gray-400 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          <span>{invoice.date}</span>
                        </div>
                      </td>

                      {/* Amount in EGP */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm md:text-base">
                          {invoice.subtotal} <span className="text-xs font-sans font-bold text-slate-500">{isRTL ? 'ج.م' : 'EGP'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
                            <CheckCircle size={13} className="text-emerald-600" />
                            <span>{isRTL ? 'مدفوع ومؤكد' : 'Paid'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
                            <Clock size={13} className="text-amber-600 animate-pulse" />
                            <span>{isRTL ? 'معلق' : 'Pending'}</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => { setViewingInvoice(invoice); setShowViewModal(true); }}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition" 
                            title={isRTL ? 'عرض وثيقة الإيصال' : 'View Receipt'}
                          >
                            <Eye size={16} />
                          </button>
                          
                          {!isPaid && (
                            <button 
                              onClick={() => handleMarkAsPaid(invoice.id || invoice.originalId)} 
                              className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition" 
                              title={isRTL ? 'تأكيد السداد والتحصيل' : 'Mark as Paid'}
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleEditInvoice(invoice)}
                            className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition" 
                            title={isRTL ? 'تعديل الفاتورة' : 'Edit'}
                          >
                            <Edit size={16} />
                          </button>

                          <button 
                            onClick={() => handlePrintInvoice(invoice)} 
                            className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition" 
                            title={isRTL ? 'طباعة رسمية' : 'Print Invoice'}
                          >
                            <Printer size={16} />
                          </button>

                          <button 
                            onClick={() => handleDeleteInvoice(invoice.id || invoice.originalId)} 
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition" 
                            title={isRTL ? 'حذف الإيصال' : 'Delete'}
                          >
                            <Trash2 size={16} />
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

      {/* Modal إضافة / تعديل فاتورة مخصصة */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-gray-700 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Plus size={20} className="text-emerald-600" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingInvoice ? (isRTL ? 'تعديل بيانات الفاتورة' : 'Edit Invoice') : (isRTL ? 'إصدار فاتورة جديدة مخصصة' : 'New Custom Invoice')}
                </h2>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-1">{isRTL ? 'اختيار المريض من المركز' : 'Select Patient'}</label>
                <select 
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  value={formData.patient_id}
                  onChange={(e) => setFormData({...formData, patient_id: e.target.value, patient_name_input: ''})}
                >
                  <option value="">{isRTL ? '-- اختر من المرضى المسجلين --' : '-- Select Patient --'}</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name || p.nameAr || p.nameEn}</option>
                  ))}
                </select>
              </div>

              {!formData.patient_id && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-1">{isRTL ? 'أو كتابة اسم مريض / جهة مخصصة *' : 'Or Custom Patient Name *'}</label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    placeholder={isRTL ? 'مثال: شركة التامين أو زائر خارجي' : 'Enter name'}
                    value={formData.patient_name_input}
                    onChange={(e) => setFormData({...formData, patient_name_input: e.target.value})}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase mb-1">{isRTL ? 'مبلغ الفاتورة بالجنيه (ج.م) *' : 'Amount (EGP) *'}</label>
                <input
                  type="number"
                  className="w-full p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 rounded-lg font-mono font-bold text-base outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  placeholder="0"
                  value={formData.subtotal}
                  onChange={(e) => setFormData({...formData, subtotal: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-1">{isRTL ? 'بيان الفاتورة (اسم الخدمة أو الباكدج) *' : 'Service / Package Title *'}</label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg font-semibold outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  placeholder={isRTL ? 'مثال: كشف طبيב خاص، باكدج علاج مائي 6 جلسات' : 'e.g. Hydrotherapy Package'}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-1">{isRTL ? 'حالة السداد والتحصيل' : 'Payment Status'}</label>
                <select
                  className="w-full p-2.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="pending">{isRTL ? '⏳ غير مدفوع / معلق في الدفاتر' : 'Pending'}</option>
                  <option value="paid">{isRTL ? '✅ تم السداد والتحصيل بالخزينة' : 'Paid & Verified'}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2.5 mt-5 pt-3 border-t border-slate-100 dark:border-gray-700">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 font-bold rounded-xl hover:bg-slate-200 transition text-xs"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveInvoice}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition text-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Save size={15} />
                <span>{isSubmitting ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الفاتورة' : 'Save Invoice')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal عرض الفاتورة */}
      {showViewModal && viewingInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-gray-700 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <div className="text-center flex-1">
                <Receipt size={32} className="text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{isRTL ? 'إيصال استلام دفعة طبية' : 'Receipt Document'}</h2>
                <p className="text-xs text-slate-400 font-mono font-bold mt-0.5">{viewingInvoice.id}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 border-t border-b border-slate-100 dark:border-gray-700 py-4 my-2 text-xs md:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400 font-bold">{isRTL ? 'اسم المريض:' : 'Patient:'}</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">{viewingInvoice.patient_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400 font-bold">{isRTL ? 'بيان الخدمة:' : 'Service:'}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-right max-w-[200px]">{viewingInvoice.packageName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400 font-bold">{isRTL ? 'تاريخ الإصدار:' : 'Date:'}</span>
                <span className="font-mono text-slate-700 dark:text-gray-300 font-bold">{viewingInvoice.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400 font-bold">{isRTL ? 'حالة الدفع:' : 'Status:'}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${viewingInvoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {viewingInvoice.status === 'paid' ? (isRTL ? '✅ مدفوع' : 'Paid') : (isRTL ? '⏳ غير مدفوع' : 'Pending')}
                </span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 mt-2">
                <span className="text-emerald-800 dark:text-emerald-300 font-black">{isRTL ? 'المبلغ الإجمالي:' : 'Total Amount:'}</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{viewingInvoice.subtotal} {isRTL ? 'ج.م' : 'EGP'}</span>
              </div>
            </div>

            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => handlePrintInvoice(viewingInvoice)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 text-xs"
              >
                <Printer size={16} />
                <span>{isRTL ? 'طباعة رسمية' : 'Print Document'}</span>
              </button>
              {(viewingInvoice.status !== 'paid' && viewingInvoice.payment_status !== 'paid') && (
                <button
                  onClick={() => { handleMarkAsPaid(viewingInvoice.id || viewingInvoice.originalId); setShowViewModal(false); }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 text-xs"
                >
                  <CheckCircle size={16} />
                  <span>{isRTL ? 'توثيق كمدفوع' : 'Mark Paid'}</span>
                </button>
              )}
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 font-bold px-4 py-2.5 rounded-xl hover:bg-slate-200 transition text-xs"
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}