import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TestimonialForm } from "@/components/testimonials/TestimonialForm";
import { APP_NAME } from "@/lib/app-config";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Avis des joueurs",
  `Découvre ce que les jeunes footballeurs pensent de ${APP_NAME} : programmes personnalisés, suivi de progression, carte joueur qui évolue. Partage aussi ton propre avis.`,
  "/avis"
);

export default async function AvisPage() {
  const [user, approved] = await Promise.all([
    getCurrentInternalUser(),
    prisma.testimonial.findMany({ where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  return (
    <div className="mx-auto max-w-md space-y-4 p-4 py-10">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Avis des joueurs</h1>

      {user ? (
        <TestimonialForm />
      ) : (
        <Card className="text-center">
          <CardTitle className="text-base">Connecte-toi pour laisser un avis</CardTitle>
          <Link href="/connexion" className="mt-3 block">
            <Button className="w-full">Se connecter</Button>
          </Link>
        </Card>
      )}

      {approved.length === 0 ? (
        <CardSubtitle>Pas encore d&apos;avis publié.</CardSubtitle>
      ) : (
        approved.map((t) => (
          <Card key={t.id}>
            <p className="text-sm font-semibold">
              {t.firstNameSnapshot} · {"⭐".repeat(t.rating)}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t.text}</p>
          </Card>
        ))
      )}

      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Tous les avis publiés sur {APP_NAME} sont vérifiés avant publication.
      </p>
    </div>
  );
}
