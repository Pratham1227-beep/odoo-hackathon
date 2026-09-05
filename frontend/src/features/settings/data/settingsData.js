// WageWise Settings Initial Data

export const initialSettings = {
  // Organization
  companyName: 'Acme Pvt. Ltd.',
  companyCode: 'ACME-IN',
  legalEntity: 'Acme Technologies Private Limited',
  industry: 'Information Technology & Services',
  contactEmail: 'admin@acme.com',
  contactPhone: '+91 98765 43210',
  panNumber: 'AACCA1234F',
  gstNumber: '27AACCA1234F1Z5',
  timezone: 'Asia/Kolkata (IST)',
  currency: 'INR (₹)',
  financialYearStart: 'April',

  // Payroll & Statutory
  pfEmployeePercent: 12,
  pfEmployerPercent: 12,
  pfWageCap: 15000,
  esiEmployeePercent: 0.75,
  esiEmployerPercent: 3.25,
  esiWageCap: 21000,
  ptState: 'Maharashtra',
  tdsDeductionEnabled: true,
  payCycleCutoffDay: 25,
  salaryPaymentDay: 'Last Working Day',

  // Attendance & Shifts
  standardWorkHoursPerDay: 8,
  standardWorkDaysPerWeek: 5,
  gracePeriodMinutes: 15,
  halfDayMinimumHours: 4,
  overtimeMultiplier: 1.5,
  autoCheckoutTime: '21:00',

  // Security & Permissions
  mfaEnforced: true,
  sessionTimeoutMinutes: 30,
  passwordExpiryDays: 90,
  auditLoggingEnabled: true,

  // Notifications
  payrollDeadlineAlerts: true,
  complianceAlerts: true,
  contractExpiryAlerts: true,
  dailyAttendanceDigest: false,
};
