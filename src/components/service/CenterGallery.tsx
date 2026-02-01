"use client";

import Image from "next/image";
import React from "react";
import { useI18n } from "@/context/I18nContext";

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function CenterGallery({ images, title }: { images: string[]; title: string }) {
  const { t } = useI18n();
  const safe = images?.length ? images : ["/samples/cars/car-01.svg"];
  const [activeIndex, setActiveIndex] = React.useState(0);
  const canNavigate = safe.length > 1;
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === safe.length - 1;

  return (
    <div className="grid gap-3 px-3 sm:px-4 lg:px-5">
      {/* Main Image Area */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white">
        <div
          className="relative w-full bg-zinc-100 h-[320px] sm:h-[400px] md:h-[480px]"
          tabIndex={0}
          onKeyDown={(e) => {
            if (!canNavigate) return;
            if (e.key === "ArrowLeft" && !isFirst) {
              e.preventDefault();
              setActiveIndex((i) => i - 1);
            }
            if (e.key === "ArrowRight" && !isLast) {
              e.preventDefault();
              setActiveIndex((i) => i + 1);
            }
          }}
        >
          {/* Sliding track */}
          <div
            className="absolute inset-0 flex h-full w-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {safe.map((src, idx) => (
              <div key={`${src}-${idx}`} className="relative min-w-full">
                <Image src={src} alt={`${title} - Image ${idx + 1}`} fill className="object-cover" priority={idx === 0} />
              </div>
            ))}
          </div>

          {/* Arrow buttons */}
          {canNavigate ? (
            <>
              <button
                type="button"
                aria-label={t("service_gallery_previousPhoto")}
                onClick={() => setActiveIndex((i) => i - 1)}
                disabled={isFirst}
                className={[
                  "absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-white transition",
                  isFirst
                    ? "bg-black/10 cursor-not-allowed opacity-50"
                    : "bg-black/20 hover:bg-black/30",
                ].join(" ")}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label={t("service_gallery_nextPhoto")}
                onClick={() => setActiveIndex((i) => i + 1)}
                disabled={isLast}
                className={[
                  "absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-white transition",
                  isLast
                    ? "bg-black/10 cursor-not-allowed opacity-50"
                    : "bg-black/20 hover:bg-black/30",
                ].join(" ")}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {safe.length > 1 && (
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-1">
            {safe.map((src, idx) => (
              <button
                key={`thumb-${src}-${idx}`}
                type="button"
                aria-label={t("service.gallery.viewImage", { index: idx + 1 })}
                onClick={() => setActiveIndex(idx)}
                className={[
                  "relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                  idx === activeIndex
                    ? "border-zinc-900 ring-2 ring-zinc-900 ring-offset-2"
                    : "border-zinc-200 hover:border-zinc-400",
                ].join(" ")}
              >
                <Image src={src} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


