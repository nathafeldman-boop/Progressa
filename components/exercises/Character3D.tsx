import { cn } from "@/lib/cn";

export type Character3DPreset = "squat" | "squat-jump" | "high-knees" | "jumping-jack";

/**
 * Silhouette 3D en CSS pur (aucune image, aucune librairie) — géométrie
 * humaine partagée entre tous les presets, seul le jeu de @keyframes
 * (défini dans app/globals.css sous `.char3d-rig--<preset>`) change le
 * mouvement. Voir globals.css pour la convention de signe des rotations
 * avant d'ajouter un nouveau preset.
 */
export function Character3D({ preset, className }: { preset: Character3DPreset; className?: string }) {
  return (
    <div className={cn("char3d-rig", `char3d-rig--${preset}`, className)}>
      <div className="char3d-pelvis">
        <div className="char3d-torso">
          <div className="char3d-waist">
            <div className="char3d-face" />
            <div className="char3d-side" />
          </div>
          <div className="char3d-chest">
            <div className="char3d-face" />
            <div className="char3d-side" />
          </div>
          <div className="char3d-neck">
            <div className="char3d-face" />
          </div>
          <div className="char3d-head">
            <div className="char3d-hair" />
          </div>
          <div className="char3d-shoulder char3d-shoulder-l">
            <div className="char3d-joint char3d-joint--shoulder" />
            <div className="char3d-upperarm">
              <div className="char3d-face" />
              <div className="char3d-side" />
              <div className="char3d-elbow">
                <div className="char3d-joint char3d-joint--elbow" />
                <div className="char3d-forearm">
                  <div className="char3d-face" />
                  <div className="char3d-side" />
                  <div className="char3d-hand" />
                </div>
              </div>
            </div>
          </div>
          <div className="char3d-shoulder char3d-shoulder-r">
            <div className="char3d-joint char3d-joint--shoulder" />
            <div className="char3d-upperarm">
              <div className="char3d-face" />
              <div className="char3d-side" />
              <div className="char3d-elbow">
                <div className="char3d-joint char3d-joint--elbow" />
                <div className="char3d-forearm">
                  <div className="char3d-face" />
                  <div className="char3d-side" />
                  <div className="char3d-hand" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="char3d-hip char3d-hip-l">
          <div className="char3d-joint char3d-joint--hip" />
          <div className="char3d-thigh">
            <div className="char3d-face" />
            <div className="char3d-side" />
            <div className="char3d-knee">
              <div className="char3d-joint char3d-joint--knee" />
              <div className="char3d-shin">
                <div className="char3d-face" />
                <div className="char3d-side" />
                <div className="char3d-foot" />
              </div>
            </div>
          </div>
        </div>
        <div className="char3d-hip char3d-hip-r">
          <div className="char3d-joint char3d-joint--hip" />
          <div className="char3d-thigh">
            <div className="char3d-face" />
            <div className="char3d-side" />
            <div className="char3d-knee">
              <div className="char3d-joint char3d-joint--knee" />
              <div className="char3d-shin">
                <div className="char3d-face" />
                <div className="char3d-side" />
                <div className="char3d-foot" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
