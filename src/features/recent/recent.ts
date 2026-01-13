"use client";

import React from "react";

import { readLocalStorage, writeLocalStorage } from "@/lib/storage";

export type RecentCar = {
  id: string;
  viewedAt: string; // ISO
};

const STORAGE_KEY = "turbo.recentCars";
const MAX_ITEMS = 10;

function readRecent(): RecentCar[] {
  return readLocalStorage<RecentCar[]>(STORAGE_KEY, []);
}

export function useRecentCars() {
  const [recent, setRecent] = React.useState<RecentCar[]>(() => readRecent());

  const addRecent = React.useCallback((id: string) => {
    const now = new Date().toISOString();
    setRecent((prev) => {
      const without = prev.filter((x) => x.id !== id);
      const next = [{ id, viewedAt: now }, ...without].slice(0, MAX_ITEMS);
      writeLocalStorage(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const clearRecent = React.useCallback(() => {
    writeLocalStorage(STORAGE_KEY, []);
    setRecent([]);
  }, []);

  return { recent, addRecent, clearRecent };
}


