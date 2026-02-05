"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { CardSkeleton } from "@/components/common/CardSkeleton";
import { CustomSelect } from "@/components/common/CustomSelect";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SectionTitle } from "@/components/common/SectionTitle";
import { RentCard } from "@/components/rent/RentCard";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/context/I18nContext";
import { SortPills } from "@/components/listings/SortPills";
import { fetchRentList, fetchRentModels, type RentListQuery, type RentType } from "@/lib/mockApi";
import type { RentItem } from "@/mock/rent";
import { formatMnt } from "@/lib/format";

function RentCardGrid({ items }: { items: RentItem[] }) {
  const sortedItems = React.useMemo(() => {
    return items
      .map((item, index) => {
        // Determine tier (prototype: index-based)
        let tier: "gold" | "silver" | null = null;
        if (index % 7 === 0) tier = "gold";
        else if (index % 5 === 0) tier = "silver";
        return { item, tier, originalIndex: index };
      })
      .sort((a, b) => {
        // Sort: GOLD → SILVER → null
        if (a.tier === "gold" && b.tier !== "gold") return -1;
        if (a.tier !== "gold" && b.tier === "gold") return 1;
        if (a.tier === "silver" && b.tier === null) return -1;
        if (a.tier === null && b.tier === "silver") return 1;
        return a.originalIndex - b.originalIndex;
      });
  }, [items]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sortedItems.map(({ item, tier }) => (
        <RentCard key={item.id} item={item} tier={tier} />
      ))}
    </div>
  );
}

