/**
 * Purely decorative stadium art — no text, no interactivity. Kept as
 * hand-authored SVG (a handful of flat shapes + gradients) rather than a
 * photo: no licensed player photography exists for this product, and a
 * confident poster-style silhouette reads as premium without the risk of
 * an uncanny AI-generated photo.
 */

export function StadiumBackdrop({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="lp-floodlights" />
      <div className="lp-pitch-lines" />
    </div>
  );
}

/** A footballer seen from behind, mid-stride, jersey lit from the stadium above. */
export function PlayerSilhouette({ number = "10", className }: { number?: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 420 640"
      className={className}
      role="img"
      aria-label={`Joueur de dos, maillot numéro ${number}`}
    >
      <defs>
        <radialGradient id="lp-ground" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1aa350" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#1aa350" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lp-jersey" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1c4430" />
          <stop offset="55%" stopColor="#123420" />
          <stop offset="100%" stopColor="#0a2016" />
        </linearGradient>
        <linearGradient id="lp-rim" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1aa350" stopOpacity="0" />
          <stop offset="100%" stopColor="#1aa350" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="lp-skin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5a4330" />
          <stop offset="100%" stopColor="#3a2b1c" />
        </linearGradient>
      </defs>

      <ellipse cx="210" cy="600" rx="150" ry="26" fill="url(#lp-ground)" />

      {/* back leg */}
      <path
        d="M175 430 L160 560 Q158 585 180 588 L206 588 Q214 588 214 578 L212 430 Z"
        fill="url(#lp-jersey)"
      />
      {/* front leg, striding */}
      <path
        d="M232 430 L262 550 Q270 578 246 586 L222 588 Q212 586 214 574 L228 430 Z"
        fill="url(#lp-jersey)"
      />

      {/* shorts */}
      <path d="M158 388 L262 388 L252 436 L168 436 Z" fill="#0a2016" />

      {/* torso / jersey */}
      <path
        d="M138 210 Q134 300 150 392 Q210 412 270 392 Q286 300 282 210 Q272 168 210 160 Q148 168 138 210 Z"
        fill="url(#lp-jersey)"
        stroke="url(#lp-rim)"
        strokeWidth="3"
      />

      {/* jersey number */}
      <text
        x="210"
        y="300"
        textAnchor="middle"
        fontFamily="var(--font-display), sans-serif"
        fontWeight="800"
        fontSize="108"
        fill="#eafff2"
        fillOpacity="0.92"
      >
        {number}
      </text>

      {/* left arm, bent toward ribs */}
      <path
        d="M140 214 Q112 236 108 288 Q106 320 124 336 Q136 344 144 330 Q130 300 136 268 Q140 240 156 220 Z"
        fill="url(#lp-jersey)"
      />
      {/* right arm, bent toward ribs */}
      <path
        d="M280 214 Q308 236 312 288 Q314 320 296 336 Q284 344 276 330 Q290 300 284 268 Q280 240 264 220 Z"
        fill="url(#lp-jersey)"
      />
      {/* hands near ribs */}
      <circle cx="122" cy="332" r="11" fill="url(#lp-skin)" />
      <circle cx="298" cy="332" r="11" fill="url(#lp-skin)" />

      {/* neck + head */}
      <rect x="196" y="128" width="28" height="34" rx="10" fill="url(#lp-skin)" />
      <circle cx="210" cy="104" r="40" fill="url(#lp-skin)" />
      {/* short hair cap */}
      <path d="M172 96 Q210 58 248 96 Q248 76 210 66 Q172 76 172 96 Z" fill="#081a11" />

      {/* rim light along the right edge — the stadium floodlight from behind */}
      <path
        d="M282 210 Q286 300 270 392"
        stroke="url(#lp-rim)"
        strokeWidth="4"
        fill="none"
        opacity="0.8"
      />
    </svg>
  );
}
