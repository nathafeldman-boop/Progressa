"use client";

import { useEffect, useRef, useState } from "react";
import type { BrianMessageCategory } from "@prisma/client";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { stateForCategory } from "@/components/brian/BrianMessageCard";
import { QUICK_QUESTIONS } from "@/lib/brian/coach-qa";
import { RewardedAdButton } from "@/components/ads/RewardedAdButton";
import { trackClick } from "@/lib/analytics/track";
import { getOrCreateAnonId } from "@/lib/onboarding/storage";
import type { BrianMessageQuota } from "@/lib/brian/message-quota";

interface ChatMessage {
  id: string;
  category: BrianMessageCategory;
  text: string;
  createdAt: string;
  fromPlayer?: boolean;
}

// Hors du composant: un appel impur (horloge) ici n'affecte jamais la
// pureté du rendu, contrairement au même appel écrit directement dans le
// corps du composant (règle react-hooks/purity).
let optimisticIdCounter = 0;
function makeOptimisticId(prefix: string): string {
  optimisticIdCounter += 1;
  return `${prefix}-${optimisticIdCounter}`;
}
function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Discussion libre branchée sur Mistral (lib/brian/coach-chat.ts), avec le
 * contexte réel du joueur (stats, séances, série) injecté côté serveur —
 * jamais de donnée inventée. Si MISTRAL_API_KEY n'est pas configurée côté
 * serveur, l'API répond avec un message de repli honnête plutôt que de
 * planter. Les questions rapides restent branchées sur de vraies réponses
 * calculées (lib/brian/coach-qa.ts), sans appel modèle.
 *
 * `initialQuota` est null pour un joueur premium (illimité, aucun bandeau
 * affiché). Pour un joueur gratuit, le quota est toujours celui renvoyé
 * par le serveur (jamais recalculé côté client) — chaque réponse de
 * /api/coach/chat, /api/coach/ask et /api/ads/complete renvoie l'état à
 * jour, donc un refresh de page ne peut jamais désynchroniser l'affichage.
 */
export function CoachChat({ initialMessages, initialQuota }: { initialMessages: ChatMessage[]; initialQuota: BrianMessageQuota | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pending, setPending] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [quota, setQuota] = useState<BrianMessageQuota | null>(initialQuota);
  const [quotaError, setQuotaError] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const limitTracked = useRef(false);

  useEffect(() => {
    if (quota && !quota.unlimited && quota.remaining <= 0 && !limitTracked.current) {
      limitTracked.current = true;
      trackClick(getOrCreateAnonId(), "brian_daily_limit_reached", "/coach");
    }
    if (quota && quota.remaining > 0) limitTracked.current = false;
  }, [quota]);

  const exhausted = quota != null && !quota.unlimited && quota.remaining <= 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    window.localStorage.setItem("progressa:coach-last-viewed", new Date().toISOString());
  }, []);

  async function ask(questionKey: string, label: string) {
    if (exhausted) return;
    setPending(questionKey);
    const optimisticId = makeOptimisticId("q");
    setMessages((prev) => [
      ...prev,
      { id: optimisticId, category: "RETENTION", text: label, fromPlayer: true, createdAt: nowIso() },
    ]);
    try {
      const res = await fetch("/api/coach/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionKey }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessages((prev) => [...prev, { id: data.id, category: "RETENTION", text: data.text, createdAt: data.createdAt }]);
        setQuota(data.brianQuota ?? null);
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        if (data.brianQuota) setQuota(data.brianQuota);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
    } finally {
      setPending(null);
    }
  }

  async function sendFreeText(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending || exhausted) return;
    setSending(true);
    setDraft("");
    const history = messages
      .filter((m) => m.id !== "welcome")
      .slice(-10)
      .map((m) => ({ role: (m.fromPlayer ? "user" : "assistant") as "user" | "assistant", text: m.text }));
    const optimisticId = makeOptimisticId("u");
    setMessages((prev) => [
      ...prev,
      { id: optimisticId, category: "RETENTION", text, fromPlayer: true, createdAt: nowIso() },
    ]);
    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessages((prev) => [...prev, { id: data.id, category: "RETENTION", text: data.text, createdAt: data.createdAt }]);
        setQuota(data.brianQuota ?? null);
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        if (data.brianQuota) setQuota(data.brianQuota);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
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
        {quota && !quota.unlimited && (
          <div className="mb-3">
            {exhausted ? (
              <div className="space-y-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3.5 text-center">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  Tu as utilisé tes {quota.limit} messages gratuits aujourd&apos;hui.
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">Tu peux attendre demain, ou débloquer 5 messages de plus.</p>
                {quotaError && <p className="text-xs text-[var(--color-danger)]">Publicité indisponible, réessaie.</p>}
                <RewardedAdButton
                  kind="BRIAN_MESSAGES"
                  rewardLabel="+5 messages"
                  onGranted={(data) => {
                    setQuotaError(false);
                    const nextQuota = data.brianQuota as BrianMessageQuota | undefined;
                    if (nextQuota) setQuota(nextQuota);
                    else setQuotaError(true);
                  }}
                />
              </div>
            ) : (
              <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                {quota.remaining} message{quota.remaining > 1 ? "s" : ""} gratuit{quota.remaining > 1 ? "s" : ""} restant
                {quota.remaining > 1 ? "s" : ""} aujourd&apos;hui
              </p>
            )}
          </div>
        )}

        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Questions rapides
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q.key}
              type="button"
              disabled={pending !== null || exhausted}
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
            disabled={sending || exhausted}
            placeholder={exhausted ? "Messages gratuits épuisés pour aujourd'hui" : "Écris à Coach Brian…"}
            className="flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || exhausted || !draft.trim()}
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
