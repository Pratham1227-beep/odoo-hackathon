export const dashboardStats = [
  {
    id: 'total-employees',
    title: 'Total Employees',
    value: '118',
    trend: '+12% from last month',
    trendType: 'positive', // positive, neutral, warning
    icon: 'Users',
    theme: 'purple', // purple, teal, violet, amber
  },
  {
    id: 'present-today',
    title: 'Present Today',
    value: '102',
    trend: '+4% from yesterday',
    trendType: 'positive',
    icon: 'CalendarCheck',
    theme: 'teal',
  },
  {
    id: 'payroll-this-month',
    title: 'Payroll This Month',
    value: '₹14.24L',
    trend: '+2% from last month',
    trendType: 'amber',
    icon: 'IndianRupee',
    theme: 'violet',
  },
  {
    id: 'pending-issues',
    title: 'Pending Issues',
    value: '3',
    trend: '2 require attention',
    trendType: 'warning',
    icon: 'FileText',
    theme: 'amber',
  },
];

export const payrollOverviewData = [
  { month: 'Apr', amount: 9.0, formatted: '₹9.0L', isCurrent: false },
  { month: 'May', amount: 11.5, formatted: '₹11.5L', isCurrent: false },
  { month: 'Jun', amount: 12.8, formatted: '₹12.8L', isCurrent: false },
  { month: 'Jul', amount: 13.2, formatted: '₹13.2L', isCurrent: false },
  { month: 'Aug', amount: 15.5, formatted: '₹15.5L', isCurrent: false },
  { month: 'Sep', amount: 17.5, formatted: '₹17.5L', isCurrent: true },
];

export const employeeDistributionData = [
  { department: 'Engineering', count: 42, color: '#8b5cf6' }, // Purple
  { department: 'Design', count: 18, color: '#06b6d4' },      // Cyan / Teal
  { department: 'Product', count: 16, color: '#3b82f6' },     // Blue
  { department: 'HR', count: 12, color: '#f472b6' },          // Pink
  { department: 'Sales', count: 20, color: '#f59e0b' },       // Amber
  { department: 'Others', count: 10, color: '#94a3b8' },      // Slate
];

export const recentActivities = [
  {
    id: 'act-1',
    date: '08 Sep 2026',
    activity: 'New Employee Added',
    details: 'Ayesha Khan (Designer)',
    status: 'Completed',
    statusVariant: 'success',
  },
  {
    id: 'act-2',
    date: '08 Sep 2026',
    activity: 'Leave Request',
    details: 'Rohan Mehta (2 days)',
    status: 'Pending',
    statusVariant: 'warning',
  },
  {
    id: 'act-3',
    date: '07 Sep 2026',
    activity: 'Payroll Processed',
    details: 'August 2026',
    status: 'Completed',
    statusVariant: 'success',
  },
  {
    id: 'act-4',
    date: '06 Sep 2026',
    activity: 'Attendance Alert',
    details: '5 employees absent',
    status: 'View',
    statusVariant: 'info',
  },
  {
    id: 'act-5',
    date: '05 Sep 2026',
    activity: 'Profile Updated',
    details: 'Sneha Verma',
    status: 'Completed',
    statusVariant: 'success',
  },
];

export const quickActions = [
  {
    id: 'qa-add-employee',
    title: 'Add Employee',
    icon: 'UserPlus',
    colorTheme: 'teal', // teal, purple, blue, orange
    path: '/employees',
  },
  {
    id: 'qa-mark-attendance',
    title: 'Mark Attendance',
    icon: 'Calendar',
    colorTheme: 'purple',
    path: '/attendance',
  },
  {
    id: 'qa-create-payslip',
    title: 'Create Payslip',
    icon: 'FileSpreadsheet',
    colorTheme: 'blue',
    path: '/payrun',
  },
  {
    id: 'qa-view-reports',
    title: 'View Reports',
    icon: 'BarChart2',
    colorTheme: 'amber',
    path: '/reports',
  },
];

export const upcomingTasks = [
  {
    id: 'task-1',
    title: 'Review leave requests',
    subtitle: '3 pending',
    due: 'Today',
    icon: 'Calendar',
    iconTheme: 'rose',
  },
  {
    id: 'task-2',
    title: 'Approve payroll',
    subtitle: 'September 2026',
    due: 'Tomorrow',
    icon: 'CheckCircle2',
    iconTheme: 'purple',
  },
  {
    id: 'task-3',
    title: 'Update employee records',
    subtitle: '5 new joins',
    due: '12 Sep',
    icon: 'Users',
    iconTheme: 'teal',
  },
  {
    id: 'task-4',
    title: 'Generate monthly report',
    subtitle: 'August 2026',
    due: '15 Sep',
    icon: 'BarChart3',
    iconTheme: 'amber',
  },
];
