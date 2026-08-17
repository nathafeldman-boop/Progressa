/** Purely decorative stadium wash (floodlight glow + pitch lines) — no text, no interactivity. */
export function StadiumBackdrop({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="lp-floodlights" />
      <div className="lp-pitch-lines" />
    </div>
  );
}
