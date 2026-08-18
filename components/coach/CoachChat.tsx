"use client";

import { useEffect, useRef, useState } from "react";
import type { BrianMessageCategory } from "@prisma/client";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { stateForCategory } from "@/components/brian/BrianMessageCard";
import { QUICK_QUESTIONS } from "@/lib/brian/coach-qa";

interface ChatMessage {
  id: string;
  category: BrianMessageCategory;
  text: string;
  createdAt: string;
  fromPlayer?: boolean;
}

/**
 * Pas de conversation libre: aucun LLM n'est branché derrière Coach Brian
 * pour l'instant (point d'extension prévu — voir lib/brian/messages.ts).
 * Les questions rapides déclenchent de vraies réponses calculées sur les
 * données du joueur (lib/brian/coach-qa.ts), jamais un texte inventé.
 */
export function CoachChat({ initialMessages }: { initialMessages: ChatMessage[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pending, setPending] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function ask(questionKey: string, label: string) {
    setPending(questionKey);
    setMessages((prev) => [
      ...prev,
      { id: `q-${Date.now()}`, category: "RETENTION", text: label, fromPlayer: true, createdAt: new Date().toISOString() },
    ]);
    try {
      const res = await fetch("/api/coach/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionKey }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { id: data.id, category: "RETENTION", text: data.text, createdAt: data.createdAt }]);
      }
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-3 overflow-y-auto pb-3">
        {messages.map((m) =>
          m.fromPlayer ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-on-primary)]">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex items-start gap-2">
              <BrianAvatar state={stateForCategory(m.category)} size={32} />
              <div className="max-w-[75%] rounded-2xl rounded-tl-sm border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] shadow-[var(--shadow-card)]">
                {m.text}
              </div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[var(--color-border)] pt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Questions rapides
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q.key}
              type="button"
              disabled={pending !== null}
              onClick={() => ask(q.key, q.label)}
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] disabled:opacity-50"
            >
              {pending === q.key ? "..." : q.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
