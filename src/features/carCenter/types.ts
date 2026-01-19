export type CarCenterDraft = {
  name: string;
  description: string;
  category: "engine" | "brake" | "tire" | "oil" | "electric" | "body" | "other" | "";
  services: string[];
  phone1: string;
  phone2: string;
  hours: string;
  daysOff: "everyday" | "weekend" | "weekday" | "";
  emergency: boolean;
  address: string;
  addressDetail: string;
  region: "Ulaanbaatar" | "Erdenet" | "Darkhan" | "Other" | "";
  lat: number;
  lng: number;
  serviceItems: Array<{
    name: string;
    priceMnt: string;
    duration?: string;
  }>;
  images: string[];
};

export type CarCenter = {
  id: string;
  name: string;
  description: string;
  category: string;
  services: string[];
  phone1: string;
  phone2?: string;
  hours: string;
  daysOff: string;
  emergency: boolean;
  address: string;
  addressDetail: string;
  region: string;
  lat: number;
  lng: number;
  serviceItems: Array<{
    name: string;
    priceMnt: number;
    duration?: string;
  }>;
  images: string[];
  createdAt: string;
  // Payment metadata
  planType?: "gold" | "silver" | "general";
  planDays?: number;
  priceAmount?: number;
  paidMethod?: "card" | "qpay";
  postedAt?: string;
  expiresAt?: string;
};

