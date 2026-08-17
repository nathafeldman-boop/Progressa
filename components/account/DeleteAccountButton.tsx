"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";

const CONFIRM_WORD = "SUPPRIMER";

export function DeleteAccountButton() {
  const { signOut } = useClerk();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete() {
    setSubmitting(true);
    try {
      await fetch("/api/account/delete", { method: "DELETE" });
      await signOut({ redirectUrl: "/" });
    } finally {
      setSubmitting(false);
    }
  }

  if (!confirming) {
    return (
      <Button variant="danger" onClick={() => setConfirming(true)}>
        Supprimer mon compte
      </Button>
    );
  }

  return (
    <Card className="border-[var(--color-danger)]">
      <CardTitle className="text-[var(--color-danger)]">Supprimer définitivement le compte ?</CardTitle>
      <CardSubtitle className="mt-1">
        Toutes tes données (programmes, tests, journal, avis...) seront supprimées définitivement. Cette action est
        irréversible.
      </CardSubtitle>
      <p className="mt-3 text-sm">
        Tape <strong>{CONFIRM_WORD}</strong> pour confirmer.
      </p>
      <input
        className="mt-2 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
      />
      <div className="mt-3 flex gap-2">
        <Button variant="ghost" onClick={() => setConfirming(false)}>
          Annuler
        </Button>
        <Button variant="danger" disabled={typed !== CONFIRM_WORD || submitting} onClick={handleDelete}>
          {submitting ? "Suppression..." : "Supprimer définitivement"}
        </Button>
      </div>
    </Card>
  );
}
