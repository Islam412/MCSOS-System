import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock, Users, Plus, Trash2, Save, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SchedulingEngine() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [bulkPattern, setBulkPattern] = useState('')
  const [slots, setSlots] = useState([])
  const [dynamicSlots, setDynamicSlots] = useState([])
  
  const doctors = [
    { id: 1, nameAr: 'د. أحمد علي', nameEn: 'Dr. Ahmed Ali', specializationAr: 'جراحة عظام', specializationEn: 'Orthopedic' },
    { id: 2, nameAr: 'د. منى حسن', nameEn: 'Dr. Mona Hassan', specializationAr: 'علاج طبيعي', specializationEn: 'Physical Therapy' },
    { id: 3, nameAr: 'د. خالد محمود', nameEn: 'Dr. Khaled Mahmoud', specializationAr: 'أعصاب', specializationEn: 'Neurology' },
  ]
  
  const bulkPatterns = [
    { id: 'sun_tue_thu', nameAr: 'الأحد - الثلاثاء - الخميس', nameEn: 'Sun - Tue - Thu' },
    { id: 'mon_wed_sat', nameAr: 'الإثنين - الأربعاء - السبت', nameEn: 'Mon - Wed - Sat' },
    { id: 'daily', nameAr: 'يومياً', nameEn: 'Daily' },
  ]
  
  const getDoctorName = (doctor) => {
    return isRTL ? doctor.nameAr : doctor.nameEn
  }
  
  const getPatternName = (pattern) => {
    const found = bulkPatterns.find(p => p.id === pattern)
    return found ? (isRTL ? found.nameAr : found.nameEn) : ''
  }
  
  const generateBulkSlots = () => {
    if (!selectedDoctor || !bulkPattern) {
      toast.error(t('scheduling.select_doctor_pattern'))
      return
    }
    
    const newSlot = {
      id: Date.now(),
      doctorId: selectedDoctor,
      doctorName: getDoctorName(doctors.find(d => d.id == selectedDoctor)),
      pattern: bulkPattern,
      patternName: getPatternName(bulkPattern),
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
    }
    
    setSlots([...slots, newSlot])
    toast.success(t('scheduling.bulk_generated'))
  }
  
  const generateDynamicSlots = () => {
    const newDynamicSlot = {
      id: Date.now(),
      doctorId: selectedDoctor,
      doctorName: getDoctorName(doctors.find(d => d.id == selectedDoctor)),
      date: new Date().toISOString().split('T')[0],
      availableSlots: 8,
      bookedSlots: 0
    }
    
    setDynamicSlots([...dynamicSlots, newDynamicSlot])
    toast.success(t('scheduling.dynamic_generated'))
  }
  
  const deleteSlot = (id, type) => {
    if (type === 'bulk') {
      setSlots(slots.filter(slot => slot.id !== id))
    } else {
      setDynamicSlots(dynamicSlots.filter(slot => slot.id !== id))
    }
    toast.success(t('scheduling.slot_deleted'))
  }
  
  return (
    <div className="space-y-6">
      <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          {t('scheduling.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('scheduling.subtitle')}</p>
      </div>
      
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-semibold mb-2">{t('scheduling.select_doctor')}</label>
          <select
            className="w-full p-2 border rounded-lg dark:bg-gray-900"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="">{t('scheduling.select_doctor')}</option>
            {doctors.map(doc => (
              <option key={doc.id} value={doc.id}>{getDoctorName(doc)}</option>
            ))}
          </select>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-semibold mb-2">{t('scheduling.bulk_pattern')}</label>
          <select
            className="w-full p-2 border rounded-lg dark:bg-gray-900"
            value={bulkPattern}
            onChange={(e) => setBulkPattern(e.target.value)}
          >
            <option value="">{t('scheduling.select_pattern')}</option>
            {bulkPatterns.map(pattern => (
              <option key={pattern.id} value={pattern.id}>{isRTL ? pattern.nameAr : pattern.nameEn}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={generateBulkSlots}
            className="flex-1 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Calendar size={18} />
            {t('scheduling.bulk_generate')}
          </button>
          <button
            onClick={generateDynamicSlots}
            className="flex-1 bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <Zap size={18} />
            {t('scheduling.dynamic_generate')}
          </button>
        </div>
      </div>
      
      {/* Bulk Slots */}
      {slots.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="text-blue-500" />
            {t('scheduling.bulk_slots')}
          </h2>
          <div className="space-y-3">
            {slots.map(slot => (
              <div key={slot.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div>
                  <p className="font-semibold">{slot.doctorName}</p>
                  <p className="text-sm text-gray-500">{slot.patternName}</p>
                  <p className="text-xs text-gray-400">{slot.startDate} → {slot.endDate}</p>
                </div>
                <button
                  onClick={() => deleteSlot(slot.id, 'bulk')}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Dynamic Slots */}
      {dynamicSlots.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="text-green-500" />
            {t('scheduling.dynamic_slots')}
          </h2>
          <div className="grid gap-3">
            {dynamicSlots.map(slot => (
              <div key={slot.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div>
                  <p className="font-semibold">{slot.doctorName}</p>
                  <p className="text-sm text-gray-500">{slot.date}</p>
                  <p className="text-xs text-gray-400">{t('scheduling.available')}: {slot.availableSlots - slot.bookedSlots} / {slot.availableSlots}</p>
                </div>
                <button
                  onClick={() => deleteSlot(slot.id, 'dynamic')}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {slots.length === 0 && dynamicSlots.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
          <Calendar size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">{t('scheduling.no_slots')}</p>
          <p className="text-sm text-gray-400">{t('scheduling.generate_first')}</p>
        </div>
      )}
    </div>
  )
}
