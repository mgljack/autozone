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
import { SortPills } from "@/components/listings/SortPills";
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
  const [sellerId, setSellerId] = React.useState<string | null>(firstString(searchParams.sellerId) || null);

  React.useEffect(() => setPage(1), [sort, searchQuery, carModel, motorcycleModel, accessoryType, priceMinMnt, priceMaxMnt, sellerId]);

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
    if (sellerId) sp.set("sellerId", sellerId);
    router.replace(`/buy/parts?${sp.toString()}`, { scroll: false });
  }, [router, page, sort, searchQuery, carModel, motorcycleModel, accessoryType, priceMinMnt, priceMaxMnt, sellerId]);

  const carModelsQuery = useQuery({
    queryKey: ["parts", "carModels"],
    queryFn: () => fetchCarModelsForParts(),
  });

  const motorcycleModelsQuery = useQuery({
    queryKey: ["parts", "motorcycleModels"],
    queryFn: () => fetchMotorcycleModelsForParts(),
  });

  const listQuery = useQuery({
    queryKey: ["parts", "list", { sort, page, searchQuery, carModel, motorcycleModel, accessoryType, priceMinMnt, priceMaxMnt, sellerId }],
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
        sellerId: sellerId || undefined,
      }),
  });

  return (
    <div className="grid gap-6">
      <SectionTitle title={t("parts_title")} subtitle={t("parts_subtitle")} />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr] items-start">
        <aside className="rounded-2xl border border-zinc-200 bg-white p-4 h-auto self-start">
          <div className="text-sm font-normal text-zinc-900">{t("parts_filters_title")}</div>

          <div className="mt-3 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("parts_filters_search")}</span>
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("parts_filters_searchPlaceholder")} />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("parts_filters_allModels")}</span>
              <Select value={carModel} onChange={(e) => setCarModel(e.target.value)}>
                <option value="all">{t("parts_filters_allModels")}</option>
                {(carModelsQuery.data ?? []).map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("parts_filters_allMotorcycleModels")}</span>
              <Select value={motorcycleModel} onChange={(e) => setMotorcycleModel(e.target.value)}>
                <option value="all">{t("parts_filters_allMotorcycleModels")}</option>
                {(motorcycleModelsQuery.data ?? []).map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("parts_filters_accessory")}</span>
              <Select value={accessoryType} onChange={(e) => setAccessoryType(e.target.value as any)}>
                <option value="all">{t("common_all")}</option>
                <option value="seat-cover">{t("parts_filters_accessory_seatCover")}</option>
                <option value="camera">{t("parts_filters_accessory_camera")}</option>
                <option value="floor-mat">{t("parts_filters_accessory_floorMat")}</option>
                <option value="jump-starter">{t("parts_filters_accessory_jumpStarter")}</option>
                <option value="other">{t("buyAll_option_color_other")}</option>
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
          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-start">
            <SortPills
              value={sort}
              onChange={setSort}
              options={[
                { key: "newest", labelKey: "common_sort_newest" },
                { key: "priceAsc", labelKey: "buyAll_sort_priceAsc" },
                { key: "priceDesc", labelKey: "buyAll_sort_priceDesc" },
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
            <EmptyState title={t("parts_emptyState")} />
          )}
        </section>
      </div>
    </div>
  );
}

