// Central DTO definitions for UI ↔ (future) backend API contract.
// The UI should depend on these DTOs, not on mock DB types under /src/mock.
//
// TODO: When backend is introduced, replace implementations in `src/lib/mockApi.ts`
// with real HTTP calls (e.g. GET /cars, GET /cars/:id) returning these DTOs.

export type CarTierDTO = "gold" | "silver" | "general";

export type CarListItemDTO = {
  id: string;
  title: string;
  tier: CarTierDTO;
  yearMade: number;
  yearImported: number;
  mileageKm: number;
  priceMnt: number;
  createdAt: string; // ISO
  regionLabel: string;
  thumbnailUrl: string;
  images?: string[]; // Optional: for list cards that need multiple images
};

export type CarDetailDTO = {
  id: string;
  title: string;
  tier: CarTierDTO;
  yearMade: number;
  yearImported: number;
  mileageKm: number;
  priceMnt: number;
  createdAt: string; // ISO
  regionLabel: string;

  images: string[];
  videoUrl?: string;
  description: string;

  specs: {
    fuel: string;
    transmission: string;
    color: string;
    steering: string;
    accident: boolean;
    hasPlate: boolean;
    vin: string;
  };

  options?: {
    sunroof: boolean;
    sensors: boolean;
    smartKey: boolean;
    heatedSeat: boolean;
    ventilatedSeat: boolean;
    leatherSeat: boolean;
    heatedSteering: boolean;
  };

  seller: {
    name: string;
    phone: string;
  };
};

export type MediaDTO = {
  id: string;
  type: "news" | "video" | "event";
  title: string;
  createdAt: string; // ISO
  thumbnailUrl: string;
  excerpt: string;
  // Home page card fields
  subtitle?: string; // Short subtitle for card display
  category?: string; // Category label (e.g., "Auction Guide", "Contact Guide")
  coverImage?: string; // Cover image URL (fallback to thumbnailUrl)
  author?: string; // Author name (fallback to reporterName)
  // Detail page fields
  reporterName?: string;
  publishedAt?: string; // ISO or "YYYY-MM-DD HH:mm"
  images?: string[];
  content?: string;
  likeCount?: number;
};

export type CenterDTO = {
  id: string;
  name: string;
  regionLabel: string;
  address: string;
  phone: string;
  rating: number;
  services: string[];
  imageUrl: string;
  minPriceMnt?: number;
  maxPriceMnt?: number;
  operatingHours?: string;
  // Extended fields for detail pages
  images?: string[];
  serviceItems?: Array<{ name: string; priceMnt: number; duration?: string }>;
  location?: { address: string; lat: number; lng: number };
  phoneNumbers?: string[];
};

export type ListingDraftDTO = {
  id: string;
  status: "draft" | "published" | "reviewing" | "rejected" | "deleted";
  tier?: CarTierDTO;
  createdAt: string;
  publishedAt?: string;
  expiresAt?: string;
};

export type PaymentDTO = {
  id: string;
  listingId: string;
  createdAt: string; // ISO
  method: "card" | "qpay";
  tier: CarTierDTO;
  durationDays: number;
  amountMnt: number;
  status: "paid";
};

export type TireListItemDTO = {
  id: string;
  brand: string;
  size: string;
  season: "summer" | "winter" | "all-season" | "off-road";
  dotYear: number;
  installationIncluded: boolean;
  condition: "new" | "used";
  qty: number;
  priceMnt: number;
  regionLabel: string;
  createdAt: string; // ISO
  thumbnailUrl: string;
};

export type PartListItemDTO = {
  id: string;
  name: string;
  forManufacturer?: string;
  forModel?: string;
  condition: "new" | "used";
  priceMnt: number;
  regionLabel: string;
  createdAt: string; // ISO
  thumbnailUrl: string;
  accessoryType?: "seat-cover" | "camera" | "floor-mat" | "jump-starter" | "other";
};

export type PartDetailDTO = PartListItemDTO & {
  images: string[];
  description?: string;
  seller?: {
    name: string;
    phone: string;
  };
};

export type TireDetailDTO = TireListItemDTO & {
  images: string[];
  description?: string;
  seller?: {
    name: string;
    phone: string;
  };
};


