// WageWise Payrun Domain Data & Calculation Engine

export const initialSalaryStructures = [
  {
    id: 'STR-001',
    name: 'Regular Full-Time Structure',
    code: 'REG_FT',
    description: 'Standard salary structure for permanent full-time employees',
    basicPercentage: 50,
    hraPercentage: 25,
    specialAllowancePercentage: 25,
    pfPercentage: 12,
    professionalTax: 200,
    tdsRate: 5,
  },
  {
    id: 'STR-002',
    name: 'Executive Leadership Structure',
    code: 'EXEC_DIR',
    description: 'Structure for Directors, VPs, and executive management',
    basicPercentage: 45,
    hraPercentage: 25,
    specialAllowancePercentage: 30,
    pfPercentage: 12,
    professionalTax: 200,
    tdsRate: 10,
  },
  {
    id: 'STR-003',
    name: 'Internship & Trainee Structure',
    code: 'INTERN_STIPEND',
    description: 'Fixed stipend and training allowance with zero PF deduction',
    basicPercentage: 80,
    hraPercentage: 0,
    specialAllowancePercentage: 20,
    pfPercentage: 0,
    professionalTax: 0,
    tdsRate: 0,
  },
  {
    id: 'STR-004',
    name: 'Contractor & Consultant Structure',
    code: 'CONSULTANT_TDS',
    description: 'Professional billing rate with Section 194J 10% TDS withholding',
    basicPercentage: 100,
    hraPercentage: 0,
    specialAllowancePercentage: 0,
    pfPercentage: 0,
    professionalTax: 0,
    tdsRate: 10,
  },
];

export const initialPayrunPeriods = [
  { id: '2026-09', label: 'September 2026', month: 'September', year: 2026, days: 30, status: 'In Progress' },
  { id: '2026-08', label: 'August 2026', month: 'August', year: 2026, days: 31, status: 'Finalized' },
  { id: '2026-07', label: 'July 2026', month: 'July', year: 2026, days: 31, status: 'Finalized' },
  { id: '2026-06', label: 'June 2026', month: 'June', year: 2026, days: 30, status: 'Finalized' },
  { id: '2026-10', label: 'October 2026', month: 'October', year: 2026, days: 31, status: 'Upcoming' },
];

export const initialRecentPayruns = [
  {
    id: 'PR-2026-08',
    period: 'August 2026',
    processedDate: '31 Aug 2026',
    totalPayoutFormatted: '₹14.02L',
    totalPayout: 1402000,
    employeesProcessed: 116,
    status: 'Finalized',
  },
  {
    id: 'PR-2026-07',
    period: 'July 2026',
    processedDate: '31 Jul 2026',
    totalPayoutFormatted: '₹13.85L',
    totalPayout: 1385000,
    employeesProcessed: 114,
    status: 'Finalized',
  },
  {
    id: 'PR-2026-06',
    period: 'June 2026',
    processedDate: '30 Jun 2026',
    totalPayoutFormatted: '₹13.20L',
    totalPayout: 1320000,
    employeesProcessed: 110,
    status: 'Finalized',
  },
];

// Helper to compute salary items dynamically based on structure
export function calculateSalaryBreakdown(grossSalary, structureId = 'STR-001') {
  const structure = initialSalaryStructures.find((s) => s.id === structureId) || initialSalaryStructures[0];

  const basic = Math.round((grossSalary * structure.basicPercentage) / 100);
  const hra = Math.round((grossSalary * structure.hraPercentage) / 100);
  const specialAllowance = Math.round(grossSalary - basic - hra);

  // Deductions
  const pf = structure.pfPercentage > 0 ? Math.min(Math.round((basic * structure.pfPercentage) / 100), 5100) : 0;
  const profTax = structure.professionalTax || 0;
  const tds = Math.round((grossSalary * structure.tdsRate) / 100);
  const totalDeductions = pf + profTax + tds;
  const netPay = grossSalary - totalDeductions;

  return {
    grossSalary,
    basic,
    hra,
    specialAllowance,
    pf,
    profTax,
    tds,
    deductions: totalDeductions,
    netPay,
  };
}

