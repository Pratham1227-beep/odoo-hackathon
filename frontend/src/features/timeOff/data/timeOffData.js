// Mock dataset for WageWise Time Off Management

export const mockEmployees = [
  {
    id: 'EMP001',
    name: 'Ayesha Siddiqui',
    email: 'ayesha.siddiqui@acme.com',
    department: 'Engineering',
    role: 'Senior Frontend Engineer',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    initials: 'AS',
    avatarTheme: 'purple',
  },
  {
    id: 'EMP002',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@acme.com',
    department: 'Marketing',
    role: 'Growth Marketing Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    initials: 'RM',
    avatarTheme: 'blue',
  },
  {
    id: 'EMP003',
    name: 'Sneha Kapoor',
    email: 'sneha.kapoor@acme.com',
    department: 'Design',
    role: 'Lead Product Designer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    initials: 'SK',
    avatarTheme: 'pink',
  },
  {
    id: 'EMP004',
    name: 'Arjun Nair',
    email: 'arjun.nair@acme.com',
    department: 'Sales',
    role: 'Enterprise Account Executive',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    initials: 'AN',
    avatarTheme: 'teal',
  },
  {
    id: 'EMP005',
    name: 'Fatima Khan',
    email: 'fatima.khan@acme.com',
    department: 'HR',
    role: 'HR Business Partner',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
    initials: 'FK',
    avatarTheme: 'violet',
  },
  {
    id: 'EMP006',
    name: 'Karan Verma',
    email: 'karan.verma@acme.com',
    department: 'Finance',
    role: 'Financial Controller',
    avatar: null, // Initials avatar
    initials: 'KV',
    avatarTheme: 'purple',
  },
  {
    id: 'EMP007',
    name: 'Neha Sharma',
    email: 'neha.sharma@acme.com',
    department: 'Engineering',
    role: 'Backend Architect',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=256',
    initials: 'NS',
    avatarTheme: 'rose',
  },
  {
    id: 'EMP008',
    name: 'Zaid Ali',
    email: 'zaid.ali@acme.com',
    department: 'Operations',
    role: 'Operations Specialist',
    avatar: null, // Initials avatar
    initials: 'ZA',
    avatarTheme: 'blue',
  },
  {
    id: 'EMP009',
    name: 'Imran Dhanani',
    email: 'imran.dhanani@acme.com',
    department: 'Support',
    role: 'Customer Support Lead',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=256',
    initials: 'ID',
    avatarTheme: 'mint',
  },
  {
    id: 'EMP010',
    name: 'Pooja Nair',
    email: 'pooja.nair@acme.com',
    department: 'Engineering',
    role: 'QA Automation Lead',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
    initials: 'PN',
    avatarTheme: 'purple',
  },
  {
    id: 'EMP011',
    name: 'Vikram Joshi',
    email: 'vikram.joshi@acme.com',
    department: 'Design',
    role: 'Motion & Brand Designer',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256',
    initials: 'VJ',
    avatarTheme: 'blue',
  },
  {
    id: 'EMP012',
    name: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@acme.com',
    department: 'HR',
    role: 'Talent Acquisition Specialist',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=256',
    initials: 'AD',
    avatarTheme: 'pink',
  },
];

