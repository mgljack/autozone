"use client";

import { readLocalStorage, writeLocalStorage } from "@/lib/storage";
import type { MyListing, SellCategory, SellDraft } from "./types";

export function draftKey(category: SellCategory) {
  return `sellDraft:${category}`;
}

export function readDraft(category: SellCategory, fallback: SellDraft): SellDraft {
  return readLocalStorage<SellDraft>(draftKey(category), fallback);
}

export function writeDraft(category: SellCategory, draft: SellDraft): void {
  writeLocalStorage(draftKey(category), draft);
}

export function readMyListings(): MyListing[] {
  return readLocalStorage<MyListing[]>("myListings", []);
}

export function writeMyListings(list: MyListing[]): void {
  writeLocalStorage("myListings", list);
}

export function upsertMyListing(next: MyListing): void {
  const list = readMyListings();
  const idx = list.findIndex((x) => x.id === next.id);
  if (idx >= 0) {
    const copy = list.slice();
    copy[idx] = next;
    writeMyListings(copy);
  } else {
    writeMyListings([next, ...list]);
  }
}


