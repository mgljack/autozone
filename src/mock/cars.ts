export type VehicleCategory = "car" | "motorcycle" | "tire" | "parts";
export type Tier = "gold" | "silver" | "general";
export type Fuel = "gasoline" | "diesel" | "lpg" | "hybrid" | "electric";
export type Transmission = "at" | "mt";
export type Steering = "left" | "right";
export type Region =
  | "Улаанбаатар"
  | "Дархан"
  | "Эрдэнэт"
  | "Хөвсгөл"
  | "Өмнөговь"
  | "Хэнтий";

export type Car = {
  category: "car";
  tier: Tier;

  id: string;
  sellerName: string;
  sellerPhone: string;
  manufacturer: string;
  model: string;
  subModel: string;
  yearMade: number;
  yearImported: number;
  mileageKm: number;
  priceMnt: number;
  fuel: Fuel;
  transmission: Transmission;
  color: string;
  accident: boolean;
  region: Region;
  createdAt: string; // ISO
  images: string[];
  videoUrl?: string;
  description: string;
  steering: Steering;
  vin: string;
  hasPlate: boolean;
};

export type Motorcycle = {
  category: "motorcycle";
  id: string;
  tier: Tier;
  sellerName: string;
  sellerPhone: string;
  manufacturer: string;
  model: string;
  subModel: string;
  yearMade: number;
  yearImported: number;
  mileageKm: number;
  priceMnt: number;
  region: Region;
  fuel: Extract<Fuel, "gasoline" | "electric">;
  color?: string;
  createdAt: string;
  images: string[];
};

export type Tire = {
  category: "tire";
  id: string;
  brand: string;
  size: string;
  season: "summer" | "winter" | "all-season" | "off-road";
  dotYear: number; // Manufacturing year (DOT)
  installationIncluded: boolean;
  condition: "new" | "used";
  qty: number;
  priceMnt: number;
  region: Region;
  createdAt: string;
  images: string[];
};

export type Part = {
  category: "parts";
  id: string;
  name: string;
  forManufacturer?: string;
  forModel?: string;
  condition: "new" | "used";
  priceMnt: number;
  region: Region;
  createdAt: string;
  images: string[];
};

export function carTitle(c: Pick<Car, "manufacturer" | "model" | "subModel">) {
  return `${c.manufacturer} ${c.model} ${c.subModel}`.trim();
}

// Modern premium car images (2024 style - diverse high-quality photos)
const BLACK_WHITE_CAR_IMAGES = [
  "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=600&fit=crop&auto=format", // Tesla Model 3 white
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&auto=format", // BMW M4 black
  "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&h=600&fit=crop&auto=format", // Mercedes AMG white
  "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop&auto=format", // BMW 5 Series black
  "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&h=600&fit=crop&auto=format", // Audi e-tron white
  "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=600&fit=crop&auto=format", // Porsche 911 black
  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop&auto=format", // Mercedes S-Class white
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&auto=format", // BMW M5 black
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop&auto=format", // Lexus LC white
  "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop&auto=format", // Mercedes AMG GT black
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&auto=format", // Corvette white
  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop&auto=format", // Audi RS7 black
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format", // Porsche 718 white
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop&auto=format", // Ford Mustang black
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop&auto=format", // Mercedes CLA white
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop&auto=format", // Ferrari black
  "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop&auto=format", // Tesla Model S white
  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop&auto=format", // BMW X5 black
  "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop&auto=format", // Range Rover white
  "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800&h=600&fit=crop&auto=format", // Lamborghini black
];

