"use client";

import React from "react";
import { useI18n } from "@/context/I18nContext";
import { cn } from "@/lib/utils";
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
      className="flex items-center py-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label={ariaLabelKey ? t(ariaLabelKey) : undefined}
    >
      {options.map((sort, idx) => {
        const isActive = value === sort.key;
        return (
          <div key={sort.key} className="flex items-center">
          <button
            type="button"
            onClick={() => onChange(sort.key)}
            aria-pressed={isActive}
              className={cn(
                "text-sm leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
              isActive
                  ? "text-slate-900 font-medium"
                  : "text-slate-500 hover:text-slate-900"
              )}
          >
            {t(sort.labelKey)}
          </button>
            {idx !== options.length - 1 && (
              <span className="mx-2 h-4 w-px bg-slate-300/70" />
            )}
          </div>
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

