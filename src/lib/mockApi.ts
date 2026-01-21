import {
  cars,
  motorcycles,
  tires,
  parts,
  sampleCarImage,
  sampleSilverCarImage,
  type Car,
  type Fuel,
  type Motorcycle,
  type Part,
  type Region,
  type Steering,
  type Tier,
  type Tire,
  type Transmission,
} from "@/mock/cars";
import { centers, type Center } from "@/mock/centers";
import { media, type MediaItem } from "@/mock/media";
import { rentItems, type RentItem, type RentType } from "@/mock/rent";

export type { RentType };
import { readLocalStorage } from "@/lib/storage";
import type { MyListing } from "@/features/sell/types";
import type { CarDetailDTO, CarListItemDTO, CenterDTO, MediaDTO, PartDetailDTO, PartListItemDTO, TireDetailDTO, TireListItemDTO } from "@/lib/apiTypes";

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function mockApi<T>(value: T, minMs = 300, maxMs = 600): Promise<T> {
  const ms = randomInt(minMs, maxMs);
  return await new Promise((resolve) => {
    setTimeout(() => resolve(deepClone(value)), ms);
  });
}

export type HomeSections = {
  goldCars: CarListItemDTO[];
  silverCars: CarListItemDTO[];
  media: MediaDTO[];
  recentGeneralCars: CarListItemDTO[];
};

export async function fetchHomeSections(): Promise<HomeSections> {
  const published = getPublishedCarsFromLocalStorage();
  const merged = [...published, ...cars];

  // TODO: Replace with GET /home/sections
  const goldCars = merged.filter((c) => c.tier === "gold").slice(0, 6).map(toCarListItemDTO);
  const silverCars = merged.filter((c) => c.tier === "silver").slice(0, 6).map(toCarListItemDTO);
  const recentGeneralCars = merged
    .filter((c) => c.tier === "general")
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)
    .map(toCarListItemDTO);

  return await mockApi(
    {
      goldCars,
      silverCars,
      media: media.slice(0, 4).map(toMediaDTO), // Show 4 media items for home page
      recentGeneralCars,
    },
    300,
    600,
  );
}

export type CarsSort = "newest" | "priceAsc" | "priceDesc" | "mileageAsc" | "mileageDesc";

export type CarsListQuery = {
  q?: string;
  modelText?: string;
  manufacturer?: string;
  model?: string;
  subModel?: string;
  yearMin?: number;
  yearMax?: number;
  importYearMin?: number;
  importYearMax?: number;
  mileageMinKm?: number;
  mileageMaxKm?: number;
  priceMinMnt?: number;
  priceMaxMnt?: number;
  region?: Region | "";
  regionGroup?: "Ulaanbaatar" | "Erdenet" | "Darkhan" | "Other" | "";
  tier?: Tier | "all";
  fuel?: Fuel | "all";
  transmission?: Transmission | "all";
  steering?: Steering | "all";
  color?: "black" | "white" | "silver" | "pearl" | "gray" | "darkgray" | "green" | "blue" | "other" | "all";
  accident?: "all" | "yes" | "no";
  hasPlate?: "all" | "yes" | "no";
  sort?: CarsSort;
  page?: number;
  pageSize?: number;
};