// SILVER tier exclusive car images (premium SUVs and sedans)
const SILVER_CAR_IMAGES = [
  "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop&auto=format", // Toyota Land Cruiser
  "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&h=600&fit=crop&auto=format", // Hyundai Palisade
  "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&h=600&fit=crop&auto=format", // Kia Sorento
  "https://images.unsplash.com/photo-1625395005224-0fce68a3cdc8?w=800&h=600&fit=crop&auto=format", // Toyota RAV4
  "https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&h=600&fit=crop&auto=format", // Honda CR-V
  "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&h=600&fit=crop&auto=format", // Mazda CX-5
  "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&h=600&fit=crop&auto=format", // Subaru Outback
  "https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=800&h=600&fit=crop&auto=format", // Volkswagen Tiguan
  "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&h=600&fit=crop&auto=format", // Mercedes GLC
  "https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?w=800&h=600&fit=crop&auto=format", // Lexus RX
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600&fit=crop&auto=format", // Porsche Cayenne
  "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&h=600&fit=crop&auto=format", // Audi Q7
  "https://images.unsplash.com/photo-1611016186353-9af58c69a533?w=800&h=600&fit=crop&auto=format", // BMW X3
  "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800&h=600&fit=crop&auto=format", // Volvo XC90
  "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&h=600&fit=crop&auto=format", // Toyota Camry
  "https://images.unsplash.com/photo-1622196645357-c8c62c42fcc5?w=800&h=600&fit=crop&auto=format", // Honda Accord
  "https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?w=800&h=600&fit=crop&auto=format", // Hyundai Sonata
  "https://images.unsplash.com/photo-1619976215249-be88af12ce0e?w=800&h=600&fit=crop&auto=format", // Kia K5
  "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800&h=600&fit=crop&auto=format", // Mazda 6
  "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop&auto=format", // Nissan Altima
];

export function sampleCarImage(n: number) {
  const index = (Math.floor(n) - 1) % BLACK_WHITE_CAR_IMAGES.length;
  return BLACK_WHITE_CAR_IMAGES[index];
}

export function sampleSilverCarImage(n: number) {
  const index = (Math.floor(n) - 1) % SILVER_CAR_IMAGES.length;
  return SILVER_CAR_IMAGES[index];
}

// Tire images (high-quality tire photos)
const TIRE_IMAGES = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format", // Performance tire
  "https://images.unsplash.com/photo-1562911791-c7a97b729ec5?w=800&h=600&fit=crop&auto=format", // Tire close-up
  "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop&auto=format", // Tire tread
  "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop&auto=format", // Tire sidewall
  "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=800&h=600&fit=crop&auto=format", // Tire detail
  "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&auto=format", // Tire stack
];

// Brand-based tire image mapping
const TIRE_IMAGES_BY_BRAND: Record<string, string> = {
  Michelin: TIRE_IMAGES[0]!,
  Bridgestone: TIRE_IMAGES[1]!,
  Continental: TIRE_IMAGES[2]!,
  Pirelli: TIRE_IMAGES[3]!,
  Goodyear: TIRE_IMAGES[4]!,
  Hankook: TIRE_IMAGES[5]!,
  Kumho: TIRE_IMAGES[0]!,
  Toyo: TIRE_IMAGES[1]!,
  Yokohama: TIRE_IMAGES[2]!,
};

// Season-based tire image mapping
const TIRE_IMAGES_BY_SEASON: Record<string, string> = {
  summer: TIRE_IMAGES[0]!,
  winter: TIRE_IMAGES[1]!,
  "all-season": TIRE_IMAGES[2]!,
  "off-road": TIRE_IMAGES[3]!,
};

export function getTireImage(brand: string, season: string, index: number): string {
  // Prefer brand-based image, fallback to season-based, then round-robin
  return TIRE_IMAGES_BY_BRAND[brand] || TIRE_IMAGES_BY_SEASON[season] || TIRE_IMAGES[index % TIRE_IMAGES.length] || TIRE_IMAGES[0]!;
}

