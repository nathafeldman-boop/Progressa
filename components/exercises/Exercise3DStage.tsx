import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { Character3D, type Character3DPreset } from "@/components/exercises/Character3D";

/** Scène complète (fond + sol + silhouette 3D + Coach Brian) pour la boucle jouée pendant l'exécution réelle d'un exercice. */
export function Exercise3DStage({ preset }: { preset: Character3DPreset }) {
  return (
    <div className="char3d-stage">
      <div className="char3d-floor" />
      <div className="char3d-shadow" />
      <div className="char3d-camera">
        <Character3D preset={preset} />
      </div>
      <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/40 py-1 pl-1 pr-3 backdrop-blur-sm">
        <BrianAvatar state="encouraging" size={32} className="ring-2 ring-white/70" />
        <span className="text-xs font-bold uppercase tracking-wide text-white">En boucle</span>
      </div>
    </div>
  );
}
