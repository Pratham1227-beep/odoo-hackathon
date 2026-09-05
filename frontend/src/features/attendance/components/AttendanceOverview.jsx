import React from 'react';

export default function AttendanceOverview({
  totalEmployees = 0,
  presentCount = 0,
  absentCount = 0,
  leaveCount = 0,
}) {
  const safeTotal = totalEmployees || (presentCount + absentCount + leaveCount) || 0;
  const presentPct = safeTotal > 0 ? ((presentCount / safeTotal) * 100).toFixed(1) : 0;
  const absentPct = safeTotal > 0 ? ((absentCount / safeTotal) * 100).toFixed(1) : 0;
  const leavePct = safeTotal > 0 ? ((leaveCount / safeTotal) * 100).toFixed(1) : 0;

  const data = [
    {
      label: 'Present',
      count: presentCount,
      percent: parseFloat(presentPct),
      color: '#10b981', // Emerald / Mint green
      dotClass: 'bg-emerald-500',
    },
    {
      label: 'Absent',
      count: absentCount,
      percent: parseFloat(absentPct),
      color: '#f43f5e', // Rose / Red
      dotClass: 'bg-rose-500',
    },
    {
      label: 'On Leave',
      count: leaveCount,
      percent: parseFloat(leavePct),
      color: '#f59e0b', // Amber / Orange
      dotClass: 'bg-amber-500',
    },
  ];

  // Calculate cumulative strokeDashoffset for SVG donut
  let cumulativePercent = 0;
  const segments = data.map((item) => {
    const strokeDasharray = `${item.percent} ${100 - item.percent}`;
    const strokeDashoffset = -cumulativePercent;
    cumulativePercent += item.percent;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          Today's Overview
        </h3>
      </div>

      {/* Donut Chart & Legend Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-1">
        {/* Donut Chart SVG */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
            {/* Background Ring */}
            <circle
              cx="21"
              cy="21"
              r="15.91549430918954"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="5.5"
              className="text-slate-100 dark:text-slate-800"
            />
            {/* Donut Segments */}
            {segments.map((seg) => (
              <circle
                key={seg.label}
                cx="21"
                cy="21"
                r="15.91549430918954"
                fill="transparent"
                stroke={seg.color}
                strokeWidth="5.5"
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            ))}
          </svg>

          {/* Center Text */}
          <div className="absolute flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
              {safeTotal}
            </span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
              Employees
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="w-full sm:w-auto flex-1 space-y-3">
          {data.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 gap-3"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dotClass}`} />
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 dark:text-white min-w-[20px] text-right">
                  {item.count}
                </span>
                <span className="text-slate-400 dark:text-slate-500 min-w-[40px] text-right text-[11px]">
                  {item.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
