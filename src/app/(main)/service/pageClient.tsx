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
      <SectionTitle title={t("service.title")} subtitle={t("service.subtitle")} />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr] items-start">
        {/* LEFT: Filters */}
        <aside className="rounded-2xl border border-zinc-200 bg-white p-4 h-auto self-start">
          <div className="text-sm font-normal text-zinc-900">필터</div>

          <div className="mt-3 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">검색</span>
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("service.searchPlaceholder")} />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">서비스 타입</span>
              <Select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                <option value="all">전체</option>
                <option value="Engine Repair">엔진 수리</option>
                <option value="Tire Service">타이어 서비스</option>
                <option value="Oil Change">오일 교환</option>
                <option value="Brake Service">브레이크 서비스</option>
                <option value="General Maintenance">일반 정비</option>
                <option value="Diagnostics">진단</option>
                <option value="Electrical">전기</option>
                <option value="AC service">에어컨 서비스</option>
                <option value="Suspension">서스펜션</option>
                <option value="Battery">배터리</option>
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll.filters.region")}</span>
              <Select value={regionGroup} onChange={(e) => setRegionGroup(e.target.value)}>
                <option value="">전체</option>
                <option value="Ulaanbaatar">울란바토르</option>
                <option value="Darkhan">다르항</option>
                <option value="Erdenet">에르데네트</option>
                <option value="Other">기타</option>
              </Select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-normal text-zinc-600">{t("buyAll.filters.priceMin")}</span>
                <Input value={priceMinMnt} onChange={(e) => setPriceMinMnt(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-normal text-zinc-600">{t("buyAll.filters.priceMax")}</span>
                <Input value={priceMaxMnt} onChange={(e) => setPriceMaxMnt(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
              </label>
            </div>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">최소 평점</span>
              <Select value={ratingMin} onChange={(e) => setRatingMin(e.target.value)}>
                <option value="">전체</option>
                <option value="1">1점 이상</option>
                <option value="2">2점 이상</option>
                <option value="3">3점 이상</option>
                <option value="4">4점 이상</option>
                <option value="4.5">4.5점 이상</option>
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">가용성</span>
              <Select value={availability} onChange={(e) => setAvailability(e.target.value as any)}>
                <option value="all">전체</option>
                <option value="now">지금 가능</option>
                <option value="next-week">다음 주</option>
              </Select>
            </label>
          </div>
        </aside>

        {/* RIGHT: Cards */}
        <section className="grid gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-normal text-zinc-900">
              {listQuery.data ? t("common.total", { count: listQuery.data.total }) : t("common.loading")}
            </div>
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll.sort.label")}</span>
              <Select value={sort} onChange={(e) => setSort(e.target.value as CentersSort)} className="w-44">
                <option value="newest">{t("common.sort.newest")}</option>
                <option value="ratingDesc">평점 높은순</option>
                <option value="ratingAsc">평점 낮은순</option>
                <option value="nameAsc">이름순</option>
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
            <EmptyState title={t("service.noCentersMessage")} />
          )}
        </section>
      </div>
    </div>
  );
}

