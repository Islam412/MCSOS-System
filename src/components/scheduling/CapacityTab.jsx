import { useState, useEffect } from 'react'
import { getToken } from '../../services/api/client'
import { useTranslation } from 'react-i18next'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RefreshCw, User, Search, CheckCircle, XCircle, Clock, Stethoscope, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { STATUS_COLORS } from '../../utils/statusColors'

function capacityVisual(state) {
  if (state === 'FULL') {
    return {
      barClass: 'bg-rose-500',
      badge: STATUS_COLORS.FULLY_BOOKED,
      labelKey: 'capacity_mgmt.status_full',
      fallback: '🔴 ممتلئ بالكامل',
    }
  }
  if (state === 'ALMOST_FULL') {
    return {
      barClass: 'bg-amber-500',
      badge: STATUS_COLORS.PACKAGE_ENDING_SOON,
      labelKey: 'capacity_mgmt.status_almost_full',
      fallback: '🟡 شارف على الامتلاء',
    }
  }
  return {
    barClass: 'bg-emerald-500',
    badge: STATUS_COLORS.AVAILABLE,
    labelKey: 'capacity_mgmt.status_available',
    fallback: '🟢 متاح (سعة شاغرة)',
  }
}

function aggregateDoctors(rows, thresholds) {
  const capped = (rows || []).filter((r) => r.limit != null)
  if (capped.length === 0) {
    return { used: 0, limit: null, remaining: null, pct: 0, state: 'AVAILABLE' }
  }
  const used = capped.reduce((s, r) => s + r.used, 0)
  const limit = capped.reduce((s, r) => s + r.limit, 0)
  const pct = Math.min(100, Math.round((used / limit) * 100))
  let state = 'AVAILABLE'
  if (pct >= thresholds.full_pct) state = 'FULL'
  else if (pct >= thresholds.warn_pct) state = 'ALMOST_FULL'
  return { used, limit, remaining: Math.max(0, limit - used), pct, state }
}

function applyThresholdState(row, thresholds) {
  if (row.limit == null) return { ...row, pct: 0, state: 'AVAILABLE', remaining: null }
  const pct = Math.min(100, Math.round((row.used / row.limit) * 100))
  let state = 'AVAILABLE'
  if (pct >= thresholds.full_pct) state = 'FULL'
  else if (pct >= thresholds.warn_pct) state = 'ALMOST_FULL'
  return { ...row, pct, state, remaining: Math.max(0, row.limit - row.used) }
}

