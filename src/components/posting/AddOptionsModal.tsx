"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/I18nContext";

export type SelectedOption = {
  key: string;
  label: string;
  category: string;
};

type AddOptionsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOptions: SelectedOption[];
  onOptionsChange: (options: SelectedOption[]) => void;
};

// All available options organized by category
const allOptionsByCategory = (t: (key: string) => string) => [
  {
    category: t("carDetail_options_category_safety"),
    options: [
      { key: "abs", label: t("carDetail_options_abs") },
      { key: "rearCamera", label: t("carDetail_options_rearCamera") },
      { key: "sensors", label: t("carDetail_options_sensors") },
    ],
  },
  {
    category: t("carDetail_options_category_convenience"),
    options: [
      { key: "smartKey", label: t("carDetail_options_smartKey") },
      { key: "remoteStart", label: t("carDetail_options_remoteStart") },
      { key: "wirelessCharging", label: t("carDetail_options_wirelessCharging") },
      { key: "heatedSteering", label: t("carDetail_options_heatedSteering") },
    ],
  },
  {
    category: t("carDetail_options_category_seat"),
    options: [
      { key: "heatedSeat", label: t("carDetail_options_heatedSeat") },
      { key: "ventilatedSeat", label: t("carDetail_options_ventilatedSeat") },
      { key: "leatherSeat", label: t("carDetail_options_leatherSeat") },
      { key: "powerSeat", label: t("carDetail_options_powerSeat") },
      { key: "memorySeat", label: t("carDetail_options_memorySeat") },
    ],
  },
  {
    category: t("carDetail_options_category_exterior"),
    options: [
      { key: "sunroof", label: t("carDetail_options_sunroof") },
      { key: "ledHeadlight", label: t("carDetail_options_ledHeadlight") },
      { key: "chromeHandle", label: t("carDetail_options_chromeHandle") },
    ],
  },
  {
    category: t("carDetail_options_category_multimedia"),
    options: [
      { key: "navigation", label: t("carDetail_options_navigation") },
      { key: "rearMonitor", label: t("carDetail_options_rearMonitor") },
      { key: "bluetooth", label: t("carDetail_options_bluetooth") },
    ],
  },
];

export function AddOptionsModal({
  open,
  onOpenChange,
  selectedOptions,
  onOptionsChange,
}: AddOptionsModalProps) {
  const { t } = useI18n();
  const [tempSelected, setTempSelected] = React.useState<Set<string>>(
    new Set(selectedOptions.map((opt) => opt.key))
  );

  React.useEffect(() => {
    setTempSelected(new Set(selectedOptions.map((opt) => opt.key)));
  }, [selectedOptions, open]);

  const allOptions = allOptionsByCategory(t);

  const handleToggle = (key: string, label: string, category: string) => {
    const newSelected = new Set(tempSelected);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setTempSelected(newSelected);
  };

  const handleSave = () => {
    const newOptions: SelectedOption[] = [];
    allOptions.forEach((cat) => {
      cat.options.forEach((opt) => {
        if (tempSelected.has(opt.key)) {
          newOptions.push({
            key: opt.key,
            label: opt.label,
            category: cat.category,
          });
        }
      });
    });
    onOptionsChange(newOptions);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempSelected(new Set(selectedOptions.map((opt) => opt.key)));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl w-[92vw] max-h-[85vh] p-0 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-3 border-b border-slate-200/70 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-zinc-900">
              {t("sell_options_addMore")}
            </DialogTitle>
            <button
              onClick={handleCancel}
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
        <div className="px-6 py-3 overflow-y-auto flex-1" style={{ maxHeight: "calc(85vh - 140px)" }}>
          <div className="space-y-5">
            {allOptions.map((category, catIndex) => (
              <div key={category.category}>
                {/* Category Title */}
                <h4 className="text-base font-semibold text-zinc-900 mb-3">
                  {category.category}
                </h4>

                {/* Options Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {category.options.map((option) => {
                    const isChecked = tempSelected.has(option.key);
                    return (
                      <label
                        key={option.key}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 hover:bg-zinc-50 transition-colors"
                      >
                        <div className="relative flex-shrink-0">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => handleToggle(option.key, option.label, category.category)}
                          />
                        </div>
                        <span className="text-sm font-medium text-zinc-700">
                          {option.label}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Divider (except last) */}
                {catIndex < allOptions.length - 1 && (
                  <div className="h-px bg-slate-200/70 mt-5" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200/70 flex-shrink-0 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            {t("common_cancel")}
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:opacity-95">
            {t("common_confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