// 8 primary employees matching the reference screenshot exactly
const primaryEmployees = [
  {
    id: 'EMP001',
    name: 'Ayesha Siddiqui',
    department: 'Engineering',
    role: 'Senior Frontend Developer',
    grossSalary: 85000,
    deductions: 8500,
    netPay: 76500,
    status: 'Processed',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    initials: 'AS',
    avatarTheme: 'purple',
    contractId: 'CON-001',
    salaryStructureId: 'STR-001',
    bankDetails: {
      accountNumber: '918273645012',
      ifsc: 'HDFC0001234',
      bankName: 'HDFC Bank',
      verified: true,
    },
    attendance: { workingDays: 22, presentDays: 22, paidLeave: 0, unpaidLeave: 0 },
    warnings: [],
  },
  {
    id: 'EMP002',
    name: 'Rohan Mehta',
    department: 'Marketing',
    role: 'Growth Marketing Lead',
    grossSalary: 72000,
    deductions: 7200,
    netPay: 64800,
    status: 'Processed',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    initials: 'RM',
    avatarTheme: 'blue',
    contractId: 'CON-002',
    salaryStructureId: 'STR-001',
    bankDetails: {
      accountNumber: '827364501923',
      ifsc: 'ICIC0000456',
      bankName: 'ICICI Bank',
      verified: true,
    },
    attendance: { workingDays: 22, presentDays: 21, paidLeave: 1, unpaidLeave: 0 },
    warnings: [],
  },
  {
    id: 'EMP003',
    name: 'Sneha Kapoor',
    department: 'Design',
    role: 'Lead UI/UX Designer',
    grossSalary: 68000,
    deductions: 6800,
    netPay: 61200,
    status: 'Processed',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    initials: 'SK',
    avatarTheme: 'pink',
    contractId: 'CON-003',
    salaryStructureId: 'STR-001',
    bankDetails: {
      accountNumber: '736450192834',
      ifsc: 'SBIN0000892',
      bankName: 'State Bank of India',
      verified: true,
    },
    attendance: { workingDays: 22, presentDays: 22, paidLeave: 0, unpaidLeave: 0 },
    warnings: [],
  },
  {
    id: 'EMP004',
    name: 'Arjun Nair',
    department: 'Sales',
    role: 'Enterprise Account Executive',
    grossSalary: 95000,
    deductions: 9500,
    netPay: 85500,
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    initials: 'AN',
    avatarTheme: 'teal',
    contractId: 'CON-004',
    salaryStructureId: 'STR-001',
    bankDetails: {
      accountNumber: '',
      ifsc: '',
      bankName: '',
      verified: false,
    },
    attendance: { workingDays: 22, presentDays: 20, paidLeave: 2, unpaidLeave: 0 },
    warnings: ['Missing bank account & IFSC code for direct deposit'],
  },
  {
    id: 'EMP005',
    name: 'Fatima Khan',
    department: 'HR',
    role: 'HR Business Partner',
    grossSalary: 60000,
    deductions: 6000,
    netPay: 54000,
    status: 'Processed',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
    initials: 'FK',
    avatarTheme: 'violet',
    contractId: 'CON-005',
    salaryStructureId: 'STR-001',
    bankDetails: {
      accountNumber: '645019283746',
      ifsc: 'AXIS0000312',
      bankName: 'Axis Bank',
      verified: true,
    },
    attendance: { workingDays: 22, presentDays: 22, paidLeave: 0, unpaidLeave: 0 },
    warnings: [],
  },
  {
    id: 'EMP006',
    name: 'Karan Verma',
    department: 'Finance',
    role: 'Financial Controller',
    grossSalary: 78000,
    deductions: 7800,
    netPay: 70200,
    status: 'Processed',
    avatar: null, // Shows KV initials avatar in screenshot
    initials: 'KV',
    avatarTheme: 'purple',
    contractId: 'CON-006',
    salaryStructureId: 'STR-001',
    bankDetails: {
      accountNumber: '501928374650',
      ifsc: 'KKBK0000591',
      bankName: 'Kotak Mahindra Bank',
      verified: true,
    },
    attendance: { workingDays: 22, presentDays: 22, paidLeave: 0, unpaidLeave: 0 },
    warnings: [],
  },
  {
    id: 'EMP007',
    name: 'Neha Sharma',
    department: 'Engineering',
    role: 'Backend Architect',
    grossSalary: 82000,
    deductions: 8200,
    netPay: 73800,
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=256',
    initials: 'NS',
    avatarTheme: 'rose',
    contractId: 'CON-007',
    salaryStructureId: 'STR-001',
    bankDetails: {
      accountNumber: '401928374659',
      ifsc: 'HDFC0001234',
      bankName: 'HDFC Bank',
      verified: true,
    },
    attendance: { workingDays: 22, presentDays: 19, paidLeave: 1, unpaidLeave: 2 },
    warnings: ['Pending tax regime selection declaration (Old vs New Regime)'],
  },
  {
    id: 'EMP008',
    name: 'Zaid Ali',
    department: 'Operations',
    role: 'Operations Specialist',
    grossSalary: 66000,
    deductions: 6600,
    netPay: 59400,
    status: 'Processed',
    avatar: null, // Shows ZA initials avatar in screenshot
    initials: 'ZA',
    avatarTheme: 'blue',
    contractId: 'CON-008',
    salaryStructureId: 'STR-001',
    bankDetails: {
      accountNumber: '301928374658',
      ifsc: 'SBIN0000892',
      bankName: 'State Bank of India',
      verified: true,
    },
    attendance: { workingDays: 22, presentDays: 22, paidLeave: 0, unpaidLeave: 0 },
    warnings: [],
  },
];

