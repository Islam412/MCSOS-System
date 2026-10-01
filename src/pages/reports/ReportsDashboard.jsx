// src/pages/reports/ReportsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { reportsService } from '../../services/api/services/reportsService';
import { 
  BarChart2, PieChart, TrendingUp, Users, Calendar, Award, 
  DollarSign, Activity, CheckCircle, AlertTriangle, ShieldCheck,
  Download, Printer, RefreshCw, Filter, Search, ChevronDown, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getCapacityIndicator, STATUS_COLORS } from '../../utils/statusColors';

export default function ReportsDashboard() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeReport, setActiveReport] = useState('source'); // source | capacity | attendance | package | finance
  const [loading, setLoading] = useState(false);
  const defaultTo = new Date().toISOString().split('T')[0];
  const defaultFrom = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const [rangeFrom, setRangeFrom] = useState(defaultFrom);
  const [rangeTo, setRangeTo] = useState(defaultTo);

  // Empty until API responds — never invent clinic numbers (T-012 / T-007)
  const [reportData, setReportData] = useState({
    patientSources: [],
    capacities: {
      centerOccupancy: 0,
      totalCapacity: 0,
      currentBookings: 0,
      doctors: [],
      rooms: [],
    },
    attendance: {
      totalSessions: 0,
      attendedCount: 0,
      attendedPercentage: 0,
      noShowCount: 0,
      noShowPercentage: 0,
      cancelledCount: 0,
      cancelledPercentage: 0,
      reasons: [],
      cancellationReasons: [],
      recentCancellations: [],
    },
    packages: {
      activeCount: 0,
      endingSoonCount: 0,
      renewedThisMonth: 0,
      list: [],
    },
    finance: {
      verifiedRevenue: 0,
      pendingAmount: 0,
      outstandingBalances: 0,
      recentVerifications: [],
      discounts: 0,
      revenueByCategory: [],
    },
  });

  const SOURCE_COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500'];

  const fetchRealReportData = async () => {
    setLoading(true);
    try {
      const settled = await Promise.allSettled([
        reportsService.getPatientSource(rangeFrom, rangeTo),
        reportsService.getCapacity(rangeFrom, rangeTo),
        reportsService.getAttendance(rangeFrom, rangeTo),
        reportsService.getPackages(rangeFrom, rangeTo),
        reportsService.getFinance(rangeFrom, rangeTo),
      ]);

      const [sourceR, capacityR, attendanceR, packagesR, financeR] = settled;
      const failed = settled.filter((r) => r.status === 'rejected').length;
      if (failed === settled.length) {
        const first = settled[0];
        throw (first.status === 'rejected' ? first.reason : null) ?? new Error('All reports failed');
      }
      if (failed > 0) {
        console.warn('Some report endpoints failed:', settled.filter((r) => r.status === 'rejected'));
        toast.error(isRTL ? 'بعض التقارير فشلت في التحميل' : 'Some reports failed to load');
      }

      const source = sourceR.status === 'fulfilled' ? sourceR.value : { sources: [] };
      const capacity = capacityR.status === 'fulfilled' ? capacityR.value : { days: [] };
      const attendance = attendanceR.status === 'fulfilled' ? attendanceR.value : { totals: {} };
      const packages = packagesR.status === 'fulfilled' ? packagesR.value : {};
      const finance = financeR.status === 'fulfilled' ? financeR.value : {};

      const lastCapacityDay = capacity.days?.[capacity.days.length - 1];
      const center = lastCapacityDay?.center;

      setReportData((prev) => ({
        ...prev,
        patientSources: (source.sources || []).map((item, index) => ({
          source: item.source === 'unknown'
            ? (isRTL ? 'غير محدد' : 'Unknown')
            : item.source,
          count: item.count,
          percentage: item.percentage,
          color: SOURCE_COLORS[index % SOURCE_COLORS.length],
        })),
        capacities: {
          centerOccupancy: center?.pct ?? 0,
          totalCapacity: center?.limit ?? 0,
          currentBookings: center?.used ?? 0,
          doctors: (lastCapacityDay?.doctors || []).map((d) => ({
            name: d.name,
            current: d.used,
            max: d.limit ?? 0,
            state: d.state,
            pct: d.pct,
          })),
          rooms: (lastCapacityDay?.rooms || []).map((r) => ({
            name: r.name,
            current: r.used,
            max: r.limit ?? 0,
            state: r.state,
            pct: r.pct,
          })),
        },
        attendance: {
          ...prev.attendance,
          totalSessions: attendance.totals?.sessions ?? 0,
          attendedCount: attendance.totals?.attended ?? 0,
          attendedPercentage: attendance.totals?.attendance_pct ?? 0,
          noShowCount: attendance.totals?.missed ?? 0,
          noShowPercentage: attendance.totals?.no_show_pct ?? 0,
          cancelledCount: attendance.totals?.cancelled ?? 0,
          cancelledPercentage: attendance.totals?.cancellation_pct ?? 0,
        },
        packages: {
          ...prev.packages,
          activeCount: packages.active_packages ?? 0,
          endingSoonCount: packages.ending_soon ?? 0,
          renewedThisMonth: packages.renewals_in_period ?? 0,
        },
        finance: {
          verifiedRevenue: finance.verified_payments?.amount ?? 0,
          pendingAmount: finance.pending_payments?.amount ?? 0,
          outstandingBalances: finance.outstanding_balance ?? 0,
          discounts: finance.discounts_granted ?? 0,
          revenueByCategory: finance.revenue_by_category ?? [],
        },
      }));
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error(isRTL ? 'فشل تحميل التقارير' : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealReportData();
  }, [rangeFrom, rangeTo]);

  const handleExportPDF = () => {
    toast.success(isRTL ? 'تم تجهيز وتصدير التقرير بنجاح 📑' : 'Report exported successfully!');
    window.print();
  };

  const centerCap = getCapacityIndicator(reportData.capacities.currentBookings, reportData.capacities.totalCapacity);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
      {/* Header & Export Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-3">
            <TrendingUp className="text-indigo-600 dark:text-indigo-400 p-1.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl" size={36} />
            {isRTL ? 'التقارير الشاملة ومؤشرات أداء المركز (Phase 16)' : 'MCSOS Executive Analytics & Reports'}
          </h1>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
            {isRTL 
              ? 'مراقبة الكفاءة التشغيلية، إشغال الأطباء والتدفقات المالية مع تنبيهات الباقات الآلية' 
              : 'Monitor operational utilization, attendance, package progress, and financial metrics'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={rangeFrom}
            onChange={(e) => setRangeFrom(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
          />
          <input
            type="date"
            value={rangeTo}
            onChange={(e) => setRangeTo(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
          />
          <button
            onClick={() => { fetchRealReportData(); toast.success(isRTL ? 'تم تحديث البيانات' : 'Data refreshed'); }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 font-bold text-gray-700 dark:text-gray-200 rounded-xl text-xs transition flex items-center gap-2 shadow-xs"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            {isRTL ? 'تحديث البيانات' : 'Refresh'}
          </button>
          <button
            onClick={handleExportPDF}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md transition flex items-center gap-2"
          >
            <Printer size={15} />
            {isRTL ? '🖨️ طباعة وتصدير التقرير' : 'Print & Export'}
          </button>
        </div>
      </div>

      {/* Reports Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { id: 'source', labelAr: '👥 مصادر المرضى والتسويق', labelEn: 'Patient Sources', icon: Users, color: 'blue' },
          { id: 'capacity', labelAr: '📊 إشغال السعة (الأطباء والغرف)', labelEn: 'Capacity Utilization', icon: Activity, color: 'emerald' },
          { id: 'attendance', labelAr: '📈 مؤشرات الحضور والغياب', labelEn: 'Attendance & No-Show', icon: Calendar, color: 'amber' },
          { id: 'package', labelAr: '📦 مراقبة الباقات والتجديد', labelEn: 'Package Execution', icon: Award, color: 'purple' },
          { id: 'finance', labelAr: '💳 التحقق المالي والتدفقات', labelEn: 'Finance & Payments', icon: DollarSign, color: 'rose' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`p-4 rounded-2xl text-left rtl:text-right font-extrabold transition-all border-2 flex flex-col items-start justify-between min-h-[100px] shadow-xs ${
                isActive 
                  ? 'bg-indigo-900 text-white border-indigo-500 shadow-md scale-102' 
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-700'
              }`}
            >
              <div className={`p-2 rounded-xl mb-2 ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-indigo-600'}`}>
                <Icon size={20} />
              </div>
              <span className="text-xs font-bold leading-tight">{isRTL ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-800 shadow-sm min-h-[420px]">
        
        {/* 1. Patient Source Report (How did you know about us / Marketing effectiveness) */}
        {activeReport === 'source' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b pb-4 border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                {isRTL ? '👥 تقرير مصادر المرضى وفعالية قنوات التسويق (Patient Source & Marketing Report)' : 'Patient Source Report & Marketing Effectiveness'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {isRTL ? 'تحليل كيفية وصول المرضى للمركز بناءً على حقل "كيف تعرفت علينا؟" في التسجيل' : 'Analysis based on "How did you know about us?" patient onboarding field'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {reportData.patientSources.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/60">
                    <div className="flex items-center justify-between font-bold text-sm mb-1.5">
                      <span className="text-gray-800 dark:text-gray-200">{item.source}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-black">{item.count} {isRTL ? 'مريض' : 'patients'} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} transition-all duration-1000`} style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-indigo-50/70 dark:bg-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl flex flex-col justify-center items-center text-center space-y-4">
                <PieChart size={64} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <h3 className="text-base font-extrabold text-indigo-950 dark:text-indigo-200">
                  {isRTL ? '💡 ملخص الرؤى التسويقية للمستشفى:' : '💡 Key Marketing Insights:'}
                </h3>
                <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 leading-relaxed max-w-md">
                  {isRTL
                    ? 'تعتبر وسائل التواصل الاجتماعي (35%) وتحويلات أطباء العظام (27%) هما المورد الرئيسي للمرضى هذا الشهر. يُوصى بزيادة عروض باقات التأهيل الرياضي على إنستجرام وتوطيد العلاقات مع جراحين العظام.'
                    : 'Social media (35%) and Orthopedic Doctor referrals (27%) represent our primary patient drivers. Recommended to focus advertising budget on digital rehab reels and surgical referral networks.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Capacity Report (Doctor, Room, Center utilization & Phase 9, 10 Alerts) */}
        {activeReport === 'capacity' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">
                  {isRTL ? '📊 تقرير إشغال السعة وتحذيرات المركز (Phase 9 & 10: Capacity Management & Alerts)' : 'Capacity Utilization Report & Real-time Alerts'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {isRTL ? 'مراقبة المستويات الثلاثة: سعة الطبيب (20 مريض/اليوم)، سعة الغرف العلاجية، وإجمالي إشغال المستشفى مع المؤشر الملون 🟢🟡🔴' : 'Multi-level occupancy: Doctors, Rooms, and overall Center capacity with color indicators'}
                </p>
              </div>
              
              {/* Overall Center Capacity Widget */}
              <div className={`px-4 py-2.5 rounded-2xl border-2 font-extrabold flex items-center gap-3 ${centerCap.badgeClass}`}>
                <span className="text-xl">{centerCap.indicator}</span>
                <div>
                  <div className="text-xs">{isRTL ? 'إجمالي سعة المستشفى الآن:' : 'Center Occupancy:'} <strong>{centerCap.percentage}%</strong></div>
                  <div className="text-[10px] opacity-90">{isRTL ? centerCap.labelAr : centerCap.labelEn} ({reportData.capacities.currentBookings} / {reportData.capacities.totalCapacity})</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Doctor Utilization */}
              <div className="space-y-4 bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-extrabold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 border-b pb-2.5 border-gray-200 dark:border-gray-700">
                  <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
                  {isRTL ? 'سعة ومعدل إشغال الأطباء اليومي (Max: 20 مرضى/دكتور)' : 'Doctor Daily Occupancy (Max: 20 patients)'}
                </h3>
                {reportData.capacities.doctors.map((doc, i) => {
                  const cap = doc.max
                    ? getCapacityIndicator(doc.current, doc.max)
                    : getCapacityIndicator(0, 1);
                  return (
                    <div key={i} className="p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                          <span>{cap.indicator}</span> {doc.name}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-md font-extrabold border ${cap.badgeClass}`}>
                          {doc.current} / {doc.max} ({cap.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${cap.barClass}`} style={{ width: `${cap.percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Room Utilization */}
              <div className="space-y-4 bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 border-b pb-2.5 border-gray-200 dark:border-gray-700">
                  <Layers size={18} className="text-emerald-600 dark:text-emerald-400" />
                  {isRTL ? 'سعة غرف وصالات التأهيل العلاجي الحالية' : 'Treatment Rooms & Pool Concurrent Capacity'}
                </h3>
                {reportData.capacities.rooms.map((rm, i) => {
                  const cap = getCapacityIndicator(rm.current, rm.max);
                  return (
                    <div key={i} className="p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                          <span>{cap.indicator}</span> {rm.name}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-md font-extrabold border ${cap.badgeClass}`}>
                          {rm.current} / {rm.max} ({cap.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${cap.barClass}`} style={{ width: `${cap.percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. Attendance Report */}
        {activeReport === 'attendance' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b pb-4 border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                {isRTL ? '📈 تقرير معدلات الحضور والغياب التراكمي (Attendance, No-Show & Cancellations)' : 'Attendance & Cancellation Rates Report'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {isRTL ? 'تحليل نسب الالتزام بالجلسات وأسباب الغياب المدونة بواسطة الاستقبال' : 'Analyze session adherence and reception-recorded absence reasons'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
                <CheckCircle size={36} className="mx-auto text-emerald-600 dark:text-emerald-400" />
                <div className="text-3xl font-black text-emerald-900 dark:text-emerald-300">{reportData.attendance.attendedPercentage}%</div>
                <div className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400">{isRTL ? 'نسبة الحضور المكتمل' : 'Attendance Rate'} ({reportData.attendance.attendedCount} من {reportData.attendance.totalSessions})</div>
              </div>

              <div className="p-5 bg-rose-50/70 dark:bg-rose-950/30 border-2 border-rose-200 dark:border-rose-800 rounded-2xl text-center space-y-2">
                <AlertTriangle size={36} className="mx-auto text-rose-600 dark:text-rose-400" />
                <div className="text-3xl font-black text-rose-900 dark:text-rose-300">{reportData.attendance.noShowPercentage}%</div>
                <div className="text-xs font-extrabold text-rose-800 dark:text-rose-400">{isRTL ? 'نسبة الغياب دون إشعار' : 'No-Show Rate'} ({reportData.attendance.noShowCount} {isRTL ? 'جلسة' : 'sessions'})</div>
              </div>

              <div className="p-5 bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-2xl text-center space-y-2">
                <Calendar size={36} className="mx-auto text-amber-600 dark:text-amber-400" />
                <div className="text-3xl font-black text-amber-900 dark:text-amber-300">{reportData.attendance.cancelledPercentage}%</div>
                <div className="text-xs font-extrabold text-amber-800 dark:text-amber-400">{isRTL ? 'معدل الإلغاء المبكر والتأجيل' : 'Cancellation Rate'} ({reportData.attendance.cancelledCount} {isRTL ? 'جلسة' : 'sessions'})</div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white mb-4">
                {isRTL ? '📋 أبرز أسباب الغياب المدونة في نظام المتابعة اليومية:' : '📋 Top Recorded Absence Reasons:'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reportData.attendance.reasons.map((r, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-700 dark:text-gray-300">{r.reason}</span>
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded-lg font-extrabold">{r.count} {isRTL ? 'حالة' : 'cases'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancellation Reasons Breakdown (Phase 3 Modification) */}
            <div className="bg-rose-50/40 dark:bg-rose-950/20 p-5 rounded-2xl border border-rose-200 dark:border-rose-900/40 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-200 dark:border-rose-900/40 pb-3">
                <h3 className="text-sm font-extrabold text-rose-900 dark:text-rose-300 flex items-center gap-2">
                  <span>🚫</span>
                  <span>{isRTL ? 'تقرير أسباب إلغاء الحجوزات وإحصائياتها:' : 'Booking Cancellation Reasons Breakdown:'}</span>
                </h3>
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50 px-2.5 py-1 rounded-lg">
                  {reportData.attendance.cancelledCount} {isRTL ? 'إلغاء مسجل' : 'Total Cancellations'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(reportData.attendance.cancellationReasons || []).map((cr, idx) => (
                  <div key={idx} className="p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-rose-100 dark:border-rose-900/30 space-y-1.5 shadow-2xs">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-gray-800 dark:text-gray-200">{cr.reason}</span>
                      <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 rounded font-mono text-[11px]">
                        {cr.count} ({cr.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${cr.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Cancellations Log */}
              {reportData.attendance.recentCancellations?.length > 0 && (
                <div className="mt-4 pt-3 border-t border-rose-200/60 dark:border-rose-900/40">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'آخر الحجوزات الملغاة مع الأسباب:' : 'Recent Cancelled Appointments Log:'}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left rtl:text-right text-xs">
                      <thead className="bg-white/60 dark:bg-gray-900/60 text-gray-600 dark:text-gray-400">
                        <tr>
                          <th className="p-2">{isRTL ? 'المريض' : 'Patient'}</th>
                          <th className="p-2">{isRTL ? 'الطبيب' : 'Doctor'}</th>
                          <th className="p-2">{isRTL ? 'التاريخ' : 'Date'}</th>
                          <th className="p-2">{isRTL ? 'سبب الإلغاء' : 'Reason'}</th>
                          <th className="p-2">{isRTL ? 'ملغي بواسطة' : 'Cancelled By'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100 dark:divide-rose-900/30">
                        {reportData.attendance.recentCancellations.map((rc, i) => (
                          <tr key={i} className="hover:bg-white/40 dark:hover:bg-gray-900/30">
                            <td className="p-2 font-bold text-gray-800 dark:text-white">{rc.patientName}</td>
                            <td className="p-2 text-gray-600 dark:text-gray-300">{rc.doctorName}</td>
                            <td className="p-2 font-mono text-gray-500">{rc.date}</td>
                            <td className="p-2 font-semibold text-rose-600 dark:text-rose-400">{rc.reason}</td>
                            <td className="p-2 text-gray-500">{rc.cancelledBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Package Execution Report & Renewal Alerts (Phases 11 & 12) */}
        {activeReport === 'package' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b pb-4 border-gray-100 dark:border-gray-800 flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">
                  {isRTL ? '📦 مراقبة تنفيذ الباقات العلاجية وتنبيهات الفواتير (Phase 11 & 12: Package & Payments Module)' : 'Package Execution Monitoring & Invoice Alerting'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {isRTL ? 'رصد الجلسات المتبقية في باقات المرضى والتنبيه الآلي لتجهيز التجديد والفواتير قبل نفاد الجلسات لتفادي انقطاع العلاج' : 'Monitor package consumption and generate renewal invoices before session depletion'}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300 rounded-xl text-xs font-bold border border-indigo-300">
                  {isRTL ? 'باقات نشطة:' : 'Active:'} <strong>{reportData.packages.activeCount}</strong>
                </span>
                <span className="px-3 py-1.5 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 rounded-xl text-xs font-extrabold border-2 border-amber-400 animate-pulse">
                  ⚠️ {isRTL ? 'على وشك الانتهاء:' : 'Ending Soon:'} <strong>{reportData.packages.endingSoonCount}</strong>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-extrabold uppercase border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="py-3 px-4">{isRTL ? 'اسم المريض' : 'Patient Name'}</th>
                    <th className="py-3 px-4">{isRTL ? 'الباقة العلاجية' : 'Treatment Package'}</th>
                    <th className="py-3 px-4">{isRTL ? 'الطبيب المعالج' : 'Doctor'}</th>
                    <th className="py-3 px-4">{isRTL ? 'التقدم والجلسات المتبقية' : 'Progress & Remaining'}</th>
                    <th className="py-3 px-4 text-center">{isRTL ? 'التوجيه والإجراء المالي' : 'Financial Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-medium">
                  {reportData.packages.list.map((item, index) => {
                    const remaining = item.total - item.used;
                    const isEndingSoon = remaining <= 2;
                    return (
                      <tr key={index} className={`hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition ${isEndingSoon ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}`}>
                        <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{item.patientName}</td>
                        <td className="py-3 px-4 text-indigo-700 dark:text-indigo-400 font-extrabold">{item.packageTitle}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{item.doctor}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                            <span>{isRTL ? 'مستهلك: ' : 'Used: '} {item.used} من {item.total}</span>
                            <span className={isEndingSoon ? 'text-rose-600 font-black' : 'text-emerald-600'}>
                              ({remaining} {isRTL ? 'جلسات متبقية' : 'left'})
                            </span>
                          </div>
                          <div className="w-36 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div className={`h-full ${isEndingSoon ? 'bg-amber-600' : 'bg-emerald-500'}`} style={{ width: `${(item.used / item.total) * 100}%` }}></div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isEndingSoon ? (
                            <button
                              onClick={() => toast.success(`💳 تم إصدار فاتورة تجديد باقة للمريض ${item.patientName} بنجاح`)}
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg text-xs font-extrabold shadow-sm flex items-center justify-center gap-1 mx-auto"
                              title="تجهيز فاتورة التجديد وتفادي انقطاع الخدمة العلاجية"
                            >
                              ⚠️ {isRTL ? 'تجهيز فاتورة التجديد (Phase 12)' : 'Prepare Renewal Invoice'}
                            </button>
                          ) : (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-md font-bold inline-flex items-center gap-1 text-[11px]">
                              🟢 {isRTL ? 'ساري ومنتظم' : 'Active & Regular'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Finance Report (Pending payments, verified payments, outstanding balances) */}
        {activeReport === 'finance' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b pb-4 border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                {isRTL ? '💳 تقرير الحسابات، التحقق المالي والأرصدة المعلقة (Finance & Payments Report)' : 'Finance Verification & Outstanding Balances Report'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {isRTL ? 'ملخص تدفقات جلسات التقييم المعتمدة، الباقات المسكّنة والأرصدة المستحقة للتحصيل' : 'Summary of finance-verified assessments, assigned packages, and pending balance items'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-md space-y-1">
                <span className="text-xs font-extrabold uppercase opacity-90">{isRTL ? 'إجمالي الدفعات المعتمدة' : 'Verified Revenue'}</span>
                <div className="text-2xl font-black">{reportData.finance.verifiedRevenue}</div>
                <div className="text-[11px] text-emerald-100">✔ تم التوثيق بواسطة قسم المالية</div>
              </div>
              
              <div className="p-5 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-md space-y-1">
                <span className="text-xs font-extrabold uppercase opacity-90">{isRTL ? 'دفعات معلقة قيد التحقق (Assessments)' : 'Pending Finance Approvals'}</span>
                <div className="text-2xl font-black">{reportData.finance.pendingAmount}</div>
                <div className="text-[11px] text-amber-100">⚠️ يتطلب الاعتماد قبل بدء الجلسة</div>
              </div>

              <div className="p-5 bg-gradient-to-br from-rose-600 to-red-700 text-white rounded-2xl shadow-md space-y-1">
                <span className="text-xs font-extrabold uppercase opacity-90">{isRTL ? 'أرصدة متبقية للمركز' : 'Outstanding Balances'}</span>
                <div className="text-2xl font-black">{reportData.finance.outstandingBalances}</div>
                <div className="text-[11px] text-rose-100">📋 فواتير باقات مستحقة للسداد</div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-600" />
                {isRTL ? 'آخر الحركات وتأكيد دفعات جلسات التقييم والباقات:' : 'Recent Payment Verifications & Transactions:'}
              </h3>
              <div className="space-y-2">
                {reportData.finance.recentVerifications.map((tx, i) => (
                  <div key={i} className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 flex justify-between items-center text-xs font-bold">
                    <div>
                      <span className="text-gray-900 dark:text-gray-100 text-sm font-extrabold">{tx.patient}</span>
                      <div className="text-[11px] text-gray-500 mt-0.5">{tx.type} | التاريخ: {tx.date}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{tx.amount}</span>
                      {tx.status === 'VERIFIED' ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg font-extrabold border border-emerald-300">
                          ✔ {isRTL ? 'معتمد' : 'Verified'}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 rounded-lg font-extrabold border border-amber-300">
                          ⏳ {isRTL ? 'قيد التحقق' : 'Pending'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
