import { APP_NAME } from "@/lib/app-config";

/**
 * Écran plein écran, non-scrollable en dessous: bloque l'usage tant que le
 * joueur n'a pas ouvert le lien dans son vrai navigateur. La flèche pointe
 * vers le bouton "..." du navigateur intégré (TikTok/Instagram/Facebook...),
 * toujours en haut à droite de LEUR barre d'outils à eux, au-dessus de la
 * page — d'où la flèche qui sort du cadre plutôt qu'un simple pictogramme.
 */
export function OpenInBrowserOverlay({ appLabel }: { appLabel: string | null }) {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center bg-[#0b1410] px-6 pb-10 pt-6 text-white">
      <div className="flex w-full justify-end">
        <svg
          width="90"
          height="90"
          viewBox="0 0 90 90"
          fill="none"
          className="animate-[bounce_1.4s_ease-in-out_infinite] text-white"
          aria-hidden
        >
          <path
            d="M12 78C34 70 58 46 74 16"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M56 12L76 14L72 34"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-6xl">⋮</p>
        <h1 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-wide">Ouvre dans ton navigateur</h1>
        <p className="mt-4 max-w-xs text-base text-white/85">
          {appLabel ? `Tu es dans l'appli ${appLabel}` : "Tu es dans une appli"} — appuie sur les trois petits points en
          haut à droite, puis sur <strong>&laquo; Ouvrir dans le navigateur &raquo;</strong>.
        </p>
        <p className="mt-4 max-w-xs text-sm text-white/60">
          Une fois là-bas, tu pourras commencer à progresser avec {APP_NAME}.
        </p>
      </div>
    </div>
  );
}
