import React, { useState, useEffect } from 'react';
import ReportHeader from '../components/ReportHeader';
import ReportStats from '../components/ReportStats';
import PayrollReportsView from '../components/PayrollReportsView';
import AttendanceReportsView from '../components/AttendanceReportsView';
import WorkforceReportsView from '../components/WorkforceReportsView';
import StatutoryReportsView from '../components/StatutoryReportsView';
import ExportReportModal from '../components/ExportReportModal';
import { reportsService } from '../services/reportsService';
import { reportsSummaryKPIs } from '../data/reportsData';
import { Coins, Clock, Users, ShieldCheck, Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('sep2026');
  const [activeTab, setActiveTab] = useState('payroll');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [mainData, setMainData] = useState(null);
  const [payrollData, setPayrollData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [employeesData, setEmployeesData] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const [mainRes, payrollRes, attendanceRes, employeesRes] = await Promise.allSettled([
        reportsService.getMainDashboard(),
        reportsService.getPayrollDashboard(),
        reportsService.getAttendanceDashboard(),
        reportsService.getEmployeesDashboard(),
      ]);

      if (mainRes.status === 'fulfilled') setMainData(mainRes.value);
      if (payrollRes.status === 'fulfilled') setPayrollData(payrollRes.value);
      if (attendanceRes.status === 'fulfilled') setAttendanceData(attendanceRes.value);
      if (employeesRes.status === 'fulfilled') setEmployeesData(employeesRes.value);
    } catch (err) {
      console.error('Failed to load reports data', err);
      showToast('Error loading live report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleExport = (format, sections) => {
    showToast(`Generating ${format.toUpperCase()} report with selected sections... Download started.`);
  };

  const handleDownloadChallan = (challanName) => {
    showToast(`Downloading statutory document: ${challanName}`);
  };

  const tabs = [
    { id: 'payroll', label: 'Payroll & Costs', icon: Coins },
    { id: 'attendance', label: 'Attendance & Overtime', icon: Clock },
    { id: 'workforce', label: 'Workforce & Demographics', icon: Users },
    { id: 'statutory', label: 'Statutory Compliance', icon: ShieldCheck },
  ];

  // Dynamic KPIs derived from backend
  const liveKPIs = {
    totalPayrollCost: payrollData?.metrics?.total_net 
      ? `₹${Number(payrollData.metrics.total_net).toLocaleString('en-IN')}`
      : mainData?.kpis?.total_net_salary_paid 
      ? `₹${Number(mainData.kpis.total_net_salary_paid).toLocaleString('en-IN')}`
      : reportsSummaryKPIs.totalPayrollCost,
    payrollCostChange: '+2.4%',
    totalEmployees: employeesData?.total_employees || mainData?.kpis?.payslips_generated || 48,
    employeesChange: '+3 net this quarter',
    averageAttendanceRate: attendanceData?.attendance_coverage_percentage 
      ? `${Number(attendanceData.attendance_coverage_percentage).toFixed(1)}%`
      : `${mainData?.kpis?.attendance_health || 96.8}%`,
    attendanceChange: '+0.5%',
    statutoryCompliance: '100%',
    complianceStatus: 'Fully Reconciled',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <ReportHeader
        selectedPeriod={selectedPeriod}
        onChangePeriod={setSelectedPeriod}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          {/* 4 Statistics KPI Cards */}
          <ReportStats kpis={liveKPIs} />

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Views */}
          {activeTab === 'payroll' && (
            <PayrollReportsView payrollData={payrollData} />
          )}
          {activeTab === 'attendance' && (
            <AttendanceReportsView attendanceData={attendanceData} />
          )}
          {activeTab === 'workforce' && (
            <WorkforceReportsView employeesData={employeesData} />
          )}
          {activeTab === 'statutory' && (
            <StatutoryReportsView onDownloadChallan={handleDownloadChallan} />
          )}
        </>
      )}

      {/* Export Modal */}
      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
}
