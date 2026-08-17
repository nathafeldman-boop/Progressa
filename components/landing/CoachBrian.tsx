import { Reveal } from "./reveal";

const MESSAGES = [
  { from: "brian" as const, text: "Bien joué. Ton contrôle de balle progresse." },
  { from: "player" as const, text: "Merci coach ! Je sens la différence sur les appuis." },
  { from: "brian" as const, text: "Demain, on travaille ton explosivité." },
  {
    from: "brian" as const,
    text: "Ton dribble est actuellement ton point fort. On va maintenant renforcer ta vitesse.",
  },
];

export function CoachBrian() {
  return (
    <section className="lp-section relative">
      <div className="lp-container grid gap-12 md:grid-cols-2 md:items-center">
        <Reveal className="order-2 md:order-1">
          <div className="lp-card relative mx-auto flex w-full max-w-sm flex-col gap-3 overflow-hidden p-5">
            <div className="lp-glow-ring" style={{ width: 200, height: 200, top: -70, left: -70 }} />
            <div className="relative flex items-center gap-3 border-b border-[var(--lp-border)] pb-3">
              <div className="lp-pulse relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--lp-accent-soft)] text-lg">
                🧑‍🏫
              </div>
              <div>
                <p className="font-display text-sm font-bold uppercase tracking-wide">Coach Brian</p>
                <p className="text-xs text-[var(--lp-accent-strong)]">En ligne</p>
              </div>
            </div>

            <div className="relative flex flex-col gap-2.5 pt-1">
              {MESSAGES.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.from === "brian"
                      ? "self-start rounded-tl-sm bg-[var(--lp-surface-2)] text-[var(--lp-text)]"
                      : "self-end rounded-tr-sm bg-[var(--lp-accent)] text-[var(--lp-on-accent)]"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delayMs={100} className="order-1 flex flex-col gap-5 md:order-2">
          <span className="lp-eyebrow">🧑‍🏫 Coach Brian</span>
          <h2 className="lp-h2">Ton coach. Ton parcours. Tes objectifs.</h2>
          <p className="max-w-md text-[var(--lp-text-muted)]">
            Brian suit ta progression, repère tes points forts et tes points faibles, et ajuste ton prochain
            entraînement en conséquence. Pas un catalogue d&apos;exercices à parcourir seul — un accompagnement qui
            connaît ton niveau.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
