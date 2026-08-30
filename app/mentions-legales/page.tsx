import { APP_NAME } from "@/lib/app-config";
import { Card, CardTitle } from "@/components/ui/Card";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Mentions légales", `Mentions légales de l'application ${APP_NAME}.`, "/mentions-legales");

const SECTIONS = [
  {
    title: "Éditeur du site",
    body: `${APP_NAME} est actuellement édité à titre individuel, en cours de constitution en société. Raison sociale, forme juridique, siège social, numéro SIRET et capital social seront publiés ici dès l'immatriculation. En attendant, toute demande d'identification peut être adressée via la page Contact.`,
  },
  {
    title: "Directeur de la publication",
    body: "Le directeur de la publication est le représentant légal de l'éditeur mentionné ci-dessus.",
  },
  {
    title: "Hébergement",
    body: "L'application est hébergée par Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis) et la base de données par Supabase Inc. Le code source et les données ne sont hébergés par aucun autre tiers que ceux listés dans la politique de confidentialité.",
  },
  {
    title: "Propriété intellectuelle",
    body: `L'ensemble des contenus du site et de l'application ${APP_NAME} (textes, catalogue d'exercices, identité visuelle, marque, illustrations de Coach Brian) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle, sans autorisation préalable est interdite.`,
  },
  {
    title: "Contact",
    body: "Pour toute question relative au site, à l'application ou à ces mentions légales, utilise la page Contact.",
  },
];

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 py-10">
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide">Mentions légales</h1>
      {SECTIONS.map((section) => (
        <Card key={section.title}>
          <CardTitle className="text-base">{section.title}</CardTitle>
          <p className="mt-2 text-sm text-[var(--color-text)]">{section.body}</p>
        </Card>
      ))}
    </div>
  );
}
