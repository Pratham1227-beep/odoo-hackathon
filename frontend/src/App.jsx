import React, { useState, useEffect } from 'react';
import LandingPage from './features/landing/pages/LandingPage';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return <LandingPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
}