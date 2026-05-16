import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translations directly
const translationAR = {
  "app": {
    "title": "نظام المركز الطبي",
    "name": "MCSOS"
  },
  "sidebar": {
    "reception": "الاستقبال",
    "doctor": "الأطباء",
    "finance": "المالية",
    "operations": "العمليات",
    "scheduling": "الجدولة",
    "packages": "الباقات",
    "whatsapp": "واتساب",
    "logout": "تسجيل الخروج"
  },
  "reception": {
    "title": "لوحة الاستقبال",
    "subtitle": "إدارة المرضى والحجوزات",
    "new_patient": "تسجيل مريض جديد",
    "search_patient": "البحث عن مريض",
    "register": "تسجيل",
    "name": "الاسم",
    "phone": "الجوال",
    "email": "البريد",
    "search": "بحث",
    "appointment": "حجز موعد",
    "book": "تأكيد الحجز",
    "date": "التاريخ",
    "time": "الوقت",
    "select_doctor": "اختر الطبيب",
    "patient_details": "تفاصيل المريض",
    "contact_info": "معلومات التواصل",
    "national_id": "رقم الهوية"
  },
  "doctor": {
    "title": "لوحة الأطباء",
    "subtitle": "إدارة التقييمات والخطط العلاجية",
    "total_patients": "إجمالي المرضى",
    "active_treatments": "علاجات نشطة",
    "total_sessions": "إجمالي الجلسات",
    "completed_sessions": "جلسات مكتملة",
    "my_patients": "مرضاي",
    "add_patient": "إضافة مريض",
    "diagnosis": "التشخيص",
    "treatment_plan": "خطة العلاج",
    "sessions_count": "عدد الجلسات",
    "medical_assessment": "التقييم الطبي",
    "notes": "ملاحظات",
    "assessment_saved": "تم حفظ التقييم",
    "years": "سنة"
  },
  "finance": {
    "title": "لوحة المالية",
    "subtitle": "تتبع المدفوعات",
    "total_revenue": "إجمالي الإيرادات",
    "pending_payments": "مدفوعات معلقة",
    "paid": "مدفوع",
    "unpaid": "غير مدفوع",
    "amount": "المبلغ",
    "invoice": "فاتورة",
    "print": "طباعة"
  },
  "operations": {
    "title": "لوحة العمليات",
    "subtitle": "متابعة الأداء",
    "schedule": "الجدولة",
    "doctors": "الأطباء",
    "performance": "الأداء",
    "reports": "التقارير"
  },
  "scheduling": {
    "title": "الجدولة",
    "select_doctor": "اختر الطبيب",
    "bulk_generate": "جدولة دفعات",
    "dynamic_generate": "جدولة ديناميكية",
    "available": "متاح",
    "no_slots": "لا توجد مواعيد"
  },
  "packages": {
    "title": "الباقات",
    "add_package": "إضافة باقة",
    "price": "السعر",
    "currency": "ر.س"
  },
  "whatsapp": {
    "title": "واتساب",
    "send_now": "إرسال الآن",
    "message": "الرسالة"
  },
  "common": {
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل",
    "search": "بحث",
    "loading": "جاري التحميل",
    "success": "تم بنجاح",
    "error": "خطأ"
  },
  "status": {
    "active": "نشط",
    "completed": "مكتمل"
  }
}

