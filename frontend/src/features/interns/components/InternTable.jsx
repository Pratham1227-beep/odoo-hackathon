import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, UserCheck, GraduationCap } from 'lucide-react';

export default function InternTable({ interns, isLoading, onEditIntern }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading intern records...</p>
      </div>
    );
  }

  if (!interns || interns.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
        <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No interns found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Start managing your organization's internship lifecycle by adding your first intern.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status, conversionStatus) => {
    if (conversionStatus === 'CONVERTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <UserCheck className="w-3 h-3" /> Converted
        </span>
      );
    }

    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            ● Active
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Completed
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            Upcoming
          </span>
        );
      case 'TERMINATED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            Terminated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Intern</th>
              <th className="py-3.5 px-4">Domain</th>
              <th className="py-3.5 px-4">Mentor</th>
              <th className="py-3.5 px-4">Duration</th>
              <th className="py-3.5 px-4">Progress</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {interns.map((intern) => {
              const emp = intern.employee || {};
              const mentor = intern.mentor || {};
              const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Intern';
              const initials = fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <tr
                  key={intern.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/interns/${intern.id}`)}
                >
                  {/* Intern Identity */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-tight">{fullName}</p>
                        <p className="text-2xs text-slate-500 dark:text-slate-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Domain & College */}
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{intern.internship_domain}</p>
                    <p className="text-2xs text-slate-500 dark:text-slate-400">{intern.college_name || 'N/A'}</p>
                  </td>

                  {/* Mentor */}
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    {mentor.first_name ? `${mentor.first_name} ${mentor.last_name}` : 'Unassigned'}
                  </td>

                  {/* Dates */}
                  <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                    <div>{intern.start_date}</div>
                    <div className="text-slate-400 dark:text-slate-500">to {intern.end_date}</div>
                  </td>

                  {/* Progress Bar */}
                  <td className="py-3.5 px-4 w-36">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${intern.progress_percentage || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {intern.progress_percentage || 0}%
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">{getStatusBadge(intern.status, intern.conversion_status)}</td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/interns/${intern.id}`)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditIntern(intern)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Intern"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
