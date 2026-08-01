// src/components/scheduling/BookingCalendar.jsx
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import withDragAndDropRaw from 'react-big-calendar/lib/addons/dragAndDrop'
import { format, parse, startOfWeek, getDay, addDays, subDays, startOfMonth, endOfMonth, isSameDay } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import {
  Calendar as CalendarIcon,
  Clock,
  Filter,
  User,
  Building2,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  AlertCircle,
  X,
  CheckCircle2,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

import { appointmentsService, doctorsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

// إعداد localizer المواعيد واللغة
const locales = {
  ar: ar,
  en: enUS
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 6 }), // يبدأ الأسبوع بالسبت
  getDay,
  locales
})

// حل مشكلة CJS/ESM Interop لـ withDragAndDrop في Vite/Rollup
const withDragAndDrop = typeof withDragAndDropRaw === 'function'
  ? withDragAndDropRaw
  : (withDragAndDropRaw?.default || withDragAndDropRaw)

const DnDCalendar = typeof withDragAndDrop === 'function' ? withDragAndDrop(Calendar) : Calendar

// ألوان الحالات الموحدة (Standardized Color Mapping with Gradients)
const STATUS_COLORS = {
  SCHEDULED: { bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', text: '#ffffff', label: 'مجدول', dot: '#3b82f6' },
  ATTENDED: { bg: 'linear-gradient(135deg, #10b981, #047857)', text: '#ffffff', label: 'تم الحضور', dot: '#10b981' },
  IN_PROGRESS: { bg: 'linear-gradient(135deg, #f97316, #c2410c)', text: '#ffffff', label: 'جاري العمل', dot: '#f97316' },
  COMPLETED: { bg: 'linear-gradient(135deg, #64748b, #334155)', text: '#ffffff', label: 'مكتمل', dot: '#64748b' },
  CANCELLED: { bg: 'linear-gradient(135deg, #ef4444, #b91c1c)', text: '#ffffff', label: 'ملغي', dot: '#ef4444' },
  MISSED: { bg: 'linear-gradient(135deg, #991b1b, #450a0a)', text: '#ffffff', label: 'عدم حضور', dot: '#991b1b' }
}

// مكون تخصيص شكل كارت الموعد داخل الكالندر
const CustomEvent = ({ event }) => {
  const patientName = event.resource?.patient?.full_name_ar || 
    `${event.resource?.patient?.first_name || ''} ${event.resource?.patient?.last_name || ''}`.trim() || 
    event.title || 'مريض'
  const profileNum = event.resource?.patient?.profile_number

  const startTimeStr = event.start instanceof Date ? format(event.start, 'hh:mm a') : ''
  const endTimeStr = event.end instanceof Date ? format(event.end, 'hh:mm a') : ''

  return (
    <div className="flex flex-col h-full justify-start text-white overflow-hidden text-left rtl:text-right w-full leading-tight">
      <div className="flex items-center justify-between gap-1.5 w-full">
        <span className="font-extrabold text-[12px] truncate drop-shadow-sm">{patientName}</span>
        {profileNum && (
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-black/25 rounded-md shadow-sm shrink-0">
            {profileNum}
          </span>
        )}
      </div>
      {startTimeStr && (
        <div className="flex items-center gap-1 text-[11px] font-medium opacity-95 truncate mt-1">
          <span>🕒 {startTimeStr} - {endTimeStr}</span>
        </div>
      )}
    </div>
  )
}

export default function BookingCalendar() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { isOnline } = useServices()

  const [date, setDate] = useState(new Date())
  const [view, setView] = useState(Views.WEEK)
  const [shiftFilter, setShiftFilter] = useState('ALL') // ALL, MORNING, EVENING
  const [doctorId, setDoctorId] = useState('')
  const [doctorsList, setDoctorsList] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)

  // حالة modal تأكيد الـ Drag and Drop
  const [dragConfirmModal, setDragConfirmModal] = useState({
    isOpen: false,
    event: null,
    start: null,
    end: null
  })

  // ساعات العمل الرسمية بالكلينيك (8 صباحاً إلى 10 مساءً)
  const minTime = useMemo(() => {
    const d = new Date()
    d.setHours(8, 0, 0, 0)
    return d
  }, [])

  const maxTime = useMemo(() => {
    const d = new Date()
    d.setHours(22, 0, 0, 0)
    return d
  }, [])

  // ========== تحميل الأطباء والبيانات ==========
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        if (isOnline) {
          const docs = await doctorsService.getDoctors()
          setDoctorsList(docs || [])
        }
      } catch (err) {
        console.warn('Error loading doctors:', err)
      }
    }
    loadDoctors()
  }, [isOnline])

  // ========== حساب نطاق التواريخ المحددة ==========
  const dateRange = useMemo(() => {
    let from = new Date(date)
    let to = new Date(date)

    if (view === Views.MONTH) {
      from = startOfMonth(date)
      to = endOfMonth(date)
    } else if (view === Views.WEEK) {
      from = startOfWeek(date, { weekStartsOn: 6 })
      to = addDays(from, 6)
    } else {
      // DAY
      from = new Date(date)
      from.setHours(0, 0, 0, 0)
      to = new Date(date)
      to.setHours(23, 59, 59, 999)
    }

    return {
      from: from.toISOString(),
      to: to.toISOString()
    }
  }, [date, view])

  // ========== تحميل الجلسات من الـ API ==========
  const loadCalendarSessions = useCallback(async () => {
    setLoading(true)
    try {
      if (isOnline) {
        const data = await appointmentsService.getCalendarView(
          dateRange.from,
          dateRange.to,
          doctorId
        )
        setSessions(data || [])
      } else {
        loadLocalMockSessions()
      }
    } catch (error) {
      console.error('Error loading calendar sessions:', error)
      loadLocalMockSessions()
    } finally {
      setLoading(false)
    }
  }, [dateRange, doctorId, isOnline])

  const loadLocalMockSessions = () => {
    const localPatients = JSON.parse(localStorage.getItem('mcsos_patients_v2') || '[]')
    const mockEvents = localPatients.map((p, i) => {
      const startDate = addDays(new Date(), (i % 5) - 2)
      startDate.setHours(9 + (i % 6), 0, 0, 0)
      const endDate = new Date(startDate)
      endDate.setMinutes(45)

      return {
        id: p.id || `MOCK-${i}`,
        patient_id: p.id,
        patient: {
          first_name: p.first_name || p.nameAr || 'مريض',
          last_name: p.last_name || '',
          profile_number: p.profile_number || `PRF-00${i + 1}`
        },
        doctor: { name: 'د. أحمد علي' },
        session_date: startDate.toISOString(),
        status: i % 4 === 0 ? 'ATTENDED' : i % 4 === 1 ? 'SCHEDULED' : i % 4 === 2 ? 'IN_PROGRESS' : 'CANCELLED'
      }
    })
    setSessions(mockEvents)
  }

  useEffect(() => {
    loadCalendarSessions()
  }, [loadCalendarSessions])

  // ========== تحويل الجلسات لإيفنتات الكالندر ==========
  const events = useMemo(() => {
    return sessions
      .filter((s) => {
        if (!s.session_date) return false
        const sDate = new Date(s.session_date)
        const hour = sDate.getHours()

        // الفلترة حسب الفترة (Shift View)
        if (shiftFilter === 'MORNING') {
          return hour >= 8 && hour < 15
        } else if (shiftFilter === 'EVENING') {
          return hour >= 15 && hour < 22
        }
        return true
      })
      .map((s) => {
        let start = new Date(s.session_date)
        let end = s.end_time ? new Date(s.end_time) : new Date(start.getTime() + 45 * 60 * 1000)

        // تصحيح المواعيد المسجلة في منتصف الليل (قبل 8 صباحاً) لتظهر في الفترة الصباحية/المسائية بشكل صحيح
        if (start.getHours() < 8) {
          start.setHours(start.getHours() + 12)
          if (start.getHours() < 8) start.setHours(9, 0, 0, 0)
          end = new Date(start.getTime() + 45 * 60 * 1000)
        }

        const patientName = s.patient?.full_name_ar || `${s.patient?.first_name || ''} ${s.patient?.last_name || ''}`.trim() || 'مريض'
        const profileNum = s.patient?.profile_number || ''

        return {
          id: s.id,
          title: `${patientName} ${profileNum ? `(${profileNum})` : ''}`,
          start,
          end,
          resource: s,
          status: s.status || 'SCHEDULED'
        }
      })
  }, [sessions, shiftFilter])

  // ========== معالجة Drag and Drop ==========
  const handleEventDrop = ({ event, start, end }) => {
    setDragConfirmModal({
      isOpen: true,
      event,
      start,
      end
    })
  }

  // تأكيد السحب والإفلات
  const confirmReschedule = async () => {
    const { event, start } = dragConfirmModal
    if (!event || !start) return

    try {
      if (isOnline) {
        await appointmentsService.rescheduleAppointment(event.id, start.toISOString())
      }
      toast.success(`تم نقل الموعد إلى ${format(start, 'yyyy-MM-dd HH:mm')} بنجاح 🗓️`)
      setDragConfirmModal({ isOpen: false, event: null, start: null, end: null })
      loadCalendarSessions()
    } catch (error) {
      console.error('Reschedule error:', error)
      toast.error('حدث خطأ في إعادة الجدولة (تأكد من المواعيد المتاحة)')
    }
  }

  const statusColors = useMemo(() => ({
    SCHEDULED: { bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', text: '#ffffff', label: isRTL ? 'مجدول' : 'Scheduled', dot: '#3b82f6' },
    ATTENDED: { bg: 'linear-gradient(135deg, #10b981, #047857)', text: '#ffffff', label: isRTL ? 'تم الحضور' : 'Attended', dot: '#10b981' },
    IN_PROGRESS: { bg: 'linear-gradient(135deg, #f97316, #c2410c)', text: '#ffffff', label: isRTL ? 'جاري العمل' : 'In Progress', dot: '#f97316' },
    COMPLETED: { bg: 'linear-gradient(135deg, #64748b, #334155)', text: '#ffffff', label: isRTL ? 'مكتمل' : 'Completed', dot: '#64748b' },
    CANCELLED: { bg: 'linear-gradient(135deg, #ef4444, #b91c1c)', text: '#ffffff', label: isRTL ? 'ملغي' : 'Cancelled', dot: '#ef4444' },
    MISSED: { bg: 'linear-gradient(135deg, #991b1b, #450a0a)', text: '#ffffff', label: isRTL ? 'عدم حضور' : 'Missed', dot: '#991b1b' }
  }), [isRTL])

  // ========== تخصيص شكل كارت الموعد في الكالندر ==========
  const eventStyleGetter = (event) => {
    const colorConfig = statusColors[event.status] || statusColors.SCHEDULED
    return {
      style: {
        background: colorConfig.bg,
        color: colorConfig.text,
        borderRadius: '10px',
        border: 'none',
        padding: '3px 6px',
        boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
        cursor: 'grab'
      }
    }
  }

  return (
    <div className="space-y-5">
      {/* أدوات التحكم والفلترة لدعم الفترات والأطباء */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
            <CalendarIcon size={22} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
              {isRTL ? 'تقويم الجلسات والمواعيد' : 'Sessions & Appointments Calendar'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isRTL ? 'عرض تفاعلي يدعم السحب والإفلات وتغيير الشفتات للأطباء' : 'Interactive calendar with Drag & Drop and doctor shifts'}
            </p>
          </div>
        </div>

        {/* أدوات التحكم والفلاتر */}
        <div className="flex flex-wrap items-center gap-3">
          {/* اختيار الفترة (Morning / Evening Shift) */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700">
            <button
              onClick={() => setShiftFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                shiftFilter === 'ALL'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              {isRTL ? 'اليوم بالكامل' : 'Full Day'}
            </button>
            <button
              onClick={() => setShiftFilter('MORNING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                shiftFilter === 'MORNING'
                  ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              <Sun size={14} />
              {isRTL ? 'فترة صباحية' : 'Morning Shift'}
            </button>
            <button
              onClick={() => setShiftFilter('EVENING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                shiftFilter === 'EVENING'
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              <Moon size={14} />
              {isRTL ? 'فترة مسائية' : 'Evening Shift'}
            </button>
          </div>

          {/* فلتر الطبيب */}
          <div className="relative">
            <select
              className="py-2 px-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            >
              <option value="">{isRTL ? 'جميع الأطباء' : 'All Doctors'}</option>
              {doctorsList.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadCalendarSessions}
            disabled={loading}
            className="p-2 px-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5 transition text-xs font-bold shadow-sm"
            title={isRTL ? 'تحديث البيانات' : 'Refresh Data'}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{isRTL ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* شريط دلالات ألوان الحالات (Status Color Legend) */}
      <div className="flex flex-wrap items-center gap-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-3 px-5 rounded-2xl border border-gray-100 dark:border-gray-700/60 text-xs shadow-sm">
        <span className="font-extrabold text-gray-700 dark:text-gray-300">
          {isRTL ? 'حالات المواعيد:' : 'Session Statuses:'}
        </span>
        {Object.entries(statusColors).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: val.dot }}></span>
            <span className="text-gray-600 dark:text-gray-300">{val.label}</span>
          </div>
        ))}
      </div>

      {/* شاشة الكالندر الرئيسي */}
      <div className="bg-white dark:bg-gray-800/90 p-4 rounded-2xl border border-gray-200/70 dark:border-gray-700 shadow-xl min-h-[650px] text-gray-800 dark:text-gray-200">
        <DnDCalendar
          localizer={localizer}
          events={events}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          view={view}
          onView={(newView) => setView(newView)}
          onEventDrop={handleEventDrop}
          draggableAccessor={() => true}
          resizable={false}
          eventPropGetter={eventStyleGetter}
          components={{
            event: CustomEvent
          }}
          min={minTime}
          max={maxTime}
          culture={i18n.language === 'ar' ? 'ar' : 'en'}
          messages={{
            next: isRTL ? 'التالي' : 'Next',
            previous: isRTL ? 'السابق' : 'Previous',
            today: isRTL ? 'اليوم' : 'Today',
            month: isRTL ? 'شهر' : 'Month',
            week: isRTL ? 'أسبوع' : 'Week',
            day: isRTL ? 'يوم' : 'Day',
            agenda: isRTL ? 'جدول الأعمال' : 'Agenda',
            date: isRTL ? 'التاريخ' : 'Date',
            time: isRTL ? 'الوقت' : 'Time',
            event: isRTL ? 'الموعد' : 'Event',
            noEventsInRange: isRTL ? 'لا يوجد مواعيد مسجلة في هذه الفترة' : 'No appointments recorded in this range'
          }}
          style={{ height: 650 }}
        />
      </div>

      {/* Modal تأكيد نقل الموعد Drag & Drop */}
      {dragConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <AlertCircle size={20} className="text-blue-500" />
                {isRTL ? 'تأكيد نقل الموعد (Drag & Drop)' : 'Confirm Appointment Reschedule'}
              </h3>
              <button
                onClick={() => setDragConfirmModal({ isOpen: false, event: null, start: null, end: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-300">
              <p>
                {isRTL ? 'هل أنت تأكد من نقل موعد المريض:' : 'Are you sure you want to reschedule appointment for:'} <strong className="text-gray-900 dark:text-white">{dragConfirmModal.event?.title}</strong>؟
              </p>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-1 text-xs">
                <p>
                  📅 <span className="font-semibold">{isRTL ? 'الموعد الجديد:' : 'New Date & Time:'}</span> {dragConfirmModal.start && format(dragConfirmModal.start, 'yyyy-MM-dd HH:mm')}
                </p>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {isRTL ? '⚡ سيقوم النظام بالتحقق من تفرغ الطبيب والغرفة تلقائياً قبل التثبيت.' : '⚡ System will verify doctor and room availability before saving.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDragConfirmModal({ isOpen: false, event: null, start: null, end: null })}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmReschedule}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1"
              >
                <CheckCircle2 size={14} />
                {isRTL ? 'تأكيد النقل' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
