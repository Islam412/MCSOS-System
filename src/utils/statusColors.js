// src/utils/statusColors.js
// Phase 13: Standardized Color Mapping for Statuses across all modules

export const STATUS_COLORS = {
  AVAILABLE: {
    key: 'available',
    labelAr: 'متاح للحجز',
    labelEn: 'Available',
    colorClass: 'bg-emerald-500 text-white border-emerald-600',
    hex: '#10B981'
  },
  CHECKED_IN: {
    key: 'checked_in',
    labelAr: 'تسجيل دخول (Checked In)',
    labelEn: 'Checked In',
    colorClass: 'bg-blue-600 text-white border-blue-700',
    hex: '#2563EB'
  },
  IN_PROGRESS: {
    key: 'in_progress',
    labelAr: 'جلسة جارية (In Progress)',
    labelEn: 'In Progress',
    colorClass: 'bg-orange-500 text-white border-orange-600 animate-pulse',
    hex: '#F97316'
  },
  COMPLETED: {
    key: 'completed',
    labelAr: 'مكتملة',
    labelEn: 'Completed',
    colorClass: 'bg-gray-500 text-white border-gray-600',
    hex: '#6B7280'
  },
  PAYMENT_PENDING: {
    key: 'payment_pending',
    labelAr: 'في انتظار الدفعة',
    labelEn: 'Payment Pending',
    colorClass: 'bg-yellow-400 text-yellow-950 font-bold border-yellow-500',
    hex: '#EAB308'
  },
  AWAITING_FINANCE_APPROVAL: {
    key: 'awaiting_finance_approval',
    labelAr: 'في انتظار اعتماد المالية',
    labelEn: 'Awaiting Finance Approval',
    colorClass: 'bg-purple-600 text-white font-bold border-purple-700',
    hex: '#9333EA'
  },
  CANCELLED: {
    key: 'cancelled',
    labelAr: 'ملغاة',
    labelEn: 'Cancelled',
    colorClass: 'bg-rose-600 text-white border-rose-700',
    hex: '#E11D48'
  },
  NO_SHOW: {
    key: 'no_show',
    labelAr: 'عدم حضور (No Show)',
    labelEn: 'No Show',
    colorClass: 'bg-red-900 text-white font-extrabold border-red-950',
    hex: '#7F1D1D'
  },
  FULLY_BOOKED: {
    key: 'fully_booked',
    labelAr: 'مكتمل العدد (Fully Booked)',
    labelEn: 'Fully Booked',
    colorClass: 'bg-black text-white dark:bg-gray-950 border-gray-800',
    hex: '#000000'
  },
  PACKAGE_ENDING_SOON: {
    key: 'package_ending_soon',
    labelAr: 'الباقة على وشك الانتهاء',
    labelEn: 'Package Ending Soon',
    colorClass: 'bg-amber-600 text-white font-bold border-amber-700 animate-bounce',
    hex: '#D97706'
  }
};

/**
 * Get color styling object by status string or code
 */
export function getStatusColor(status) {
  if (!status) return STATUS_COLORS.AVAILABLE;
  const s = status.toString().toUpperCase().replace(/[-\s]/g, '_');
  
  if (s.includes('CHECK') && s.includes('IN')) return STATUS_COLORS.CHECKED_IN;
  if (s === 'CONFIRMED' || s === 'AVAILABLE') return STATUS_COLORS.AVAILABLE;
  if (s === 'IN_PROGRESS' || s === 'ACTIVE' || s === 'ONGOING') return STATUS_COLORS.IN_PROGRESS;
  if (s === 'COMPLETED' || s === 'ATTENDED' || s === 'DONE') return STATUS_COLORS.COMPLETED;
  if (s.includes('PAYMENT_PENDING') || s.includes('UNPAID')) return STATUS_COLORS.PAYMENT_PENDING;
  if (s.includes('FINANCE') || s.includes('AWAITING')) return STATUS_COLORS.AWAITING_FINANCE_APPROVAL;
  if (s.includes('CANCEL') || s === 'CANCELED') return STATUS_COLORS.CANCELLED;
  if (s.includes('NO_SHOW') || s.includes('MISS') || s.includes('ABSENT')) return STATUS_COLORS.NO_SHOW;
  if (s.includes('FULL') || s.includes('BOOKED')) return STATUS_COLORS.FULLY_BOOKED;
  if (s.includes('ENDING') || s.includes('RENEW') || s.includes('SOON')) return STATUS_COLORS.PACKAGE_ENDING_SOON;

  return STATUS_COLORS.AVAILABLE;
}

/**
 * Phase 9 & 10: Capacity indicator calculation
 * Returns 🟢 Green (Available), 🟡 Yellow (Almost Full ≥ 70%), 🔴 Red (Fully Booked ≥ 95%)
 */
export function getCapacityIndicator(current, max = 20) {
  const percentage = Math.round((current / max) * 100);
  if (percentage >= 95) {
    return {
      status: 'FULLY_BOOKED',
      color: 'red',
      indicator: '🔴',
      labelAr: 'ممتلئ بالكامل',
      labelEn: 'Fully Booked',
      barClass: 'bg-rose-600',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300',
      percentage
    };
  } else if (percentage >= 70) {
    return {
      status: 'ALMOST_FULL',
      color: 'yellow',
      indicator: '🟡',
      labelAr: 'وشك الامتلائ (أصبح مزدحمًا)',
      labelEn: 'Almost Full',
      barClass: 'bg-amber-500',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
      percentage
    };
  } else {
    return {
      status: 'AVAILABLE',
      color: 'green',
      indicator: '🟢',
      labelAr: 'متاح وفيه سعة كافية',
      labelEn: 'Available',
      barClass: 'bg-emerald-500',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
      percentage
    };
  }
}
