import React, { useState } from 'react';
import PayrollHeader from '../components/PayrollHeader';
import PayrollKPIs from '../components/PayrollKPIs';
import PayrollWorkflowModules from '../components/PayrollWorkflowModules';
import PayrollTrendsAndCompliance from '../components/PayrollTrendsAndCompliance';
import RecentPayrollBatches from '../components/RecentPayrollBatches';

export default function PayrollPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('September 2026');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header with Period Selection & CTAs */}
      <PayrollHeader
        selectedPeriod={selectedPeriod}
        onSelectPeriod={(period) => setSelectedPeriod(period)}
      />

      {/* Primary KPI Metrics */}
      <PayrollKPIs />

      {/* 4 Core Workflow Modules / Launchers */}
      <PayrollWorkflowModules />

      {/* Trends, Department Breakdown & Statutory Compliance */}
      <PayrollTrendsAndCompliance />

      {/* Recent Payroll Batches Table */}
      <RecentPayrollBatches />
    </div>
  );
}
