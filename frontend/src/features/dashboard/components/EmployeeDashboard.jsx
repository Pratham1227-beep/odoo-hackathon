import React from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { Clock, Calendar, FileText, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmployeeDashboard() {
  const { user } = useAuthStore();

  const quickLinks = [
    { name: 'My Profile', path: `/employees/${user?.id || 'me'}`, icon: User, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-500/10' },
    { name: 'Mark Attendance', path: '/attendance', icon: Clock, color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-500/10' },
    { name: 'Time Off Balance', path: '/time-off', icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-500/10' },
    { name: 'Request Leave', path: '/leave-request', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-500/10' },
  ];

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <User className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'Employee'}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg">
            Here's a quick overview of your workspace. You can manage your attendance, request time off, and view your profile details.
          </p>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link 
              key={link.name} 
              to={link.path}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center gap-4 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${link.bg} ${link.color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
