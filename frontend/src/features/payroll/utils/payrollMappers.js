const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const PAYRUN_STATUS_UI = {
  DRAFT: 'Draft',
  PROCESSING: 'Processing',
  PROCESSED: 'Processed',
  FINALIZED: 'Finalized',
};

const EMPLOYEE_STATUS_UI = {
  PENDING: 'Pending',
  COMPUTED: 'Processed',
  ISSUE: 'On Hold',
};

const AVATAR_THEMES = ['purple', 'blue', 'pink', 'teal', 'violet', 'sky', 'rose', 'mint'];

export const formatINR = (amount) => {
  const num = Number(amount || 0);
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

export const formatINRCompact = (amount) => {
  const num = Number(amount || 0);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  return formatINR(num);
};

export const monthYearLabel = (month, year) => {
  const name = MONTH_NAMES[(month || 1) - 1] || 'Unknown';
  return `${name} ${year || ''}`.trim();
};

export const getMonthYearFromLabel = (label) => {
  if (!label) {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  }
  const parts = String(label).replace(/\s*\(Monthly\)\s*/i, '').trim().split(/\s+/);
  const monthName = parts[0];
  const year = parseInt(parts[1], 10) || new Date().getFullYear();
  const month = MONTH_NAMES.findIndex((m) => m.toLowerCase() === monthName.toLowerCase()) + 1;
  return { month: month || new Date().getMonth() + 1, year };
};

export const periodBoundsForMonth = (month, year) => {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { period_start: start, period_end: end };
};

const pickTheme = (seed = '') => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i)) % AVATAR_THEMES.length;
  }
  return AVATAR_THEMES[hash];
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '??';

export const mapPayrunStatusToUi = (status) => PAYRUN_STATUS_UI[status] || status || 'Draft';

export const mapEmployeeStatusToUi = (status) => EMPLOYEE_STATUS_UI[status] || 'Pending';

export const buildStagesFromPayrun = (payrun) => {
  const status = payrun?.status || 'DRAFT';
  const order = ['DRAFT', 'PROCESSING', 'PROCESSED', 'FINALIZED'];
  const idx = Math.max(0, order.indexOf(status));

  const labels = [
    { step: 1, label: 'Draft created', key: 'DRAFT' },
    { step: 2, label: 'Processing', key: 'PROCESSING' },
    { step: 3, label: 'Computed', key: 'PROCESSED' },
    { step: 4, label: 'Validated', key: 'PROCESSED' },
    { step: 5, label: 'Finalized', key: 'FINALIZED' },
  ];

  return labels.map((st) => {
    let stStatus = 'upcoming';
    if (status === 'FINALIZED') stStatus = 'completed';
    else if (st.key === 'DRAFT' && idx >= 0) stStatus = idx > 0 ? 'completed' : 'active';
    else if (st.key === 'PROCESSING' && idx >= 1) stStatus = idx > 1 ? 'completed' : 'active';
    else if (st.key === 'PROCESSED' && idx >= 2) {
      stStatus = status === 'PROCESSED' && st.step === 4 ? 'active' : idx > 2 ? 'completed' : st.step === 3 ? 'completed' : 'active';
    } else if (st.key === 'FINALIZED' && idx >= 3) stStatus = 'completed';
    return { ...st, status: stStatus };
  });
};

export const stageNumberFromStatus = (status) => {
  switch (status) {
    case 'FINALIZED':
      return 6;
    case 'PROCESSED':
      return 5;
    case 'PROCESSING':
      return 2;
    case 'DRAFT':
    default:
      return 1;
  }
};

export const mapPayrunToBatch = (payrun) => {
  const statusUi = mapPayrunStatusToUi(payrun.status);
  const isOpen = ['DRAFT', 'PROCESSING', 'PROCESSED'].includes(payrun.status);
  return {
    id: payrun.id,
    period: payrun.name || monthYearLabel(payrun.month, payrun.year),
    structure: 'Org Salary Structure',
    employeesCount: payrun.total_employees || 0,
    grossPayout: formatINR(payrun.total_gross),
    netPayout: formatINR(payrun.total_net),
    payDate: payrun.finalized_at
      ? new Date(payrun.finalized_at).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : payrun.period_end || '—',
    status: statusUi,
    statusType: isOpen ? 'amber' : 'emerald',
    actionLink: isOpen
      ? `/payrun?payrunId=${payrun.id}`
      : `/payrun?payrunId=${payrun.id}`,
    raw: payrun,
  };
};

