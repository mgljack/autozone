"use client";

import React from "react";

type OptionIconProps = {
  type: "sunroof" | "sensors" | "smartKey" | "heatedSeat" | "ventilatedSeat" | "leatherSeat" | "heatedSteering";
  active: boolean;
  className?: string;
};

export function OptionIcon({ type, active, className = "" }: OptionIconProps) {
  const baseClasses = `h-6 w-6 ${active ? "text-rose-600" : "text-zinc-400 opacity-70"}`;
  const combinedClasses = `${baseClasses} ${className}`;

  switch (type) {
    case "sunroof":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={combinedClasses}>
          <rect x="2" y="3" width="20" height="18" rx="2" />
          <path d="M2 9h20" />
          <path d="M12 3v6" />
        </svg>
      );
    case "sensors":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={combinedClasses}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case "smartKey":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={combinedClasses}>
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </svg>
      );
    case "heatedSeat":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={combinedClasses}>
          <path d="M4 12h16" />
          <path d="M4 8h16" />
          <path d="M4 16h16" />
          <path d="M2 4h20v16H2z" />
          <path d="M8 2v4M16 2v4" />
          <circle cx="6" cy="6" r="1" fill="currentColor" />
          <circle cx="18" cy="6" r="1" fill="currentColor" />
        </svg>
      );
    case "ventilatedSeat":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={combinedClasses}>
          <path d="M2 12h20" />
          <path d="M2 8h20" />
          <path d="M2 16h20" />
          <path d="M4 4h16v16H4z" />
          <path d="M8 2v4M16 2v4" />
          <path d="M6 6h2M16 6h2" />
          <path d="M6 10h2M16 10h2" />
          <path d="M6 14h2M16 14h2" />
        </svg>
      );
    case "leatherSeat":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={combinedClasses}>
          <path d="M4 12h16" />
          <path d="M4 8h16" />
          <path d="M4 16h16" />
          <path d="M2 4h20v16H2z" />
          <path d="M8 2v4M16 2v4" />
          <path d="M4 6h16M4 10h16M4 14h16" />
        </svg>
      );
    case "heatedSteering":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={combinedClasses}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          <circle cx="6" cy="6" r="1" fill="currentColor" />
          <circle cx="18" cy="6" r="1" fill="currentColor" />
          <circle cx="6" cy="18" r="1" fill="currentColor" />
          <circle cx="18" cy="18" r="1" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}

