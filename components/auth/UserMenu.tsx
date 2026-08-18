"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-bold text-white"
        aria-label="Menu du compte"
      >
        👤
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-20 w-44 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-lg">
          <Link
            href="/parametres"
            className="block rounded-[var(--radius-control)] px-3 py-2 text-sm hover:bg-[var(--color-surface-alt)]"
          >
            Réglages
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={loading}
            className="block w-full rounded-[var(--radius-control)] px-3 py-2 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-surface-alt)]"
          >
            {loading ? "Déconnexion..." : "Se déconnecter"}
          </button>
        </div>
      )}
    </div>
  );
}
