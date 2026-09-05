import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  Coins,
  BarChart3,
  Calendar,
  Settings,
  ArrowRight,
  Sparkles,
  X,
  FileText,
  SlidersHorizontal,
  PlayCircle,
  Briefcase,
  CalendarDays,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import WageWiseLogo from '../components/WageWiseLogo';
import { useAuthStore } from '../../store/useAuthStore';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Employees', path: '/employees', icon: Users, allowedRoles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'] },
  { name: 'Contracts', path: '/contracts', icon: Briefcase, allowedRoles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'] },
  { name: 'Attendance', path: '/attendance', icon: Clock },
  { name: 'Time Off', path: '/time-off', icon: Calendar },
  { name: 'Leave Request', path: '/leave-request', icon: FileText },
  { name: 'Working Schedules', path: '/working-schedules', icon: CalendarDays },
  { name: 'Payroll', path: '/payroll', icon: Coins, allowedRoles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'] },
  { name: 'Payrun Processing', path: '/payrun', icon: PlayCircle, allowedRoles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'] },
  { name: 'Salary Setup', path: '/salary-setup', icon: SlidersHorizontal, allowedRoles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'] },
  { name: 'Reports', path: '/reports', icon: BarChart3, allowedRoles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'] },
  { name: 'Settings', path: '/settings', icon: Settings, allowedRoles: ['ADMIN', 'HR_MANAGER'] },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.allowedRoles) return true;
    if (!user) return true; // Show by default if session state is still loading
    if (user.role === 'ADMIN') return true;
    return item.allowedRoles.includes(user.role);
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 flex flex-col py-4 px-3.5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        }`}
      >
        {/* Logo & Close Button for Mobile (Fixed at top) */}
        <div className="flex items-center justify-between px-2.5 pb-3.5 shrink-0 border-b border-slate-100/80 dark:border-slate-800/60">
          <Link to="/dashboard" className="focus:outline-none">
            <WageWiseLogo />
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Area for Nav Items & Bottom Card */}
        <div className="flex-1 overflow-y-auto min-h-0 pt-3 space-y-4 pr-1 custom-scrollbar">
          {/* Navigation Links */}
          <nav className="space-y-0.5" aria-label="Sidebar Navigation">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 relative ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs before:absolute before:-left-3.5 before:top-2 before:bottom-2 before:w-1.5 before:bg-indigo-600 before:rounded-r-md'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom "Need Help?" Card inside scrollable flow */}
          <div className="relative rounded-2xl bg-indigo-50/70 dark:bg-slate-800/60 border border-indigo-100/80 dark:border-slate-700/60 p-4 space-y-2.5 mt-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-teal-400 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[9px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>

            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                WageWise Live
              </h4>
              <p className="text-2xs text-slate-500 dark:text-slate-400 leading-relaxed">
                All modules synchronized with live payroll backend.
              </p>
            </div>

            <div>
              <Link
                to="/reports"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <span>View Analytics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
