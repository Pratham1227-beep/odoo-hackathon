// WageWise Reports & Analytics Data

export const reportsSummaryKPIs = {
  totalPayrollCost: '₹48,92,450',
  payrollCostChange: '+4.2%',
  totalEmployees: 48,
  employeesChange: '+3 this month',
  averageAttendanceRate: '96.4%',
  attendanceChange: '+1.1%',
  statutoryCompliance: '100%',
  complianceStatus: 'Fully Compliant',
};

export const monthlyPayrollTrends = [
  { month: 'Apr 2026', gross: 4250000, deductions: 510000, net: 3740000 },
  { month: 'May 2026', gross: 4380000, deductions: 525000, net: 3855000 },
  { month: 'Jun 2026', gross: 4420000, deductions: 530000, net: 3890000 },
  { month: 'Jul 2026', gross: 4610000, deductions: 553000, net: 4057000 },
  { month: 'Aug 2026', gross: 4750000, deductions: 570000, net: 4180000 },
  { month: 'Sep 2026', gross: 4892450, deductions: 587094, net: 4305356 },
];

export const departmentCostBreakdown = [
  { department: 'Engineering', employees: 18, cost: 2240000, percentage: 45.8, color: 'bg-indigo-600' },
  { department: 'Product & Design', employees: 8, cost: 890000, percentage: 18.2, color: 'bg-purple-600' },
  { department: 'Marketing & Sales', employees: 11, cost: 980000, percentage: 20.0, color: 'bg-blue-600' },
  { department: 'Operations & HR', employees: 6, cost: 480000, percentage: 9.8, color: 'bg-teal-600' },
  { department: 'Finance & Legal', employees: 5, cost: 302450, percentage: 6.2, color: 'bg-amber-600' },
];

export const attendanceReportData = [
  { department: 'Engineering', present: 97.2, late: 2.1, absent: 0.7, overtimeHours: 142 },
  { department: 'Product & Design', present: 96.5, late: 1.8, absent: 1.7, overtimeHours: 58 },
  { department: 'Marketing & Sales', present: 95.1, late: 3.4, absent: 1.5, overtimeHours: 84 },
  { department: 'Operations & HR', present: 98.4, late: 0.9, absent: 0.7, overtimeHours: 36 },
  { department: 'Finance & Legal', present: 96.0, late: 2.0, absent: 2.0, overtimeHours: 24 },
];

export const workforceMetrics = {
  byEmploymentType: [
    { type: 'Full-Time Permanent', count: 36, percentage: 75 },
    { type: 'Fixed-Term Contract', count: 8, percentage: 16.7 },
    { type: 'Probationary', count: 3, percentage: 6.3 },
    { type: 'Intern / Apprentice', count: 1, percentage: 2.0 },
  ],
  genderRatio: {
    male: 58,
    female: 42,
  },
  averageTenure: '2.4 Years',
  monthlyAttritionRate: '0.0%',
};

export const statutoryReportsList = [
  {
    id: 'STAT001',
    name: 'EPFO (Provident Fund) ECR Return',
    period: 'September 2026',
    employeesCovered: 48,
    employeeContribution: '₹2,64,192',
    employerContribution: '₹2,64,192',
    totalDeposit: '₹5,28,384',
    dueDate: '15 Oct 2026',
    status: 'Ready for Filing',
    challanGenerated: true,
  },
  {
    id: 'STAT002',
    name: 'ESIC Contribution Monthly Return',
    period: 'September 2026',
    employeesCovered: 14,
    employeeContribution: '₹18,450',
    employerContribution: '₹79,840',
    totalDeposit: '₹98,290',
    dueDate: '15 Oct 2026',
    status: 'Ready for Filing',
    challanGenerated: true,
  },
  {
    id: 'STAT003',
    name: 'Professional Tax (PT) Form 5A',
    period: 'September 2026',
    employeesCovered: 48,
    employeeContribution: '₹9,600',
    employerContribution: '₹0',
    totalDeposit: '₹9,600',
    dueDate: '10 Oct 2026',
    status: 'Completed',
    challanGenerated: true,
  },
  {
    id: 'STAT004',
    name: 'Income Tax TDS (Section 192 - Form 24Q)',
    period: 'Q2 (Jul - Sep 2026)',
    employeesCovered: 32,
    employeeContribution: '₹3,42,150',
    employerContribution: '₹0',
    totalDeposit: '₹3,42,150',
    dueDate: '31 Oct 2026',
    status: 'In Review',
    challanGenerated: false,
  },
];