export type CarsListResponse = {
  items: CarListItemDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function includesCI(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function tierRank(tier: Tier) {
  return tier === "gold" ? 0 : tier === "silver" ? 1 : 2;
}

function colorBucket(color: string): NonNullable<CarsListQuery["color"]> {
  const c = color.trim().toLowerCase();
  if (!c) return "other";
  if (c.includes("black")) return "black";
  if (c.includes("white")) return "white";
  if (c.includes("silver")) return "silver";
  if (c.includes("pearl")) return "pearl";
  if (c === "gray" || c.includes("grey")) return "gray";
  if (c.includes("dark") && (c.includes("gray") || c.includes("grey"))) return "darkgray";
  if (c.includes("green")) return "green";
  if (c.includes("blue")) return "blue";
  return "other";
}

function matchesRegionGroup(region: Region, group: NonNullable<CarsListQuery["regionGroup"]>) {
  if (!group) return true;
  if (group === "Ulaanbaatar") return region === "Улаанбаатар";
  if (group === "Erdenet") return region === "Эрдэнэт";
  if (group === "Darkhan") return region === "Дархан";
  return region !== "Улаанбаатар" && region !== "Эрдэнэт" && region !== "Дархан";
}

function applyCarFilters(all: Car[], query: CarsListQuery, opts?: { ignoreModel?: boolean; ignoreSubModel?: boolean }) {
  const {
    q,
    modelText,
    manufacturer,
    model,
    subModel,
    yearMin,
    yearMax,
    importYearMin,
    importYearMax,
    mileageMinKm,
    mileageMaxKm,
    priceMinMnt,
    priceMaxMnt,
    region,
    regionGroup,
    tier = "all",
    fuel = "all",
    transmission = "all",
    steering = "all",
    color = "all",
    accident = "all",
    hasPlate = "all",
  } = query;

  let filtered = all.slice();

  if (q && q.trim()) {
    const needle = q.trim();
    filtered = filtered.filter((c) => {
      const title = `${c.manufacturer} ${c.model} ${c.subModel}`;
      return includesCI(title, needle) || includesCI(c.description, needle) || includesCI(c.vin, needle);
    });
  }

  if (modelText && modelText.trim()) {
    const needle = modelText.trim();
    filtered = filtered.filter((c) => includesCI(`${c.model} ${c.subModel}`, needle));
  }

  if (manufacturer) filtered = filtered.filter((c) => c.manufacturer === manufacturer);
  if (!opts?.ignoreModel && model) filtered = filtered.filter((c) => c.model === model);
  if (!opts?.ignoreSubModel && subModel) filtered = filtered.filter((c) => c.subModel === subModel);

  if (typeof yearMin === "number") filtered = filtered.filter((c) => c.yearMade >= yearMin);
  if (typeof yearMax === "number") filtered = filtered.filter((c) => c.yearMade <= yearMax);
  if (typeof importYearMin === "number") filtered = filtered.filter((c) => c.yearImported >= importYearMin);
  if (typeof importYearMax === "number") filtered = filtered.filter((c) => c.yearImported <= importYearMax);
  if (typeof mileageMinKm === "number") filtered = filtered.filter((c) => c.mileageKm >= mileageMinKm);
  if (typeof mileageMaxKm === "number") filtered = filtered.filter((c) => c.mileageKm <= mileageMaxKm);
  if (typeof priceMinMnt === "number") filtered = filtered.filter((c) => c.priceMnt >= priceMinMnt);
  if (typeof priceMaxMnt === "number") filtered = filtered.filter((c) => c.priceMnt <= priceMaxMnt);

  if (region) filtered = filtered.filter((c) => c.region === region);
  if (regionGroup) {
    filtered = filtered.filter((c) => matchesRegionGroup(c.region, regionGroup));
  }

  if (tier !== "all") filtered = filtered.filter((c) => c.tier === tier);
  if (fuel !== "all") filtered = filtered.filter((c) => c.fuel === fuel);
  if (transmission !== "all") filtered = filtered.filter((c) => c.transmission === transmission);
  if (steering !== "all") filtered = filtered.filter((c) => c.steering === steering);
  if (color !== "all") filtered = filtered.filter((c) => colorBucket(c.color) === color);
  if (accident !== "all") filtered = filtered.filter((c) => c.accident === (accident === "yes"));
  if (hasPlate !== "all") filtered = filtered.filter((c) => c.hasPlate === (hasPlate === "yes"));

  return filtered;
}

export async function fetchCarsList(query: CarsListQuery = {}): Promise<CarsListResponse> {
  const {
    sort = "newest",
    tier = "all",
    page = 1,
    pageSize = 12,
  } = query;

  const published = getPublishedCarsFromLocalStorage();
  let filtered = applyCarFilters([...published, ...cars], query);

  // Listing order rule: Gold → Silver → General, always.
  filtered.sort((a, b) => {
    const tr = tierRank(a.tier) - tierRank(b.tier);
    if (tr !== 0) return tr;
    if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === "priceAsc") return a.priceMnt - b.priceMnt;
    if (sort === "priceDesc") return b.priceMnt - a.priceMnt;
    if (sort === "mileageAsc") return a.mileageKm - b.mileageKm;
    if (sort === "mileageDesc") return b.mileageKm - a.mileageKm;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  // TODO: Replace with GET /cars?... (query params)
  const items = filtered.slice(start, start + pageSize).map(toCarListItemDTO);

  return await mockApi({ items, total, page: safePage, pageSize, totalPages }, 300, 600);
}

export async function fetchCarById(id: string): Promise<CarDetailDTO | null> {
  // TODO: Replace with GET /cars/:id
  const published = getPublishedCarsFromLocalStorage();
  const found = published.find((c) => c.id === id) ?? cars.find((c) => c.id === id) ?? null;
  if (found) return await mockApi(toCarDetailDTO(found), 300, 600);

  const moto = motorcycles.find((m) => m.id === id) ?? null;
  return await mockApi(moto ? toMotorcycleDetailDTO(moto) : null, 300, 600);
}

export async function fetchMotorcyclesList(query: CarsListQuery = {}): Promise<CarsListResponse> {
  const {
    sort = "newest",
    tier = "all",
    page = 1,
    pageSize = 12,
  } = query;

  let filtered = applyMotorcycleFilters(motorcycles, query);

  // Tier order rule: Gold → Silver → General, always.
  filtered.sort((a, b) => {
    const tr = tierRank(a.tier) - tierRank(b.tier);
    if (tr !== 0) return tr;
    if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === "priceAsc") return a.priceMnt - b.priceMnt;
    if (sort === "priceDesc") return b.priceMnt - a.priceMnt;
    if (sort === "mileageAsc") return (a.mileageKm ?? 0) - (b.mileageKm ?? 0);
    if (sort === "mileageDesc") return (b.mileageKm ?? 0) - (a.mileageKm ?? 0);
    return 0;
  });

  if (tier !== "all") filtered = filtered.filter((c) => c.tier === tier);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  const items = filtered.slice(start, start + pageSize).map(toMotorcycleListItemDTO);
  return await mockApi({ items, total, page: safePage, pageSize, totalPages }, 300, 600);
}

export async function fetchMotorcycleModelCounts(query: CarsListQuery = {}): Promise<ModelCount[]> {
  const filtered = applyMotorcycleFilters(motorcycles, query, { ignoreModel: true });
  const map = new Map<string, number>();
  for (const m of filtered) {
    map.set(m.model, (map.get(m.model) ?? 0) + 1);
  }
  const res = Array.from(map.entries())
    .map(([model, count]) => ({ model, count }))
    .sort((a, b) => b.count - a.count || a.model.localeCompare(b.model));
  return await mockApi(res, 300, 600);
}

function applyMotorcycleFilters(
  all: Motorcycle[],
  query: CarsListQuery,
  opts?: { ignoreModel?: boolean },
) {
  const {
    q,
    modelText,
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
    region,
    regionGroup,
    fuel = "all",
    color = "all",
  } = query;

  let filtered = all.slice();

  if (q && q.trim()) {
    const needle = q.trim();
    filtered = filtered.filter((c) => includesCI(`${c.manufacturer} ${c.model} ${c.subModel}`, needle));
  }

  if (modelText && modelText.trim()) {
    const needle = modelText.trim();
    filtered = filtered.filter((c) => includesCI(`${c.model} ${c.subModel}`, needle));
  }

  if (manufacturer) filtered = filtered.filter((c) => c.manufacturer === manufacturer);
  if (!opts?.ignoreModel && model) filtered = filtered.filter((c) => c.model === model);

  if (typeof yearMin === "number") filtered = filtered.filter((c) => c.yearMade >= yearMin);
  if (typeof yearMax === "number") filtered = filtered.filter((c) => c.yearMade <= yearMax);
  if (typeof importYearMin === "number") filtered = filtered.filter((c) => c.yearImported >= importYearMin);
  if (typeof importYearMax === "number") filtered = filtered.filter((c) => c.yearImported <= importYearMax);
  if (typeof mileageMinKm === "number") filtered = filtered.filter((c) => (c.mileageKm ?? 0) >= mileageMinKm);
  if (typeof mileageMaxKm === "number") filtered = filtered.filter((c) => (c.mileageKm ?? 0) <= mileageMaxKm);
  if (typeof priceMinMnt === "number") filtered = filtered.filter((c) => c.priceMnt >= priceMinMnt);
  if (typeof priceMaxMnt === "number") filtered = filtered.filter((c) => c.priceMnt <= priceMaxMnt);

  if (region) filtered = filtered.filter((c) => c.region === region);
  if (regionGroup) {
    filtered = filtered.filter((c) => matchesRegionGroup(c.region, regionGroup));
  }

  // Motorcycle fuel options: gasoline, electric
  if (fuel !== "all") filtered = filtered.filter((c) => c.fuel === fuel);

  // Color filtering (missing color treated as "other")
  if (color !== "all") filtered = filtered.filter((c) => colorBucket(String((c as any).color ?? "")) === color);

  return filtered;
}

function normalizePriceMnt(raw: unknown): number {
  const s = String(raw ?? "").replace(/[^\d]/g, "");
  const n = Number(s || 0);
  return Number.isFinite(n) ? n : 0;
}

function mapRegionCode(code: string): Region {
  if (code === "Ulaanbaatar") return "Улаанбаатар";
  if (code === "Erdenet") return "Эрдэнэт";
  if (code === "Darkhan") return "Дархан";
  return "Хэнтий";
}

function seededImageIndex(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 20) + 1;
}

function getPublishedCarsFromLocalStorage(): Car[] {
  const list = readLocalStorage<MyListing[]>("myListings", []);
  const now = Date.now();

  const published = list
    .filter((x) => x.status === "published")
    .filter((x) => !x.expiresAt || new Date(x.expiresAt).getTime() > now)
    .filter((x) => x.draft.category === "car");

  return published.map((x) => {
    const d = x.draft as any;
    const imgN = seededImageIndex(x.id);
    return {
      category: "car",
      tier: (x.tier ?? "general") as Tier,
      id: x.id,
      sellerName: d.contactName || "Seller",
      sellerPhone: d.contactPhone || "-",
      manufacturer: d.manufacturer || "Unknown",
      model: d.model || "Unknown",
      subModel: d.subModel || String(d.yearMade || ""),
      yearMade: Number(d.yearMade || 0) || 0,
      yearImported: Number(d.yearImported || 0) || 0,
      mileageKm: Number(d.mileageKm || 0) || 0,
      priceMnt: normalizePriceMnt(d.priceMnt),
      fuel: (d.fuel || "gasoline") as Fuel,
      transmission: d.transmission === "manual" ? ("mt" as const) : ("at" as const),
      color: d.color || "White",
      accident: false,
      region: mapRegionCode(d.region || ""),
      createdAt: x.publishedAt ?? x.createdAt,
      images: [sampleCarImage(imgN), sampleCarImage(((imgN + 7) % 20) + 1)],
      description: d.memo || "",
      steering: (d.steering || "left") as Steering,
      vin: d.vin || `VIN_${x.id}`,
      hasPlate: d.hasPlate === "yes",
    };
  });
}

export async function fetchCenters(): Promise<CenterDTO[]> {
  // TODO: Replace with GET /centers
  return await mockApi(centers.map(toCenterDTO), 300, 600);
}

export async function fetchCenterById(id: string): Promise<CenterDTO | null> {
  // Check localStorage first
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("autozone.carCenters");
      if (stored) {
        const storedCenters = JSON.parse(stored);
        const found = storedCenters.find((c: any) => c.id === id);
        if (found) {
          // Convert stored center to CenterDTO format
          return toCenterDTOFromStored(found);
        }
      }
    } catch {
      // ignore
    }
  }
  
  // Fallback to mock data
  // TODO: Replace with GET /centers/:id
  const found = centers.find((c) => c.id === id) ?? null;
  return await mockApi(found ? toCenterDTO(found) : null, 300, 600);
}

