"use client";

import React from "react";
import ReactDOM from "react-dom";
import { useI18n } from "@/context/I18nContext";

interface RangeSelectProps {
  label: string;
  fromValue: number | null;
  toValue: number | null;
  onFromChange: (value: number | null) => void;
  onToChange: (value: number | null) => void;
  options: Array<{ value: number; label: string }>;
  fromLabelKey?: string;
  toLabelKey?: string;
}

export function RangeSelect({
  label,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  options,
  fromLabelKey = "common_from",
  toLabelKey = "common_to",
}: RangeSelectProps) {
  const { t } = useI18n();
  const [fromOpen, setFromOpen] = React.useState(false);
  const [toOpen, setToOpen] = React.useState(false);
  const [fromPosition, setFromPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const [toPosition, setToPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const fromTriggerRef = React.useRef<HTMLButtonElement>(null);
  const toTriggerRef = React.useRef<HTMLButtonElement>(null);
  const fromDropdownRef = React.useRef<HTMLDivElement>(null);
  const toDropdownRef = React.useRef<HTMLDivElement>(null);

  const fromSelectedOption = options.find((opt) => opt.value === fromValue);
  const toSelectedOption = options.find((opt) => opt.value === toValue);

  // Update dropdown position when opened
  const updateFromPosition = React.useCallback(() => {
    if (!fromTriggerRef.current) return;
    requestAnimationFrame(() => {
      if (!fromTriggerRef.current) return;
      const rect = fromTriggerRef.current.getBoundingClientRect();
      setFromPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    });
  }, []);

  const updateToPosition = React.useCallback(() => {
    if (!toTriggerRef.current) return;
    requestAnimationFrame(() => {
      if (!toTriggerRef.current) return;
      const rect = toTriggerRef.current.getBoundingClientRect();
      setToPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    });
  }, []);

  React.useEffect(() => {
    if (!fromOpen) return;
    const timeoutId = setTimeout(updateFromPosition, 0);
    window.addEventListener("scroll", updateFromPosition, true);
    window.addEventListener("resize", updateFromPosition);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", updateFromPosition, true);
      window.removeEventListener("resize", updateFromPosition);
    };
  }, [fromOpen, updateFromPosition]);

  React.useEffect(() => {
    if (!toOpen) return;
    const timeoutId = setTimeout(updateToPosition, 0);
    window.addEventListener("scroll", updateToPosition, true);
    window.addEventListener("resize", updateToPosition);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", updateToPosition, true);
      window.removeEventListener("resize", updateToPosition);
    };
  }, [toOpen, updateToPosition]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        fromTriggerRef.current &&
        !fromTriggerRef.current.contains(target) &&
        fromDropdownRef.current &&
        !fromDropdownRef.current.contains(target)
      ) {
        setFromOpen(false);
      }
      if (
        toTriggerRef.current &&
        !toTriggerRef.current.contains(target) &&
        toDropdownRef.current &&
        !toDropdownRef.current.contains(target)
      ) {
        setToOpen(false);
      }
    }
    if (fromOpen || toOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [fromOpen, toOpen]);

  // Close on escape key
  React.useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFromOpen(false);
        setToOpen(false);
      }
    }
    if (fromOpen || toOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [fromOpen, toOpen]);

  // Close on window scroll (but NOT dropdown internal scroll)
  React.useEffect(() => {
    if (fromOpen) {
      const handleScroll = (e: Event) => {
        if (fromDropdownRef.current?.contains(e.target as Node)) {
          return;
        }
        setFromOpen(false);
      };
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }
  }, [fromOpen]);

  React.useEffect(() => {
    if (toOpen) {
      const handleScroll = (e: Event) => {
        if (toDropdownRef.current?.contains(e.target as Node)) {
          return;
        }
        setToOpen(false);
      };
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }
  }, [toOpen]);

  const handleFromChange = (value: number | null) => {
    onFromChange(value);
    if (value !== null && toValue !== null && value > toValue) {
      onToChange(value);
    }
    setFromOpen(false);
  };

  const handleToChange = (value: number | null) => {
    onToChange(value);
    if (value !== null && fromValue !== null && value < fromValue) {
      onFromChange(value);
    }
    setToOpen(false);
  };

  return (
    <div className="grid gap-1">
      <span className="text-xs font-normal text-zinc-600">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        {/* From Select */}
        <div className="relative overflow-visible">
          <button
            ref={fromTriggerRef}
            type="button"
            onClick={() => setFromOpen(!fromOpen)}
            className="flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 pr-10 text-sm outline-none transition-all duration-200 hover:border-zinc-300 focus:border-zinc-400 disabled:opacity-60"
          >
            <span className={fromValue !== null ? "text-zinc-900" : "text-zinc-400"}>
              {fromValue !== null ? fromSelectedOption?.label ?? String(fromValue) : t(fromLabelKey)}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={[
                "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-transform duration-200",
                fromOpen ? "rotate-180" : "",
              ].join(" ")}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {fromOpen &&
            typeof document !== "undefined" &&
            ReactDOM.createPortal(
              <div
                ref={fromDropdownRef}
                className="fixed z-[9999] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/15"
                style={{
                  top: fromPosition.top,
                  left: fromPosition.left,
                  width: fromPosition.width,
                }}
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="max-h-[280px] overflow-y-auto overscroll-contain pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => handleFromChange(null)}
                    className={[
                      "flex w-full items-center px-4 py-3 text-left text-sm font-medium transition-colors",
                      fromValue === null ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100",
                    ].join(" ")}
                  >
                    {t("common_all")}
                  </button>
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleFromChange(opt.value)}
                      className={[
                        "flex w-full items-center px-4 py-3 text-left text-sm font-medium transition-colors",
                        fromValue === opt.value ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100",
                      ].join(" ")}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>,
              document.body
            )}
        </div>

        {/* To Select */}
        <div className="relative overflow-visible">
          <button
            ref={toTriggerRef}
            type="button"
            onClick={() => setToOpen(!toOpen)}
            className="flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 pr-10 text-sm outline-none transition-all duration-200 hover:border-zinc-300 focus:border-zinc-400 disabled:opacity-60"
          >
            <span className={toValue !== null ? "text-zinc-900" : "text-zinc-400"}>
              {toValue !== null ? toSelectedOption?.label ?? String(toValue) : t(toLabelKey)}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={[
                "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-transform duration-200",
                toOpen ? "rotate-180" : "",
              ].join(" ")}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {toOpen &&
            typeof document !== "undefined" &&
            ReactDOM.createPortal(
              <div
                ref={toDropdownRef}
                className="fixed z-[9999] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/15"
                style={{
                  top: toPosition.top,
                  left: toPosition.left,
                  width: toPosition.width,
                }}
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="max-h-[280px] overflow-y-auto overscroll-contain pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => handleToChange(null)}
                    className={[
                      "flex w-full items-center px-4 py-3 text-left text-sm font-medium transition-colors",
                      toValue === null ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100",
                    ].join(" ")}
                  >
                    {t("common_all")}
                  </button>
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleToChange(opt.value)}
                      className={[
                        "flex w-full items-center px-4 py-3 text-left text-sm font-medium transition-colors",
                        toValue === opt.value ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100",
                      ].join(" ")}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>,
              document.body
            )}
        </div>
      </div>
    </div>
  );
}

