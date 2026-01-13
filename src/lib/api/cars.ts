import rawCars from "@/mock/cars.json";
import { mockNetwork } from "@/lib/mockNetwork";

export type Car = {
  id: string;
  title: string;
  year: number;
  priceMnt: number;
  mileageKm: number;
  location: string;
  fuel: "Gasoline" | "Diesel" | "Hybrid" | "Electric";
  transmission: "AT" | "MT";
  steering: "LHD" | "RHD";
  images: string[];
  postedAt: string; // ISO string
};

const cars = rawCars as Car[];

export type ListCarsParams = {
  q?: string;
  location?: string;
  fuel?: Car["fuel"];
};

export async function listCars(params: ListCarsParams = {}): Promise<Car[]> {
  const q = params.q?.trim().toLowerCase();

  let filtered = cars.slice();

  if (q) {
    filtered = filtered.filter((c) => c.title.toLowerCase().includes(q));
  }
  if (params.location) {
    filtered = filtered.filter((c) => c.location === params.location);
  }
  if (params.fuel) {
    filtered = filtered.filter((c) => c.fuel === params.fuel);
  }

  filtered.sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
  );

  return await mockNetwork(filtered, 450);
}

export async function getCarById(id: string): Promise<Car | null> {
  const found = cars.find((c) => c.id === id) ?? null;
  return await mockNetwork(found, 350);
}


