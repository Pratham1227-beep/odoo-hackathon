export const PAYROLL_ROLES = ['ADMIN', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER'];

export const HR_ROLES = [
  'ADMIN',
  'HR_MANAGER',
  'HR_PAYROLL_USER',
  'HR_PAYROLL_MANAGER',
];

export const isPayrollRole = (role) => PAYROLL_ROLES.includes(role);

export const isHrRole = (role) => HR_ROLES.includes(role);
