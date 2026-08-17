import { APP_NAME } from "@/lib/app-config";

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 py-10">
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide">Mentions légales</h1>
      <p className="text-[var(--color-text-muted)]">
        {APP_NAME} est en cours de constitution en tant qu&apos;entité juridique. Les mentions légales complètes
        (identité de l&apos;éditeur, hébergeur, immatriculation) seront publiées ici dès leur finalisation.
      </p>
      <p className="text-sm text-[var(--color-text-muted)]">
        En attendant, pour toute question, contacte-nous via la page{" "}
        <a href="/contact" className="text-[var(--color-primary-strong)] underline">
          Contact
        </a>
        .
      </p>
    </div>
  );
}
