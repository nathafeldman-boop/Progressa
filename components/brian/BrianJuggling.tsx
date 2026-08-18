import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Grande illustration plein pied de Coach Brian en train de jongler —
 * un vrai mouvement à 2 poses (flipbook, pas un simple rebond sur une
 * image fixe), synchronisé avec un rebond vertical. Distincte du petit
 * avatar circulaire (BrianAvatar), pour les moments où Brian doit occuper
 * l'écran (génération du programme, à côté d'un exercice en cours).
 */
export function BrianJuggling({ width = 160, className }: { width?: number; className?: string }) {
  return (
    <div className={cn("brian-juggle-bounce relative", className)} style={{ width, aspectRatio: "480 / 707" }}>
      <div className="brian-juggle-frame-a absolute inset-0">
        <Image
          src="/brian/coach-brian-juggling-1.png"
          alt="Coach Brian jongle avec le ballon"
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="brian-juggle-frame-b absolute inset-0">
        <Image src="/brian/coach-brian-juggling-2.png" alt="" aria-hidden fill className="object-contain" priority />
      </div>
    </div>
  );
}