export const cars: Car[] = [
  // Gold (6)
  {
    category: "car",
    tier: "gold",
    id: "car_g_1001",
    sellerName: "Бат",
    sellerPhone: "+976 9999-1001",
    manufacturer: "Toyota",
    model: "Land Cruiser",
    subModel: "200 VX",
    yearMade: 2017,
    yearImported: 2019,
    mileageKm: 92000,
    priceMnt: 188000000,
    fuel: "diesel",
    transmission: "at",
    color: "White",
    accident: false,
    region: "Улаанбаатар",
    createdAt: "2025-12-26T08:40:00.000Z",
    images: [sampleCarImage(2), sampleCarImage(12), sampleCarImage(20)],
    videoUrl: "https://example.com/video/mock-lc200",
    description: "Gold tier mock listing.",
    steering: "left",
    vin: "JT3HTK0000001001",
    hasPlate: true,
  },
  {
    category: "car",
    tier: "gold",
    id: "car_g_1002",
    sellerName: "Солонго",
    sellerPhone: "+976 9999-1002",
    manufacturer: "Lexus",
    model: "RX",
    subModel: "350",
    yearMade: 2016,
    yearImported: 2018,
    mileageKm: 124000,
    priceMnt: 98000000,
    fuel: "gasoline",
    transmission: "at",
    color: "Black",
    accident: false,
    region: "Эрдэнэт",
    createdAt: "2025-12-25T10:05:00.000Z",
    images: [sampleCarImage(4), sampleCarImage(14)],
    description: "Gold tier mock listing.",
    steering: "left",
    vin: "JTJH000000001002",
    hasPlate: true,
  },
  {
    category: "car",
    tier: "gold",
    id: "car_g_1003",
    sellerName: "Тэмүүлэн",
    sellerPhone: "+976 9999-1003",
    manufacturer: "Toyota",
    model: "Alphard",
    subModel: "Hybrid",
    yearMade: 2018,
    yearImported: 2020,
    mileageKm: 87000,
    priceMnt: 135000000,
    fuel: "hybrid",
    transmission: "at",
    color: "Pearl",
    accident: false,
    region: "Улаанбаатар",
    createdAt: "2025-12-24T07:55:00.000Z",
    images: [sampleCarImage(6), sampleCarImage(16)],
    description: "Gold tier mock listing.",
    steering: "right",
    vin: "JTMH000000001003",
    hasPlate: true,
  },
  {
    category: "car",
    tier: "gold",
    id: "car_g_1004",
    sellerName: "Энхжин",
    sellerPhone: "+976 9999-1004",
    manufacturer: "BMW",
    model: "X5",
    subModel: "30d",
    yearMade: 2019,
    yearImported: 2021,
    mileageKm: 76000,
    priceMnt: 172000000,
    fuel: "diesel",
    transmission: "at",
    color: "Gray",
    accident: false,
    region: "Улаанбаатар",
    createdAt: "2025-12-23T09:12:00.000Z",
    images: [sampleCarImage(8), sampleCarImage(18)],
    description: "Gold tier mock listing.",
    steering: "left",
    vin: "WBA0000000001004",
    hasPlate: false,
  },
  {
    category: "car",
    tier: "gold",
    id: "car_g_1005",
    sellerName: "Ганболд",
    sellerPhone: "+976 9999-1005",
    manufacturer: "Mercedes-Benz",
    model: "E-Class",
    subModel: "E200",
    yearMade: 2018,
    yearImported: 2020,
    mileageKm: 99000,
    priceMnt: 145000000,
    fuel: "gasoline",
    transmission: "at",
    color: "White",
    accident: false,
    region: "Хэнтий",
    createdAt: "2025-12-22T12:30:00.000Z",
    images: [sampleCarImage(10), sampleCarImage(19)],
    description: "Gold tier mock listing.",
    steering: "left",
    vin: "WDD0000000001005",
    hasPlate: true,
  },
  {
    category: "car",
    tier: "gold",
    id: "car_g_1006",
    sellerName: "Номин",
    sellerPhone: "+976 9999-1006",
    manufacturer: "Tesla",
    model: "Model 3",
    subModel: "Long Range",
    yearMade: 2021,
    yearImported: 2023,
    mileageKm: 41000,
    priceMnt: 165000000,
    fuel: "electric",
    transmission: "at",
    color: "Red",
    accident: false,
    region: "Улаанбаатар",
    createdAt: "2025-12-21T18:20:00.000Z",
    images: [sampleCarImage(1), sampleCarImage(11)],
    description: "Gold tier mock listing.",
    steering: "left",
    vin: "5YJ3000000001006",
    hasPlate: true,
  },

  // Silver (6)
  {
    category: "car",
    tier: "silver",
    id: "car_s_2001",
    sellerName: "Оогий",
    sellerPhone: "+976 9999-2001",
    manufacturer: "Toyota",
    model: "Prius",
    subModel: "30",
    yearMade: 2014,
    yearImported: 2017,
    mileageKm: 148000,
    priceMnt: 28500000,
    fuel: "hybrid",
    transmission: "at",
    color: "Silver",
    accident: false,
    region: "Улаанбаатар",
    createdAt: "2025-12-20T10:15:00.000Z",
    images: [sampleCarImage(3), sampleCarImage(13)],
    description: "Silver tier mock listing.",
    steering: "right",
    vin: "JTDKN00000002001",
    hasPlate: true,
  },
  {
    category: "car",
    tier: "silver",
    id: "car_s_2002",
    sellerName: "Болд",
    sellerPhone: "+976 9999-2002",
    manufacturer: "Hyundai",
    model: "Sonata",
    subModel: "YF",
    yearMade: 2013,
    yearImported: 2016,
    mileageKm: 176000,
    priceMnt: 24500000,
    fuel: "gasoline",
    transmission: "at",
    color: "Blue",
    accident: false,
    region: "Дархан",
    createdAt: "2025-12-19T13:05:00.000Z",
    images: [sampleCarImage(5), sampleCarImage(15)],
    description: "Silver tier mock listing.",
    steering: "left",
    vin: "KMH0000000002002",
    hasPlate: false,
  },
  {
    category: "car",
    tier: "silver",
    id: "car_s_2003",
    sellerName: "Сараа",
    sellerPhone: "+976 9999-2003",
    manufacturer: "Kia",
    model: "Sportage",
    subModel: "Diesel",
    yearMade: 2017,
    yearImported: 2019,
    mileageKm: 111000,
    priceMnt: 46000000,
    fuel: "diesel",
    transmission: "at",
    color: "White",
    accident: false,
    region: "Улаанбаатар",
    createdAt: "2025-12-18T09:30:00.000Z",
    images: [sampleCarImage(7), sampleCarImage(17)],
    description: "Silver tier mock listing.",
    steering: "left",
    vin: "KNA0000000002003",
    hasPlate: true,
  },
  {
    category: "car",
    tier: "silver",
    id: "car_s_2004",
    sellerName: "Төгөлдөр",
    sellerPhone: "+976 9999-2004",
    manufacturer: "Subaru",
    model: "Forester",
    subModel: "SJ",
    yearMade: 2015,
    yearImported: 2018,
    mileageKm: 139000,
    priceMnt: 52000000,
    fuel: "gasoline",
    transmission: "at",
    color: "Green",
    accident: true,
    region: "Дархан",
    createdAt: "2025-12-17T16:12:00.000Z",
    images: [sampleCarImage(9), sampleCarImage(19)],
    description: "Silver tier mock listing.",
    steering: "right",
    vin: "JF10000000002004",
    hasPlate: true,
  },
  {
    category: "car",
    tier: "silver",
    id: "car_s_2005",
    sellerName: "Мөнхөө",
    sellerPhone: "+976 9999-2005",
    manufacturer: "Toyota",
    model: "Vitz",
    subModel: "1.3",
    yearMade: 2010,
    yearImported: 2015,
    mileageKm: 198000,
    priceMnt: 16500000,
    fuel: "gasoline",
    transmission: "at",
    color: "Yellow",
    accident: false,
    region: "Улаанбаатар",
    createdAt: "2025-12-16T11:50:00.000Z",
    images: [sampleCarImage(12), sampleCarImage(2)],
    description: "Silver tier mock listing.",
    steering: "right",
    vin: "JTD0000000002005",
    hasPlate: false,
  },
  {
    category: "car",
    tier: "silver",
    id: "car_s_2006",
    sellerName: "Нараа",
    sellerPhone: "+976 9999-2006",
    manufacturer: "Nissan",
    model: "X-Trail",
    subModel: "T32",
    yearMade: 2016,
    yearImported: 2018,
    mileageKm: 132000,
    priceMnt: 54000000,
    fuel: "gasoline",
    transmission: "at",
    color: "Gray",
    accident: false,
    region: "Хөвсгөл",
    createdAt: "2025-12-15T08:10:00.000Z",
    images: [sampleCarImage(14), sampleCarImage(4)],
    description: "Silver tier mock listing.",
    steering: "right",
    vin: "JN10000000002006",
    hasPlate: true,
  },

  // General (12+)
  ...Array.from({ length: 12 }).map((_, idx) => {
    const n = idx + 1;
    const year = 2008 + (idx % 10);
    const regions: Region[] = ["Улаанбаатар", "Дархан", "Эрдэнэт", "Өмнөговь", "Хэнтий", "Хөвсгөл"];
    const fuels: Fuel[] = ["gasoline", "diesel", "lpg", "hybrid"];
    const colors = ["White", "Black", "Silver", "Blue", "Red"];
    const manufacturers = ["Toyota", "Hyundai", "Kia", "Honda", "Nissan"];
    const models = ["Aqua", "Elantra", "Rio", "Fit", "Tiida"];

    return {
      category: "car" as const,
      tier: "general" as const,
      id: `car_gn_${3000 + n}`,
      sellerName: `Seller ${n}`,
      sellerPhone: `+976 8888-${String(3000 + n).slice(-4)}`,
      manufacturer: manufacturers[idx % manufacturers.length],
      model: models[idx % models.length],
      subModel: `${year}`,
      yearMade: year,
      yearImported: Math.min(2024, year + 4),
      mileageKm: 90000 + idx * 12000,
      priceMnt: 12000000 + idx * 2500000,
      fuel: fuels[idx % fuels.length],
      transmission: idx % 5 === 0 ? ("mt" as const) : ("at" as const),
      color: colors[idx % colors.length],
      accident: idx % 4 === 0,
      region: regions[idx % regions.length],
      createdAt: new Date(Date.now() - idx * 36 * 60 * 60 * 1000).toISOString(),
      images: [sampleCarImage((idx % 20) + 1), sampleCarImage(((idx + 7) % 20) + 1)],
      description: "General tier mock listing.",
      steering: idx % 2 === 0 ? ("right" as const) : ("left" as const),
      vin: `VIN0000000000${3000 + n}`,
      hasPlate: idx % 3 !== 0,
    };
  }),
];

