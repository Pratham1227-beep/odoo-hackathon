import React from 'react';
import { Users, Calendar, Percent, ShieldCheck } from 'lucide-react';
import FeatureCard from './FeatureCard';

export default function FeatureSection() {
  const features = [
    {
      id: 'employee-management',
      icon: Users,
      iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
      title: 'Employee Management',
      description: 'Keep all employee information, contracts and documents organized.',
    },
    {
      id: 'attendance-time-off',
      icon: Calendar,
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
      title: 'Attendance & Time Off',
      description: 'Track attendance, manage leave requests and stay compliant.',
    },
    {
      id: 'smart-payroll-engine',
      icon: Percent,
      iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
      title: 'Smart Payroll Engine',
      description: 'Flexible salary rules that adapt to your organization’s needs.',
    },
    {
      id: 'validate-before-pay',
      icon: ShieldCheck,
      iconBg: 'bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400',
      title: 'Validate Before You Pay',
      description: 'Identify issues early and get real-time insights to ensure accurate payroll.',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-white dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800">
            Everything you need
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            A complete payroll solution
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Manage your workforce, automate calculations and ensure error-free payroll <br className="hidden sm:inline" />
            — all in one place.
          </p>
        </div>

        {/* 4 Feature Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 bg-white dark:bg-slate-950 rounded-2xl">
          {features.map((feature, idx) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              iconBg={feature.iconBg}
              title={feature.title}
              description={feature.description}
              isLast={idx === features.length - 1}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
