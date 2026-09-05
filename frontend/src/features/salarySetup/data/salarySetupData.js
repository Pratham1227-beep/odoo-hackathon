// WageWise Salary Setup Data & Calculation Engine

export const initialSalaryStructures = [
  {
    id: 'STR-001',
    name: 'Regular Full-Time Structure',
    description: 'Standard salary structure for permanent full-time employees in India',
    active: true,
    employeesCount: 85,
    rulesCount: 8,
    ruleIds: ['RULE-001', 'RULE-002', 'RULE-003', 'RULE-004', 'RULE-005', 'RULE-006', 'RULE-007', 'RULE-008'],
  },
  {
    id: 'STR-002',
    name: 'Executive Leadership Structure',
    description: 'Salary structure for Directors, VPs, and Executive leadership team',
    active: true,
    employeesCount: 12,
    rulesCount: 10,
    ruleIds: ['RULE-001', 'RULE-002', 'RULE-003', 'RULE-004', 'RULE-009', 'RULE-005', 'RULE-006', 'RULE-007', 'RULE-010', 'RULE-008'],
  },
  {
    id: 'STR-003',
    name: 'Internship & Trainee Structure',
    description: 'Stipend and fixed allowance structure for college interns and trainees',
    active: true,
    employeesCount: 15,
    rulesCount: 5,
    ruleIds: ['RULE-001', 'RULE-003', 'RULE-004', 'RULE-006', 'RULE-008'],
  },
  {
    id: 'STR-004',
    name: 'Contractor & Consultant Structure',
    description: 'Professional fees and statutory TDS deductions for contract workers',
    active: true,
    employeesCount: 6,
    rulesCount: 4,
    ruleIds: ['RULE-001', 'RULE-004', 'RULE-007', 'RULE-008'],
  },
];

export const initialSalaryRules = [
  {
    id: 'RULE-001',
    name: 'Basic Salary',
    code: 'BASIC',
    category: 'Basic',
    sequence: 1,
    computationType: 'fixed',
    value: 40000,
    description: 'Core wage component of the employment agreement',
    active: true,
  },
  {
    id: 'RULE-002',
    name: 'House Rent Allowance (HRA)',
    code: 'HRA',
    category: 'Allowance',
    sequence: 2,
    computationType: 'percentage',
    percentageOf: 'BASIC',
    percentageValue: 50,
    value: 20000,
    description: 'Tax-exempt residential rent allowance (50% of Basic)',
    active: true,
  },
  {
    id: 'RULE-003',
    name: 'Conveyance Allowance',
    code: 'CA',
    category: 'Allowance',
    sequence: 3,
    computationType: 'fixed',
    value: 5000,
    description: 'Commuting allowance for travel between residence and workplace',
    active: true,
  },
  {
    id: 'RULE-004',
    name: 'Medical Allowance',
    code: 'MED',
    category: 'Allowance',
    sequence: 4,
    computationType: 'fixed',
    value: 3000,
    description: 'Allowance for medical reimbursement and wellness coverage',
    active: true,
  },
  {
    id: 'RULE-005',
    name: 'Other Allowance',
    code: 'OTHER_ALLW',
    category: 'Allowance',
    sequence: 5,
    computationType: 'fixed',
    value: 2000,
    description: 'Special supplementary or miscellaneous allowance',
    active: true,
  },
  {
    id: 'RULE-006',
    name: 'Provident Fund (PF)',
    code: 'PF',
    category: 'Deduction',
    sequence: 6,
    computationType: 'percentage',
    percentageOf: 'BASIC',
    percentageValue: 12,
    value: 2400,
    description: 'Statutory Employees Provident Fund retirement deduction',
    active: true,
  },
  {
    id: 'RULE-007',
    name: 'Professional Tax',
    code: 'PT',
    category: 'Deduction',
    sequence: 7,
    computationType: 'fixed',
    value: 200,
    description: 'State government statutory professional tax assessment',
    active: true,
  },
  {
    id: 'RULE-008',
    name: 'Income Tax (TDS)',
    code: 'TDS',
    category: 'Deduction',
    sequence: 8,
    computationType: 'formula',
    formula: 'PROJECTED_ANNUAL_TAX / 12',
    value: 5000,
    description: 'Monthly tax deducted at source under Indian IT regulations',
    active: true,
  },
  {
    id: 'RULE-009',
    name: 'Other Deduction',
    code: 'OTHER_DED',
    category: 'Deduction',
    sequence: 9,
    computationType: 'fixed',
    value: 1000,
    description: 'Company equipment, welfare fund, or incidental deductions',
    active: true,
  },
];

