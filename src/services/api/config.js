// src/services/api/config.js

// تكوين API
export const API_CONFIG = {
  // ✅ استخدم الرابط الكامل للـ Backend (Railway)
  BASE_URL: 'https://medical-center-app-production.up.railway.app/api',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

// نقاط النهاية (Endpoints) - ✅ تم التحديث حسب Swagger
export const ENDPOINTS = {
  // المصادقة
  AUTH: {
    LOGIN: '/v1/auth/login',
    REGISTER: '/v1/auth/register',
    LOGOUT: '/v1/auth/logout',
    REFRESH: '/v1/auth/refresh',
    ME: '/v1/auth/me',
    FORGOT_PASSWORD: '/v1/auth/forgot-password',
    RESET_PASSWORD: '/v1/auth/reset-password',
  },
  // المستخدمين
  USERS: {
    LIST: '/v1/users',
    CREATE: '/v1/users',
    GET: (id) => '/v1/users/' + id,
    UPDATE: (id) => '/v1/users/' + id,
    DELETE: (id) => '/v1/users/' + id,
    BLOCK: (id) => '/v1/users/' + id + '/block',
    UNBLOCK: (id) => '/v1/users/' + id + '/unblock',
    ASSIGN_ROLE: '/v1/users/assign-role',
    CHANGE_PASSWORD: (id) => '/v1/users/' + id + '/change-password',
    RESET_PASSWORD: (id) => '/v1/users/' + id + '/reset-password',
  },
  // الأطباء
  DOCTORS: {
    LIST: '/v1/doctors',
    CREATE: '/v1/doctors',
    GET: (id) => '/v1/doctors/' + id,
    UPDATE: (id) => '/v1/doctors/' + id,
    DELETE: (id) => '/v1/doctors/' + id,
    AVAILABILITY: (doctorId) => '/v1/doctors/' + doctorId + '/availability',
    AVAILABILITY_SLOT: (doctorId, availabilityId) => '/v1/doctors/' + doctorId + '/availability/' + availabilityId,
    AVAILABLE: '/v1/doctors/available',
    STATS: '/v1/doctors/stats',
  },
  // المرضى
  PATIENTS: {
    LIST: '/v1/patients',
    CREATE: '/v1/patients',
    GET: (id) => '/v1/patients/' + id,
    UPDATE: (id) => '/v1/patients/' + id,
    DELETE: (id) => '/v1/patients/' + id,
    SEARCH: '/v1/patients/search',
    STATS: '/v1/patients/stats',
    MEDICAL_HISTORY: (patientId) => '/v1/patients/' + patientId + '/medical-history',
    PROGRESS: (id) => '/v1/patients/' + id + '/progress',
    SESSIONS: (id) => '/v1/patients/' + id + '/sessions',
  },
  // المواعيد
  APPOINTMENTS: {
    LIST: '/v1/appointments',
    CREATE: '/v1/appointments',
    GET: (id) => '/v1/appointments/' + id,
    UPDATE: (id) => '/v1/appointments/' + id,
    DELETE: (id) => '/v1/appointments/' + id,
    BOOK: '/v1/appointments/book',
    CONFIRM: (id) => '/v1/appointments/' + id + '/confirm',
    CANCEL: (id) => '/v1/appointments/' + id + '/cancel',
    CHECK_IN: (id) => '/v1/appointments/' + id + '/check-in',
    AVAILABLE_SLOTS: '/v1/appointments/available-slots',
    TODAY: '/v1/appointments/today',
    STATS: '/v1/appointments/stats',
  },
  // الفواتير
  INVOICES: {
    LIST: '/v1/finance/invoices',
    CREATE: '/v1/finance/invoices',
    GET: (id) => '/v1/finance/invoices/' + id,
    MARK_PAID: (id) => '/v1/finance/invoices/' + id + '/mark-paid',
    CANCEL: (id) => '/v1/finance/invoices/' + id + '/cancel',
    STATS: '/v1/finance/invoices/stats',
  },
  // المدفوعات
  PAYMENTS: {
    LIST: '/v1/finance/payments',
    CREATE: '/v1/finance/payments',
    BY_PATIENT: (patientId) => '/v1/finance/patients/' + patientId + '/payments',
    SUMMARY: (patientId) => '/v1/finance/patients/' + patientId + '/summary',
  },
  // الخصومات
  DISCOUNTS: {
    REQUEST: '/v1/finance/discounts',
    PENDING: '/v1/finance/discounts/pending',
    APPROVE: (id) => '/v1/finance/discounts/' + id + '/approve',
    REJECT: (id) => '/v1/finance/discounts/' + id + '/reject',
  },
  // الروشتات
  PRESCRIPTIONS: {
    LIST: '/v1/prescriptions',
    CREATE: '/v1/prescriptions',
    GET: (id) => '/v1/prescriptions/' + id,
    UPDATE: (id) => '/v1/prescriptions/' + id,
    DELETE: (id) => '/v1/prescriptions/' + id,
    BY_PATIENT: (id) => '/v1/prescriptions/patient/' + id,
    BY_DOCTOR: (id) => '/v1/prescriptions/doctor/' + id,
    PRINT: (id) => '/v1/prescriptions/' + id + '/print',
  },
  // الباقات
  PACKAGES: {
    LIST: '/v1/packages',
    CREATE: '/v1/packages',
    GET: (id) => '/v1/packages/' + id,
    UPDATE: (id) => '/v1/packages/' + id,
    DELETE: (id) => '/v1/packages/' + id,
    ASSIGN: '/v1/packages/assign',
  },
  // باقات المرضى
  PATIENT_PACKAGES: {
    BY_PATIENT: (patientId) => '/v1/patient-packages/patient/' + patientId,
    DEDUCT: (id) => '/v1/patient-packages/' + id + '/deduct',
  },
  // الجدولة
  SCHEDULING: {
    SLOTS: '/v1/scheduling/slots',
    BULK: '/v1/scheduling/slots/bulk',
    AVAILABILITY: '/v1/scheduling/availability',
    SLOT: (id) => '/v1/scheduling/slots/' + id,
    BOOK: (id) => '/v1/scheduling/slots/' + id + '/book',
    CANCEL_BOOKING: (id) => '/v1/scheduling/slots/' + id + '/cancel-booking',
  },
  // الجلسات
  SESSIONS: {
    LIST: '/v1/sessions',
    CREATE: '/v1/sessions',
    GET: (id) => '/v1/sessions/' + id,
    UPDATE: (id) => '/v1/sessions/' + id,
    DELETE: (id) => '/v1/sessions/' + id,
    BY_PATIENT: (patientId) => '/v1/sessions/patient/' + patientId,
    ATTENDANCE: (sessionId) => '/v1/sessions/' + sessionId + '/attendance',
  },
  // قائمة الانتظار
  WAITLIST: {
    LIST: '/v1/waitlist',
    CREATE: '/v1/waitlist',
    GET: (id) => '/v1/waitlist/' + id,
    UPDATE: (id) => '/v1/waitlist/' + id,
    DELETE: (id) => '/v1/waitlist/' + id,
  },
  // الخدمات
  SERVICES: {
    LIST: '/v1/services',
    CREATE: '/v1/services',
    ACTIVE: '/v1/services/active',
    GET: (id) => '/v1/services/' + id,
    UPDATE: (id) => '/v1/services/' + id,
    DELETE: (id) => '/v1/services/' + id,
  },
  // خطط العلاج
  TREATMENT_PLANS: {
    LIST: '/v1/treatment-plans',
    CREATE: '/v1/treatment-plans',
    BY_PATIENT: (patientId) => '/v1/treatment-plans/patient/' + patientId,
    GET: (id) => '/v1/treatment-plans/' + id,
    UPDATE: (id) => '/v1/treatment-plans/' + id,
    DELETE: (id) => '/v1/treatment-plans/' + id,
  },
  // المتابعات
  FOLLOW_UPS: {
    LIST: '/v1/follow-ups',
    CREATE: '/v1/follow-ups',
    PENDING: '/v1/follow-ups/pending',
    BY_PATIENT: (patientId) => '/v1/follow-ups/patient/' + patientId,
    GET: (id) => '/v1/follow-ups/' + id,
    UPDATE: (id) => '/v1/follow-ups/' + id,
    DELETE: (id) => '/v1/follow-ups/' + id,
    WHATSAPP_LOGS: (patientId) => '/v1/follow-ups/patient/' + patientId + '/whatsapp-logs',
  },
  // التقارير
  REPORTS: {
    DAILY: '/v1/reports/daily',
    DOCTOR_UTILIZATION: '/v1/reports/doctor-utilization',
    CONVERSION_RATE: '/v1/reports/conversion-rate',
    GENERATE: '/v1/reports/generate',
    DOWNLOAD: (id) => '/v1/reports/' + id + '/download',
    LIST: '/v1/reports',
  },
  // الصور والملفات
  FILES: {
    UPLOAD: '/v1/upload',
    DELETE: (id) => '/v1/files/' + id,
    DOWNLOAD: (id) => '/v1/files/' + id + '/download',
    PATIENT_FILES: (id) => '/v1/files/patient/' + id,
  },
  // WhatsApp
  WHATSAPP: {
    SEND: '/v1/whatsapp/send',
    SCHEDULE: '/v1/whatsapp/schedule',
    TEMPLATES: '/v1/whatsapp/templates',
    FLOWS: '/v1/whatsapp/flows',
    HISTORY: '/v1/whatsapp/history',
    CONTACTS: '/v1/whatsapp/contacts',
  },
  // الإحصائيات
  STATS: {
    DASHBOARD: '/v1/stats/dashboard',
    DOCTOR: '/v1/stats/doctor',
    RECEPTION: '/v1/stats/reception',
    FINANCE: '/v1/stats/finance',
    OPERATIONS: '/v1/stats/operations',
  },
  // الإعدادات
  SETTINGS: {
    HOSPITAL: '/v1/settings/hospital',
    USER_PREFERENCES: '/v1/settings/preferences',
    THEME: '/v1/settings/theme',
    LANGUAGE: '/v1/settings/language',
  },
  // أوامر الشراء
  PURCHASE_ORDERS: {
    LIST: '/v1/finance/purchase-orders',
    CREATE: '/v1/finance/purchase-orders',
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