export const motorcycles: Motorcycle[] = [
  {
    category: "motorcycle",
    id: "moto_1",
    manufacturer: "Honda",
    model: "PCX",
    subModel: "160",
    tier: "general",
    sellerName: "Biker 1",
    sellerPhone: "+976 9999-4001",
    yearMade: 2022,
    yearImported: 2023,
    mileageKm: 12000,
    priceMnt: 7200000,
    region: "Улаанбаатар",
    fuel: "gasoline",
    color: "Black",
    createdAt: "2025-12-20T09:00:00.000Z",
    images: [sampleCarImage(3), sampleCarImage(13), sampleCarImage(18)],
  },
  {
    category: "motorcycle",
    id: "moto_2",
    manufacturer: "Yamaha",
    model: "NMAX",
    subModel: "155",
    tier: "silver",
    sellerName: "Biker 2",
    sellerPhone: "+976 9999-4002",
    yearMade: 2021,
    yearImported: 2022,
    mileageKm: 18000,
    priceMnt: 6500000,
    region: "Дархан",
    fuel: "gasoline",
    color: "Blue",
    createdAt: "2025-12-18T14:30:00.000Z",
    images: [sampleCarImage(7), sampleCarImage(17)],
  },
  {
    category: "motorcycle",
    id: "moto_3",
    manufacturer: "BMW",
    model: "CE 04",
    subModel: "Electric",
    tier: "gold",
    sellerName: "Biker 3",
    sellerPhone: "+976 9999-4003",
    yearMade: 2023,
    yearImported: 2024,
    mileageKm: 4500,
    priceMnt: 24500000,
    region: "Эрдэнэт",
    fuel: "electric",
    color: "White",
    createdAt: "2025-12-22T08:10:00.000Z",
    images: [sampleCarImage(1), sampleCarImage(11), sampleCarImage(16)],
  },
];

