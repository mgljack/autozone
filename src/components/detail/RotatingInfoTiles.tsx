"use client";

import React from "react";
import { cn } from "@/lib/utils";

type TileItem = {
  id: string;
  front: {
    icon: React.ReactNode;
    label: string;
    value: string;
  };
  back: {
    icon: React.ReactNode;
    label: string;
    value: string;
  };
};

type RotatingInfoTilesProps = {
  items: TileItem[];
  className?: string;
};

export function RotatingInfoTiles({ items, className }: RotatingInfoTilesProps) {
  const [flippedStates, setFlippedStates] = React.useState<Record<string, boolean>>({});
  const [hoveredStates, setHoveredStates] = React.useState<Record<string, boolean>>({});
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  React.useEffect(() => {
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);
  }, []);

  // Mobile: Toggle flip on click
  const handleClick = (id: string) => {
    // Only handle click on mobile (touch devices)
    if (isTouchDevice) {
      setFlippedStates((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    }
  };

  // Desktop: Handle hover
  const handleMouseEnter = (id: string) => {
    if (!isTouchDevice) {
      setHoveredStates((prev) => ({
        ...prev,
        [id]: true,
      }));
    }
  };

  const handleMouseLeave = (id: string) => {
    if (!isTouchDevice) {
      setHoveredStates((prev) => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setFlippedStates((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    }
  };

  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-3", className)}>
      {items.map((item) => {
        const isFlipped = flippedStates[item.id] || false;
        const isHovered = hoveredStates[item.id] || false;
        // Desktop: use hover state, Mobile: use flipped state
        const shouldFlip = isTouchDevice ? isFlipped : isHovered;
        
        return (
          <div
            key={item.id}
            className="group relative h-[96px] cursor-pointer"
            style={{ perspective: "1000px" }}
            onClick={() => handleClick(item.id)}
            onMouseEnter={() => handleMouseEnter(item.id)}
            onMouseLeave={() => handleMouseLeave(item.id)}
            onKeyDown={(e) => handleKeyDown(e, item.id)}
            role="button"
            tabIndex={0}
            aria-label={`${item.front.label}: ${item.front.value}. Click to see ${item.back.label}`}
          >
            {/* 3D Flip Container */}
            <div
              className="relative h-full w-full transition-transform duration-500"
              style={{
                transformStyle: "preserve-3d",
                transform: shouldFlip ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front Side */}
              <div
                className="absolute inset-0 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md hover:border-slate-300"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-slate-500">{item.front.icon}</div>
                    <span className="text-[11px] font-normal text-slate-500">{item.front.label}</span>
                  </div>
                  <div className="text-base font-semibold leading-tight text-slate-900">{item.front.value}</div>
                </div>
              </div>

              {/* Back Side */}
              <div
                className="absolute inset-0 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md hover:border-slate-300"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-slate-500">{item.back.icon}</div>
                    <span className="text-[11px] font-normal text-slate-500">{item.back.label}</span>
                  </div>
                  <div className="text-base font-semibold leading-tight text-slate-900">{item.back.value}</div>
                </div>
              </div>
            </div>

            {/* Desktop hover hint (subtle) */}
            <div className="absolute right-2 top-2 hidden h-1.5 w-1.5 rounded-full bg-slate-300 opacity-0 transition-opacity group-hover:opacity-100 md:block" />
          </div>
        );
      })}
    </div>
  );
}

// Icon components
export function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-4 w-4", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function GaugeIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-4 w-4", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export function FuelIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-4 w-4", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3h18v18H3z" />
      <path d="M7 7h10v10H7z" />
      <path d="M10 3v4M14 3v4" />
    </svg>
  );
}

export function EngineIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-4 w-4", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 10h8M8 14h8M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
    </svg>
  );
}

export function GearIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-4 w-4", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
    </svg>
  );
}

export function CarIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-4 w-4", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 17h14l-1-7H6l-1 7zM5 17l-1 1v2h2v-2h12v2h2v-2l-1-1M7 11h10M9 13h6" />
    </svg>
  );
}

export function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-4 w-4", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.5-.662-.5-1.187 0-.5.5-1 1-1h1.25c2.76 0 5-2.24 5-5 0-4.5-3.5-8-8-8z" />
    </svg>
  );
}

