"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/I18nContext";
import { formatKm, formatMnt } from "@/lib/format";
import { fetchCarTaxonomy, fetchCenters, fetchHomeSections } from "@/lib/mockApi";
import type { CarListItemDTO } from "@/lib/apiTypes";
import { HomeTierCarousel } from "@/components/home/HomeTierCarousel";
import { CarCenterMarquee } from "@/components/home/CarCenterMarquee";

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
  const [budgetOpen, setBudgetOpen] = React.useState(false);
  const [minManwon, setMinManwon] = React.useState(MIN_MANWON);
  const [maxManwon, setMaxManwon] = React.useState(MAX_MANWON);
  const [carType, setCarType] = React.useState<
    "all" | "sedan" | "suv" | "coupe" | "hatchback" | "pickup" | "van"
  >("all");

  // Format 만원 to сая (1 сая = 100 만원 = 1,000,000 MNT)
  const formatSaya = React.useCallback((manwon: number) => {
    const saya = Math.round(manwon / 100);
    return `${saya}сая`;
  }, []);

  const formatRangeText = React.useCallback(() => {
    const minTxt = formatSaya(minManwon);
    const maxTxt = formatSaya(maxManwon);
    return `${minTxt} ~ ${maxTxt}`;
  }, [maxManwon, minManwon, formatSaya]);

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
        title: t("home.title"),
        subtitle: t("home.subtitle"),
        primaryHref: "/buy/all",
        primaryText: t("nav.allVehicles"),
        secondaryHref: "/sell",
        secondaryText: t("nav.sell"),
        bgClass: "bg-zinc-950",
      },
      {
        id: "s2",
        title: t("home.sections.goldTitle"),
        subtitle: t("home.sections.goldDesc"),
        primaryHref: "/buy/all?tier=gold",
        primaryText: t("common.viewAll"),
        secondaryHref: "/buy/all",
        secondaryText: t("nav.allVehicles"),
        bgClass: "bg-zinc-950",
      },
      {
        id: "s3",
        title: t("home.sections.silverTitle"),
        subtitle: t("home.sections.silverDesc"),
        primaryHref: "/buy/all?tier=silver",
        primaryText: t("common.viewAll"),
        secondaryHref: "/sell",
        secondaryText: t("nav.sell"),
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
    <div className="relative grid gap-10">

      {/* 1) Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="relative w-full aspect-[1960/600] max-h-[600px] min-h-[360px] overflow-hidden border-y border-zinc-200 bg-zinc-950 text-white">
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
      </section>

      {/* 2) Quick search */}
      <section className="w-full">
        <div className="mx-auto w-full max-w-[1280px] px-4">
          <div className="relative w-full max-w-full overflow-hidden rounded-[32px] border border-zinc-200 bg-white px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)] sm:px-10 sm:py-6">
            {/* Tabs row */}
            <div className="flex flex-wrap items-center gap-6">
              <button
                type="button"
                onClick={() => (setQuickTab("quick"), setBudgetOpen(false))}
                className={[
                  "relative inline-flex items-center gap-2 text-sm font-normal",
                  quickTab === "quick" ? "text-zinc-900 font-extrabold" : "text-zinc-400",
                ].join(" ")}
              >
                {quickTab === "quick" ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full accent-orange-bg-light accent-orange" style={{ backgroundColor: "var(--accent-orange-light)", color: "var(--accent-orange)" }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                      <path
                        d="M20 6 9 17l-5-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                ) : null}
                <span>{t("home.quickSearch.tab.quick")}</span>
                {quickTab === "quick" ? <span className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: "var(--accent-orange)" }} /> : null}
              </button>

              <button
                type="button"
                onClick={() => setQuickTab("budget")}
                className={[
                  "relative inline-flex items-center gap-2 text-sm font-normal",
                  quickTab === "budget" ? "text-zinc-900 font-extrabold" : "text-zinc-400",
                ].join(" ")}
              >
                {quickTab === "budget" ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full accent-orange-bg-light accent-orange" style={{ backgroundColor: "var(--accent-orange-light)", color: "var(--accent-orange)" }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                      <path
                        d="M20 6 9 17l-5-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                ) : null}
                <span>{t("home.quickSearch.tab.budget")}</span>
                {quickTab === "budget" ? <span className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: "var(--accent-orange)" }} /> : null}
              </button>

              <button
                type="button"
                onClick={() => (setQuickTab("keyword"), setBudgetOpen(false))}
                className={[
                  "relative inline-flex items-center gap-2 text-sm font-normal",
                  quickTab === "keyword" ? "text-zinc-900 font-extrabold" : "text-zinc-400",
                ].join(" ")}
              >
                {quickTab === "keyword" ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full accent-orange-bg-light accent-orange" style={{ backgroundColor: "var(--accent-orange-light)", color: "var(--accent-orange)" }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                      <path
                        d="M20 6 9 17l-5-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                ) : null}
                <span>{t("home.quickSearch.tab.keyword")}</span>
                {quickTab === "keyword" ? <span className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: "var(--accent-orange)" }} /> : null}
              </button>
            </div>

            {/* Inputs row */}
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {quickTab === "quick" ? (
                <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-stretch">
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="text-xs font-normal text-zinc-400">{t("home.quickSearch.manufacturer")}</div>
                    <select
                      className="mt-1 h-10 w-full bg-transparent text-sm font-normal text-zinc-900 outline-none"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                    >
                      <option value="">{t("home.quickSearch.selectPlaceholder")}</option>
                      {(taxonomyQuery.data?.manufacturers ?? []).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="hidden w-px self-center bg-zinc-200 sm:block" />

                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="text-xs font-normal text-zinc-400">{t("home.quickSearch.model")}</div>
                    <select
                      className="mt-1 h-10 w-full bg-transparent text-sm font-normal text-zinc-900 outline-none disabled:opacity-50"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      disabled={!manufacturer}
                    >
                      <option value="">{t("home.quickSearch.selectPlaceholder")}</option>
                      {models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="hidden w-px self-center bg-zinc-200 sm:block" />

                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="text-xs font-normal text-zinc-400">{t("home.quickSearch.subModel")}</div>
                    <select
                      className="mt-1 h-10 w-full bg-transparent text-sm font-normal text-zinc-900 outline-none disabled:opacity-50"
                      value={subModel}
                      onChange={(e) => setSubModel(e.target.value)}
                      disabled={!manufacturer || !model}
                    >
                      <option value="">{t("home.quickSearch.selectPlaceholder")}</option>
                      {subModels.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : quickTab === "budget" ? (
                <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-stretch">
                  <button
                    type="button"
                    onClick={() => setBudgetOpen((v) => !v)}
                    className="flex min-w-0 flex-1 flex-col justify-center text-left"
                  >
                    <div className="text-xs font-normal text-zinc-400">{t("home.quickSearch.priceSelect")}</div>
                    <div className="mt-1 flex h-10 items-center text-sm font-normal text-zinc-900">{formatRangeText()}</div>
                  </button>

                  <div className="hidden w-px self-center bg-zinc-200 sm:block" />

                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="text-xs font-normal text-zinc-400">{t("home.quickSearch.carTypeSelect")}</div>
                    <select
                      className="mt-1 h-10 w-full bg-transparent text-sm font-normal text-zinc-900 outline-none"
                      value={carType}
                      onChange={(e) => setCarType(e.target.value as any)}
                    >
                      <option value="all">{t("carType.all")}</option>
                      <option value="sedan">{t("carType.sedan")}</option>
                      <option value="suv">{t("carType.suv")}</option>
                      <option value="coupe">{t("carType.coupe")}</option>
                      <option value="hatchback">{t("carType.hatchback")}</option>
                      <option value="pickup">{t("carType.pickup")}</option>
                      <option value="van">{t("carType.van")}</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col justify-center">
                  <div className="text-xs font-normal text-zinc-400">{t("home.quickSearch.keyword")}</div>
                  <input
                    className="mt-1 h-10 w-full rounded-full border-0 bg-white px-3 text-sm font-normal text-zinc-900 outline-none ring-0 shadow-none placeholder:text-zinc-400 focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder={t("home.quickSearch.keywordInputPlaceholder")}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={onSearch}
                className="inline-flex h-14 min-w-[120px] items-center justify-center gap-2 rounded-full bg-rose-600 px-6 text-lg font-bold text-white transition-all duration-200 hover:bg-[#e11d48] hover:shadow-[0_8px_20px_rgba(225,29,72,0.35)] active:scale-[0.98] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600/50 focus-visible:ring-offset-2"
              >
                <span>{t("home.quickSearch.search")}</span>
                <svg
                  viewBox="0 0 24 24"
                  width={20}
                  height={20}
                  aria-hidden="true"
                  className="text-white"
                >
                  <path
                    d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Budget panel */}
            {quickTab === "budget" && budgetOpen ? (
              <div className="relative mt-4 w-full max-w-full">
                <div className="relative w-full max-w-full rounded-2xl border border-zinc-200 bg-white px-6 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] sm:px-8">
                  <div className="text-sm font-extrabold text-zinc-900">{t("home.quickSearch.priceSelect")}</div>
                  <button
                    type="button"
                    aria-label="Close"
                    className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                    onClick={() => setBudgetOpen(false)}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <path
                        d="M18 6 6 18M6 6l12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <div className="mt-4 grid gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1">
                        <span className="text-sm font-medium text-zinc-700">{t("home.quickSearch.min")}</span>
                        <span className="text-base font-semibold text-zinc-900">{formatSaya(minManwon)}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1">
                        <span className="text-sm font-medium text-zinc-700">{t("home.quickSearch.max")}</span>
                        <span className="text-base font-semibold text-zinc-900">{formatSaya(maxManwon)}</span>
                      </div>
                    </div>

                    <div className="w-full max-w-full overflow-visible">
                      <div className="group relative w-full max-w-full pt-6 pb-2">
                        {/* Track background with inset highlight */}
                        <div className="absolute left-0 right-0 top-[26px] h-[10px] rounded-full bg-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(0,0,0,0.06)] transition-colors group-hover:bg-zinc-300/80 sm:top-[24px] sm:h-2" />
                        {/* Range (selected area) */}
                        <div
                          className="absolute top-[26px] h-[10px] rounded-full transition-all sm:top-[24px] sm:h-2"
                          style={{
                            left: `${((minManwon - MIN_MANWON) / (MAX_MANWON - MIN_MANWON)) * 100}%`,
                            right: `${100 - ((maxManwon - MIN_MANWON) / (MAX_MANWON - MIN_MANWON)) * 100}%`,
                            backgroundColor: "#16a34a",
                            boxShadow: "0 6px 14px rgba(22,163,74,0.18)",
                          }}
                          aria-hidden="true"
                        />

                        {/* Track click handler */}
                        <div
                          className="absolute inset-x-0 top-[21px] z-0 h-[10px] cursor-pointer sm:top-[20px] sm:h-2"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            const track = e.currentTarget;
                            const rect = track.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const width = rect.width;
                            const ratio = Math.max(0, Math.min(1, x / width));
                            const rawValue = MIN_MANWON + ratio * (MAX_MANWON - MIN_MANWON);
                            const step = 500;
                            const snappedValue = Math.round((rawValue - MIN_MANWON) / step) * step + MIN_MANWON;
                            const clampedValue = Math.max(MIN_MANWON, Math.min(MAX_MANWON, snappedValue));

                            // Determine which thumb is closer
                            const minDistance = Math.abs(clampedValue - minManwon);
                            const maxDistance = Math.abs(clampedValue - maxManwon);

                            if (minDistance <= maxDistance) {
                              // Move min thumb
                              const newMin = Math.max(MIN_MANWON, Math.min(clampedValue, maxManwon));
                              setMinManwon(newMin);
                            } else {
                              // Move max thumb
                              const newMax = Math.max(clampedValue, minManwon);
                              setMaxManwon(Math.min(MAX_MANWON, newMax));
                            }
                          }}
                          aria-hidden="true"
                        />

                        {/* Dual range inputs */}
                        <input
                          type="range"
                          min={MIN_MANWON}
                          max={MAX_MANWON}
                          step={500}
                          value={minManwon}
                          onChange={(e) => {
                            const next = Number(e.target.value);
                            setMinManwon(Math.min(Math.max(MIN_MANWON, next), maxManwon));
                          }}
                          onPointerDown={(e) => {
                            // Allow thumb drag - stop propagation so track handler doesn't interfere
                            e.stopPropagation();
                          }}
                          className="budget-slider-thumb absolute inset-x-0 top-[24px] z-20 h-[10px] w-full appearance-none bg-transparent sm:top-[24px] sm:h-2"
                          aria-label={t("home.quickSearch.min")}
                        />
                        <input
                          type="range"
                          min={MIN_MANWON}
                          max={MAX_MANWON}
                          step={500}
                          value={maxManwon}
                          onChange={(e) => {
                            const next = Number(e.target.value);
                            setMaxManwon(Math.max(Math.min(MAX_MANWON, next), minManwon));
                          }}
                          onPointerDown={(e) => {
                            // Allow thumb drag - stop propagation so track handler doesn't interfere
                            e.stopPropagation();
                          }}
                          className="budget-slider-thumb absolute inset-x-0 top-[24px] z-20 h-[10px] w-full appearance-none bg-transparent sm:top-[24px] sm:h-2"
                          aria-label={t("home.quickSearch.max")}
                        />
                      </div>
                    </div>

                    {/* Tick marks + labels */}
                    <div className="mt-3">
                      <div className="relative h-3 w-full px-2">
                        {(() => {
                          const ticks = [
                            { value: 500, saya: 5 },
                            { value: 1000, saya: 10 },
                            { value: 1500, saya: 15 },
                            { value: 2000, saya: 20 },
                            { value: 2500, saya: 25 },
                            { value: 3000, saya: 30 },
                            { value: 3500, saya: 35 },
                            { value: 4000, saya: 40 },
                            { value: 4500, saya: 45 },
                            { value: 5000, saya: 50 },
                            { value: 5500, saya: 55 },
                            { value: 6000, saya: 60 },
                            { value: 6500, saya: 65 },
                            { value: 7000, saya: 70 },
                            { value: 7500, saya: 75 },
                            { value: 8000, saya: 80 },
                            { value: 8500, saya: 85 },
                            { value: 9000, saya: 90 },
                            { value: 9500, saya: 95 },
                            { value: 10000, saya: 100, isPlus: true },
                          ] as const;
                          return ticks.map((tick) => {
                            const percent = ((tick.value - MIN_MANWON) / (MAX_MANWON - MIN_MANWON)) * 100;
                            const isFirst = tick.value === MIN_MANWON;
                            const isLast = tick.value === MAX_MANWON;
                            const transform = isFirst ? "translateX(0)" : isLast ? "translateX(-100%)" : "translateX(-50%)";
                            return (
                              <div
                                key={tick.value}
                                className={`absolute top-0 w-px ${
                                  tick.saya % 10 === 0 ? "h-[10px] bg-zinc-400" : "h-2 bg-zinc-300"
                                }`}
                                style={{ left: `${percent}%`, transform }}
                                aria-hidden="true"
                              />
                            );
                          });
                        })()}
                      </div>
                      <div className="relative mt-1 h-4 w-full px-2">
                        {(() => {
                          const ticks: Array<{ value: number; saya: number; isPlus?: boolean }> = [
                            { value: 500, saya: 5 },
                            { value: 1000, saya: 10 },
                            { value: 1500, saya: 15 },
                            { value: 2000, saya: 20 },
                            { value: 2500, saya: 25 },
                            { value: 3000, saya: 30 },
                            { value: 3500, saya: 35 },
                            { value: 4000, saya: 40 },
                            { value: 4500, saya: 45 },
                            { value: 5000, saya: 50 },
                            { value: 5500, saya: 55 },
                            { value: 6000, saya: 60 },
                            { value: 6500, saya: 65 },
                            { value: 7000, saya: 70 },
                            { value: 7500, saya: 75 },
                            { value: 8000, saya: 80 },
                            { value: 8500, saya: 85 },
                            { value: 9000, saya: 90 },
                            { value: 9500, saya: 95 },
                            { value: 10000, saya: 100, isPlus: true },
                          ];
                          return ticks.map((tick) => {
                            const percent = ((tick.value - MIN_MANWON) / (MAX_MANWON - MIN_MANWON)) * 100;
                            const isFirst = tick.value === MIN_MANWON;
                            const isLast = tick.value === MAX_MANWON;
                            const transform = isFirst ? "translateX(0)" : isLast ? "translateX(-100%)" : "translateX(-50%)";
                            // Hide labels for: 5, 15, 25, 35, 45, 55, 65, 75, 85, 95
                            const shouldHide = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95].includes(tick.saya);
                            const label = shouldHide ? "" : tick.isPlus ? `${tick.saya}+` : `${tick.saya}`;
                            return (
                              <div
                                key={tick.value}
                                className="absolute top-0 whitespace-nowrap text-xs font-normal text-zinc-500"
                                style={{ left: `${percent}%`, transform }}
                              >
                                {label}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* 3) GOLD */}
      <section className="grid gap-3">
        <HomeTierCarousel
          title={t("home.sections.goldTitle")}
          viewAllHref="/buy/all?tier=gold"
          cars={homeQuery.data?.goldCars ?? []}
          centerTitle={true}
          customSubtitle={t("home.goldSection.subtitle")}
        />
      </section>

      {/* 4) Promo - Middle Banner Advertisement */}
      <section className="relative w-full overflow-hidden rounded-3xl border border-zinc-200">
        <div className="relative w-full aspect-[16/3] min-h-[100px] max-h-[150px] overflow-hidden">
          <Image
            src="/banner/banner-5.png"
            alt="Advertisement"
            fill
            className="object-cover object-center"
            priority={false}
          />
        </div>
      </section>

      {/* 5) SILVER */}
      <section className="grid gap-3">
        <HomeTierCarousel
          title={t("home.sections.silverTitle")}
          viewAllHref="/buy/all?tier=silver"
          cars={homeQuery.data?.silverCars ?? []}
        />
      </section>

      {/* 6) Media */}
      <section className="grid gap-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{t("nav.media")}</div>
          </div>
          <Link href="/media" className="text-sm font-normal text-zinc-900 hover:underline">
            {t("common.viewAll")}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(homeQuery.data?.media ?? []).slice(0, 2).map((m) => (
            <div key={m.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <div className="relative h-40 w-full bg-zinc-100">
                <Image src={m.thumbnailUrl} alt={m.title} fill className="object-cover" />
              </div>
              <div className="p-4">
                <div className="text-xs font-normal text-zinc-600">{m.type.toUpperCase()}</div>
                <div className="mt-1 text-base font-normal">{m.title}</div>
                <div className="mt-1 text-sm text-zinc-600">{m.excerpt}</div>
              </div>
            </div>
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
            <div className="text-2xl font-bold">{t("home.sections.recentTitle")}</div>
          </div>
          <Link href="/buy/all?tier=general" className="text-sm font-normal text-zinc-900 hover:underline">
            {t("common.viewAll")}
          </Link>
        </div>
        {homeQuery.isLoading ? (
          <div className="text-sm text-zinc-600">{t("common.loading")}</div>
        ) : (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {(homeQuery.data?.recentGeneralCars ?? []).slice(0, 8).map((c) => (
              <CarCard key={c.id} car={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CarCard({ car }: { car: CarListItemDTO }) {
  const cover = car.thumbnailUrl ?? "/samples/cars/car-01.svg";
  return (
    <Link
      href={`/buy/all/${car.id}`}
      className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md hover:bg-zinc-50"
    >
      <div className="relative h-32 w-full bg-zinc-100 sm:h-36">
        <Image src={cover} alt={car.title} fill className="object-cover" />
      </div>
      <div className="p-3">
        <div className="truncate text-sm font-normal text-zinc-900">{car.title}</div>
        <div className="mt-1 text-xs text-zinc-600">
          {car.yearMade} • {car.regionLabel} • {car.mileageKm ? formatKm(car.mileageKm) : ""}
        </div>
        <div className="mt-1.5 text-sm font-bold text-zinc-900">{formatMnt(car.priceMnt)}</div>
      </div>
    </Link>
  );
}

function HorizontalSnapSlider({ cars }: { cars: CarListItemDTO[] }) {
  const { t } = useI18n();
  if (!cars.length) return <div className="text-sm text-zinc-600">{t("home.empty")}</div>;
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



