import Link from "next/link";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";

const PAGES = [
  { href: "/ressources/nutrition", emoji: "🍽️", title: "Nutrition", desc: "Manger juste avant, pendant et après le match." },
  { href: "/ressources/mental", emoji: "🧠", title: "Mental", desc: "Gérer la pression, les erreurs, la confiance." },
  { href: "/ressources/filiere-pro", emoji: "🎓", title: "La vraie filière pro", desc: "Le parcours réaliste, sans rêve marketing." },
];

export default function RessourcesPage() {
  return (
    <div className="mx-auto max-w-md space-y-3 p-4 py-10">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Ressources</h1>
      {PAGES.map((p) => (
        <Link key={p.href} href={p.href}>
          <Card className="flex items-center gap-3">
            <span className="text-2xl">{p.emoji}</span>
            <div>
              <CardTitle className="text-base">{p.title}</CardTitle>
              <CardSubtitle>{p.desc}</CardSubtitle>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
