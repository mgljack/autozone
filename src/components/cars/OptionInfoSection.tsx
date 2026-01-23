"use client";

import React from "react";
import { useI18n } from "@/context/I18nContext";

type VehicleOptions = {
  sunroof?: boolean;
  sensors?: boolean;
  smartKey?: boolean;
  heatedSeat?: boolean;
  ventilatedSeat?: boolean;
  leatherSeat?: boolean;
  heatedSteering?: boolean;
};

type OptionInfoSectionProps = {
  options?: VehicleOptions;
};

// Fixed 7 options with icon components
const fixedOptions = [
  { key: "sunroof" as const, icon: SunIcon },
  { key: "sensors" as const, icon: SensorsIcon },
  { key: "smartKey" as const, icon: SmartKeyIcon },
  { key: "heatedSeat" as const, icon: HeatedSeatIcon },
  { key: "ventilatedSeat" as const, icon: VentilatedSeatIcon },
  { key: "leatherSeat" as const, icon: LeatherSeatIcon },
  { key: "heatedSteering" as const, icon: HeatedSteeringIcon },
];

export function OptionInfoSection({ options }: OptionInfoSectionProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-bold text-zinc-900">{t("carDetail.options.title")}</h3>
        <InfoIcon />
      </div>

      {/* Sublabel */}
      <div className="mt-6 text-sm font-semibold text-zinc-700">{t("carDetail.options.sublabel")}</div>

      {/* Options Grid */}
      <div className="mt-6 grid grid-cols-7 justify-items-center gap-x-6 overflow-x-auto scrollbar-hide">
        {fixedOptions.map((opt) => {
          const isActive = options?.[opt.key] === true;
          const Icon = opt.icon;
          const labelKey = `carDetail.options.${opt.key}` as const;

          return (
            <div key={opt.key} className="flex min-w-max flex-col items-center gap-2">
              <Icon active={isActive} />
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  isActive ? "text-zinc-900 opacity-100" : "text-zinc-400 opacity-60"
                }`}
              >
                {t(labelKey)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Info Icon (small gray)
function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-zinc-400"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

// Icon Components (lucide-react style, outline, strokeWidth 1.5~1.75)
type IconProps = {
  active: boolean;
};

function SunIcon({ active }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-6 w-6 ${active ? "text-zinc-900 opacity-100" : "text-zinc-400 opacity-60"}`}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function SensorsIcon({ active }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-6 w-6 ${active ? "text-zinc-900 opacity-100" : "text-zinc-400 opacity-60"}`}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
    </svg>
  );
}

function SmartKeyIcon({ active }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-6 w-6 ${active ? "text-zinc-900 opacity-100" : "text-zinc-400 opacity-60"}`}
      aria-hidden="true"
    >
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function HeatedSeatIcon({ active }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-6 w-6 ${active ? "text-zinc-900 opacity-100" : "text-zinc-400 opacity-60"}`}
      aria-hidden="true"
    >
      <rect x="4" y="6" width="16" height="12" rx="1" />
      <path d="M4 10h16" />
      <path d="M4 14h16" />
      <path d="M8 4v4" />
      <path d="M16 4v4" />
      <circle cx="6" cy="8" r="1" fill="currentColor" />
      <circle cx="18" cy="8" r="1" fill="currentColor" />
      <path d="M6 12h2M16 12h2" />
    </svg>
  );
}

function VentilatedSeatIcon({ active }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-6 w-6 ${active ? "text-zinc-900 opacity-100" : "text-zinc-400 opacity-60"}`}
      aria-hidden="true"
    >
      <rect x="4" y="6" width="16" height="12" rx="1" />
      <path d="M4 10h16" />
      <path d="M4 14h16" />
      <path d="M8 4v4" />
      <path d="M16 4v4" />
      <path d="M6 8h2M16 8h2" />
      <path d="M6 12h2M16 12h2" />
      <path d="M6 16h2M16 16h2" />
    </svg>
  );
}

function LeatherSeatIcon({ active }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-6 w-6 ${active ? "text-zinc-900 opacity-100" : "text-zinc-400 opacity-60"}`}
      aria-hidden="true"
    >
      <rect x="4" y="6" width="16" height="12" rx="1" />
      <path d="M4 10h16" />
      <path d="M4 14h16" />
      <path d="M8 4v4" />
      <path d="M16 4v4" />
      <path d="M4 8h16M4 12h16M4 16h16" />
    </svg>
  );
}

function HeatedSteeringIcon({ active }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-6 w-6 ${active ? "text-zinc-900 opacity-100" : "text-zinc-400 opacity-60"}`}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="18" cy="6" r="1" fill="currentColor" />
      <circle cx="6" cy="18" r="1" fill="currentColor" />
      <circle cx="18" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

