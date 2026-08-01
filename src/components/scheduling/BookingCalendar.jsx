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

// ألوان الحالات الموحدة (Standardized Color Mapping)
const STATUS_COLORS = {
  SCHEDULED: { bg: '#3b82f6', text: '#ffffff', label: 'مجدول (Blue)' },
  ATTENDED: { bg: '#10b981', text: '#ffffff', label: 'تم الحضور (Green)' },
  IN_PROGRESS: { bg: '#f97316', text: '#ffffff', label: 'جاري (Orange)' },
  COMPLETED: { bg: '#6b7280', text: '#ffffff', label: 'مكتمل (Gray)' },
  CANCELLED: { bg: '#ef4444', text: '#ffffff', label: 'ملغي (Red)' },
  MISSED: { bg: '#991b1b', text: '#ffffff', label: 'عدم حضور (Dark Red)' }
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
        const start = new Date(s.session_date)
        const end = s.end_time ? new Date(s.end_time) : new Date(start.getTime() + 45 * 60 * 1000)
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

  // ========== تخصيص شكل كارت الموعد في الكالندر ==========
  const eventStyleGetter = (event) => {
    const colorConfig = STATUS_COLORS[event.status] || STATUS_COLORS.SCHEDULED
    return {
      style: {
        backgroundColor: colorConfig.bg,
        color: colorConfig.text,
        borderRadius: '8px',
        opacity: 0.95,
        border: 'none',
        fontSize: '11px',
        fontWeight: '600',
        padding: '2px 6px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* الهيدر وفلاتر الفترات والأطباء */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="text-blue-600 dark:text-blue-400" size={28} />
            جدول المواعيد والكالندر
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            دعم العرض اليومي والأسبوعي والشهري مع خاصية السحب والإفلات (Drag & Drop) وفلاتر الشفتات
          </p>
        </div>

        {/* أدوات التحكم والفلاتر */}
        <div className="flex flex-wrap items-center gap-3">
          {/* اختيار الفترة (Morning / Evening Shift) */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
            <button
              onClick={() => setShiftFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                shiftFilter === 'ALL'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              اليوم بالكامل
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
              فترة صباحية
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
              فترة مسائية
            </button>
          </div>

          {/* فلتر الطبيب */}
          <div className="relative">
            <select
              className="py-2 px-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            >
              <option value="">جميع الأطباء</option>
              {doctorsList.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadCalendarSessions}
            className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* شريط دلالات ألوان الحالات (Status Color Legend) */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800 p-3 px-5 rounded-xl border border-gray-100 dark:border-gray-700 text-xs">
        <span className="font-bold text-gray-700 dark:text-gray-300">دلالات الحالات:</span>
        {Object.entries(STATUS_COLORS).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: val.bg }}></span>
            <span className="text-gray-600 dark:text-gray-400 font-medium">{val.label}</span>
          </div>
        ))}
      </div>

      {/* شاشة الكالندر الرئيسي */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm min-h-[650px] text-gray-800 dark:text-gray-200">
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
          min={minTime}
          max={maxTime}
          culture={i18n.language}
          messages={{
            next: 'التالي',
            previous: 'السابق',
            today: 'اليوم',
            month: 'شهر',
            week: 'أسبوع',
            day: 'يوم',
            agenda: 'جدول الأعمال',
            date: 'التاريخ',
            time: 'الوقت',
            event: 'الموعد',
            noEventsInRange: 'لا يوجد مواعيد مسجلة في هذه الفترة'
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
                تأكيد نقل الموعد (Drag & Drop)
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
                هل أنت تأكد من نقل موعد المريض: <strong className="text-gray-900 dark:text-white">{dragConfirmModal.event?.title}</strong>؟
              </p>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-1 text-xs">
                <p>
                  📅 <span className="font-semibold">الموعد الجديد:</span> {dragConfirmModal.start && format(dragConfirmModal.start, 'yyyy-MM-dd HH:mm')}
                </p>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                ⚡ سيقوم النظام بالتحقق من تفرغ الطبيب والغرفة تلقائياً قبل التثبيت.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDragConfirmModal({ isOpen: false, event: null, start: null, end: null })}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmReschedule}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1"
              >
                <CheckCircle2 size={14} />
                تأكيد النقل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