export type CentersListQuery = {
  q?: string;
  serviceType?: string;
  regionGroup?: string;
  priceMinMnt?: number;
  priceMaxMnt?: number;
  ratingMin?: number;
  availability?: "now" | "next-week" | "all";
  sort?: "newest" | "ratingDesc" | "ratingAsc" | "nameAsc";
  page?: number;
  pageSize?: number;
};

export type CentersListResponse = {
  items: CenterDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function applyCenterFilters(all: (Center | any)[], query: CentersListQuery) {
  const { q, serviceType, regionGroup, priceMinMnt, priceMaxMnt, ratingMin, availability } = query;
  let filtered = all.slice();

  if (q && q.trim()) {
    const needle = q.trim();
    filtered = filtered.filter(
      (c) =>
        includesCI(c.name, needle) ||
        includesCI(c.address, needle) ||
        ((c as any).services || []).some((s: string) => includesCI(s, needle)),
    );
  }

  if (serviceType && serviceType !== "all") {
    filtered = filtered.filter((c) => ((c as any).services || []).some((s: string) => includesCI(s, serviceType)));
  }

  if (regionGroup && regionGroup !== "") {
    const validRegionGroup = regionGroup as "Ulaanbaatar" | "Erdenet" | "Darkhan" | "Other";
    filtered = filtered.filter((c) => matchesRegionGroup((c as any).region || "", validRegionGroup));
  }

  // Price filtering based on service items
  if (typeof priceMinMnt === "number" || typeof priceMaxMnt === "number") {
    filtered = filtered.filter((c) => {
      const serviceItems = (c as any).serviceItems || [];
      if (serviceItems.length === 0) return true;
      const minPrice = Math.min(...serviceItems.map((item: any) => item.priceMnt || 0));
      const maxPrice = Math.max(...serviceItems.map((item: any) => item.priceMnt || 0));
      if (typeof priceMinMnt === "number" && maxPrice < priceMinMnt) return false;
      if (typeof priceMaxMnt === "number" && minPrice > priceMaxMnt) return false;
      return true;
    });
  }

  if (typeof ratingMin === "number") {
    filtered = filtered.filter((c) => ((c as any).rating ?? 4.0) >= ratingMin);
  }

  // Availability filtering (mock - all centers are available)
  // In real implementation, this would check actual availability

  return filtered;
}

export async function fetchCentersList(query: CentersListQuery = {}): Promise<CentersListResponse> {
  const { sort = "newest", page = 1, pageSize = 12 } = query;

  // Merge with localStorage centers
  let allCenters = [...centers];
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("autozone.carCenters");
      if (stored) {
        const storedCenters = JSON.parse(stored);
        allCenters = [...allCenters, ...storedCenters];
      }
    } catch {
      // ignore
    }
  }

  let filtered = applyCenterFilters(allCenters, query);

  filtered.sort((a, b) => {
    if (sort === "ratingDesc") {
      const ratingA = (a as any).rating ?? 4.0;
      const ratingB = (b as any).rating ?? 4.0;
      return ratingB - ratingA;
    }
    if (sort === "ratingAsc") {
      const ratingA = (a as any).rating ?? 4.0;
      const ratingB = (b as any).rating ?? 4.0;
      return ratingA - ratingB;
    }
    if (sort === "nameAsc") return a.name.localeCompare(b.name);
    // Default: newest (by createdAt or id)
    const createdAtA = (a as any).createdAt;
    const createdAtB = (b as any).createdAt;
    if (createdAtA && createdAtB) {
      return new Date(createdAtB).getTime() - new Date(createdAtA).getTime();
    }
    return b.id.localeCompare(a.id);
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  const items = filtered.slice(start, start + pageSize).map((c) => {
    // Check if it's a stored center (has createdAt) or mock center
    if ((c as any).createdAt) {
      return toCenterDTOFromStored(c);
    }
    return toCenterDTO(c as Center);
  });

  return await mockApi({ items, total, page: safePage, pageSize, totalPages }, 300, 600);
}

export type CarTaxonomy = {
  manufacturers: string[];
  modelsByManufacturer: Record<string, string[]>;
  subModelsByManufacturerModel: Record<string, Record<string, string[]>>;
};

export async function fetchCarTaxonomy(): Promise<CarTaxonomy> {
  const manufacturers = Array.from(new Set(cars.map((c) => c.manufacturer))).sort();
  const modelsByManufacturer: Record<string, string[]> = {};
  const subModelsByManufacturerModel: Record<string, Record<string, string[]>> = {};

  for (const mfr of manufacturers) {
    const models = Array.from(new Set(cars.filter((c) => c.manufacturer === mfr).map((c) => c.model))).sort();
    modelsByManufacturer[mfr] = models;
    subModelsByManufacturerModel[mfr] = {};
    for (const mdl of models) {
      const subs = Array.from(
        new Set(cars.filter((c) => c.manufacturer === mfr && c.model === mdl).map((c) => c.subModel)),
      ).sort();
      subModelsByManufacturerModel[mfr]![mdl] = subs;
    }
  }

  return await mockApi({ manufacturers, modelsByManufacturer, subModelsByManufacturerModel }, 300, 600);
}

export type ModelCount = { model: string; count: number };

export async function fetchModelCounts(query: CarsListQuery = {}): Promise<ModelCount[]> {
  const filtered = applyCarFilters(cars, query, { ignoreModel: true, ignoreSubModel: true });
  const map = new Map<string, number>();
  for (const c of filtered) {
    map.set(c.model, (map.get(c.model) ?? 0) + 1);
  }
  const res = Array.from(map.entries())
    .map(([model, count]) => ({ model, count }))
    .sort((a, b) => b.count - a.count || a.model.localeCompare(b.model));
  return await mockApi(res, 300, 600);
}

export async function fetchRentItems(type: RentType): Promise<RentItem[]> {
  return await mockApi(rentItems.filter((x) => x.rentType === type), 300, 600);
}

export type RentListQuery = {
  q?: string;
  model?: string;
  fuel?: "gasoline" | "diesel" | "electric" | "hybrid" | "all";
  transmission?: "at" | "mt" | "all";
  regionGroup?: string;
  priceMinMnt?: number;
  priceMaxMnt?: number;
  sort?: "newest" | "priceAsc" | "priceDesc";
  page?: number;
  pageSize?: number;
};

export type RentListResponse = {
  items: RentItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function applyRentFilters(all: RentItem[], query: RentListQuery) {
  const { q, model, fuel, transmission, regionGroup, priceMinMnt, priceMaxMnt } = query;
  let filtered = all.slice();

  if (q && q.trim()) {
    const needle = q.trim();
    filtered = filtered.filter(
      (item) =>
        includesCI(item.title, needle) ||
        includesCI(item.model ?? "", needle) ||
        includesCI(item.manufacturer ?? "", needle),
    );
  }

  if (model && model !== "all") {
    filtered = filtered.filter((item) => item.model === model);
  }

  if (fuel && fuel !== "all") {
    filtered = filtered.filter((item) => item.fuel === fuel);
  }

  if (transmission && transmission !== "all") {
    filtered = filtered.filter((item) => item.transmission === transmission);
  }

  if (regionGroup && regionGroup !== "") {
    const validRegionGroup = regionGroup as "Ulaanbaatar" | "Erdenet" | "Darkhan" | "Other";
    filtered = filtered.filter((item) => matchesRegionGroup(item.region as any, validRegionGroup));
  }

  if (typeof priceMinMnt === "number") {
    filtered = filtered.filter((item) => item.pricePerDayMnt >= priceMinMnt);
  }
  if (typeof priceMaxMnt === "number") {
    filtered = filtered.filter((item) => item.pricePerDayMnt <= priceMaxMnt);
  }

  return filtered;
}

export async function fetchRentList(type: RentType, query: RentListQuery = {}): Promise<RentListResponse> {
  const { sort = "newest", page = 1, pageSize = 12 } = query;

  let filtered = applyRentFilters(
    rentItems.filter((x) => x.rentType === type),
    query,
  );

  filtered.sort((a, b) => {
    if (sort === "newest") {
      // Sort by id descending (newer items have higher numbers)
      return b.id.localeCompare(a.id);
    }
    if (sort === "priceAsc") return a.pricePerDayMnt - b.pricePerDayMnt;
    if (sort === "priceDesc") return b.pricePerDayMnt - a.pricePerDayMnt;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  const items = filtered.slice(start, start + pageSize);

  return await mockApi({ items, total, page: safePage, pageSize, totalPages }, 300, 600);
}

export async function fetchRentModels(type: RentType): Promise<string[]> {
  const items = rentItems.filter((x) => x.rentType === type);
  const models = Array.from(new Set(items.map((item) => item.model).filter((m): m is string => !!m))).sort();
  return await mockApi(models, 100, 200);
}

export async function fetchRentById(type: RentType, id: string): Promise<RentItem | null> {
  const found = rentItems.find((x) => x.rentType === type && x.id === id) ?? null;
  return await mockApi(found, 300, 600);
}

export async function fetchMediaList(type?: MediaItem["type"] | "all"): Promise<MediaDTO[]> {
  // TODO: Replace with GET /media?type=...
  const filtered =
    !type || type === "all" ? media.slice() : media.filter((m) => m.type === type);
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return await mockApi(filtered.map(toMediaDTO), 300, 600);
}

export async function fetchMediaById(id: string): Promise<MediaDTO | null> {
  // TODO: Replace with GET /media/:id
  const found = media.find((m) => m.id === id) ?? null;
  return await mockApi(found ? toMediaDTO(found) : null, 300, 600);
}

export async function fetchCarsByIds(ids: string[]): Promise<CarListItemDTO[]> {
  // TODO: Replace with POST /cars/batch or GET /cars?ids=...
  const published = getPublishedCarsFromLocalStorage();
  const merged = [...published, ...cars];
  const map = new Map(merged.map((c) => [c.id, c] as const));
  const items = ids.map((id) => map.get(id)).filter(Boolean) as Car[];
  return await mockApi(items.map(toCarListItemDTO), 200, 450);
}

function carTitleFromMock(c: Pick<Car, "manufacturer" | "model" | "subModel">) {
  return `${c.manufacturer} ${c.model} ${c.subModel}`.trim();
}

function toCarListItemDTO(c: Car): CarListItemDTO {
  // Use SILVER-specific images for silver tier, otherwise use existing images
  let thumbnailUrl = c.images?.[0] ?? "/samples/cars/car-01.svg";
  if (c.tier === "silver" && c.images?.[0]) {
    // Extract a stable index from the car ID for consistent image mapping
    const idMatch = c.id.match(/\d+/);
    const idNum = idMatch ? parseInt(idMatch[0], 10) : 1;
    thumbnailUrl = sampleSilverCarImage(idNum);
  }
  
  // Prepare images array: use first 2 images, or duplicate thumbnail if only one exists
  const images = c.images && c.images.length > 0 
    ? [c.images[0], c.images[1] ?? c.images[0]] 
    : [thumbnailUrl, thumbnailUrl];
  
  // Generate createdAt if missing (random within last 30 days)
  let createdAt = c.createdAt;
  if (!createdAt) {
    const now = Date.now();
    const minMs = 60 * 1000; // 1 minute
    const maxMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    const randomMs = Math.floor(Math.random() * (maxMs - minMs) + minMs);
    createdAt = new Date(now - randomMs).toISOString();
  }
  
  return {
    id: c.id,
    title: carTitleFromMock(c),
    tier: c.tier,
    yearMade: c.yearMade,
    yearImported: c.yearImported,
    mileageKm: c.mileageKm,
    priceMnt: c.priceMnt,
    createdAt,
    regionLabel: c.region,
    thumbnailUrl,
    images,
  };
}

function toCarDetailDTO(c: Car): CarDetailDTO {
  return {
    id: c.id,
    title: carTitleFromMock(c),
    tier: c.tier,
    yearMade: c.yearMade,
    yearImported: c.yearImported,
    mileageKm: c.mileageKm,
    priceMnt: c.priceMnt,
    createdAt: c.createdAt,
    regionLabel: c.region,
    images: c.images?.length ? c.images : ["/samples/cars/car-01.svg"],
    videoUrl: c.videoUrl,
    description: c.description,
    specs: {
      fuel: c.fuel,
      transmission: c.transmission,
      color: c.color,
      steering: c.steering,
      accident: c.accident,
      hasPlate: c.hasPlate,
      vin: c.vin,
    },
    seller: {
      name: c.sellerName,
      phone: c.sellerPhone,
    },
  };
}

function toMotorcycleListItemDTO(m: Motorcycle): CarListItemDTO {
  const thumbnailUrl = m.images?.[0] ?? "/samples/cars/car-01.svg";
  const images = m.images && m.images.length > 0 
    ? [m.images[0], m.images[1] ?? m.images[0]] 
    : [thumbnailUrl, thumbnailUrl];
  
  // Generate createdAt if missing (random within last 30 days)
  let createdAt = m.createdAt;
  if (!createdAt) {
    const now = Date.now();
    const minMs = 60 * 1000; // 1 minute
    const maxMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    const randomMs = Math.floor(Math.random() * (maxMs - minMs) + minMs);
    createdAt = new Date(now - randomMs).toISOString();
  }
  
  return {
    id: m.id,
    title: `${m.manufacturer} ${m.model} ${m.subModel}`.trim(),
    tier: m.tier,
    yearMade: m.yearMade,
    yearImported: m.yearImported,
    mileageKm: m.mileageKm ?? 0,
    priceMnt: m.priceMnt,
    createdAt,
    regionLabel: m.region,
    thumbnailUrl,
    images,
  };
}

function toMotorcycleDetailDTO(m: Motorcycle): CarDetailDTO {
  return {
    id: m.id,
    title: `${m.manufacturer} ${m.model} ${m.subModel}`.trim(),
    tier: m.tier,
    yearMade: m.yearMade,
    yearImported: m.yearImported,
    mileageKm: m.mileageKm ?? 0,
    priceMnt: m.priceMnt,
    createdAt: m.createdAt,
    regionLabel: m.region,
    images: m.images?.length ? m.images : ["/samples/cars/car-01.svg"],
    description: "Motorcycle mock listing.",
    specs: {
      fuel: m.fuel,
      transmission: "at",
      color: (m as any).color ?? "Other",
      steering: "left",
      accident: false,
      hasPlate: false,
      vin: `MOTO_${m.id}`,
    },
    seller: {
      name: m.sellerName,
      phone: m.sellerPhone,
    },
  };
}

function toCenterDTO(c: Center): CenterDTO {
  const prices = c.serviceItems.map((item) => item.priceMnt);
  const minPrice = prices.length > 0 ? Math.min(...prices) : undefined;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : undefined;
  
  return {
    id: c.id,
    name: c.name,
    regionLabel: c.region,
    address: c.address,
    phone: c.phone,
    rating: c.rating,
    services: c.services,
    imageUrl: c.image,
    minPriceMnt: minPrice,
    maxPriceMnt: maxPrice,
    operatingHours: c.operatingHours,
    // Extra prototype fields used by /service/center/[id] detail page.
    // Safe to include without changing other pages.
    ...(c as any).images ? { images: (c as any).images } : null,
    ...(c as any).serviceItems ? { serviceItems: (c as any).serviceItems } : null,
    ...(c as any).location ? { location: (c as any).location } : null,
    ...(c as any).phoneNumbers ? { phoneNumbers: (c as any).phoneNumbers } : null,
    ...(c as any).operatingHours ? { operatingHours: (c as any).operatingHours } : null,
  };
}

function toCenterDTOFromStored(stored: any): CenterDTO {
  const prices = (stored.serviceItems || []).map((item: any) => item.priceMnt || 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : undefined;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : undefined;
  
  return {
    id: stored.id,
    name: stored.name,
    regionLabel: stored.region || "Ulaanbaatar",
    address: stored.address,
    phone: stored.phone1,
    rating: 4.0, // Default rating for new centers
    services: stored.services || [],
    imageUrl: stored.images?.[0] || "/samples/cars/car-01.svg",
    minPriceMnt: minPrice,
    maxPriceMnt: maxPrice,
    operatingHours: stored.hours,
    images: stored.images || [],
    serviceItems: stored.serviceItems || [],
    location: { address: stored.address, lat: stored.lat, lng: stored.lng },
    phoneNumbers: stored.phone2 ? [stored.phone1, stored.phone2] : [stored.phone1],
  };
}

function toMediaDTO(m: MediaItem): MediaDTO {
  // Generate mock detail fields
  const reporterNames = ["김기자", "이기자", "박기자", "최기자", "정기자"];
  const reporterName = reporterNames[m.id.charCodeAt(m.id.length - 1) % reporterNames.length] ?? "관리자";
  
  // Format publishedAt as "YYYY-MM-DD HH:mm"
  const publishedDate = new Date(m.createdAt);
  const publishedAt = `${publishedDate.getFullYear()}-${String(publishedDate.getMonth() + 1).padStart(2, "0")}-${String(publishedDate.getDate()).padStart(2, "0")} ${String(publishedDate.getHours()).padStart(2, "0")}:${String(publishedDate.getMinutes()).padStart(2, "0")}`;
  
  // Generate multiple images (use thumbnail + additional images)
  const images = [
    m.thumbnail,
    ...(media.filter((item) => item.id !== m.id).slice(0, 3).map((item) => item.thumbnail)),
  ];
  
  // Generate content from excerpt + additional paragraphs
  const content = `${m.excerpt}\n\n${m.excerpt}\n\n이 기사는 자동차 시장의 최신 동향을 다루고 있습니다. 더 자세한 정보는 공식 웹사이트를 참고하시기 바랍니다.`;
  
  // Generate like count (random between 5-50)
  const likeCount = (m.id.charCodeAt(m.id.length - 1) % 45) + 5;

  return {
    id: m.id,
    type: m.type,
    title: m.title,
    createdAt: m.createdAt,
    thumbnailUrl: m.thumbnail,
    excerpt: m.excerpt,
    // Home page card fields
    subtitle: m.subtitle,
    category: m.category,
    coverImage: m.thumbnail, // Use thumbnail as coverImage (can be overridden)
    author: m.author ?? reporterName, // Use author if provided, fallback to reporterName
    // Detail page fields
    reporterName: m.author ?? reporterName,
    publishedAt,
    images,
    content,
    likeCount,
  };
}

export type TiresListQuery = {
  sort?: "newest" | "priceAsc" | "priceDesc";
  page?: number;
  pageSize?: number;
  sizes?: string[];
  seasons?: string[];
  dotYearMin?: number;
  dotYearMax?: number;
  brands?: string[];
  installationIncluded?: boolean | "all";
  regionGroup?: string;
  priceMinMnt?: number;
  priceMaxMnt?: number;
};

export type TiresListResponse = {
  items: TireListItemDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function toTireListItemDTO(t: Tire): TireListItemDTO {
  // Fallback to a neutral tire placeholder if no image is available
  const tirePlaceholder = "https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop";
  
  // Generate createdAt if missing (random within last 30 days)
  let createdAt = t.createdAt;
  if (!createdAt) {
    const now = Date.now();
    const minMs = 60 * 1000; // 1 minute
    const maxMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    const randomMs = Math.floor(Math.random() * (maxMs - minMs) + minMs);
    createdAt = new Date(now - randomMs).toISOString();
  }
  
  return {
    id: t.id,
    brand: t.brand,
    size: t.size,
    season: t.season,
    dotYear: t.dotYear,
    installationIncluded: t.installationIncluded,
    condition: t.condition,
    qty: t.qty,
    priceMnt: t.priceMnt,
    regionLabel: t.region,
    createdAt,
    thumbnailUrl: t.images?.[0] ?? tirePlaceholder,
  };
}

function applyTireFilters(all: Tire[], query: TiresListQuery) {
  const { sizes, seasons, dotYearMin, dotYearMax, brands, installationIncluded, regionGroup, priceMinMnt, priceMaxMnt } = query;
  let filtered = all.slice();

  if (sizes && sizes.length > 0) {
    filtered = filtered.filter((t) => sizes.includes(t.size));
  }

  if (seasons && seasons.length > 0) {
    filtered = filtered.filter((t) => seasons.includes(t.season));
  }

  if (typeof dotYearMin === "number") {
    filtered = filtered.filter((t) => t.dotYear >= dotYearMin);
  }
  if (typeof dotYearMax === "number") {
    filtered = filtered.filter((t) => t.dotYear <= dotYearMax);
  }

  if (brands && brands.length > 0) {
    filtered = filtered.filter((t) => brands.includes(t.brand));
  }

  if (installationIncluded !== undefined && installationIncluded !== "all") {
    filtered = filtered.filter((t) => t.installationIncluded === installationIncluded);
  }

  if (regionGroup && regionGroup !== "") {
    const validRegionGroup = regionGroup as "Ulaanbaatar" | "Erdenet" | "Darkhan" | "Other";
    filtered = filtered.filter((t) => matchesRegionGroup(t.region, validRegionGroup));
  }

  if (typeof priceMinMnt === "number") {
    filtered = filtered.filter((t) => t.priceMnt >= priceMinMnt);
  }
  if (typeof priceMaxMnt === "number") {
    filtered = filtered.filter((t) => t.priceMnt <= priceMaxMnt);
  }

  return filtered;
}

export async function fetchTiresList(query: TiresListQuery = {}): Promise<TiresListResponse> {
  const { sort = "newest", page = 1, pageSize = 12 } = query;

  let filtered = applyTireFilters(tires, query);

  filtered.sort((a, b) => {
    if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === "priceAsc") return a.priceMnt - b.priceMnt;
    if (sort === "priceDesc") return b.priceMnt - a.priceMnt;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  const items = filtered.slice(start, start + pageSize).map(toTireListItemDTO);

  return await mockApi({ items, total, page: safePage, pageSize, totalPages }, 300, 600);
}

export type PartsListQuery = {
  q?: string;
  carModel?: string;
  motorcycleModel?: string;
  accessoryType?: "seat-cover" | "camera" | "floor-mat" | "jump-starter" | "other" | "all";
  priceMinMnt?: number;
  priceMaxMnt?: number;
  regionGroup?: string;
  sort?: "newest" | "priceAsc" | "priceDesc";
  page?: number;
  pageSize?: number;
};

export type PartsListResponse = {
  items: PartListItemDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function toPartListItemDTO(p: Part): PartListItemDTO {
  const placeholder = "https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop";
  
  // Generate createdAt if missing (random within last 30 days)
  let createdAt = p.createdAt;
  if (!createdAt) {
    const now = Date.now();
    const minMs = 60 * 1000; // 1 minute
    const maxMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    const randomMs = Math.floor(Math.random() * (maxMs - minMs) + minMs);
    createdAt = new Date(now - randomMs).toISOString();
  }
  
  return {
    id: p.id,
    name: p.name,
    forManufacturer: p.forManufacturer,
    forModel: p.forModel,
    condition: p.condition,
    priceMnt: p.priceMnt,
    regionLabel: p.region,
    createdAt,
    thumbnailUrl: p.images?.[0] ?? placeholder,
    accessoryType: inferAccessoryType(p.name),
  };
}

function inferAccessoryType(name: string): PartListItemDTO["accessoryType"] {
  const lower = name.toLowerCase();
  if (lower.includes("seat") || lower.includes("시트")) return "seat-cover";
  if (lower.includes("camera") || lower.includes("카메라")) return "camera";
  if (lower.includes("floor") || lower.includes("mat") || lower.includes("매트")) return "floor-mat";
  if (lower.includes("jump") || lower.includes("starter") || lower.includes("점프")) return "jump-starter";
  return "other";
}

function applyPartsFilters(all: Part[], query: PartsListQuery) {
  const { q, carModel, motorcycleModel, accessoryType, priceMinMnt, priceMaxMnt, regionGroup } = query;
  let filtered = all.slice();

  if (q && q.trim()) {
    const needle = q.trim();
    filtered = filtered.filter((p) => includesCI(p.name, needle) || includesCI(p.forModel ?? "", needle));
  }

  if (carModel && carModel !== "all") {
    filtered = filtered.filter((p) => p.forModel === carModel);
  }

  if (motorcycleModel && motorcycleModel !== "all") {
    filtered = filtered.filter((p) => p.forModel === motorcycleModel);
  }

  if (accessoryType && accessoryType !== "all") {
    filtered = filtered.filter((p) => inferAccessoryType(p.name) === accessoryType);
  }

  if (typeof priceMinMnt === "number") {
    filtered = filtered.filter((p) => p.priceMnt >= priceMinMnt);
  }
  if (typeof priceMaxMnt === "number") {
    filtered = filtered.filter((p) => p.priceMnt <= priceMaxMnt);
  }

  if (regionGroup && regionGroup !== "") {
    const validRegionGroup = regionGroup as "Ulaanbaatar" | "Erdenet" | "Darkhan" | "Other";
    filtered = filtered.filter((p) => matchesRegionGroup(p.region, validRegionGroup));
  }

  return filtered;
}

export async function fetchPartsList(query: PartsListQuery = {}): Promise<PartsListResponse> {
  const { sort = "newest", page = 1, pageSize = 12 } = query;

  let filtered = applyPartsFilters(parts, query);

  filtered.sort((a, b) => {
    if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === "priceAsc") return a.priceMnt - b.priceMnt;
    if (sort === "priceDesc") return b.priceMnt - a.priceMnt;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  const items = filtered.slice(start, start + pageSize).map(toPartListItemDTO);

  return await mockApi({ items, total, page: safePage, pageSize, totalPages }, 300, 600);
}

export async function fetchCarModelsForParts(): Promise<string[]> {
  const models = Array.from(new Set(cars.map((c) => `${c.manufacturer} ${c.model}`).sort()));
  return await mockApi(models, 100, 200);
}

export async function fetchMotorcycleModelsForParts(): Promise<string[]> {
  const models = Array.from(new Set(motorcycles.map((m) => `${m.manufacturer} ${m.model}`).sort()));
  return await mockApi(models, 100, 200);
}

function toPartDetailDTO(p: Part): PartDetailDTO {
  const base = toPartListItemDTO(p);
  return {
    ...base,
    images: p.images?.length ? p.images : [base.thumbnailUrl],
    description: `${p.name}에 대한 상세 정보입니다. ${p.forManufacturer && p.forModel ? `${p.forManufacturer} ${p.forModel}에 호환됩니다.` : ""} 상태: ${p.condition === "new" ? "신품" : "중고"}. 더 자세한 정보는 문의해주세요.`,
    seller: {
      name: "판매자",
      phone: "010-0000-0000",
    },
  };
}

function toTireDetailDTO(t: Tire): TireDetailDTO {
  const base = toTireListItemDTO(t);
  const seasonLabels: Record<string, string> = {
    summer: "썸머",
    winter: "윈터",
    "all-season": "올시즌",
    "off-road": "오프로드",
  };
  const seasonLabel = seasonLabels[t.season] || t.season;
  return {
    ...base,
    images: t.images?.length ? t.images : [base.thumbnailUrl],
    description: `${t.brand} ${t.size} ${seasonLabel} 타이어입니다. 제조년도: ${t.dotYear}년, 수량: ${t.qty}개, ${t.installationIncluded ? "장착 포함" : "장착 미포함"}. 상태: ${t.condition === "new" ? "신품" : "중고"}. 더 자세한 정보는 문의해주세요.`,
    seller: {
      name: "판매자",
      phone: "010-0000-0000",
    },
  };
}

export async function fetchPartById(id: string): Promise<PartDetailDTO | null> {
  const found = parts.find((p) => p.id === id) ?? null;
  return await mockApi(found ? toPartDetailDTO(found) : null, 300, 600);
}

export async function fetchTireById(id: string): Promise<TireDetailDTO | null> {
  const found = tires.find((t) => t.id === id) ?? null;
  return await mockApi(found ? toTireDetailDTO(found) : null, 300, 600);
}


