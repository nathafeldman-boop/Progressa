import { Reveal } from "./reveal";
import { PlayerCardView } from "@/components/card/PlayerCardView";

const DEMO_STATS = {
  overall: 72,
  skills: { Vitesse: 76, Tir: 65, Passe: 70, Dribble: 80, Défense: 58, Physique: 71 },
  rankTier: "Espoir",
  rankKey: "espoir",
  lastUpdated: new Date().toISOString(),
};

export function ShareSection() {
  return (
    <section className="lp-section relative overflow-hidden">
      <div className="lp-glow-ring" style={{ width: 380, height: 380, top: -100, right: -100 }} />

      <div className="lp-container relative grid gap-10 md:grid-cols-2 md:items-center">
        <Reveal className="flex flex-col gap-4">
          <span className="lp-eyebrow">Partage</span>
          <h2 className="lp-h2">Montre où tu en es.</h2>
          <p className="max-w-md text-[var(--lp-text-muted)]">
            Ta carte évolue à chaque semaine — partage-la à tes coéquipiers, ton coach ou tes proches, et montre ta
            progression au fil du temps.
          </p>
        </Reveal>

        <Reveal delayMs={100} className="mx-auto w-full max-w-xs">
          <PlayerCardView
            firstName="Toi"
            positionLabel="Milieu offensif"
            ageCategoryLabel="U16"
            country="France"
            niveauLabel="National 1"
            stats={DEMO_STATS}
          />
        </Reveal>
      </div>
    </section>
  );
}
