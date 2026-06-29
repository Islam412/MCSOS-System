// src/services/api/config.js

// تكوين API
export const API_CONFIG = {
  // ✅ BASE_URL بدون /api في النهاية لتجنب التكرار
  BASE_URL: 'https://medical-center-app-production.up.railway.app',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

// نقاط النهاية (Endpoints) - ✅ تم التحديث حسب Swagger مع إضافة /api/v1
export const ENDPOINTS = {
  // المصادقة
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
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
    BLOCK: (id) => `/api/v1/users/${id}/block`,
    UNBLOCK: (id) => `/api/v1/users/${id}/unblock`,
    ASSIGN_ROLE: '/api/v1/users/assign-role',
    CHANGE_PASSWORD: (id) => `/api/v1/users/${id}/change-password`,
    RESET_PASSWORD: (id) => `/api/v1/users/${id}/reset-password`,
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
    AVAILABLE: '/api/v1/doctors/available',
    STATS: '/api/v1/doctors/stats',
  },
  // المرضى
  PATIENTS: {
    LIST: '/api/v1/patients',
    CREATE: '/api/v1/patients',
    GET: (id) => `/api/v1/patients/${id}`,
    UPDATE: (id) => `/api/v1/patients/${id}`,
    DELETE: (id) => `/api/v1/patients/${id}`,
    SEARCH: '/api/v1/patients/search',
    STATS: '/api/v1/patients/stats',
    MEDICAL_HISTORY: (patientId) => `/api/v1/patients/${patientId}/medical-history`,
    PROGRESS: (id) => `/api/v1/patients/${id}/progress`,
    SESSIONS: (id) => `/api/v1/patients/${id}/sessions`,
  },
  // المواعيد
  APPOINTMENTS: {
    LIST: '/api/v1/appointments',
    CREATE: '/api/v1/appointments',
    GET: (id) => `/api/v1/appointments/${id}`,
    UPDATE: (id) => `/api/v1/appointments/${id}`,
    DELETE: (id) => `/api/v1/appointments/${id}`,
    BOOK: '/api/v1/appointments/book',
    CONFIRM: (id) => `/api/v1/appointments/${id}/confirm`,
    CANCEL: (id) => `/api/v1/appointments/${id}/cancel`,
    CHECK_IN: (id) => `/api/v1/appointments/${id}/check-in`,
    AVAILABLE_SLOTS: '/api/v1/appointments/available-slots',
    TODAY: '/api/v1/appointments/today',
    STATS: '/api/v1/appointments/stats',
  },
  // الفواتير
  INVOICES: {
    LIST: '/api/v1/finance/invoices',
    CREATE: '/api/v1/finance/invoices',
    GET: (id) => `/api/v1/finance/invoices/${id}`,
    MARK_PAID: (id) => `/api/v1/finance/invoices/${id}/mark-paid`,
    CANCEL: (id) => `/api/v1/finance/invoices/${id}/cancel`,
    STATS: '/api/v1/finance/invoices/stats',
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
    PRINT: (id) => `/api/v1/prescriptions/${id}/print`,
  },
  // الباقات
  PACKAGES: {
    LIST: '/api/v1/packages',
    CREATE: '/api/v1/packages',
    GET: (id) => `/api/v1/packages/${id}`,
    UPDATE: (id) => `/api/v1/packages/${id}`,
    DELETE: (id) => `/api/v1/packages/${id}`,
    ASSIGN: '/api/v1/packages/assign',
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
    GENERATE: '/api/v1/reports/generate',
    DOWNLOAD: (id) => `/api/v1/reports/${id}/download`,
    LIST: '/api/v1/reports',
  },
  // الصور والملفات
  FILES: {
    UPLOAD: '/api/v1/upload',
    DELETE: (id) => `/api/v1/files/${id}`,
    DOWNLOAD: (id) => `/api/v1/files/${id}/download`,
    PATIENT_FILES: (id) => `/api/v1/files/patient/${id}`,
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
  // الإحصائيات
  STATS: {
    DASHBOARD: '/api/v1/stats/dashboard',
    DOCTOR: '/api/v1/stats/doctor',
    RECEPTION: '/api/v1/stats/reception',
    FINANCE: '/api/v1/stats/finance',
    OPERATIONS: '/api/v1/stats/operations',
  },
  // الإعدادات
  SETTINGS: {
    HOSPITAL: '/api/v1/settings/hospital',
    USER_PREFERENCES: '/api/v1/settings/preferences',
    THEME: '/api/v1/settings/theme',
    LANGUAGE: '/api/v1/settings/language',
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