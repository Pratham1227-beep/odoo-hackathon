import React from "react";

export default function WageWiseLogo({
  className = "",
  showTagline = true,
  iconOnly = false,
}) {
  return (
    <div className={`flex items-center ${className}`}>

      {/* Logo Mark */}
      <img
        src="/assets/wagewise-logo.png"
        alt="WageWise Logo"
        className="w-10 h-10 object-contain shrink-0"
      />

      {/* Wordmark */}
      {!iconOnly && (
        <img
          src="/assets/wagewise-wordmark.png"
          alt="WageWise"
          className="w-auto h-10 object-contain ml-2"
        />
      )}

    </div>
  );
}