"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function TestimonialForm() {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (text.trim().length < 10) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, text }),
      });
      if (res.ok) {
        setDone(true);
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Card className="text-center">
        <CardTitle className="text-base">Merci !</CardTitle>
        <CardSubtitle>Ton avis sera publié après vérification.</CardSubtitle>
      </Card>
    );
  }

  return (
    <Card className="space-y-3">
      <CardTitle className="text-base">Laisser un avis</CardTitle>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} className="text-2xl">
            {n <= rating ? "⭐" : "☆"}
          </button>
        ))}
      </div>
      <textarea
        className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
        placeholder="Ton expérience avec l'app..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={600}
      />
      <Button className="w-full" onClick={submit} disabled={submitting || text.trim().length < 10}>
        Envoyer
      </Button>
    </Card>
  );
}
