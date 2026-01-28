"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { CardSkeleton } from "@/components/common/CardSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SectionTitle } from "@/components/common/SectionTitle";
import { ServiceCenterCardHorizontal } from "@/components/service/ServiceCenterCardHorizontal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/context/I18nContext";
import { fetchCentersList, type CentersListQuery } from "@/lib/mockApi";

function firstString(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

type CentersSort = "newest" | "ratingDesc" | "ratingAsc" | "nameAsc";

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
  const [availability, setAvailability] = React.useState<"now" | "next-week" | "all">(
    () => (firstString(searchParams.availability) as any) || "all",
  );

  React.useEffect(() => setPage(1), [sort, searchQuery, serviceType, regionGroup, priceMinMnt, priceMaxMnt, ratingMin, availability]);

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
    if (availability !== "all") sp.set("availability", availability);
    router.replace(`/service?${sp.toString()}`, { scroll: false });
  }, [router, page, sort, searchQuery, serviceType, regionGroup, priceMinMnt, priceMaxMnt, ratingMin, availability]);

  const listQuery = useQuery({
    queryKey: ["centers", "list", { sort, page, searchQuery, serviceType, regionGroup, priceMinMnt, priceMaxMnt, ratingMin, availability }],
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
        availability: availability !== "all" ? availability : undefined,
      }),
  });

  return (
    <div className="grid gap-6">
      <SectionTitle title={t("service_title")} subtitle={t("service_subtitle")} />

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
              <Select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                <option value="all">{t("service_filter_serviceType_all")}</option>
                <option value="Engine Repair">{t("service_filter_serviceType_engineRepair")}</option>
                <option value="Tire Service">{t("service_filter_serviceType_tireService")}</option>
                <option value="Oil Change">{t("service_filter_serviceType_oilChange")}</option>
                <option value="Brake Service">{t("service_filter_serviceType_brakeService")}</option>
                <option value="General Maintenance">{t("service_filter_serviceType_generalMaintenance")}</option>
                <option value="Diagnostics">{t("service_filter_serviceType_diagnostics")}</option>
                <option value="Electrical">{t("service_filter_serviceType_electrical")}</option>
                <option value="AC service">{t("service_filter_serviceType_acService")}</option>
                <option value="Suspension">{t("service_filter_serviceType_suspension")}</option>
                <option value="Battery">{t("service_filter_serviceType_battery")}</option>
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll_filters_region")}</span>
              <Select value={regionGroup} onChange={(e) => setRegionGroup(e.target.value)}>
                <option value="">{t("service_filter_region_all")}</option>
                <option value="Ulaanbaatar">{t("service_filter_region_ulaanbaatar")}</option>
                <option value="Darkhan">{t("service_filter_region_darkhan")}</option>
                <option value="Erdenet">{t("service_filter_region_erdenet")}</option>
                <option value="Other">{t("service_filter_region_other")}</option>
              </Select>
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

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("service_filter_availability")}</span>
              <Select value={availability} onChange={(e) => setAvailability(e.target.value as any)}>
                <option value="all">{t("service_filter_availability_all")}</option>
                <option value="now">{t("service_filter_availability_now")}</option>
                <option value="next-week">{t("service_filter_availability_nextWeek")}</option>
              </Select>
            </label>
          </div>
        </aside>

        {/* RIGHT: Cards */}
        <section className="grid gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-normal text-zinc-900">
              {listQuery.data ? t("common_total", { count: listQuery.data.total }) : t("common_loading")}
            </div>
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll_sort_label")}</span>
              <Select value={sort} onChange={(e) => setSort(e.target.value as CentersSort)} className="w-44">
                <option value="newest">{t("common_sort_newest")}</option>
                <option value="nameAsc">{t("service_sort_nameAsc")}</option>
              </Select>
            </label>
          </div>

          {listQuery.isLoading ? (
            <div className="grid gap-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : listQuery.data && listQuery.data.items.length > 0 ? (
            <>
              <div className="grid gap-3">
                {listQuery.data.items.map((center) => (
                  <ServiceCenterCardHorizontal key={center.id} center={center} />
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

