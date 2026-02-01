"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { CardSkeleton } from "@/components/common/CardSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SectionTitle } from "@/components/common/SectionTitle";
import { CarCardHorizontal } from "@/components/cars/CarCardHorizontal";
import { BrandSelect } from "@/components/filters/BrandSelect";
import { RangeSelect } from "@/components/filters/RangeSelect";
import { VehicleSortPills } from "@/components/listings/SortPills";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/context/I18nContext";
import { fetchCarTaxonomy, fetchCarsList, fetchModelCounts, type CarsSort } from "@/lib/mockApi";

function firstString(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export function BuyAllClient({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const { t, lang } = useI18n();
  const router = useRouter();

  const [page, setPage] = React.useState<number>(() => Number(firstString(searchParams.page)) || 1);
  const [sort, setSort] = React.useState<CarsSort>(() => (firstString(searchParams.sort) as CarsSort) || "newest");

  // Sidebar filters (URL-synced)
  const [manufacturer, setManufacturer] = React.useState<string | null>(firstString(searchParams.manufacturer) || null);
  const [modelSearch, setModelSearch] = React.useState("");
  const [model, setModel] = React.useState(firstString(searchParams.model) ?? "");
  const [yearMin, setYearMin] = React.useState<number | null>(() => {
    const val = firstString(searchParams.yearMin);
    return val ? Number(val) : null;
  });
  const [yearMax, setYearMax] = React.useState<number | null>(() => {
    const val = firstString(searchParams.yearMax);
    return val ? Number(val) : null;
  });
  const [importYearMin, setImportYearMin] = React.useState<number | null>(() => {
    const val = firstString(searchParams.importYearMin);
    return val ? Number(val) : null;
  });
  const [importYearMax, setImportYearMax] = React.useState<number | null>(() => {
    const val = firstString(searchParams.importYearMax);
    return val ? Number(val) : null;
  });
  const [mileageMinKm, setMileageMinKm] = React.useState<number | null>(() => {
    const val = firstString(searchParams.mileageMinKm);
    return val ? Number(val) : null;
  });
  const [mileageMaxKm, setMileageMaxKm] = React.useState<number | null>(() => {
    const val = firstString(searchParams.mileageMaxKm);
    return val ? Number(val) : null;
  });
  const [priceMinMnt, setPriceMinMnt] = React.useState<number | null>(() => {
    const val = firstString(searchParams.priceMinMnt);
    return val ? Number(val) : null;
  });
  const [priceMaxMnt, setPriceMaxMnt] = React.useState<number | null>(() => {
    const val = firstString(searchParams.priceMaxMnt);
    return val ? Number(val) : null;
  });
  const [fuel, setFuel] = React.useState(firstString(searchParams.fuel) ?? "all");
  const [transmission, setTransmission] = React.useState(firstString(searchParams.transmission) ?? "all");
  const [color, setColor] = React.useState(firstString(searchParams.color) ?? "all");
  const [regionGroup, setRegionGroup] = React.useState(firstString(searchParams.region) ?? "");
  const [sellerId, setSellerId] = React.useState<string | null>(firstString(searchParams.sellerId) || null);

  React.useEffect(() => setPage(1), [
    sort,
    manufacturer,
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
    transmission,
    color,
    regionGroup,
    sellerId,
  ]);

  // Keep filters/sort in URL (future backend integration)
  React.useEffect(() => {
    const sp = new URLSearchParams();
    if (page > 1) sp.set("page", String(page));
    if (sort !== "newest") sp.set("sort", sort);
    if (manufacturer) sp.set("manufacturer", manufacturer);
    if (model) sp.set("model", model);
    if (yearMin !== null) sp.set("yearMin", String(yearMin));
    if (yearMax !== null) sp.set("yearMax", String(yearMax));
    if (importYearMin !== null) sp.set("importYearMin", String(importYearMin));
    if (importYearMax !== null) sp.set("importYearMax", String(importYearMax));
    if (mileageMinKm !== null) sp.set("mileageMinKm", String(mileageMinKm));
    if (mileageMaxKm !== null) sp.set("mileageMaxKm", String(mileageMaxKm));
    if (priceMinMnt !== null) sp.set("priceMinMnt", String(priceMinMnt));
    if (priceMaxMnt !== null) sp.set("priceMaxMnt", String(priceMaxMnt));
    if (fuel !== "all") sp.set("fuel", fuel);
    if (transmission !== "all") sp.set("transmission", transmission);
    if (color !== "all") sp.set("color", color);
    if (regionGroup) sp.set("region", regionGroup);
    if (sellerId) sp.set("sellerId", sellerId);
    router.replace(`/buy/all?${sp.toString()}`, { scroll: false });
  }, [router, page, sort, manufacturer, model, yearMin, yearMax, importYearMin, importYearMax, mileageMinKm, mileageMaxKm, priceMinMnt, priceMaxMnt, fuel, transmission, color, regionGroup, sellerId]);

  const taxonomyQuery = useQuery({
    queryKey: ["cars", "taxonomy"],
    queryFn: fetchCarTaxonomy,
  });

  // Query to get all items (excluding brand filter) for brand count calculation
  const baseItemsQuery = useQuery({
    queryKey: [
      "cars",
      "list",
      "baseItems",
      { sort, model, yearMin, yearMax, importYearMin, importYearMax, mileageMinKm, mileageMaxKm, priceMinMnt, priceMaxMnt, fuel, transmission, color, regionGroup },
    ],
    queryFn: () =>
      fetchCarsList({
        sort,
        page: 1,
        pageSize: 10000, // Large page size to get all items for count calculation
        model: model || undefined,
        yearMin: yearMin ?? undefined,
        yearMax: yearMax ?? undefined,
        importYearMin: importYearMin ?? undefined,
        importYearMax: importYearMax ?? undefined,
        mileageMinKm: mileageMinKm ?? undefined,
        mileageMaxKm: mileageMaxKm ?? undefined,
        priceMinMnt: priceMinMnt ?? undefined,
        priceMaxMnt: priceMaxMnt ?? undefined,
        fuel: fuel as any,
        transmission: transmission as any,
        color: color as any,
        regionGroup: (regionGroup as any) || "",
        // manufacturer filter is intentionally excluded
      }),
  });

  const modelCountsQuery = useQuery({
    queryKey: ["cars", "modelCounts", { manufacturer, yearMin, yearMax, importYearMin, importYearMax, mileageMinKm, mileageMaxKm, priceMinMnt, priceMaxMnt, fuel, transmission, color, regionGroup }],
    queryFn: () =>
      fetchModelCounts({
        manufacturer: manufacturer || undefined,
        yearMin: yearMin ?? undefined,
        yearMax: yearMax ?? undefined,
        importYearMin: importYearMin ?? undefined,
        importYearMax: importYearMax ?? undefined,
        mileageMinKm: mileageMinKm ?? undefined,
        mileageMaxKm: mileageMaxKm ?? undefined,
        priceMinMnt: priceMinMnt ?? undefined,
        priceMaxMnt: priceMaxMnt ?? undefined,
        fuel: fuel as any,
        transmission: transmission as any,
        color: color as any,
        regionGroup: (regionGroup as any) || "",
      }),
  });

  const listQuery = useQuery({
    queryKey: [
      "cars",
      "list",
      { sort, page, manufacturer, model, yearMin, yearMax, importYearMin, importYearMax, mileageMinKm, mileageMaxKm, priceMinMnt, priceMaxMnt, fuel, transmission, color, regionGroup, sellerId },
    ],
    queryFn: () =>
      fetchCarsList({
        sort,
        page,
        pageSize: 12,
        manufacturer: manufacturer || undefined,
        model: model || undefined,
        yearMin: yearMin ?? undefined,
        yearMax: yearMax ?? undefined,
        importYearMin: importYearMin ?? undefined,
        importYearMax: importYearMax ?? undefined,
        mileageMinKm: mileageMinKm ?? undefined,
        mileageMaxKm: mileageMaxKm ?? undefined,
        priceMinMnt: priceMinMnt ?? undefined,
        priceMaxMnt: priceMaxMnt ?? undefined,
        fuel: fuel as any,
        transmission: transmission as any,
        color: color as any,
        regionGroup: (regionGroup as any) || "",
        sellerId: sellerId || undefined,
      }),
  });

  return (
    <div className="grid gap-6">
      <SectionTitle title={t("buyAll_title")} />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr] items-start">
        <aside className="rounded-2xl border border-zinc-200 bg-white p-4 h-auto self-start">
          <div className="text-sm font-normal text-zinc-900">{t("buyAll_filters_title")}</div>

          <div className="mt-3 grid gap-3">
            <label className="grid gap-1 overflow-visible">
              <span className="text-xs font-normal text-zinc-600">{t("filters_brand_placeholder")}</span>
              <BrandSelect
                options={taxonomyQuery.data?.manufacturers ?? []}
                value={manufacturer}
                onChange={setManufacturer}
                items={baseItemsQuery.data?.items ?? []}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll_filters_models")}</span>
              <Input value={modelSearch} onChange={(e) => setModelSearch(e.target.value)} placeholder={t("buyAll_filters_searchModelsPlaceholder")} />
              <div className="max-h-56 overflow-auto rounded-xl border border-zinc-200 p-2">
                <button
                  type="button"
                  className={`w-full rounded-lg px-2 py-2 text-left text-sm font-normal hover:bg-zinc-50 ${!model ? "bg-zinc-100" : ""}`}
                  onClick={() => setModel("")}
                >
                  {t("buyAll_filters_allModels")}
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

            <RangeSelect
              label={t("filters_year_label")}
              fromValue={yearMin}
              toValue={yearMax}
              onFromChange={setYearMin}
              onToChange={setYearMax}
              options={Array.from({ length: 2026 - 1990 + 1 }, (_, i) => 2026 - i).map((year) => ({
                value: year,
                label: String(year),
              }))}
            />

            <RangeSelect
              label={t("filters_importYear_label")}
              fromValue={importYearMin}
              toValue={importYearMax}
              onFromChange={setImportYearMin}
              onToChange={setImportYearMax}
              options={Array.from({ length: 2026 - 1990 + 1 }, (_, i) => 2026 - i).map((year) => ({
                value: year,
                label: String(year),
              }))}
            />

            <RangeSelect
              label={t("filters_mileage_label")}
              fromValue={mileageMinKm}
              toValue={mileageMaxKm}
              onFromChange={setMileageMinKm}
              onToChange={setMileageMaxKm}
              fromLabelKey="common_min"
              toLabelKey="common_max"
              options={[10000, 25000, 50000, 75000, 100000, 125000, 150000, 200000, 250000, 300000].map((km) => {
                const formatted = Intl.NumberFormat("en-US").format(km);
                const label = lang === "ko" ? `${formatted}km` : lang === "mn" ? `${formatted}км` : `${formatted} km`;
                return {
                  value: km,
                  label,
                };
              })}
            />

            <RangeSelect
              label={t("filters_price_label")}
              fromValue={priceMinMnt}
              toValue={priceMaxMnt}
              onFromChange={setPriceMinMnt}
              onToChange={setPriceMaxMnt}
              fromLabelKey="common_min"
              toLabelKey="common_max"
              options={[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((saya) => ({
                value: saya * 1_000_000,
                label: lang === "en" ? `${saya}M` : `${saya} сая`,
              }))}
            />

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll_filters_fuel")}</span>
              <Select value={fuel} onChange={(e) => setFuel(e.target.value)}>
                <option value="all">{t("common_all")}</option>
                <option value="gasoline">{t("buyAll_option_fuel_gasoline")}</option>
                <option value="diesel">{t("buyAll_option_fuel_diesel")}</option>
                <option value="lpg">{t("buyAll_option_fuel_lpg")}</option>
                <option value="electric">{t("buyAll_option_fuel_electric")}</option>
                <option value="hybrid">{t("buyAll_option_fuel_hybrid")}</option>
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll_filters_transmission")}</span>
              <Select value={transmission} onChange={(e) => setTransmission(e.target.value)}>
                <option value="all">{t("common_all")}</option>
                <option value="at">{t("buyAll_option_trans_at")}</option>
                <option value="mt">{t("buyAll_option_trans_mt")}</option>
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll_filters_color")}</span>
              <Select value={color} onChange={(e) => setColor(e.target.value)}>
                <option value="all">{t("common_all")}</option>
                <option value="black">{t("buyAll_option_color_black")}</option>
                <option value="white">{t("buyAll_option_color_white")}</option>
                <option value="silver">{t("buyAll_option_color_silver")}</option>
                <option value="pearl">{t("buyAll_option_color_pearl")}</option>
                <option value="gray">{t("buyAll_option_color_gray")}</option>
                <option value="darkgray">{t("buyAll_option_color_darkgray")}</option>
                <option value="green">{t("buyAll_option_color_green")}</option>
                <option value="blue">{t("buyAll_option_color_blue")}</option>
                <option value="other">{t("buyAll_option_color_other")}</option>
              </Select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-normal text-zinc-600">{t("buyAll_filters_region")}</span>
              <Select value={regionGroup} onChange={(e) => setRegionGroup(e.target.value)}>
                <option value="">{t("common_all")}</option>
                <option value="Ulaanbaatar">{t("buyAll_option_region_ua")}</option>
                <option value="Erdenet">{t("buyAll_option_region_erdenet")}</option>
                <option value="Darkhan">{t("buyAll_option_region_darkhan")}</option>
                <option value="Other">{t("buyAll_option_region_other")}</option>
              </Select>
            </label>
          </div>
        </aside>

        <section className="grid gap-3">
          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-start">
            <VehicleSortPills value={sort} onChange={setSort} />
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
            <EmptyState title={t("common_noVehicles")} description={t("common_tryAdjustingFilters")} />
          )}
        </section>
      </div>
    </div>
  );
}