export const mapPayrunToRecent = (payrun) => ({
  id: payrun.id,
  period: payrun.name || monthYearLabel(payrun.month, payrun.year),
  processedDate: payrun.computed_at
    ? new Date(payrun.computed_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : payrun.period_end || '—',
  totalPayoutFormatted: formatINRCompact(payrun.total_net),
  totalPayout: Number(payrun.total_net || 0),
  employeesProcessed: payrun.processed_employees || 0,
  status: mapPayrunStatusToUi(payrun.status),
  raw: payrun,
});

export const mapPayrunEmployeeToUi = (emp, employeeMeta = {}) => {
  const name =
    emp.employee_name ||
    employeeMeta.name ||
    employeeMeta.full_name ||
    'Employee';
  const code = emp.employee_code || employeeMeta.employee_code || emp.employee_id;
  const department =
    employeeMeta.department?.name ||
    employeeMeta.department ||
    'Unassigned';
  const role =
    employeeMeta.designation?.title ||
    employeeMeta.role ||
    '';

  return {
    id: emp.employee_id,
    payrunEmployeeId: emp.id,
    employeeUuid: emp.employee_id,
    name,
    department,
    role,
    grossSalary: Number(emp.gross_salary || 0),
    deductions: Number(emp.total_deductions || 0),
    netPay: Number(emp.net_salary || 0),
    status: mapEmployeeStatusToUi(emp.status),
    apiStatus: emp.status,
    avatar: null,
    initials: getInitials(name),
    avatarTheme: pickTheme(emp.employee_id || name),
    contractId: emp.contract_id,
    salaryStructureId: null,
    bankDetails: {
      accountNumber: '—',
      ifsc: '—',
      bankName: '—',
      verified: emp.is_ready,
    },
    attendance: {
      workingDays: Number(emp.payable_days || 0),
      presentDays: Number(emp.worked_days || 0),
      paidLeave: Number(emp.leave_days || 0),
      unpaidLeave: Number(emp.absent_days || 0),
    },
    warnings: emp.status === 'ISSUE' ? ['Needs review before finalization'] : [],
    isReady: emp.is_ready,
    employeeCode: code,
  };
};

export const mapIssueToUi = (issue, employeeMeta = {}) => {
  const severity = String(issue.severity || 'WARNING').toLowerCase();
  return {
    id: issue.id,
    employeeId: issue.employee_code || issue.employee_id || '—',
    employeeUuid: issue.employee_id,
    employeeName:
      issue.employee_name ||
      employeeMeta.name ||
      employeeMeta.full_name ||
      'Unknown',
    department: employeeMeta.department?.name || employeeMeta.department || '—',
    issueType: issue.title || issue.issue_code,
    details: issue.description || '',
    severity: severity === 'error' ? 'error' : severity === 'info' ? 'info' : 'warning',
    category: issue.category,
    status: issue.status,
    raw: issue,
  };
};

export const mapDashboardToKpis = (dashboard) => {
  const latest = dashboard?.latest_payrun;
  return [
    {
      id: 'ytd-net',
      title: 'YTD Net Payroll',
      value: formatINRCompact(dashboard?.ytd_net),
      badge: `${dashboard?.ytd_processed_payruns || 0} runs`,
      theme: 'purple',
      icon: 'Coins',
      trend: formatINRCompact(dashboard?.ytd_gross) + ' gross',
      trendType: 'positive',
      subtitle: null,
    },
    {
      id: 'latest-run',
      title: 'Latest Payrun',
      value: latest
        ? mapPayrunStatusToUi(latest.status)
        : 'None',
      badge: latest ? monthYearLabel(latest.month, latest.year) : null,
      theme: 'emerald',
      icon: 'PlayCircle',
      trend: latest ? formatINRCompact(latest.total_net) : null,
      trendType: 'positive',
      subtitle: latest ? `${latest.processed_employees}/${latest.total_employees} processed` : 'Create a payrun to begin',
    },
    {
      id: 'headcount',
      title: 'Active Employees',
      value: String(dashboard?.total_employees || 0),
      badge: null,
      theme: 'blue',
      icon: 'Landmark',
      trend: null,
      trendType: null,
      subtitle: 'In payroll scope',
    },
    {
      id: 'issues',
      title: 'Open Issues',
      value: String(dashboard?.open_issue_count || 0),
      badge: (dashboard?.open_issue_count || 0) > 0 ? 'Review' : 'Clear',
      theme: 'amber',
      icon: 'ShieldAlert',
      trend: null,
      trendType: null,
      subtitle: 'Across active payruns',
    },
  ];
};

const EARNING_CATEGORIES = new Set(['BASIC', 'ALLOWANCE', 'GROSS', 'EARNING', 'EARNINGS']);
const DEDUCTION_CATEGORIES = new Set(['DEDUCTION', 'DEDUCTIONS', 'TAX']);

export const mapPayslipDetailToUi = (payslip, orgName = 'WageWise') => {
  const lines = payslip.lines || [];
  const earnings = lines
    .filter((l) => EARNING_CATEGORIES.has(String(l.category || '').toUpperCase()) && String(l.category).toUpperCase() !== 'GROSS' && String(l.category).toUpperCase() !== 'NET')
    .map((l) => ({
      id: l.id,
      name: l.name,
      amount: Number(l.amount || 0),
      code: l.code,
    }));

  const deductions = lines
    .filter((l) => DEDUCTION_CATEGORIES.has(String(l.category || '').toUpperCase()))
    .map((l) => ({
      id: l.id,
      name: l.name,
      amount: Number(l.amount || 0),
      code: l.code,
    }));

  // Fallback if categories don't match
  if (earnings.length === 0 && deductions.length === 0 && lines.length > 0) {
    lines.forEach((l) => {
      const amt = Number(l.amount || 0);
      if (amt >= 0 && String(l.category).toUpperCase() !== 'NET') {
        earnings.push({ id: l.id, name: l.name, amount: amt, code: l.code });
      } else if (amt < 0) {
        deductions.push({ id: l.id, name: l.name, amount: Math.abs(amt), code: l.code });
      }
    });
  }

  if (earnings.length === 0) {
    earnings.push({
      id: 'basic',
      name: 'Basic Salary',
      amount: Number(payslip.basic_salary || payslip.gross_salary || 0),
      code: 'BASIC',
    });
  }

  const periodLabel = monthYearLabel(
    new Date(payslip.period_start).getMonth() + 1,
    new Date(payslip.period_start).getFullYear()
  );

  const name = payslip.employee_name || 'Employee';
  const deliveries = payslip.deliveries || [];

  return {
    id: payslip.id,
    payslipNumber: payslip.payslip_number,
    employee: {
      id: payslip.employee_code || payslip.employee_id,
      uuid: payslip.employee_id,
      name,
      role: '',
      designation: '',
      department: '',
      employeeType: 'Full-time',
      dateOfJoining: '',
      pan: '',
      uan: '',
      email: '',
      status: payslip.status === 'PAID' ? 'Paid' : 'Generated',
      avatar: null,
      initials: getInitials(name),
      avatarTheme: pickTheme(payslip.employee_id || name),
    },
    company: {
      name: orgName,
      address: '',
      phone: '',
      email: '',
    },
    period: {
      month: periodLabel,
      payPeriod: `${payslip.period_start} → ${payslip.period_end}`,
      payDate: payslip.paid_at
        ? new Date(payslip.paid_at).toLocaleDateString('en-GB')
        : payslip.period_end,
    },
    earnings,
    deductions,
    bankDetails: {
      bankName: '—',
      accountNumber: '—',
      ifsc: '—',
      accountType: 'Salary',
    },
    details: {
      month: periodLabel,
      payPeriod: `${payslip.period_start} → ${payslip.period_end}`,
      payDate: payslip.paid_at
        ? new Date(payslip.paid_at).toLocaleDateString('en-GB')
        : payslip.period_end,
      status: payslip.status === 'PAID' ? 'Paid' : 'Generated',
      generatedOn: payslip.generated_at
        ? new Date(payslip.generated_at).toLocaleString()
        : '—',
      generatedBy: payslip.payrun_name || 'Payroll Engine',
    },
    history: [
      {
        id: 'gen',
        title: 'Payslip generated',
        timestamp: payslip.generated_at
          ? new Date(payslip.generated_at).toLocaleString()
          : '—',
        description: `Payslip ${payslip.payslip_number} created from payrun.`,
        dotColor: 'emerald',
      },
      ...(payslip.paid_at
        ? [
            {
              id: 'paid',
              title: 'Marked paid',
              timestamp: new Date(payslip.paid_at).toLocaleString(),
              description: 'Payrun finalized — payslip marked as paid.',
              dotColor: 'indigo',
            },
          ]
        : []),
      ...deliveries.map((d, idx) => ({
        id: d.id || `del-${idx}`,
        title: `Email ${String(d.status || '').toLowerCase()}`,
        timestamp: d.sent_at ? new Date(d.sent_at).toLocaleString() : '—',
        description: d.recipient_email || d.failure_reason || '',
        dotColor: d.status === 'SENT' ? 'sky' : 'amber',
      })),
    ],
    netSalary: Number(payslip.net_salary || 0),
    grossSalary: Number(payslip.gross_salary || 0),
    totalDeductions: Number(payslip.total_deductions || 0),
    raw: payslip,
  };
};

export const mapPayslipListItem = (p) => ({
  id: p.id,
  label: `${p.payrun_name || monthYearLabel(new Date(p.period_start).getMonth() + 1, new Date(p.period_start).getFullYear())} · ${p.payslip_number}`,
  month: new Date(p.period_start).getMonth() + 1,
  year: new Date(p.period_start).getFullYear(),
  periodLabel: monthYearLabel(
    new Date(p.period_start).getMonth() + 1,
    new Date(p.period_start).getFullYear()
  ),
  employeeId: p.employee_id,
  employeeName: p.employee_name,
  net: Number(p.net_salary || 0),
  status: p.status,
  raw: p,
});

export const getApiErrorMessage = (error, fallback = 'Something went wrong') => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  if (detail?.message) return detail.message;
  return error?.message || fallback;
};

export const buildDefaultPeriods = (count = 6) => {
  const now = new Date();
  const periods = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(monthYearLabel(d.getMonth() + 1, d.getFullYear()));
  }
  return periods;
};
