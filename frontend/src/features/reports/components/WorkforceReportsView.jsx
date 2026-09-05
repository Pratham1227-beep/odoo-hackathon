import React from 'react';
import { workforceMetrics } from '../data/reportsData';
import { Users, Briefcase, HeartHandshake, UserCheck } from 'lucide-react';

export default function WorkforceReportsView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Employment Type Distribution */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Workforce by Employment Classification</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Headcount distribution across permanent contracts, fixed-term arrangements, and interns
        </p>

        <div className="space-y-4">
          {workforceMetrics.byEmploymentType.map((item) => (
            <div key={item.type} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-800 dark:text-slate-200">
                  {item.type}
                </span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {item.count} employees ({item.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${item.percentage}%` }}
                  className="h-full bg-indigo-600 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diversity & Retention Demographics */}
      <div className="lg:col-span-5 space-y-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Retention & Tenure Overview</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl">
              <span className="text-2xs font-semibold text-slate-400 uppercase">Average Tenure</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {workforceMetrics.averageTenure}
              </p>
              <p className="text-2xs text-emerald-600 mt-1">High Stability</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl">
              <span className="text-2xs font-semibold text-slate-400 uppercase">Monthly Attrition</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {workforceMetrics.monthlyAttritionRate}
              </p>
              <p className="text-2xs text-slate-400 mt-1">Zero Departures</p>
            </div>
          </div>
        </div>

        {/* Gender Diversity Ratio */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Workforce Diversity</span>
            <span className="text-indigo-600 dark:text-indigo-400">
              {workforceMetrics.genderRatio.male}% Male / {workforceMetrics.genderRatio.female}% Female
            </span>
          </div>

          <div className="flex h-3 rounded-full overflow-hidden">
            <div
              style={{ width: `${workforceMetrics.genderRatio.male}%` }}
              className="bg-indigo-600"
              title="Male: 58%"
            />
            <div
              style={{ width: `${workforceMetrics.genderRatio.female}%` }}
              className="bg-purple-400"
              title="Female: 42%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
