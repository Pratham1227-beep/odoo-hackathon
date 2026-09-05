import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Palmtree,
  PlusSquare,
  Home,
  User,
  Heart,
  PauseCircle,
  Flower2,
  Clock,
  Calendar,
} from 'lucide-react';
import TimeOffRowActions from './TimeOffRowActions';
import { mockEmployees } from '../data/timeOffData';

const avatarThemeClasses = {
  purple: 'bg-indigo-100/90 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300',
  blue: 'bg-sky-100/90 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300',
  pink: 'bg-pink-100/90 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300',
  teal: 'bg-teal-100/90 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300',
  violet: 'bg-purple-100/90 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300',
  sky: 'bg-blue-100/90 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300',
  rose: 'bg-rose-100/90 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300',
  mint: 'bg-emerald-100/90 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300',
};

const statusBadgeClasses = {
  Pending:
    'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-100/90 dark:border-amber-800/60',
  Approved:
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-100/90 dark:border-emerald-800/60',
  Rejected:
    'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-100/90 dark:border-rose-800/60',
  Cancelled:
    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

// Render corresponding icon for leave type
const renderLeaveTypeIcon = (type) => {
  switch (type) {
    case 'Annual Leave':
      return <Palmtree className="w-4 h-4 text-emerald-500 shrink-0" />;
    case 'Sick Leave':
      return <PlusSquare className="w-4 h-4 text-rose-500 shrink-0" />;
    case 'Work From Home':
      return <Home className="w-4 h-4 text-sky-500 shrink-0" />;
    case 'Personal Leave':
      return <User className="w-4 h-4 text-blue-500 shrink-0" />;
    case 'Maternity Leave':
      return <Heart className="w-4 h-4 text-pink-500 shrink-0" />;
    case 'Unpaid Leave':
      return <PauseCircle className="w-4 h-4 text-purple-500 shrink-0" />;
    case 'Bereavement Leave':
      return <Flower2 className="w-4 h-4 text-teal-500 shrink-0" />;
    case 'Compensatory Off':
      return <Clock className="w-4 h-4 text-indigo-500 shrink-0" />;
    default:
      return <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />;
  }
};

export default function TimeOffTable({
  requests = [],
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onViewDetails,
  onApprove,
  onReject,
  onEdit,
  onCancel,
}) {
  const navigate = useNavigate();
  const allSelected = requests.length > 0 && selectedIds.length === requests.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < requests.length;

  if (requests.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          No time off requests found
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Try adjusting your filter or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-left border-collapse min-w-[820px]">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {/* Checkbox */}
            <th className="py-3.5 pl-2 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                aria-label="Select all requests"
              />
            </th>
            <th className="py-3.5 font-semibold">Employee</th>
            <th className="py-3.5 font-semibold">Leave Type</th>
            <th className="py-3.5 font-semibold">Start Date</th>
            <th className="py-3.5 font-semibold">End Date</th>
            <th className="py-3.5 font-semibold">Days</th>
            <th className="py-3.5 font-semibold">Status</th>
            <th className="py-3.5 font-semibold">Applied On</th>
            <th className="py-3.5 pr-2 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
          {requests.map((req) => {
            const isSelected = selectedIds.includes(req.id);
            const statusClass =
              statusBadgeClasses[req.status] || statusBadgeClasses.Pending;

            // Match employee metadata (avatar image / initials)
            const empMeta = mockEmployees.find((e) => e.id === req.employeeId);
            const avatarTheme = empMeta?.avatarTheme || 'purple';
            const initials =
              empMeta?.initials ||
              req.employeeName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2);
            const avatarImg = empMeta?.avatar;

            return (
              <tr
                key={req.id}
                className={`transition-colors group ${
                  isSelected
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Checkbox */}
                <td className="py-3.5 pl-2 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(req.id)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    aria-label={`Select request for ${req.employeeName}`}
                  />
                </td>

                {/* Employee: Photo / Initials + Name + ID */}
                <td className="py-3.5 pr-4 whitespace-nowrap">
                  <div
                    onClick={() => navigate(`/employees/${req.employeeId}`)}
                    className="flex items-center gap-3 cursor-pointer group-hover:opacity-90"
                  >
                    {avatarImg ? (
                      <img
                        src={avatarImg}
                        alt={req.employeeName}
                        className="w-9 h-9 rounded-full object-cover shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-full ${
                          avatarThemeClasses[avatarTheme] || avatarThemeClasses.purple
                        } flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-2xs group-hover:scale-105 transition-transform`}
                      >
                        {initials}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {req.employeeName}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
                        {req.employeeId}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Leave Type */}
                <td className="py-3.5 pr-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {renderLeaveTypeIcon(req.leaveType)}
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {req.leaveType}
                    </span>
                  </div>
                </td>

                {/* Start Date */}
                <td className="py-3.5 pr-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {req.startDate}
                </td>

                {/* End Date */}
                <td className="py-3.5 pr-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {req.endDate}
                </td>

                {/* Days */}
                <td className="py-3.5 pr-4 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                  {req.days}
                </td>

                {/* Status Badge */}
                <td className="py-3.5 pr-4 whitespace-nowrap">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold border ${statusClass}`}
                  >
                    {req.status}
                  </span>
                </td>

                {/* Applied On */}
                <td className="py-3.5 pr-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {req.appliedOn}
                </td>

                {/* Actions */}
                <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                  <TimeOffRowActions
                    request={req}
                    onViewDetails={onViewDetails}
                    onApprove={onApprove}
                    onReject={onReject}
                    onEdit={onEdit}
                    onCancel={onCancel}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