export const initialEmployeeSalaries = [
  {
    id: 'EMP001',
    name: 'Ayesha Siddiqui',
    initials: 'AS',
    avatarBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300',
    department: 'Engineering',
    designation: 'Software Engineer',
    employmentType: 'Full Time',
    dateOfJoining: '12 Jan 2024',
    salaryStructureId: 'STR-001',
    basicSalary: 40000,
    allowances: [
      { id: 'allw-1', name: 'House Rent Allowance (HRA)', code: 'HRA', amount: 20000, computationType: 'percentage', percentageValue: 50 },
      { id: 'allw-2', name: 'Conveyance Allowance', code: 'CA', amount: 5000, computationType: 'fixed' },
      { id: 'allw-3', name: 'Medical Allowance', code: 'MED', amount: 3000, computationType: 'fixed' },
      { id: 'allw-4', name: 'Other Allowance', code: 'OTHER_ALLW', amount: 2000, computationType: 'fixed' },
    ],
    deductions: [
      { id: 'ded-1', name: 'Provident Fund (PF)', code: 'PF', amount: 2400, computationType: 'percentage', percentageValue: 12 },
      { id: 'ded-2', name: 'Professional Tax', code: 'PT', amount: 200, computationType: 'fixed' },
      { id: 'ded-3', name: 'Income Tax (TDS)', code: 'TDS', amount: 5000, computationType: 'formula' },
      { id: 'ded-4', name: 'Other Deduction', code: 'OTHER_DED', amount: 1000, computationType: 'fixed' },
    ],
    paymentDetails: {
      paymentMethod: 'Bank Transfer',
      bankAccountNumber: '*********1234',
      rawAccountNumber: '987654321234',
      bankName: 'HDFC Bank Ltd',
      ifscCode: 'HDFC0001234',
      paymentCycle: 'Monthly (1st of every month)',
    },
  },
  {
    id: 'EMP002',
    name: 'Rohan Mehta',
    initials: 'RM',
    avatarBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300',
    department: 'Design',
    designation: 'Product Designer',
    employmentType: 'Full Time',
    dateOfJoining: '15 Mar 2023',
    salaryStructureId: 'STR-001',
    basicSalary: 45000,
    allowances: [
      { id: 'allw-1', name: 'House Rent Allowance (HRA)', code: 'HRA', amount: 22500, computationType: 'percentage', percentageValue: 50 },
      { id: 'allw-2', name: 'Conveyance Allowance', code: 'CA', amount: 5000, computationType: 'fixed' },
      { id: 'allw-3', name: 'Medical Allowance', code: 'MED', amount: 3500, computationType: 'fixed' },
      { id: 'allw-4', name: 'Other Allowance', code: 'OTHER_ALLW', amount: 3000, computationType: 'fixed' },
    ],
    deductions: [
      { id: 'ded-1', name: 'Provident Fund (PF)', code: 'PF', amount: 2700, computationType: 'percentage', percentageValue: 12 },
      { id: 'ded-2', name: 'Professional Tax', code: 'PT', amount: 200, computationType: 'fixed' },
      { id: 'ded-3', name: 'Income Tax (TDS)', code: 'TDS', amount: 6200, computationType: 'formula' },
      { id: 'ded-4', name: 'Other Deduction', code: 'OTHER_DED', amount: 500, computationType: 'fixed' },
    ],
    paymentDetails: {
      paymentMethod: 'Bank Transfer',
      bankAccountNumber: '*********5678',
      rawAccountNumber: '123456785678',
      bankName: 'ICICI Bank Ltd',
      ifscCode: 'ICIC0005678',
      paymentCycle: 'Monthly (1st of every month)',
    },
  },
  {
    id: 'EMP003',
    name: 'Sneha Kapoor',
    initials: 'SK',
    avatarBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
    department: 'Marketing',
    designation: 'Marketing Lead',
    employmentType: 'Full Time',
    dateOfJoining: '01 Jun 2022',
    salaryStructureId: 'STR-002',
    basicSalary: 55000,
    allowances: [
      { id: 'allw-1', name: 'House Rent Allowance (HRA)', code: 'HRA', amount: 27500, computationType: 'percentage', percentageValue: 50 },
      { id: 'allw-2', name: 'Conveyance Allowance', code: 'CA', amount: 6000, computationType: 'fixed' },
      { id: 'allw-3', name: 'Medical Allowance', code: 'MED', amount: 4000, computationType: 'fixed' },
      { id: 'allw-4', name: 'Executive Allowance', code: 'EXEC_ALLW', amount: 8000, computationType: 'fixed' },
    ],
    deductions: [
      { id: 'ded-1', name: 'Provident Fund (PF)', code: 'PF', amount: 3300, computationType: 'percentage', percentageValue: 12 },
      { id: 'ded-2', name: 'Professional Tax', code: 'PT', amount: 200, computationType: 'fixed' },
      { id: 'ded-3', name: 'Income Tax (TDS)', code: 'TDS', amount: 8500, computationType: 'formula' },
      { id: 'ded-4', name: 'Health Insurance Premium', code: 'INS_PREM', amount: 1500, computationType: 'fixed' },
    ],
    paymentDetails: {
      paymentMethod: 'Bank Transfer',
      bankAccountNumber: '*********9012',
      rawAccountNumber: '556677889012',
      bankName: 'State Bank of India',
      ifscCode: 'SBIN0009012',
      paymentCycle: 'Monthly (1st of every month)',
    },
  },
  {
    id: 'EMP004',
    name: 'Vikram Malhotra',
    initials: 'VM',
    avatarBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300',
    department: 'HR',
    designation: 'HR Manager',
    employmentType: 'Full Time',
    dateOfJoining: '10 Aug 2021',
    salaryStructureId: 'STR-001',
    basicSalary: 48000,
    allowances: [
      { id: 'allw-1', name: 'House Rent Allowance (HRA)', code: 'HRA', amount: 24000, computationType: 'percentage', percentageValue: 50 },
      { id: 'allw-2', name: 'Conveyance Allowance', code: 'CA', amount: 5000, computationType: 'fixed' },
      { id: 'allw-3', name: 'Medical Allowance', code: 'MED', amount: 3500, computationType: 'fixed' },
      { id: 'allw-4', name: 'Special Allowance', code: 'SPEC_ALLW', amount: 2500, computationType: 'fixed' },
    ],
    deductions: [
      { id: 'ded-1', name: 'Provident Fund (PF)', code: 'PF', amount: 2880, computationType: 'percentage', percentageValue: 12 },
      { id: 'ded-2', name: 'Professional Tax', code: 'PT', amount: 200, computationType: 'fixed' },
      { id: 'ded-3', name: 'Income Tax (TDS)', code: 'TDS', amount: 7000, computationType: 'formula' },
      { id: 'ded-4', name: 'Voluntary PF', code: 'VPF', amount: 1200, computationType: 'fixed' },
    ],
    paymentDetails: {
      paymentMethod: 'Bank Transfer',
      bankAccountNumber: '*********3456',
      rawAccountNumber: '998877663456',
      bankName: 'Axis Bank Ltd',
      ifscCode: 'UTIB0003456',
      paymentCycle: 'Monthly (1st of every month)',
    },
  },
];

