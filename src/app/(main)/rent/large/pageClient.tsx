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
import { fetchRentList, fetchRentModels, type RentListQuery, type RentType } from "@/lib/mockApi";
import type { RentItem } from "@/mock/rent";

function RentCardGrid({ items }: { items: RentItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <RentCard key={item.id} item={item} />
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

  const typeLabel = type === "small" ? t("rent.small") : type === "large" ? t("rent.large") : t("rent.truck");

  return (
    <div className="grid gap-6">
      <SectionTitle title={typeLabel} subtitle="차량을 검색하고 선택하세요" />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr] items-start">
        <aside className="rounded-2xl border border-zinc-200 bg-white p-4 h-auto self-start">
          <div className="text-sm font-normal text-zinc-900">필터</div>

          <div className="mt-3 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">검색</span>
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="차량명 검색" />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">전체 모델</span>
              <Select value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="all">전체 모델</option>
                {(modelsQuery.data ?? []).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">연료</span>
              <Select value={fuel} onChange={(e) => setFuel(e.target.value as any)}>
                <option value="all">전체</option>
                <option value="gasoline">가솔린</option>
                <option value="diesel">디젤</option>
                <option value="electric">전기</option>
                <option value="hybrid">하이브리드</option>
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">변속기</span>
              <Select value={transmission} onChange={(e) => setTransmission(e.target.value as any)}>
                <option value="all">전체</option>
                <option value="at">자동</option>
                <option value="mt">수동</option>
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">지역</span>
              <Select value={regionGroup} onChange={(e) => setRegionGroup(e.target.value)}>
                <option value="">전체</option>
                <option value="Ulaanbaatar">울란바토르</option>
                <option value="Erdenet">에르데네트</option>
                <option value="Darkhan">다르항</option>
                <option value="Other">기타</option>
              </Select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-normal text-zinc-600">최소 가격</span>
                <Input value={priceMinMnt} onChange={(e) => setPriceMinMnt(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-normal text-zinc-600">최대 가격</span>
                <Input value={priceMaxMnt} onChange={(e) => setPriceMaxMnt(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
              </label>
            </div>
          </div>
        </aside>

        <section className="grid gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-normal text-zinc-900">
              {listQuery.data ? `총 ${listQuery.data.total}개` : "로딩 중..."}
            </div>
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">정렬</span>
              <Select value={sort} onChange={(e) => setSort(e.target.value as RentSort)} className="w-44">
                <option value="newest">최신순</option>
                <option value="priceAsc">가격 낮은순</option>
                <option value="priceDesc">가격 높은순</option>
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
              <RentCardGrid items={listQuery.data.items} />
              {listQuery.data.totalPages > 1 ? (
                <Pagination page={listQuery.data.page} totalPages={listQuery.data.totalPages} onPageChange={(p) => setPage(p)} />
              ) : null}
            </>
          ) : (
            <EmptyState title="차량이 없습니다" />
          )}
        </section>
      </div>
    </div>
  );
}