// Helper to generate the remaining 110 representative employees to make 118 total employees
// 4 more are set to Pending (making 6 pending total: EMP004, EMP007, EMP019, EMP035, EMP058, EMP082)
// 112 are Processed, 0 On Hold
function generateAllEmployees() {
  const departments = ['Engineering', 'Marketing', 'Design', 'Sales', 'HR', 'Finance', 'Operations', 'Product', 'Support'];
  const pendingIndices = [19, 35, 58, 82]; // 4 additional pending (alongside EMP004 and EMP007)
  const all = [...primaryEmployees];

  const firstNames = [
    'Imran', 'Pooja', 'Rahul', 'Ananya', 'Vikram', 'Divya', 'Siddharth', 'Meera',
    'Aditya', 'Ritu', 'Kavita', 'Manish', 'Alok', 'Tanya', 'Varun', 'Shweta',
    'Sameer', 'Priya', 'Deepak', 'Nisha', 'Gaurav', 'Sunita', 'Abhishek', 'Swati'
  ];
  const lastNames = [
    'Patel', 'Joshi', 'Saxena', 'Desai', 'Chopra', 'Bansal', 'Iyer', 'Menon',
    'Gupta', 'Reddy', 'Singhania', 'Bhatia', 'Malhotra', 'Dhar', 'Kulkarni', 'Mukherjee'
  ];

  for (let i = 9; i <= 118; i++) {
    const id = `EMP${String(i).padStart(3, '0')}`;
    const fName = firstNames[(i * 3) % firstNames.length];
    const lName = lastNames[(i * 7) % lastNames.length];
    const name = `${fName} ${lName}`;
    const department = departments[i % departments.length];
    
    // Vary salary realistically
    const grossSalary = 50000 + ((i * 3500) % 65000);
    const deductions = Math.round(grossSalary * 0.1);
    const netPay = grossSalary - deductions;

    const isPending = pendingIndices.includes(i);
    const status = isPending ? 'Pending' : 'Processed';

    const warnings = [];
    if (i === 19) warnings.push('PAN card mismatch with NSDL database');
    if (i === 35) warnings.push('Unverified bank IFSC code: SBIN0099999');
    if (i === 58) warnings.push('Attendance discrepancy: 3 unapproved overtime hours');
    if (i === 82) warnings.push('Gratuity computation pending for 5+ years milestone');

    const themes = ['purple', 'blue', 'pink', 'teal', 'violet', 'sky', 'rose', 'mint'];
    const avatarTheme = themes[i % themes.length];
    const initials = `${fName[0]}${lName[0]}`;

    all.push({
      id,
      name,
      department,
      role: `${department} Specialist`,
      grossSalary,
      deductions,
      netPay,
      status,
      avatar: i % 4 === 0 ? null : `https://images.unsplash.com/photo-${1500000000000 + (i * 1234567)}?auto=format&fit=crop&q=80&w=256`,
      initials,
      avatarTheme,
      contractId: `CON-${String(i).padStart(3, '0')}`,
      salaryStructureId: 'STR-001',
      bankDetails: {
        accountNumber: isPending && i === 35 ? '' : `601928374${i}`,
        ifsc: isPending && i === 35 ? '' : 'HDFC0001234',
        bankName: 'HDFC Bank',
        verified: !isPending,
      },
      attendance: { workingDays: 22, presentDays: 22, paidLeave: 0, unpaidLeave: 0 },
      warnings,
    });
  }

  return all;
}

export const initialEmployees = generateAllEmployees();

export const initialStages = [
  {
    step: 1,
    title: 'Select Payroll Period',
    subtitle: 'Sep 2026',
    status: 'completed', // completed, active, pending
  },
  {
    step: 2,
    title: 'Review Employee Data',
    subtitle: '118 employees',
    status: 'completed',
  },
  {
    step: 3,
    title: 'Calculate Payroll',
    subtitle: 'Completed',
    status: 'completed',
  },
  {
    step: 4,
    title: 'Generate Payslips',
    subtitle: 'Completed',
    status: 'completed',
  },
  {
    step: 5,
    title: 'Finalize & Process',
    subtitle: 'In Progress',
    status: 'active',
  },
];

