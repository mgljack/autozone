"use client";

import Image from "next/image";
import React from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LikeIcon } from "@/components/ui/LikeIcon";
import { useI18n } from "@/context/I18nContext";
import { cn } from "@/lib/utils";

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
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
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function ShareIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

export function CarGallery({
  images,
  title,
  liked,
  onToggleLike,
  onShare,
  moreLabel,
  galleryTitle,
  selectLabel,
}: {
  images: string[];
  title: string;
  liked: boolean;
  onToggleLike: () => void;
  onShare: () => void;
  moreLabel: string;
  galleryTitle: string;
  selectLabel: string;
}) {
  const { t } = useI18n();
  const safe = images?.length ? images : ["/samples/cars/car-01.svg"];
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [shareHovered, setShareHovered] = React.useState(false);

  const activeSrc = safe[Math.min(activeIndex, safe.length - 1)]!;

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") setActiveIndex((i) => (i - 1 + safe.length) % safe.length);
      if (e.key === "ArrowRight") setActiveIndex((i) => (i + 1) % safe.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, safe.length]);

  const hasMultipleImages = safe.length > 1;

  const handlePrev = () => {
    setActiveIndex((i) => (i - 1 + safe.length) % safe.length);
  };

  const handleNext = () => {
    setActiveIndex((i) => (i + 1) % safe.length);
  };

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_180px]">
      {/* Main image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
        <Image 
          src={activeSrc} 
          alt={title} 
          fill 
          className="object-cover transition-opacity duration-300" 
          priority 
          sizes="(max-width: 1024px) 100vw, 70vw" 
        />

        {/* Navigation buttons - only show if multiple images */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)] transition-all duration-200 ease-in-out hover:bg-black/65 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 md:h-12 md:w-12"
              aria-label="Previous image"
              onClick={handlePrev}
            >
              <ChevronLeftIcon className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)] transition-all duration-200 ease-in-out hover:bg-black/65 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 md:h-12 md:w-12"
              aria-label="Next image"
              onClick={handleNext}
            >
              <ChevronRightIcon className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </>
        )}

        {/* Overlay actions */}
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          <button
            type="button"
            className="group relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/6 bg-white/85 text-[#6B7280] shadow-[0_2px_6px_rgba(0,0,0,0.08)] backdrop-blur-[6px] transition-all duration-180 ease-out hover:scale-104 hover:bg-white hover:text-[#111827] hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]/20 focus-visible:ring-offset-2"
            aria-label={t("common_share")}
            onClick={onShare}
            onMouseEnter={() => setShareHovered(true)}
            onMouseLeave={() => setShareHovered(false)}
          >
            <ShareIcon className="h-4 w-4" filled={shareHovered} />
          </button>
          <button
            type="button"
            className={cn(
              "group relative inline-flex h-7 w-7 items-center justify-center rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all duration-150 ease-out hover:scale-105 hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]/20 focus-visible:ring-offset-2",
              liked 
                ? "bg-rose-600 border border-rose-600 hover:bg-rose-700 hover:border-rose-700" 
                : "bg-zinc-500 border border-zinc-500 hover:bg-zinc-600 hover:border-zinc-600"
            )}
            aria-label="Like"
            aria-pressed={liked}
            onClick={onToggleLike}
          >
            <LikeIcon liked={liked} size="sm" />
          </button>
        </div>

        {/* Image counter */}
        <div className="absolute bottom-3 right-3 z-20 rounded-md bg-black/50 px-[10px] py-[6px] text-xs font-normal text-white">
          {activeIndex + 1} / {safe.length}
        </div>
      </div>

      {/* Thumbnails (4) */}
      <div className="grid gap-3">
        {Array.from({ length: 4 }).map((_, i) => {
          const src = safe[i + 1] ?? safe[0]!;
          // Spec: last thumbnail always shows "더보기" and opens modal to view ALL photos.
          const isMore = i === 3;
          return (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => {
                if (isMore) {
                  setOpen(true);
                  return;
                }
                setActiveIndex(i + 1);
              }}
              className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white"
              aria-label={isMore ? moreLabel : selectLabel}
            >
              <div className="relative h-[86px] w-full bg-zinc-100">
                <Image src={src} alt="" fill className="object-cover" />
              </div>
              {isMore ? (
                <div className="absolute inset-0 grid place-items-center bg-black/55 text-sm font-normal text-white">
                  {moreLabel}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Modal: all photos */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className="!bg-black !text-white w-[98vw] max-w-[1800px] h-[50vh] max-h-[50vh] p-0 overflow-hidden rounded-none border-none shadow-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with close button - floating */}
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
            <div className="flex items-center gap-3 rounded-full bg-black/60 backdrop-blur-md px-4 py-2">
              <h3 className="text-sm font-medium text-white">{galleryTitle}</h3>
              <span className="text-xs text-white/70">
                {activeIndex + 1} / {safe.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white transition-all hover:bg-black/80 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={t("common_close")}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main image area */}
          <div className="relative h-full w-full bg-black overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center p-0">
              <div className="relative w-full h-[50vh] max-w-full">
                <Image 
                  src={activeSrc} 
                  alt={`${title} - ${activeIndex + 1}`} 
                  fill 
                  className="object-contain" 
                  sizes="(max-width: 1800px) 98vw, 1800px"
                />
              </div>
              </div>

            {/* Navigation arrows */}
            {safe.length > 1 && (
              <>
              <button
                type="button"
                  className="absolute left-4 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white shadow-lg transition-all hover:bg-white/20 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="Previous image"
                onClick={() => setActiveIndex((i) => (i - 1 + safe.length) % safe.length)}
              >
                  <ChevronLeftIcon className="h-6 w-6" />
              </button>
              <button
                type="button"
                  className="absolute right-4 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white shadow-lg transition-all hover:bg-white/20 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="Next image"
                onClick={() => setActiveIndex((i) => (i + 1) % safe.length)}
              >
                  <ChevronRightIcon className="h-6 w-6" />
              </button>
              </>
            )}
            </div>

          {/* Thumbnail strip - floating at bottom */}
          {safe.length > 1 && (
            <div className="absolute bottom-4 left-4 right-4 z-30">
              <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full">
              {safe.map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                    className={`relative h-16 w-20 sm:h-20 sm:w-28 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      idx === activeIndex 
                        ? "border-white ring-2 ring-white/50 scale-105" 
                        : "border-white/30 hover:border-white/60"
                    } bg-black/40 backdrop-blur-sm`}
                    aria-label={`${selectLabel} ${idx + 1}`}
                    aria-pressed={idx === activeIndex}
                >
                  <Image src={src} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


