// WageWise Payslip Domain Data & Calculation Helpers

export const defaultCompany = {
  name: 'Acme Pvt. Ltd.',
  address: '123 Business Park, MG Road, Bengaluru - 560001, India',
  phone: '+91 80 4567 8900',
  email: 'payroll@acme.com',
};

export const payslipMonths = [
  { id: '2026-09', label: 'September 2026', payPeriod: '01 Sep 2026 - 30 Sep 2026', payDate: '30 Sep 2026' },
  { id: '2026-08', label: 'August 2026', payPeriod: '01 Aug 2026 - 31 Aug 2026', payDate: '31 Aug 2026' },
  { id: '2026-07', label: 'July 2026', payPeriod: '01 Jul 2026 - 31 Jul 2026', payDate: '31 Jul 2026' },
  { id: '2026-06', label: 'June 2026', payPeriod: '01 Jun 2026 - 30 Jun 2026', payDate: '30 Jun 2026' },
];

export const samplePayslip = {
  id: 'PS-2026-09-EMP001',
  employee: {
    id: 'EMP001',
    name: 'Ayesha Siddiqui',
    role: 'Software Engineer',
    designation: 'Software Engineer',
    department: 'Engineering',
    employeeType: 'Full Time',
    dateOfJoining: '12 Jan 2024',
    pan: 'ABCDE1234F',
    uan: '100123456789',
    email: 'ayesha.siddiqui@acme.com',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    initials: 'AS',
    avatarTheme: 'purple',
  },
  company: defaultCompany,
  period: {
    month: 'September 2026',
    payPeriod: '01 Sep 2026 - 30 Sep 2026',
    payDate: '30 Sep 2026',
  },
  earnings: [
    { id: 'basic', name: 'Basic Salary', amount: 40000 },
    { id: 'hra', name: 'House Rent Allowance (HRA)', amount: 20000 },
    { id: 'conveyance', name: 'Conveyance Allowance', amount: 5000 },
    { id: 'medical', name: 'Medical Allowance', amount: 3000 },
    { id: 'special', name: 'Special Allowance', amount: 7000 },
  ],
  deductions: [
    { id: 'pf', name: 'Provident Fund (PF)', amount: 2400 },
    { id: 'pt', name: 'Professional Tax', amount: 200 },
    { id: 'tds', name: 'Income Tax (TDS)', amount: 5000 },
    { id: 'esi', name: 'ESI', amount: 0 },
    { id: 'other', name: 'Other Deductions', amount: 1000 },
  ],
  bankDetails: {
    bankName: 'HDFC Bank',
    accountNumber: '************1234',
    ifsc: 'HDFC0001234',
    accountType: 'Savings',
  },
  details: {
    month: 'September 2026',
    payPeriod: '01 Sep 2026 - 30 Sep 2026',
    payDate: '30 Sep 2026',
    status: 'Paid',
    generatedOn: '28 Sep 2026, 10:24 AM',
    generatedBy: 'Payroll System',
  },
  history: [
    {
      id: 'h1',
      title: 'Payslip Generated',
      timestamp: '28 Sep 2026, 10:24 AM',
      description: 'By Payroll System',
      dotColor: 'emerald',
    },
    {
      id: 'h2',
      title: 'Approved',
      timestamp: '27 Sep 2026, 04:15 PM',
      description: 'By HR Manager',
      dotColor: 'blue',
    },
    {
      id: 'h3',
      title: 'Payrun Processed',
      timestamp: '27 Sep 2026, 02:30 PM',
      description: 'September 2026 Payrun',
      dotColor: 'purple',
    },
    {
      id: 'h4',
      title: 'Marked as Paid',
      timestamp: '30 Sep 2026, 09:00 AM',
      description: 'Payment transferred to bank',
      dotColor: 'indigo',
    },
  ],
};

// Calculations
export function calculateTotalEarnings(earnings = []) {
  return earnings.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

export function calculateTotalDeductions(deductions = []) {
  return deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

export function calculateNetPay(earnings = [], deductions = []) {
  return calculateTotalEarnings(earnings) - calculateTotalDeductions(deductions);
}

export function formatINR(val) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
}

// Generate payslip for any employee ID and month
export function getEmployeePayslip(employeeId = 'EMP001', month = 'September 2026') {
  const isAyesha = employeeId.toUpperCase() === 'EMP001';

  if (isAyesha) {
    return {
      ...samplePayslip,
      period: {
        ...samplePayslip.period,
        month,
      },
      details: {
        ...samplePayslip.details,
        month,
      },
    };
  }

  // Generic generator for other employees
  const baseSalary = 60000;
  return {
    id: `PS-${month.replace(/\s+/g, '-')}-${employeeId}`,
    employee: {
      id: employeeId,
      name: 'Rohan Mehta',
      role: 'Growth Marketing Lead',
      designation: 'Growth Marketing Lead',
      department: 'Marketing',
      employeeType: 'Full Time',
      dateOfJoining: '20 Feb 2024',
      pan: 'BCDEF2345G',
      uan: '100987654321',
      email: 'rohan.mehta@acme.com',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
      initials: 'RM',
      avatarTheme: 'blue',
    },
    company: defaultCompany,
    period: {
      month,
      payPeriod: `01 ${month.split(' ')[0].slice(0, 3)} 2026 - 30 ${month.split(' ')[0].slice(0, 3)} 2026`,
      payDate: `30 ${month.split(' ')[0].slice(0, 3)} 2026`,
    },
    earnings: [
      { id: 'basic', name: 'Basic Salary', amount: 36000 },
      { id: 'hra', name: 'House Rent Allowance (HRA)', amount: 18000 },
      { id: 'conveyance', name: 'Conveyance Allowance', amount: 5000 },
      { id: 'medical', name: 'Medical Allowance', amount: 3000 },
      { id: 'special', name: 'Special Allowance', amount: 10000 },
    ],
    deductions: [
      { id: 'pf', name: 'Provident Fund (PF)', amount: 2400 },
      { id: 'pt', name: 'Professional Tax', amount: 200 },
      { id: 'tds', name: 'Income Tax (TDS)', amount: 4600 },
      { id: 'esi', name: 'ESI', amount: 0 },
    ],
    bankDetails: {
      bankName: 'ICICI Bank',
      accountNumber: '************4567',
      ifsc: 'ICIC0000456',
      accountType: 'Salary',
    },
    details: {
      month,
      payPeriod: `01 ${month.split(' ')[0].slice(0, 3)} 2026 - 30 ${month.split(' ')[0].slice(0, 3)} 2026`,
      payDate: `30 ${month.split(' ')[0].slice(0, 3)} 2026`,
      status: 'Paid',
      generatedOn: '28 Sep 2026, 10:24 AM',
      generatedBy: 'Payroll System',
    },
    history: [
      {
        id: 'h1',
        title: 'Payslip Generated',
        timestamp: '28 Sep 2026, 10:24 AM',
        description: 'By Payroll System',
        dotColor: 'emerald',
      },
      {
        id: 'h2',
        title: 'Approved',
        timestamp: '27 Sep 2026, 04:15 PM',
        description: 'By HR Manager',
        dotColor: 'blue',
      },
      {
        id: 'h3',
        title: 'Marked as Paid',
        timestamp: '30 Sep 2026, 09:00 AM',
        description: 'Payment transferred to bank',
        dotColor: 'indigo',
      },
    ],
  };
}
