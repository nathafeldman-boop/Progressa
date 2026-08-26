import { InstallInstructions } from "@/components/pwa/InstallInstructions";
import { APP_NAME } from "@/lib/app-config";

export default function InstallerAppPage() {
  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Installer l&apos;app</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Ajoute {APP_NAME} sur ton écran d&apos;accueil pour l&apos;ouvrir en un tap, en plein écran.
        </p>
      </div>
      <InstallInstructions />
    </div>
  );
}
