// src/services/api/config.js

// دالة تحديد عنوان الـ API بشكل ديناميكي وذكي
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  // إذا كان التطبيق يعمل داخل المتصفح على دومين حقيقي (وليس localhost)
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (!isLocalhost) {
      // إذا كان المتغير يشير إلى localhost أو فارغ، نستخدم رابط الـ Production تلقائياً
      if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
        return 'https://medical-center-app-production.up.railway.app'
      }
    }
  }
  return envUrl || 'https://medical-center-app-production.up.railway.app'
}

// تكوين API
export const API_CONFIG = {
  // ✅ BASE_URL بدون /api في النهاية لتجنب التكرار
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

export const API_BASE = `${API_CONFIG.BASE_URL}/api/v1`

// نقاط النهاية (Endpoints) - ✅ تم التحديث حسب Swagger مع إضافة /api/v1
export const ENDPOINTS = {
  // المصادقة
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
  },
  // المستخدمين
  USERS: {
    LIST: '/api/v1/users',
    CREATE: '/api/v1/users',
    GET: (id) => `/api/v1/users/${id}`,
    UPDATE: (id) => `/api/v1/users/${id}`,
    DELETE: (id) => `/api/v1/users/${id}`,
    ASSIGN_ROLE: '/api/v1/users/assign-role',
  },
  // الأطباء
  DOCTORS: {
    LIST: '/api/v1/doctors',
    CREATE: '/api/v1/doctors',
    GET: (id) => `/api/v1/doctors/${id}`,
    UPDATE: (id) => `/api/v1/doctors/${id}`,
    DELETE: (id) => `/api/v1/doctors/${id}`,
    AVAILABILITY: (doctorId) => `/api/v1/doctors/${doctorId}/availability`,
    AVAILABILITY_SLOT: (doctorId, availabilityId) => `/api/v1/doctors/${doctorId}/availability/${availabilityId}`,
  },
  ATTACHMENTS: {
    PRESIGN: '/api/v1/attachments/presign',
    CONFIRM: '/api/v1/attachments',
    GET: (id) => `/api/v1/attachments/${id}`,
    FILE: (id) => `/api/v1/attachments/${id}/file`,
    DELETE: (id) => `/api/v1/attachments/${id}`,
    LOCAL_UPLOAD: '/api/v1/attachments/local-upload',
  },
  // المرضى
  PATIENTS: {
    LIST: '/api/v1/patients',
    CREATE: '/api/v1/patients',
    GET: (id) => `/api/v1/patients/${id}`,
    UPDATE: (id) => `/api/v1/patients/${id}`,
    DELETE: (id) => `/api/v1/patients/${id}`,
    MEDICAL_HISTORY: (patientId) => `/api/v1/patients/${patientId}/medical-history`,
    REPORTS: (patientId) => `/api/v1/patients/${patientId}/reports`,
    REPORT: (patientId, reportId) => `/api/v1/patients/${patientId}/reports/${reportId}`,
  },
  // الفواتير
  INVOICES: {
    LIST: '/api/v1/finance/invoices',
    CREATE: '/api/v1/finance/invoices',
    GET: (id) => `/api/v1/finance/invoices/${id}`,
    MARK_PAID: (id) => `/api/v1/finance/invoices/${id}/mark-paid`,
    CANCEL: (id) => `/api/v1/finance/invoices/${id}/cancel`,
  },
  // المدفوعات
  PAYMENTS: {
    LIST: '/api/v1/finance/payments',
    CREATE: '/api/v1/finance/payments',
    BY_PATIENT: (patientId) => `/api/v1/finance/patients/${patientId}/payments`,
    SUMMARY: (patientId) => `/api/v1/finance/patients/${patientId}/summary`,
  },
  // الخصومات
  DISCOUNTS: {
    REQUEST: '/api/v1/finance/discounts',
    PENDING: '/api/v1/finance/discounts/pending',
    APPROVE: (id) => `/api/v1/finance/discounts/${id}/approve`,
    REJECT: (id) => `/api/v1/finance/discounts/${id}/reject`,
  },
  // الروشتات
  PRESCRIPTIONS: {
    LIST: '/api/v1/prescriptions',
    CREATE: '/api/v1/prescriptions',
    GET: (id) => `/api/v1/prescriptions/${id}`,
    UPDATE: (id) => `/api/v1/prescriptions/${id}`,
    DELETE: (id) => `/api/v1/prescriptions/${id}`,
    BY_PATIENT: (id) => `/api/v1/prescriptions/patient/${id}`,
    BY_DOCTOR: (id) => `/api/v1/prescriptions/doctor/${id}`,
  },
  // الباقات
  PACKAGES: {
    LIST: '/api/v1/packages',
    CREATE: '/api/v1/packages',
    GET: (id) => `/api/v1/packages/${id}`,
    UPDATE: (id) => `/api/v1/packages/${id}`,
    DELETE: (id) => `/api/v1/packages/${id}`,
    ASSIGN: '/api/v1/packages/assign',
    COMPLETED_SESSIONS: '/api/v1/packages/assign/completed-sessions',
  },
  // باقات المرضى
  PATIENT_PACKAGES: {
    BY_PATIENT: (patientId) => `/api/v1/patient-packages/patient/${patientId}`,
    DEDUCT: (id) => `/api/v1/patient-packages/${id}/deduct`,
  },
  // الجدولة
  SCHEDULING: {
    SLOTS: '/api/v1/scheduling/slots',
    BULK: '/api/v1/scheduling/slots/bulk',
    AVAILABILITY: '/api/v1/scheduling/availability',
    SLOT: (id) => `/api/v1/scheduling/slots/${id}`,
    BOOK: (id) => `/api/v1/scheduling/slots/${id}/book`,
    CANCEL_BOOKING: (id) => `/api/v1/scheduling/slots/${id}/cancel-booking`,
  },
  // الجلسات
  SESSIONS: {
    LIST: '/api/v1/sessions',
    CREATE: '/api/v1/sessions',
    GET: (id) => `/api/v1/sessions/${id}`,
    UPDATE: (id) => `/api/v1/sessions/${id}`,
    DELETE: (id) => `/api/v1/sessions/${id}`,
    BY_PATIENT: (patientId) => `/api/v1/sessions/patient/${patientId}`,
    ATTENDANCE: (sessionId) => `/api/v1/sessions/${sessionId}/attendance`,
  },
  // قائمة الانتظار
  WAITLIST: {
    LIST: '/api/v1/waitlist',
    CREATE: '/api/v1/waitlist',
    GET: (id) => `/api/v1/waitlist/${id}`,
    UPDATE: (id) => `/api/v1/waitlist/${id}`,
    DELETE: (id) => `/api/v1/waitlist/${id}`,
    ASSIGN: (id) => `/api/v1/waitlist/${id}/assign`,
  },
  // الخدمات
  SERVICES: {
    LIST: '/api/v1/services',
    CREATE: '/api/v1/services',
    ACTIVE: '/api/v1/services/active',
    GET: (id) => `/api/v1/services/${id}`,
    UPDATE: (id) => `/api/v1/services/${id}`,
    DELETE: (id) => `/api/v1/services/${id}`,
  },
  // خطط العلاج
  TREATMENT_PLANS: {
    LIST: '/api/v1/treatment-plans',
    CREATE: '/api/v1/treatment-plans',
    BY_PATIENT: (patientId) => `/api/v1/treatment-plans/patient/${patientId}`,
    GET: (id) => `/api/v1/treatment-plans/${id}`,
    UPDATE: (id) => `/api/v1/treatment-plans/${id}`,
    DELETE: (id) => `/api/v1/treatment-plans/${id}`,
  },
  // المتابعات
  FOLLOW_UPS: {
    LIST: '/api/v1/follow-ups',
    CREATE: '/api/v1/follow-ups',
    PENDING: '/api/v1/follow-ups/pending',
    BY_PATIENT: (patientId) => `/api/v1/follow-ups/patient/${patientId}`,
    GET: (id) => `/api/v1/follow-ups/${id}`,
    UPDATE: (id) => `/api/v1/follow-ups/${id}`,
    DELETE: (id) => `/api/v1/follow-ups/${id}`,
    WHATSAPP_LOGS: (patientId) => `/api/v1/follow-ups/patient/${patientId}/whatsapp-logs`,
  },
  // التقارير
  REPORTS: {
    DAILY: '/api/v1/reports/daily',
    DOCTOR_UTILIZATION: '/api/v1/reports/doctor-utilization',
    CONVERSION_RATE: '/api/v1/reports/conversion-rate',
    PATIENT_SOURCE: '/api/v1/reports/patient-source',
    CAPACITY: '/api/v1/reports/capacity',
    ATTENDANCE: '/api/v1/reports/attendance',
    PACKAGES: '/api/v1/reports/packages',
    FINANCE: '/api/v1/reports/finance',
  },
  // WhatsApp
  WHATSAPP: {
    SEND: '/api/v1/whatsapp/send',
    SCHEDULE: '/api/v1/whatsapp/schedule',
    TEMPLATES: '/api/v1/whatsapp/templates',
    FLOWS: '/api/v1/whatsapp/flows',
    HISTORY: '/api/v1/whatsapp/history',
    CONTACTS: '/api/v1/whatsapp/contacts',
  },
  // التعاقدات
  CONTRACTS: {
    LIST: '/api/v1/contracts',
    CREATE: '/api/v1/contracts',
    ACTIVE: '/api/v1/contracts/active',
    STATS: '/api/v1/contracts/stats',
    GET: (id) => `/api/v1/contracts/${id}`,
    UPDATE: (id) => `/api/v1/contracts/${id}`,
    DELETE: (id) => `/api/v1/contracts/${id}`,
    RECORD_PAYMENT: (id) => `/api/v1/contracts/${id}/payment`,
    LETTERS: {
      ALL: '/api/v1/contracts/letters/all',
      BY_CONTRACT: (contractId) => `/api/v1/contracts/${contractId}/letters`,
      CREATE: '/api/v1/contracts/letters',
      GET: (id) => `/api/v1/contracts/letters/${id}`,
      UPDATE: (id) => `/api/v1/contracts/letters/${id}`,
      DELETE: (id) => `/api/v1/contracts/letters/${id}`,
    },
  },
  // أوامر الشراء
  PURCHASE_ORDERS: {
    LIST: '/api/v1/finance/purchase-orders',
    CREATE: '/api/v1/finance/purchase-orders',
  },
}

// رسائل الخطأ
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'فشل الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت',
  UNAUTHORIZED: 'جلسة غير مصرح بها، يرجى تسجيل الدخول مرة أخرى',
  FORBIDDEN: 'ليس لديك صلاحية للوصول إلى هذه البيانات',
  NOT_FOUND: 'البيانات المطلوبة غير موجودة',
  SERVER_ERROR: 'حدث خطأ في الخادم، يرجى المحاولة مرة أخرى',
  TIMEOUT: 'انتهى وقت الاتصال، يرجى المحاولة مرة أخرى',
  VALIDATION_ERROR: 'يرجى التحقق من البيانات المدخلة',
  DUPLICATE: 'البيانات موجودة مسبقاً',
}