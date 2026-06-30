// src/components/invoice/InvoiceManager.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  FileText, Plus, Edit, Trash2, Eye, Printer, Download,
  DollarSign, Calendar, Clock, CheckCircle, XCircle, 
  AlertCircle, Search, Filter, RefreshCw, Loader2,
  User, Mail, Phone, MapPin, Save, X, CreditCard,
  TrendingUp, Users, Package, Receipt, Building,
  Wallet, Banknote, ArrowUpRight, ArrowDownRight,
  UserPlus, Stethoscope, ClipboardList, Pill
} from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { invoicesService, patientsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

// ========== مفاتيح التخزين في localStorage ==========
const STORAGE_KEYS = {
  INVOICES: 'mcsos_invoices_v2',
  PATIENTS: 'mcsos_patients_v2'
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
const defaultInvoices = [
  { 
    id: 1, 
    patient_name: 'أحمد محمد', 
    patient_id: '550e8400-e29b-41d4-a716-446655440000',
    subtotal: 500, 
    status: 'paid', 
    created_at: '2024-01-15',
    payment_status: 'paid'
  },
  { 
    id: 2, 
    patient_name: 'سارة حسن', 
    patient_id: '550e8400-e29b-41d4-a716-446655440001',
    subtotal: 900, 
    status: 'paid', 
    created_at: '2024-01-14',
    payment_status: 'paid'
  },
  { 
    id: 3, 
    patient_name: 'محمود علي', 
    patient_id: '550e8400-e29b-41d4-a716-446655440002',
    subtotal: 500, 
    status: 'pending', 
    created_at: '2024-01-13',
    payment_status: 'pending'
  }
]

// ========== بيانات المرضى مع UUIDs ==========
const defaultPatients = [
  { id: '550e8400-e29b-41d4-a716-446655440000', name: 'أحمد محمد', phone: '0501111111', email: 'ahmed@example.com' },
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'سارة حسن', phone: '0502222222', email: 'sara@example.com' },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'محمود علي', phone: '0503333333', email: 'mahmoud@example.com' }
]

