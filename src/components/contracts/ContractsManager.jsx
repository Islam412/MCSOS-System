// src/components/contracts/ContractsManager.jsx
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Building2, Plus, Search, Filter, Edit, Trash2, Eye, FileText,
  DollarSign, Calendar, AlertTriangle, CheckCircle, Clock, XCircle,
  ChevronDown, ChevronUp, Send, Mail, ArrowLeft, TrendingUp,
  CreditCard, BarChart3, X, RefreshCw, Download, Banknote
} from 'lucide-react'
import { contractsService } from '../../services/api/services/contractsService'

// ==============================
// حالات التعاقد وألوانها
// ==============================
const CONTRACT_STATUS = {
  ACTIVE: { label: 'نشط', labelEn: 'Active', color: 'emerald', icon: CheckCircle },
  EXPIRED: { label: 'منتهي', labelEn: 'Expired', color: 'red', icon: XCircle },
  SUSPENDED: { label: 'معلق', labelEn: 'Suspended', color: 'amber', icon: AlertTriangle },
  CANCELLED: { label: 'ملغي', labelEn: 'Cancelled', color: 'gray', icon: XCircle },
  PENDING: { label: 'قيد الانتظار', labelEn: 'Pending', color: 'blue', icon: Clock },
}

const COLLECTION_STATUS = {
  NOT_STARTED: { label: 'لم يبدأ', labelEn: 'Not Started', color: 'gray' },
  PARTIAL: { label: 'جزئي', labelEn: 'Partial', color: 'amber' },
  FULLY_COLLECTED: { label: 'تم التحصيل', labelEn: 'Fully Collected', color: 'emerald' },
  OVERDUE: { label: 'متأخر', labelEn: 'Overdue', color: 'red' },
  DISPUTED: { label: 'متنازع', labelEn: 'Disputed', color: 'purple' },
}

const LETTER_TYPE = {
  CONTRACT_OFFER: { label: 'عرض تعاقد', labelEn: 'Contract Offer' },
  RENEWAL_NOTICE: { label: 'إشعار تجديد', labelEn: 'Renewal Notice' },
  INVOICE_LETTER: { label: 'خطاب فاتورة', labelEn: 'Invoice Letter' },
  PAYMENT_REMINDER: { label: 'تذكير بالدفع', labelEn: 'Payment Reminder' },
  SERVICE_REPORT: { label: 'تقرير خدمات', labelEn: 'Service Report' },
  COMPLAINT: { label: 'شكوى', labelEn: 'Complaint' },
  GENERAL: { label: 'عام', labelEn: 'General' },
}

const LETTER_STATUS = {
  DRAFT: { label: 'مسودة', labelEn: 'Draft', color: 'gray' },
  SENT: { label: 'تم الإرسال', labelEn: 'Sent', color: 'blue' },
  RECEIVED: { label: 'تم الاستلام', labelEn: 'Received', color: 'indigo' },
  ACKNOWLEDGED: { label: 'معتمد', labelEn: 'Acknowledged', color: 'emerald' },
  PENDING_RESPONSE: { label: 'بانتظار الرد', labelEn: 'Pending Response', color: 'amber' },
  RESPONDED: { label: 'تم الرد', labelEn: 'Responded', color: 'teal' },
  ARCHIVED: { label: 'مؤرشف', labelEn: 'Archived', color: 'slate' },
}

