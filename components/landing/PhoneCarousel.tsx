"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Screen = {
  key: string;
  label: string;
  content: ReactNode;
};

function PhoneFrame({ children, floatDelayMs }: { children: ReactNode; floatDelayMs: number }) {
  return (
    <div
      className="lp-phone-float mx-auto w-full max-w-[220px] rounded-[2rem] border-[6px] border-[var(--lp-text)] bg-[var(--lp-text)] p-1.5 shadow-[0_30px_60px_-20px_rgba(16,35,26,0.35)]"
      style={{ animationDelay: `${floatDelayMs}ms` }}
    >
      <div className="relative aspect-[9/17] overflow-hidden rounded-[1.5rem] bg-[var(--lp-bg)] px-4 pb-5 pt-7">
        <div
          className="absolute left-1/2 top-1.5 h-1.5 w-14 -translate-x-1/2 rounded-full bg-[var(--lp-text)] opacity-70"
          aria-hidden
        />
        {children}
      </div>
    </div>
  );
}

/**
 * Shows each screen mocked up as a floating phone. On wide viewports all
 * phones fit side by side and stay static. When they don't fit (mobile),
 * it becomes a one-at-a-time carousel that auto-advances every 1.8s,
 * looping forever on a plain setInterval (steady cadence, no scroll-snap
 * flakiness).
 */
export function PhoneCarousel({ screens }: { screens: Screen[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduceMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting), {
      threshold: 0.4,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || reduceMotion) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % screens.length);
    }, 1800);
    return () => clearInterval(id);
  }, [playing, reduceMotion, screens.length]);

  return (
    <div ref={containerRef}>
      <div className="lp-phones-viewport">
        <div className="lp-phones-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {screens.map((screen, i) => (
            <div key={screen.key} className="lp-phones-slide">
              <PhoneFrame floatDelayMs={i * 450}>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--lp-text-dim)]">
                  {screen.label}
                </p>
                <div className="mt-4">{screen.content}</div>
              </PhoneFrame>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-center gap-1.5 md:hidden" aria-hidden>
        {screens.map((screen, i) => (
          <span
            key={screen.key}
            className="h-1.5 w-1.5 rounded-full transition-colors"
            style={{ background: i === index ? "var(--lp-accent)" : "var(--lp-border-strong)" }}
          />
        ))}
      </div>
    </div>
  );
}
