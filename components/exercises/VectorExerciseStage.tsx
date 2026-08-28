import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { VectorPlayer } from "@/components/exercise-vector/VectorPlayer";
import type { ExerciseVisual } from "@/lib/exercise-vector/catalog-map";

/** Scène complète (fond + silhouette vectorielle + Coach Brian) pour la
 * boucle jouée pendant l'exécution réelle d'un exercice — remplace
 * Exercise3DStage (silhouette CSS Character3D), dont le patron articulaire
 * pouvait produire des membres visuellement inversés/confus sur certains
 * mouvements. */
export function VectorExerciseStage({ visual }: { visual: ExerciseVisual }) {
  if (!visual.movement) return null;
  return (
    <div className="exercise-stage-pitch relative flex h-full w-full items-center justify-center">
      <VectorPlayer movement={visual.movement} kit={visual.kit} showBall={visual.showBall} className="h-full w-full" />
      <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/40 py-1 pl-1 pr-3 backdrop-blur-sm">
        <BrianAvatar state="encouraging" size={32} className="ring-2 ring-white/70" />
        <span className="text-xs font-bold uppercase tracking-wide text-white">En boucle</span>
      </div>
    </div>
  );
}
