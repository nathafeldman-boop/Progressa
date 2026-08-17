import Link from "next/link";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";

const LINKS = [
  { href: "/parametres/abonnement", emoji: "💳", label: "Abonnement", desc: "Passer Premium, gérer mon paiement" },
  { href: "/parametres/parrainage", emoji: "🎁", label: "Parrainage", desc: "Invite tes potes, gagne du Premium" },
  { href: "/parametres/compte", emoji: "👤", label: "Compte", desc: "Confidentialité, suppression du compte" },
  { href: "/confidentialite", emoji: "🔒", label: "Confidentialité", desc: "Notre politique en langage simple" },
];

export default function ParametresPage() {
  return (
    <div className="mx-auto max-w-md space-y-3 p-4">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Réglages</h1>
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href}>
          <Card className="flex items-center gap-3">
            <span className="text-2xl">{link.emoji}</span>
            <div>
              <CardTitle className="text-base">{link.label}</CardTitle>
              <CardSubtitle>{link.desc}</CardSubtitle>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
