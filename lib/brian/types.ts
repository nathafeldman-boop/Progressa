import type { StatAxis } from "@prisma/client";

export type StatAxisValues = Record<StatAxis, number>;

export const STAT_AXES: StatAxis[] = ["VITESSE", "TECHNIQUE", "CONDUITE", "ENDURANCE", "PHYSIQUE", "MENTAL"];

export const STAT_LABELS: Record<StatAxis, string> = {
  VITESSE: "Vitesse",
  TECHNIQUE: "Technique",
  CONDUITE: "Conduite",
  ENDURANCE: "Endurance",
  PHYSIQUE: "Physique",
  MENTAL: "Mental",
};
