export type SellCategory = "car" | "motorcycle" | "tire" | "parts";

export type SellDraftBase = {
  category: SellCategory;
  title?: string;
  memo: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

export type SellDraftCar = SellDraftBase & {
  category: "car";
  manufacturer: string;
  model: string;
  region: "Ulaanbaatar" | "Erdenet" | "Darkhan" | "Other" | "";
  hasPlate: "yes" | "no" | "";
  steering: "left" | "right" | "";
  yearMade: string;
  yearImported: string;
  fuel: "gasoline" | "diesel" | "lpg" | "electric" | "hybrid" | "";
  transmission: "automatic" | "manual" | "";
  color: string;
  vin: string;
  priceMnt: string;
  options?: {
    sunroof: boolean;
    sensors: boolean;
    smartKey: boolean;
    heatedSeat: boolean;
    ventilatedSeat: boolean;
    leatherSeat: boolean;
    heatedSteering: boolean;
  };
};

export type SellDraftMotorcycle = SellDraftBase & {
  category: "motorcycle";
  manufacturer: string;
  model: string;
  region: "Ulaanbaatar" | "Erdenet" | "Darkhan" | "Other" | "";
  hasPlate: "yes" | "no" | "";
  yearMade: string;
  yearImported: string;
  fuel: "gasoline" | "electric" | "";
  priceMnt: string;
};

export type SellDraftTire = SellDraftBase & {
  category: "tire";
  season: "all-season" | "winter" | "summer" | "";
  radius: string;
  width: string;
  height: string;
  priceMnt: string;
};

export type SellDraftParts = SellDraftBase & {
  category: "parts";
  title: string;
  condition: "new" | "used" | "";
  priceMnt: string;
};

export type SellDraft = SellDraftCar | SellDraftMotorcycle | SellDraftTire | SellDraftParts;

export type ListingTier = "gold" | "silver" | "general";

export type ListingStatus = "draft" | "published" | "reviewing" | "rejected" | "deleted";

export type MyListing = {
  id: string;
  status: ListingStatus;
  createdAt: string;
  publishedAt?: string;
  expiresAt?: string;
  tier?: ListingTier;
  durationDays?: number;
  priceMnt?: number;
  draft: SellDraft;
  media: {
    imageNames: string[];
    videoName?: string;
  };
};

export type PaymentMethod = "card" | "qpay";

export type PaymentRecord = {
  id: string;
  listingId: string;
  createdAt: string;
  method: PaymentMethod;
  tier: ListingTier;
  durationDays: number;
  amountMnt: number;
  status: "paid";
};


