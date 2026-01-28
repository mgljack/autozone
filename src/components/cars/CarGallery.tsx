"use client";

import Image from "next/image";
import React from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/context/I18nContext";

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

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
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
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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
  const [heartHovered, setHeartHovered] = React.useState(false);

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
            className={`group relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/6 bg-white/85 text-[#6B7280] shadow-[0_2px_6px_rgba(0,0,0,0.08)] backdrop-blur-[6px] transition-all duration-180 ease-out hover:scale-104 hover:bg-white hover:text-[#111827] hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]/20 focus-visible:ring-offset-2 ${
              liked ? "text-[#EF4444]" : ""
            }`}
            style={
              liked
                ? {
                    animation: "heart-pulse 0.4s ease-out 1",
                  }
                : undefined
            }
            aria-label="Like"
            aria-pressed={liked}
            onClick={onToggleLike}
            onMouseEnter={() => setHeartHovered(true)}
            onMouseLeave={() => setHeartHovered(false)}
          >
            <HeartIcon className="h-4 w-4" filled={liked || heartHovered} />
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
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{galleryTitle}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
              <div className="relative aspect-[16/10] w-full">
                <Image src={activeSrc} alt={title} fill className="object-cover" />
              </div>

              <button
                type="button"
                className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-sm font-normal text-zinc-900 shadow-sm backdrop-blur hover:bg-white"
                aria-label="Prev"
                onClick={() => setActiveIndex((i) => (i - 1 + safe.length) % safe.length)}
              >
                ←
              </button>
              <button
                type="button"
                className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-sm font-normal text-zinc-900 shadow-sm backdrop-blur hover:bg-white"
                aria-label="Next"
                onClick={() => setActiveIndex((i) => (i + 1) % safe.length)}
              >
                →
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-normal text-white">
                {activeIndex + 1} / {safe.length}
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {safe.map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border ${idx === activeIndex ? "border-zinc-900" : "border-zinc-200"} bg-white`}
                  aria-label={selectLabel}
                >
                  <Image src={src} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


