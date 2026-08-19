import Image from "next/image";
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
    <section className="lp-section relative overflow-hidden">
      <div className="lp-container grid gap-12 md:grid-cols-2 md:items-center">
        <Reveal className="order-2 md:order-1">
          <div className="relative mx-auto flex w-full max-w-sm items-end justify-center">
            <Image
              src="/brian/coach-brian.png"
              alt="Coach Brian"
              width={420}
              height={670}
              className="lp-float relative z-0 -mr-10 h-64 w-auto shrink-0 drop-shadow-[0_16px_24px_rgba(16,35,26,0.15)] sm:h-80"
              priority={false}
            />
            <div className="lp-card relative z-10 flex w-full max-w-[15.5rem] flex-col gap-3 overflow-hidden p-4 sm:max-w-[16.5rem]">
              <div className="lp-glow-ring" style={{ width: 160, height: 160, top: -60, right: -60 }} />
              <div className="relative flex items-center gap-2.5 border-b border-[var(--lp-border)] pb-2.5">
                <div className="lp-pulse relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-[var(--lp-accent-soft)]">
                  <Image src="/brian/coach-brian-avatar.png" alt="" fill className="object-cover" sizes="36px" />
                </div>
                <div>
                  <p className="font-display text-xs font-bold uppercase tracking-wide">Coach Brian</p>
                  <p className="text-[0.7rem] text-[var(--lp-accent-strong)]">En ligne</p>
                </div>
              </div>

              <div className="relative flex flex-col gap-2 pt-1">
                {MESSAGES.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-snug ${
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
          </div>
        </Reveal>

        <Reveal delayMs={100} className="order-1 flex flex-col gap-5 md:order-2">
          <span className="lp-eyebrow">Coach Brian</span>
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
