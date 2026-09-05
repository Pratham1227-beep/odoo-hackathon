import React, { useState } from 'react';
import {
  Building2,
  Bookmark,
  Mail,
  Phone,
  MapPin,
  Globe,
  IndianRupee,
  ArrowRight
} from 'lucide-react';
import SignupProgress from './SignupProgress';

export default function OrganizationForm({
  formData,
  updateFormData,
  onContinue,
  onStepClick
}) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const countries = [
    { code: 'IN', name: 'India', defaultCurrency: 'INR (₹)' },
    { code: 'US', name: 'United States', defaultCurrency: 'USD ($)' },
    { code: 'GB', name: 'United Kingdom', defaultCurrency: 'GBP (£)' },
    { code: 'SG', name: 'Singapore', defaultCurrency: 'SGD (S$)' },
    { code: 'AE', name: 'United Arab Emirates', defaultCurrency: 'AED (AED)' },
    { code: 'DE', name: 'Germany', defaultCurrency: 'EUR (€)' },
    { code: 'CA', name: 'Canada', defaultCurrency: 'CAD ($)' },
    { code: 'AU', name: 'Australia', defaultCurrency: 'AUD ($)' },
  ];

  const currencies = [
    'INR (₹)',
    'USD ($)',
    'EUR (€)',
    'GBP (£)',
    'SGD (S$)',
    'AED (AED)',
    'CAD ($)',
    'AUD ($)'
  ];

  const validate = () => {
    const newErrors = {};

    if (!formData.orgName?.trim()) {
      newErrors.orgName = 'Organization name is required';
    }

    if (!formData.orgCode?.trim()) {
      newErrors.orgCode = 'Organization code is required';
    }

    if (!formData.workEmail?.trim()) {
      newErrors.workEmail = 'Work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.workEmail.trim())) {
      newErrors.workEmail = 'Please enter a valid work email';
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

  const handleCountryChange = (e) => {
    const selectedCountry = countries.find((c) => c.name === e.target.value);
    updateFormData({
      country: e.target.value,
      currency: selectedCountry ? selectedCountry.defaultCurrency : formData.currency,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      orgName: true,
      orgCode: true,
      workEmail: true,
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
          Create your account
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
          Start your WageWise journey in just a few steps.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="my-6">
        <SignupProgress currentStep={1} onStepClick={onStepClick} />
      </div>

      {/* Section Subtitle */}
      <div className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          1. Organization Details
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tell us about your organization to get started.
        </p>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {/* Row 1: Org Name & Org Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Organization Name <span className="text-indigo-600 dark:text-indigo-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.orgName || ''}
                onChange={(e) => handleChange('orgName', e.target.value)}
                onBlur={() => handleBlur('orgName')}
                placeholder="e.g. Acme Pvt. Ltd."
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  touched.orgName && errors.orgName
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-400'
                }`}
              />
            </div>
            {touched.orgName && errors.orgName && (
              <p className="mt-1 text-xs text-red-500">{errors.orgName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Organization Code <span className="text-indigo-600 dark:text-indigo-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Bookmark className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.orgCode || ''}
                onChange={(e) => handleChange('orgCode', e.target.value.toUpperCase())}
                onBlur={() => handleBlur('orgCode')}
                placeholder="e.g. ACME"
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  touched.orgCode && errors.orgCode
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-400'
                }`}
              />
            </div>
            {touched.orgCode && errors.orgCode && (
              <p className="mt-1 text-xs text-red-500">{errors.orgCode}</p>
            )}
          </div>
        </div>

        {/* Row 2: Work Email & Phone Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                value={formData.workEmail || ''}
                onChange={(e) => handleChange('workEmail', e.target.value)}
                onBlur={() => handleBlur('workEmail')}
                placeholder="e.g. hr@acme.com"
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  touched.workEmail && errors.workEmail
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-400'
                }`}
              />
            </div>
            {touched.workEmail && errors.workEmail && (
              <p className="mt-1 text-xs text-red-500">{errors.workEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Address (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Address (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter your office address"
              className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        {/* Row 4: Country & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Country
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Globe className="w-4 h-4" />
              </div>
              <select
                value={formData.country || 'India'}
                onChange={handleCountryChange}
                className="w-full pl-10 pr-8 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 transition-all appearance-none cursor-pointer"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.name} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Currency
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <IndianRupee className="w-4 h-4" />
              </div>
              <select
                value={formData.currency || 'INR (₹)'}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 transition-all appearance-none cursor-pointer"
              >
                {currencies.map((curr) => (
                  <option key={curr} value={curr} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                    {curr}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
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
