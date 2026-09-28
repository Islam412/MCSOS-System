// src/components/scheduling/SessionDetailModal.jsx
import { useState, useEffect } from 'react'
import { confirmAlert } from '../../utils/confirmAlert'
import { X, Clock, Check, Play, Square, AlertTriangle, ShieldCheck, MapPin, User, Stethoscope, FileText, CreditCard, Printer, ClipboardCheck, Award, Package, RefreshCw, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function SessionDetailModal({ isOpen, onClose, session, onUpdate }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [submitting, setSubmitting] = useState(false)
  const [notes, setNotes] = useState({
    doctorNotes: session?.doctor_notes || '',
    receptionNotes: session?.reception_notes || ''
  })
  
  const [doctors, setDoctors] = useState([])
  const [rooms, setRooms] = useState([])
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [rescheduleData, setRescheduleData] = useState({
    doctorId: '',
    date: '',
    time: '',
    roomId: ''
  })
  
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelCustomNotes, setCancelCustomNotes] = useState('')

  const [evaluationData, setEvaluationData] = useState({
    diagnosis: '',
    goals: '',
    recommended_package: '12_sessions',
    weekly_sessions: '3'
  })

  const [showReAssessment, setShowReAssessment] = useState(false)
  const [reassessmentData, setReassessmentData] = useState({
    clinical_progress: '',
    decision: 'REPEAT',
    recommended_package: '12_sessions',
    range_of_motion: '',
    pain_score: '2',
    notes: ''
  })

  useEffect(() => {
    if (session) {
      const d = new Date(session.session_date)
      const hours = d.getHours().toString().padStart(2, '0')
      const minutes = d.getMinutes().toString().padStart(2, '0')
      setRescheduleData({
        doctorId: session.doctor?.id || session.doctor_id || '',
        date: d.toISOString().split('T')[0],
        time: `${hours}:${minutes}`,
        roomId: session.room?.id || session.room_id || ''
      })

      if (session.session_type === 'RE_ASSESSMENT') {
        setShowReAssessment(true)
      }

      if (session.evaluation_report) {
        try {
          const parsed = JSON.parse(session.evaluation_report)
          if (parsed && typeof parsed === 'object') {
            setEvaluationData(parsed)
            if (parsed.reassessment) {
              setReassessmentData(parsed.reassessment)
            }
          } else {
            setEvaluationData({ diagnosis: session.evaluation_report, goals: '', recommended_package: '12_sessions', weekly_sessions: '3' })
          }
        } catch (e) {
          setEvaluationData({ diagnosis: session.evaluation_report, goals: '', recommended_package: '12_sessions', weekly_sessions: '3' })
        }
      }
    }
  }, [session])

  useEffect(() => {
    if (isOpen) {
      fetchDoctorsAndRooms()
    }
  }, [isOpen])

  const fetchDoctorsAndRooms = async () => {
    const token = localStorage.getItem('mcsos_token')
    try {
      const docsRes = await fetch(`${API_BASE}/doctors?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (docsRes.ok) {
        const docsData = await docsRes.json()
        setDoctors(docsData.data || docsData)
      }

      const roomsRes = await fetch(`${API_BASE}/rooms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json()
        setRooms(roomsData)
      }
    } catch (error) {
      console.error('Error fetching doctors/rooms in modal:', error)
    }
  }

  const handleRescheduleConfirm = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      toast.error(isRTL ? 'الرجاء تحديد التاريخ والوقت' : 'Please select date and time')
      return
    }

    const [hours, minutes] = rescheduleData.time.split(':')
    const sessionDate = new Date(rescheduleData.date)
    sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    try {
      await handleAction('update', {
        doctor_id: rescheduleData.doctorId || null,
        room_id: rescheduleData.roomId || null,
        session_date: sessionDate.toISOString()
      })
      setIsRescheduling(false)
    } catch (error) {
      console.error(error)
    }
  }

  const userStr = localStorage.getItem('mcsos_user')
  const currentUser = userStr ? JSON.parse(userStr) : null
  const isAdmin = currentUser?.role === 'admin'

  if (!isOpen || !session) return null

  const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`

  const handleAction = async (actionType, body = {}) => {
    setSubmitting(true)
    const token = localStorage.getItem('mcsos_token')
    let url = `${API_BASE}/sessions/${session.id}`
    let method = 'PUT'

    if (actionType === 'confirm') {
      url = `${API_BASE}/sessions/${session.id}/confirm`
    } else if (actionType === 'start') {
      url = `${API_BASE}/sessions/${session.id}/start`
      method = 'POST'
    } else if (actionType === 'end') {
      url = `${API_BASE}/sessions/${session.id}/end`
      method = 'POST'
    } else if (actionType === 'cancel') {
      url = `${API_BASE}/sessions/${session.id}`
      method = 'PUT'
      body = { status: 'CANCELED', ...body }
    } else if (actionType === 'delete') {
      url = `${API_BASE}/sessions/${session.id}`
      method = 'DELETE'
    } else if (actionType === 'verify-payment') {
      url = `${API_BASE}/sessions/${session.id}/verify-payment`
      method = 'POST'
      body = { verifier_name: currentUser?.name || (isRTL ? 'مسؤول الإدارة المالية' : 'Finance Officer') }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: method !== 'DELETE' ? JSON.stringify(body) : undefined
      })

      if (!response.ok) {
        throw new Error('فشلت العملية')
      }

      const updatedSession = method === 'DELETE' ? null : await response.json()
      toast.success(isRTL ? 'تمت العملية بنجاح' : 'Operation successful')
      if (onUpdate) onUpdate(updatedSession)
      if (method === 'DELETE' || body.status === 'CANCELED') {
        onClose()
      }
    } catch (error) {
      toast.error(error.message || 'حدث خطأ أثناء التحديث')
    } finally {
      setSubmitting(false)
    }
  }

  const saveNotes = () => {
    handleAction('update', {
      doctor_notes: notes.doctorNotes,
      reception_notes: notes.receptionNotes
    })
  }

  const handleSaveEvaluation = async () => {
    setSubmitting(true)
    const token = localStorage.getItem('mcsos_token')
    try {
      const res = await fetch(`${API_BASE}/sessions/${session.id}/evaluation-report`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ evaluation_report: JSON.stringify(evaluationData) })
      })
      if (!res.ok) throw new Error('فشلت العملية')
      toast.success(isRTL ? 'تم حفظ واعتماد تقرير التقييم الطبي بنجاح 📋✨' : 'Evaluation report saved successfully!')
      const updated = await res.json()
      if (onUpdate) onUpdate(updated)
    } catch (err) {
      toast.error(isRTL ? 'حدث خطأ أثناء حفظ التقرير' : 'Failed to save evaluation report')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveReAssessment = async () => {
    setSubmitting(true)
    const token = localStorage.getItem('mcsos_token')
    try {
      const res = await fetch(`${API_BASE}/sessions/${session.id}/evaluation-report`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          evaluation_report: JSON.stringify({
            ...evaluationData,
            reassessment: reassessmentData,
            reassessment_saved_at: new Date().toISOString()
          })
        })
      })
      if (!res.ok) throw new Error('فشلت العملية')
      toast.success(isRTL ? 'تم حفظ واعتماد تقرير إعادة التقييم بنجاح 📋🩺' : 'Re-assessment report saved successfully!')
      const updated = await res.json()
      if (onUpdate) onUpdate(updated)
    } catch (err) {
      toast.error(isRTL ? 'حدث خطأ أثناء حفظ تقرير إعادة التقييم' : 'Failed to save re-assessment report')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrintReAssessment = () => {
    const pName = session.patient ? (session.patient.full_name_ar || session.patient.name || `${session.patient.first_name || ''} ${session.patient.last_name || ''}`.trim() || 'مريض') : 'N/A';
    const docName = session.doctor?.name || (isRTL ? 'طبيب التأهيل' : 'Rehab Doctor');
    const dateFormatted = new Date(session.session_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

    const packageMap = {
      '6_sessions': isRTL ? 'باقة التأهيل السريع (6 جلسات)' : 'Quick Rehab Package (6 Sessions)',
      '12_sessions': isRTL ? 'باقة التميز العلاجي (12 جلسة - مكثف)' : 'Premium Rehab Package (12 Sessions)',
      '24_sessions': isRTL ? 'باقة التأهيل الشامل والمتكامل (24 جلسة)' : 'Comprehensive Rehab Package (24 Sessions)',
      'hydrotherapy': isRTL ? 'باقة العلاج المائي الرياضي (Hydrotherapy)' : 'Hydrotherapy Sports Package',
      'spine_special': isRTL ? 'باقة علاج آلام الظهر والعمود الفقري المتخصصة' : 'Spinal Pain Specialized Therapy'
    };

    const decisionMap = {
      'REPEAT': isRTL ? 'تكرار نفس الباقة العلاجية لاستكمال التأهيل' : 'Repeat Same Package for Continued Therapy',
      'CHANGE': isRTL ? 'تغيير وتعديل الباقة لخطة علاجية جديدة' : 'Change/Modify to a New Treatment Package',
      'DISCHARGE': isRTL ? 'اكتمال الخطة العلاجية والتعافي الكامل (خروج)' : 'Complete Treatment & Discharge'
    };

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${isRTL ? 'ar' : 'en'}">
      <head>
        <title>${isRTL ? 'تقرير إعادة التقييم السريري' : 'Clinical Re-assessment Report'} - ${pName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&display=swap');
          body { font-family: 'Cairo', sans-serif; padding: 40px; color: #1e293b; background: #fff; line-height: 1.6; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 22px; font-weight: 800; color: #0d9488; }
          .subtitle { font-size: 13px; color: #64748b; }
          .box { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 25px; background: #f8fafc; }
          .title { font-size: 16px; font-weight: 800; color: #0f172a; border-bottom: 2px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 12px; }
          .label { font-size: 13px; color: #475569; font-weight: 600; }
          .value { font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 4px; background: #fff; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .decision-badge { background: #ccfbf1; color: #115e59; font-size: 16px; font-weight: 800; padding: 12px 18px; border-radius: 8px; border: 1px solid #99f6e4; display: inline-block; margin-top: 8px; }
          .footer { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 20px; border-top: 1px solid #cbd5e1; text-align: center; }
          .sig-box { width: 220px; }
          .sig-line { border-bottom: 1px solid #334155; margin: 40px 0 10px 0; }
          @media print { button { display: none; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">🏥 Medical Center Specialist Orthopedic Services</div>
            <div class="subtitle">المستشفى المتخصص للتأهيل والعلاج الطبيعي وجراحة العظام</div>
          </div>
          <div style="text-align: ${isRTL ? 'left' : 'right'}">
            <h2 style="margin:0; color:#0d9488;">${isRTL ? '🩺 تقرير إعادة التقييم وقرار الباقة' : 'Clinical Re-assessment Report'}</h2>
            <div class="subtitle" style="margin-top:4px;">التاريخ: ${dateFormatted}</div>
          </div>
        </div>

        <div class="box">
          <div class="title">👤 ${isRTL ? 'بيانات المريض والموعد' : 'Patient Information'}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div><span class="label">${isRTL ? 'الاسم الكامل:' : 'Full Name:'}</span> <div class="value">${pName}</div></div>
            <div><span class="label">${isRTL ? 'الطبيب المعالج:' : 'Doctor:'}</span> <div class="value">د. ${docName}</div></div>
            <div><span class="label">${isRTL ? 'كود المريض:' : 'Patient ID:'}</span> <div class="value">${session.patient?.patient_code || 'N/A'}</div></div>
            <div><span class="label">${isRTL ? 'نوع الجلسة:' : 'Session Type:'}</span> <div class="value" style="color:#0d9488;">${isRTL ? 'إعادة تقييم سريري (Re-assessment)' : 'Re-assessment Session'}</div></div>
          </div>
        </div>

        <div class="box">
          <div class="title">🩺 ${isRTL ? 'نتائج الفحص والتحسن السريري' : 'Clinical Progress & Evaluation'}</div>
          <div style="margin-bottom: 15px;">
            <div class="label">${isRTL ? 'التحسن السريري وملاحظات التعافي:' : 'Clinical Progress & Findings:'}</div>
            <div class="value" style="min-height: 50px;">${reassessmentData.clinical_progress || (isRTL ? 'تحسن ملحوظ في الحالة الحركية' : 'Significant mobility improvement')}</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div><span class="label">${isRTL ? 'المدى الحركي (ROM):' : 'Range of Motion:'}</span> <div class="value">${reassessmentData.range_of_motion || (isRTL ? 'طبيعي مع تحسن' : 'Normal with improvement')}</div></div>
            <div><span class="label">${isRTL ? 'مقياس الألم (0-10):' : 'Pain Scale (0-10):'}</span> <div class="value">${reassessmentData.pain_score || '2'} / 10</div></div>
          </div>
        </div>

        <div class="box" style="background:#f0fdfa; border-color:#99f6e4;">
          <div class="title" style="color:#0f766e; border-color:#5eead4;">🎯 ${isRTL ? 'القرار الطبي للباقة اللاحقة' : 'Doctor Next Step Decision'}</div>
          <div style="margin-bottom: 12px;">
            <div class="label" style="color:#0f766e;">${isRTL ? 'قرار الطبيب المعالج:' : 'Medical Decision:'}</div>
            <div class="decision-badge">✨ ${decisionMap[reassessmentData.decision] || reassessmentData.decision}</div>
          </div>
          ${reassessmentData.decision !== 'DISCHARGE' ? `
            <div style="margin-top: 15px;">
              <span class="label" style="color:#0f766e;">${isRTL ? 'الباقة المعتمدة:' : 'Selected Package:'}</span> 
              <strong style="font-size:15px; margin: 0 5px; color:#115e59;">${packageMap[reassessmentData.recommended_package] || reassessmentData.recommended_package}</strong>
            </div>
          ` : ''}
          ${reassessmentData.notes ? `
            <div style="margin-top: 12px;">
              <div class="label" style="color:#0f766e;">${isRTL ? 'ملاحظات إضافية:' : 'Notes:'}</div>
              <div class="value">${reassessmentData.notes}</div>
            </div>
          ` : ''}
        </div>

        <div class="footer">
          <div class="sig-box">
            <div><strong>${isRTL ? 'توقيع الطبيب المعالج' : "Doctor's Signature"}</strong></div>
            <div class="sig-line"></div>
            <div>د. ${docName}</div>
          </div>
          <div class="sig-box">
            <div><strong>${isRTL ? 'اعتماد إدارة المركز' : 'Center Approval'}</strong></div>
            <div class="sig-line"></div>
            <div>ختم المستشفى / الإدارة</div>
          </div>
        </div>
        <script>setTimeout(() => window.print(), 600);</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintEvaluation = () => {
    const pName = session.patient ? (session.patient.full_name_ar || session.patient.name || `${session.patient.first_name || ''} ${session.patient.last_name || ''}`.trim() || 'مريض') : 'N/A';
    const docName = session.doctor?.name || (isRTL ? 'طبيب التأهيل' : 'Rehab Doctor');
    const dateFormatted = new Date(session.session_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

    const packageMap = {
      '6_sessions': isRTL ? 'باقة التأهيل السريع (6 جلسات)' : 'Quick Rehab Package (6 Sessions)',
      '12_sessions': isRTL ? 'باقة التميز العلاجي (12 جلسة - مكثف)' : 'Premium Rehab Package (12 Sessions)',
      '24_sessions': isRTL ? 'باقة التأهيل الشامل والمتكامل (24 جلسة)' : 'Comprehensive Rehab Package (24 Sessions)',
      'hydrotherapy': isRTL ? 'باقة العلاج المائي الرياضي (Hydrotherapy)' : 'Hydrotherapy Sports Package',
      'spine_special': isRTL ? 'باقة علاج آلام الظهر والعمود الفقري المتخصصة' : 'Spinal Pain Specialized Therapy'
    };

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${isRTL ? 'ar' : 'en'}">
      <head>
        <title>${isRTL ? 'تقرير تقييم طبي' : 'Medical Assessment Report'} - ${pName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&display=swap');
          body { font-family: 'Cairo', sans-serif; padding: 40px; color: #1e293b; background: #fff; line-height: 1.6; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 22px; font-weight: 800; color: #0284c7; }
          .subtitle { font-size: 13px; color: #64748b; }
          .box { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 25px; background: #f8fafc; }
          .title { font-size: 16px; font-weight: 800; color: #0f172a; border-bottom: 2px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 12px; }
          .field { margin-bottom: 15px; }
          .label { font-size: 13px; color: #475569; font-weight: 600; }
          .value { font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 4px; background: #fff; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .package-badge { background: #dcfce7; color: #166534; font-size: 16px; font-weight: 800; padding: 12px 18px; border-radius: 8px; border: 1px solid #bbf7d0; display: inline-block; margin-top: 8px; }
          .footer { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 20px; border-top: 1px solid #cbd5e1; text-align: center; }
          .sig-box { width: 220px; }
          .sig-line { border-bottom: 1px solid #334155; margin: 40px 0 10px 0; }
          @media print { button { display: none; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">🏥 Medical Center Specialist Orthopedic Services</div>
            <div class="subtitle">المستشفى المتخصص للتأهيل والعلاج الطبيعي وجراحة العظام</div>
          </div>
          <div style="text-align: ${isRTL ? 'left' : 'right'}">
            <h2 style="margin:0; color:#0284c7;">${isRTL ? '📋 تقرير التقييم والخطة العلاجية' : 'Assessment & Treatment Plan'}</h2>
            <div class="subtitle" style="margin-top:4px;">التاريخ: ${dateFormatted}</div>
          </div>
        </div>

        <div class="box">
          <div class="title">👤 ${isRTL ? 'بيانات المريض والموعد' : 'Patient & Session Information'}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div><span class="label">${isRTL ? 'الاسم الكامل:' : 'Full Name:'}</span> <div class="value">${pName}</div></div>
            <div><span class="label">${isRTL ? 'الطبيب المعالج:' : 'Doctor:'}</span> <div class="value">د. ${docName}</div></div>
            <div><span class="label">${isRTL ? 'كود المريض:' : 'Patient ID:'}</span> <div class="value">${session.patient?.patient_code || 'N/A'}</div></div>
            <div><span class="label">${isRTL ? 'نوع الجلسة:' : 'Session Type:'}</span> <div class="value" style="color:#0284c7;">${isRTL ? 'تقييم وتشخيص شامل (Assessment)' : 'Comprehensive Assessment'}</div></div>
          </div>
        </div>

        <div class="box">
          <div class="title">🩺 ${isRTL ? 'التشخيص المبدئي والحالة الوظيفية' : 'Diagnosis & Functional Assessment'}</div>
          <div class="field">
            <div class="label">${isRTL ? 'ملخص الفحص السريري والشكوى:' : 'Clinical Findings & Chief Complaint:'}</div>
            <div class="value" style="min-height: 60px;">${evaluationData.diagnosis || (isRTL ? 'لا يوجد تفاصيل إضافية' : 'No diagnosis recorded')}</div>
          </div>
          <div class="field">
            <div class="label">${isRTL ? 'الأهداف العلاجية والتوصيات:' : 'Treatment Goals & Recommendations:'}</div>
            <div class="value" style="min-height: 60px;">${evaluationData.goals || (isRTL ? 'تم وضع الخطة المتكاملة للتأهيل' : 'Comprehensive rehab plan set')}</div>
          </div>
        </div>

        <div class="box" style="background:#f0fdf4; border-color:#bbf7d0;">
          <div class="title" style="color:#166534; border-color:#86efac;">🎯 ${isRTL ? 'الباقة العلاجية المقترحة للمريض' : 'Recommended Treatment Package'}</div>
          <div style="margin-bottom: 10px;">
            <div class="label" style="color:#15803d;">${isRTL ? 'توصية الطبيب للباقة الأنسب:' : 'Doctor Recommended Package:'}</div>
            <div class="package-badge">✨ ${packageMap[evaluationData.recommended_package] || evaluationData.recommended_package}</div>
          </div>
          <div style="margin-top: 15px;">
            <span class="label" style="color:#15803d;">${isRTL ? 'معدل الجلسات المقترح:' : 'Recommended Frequency:'}</span> 
            <strong style="font-size:16px; margin: 0 5px; color:#166534;">${evaluationData.weekly_sessions} ${isRTL ? 'جلسات أسبوعياً' : 'sessions per week'}</strong>
          </div>
        </div>

        <div class="footer">
          <div class="sig-box">
            <div><strong>${isRTL ? 'توقيع الطبيب المعالج' : "Doctor's Signature"}</strong></div>
            <div class="sig-line"></div>
            <div>د. ${docName}</div>
          </div>
          <div class="sig-box">
            <div><strong>${isRTL ? 'اعتماد إدارة العلاج الطبيعي' : 'Department Approval'}</strong></div>
            <div class="sig-line"></div>
            <div>ختم المستشفى / الإدارة</div>
          </div>
        </div>
        <script>setTimeout(() => window.print(), 600);</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })
  }

  const plan = session?.treatment_plan
  const patient = session?.patient
  const totalSessions = plan?.total_sessions || patient?.totalSessions || session?.total_sessions || 0
  const completedSessions = plan?.sessions?.filter(sess => sess.status === 'ATTENDED' || sess.status === 'COMPLETED').length
    ?? patient?.completedSessions 
    ?? session?.completed_sessions 
    ?? 0
  const isNearCompletion = (totalSessions > 0 && (totalSessions - completedSessions) <= 1) || (totalSessions > 0 && (completedSessions / totalSessions) >= 0.9)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all duration-300 scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Clock className="text-blue-500" size={20} />
            {isRTL ? 'تفاصيل الجلسة' : 'Session Details'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-white hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Patient info */}
          <div className="flex items-start gap-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-50 dark:border-blue-900/20">
            <div className="p-3 bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20">
              <User size={22} />
            </div>
            <div className="flex-1">
              <span className="text-xs text-blue-500 font-semibold tracking-wider uppercase">
                {isRTL ? 'المريض' : 'Patient'}
              </span>
              <h4 className="text-lg font-bold text-gray-800 dark:text-white mt-0.5">
                {session.patient ? (session.patient.full_name_ar || session.patient.name || `${session.patient.first_name || ''} ${session.patient.last_name || ''}`.trim() || 'مريض') : 'N/A'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">
                {session.patient?.patient_code}
              </p>
            </div>
          </div>

          {/* Details Grid or Rescheduling Form */}
          {isRescheduling ? (
            <div className="p-4 bg-indigo-50/30 dark:bg-indigo-950/10 rounded-xl space-y-3.5 border border-indigo-100/50 dark:border-indigo-900/30 animate-fade-in">
              <h5 className="text-xs font-extrabold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider">
                {isRTL ? 'إعادة جدولة الموعد' : 'Reschedule Appointment'}
              </h5>
              
              <div className="space-y-3">
                {/* Doctor Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{isRTL ? 'الأخصائي / الطبيب' : 'Doctor'}</label>
                  <select
                    value={rescheduleData.doctorId}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, doctorId: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">{isRTL ? 'بدون طبيب' : 'No Doctor'}</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date & Time Input */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{isRTL ? 'التاريخ' : 'Date'}</label>
                    <input
                      type="date"
                      value={rescheduleData.date}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{isRTL ? 'الوقت' : 'Time'}</label>
                    <input
                      type="time"
                      value={rescheduleData.time}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Room Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{isRTL ? 'الغرفة' : 'Room'}</label>
                  <select
                    value={rescheduleData.roomId}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, roomId: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">{isRTL ? 'بدون غرفة' : 'No Room'}</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRescheduleConfirm}
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-3 rounded-xl text-xs transition"
                >
                  {isRTL ? 'تأكيد النقل' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsRescheduling(false)}
                  className="flex-1 bg-gray-150 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-750 dark:text-gray-200 font-semibold py-2.5 px-3 rounded-xl text-xs transition"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Doctor */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
                  <Stethoscope className="text-purple-500 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-400">{isRTL ? 'الطبيب' : 'Doctor'}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {session.doctor?.name || (isRTL ? 'غير محدد' : 'Not assigned')}
                    </p>
                  </div>
                </div>

                {/* Room */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
                  <MapPin className="text-red-500 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-400">{isRTL ? 'الغرفة' : 'Room'}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {session.room?.name || session.room?.code || (isRTL ? 'غير محدد' : 'Not assigned')}
                    </p>
                  </div>
                </div>

                {/* Confirmation status */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
                  <ShieldCheck className="text-green-500 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-400">{isRTL ? 'تأكيد الحجز' : 'Confirmation'}</p>
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
                      session.confirm_status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      session.confirm_status === 'DECLINED' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {session.confirm_status || 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Payment status */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
                  <CreditCard className="text-blue-500 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-400">{isRTL ? 'حالة الدفع' : 'Payment Status'}</p>
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
                      session.is_deducted || session.payment_verified ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {session.is_deducted ? (isRTL ? 'مخصوم من الباقة' : 'Deducted') : session.payment_verified ? (isRTL ? 'تم تأكيد الدفع 🟢' : 'Verified') : (isRTL ? 'معلق 🟡' : 'Pending')}
                    </span>
                  </div>
                </div>

                {/* Elegant Payment Verification Action Banner when unverified */}
                {!session.payment_verified && !session.is_deducted && session.status !== 'CANCELED' && (
                  <div className="col-span-2 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-300">
                      <CreditCard size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold leading-relaxed">
                        {isRTL 
                          ? 'حالة الدفع معلقة، يمكنك اعتماد وتأكيد السداد الآن:' 
                          : 'Payment for this session is pending. You can confirm payment below:'}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleAction('verify-payment')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition shrink-0 flex items-center gap-1.5 transform active:scale-95"
                    >
                      <Check size={15} />
                      <span>{isRTL ? 'تأكيد واعتماد الدفع 💳' : 'Confirm Payment 💳'}</span>
                    </button>
                  </div>
                )}

                {session.status === 'CANCELED' && (
                  <div className="col-span-2 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-1 text-xs">
                    <div className="font-extrabold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                      <span>🚫</span>
                      <span>{isRTL ? 'هذا الموعد تم إلغاؤه' : 'This appointment was cancelled'}</span>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      <span className="font-bold">{isRTL ? 'سبب الإلغاء: ' : 'Cancellation Reason: '}</span>
                      <span className="font-semibold text-rose-700 dark:text-rose-400">{session.cancellation_reason || (isRTL ? 'غير محدد' : 'Not specified')}</span>
                    </div>
                    {session.cancelled_by && (
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        <span>{isRTL ? 'بواسطة: ' : 'Cancelled by: '}</span>
                        <span className="font-medium">{session.cancelled_by}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Time Tracking */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl space-y-3">
                <h5 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-1.5">
                  <Clock size={16} className="text-blue-500" />
                  {isRTL ? 'وقت الجلسة الفعلي' : 'Actual Session Duration'}
                </h5>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-400 block">{isRTL ? 'بدأت في' : 'Started at'}</span>
                    <span className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300">
                      {formatTime(session.start_time)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-400 block">{isRTL ? 'انتهت في' : 'Ended at'}</span>
                    <span className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300">
                      {formatTime(session.end_time)}
                    </span>
                  </div>
                </div>

                {/* Phase 5: Early Termination Warning Alert */}
                {(session.duration_warning_generated || (session.actual_duration_minutes && session.actual_duration_minutes < (session.scheduled_duration_minutes || 60) - 15)) && (
                  <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/70 rounded-xl text-rose-900 dark:text-rose-200 flex items-start gap-3 mt-2 shadow-sm">
                    <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                    <div>
                      <h6 className="text-xs font-extrabold uppercase tracking-wide text-rose-700 dark:text-rose-400">
                        {isRTL ? '⚠️ تنبيه رقابة الجلسات: انتهاء الجلسة بوقت مبكر غير معتاد' : '⚠️ Duration Alert: Early Session Termination'}
                      </h6>
                      <p className="text-xs opacity-95 mt-1 leading-relaxed">
                        {isRTL 
                          ? `المدة المجدولة لهذه الجلسة هي (${session.scheduled_duration_minutes || 60} دقيقة) ولكن تم إنهاؤها فعلياً خلال (${session.actual_duration_minutes} دقيقة) فقط. يرجى المراجعة مع الطبيب المختص لضمان استيفاء المعايير العلاجية.` 
                          : `Session was scheduled for (${session.scheduled_duration_minutes || 60} minutes) but completed after only (${session.actual_duration_minutes} minutes).`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

            <div className="flex gap-2 pt-2">
              {session.confirm_status !== 'CONFIRMED' && session.status !== 'CANCELED' && (
                <button
                  disabled={submitting}
                  onClick={() => handleAction('confirm', { confirm_status: 'CONFIRMED' })}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                >
                  <Check size={16} />
                  {isRTL ? 'تأكيد الحجز' : 'Confirm'}
                </button>
              )}

              {!session.start_time && session.status !== 'CANCELED' && (
                <button
                  type="button"
                  onClick={() => setIsRescheduling(true)}
                  className="flex-1 border border-indigo-200 hover:bg-indigo-50 text-indigo-650 dark:border-indigo-900/30 dark:hover:bg-indigo-950/20 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                >
                  {isRTL ? 'إعادة جدولة' : 'Reschedule'}
                </button>
              )}

              {!session.start_time && session.status !== 'CANCELED' && session.confirm_status === 'CONFIRMED' && (
                <button
                  disabled={submitting || (session.session_type === 'ASSESSMENT' && !session.payment_verified)}
                  onClick={() => handleAction('start')}
                  title={session.session_type === 'ASSESSMENT' && !session.payment_verified ? (isRTL ? 'مغلق: يتطلب تأكيد الدفع أولاً' : 'Locked: Requires payment verification') : ''}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1 ${
                    session.session_type === 'ASSESSMENT' && !session.payment_verified 
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-300 dark:border-gray-600' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                  }`}
                >
                  <Play size={16} />
                  {isRTL ? 'بدء الجلسة' : 'Start Session'}
                </button>
              )}
              
              {session.start_time && !session.end_time && session.status !== 'CANCELED' ? (
                <button
                  disabled={submitting}
                  onClick={() => handleAction('end')}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                >
                  <Square size={16} />
                  {isRTL ? 'إنهاء الجلسة' : 'End Session'}
                </button>
              ) : null}
            </div>

            {/* Cancel and Delete Actions */}
            {session.status !== 'CANCELED' && !session.end_time && (
              <div className="flex gap-2 pt-1">
                <button
                  disabled={submitting}
                  onClick={() => {
                    setCancelReason('')
                    setCancelCustomNotes('')
                    setShowCancelModal(true)
                  }}
                  className="flex-1 border border-rose-200 hover:bg-rose-50 text-rose-600 dark:border-rose-900/30 dark:hover:bg-rose-950/20 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                >
                  {isRTL ? 'إلغاء الموعد' : 'Cancel Appointment'}
                </button>

                {isAdmin && (
                  <button
                    disabled={submitting}
                    onClick={async () => {
                      if ((await confirmAlert({ title: 'تأكيد', text: isRTL ? 'هل أنت متأكد من حذف هذه الجلسة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to permanently delete this session? This action cannot be undone.' }))) {
                        handleAction('delete')
                      }
                    }}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                  >
                    {isRTL ? 'حذف نهائي' : 'Delete'}
                  </button>
                )}
              </div>
            )}

          {/* Phase 6: Doctor Assessment Evaluation & Recommended Packages Report */}
          {session.session_type === 'ASSESSMENT' && (
            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/80 dark:from-gray-900/90 dark:to-indigo-950/40 rounded-2xl border-2 border-blue-200 dark:border-indigo-800/80 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b pb-3 border-blue-200 dark:border-indigo-800/60 gap-2">
                <h5 className="text-xs font-extrabold text-blue-950 dark:text-indigo-200 flex items-center gap-2">
                  <ClipboardCheck className="text-blue-600 dark:text-blue-400 shrink-0" size={18} />
                  {isRTL ? '📋 تقرير التقييم الطبي والباقات المقترحة (Phase 6)' : 'Doctor Assessment & Recommended Plan'}
                </h5>
                <button
                  type="button"
                  onClick={handlePrintEvaluation}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 rounded-xl text-xs font-extrabold shadow-xs transition flex items-center gap-1.5 shrink-0"
                >
                  <Printer size={14} />
                  {isRTL ? '🖨️ طباعة / تصدير PDF' : 'Print / Export PDF'}
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isRTL ? '🩺 التشخيص المبدئي وملاحظات الفحص السريري:' : '🩺 Initial Diagnosis & Findings:'}
                  </label>
                  <textarea
                    rows={2}
                    value={evaluationData.diagnosis}
                    onChange={(e) => setEvaluationData({ ...evaluationData, diagnosis: e.target.value })}
                    placeholder={isRTL ? 'أدخل تفاصيل الحالة الحركية والتشخيص الطبي المبدئي...' : 'Enter clinical diagnosis and mobility status...'}
                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none shadow-inner text-gray-800 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isRTL ? '🎯 الأهداف العلاجية وخطة التأهيل المقترحة:' : '🎯 Recommended Rehab Goals:'}
                  </label>
                  <textarea
                    rows={2}
                    value={evaluationData.goals}
                    onChange={(e) => setEvaluationData({ ...evaluationData, goals: e.target.value })}
                    placeholder={isRTL ? 'مثال: تقوية عضلات أسفل الظهر، زيادة المدي الحركي للركبة...' : 'e.g. Strengthening lower back muscles, increasing knee range...'}
                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none shadow-inner text-gray-800 dark:text-gray-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase mb-1 flex items-center gap-1">
                      <Award size={14} className="text-emerald-600 shrink-0" />
                      {isRTL ? 'الباقة العلاجية الموصى بها:' : 'Recommended Package:'}
                    </label>
                    <select
                      value={evaluationData.recommended_package}
                      onChange={(e) => setEvaluationData({ ...evaluationData, recommended_package: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-gray-800 border-2 border-emerald-400 dark:border-emerald-700 rounded-xl text-xs font-bold text-emerald-950 dark:text-emerald-300 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="6_sessions">{isRTL ? 'باقة التأهيل السريع (6 جلسات)' : 'Quick Rehab (6 Sessions)'}</option>
                      <option value="12_sessions">{isRTL ? 'باقة التميز العلاجي (12 جلسة - مكثف)' : 'Premium Rehab (12 Sessions)'}</option>
                      <option value="24_sessions">{isRTL ? 'باقة التأهيل الشامل (24 جلسة)' : 'Comprehensive (24 Sessions)'}</option>
                      <option value="hydrotherapy">{isRTL ? 'باقة العلاج المائي الرياضي' : 'Hydrotherapy Sports'}</option>
                      <option value="spine_special">{isRTL ? 'باقة علاج العمود الفقري المتخصصة' : 'Spinal Specialized Therapy'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                      {isRTL ? 'عدد الجلسات الأسبوعية:' : 'Weekly Frequency:'}
                    </label>
                    <select
                      value={evaluationData.weekly_sessions}
                      onChange={(e) => setEvaluationData({ ...evaluationData, weekly_sessions: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200"
                    >
                      <option value="2">{isRTL ? 'جلستان أسبوعياً (2)' : '2 Sessions / Week'}</option>
                      <option value="3">{isRTL ? '3 جلسات أسبوعياً (قياسي)' : '3 Sessions / Week'}</option>
                      <option value="4">{isRTL ? '4 جلسات أسبوعياً (مكثف)' : '4 Sessions / Week'}</option>
                      <option value="5">{isRTL ? 'يومياً (5 جلسات في الأسبوع)' : 'Daily (5 / Week)'}</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleSaveEvaluation}
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-2.5 rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <ClipboardCheck size={16} />
                    {isRTL ? 'حفظ واعتماد التقييم والخطة الموصى بها 💾' : 'Save & Submit Assessment Plan 💾'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const patientId = session.patient_id || (session.patient && session.patient.id);
                      const pName = encodeURIComponent(session.patient ? `${session.patient.first_name} ${session.patient.last_name || ''}`.trim() : '');
                      const docName = encodeURIComponent(session.doctor?.name || currentUser?.name || '');
                      const docId = session.doctor?.id || session.doctor_id || '';
                      if (patientId) {
                        window.location.href = `/packages?patientId=${patientId}&patientName=${pName}&doctorId=${docId}&doctorName=${docName}&recommendedPackage=${encodeURIComponent(evaluationData.recommended_package || '')}`;
                      } else {
                        toast.error(isRTL ? 'بيانات المريض غير متاحة للاستكمال' : 'Patient ID not available');
                      }
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-2.5 rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Package size={16} />
                    {isRTL ? 'الانتقال لتعيين الباقة الموصى بها للمريض 📦' : 'Proceed to Assign Recommended Package 📦'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Re-Assessment Section (Item 9) */}
          {(session.session_type === 'RE_ASSESSMENT' || showReAssessment || (isNearCompletion && session.session_type !== 'ASSESSMENT')) ? (
            <div className="p-5 bg-gradient-to-br from-teal-50 to-emerald-50/80 dark:from-gray-900/90 dark:to-teal-950/40 rounded-2xl border-2 border-teal-300 dark:border-teal-700/80 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b pb-3 border-teal-200 dark:border-teal-800/60 gap-2">
                <div>
                  <h5 className="text-xs font-extrabold text-teal-950 dark:text-teal-200 flex items-center gap-2">
                    <Stethoscope className="text-teal-600 dark:text-teal-400 shrink-0" size={18} />
                    {isRTL ? '🩺 تقرير إعادة التقييم وقرار الباقة (Re-assessment)' : 'Clinical Re-assessment & Package Decision'}
                  </h5>
                  <p className="text-[11px] text-teal-700 dark:text-teal-300 mt-0.5">
                    {isRTL ? 'تقييم التحسن السريري لتحديد تكرار أو تغيير الباقة العلاجية' : 'Evaluate progress to repeat, change or complete treatment'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrintReAssessment}
                    className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-teal-600 hover:text-white text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700 rounded-xl text-xs font-extrabold shadow-xs transition flex items-center gap-1.5 shrink-0"
                  >
                    <Printer size={14} />
                    {isRTL ? 'طباعة التقرير' : 'Print'}
                  </button>
                  {session.session_type !== 'RE_ASSESSMENT' && (
                    <button
                      type="button"
                      onClick={() => setShowReAssessment(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3.5">
                {/* Clinical progress notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isRTL ? '🩺 نتائج الفحص السريري ونسبة التحسن:' : '🩺 Clinical Findings & Progress:'}
                  </label>
                  <textarea
                    rows={2}
                    value={reassessmentData.clinical_progress}
                    onChange={(e) => setReassessmentData({ ...reassessmentData, clinical_progress: e.target.value })}
                    placeholder={isRTL ? 'أدخل نتائج التحسن الحركي، تخفيف الألم، والقدرة الوظيفية...' : 'Enter recovery notes, mobility improvements, functional state...'}
                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-teal-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none shadow-inner text-gray-800 dark:text-gray-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isRTL ? 'المدى الحركي (Range of Motion):' : 'Range of Motion (ROM):'}
                    </label>
                    <input
                      type="text"
                      value={reassessmentData.range_of_motion}
                      onChange={(e) => setReassessmentData({ ...reassessmentData, range_of_motion: e.target.value })}
                      placeholder={isRTL ? 'مثال: 90 درجة، تحسن 40%' : 'e.g. 90 deg, 40% gain'}
                      className="w-full p-2 bg-white dark:bg-gray-800 border border-teal-200 dark:border-gray-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isRTL ? 'مقياس الألم المتبقي (0-10):' : 'Remaining Pain Score (0-10):'}
                    </label>
                    <select
                      value={reassessmentData.pain_score}
                      onChange={(e) => setReassessmentData({ ...reassessmentData, pain_score: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-gray-800 border border-teal-200 dark:border-gray-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-gray-200"
                    >
                      <option value="0">{isRTL ? '0 - لا يوجد ألم إطلاقاً (تعافي تام)' : '0 - No Pain'}</option>
                      <option value="1">{isRTL ? '1 - خفيف جداً' : '1 - Very Mild'}</option>
                      <option value="2">{isRTL ? '2 - ألم خفيف' : '2 - Mild'}</option>
                      <option value="4">{isRTL ? '4 - ألم متوسط' : '4 - Moderate'}</option>
                      <option value="6">{isRTL ? '6 - ألم ملحوظ' : '6 - Noticeable'}</option>
                      <option value="8">{isRTL ? '8 - ألم شديد' : '8 - Severe'}</option>
                    </select>
                  </div>
                </div>

                {/* Medical Decision 3 Cards */}
                <div>
                  <label className="block text-[11px] font-extrabold text-teal-900 dark:text-teal-300 uppercase mb-2">
                    {isRTL ? '🎯 قرار الطبيب المعالج للباقة القادمة:' : '🎯 Doctor Medical Decision for Next Step:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setReassessmentData({ ...reassessmentData, decision: 'REPEAT' })}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        reassessmentData.decision === 'REPEAT'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-400'
                      }`}
                    >
                      <RefreshCw size={16} />
                      <span className="text-[11px] font-bold">{isRTL ? '🔁 تكرار نفس الباقة' : 'Repeat Package'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReassessmentData({ ...reassessmentData, decision: 'CHANGE' })}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        reassessmentData.decision === 'CHANGE'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400'
                      }`}
                    >
                      <Package size={16} />
                      <span className="text-[11px] font-bold">{isRTL ? '📦 تغيير / ترقية الباقة' : 'Change Package'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReassessmentData({ ...reassessmentData, decision: 'DISCHARGE' })}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        reassessmentData.decision === 'DISCHARGE'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-md font-bold'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-amber-400'
                      }`}
                    >
                      <CheckCircle size={16} />
                      <span className="text-[11px] font-bold">{isRTL ? '🏁 تعافي واكتمال الخطة' : 'Discharge'}</span>
                    </button>
                  </div>
                </div>

                {/* Package select if REPEAT or CHANGE */}
                {reassessmentData.decision !== 'DISCHARGE' && (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {isRTL ? 'الباقة العلاجية المقررة للمرحلة القادمة:' : 'Assigned Package for Next Phase:'}
                    </label>
                    <select
                      value={reassessmentData.recommended_package}
                      onChange={(e) => setReassessmentData({ ...reassessmentData, recommended_package: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-gray-800 border-2 border-teal-300 dark:border-teal-700 rounded-xl text-xs font-bold text-teal-950 dark:text-teal-200 outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="6_sessions">{isRTL ? 'باقة التأهيل السريع (6 جلسات)' : 'Quick Rehab (6 Sessions)'}</option>
                      <option value="12_sessions">{isRTL ? 'باقة التميز العلاجي (12 جلسة - مكثف)' : 'Premium Rehab (12 Sessions)'}</option>
                      <option value="24_sessions">{isRTL ? 'باقة التأهيل الشامل (24 جلسة)' : 'Comprehensive (24 Sessions)'}</option>
                      <option value="hydrotherapy">{isRTL ? 'باقة العلاج المائي الرياضي' : 'Hydrotherapy Sports'}</option>
                      <option value="spine_special">{isRTL ? 'باقة علاج العمود الفقري المتخصصة' : 'Spinal Specialized Therapy'}</option>
                    </select>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveReAssessment}
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white p-2.5 rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <ClipboardCheck size={16} />
                    {isRTL ? 'حفظ واعتماد تقرير إعادة التقييم 💾' : 'Save & Submit Re-assessment Report 💾'}
                  </button>

                  {reassessmentData.decision === 'REPEAT' && (
                    <button
                      type="button"
                      onClick={() => {
                        const patientId = session.patient_id || session.patient?.id;
                        const pName = encodeURIComponent(session.patient ? `${session.patient.first_name || ''} ${session.patient.last_name || ''}`.trim() : '');
                        const docName = encodeURIComponent(session.doctor?.name || currentUser?.name || '');
                        const docId = session.doctor?.id || session.doctor_id || '';
                        if (patientId) {
                          window.location.href = `/packages?patientId=${patientId}&patientName=${pName}&doctorId=${docId}&doctorName=${docName}&action=repeat&recommendedPackage=${encodeURIComponent(reassessmentData.recommended_package)}`;
                        }
                      }}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-2.5 rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={16} />
                      {isRTL ? 'الانتقال لتكرار نفس الباقة للمريض 🔁' : 'Proceed to Repeat Package 🔁'}
                    </button>
                  )}

                  {reassessmentData.decision === 'CHANGE' && (
                    <button
                      type="button"
                      onClick={() => {
                        const patientId = session.patient_id || session.patient?.id;
                        const pName = encodeURIComponent(session.patient ? `${session.patient.first_name || ''} ${session.patient.last_name || ''}`.trim() : '');
                        const docName = encodeURIComponent(session.doctor?.name || currentUser?.name || '');
                        const docId = session.doctor?.id || session.doctor_id || '';
                        if (patientId) {
                          window.location.href = `/packages?patientId=${patientId}&patientName=${pName}&doctorId=${docId}&doctorName=${docName}&action=change&recommendedPackage=${encodeURIComponent(reassessmentData.recommended_package)}`;
                        }
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-2.5 rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <Package size={16} />
                      {isRTL ? 'الانتقال لاختيار وتعيين الباقة الجديدة 📦' : 'Proceed to Assign New Package 📦'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            session.session_type !== 'ASSESSMENT' && (
              <div className="p-3 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope size={18} className="text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {isRTL ? 'إجراء جلسة إعادة تقييم سريري (Re-assessment)' : 'Perform Clinical Re-assessment'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReAssessment(true)}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                >
                  <Plus size={13} />
                  <span>{isRTL ? 'فتح التقييم' : 'Open'}</span>
                </button>
              </div>
            )
          )}

          {/* Notes Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                <FileText size={14} />
                {isRTL ? 'ملاحظات الطبيب' : 'Doctor Notes'}
              </label>
              <textarea
                className="w-full p-3 border rounded-xl dark:bg-gray-900 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                rows="2"
                value={notes.doctorNotes}
                onChange={(e) => setNotes({ ...notes, doctorNotes: e.target.value })}
                placeholder={isRTL ? 'أكتب ملاحظات الطبيب هنا...' : 'Enter doctor notes...'}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                <FileText size={14} />
                {isRTL ? 'ملاحظات الاستقبال' : 'Reception Notes'}
              </label>
              <textarea
                className="w-full p-3 border rounded-xl dark:bg-gray-900 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                rows="2"
                value={notes.receptionNotes}
                onChange={(e) => setNotes({ ...notes, receptionNotes: e.target.value })}
                placeholder={isRTL ? 'أكتب ملاحظات الاستقبال هنا...' : 'Enter reception notes...'}
              />
            </div>
            <button
              onClick={saveNotes}
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl font-semibold transition"
            >
              {isRTL ? 'حفظ الملاحظات' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>

      {/* Cancellation Modal with Mandatory Reason */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-60 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700 shadow-2xl space-y-4 text-left rtl:text-right">
            <div className="flex justify-between items-center border-b pb-3 border-gray-100 dark:border-gray-700">
              <h4 className="text-sm font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <span>🚫</span>
                <span>{isRTL ? 'إلغاء الموعد - تحديد سبب الإلغاء (إلزامي)' : 'Cancel Appointment - Mandatory Reason'}</span>
              </h4>
              <button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL ? 'اختر سبب الإلغاء:' : 'Select Cancellation Reason:'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                >
                  <option value="">{isRTL ? '-- الرجاء اختيار سبب الإلغاء --' : '-- Please select a reason --'}</option>
                  <option value="المريض طلب الإلغاء">{isRTL ? 'المريض طلب الإلغاء' : 'Patient requested cancellation'}</option>
                  <option value="المريض لم يحضر (غياب بدون إشعار)">{isRTL ? 'المريض لم يحضر (غياب بدون إشعار)' : 'Patient No-Show'}</option>
                  <option value="الطبيب غير متاح أو في إجازة">{isRTL ? 'الطبيب غير متاح أو في إجازة' : 'Doctor unavailable / on leave'}</option>
                  <option value="تعارض في المواعيد والجدول">{isRTL ? 'تعارض في المواعيد والجدول' : 'Schedule conflict'}</option>
                  <option value="سبب صحي أو ظرف طارئ للمريض">{isRTL ? 'سبب صحي أو ظرف طارئ للمريض' : 'Medical emergency'}</option>
                  <option value="أخرى">{isRTL ? 'أخرى (حدد في الملاحظات)' : 'Other (specify below)'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL ? 'تفاصيل إضافية / ملاحظات الإلغاء:' : 'Additional Details / Notes:'}
                  {cancelReason === 'أخرى' && <span className="text-rose-500"> *</span>}
                </label>
                <textarea
                  rows={2}
                  value={cancelCustomNotes}
                  onChange={(e) => setCancelCustomNotes(e.target.value)}
                  placeholder={isRTL ? 'أدخل تفاصيل إضافية عن سبب الإلغاء...' : 'Enter details about cancellation reason...'}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                disabled={submitting || !cancelReason || (cancelReason === 'أخرى' && !cancelCustomNotes.trim())}
                onClick={() => {
                  const fullReason = cancelReason === 'أخرى'
                    ? `أخرى: ${cancelCustomNotes.trim()}`
                    : (cancelCustomNotes.trim() ? `${cancelReason} (${cancelCustomNotes.trim()})` : cancelReason)

                  handleAction('cancel', {
                    cancellation_reason: fullReason,
                    cancelled_by: currentUser?.name || (isRTL ? 'موظف الاستقبال' : 'Reception Staff')
                  })
                  setShowCancelModal(false)
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <span>🚫</span>
                <span>{isRTL ? 'تأكيد إلغاء الموعد' : 'Confirm Cancellation'}</span>
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-xl text-xs font-bold transition"
              >
                {isRTL ? 'تراجع' : 'Back'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
