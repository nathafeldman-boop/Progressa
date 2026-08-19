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
 * Discussion libre branchée sur Mistral (lib/brian/coach-chat.ts), avec le
 * contexte réel du joueur (stats, séances, série) injecté côté serveur —
 * jamais de donnée inventée. Si MISTRAL_API_KEY n'est pas configurée côté
 * serveur, l'API répond avec un message de repli honnête plutôt que de
 * planter. Les questions rapides restent branchées sur de vraies réponses
 * calculées (lib/brian/coach-qa.ts), sans appel modèle.
 */
export function CoachChat({ initialMessages }: { initialMessages: ChatMessage[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pending, setPending] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    window.localStorage.setItem("progressa:coach-last-viewed", new Date().toISOString());
  }, []);

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

  async function sendFreeText(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");
    const history = messages
      .filter((m) => m.id !== "welcome")
      .slice(-10)
      .map((m) => ({ role: (m.fromPlayer ? "user" : "assistant") as "user" | "assistant", text: m.text }));
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, category: "RETENTION", text, fromPlayer: true, createdAt: new Date().toISOString() },
    ]);
    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { id: data.id, category: "RETENTION", text: data.text, createdAt: data.createdAt }]);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-3 overflow-y-auto pb-3 pt-2">
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

      <div className="mx-auto w-full max-w-sm border-t border-[var(--color-border)] pt-3">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Questions rapides
        </p>
        <div className="flex flex-wrap justify-center gap-2">
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

        <form onSubmit={sendFreeText} className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={sending}
            placeholder="Écris à Coach Brian…"
            className="flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] disabled:opacity-50"
            aria-label="Envoyer"
          >
            {sending ? "…" : "➤"}
          </button>
        </form>
      </div>
    </div>
  );
}
