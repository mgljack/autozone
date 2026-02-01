"use client";

import React from "react";
import { useI18n } from "@/context/I18nContext";
import type { CarsSort } from "@/lib/mockApi";

interface SortPillsProps<T extends string = CarsSort> {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ key: T; labelKey: string }>;
  ariaLabelKey?: string;
}

export function SortPills<T extends string = CarsSort>({ value, onChange, options, ariaLabelKey }: SortPillsProps<T>) {
  const { t } = useI18n();

  return (
    <div
      className="flex justify-start items-center gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label={ariaLabelKey ? t(ariaLabelKey) : undefined}
    >
      {options.map((sort) => {
        const isActive = value === sort.key;
        return (
          <button
            key={sort.key}
            type="button"
            onClick={() => onChange(sort.key)}
            aria-pressed={isActive}
            className={[
              "px-3 py-1.5 rounded-full text-sm border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
              isActive
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
            ].join(" ")}
          >
            {t(sort.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

// Vehicle page specific (backwards compatibility)
const VEHICLE_SORTS: Array<{ key: CarsSort; labelKey: string }> = [
  { key: "newest", labelKey: "buyAll_sort_newest" },
  { key: "priceAsc", labelKey: "buyAll_sort_priceAsc" },
  { key: "priceDesc", labelKey: "buyAll_sort_priceDesc" },
  { key: "mileageAsc", labelKey: "buyAll_sort_mileageAsc" },
  { key: "mileageDesc", labelKey: "buyAll_sort_mileageDesc" },
  { key: "yearDesc", labelKey: "buyAll_sort_yearDesc" },
];

export function VehicleSortPills({ value, onChange }: { value: CarsSort; onChange: (value: CarsSort) => void }) {
  return <SortPills value={value} onChange={onChange} options={VEHICLE_SORTS} />;
}

