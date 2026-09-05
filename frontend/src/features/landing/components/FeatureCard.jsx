import React from 'react';

export default function FeatureCard({ icon: Icon, title, description, isLast, iconBg }) {
  return (
    <div
      className={`flex flex-col items-center text-center p-6 md:p-8 transition-all duration-200 hover:-translate-y-1 ${
        !isLast ? 'lg:border-r border-slate-100 dark:border-slate-800/80' : ''
      }`}
    >
      {/* Icon Badge */}
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${iconBg}`}
      >
        <Icon className="w-7 h-7" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-sans">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs font-normal">
        {description}
      </p>
    </div>
  );
}