export const initialRecentUpdates = [
  {
    id: 'upd-1',
    title: 'Salary structure updated',
    author: 'Admin',
    timestamp: '12 Sep 2026, 10:24 AM',
    color: 'emerald',
    iconColor: 'bg-emerald-500',
    details: 'Applied statutory Provident Fund revision to standard payrun formula.',
  },
  {
    id: 'upd-2',
    title: 'HRA amount changed',
    author: 'HR Manager',
    timestamp: '05 Sep 2026, 02:15 PM',
    color: 'indigo',
    iconColor: 'bg-indigo-500',
    details: 'Adjusted HRA allowance tier to ₹20,000 based on metro city revision.',
  },
  {
    id: 'upd-3',
    title: 'New allowance added',
    author: 'Admin',
    timestamp: '28 Aug 2026, 11:30 AM',
    color: 'blue',
    iconColor: 'bg-blue-500',
    details: 'Introduced Medical Allowance component to standard engineering profiles.',
  },
];

export const departmentsList = [
  'Engineering',
  'Design',
  'Marketing',
  'HR',
  'Finance',
  'Operations',
  'Product Management',
  'Customer Support',
];

export const designationsList = [
  'Software Engineer',
  'Senior Software Engineer',
  'Product Designer',
  'UI/UX Designer',
  'Marketing Lead',
  'HR Manager',
  'Finance Analyst',
  'Operations Lead',
  'Frontend Developer',
  'Backend Developer',
];

export const employmentTypesList = [
  'Full Time',
  'Part Time',
  'Contract',
  'Internship',
];

export const paymentMethodsList = [
  'Bank Transfer',
  'Cheque',
  'Direct Deposit (UPI)',
  'Cash',
];

export const paymentCyclesList = [
  'Monthly (1st of every month)',
  'Monthly (Last working day)',
  'Bi-Weekly (Every two weeks)',
  'Weekly',
];

/**
 * Helper to compute Salary Totals dynamically
 */
export function calculateSalarySummary(basicSalary, allowances = [], deductions = [], multiplier = 1) {
  const basic = Number(basicSalary || 0) * multiplier;
  const totalAllowances = allowances.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) * multiplier;
  const grossSalary = basic + totalAllowances;
  const totalDeductions = deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) * multiplier;
  const netSalary = grossSalary - totalDeductions;

  return {
    basicSalary: basic,
    totalAllowances,
    grossSalary,
    totalDeductions,
    netSalary,
  };
}

/**
 * Format Indian currency with ₹ symbol
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const val = Math.round(Number(amount));
  return '₹' + val.toLocaleString('en-IN');
}
