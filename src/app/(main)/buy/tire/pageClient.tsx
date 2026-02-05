"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { CardSkeleton } from "@/components/common/CardSkeleton";
import { CustomSelect } from "@/components/common/CustomSelect";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SectionTitle } from "@/components/common/SectionTitle";
import { TireCard } from "@/components/tires/TireCard";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/context/I18nContext";
import { SortPills } from "@/components/listings/SortPills";
import { fetchTiresList, type TiresListQuery } from "@/lib/mockApi";
import type { TireListItemDTO } from "@/lib/apiTypes";
import { formatMnt } from "@/lib/format";
import { tires } from "@/mock/cars";

function firstString(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function parseArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return v.split(",").filter(Boolean);
}

export function TirePageClient({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const { t } = useI18n();
  const router = useRouter();

  const [page, setPage] = React.useState<number>(() => Number(firstString(searchParams.page)) || 1);
  const [sort, setSort] = React.useState<"newest" | "priceAsc" | "priceDesc">(
    () => (firstString(searchParams.sort) as any) || "newest",
  );

  // Tire-specific filters
  const [sizes, setSizes] = React.useState<string[]>(() => parseArray(searchParams.sizes));
  const [seasons, setSeasons] = React.useState<string[]>(() => parseArray(searchParams.seasons));
  const [dotYearMin, setDotYearMin] = React.useState(firstString(searchParams.dotYearMin) ?? "");
  const [dotYearMax, setDotYearMax] = React.useState(firstString(searchParams.dotYearMax) ?? "");
  const [brands, setBrands] = React.useState<string[]>(() => parseArray(searchParams.brands));
  const [brandSearch, setBrandSearch] = React.useState("");
  const [installationIncluded, setInstallationIncluded] = React.useState<string>(
    () => firstString(searchParams.installationIncluded) ?? "all",
  );
  const [regionGroup, setRegionGroup] = React.useState(firstString(searchParams.region) ?? "");
  const [sellerId, setSellerId] = React.useState<string | null>(firstString(searchParams.sellerId) || null);

  React.useEffect(() => setPage(1), [sort, sizes, seasons, dotYearMin, dotYearMax, brands, installationIncluded, regionGroup, sellerId]);

  // Keep filters/sort in URL
  React.useEffect(() => {
    const sp = new URLSearchParams();
    if (page > 1) sp.set("page", String(page));
    if (sort !== "newest") sp.set("sort", sort);
    if (sizes.length > 0) sp.set("sizes", sizes.join(","));
    if (seasons.length > 0) sp.set("seasons", seasons.join(","));
    if (dotYearMin) sp.set("dotYearMin", dotYearMin);
    if (dotYearMax) sp.set("dotYearMax", dotYearMax);
    if (brands.length > 0) sp.set("brands", brands.join(","));
    if (installationIncluded !== "all") sp.set("installationIncluded", installationIncluded);
    if (regionGroup) sp.set("region", regionGroup);
    if (sellerId) sp.set("sellerId", sellerId);
    router.replace(`/buy/tire?${sp.toString()}`, { scroll: false });
  }, [router, page, sort, sizes, seasons, dotYearMin, dotYearMax, brands, installationIncluded, regionGroup, sellerId]);

  const listQuery = useQuery({
    queryKey: ["tires", "list", { sort, page, sizes, seasons, dotYearMin, dotYearMax, brands, installationIncluded, regionGroup, sellerId }],
    queryFn: () =>
      fetchTiresList({
        sort,
        page,
        pageSize: 12,
        sizes: sizes.length > 0 ? sizes : undefined,
        seasons: seasons.length > 0 ? seasons : undefined,
        dotYearMin: dotYearMin ? Number(dotYearMin) : undefined,
        dotYearMax: dotYearMax ? Number(dotYearMax) : undefined,
        brands: brands.length > 0 ? brands : undefined,
        installationIncluded: installationIncluded === "all" ? undefined : installationIncluded === "true",
        regionGroup: regionGroup || undefined,
        sellerId: sellerId || undefined,
      }),
  });

  const availableSizes = Array.from(new Set(tires.map((t) => t.size))).sort();
  const availableBrands = Array.from(new Set(tires.map((t) => t.brand))).sort();
  const currentYear = new Date().getFullYear();
  const minYear = 2016;

  const toggleSize = (size: string) => {
    setSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  };

  const toggleSeason = (season: string) => {
    setSeasons((prev) => (prev.includes(season) ? prev.filter((s) => s !== season) : [...prev, season]));
  };

  const toggleBrand = (brand: string) => {
    setBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]));
  };

  const resetFilters = () => {
    setSizes([]);
    setSeasons([]);
    setDotYearMin("");
    setDotYearMax("");
    setBrands([]);
    setInstallationIncluded("all");
    setRegionGroup("");
  };


  return (
    <div className="grid gap-6">
      <SectionTitle title={t("tire_title")} subtitle={t("tire_subtitle")} />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr] items-start">
        <aside className="rounded-2xl border border-zinc-200 bg-white p-4 h-auto self-start">
          <div className="flex items-center justify-between">
            <div className="text-sm font-normal text-zinc-900">{t("tire_filters_title")}</div>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-normal text-zinc-600 hover:text-zinc-900"
            >
              {t("tire_filters_reset")}
            </button>
          </div>

          <div className="mt-3 grid gap-3">
            {/* 1) Tire Size */}
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("tire_filters_size")}</span>
              <div className="max-h-56 overflow-auto rounded-xl border border-zinc-200 p-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`w-full rounded-lg border px-2 py-2 text-left text-sm font-normal transition-colors ${
                      sizes.includes(size) ? "border-zinc-300 bg-zinc-50 ring-1 ring-zinc-200" : "border-transparent hover:bg-zinc-50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </label>

            {/* 2) Season / Usage */}
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("tire_filters_season")}</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "summer", labelKey: "tire_filters_season_summer" },
                  { value: "winter", labelKey: "tire_filters_season_winter" },
                  { value: "all-season", labelKey: "tire_filters_season_allSeason" },
                  { value: "off-road", labelKey: "tire_filters_season_offRoad" },
                ].map(({ value, labelKey }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleSeason(value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-normal transition-colors ${
                      seasons.includes(value)
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:ring-1 hover:ring-zinc-200"
                    }`}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            </label>

            {/* 3) Manufacturing Year (DOT) */}
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("tire_filters_dotYear")}</span>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={dotYearMin}
                  onChange={(e) => setDotYearMin(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder={`${minYear}`}
                  inputMode="numeric"
                />
                <Input
                  value={dotYearMax}
                  onChange={(e) => setDotYearMax(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder={`${currentYear}`}
                  inputMode="numeric"
                />
              </div>
            </label>

            {/* 4) Brand */}
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("tire_filters_brand")}</span>
              <Input
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder={t("tire_filters_brandSearch")}
              />
              <div className="max-h-56 overflow-auto rounded-xl border border-zinc-200 p-2">
                {availableBrands
                  .filter((b) => !brandSearch.trim() || b.toLowerCase().includes(brandSearch.trim().toLowerCase()))
                  .map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => toggleBrand(brand)}
                      className={`flex w-full items-center justify-between rounded-lg border px-2 py-2 text-left text-sm transition-colors ${
                        brands.includes(brand) ? "border-zinc-300 bg-zinc-50 ring-1 ring-zinc-200 font-normal" : "border-transparent hover:bg-zinc-50"
                      }`}
                    >
                      <span className="truncate">{brand}</span>
                    </button>
                  ))}
              </div>
            </label>

            {/* 5) Installation Included */}
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("tire_filters_installation")}</span>
              <CustomSelect
                value={installationIncluded}
                onChange={(v) => setInstallationIncluded(v)}
                options={[
                  { value: "all", label: t("common_all") },
                  { value: "true", label: t("tire_filters_installation_included") },
                  { value: "false", label: t("tire_filters_installation_notIncluded") },
                ]}
              />
            </label>

            {/* Region (optional, matching All Cars) */}
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll_filters_region")}</span>
              <CustomSelect
                value={regionGroup}
                onChange={(v) => setRegionGroup(v)}
                options={[
                  { value: "", label: t("common_all") },
                  { value: "Ulaanbaatar", label: t("buyAll_option_region_ua") },
                  { value: "Erdenet", label: t("buyAll_option_region_erdenet") },
                  { value: "Darkhan", label: t("buyAll_option_region_darkhan") },
                  { value: "Other", label: t("buyAll_option_region_other") },
                ]}
              />
            </label>
          </div>
        </aside>

        <section className="grid gap-3">
            <SortPills
              value={sort}
              onChange={setSort}
              options={[
                { key: "newest", labelKey: "common_sort_newest" },
                { key: "priceAsc", labelKey: "buyAll_sort_priceAsc" },
                { key: "priceDesc", labelKey: "buyAll_sort_priceDesc" },
              ]}
            />

          {listQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : listQuery.data && listQuery.data.items.length > 0 ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {listQuery.data.items
                  .map((tire, index) => {
                    // Determine tier (prototype: index-based)
                    let tier: "gold" | "silver" | null = null;
                    if (index % 7 === 0) tier = "gold";
                    else if (index % 5 === 0) tier = "silver";
                    return { tire, tier, originalIndex: index };
                  })
                  .sort((a, b) => {
                    // Sort: GOLD → SILVER → null
                    if (a.tier === "gold" && b.tier !== "gold") return -1;
                    if (a.tier !== "gold" && b.tier === "gold") return 1;
                    if (a.tier === "silver" && b.tier === null) return -1;
                    if (a.tier === null && b.tier === "silver") return 1;
                    return a.originalIndex - b.originalIndex;
                  })
                  .map(({ tire, tier }, displayIndex) => (
                    <TireCard key={tire.id} tire={tire} index={displayIndex} tier={tier} />
                  ))}
              </div>
              {listQuery.data.totalPages > 1 ? (
                <Pagination page={listQuery.data.page} totalPages={listQuery.data.totalPages} onPageChange={(p) => setPage(p)} />
              ) : null}
            </>
          ) : (
            <EmptyState title={t("tire_emptyState")} />
          )}
        </section>
      </div>
    </div>
  );
}

