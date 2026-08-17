"use client";

import { EMPTY_ONBOARDING_DATA, type OnboardingData } from "@/lib/onboarding/types";

const DATA_KEY = "app_onboarding_data";
const ANON_ID_KEY = "app_anon_id";
const REFERRAL_CODE_KEY = "app_referral_code";

/**
 * L'id anonyme est généré dès le tout premier écran, AVANT la création du
 * compte, pour pouvoir mesurer l'abandon écran par écran (section 8 du
 * produit). Il persiste tout le long de l'onboarding.
 */
export function getOrCreateAnonId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

export function loadOnboardingData(): OnboardingData {
  if (typeof window === "undefined") return EMPTY_ONBOARDING_DATA;
  try {
    const raw = window.localStorage.getItem(DATA_KEY);
    if (!raw) return EMPTY_ONBOARDING_DATA;
    return { ...EMPTY_ONBOARDING_DATA, ...JSON.parse(raw) };
  } catch {
    return EMPTY_ONBOARDING_DATA;
  }
}

export function saveOnboardingData(data: OnboardingData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

export function clearOnboardingData(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DATA_KEY);
}

export function setReferralCode(code: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REFERRAL_CODE_KEY, code);
}

export function getReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFERRAL_CODE_KEY);
}

export function clearReferralCode(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REFERRAL_CODE_KEY);
}
