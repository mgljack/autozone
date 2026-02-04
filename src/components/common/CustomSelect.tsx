"use client";

import React from "react";
import ReactDOM from "react-dom";

// Custom scrollable select dropdown with Portal (generic version)
export function CustomSelect<T extends string | number>({
  value,
  onChange,
  options,
  disabled,
  placeholder,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  disabled?: boolean;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownPosition, setDropdownPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  // Update dropdown position when opened or on scroll/resize
  React.useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4, // fixed positioning, no scroll offset needed
          left: rect.left,
          width: rect.width,
        });
      });
    };

    // Initial position with slight delay to ensure layout is stable
    const timeoutId = setTimeout(updatePosition, 0);

    // Update on scroll/resize
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
        // Don't close if scrolling inside the dropdown
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
    <div className="relative">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={[
          "flex h-12 w-full cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 outline-none ring-0 shadow-none transition-all duration-200",
          disabled
            ? "cursor-not-allowed opacity-50"
            : isOpen
              ? "border-zinc-300 ring-1 ring-zinc-300"
              : "hover:border-zinc-300 hover:ring-1 hover:ring-zinc-200 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300",
        ].join(" ")}
      >
        <span>{selectedOption?.label ?? placeholder ?? ""}</span>
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
            "text-zinc-400 transition-transform duration-200",
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
            <div className="max-h-[252px] overflow-y-auto overscroll-contain pointer-events-auto">
              {options.map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={[
                    "flex w-full items-center px-4 py-3 text-left text-sm font-medium transition-colors",
                    opt.value === value
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-700 hover:bg-zinc-100",
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
  );
}

