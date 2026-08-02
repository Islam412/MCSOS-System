// src/pages/DailyFollowUp.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calendar,
  Clock,
  UserCheck,
  UserX,
  PhoneCall,
  CheckCircle2,
  LogOut,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  User,
  Building2,
  Stethoscope,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { appointmentsService } from '../services/api'
import { useServices } from '../context/ServiceContext'

export default function DailyFollowUp() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { isOnline } = useServices()

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  // حالة modal تسجيل الغياب
  const [absentModal, setAbsentModal] = useState({
    isOpen: false,
    sessionId: null,
    patientName: '',
    reason: 'No Show'
  })

  // ========== تحميل بيانات المتابعة اليومية ==========
  const loadDailyFollowUp = async (date) => {
    setLoading(true)
    try {
      if (isOnline) {
        const res = await appointmentsService.getDailyFollowUp(date)
        if (res) {
          setData(res)
        } else {
          loadLocalData(date)
        }
      } else {
        loadLocalData(date)
      }
    } catch (error) {
      console.error('Error loading daily follow up:', error)
      loadLocalData(date)
    } finally {
      setLoading(false)
    }
  }

  // fallback بيانات محلياً
  const loadLocalData = (date) => {
    const localPatients = JSON.parse(localStorage.getItem('mcsos_patients_v2') || '[]')
    const mockSessions = localPatients.map((p, idx) => ({
      id: p.id || `S-${idx}`,
      session_date: `${date}T10:00:00`,
      status: idx % 3 === 0 ? 'ATTENDED' : idx % 3 === 1 ? 'SCHEDULED' : 'MISSED',
      patient_id: p.id,
      patient: {
        first_name: p.first_name || p.nameAr || 'مريض',
        last_name: p.last_name || '',
        phone: p.phone,
        whatsapp_number: p.whatsapp_number || p.phone,
        profile_number: p.profile_number || `PRF-00${idx + 1}`
      },
      doctor: { name: 'د. أحمد علي' },
      attendance: idx % 3 === 0 ? { status: 'ATTENDED', check_in_time: new Date().toISOString() } : null
    }))

    setData({
      date,
      summary: {
        total_sessions: mockSessions.length,
        attended_count: mockSessions.filter(s => s.status === 'ATTENDED').length,
        pending_count: mockSessions.filter(s => s.status === 'SCHEDULED').length,
        missed_count: mockSessions.filter(s => s.status === 'MISSED').length,
        follow_up_needed: mockSessions.filter(s => s.status === 'MISSED').length
      },
      sessions: mockSessions,
      follow_up_actions: mockSessions.filter(s => s.status === 'MISSED').map(s => ({
        session_id: s.id,
        patient_id: s.patient_id,
        patient_name: `${s.patient.first_name} ${s.patient.last_name}`.trim(),
        patient_phone: s.patient.phone,
        absence_reason: 'عدم حضور (No Show)',
        recommended_action: 'الاتصال بالمريض لإعادة الجدولة وتحديد سبب عدم الحضور'
      }))
    })
  }

  useEffect(() => {
    loadDailyFollowUp(selectedDate)
  }, [selectedDate])

  // ========== تسجيل دخول (Check-in) ==========
  const handleCheckIn = async (sessionId) => {
    setActionLoading(sessionId)
    try {
      if (isOnline) {
        await appointmentsService.checkInAppointment(sessionId)
      }
      toast.success('تم تسجيل دخول المريض بنجاح 🟢')
      loadDailyFollowUp(selectedDate)
    } catch (error) {
      console.error('Check-in error:', error)
      toast.error(error?.message?.includes('payment') || error?.message?.includes('تأكيد الدفع') ? '⛔ لا يمكن بدء جلسة التقييم إلا بعد اعتماد الدفع من الحسابات' : 'حدث خطأ في تسجيل الدخول')
    } finally {
      setActionLoading(null)
    }
  }

  // ========== تسجيل خروج (Check-out) ==========
  const handleCheckOut = async (sessionId) => {
    setActionLoading(sessionId)
    try {
      if (isOnline) {
        await appointmentsService.checkOutAppointment(sessionId)
      }
      toast.success('تم تسجيل خروج المريض وإنهاء الجلسة 🏁')
      loadDailyFollowUp(selectedDate)
    } catch (error) {
      console.error('Check-out error:', error)
      toast.error('حدث خطأ في تسجيل الخروج')
    } finally {
      setActionLoading(null)
    }
  }

  // ========== تأكيد دفعة التقييم (Finance Payment Verification) ==========
  const handleVerifyPayment = async (sessionId) => {
    setActionLoading(sessionId)
    try {
      if (isOnline) {
        await appointmentsService.verifyPayment(sessionId)
      }
      toast.success('تم اعتماد وتأكيد دفعة جلسة التقييم مالياً 💳🟢')
      loadDailyFollowUp(selectedDate)
    } catch (error) {
      console.error('Verify payment error:', error)
      toast.error('حدث خطأ أثناء اعتماد الدفعة')
    } finally {
      setActionLoading(null)
    }
  }

  // ========== تسجيل غياب (Mark Absent) ==========
  const submitAbsent = async () => {
    const { sessionId, reason } = absentModal
    if (!sessionId) return

    setActionLoading(sessionId)
    try {
      if (isOnline) {
        await appointmentsService.markAttendance(sessionId, {
          status: 'ABSENT',
          reason
        })
      }
      toast.success('تم تسجيل غياب المريض وإضافة التنبيه للمتابعة 🔴')
      setAbsentModal({ isOpen: false, sessionId: null, patientName: '', reason: 'No Show' })
      loadDailyFollowUp(selectedDate)
    } catch (error) {
      console.error('Absent error:', error)
      toast.error('حدث خطأ في تسجيل الغياب')
    } finally {
      setActionLoading(null)
    }
  }

  const summary = data?.summary || {
    total_sessions: 0,
    attended_count: 0,
    pending_count: 0,
    missed_count: 0,
    follow_up_needed: 0
  }

  const sessionsList = data?.sessions || []

  // تصفية الجلسات حسب التاب المختار والبحث
  const filteredSessions = sessionsList.filter((s) => {
    const patientName = `${s.patient?.first_name || ''} ${s.patient?.last_name || ''} ${s.patient?.full_name_ar || ''}`.toLowerCase()
    const profileNum = (s.patient?.profile_number || '').toLowerCase()
    const matchesSearch = patientName.includes(searchTerm.toLowerCase()) || profileNum.includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (activeTab === 'PENDING') return s.status === 'SCHEDULED' && s.attendance?.status !== 'ATTENDED' && s.attendance?.status !== 'ABSENT'
    if (activeTab === 'ATTENDED') return s.status === 'ATTENDED' || s.attendance?.status === 'ATTENDED'
    if (activeTab === 'MISSED') return s.status === 'MISSED' || s.attendance?.status === 'ABSENT'
    return true
  })

  return (
    <div className="space-y-6">
      {/* الهيدر واختيار التاريخ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="text-blue-600 dark:text-blue-400" size={28} />
            {isRTL ? 'شاشة المتابعة اليومية للجلسات' : 'Daily Sessions Follow-Up'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isRTL ? 'إدارة الحضور والغياب، تسجيل وقت الدخول والخروج، وإجراءات المتابعة الميدانية' : 'Manage attendance, check-in/out records, and field operational tracking'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="date"
              className="py-2.5 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <button
            onClick={() => loadDailyFollowUp(selectedDate)}
            className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* كروت الإحصائيات (Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* إجمالي الجلسات */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold">إجمالي الجلسات</span>
            <Calendar size={18} className="text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary.total_sessions}
          </span>
        </div>

        {/* الحاضرون */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-semibold">تم الحضور (Attended)</span>
            <UserCheck size={18} />
          </div>
          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {summary.attended_count}
          </span>
        </div>

        {/* في الانتظار */}
        <div className="bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/40 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-semibold">في الانتظار (Pending)</span>
            <Clock size={18} />
          </div>
          <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {summary.pending_count}
          </span>
        </div>

        {/* لم يحضر */}
        <div className="bg-rose-50/50 dark:bg-rose-950/20 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/40 shadow-sm">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
            <span className="text-xs font-semibold">لم يحضر (Missed)</span>
            <UserX size={18} />
          </div>
          <span className="text-2xl font-bold text-rose-700 dark:text-rose-300">
            {summary.missed_count}
          </span>
        </div>

        {/* إجراءات متابعة مطلوبة */}
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
            <span className="text-xs font-semibold">متابعات مطلوبة</span>
            <PhoneCall size={18} />
          </div>
          <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
            {summary.follow_up_needed}
          </span>
        </div>
      </div>

      {/* التبويبات والبحث */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              جميع الجلسات ({summary.total_sessions})
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'PENDING'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              في الانتظار ({summary.pending_count})
            </button>
            <button
              onClick={() => setActiveTab('ATTENDED')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'ATTENDED'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              تم الحضور ({summary.attended_count})
            </button>
            <button
              onClick={() => setActiveTab('MISSED')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'MISSED'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              لم يحضر ({summary.missed_count})
            </button>
            <button
              onClick={() => setActiveTab('FOLLOW_UP')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'FOLLOW_UP'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              📞 قائمة المتابعات المطلوبة ({summary.follow_up_needed})
            </button>
          </div>

          {/* حقل البحث */}
          <div className="relative min-w-[240px]">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث باسم المريض أو كود الملف..."
              className="w-full pr-9 pl-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* قائمة الجلسات */}
        {activeTab !== 'FOLLOW_UP' ? (
          filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
              لا يوجد جلسات مطابقة في هذا التصنيف لهذا اليوم
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {filteredSessions.map((session) => {
                const patientName = session.patient?.full_name_ar || `${session.patient?.first_name || ''} ${session.patient?.last_name || ''}`.trim() || 'مريض'
                const profileNum = session.patient?.profile_number || 'غير متوفر'
                const doctorName = session.doctor?.name || 'غير محدد'
                const roomName = session.room?.name || 'غرفة العامة'
                const isAttended = session.status === 'ATTENDED' || session.attendance?.status === 'ATTENDED'
                const isMissed = session.status === 'MISSED' || session.attendance?.status === 'ABSENT'

                return (
                  <div key={session.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 px-3 rounded-xl transition-colors">
                    {/* معلومات المريض والجلسة */}
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-xl ${
                        isAttended ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                        isMissed ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' :
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                      }`}>
                        <User size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                            {patientName}
                          </h3>
                          <span className="text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md">
                            {profileNum}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Stethoscope size={13} className="text-gray-400" />
                            {doctorName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 size={13} className="text-gray-400" />
                            {roomName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={13} className="text-gray-400" />
                            {new Date(session.session_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* طوابع الوقت الدخول والخروج */}
                        {(session.attendance?.check_in_time || session.attendance?.check_out_time) && (
                          <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1.5 bg-gray-100 dark:bg-gray-900/60 px-2.5 py-1 rounded-lg w-fit">
                            {session.attendance?.check_in_time && (
                              <span>🟢 دخول: {new Date(session.attendance.check_in_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                            {session.attendance?.check_out_time && (
                              <span>🏁 خروج: {new Date(session.attendance.check_out_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                          </div>
                        )}

                        {isMissed && (
                          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
                            سبب الغياب: {session.attendance?.reason || session.absence_reason || 'عدم حضور (No Show)'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* الأزرار والإجراءات */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      {!isAttended && !isMissed && (
                        session.session_type === 'ASSESSMENT' && !session.payment_verified ? (
                          <button
                            onClick={() => handleVerifyPayment(session.id)}
                            disabled={actionLoading === session.id}
                            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md animate-pulse"
                            title="يتطلب تأكيد الدفع من الإدارة المالية قبل تسجيل الدخول"
                          >
                            💳 تأكيد دفع التقييم
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCheckIn(session.id)}
                            disabled={actionLoading === session.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 size={14} />
                            تسجيل دخول
                          </button>
                        )
                      )}

                      {isAttended && !session.attendance?.check_out_time && (
                        <button
                          onClick={() => handleCheckOut(session.id)}
                          disabled={actionLoading === session.id}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <LogOut size={14} />
                          تسجيل خروج
                        </button>
                      )}

                      {!isMissed && (
                        <button
                          onClick={() => setAbsentModal({
                            isOpen: true,
                            sessionId: session.id,
                            patientName,
                            reason: 'No Show'
                          })}
                          disabled={actionLoading === session.id}
                          className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <UserX size={14} />
                          تسجيل غياب
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          /* قائمة المتابعة والاتصالات المطلوبة */
          <div className="space-y-3">
            {(data?.follow_up_actions || []).length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
                🎉 لا يوجد حالات تحتاج لمتابعة في هذا اليوم
              </div>
            ) : (
              data.follow_up_actions.map((act, i) => (
                <div key={i} className="p-4 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-rose-600" />
                      <span className="font-bold text-sm text-gray-900 dark:text-white">{act.patient_name}</span>
                      <span className="text-xs text-rose-600 font-semibold">({act.absence_reason})</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      💡 إجراء المتابعة: {act.recommended_action}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${act.patient_phone}`}
                      className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <PhoneCall size={13} className="text-blue-500" />
                      اتصال ({act.patient_phone || 'لا يوجد رقم'})
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal تسجيل الغياب وتحديد السبب */}
      {absentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <UserX size={20} className="text-rose-500" />
                تسجيل غياب مريض
              </h3>
              <button
                onClick={() => setAbsentModal({ isOpen: false, sessionId: null, patientName: '', reason: 'No Show' })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              المريض: <strong className="text-gray-900 dark:text-white">{absentModal.patientName}</strong>
            </p>

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                اختر سبب عدم الحضور <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full py-2.5 px-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={absentModal.reason}
                onChange={(e) => setAbsentModal({ ...absentModal, reason: e.target.value })}
              >
                <option value="No Show">لم يحضر بدون إشعار (No Show)</option>
                <option value="Patient Cancelled">اعتذار المريض (Patient Cancelled)</option>
                <option value="Emergency">ظرف طارئ للمريض (Emergency)</option>
                <option value="Doctor Unavailable">عدم تفرغ الطبيب (Doctor Unavailable)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAbsentModal({ isOpen: false, sessionId: null, patientName: '', reason: 'No Show' })}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={submitAbsent}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-500/20 transition-all"
              >
                تأكيد تسجيل الغياب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
