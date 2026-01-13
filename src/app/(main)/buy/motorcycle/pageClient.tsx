"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { CardSkeleton } from "@/components/common/CardSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SectionTitle } from "@/components/common/SectionTitle";
import { CarCardHorizontal } from "@/components/cars/CarCardHorizontal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/context/I18nContext";
import { fetchMotorcycleModelCounts, fetchMotorcyclesList, type CarsSort } from "@/lib/mockApi";

function firstString(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export function MotorcycleAllClient({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const { t } = useI18n();
  const router = useRouter();

  const [page, setPage] = React.useState<number>(() => Number(firstString(searchParams.page)) || 1);
  const [sort, setSort] = React.useState<CarsSort>(() => (firstString(searchParams.sort) as CarsSort) || "newest");

  // Sidebar filters (URL-synced)
  const [modelText, setModelText] = React.useState(firstString(searchParams.modelText) ?? "");
  const [modelSearch, setModelSearch] = React.useState("");
  const [model, setModel] = React.useState(firstString(searchParams.model) ?? "");
  const [yearMin, setYearMin] = React.useState(firstString(searchParams.yearMin) ?? "");
  const [yearMax, setYearMax] = React.useState(firstString(searchParams.yearMax) ?? "");
  const [importYearMin, setImportYearMin] = React.useState(firstString(searchParams.importYearMin) ?? "");
  const [importYearMax, setImportYearMax] = React.useState(firstString(searchParams.importYearMax) ?? "");
  const [mileageMinKm, setMileageMinKm] = React.useState(firstString(searchParams.mileageMinKm) ?? "");
  const [mileageMaxKm, setMileageMaxKm] = React.useState(firstString(searchParams.mileageMaxKm) ?? "");
  const [priceMinMnt, setPriceMinMnt] = React.useState(firstString(searchParams.priceMinMnt) ?? "");
  const [priceMaxMnt, setPriceMaxMnt] = React.useState(firstString(searchParams.priceMaxMnt) ?? "");
  const [fuel, setFuel] = React.useState(firstString(searchParams.fuel) ?? "all");
  const [color, setColor] = React.useState(firstString(searchParams.color) ?? "all");
  const [regionGroup, setRegionGroup] = React.useState(firstString(searchParams.region) ?? "");

  React.useEffect(() => setPage(1), [
    sort,
    modelText,
    model,
    yearMin,
    yearMax,
    importYearMin,
    importYearMax,
    mileageMinKm,
    mileageMaxKm,
    priceMinMnt,
    priceMaxMnt,
    fuel,
    color,
    regionGroup,
  ]);

  // Keep filters/sort in URL (future backend integration)
  React.useEffect(() => {
    const sp = new URLSearchParams();
    if (page > 1) sp.set("page", String(page));
    if (sort !== "newest") sp.set("sort", sort);
    if (modelText.trim()) sp.set("modelText", modelText.trim());
    if (model) sp.set("model", model);
    if (yearMin) sp.set("yearMin", yearMin);
    if (yearMax) sp.set("yearMax", yearMax);
    if (importYearMin) sp.set("importYearMin", importYearMin);
    if (importYearMax) sp.set("importYearMax", importYearMax);
    if (mileageMinKm) sp.set("mileageMinKm", mileageMinKm);
    if (mileageMaxKm) sp.set("mileageMaxKm", mileageMaxKm);
    if (priceMinMnt) sp.set("priceMinMnt", priceMinMnt);
    if (priceMaxMnt) sp.set("priceMaxMnt", priceMaxMnt);
    if (fuel !== "all") sp.set("fuel", fuel);
    if (color !== "all") sp.set("color", color);
    if (regionGroup) sp.set("region", regionGroup);
    router.replace(`/buy/motorcycle?${sp.toString()}`, { scroll: false });
  }, [router, page, sort, modelText, model, yearMin, yearMax, importYearMin, importYearMax, mileageMinKm, mileageMaxKm, priceMinMnt, priceMaxMnt, fuel, color, regionGroup]);

  const modelCountsQuery = useQuery({
    queryKey: ["motorcycles", "modelCounts", { modelText, yearMin, yearMax, importYearMin, importYearMax, mileageMinKm, mileageMaxKm, priceMinMnt, priceMaxMnt, fuel, color, regionGroup }],
    queryFn: () =>
      fetchMotorcycleModelCounts({
        modelText: modelText || undefined,
        yearMin: yearMin ? Number(yearMin) : undefined,
        yearMax: yearMax ? Number(yearMax) : undefined,
        importYearMin: importYearMin ? Number(importYearMin) : undefined,
        importYearMax: importYearMax ? Number(importYearMax) : undefined,
        mileageMinKm: mileageMinKm ? Number(mileageMinKm) : undefined,
        mileageMaxKm: mileageMaxKm ? Number(mileageMaxKm) : undefined,
        priceMinMnt: priceMinMnt ? Number(priceMinMnt) : undefined,
        priceMaxMnt: priceMaxMnt ? Number(priceMaxMnt) : undefined,
        fuel: fuel as any,
        color: color as any,
        regionGroup: (regionGroup as any) || "",
      }),
  });

  const listQuery = useQuery({
    queryKey: ["motorcycles", "list", { sort, page, modelText, model, yearMin, yearMax, importYearMin, importYearMax, mileageMinKm, mileageMaxKm, priceMinMnt, priceMaxMnt, fuel, color, regionGroup }],
    queryFn: () =>
      fetchMotorcyclesList({
        sort,
        page,
        pageSize: 12,
        modelText: modelText || undefined,
        model: model || undefined,
        yearMin: yearMin ? Number(yearMin) : undefined,
        yearMax: yearMax ? Number(yearMax) : undefined,
        importYearMin: importYearMin ? Number(importYearMin) : undefined,
        importYearMax: importYearMax ? Number(importYearMax) : undefined,
        mileageMinKm: mileageMinKm ? Number(mileageMinKm) : undefined,
        mileageMaxKm: mileageMaxKm ? Number(mileageMaxKm) : undefined,
        priceMinMnt: priceMinMnt ? Number(priceMinMnt) : undefined,
        priceMaxMnt: priceMaxMnt ? Number(priceMaxMnt) : undefined,
        fuel: fuel as any,
        color: color as any,
        regionGroup: (regionGroup as any) || "",
      }),
  });

  return (
    <div className="grid gap-6">
      <SectionTitle title="전체 오토바이" subtitle={t("buyAll.subtitle")} />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr] items-start">
        <aside className="rounded-2xl border border-zinc-200 bg-white p-4 h-auto self-start">
          <div className="text-sm font-normal text-zinc-900">{t("buyAll.filters.title")}</div>

          <div className="mt-3 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll.filters.modelNameSearch")}</span>
              <Input value={modelText} onChange={(e) => setModelText(e.target.value)} placeholder={t("buyAll.filters.modelNamePlaceholder")} />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll.filters.models")}</span>
              <Input value={modelSearch} onChange={(e) => setModelSearch(e.target.value)} placeholder={t("buyAll.filters.searchModelsPlaceholder")} />
              <div className="max-h-56 overflow-auto rounded-xl border border-zinc-200 p-2">
                <button
                  type="button"
                  className={`w-full rounded-lg px-2 py-2 text-left text-sm font-normal hover:bg-zinc-50 ${!model ? "bg-zinc-100" : ""}`}
                  onClick={() => setModel("")}
                >
                  {t("buyAll.filters.allModels")}
                </button>
                {(modelCountsQuery.data ?? [])
                  .filter((m) => !modelSearch.trim() || m.model.toLowerCase().includes(modelSearch.trim().toLowerCase()))
                  .map((m) => (
                    <button
                      key={m.model}
                      type="button"
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-zinc-50 ${model === m.model ? "bg-zinc-100 font-normal" : ""}`}
                      onClick={() => setModel(m.model)}
                    >
                      <span className="truncate">{m.model}</span>
                      <span className="ml-2 text-xs font-normal text-zinc-600">{m.count}</span>
                    </button>
                  ))}
              </div>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-normal text-zinc-600">{t("buyAll.filters.yearMin")}</span>
                <Input value={yearMin} onChange={(e) => setYearMin(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-normal text-zinc-600">{t("buyAll.filters.yearMax")}</span>
                <Input value={yearMax} onChange={(e) => setYearMax(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-normal text-zinc-600">{t("buyAll.filters.importYearMin")}</span>
                <Input value={importYearMin} onChange={(e) => setImportYearMin(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-normal text-zinc-600">{t("buyAll.filters.importYearMax")}</span>
                <Input value={importYearMax} onChange={(e) => setImportYearMax(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-normal text-zinc-600">{t("buyAll.filters.mileageMin")}</span>
                <Input value={mileageMinKm} onChange={(e) => setMileageMinKm(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-normal text-zinc-600">{t("buyAll.filters.mileageMax")}</span>
                <Input value={mileageMaxKm} onChange={(e) => setMileageMaxKm(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
              </label>
            </div>

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
              <span className="text-xs font-normal text-zinc-600">{t("buyAll.filters.fuel")}</span>
              <Select value={fuel} onChange={(e) => setFuel(e.target.value)}>
                <option value="all">{t("common.all")}</option>
                <option value="gasoline">{t("buyAll.option.fuel.gasoline")}</option>
                <option value="electric">{t("buyAll.option.fuel.electric")}</option>
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll.filters.color")}</span>
              <Select value={color} onChange={(e) => setColor(e.target.value)}>
                <option value="all">{t("common.all")}</option>
                <option value="black">{t("buyAll.option.color.black")}</option>
                <option value="white">{t("buyAll.option.color.white")}</option>
                <option value="silver">{t("buyAll.option.color.silver")}</option>
                <option value="pearl">{t("buyAll.option.color.pearl")}</option>
                <option value="gray">{t("buyAll.option.color.gray")}</option>
                <option value="darkgray">{t("buyAll.option.color.darkgray")}</option>
                <option value="green">{t("buyAll.option.color.green")}</option>
                <option value="blue">{t("buyAll.option.color.blue")}</option>
                <option value="other">{t("buyAll.option.color.other")}</option>
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll.filters.region")}</span>
              <Select value={regionGroup} onChange={(e) => setRegionGroup(e.target.value)}>
                <option value="">{t("common.all")}</option>
                <option value="Ulaanbaatar">{t("buyAll.option.region.ua")}</option>
                <option value="Erdenet">{t("buyAll.option.region.erdenet")}</option>
                <option value="Darkhan">{t("buyAll.option.region.darkhan")}</option>
                <option value="Other">{t("buyAll.option.region.other")}</option>
              </Select>
            </label>
          </div>
        </aside>

        <section className="grid gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-normal text-zinc-900">
              {listQuery.data ? t("buyAll.results", { count: listQuery.data.total }) : t("common.loading")}
            </div>
            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll.sort.label")}</span>
              <Select value={sort} onChange={(e) => setSort(e.target.value as CarsSort)} className="w-44">
                <option value="newest">{t("buyAll.sort.newest")}</option>
                <option value="priceAsc">{t("buyAll.sort.priceAsc")}</option>
                <option value="priceDesc">{t("buyAll.sort.priceDesc")}</option>
                <option value="mileageAsc">{t("buyAll.sort.mileageAsc")}</option>
              </Select>
            </label>
          </div>

          {listQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : listQuery.data?.items?.length ? (
            <div className="grid gap-3">
              {listQuery.data.items.map((c) => (
                <CarCardHorizontal key={c.id} car={c} />
              ))}
              <Pagination page={listQuery.data.page} totalPages={listQuery.data.totalPages} onPageChange={setPage} />
            </div>
          ) : (
            <EmptyState title={t("common.noVehicles")} description={t("common.tryAdjustingFilters")} />
          )}
        </section>
      </div>
    </div>
  );
}


