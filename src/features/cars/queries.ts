"use client";

import { useQuery } from "@tanstack/react-query";

import { getCarById, listCars, type Car, type ListCarsParams } from "@/lib/api/cars";

export function carsKeys() {
  return {
    all: ["cars"] as const,
    list: (params: ListCarsParams) => ["cars", "list", params] as const,
    detail: (id: string) => ["cars", "detail", id] as const,
  };
}

export function useCars(params: ListCarsParams) {
  return useQuery<Car[]>({
    queryKey: carsKeys().list(params),
    queryFn: () => listCars(params),
  });
}

export function useCar(id: string) {
  return useQuery<Car | null>({
    queryKey: carsKeys().detail(id),
    queryFn: () => getCarById(id),
  });
}


