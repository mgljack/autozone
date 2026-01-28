"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { CardSkeleton } from "@/components/common/CardSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SectionTitle } from "@/components/common/SectionTitle";
import { PartCard } from "@/components/parts/PartCard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/context/I18nContext";
import { fetchPartsList, fetchCarModelsForParts, fetchMotorcycleModelsForParts, type PartsListQuery } from "@/lib/mockApi";

function firstString(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

type PartsSort = "newest" | "priceAsc" | "priceDesc";

export function PartsClient({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const { t } = useI18n();
  const router = useRouter();

  const [page, setPage] = React.useState<number>(() => Number(firstString(searchParams.page)) || 1);
  const [sort, setSort] = React.useState<PartsSort>(() => (firstString(searchParams.sort) as PartsSort) || "newest");

  // Sidebar filters (URL-synced)
  const [searchQuery, setSearchQuery] = React.useState(firstString(searchParams.q) ?? "");
  const [carModel, setCarModel] = React.useState(firstString(searchParams.carModel) ?? "all");
  const [motorcycleModel, setMotorcycleModel] = React.useState(firstString(searchParams.motorcycleModel) ?? "all");
  const [accessoryType, setAccessoryType] = React.useState<"seat-cover" | "camera" | "floor-mat" | "jump-starter" | "other" | "all">(
    () => (firstString(searchParams.accessoryType) as any) || "all",
  );
  const [priceMinMnt, setPriceMinMnt] = React.useState(firstString(searchParams.priceMinMnt) ?? "");
  const [priceMaxMnt, setPriceMaxMnt] = React.useState(firstString(searchParams.priceMaxMnt) ?? "");

  React.useEffect(() => setPage(1), [sort, searchQuery, carModel, motorcycleModel, accessoryType, priceMinMnt, priceMaxMnt]);

  // Keep filters/sort in URL
  React.useEffect(() => {
    const sp = new URLSearchParams();
    if (page > 1) sp.set("page", String(page));
    if (sort !== "newest") sp.set("sort", sort);
    if (searchQuery.trim()) sp.set("q", searchQuery.trim());
    if (carModel !== "all") sp.set("carModel", carModel);
    if (motorcycleModel !== "all") sp.set("motorcycleModel", motorcycleModel);
    if (accessoryType !== "all") sp.set("accessoryType", accessoryType);
    if (priceMinMnt) sp.set("priceMinMnt", priceMinMnt);
    if (priceMaxMnt) sp.set("priceMaxMnt", priceMaxMnt);
    router.replace(`/buy/parts?${sp.toString()}`, { scroll: false });
  }, [router, page, sort, searchQuery, carModel, motorcycleModel, accessoryType, priceMinMnt, priceMaxMnt]);

  const carModelsQuery = useQuery({
    queryKey: ["parts", "carModels"],
    queryFn: () => fetchCarModelsForParts(),
  });

  const motorcycleModelsQuery = useQuery({
    queryKey: ["parts", "motorcycleModels"],
    queryFn: () => fetchMotorcycleModelsForParts(),
  });

  const listQuery = useQuery({
    queryKey: ["parts", "list", { sort, page, searchQuery, carModel, motorcycleModel, accessoryType, priceMinMnt, priceMaxMnt }],
    queryFn: () =>
      fetchPartsList({
        sort,
        page,
        pageSize: 12,
        q: searchQuery || undefined,
        carModel: carModel !== "all" ? carModel : undefined,
        motorcycleModel: motorcycleModel !== "all" ? motorcycleModel : undefined,
        accessoryType: accessoryType !== "all" ? accessoryType : undefined,
        priceMinMnt: priceMinMnt ? Number(priceMinMnt) : undefined,
        priceMaxMnt: priceMaxMnt ? Number(priceMaxMnt) : undefined,
      }),
  });

  return (
    <div className="grid gap-6">
      <SectionTitle title="부품" subtitle="차량 부품 및 액세서리를 검색하세요" />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr] items-start">
        <aside className="rounded-2xl border border-zinc-200 bg-white p-4 h-auto self-start">
          <div className="text-sm font-normal text-zinc-900">필터</div>

          <div className="mt-3 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">부품을 검색하세요</span>
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="부품명 검색" />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">전체 모델</span>
              <Select value={carModel} onChange={(e) => setCarModel(e.target.value)}>
                <option value="all">전체 모델</option>
                {(carModelsQuery.data ?? []).map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">전체 오토바이 모델</span>
              <Select value={motorcycleModel} onChange={(e) => setMotorcycleModel(e.target.value)}>
                <option value="all">전체 오토바이 모델</option>
                {(motorcycleModelsQuery.data ?? []).map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">액세서리</span>
              <Select value={accessoryType} onChange={(e) => setAccessoryType(e.target.value as any)}>
                <option value="all">전체</option>
                <option value="seat-cover">시트 커버</option>
                <option value="camera">카메라</option>
                <option value="floor-mat">바닥 매트</option>
                <option value="jump-starter">점프 스타터</option>
                <option value="other">기타</option>
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
          </div>
        </aside>

        <section className="grid gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-normal text-zinc-900">
              {listQuery.data ? t("common_total", { count: listQuery.data.total }) : t("common_loading")}
            </div>
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll_sort_label")}</span>
              <Select value={sort} onChange={(e) => setSort(e.target.value as PartsSort)} className="w-44">
                <option value="newest">{t("common_sort_newest")}</option>
                <option value="priceAsc">{t("buyAll_sort_priceAsc")}</option>
                <option value="priceDesc">{t("buyAll_sort_priceDesc")}</option>
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
                {listQuery.data.items.map((part) => (
                  <PartCard key={part.id} part={part} />
                ))}
              </div>
              {listQuery.data.totalPages > 1 ? (
                <Pagination page={listQuery.data.page} totalPages={listQuery.data.totalPages} onPageChange={(p) => setPage(p)} />
              ) : null}
            </>
          ) : (
            <EmptyState title="부품이 없습니다" />
          )}
        </section>
      </div>
    </div>
  );
}

