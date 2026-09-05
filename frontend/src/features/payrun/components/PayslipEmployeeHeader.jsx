import React from 'react';

export default function PayslipEmployeeHeader({ employee }) {
  if (!employee) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-2xs mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Avatar + Name + Designation */}
        <div className="flex items-center gap-4">
          {employee.avatar ? (
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-xl flex items-center justify-center shrink-0">
              {employee.initials || 'AS'}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {employee.name}
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60">
                {employee.status || 'Active'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {employee.id} • {employee.designation || employee.role}
            </p>
          </div>
        </div>

        {/* Right / Bottom: Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
              Department
            </span>
            <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
              {employee.department}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
              Designation
            </span>
            <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
              {employee.designation || employee.role}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
              Employee Type
            </span>
            <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
              {employee.employeeType || 'Full Time'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
              Date of Joining
            </span>
            <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
              {employee.dateOfJoining || '12 Jan 2024'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
              PAN
            </span>
            <span className="font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
              {employee.pan || 'ABCDE1234F'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
              UAN
            </span>
            <span className="font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
              {employee.uan || '100123456789'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