// Initial 8 records matching reference screenshot perfectly
export const initialTimeOffRequests = [
  {
    id: 'REQ-001',
    employeeId: 'EMP001',
    employeeName: 'Ayesha Siddiqui',
    department: 'Engineering',
    leaveType: 'Annual Leave',
    startDate: '12 Sep 2026',
    endDate: '15 Sep 2026',
    days: 4,
    status: 'Pending',
    appliedOn: '05 Sep 2026',
    reason: 'Family vacation and personal travel',
  },
  {
    id: 'REQ-002',
    employeeId: 'EMP002',
    employeeName: 'Rohan Mehta',
    department: 'Marketing',
    leaveType: 'Sick Leave',
    startDate: '03 Sep 2026',
    endDate: '03 Sep 2026',
    days: 1,
    status: 'Approved',
    appliedOn: '02 Sep 2026',
    reason: 'Viral fever and prescribed medical rest',
  },
  {
    id: 'REQ-003',
    employeeId: 'EMP003',
    employeeName: 'Sneha Kapoor',
    department: 'Design',
    leaveType: 'Work From Home',
    startDate: '10 Sep 2026',
    endDate: '11 Sep 2026',
    days: 2,
    status: 'Pending',
    appliedOn: '07 Sep 2026',
    reason: 'Home renovation and internet installation',
  },
  {
    id: 'REQ-004',
    employeeId: 'EMP004',
    employeeName: 'Arjun Nair',
    department: 'Sales',
    leaveType: 'Personal Leave',
    startDate: '28 Aug 2026',
    endDate: '28 Aug 2026',
    days: 1,
    status: 'Rejected',
    appliedOn: '25 Aug 2026',
    reason: 'Personal errands during quarterly closing',
    rejectionReason: 'Critical sales closing period; please reschedule if possible.',
  },
  {
    id: 'REQ-005',
    employeeId: 'EMP005',
    employeeName: 'Fatima Khan',
    department: 'HR',
    leaveType: 'Maternity Leave',
    startDate: '01 Oct 2026',
    endDate: '30 Oct 2026',
    days: 30,
    status: 'Approved',
    appliedOn: '20 Aug 2026',
    reason: 'Maternity leave first phase (approved with medical docs)',
  },
  {
    id: 'REQ-006',
    employeeId: 'EMP006',
    employeeName: 'Karan Verma',
    department: 'Finance',
    leaveType: 'Unpaid Leave',
    startDate: '18 Sep 2026',
    endDate: '20 Sep 2026',
    days: 3,
    status: 'Pending',
    appliedOn: '10 Sep 2026',
    reason: 'Extended family emergency outside city',
  },
  {
    id: 'REQ-007',
    employeeId: 'EMP007',
    employeeName: 'Neha Sharma',
    department: 'Engineering',
    leaveType: 'Bereavement Leave',
    startDate: '05 Sep 2026',
    endDate: '05 Sep 2026',
    days: 1,
    status: 'Approved',
    appliedOn: '04 Sep 2026',
    reason: 'Family bereavement services',
  },
  {
    id: 'REQ-008',
    employeeId: 'EMP008',
    employeeName: 'Zaid Ali',
    department: 'Operations',
    leaveType: 'Compensatory Off',
    startDate: '14 Sep 2026',
    endDate: '14 Sep 2026',
    days: 1,
    status: 'Pending',
    appliedOn: '09 Sep 2026',
    reason: 'Worked on weekend server migration on 30 Aug',
  },
];

