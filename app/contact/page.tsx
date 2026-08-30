import { APP_NAME } from "@/lib/app-config";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Contact",
  `Une question sur ${APP_NAME}, un problème avec ton compte, une suggestion ? Contacte l'équipe, on répond personnellement à chaque message.`,
  "/contact"
);

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 py-10">
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide">Contact</h1>
      <p className="text-[var(--color-text-muted)]">
        Une question sur {APP_NAME}, un problème avec ton compte, une suggestion ? Écris-nous, on répond
        personnellement à chaque message.
      </p>
      <a
        href="mailto:contact@progressa.app"
        className="inline-block font-display text-lg font-bold text-[var(--color-primary-strong)] underline"
      >
        contact@progressa.app
      </a>
    </div>
  );
}