const translationEN = {
  "app": {
    "title": "Medical Center System",
    "name": "MCSOS"
  },
  "sidebar": {
    "reception": "Reception",
    "doctor": "Doctor",
    "finance": "Finance",
    "operations": "Operations",
    "scheduling": "Scheduling",
    "packages": "Packages",
    "whatsapp": "WhatsApp",
    "logout": "Logout"
  },
  "reception": {
    "title": "Reception Dashboard",
    "subtitle": "Manage patients and appointments",
    "new_patient": "New Patient",
    "search_patient": "Search Patient",
    "register": "Register",
    "name": "Name",
    "phone": "Phone",
    "email": "Email",
    "search": "Search",
    "appointment": "Book Appointment",
    "book": "Confirm",
    "date": "Date",
    "time": "Time",
    "select_doctor": "Select Doctor",
    "patient_details": "Patient Details",
    "contact_info": "Contact Info",
    "national_id": "National ID"
  },
  "doctor": {
    "title": "Doctor Dashboard",
    "subtitle": "Manage assessments",
    "total_patients": "Total Patients",
    "active_treatments": "Active Treatments",
    "total_sessions": "Total Sessions",
    "completed_sessions": "Completed Sessions",
    "my_patients": "My Patients",
    "add_patient": "Add Patient",
    "diagnosis": "Diagnosis",
    "treatment_plan": "Treatment Plan",
    "sessions_count": "Sessions",
    "medical_assessment": "Medical Assessment",
    "notes": "Notes",
    "assessment_saved": "Assessment saved",
    "years": "years"
  },
  "finance": {
    "title": "Finance Dashboard",
    "subtitle": "Track payments",
    "total_revenue": "Total Revenue",
    "pending_payments": "Pending Payments",
    "paid": "Paid",
    "unpaid": "Unpaid",
    "amount": "Amount",
    "invoice": "Invoice",
    "print": "Print"
  },
  "operations": {
    "title": "Operations Dashboard",
    "subtitle": "Performance monitoring",
    "schedule": "Schedule",
    "doctors": "Doctors",
    "performance": "Performance",
    "reports": "Reports"
  },
  "scheduling": {
    "title": "Scheduling",
    "select_doctor": "Select Doctor",
    "bulk_generate": "Bulk Schedule",
    "dynamic_generate": "Dynamic Schedule",
    "available": "Available",
    "no_slots": "No slots"
  },
  "packages": {
    "title": "Packages",
    "add_package": "Add Package",
    "price": "Price",
    "currency": "SAR"
  },
  "whatsapp": {
    "title": "WhatsApp",
    "send_now": "Send Now",
    "message": "Message"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "search": "Search",
    "loading": "Loading",
    "success": "Success",
    "error": "Error"
  },
  "status": {
    "active": "Active",
    "completed": "Completed"
  }
}

const translationFR = {
  "app": {
    "title": "Système Médical",
    "name": "MCSOS"
  },
  "sidebar": {
    "reception": "Accueil",
    "doctor": "Médecin",
    "finance": "Finances",
    "operations": "Opérations",
    "scheduling": "Planification",
    "packages": "Forfaits",
    "whatsapp": "WhatsApp",
    "logout": "Déconnexion"
  },
  "reception": {
    "title": "Accueil",
    "subtitle": "Gérer les patients",
    "new_patient": "Nouveau Patient",
    "search_patient": "Rechercher",
    "register": "Enregistrer",
    "name": "Nom",
    "phone": "Téléphone",
    "email": "Email",
    "search": "Recherche",
    "appointment": "Rendez-vous",
    "book": "Confirmer",
    "date": "Date",
    "time": "Heure",
    "select_doctor": "Sélectionner",
    "patient_details": "Détails",
    "contact_info": "Coordonnées",
    "national_id": "CIN"
  },
  "doctor": {
    "title": "Médecin",
    "subtitle": "Évaluations",
    "total_patients": "Total Patients",
    "active_treatments": "Traitements actifs",
    "total_sessions": "Total séances",
    "completed_sessions": "Séances terminées",
    "my_patients": "Mes patients",
    "add_patient": "Ajouter",
    "diagnosis": "Diagnostic",
    "treatment_plan": "Traitement",
    "sessions_count": "Séances",
    "medical_assessment": "Évaluation",
    "notes": "Notes",
    "assessment_saved": "Évaluation sauvegardée",
    "years": "ans"
  },
  "finance": {
    "title": "Finances",
    "subtitle": "Paiements",
    "total_revenue": "Revenu Total",
    "pending_payments": "En Attente",
    "paid": "Payé",
    "unpaid": "Impayé",
    "amount": "Montant",
    "invoice": "Facture",
    "print": "Imprimer"
  },
  "operations": {
    "title": "Opérations",
    "subtitle": "Performance",
    "schedule": "Planification",
    "doctors": "Médecins",
    "performance": "Performance",
    "reports": "Rapports"
  },
  "scheduling": {
    "title": "Planification",
    "select_doctor": "Sélectionner",
    "bulk_generate": "Planification groupe",
    "dynamic_generate": "Planification dynamique",
    "available": "Disponible",
    "no_slots": "Aucun créneau"
  },
  "packages": {
    "title": "Forfaits",
    "add_package": "Ajouter",
    "price": "Prix",
    "currency": "SAR"
  },
  "whatsapp": {
    "title": "WhatsApp",
    "send_now": "Envoyer",
    "message": "Message"
  },
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "search": "Rechercher",
    "loading": "Chargement",
    "success": "Succès",
    "error": "Erreur"
  },
  "status": {
    "active": "Actif",
    "completed": "Terminé"
  }
}

const resources = {
  ar: { translation: translationAR },
  en: { translation: translationEN },
  fr: { translation: translationFR }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
