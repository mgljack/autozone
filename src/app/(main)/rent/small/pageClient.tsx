"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { CardSkeleton } from "@/components/common/CardSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SectionTitle } from "@/components/common/SectionTitle";
import { RentCard } from "@/components/rent/RentCard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/context/I18nContext";
import { SortPills } from "@/components/listings/SortPills";
import { fetchRentList, fetchRentModels, type RentListQuery, type RentType } from "@/lib/mockApi";
import type { RentItem } from "@/mock/rent";

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
      <SectionTitle title={typeLabel} subtitle={t("rent_subtitle")} />

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
              <Select value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="all">{t("rent_allModels")}</option>
                {(modelsQuery.data ?? []).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("rent_fuel")}</span>
              <Select value={fuel} onChange={(e) => setFuel(e.target.value as any)}>
                <option value="all">{t("common_all")}</option>
                <option value="gasoline">{t("rent_fuel_gasoline")}</option>
                <option value="diesel">{t("rent_fuel_diesel")}</option>
                <option value="electric">{t("rent_fuel_electric")}</option>
                <option value="hybrid">{t("rent_fuel_hybrid")}</option>
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("rent_transmission")}</span>
              <Select value={transmission} onChange={(e) => setTransmission(e.target.value as any)}>
                <option value="all">{t("common_all")}</option>
                <option value="at">{t("rent_transmission_at")}</option>
                <option value="mt">{t("rent_transmission_mt")}</option>
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("rent_region")}</span>
              <Select value={regionGroup} onChange={(e) => setRegionGroup(e.target.value)}>
                <option value="">{t("common_all")}</option>
                <option value="Ulaanbaatar">{t("rent_region_ulaanbaatar")}</option>
                <option value="Erdenet">{t("rent_region_erdenet")}</option>
                <option value="Darkhan">{t("rent_region_darkhan")}</option>
                <option value="Other">{t("rent_region_other")}</option>
              </Select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-normal text-zinc-600">{t("rent_priceMin")}</span>
                <Input value={priceMinMnt} onChange={(e) => setPriceMinMnt(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-normal text-zinc-600">{t("rent_priceMax")}</span>
                <Input value={priceMaxMnt} onChange={(e) => setPriceMaxMnt(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
              </label>
            </div>
          </div>
        </aside>

        <section className="grid gap-3">
          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-start">
            <SortPills
              value={sort}
              onChange={setSort}
              options={[
                { key: "newest", labelKey: "rent_sort_newest" },
                { key: "priceAsc", labelKey: "rent_sort_priceAsc" },
                { key: "priceDesc", labelKey: "rent_sort_priceDesc" },
              ]}
            />
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

