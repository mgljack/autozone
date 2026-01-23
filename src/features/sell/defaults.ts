import type { SellCategory, SellDraft } from "./types";

export function createDefaultDraft(category: SellCategory): SellDraft {
  const base = {
    category,
    memo: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  } as const;

  switch (category) {
    case "car":
      return {
        ...base,
        category: "car",
        manufacturer: "",
        model: "",
        region: "",
        hasPlate: "",
        steering: "",
        yearMade: "",
        yearImported: "",
        fuel: "",
        transmission: "",
        color: "",
        vin: "",
        priceMnt: "",
        options: {
          sunroof: false,
          sensors: false,
          smartKey: false,
          heatedSeat: false,
          ventilatedSeat: false,
          leatherSeat: false,
          heatedSteering: false,
        },
      };
    case "motorcycle":
      return {
        ...base,
        category: "motorcycle",
        manufacturer: "",
        model: "",
        region: "",
        hasPlate: "",
        yearMade: "",
        yearImported: "",
        fuel: "",
        priceMnt: "",
      };
    case "tire":
      return {
        ...base,
        category: "tire",
        season: "",
        radius: "",
        width: "",
        height: "",
        priceMnt: "",
      };
    case "parts":
      return {
        ...base,
        category: "parts",
        title: "",
        condition: "",
        priceMnt: "",
      };
  }
}


