"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import type { CarListItemDTO } from "@/lib/apiTypes";
import { formatKm, formatMnt } from "@/lib/format";
import { useI18n } from "@/context/I18nContext";
import { cn } from "@/lib/utils";

export function HomeTierCarousel({
  title,
  subtitle,
  viewAllHref,
  cars,
  className,
  centerTitle,
  customSubtitle,
}: {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  cars: CarListItemDTO[];
  className?: string;
  centerTitle?: boolean;
  customSubtitle?: string;
}) {
  const { t } = useI18n();
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const stepPxRef = React.useRef<number>(360);

  const measureStepPx = React.useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const firstCard = track.querySelector('[data-carousel-card="true"]') as HTMLElement | null;
    const cardWidth = firstCard?.getBoundingClientRect().width ?? 0;

    const cs = window.getComputedStyle(track);
    const gapRaw = cs.columnGap || cs.gap || "0";
    const gap = Number.parseFloat(gapRaw) || 0;

    const next = Math.max(1, Math.round(cardWidth + gap));
    stepPxRef.current = next > 1 ? next : 360;
  }, []);

  const scrollByStep = React.useCallback((dir: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;
    const step = stepPxRef.current || 360;
    track.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  }, []);

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const updateActive = () => {
      raf = 0;
      const container = trackRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;

      let bestIdx = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      const cards = Array.from(container.querySelectorAll('[data-carousel-card="true"]')) as HTMLElement[];
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const r = card.getBoundingClientRect();
        const cardCenter = r.left + r.width / 2;
        const dist = Math.abs(cardCenter - centerX);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
      setActiveIndex(bestIdx);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(updateActive);
    };

    // measure once mounted (and on resize)
    measureStepPx();
    updateActive();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("resize", measureStepPx, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("resize", measureStepPx);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [cars.length, measureStepPx]);

  if (!cars.length) return null;

  return (
    <div className={cn("rounded-3xl bg-zinc-50 p-4 sm:p-6", className)}>
      {centerTitle ? (
        <div className="mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-zinc-900">{title}</div>
          </div>
          {customSubtitle ? (
            <div className="relative mt-1.5 flex items-center">
              <div className="flex-1 text-center">
                <div className="text-sm font-normal text-zinc-500 tracking-tight">
                  {customSubtitle}
                </div>
              </div>
              <Link
                href={viewAllHref}
                className="absolute right-0 shrink-0 text-sm font-normal text-zinc-900 hover:underline"
              >
                {t("common.viewAll")}
              </Link>
            </div>
          ) : (
            <div className="mt-1.5 flex justify-end">
              <Link
                href={viewAllHref}
                className="shrink-0 text-sm font-normal text-zinc-900 hover:underline"
              >
                {t("common.viewAll")}
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="text-2xl font-bold text-zinc-900">{title}</div>
            {subtitle ? <div className="mt-1 text-sm text-zinc-600">{subtitle}</div> : null}
          </div>
          <Link href={viewAllHref} className="shrink-0 text-sm font-normal text-zinc-900 hover:underline">
            {t("common.viewAll")}
          </Link>
        </div>
      )}

      <div className="relative mt-4">
        {/* Desktop arrows - Premium design */}
        <button
          type="button"
          className="absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)] transition-all duration-200 hover:bg-rose-600 hover:shadow-[0_10px_26px_rgba(0,0,0,0.35)] hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed md:flex"
          aria-label="Previous"
          onClick={() => scrollByStep("left")}
        >
          <svg
            width="18"
            height="18"
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
        </button>
        <button
          type="button"
          className="absolute right-0 top-1/2 z-20 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)] transition-all duration-200 hover:bg-rose-600 hover:shadow-[0_10px_26px_rgba(0,0,0,0.35)] hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed md:flex"
          aria-label="Next"
          onClick={() => scrollByStep("right")}
        >
          <svg
            width="18"
            height="18"
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
        </button>

        <div
          ref={trackRef}
          className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-visible px-2 pb-4 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {cars.map((c) => (
            <Link
              key={c.id}
              href={`/buy/all/${c.id}`}
              data-carousel-card="true"
              className="shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/70 transition-transform duration-200 ease-out will-change-transform hover:scale-[1.03] hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 md:basis-[calc((100%-32px)/2)] lg:basis-[calc((100%-48px)/3)]"
            >
              <div className="relative h-44 w-full bg-zinc-100 sm:h-48">
                <Image
                  src={c.thumbnailUrl ?? "/samples/cars/car-01.svg"}
                  alt={c.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 320px, (min-width: 768px) 420px, 80vw"
                />
              </div>

              <div className="p-3">
                <div className="text-[18px] font-extrabold leading-tight">{formatMnt(c.priceMnt)}</div>
                <div className="mt-1 truncate text-sm font-normal text-zinc-900">{c.title}</div>
                {(() => {
                  const mfgYear = c.yearMade;
                  const importYear = c.yearImported;
                  const years = mfgYear && importYear ? `${mfgYear}/${importYear}` : mfgYear || importYear || "";
                  const mileage = c.mileageKm ? formatKm(c.mileageKm) : "";
                  const metaLine = [years, mileage].filter(Boolean).join(" · ");
                  return metaLine ? <div className="mt-1 text-xs text-zinc-600">{metaLine}</div> : null;
                })()}
              </div>
            </Link>
          ))}
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {cars.map((_, i) => {
            const active = i === activeIndex;
            return (
              <button
                key={i}
                type="button"
                aria-label={`Go to ${i + 1}`}
                aria-pressed={active}
                onClick={() => {
                  measureStepPx();
                  const track = trackRef.current;
                  if (!track) return;
                  const cards = track.querySelectorAll('[data-carousel-card="true"]');
                  const el = cards[i] as HTMLElement | undefined;
                  el?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
                }}
                className={cn(
                  "h-2 rounded-full bg-zinc-300 transition-all",
                  active ? "w-6 bg-zinc-900" : "w-2",
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}


