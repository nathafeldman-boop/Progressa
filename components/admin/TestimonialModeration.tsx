"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardSubtitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface PendingTestimonial {
  id: string;
  firstNameSnapshot: string;
  rating: number;
  text: string;
}

export function TestimonialModeration({ testimonials }: { testimonials: PendingTestimonial[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function moderate(id: string, status: "APPROVED" | "REJECTED") {
    setPendingId(id);
    try {
      await fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  if (testimonials.length === 0) {
    return (
      <Card>
        <CardSubtitle>Aucun avis en attente.</CardSubtitle>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {testimonials.map((t) => (
        <Card key={t.id}>
          <p className="text-sm font-semibold">
            {t.firstNameSnapshot} · {"⭐".repeat(t.rating)}
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t.text}</p>
          <div className="mt-2 flex gap-2">
            <Button disabled={pendingId === t.id} onClick={() => moderate(t.id, "APPROVED")}>
              Approuver
            </Button>
            <Button variant="danger" disabled={pendingId === t.id} onClick={() => moderate(t.id, "REJECTED")}>
              Rejeter
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
