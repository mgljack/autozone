"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { CardSkeleton } from "@/components/common/CardSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SectionTitle } from "@/components/common/SectionTitle";
import { TireCard } from "@/components/tires/TireCard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/context/I18nContext";
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

  React.useEffect(() => setPage(1), [sort, sizes, seasons, dotYearMin, dotYearMax, brands, installationIncluded, regionGroup]);

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
    router.replace(`/buy/tire?${sp.toString()}`, { scroll: false });
  }, [router, page, sort, sizes, seasons, dotYearMin, dotYearMax, brands, installationIncluded, regionGroup]);

  const listQuery = useQuery({
    queryKey: ["tires", "list", { sort, page, sizes, seasons, dotYearMin, dotYearMax, brands, installationIncluded, regionGroup }],
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
      <SectionTitle title="타이어" subtitle="타이어를 검색하고 구매하세요" />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr] items-start">
        <aside className="rounded-2xl border border-zinc-200 bg-white p-4 h-auto self-start">
          <div className="flex items-center justify-between">
            <div className="text-sm font-normal text-zinc-900">필터</div>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-normal text-zinc-600 hover:text-zinc-900"
            >
              초기화
            </button>
          </div>

          <div className="mt-3 grid gap-3">
            {/* 1) Tire Size */}
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">타이어 규격</span>
              <div className="max-h-56 overflow-auto rounded-xl border border-zinc-200 p-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`w-full rounded-lg px-2 py-2 text-left text-sm font-normal hover:bg-zinc-50 ${
                      sizes.includes(size) ? "bg-zinc-100" : ""
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </label>

            {/* 2) Season / Usage */}
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">계절용도</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "summer", label: "썸머" },
                  { value: "winter", label: "윈터" },
                  { value: "all-season", label: "올시즌" },
                  { value: "off-road", label: "오프로드" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleSeason(value)}
                    className={`rounded-lg px-3 py-2 text-sm font-normal transition-colors ${
                      seasons.includes(value)
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </label>

            {/* 3) Manufacturing Year (DOT) */}
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">제조 연도(DOT)</span>
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
              <span className="text-xs font-normal text-zinc-600">브랜드</span>
              <Input
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="브랜드 검색"
              />
              <div className="max-h-56 overflow-auto rounded-xl border border-zinc-200 p-2">
                {availableBrands
                  .filter((b) => !brandSearch.trim() || b.toLowerCase().includes(brandSearch.trim().toLowerCase()))
                  .map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => toggleBrand(brand)}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-zinc-50 ${
                        brands.includes(brand) ? "bg-zinc-100 font-normal" : ""
                      }`}
                    >
                      <span className="truncate">{brand}</span>
                    </button>
                  ))}
              </div>
            </label>

            {/* 5) Installation Included */}
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">장착 포함 여부</span>
              <Select value={installationIncluded} onChange={(e) => setInstallationIncluded(e.target.value)}>
                <option value="all">전체</option>
                <option value="true">포함</option>
                <option value="false">미포함</option>
              </Select>
            </label>

            {/* Region (optional, matching All Cars) */}
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll.filters.region")}</span>
              <Select value={regionGroup} onChange={(e) => setRegionGroup(e.target.value)}>
                <option value="">전체</option>
                <option value="Ulaanbaatar">Улаанбаатар</option>
                <option value="Erdenet">Эрдэнэт</option>
                <option value="Darkhan">Дархан</option>
                <option value="Other">기타</option>
              </Select>
            </label>
          </div>
        </aside>

        <section className="grid gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-normal text-zinc-900">
              {listQuery.data ? t("common.total", { count: listQuery.data.total }) : t("common.loading")}
            </div>
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll.sort.label")}</span>
              <Select value={sort} onChange={(e) => setSort(e.target.value as any)} className="w-44">
                <option value="newest">{t("common.sort.newest")}</option>
                <option value="priceAsc">{t("buyAll.sort.priceAsc")}</option>
                <option value="priceDesc">{t("buyAll.sort.priceDesc")}</option>
              </Select>
            </label>
          </div>

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
                {listQuery.data.items.map((tire) => (
                  <TireCard key={tire.id} tire={tire} />
                ))}
              </div>
              {listQuery.data.totalPages > 1 ? (
                <Pagination page={listQuery.data.page} totalPages={listQuery.data.totalPages} onPageChange={(p) => setPage(p)} />
              ) : null}
            </>
          ) : (
            <EmptyState title="타이어가 없습니다" />
          )}
        </section>
      </div>
    </div>
  );
}

