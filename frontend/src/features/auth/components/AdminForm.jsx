import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Phone,
  ArrowRight
} from 'lucide-react';
import SignupProgress from './SignupProgress';

export default function AdminForm({
  formData,
  updateFormData,
  onContinue,
  onStepClick
}) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const validate = () => {
    const newErrors = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.adminEmail?.trim()) {
      newErrors.adminEmail = 'Work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail.trim())) {
      newErrors.adminEmail = 'Please enter a valid work email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  const handleChange = (field, value) => {
    updateFormData({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      adminEmail: true,
      password: true,
      confirmPassword: true,
    });

    if (validate()) {
      onContinue();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 dark:border-slate-800 shadow-xl dark:shadow-2xl transition-all duration-200">
      {/* Form Header */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create Admin Account
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
          Set up your admin account and take control of your organization.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="my-6">
        <SignupProgress currentStep={2} onStepClick={onStepClick} />
      </div>

      {/* Section Subtitle */}
      <div className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          2. Admin Account Details
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Create your admin account to manage WageWise.
        </p>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {/* Row 1: Full Name & Work Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name <span className="text-indigo-600 dark:text-indigo-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.fullName || ''}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                placeholder="e.g. Rahul Sharma"
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  touched.fullName && errors.fullName
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-400'
                }`}
              />
            </div>
            {touched.fullName && errors.fullName && (
              <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Work Email <span className="text-indigo-600 dark:text-indigo-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={formData.adminEmail || ''}
                onChange={(e) => handleChange('adminEmail', e.target.value)}
                onBlur={() => handleBlur('adminEmail')}
                placeholder="e.g. admin@acme.com"
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  touched.adminEmail && errors.adminEmail
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-400'
                }`}
              />
            </div>
            {touched.adminEmail && errors.adminEmail && (
              <p className="mt-1 text-xs text-red-500">{errors.adminEmail}</p>
            )}
          </div>
        </div>

        {/* Row 2: Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password <span className="text-indigo-600 dark:text-indigo-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password || ''}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="Create a strong password"
                className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-slate-950 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  touched.password && errors.password
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm Password <span className="text-indigo-600 dark:text-indigo-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword || ''}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Confirm your password"
                className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-slate-950 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  touched.confirmPassword && errors.confirmPassword
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Row 3: Phone Number (Role is fixed as Super Admin) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              value={formData.adminPhone || ''}
              onChange={(e) => handleChange('adminPhone', e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        {/* Highlighted Super Admin Access Info Card */}
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3.5 mt-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-indigo-500/20 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Super Admin Access
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You will have full access to manage organization settings, team members, payroll configuration and all features.
            </p>
          </div>
        </div>

        {/* Submit CTA Button */}
        <div className="pt-3">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Terms & Privacy */}
        <p className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          By continuing, you agree to our{' '}
          <a href="#terms" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#privacy" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </form>
    </div>
  );
}
