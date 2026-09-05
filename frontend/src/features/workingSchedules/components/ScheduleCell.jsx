import React from 'react';

export default function ScheduleCell({
  dayData,
  employee,
  dayKey,
  dayHeader,
  onClick,
}) {
  if (!dayData) {
    return (
      <div className="h-14 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-[11px] text-slate-400">
        —
      </div>
    );
  }

  // Determine appearance based on cell type & shift
  let styleClasses = '';
  let content = null;

  if (dayData.type === 'remote') {
    styleClasses =
      'bg-blue-50/90 text-blue-700 border-blue-200/80 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60';
    content = <span className="font-semibold text-xs">Remote</span>;
  } else if (dayData.type === 'off') {
    styleClasses =
      'bg-slate-100/70 text-slate-400 border-slate-200/60 hover:bg-slate-100 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800/60';
    content = <span className="font-medium text-xs">Off</span>;
  } else if (dayData.type === 'holiday') {
    styleClasses =
      'bg-purple-50/80 text-purple-700 border-purple-200/70 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60';
    content = <span className="font-semibold text-xs">Holiday</span>;
  } else {
    // Regular active shift
    if (dayData.shiftId === 'SHIFT002') {
      // Day Shift (Purple)
      styleClasses =
        'bg-indigo-50/90 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60';
    } else if (dayData.shiftId === 'SHIFT003') {
      // Night Shift (Pink/Rose)
      styleClasses =
        'bg-rose-50/90 text-rose-700 border-rose-200/80 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60';
    } else if (dayData.shiftId === 'SHIFT004') {
      // Flexible Shift (Amber)
      styleClasses =
        'bg-amber-50/90 text-amber-700 border-amber-200/80 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
    } else {
      // Morning Shift (Teal/Emerald - default)
      styleClasses =
        'bg-emerald-50/90 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
    }

    // Split time into two lines if formatted with newline
    const lines = (dayData.label || dayData.time || '').split('\n');
    content = (
      <div className="flex flex-col items-center justify-center leading-tight">
        <span className="font-bold text-[11px] whitespace-nowrap">{lines[0]}</span>
        {lines[1] && (
          <span className="font-bold text-[11px] whitespace-nowrap">{lines[1]}</span>
        )}
      </div>
    );
  }

  const accessibleLabel = `${employee.name}, ${dayHeader?.day || ''} ${
    dayHeader?.date || ''
  }: ${dayData.type === 'shift' ? dayData.time : dayData.label || dayData.type}, Location: ${
    dayData.location || 'Office'
  }`;

  return (
    <button
      type="button"
      onClick={() => onClick && onClick(employee, dayKey, dayData, dayHeader)}
      aria-label={accessibleLabel}
      className={`w-full h-13 rounded-xl border flex items-center justify-center p-1.5 transition-all duration-150 cursor-pointer text-center group ${styleClasses}`}
    >
      {content}
    </button>
  );
}
