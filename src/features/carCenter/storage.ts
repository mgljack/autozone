import type { CarCenter, CarCenterDraft } from "./types";

const DRAFT_KEY = "autozone.sell.carCenterDraft";
const CENTERS_KEY = "autozone.carCenters";

export function readDraft(): CarCenterDraft | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(DRAFT_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function writeDraft(draft: CarCenterDraft): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}

export function readCenters(): CarCenter[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(CENTERS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function writeCenters(centers: CarCenter[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CENTERS_KEY, JSON.stringify(centers));
}

export function addCenter(center: CarCenter): void {
  const centers = readCenters();
  centers.push(center);
  writeCenters(centers);
}

