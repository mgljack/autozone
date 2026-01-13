"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/I18nContext";
import { useFavorites } from "@/features/favorites/favorites";
import { useRecentCars } from "@/features/recent/recent";
import { formatMnt } from "@/lib/format";
import { fetchCarTaxonomy, fetchHomeSections } from "@/lib/mockApi";
import type { Car } from "@/mock/cars";
import { carTitle, cars as allCars } from "@/mock/cars";
import type { CarListItemDTO } from "@/lib/apiTypes";
import { HomeTierCarousel } from "@/components/home/HomeTierCarousel";

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

  const [manufacturer, setManufacturer] = React.useState("");
  const [model, setModel] = React.useState("");
  const [subModel, setSubModel] = React.useState("");
  const [keyword, setKeyword] = React.useState("");

  type QuickSearchTab = "quick" | "budget" | "keyword";
  const [quickTab, setQuickTab] = React.useState<QuickSearchTab>("quick");

  // Budget tab state (만원)
  const MAX_MANWON = 10000; // "무제한" 느낌
  const [budgetOpen, setBudgetOpen] = React.useState(false);
  const [minManwon, setMinManwon] = React.useState(0);
  const [maxManwon, setMaxManwon] = React.useState(MAX_MANWON);
  const [carType, setCarType] = React.useState<
    "all" | "sedan" | "suv" | "coupe" | "hatchback" | "pickup" | "van"
  >("all");

  const formatComma = (n: number) => n.toLocaleString("ko-KR");
  const formatRangeText = React.useCallback(() => {
    const minTxt = `${formatComma(minManwon)}만원`;
    const maxTxt = maxManwon >= MAX_MANWON ? "무제한" : `${formatComma(maxManwon)}만원`;
    return `${minTxt} ~ ${maxTxt}`;
  }, [MAX_MANWON, maxManwon, minManwon]);

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
      const minMnt = Math.max(0, Math.floor(minManwon)) * 10000;
      const maxMnt =
        maxManwon >= MAX_MANWON ? null : Math.max(0, Math.floor(maxManwon)) * 10000;
      if (minMnt > 0) sp.set("priceMinMnt", String(minMnt));
      if (maxMnt && maxMnt > 0) sp.set("priceMaxMnt", String(maxMnt));
      if (carType !== "all") sp.set("carType", carType);
    }
    router.push(`/buy/all?${sp.toString()}`);
  };

  const bannerImages = React.useMemo(
    () => ["/banner/banner-1.jpg", "/banner/banner-2.jpg", "/banner/banner-3.jpg"],
    [],
  );

  const bannerSlides = React.useMemo(
    () => [
      {
        id: "s1",
        badge: t("app.prototype"),
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
        badge: t("app.prototype"),
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
        badge: t("app.prototype"),
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
    <div className="relative min-h-screen" style={{ background: 'radial-gradient(circle at top center, #FFF7EB 0%, #FFF3E0 40%, #FFFFFF 100%)' }}>
      <div className="relative grid gap-10">
        <HomeLeftFloatingMenu />

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
                  <div className="relative mx-auto flex h-full w-full max-w-5xl items-center px-4">
                    <div className="grid gap-3 py-10">
                      <div className="text-sm font-normal text-white/80">{s.badge}</div>
                      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{s.title}</h1>
                      <p className="max-w-xl text-white/80">{s.subtitle}</p>
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
        <div className="mx-auto w-full max-w-6xl px-4">
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
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-50 text-orange-600">
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
                <span>쉽고 빠른 검색</span>
                {quickTab === "quick" ? <span className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-orange-500" /> : null}
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
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-50 text-orange-600">
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
                <span>예산으로 검색</span>
                {quickTab === "budget" ? <span className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-orange-500" /> : null}
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
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-50 text-orange-600">
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
                <span>검색어로 검색</span>
                {quickTab === "keyword" ? <span className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-orange-500" /> : null}
              </button>
            </div>

            {/* Inputs row */}
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {quickTab === "quick" ? (
                <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-stretch">
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="text-xs font-normal text-zinc-400">제조사</div>
                    <select
                      className="mt-1 h-10 w-full bg-transparent text-sm font-normal text-zinc-900 outline-none"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                    >
                      <option value="">선택하세요.</option>
                      {(taxonomyQuery.data?.manufacturers ?? []).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="hidden w-px self-center bg-zinc-200 sm:block" />

                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="text-xs font-normal text-zinc-400">모델</div>
                    <select
                      className="mt-1 h-10 w-full bg-transparent text-sm font-normal text-zinc-900 outline-none disabled:opacity-50"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      disabled={!manufacturer}
                    >
                      <option value="">선택하세요.</option>
                      {models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="hidden w-px self-center bg-zinc-200 sm:block" />

                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="text-xs font-normal text-zinc-400">세부모델</div>
                    <select
                      className="mt-1 h-10 w-full bg-transparent text-sm font-normal text-zinc-900 outline-none disabled:opacity-50"
                      value={subModel}
                      onChange={(e) => setSubModel(e.target.value)}
                      disabled={!manufacturer || !model}
                    >
                      <option value="">선택하세요.</option>
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
                    <div className="text-xs font-normal text-zinc-400">가격 선택</div>
                    <div className="mt-1 flex h-10 items-center text-sm font-normal text-zinc-900">{formatRangeText()}</div>
                  </button>

                  <div className="hidden w-px self-center bg-zinc-200 sm:block" />

                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="text-xs font-normal text-zinc-400">차종 선택</div>
                    <select
                      className="mt-1 h-10 w-full bg-transparent text-sm font-normal text-zinc-900 outline-none"
                      value={carType}
                      onChange={(e) => setCarType(e.target.value as any)}
                    >
                      <option value="all">전체</option>
                      <option value="sedan">세단</option>
                      <option value="suv">SUV</option>
                      <option value="coupe">쿠페</option>
                      <option value="hatchback">해치백</option>
                      <option value="pickup">픽업</option>
                      <option value="van">밴</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col justify-center">
                  <div className="text-xs font-normal text-zinc-400">검색어</div>
                  <input
                    className="mt-1 h-10 w-full rounded-full border-0 bg-white px-3 text-sm font-normal text-zinc-900 outline-none ring-0 shadow-none placeholder:text-zinc-400 focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="검색어를 입력하세요."
                  />
                </div>
              )}

              <button
                type="button"
                onClick={onSearch}
                className="inline-flex h-14 min-w-[120px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7B2EFF] to-[#4F6BFF] px-6 text-lg font-bold text-white transition hover:brightness-105 active:brightness-95"
              >
                <span>검색</span>
                <svg
                  viewBox="0 0 24 24"
                  width={20}
                  height={20}
                  aria-hidden="true"
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
                <div className="relative w-full max-w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-6 py-6 shadow-md sm:px-8">
                  <div className="text-sm font-extrabold text-zinc-900">가격 선택</div>
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
                    <div className="flex items-center justify-between text-sm font-normal text-zinc-700">
                      <div>
                        최소 <span className="font-extrabold text-zinc-900">{formatComma(minManwon)}만원</span>
                      </div>
                      <div>
                        최대{" "}
                        <span className="font-extrabold text-zinc-900">
                          {maxManwon >= MAX_MANWON ? "무제한" : `${formatComma(maxManwon)}만원`}
                        </span>
                      </div>
                    </div>

                    <div className="w-full max-w-full overflow-hidden">
                      <div className="relative w-full max-w-full px-2 pt-4">
                        <div className="h-2 w-full rounded-full bg-zinc-200" />
                        <div
                          className="absolute top-4 h-2 rounded-full bg-purple-500"
                          style={{
                            left: `calc(${(minManwon / MAX_MANWON) * 100}% + 8px)`,
                            right: `calc(${100 - (maxManwon / MAX_MANWON) * 100}% + 8px)`,
                          }}
                          aria-hidden="true"
                        />

                        {/* Dual range inputs */}
                        <input
                          type="range"
                          min={0}
                          max={MAX_MANWON}
                          step={100}
                          value={minManwon}
                          onChange={(e) => {
                            const next = Number(e.target.value);
                            setMinManwon(Math.min(next, maxManwon));
                          }}
                          className="absolute inset-x-2 top-3 h-8 w-[calc(100%-16px)] appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:shadow"
                          aria-label="Minimum price"
                        />
                        <input
                          type="range"
                          min={0}
                          max={MAX_MANWON}
                          step={100}
                          value={maxManwon}
                          onChange={(e) => {
                            const next = Number(e.target.value);
                            setMaxManwon(Math.max(next, minManwon));
                          }}
                          className="absolute inset-x-2 top-3 h-8 w-[calc(100%-16px)] appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:shadow"
                          aria-label="Maximum price"
                        />
                      </div>
                    </div>

                    {/* Tick marks + labels */}
                    <div className="mt-2">
                      <div className="h-3 w-full opacity-50 [background-image:repeating-linear-gradient(to_right,rgba(0,0,0,0.20)_0,rgba(0,0,0,0.20)_1px,transparent_1px,transparent_10%)]" />
                      <div className="mt-2 flex items-center justify-between text-xs font-normal text-zinc-500">
                        <span>0</span>
                        <span>2,000</span>
                        <span>4,000</span>
                        <span>6,000</span>
                        <span>8,000</span>
                        <span>무제한</span>
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
          subtitle={t("home.sections.goldDesc")}
          viewAllHref="/buy/all?tier=gold"
          cars={homeQuery.data?.goldCars ?? []}
        />
      </section>

      {/* 4) Promo */}
      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-r from-emerald-50 to-indigo-50 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-normal">{t("home.sections.promoTitle")}</div>
            <div className="text-sm text-zinc-600">{t("home.sections.promoDesc")}</div>
          </div>
          <Link href="/sell">
            <Button variant="outline">{t("home.sections.sellCta")}</Button>
          </Link>
        </div>
      </section>

      {/* 5) SILVER */}
      <section className="grid gap-3">
        <HomeTierCarousel
          title={t("home.sections.silverTitle")}
          subtitle={t("home.sections.silverDesc")}
          viewAllHref="/buy/all?tier=silver"
          cars={homeQuery.data?.silverCars ?? []}
        />
      </section>

      {/* 6) Media */}
      <section className="grid gap-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-lg font-normal">{t("nav.media")}</div>
            <div className="text-sm text-zinc-600">{t("home.media.desc")}</div>
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

      {/* 7) Recent general */}
      <section className="grid gap-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-lg font-normal">{t("home.sections.recentTitle")}</div>
            <div className="text-sm text-zinc-600">{t("home.sections.recentDesc")}</div>
          </div>
          <Link href="/buy/all?tier=general" className="text-sm font-normal text-zinc-900 hover:underline">
            {t("common.viewAll")}
          </Link>
        </div>
        {homeQuery.isLoading ? (
          <div className="text-sm text-zinc-600">{t("common.loading")}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(homeQuery.data?.recentGeneralCars ?? []).map((c) => (
              <CarCard key={c.id} car={c} />
            ))}
          </div>
        )}
      </section>

      {/* 8) Bottom promo banner (prototype) */}
      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-r from-emerald-50 to-indigo-50 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-normal">{t("home.sections.promoTitle")}</div>
            <div className="text-sm text-zinc-600">{t("home.sections.promoDesc")}</div>
          </div>
          <Link href="/sell">
            <Button variant="outline">{t("home.sections.sellCta")}</Button>
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
}

function CarCard({ car }: { car: CarListItemDTO }) {
  const cover = car.thumbnailUrl ?? "/samples/cars/car-01.svg";
  return (
    <Link
      href={`/buy/all/${car.id}`}
      className="overflow-hidden rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50"
    >
      <div className="relative h-40 w-full bg-zinc-100">
        <Image src={cover} alt={car.title} fill className="object-cover" />
      </div>
      <div className="p-4">
        <div className="truncate text-base font-normal">{car.title}</div>
        <div className="mt-1 text-sm text-zinc-600">
          {car.yearMade} • {car.regionLabel} • {car.mileageKm.toLocaleString("mn-MN")}km
        </div>
        <div className="mt-2 text-base font-normal">{formatMnt(car.priceMnt)}</div>
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

function HomeLeftFloatingMenu() {
  const { t } = useI18n();
  const { recent, clearRecent } = useRecentCars();
  const { favoriteIds } = useFavorites();
  const [panel, setPanel] = React.useState<"recent" | "favorites" | null>(null);
  const [showTop, setShowTop] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const read = () => {
      if (typeof window === "undefined") return 0;
      const raw = window.localStorage.getItem("unreadCount");
      const n = raw ? Number(raw) : 0;
      return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    };
    setUnreadCount(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "unreadCount") setUnreadCount(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const recentCars = recent
    .map((r) => allCars.find((c) => c.id === r.id))
    .filter(Boolean) as Car[];
  const favoriteCars = favoriteIds.map((id) => allCars.find((c) => c.id === id)).filter(Boolean) as Car[];

  const items = panel === "recent" ? recentCars : panel === "favorites" ? favoriteCars : [];

  return (
    <div className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 md:block">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
        <div className="grid w-20">
          <button
            type="button"
            className="group relative grid place-items-center gap-1 px-2 py-3 text-center hover:bg-zinc-50"
            onClick={() => setPanel((p) => (p === "recent" ? null : "recent"))}
          >
            <CarIcon className="h-6 w-6 text-zinc-700 transition-colors group-hover:text-zinc-900" />
            <div className="text-[11px] font-normal text-zinc-700">{t("home.left.recent")}</div>
          </button>
          <div className="mx-3 h-px bg-zinc-100" />
          <button
            type="button"
            className="group relative grid place-items-center gap-1 px-2 py-3 text-center hover:bg-zinc-50"
            onClick={() => setPanel((p) => (p === "favorites" ? null : "favorites"))}
          >
            <div className="relative">
              <HeartIcon className="h-6 w-6 text-zinc-700 transition-colors group-hover:text-zinc-900" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold leading-none text-white">
                  {Math.min(unreadCount, 99)}
                </span>
              ) : null}
            </div>
            <div className="text-[11px] font-normal text-zinc-700">{t("home.left.favorites")}</div>
          </button>
          {showTop ? (
            <>
              <div className="mx-3 h-px bg-zinc-100" />
              <button
                type="button"
                className="group grid place-items-center gap-1 px-2 py-3 text-center hover:bg-zinc-50"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <TopIcon className="h-6 w-6 text-zinc-700 transition-colors group-hover:text-zinc-900" />
                <div className="text-[11px] font-normal text-zinc-700">{t("home.left.top")}</div>
              </button>
            </>
          ) : null}
        </div>
      </div>

      {panel ? (
        <div className="absolute right-full top-1/2 mr-3 w-80 -translate-y-1/2 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <div className="text-sm font-normal text-zinc-900">
              {panel === "recent" ? t("home.left.recent") : t("home.left.favorites")}
            </div>
            {panel === "recent" ? (
              <button
                type="button"
                className="text-xs font-normal text-zinc-700 hover:underline"
                onClick={clearRecent}
              >
                {t("home.left.clear")}
              </button>
            ) : null}
          </div>
          <div className="max-h-96 overflow-auto p-2">
            {items.length ? (
              <div className="grid gap-2">
                {items.slice(0, 10).map((c) => (
                  <Link
                    key={c.id}
                    href={`/buy/all/${c.id}`}
                    className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-2 hover:bg-zinc-50"
                  >
                    <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-zinc-100">
                      <Image src={c.images?.[0] ?? "/samples/cars/car-01.svg"} alt="" fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-normal">{carTitle(c)}</div>
                      <div className="text-xs text-zinc-600">{formatMnt(c.priceMnt)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-sm text-zinc-600">{t("home.left.none")}</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 13.5V11a2 2 0 0 1 2-2h.8l1.3-3.2A2 2 0 0 1 9 4.5h6a2 2 0 0 1 1.9 1.3L18.2 9H19a2 2 0 0 1 2 2v2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 13.5h13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 4l6 6M12 4 6 10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 4v16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