export const tires: Tire[] = [
  {
    category: "tire",
    id: "tire_1",
    brand: "Michelin",
    size: "225/55R17",
    season: "all-season",
    dotYear: 2022,
    installationIncluded: true,
    condition: "used",
    qty: 4,
    priceMnt: 900000,
    region: "Улаанбаатар",
    createdAt: "2025-12-17T12:00:00.000Z",
    images: [getTireImage("Michelin", "all-season", 0)],
  },
  {
    category: "tire",
    id: "tire_2",
    brand: "Bridgestone",
    size: "205/60R16",
    season: "winter",
    dotYear: 2023,
    installationIncluded: false,
    condition: "new",
    qty: 2,
    priceMnt: 680000,
    region: "Эрдэнэт",
    createdAt: "2025-12-16T10:20:00.000Z",
    images: [getTireImage("Bridgestone", "winter", 1)],
  },
  {
    category: "tire",
    id: "tire_3",
    brand: "Continental",
    size: "195/65R15",
    season: "summer",
    dotYear: 2021,
    installationIncluded: true,
    condition: "used",
    qty: 4,
    priceMnt: 750000,
    region: "Улаанбаатар",
    createdAt: "2025-12-15T14:30:00.000Z",
    images: [getTireImage("Continental", "summer", 2)],
  },
  {
    category: "tire",
    id: "tire_4",
    brand: "Pirelli",
    size: "235/55R18",
    season: "all-season",
    dotYear: 2024,
    installationIncluded: false,
    condition: "new",
    qty: 4,
    priceMnt: 1200000,
    region: "Дархан",
    createdAt: "2025-12-14T09:15:00.000Z",
    images: [getTireImage("Pirelli", "all-season", 3)],
  },
  {
    category: "tire",
    id: "tire_5",
    brand: "Goodyear",
    size: "205/55R16",
    season: "winter",
    dotYear: 2022,
    installationIncluded: true,
    condition: "used",
    qty: 4,
    priceMnt: 850000,
    region: "Улаанбаатар",
    createdAt: "2025-12-13T11:45:00.000Z",
    images: [getTireImage("Goodyear", "winter", 4)],
  },
  {
    category: "tire",
    id: "tire_6",
    brand: "Hankook",
    size: "225/45R17",
    season: "summer",
    dotYear: 2023,
    installationIncluded: false,
    condition: "new",
    qty: 4,
    priceMnt: 950000,
    region: "Эрдэнэт",
    createdAt: "2025-12-12T16:20:00.000Z",
    images: [getTireImage("Hankook", "summer", 5)],
  },
  {
    category: "tire",
    id: "tire_7",
    brand: "Kumho",
    size: "195/65R15",
    season: "all-season",
    dotYear: 2021,
    installationIncluded: true,
    condition: "used",
    qty: 2,
    priceMnt: 600000,
    region: "Улаанбаатар",
    createdAt: "2025-12-11T10:00:00.000Z",
    images: [getTireImage("Kumho", "all-season", 0)],
  },
  {
    category: "tire",
    id: "tire_8",
    brand: "Toyo",
    size: "235/55R18",
    season: "off-road",
    dotYear: 2024,
    installationIncluded: false,
    condition: "new",
    qty: 4,
    priceMnt: 1100000,
    region: "Дархан",
    createdAt: "2025-12-10T13:30:00.000Z",
    images: [getTireImage("Toyo", "off-road", 1)],
  },
  {
    category: "tire",
    id: "tire_9",
    brand: "Yokohama",
    size: "205/60R16",
    season: "winter",
    dotYear: 2022,
    installationIncluded: true,
    condition: "used",
    qty: 4,
    priceMnt: 800000,
    region: "Улаанбаатар",
    createdAt: "2025-12-09T15:15:00.000Z",
    images: [getTireImage("Yokohama", "winter", 2)],
  },
  {
    category: "tire",
    id: "tire_10",
    brand: "Michelin",
    size: "225/45R17",
    season: "summer",
    dotYear: 2023,
    installationIncluded: false,
    condition: "new",
    qty: 4,
    priceMnt: 1050000,
    region: "Эрдэнэт",
    createdAt: "2025-12-08T08:45:00.000Z",
    images: [getTireImage("Michelin", "summer", 3)],
  },
  {
    category: "tire",
    id: "tire_11",
    brand: "Bridgestone",
    size: "195/65R15",
    season: "all-season",
    dotYear: 2021,
    installationIncluded: true,
    condition: "used",
    qty: 4,
    priceMnt: 700000,
    region: "Улаанбаатар",
    createdAt: "2025-12-07T12:20:00.000Z",
    images: [getTireImage("Bridgestone", "all-season", 4)],
  },
  {
    category: "tire",
    id: "tire_12",
    brand: "Continental",
    size: "235/55R18",
    season: "winter",
    dotYear: 2024,
    installationIncluded: false,
    condition: "new",
    qty: 4,
    priceMnt: 1300000,
    region: "Дархан",
    createdAt: "2025-12-06T14:10:00.000Z",
    images: [getTireImage("Continental", "winter", 5)],
  },
];