export default function InvoiceManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language

  // ========== استخدام خدمات API ==========
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

  // ========== نموذج الفاتورة ==========
  const [formData, setFormData] = useState({
    patient_id: '',
    subtotal: 0
  })

  // ========== إحصائيات ==========
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    paidCount: 0,
    pendingCount: 0
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
        loadInvoices()
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
            // ✅ استخدام UUIDs من API
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

  // ========== تحميل الفواتير ==========
  const loadInvoices = async () => {
    try {
      if (isOnline) {
        try {
          const response = await executeWithOfflineSupport(
            () => invoicesService.getInvoices(),
            'invoices',
            getLocalData(STORAGE_KEYS.INVOICES)
          )
          
          let data = []
          if (response && response.invoices) {
            data = response.invoices
          } else if (Array.isArray(response)) {
            data = response
          }
          
          if (data.length > 0) {
            const formattedData = data.map(item => ({
              id: item.id || Date.now(),
              patient_id: item.patient_id || '',
              patient_name: item.patient_name || item.patient?.name || getPatientNameLocal(item.patient_id),
              subtotal: item.subtotal || item.amount || 0,
              status: item.status || item.payment_status || 'pending',
              payment_status: item.payment_status || item.status || 'pending',
              created_at: item.created_at || item.date || new Date().toISOString().split('T')[0],
              _syncPending: item._syncPending || false
            }))
            
            setInvoices(formattedData)
            localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(formattedData))
            calculateStats(formattedData)
            return
          }
        } catch (apiError) {
          console.warn('API invoices failed:', apiError)
        }
      }
      
      const saved = getLocalData(STORAGE_KEYS.INVOICES)
      if (saved && saved.length > 0) {
        setInvoices(saved)
        calculateStats(saved)
      } else {
        setInvoices(defaultInvoices)
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(defaultInvoices))
        calculateStats(defaultInvoices)
      }
    } catch (error) {
      console.error('Error loading invoices:', error)
      const saved = getLocalData(STORAGE_KEYS.INVOICES)
      setInvoices(saved && saved.length > 0 ? saved : defaultInvoices)
      calculateStats(saved && saved.length > 0 ? saved : defaultInvoices)
    }
  }

  // ========== الحصول على اسم المريض محلياً ==========
  const getPatientNameLocal = (patientId) => {
    const patient = patients.find(p => p.id === patientId)
    return patient ? (patient.name || patient.nameAr || patient.nameEn || 'مريض') : 'مريض'
  }

  // ========== حساب الإحصائيات ==========
  const calculateStats = (data) => {
    const total = data.length
    const totalAmount = data.reduce((sum, inv) => sum + (inv.subtotal || 0), 0)
    
    const paid = data.filter(inv => inv.status === 'paid' || inv.payment_status === 'paid')
    const pending = data.filter(inv => inv.status === 'pending' || inv.payment_status === 'pending' || inv.status === 'unpaid')

    setStats({
      totalInvoices: total,
      totalAmount: totalAmount,
      paidAmount: paid.reduce((sum, inv) => sum + (inv.subtotal || 0), 0),
      pendingAmount: pending.reduce((sum, inv) => sum + (inv.subtotal || 0), 0),
      paidCount: paid.length,
      pendingCount: pending.length
    })
  }

  // ========== حفظ الفواتير ==========
  const saveInvoices = async (newInvoices) => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(newInvoices))
    setInvoices(newInvoices)
    calculateStats(newInvoices)

    if (isOnline) {
      const pending = newInvoices.filter(item => item._syncPending)
      for (const item of pending) {
        try {
          const payload = {
            patient_id: item.patient_id,
            subtotal: item.subtotal
          }
          await invoicesService.createInvoice(payload)
          const synced = newInvoices.map(inv =>
            inv.id === item.id ? { ...inv, _syncPending: false } : inv
          )
          localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(synced))
          setInvoices(synced)
          calculateStats(synced)
        } catch (error) {
          console.warn('Failed to sync invoice:', error)
        }
      }
    }
  }

  // ========== دوال مساعدة ==========
  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30"><CheckCircle size={12} className="inline mr-1" /> مدفوع</span>
      case 'pending':
      case 'unpaid':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"><Clock size={12} className="inline mr-1" /> معلق</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">{status}</span>
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  // ========== فتح نموذج إضافة فاتورة ==========
  const handleAddInvoice = () => {
    setEditingInvoice(null)
    setFormData({
      patient_id: '',
      subtotal: 0
    })
    setShowInvoiceModal(true)
  }

  // ========== فتح نموذج تعديل فاتورة ==========
  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice)
    setFormData({
      patient_id: invoice.patient_id || '',
      subtotal: invoice.subtotal || 0
    })
    setShowInvoiceModal(true)
  }

  // ========== عرض تفاصيل الفاتورة ==========
  const handleViewInvoice = (invoice) => {
    setViewingInvoice(invoice)
    setShowViewModal(true)
  }

  // ========== حفظ الفاتورة ==========
  const handleSaveInvoice = async () => {
    if (!formData.patient_id) {
      toast.error('الرجاء اختيار المريض')
      return
    }
    if (!formData.subtotal || formData.subtotal <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح')
      return
    }

    setIsSubmitting(true)
    try {
      const invoiceData = {
        patient_id: formData.patient_id,
        subtotal: Number(formData.subtotal)
      }

      console.log('📤 Sending invoice data:', JSON.stringify(invoiceData, null, 2))

      let newInvoice

      if (isOnline) {
        try {
          if (editingInvoice) {
            const response = await invoicesService.updateInvoice(editingInvoice.id, invoiceData)
            newInvoice = response?.invoice || response
          } else {
            const response = await invoicesService.createInvoice(invoiceData)
            newInvoice = response?.invoice || response
          }
        } catch (apiError) {
          console.warn('API save failed, saving locally:', apiError)
          newInvoice = {
            ...invoiceData,
            id: editingInvoice?.id || Date.now(),
            patient_name: getPatientNameLocal(formData.patient_id),
            status: 'pending',
            payment_status: 'pending',
            created_at: new Date().toISOString().split('T')[0],
            _syncPending: true
          }
          toast.warning('تم الحفظ محلياً، سيتم المزامنة عند الاتصال')
        }
      } else {
        newInvoice = {
          ...invoiceData,
          id: editingInvoice?.id || Date.now(),
          patient_name: getPatientNameLocal(formData.patient_id),
          status: 'pending',
          payment_status: 'pending',
          created_at: new Date().toISOString().split('T')[0],
          _syncPending: true
        }
        toast.info('تم الحفظ في وضع عدم الاتصال')
      }

      let updatedInvoices
      if (editingInvoice) {
        updatedInvoices = invoices.map(inv => inv.id === editingInvoice.id ? { ...newInvoice, id: editingInvoice.id } : inv)
      } else {
        updatedInvoices = [newInvoice, ...invoices]
      }

      await saveInvoices(updatedInvoices)
      toast.success(editingInvoice ? 'تم تحديث الفاتورة' : 'تم إضافة الفاتورة')
      setShowInvoiceModal(false)
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حفظ الفاتورة')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== حذف فاتورة ==========
  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return

    try {
      if (isOnline) {
        try {
          await invoicesService.deleteInvoice(id)
        } catch (apiError) {
          console.warn('API delete failed, removing locally:', apiError)
        }
      }

      const updated = invoices.filter(inv => inv.id !== id)
      await saveInvoices(updated)
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

      const updated = invoices.map(inv =>
        inv.id === id ? { ...inv, status: 'paid', payment_status: 'paid', _syncPending: !isOnline } : inv
      )
      await saveInvoices(updated)
      toast.success('تم تحديث حالة الدفع')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تحديث حالة الدفع')
    }
  }

  // ========== طباعة الفاتورة ==========
  const handlePrintInvoice = (invoice) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(getInvoiceHTML(invoice))
      printWindow.document.close()
      printWindow.print()
    }
    toast.success('جاري طباعة الفاتورة...')
  }

  // ========== توليد HTML للطباعة ==========
  const getInvoiceHTML = (invoice) => {
    return `<!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة - ${invoice.id}</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box;}
          body{font-family:'Cairo',Arial,sans-serif;background:#e0e0e0;padding:20px;display:flex;justify-content:center;}
          .invoice{max-width:700px;width:100%;background:white;border-radius:10px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.1);}
          .header{background:linear-gradient(135deg,#1e3a5f,#2563eb);color:white;padding:20px;text-align:center;}
          .title{font-size:24px;font-weight:bold;}
          .invoice-number{font-size:14px;opacity:0.8;margin-top:5px;}
          .section{padding:15px 20px;border-bottom:1px solid #e5e7eb;}
          .section-title{font-weight:bold;color:#1e3a5f;font-size:16px;margin-bottom:10px;border-bottom:2px solid #2563eb;display:inline-block;}
          .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;}
          .info-item{display:flex;justify-content:space-between;padding:3px 0;}
          .status-badge{padding:4px 12px;border-radius:20px;display:inline-block;font-size:12px;}
          .status-paid{background:#dcfce7;color:#166534;}
          .status-pending{background:#fef3c7;color:#92400e;}
          .footer{text-align:center;padding:15px;background:#f8fafc;color:#6b7280;font-size:10px;}
          .total-amount{font-size:24px;font-weight:bold;color:#2563eb;}
          @media print{body{background:white;padding:0;}.invoice{box-shadow:none;border-radius:0;}}
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div class="title">فاتورة</div>
            <div class="invoice-number">رقم الفاتورة: INV-${String(invoice.id).padStart(4, '0')}</div>
          </div>
          <div class="section">
            <div class="info-grid">
              <div class="info-item"><span>المريض:</span><strong>${invoice.patient_name || 'مريض'}</strong></div>
              <div class="info-item"><span>التاريخ:</span><strong>${invoice.created_at || invoice.date || new Date().toISOString().split('T')[0]}</strong></div>
              <div class="info-item"><span>الحالة:</span><strong>${invoice.status === 'paid' ? 'مدفوع' : 'معلق'}</strong></div>
              <div class="info-item"><span>المبلغ:</span><strong>${formatCurrency(invoice.subtotal || 0)}</strong></div>
            </div>
          </div>
          <div class="footer">
            <p>شكراً لاختياركم مركزنا الطبي</p>
            <p style="margin-top:5px;">تم إنشاء هذه الفاتورة بواسطة نظام MCSOS</p>
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

  // ========== تصفية الفواتير ==========
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.id?.toString().includes(searchTerm)
    const matchesStatus = filterStatus === 'all' || inv.status?.toLowerCase() === filterStatus || inv.payment_status?.toLowerCase() === filterStatus
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
          <h1 className="text-3xl font-bold gradient-text">إدارة الفواتير</h1>
          <p className="text-gray-400 mt-1">
            إنشاء وإدارة الفواتير الطبية
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
          <button onClick={handleAddInvoice} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-500/30 transition">
            <Plus size={18} /> فاتورة جديدة
          </button>
        </div>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">إجمالي الفواتير</p><p className="text-2xl font-bold text-white">{stats.totalInvoices}</p></div>
            <div className="p-2 bg-blue-500/20 rounded-xl"><FileText className="text-blue-400" size={24} /></div>
          </div>
          <div className="text-sm text-gray-400 mt-1">القيمة: {formatCurrency(stats.totalAmount)}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">مدفوع</p><p className="text-2xl font-bold text-green-400">{stats.paidCount}</p></div>
            <div className="p-2 bg-green-500/20 rounded-xl"><CheckCircle className="text-green-400" size={24} /></div>
          </div>
          <div className="text-sm text-green-400 mt-1">{formatCurrency(stats.paidAmount)}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl p-4 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">معلق</p><p className="text-2xl font-bold text-yellow-400">{stats.pendingCount}</p></div>
            <div className="p-2 bg-yellow-500/20 rounded-xl"><Clock className="text-yellow-400" size={24} /></div>
          </div>
          <div className="text-sm text-yellow-400 mt-1">{formatCurrency(stats.pendingAmount)}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-4 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">القيمة الإجمالية</p><p className="text-2xl font-bold text-purple-400">{formatCurrency(stats.totalAmount)}</p></div>
            <div className="p-2 bg-purple-500/20 rounded-xl"><Wallet className="text-purple-400" size={24} /></div>
          </div>
        </div>
      </div>

      {/* بحث وتصفية */}
      <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input type="text" placeholder="ابحث عن فاتورة..." className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 transition" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 transition" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">جميع الحالات</option>
            <option value="paid">مدفوع</option>
            <option value="pending">معلق</option>
          </select>
        </div>
      </div>

      {/* جدول الفواتير */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">قائمة الفواتير ({filteredInvoices.length})</h2>
          <span className="text-sm text-gray-400">
            {invoices.filter(inv => inv._syncPending).length > 0 && (
              <span className="text-yellow-400">⏳ {invoices.filter(inv => inv._syncPending).length} في انتظار المزامنة</span>
            )}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <th className="px-4 py-3 text-sm text-gray-300">رقم الفاتورة</th>
                <th className="px-4 py-3 text-sm text-gray-300">المريض</th>
                <th className="px-4 py-3 text-sm text-gray-300">التاريخ</th>
                <th className="px-4 py-3 text-sm text-gray-300">المبلغ</th>
                <th className="px-4 py-3 text-sm text-gray-300">الحالة</th>
                <th className="px-4 py-3 text-sm text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredInvoices.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">لا توجد فواتير</td></tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const isPending = invoice._syncPending === true
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3">
                        <span className="text-blue-400 font-mono">INV-{String(invoice.id).padStart(4, '0')}</span>
                        {isPending && (
                          <span className="block text-[8px] text-yellow-400">⏳ مزامنة</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">{invoice.patient_name || 'مريض'}</td>
                      <td className="px-4 py-3 text-gray-300">{invoice.created_at || invoice.date}</td>
                      <td className="px-4 py-3 font-bold text-green-400">{formatCurrency(invoice.subtotal || 0)}</td>
                      <td className="px-4 py-3">{getStatusBadge(invoice.status || invoice.payment_status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleViewInvoice(invoice)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition" title="عرض"><Eye size={16} /></button>
                          {(invoice.status !== 'paid' && invoice.payment_status !== 'paid') && (
                            <button onClick={() => handleMarkAsPaid(invoice.id)} className="p-1 text-green-400 hover:bg-green-500/20 rounded transition" title="تحديد كمدفوع"><CheckCircle size={16} /></button>
                          )}
                          <button onClick={() => handleEditInvoice(invoice)} className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded transition" title="تعديل"><Edit size={16} /></button>
                          <button onClick={() => handlePrintInvoice(invoice)} className="p-1 text-purple-400 hover:bg-purple-500/20 rounded transition" title="طباعة"><Printer size={16} /></button>
                          <button onClick={() => handleDeleteInvoice(invoice.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded transition" title="حذف"><Trash2 size={16} /></button>
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

      {/* Modal إضافة/تعديل فاتورة */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{editingInvoice ? 'تعديل فاتورة' : 'فاتورة جديدة'}</h2>
              <button onClick={() => setShowInvoiceModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
            </div>

            <div className="space-y-4">
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
                <label className="block text-sm text-gray-400 mb-1">المبلغ (ر.س) *</label>
                <input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.subtotal} onChange={(e) => setFormData({...formData, subtotal: Number(e.target.value)})} min="0" step="0.01" />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-blue-400">
                  ℹ️ سيتم إنشاء الفاتورة بحالة "معلق" ويمكنك تحديثها لاحقاً
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button onClick={handleSaveInvoice} disabled={isSubmitting} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin inline mr-1" /> : <Save size={16} className="inline mr-1" />}
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button onClick={() => setShowInvoiceModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal عرض تفاصيل الفاتورة */}
      {showViewModal && viewingInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">تفاصيل الفاتورة</h2>
              <div className="flex gap-2">
                <button onClick={() => handlePrintInvoice(viewingInvoice)} className="p-1 text-purple-400 hover:bg-purple-500/20 rounded transition" title="طباعة"><Printer size={18} /></button>
                <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-gray-400">رقم الفاتورة:</span> <span className="text-white font-mono">INV-{String(viewingInvoice.id).padStart(4, '0')}</span></div>
                  <div><span className="text-gray-400">المريض:</span> <span className="text-white">{viewingInvoice.patient_name || 'مريض'}</span></div>
                  <div><span className="text-gray-400">التاريخ:</span> <span className="text-white">{viewingInvoice.created_at || viewingInvoice.date}</span></div>
                  <div><span className="text-gray-400">الحالة:</span> {getStatusBadge(viewingInvoice.status || viewingInvoice.payment_status)}</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-lg p-4 text-center">
                <span className="text-gray-400 text-sm">المبلغ الإجمالي</span>
                <p className="text-3xl font-bold text-green-400">{formatCurrency(viewingInvoice.subtotal || 0)}</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                {(viewingInvoice.status !== 'paid' && viewingInvoice.payment_status !== 'paid') && (
                  <button onClick={() => { handleMarkAsPaid(viewingInvoice.id); setShowViewModal(false); }} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition flex items-center justify-center gap-2">
                    <CheckCircle size={16} /> تحديد كمدفوع
                  </button>
                )}
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