// Helper to generate full realistic dataset of 65 requests matching exactly:
// Total: 65, Pending: 12, Approved: 48, Rejected: 5, Cancelled: 0
export const generateFullRequests = () => {
  const fullList = [...initialTimeOffRequests];

  // We have 4 Pending (REQ-001, REQ-003, REQ-006, REQ-008), need 8 more to make 12.
  const additionalPending = [
    { emp: 'EMP009', name: 'Imran Dhanani', dept: 'Support', type: 'Sick Leave', start: '16 Sep 2026', end: '17 Sep 2026', days: 2, applied: '11 Sep 2026' },
    { emp: 'EMP010', name: 'Pooja Nair', dept: 'Engineering', type: 'Annual Leave', start: '22 Sep 2026', end: '25 Sep 2026', days: 4, applied: '08 Sep 2026' },
    { emp: 'EMP011', name: 'Vikram Joshi', dept: 'Design', type: 'Work From Home', start: '15 Sep 2026', end: '16 Sep 2026', days: 2, applied: '10 Sep 2026' },
    { emp: 'EMP012', name: 'Ananya Deshmukh', dept: 'HR', type: 'Personal Leave', start: '19 Sep 2026', end: '19 Sep 2026', days: 1, applied: '12 Sep 2026' },
    { emp: 'EMP001', name: 'Ayesha Siddiqui', dept: 'Engineering', type: 'Compensatory Off', start: '28 Sep 2026', end: '28 Sep 2026', days: 1, applied: '06 Sep 2026' },
    { emp: 'EMP002', name: 'Rohan Mehta', dept: 'Marketing', type: 'Annual Leave', start: '24 Sep 2026', end: '26 Sep 2026', days: 3, applied: '09 Sep 2026' },
    { emp: 'EMP004', name: 'Arjun Nair', dept: 'Sales', type: 'Work From Home', start: '21 Sep 2026', end: '22 Sep 2026', days: 2, applied: '10 Sep 2026' },
    { emp: 'EMP007', name: 'Neha Sharma', dept: 'Engineering', type: 'Personal Leave', start: '29 Sep 2026', end: '30 Sep 2026', days: 2, applied: '11 Sep 2026' },
  ];

  additionalPending.forEach((item, idx) => {
    fullList.push({
      id: `REQ-00${9 + idx}`,
      employeeId: item.emp,
      employeeName: item.name,
      department: item.dept,
      leaveType: item.type,
      startDate: item.start,
      endDate: item.end,
      days: item.days,
      status: 'Pending',
      appliedOn: item.applied,
      reason: 'Scheduled planned time off',
    });
  });

  // We have 1 Rejected (REQ-004), need 4 more to make 5.
  const additionalRejected = [
    { emp: 'EMP003', name: 'Sneha Kapoor', dept: 'Design', type: 'Annual Leave', start: '01 Sep 2026', end: '05 Sep 2026', days: 5, applied: '20 Aug 2026', rej: 'Overlapping product release deadline.' },
    { emp: 'EMP006', name: 'Karan Verma', dept: 'Finance', type: 'Personal Leave', start: '15 Aug 2026', end: '16 Aug 2026', days: 2, applied: '10 Aug 2026', rej: 'Audit week coverage required.' },
    { emp: 'EMP008', name: 'Zaid Ali', dept: 'Operations', type: 'Compensatory Off', start: '10 Aug 2026', end: '10 Aug 2026', days: 1, applied: '05 Aug 2026', rej: 'Insufficient comp-off balance logged.' },
    { emp: 'EMP010', name: 'Pooja Nair', dept: 'Engineering', type: 'Unpaid Leave', start: '01 Aug 2026', end: '10 Aug 2026', days: 8, applied: '25 Jul 2026', rej: 'Exceeded unpaid limit without HR approval.' },
  ];

  additionalRejected.forEach((item, idx) => {
    fullList.push({
      id: `REQ-0${17 + idx}`,
      employeeId: item.emp,
      employeeName: item.name,
      department: item.dept,
      leaveType: item.type,
      startDate: item.start,
      endDate: item.end,
      days: item.days,
      status: 'Rejected',
      appliedOn: item.applied,
      reason: 'Personal commitments',
      rejectionReason: item.rej,
    });
  });

  // We have 3 Approved (REQ-002, REQ-005, REQ-007), need 45 more to make 48.
  const approvedEmployees = [
    'Ayesha Siddiqui', 'Rohan Mehta', 'Sneha Kapoor', 'Arjun Nair', 'Fatima Khan',
    'Karan Verma', 'Neha Sharma', 'Zaid Ali', 'Imran Dhanani', 'Pooja Nair',
    'Vikram Joshi', 'Ananya Deshmukh'
  ];
  const empIds = ['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010', 'EMP011', 'EMP012'];
  const depts = ['Engineering', 'Marketing', 'Design', 'Sales', 'HR', 'Finance', 'Engineering', 'Operations', 'Support', 'Engineering', 'Design', 'HR'];
  const leaveTypesList = ['Annual Leave', 'Sick Leave', 'Work From Home', 'Personal Leave', 'Compensatory Off'];

  for (let i = 1; i <= 45; i++) {
    const empIdx = i % approvedEmployees.length;
    const typeIdx = i % leaveTypesList.length;
    const day = (i % 25) + 1;
    const dayStr = String(day).padStart(2, '0');
    const daysCount = (i % 3) + 1;

    fullList.push({
      id: `REQ-0${21 + i}`,
      employeeId: empIds[empIdx],
      employeeName: approvedEmployees[empIdx],
      department: depts[empIdx],
      leaveType: leaveTypesList[typeIdx],
      startDate: `${dayStr} Sep 2026`,
      endDate: `${String(day + daysCount - 1).padStart(2, '0')} Sep 2026`,
      days: daysCount,
      status: 'Approved',
      appliedOn: `${String(Math.max(1, day - 3)).padStart(2, '0')} Sep 2026`,
      reason: 'Approved standard leave entitlement',
    });
  }

  return fullList;
};

