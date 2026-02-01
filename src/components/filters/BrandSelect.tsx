"use client";

import React from "react";
import ReactDOM from "react-dom";
import { useI18n } from "@/context/I18nContext";

interface BrandSelectProps {
  options: string[];
  value: string | null;
  onChange: (value: string | null) => void;
  items?: Array<{ title?: string; manufacturer?: string; brand?: string }>;
}

// Helper to get brand name from item
// Title format: "Toyota Camry 2.0" -> extract first word
// Or use manufacturer/brand field if available
function getBrandName(item: { title?: string; manufacturer?: string; brand?: string }): string | undefined {
  if (item.manufacturer) return item.manufacturer;
  if (item.brand) return item.brand;
  if (item.title) {
    // Extract first word from title (e.g., "Toyota Camry 2.0" -> "Toyota")
    const firstWord = item.title.trim().split(/\s+/)[0];
    return firstWord || undefined;
  }
  return undefined;
}

export function BrandSelect({ options, value, onChange, items = [] }: BrandSelectProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownPosition, setDropdownPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Compute brand counts from items (before brand filter is applied)
  const countsMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of items) {
      const brandName = getBrandName(item);
      if (brandName) {
        map[brandName] = (map[brandName] ?? 0) + 1;
      }
    }
    return map;
  }, [items]);

  // Build options with counts, sorted by count desc then name asc
  const optionsWithCounts = React.useMemo(() => {
    const opts = options
      .map((name) => ({
        name,
        count: countsMap[name] ?? 0,
      }))
      .sort((a, b) => {
        // Sort by count desc, then name asc
        if (b.count !== a.count) return b.count - a.count;
        return a.name.localeCompare(b.name);
      });
    return opts;
  }, [options, countsMap]);

  const selectedCount = value ? (countsMap[value] ?? 0) : null;
  const selectedLabel = value
    ? `${value}${selectedCount !== null ? ` ${selectedCount}` : ""}`
    : t("filters_brand_placeholder");

  // Update dropdown position when opened
  React.useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      requestAnimationFrame(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      });
    };

    const timeoutId = setTimeout(updatePosition, 0);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  React.useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  // Close on window scroll (but NOT dropdown internal scroll)
  React.useEffect(() => {
    if (isOpen) {
      const handleScroll = (e: Event) => {
        if (dropdownRef.current?.contains(e.target as Node)) {
          return;
        }
        setIsOpen(false);
      };
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }
  }, [isOpen]);

  return (
    <div className="relative overflow-visible">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 pr-10 text-sm outline-none transition-all duration-200 hover:border-zinc-300 focus:border-zinc-400 disabled:opacity-60"
      >
        <span className={value ? "text-zinc-900" : "text-zinc-400"}>{selectedLabel}</span>
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
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown menu - Rendered in Portal */}
      {isOpen &&
        typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/15"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="max-h-[280px] overflow-y-auto overscroll-contain pointer-events-auto">
              {/* All option */}
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                }}
                className={[
                  "flex w-full items-center px-4 py-3 text-left text-sm font-medium transition-colors",
                  !value ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100",
                ].join(" ")}
              >
                {t("common_all")}
              </button>
              {/* Brand options with counts */}
              {optionsWithCounts.map(({ name, count }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(name);
                    setIsOpen(false);
                  }}
                  className={[
                    "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors",
                    value === name ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100",
                  ].join(" ")}
                >
                  <span>{name}</span>
                  <span className={value === name ? "text-white/70" : "text-zinc-500"}>{count}</span>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

