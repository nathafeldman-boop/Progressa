"use client";

import { useState } from "react";
import { Reveal } from "./reveal";
import { APP_NAME } from "@/lib/app-config";

const FAQ_ITEMS = [
  {
    q: "Est-ce que le premier entraînement est gratuit ?",
    a: "Oui. Ta première séance est entièrement gratuite, sans carte bancaire à renseigner.",
  },
  {
    q: `À qui s'adresse ${APP_NAME} ?`,
    a: "Aux joueurs et joueuses de 16 ans et plus qui veulent progresser en dehors des entraînements club.",
  },
  {
    q: "Comment fonctionne Coach Brian ?",
    a: "Brian suit tes résultats et tes retours après chaque séance pour ajuster ton prochain entraînement — toujours à partir de ton profil et de ta progression, jamais au hasard.",
  },
  {
    q: "Comment sont calculées mes statistiques ?",
    a: "À partir de tests de performance simples (vitesse, technique, gainage, agilité) et des séances que tu complètes.",
  },
  {
    q: "Est-ce que les entraînements sont personnalisés ?",
    a: "Oui. Poste, âge, niveau, matériel disponible et objectif — ton parcours s'adapte à toi, pas l'inverse.",
  },
  {
    q: "Est-ce que je peux progresser à mon rythme ?",
    a: "Totalement. Tu choisis ton nombre de séances par semaine, et ton programme s'ajuste en conséquence.",
  },
  {
    q: "Que se passe-t-il après mon premier entraînement ?",
    a: "Tu débloques ta toute première carte joueur et tu vois où tu te situes. Tu peux continuer gratuitement (1 séance/semaine) ou passer en illimité.",
  },
  {
    q: "Puis-je arrêter mon abonnement ?",
    a: "Oui, à tout moment, directement depuis ton compte. Aucun engagement.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="lp-section relative scroll-mt-16">
      <div className="lp-container max-w-2xl">
        <Reveal className="text-center">
          <span className="lp-eyebrow justify-center">Questions fréquentes</span>
          <h2 className="lp-h2 mt-3">Tout ce qu&apos;il faut savoir.</h2>
        </Reveal>

        <div className="mt-8 flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => {
            const open = openIndex === i;
            return (
              <Reveal key={item.q} delayMs={i * 40}>
                <div className="lp-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-display text-sm font-bold uppercase tracking-wide">{item.q}</span>
                    <span
                      className={`shrink-0 text-[var(--lp-accent-strong)] transition-transform duration-200 ${open ? "rotate-45" : ""}`}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                  {open && <p className="px-5 pb-4 text-sm text-[var(--lp-text-muted)]">{item.a}</p>}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