export const parts: Part[] = [
  {
    category: "parts",
    id: "part_1",
    name: "Headlight (left)",
    forManufacturer: "Toyota",
    forModel: "Prius 30",
    condition: "used",
    priceMnt: 450000,
    region: "Улаанбаатар",
    createdAt: "2025-12-15T08:10:00.000Z",
    images: [sampleCarImage(18)],
  },
  {
    category: "parts",
    id: "part_2",
    name: "Brake pads set",
    condition: "new",
    priceMnt: 180000,
    region: "Дархан",
    createdAt: "2025-12-14T16:00:00.000Z",
    images: [sampleCarImage(20)],
  },
  {
    category: "parts",
    id: "part_3",
    name: "Leather Seat Cover Set",
    forManufacturer: "Hyundai",
    forModel: "Sonata YF",
    condition: "new",
    priceMnt: 320000,
    region: "Улаанбаатар",
    createdAt: "2025-12-13T10:30:00.000Z",
    images: [sampleCarImage(1)],
  },
  {
    category: "parts",
    id: "part_4",
    name: "Rear View Camera",
    condition: "new",
    priceMnt: 150000,
    region: "Улаанбаатар",
    createdAt: "2025-12-12T14:20:00.000Z",
    images: [sampleCarImage(2)],
  },
  {
    category: "parts",
    id: "part_5",
    name: "Floor Mat Set (4 pieces)",
    forManufacturer: "Toyota",
    forModel: "Land Cruiser 200",
    condition: "new",
    priceMnt: 85000,
    region: "Дархан",
    createdAt: "2025-12-11T09:15:00.000Z",
    images: [sampleCarImage(3)],
  },
  {
    category: "parts",
    id: "part_6",
    name: "Jump Starter Portable",
    condition: "new",
    priceMnt: 280000,
    region: "Улаанбаатар",
    createdAt: "2025-12-10T16:45:00.000Z",
    images: [sampleCarImage(4)],
  },
  {
    category: "parts",
    id: "part_7",
    name: "Front Bumper",
    forManufacturer: "Kia",
    forModel: "Sportage",
    condition: "used",
    priceMnt: 380000,
    region: "Эрдэнэт",
    createdAt: "2025-12-09T11:00:00.000Z",
    images: [sampleCarImage(5)],
  },
  {
    category: "parts",
    id: "part_8",
    name: "Car Seat Cover Premium",
    forManufacturer: "Subaru",
    forModel: "Forester",
    condition: "new",
    priceMnt: 195000,
    region: "Улаанбаатар",
    createdAt: "2025-12-08T13:30:00.000Z",
    images: [sampleCarImage(6)],
  },
  {
    category: "parts",
    id: "part_9",
    name: "Dash Camera Front & Rear",
    condition: "new",
    priceMnt: 420000,
    region: "Улаанбаатар",
    createdAt: "2025-12-07T15:20:00.000Z",
    images: [sampleCarImage(7)],
  },
  {
    category: "parts",
    id: "part_10",
    name: "Rubber Floor Mats",
    forManufacturer: "Toyota",
    forModel: "Alphard",
    condition: "new",
    priceMnt: 95000,
    region: "Дархан",
    createdAt: "2025-12-06T10:10:00.000Z",
    images: [sampleCarImage(8)],
  },
];


