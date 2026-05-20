import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Printer, Download, Plus, Trash2, Edit, Save, X, Calendar, Clock, Pill, Stethoscope, User, Phone, Mail, MapPin, Building, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PrescriptionManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language

  const [prescriptions, setPrescriptions] = useState([])
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [loading, setLoading] = useState(true)

  // بيانات العيادة/الطبيب
  const [clinicInfo, setClinicInfo] = useState({
    nameAr: 'مركز الطب الحديث',
    nameEn: 'Modern Medical Center',
    addressAr: 'شارع الملك فهد، الرياض، المملكة العربية السعودية',
    addressEn: 'King Fahd Road, Riyadh, Saudi Arabia',
    phone: '+966 12 345 6789',
    email: 'info@modernmedical.com',
    logo: ''
  })

  const [doctorInfo, setDoctorInfo] = useState({
    nameAr: 'د. أحمد محمد علي',
    nameEn: 'Dr. Ahmed Mohamed Ali',
    specializationAr: 'استشاري جراحة العظام',
    specializationEn: 'Orthopedic Consultant',
    licenseNumber: '123456',
    phone: '+966 50 123 4567',
    clinicHoursAr: 'السبت - الخميس: 9 صباحاً - 9 مساءً',
    clinicHoursEn: 'Sat - Thu: 9:00 AM - 9:00 PM',
    signature: ''
  })

  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientAge: '',
    patientPhone: '',
    patientGender: 'male',
    consultationDate: new Date().toISOString().split('T')[0],
    followUpDate: '',
    diagnosis: '',
    notes: '',
    medications: [
      { id: 1, name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]
  })

  const [patients, setPatients] = useState([])

  // تحميل المرضى من التخزين المحلي
  useEffect(() => {
    loadPatients()
    loadPrescriptions()
    loadClinicInfo()
    loadDoctorInfo()
  }, [])

  const loadPatients = () => {
    const saved = localStorage.getItem('mcsos_patients_v2')
    if (saved) {
      const allPatients = JSON.parse(saved)
      setPatients(allPatients)
    }
    setLoading(false)
  }

  const loadPrescriptions = () => {
    const saved = localStorage.getItem('mcsos_prescriptions')
    if (saved) {
      setPrescriptions(JSON.parse(saved))
    }
  }

  const loadClinicInfo = () => {
    const saved = localStorage.getItem('mcsos_clinic_info')
    if (saved) {
      setClinicInfo(JSON.parse(saved))
    }
  }

  const loadDoctorInfo = () => {
    const saved = localStorage.getItem('mcsos_doctor_info')
    if (saved) {
      setDoctorInfo(JSON.parse(saved))
    }
  }

  const savePrescriptions = (data) => {
    localStorage.setItem('mcsos_prescriptions', JSON.stringify(data))
    setPrescriptions(data)
  }

  const saveClinicInfo = (data) => {
    localStorage.setItem('mcsos_clinic_info', JSON.stringify(data))
    setClinicInfo(data)
  }

  const saveDoctorInfo = (data) => {
    localStorage.setItem('mcsos_doctor_info', JSON.stringify(data))
    setDoctorInfo(data)
  }

  const handleAddMedication = () => {
    const newId = Math.max(...formData.medications.map(m => m.id), 0) + 1
    setFormData({
      ...formData,
      medications: [...formData.medications, { id: newId, name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    })
  }

  const handleRemoveMedication = (id) => {
    if (formData.medications.length === 1) {
      toast.error('يجب وجود دواء واحد على الأقل')
      return
    }
    setFormData({
      ...formData,
      medications: formData.medications.filter(m => m.id !== id)
    })
  }

  const handleMedicationChange = (id, field, value) => {
    setFormData({
      ...formData,
      medications: formData.medications.map(m => m.id === id ? { ...m, [field]: value } : m)
    })
  }

  const handleSelectPatient = (patientId) => {
    const patient = patients.find(p => p.id == patientId)
    if (patient) {
      setFormData({
        ...formData,
        patientId: patient.id,
        patientName: currentLang === 'ar' ? patient.nameAr : patient.nameEn,
        patientAge: patient.age,
        patientPhone: patient.phone || ''
      })
    }
  }

  const handleSavePrescription = () => {
    if (!formData.patientName || !formData.diagnosis) {
      toast.error('الرجاء إدخال اسم المريض والتشخيص')
      return
    }

    const validMedications = formData.medications.filter(m => m.name.trim())
    if (validMedications.length === 0) {
      toast.error('الرجاء إضافة دواء واحد على الأقل')
      return
    }

    const newPrescription = {
      id: selectedPrescription?.id || Date.now(),
      ...formData,
      medications: validMedications,
      createdAt: selectedPrescription?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      prescriptionNumber: `RX-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
    }

    let updatedPrescriptions
    if (selectedPrescription) {
      updatedPrescriptions = prescriptions.map(p => p.id === selectedPrescription.id ? newPrescription : p)
    } else {
      updatedPrescriptions = [newPrescription, ...prescriptions]
    }

    savePrescriptions(updatedPrescriptions)
    setShowPrescriptionModal(false)
    resetForm()
    toast.success(selectedPrescription ? 'تم تحديث الروشتة بنجاح' : 'تم إضافة الروشتة بنجاح')
  }

  const handleEditPrescription = (prescription) => {
    setSelectedPrescription(prescription)
    setFormData({
      ...prescription,
      medications: prescription.medications.map(m => ({ ...m }))
    })
    setShowPrescriptionModal(true)
  }

  const handleDeletePrescription = (id) => {
    if (confirm('هل أنت متأكد من حذف هذه الروشتة؟')) {
      const updated = prescriptions.filter(p => p.id !== id)
      savePrescriptions(updated)
      toast.success('تم حذف الروشتة بنجاح')
    }
  }

  const resetForm = () => {
    setSelectedPrescription(null)
    setFormData({
      patientId: '',
      patientName: '',
      patientAge: '',
      patientPhone: '',
      patientGender: 'male',
      consultationDate: new Date().toISOString().split('T')[0],
      followUpDate: '',
      diagnosis: '',
      notes: '',
      medications: [
        { id: 1, name: '', dosage: '', frequency: '', duration: '', instructions: '' }
      ]
    })
  }

  const handlePrint = (prescription) => {
    setSelectedPrescription(prescription)
    setShowPrintPreview(true)
    setTimeout(() => {
      window.print()
      setShowPrintPreview(false)
    }, 100)
  }

  const getPatientName = (patient) => {
    if (currentLang === 'ar') return patient.nameAr
    return patient.nameEn
  }

  // نافذة الطباعة
  const PrintPrescription = ({ prescription }) => (
    <div className="max-w-4xl mx-auto" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{currentLang === 'ar' ? clinicInfo.nameAr : clinicInfo.nameEn}</h1>
        <p className="text-gray-600">{currentLang === 'ar' ? clinicInfo.addressAr : clinicInfo.addressEn}</p>
        <p className="text-gray-600">هاتف: {clinicInfo.phone} | بريد: {clinicInfo.email}</p>
        <div className="border-t-2 border-gray-300 my-4"></div>
        <h2 className="text-xl font-bold">روشتة طبية</h2>
        <p className="text-gray-500">رقم: {prescription.prescriptionNumber}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border p-3 rounded"><p className="font-bold">اسم المريض:</p><p>{prescription.patientName}</p></div>
        <div className="border p-3 rounded"><p className="font-bold">العمر:</p><p>{prescription.patientAge} سنة</p></div>
        <div className="border p-3 rounded"><p className="font-bold">تاريخ الاستشارة:</p><p>{prescription.consultationDate}</p></div>
        <div className="border p-3 rounded"><p className="font-bold">موعد المتابعة:</p><p>{prescription.followUpDate || 'غير محدد'}</p></div>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-2">التشخيص:</h3>
        <p className="border p-3 rounded bg-gray-50">{prescription.diagnosis}</p>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-2">الأدوية الموصوفة:</h3>
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-right">اسم الدواء</th>
              <th className="border p-2 text-right">الجرعة</th>
              <th className="border p-2 text-right">عدد المرات</th>
              <th className="border p-2 text-right">المدة</th>
              <th className="border p-2 text-right">تعليمات</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medications.map((med, idx) => (
              <tr key={idx}>
                <td className="border p-2">{med.name}</td>
                <td className="border p-2">{med.dosage}</td>
                <td className="border p-2">{med.frequency}</td>
                <td className="border p-2">{med.duration}</td>
                <td className="border p-2">{med.instructions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {prescription.notes && (
        <div className="mb-6">
          <h3 className="font-bold mb-2">ملاحظات:</h3>
          <p className="border p-3 rounded bg-gray-50">{prescription.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t">
        <div>
          <p className="font-bold">الطبيب المعالج:</p>
          <p>{currentLang === 'ar' ? doctorInfo.nameAr : doctorInfo.nameEn}</p>
          <p>{currentLang === 'ar' ? doctorInfo.specializationAr : doctorInfo.specializationEn}</p>
          <p>رخصة: {doctorInfo.licenseNumber}</p>
        </div>
        <div className="text-right">
          <div className="border-t-2 border-gray-400 w-48 ml-auto pt-2 mt-8">
            توقيع الطبيب
          </div>
        </div>
      </div>

      <div className="text-center mt-8 text-gray-400 text-sm">
        تم إنشاء هذه الروشتة بواسطة نظام المركز الطبي MCSOS
      </div>
    </div>
  )

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-white">جاري التحميل...</div></div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold gradient-text">الروشتات الطبية</h1>
          <p className="text-gray-400 mt-1">إدارة الروشتات والأدوية</p>
        </div>
        <button onClick={() => { resetForm(); setShowPrescriptionModal(true); }} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30">
          <Plus size={18} /> روشتة جديدة
        </button>
      </div>

      {/* قائمة الروشتات */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50">
          <h2 className="text-xl font-bold text-white">قائمة الروشتات</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <th className="px-6 py-3 text-sm text-gray-300">الرقم</th>
                <th className="px-6 py-3 text-sm text-gray-300">المريض</th>
                <th className="px-6 py-3 text-sm text-gray-300">التشخيص</th>
                <th className="px-6 py-3 text-sm text-gray-300">الأدوية</th>
                <th className="px-6 py-3 text-sm text-gray-300">التاريخ</th>
                <th className="px-6 py-3 text-sm text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {prescriptions.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">لا توجد روشتات</td></tr>
              ) : (
                prescriptions.map((pres) => (
                  <tr key={pres.id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 text-blue-400 font-mono text-sm">{pres.prescriptionNumber}</td>
                    <td className="px-6 py-4"><div className="font-semibold text-white">{pres.patientName}</div><div className="text-sm text-gray-400">{pres.patientAge} سنة</div></td>
                    <td className="px-6 py-4 text-gray-300 max-w-xs truncate">{pres.diagnosis}</td>
                    <td className="px-6 py-4 text-gray-300">{pres.medications.length} أدوية</td>
                    <td className="px-6 py-4 text-gray-400">{new Date(pres.consultationDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEditPrescription(pres)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"><Edit size={16} /></button>
                        <button onClick={() => handlePrint(pres)} className="p-1 text-green-400 hover:bg-green-500/20 rounded"><Printer size={16} /></button>
                        <button onClick={() => handleDeletePrescription(pres.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 size={16} /></button>
                      </div>
                    </td>
                   </tr>
                ))
              )}
            </tbody>
           </table>
        </div>
      </div>

      {/* Modal إضافة/تعديل روشتة */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{selectedPrescription ? 'تعديل روشتة' : 'روشتة جديدة'}</h2>
              <button onClick={() => setShowPrescriptionModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">المريض</label>
                <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientId} onChange={(e) => handleSelectPatient(e.target.value)}>
                  <option value="">اختر مريض</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{getPatientName(p)}</option>)}
                </select>
              </div>
              <div><label className="block text-sm text-gray-400 mb-1">اسم المريض *</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientName} onChange={(e) => setFormData({...formData, patientName: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">العمر</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientAge} onChange={(e) => setFormData({...formData, patientAge: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">رقم الجوال</label><input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientPhone} onChange={(e) => setFormData({...formData, patientPhone: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">تاريخ الاستشارة</label><input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.consultationDate} onChange={(e) => setFormData({...formData, consultationDate: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">موعد المتابعة</label><input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.followUpDate} onChange={(e) => setFormData({...formData, followUpDate: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">التشخيص *</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} /></div>
            </div>

            {/* الأدوية */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Pill size={18} className="text-green-400" /> الأدوية</h3>
                <button onClick={handleAddMedication} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm flex items-center gap-1"><Plus size={14} /> إضافة دواء</button>
              </div>
              <div className="space-y-3">
                {formData.medications.map((med, idx) => (
                  <div key={med.id} className="bg-gray-700/30 rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2 flex justify-between items-center">
                        <label className="text-sm text-gray-400">اسم الدواء *</label>
                        {idx > 0 && <button onClick={() => handleRemoveMedication(med.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>}
                      </div>
                      <div className="md:col-span-2"><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" placeholder="مثال: بروفين 500mg" value={med.name} onChange={(e) => handleMedicationChange(med.id, 'name', e.target.value)} /></div>
                      <div><label className="text-sm text-gray-400">الجرعة</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" placeholder="مثال: قرص واحد" value={med.dosage} onChange={(e) => handleMedicationChange(med.id, 'dosage', e.target.value)} /></div>
                      <div><label className="text-sm text-gray-400">عدد المرات</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" placeholder="مثال: 3 مرات يومياً" value={med.frequency} onChange={(e) => handleMedicationChange(med.id, 'frequency', e.target.value)} /></div>
                      <div><label className="text-sm text-gray-400">المدة</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" placeholder="مثال: 7 أيام" value={med.duration} onChange={(e) => handleMedicationChange(med.id, 'duration', e.target.value)} /></div>
                      <div className="md:col-span-2"><label className="text-sm text-gray-400">تعليمات الاستخدام</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="1" placeholder="تعليمات إضافية..." value={med.instructions} onChange={(e) => handleMedicationChange(med.id, 'instructions', e.target.value)} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-1">ملاحظات إضافية</label>
              <textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-700">
              <button onClick={handleSavePrescription} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30">حفظ</button>
              <button onClick={() => setShowPrescriptionModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الطباعة */}
      {showPrintPreview && selectedPrescription && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto p-8">
          <PrintPrescription prescription={selectedPrescription} />
          <div className="flex justify-center gap-4 mt-8 pb-8">
            <button onClick={() => window.print()} className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2"><Printer size={18} /> طباعة</button>
            <button onClick={() => setShowPrintPreview(false)} className="bg-gray-500 text-white px-6 py-2 rounded-lg">إغلاق</button>
          </div>
        </div>
      )}
    </div>
  )
}
