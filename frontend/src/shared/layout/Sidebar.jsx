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
  Receipt,
  CalendarDays,
  Bell
} from 'lucide-react';
import WageWiseLogo from '../components/WageWiseLogo';
import { useAuthStore } from '../../store/useAuthStore';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Employees', path: '/employees', icon: Users },
  { name: 'Attendance', path: '/attendance', icon: Clock },
  { name: 'Time Off', path: '/time-off', icon: Calendar },
  { name: 'Leave Request', path: '/leave-request', icon: FileText },
  { name: 'Payroll', path: '/payroll', icon: Coins, allowedRoles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'] },
  { name: 'Salary Setup', path: '/salary-setup', icon: SlidersHorizontal, allowedRoles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'] },
  { name: 'Reports', path: '/reports', icon: BarChart3, allowedRoles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'] },
  { name: 'Settings', path: '/settings', icon: Settings, allowedRoles: ['ADMIN', 'HR_MANAGER'] },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore();

  const filteredNavItems = navItems.filter(item => {
    if (!item.allowedRoles) return true;
    if (!user) return false;
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 flex flex-col justify-between py-6 px-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        }`}
      >
        <div className="flex flex-col space-y-7">
          {/* Logo & Close Button for Mobile */}
          <div className="flex items-center justify-between px-2">
            <Link to="/dashboard" className="focus:outline-none">
              <WageWiseLogo />
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Sidebar Navigation">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs before:absolute before:-left-4 before:top-2 before:bottom-2 before:w-1.5 before:bg-indigo-600 before:rounded-r-md'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom "Need Help?" Card */}
        <div className="relative rounded-2xl bg-indigo-50/70 dark:bg-slate-800/60 border border-indigo-100/80 dark:border-slate-700/60 p-4.5 space-y-3">
          {/* 3D-styled Floating Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-teal-400 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Need Help?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Check our guides or contact support.
            </p>
          </div>

          <div>
            <a
              href="#support"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <span>Get Support</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
