export type RentType = "small" | "large" | "truck";

export type RentItem = {
  id: string;
  rentType: RentType;
  title: string;
  model?: string;
  manufacturer?: string;
  fuel?: "gasoline" | "diesel" | "electric" | "hybrid";
  transmission?: "at" | "mt";
  yearMade?: number;
  mileageKm?: number;
  pricePerDayMnt: number;
  region: string;
  image: string;
  contactName: string;
  contactPhone: string;
  description?: string;
};

// Pexels black car images for rent vehicles
const RENT_SMALL_CAR_IMAGES = [
  "https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Black sedan
  "https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Black compact
  "https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Black hatchback
  "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Black small car
];

const RENT_LARGE_CAR_IMAGES = [
  "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Black SUV
  "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Black luxury SUV
  "https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Black premium SUV
  "https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Black large SUV
];

const RENT_TRUCK_IMAGES = [
  "https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Black truck
  "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Black cargo truck
  "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Black box truck
  "https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop", // Black delivery truck
];

export const rentItems: RentItem[] = [
  {
    id: "rent_s_1",
    rentType: "small",
    title: "Toyota Prius",
    manufacturer: "Toyota",
    model: "Prius",
    fuel: "hybrid",
    transmission: "at",
    yearMade: 2020,
    mileageKm: 35000,
    pricePerDayMnt: 160000,
    region: "Ulaanbaatar",
    image: RENT_SMALL_CAR_IMAGES[0],
    contactName: "Rent Desk",
    contactPhone: "+976 9911-0001",
    description: "연비 우수한 하이브리드 소형차",
  },
  {
    id: "rent_s_2",
    rentType: "small",
    title: "Honda Fit",
    manufacturer: "Honda",
    model: "Fit",
    fuel: "gasoline",
    transmission: "at",
    yearMade: 2019,
    mileageKm: 42000,
    pricePerDayMnt: 140000,
    region: "Ulaanbaatar",
    image: RENT_SMALL_CAR_IMAGES[1],
    contactName: "Rent Desk",
    contactPhone: "+976 9911-0002",
    description: "실용적인 소형 해치백",
  },
  {
    id: "rent_s_3",
    rentType: "small",
    title: "Nissan Leaf",
    manufacturer: "Nissan",
    model: "Leaf",
    fuel: "electric",
    transmission: "at",
    yearMade: 2021,
    mileageKm: 18000,
    pricePerDayMnt: 180000,
    region: "Ulaanbaatar",
    image: RENT_SMALL_CAR_IMAGES[2],
    contactName: "Rent Desk",
    contactPhone: "+976 9911-0003",
    description: "친환경 전기차",
  },
  {
    id: "rent_s_4",
    rentType: "small",
    title: "Toyota Corolla",
    manufacturer: "Toyota",
    model: "Corolla",
    fuel: "gasoline",
    transmission: "mt",
    yearMade: 2018,
    mileageKm: 55000,
    pricePerDayMnt: 150000,
    region: "Erdenet",
    image: RENT_SMALL_CAR_IMAGES[3],
    contactName: "Rent Desk",
    contactPhone: "+976 9911-0004",
    description: "신뢰성 높은 소형 세단",
  },
  {
    id: "rent_l_1",
    rentType: "large",
    title: "Toyota Land Cruiser 200",
    manufacturer: "Toyota",
    model: "Land Cruiser",
    fuel: "diesel",
    transmission: "at",
    yearMade: 2020,
    mileageKm: 28000,
    pricePerDayMnt: 550000,
    region: "Ulaanbaatar",
    image: RENT_LARGE_CAR_IMAGES[0],
    contactName: "Premium Rent",
    contactPhone: "+976 9911-0101",
    description: "고급 대형 SUV",
  },
  {
    id: "rent_l_2",
    rentType: "large",
    title: "Lexus RX 350",
    manufacturer: "Lexus",
    model: "RX",
    fuel: "gasoline",
    transmission: "at",
    yearMade: 2021,
    mileageKm: 15000,
    pricePerDayMnt: 420000,
    region: "Erdenet",
    image: RENT_LARGE_CAR_IMAGES[1],
    contactName: "Premium Rent",
    contactPhone: "+976 9911-0102",
    description: "럭셔리 중형 SUV",
  },
  {
    id: "rent_l_3",
    rentType: "large",
    title: "BMW X5",
    manufacturer: "BMW",
    model: "X5",
    fuel: "diesel",
    transmission: "at",
    yearMade: 2019,
    mileageKm: 35000,
    pricePerDayMnt: 480000,
    region: "Ulaanbaatar",
    image: RENT_LARGE_CAR_IMAGES[2],
    contactName: "Premium Rent",
    contactPhone: "+976 9911-0103",
    description: "프리미엄 대형 SUV",
  },
  {
    id: "rent_l_4",
    rentType: "large",
    title: "Mercedes-Benz GLE",
    manufacturer: "Mercedes-Benz",
    model: "GLE",
    fuel: "diesel",
    transmission: "at",
    yearMade: 2020,
    mileageKm: 25000,
    pricePerDayMnt: 500000,
    region: "Ulaanbaatar",
    image: RENT_LARGE_CAR_IMAGES[3],
    contactName: "Premium Rent",
    contactPhone: "+976 9911-0104",
    description: "고급 대형 SUV",
  },
  {
    id: "rent_t_1",
    rentType: "truck",
    title: "1.5t Box Truck",
    manufacturer: "Isuzu",
    model: "Elf",
    fuel: "diesel",
    transmission: "mt",
    yearMade: 2018,
    mileageKm: 85000,
    pricePerDayMnt: 380000,
    region: "Darkhan",
    image: RENT_TRUCK_IMAGES[0],
    contactName: "Truck Rent",
    contactPhone: "+976 9911-0201",
    description: "소형 화물차",
  },
  {
    id: "rent_t_2",
    rentType: "truck",
    title: "3t Cargo Truck",
    manufacturer: "Hino",
    model: "Dutro",
    fuel: "diesel",
    transmission: "mt",
    yearMade: 2019,
    mileageKm: 65000,
    pricePerDayMnt: 520000,
    region: "Ulaanbaatar",
    image: RENT_TRUCK_IMAGES[1],
    contactName: "Truck Rent",
    contactPhone: "+976 9911-0202",
    description: "중형 화물차",
  },
  {
    id: "rent_t_3",
    rentType: "truck",
    title: "5t Cargo Truck",
    manufacturer: "Fuso",
    model: "Canter",
    fuel: "diesel",
    transmission: "at",
    yearMade: 2020,
    mileageKm: 45000,
    pricePerDayMnt: 650000,
    region: "Ulaanbaatar",
    image: RENT_TRUCK_IMAGES[2],
    contactName: "Truck Rent",
    contactPhone: "+976 9911-0203",
    description: "대형 화물차",
  },
  {
    id: "rent_t_4",
    rentType: "truck",
    title: "10t Cargo Truck",
    manufacturer: "Volvo",
    model: "FM",
    fuel: "diesel",
    transmission: "at",
    yearMade: 2019,
    mileageKm: 72000,
    pricePerDayMnt: 850000,
    region: "Ulaanbaatar",
    image: RENT_TRUCK_IMAGES[3],
    contactName: "Truck Rent",
    contactPhone: "+976 9911-0204",
    description: "대형 트럭",
  },
];


