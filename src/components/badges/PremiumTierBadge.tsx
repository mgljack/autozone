"use client";

import React from "react";

type PremiumTierBadgeProps = {
  tier: "gold" | "silver";
  placement?: "overlay" | "right";
};

export function PremiumTierBadge({ tier, placement = "overlay" }: PremiumTierBadgeProps) {
  const isGold = tier === "gold";
  const isRight = placement === "right";

  return (
    <div
      className={`
        inline-flex items-center gap-1.5
        rounded-full border shadow-sm
        backdrop-blur-sm
        transition-all duration-200
        ${isRight 
          ? "px-2 py-0.5 self-start" 
          : "absolute top-3 right-3 z-10 px-2.5 py-1 group-hover:shadow-md group-hover:scale-[1.02]"
        }
        ${isGold 
          ? "bg-[rgba(255,251,235,0.85)] border-[rgba(245,158,11,0.35)] text-[#92400e]" 
          : "bg-[rgba(248,250,252,0.90)] border-[rgba(100,116,139,0.25)] text-[#334155]"
        }
      `}
      aria-label={`Premium listing: ${tier.toUpperCase()}`}
    >
      {/* Icon */}
      {isGold ? <GoldShieldIcon size={isRight ? "small" : "normal"} /> : <SilverShieldIcon size={isRight ? "small" : "normal"} />}
      
      {/* Text */}
      <span className={`font-semibold tracking-wide uppercase ${isRight ? "text-[10px]" : "text-[11px]"}`}>
        {tier}
      </span>
    </div>
  );
}

// Shield Star Icon for GOLD (premium badge style)
function GoldShieldIcon({ size = "normal" }: { size?: "small" | "normal" }) {
  const iconSize = size === "small" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={iconSize}
      aria-hidden="true"
    >
      {/* Outer circle */}
      <circle cx="12" cy="12" r="10.5" fill="#d4a853" stroke="#c9973a" strokeWidth="1" />
      {/* Inner circle highlight */}
      <circle cx="12" cy="12" r="9" fill="url(#goldGradient)" />
      {/* Shield shape */}
      <path
        d="M12 4.5c-3 1.5-5 2-7 2v6c0 4 3 6.5 7 8.5 4-2 7-4.5 7-8.5v-6c-2 0-4-0.5-7-2z"
        fill="none"
        stroke="#b8860b"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Star */}
      <path
        d="M12 7.5l1.5 3 3.3.5-2.4 2.3.6 3.2L12 15l-3 1.5.6-3.2-2.4-2.3 3.3-.5 1.5-3z"
        fill="#b8860b"
        stroke="#9a7209"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5d998" />
          <stop offset="50%" stopColor="#e6c56c" />
          <stop offset="100%" stopColor="#d4a853" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Shield Star Icon for SILVER (premium badge style)
function SilverShieldIcon({ size = "normal" }: { size?: "small" | "normal" }) {
  const iconSize = size === "small" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={iconSize}
      aria-hidden="true"
    >
      {/* Outer circle */}
      <circle cx="12" cy="12" r="10.5" fill="#a8a8a8" stroke="#8a8a8a" strokeWidth="1" />
      {/* Inner circle highlight */}
      <circle cx="12" cy="12" r="9" fill="url(#silverGradient)" />
      {/* Shield shape */}
      <path
        d="M12 4.5c-3 1.5-5 2-7 2v6c0 4 3 6.5 7 8.5 4-2 7-4.5 7-8.5v-6c-2 0-4-0.5-7-2z"
        fill="none"
        stroke="#707070"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Star */}
      <path
        d="M12 7.5l1.5 3 3.3.5-2.4 2.3.6 3.2L12 15l-3 1.5.6-3.2-2.4-2.3 3.3-.5 1.5-3z"
        fill="#808080"
        stroke="#606060"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8e8e8" />
          <stop offset="50%" stopColor="#c0c0c0" />
          <stop offset="100%" stopColor="#a8a8a8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

