"use client";

import React from "react";

import { useI18n, type Locale } from "@/context/I18nContext";
import { cn } from "@/lib/utils";

export function LanguageSelect({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const items: Array<{ value: Locale; label: string }> = [
    { value: "mn", label: "Монгол" },
    { value: "ko", label: "한국어" },
    { value: "en", label: "English" },
  ];

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Language"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
      >
        <GlobeIcon className="h-5 w-5" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-md border border-zinc-200 bg-white shadow-md"
        >
          <div className="py-1">
            {items.map((it) => {
              const active = it.value === locale;
              return (
                <button
                  key={it.value}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setLocale(it.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-left text-sm font-normal",
                    active ? "text-blue-600" : "text-zinc-900",
                    "hover:bg-zinc-50",
                  )}
                >
                  {it.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M2 12h20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12 2c2.6 2.7 4 6.3 4 10s-1.4 7.3-4 10c-2.6-2.7-4-6.3-4-10s1.4-7.3 4-10Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}


