import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import WageWiseLogo from '../../../shared/components/WageWiseLogo';
import AuthBrandPanel from '../components/AuthBrandPanel';
import OrganizationForm from '../components/OrganizationForm';
import AdminForm from '../components/AdminForm';
import SignupSuccess from '../components/SignupSuccess';
import { useAuthStore } from '../../../store/useAuthStore';

export default function SignupPage({ isDarkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { register } = useAuthStore();
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    orgName: '',
    orgCode: '',
    workEmail: '',
    phone: '',
    address: '',
    country: 'India',
    currency: 'INR (₹)',
    fullName: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
    role: 'Super Admin',
    adminPhone: '',
  });

  const updateFormData = (updates) => {
    setFormData((prev) => {
      const next = { ...prev, ...updates };
      // If workEmail was updated in Step 1 and adminEmail hasn't been explicitly typed differently, keep them synced
      if (updates.workEmail && (!prev.adminEmail || prev.adminEmail === prev.workEmail)) {
        next.adminEmail = updates.workEmail;
      }
      return next;
    });
  };

  const handleStep1Continue = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Continue = async () => {
    try {
      setApiError(null);
      setIsSubmitting(true);
      
      const payload = {
        org_name: formData.orgName,
        org_code: formData.orgCode,
        org_email: formData.workEmail,
        phone: formData.phone || formData.adminPhone,
        currency: formData.currency,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        country: formData.country,
        address: formData.address,
        admin_email: formData.adminEmail,
        password: formData.password,
      };

      await register(payload);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.response?.data?.detail || 'Failed to register. Please try again.';
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleStepClick = (targetStep) => {
    if (targetStep < step) {
      setStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 relative overflow-hidden flex flex-col justify-between">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-900/15 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 left-1/3 w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-900/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-900/15 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link
          to="/"
          className="focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg transition-transform hover:opacity-95"
        >
          <WageWiseLogo />
        </Link>

        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Already have an account? Login */}
          <div className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors ml-0.5"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Brand Marketing Panel (Hidden on extra small mobile if desired, visible from md/lg) */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-6">
            <AuthBrandPanel currentStep={step} orgName={formData.orgName} />
          </div>

          {/* Right Column: Multi-Step Form Card */}
          <div className="w-full lg:col-span-6 xl:col-span-6 max-w-xl mx-auto lg:max-w-none">
            {step === 1 && (
              <OrganizationForm
                formData={formData}
                updateFormData={updateFormData}
                onContinue={handleStep1Continue}
                onStepClick={handleStepClick}
              />
            )}

            {step === 2 && (
              <AdminForm
                formData={formData}
                updateFormData={updateFormData}
                onContinue={handleStep2Continue}
                onStepClick={handleStepClick}
                apiError={apiError}
                isSubmitting={isSubmitting}
              />
            )}

            {step === 3 && (
              <SignupSuccess
                formData={formData}
                onGoToLogin={handleGoToLogin}
                onStepClick={handleStepClick}
              />
            )}
          </div>

        </div>
      </main>

      {/* Footer Minimalist Copyright */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
        © 2026 WageWise Inc. All rights reserved.
      </footer>
    </div>
  );
}