// Leave Balance items matching screenshot
export const initialLeaveBalances = [
  {
    id: 'annual-leave',
    name: 'Annual Leave',
    used: 12,
    total: 20,
    unit: 'days',
    icon: 'Palmtree',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
  },
  {
    id: 'sick-leave',
    name: 'Sick Leave',
    used: 8,
    total: 10,
    unit: 'days',
    icon: 'Cross',
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50 dark:bg-rose-950/60',
  },
  {
    id: 'personal-leave',
    name: 'Personal Leave',
    used: 4,
    total: 5,
    unit: 'days',
    icon: 'User',
    iconColor: 'text-sky-500',
    iconBg: 'bg-sky-50 dark:bg-sky-950/60',
  },
  {
    id: 'maternity-leave',
    name: 'Maternity Leave',
    used: 90,
    total: 90,
    unit: 'days',
    icon: 'Heart',
    iconColor: 'text-pink-500',
    iconBg: 'bg-pink-50 dark:bg-pink-950/60',
  },
  {
    id: 'compensatory-off',
    name: 'Compensatory Off',
    used: 3,
    total: 5,
    unit: 'days',
    icon: 'Clock',
    iconColor: 'text-indigo-500',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
  },
];

// Company Holidays matching reference screenshot
export const companyHolidays = [
  {
    date: '2 Oct 2026',
    name: 'Gandhi Jayanti',
    type: 'National Holiday',
  },
  {
    date: '12 Nov 2026',
    name: 'Diwali',
    type: 'Public Holiday',
  },
  {
    date: '25 Dec 2026',
    name: 'Christmas',
    type: 'Public Holiday',
  },
  {
    date: '26 Jan 2027',
    name: 'Republic Day',
    type: 'National Holiday',
  },
  {
    date: '15 Aug 2027',
    name: 'Independence Day',
    type: 'National Holiday',
  },
];

// Leave type configuration with metadata
export const leaveTypeConfig = {
  'Annual Leave': {
    name: 'Annual Leave',
    iconName: 'Palmtree',
    color: 'emerald',
    iconClass: 'text-emerald-500',
  },
  'Sick Leave': {
    name: 'Sick Leave',
    iconName: 'PlusSquare',
    color: 'rose',
    iconClass: 'text-rose-500',
  },
  'Work From Home': {
    name: 'Work From Home',
    iconName: 'Home',
    color: 'blue',
    iconClass: 'text-sky-500',
  },
  'Personal Leave': {
    name: 'Personal Leave',
    iconName: 'User',
    color: 'sky',
    iconClass: 'text-blue-500',
  },
  'Maternity Leave': {
    name: 'Maternity Leave',
    iconName: 'Heart',
    color: 'pink',
    iconClass: 'text-pink-500',
  },
  'Unpaid Leave': {
    name: 'Unpaid Leave',
    iconName: 'PauseCircle',
    color: 'purple',
    iconClass: 'text-purple-500',
  },
  'Bereavement Leave': {
    name: 'Bereavement Leave',
    iconName: 'Flower2',
    color: 'teal',
    iconClass: 'text-teal-500',
  },
  'Compensatory Off': {
    name: 'Compensatory Off',
    iconName: 'Clock',
    color: 'indigo',
    iconClass: 'text-indigo-500',
  },
};

export const leaveTypeFilterOptions = [
  'All Types',
  'Annual Leave',
  'Sick Leave',
  'Work From Home',
  'Personal Leave',
  'Maternity Leave',
  'Unpaid Leave',
  'Bereavement Leave',
  'Compensatory Off',
];

export const statusFilterOptions = [
  'All Statuses',
  'Pending',
  'Approved',
  'Rejected',
  'Cancelled',
];

export const departmentFilterOptions = [
  'All Departments',
  'Engineering',
  'Marketing',
  'Design',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Support',
];
