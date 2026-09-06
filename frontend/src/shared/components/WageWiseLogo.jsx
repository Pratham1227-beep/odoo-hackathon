import React from "react";
import wagewiseLogo from "../../assets/wagewise-logo.png"
import wagewiseWordmark from "../../assets/wagewise-wordmark.png"

export default function WageWiseLogo({
  className = "",
  showTagline = true,
  iconOnly = false,
}) {
  return (
    <div className={`flex items-center ${className}`}>

      {/* Logo Mark */}
      <img
        src={wagewiseLogo}
        alt="WageWise Logo"
        className="w-14 h-14 object-contain shrink-0"
      />

      {/* Wordmark */}
      {!iconOnly && (
        <img
          src={wagewiseWordmark}
          alt="WageWise"
          className="w-auto h-10 object-contain ml-2"
        />
      )}

    </div>
  );
}