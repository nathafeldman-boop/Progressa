import Link from "next/link";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { APP_NAME, APP_TAGLINE } from "@/lib/app-config";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-4 pb-10 pt-16 text-center">
        <Chip>⚽ Fait pour les U14 → U18</Chip>
        <h1 className="font-display text-4xl font-extrabold uppercase leading-tight tracking-tight text-[var(--color-text)]">
          {APP_NAME}
        </h1>
        <p className="text-lg text-[var(--color-text-muted)]">{APP_TAGLINE}</p>
        <Link href="/onboarding" className="w-full">
          <Button className="w-full">Créer mon programme gratuit</Button>
        </Link>
        <p className="text-xs text-[var(--color-text-muted)]">
          Un préparateur physique individuel coûte 30-50€/séance. Ici, un abonnement mensuel — et un compte gratuit
          pour commencer.
        </p>
      </section>

      <section className="mx-auto grid w-full max-w-md gap-4 px-4 pb-16">
        <Card>
          <CardTitle>🎯 100% personnalisé</CardTitle>
          <CardSubtitle className="mt-1">
            Poste, âge, niveau, matériel disponible, objectif — ton programme s&apos;adapte chaque semaine à tes
            retours.
          </CardSubtitle>
        </Card>
        <Card>
          <CardTitle>🗓️ Calé sur ton calendrier club</CardTitle>
          <CardSubtitle className="mt-1">
            Jamais de séance intense la veille ou le jour d&apos;un match. Toujours en complément, jamais en
            remplacement.
          </CardSubtitle>
        </Card>
        <Card>
          <CardTitle>📊 Progression mesurée</CardTitle>
          <CardSubtitle className="mt-1">
            Tests d&apos;évaluation, carte joueur, badges — vois ta progression noir sur blanc.
          </CardSubtitle>
        </Card>
      </section>
    </main>
  );
}
