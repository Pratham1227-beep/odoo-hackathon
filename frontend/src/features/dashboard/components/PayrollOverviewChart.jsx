import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function PayrollOverviewChart({ data = [] }) {
  const [selectedRange, setSelectedRange] = useState('Last 6 Months');
  const [hoveredBar, setHoveredBar] = useState(null);

  const maxY = 20; // in Lakhs
  const yTicks = [20, 15, 10, 5, 0];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Payroll Overview
        </h3>
        <button
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          aria-label="Select date range"
        >
          <span>{selectedRange}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Chart Canvas */}
      <div className="relative pt-6 pb-2 flex items-end">
        {/* Y Axis Labels */}
        <div className="flex flex-col justify-between h-48 text-[11px] font-medium text-slate-400 dark:text-slate-500 pr-3 select-none text-right w-8 shrink-0">
          {yTicks.map((tick) => (
            <span key={tick} className="leading-none">
              {tick === 0 ? '0' : `${tick}L`}
            </span>
          ))}
        </div>

        {/* Main Bar Chart Container */}
        <div className="relative flex-1 h-48 flex items-end justify-between pl-2 border-b border-slate-200/80 dark:border-slate-800">
          
          {/* Subtle Horizontal Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {yTicks.slice(0, 4).map((tick) => (
              <div
                key={tick}
                className="w-full border-b border-slate-100 dark:border-slate-800/60"
              />
            ))}
          </div>

          {/* Bars */}
          {data.map((item, index) => {
            const heightPercent = (item.amount / maxY) * 100;
            const isHovered = hoveredBar === index;

            return (
              <div
                key={item.month}
                className="relative flex-1 flex flex-col items-center justify-end h-full group z-10 px-1.5"
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="absolute -top-9 z-20 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold shadow-lg animate-in fade-in zoom-in-95 duration-100 pointer-events-none whitespace-nowrap">
                    {item.formatted}
                  </div>
                )}

                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[36px] rounded-t-md transition-all duration-300 ${
                    item.isCurrent
                      ? 'bg-indigo-600 dark:bg-indigo-500 shadow-sm shadow-indigo-500/25'
                      : 'bg-indigo-200 dark:bg-indigo-950/80 group-hover:bg-indigo-300 dark:group-hover:bg-indigo-900/90'
                  }`}
                />

                {/* X-axis Month Label */}
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 select-none">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
