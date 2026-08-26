"use client";

const AFF_CODE_KEY = "progressa_aff_code";
const ATTRIBUTION_DAYS = 30;

interface StoredAffCode {
  code: string;
  expiresAt: number;
}

export function storeAffCode(code: string): void {
  if (typeof window === "undefined") return;
  const entry: StoredAffCode = { code, expiresAt: Date.now() + ATTRIBUTION_DAYS * 24 * 60 * 60 * 1000 };
  window.localStorage.setItem(AFF_CODE_KEY, JSON.stringify(entry));
}

/** Code affilié à attribuer à la prochaine conversion — null si absent ou expiré (fenêtre d'attribution de 30 jours). */
export function getStoredAffCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AFF_CODE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as StoredAffCode;
    if (Date.now() > entry.expiresAt) {
      window.localStorage.removeItem(AFF_CODE_KEY);
      return null;
    }
    return entry.code;
  } catch {
    return null;
  }
}
