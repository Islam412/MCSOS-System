// src/services/api/config.js

// تكوين API
export const API_CONFIG = {
  BASE_URL: 'https://medical-center-app-production.up.railway.app/api',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

// نقاط النهاية (Endpoints)
export const ENDPOINTS = {
  // المصادقة
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  // المستخدمين
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id) => '/users/' + id,
    DELETE: (id) => '/users/' + id,
    BLOCK: (id) => '/users/' + id + '/block',
    UNBLOCK: (id) => '/users/' + id + '/unblock',
    CHANGE_PASSWORD: (id) => '/users/' + id + '/change-password',
    RESET_PASSWORD: (id) => '/users/' + id + '/reset-password',
  },
  // الأطباء
  DOCTORS: {
    LIST: '/doctors',
    CREATE: '/doctors',
    UPDATE: (id) => '/doctors/' + id,
    DELETE: (id) => '/doctors/' + id,
    SLOTS: (id) => '/doctors/' + id + '/slots',
    AVAILABLE: '/doctors/available',
    STATS: '/doctors/stats',
  },
  // المرضى
  PATIENTS: {
    LIST: '/patients',
    CREATE: '/patients',
    UPDATE: (id) => '/patients/' + id,
    DELETE: (id) => '/patients/' + id,
    SEARCH: '/patients/search',
    STATS: '/patients/stats',
    PROGRESS: (id) => '/patients/' + id + '/progress',
    SESSIONS: (id) => '/patients/' + id + '/sessions',
  },
  // المواعيد
  APPOINTMENTS: {
    LIST: '/appointments',
    CREATE: '/appointments',
    UPDATE: (id) => '/appointments/' + id,
    DELETE: (id) => '/appointments/' + id,
    BOOK: '/appointments/book',
    CONFIRM: (id) => '/appointments/' + id + '/confirm',
    CANCEL: (id) => '/appointments/' + id + '/cancel',
    CHECK_IN: (id) => '/appointments/' + id + '/check-in',
    AVAILABLE_SLOTS: '/appointments/available-slots',
    TODAY: '/appointments/today',
    STATS: '/appointments/stats',
  },
  // الفواتير
  INVOICES: {
    LIST: '/invoices',
    CREATE: '/invoices',
    UPDATE: (id) => '/invoices/' + id,
    DELETE: (id) => '/invoices/' + id,
    GENERATE: '/invoices/generate',
    PDF: (id) => '/invoices/' + id + '/pdf',
    STATS: '/invoices/stats',
    MARK_PAID: (id) => '/invoices/' + id + '/paid',
  },
  // الروشتات
  PRESCRIPTIONS: {
    LIST: '/prescriptions',
    CREATE: '/prescriptions',
    UPDATE: (id) => '/prescriptions/' + id,
    DELETE: (id) => '/prescriptions/' + id,
    BY_PATIENT: (id) => '/prescriptions/patient/' + id,
    BY_DOCTOR: (id) => '/prescriptions/doctor/' + id,
    PRINT: (id) => '/prescriptions/' + id + '/print',
  },
  // الباقات
  PACKAGES: {
    LIST: '/packages',
    CREATE: '/packages',
    UPDATE: (id) => '/packages/' + id,
    DELETE: (id) => '/packages/' + id,
  },
  // الصور والملفات
  FILES: {
    UPLOAD: '/upload',
    DELETE: (id) => '/files/' + id,
    DOWNLOAD: (id) => '/files/' + id + '/download',
    PATIENT_FILES: (id) => '/files/patient/' + id,
  },
  // WhatsApp
  WHATSAPP: {
    SEND: '/whatsapp/send',
    SCHEDULE: '/whatsapp/schedule',
    TEMPLATES: '/whatsapp/templates',
    FLOWS: '/whatsapp/flows',
    HISTORY: '/whatsapp/history',
    CONTACTS: '/whatsapp/contacts',
  },
  // الإحصائيات
  STATS: {
    DASHBOARD: '/stats/dashboard',
    DOCTOR: '/stats/doctor',
    RECEPTION: '/stats/reception',
    FINANCE: '/stats/finance',
    OPERATIONS: '/stats/operations',
  },
  // التقارير
  REPORTS: {
    GENERATE: '/reports/generate',
    DOWNLOAD: (id) => '/reports/' + id + '/download',
    LIST: '/reports',
  },
  // الإعدادات
  SETTINGS: {
    HOSPITAL: '/settings/hospital',
    USER_PREFERENCES: '/settings/preferences',
    THEME: '/settings/theme',
    LANGUAGE: '/settings/language',
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