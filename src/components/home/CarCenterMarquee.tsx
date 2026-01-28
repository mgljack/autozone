"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import { useI18n } from "@/context/I18nContext";
import type { CenterDTO } from "@/lib/apiTypes";

interface CarCenterMarqueeProps {
  centers: CenterDTO[];
}

function WrenchIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

export function CarCenterMarquee({ centers }: CarCenterMarqueeProps) {
  const { t } = useI18n();
  
  if (!centers.length) return null;

  // Duplicate items multiple times to ensure seamless loop even on wide screens
  // Standard pattern: duplicate 2x, animate -50%
  // But we duplicate more to handle wide screens and ensure no gaps
  const duplicatedCenters = [...centers, ...centers, ...centers, ...centers];

  return (
    <section className="w-full overflow-hidden">
      <div className="mb-4 flex items-end justify-between">
        <div className="text-2xl font-bold">{t("home_sections_carCenter")}</div>
        <Link href="/service" className="text-sm font-normal text-zinc-900 hover:underline">
          {t("common_viewAll")}
        </Link>
      </div>
      <div className="relative w-full overflow-hidden py-5">
        <div
          className="flex gap-6 will-change-transform"
          style={{
            display: "inline-flex",
            animation: "marquee-scroll 40s linear infinite",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.animationPlayState = "paused";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.animationPlayState = "running";
          }}
        >
          {duplicatedCenters.map((center, idx) => {
            // Get first 2-3 services for subtitle
            const servicesPreview = center.services?.slice(0, 3).join(" · ") || "Auto Repair";
            
            return (
              <Link
                key={`${center.id}-${idx}`}
                href={`/service/center/${center.id}`}
                className="group relative flex shrink-0 cursor-pointer items-center gap-4 rounded-2xl bg-white p-4 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                style={{ 
                  width: "280px", 
                  minHeight: "120px",
                  flexShrink: 0,
                  flexGrow: 0,
                }}
              >
                {/* Icon Accent - Top Right */}
                <div className="absolute right-3 top-3">
                  <WrenchIcon 
                    className="h-4 w-4 opacity-30 transition-opacity group-hover:opacity-50" 
                    style={{ color: "var(--accent-orange)" }}
                  />
                </div>

                {/* Circular Image */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-zinc-100 ring-2 ring-zinc-200/50 transition-all group-hover:ring-zinc-300/70">
                  <Image
                    src={center.imageUrl || "/samples/cars/car-01.svg"}
                    alt={center.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Text Content */}
                <div className="min-w-0 flex-1 pr-2">
                  <h3 className="truncate text-base font-semibold leading-tight text-zinc-900">{center.name}</h3>
                  {servicesPreview && (
                    <p className="mt-1.5 line-clamp-1 text-sm leading-tight text-zinc-600">{servicesPreview}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

