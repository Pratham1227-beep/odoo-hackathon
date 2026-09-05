import React from 'react';

export default function EmployeeDistributionChart({ data = [] }) {
  const totalEmployees = data.reduce((acc, curr) => acc + (curr.count || 0), 0);

  // Calculate cumulative strokeDashoffset for SVG donut
  let cumulativePercent = 0;
  const segments = data.map((item) => {
    const percent = totalEmployees > 0 ? (item.count / totalEmployees) * 100 : 0;
    const strokeDasharray = `${percent} ${100 - percent}`;
    const strokeDashoffset = -cumulativePercent;
    cumulativePercent += percent;
    return {
      ...item,
      percent,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="pb-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Employee Distribution
        </h3>
      </div>

      {/* Donut Chart and Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
        
        {/* Donut SVG */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
            {/* Background Ring */}
            <circle
              cx="21"
              cy="21"
              r="15.91549430918954"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6.5"
              className="text-slate-100 dark:text-slate-800"
            />
            
            {/* Donut Segments */}
            {segments.map((seg) => (
              <circle
                key={seg.department}
                cx="21"
                cy="21"
                r="15.91549430918954"
                fill="transparent"
                stroke={seg.color}
                strokeWidth="6.5"
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                className="transition-all duration-500"
              />
            ))}
          </svg>

          {/* Center Text */}
          <div className="absolute flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
              {totalEmployees}
            </span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
              Employees
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="w-full sm:w-auto flex-1 space-y-2">
          {data.map((item) => (
            <div
              key={item.department}
              className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 gap-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 dark:text-slate-400">{item.department}</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{item.count}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
