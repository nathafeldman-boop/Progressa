import Image from "next/image";
import { cn } from "@/lib/cn";

export type BrianState =
  | "idle"
  | "talking"
  | "celebrating"
  | "encouraging"
  | "happy"
  | "confident"
  | "surprised"
  | "motivated"
  | "thinking";

/**
 * Icônes de tête statiques (section "EXPRESSIONS" de la planche de
 * référence) — utilisées comme substituts déterministes aux emojis
 * génériques de l'UI (nav, badges, en-têtes...). Toujours la même image
 * pour un même state, jamais de tirage aléatoire.
 */
const STATE_IMAGE: Record<BrianState, string> = {
  idle: "/brian/coach-brian-avatar.png",
  talking: "/brian/coach-brian-avatar.png",
  celebrating: "/brian/coach-brian-celebrating.png",
  encouraging: "/brian/coach-brian-encouraging.png",
  happy: "/brian/coach-brian-heureux.png",
  confident: "/brian/coach-brian-confiant.png",
  surprised: "/brian/coach-brian-surpris.png",
  motivated: "/brian/coach-brian-motive.png",
  thinking: "/brian/coach-brian-reflechi.png",
};

const STATE_ANIMATION: Record<BrianState, string> = {
  idle: "brian-breathe",
  talking: "brian-talk",
  celebrating: "brian-pop",
  encouraging: "brian-pop",
  happy: "",
  confident: "",
  surprised: "brian-pop",
  motivated: "",
  thinking: "",
};

export function BrianAvatar({
  state = "idle",
  size = 40,
  className,
}: {
  state?: BrianState;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-full", STATE_ANIMATION[state], className)}
      style={{ width: size, height: size }}
    >
      <Image src={STATE_IMAGE[state]} alt="Coach Brian" fill className="object-cover" sizes={`${size}px`} />
    </div>
  );
}
