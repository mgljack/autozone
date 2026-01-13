"use client";

import React from "react";

import { readLocalStorage, writeLocalStorage } from "@/lib/storage";

// Required by prototype spec
const REQUIRED_KEY = "favorites";
// Legacy key used across existing pages
const LEGACY_KEY = "turbo.favorites";

export type FavoriteItem = {
  id: string;
  title: string;
  priceMnt: number;
  image: string;
  createdAt: string;
};

function readFavoriteItems(): FavoriteItem[] {
  const raw = readLocalStorage<unknown>(REQUIRED_KEY, []);
  if (!Array.isArray(raw)) return [];
  // very defensive parsing (prototype)
  return raw
    .map((x) => (typeof x === "object" && x ? (x as any) : null))
    .filter(Boolean)
    .map((x) => ({
      id: String((x as any).id ?? ""),
      title: String((x as any).title ?? ""),
      priceMnt: Number((x as any).priceMnt ?? 0) || 0,
      image: String((x as any).image ?? ""),
      createdAt: String((x as any).createdAt ?? ""),
    }))
    .filter((x) => !!x.id);
}

function readLegacyFavoriteIds(): string[] {
  return readLocalStorage<string[]>(LEGACY_KEY, []);
}

function mergedFavoriteIds(): string[] {
  const items = readFavoriteItems();
  const legacy = readLegacyFavoriteIds();
  const set = new Set<string>();
  for (const it of items) set.add(it.id);
  for (const id of legacy) set.add(id);
  return Array.from(set);
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>(() => mergedFavoriteIds());

  const toggleFavorite = React.useCallback((id: string, item?: FavoriteItem) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
      // keep legacy ids key for existing UI pieces
      writeLocalStorage(LEGACY_KEY, next);

      // required key: store minimal objects
      try {
        const prevItems = readFavoriteItems();
        const exists = prevItems.some((x) => x.id === id);
        const adding = !prev.includes(id);
        const nextItems = adding
          ? item
            ? [item, ...prevItems.filter((x) => x.id !== id)]
            : exists
              ? prevItems
              : prevItems
          : prevItems.filter((x) => x.id !== id);
        writeLocalStorage(REQUIRED_KEY, nextItems);
      } catch {
        // ignore
      }

      return next;
    });
  }, []);

  const isFavorite = React.useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  return { favoriteIds, toggleFavorite, isFavorite };
}