// Horizontal 5-Step Process for Payrun Validation Screen
export const initialValidationStepStages = [
  {
    step: 1,
    title: 'Select Period',
    subtitle: 'Sep 2026',
    state: 'completed',
  },
  {
    step: 2,
    title: 'Validate Data',
    subtitle: 'Check for errors',
    state: 'active',
  },
  {
    step: 3,
    title: 'Review & Adjust',
    subtitle: 'Make changes if needed',
    state: 'pending',
  },
  {
    step: 4,
    title: 'Confirm & Process',
    subtitle: 'Generate payslips',
    state: 'pending',
  },
  {
    step: 5,
    title: 'Completed',
    subtitle: 'Payroll processed',
    state: 'pending',
  },
];

// Initial 6 Validation Checklist Items
export const initialValidationChecklist = [
  {
    id: 'master-data',
    title: 'Employee master data',
    description: 'All selected employees have valid profiles',
    status: 'passed', // passed, warning, error
    icon: 'Users',
  },
  {
    id: 'attendance-leave',
    title: 'Attendance & leave data',
    description: 'Attendance and approved leaves fetched',
    status: 'passed',
    icon: 'Calendar',
  },
  {
    id: 'salary-components',
    title: 'Salary components',
    description: 'All earnings and deductions configured',
    status: 'passed',
    icon: 'FileText',
  },
  {
    id: 'tax-calculations',
    title: 'Tax calculations',
    description: 'PF, ESI, TDS and other taxes validated',
    status: 'warning',
    icon: 'Percent',
  },
  {
    id: 'bank-details',
    title: 'Bank details',
    description: 'Bank accounts verified for salary transfer',
    status: 'error',
    icon: 'Landmark',
  },
  {
    id: 'net-pay',
    title: 'Net pay calculation',
    description: 'Net pay values within expected range',
    status: 'passed',
    icon: 'Calculator',
  },
];

// Initial 6 Employee Validation Issues (2 Errors, 4 Warnings)
export const initialValidationIssues = [
  {
    id: 'ISS-001',
    employeeId: 'EMP001',
    employeeName: 'Ayesha Siddiqui',
    department: 'Engineering',
    issueType: 'Missing Bank Details',
    details: 'No bank account added',
    severity: 'error', // 'error' | 'warning'
    action: 'Update',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    initials: 'AS',
    avatarTheme: 'purple',
  },
  {
    id: 'ISS-002',
    employeeId: 'EMP004',
    employeeName: 'Arjun Nair',
    department: 'Sales',
    issueType: 'Missing Bank Details',
    details: 'IFSC code invalid',
    severity: 'error',
    action: 'Update',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    initials: 'AN',
    avatarTheme: 'teal',
  },
  {
    id: 'ISS-003',
    employeeId: 'EMP006',
    employeeName: 'Karan Verma',
    department: 'Finance',
    issueType: 'Unapproved Overtime',
    details: '8 hours pending approval',
    severity: 'warning',
    action: 'Review',
    avatar: null,
    initials: 'KV',
    avatarTheme: 'purple',
  },
  {
    id: 'ISS-004',
    employeeId: 'EMP007',
    employeeName: 'Neha Sharma',
    department: 'Engineering',
    issueType: 'Leave Without Pay',
    details: '2 days LWP',
    severity: 'warning',
    action: 'Review',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=256',
    initials: 'NS',
    avatarTheme: 'rose',
  },
  {
    id: 'ISS-005',
    employeeId: 'EMP011',
    employeeName: 'Vikram Malhotra',
    department: 'Marketing',
    issueType: 'Overtime Not Approved',
    details: '4 hours pending manager sign-off',
    severity: 'warning',
    action: 'Review',
    avatar: null,
    initials: 'VM',
    avatarTheme: 'blue',
  },
  {
    id: 'ISS-006',
    employeeId: 'EMP010',
    employeeName: 'Pooja Nair',
    department: 'Engineering',
    issueType: 'Leave Without Pay',
    details: '1 day LWP marked for verification',
    severity: 'warning',
    action: 'Review',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
    initials: 'PN',
    avatarTheme: 'mint',
  },
];

// Validation Engine Calculation Helper
export function evaluateValidationResults(issues = [], totalEmployees = 118) {
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  const errorsCount = errors.length;
  const warningsCount = warnings.length;

  // 112 valid when 6 issues exist, increasing to 118 when all resolved
  const validRecords = totalEmployees - (errorsCount + warningsCount);

  const checklist = initialValidationChecklist.map((item) => {
    if (item.id === 'bank-details') {
      return {
        ...item,
        status: errorsCount > 0 ? 'error' : 'passed',
      };
    }
    if (item.id === 'tax-calculations') {
      return {
        ...item,
        status: warningsCount > 0 ? 'warning' : 'passed',
      };
    }
    return item;
  });

  return {
    totalEmployees,
    validRecords,
    errorsCount,
    warningsCount,
    canProceed: errorsCount === 0,
    checklist,
    errors,
    warnings,
  };
}