function firstString(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

type RentSort = "newest" | "priceAsc" | "priceDesc";

// Price options: 30,000 to 300,000 in 10,000 increments
const PRICE_OPTIONS = Array.from({ length: 28 }, (_, i) => 30000 + i * 10000); // 30,000..300,000

export function RentTypeClient({
  type,
  searchParams,
}: {
  type: RentType;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { t } = useI18n();
  const router = useRouter();

  const [page, setPage] = React.useState<number>(() => Number(firstString(searchParams.page)) || 1);
  const [sort, setSort] = React.useState<RentSort>(() => (firstString(searchParams.sort) as RentSort) || "newest");

  // Sidebar filters (URL-synced)
  const [searchQuery, setSearchQuery] = React.useState(firstString(searchParams.q) ?? "");
  const [model, setModel] = React.useState(firstString(searchParams.model) ?? "all");
  const [fuel, setFuel] = React.useState<"gasoline" | "diesel" | "electric" | "hybrid" | "all">(
    () => (firstString(searchParams.fuel) as any) || "all",
  );
  const [transmission, setTransmission] = React.useState<"at" | "mt" | "all">(
    () => (firstString(searchParams.transmission) as any) || "all",
  );
  const [regionGroup, setRegionGroup] = React.useState(firstString(searchParams.region) ?? "");
  const [priceMinMnt, setPriceMinMnt] = React.useState(firstString(searchParams.priceMinMnt) ?? "");
  const [priceMaxMnt, setPriceMaxMnt] = React.useState(firstString(searchParams.priceMaxMnt) ?? "");

  // Price change handlers with validation
  const handlePriceMinChange = React.useCallback((value: string) => {
    if (value === "") {
      setPriceMinMnt("");
      return;
    }
    const min = Number(value);
    const max = priceMaxMnt ? Number(priceMaxMnt) : null;
    setPriceMinMnt(value);
    // If min > max, adjust max to min
    if (max !== null && min > max) {
      setPriceMaxMnt(value);
    }
  }, [priceMaxMnt]);

  const handlePriceMaxChange = React.useCallback((value: string) => {
    if (value === "") {
      setPriceMaxMnt("");
      return;
    }
    const max = Number(value);
    const min = priceMinMnt ? Number(priceMinMnt) : null;
    setPriceMaxMnt(value);
    // If max < min, adjust min to max
    if (min !== null && max < min) {
      setPriceMinMnt(value);
    }
  }, [priceMinMnt]);

  React.useEffect(() => setPage(1), [sort, searchQuery, model, fuel, transmission, regionGroup, priceMinMnt, priceMaxMnt]);

  // Keep filters/sort in URL
  React.useEffect(() => {
    const sp = new URLSearchParams();
    if (page > 1) sp.set("page", String(page));
    if (sort !== "newest") sp.set("sort", sort);
    if (searchQuery.trim()) sp.set("q", searchQuery.trim());
    if (model !== "all") sp.set("model", model);
    if (fuel !== "all") sp.set("fuel", fuel);
    if (transmission !== "all") sp.set("transmission", transmission);
    if (regionGroup) sp.set("region", regionGroup);
    if (priceMinMnt) sp.set("priceMinMnt", priceMinMnt);
    if (priceMaxMnt) sp.set("priceMaxMnt", priceMaxMnt);
    router.replace(`/rent/${type}?${sp.toString()}`, { scroll: false });
  }, [router, type, page, sort, searchQuery, model, fuel, transmission, regionGroup, priceMinMnt, priceMaxMnt]);

  const modelsQuery = useQuery({
    queryKey: ["rent", "models", type],
    queryFn: () => fetchRentModels(type),
  });

  const listQuery = useQuery({
    queryKey: ["rent", "list", type, { sort, page, searchQuery, model, fuel, transmission, regionGroup, priceMinMnt, priceMaxMnt }],
    queryFn: () =>
      fetchRentList(type, {
        sort,
        page,
        pageSize: 12,
        q: searchQuery || undefined,
        model: model !== "all" ? model : undefined,
        fuel: fuel !== "all" ? fuel : undefined,
        transmission: transmission !== "all" ? transmission : undefined,
        regionGroup: regionGroup || undefined,
        priceMinMnt: priceMinMnt ? Number(priceMinMnt) : undefined,
        priceMaxMnt: priceMaxMnt ? Number(priceMaxMnt) : undefined,
      }),
  });

  const typeLabel = type === "small" ? t("rent_small") : type === "large" ? t("rent_large") : t("rent_truck");

  return (
    <div className="grid gap-6">
      <SectionTitle title={typeLabel} />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr] items-start">
        <aside className="rounded-2xl border border-zinc-200 bg-white p-4 h-auto self-start">
          <div className="text-sm font-normal text-zinc-900">{t("rent_filter")}</div>

          <div className="mt-3 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("rent_search")}</span>
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("rent_searchPlaceholder")} />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("rent_allModels")}</span>
              <CustomSelect
                value={model}
                onChange={(v) => setModel(v)}
                options={[
                  { value: "all", label: t("rent_allModels") },
                  ...(modelsQuery.data ?? []).map((m) => ({
                    value: m,
                    label: m,
                  })),
                ]}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("rent_fuel")}</span>
              <CustomSelect
                value={fuel}
                onChange={(v) => setFuel(v as typeof fuel)}
                options={[
                  { value: "all", label: t("common_all") },
                  { value: "gasoline", label: t("rent_fuel_gasoline") },
                  { value: "diesel", label: t("rent_fuel_diesel") },
                  { value: "electric", label: t("rent_fuel_electric") },
                  { value: "hybrid", label: t("rent_fuel_hybrid") },
                ]}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("rent_transmission")}</span>
              <CustomSelect
                value={transmission}
                onChange={(v) => setTransmission(v as typeof transmission)}
                options={[
                  { value: "all", label: t("common_all") },
                  { value: "at", label: t("rent_transmission_at") },
                  { value: "mt", label: t("rent_transmission_mt") },
                ]}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("rent_region")}</span>
              <CustomSelect
                value={regionGroup}
                onChange={(v) => setRegionGroup(v)}
                options={[
                  { value: "", label: t("common_all") },
                  { value: "Ulaanbaatar", label: t("rent_region_ulaanbaatar") },
                  { value: "Erdenet", label: t("rent_region_erdenet") },
                  { value: "Darkhan", label: t("rent_region_darkhan") },
                  { value: "Other", label: t("rent_region_other") },
                ]}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-normal text-zinc-600">{t("rent_priceMin")}</span>
                <CustomSelect
                  value={priceMinMnt || ""}
                  onChange={handlePriceMinChange}
                  options={[
                    { value: "", label: t("common_all") },
                    ...PRICE_OPTIONS.map((price) => ({
                      value: String(price),
                      label: formatMnt(price),
                    })),
                  ]}
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-normal text-zinc-600">{t("rent_priceMax")}</span>
                <CustomSelect
                  value={priceMaxMnt || ""}
                  onChange={handlePriceMaxChange}
                  options={[
                    { value: "", label: t("common_all") },
                    ...PRICE_OPTIONS.map((price) => ({
                      value: String(price),
                      label: formatMnt(price),
                    })),
                  ]}
                />
              </label>
            </div>
          </div>
        </aside>

        <section className="grid gap-3">
            <SortPills
              value={sort}
              onChange={setSort}
              options={[
                { key: "newest", labelKey: "rent_sort_newest" },
                { key: "priceAsc", labelKey: "rent_sort_priceAsc" },
                { key: "priceDesc", labelKey: "rent_sort_priceDesc" },
              ]}
            />

          {/* Section Divider */}
          <div className="my-1 h-px w-full bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

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
              <RentCardGrid items={listQuery.data.items} />
              {listQuery.data.totalPages > 1 ? (
                <Pagination page={listQuery.data.page} totalPages={listQuery.data.totalPages} onPageChange={(p) => setPage(p)} />
              ) : null}
            </>
          ) : (
            <EmptyState title={t("rent_noVehicles")} />
          )}
        </section>
      </div>
    </div>
  );
}

