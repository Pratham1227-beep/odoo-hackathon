const STATUS_TO_UI = {
  PRESENT: 'Present',
  LATE: 'Late',
  HALF_DAY: 'Half Day',
  ABSENT: 'Absent',
  HOLIDAY: 'Holiday',
};

const STATUS_TO_API = {
  Present: 'PRESENT',
  Late: 'LATE',
  'Half Day': 'HALF_DAY',
  Absent: 'ABSENT',
  Holiday: 'HOLIDAY',
  'On Leave': 'ABSENT',
};

const AVATAR_THEMES = ['purple', 'blue', 'pink', 'teal', 'violet', 'sky', 'rose', 'mint'];

export const HR_ROLES = [
  'ADMIN',
  'HR_MANAGER',
  'HR_PAYROLL_USER',
  'HR_PAYROLL_MANAGER',
];

export const isHrRole = (role) => HR_ROLES.includes(role);

export const formatDateISO = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const formatTimeDisplay = (isoDatetime) => {
  if (!isoDatetime) return '-';
  try {
    const dt = new Date(isoDatetime);
    if (Number.isNaN(dt.getTime())) return '-';
    return dt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '-';
  }
};

export const formatWorkHours = (hours) => {
  if (hours === null || hours === undefined || hours === '') return '-';
  const num = Number(hours);
  if (Number.isNaN(num)) return '-';
  const h = Math.floor(num);
  const m = Math.round((num - h) * 60);
  return `${h}h ${String(m).padStart(2, '0')}m`;
};

/** Parse "09:00 AM" / "09:00" into hours+minutes on a given YYYY-MM-DD date → ISO string */
export const combineDateAndTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr || timeStr === '-') return null;

  const trimmed = String(timeStr).trim();
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  const h24Match = trimmed.match(/^(\d{1,2}):(\d{2})$/);

  let hours;
  let minutes;

  if (ampmMatch) {
    hours = parseInt(ampmMatch[1], 10);
    minutes = parseInt(ampmMatch[2], 10);
    const period = ampmMatch[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  } else if (h24Match) {
    hours = parseInt(h24Match[1], 10);
    minutes = parseInt(h24Match[2], 10);
  } else {
    return null;
  }

  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d, hours, minutes, 0, 0);
  return dt.toISOString();
};

export const mapStatusToUi = (status) => {
  if (!status) return 'Absent';
  return STATUS_TO_UI[status] || status;
};

export const mapStatusToApi = (status) => {
  if (!status) return null;
  return STATUS_TO_API[status] || status;
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '??';

const pickTheme = (seed = '') => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i)) % AVATAR_THEMES.length;
  }
  return AVATAR_THEMES[hash];
};

export const mapEmployeeToUi = (emp) => {
  const name =
    emp.full_name ||
    [emp.first_name, emp.last_name].filter(Boolean).join(' ') ||
    emp.email ||
    'Unknown';
  return {
    id: emp.id,
    employeeCode: emp.employee_code || '',
    name,
    email: emp.email || '',
    department: emp.department?.name || 'Unassigned',
    role: emp.designation?.title || emp.user_role || '',
    workLocation: emp.work_location?.name || emp.work_location?.city || '—',
    initials: getInitials(name),
    avatarTheme: pickTheme(emp.id || name),
    avatar: null,
    status: emp.status || 'ACTIVE',
  };
};

export const mapAttendanceToUi = (att, employeeMap = {}) => {
  const emp = employeeMap[att.employee_id] || null;
  const employeeName = emp?.name || 'Employee';
  const status = mapStatusToUi(att.status);

  return {
    id: att.id,
    attendanceId: att.id,
    employeeUuid: att.employee_id,
    employeeId: emp?.employeeCode || att.employee_id,
    employeeName,
    department: emp?.department || 'Unassigned',
    date: att.date,
    checkIn: formatTimeDisplay(att.clock_in),
    checkOut: formatTimeDisplay(att.clock_out),
    workHours: formatWorkHours(att.work_hours),
    overtimeHours: formatWorkHours(att.overtime_hours),
    status: status === 'Holiday' ? 'Holiday' : status,
    workLocation: emp?.workLocation || '—',
    attendanceType: att.source === 'MANUAL' ? 'Manual' : 'Regular',
    notes: '',
    source: att.source,
    clockInRaw: att.clock_in,
    clockOutRaw: att.clock_out,
    initials: emp?.initials || getInitials(employeeName),
    avatarTheme: emp?.avatarTheme || pickTheme(att.employee_id),
    avatar: emp?.avatar || null,
  };
};

/** Build day-sheet rows: one per employee, merging attendance for the date */
export const buildDaySheetRecords = (employees, attendances, selectedDate) => {
  const byEmployee = {};
  (attendances || []).forEach((att) => {
    byEmployee[att.employee_id] = att;
  });

  return employees.map((emp) => {
    const att = byEmployee[emp.id];
    if (att) {
      return mapAttendanceToUi(att, { [emp.id]: emp });
    }
    return {
      id: `pending-${emp.id}-${selectedDate}`,
      attendanceId: null,
      employeeUuid: emp.id,
      employeeId: emp.employeeCode || emp.id,
      employeeName: emp.name,
      department: emp.department,
      date: selectedDate,
      checkIn: '-',
      checkOut: '-',
      workHours: '-',
      overtimeHours: '-',
      status: 'Absent',
      workLocation: emp.workLocation,
      attendanceType: 'Unscheduled',
      notes: '',
      source: null,
      clockInRaw: null,
      clockOutRaw: null,
      initials: emp.initials,
      avatarTheme: emp.avatarTheme,
      avatar: emp.avatar,
    };
  });
};

export const buildUiPayloadToApi = (formData) => {
  const date = formData.date;
  const status = mapStatusToApi(formData.status);
  const clockIn = combineDateAndTime(date, formData.checkIn);
  const clockOut = combineDateAndTime(date, formData.checkOut);

  const payload = {
    employee_id: formData.employeeUuid || formData.employeeId,
    date,
    status,
  };

  if (status === 'ABSENT' || status === 'HOLIDAY') {
    payload.clock_in = null;
    payload.clock_out = null;
  } else {
    if (clockIn) payload.clock_in = clockIn;
    if (clockOut) payload.clock_out = clockOut;
  }

  return payload;
};

export const getApiErrorMessage = (error, fallback = 'Something went wrong') => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  if (detail?.message) return detail.message;
  return error?.message || fallback;
};
