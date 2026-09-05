import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import EmployeeDashboard from '../components/EmployeeDashboard';
import DashboardHeader from '../components/DashboardHeader';
import StatCard from '../components/StatCard';
import PayrollOverviewChart from '../components/PayrollOverviewChart';
import EmployeeDistributionChart from '../components/EmployeeDistributionChart';
import RecentActivityTable from '../components/RecentActivityTable';
import RunPayrollCard from '../components/RunPayrollCard';
import QuickActions from '../components/QuickActions';
import UpcomingTasks from '../components/UpcomingTasks';
import { dashboardService } from '../services/dashboardService';
import { quickActions } from '../data/dashboardData';
import { RefreshCw, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    main: null,
    payroll: null,
    attendance: null,
    employees: null,
    auditLogs: null,
    leaveRequests: null,
  });

  const fetchRealData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const results = await Promise.allSettled([
        dashboardService.getMainDashboard(),
        dashboardService.getPayrollDashboard(),
        dashboardService.getAttendanceDashboard(),
        dashboardService.getEmployeesDashboard(),
        dashboardService.getAuditLogs({ page: 1, page_size: 5 }),
        dashboardService.getLeaveRequests(),
      ]);

      setDashboardData({
        main: results[0].status === 'fulfilled' ? results[0].value : null,
        payroll: results[1].status === 'fulfilled' ? results[1].value : null,
        attendance: results[2].status === 'fulfilled' ? results[2].value : null,
        employees: results[3].status === 'fulfilled' ? results[3].value : null,
        auditLogs: results[4].status === 'fulfilled' ? results[4].value : null,
        leaveRequests: results[5].status === 'fulfilled' ? results[5].value : null,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== 'EMPLOYEE') {
      fetchRealData();
    }
  }, [user?.role, fetchRealData]);

  if (user?.role === 'EMPLOYEE') {
    return <EmployeeDashboard />;
  }

  const { main, payroll, attendance, employees, auditLogs, leaveRequests } = dashboardData;

  // 1. Process Stat Cards
  const totalEmployees = employees?.total_employees ?? 0;
  const activeEmployees = employees?.active_employees ?? totalEmployees;
  const newHires = employees?.new_hires_in_period ?? 0;

  // Real-time daily present count
  const presentToday = attendance?.present_today_count 
    ?? (attendance?.present_count && totalEmployees > 0 && attendance.present_count <= totalEmployees 
        ? attendance.present_count 
        : (totalEmployees > 0 ? Math.round(totalEmployees * ((attendance?.attendance_coverage_percentage || 97) / 100)) : 0));
  const attCoverage = attendance?.attendance_coverage_percentage ?? (totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 100);


  const totalNet = Number(main?.kpis?.total_net_salary_paid || 0);
  const avgNet = Number(main?.kpis?.average_salary || 0);
  let formattedPayroll = '₹0';
  if (totalNet >= 10000000) {
    formattedPayroll = `₹${(totalNet / 10000000).toFixed(2)}Cr`;
  } else if (totalNet >= 100000) {
    formattedPayroll = `₹${(totalNet / 100000).toFixed(2)}L`;
  } else if (totalNet > 0) {
    formattedPayroll = `₹${totalNet.toLocaleString('en-IN')}`;
  }

  const totalIssues = main?.operational_alerts?.total_open_issues ?? 0;
  const errorIssues = main?.operational_alerts?.error_count ?? 0;
  const warningIssues = main?.operational_alerts?.warning_count ?? 0;

  const stats = [
    {
      id: 'total-employees',
      title: 'Total Employees',
      value: String(totalEmployees),
      trend: newHires > 0 ? `+${newHires} new joins this month` : `${activeEmployees} active employees`,
      trendType: 'positive',
      icon: 'Users',
      theme: 'purple',
    },
    {
      id: 'present-today',
      title: 'Present Today',
      value: String(presentToday),
      trend: `${attCoverage}% attendance rate`,
      trendType: 'positive',
      icon: 'CalendarCheck',
      theme: 'teal',
    },
    {
      id: 'payroll-this-month',
      title: 'Payroll This Month',
      value: formattedPayroll,
      trend: `Avg ₹${avgNet.toLocaleString('en-IN')}`,
      trendType: 'amber',
      icon: 'IndianRupee',
      theme: 'violet',
    },
    {
      id: 'pending-issues',
      title: 'Pending Issues',
      value: String(totalIssues),
      trend: errorIssues > 0 ? `${errorIssues} critical errors` : `${warningIssues} warnings`,
      trendType: totalIssues > 0 ? 'warning' : 'positive',
      icon: 'FileText',
      theme: 'amber',
    },
  ];

  // 2. Process Monthly Payroll Trends Chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let trends = payroll?.monthly_trends || [];
  let payrollChartData = [];
  if (trends && trends.length > 0) {
    payrollChartData = trends.map((t) => {
      const net = Number(t.total_net || 0);
      const inLakhs = net / 100000;
      return {
        month: monthNames[t.month - 1] || `${t.month}`,
        amount: Number(inLakhs.toFixed(2)),
        formatted: inLakhs >= 1 ? `₹${inLakhs.toFixed(1)}L` : `₹${net.toLocaleString('en-IN')}`,
        isCurrent: Boolean(t.is_live),
      };
    });
  } else {
    const curMonth = new Date().getMonth();
    for (let i = 5; i >= 0; i--) {
      const mIdx = (curMonth - i + 12) % 12;
      payrollChartData.push({
        month: monthNames[mIdx],
        amount: 0,
        formatted: '₹0',
        isCurrent: i === 0,
      });
    }
  }

  // 3. Process Employee Distribution by Department
  const palette = ['#8b5cf6', '#06b6d4', '#3b82f6', '#f472b6', '#f59e0b', '#10b981', '#6366f1', '#94a3b8'];
  let employeeDistData = [];
  if (employees?.by_department && employees.by_department.length > 0) {
    employeeDistData = employees.by_department.map((dept, idx) => ({
      department: dept.name,
      count: dept.count,
      color: palette[idx % palette.length],
    }));
  } else if (totalEmployees > 0) {
    employeeDistData = [{ department: 'General', count: totalEmployees, color: '#8b5cf6' }];
  } else {
    employeeDistData = [{ department: 'No employees', count: 0, color: '#94a3b8' }];
  }

  // 4. Process Recent Activities
  let activitiesData = [];
  if (auditLogs?.items && auditLogs.items.length > 0) {
    activitiesData = auditLogs.items.map((log) => {
      const d = new Date(log.created_at);
      const formattedDate = !isNaN(d)
        ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Recent';
      const actionLabel = (log.action || '').toLowerCase().replace(/_/g, ' ');
      const formattedAction = actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1);

      return {
        id: log.id,
        date: formattedDate,
        activity: `${log.module || ''} ${formattedAction}`.trim(),
        details: log.user_email ? `By ${log.user_email}` : (log.resource_type || 'System action'),
        status: 'Completed',
        statusVariant: 'success',
      };
    });
  }

  // 5. Process Upcoming Tasks
  const pendingLeaves = Array.isArray(leaveRequests)
    ? leaveRequests.filter((r) => r.status === 'PENDING').length
    : 0;

  const upcomingTasksData = [
    {
      id: 'task-leave',
      title: 'Review leave requests',
      subtitle: `${pendingLeaves} pending approval`,
      due: pendingLeaves > 0 ? 'Action required' : 'Up to date',
      icon: 'Calendar',
      iconTheme: pendingLeaves > 0 ? 'rose' : 'teal',
    },
    {
      id: 'task-payroll',
      title: 'Monthly payroll run',
      subtitle: `${formattedPayroll} pending / estimated`,
      due: 'This month',
      icon: 'CheckCircle2',
      iconTheme: 'purple',
    },
    {
      id: 'task-alerts',
      title: 'Payroll validation issues',
      subtitle: `${totalIssues} open issue(s)`,
      due: totalIssues > 0 ? 'Attention required' : 'Clean',
      icon: 'BarChart3',
      iconTheme: totalIssues > 0 ? 'amber' : 'teal',
    },
    {
      id: 'task-workforce',
      title: 'Workforce records check',
      subtitle: `${totalEmployees} registered employees`,
      due: 'Active',
      icon: 'Users',
      iconTheme: 'teal',
    },
  ];

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-200">
      {/* Top Header with Refresh Control */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <DashboardHeader />
        </div>
        <button
          onClick={() => fetchRealData(true)}
          disabled={isRefreshing || isLoading}
          className="self-start md:self-center inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh real-time dashboard data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading live organization dashboard...</p>
        </div>
      ) : (
        <>
          {/* 4 Real-time Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {stats.map((stat) => (
              <StatCard key={stat.id} item={stat} />
            ))}
          </div>

          {/* Main Dashboard Grid: Left Content (Charts & Table) + Right Rail */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Column (8 cols on XL) */}
            <div className="xl:col-span-8 space-y-6">
              {/* Charts Row: Payroll Overview & Employee Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PayrollOverviewChart data={payrollChartData} />
                <EmployeeDistributionChart data={employeeDistData} />
              </div>

              {/* Recent Activity Table */}
              <RecentActivityTable activities={activitiesData} />
            </div>

            {/* Right Rail Column (4 cols on XL) */}
            <div className="xl:col-span-4 space-y-6">
              {/* Run Payroll Action Card */}
              <RunPayrollCard />

              {/* Quick Actions 2x2 Grid */}
              <QuickActions actions={quickActions} />

              {/* Upcoming Tasks */}
              <UpcomingTasks tasks={upcomingTasksData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