// ==============================
// مكون شارة الحالة
// ==============================
function StatusBadge({ status, map, isRTL }) {
  const info = map[status] || { label: status, labelEn: status, color: 'gray' }
  const colorMap = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${colorMap[info.color] || colorMap.gray}`}>
      {info.icon && <info.icon size={12} />}
      {isRTL ? info.label : info.labelEn}
    </span>
  )
}

// ==============================
// مكون بطاقة الإحصائية
// ==============================
function StatCard({ icon: Icon, label, value, color, subtext }) {
  const gradients = {
    blue: 'from-blue-500 to-indigo-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
    red: 'from-red-500 to-rose-600',
    purple: 'from-purple-500 to-violet-600',
  }
  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</p>
          {subtext && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${gradients[color] || gradients.blue} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  )
}

// ==============================
// المكون الرئيسي
// ==============================
export default function ContractsManager() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // ===== State =====
  const [contracts, setContracts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [collectionFilter, setCollectionFilter] = useState('ALL')
  const [view, setView] = useState('list') // 'list' | 'detail' | 'form' | 'letters'
  const [selectedContract, setSelectedContract] = useState(null)
  const [letters, setLetters] = useState([])
  const [showLetterForm, setShowLetterForm] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [editingContract, setEditingContract] = useState(null)
  const [editingLetter, setEditingLetter] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // ===== Form State =====
  const emptyContractForm = {
    organization_name: '', contact_person: '', phone: '', email: '', address: '',
    contract_number: '', start_date: '', end_date: '', total_value: '',
    discount_percentage: '', status: 'PENDING', payment_terms: '',
    covered_services: [], notes: ''
  }
  const [contractForm, setContractForm] = useState(emptyContractForm)

  const emptyLetterForm = {
    contract_id: '', subject: '', content: '', letter_type: 'GENERAL',
    status: 'DRAFT', letter_date: new Date().toISOString().split('T')[0],
    received_date: '', response_date: '', reference_number: '',
    sender: '', recipient: '', notes: ''
  }
  const [letterForm, setLetterForm] = useState(emptyLetterForm)

  const [paymentForm, setPaymentForm] = useState({ amount: '', notes: '' })

  // ===== Toast =====
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ===== Load Data =====
  const loadContracts = async () => {
    setLoading(true)
    try {
      const data = await contractsService.getContracts()
      setContracts(data)
    } catch (error) {
      // Fallback to demo data
      setContracts(getDemoContracts())
    }
    try {
      const s = await contractsService.getStats()
      setStats(s)
    } catch {
      // Compute stats from local data
    }
    setLoading(false)
  }

  useEffect(() => { loadContracts() }, [])

  // ===== Demo Data =====
  const getDemoContracts = () => [
    {
      id: 'demo-1', organization_name: 'شركة التأمين الوطنية', contact_person: 'أحمد السيد',
      phone: '0501234567', email: 'ahmed@insurance.sa', contract_number: 'CNT-2024-0001',
      start_date: '2024-01-01', end_date: '2024-12-31', total_value: 500000,
      collected_amount: 350000, remaining_amount: 150000, discount_percentage: 10,
      status: 'ACTIVE', collection_status: 'PARTIAL', notes: 'تعاقد سنوي شامل',
      payment_terms: 'الدفع كل ربع سنة', covered_services: ['علاج طبيعي', 'تخاطب'],
      is_active: true, letters: [], created_at: '2024-01-01'
    },
    {
      id: 'demo-2', organization_name: 'مستشفى الملك فهد', contact_person: 'منى عبد الرحمن',
      phone: '0559876543', email: 'mona@kfh.sa', contract_number: 'CNT-2024-0002',
      start_date: '2024-03-01', end_date: '2025-02-28', total_value: 800000,
      collected_amount: 800000, remaining_amount: 0, discount_percentage: 15,
      status: 'ACTIVE', collection_status: 'FULLY_COLLECTED', notes: 'تعاقد تحويلات',
      payment_terms: 'الدفع شهريًا', covered_services: ['علاج طبيعي أعصاب', 'تغذية'],
      is_active: true, letters: [], created_at: '2024-03-01'
    },
    {
      id: 'demo-3', organization_name: 'شركة أرامكو', contact_person: 'خالد العلي',
      phone: '0561112233', email: 'khalid@aramco.com', contract_number: 'CNT-2024-0003',
      start_date: '2024-06-01', end_date: '2024-11-30', total_value: 250000,
      collected_amount: 0, remaining_amount: 250000, discount_percentage: 5,
      status: 'PENDING', collection_status: 'NOT_STARTED', notes: 'في انتظار الموافقة',
      payment_terms: 'دفعة واحدة عند التعاقد', covered_services: ['علاج طبيعي عظام'],
      is_active: true, letters: [], created_at: '2024-06-01'
    },
    {
      id: 'demo-4', organization_name: 'وزارة الصحة', contact_person: 'سارة محمد',
      phone: '0541234567', email: 'sara@moh.gov.sa', contract_number: 'CNT-2023-0010',
      start_date: '2023-01-01', end_date: '2023-12-31', total_value: 1200000,
      collected_amount: 900000, remaining_amount: 300000, discount_percentage: 0,
      status: 'EXPIRED', collection_status: 'OVERDUE', notes: 'تعاقد منتهي - متأخر في التحصيل',
      payment_terms: 'الدفع كل شهرين', covered_services: ['جميع الخدمات'],
      is_active: false, letters: [], created_at: '2023-01-01'
    },
  ]

  // ===== Computed =====
  const computedStats = useMemo(() => {
    if (stats) return stats
    const all = contracts
    return {
      total: all.length,
      active: all.filter(c => c.status === 'ACTIVE').length,
      expired: all.filter(c => c.status === 'EXPIRED').length,
      pending: all.filter(c => c.status === 'PENDING').length,
      totalValue: all.reduce((s, c) => s + Number(c.total_value || 0), 0),
      totalCollected: all.reduce((s, c) => s + Number(c.collected_amount || 0), 0),
      totalRemaining: all.reduce((s, c) => s + Number(c.remaining_amount || 0), 0),
      collectionRate: (() => {
        const tv = all.reduce((s, c) => s + Number(c.total_value || 0), 0)
        const tc = all.reduce((s, c) => s + Number(c.collected_amount || 0), 0)
        return tv > 0 ? ((tc / tv) * 100).toFixed(1) : '0'
      })()
    }
  }, [contracts, stats])

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchesSearch = searchTerm === '' ||
        c.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contract_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter
      const matchesCollection = collectionFilter === 'ALL' || c.collection_status === collectionFilter
      return matchesSearch && matchesStatus && matchesCollection
    })
  }, [contracts, searchTerm, statusFilter, collectionFilter])

  // ===== Handlers =====
  const handleSaveContract = async () => {
    if (!contractForm.organization_name || !contractForm.start_date || !contractForm.end_date) {
      showToast(isRTL ? 'يرجى إدخال اسم الجهة وتواريخ التعاقد' : 'Please enter organization name and dates', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...contractForm,
        total_value: Number(contractForm.total_value) || 0,
        discount_percentage: Number(contractForm.discount_percentage) || 0,
      }
      if (editingContract) {
        await contractsService.updateContract(editingContract.id, payload)
        showToast(isRTL ? 'تم تحديث التعاقد بنجاح' : 'Contract updated successfully')
      } else {
        await contractsService.createContract(payload)
        showToast(isRTL ? 'تم إنشاء التعاقد بنجاح' : 'Contract created successfully')
      }
      await loadContracts()
      setView('list')
      setEditingContract(null)
      setContractForm(emptyContractForm)
    } catch (error) {
      // Local fallback
      if (editingContract) {
        setContracts(prev => prev.map(c => c.id === editingContract.id ? { ...c, ...contractForm, total_value: Number(contractForm.total_value) || 0 } : c))
      } else {
        const newContract = {
          id: `local-${Date.now()}`,
          ...contractForm,
          total_value: Number(contractForm.total_value) || 0,
          collected_amount: 0,
          remaining_amount: Number(contractForm.total_value) || 0,
          collection_status: 'NOT_STARTED',
          contract_number: `CNT-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(4, '0')}`,
          is_active: true,
          letters: [],
          created_at: new Date().toISOString()
        }
        setContracts(prev => [newContract, ...prev])
      }
      showToast(isRTL ? 'تم الحفظ محليًا' : 'Saved locally')
      setView('list')
      setEditingContract(null)
      setContractForm(emptyContractForm)
    }
    setSaving(false)
  }

  const handleDeleteContract = async (id) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا التعاقد؟' : 'Are you sure you want to delete this contract?')) return
    try {
      await contractsService.deleteContract(id)
      showToast(isRTL ? 'تم حذف التعاقد' : 'Contract deleted')
    } catch {
      // local fallback
    }
    setContracts(prev => prev.filter(c => c.id !== id))
    if (selectedContract?.id === id) {
      setSelectedContract(null)
      setView('list')
    }
  }

  const handleSaveLetter = async () => {
    if (!letterForm.subject || !letterForm.letter_date) {
      showToast(isRTL ? 'يرجى إدخال عنوان الخطاب والتاريخ' : 'Please enter subject and date', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = { ...letterForm, contract_id: selectedContract.id }
      if (editingLetter) {
        await contractsService.updateLetter(editingLetter.id, payload)
        showToast(isRTL ? 'تم تحديث الخطاب' : 'Letter updated')
      } else {
        await contractsService.createLetter(payload)
        showToast(isRTL ? 'تم إنشاء الخطاب' : 'Letter created')
      }
      // Reload letters
      const updatedLetters = await contractsService.getLettersByContract(selectedContract.id)
      setLetters(updatedLetters)
    } catch {
      // local fallback
      if (editingLetter) {
        setLetters(prev => prev.map(l => l.id === editingLetter.id ? { ...l, ...letterForm } : l))
      } else {
        setLetters(prev => [{ id: `local-${Date.now()}`, ...letterForm, created_at: new Date().toISOString() }, ...prev])
      }
      showToast(isRTL ? 'تم الحفظ محليًا' : 'Saved locally')
    }
    setShowLetterForm(false)
    setEditingLetter(null)
    setLetterForm({ ...emptyLetterForm, contract_id: selectedContract?.id || '' })
    setSaving(false)
  }

  const handleDeleteLetter = async (id) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا الخطاب؟' : 'Delete this letter?')) return
    try {
      await contractsService.deleteLetter(id)
    } catch {}
    setLetters(prev => prev.filter(l => l.id !== id))
    showToast(isRTL ? 'تم حذف الخطاب' : 'Letter deleted')
  }

  const handleRecordPayment = async () => {
    const amount = Number(paymentForm.amount)
    if (!amount || amount <= 0) {
      showToast(isRTL ? 'يرجى إدخال مبلغ صحيح' : 'Please enter a valid amount', 'error')
      return
    }
    setSaving(true)
    try {
      const updated = await contractsService.recordPayment(selectedContract.id, amount, paymentForm.notes)
      setSelectedContract(updated)
      await loadContracts()
    } catch {
      // local fallback
      const newCollected = Number(selectedContract.collected_amount || 0) + amount
      const remaining = Math.max(0, Number(selectedContract.total_value || 0) - newCollected)
      const updated = {
        ...selectedContract,
        collected_amount: newCollected,
        remaining_amount: remaining,
        collection_status: newCollected >= Number(selectedContract.total_value) ? 'FULLY_COLLECTED' : 'PARTIAL'
      }
      setSelectedContract(updated)
      setContracts(prev => prev.map(c => c.id === updated.id ? updated : c))
    }
    setShowPaymentModal(false)
    setPaymentForm({ amount: '', notes: '' })
    showToast(isRTL ? 'تم تسجيل الدفعة بنجاح' : 'Payment recorded')
    setSaving(false)
  }

  const openContractDetail = async (contract) => {
    setSelectedContract(contract)
    try {
      const ltrs = await contractsService.getLettersByContract(contract.id)
      setLetters(ltrs)
    } catch {
      setLetters(contract.letters || [])
    }
    setView('detail')
  }

  const openEditContract = (contract) => {
    setEditingContract(contract)
    setContractForm({
      organization_name: contract.organization_name || '',
      contact_person: contract.contact_person || '',
      phone: contract.phone || '',
      email: contract.email || '',
      address: contract.address || '',
      contract_number: contract.contract_number || '',
      start_date: contract.start_date?.split('T')[0] || '',
      end_date: contract.end_date?.split('T')[0] || '',
      total_value: contract.total_value || '',
      discount_percentage: contract.discount_percentage || '',
      status: contract.status || 'PENDING',
      payment_terms: contract.payment_terms || '',
      covered_services: contract.covered_services || [],
      notes: contract.notes || ''
    })
    setView('form')
  }

  const openNewContract = () => {
    setEditingContract(null)
    setContractForm(emptyContractForm)
    setView('form')
  }

  const formatCurrency = (val) => {
    const num = Number(val) || 0
    return num.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 })
  }

  const formatDate = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // ===== Progress bar percentage =====
  const collectionPercent = (contract) => {
    const total = Number(contract.total_value || 0)
    const collected = Number(contract.collected_amount || 0)
    return total > 0 ? Math.min(100, (collected / total) * 100) : 0
  }

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 ${isRTL ? 'left-6' : 'right-6'} z-[100] animate-slide-in-right`}>
          <div className={`px-5 py-3 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 ${
            toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
          }`}>
            {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
            {toast.message}
          </div>
        </div>
      )}

      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {view !== 'list' && (
            <button
              onClick={() => { setView('list'); setSelectedContract(null); setEditingContract(null) }}
              className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <ArrowLeft size={20} className={`text-gray-600 dark:text-gray-300 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 size={28} className="text-blue-600" />
              {isRTL ? 'إدارة التعاقدات' : 'Contracts Management'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isRTL ? 'إدارة جهات التعاقد والخطابات والتحصيل المالي' : 'Manage corporate contracts, correspondence & collections'}
            </p>
          </div>
        </div>
        {view === 'list' && (
          <button
            onClick={openNewContract}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus size={18} />
            {isRTL ? 'إضافة تعاقد' : 'New Contract'}
          </button>
        )}
      </div>

      {/* ===== Statistics Cards ===== */}
      {view === 'list' && (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
          <StatCard icon={Building2} label={isRTL ? 'إجمالي التعاقدات' : 'Total Contracts'} value={computedStats.total} color="blue" />
          <StatCard icon={CheckCircle} label={isRTL ? 'نشط' : 'Active'} value={computedStats.active} color="emerald" />
          <StatCard icon={TrendingUp} label={isRTL ? 'إجمالي القيمة' : 'Total Value'} value={formatCurrency(computedStats.totalValue)} color="purple" subtext={isRTL ? `تحصيل: ${computedStats.collectionRate}%` : `Collection: ${computedStats.collectionRate}%`} />
          <StatCard icon={CreditCard} label={isRTL ? 'تم التحصيل' : 'Collected'} value={formatCurrency(computedStats.totalCollected)} color="emerald" />
          <StatCard icon={AlertTriangle} label={isRTL ? 'متبقي' : 'Remaining'} value={formatCurrency(computedStats.totalRemaining)} color="amber" />
        </div>
      )}

      {/* ===== LIST VIEW ===== */}
      {view === 'list' && (
        <>
          {/* Filters */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={18} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  placeholder={isRTL ? 'بحث بالاسم أو رقم التعاقد...' : 'Search by name or contract number...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none text-gray-900 dark:text-white`}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="ALL">{isRTL ? 'جميع الحالات' : 'All Statuses'}</option>
                {Object.entries(CONTRACT_STATUS).map(([key, val]) => (
                  <option key={key} value={key}>{isRTL ? val.label : val.labelEn}</option>
                ))}
              </select>
              <select
                value={collectionFilter}
                onChange={(e) => setCollectionFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="ALL">{isRTL ? 'حالة التحصيل' : 'Collection Status'}</option>
                {Object.entries(COLLECTION_STATUS).map(([key, val]) => (
                  <option key={key} value={key}>{isRTL ? val.label : val.labelEn}</option>
                ))}
              </select>
              <button onClick={loadContracts} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <RefreshCw size={18} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Contracts Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-16 text-center border border-gray-200/60 dark:border-gray-700/60">
              <Building2 size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">{isRTL ? 'لا توجد تعاقدات' : 'No contracts found'}</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">{isRTL ? 'ابدأ بإضافة تعاقد جديد' : 'Start by adding a new contract'}</p>
            </div>
          ) : (
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border-b border-gray-200 dark:border-gray-700">
                      <th className={`px-5 py-3.5 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'جهة التعاقد' : 'Organization'}
                      </th>
                      <th className={`px-5 py-3.5 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'رقم التعاقد' : 'Contract #'}
                      </th>
                      <th className={`px-5 py-3.5 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'الفترة' : 'Period'}
                      </th>
                      <th className={`px-5 py-3.5 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'القيمة' : 'Value'}
                      </th>
                      <th className={`px-5 py-3.5 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'التحصيل' : 'Collection'}
                      </th>
                      <th className={`px-5 py-3.5 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'الحالة' : 'Status'}
                      </th>
                      <th className={`px-5 py-3.5 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {filteredContracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors group cursor-pointer" onClick={() => openContractDetail(contract)}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                              {contract.organization_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900 dark:text-white">{contract.organization_name}</p>
                              <p className="text-xs text-gray-400">{contract.contact_person}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">{contract.contract_number}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">{formatDate(contract.start_date)}</p>
                          <p className="text-xs text-gray-400">{isRTL ? 'إلى' : 'to'} {formatDate(contract.end_date)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{formatCurrency(contract.total_value)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="w-32">
                            <div className="flex justify-between text-[10px] font-bold mb-1">
                              <span className="text-gray-500">{collectionPercent(contract).toFixed(0)}%</span>
                              <span className="text-emerald-600">{formatCurrency(contract.collected_amount)}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  collectionPercent(contract) >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                                  collectionPercent(contract) >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                                  'bg-gradient-to-r from-red-500 to-rose-500'
                                }`}
                                style={{ width: `${collectionPercent(contract)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <StatusBadge status={contract.status} map={CONTRACT_STATUS} isRTL={isRTL} />
                            <StatusBadge status={contract.collection_status} map={COLLECTION_STATUS} isRTL={isRTL} />
                          </div>
                        </td>
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openContractDetail(contract)} className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition" title={isRTL ? 'عرض' : 'View'}>
                              <Eye size={16} />
                            </button>
                            <button onClick={() => openEditContract(contract)} className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 transition" title={isRTL ? 'تعديل' : 'Edit'}>
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteContract(contract.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition" title={isRTL ? 'حذف' : 'Delete'}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== CONTRACT FORM ===== */}
      {view === 'form' && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Building2 size={22} className="text-blue-600" />
            {editingContract
              ? (isRTL ? 'تعديل التعاقد' : 'Edit Contract')
              : (isRTL ? 'إضافة تعاقد جديد' : 'New Contract')
            }
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* اسم الجهة */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'اسم جهة التعاقد *' : 'Organization Name *'}</label>
              <input type="text" value={contractForm.organization_name} onChange={(e) => setContractForm({ ...contractForm, organization_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                placeholder={isRTL ? 'شركة / مستشفى / جهة حكومية' : 'Company / Hospital / Government Entity'} />
            </div>

            {/* رقم التعاقد */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'رقم التعاقد' : 'Contract Number'}</label>
              <input type="text" value={contractForm.contract_number} onChange={(e) => setContractForm({ ...contractForm, contract_number: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                placeholder={isRTL ? 'تلقائي' : 'Auto-generated'} />
            </div>

            {/* جهة الاتصال */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'جهة الاتصال' : 'Contact Person'}</label>
              <input type="text" value={contractForm.contact_person} onChange={(e) => setContractForm({ ...contractForm, contact_person: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
            </div>

            {/* الهاتف */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'رقم الهاتف' : 'Phone'}</label>
              <input type="tel" value={contractForm.phone} onChange={(e) => setContractForm({ ...contractForm, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
            </div>

            {/* البريد */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
              <input type="email" value={contractForm.email} onChange={(e) => setContractForm({ ...contractForm, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
            </div>

            {/* تاريخ البدء */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'تاريخ البدء *' : 'Start Date *'}</label>
              <input type="date" value={contractForm.start_date} onChange={(e) => setContractForm({ ...contractForm, start_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
            </div>

            {/* تاريخ الانتهاء */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'تاريخ الانتهاء *' : 'End Date *'}</label>
              <input type="date" value={contractForm.end_date} onChange={(e) => setContractForm({ ...contractForm, end_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
            </div>

            {/* القيمة الإجمالية */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'القيمة الإجمالية (ر.س)' : 'Total Value (SAR)'}</label>
              <input type="number" value={contractForm.total_value} onChange={(e) => setContractForm({ ...contractForm, total_value: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" min="0" />
            </div>

            {/* نسبة الخصم */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'نسبة الخصم (%)' : 'Discount (%)'}</label>
              <input type="number" value={contractForm.discount_percentage} onChange={(e) => setContractForm({ ...contractForm, discount_percentage: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" min="0" max="100" />
            </div>

            {/* حالة التعاقد */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'حالة التعاقد' : 'Status'}</label>
              <select value={contractForm.status} onChange={(e) => setContractForm({ ...contractForm, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white">
                {Object.entries(CONTRACT_STATUS).map(([key, val]) => (
                  <option key={key} value={key}>{isRTL ? val.label : val.labelEn}</option>
                ))}
              </select>
            </div>

            {/* شروط الدفع */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'شروط الدفع' : 'Payment Terms'}</label>
              <input type="text" value={contractForm.payment_terms} onChange={(e) => setContractForm({ ...contractForm, payment_terms: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                placeholder={isRTL ? 'مثال: الدفع كل ربع سنة' : 'e.g., Quarterly payments'} />
            </div>

            {/* العنوان */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'العنوان' : 'Address'}</label>
              <input type="text" value={contractForm.address} onChange={(e) => setContractForm({ ...contractForm, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
            </div>

            {/* ملاحظات */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'ملاحظات' : 'Notes'}</label>
              <textarea value={contractForm.notes} onChange={(e) => setContractForm({ ...contractForm, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white resize-none"
                rows={3} />
            </div>
          </div>

          {/* أزرار الحفظ/الإلغاء */}
          <div className={`flex items-center gap-3 mt-6 pt-5 border-t border-gray-200 dark:border-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button onClick={handleSaveContract} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50">
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {editingContract ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'حفظ' : 'Save')}
            </button>
            <button onClick={() => { setView('list'); setEditingContract(null); setContractForm(emptyContractForm) }}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* ===== CONTRACT DETAIL VIEW ===== */}
      {view === 'detail' && selectedContract && (
        <div className="space-y-6">
          {/* Contract Info Card */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm overflow-hidden">
            {/* Header gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-blue-200 text-xs font-bold mb-1">{selectedContract.contract_number}</p>
                  <h2 className="text-2xl font-extrabold">{selectedContract.organization_name}</h2>
                  <p className="text-blue-100 text-sm mt-1">{selectedContract.contact_person} {selectedContract.phone && `• ${selectedContract.phone}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedContract.status} map={CONTRACT_STATUS} isRTL={isRTL} />
                  <button onClick={() => openEditContract(selectedContract)}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition" title={isRTL ? 'تعديل' : 'Edit'}>
                    <Edit size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Contract Details Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-bold text-gray-400 mb-1">{isRTL ? 'فترة التعاقد' : 'Contract Period'}</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{formatDate(selectedContract.start_date)} → {formatDate(selectedContract.end_date)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 mb-1">{isRTL ? 'القيمة الإجمالية' : 'Total Value'}</p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">{formatCurrency(selectedContract.total_value)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 mb-1">{isRTL ? 'شروط الدفع' : 'Payment Terms'}</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedContract.payment_terms || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 mb-1">{isRTL ? 'الخصم' : 'Discount'}</p>
                <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{selectedContract.discount_percentage || 0}%</p>
              </div>
            </div>

            {/* Collection Progress */}
            <div className="px-6 pb-6">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Banknote size={18} className="text-emerald-600" />
                    {isRTL ? 'حالة التحصيل المالي' : 'Financial Collection Status'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedContract.collection_status} map={COLLECTION_STATUS} isRTL={isRTL} />
                    <button onClick={() => setShowPaymentModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all">
                      <CreditCard size={14} />
                      {isRTL ? 'تسجيل دفعة' : 'Record Payment'}
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      collectionPercent(selectedContract) >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                      collectionPercent(selectedContract) >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                      'bg-gradient-to-r from-red-500 to-rose-500'
                    }`}
                    style={{ width: `${collectionPercent(selectedContract)}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-white drop-shadow">
                    {collectionPercent(selectedContract).toFixed(1)}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400">{isRTL ? 'الإجمالي' : 'Total'}</p>
                    <p className="text-base font-extrabold text-gray-900 dark:text-white">{formatCurrency(selectedContract.total_value)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-emerald-500">{isRTL ? 'تم التحصيل' : 'Collected'}</p>
                    <p className="text-base font-extrabold text-emerald-600">{formatCurrency(selectedContract.collected_amount)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-red-400">{isRTL ? 'المتبقي' : 'Remaining'}</p>
                    <p className="text-base font-extrabold text-red-600">{formatCurrency(selectedContract.remaining_amount)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedContract.notes && (
              <div className="px-6 pb-6">
                <p className="text-xs font-bold text-gray-400 mb-1">{isRTL ? 'ملاحظات' : 'Notes'}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700">{selectedContract.notes}</p>
              </div>
            )}
          </div>

          {/* Letters Section */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Mail size={20} className="text-indigo-600" />
                {isRTL ? 'الخطابات والجوابات' : 'Letters & Correspondence'}
                <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full text-xs font-bold">{letters.length}</span>
              </h3>
              <button onClick={() => {
                setEditingLetter(null)
                setLetterForm({ ...emptyLetterForm, contract_id: selectedContract.id })
                setShowLetterForm(true)
              }}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all">
                <Plus size={14} />
                {isRTL ? 'خطاب جديد' : 'New Letter'}
              </button>
            </div>

            {letters.length === 0 ? (
              <div className="p-12 text-center">
                <Mail size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-bold">{isRTL ? 'لا توجد خطابات مسجلة' : 'No letters recorded'}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {letters.map((letter) => (
                  <div key={letter.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-sm mt-0.5">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{letter.subject}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Calendar size={11} /> {formatDate(letter.letter_date)}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {isRTL ? LETTER_TYPE[letter.letter_type]?.label : LETTER_TYPE[letter.letter_type]?.labelEn}
                            </span>
                            <StatusBadge status={letter.status} map={LETTER_STATUS} isRTL={isRTL} />
                          </div>
                          {letter.content && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">{letter.content}</p>}
                          {letter.reference_number && (
                            <p className="text-[11px] text-gray-400 mt-1">
                              {isRTL ? 'مرجع:' : 'Ref:'} <span className="font-mono font-bold text-blue-600">{letter.reference_number}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => {
                          setEditingLetter(letter)
                          setLetterForm({
                            contract_id: selectedContract.id,
                            subject: letter.subject || '',
                            content: letter.content || '',
                            letter_type: letter.letter_type || 'GENERAL',
                            status: letter.status || 'DRAFT',
                            letter_date: letter.letter_date?.split('T')[0] || '',
                            received_date: letter.received_date?.split('T')[0] || '',
                            response_date: letter.response_date?.split('T')[0] || '',
                            reference_number: letter.reference_number || '',
                            sender: letter.sender || '',
                            recipient: letter.recipient || '',
                            notes: letter.notes || ''
                          })
                          setShowLetterForm(true)
                        }} className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 transition">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteLetter(letter.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== LETTER FORM MODAL ===== */}
      {showLetterForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLetterForm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Mail size={20} className="text-indigo-600" />
                {editingLetter ? (isRTL ? 'تعديل الخطاب' : 'Edit Letter') : (isRTL ? 'خطاب جديد' : 'New Letter')}
              </h3>
              <button onClick={() => setShowLetterForm(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* عنوان الخطاب */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'عنوان الخطاب *' : 'Subject *'}</label>
                  <input type="text" value={letterForm.subject} onChange={(e) => setLetterForm({ ...letterForm, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
                </div>

                {/* نوع الخطاب */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'نوع الخطاب' : 'Letter Type'}</label>
                  <select value={letterForm.letter_type} onChange={(e) => setLetterForm({ ...letterForm, letter_type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white">
                    {Object.entries(LETTER_TYPE).map(([key, val]) => (
                      <option key={key} value={key}>{isRTL ? val.label : val.labelEn}</option>
                    ))}
                  </select>
                </div>

                {/* حالة الخطاب */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'الحالة' : 'Status'}</label>
                  <select value={letterForm.status} onChange={(e) => setLetterForm({ ...letterForm, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white">
                    {Object.entries(LETTER_STATUS).map(([key, val]) => (
                      <option key={key} value={key}>{isRTL ? val.label : val.labelEn}</option>
                    ))}
                  </select>
                </div>

                {/* تاريخ الخطاب */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'تاريخ الخطاب *' : 'Letter Date *'}</label>
                  <input type="date" value={letterForm.letter_date} onChange={(e) => setLetterForm({ ...letterForm, letter_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
                </div>

                {/* تاريخ الاستلام */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'تاريخ الاستلام' : 'Received Date'}</label>
                  <input type="date" value={letterForm.received_date} onChange={(e) => setLetterForm({ ...letterForm, received_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
                </div>

                {/* تاريخ الرد */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'تاريخ الرد' : 'Response Date'}</label>
                  <input type="date" value={letterForm.response_date} onChange={(e) => setLetterForm({ ...letterForm, response_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
                </div>

                {/* رقم المرجع */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'رقم المرجع' : 'Reference Number'}</label>
                  <input type="text" value={letterForm.reference_number} onChange={(e) => setLetterForm({ ...letterForm, reference_number: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
                </div>

                {/* المرسل */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'المرسل' : 'Sender'}</label>
                  <input type="text" value={letterForm.sender} onChange={(e) => setLetterForm({ ...letterForm, sender: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
                </div>

                {/* المستلم */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'المستلم' : 'Recipient'}</label>
                  <input type="text" value={letterForm.recipient} onChange={(e) => setLetterForm({ ...letterForm, recipient: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
                </div>

                {/* المحتوى */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'محتوى الخطاب' : 'Content'}</label>
                  <textarea value={letterForm.content} onChange={(e) => setLetterForm({ ...letterForm, content: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white resize-none"
                    rows={4} />
                </div>

                {/* ملاحظات */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'ملاحظات' : 'Notes'}</label>
                  <textarea value={letterForm.notes} onChange={(e) => setLetterForm({ ...letterForm, notes: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white resize-none"
                    rows={2} />
                </div>
              </div>
            </div>

            <div className={`p-5 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button onClick={handleSaveLetter} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50">
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {editingLetter ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'حفظ' : 'Save')}
              </button>
              <button onClick={() => setShowLetterForm(false)}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== PAYMENT MODAL ===== */}
      {showPaymentModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard size={20} className="text-emerald-600" />
                {isRTL ? 'تسجيل دفعة تحصيل' : 'Record Payment'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{selectedContract.organization_name}</p>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 flex justify-between text-sm">
                <span className="text-gray-500 font-bold">{isRTL ? 'المتبقي' : 'Remaining'}</span>
                <span className="font-extrabold text-red-600">{formatCurrency(selectedContract.remaining_amount)}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'المبلغ (ر.س) *' : 'Amount (SAR) *'}</label>
                <input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                  min="0" placeholder="0" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">{isRTL ? 'ملاحظات' : 'Notes'}</label>
                <textarea value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white resize-none"
                  rows={2} placeholder={isRTL ? 'رقم الشيك / التحويل...' : 'Check / Transfer number...'} />
              </div>
            </div>

            <div className={`p-5 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button onClick={handleRecordPayment} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50">
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Banknote size={16} />}
                {isRTL ? 'تسجيل الدفعة' : 'Record Payment'}
              </button>
              <button onClick={() => setShowPaymentModal(false)}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(${isRTL ? '-100px' : '100px'}); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
      `}</style>
    </div>
  )
}
