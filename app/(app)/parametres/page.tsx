import Link from "next/link";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { BrianAvatar, type BrianState } from "@/components/brian/BrianAvatar";

const LINKS: { href: string; brianState: BrianState; label: string; desc: string }[] = [
  { href: "/parametres/abonnement", brianState: "confident", label: "Abonnement", desc: "Passer Premium, gérer mon paiement" },
  { href: "/parametres/materiel", brianState: "encouraging", label: "Mon matériel", desc: "Ballon, plots, élastique... à jour selon ce que tu as" },
  { href: "/parametres/parrainage", brianState: "happy", label: "Parrainage", desc: "Invite tes potes, gagne du Premium" },
  { href: "/parametres/installer-app", brianState: "motivated", label: "Installer l'app", desc: "Ajoute Progressa à ton écran d'accueil" },
  { href: "/parametres/compte", brianState: "idle", label: "Compte", desc: "Confidentialité, suppression du compte" },
  { href: "/confidentialite", brianState: "thinking", label: "Confidentialité", desc: "Notre politique en langage simple" },
];

export default function ParametresPage() {
  return (
    <div className="mx-auto max-w-md space-y-3 p-4">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Réglages</h1>
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href}>
          <Card className="flex items-center gap-3">
            <BrianAvatar state={link.brianState} size={36} />
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
