"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app] uncaught root error", error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          color: "#10231a",
          background: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- root error boundary: doit rester minimal, pas de next/image */}
        <img src="/brian/coach-brian-surpris.png" alt="" width={72} height={72} style={{ borderRadius: "999px" }} />
        <h1 style={{ fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em" }}>
          Un problème est survenu
        </h1>
        <p style={{ maxWidth: "24rem", fontSize: "0.9rem", color: "#5c6b63" }}>
          Quelque chose s&apos;est mal passé. Réessaie — si ça continue, reviens un peu plus tard.
        </p>
        <button
          onClick={reset}
          style={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.75rem",
            border: "none",
            background: "#1aa350",
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
