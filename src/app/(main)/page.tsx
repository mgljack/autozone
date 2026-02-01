"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import ReactDOM from "react-dom";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/I18nContext";
import { formatKm, formatMnt } from "@/lib/format";
import { formatRelativeTimeKo } from "@/lib/formatRelativeTime";
import { fetchCarTaxonomy, fetchCenters, fetchHomeSections } from "@/lib/mockApi";
import type { CarListItemDTO } from "@/lib/apiTypes";
import { HomeTierCarousel } from "@/components/home/HomeTierCarousel";
import { CarCenterMarquee } from "@/components/home/CarCenterMarquee";
import HomeAppPromoSection from "@/components/home/HomeAppPromoSection";
import { MiddleSplitBanner } from "@/components/home/MiddleSplitBanner";
import { PremiumTierBadge } from "@/components/badges/PremiumTierBadge";

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

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l12-7-12-7z" />
    </svg>
  );
}

// Custom scrollable price select dropdown with Portal
function PriceSelect({
  value,
  onChange,
  options,
}: {
  value: number;
  onChange: (value: number) => void;
  options: { value: number; label: string }[];
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
    <div className="relative flex-1">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={[
          "flex h-12 w-full cursor-pointer items-center justify-between rounded-xl border-0 bg-zinc-100 px-4 text-sm font-medium text-zinc-900 outline-none ring-0 shadow-none transition-all duration-200 focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none",
          isOpen
            ? "bg-zinc-200"
            : "hover:bg-zinc-200",
        ].join(" ")}
      >
        <span>{selectedOption?.label ?? ""}</span>
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
                  key={opt.value}
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

export default function MainHomePage() {
  const { t } = useI18n();
  const router = useRouter();

  const homeQuery = useQuery({
    queryKey: ["home", "sections"],
    queryFn: fetchHomeSections,
  });

  const taxonomyQuery = useQuery({
    queryKey: ["cars", "taxonomy"],
    queryFn: fetchCarTaxonomy,
  });

  const centersQuery = useQuery({
    queryKey: ["centers", "list"],
    queryFn: fetchCenters,
  });

  const [manufacturer, setManufacturer] = React.useState("");
  const [model, setModel] = React.useState("");
  const [subModel, setSubModel] = React.useState("");
  const [keyword, setKeyword] = React.useState("");

  type QuickSearchTab = "quick" | "budget" | "keyword";
  const [quickTab, setQuickTab] = React.useState<QuickSearchTab>("quick");

  // Budget tab state (만원)
  // 5сая = 500 만원, 100сая = 10,000 만원
  const MIN_MANWON = 500; // 5сая
  const MAX_MANWON = 10000; // 100сая
  const [minManwon, setMinManwon] = React.useState(MIN_MANWON);
  const [maxManwon, setMaxManwon] = React.useState(MAX_MANWON);
  const [carType, setCarType] = React.useState<
    "all" | "sedan" | "suv" | "coupe" | "hatchback" | "pickup" | "van"
  >("all");

  const models =
    manufacturer && taxonomyQuery.data ? taxonomyQuery.data.modelsByManufacturer[manufacturer] ?? [] : [];
  const subModels =
    manufacturer && model && taxonomyQuery.data
      ? taxonomyQuery.data.subModelsByManufacturerModel[manufacturer]?.[model] ?? []
      : [];

  React.useEffect(() => {
    setModel("");
    setSubModel("");
  }, [manufacturer]);
  React.useEffect(() => {
    setSubModel("");
  }, [model]);

  const onSearch = () => {
    const sp = new URLSearchParams();

    if (quickTab === "quick") {
      if (manufacturer) sp.set("manufacturer", manufacturer);
      if (model) sp.set("model", model);
      if (subModel) sp.set("subModel", subModel);
    } else if (quickTab === "keyword") {
      if (keyword.trim()) sp.set("q", keyword.trim());
    } else {
      // Budget search: pass min/max + carType. (No domestic/import params.)
      const minMnt = Math.max(MIN_MANWON, Math.floor(minManwon)) * 10000;
      const maxMnt = Math.min(MAX_MANWON, Math.floor(maxManwon)) * 10000;
      if (minMnt > 0) sp.set("priceMinMnt", String(minMnt));
      if (maxMnt > 0) sp.set("priceMaxMnt", String(maxMnt));
      if (carType !== "all") sp.set("carType", carType);
    }
    router.push(`/buy/all?${sp.toString()}`);
  };

  const bannerImages = React.useMemo(
    () => ["/banner/banner-1.png", "/banner/banner-2.png", "/banner/banner-3.jpg"],
    [],
  );

  const bannerSlides = React.useMemo(
    () => [
      {
        id: "s1",
        title: t("home_title"),
        subtitle: t("home_subtitle"),
        primaryHref: "/buy/all",
        primaryText: t("nav_allVehicles"),
        secondaryHref: "/sell",
        secondaryText: t("nav_sell"),
        bgClass: "bg-zinc-950",
      },
      {
        id: "s2",
        title: t("home_sections_goldTitle"),
        subtitle: t("home_sections_goldDesc"),
        primaryHref: "/buy/all?tier=gold",
        primaryText: t("common_viewAll"),
        secondaryHref: "/buy/all",
        secondaryText: t("nav_allVehicles"),
        bgClass: "bg-zinc-950",
      },
      {
        id: "s3",
        title: t("home_sections_silverTitle"),
        subtitle: t("home_sections_silverDesc"),
        primaryHref: "/buy/all?tier=silver",
        primaryText: t("common_viewAll"),
        secondaryHref: "/sell",
        secondaryText: t("nav_sell"),
        bgClass: "bg-zinc-950",
      },
    ],
    [t],
  );

  const [bannerIndex, setBannerIndex] = React.useState(0);
  const [bannerPaused, setBannerPaused] = React.useState(false);
  const bannerCount = bannerSlides.length;
  const canSlide = bannerCount > 1;

  const bannerPrev = React.useCallback(() => {
    setBannerIndex((i) => (i - 1 + bannerCount) % bannerCount);
  }, [bannerCount]);

  const bannerNext = React.useCallback(() => {
    setBannerIndex((i) => (i + 1) % bannerCount);
  }, [bannerCount]);

  React.useEffect(() => {
    if (!canSlide) return;
    if (bannerPaused) return;
    const id = window.setInterval(() => {
      setBannerIndex((i) => (i + 1) % bannerCount);
    }, 5000);
    return () => window.clearInterval(id);
  }, [bannerPaused, bannerCount, canSlide]);

  return (
    <div className="relative grid gap-16">

      {/* 1) Hero */}
      <section className="relative w-full">
        <div className="mx-auto w-full max-w-[1280px] px-4">
          <div 
            className="relative w-full aspect-[1960/600] max-h-[600px] min-h-[360px] rounded-tr-[40px] rounded-bl-[40px] overflow-hidden border border-white/10 ring-1 ring-black/10 shadow-[0_18px_45px_rgba(0,0,0,0.18)] bg-zinc-950 text-white"
            style={{
              borderTopLeftRadius: '10px',
              borderBottomRightRadius: '10px',
            }}
          >
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
          >
            {bannerSlides.map((s, idx) => (
              <div key={s.id} className="min-w-full h-full">
                <div className={`relative h-full w-full ${s.bgClass}`}>
                  {/* Background image */}
                  <Image
                    src={bannerImages[idx % bannerImages.length]!}
                    alt=""
                    fill
                    priority={idx === 0}
                    className="object-cover object-center"
                  />
                  {/* Readability overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/15" aria-hidden="true" />
                  {/* Bottom dark overlay (inside banner, not a separate block) */}
                  <div className="absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />

                  <div className="absolute inset-0 opacity-25">
                    <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-400 blur-3xl" />
                    <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-emerald-400 blur-3xl" />
                  </div>

                  {/* Controls pill (top-left) */}
                  <div className="absolute left-6 top-6 z-20">
                    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs font-normal text-white/90 backdrop-blur">
                      <span>
                        {bannerIndex + 1} / {bannerCount}
                      </span>
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/15"
                        aria-label={bannerPaused ? "Play slideshow" : "Pause slideshow"}
                        onClick={() => setBannerPaused((v) => !v)}
                      >
                        {bannerPaused ? <PlayIcon className="h-4 w-4" /> : <PauseIcon className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Slide content */}
                  <div className="relative mx-auto flex h-full w-full max-w-[1280px] items-center px-4">
                    <div className="grid gap-3 py-10">
                      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{s.title}</h1>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <Link href={s.primaryHref}>
                          <Button className="w-full sm:w-auto" variant="secondary">
                            {s.primaryText}
                          </Button>
                        </Link>
                        <Link href={s.secondaryHref}>
                          <Button className="w-full sm:w-auto">{s.secondaryText}</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Arrow controls */}
          {canSlide ? (
            <>
              <button
                type="button"
                aria-label="Previous banner"
                onClick={bannerPrev}
                className="absolute left-4 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white transition hover:bg-black/30"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next banner"
                onClick={bannerNext}
                className="absolute right-4 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white transition hover:bg-black/30"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </>
          ) : null}

          {/* Dots indicator (kept minimal) */}
          {canSlide ? (
            <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
              <div className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur">
                {bannerSlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to banner ${idx + 1}`}
                    onClick={() => setBannerIndex(idx)}
                    className={[
                      "h-2.5 w-2.5 rounded-full transition",
                      idx === bannerIndex ? "bg-white" : "bg-white/50 hover:bg-white/70",
                    ].join(" ")}
                  />
                ))}
              </div>
            </div>
          ) : null}
          </div>
        </div>
      </section>

      {/* 2) Quick search - Premium Modern Design */}
      <section className="w-full">
        <div className="mx-auto w-full max-w-[1280px] px-4">
          <div className="relative overflow-hidden rounded-[28px] bg-white px-6 py-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)] sm:px-8 sm:py-7">
              {/* Tabs row - Pill style */}
              <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                  onClick={() => setQuickTab("quick")}
                className={[
                    "relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300",
                    quickTab === "quick" 
                      ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/25" 
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700",
                ].join(" ")}
              >
                  {quickTab === "quick" && (
                    <span className="flex h-4 w-4 items-center justify-center">
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                      <path
                        d="M20 6 9 17l-5-5"
                        fill="none"
                        stroke="currentColor"
                          strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  )}
                <span>{t("home_quickSearch_tab_quick")}</span>
              </button>

              <button
                type="button"
                onClick={() => setQuickTab("budget")}
                className={[
                    "relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300",
                    quickTab === "budget" 
                      ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/25" 
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700",
                ].join(" ")}
              >
                  {quickTab === "budget" && (
                    <span className="flex h-4 w-4 items-center justify-center">
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                      <path
                        d="M20 6 9 17l-5-5"
                        fill="none"
                        stroke="currentColor"
                          strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  )}
                <span>{t("home_quickSearch_tab_budget")}</span>
              </button>

              <button
                type="button"
                  onClick={() => setQuickTab("keyword")}
                className={[
                    "relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300",
                    quickTab === "keyword" 
                      ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/25" 
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700",
                ].join(" ")}
              >
                  {quickTab === "keyword" && (
                    <span className="flex h-4 w-4 items-center justify-center">
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                      <path
                        d="M20 6 9 17l-5-5"
                        fill="none"
                        stroke="currentColor"
                          strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  )}
                <span>{t("home_quickSearch_tab_keyword")}</span>
              </button>
            </div>

            {/* Inputs row */}
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              {quickTab === "quick" ? (
                  <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
                    <div className="group flex min-w-0 flex-1 flex-col gap-1.5">
                      <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">{t("home_quickSearch_manufacturer")}</label>
                      <div className="relative">
                    <select
                          className="h-12 w-full cursor-pointer appearance-none rounded-xl border-0 bg-zinc-100 px-4 pr-10 text-sm font-medium text-zinc-900 outline-none ring-0 shadow-none transition-all duration-200 hover:bg-zinc-200 focus:border-0 focus:bg-zinc-200 focus:outline-none focus:ring-0 focus:shadow-none"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                    >
                      <option value="">{t("home_quickSearch_selectPlaceholder")}</option>
                      {(taxonomyQuery.data?.manufacturers ?? []).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6"/>
                          </svg>
                        </div>
                      </div>
                  </div>

                    <div className="group flex min-w-0 flex-1 flex-col gap-1.5">
                      <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">{t("home_quickSearch_model")}</label>
                      <div className="relative">
                    <select
                          className="h-12 w-full cursor-pointer appearance-none rounded-xl border-0 bg-zinc-100 px-4 pr-10 text-sm font-medium text-zinc-900 outline-none ring-0 shadow-none transition-all duration-200 hover:bg-zinc-200 focus:border-0 focus:bg-zinc-200 focus:outline-none focus:ring-0 focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      disabled={!manufacturer}
                    >
                      <option value="">{t("home_quickSearch_selectPlaceholder")}</option>
                      {models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6"/>
                          </svg>
                        </div>
                      </div>
                  </div>

                    <div className="group flex min-w-0 flex-1 flex-col gap-1.5">
                      <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">{t("home_quickSearch_subModel")}</label>
                      <div className="relative">
                    <select
                          className="h-12 w-full cursor-pointer appearance-none rounded-xl border-0 bg-zinc-100 px-4 pr-10 text-sm font-medium text-zinc-900 outline-none ring-0 shadow-none transition-all duration-200 hover:bg-zinc-200 focus:border-0 focus:bg-zinc-200 focus:outline-none focus:ring-0 focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                      value={subModel}
                      onChange={(e) => setSubModel(e.target.value)}
                      disabled={!manufacturer || !model}
                    >
                      <option value="">{t("home_quickSearch_selectPlaceholder")}</option>
                      {subModels.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6"/>
                          </svg>
                        </div>
                      </div>
                  </div>
                </div>
              ) : quickTab === "budget" ? (
                  <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
                    {/* Price Range Selectors with scrollable dropdown */}
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">{t("home_quickSearch_priceSelect")}</label>
                      <div className="flex items-center gap-2">
                        <PriceSelect
                          value={minManwon}
                          onChange={(next) => {
                            setMinManwon(next);
                            if (next > maxManwon) setMaxManwon(next);
                          }}
                          options={[
                            { value: 500, label: "5 сая" },
                            { value: 1000, label: "10 сая" },
                            { value: 1500, label: "15 сая" },
                            { value: 2000, label: "20 сая" },
                            { value: 2500, label: "25 сая" },
                            { value: 3000, label: "30 сая" },
                            { value: 3500, label: "35 сая" },
                            { value: 4000, label: "40 сая" },
                            { value: 4500, label: "45 сая" },
                            { value: 5000, label: "50 сая" },
                            { value: 5500, label: "55 сая" },
                            { value: 6000, label: "60 сая" },
                            { value: 6500, label: "65 сая" },
                            { value: 7000, label: "70 сая" },
                            { value: 7500, label: "75 сая" },
                            { value: 8000, label: "80 сая" },
                            { value: 8500, label: "85 сая" },
                            { value: 9000, label: "90 сая" },
                            { value: 9500, label: "95 сая" },
                            { value: 10000, label: "100+ сая" },
                          ]}
                        />

                        <span className="flex h-12 w-8 shrink-0 items-center justify-center text-sm font-medium text-zinc-400">~</span>

                        <PriceSelect
                          value={maxManwon}
                          onChange={(next) => {
                            setMaxManwon(next);
                            if (next < minManwon) setMinManwon(next);
                          }}
                          options={[
                            { value: 500, label: "5 сая" },
                            { value: 1000, label: "10 сая" },
                            { value: 1500, label: "15 сая" },
                            { value: 2000, label: "20 сая" },
                            { value: 2500, label: "25 сая" },
                            { value: 3000, label: "30 сая" },
                            { value: 3500, label: "35 сая" },
                            { value: 4000, label: "40 сая" },
                            { value: 4500, label: "45 сая" },
                            { value: 5000, label: "50 сая" },
                            { value: 5500, label: "55 сая" },
                            { value: 6000, label: "60 сая" },
                            { value: 6500, label: "65 сая" },
                            { value: 7000, label: "70 сая" },
                            { value: 7500, label: "75 сая" },
                            { value: 8000, label: "80 сая" },
                            { value: 8500, label: "85 сая" },
                            { value: 9000, label: "90 сая" },
                            { value: 9500, label: "95 сая" },
                            { value: 10000, label: "100+ сая" },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">{t("home_quickSearch_carTypeSelect")}</label>
                      <div className="relative">
                    <select
                          className="h-12 w-full cursor-pointer appearance-none rounded-xl border-0 bg-zinc-100 px-4 pr-10 text-sm font-medium text-zinc-900 outline-none ring-0 shadow-none transition-all duration-200 hover:bg-zinc-200 focus:border-0 focus:bg-zinc-200 focus:outline-none focus:ring-0 focus:shadow-none"
                      value={carType}
                          onChange={(e) => setCarType(e.target.value as typeof carType)}
                    >
                      <option value="all">{t("carType_all")}</option>
                      <option value="sedan">{t("carType_sedan")}</option>
                      <option value="suv">{t("carType_suv")}</option>
                      <option value="coupe">{t("carType_coupe")}</option>
                      <option value="hatchback">{t("carType_hatchback")}</option>
                      <option value="pickup">{t("carType_pickup")}</option>
                      <option value="van">{t("carType_van")}</option>
                    </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6"/>
                          </svg>
                        </div>
                      </div>
                  </div>
                </div>
              ) : (
                  <div className="flex flex-1 flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">{t("home_quickSearch_keyword")}</label>
                    <div className="relative">
                  <input
                        className="h-12 w-full rounded-xl border-0 bg-zinc-100 px-4 pr-10 text-sm font-medium text-zinc-900 outline-none ring-0 shadow-none transition-all duration-200 placeholder:text-zinc-400 hover:bg-zinc-200 focus:border-0 focus:bg-zinc-200 focus:outline-none focus:ring-0 focus:shadow-none"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder={t("home_quickSearch_keywordInputPlaceholder")}
                  />
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/>
                          <path d="m21 21-4.35-4.35"/>
                        </svg>
                      </div>
                    </div>
                </div>
              )}

              <button
                type="button"
                onClick={onSearch}
                  className="group relative inline-flex h-12 min-w-[140px] items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 px-6 text-base font-bold text-white shadow-lg shadow-rose-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/40 active:scale-[0.98] sm:h-12"
              >
                  <span className="absolute inset-0 bg-gradient-to-r from-rose-700 to-rose-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="relative">{t("home_quickSearch_search")}</span>
                <svg
                  viewBox="0 0 24 24"
                    width={18}
                    height={18}
                  aria-hidden="true"
                    className="relative transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  <path
                    d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                    fill="none"
                    stroke="currentColor"
                      strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3) GOLD */}
      <section className="grid gap-3">
        <HomeTierCarousel
          title={t("home_sections_goldTitle")}
          viewAllHref="/buy/all?tier=gold"
          cars={homeQuery.data?.goldCars ?? []}
          centerTitle={true}
          customSubtitle={t("home_goldSection_subtitle")}
        />
      </section>

      {/* 4) Promo - Middle Banner Advertisement (Diagonal Split) */}
      <section className="w-full">
        <MiddleSplitBanner />
      </section>

      {/* 5) SILVER */}
      <section className="grid gap-3">
        <HomeTierCarousel
          title={t("home_sections_silverTitle")}
          viewAllHref="/buy/all?tier=silver"
          cars={homeQuery.data?.silverCars ?? []}
        />
      </section>

      {/* 6) Media */}
      <section className="grid gap-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{t("nav_media")}</div>
          </div>
          <Link href="/media" className="text-sm font-normal text-zinc-900 hover:underline">
            {t("common_viewAll")}
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(homeQuery.data?.media ?? []).slice(0, 4).map((m) => (
            <Link
              key={m.id}
              href={`/media/${m.id}`}
              className="group relative overflow-hidden rounded-2xl bg-zinc-900 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
              aria-label={m.title}
            >
              {/* Background Image */}
              <div className="relative h-[360px] w-full bg-zinc-800 sm:h-[380px] lg:h-[400px]">
                <Image
                  src={m.coverImage ?? m.thumbnailUrl}
                  alt={m.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/70 transition-opacity duration-300 group-hover:from-black/5 group-hover:via-black/25 group-hover:to-black/60" aria-hidden="true" />
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                {/* Top Section - Title and Subtitle */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                    {m.title}
                  </h3>
                  {m.subtitle && (
                    <p className="text-sm font-normal leading-relaxed text-white/90 sm:text-base">
                      {m.subtitle}
                    </p>
                  )}
                </div>

                {/* Bottom Section - Category and Arrow */}
                <div className="flex items-center justify-between">
                  {m.category && (
                    <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm sm:text-sm">
                      {m.category}
                    </span>
                  )}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-white/20">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7) Car Centers Marquee */}
      <section className="w-full">
        <div className="mx-auto w-full max-w-[1280px] px-4">
          <CarCenterMarquee centers={centersQuery.data ?? []} />
        </div>
      </section>

      {/* 8) Recent general */}
      <section className="grid gap-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{t("home_sections_recentTitle")}</div>
          </div>
          <Link href="/buy/all?tier=general" className="text-sm font-normal text-zinc-900 hover:underline">
            {t("common_viewAll")}
          </Link>
        </div>
        {homeQuery.isLoading ? (
          <div className="text-sm text-zinc-600">{t("common_loading")}</div>
        ) : (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {(homeQuery.data?.recentGeneralCars ?? []).slice(0, 8).map((c) => (
              <CarCard key={c.id} car={c} />
            ))}
          </div>
        )}
      </section>

      {/* 9) App Promo Section */}
      <HomeAppPromoSection />
    </div>
  );
}

function CarCard({ car }: { car: CarListItemDTO }) {
  const cover = car.thumbnailUrl ?? "/samples/cars/car-01.svg";
  return (
    <Link
      href={`/buy/all/${car.id}`}
      className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md hover:bg-zinc-50"
    >
      <div className="relative h-32 w-full bg-zinc-100 sm:h-36">
        <Image src={cover} alt={car.title} fill className="object-cover" />
        {(car.tier === "gold" || car.tier === "silver") && (
          <PremiumTierBadge tier={car.tier} />
        )}
      </div>
      <div className="p-3">
        <div className="truncate text-sm font-normal text-zinc-900">{car.title}</div>
        <div className="mt-1 text-xs text-zinc-600">
          {car.yearMade} • {car.regionLabel} • {car.mileageKm ? formatKm(car.mileageKm) : ""}
        </div>
        {car.createdAt && (
          <div className="mt-1 text-xs text-zinc-500">
            {formatRelativeTimeKo(car.createdAt)}
          </div>
        )}
        <div className="mt-1.5 text-sm font-bold text-zinc-900">{formatMnt(car.priceMnt)}</div>
      </div>
    </Link>
  );
}

function HorizontalSnapSlider({ cars }: { cars: CarListItemDTO[] }) {
  const { t } = useI18n();
  if (!cars.length) return <div className="text-sm text-zinc-600">{t("home_empty")}</div>;
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {cars.slice(0, 6).map((c) => (
        <div key={c.id} className="w-[280px] shrink-0 snap-start">
          <CarCard car={c} />
        </div>
      ))}
    </div>
  );
}



