import { rankStyleFor } from "@/lib/card/rank-styles";

/** Mini badge en forme d'écusson de carte, coloré selon le rang du joueur — remplace un emoji générique par un repère visuel cohérent avec la vraie carte. */
export function RankCardBadge({ rankKey, size = 28 }: { rankKey: string | undefined; size?: number }) {
  const style = rankStyleFor(rankKey);
  return (
    <span
      aria-hidden
      className="inline-block shrink-0"
      style={{
        width: size,
        height: size * 1.2,
        background: `linear-gradient(165deg, ${style.gradient[0]}, ${style.gradient[1]})`,
        border: `1.5px solid ${style.border}`,
        borderRadius: "20% 20% 45% 45% / 15% 15% 30% 30%",
        boxShadow: `0 0 10px -2px ${style.border}99`,
      }}
    />
  );
}
