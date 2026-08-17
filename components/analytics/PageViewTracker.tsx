"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics/track";
import { getOrCreateAnonId } from "@/lib/onboarding/storage";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const anonId = getOrCreateAnonId();
    trackPageView(anonId, pathname);
  }, [pathname]);

  return null;
}
