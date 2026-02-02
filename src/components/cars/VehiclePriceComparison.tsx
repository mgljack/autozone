"use client";

import React from "react";
import { formatMnt } from "@/lib/format";
import { useI18n } from "@/context/I18nContext";

interface VehiclePriceComparisonProps {
  sellingPrice: number;
  newCarPrice?: number;
  recentImportPrice?: number;
}

type ComparisonMode = "NEW" | "IMPORT";

export function VehiclePriceComparison({
  sellingPrice,
  newCarPrice,
  recentImportPrice,
}: VehiclePriceComparisonProps) {
  const { t } = useI18n();
  const [mode, setMode] = React.useState<ComparisonMode>("NEW");
  const [isAnimating, setIsAnimating] = React.useState(false);
  
  // TODO: Replace with actual data from API/DB
  // For now, use mock values if not provided
  const computedNewCarPrice = newCarPrice ?? Math.round(sellingPrice * 1.3);
  const computedRecentImportPrice = recentImportPrice ?? Math.round(sellingPrice * 1.15);

  const referencePrice = mode === "NEW" ? computedNewCarPrice : computedRecentImportPrice;
  const savingsAmount = Math.max(0, referencePrice - sellingPrice);
  const savingsRate = referencePrice > 0 ? Math.round((savingsAmount / referencePrice) * 100) : 0;

  // Calculate position for car icon on the bar (0-100%)
  // The bar represents from 0 to referencePrice, so sellingPrice position is relative to referencePrice
  // Icon stops at salePosition (not at 100%)
  const salePosition = referencePrice > 0 ? Math.min(Math.max((sellingPrice / referencePrice) * 100, 0), 100) : 0;

  // Check for reduced motion preference
  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Animated values - initialize with referencePrice
  const [animatedReferencePrice, setAnimatedReferencePrice] = React.useState(referencePrice);
  const [animatedSellingPrice, setAnimatedSellingPrice] = React.useState(referencePrice);
  const [animatedSavingsRate, setAnimatedSavingsRate] = React.useState(100);
  const [animatedSavingsAmount, setAnimatedSavingsAmount] = React.useState(0);
  const [animatedIconPosition, setAnimatedIconPosition] = React.useState(0); // Start at left (0%)
  const [animatedProgress, setAnimatedProgress] = React.useState(0); // Progress 0-1 for filled bar
  const [animatedCountdownPrice, setAnimatedCountdownPrice] = React.useState(referencePrice); // Price counting down from reference to 0

  // Use ref to store rafId for cleanup
  const rafIdRef = React.useRef<number | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Animation effect when component mounts or mode changes
  React.useEffect(() => {
    // Immediately set initial values
    setAnimatedReferencePrice(referencePrice);
    setAnimatedSellingPrice(referencePrice);
    setAnimatedSavingsRate(100);
    setAnimatedSavingsAmount(0);
    setAnimatedIconPosition(0); // Start at left
    setAnimatedProgress(0); // Start with no progress
    setAnimatedCountdownPrice(referencePrice); // Start with reference price
    
    // If reduced motion, skip animation and show final state
    if (prefersReducedMotion) {
      setAnimatedSellingPrice(sellingPrice);
      setAnimatedSavingsRate(savingsRate);
      setAnimatedSavingsAmount(savingsAmount);
      setAnimatedIconPosition(salePosition); // End at sale position
      setAnimatedProgress(salePosition / 100); // Progress to sale position
      setAnimatedCountdownPrice(sellingPrice); // End at selling price
      return;
    }
    
    setIsAnimating(true);

    // Start animation after a brief delay
    timerRef.current = setTimeout(() => {
      const duration = 1000; // 1 second
      const steps = 60; // 60 frames
      const stepDuration = duration / steps;
      let currentStep = 0;

      const animate = () => {
        if (currentStep >= steps) {
          // Ensure final values are exactly correct
          setAnimatedSellingPrice(sellingPrice);
          setAnimatedSavingsRate(savingsRate);
          setAnimatedSavingsAmount(savingsAmount);
          setAnimatedIconPosition(salePosition);
          setAnimatedProgress(salePosition / 100);
          setAnimatedCountdownPrice(sellingPrice);
          setIsAnimating(false);
          rafIdRef.current = null;
          return;
        }

        const progress = currentStep / steps;
        // Ease-out cubic function for smooth animation
        const eased = 1 - Math.pow(1 - progress, 3);

        // Animate reference price (stays constant)
        setAnimatedReferencePrice(referencePrice);

        // Animate selling price from referencePrice DOWN to actual sellingPrice
        const currentSellingPrice = referencePrice - (referencePrice - sellingPrice) * eased;
        setAnimatedSellingPrice(Math.round(currentSellingPrice));

        // Animate savings rate from 100% DOWN to actual rate
        setAnimatedSavingsRate(100 - (100 - savingsRate) * eased);

        // Animate savings amount from 0 UP to actual amount
        setAnimatedSavingsAmount(savingsAmount * eased);

        // Animate icon position from 0% (left, reference price) to salePosition% (selling price)
        setAnimatedIconPosition(eased * salePosition);

        // Animate progress bar: filled area increases from 0% to salePosition%
        // filled width = progress * salePosition%
        setAnimatedProgress(eased * (salePosition / 100));

        // Animate countdown price from referencePrice DOWN to sellingPrice
        const currentCountdownPrice = referencePrice - (referencePrice - sellingPrice) * eased;
        setAnimatedCountdownPrice(Math.round(currentCountdownPrice));

        currentStep++;
        rafIdRef.current = requestAnimationFrame(() => {
          setTimeout(animate, stepDuration);
        });
      };

      animate();
    }, 50);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [mode, referencePrice, sellingPrice, savingsAmount, savingsRate, salePosition, prefersReducedMotion]);

  const modeTitle = mode === "NEW" ? t("priceComparison_newCar_title") : t("priceComparison_import_title");
  const modeSubtitle = t("priceComparison_basedOn");
  const referenceLabel = mode === "NEW" ? t("priceComparison_newCarPrice") : t("priceComparison_importPrice");

  return (
    <div
      className="rounded-[20px] border border-zinc-200/50 p-8 shadow-[0_12px_30px_rgba(0,0,0,0.06)]"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8f9fb 100%)",
        marginTop: "calc(var(--spacing) * 6)",
        marginBottom: "calc(var(--spacing) * 6)",
      }}
    >
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-zinc-900 leading-tight">{modeTitle}</h2>
          <p className="mt-2 text-sm text-zinc-600">{modeSubtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 to-emerald-500/10 px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700">{t("priceComparison_badge")}</span>
        </div>
      </div>

      {/* Mode Switch */}
      <div className="mb-8" role="tablist">
        <div className="inline-flex gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "NEW"}
            onClick={() => setMode("NEW")}
            className={[
              "rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200",
              mode === "NEW"
                ? "bg-white text-zinc-900 shadow-md"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50/50",
            ].join(" ")}
          >
            {t("priceComparison_tab_newCar")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "IMPORT"}
            onClick={() => setMode("IMPORT")}
            className={[
              "rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200",
              mode === "IMPORT"
                ? "bg-white text-zinc-900 shadow-md"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50/50",
            ].join(" ")}
          >
            {t("priceComparison_tab_import")}
          </button>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="mb-8">
        <div className="relative h-14 w-full rounded-full overflow-visible">
          {/* Full bar background */}
          <div
            className="absolute rounded-full bg-zinc-100"
            style={{
              top: "calc((56px - 12px) / 2)",
              bottom: "calc((56px - 12px) / 2)",
              left: 0,
              right: 0,
              height: "12px",
            }}
          />
          
          {/* Active range (Base → Sale) - filled area */}
          <div
            className="absolute rounded-full transition-all duration-300 ease-out"
            style={{
              top: "calc((56px - 12px) / 2)",
              bottom: "calc((56px - 12px) / 2)",
              left: 0,
              width: `${animatedProgress * 100}%`,
              height: "12px",
              background: "linear-gradient(90deg, #b70f28 0%, #dc2626 50%, #ef4444 100%)",
            }}
          />
          
          {/* Vehicle icon - moves from left (0%) to salePosition% */}
          <div
            className="absolute top-1/2 z-10 transition-all duration-75 ease-out"
            style={{
              left: `${Math.min(Math.max(animatedIconPosition, 0), 100)}%`,
              transform: "translateX(-50%) translateY(-50%)",
            }}
          >
            <div
              className="h-6 w-6 rounded-full bg-white"
              style={{
                boxShadow: "0 0 12px rgba(59,130,246,0.35), 0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
          </div>

          {/* Price labels */}
          <div className="absolute -top-6 left-0 text-xs font-medium text-zinc-700">
            {formatMnt(Math.round(animatedReferencePrice))}
          </div>
          <div
            className="absolute -top-6 z-20 transition-all duration-75 ease-out"
            style={{
              left: `${Math.min(Math.max(animatedIconPosition, 0), 100)}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white shadow-lg whitespace-nowrap">
              {t("priceComparison_label_salePrice")} {formatMnt(sellingPrice)}
            </div>
          </div>
        </div>
      </div>

      {/* Metric Row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <MetricCard
          label={referenceLabel}
          value={formatMnt(Math.round(animatedReferencePrice))}
        />
        <MetricCard
          label={t("priceComparison_salePrice")}
          value={formatMnt(sellingPrice)}
        />
        <MetricCard
          label={t("priceComparison_savingRate")}
          value={`${Math.round(animatedSavingsRate)}%`}
          isSavingsRate
        />
        <MetricCard
          label={t("priceComparison_savedAmount")}
          value={formatMnt(Math.round(animatedSavingsAmount))}
        />
      </div>

      {/* Helper Text */}
      <div className="mt-6 rounded-xl bg-zinc-50/50 p-4 text-xs leading-relaxed text-zinc-600">
        {mode === "NEW" ? (
          <>
            {t("priceComparison_helper_newCar")}
            <br />
            {t("priceComparison_helper_newCar2")}
          </>
        ) : (
          <>{t("priceComparison_helper_import")}</>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, isSavingsRate }: { label: string; value: string; isSavingsRate?: boolean }) {
  return (
    <div className="rounded-[14px] bg-white p-5 text-center shadow-sm">
      <div className="text-xs font-medium text-zinc-600">{label}</div>
      <div className={`mt-2 text-[28px] font-semibold leading-tight ${isSavingsRate ? "text-[#16a34a]" : "text-zinc-900"}`}>
        {value}
      </div>
    </div>
  );
}

