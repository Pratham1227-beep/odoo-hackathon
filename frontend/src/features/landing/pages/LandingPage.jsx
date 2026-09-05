import React from 'react';
import LandingNavbar from '../components/LandingNavbar';
import HeroSection from '../components/HeroSection';
import FeatureSection from '../components/FeatureSection';
import HowItWorks from '../components/HowItWorks';
import TrustMetrics from '../components/TrustMetrics';
import LandingCTA from '../components/LandingCTA';
import LandingFooter from '../components/LandingFooter';

export default function LandingPage({ isDarkMode, toggleDarkMode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      <LandingNavbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main>
        <HeroSection />
        <FeatureSection />
        <HowItWorks />
        <TrustMetrics />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
