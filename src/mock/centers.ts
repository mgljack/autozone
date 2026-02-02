export type Center = {
  id: string;
  name: string;
  region: string;
  address: string;
  phone: string;
  phoneNumbers: string[];
  operatingHours: string;
  rating: number;
  services: string[];
  serviceItems: Array<{ name: string; priceMnt: number }>;
  image: string;
  images: string[];
  location: { address: string; lat: number; lng: number };
};

// Pexels high-quality car repair center images
const SERVICE_CENTER_IMAGES = [
  "https://images.pexels.com/photos/13065690/pexels-photo-13065690.jpeg", // Auto repair shop interior
  "https://images.pexels.com/photos/13065689/pexels-photo-13065689.jpeg", // Car repair center
  "https://images.pexels.com/photos/10126666/pexels-photo-10126666.jpeg", // Mechanic working on car
  "https://images.pexels.com/photos/3894030/pexels-photo-3894030.jpeg", // Car repair service
  "https://images.pexels.com/photos/32152039/pexels-photo-32152039.jpeg", // Auto repair workshop
  "https://images.pexels.com/photos/4756887/pexels-photo-4756887.jpeg", // Car maintenance center
];

export const centers: Center[] = [
  {
    id: "c_1",
    name: "UB Auto Center",
    region: "Улаанбаатар",
    address: "Sukhbaatar district, 1st khoroo",
    phone: "+976 9999-0001",
    phoneNumbers: ["1533-6451", "010-2345-6789"],
    operatingHours: "평일 09:00 - 18:00",
    rating: 4.6,
    services: ["Oil change", "Diagnostics", "Brake service"],
    serviceItems: [
      { name: "Engine oil change", priceMnt: 35000 },
      { name: "Computer diagnostics", priceMnt: 45000 },
      { name: "Brake pad replacement", priceMnt: 120000 },
      { name: "Wheel alignment", priceMnt: 60000 },
    ],
    image: SERVICE_CENTER_IMAGES[0],
    images: [
      SERVICE_CENTER_IMAGES[0],
      SERVICE_CENTER_IMAGES[1],
      SERVICE_CENTER_IMAGES[2],
      SERVICE_CENTER_IMAGES[3],
      SERVICE_CENTER_IMAGES[4],
    ],
    location: { address: "Sukhbaatar district, 1st khoroo", lat: 47.9186, lng: 106.9176 },
  },
  {
    id: "c_2",
    name: "Darkhan Car Service",
    region: "Дархан",
    address: "Darkhan city center, industrial zone",
    phone: "+976 9999-0002",
    phoneNumbers: ["1533-6451", "010-9876-5432"],
    operatingHours: "평일 09:00 - 18:00",
    rating: 4.2,
    services: ["Tire service", "Suspension", "AC service"],
    serviceItems: [
      { name: "Tire balancing", priceMnt: 30000 },
      { name: "Suspension check", priceMnt: 40000 },
      { name: "AC gas refill", priceMnt: 80000 },
      { name: "Brake fluid change", priceMnt: 35000 },
    ],
    image: SERVICE_CENTER_IMAGES[1],
    images: [
      SERVICE_CENTER_IMAGES[1],
      SERVICE_CENTER_IMAGES[2],
      SERVICE_CENTER_IMAGES[3],
      SERVICE_CENTER_IMAGES[4],
      SERVICE_CENTER_IMAGES[5],
    ],
    location: { address: "Darkhan city center, industrial zone", lat: 49.4867, lng: 105.9227 },
  },
  {
    id: "c_3",
    name: "Erdenet Quick Fix",
    region: "Эрдэнэт",
    address: "Erdenet, 2nd bag",
    phone: "+976 9999-0003",
    phoneNumbers: ["1533-6451", "010-1111-2222"],
    operatingHours: "평일 09:00 - 18:00",
    rating: 4.0,
    services: ["Diagnostics", "Electrical", "Battery"],
    serviceItems: [
      { name: "Battery test", priceMnt: 15000 },
      { name: "Electrical inspection", priceMnt: 50000 },
      { name: "Starter motor repair", priceMnt: 180000 },
      { name: "Alternator check", priceMnt: 40000 },
    ],
    image: SERVICE_CENTER_IMAGES[2],
    images: [
      SERVICE_CENTER_IMAGES[2],
      SERVICE_CENTER_IMAGES[3],
      SERVICE_CENTER_IMAGES[4],
      SERVICE_CENTER_IMAGES[5],
      SERVICE_CENTER_IMAGES[0],
    ],
    location: { address: "Erdenet, 2nd bag", lat: 49.0333, lng: 104.0833 },
  },
];


