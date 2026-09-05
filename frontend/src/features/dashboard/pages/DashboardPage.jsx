import React from 'react';
import DashboardHeader from '../components/DashboardHeader';
import StatCard from '../components/StatCard';
import PayrollOverviewChart from '../components/PayrollOverviewChart';
import EmployeeDistributionChart from '../components/EmployeeDistributionChart';
import RecentActivityTable from '../components/RecentActivityTable';
import RunPayrollCard from '../components/RunPayrollCard';
import QuickActions from '../components/QuickActions';
import UpcomingTasks from '../components/UpcomingTasks';
import {
  dashboardStats,
  payrollOverviewData,
  employeeDistributionData,
  recentActivities,
  quickActions,
  upcomingTasks
} from '../data/dashboardData';

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <DashboardHeader />

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.id} item={stat} />
        ))}
      </div>

      {/* Main Dashboard Grid: Left Content (Charts & Table) + Right Rail */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols on XL) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Charts Row: Payroll Overview & Employee Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PayrollOverviewChart data={payrollOverviewData} />
            <EmployeeDistributionChart data={employeeDistributionData} />
          </div>

          {/* Recent Activity Table */}
          <RecentActivityTable activities={recentActivities} />
        </div>

        {/* Right Rail Column (4 cols on XL) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Run Payroll Action Card */}
          <RunPayrollCard />

          {/* Quick Actions 2x2 Grid */}
          <QuickActions actions={quickActions} />

          {/* Upcoming Tasks */}
          <UpcomingTasks tasks={upcomingTasks} />
        </div>

      </div>
    </div>
  );
}
