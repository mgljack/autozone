"use client";

import Image from "next/image";
import React from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const safe = images?.length ? images : ["/samples/cars/car-01.svg"];
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [open, setOpen] = React.useState(false);

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

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_180px]">
      {/* Main image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
        <Image src={activeSrc} alt={title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 70vw" />

        {/* Overlay actions */}
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-sm font-normal text-zinc-900 shadow-sm backdrop-blur hover:bg-white"
            aria-label="Like"
            aria-pressed={liked}
            onClick={onToggleLike}
          >
            {liked ? "♥" : "♡"}
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-sm font-normal text-zinc-900 shadow-sm backdrop-blur hover:bg-white"
            aria-label="Share"
            onClick={onShare}
          >
            ↗
          </button>
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


