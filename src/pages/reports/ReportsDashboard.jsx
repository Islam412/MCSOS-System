// src/pages/reports/ReportsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

  // Sample real/mock data calculated for reports
  const [reportData, setReportData] = useState({
    patientSources: [
      { source: 'Social Media (إنستجرام / فيسبوك)', count: 145, percentage: 35, color: 'bg-blue-500' },
      { source: 'Doctor Referral (تحويل طبيب عظام)', count: 112, percentage: 27, color: 'bg-emerald-500' },
      { source: 'Google Search (بحث جوجل)', count: 78, percentage: 19, color: 'bg-amber-500' },
      { source: 'Friend / Family (ترشيح صديق أو قريب)', count: 42, percentage: 10, color: 'bg-purple-500' },
      { source: 'Walk-in (مرور مباشر بالمركز)', count: 25, percentage: 6, color: 'bg-rose-500' },
      { source: 'Advertisement (حملة إعلانية / لوحات)', count: 12, percentage: 3, color: 'bg-cyan-500' },
    ],
    capacities: {
      centerOccupancy: 78,
      totalCapacity: 120,
      currentBookings: 94,
      doctors: [
        { name: 'د. أحمد رمزي - تأهيل العمود الفقري', current: 19, max: 20 },
        { name: 'د. سارة فوزي - العلاج المائي والرياضي', current: 14, max: 20 },
        { name: 'د. محمود سعيد - تأهيل ما بعد الجوانح', current: 20, max: 20 },
        { name: 'د. علياء عادل - تأهيل القوام والأطفال', current: 11, max: 20 },
      ],
      rooms: [
        { name: 'غرفة التأهيل الحركي المكثف (A101)', current: 8, max: 10 },
        { name: 'صالة العلاج المائي الرياضي (Pool 1)', current: 10, max: 10 },
        { name: 'غرفة العلاج بالليزر والموجات (L202)', current: 6, max: 8 },
        { name: 'جناح تشخيص وتقييم المفاصل (V10)', current: 4, max: 6 },
      ]
    },
    attendance: {
      totalSessions: 340,
      attendedCount: 285,
      attendedPercentage: 83.8,
      noShowCount: 32,
      noShowPercentage: 9.4,
      cancelledCount: 23,
      cancelledPercentage: 6.8,
      reasons: [
        { reason: 'ظرف طارئ للمريض (Patient Emergency)', count: 14 },
        { reason: 'عدم الحضور دون إشعار (No Show)', count: 12 },
        { reason: 'ازدحام مروري / تأخر عن الموعد', count: 9 },
        { reason: 'تعديل جدول الطبيب (Doctor Rescheduled)', count: 6 },
      ]
    },
    packages: {
      activeCount: 68,
      endingSoonCount: 7,
      renewedThisMonth: 19,
      list: [
        { patientName: 'سعد الله إبراهيم', packageTitle: 'باقة التأهيل الشامل (24 جلسة)', used: 22, total: 24, doctor: 'د. أحمد رمزي', status: 'ending_soon' },
        { patientName: 'منى عبد المقصود', packageTitle: 'باقة التميز العلاجي (12 جلسة)', used: 11, total: 12, doctor: 'د. سارة فوزي', status: 'ending_soon' },
        { patientName: 'خالد مصطفى شاهين', packageTitle: 'باقة التأهيل السريع (6 جلسات)', used: 5, total: 6, doctor: 'د. محمود سعيد', status: 'ending_soon' },
        { patientName: 'نورا سعيد يوسف', packageTitle: 'باقة العلاج المائي الرياضي (12)', used: 4, total: 12, doctor: 'د. علياء عادل', status: 'active' },
        { patientName: 'علي رضا هلال', packageTitle: 'باقة علاج العمود الفقري (24)', used: 16, total: 24, doctor: 'د. أحمد رمزي', status: 'active' },
      ]
    },
    finance: {
      verifiedRevenue: '142,500 ج.م',
      pendingAmount: '18,400 ج.م',
      outstandingBalances: '9,250 ج.م',
      recentVerifications: [
        { patient: 'أحمد محمود سليمان', amount: '4,500 ج.م', date: '2026-08-01', status: 'VERIFIED', type: 'باقة تأهيل 12 جلسة' },
        { patient: 'ريماز عبد الرزاق', amount: '1,200 ج.م', date: '2026-08-01', status: 'PENDING_FINANCE', type: 'جلسة تقييم متخصص' },
        { patient: 'ياسر نور الدين', amount: '8,400 ج.م', date: '2026-07-31', status: 'VERIFIED', type: 'باقة العلاج المائي (24)' },
      ]
    }
  });

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); toast.success('تم تحديث البيانات 🔄'); }, 600); }}
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
                      <span className="text-indigo-600 dark:text-indigo-400 font-black">{item.count} مريض ({item.percentage}%)</span>
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
                  const cap = getCapacityIndicator(doc.current, doc.max);
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
                <div className="text-xs font-extrabold text-rose-800 dark:text-rose-400">{isRTL ? 'نسبة الغياب دون إشعار (No-Show)' : 'No-Show Rate'} ({reportData.attendance.noShowCount} جلسة)</div>
              </div>

              <div className="p-5 bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-2xl text-center space-y-2">
                <Calendar size={36} className="mx-auto text-amber-600 dark:text-amber-400" />
                <div className="text-3xl font-black text-amber-900 dark:text-amber-300">{reportData.attendance.cancelledPercentage}%</div>
                <div className="text-xs font-extrabold text-amber-800 dark:text-amber-400">{isRTL ? 'معدل الإلغاء المبكر والتأجيل' : 'Cancellation Rate'} ({reportData.attendance.cancelledCount} جلسة)</div>
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
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded-lg font-extrabold">{r.count} حالة</span>
                  </div>
                ))}
              </div>
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
