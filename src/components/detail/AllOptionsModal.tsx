"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/context/I18nContext";

type AllOptionsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupedOptions: Record<string, string[]>;
};

// Normalize vehicle options to grouped categories
export function normalizeOptionsToGroups(
  options: { [key: string]: boolean } | undefined,
  t: (key: string) => string
): Record<string, string[]> {
  if (!options) return {};

  const grouped: Record<string, string[]> = {
    안전: [],
    편의: [],
    "시트/내장": [],
    외장: [],
    멀티미디어: [],
  };

  // Map existing boolean options to categories
  if (options.sunroof) {
    grouped.외장.push(t("carDetail_options_sunroof"));
  }
  if (options.sensors) {
    grouped.안전.push(t("carDetail_options_sensors"));
  }
  if (options.smartKey) {
    grouped.편의.push(t("carDetail_options_smartKey"));
  }
  if (options.heatedSeat) {
    grouped["시트/내장"].push(t("carDetail_options_heatedSeat"));
  }
  if (options.ventilatedSeat) {
    grouped["시트/내장"].push(t("carDetail_options_ventilatedSeat"));
  }
  if (options.leatherSeat) {
    grouped["시트/내장"].push(t("carDetail_options_leatherSeat"));
  }
  if (options.heatedSteering) {
    grouped.편의.push(t("carDetail_options_heatedSteering"));
  }

  // Add mock additional options for prototype (if needed)
  // This can be replaced with actual data from backend later
  if (options.sunroof || options.sensors || options.smartKey) {
    // Add some mock options for demonstration
    if (options.sensors) {
      grouped.안전.push("ABS", "후방카메라");
    }
    if (options.smartKey) {
      grouped.편의.push("원격시동", "무선충전");
    }
    if (options.sunroof) {
      grouped.외장.push("LED 헤드라이트", "크롬 도어핸들");
    }
    if (options.leatherSeat) {
      grouped["시트/내장"].push("전동시트", "메모리시트");
    }
    grouped.멀티미디어.push("네비게이션", "후방모니터", "블루투스");
  }

  // Remove empty categories
  Object.keys(grouped).forEach((key) => {
    if (grouped[key].length === 0) {
      delete grouped[key];
    }
  });

  return grouped;
}

export function AllOptionsModal({ open, onOpenChange, groupedOptions }: AllOptionsModalProps) {
  const { t } = useI18n();

  // Filter out empty categories
  const categories = Object.entries(groupedOptions).filter(([_, options]) => options.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl w-[92vw] max-h-[85vh] p-0 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200/70 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-zinc-900">
              {t("carDetail_options_title")}
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-zinc-500"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
        </DialogHeader>

        {/* Body - Scrollable */}
        <div className="px-6 py-4 overflow-y-auto flex-1" style={{ maxHeight: "calc(85vh - 80px)" }}>
          {categories.length === 0 ? (
            <div className="text-sm text-zinc-500 text-center py-8">
              {t("carDetail_options_empty")}
            </div>
          ) : (
            <div className="space-y-6">
              {categories.map(([category, options], index) => (
                <div key={category}>
                  {/* Category Title */}
                  <h4 className="text-base font-semibold text-zinc-900 mb-3">
                    {category}
                  </h4>

                  {/* Options Chips */}
                  <div className="flex flex-wrap gap-2">
                    {options.map((option) => (
                      <span
                        key={option}
                        className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                      >
                        {option}
                      </span>
                    ))}
                  </div>

                  {/* Divider (except last) */}
                  {index < categories.length - 1 && (
                    <div className="h-px bg-slate-200/70 mt-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