export default function CapacityTab() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [doctors, setDoctors] = useState([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'reserved', 'available'
  const [slots, setSlots] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [capacityOverview, setCapacityOverview] = useState(null)
  const [capacitySettings, setCapacitySettings] = useState({
    centerMax: '',
    warnPct: '80',
    fullPct: '100',
  })
  const [savingSettings, setSavingSettings] = useState(false)

  const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`
  const userRole = (() => {
    try {
      const raw = localStorage.getItem('mcsos_user')
      return raw ? JSON.parse(raw).role : null
    } catch {
      return null
    }
  })()

  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('day')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    fetchDoctors()
  }, [])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    fetchData()
  }, [selectedDate, selectedDoctorId, debouncedSearch, dateFilter])

  const fetchDoctors = async () => {
    const token = getToken()
    try {
      const res = await fetch(`${API_BASE}/doctors?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setDoctors(data.data || data)
      }
    } catch (err) {
      console.error('Failed to fetch doctors', err)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    const token = getToken()
    try {
      // If there is a search query, search globally in sessions
      if (debouncedSearch.trim().length > 0) {
        const res = await fetch(`${API_BASE}/sessions?limit=100&search=${encodeURIComponent(debouncedSearch)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          // Map sessions to slot format
          const formatted = (data.data || data).map(s => ({
            id: s.slot_id || s.id,
            start_time: s.session_date,
            end_time: s.session_date,
            doctor: s.doctor,
            service: s.service || { name: isRTL ? 'جلسة علاجية' : 'Treatment Session' },
            booked_count: 1,
            capacity: 1,
            is_available: false,
            session: s
          }))
          setSlots(formatted)
        }
        setLoading(false)
        return
      }

      // Calculate from and to based on dateFilter
      let from, to;
      if (dateFilter === 'day') {
        from = `${selectedDate}T00:00:00.000Z`;
        to = `${selectedDate}T23:59:59.999Z`;
      } else if (dateFilter === 'week') {
        const start = new Date(selectedDate);
        start.setDate(start.getDate() - start.getDay()); // Sunday as start
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        from = `${start.toISOString().split('T')[0]}T00:00:00.000Z`;
        to = `${end.toISOString().split('T')[0]}T23:59:59.999Z`;
      } else if (dateFilter === 'month') {
        const d = new Date(selectedDate);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        // Add padding to ensure local time is roughly captured
        start.setMinutes(start.getMinutes() - start.getTimezoneOffset());
        end.setMinutes(end.getMinutes() - end.getTimezoneOffset());
        from = `${start.toISOString().split('T')[0]}T00:00:00.000Z`;
        to = `${end.toISOString().split('T')[0]}T23:59:59.999Z`;
      } else if (dateFilter === 'all') {
        from = null;
        to = null;
      }

      let slotsUrl = `${API_BASE}/scheduling/slots?`;
      if (from) slotsUrl += `from=${from}&to=${to}&`;
      if (selectedDoctorId) {
        slotsUrl += `doctor_id=${selectedDoctorId}&`;
      }

      let sessionsUrl = `${API_BASE}/sessions?limit=500&`;
      if (from) sessionsUrl += `from=${from}&to=${to}&`;
      if (selectedDoctorId) {
        sessionsUrl += `doctor_id=${selectedDoctorId}&`;
      }

      const overviewPromise =
        dateFilter === 'day' && debouncedSearch.trim().length === 0
          ? fetch(`${API_BASE}/capacity/overview?date=${selectedDate}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve(null)

      const [slotsRes, sessionsRes, overviewRes] = await Promise.all([
        fetch(slotsUrl, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(sessionsUrl, { headers: { 'Authorization': `Bearer ${token}` } }),
        overviewPromise,
      ])

      if (overviewRes?.ok) {
        setCapacityOverview(await overviewRes.json())
      } else if (dateFilter !== 'day') {
        setCapacityOverview(null)
      }

      let slotsData = []
      let sessionsData = []

      if (slotsRes.ok) {
        slotsData = await slotsRes.json()
      }
      if (sessionsRes.ok) {
        const sessionResJson = await sessionsRes.json()
        sessionsData = sessionResJson.data || sessionResJson
      }

      // Merge slots with sessions
      const merged = slotsData.map(slot => {
        const session = sessionsData.find(s => s.slot_id === slot.id)
        const doctor = doctors.find(d => d.id === slot.doctor_id)
        return {
          ...slot,
          doctor,
          session
        }
      })

      // Add any sessions that don't have matching slots (legacy or manual bookings)
      sessionsData.forEach(session => {
        if (!merged.find(m => m.session?.id === session.id)) {
          merged.push({
            id: session.slot_id || session.id,
            start_time: session.session_date,
            end_time: session.session_date,
            doctor: session.doctor || doctors.find(d => d.id === session.doctor_id),
            service: session.service || { name: isRTL ? 'جلسة علاجية' : 'Treatment Session' },
            booked_count: 1,
            capacity: 1,
            is_available: false,
            session: session
          })
        }
      })

      // Sort by start_time to keep the display chronological
      merged.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

      setSlots(merged)
    } catch (err) {
      console.error('Failed to fetch capacity data', err)
      toast.error(isRTL ? 'فشل تحميل البيانات' : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handlePrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const filteredSlots = slots.filter(slot => {
    if (filterType === 'reserved') {
      return slot.booked_count > 0 || slot.session
    }
    if (filterType === 'available') {
      return slot.booked_count === 0 && !slot.session
    }
    return true
  })

  // Pagination logic
  useEffect(() => {
    setCurrentPage(1)
  }, [filterType, searchQuery, selectedDate, selectedDoctorId, dateFilter])

  const totalPages = Math.ceil(filteredSlots.length / itemsPerPage)
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage
  const indexOfLastItem = currentPage * itemsPerPage
  const currentItems = filteredSlots.slice(indexOfFirstItem, indexOfLastItem)

  const thresholds = capacityOverview?.thresholds ?? { warn_pct: 80, full_pct: 100 }
  const centerRow = capacityOverview?.center
    ? applyThresholdState(capacityOverview.center, thresholds)
    : { used: 0, limit: null, remaining: null, pct: 0, state: 'AVAILABLE' }

  const doctorRow = aggregateDoctors(capacityOverview?.doctors ?? [], thresholds)

  const roomPeak = (capacityOverview?.rooms ?? []).reduce(
    (best, r) => {
      const row = applyThresholdState(r, thresholds)
      return row.pct > best.pct ? row : best
    },
    { used: 0, limit: null, remaining: null, pct: 0, state: 'AVAILABLE' },
  )

  const renderAlertBadge = (state) => {
    const visual = capacityVisual(state)
    const label = isRTL ? visual.badge.labelAr : visual.badge.labelEn
    return (
      <span className={`px-2.5 py-1 text-xs font-black rounded-full border shadow-xs ${visual.badge.colorClass}`}>
        {t(visual.labelKey, visual.fallback)} — {label}
      </span>
    )
  }

  const loadCapacitySettings = async () => {
    if (userRole !== 'ADMIN') return
    const token = getToken()
    const keys = [
      'capacity.center.max_sessions_per_day',
      'capacity.warn_threshold_pct',
      'capacity.full_threshold_pct',
    ]
    try {
      const values = await Promise.all(
        keys.map((key) =>
          fetch(`${API_BASE}/settings/${encodeURIComponent(key)}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => (r.ok ? r.json() : { value: '' })),
        ),
      )
      setCapacitySettings({
        centerMax: values[0]?.value ?? '',
        warnPct: values[1]?.value ?? '80',
        fullPct: values[2]?.value ?? '100',
      })
    } catch (_) {}
  }

  useEffect(() => {
    loadCapacitySettings()
  }, [])

  const saveCapacitySettings = async () => {
    setSavingSettings(true)
    const token = getToken()
    const entries = [
      ['capacity.center.max_sessions_per_day', capacitySettings.centerMax],
      ['capacity.warn_threshold_pct', capacitySettings.warnPct],
      ['capacity.full_threshold_pct', capacitySettings.fullPct],
    ]
    try {
      await Promise.all(
        entries.map(([key, value]) =>
          fetch(`${API_BASE}/settings/${encodeURIComponent(key)}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ value: String(value ?? '') }),
          }),
        ),
      )
      toast.success(isRTL ? 'تم حفظ إعدادات السعة' : 'Capacity settings saved')
      fetchData()
    } catch {
      toast.error(isRTL ? 'فشل حفظ الإعدادات' : 'Failed to save settings')
    } finally {
      setSavingSettings(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isRTL ? 'متابعة السعة والحجوزات' : 'Capacity & Reservations Tracker'}
            </h2>
          </div>
          
          {/* Filter Type Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-200/50 dark:border-gray-800/30">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterType === 'all'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {isRTL ? 'الكل' : 'All Slots'}
            </button>
            <button
              onClick={() => setFilterType('reserved')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterType === 'reserved'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {isRTL ? 'المحجوزة فقط' : 'Reserved Only'}
            </button>
            <button
              onClick={() => setFilterType('available')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterType === 'available'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {isRTL ? 'المتاحة فقط' : 'Available Only'}
            </button>
          </div>
        </div>

        {/* Date Quick Filters */}
        <div className="flex justify-end mb-4">
          <div className="flex bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-200/50 dark:border-gray-800/30">
            {['day', 'week', 'month', 'all'].map(mode => (
              <button 
                key={mode}
                onClick={() => setDateFilter(mode)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  dateFilter === mode 
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {isRTL ? (
                  mode === 'day' ? 'يوم' : mode === 'week' ? 'أسبوع' : mode === 'month' ? 'شهر' : 'الكل'
                ) : (
                  mode === 'day' ? 'Day' : mode === 'week' ? 'Week' : mode === 'month' ? 'Month' : 'All Time'
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4 items-center">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'بحث باسم المريض، كود المريض، أو الطبيب...' : 'Search patient, code, or doctor...'}
              className={`w-full py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isRTL ? 'pr-10 pl-16' : 'pl-10 pr-16'}`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 ${isRTL ? 'left-3' : 'right-4'}`}
              >
                {isRTL ? 'إلغاء' : 'Clear'}
              </button>
            )}
          </div>

          {/* Doctor Dropdown */}
          <div>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              disabled={searchQuery.trim().length > 0}
              className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
            >
              <option value="">{isRTL ? 'كل الأطباء' : 'All Doctors'}</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Date Picker (Only if no search query) */}
          <div className="flex items-center bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm disabled:opacity-50">
            <button
              onClick={handlePrevDay}
              disabled={searchQuery.trim().length > 0 || dateFilter === 'all'}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 border-r border-gray-200 dark:border-gray-700 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={searchQuery.trim().length > 0 || dateFilter === 'all'}
              className="w-full p-2 border-0 bg-transparent text-sm font-bold text-center dark:text-white focus:ring-0 outline-none cursor-pointer disabled:cursor-not-allowed"
            />
            <button
              onClick={handleNextDay}
              disabled={searchQuery.trim().length > 0 || dateFilter === 'all'}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 border-l border-gray-200 dark:border-gray-700 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      </div>

      {userRole === 'ADMIN' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-lg">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">
            {isRTL ? 'إعدادات سعة المركز' : 'Centre capacity settings'}
          </h3>
          <div className="grid gap-4 md:grid-cols-4">
            <input
              type="number"
              min={1}
              placeholder={isRTL ? 'حد المركز اليومي (فارغ=بلا حد)' : 'Centre daily cap (empty=∞)'}
              className="p-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 text-sm"
              value={capacitySettings.centerMax}
              onChange={(e) => setCapacitySettings({ ...capacitySettings, centerMax: e.target.value })}
            />
            <input
              type="number"
              min={1}
              max={100}
              className="p-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 text-sm"
              value={capacitySettings.warnPct}
              onChange={(e) => setCapacitySettings({ ...capacitySettings, warnPct: e.target.value })}
            />
            <input
              type="number"
              min={1}
              max={100}
              className="p-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 text-sm"
              value={capacitySettings.fullPct}
              onChange={(e) => setCapacitySettings({ ...capacitySettings, fullPct: e.target.value })}
            />
            <button
              type="button"
              onClick={saveCapacitySettings}
              disabled={savingSettings}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50"
            >
              {isRTL ? 'حفظ' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Sections 9 & 10: Capacity Management & Capacity Alerts Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Doctor Capacity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">{t('capacity_mgmt.doctor_capacity', 'سعة الأطباء اليومية')}</p>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                {doctorRow.used} /{' '}
                <span className="text-sm font-semibold text-gray-400">
                  {doctorRow.limit ?? '∞'} {t('capacity_mgmt.patients_per_day', 'مريض / اليوم')}
                </span>
              </h3>
            </div>
            {renderAlertBadge(doctorRow.state)}
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-400">
              <span>{t('capacity_mgmt.current_occupancy', 'الإشغال الحالي')}: {doctorRow.pct}%</span>
              <span>{t('capacity_mgmt.remaining_capacity', 'المتبقي')}: {doctorRow.remaining ?? '∞'}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${capacityVisual(doctorRow.state).barClass}`}
                style={{ width: `${doctorRow.pct}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Room Capacity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">{t('capacity_mgmt.room_capacity', 'سعة الغرف والعيادات')}</p>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                {roomPeak.used} /{' '}
                <span className="text-sm font-semibold text-gray-400">
                  {roomPeak.limit ?? '—'} {t('capacity_mgmt.sessions_per_room', 'جلسات بالتزامن')}
                </span>
              </h3>
            </div>
            {renderAlertBadge(roomPeak.state)}
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-400">
              <span>{t('capacity_mgmt.current_occupancy', 'الإشغال الحالي')}: {roomPeak.pct}%</span>
              <span>{t('capacity_mgmt.remaining_capacity', 'المتبقي')}: {roomPeak.remaining ?? '—'}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${capacityVisual(roomPeak.state).barClass}`}
                style={{ width: `${roomPeak.pct}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Center Overall Capacity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">{t('capacity_mgmt.center_capacity', 'السعة الإجمالية للمركز')}</p>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                {centerRow.used} /{' '}
                <span className="text-sm font-semibold text-gray-400">
                  {centerRow.limit ?? '∞'} {t('capacity_mgmt.total_center_cap', 'إجمالي استيعاب المركز')}
                </span>
              </h3>
            </div>
            {renderAlertBadge(centerRow.state)}
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-400">
              <span>{t('capacity_mgmt.current_occupancy', 'الإشغال الحالي')}: {centerRow.pct}%</span>
              <span>{t('capacity_mgmt.remaining_capacity', 'المتبقي')}: {centerRow.remaining ?? '∞'}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${capacityVisual(centerRow.state).barClass}`}
                style={{ width: `${centerRow.pct}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <RefreshCw className="animate-spin text-blue-500" size={32} />
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50">
            <CalendarIcon size={48} className="mx-auto text-gray-400 mb-3 opacity-50" />
            <p className="text-gray-500 font-medium">
              {isRTL ? 'لا توجد مواعيد تطابق الفلاتر المحددة' : 'No slots matching the filters found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400">
                  <th className="p-4">{isRTL ? 'الوقت والتاريخ' : 'Date & Time'}</th>
                  <th className="p-4">{isRTL ? 'الأخصائي/الطبيب' : 'Doctor'}</th>
                  <th className="p-4">{isRTL ? 'الخدمة' : 'Service'}</th>
                  <th className="p-4">{isRTL ? 'حالة الحجز' : 'Status'}</th>
                  <th className="p-4">{isRTL ? 'المريض' : 'Patient'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {currentItems.map(slot => {
                  const isReserved = slot.booked_count > 0 || slot.session
                  const formattedTime = new Date(slot.start_time).toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  const formattedDate = new Date(slot.start_time).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })

                  return (
                    <tr key={slot.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                      <td className="p-4 font-mono font-medium">
                        <div className="text-gray-900 dark:text-white font-bold">{formattedTime}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{formattedDate}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Stethoscope size={16} className="text-gray-400" />
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {slot.doctor?.name || (isRTL ? 'غير معروف' : 'Unknown Doctor')}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-gray-400" />
                          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800/30">
                            {slot.service?.name || (isRTL ? 'جلسة علاجية' : 'Treatment Session')}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {isReserved ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-lg border border-amber-100 dark:border-amber-800/30">
                            <Clock size={12} />
                            {isRTL ? 'محجوز' : 'Reserved'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                            <CheckCircle size={12} />
                            {isRTL ? 'متاح' : 'Available'}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {slot.session?.patient ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center rounded-full">
                              <User size={14} />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">
                                {slot.session.patient.first_name} {slot.session.patient.last_name}
                              </div>
                              <div className="text-[10px] text-gray-400 font-mono">
                                {slot.session.patient.patient_code}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            {isRTL ? 'لا يوجد مريض' : 'No patient'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredSlots.length > itemsPerPage && (
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 p-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isRTL ? 'إجمالي' : 'Total'}: <span className="font-bold text-gray-900 dark:text-white">{filteredSlots.length}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-bold text-gray-900 dark:text-white px-4">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
