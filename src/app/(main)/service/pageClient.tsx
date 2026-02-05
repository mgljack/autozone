"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { CardSkeleton } from "@/components/common/CardSkeleton";
import { CustomSelect } from "@/components/common/CustomSelect";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SectionTitle } from "@/components/common/SectionTitle";
import { ServiceCenterCardHorizontal } from "@/components/service/ServiceCenterCardHorizontal";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/context/I18nContext";
import { SortPills } from "@/components/listings/SortPills";
import { fetchCentersList, type CentersListQuery } from "@/lib/mockApi";

function firstString(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

type CentersSort = "newest" | "ratingDesc" | "ratingAsc" | "priceAsc" | "priceDesc";

export function ServiceCentersClient({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const { t } = useI18n();
  const router = useRouter();

  const [page, setPage] = React.useState<number>(() => Number(firstString(searchParams.page)) || 1);
  const [sort, setSort] = React.useState<CentersSort>(() => (firstString(searchParams.sort) as CentersSort) || "newest");

  // Filters (URL-synced)
  const [searchQuery, setSearchQuery] = React.useState(firstString(searchParams.q) ?? "");
  const [serviceType, setServiceType] = React.useState(firstString(searchParams.serviceType) ?? "all");
  const [regionGroup, setRegionGroup] = React.useState(firstString(searchParams.region) ?? "");
  const [priceMinMnt, setPriceMinMnt] = React.useState(firstString(searchParams.priceMinMnt) ?? "");
  const [priceMaxMnt, setPriceMaxMnt] = React.useState(firstString(searchParams.priceMaxMnt) ?? "");
  const [ratingMin, setRatingMin] = React.useState(firstString(searchParams.ratingMin) ?? "");

  React.useEffect(() => setPage(1), [sort, searchQuery, serviceType, regionGroup, priceMinMnt, priceMaxMnt, ratingMin]);

  // Keep filters/sort in URL
  React.useEffect(() => {
    const sp = new URLSearchParams();
    if (page > 1) sp.set("page", String(page));
    if (sort !== "newest") sp.set("sort", sort);
    if (searchQuery.trim()) sp.set("q", searchQuery.trim());
    if (serviceType !== "all") sp.set("serviceType", serviceType);
    if (regionGroup) sp.set("region", regionGroup);
    if (priceMinMnt) sp.set("priceMinMnt", priceMinMnt);
    if (priceMaxMnt) sp.set("priceMaxMnt", priceMaxMnt);
    if (ratingMin) sp.set("ratingMin", ratingMin);
    router.replace(`/service?${sp.toString()}`, { scroll: false });
  }, [router, page, sort, searchQuery, serviceType, regionGroup, priceMinMnt, priceMaxMnt, ratingMin]);

  const listQuery = useQuery({
    queryKey: ["centers", "list", { sort, page, searchQuery, serviceType, regionGroup, priceMinMnt, priceMaxMnt, ratingMin }],
    queryFn: () =>
      fetchCentersList({
        sort,
        page,
        pageSize: 12,
        q: searchQuery || undefined,
        serviceType: serviceType !== "all" ? serviceType : undefined,
        regionGroup: regionGroup || undefined,
        priceMinMnt: priceMinMnt ? Number(priceMinMnt) : undefined,
        priceMaxMnt: priceMaxMnt ? Number(priceMaxMnt) : undefined,
        ratingMin: ratingMin ? Number(ratingMin) : undefined,
      }),
  });

  return (
    <div className="grid gap-6">
      <SectionTitle title={t("service_title")} />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr] items-start">
        {/* LEFT: Filters */}
        <aside className="rounded-2xl border border-zinc-200 bg-white p-4 h-auto self-start">
          <div className="text-sm font-normal text-zinc-900">{t("service_filter")}</div>

          <div className="mt-3 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("service_filter_search")}</span>
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("service_searchPlaceholder")} />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("service_filter_serviceType")}</span>
              <CustomSelect
                value={serviceType}
                onChange={(v) => setServiceType(v)}
                options={[
                  { value: "all", label: t("service_filter_serviceType_all") },
                  { value: "Engine Repair", label: t("service_filter_serviceType_engineRepair") },
                  { value: "Tire Service", label: t("service_filter_serviceType_tireService") },
                  { value: "Oil Change", label: t("service_filter_serviceType_oilChange") },
                  { value: "Brake Service", label: t("service_filter_serviceType_brakeService") },
                  { value: "General Maintenance", label: t("service_filter_serviceType_generalMaintenance") },
                  { value: "Diagnostics", label: t("service_filter_serviceType_diagnostics") },
                  { value: "Electrical", label: t("service_filter_serviceType_electrical") },
                  { value: "AC service", label: t("service_filter_serviceType_acService") },
                  { value: "Suspension", label: t("service_filter_serviceType_suspension") },
                  { value: "Battery", label: t("service_filter_serviceType_battery") },
                ]}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll_filters_region")}</span>
              <CustomSelect
                value={regionGroup}
                onChange={(v) => setRegionGroup(v)}
                options={[
                  { value: "", label: t("service_filter_region_all") },
                  { value: "Ulaanbaatar", label: t("service_filter_region_ulaanbaatar") },
                  { value: "Darkhan", label: t("service_filter_region_darkhan") },
                  { value: "Erdenet", label: t("service_filter_region_erdenet") },
                  { value: "Other", label: t("service_filter_region_other") },
                ]}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-normal text-zinc-600">{t("buyAll_filters_priceMin")}</span>
                <Input value={priceMinMnt} onChange={(e) => setPriceMinMnt(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-normal text-zinc-600">{t("buyAll_filters_priceMax")}</span>
                <Input value={priceMaxMnt} onChange={(e) => setPriceMaxMnt(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
              </label>
            </div>
          </div>
        </aside>

        {/* RIGHT: Cards */}
        <section className="grid gap-3">
            <SortPills
              value={sort}
              onChange={setSort}
              options={[
                { key: "newest", labelKey: "common_sort_newest" },
                { key: "priceAsc", labelKey: "service_sort_priceAsc" },
                { key: "priceDesc", labelKey: "service_sort_priceDesc" },
              ]}
            />

          {/* Section Divider */}
          <div className="my-1 h-px w-full bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

          {listQuery.isLoading ? (
            <div className="grid gap-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : listQuery.data && listQuery.data.items.length > 0 ? (
            <>
              <div>
                {listQuery.data.items
                  .map((center, index) => {
                    // Determine tier (prototype: index-based)
                    let tier: "gold" | "silver" | null = null;
                    if (index % 7 === 0) tier = "gold";
                    else if (index % 5 === 0) tier = "silver";
                    return { center, tier, originalIndex: index };
                  })
                  .sort((a, b) => {
                    // Sort: GOLD → SILVER → null
                    if (a.tier === "gold" && b.tier !== "gold") return -1;
                    if (a.tier !== "gold" && b.tier === "gold") return 1;
                    if (a.tier === "silver" && b.tier === null) return -1;
                    if (a.tier === null && b.tier === "silver") return 1;
                    return a.originalIndex - b.originalIndex;
                  })
                  .map(({ center, tier }) => (
                    <ServiceCenterCardHorizontal key={center.id} center={center} tier={tier} />
                  ))}
              </div>
              {listQuery.data.totalPages > 1 ? (
                <Pagination page={listQuery.data.page} totalPages={listQuery.data.totalPages} onPageChange={(p) => setPage(p)} />
              ) : null}
            </>
          ) : (
            <EmptyState title={t("service_noCentersMessage")} />
          )}
        </section>
      </div>
    </div>
  );
}

