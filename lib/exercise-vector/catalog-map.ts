import type { Movement } from "./types";
import { OUTFIELD_KIT, GOALKEEPER_KIT, type VectorKit } from "./kits";
import * as M from "./movements";

/**
 * "exact"/"approx": le mouvement représente fidèlement le geste réel.
 * "generic": aucun mouvement dédié n'existe pour ce cas précis — on
 * affiche un mouvement générique proche (course, tenue debout...) plutôt
 * que rien, mais ce n'est pas le geste réel de l'exercice.
 * "missing": aucun visuel — le mouvement réel (plongeon tête, tacle
 * glissé, duel aérien, tirage élastique, mollets, nordic curl) n'a pas
 * encore de famille de pose dédiée.
 */
export type MatchQuality = "exact" | "approx" | "generic" | "missing";

export interface ExerciseVisual {
  slug: string;
  name: string;
  movement: Movement | null;
  kit: VectorKit;
  showBall: boolean;
  showCones: boolean;
  quality: MatchQuality;
}

function entry(
  slug: string,
  name: string,
  movement: Movement | null,
  quality: MatchQuality,
  opts: { gk?: boolean; ball?: boolean; cones?: boolean } = {}
): ExerciseVisual {
  return {
    slug,
    name,
    movement,
    kit: opts.gk ? GOALKEEPER_KIT : OUTFIELD_KIT,
    showBall: !!opts.ball,
    showCones: !!opts.cones,
    quality: movement ? quality : "missing",
  };
}

export const EXERCISE_VISUALS: ExerciseVisual[] = [
  // TECHNIQUE
  entry("slalom-plots-serre", "Slalom plots serré", M.BALL_DRIBBLE, "exact", { ball: true, cones: true }),
  entry("conduite-balle-int-ext", "Conduite de balle intérieur/extérieur", M.BALL_DRIBBLE, "exact", { ball: true }),
  entry("jonglages-progressifs", "Jonglages progressifs", M.JUGGLING, "exact", { ball: true }),
  entry("passes-mur-controle", "Passes au mur + contrôle orienté", M.PASS_STRIKE, "exact", { ball: true }),
  entry("feintes-corps-piquet", "Feintes de corps face à un piquet", M.BALL_DRIBBLE, "approx", { ball: true, cones: true }),
  entry("frappe-enroulee-cible", "Frappe enroulée sur cible fixe", M.SHOT_STRIKE, "exact", { ball: true }),
  entry("frappe-puissance-surface", "Frappe en puissance depuis la surface", M.SHOT_STRIKE, "exact", { ball: true }),
  entry("frappe-volee-ballon-lance", "Frappe de volée sur ballon lancé", M.SHOT_STRIKE, "approx", { ball: true }),
  entry("controle-oriente-frappe-rapide", "Contrôle orienté + frappe rapide", M.SHOT_STRIKE, "approx", { ball: true }),
  entry("centre-frappe-couloir", "Centre du couloir + reprise", M.PASS_STRIKE, "approx", { ball: true, cones: true }),
  entry("dribble-1v1-plot-mobile", "Dribble 1v1 contre plot mobile", M.BALL_DRIBBLE, "exact", { ball: true, cones: true }),
  entry("passes-courtes-triangle", "Passes courtes en triangle", M.PASS_STRIKE, "exact", { ball: true, cones: true }),
  entry("frappe-premiere-intention", "Frappe de première intention", M.SHOT_STRIKE, "exact", { ball: true }),
  entry("frappe-pied-faible-cible", "Frappe cadrée du pied faible", M.SHOT_STRIKE, "exact", { ball: true }),
  entry("frappe-basse-enroulee-poteau", "Frappe basse enroulée au ras du poteau", M.SHOT_STRIKE, "exact", { ball: true }),
  entry("frappe-exterieur-surprise", "Frappe de l'extérieur du pied surprise", M.SHOT_STRIKE, "exact", { ball: true }),
  entry("tete-plongeante-cage", "Tête plongeante sur centre", null, "missing"),
  entry("finition-1v1-gardien", "Finition en 1 contre 1 face au gardien", M.SHOT_STRIKE, "approx", { ball: true }),
  entry("frappe-longue-distance", "Frappe longue distance (25m+)", M.SHOT_STRIKE, "exact", { ball: true }),
  entry("routine-penalty", "Routine de penalty", M.SHOT_STRIKE, "exact", { ball: true }),
  entry("passe-longue-diagonale", "Passe longue diagonale", M.PASS_STRIKE, "exact", { ball: true, cones: true }),
  entry("passe-cassee-entre-lignes", "Passe cassée entre les lignes", M.PASS_STRIKE, "exact", { ball: true, cones: true }),
  entry("remise-une-touche", "Remise en une touche", M.PASS_STRIKE, "approx", { ball: true, cones: true }),
  entry("controle-orientation-corps", "Contrôle avec orientation du corps", M.BALL_DRIBBLE, "approx", { ball: true }),
  entry("passe-exterieur-tranchante", "Passe extérieure tranchante", M.PASS_STRIKE, "exact", { ball: true, cones: true }),
  entry("tacle-glisse-controle", "Tacle glissé contrôlé", null, "missing"),
  entry("jockey-defensif-pas-chasses", "Position de jockey défensif", M.LATERAL_SHUFFLE, "exact"),
  entry("duel-aerien-defensif", "Duel aérien défensif", null, "missing"),
  entry("defense-1v1-face-dribbleur", "Défense en 1 contre 1 face à un dribbleur", M.LATERAL_SHUFFLE, "approx", { cones: true }),
  entry("interception-lecture-trajectoire", "Interception et lecture de trajectoire", M.LATERAL_SHUFFLE, "approx"),
  entry("repli-defensif-sprint", "Repli défensif sprinté", M.SPRINT, "exact"),
  entry("debordement-exterieur-centre", "Débordement extérieur + centre", M.BALL_DRIBBLE, "approx", { ball: true, cones: true }),
  entry("crochet-interieur-frappe", "Crochet vers l'intérieur + frappe", M.BALL_DRIBBLE, "approx", { ball: true, cones: true }),
  entry("protection-ballon-dos-adversaire", "Protection de balle dos à l'adversaire", M.BALL_SHIELD, "exact", { ball: true }),

  // STRENGTH
  entry("gainage-planche-ventrale", "Gainage planche ventrale", M.PLANK_FRONT_HOLD, "exact"),
  entry("gainage-lateral", "Gainage latéral", M.PLANK_SIDE_HOLD, "exact"),
  entry("squats-poids-du-corps", "Squats au poids du corps", M.SQUAT, "exact"),
  entry("fentes-avant-alternees", "Fentes avant alternées", M.FORWARD_LUNGE, "exact"),
  entry("pompes-genoux-pieds", "Pompes (genoux ou pieds)", M.PUSHUP, "exact"),
  entry("hip-thrust-sol", "Hip thrust au sol (pont fessier)", M.HIP_THRUST, "exact"),
  entry("gainage-mountain-climbers", "Gainage dynamique (mountain climbers)", M.MOUNTAIN_CLIMBERS, "exact"),
  entry("renforcement-mollets-pointes", "Renforcement mollets (montées sur pointes)", M.CALF_RAISES, "approx"),
  entry("squats-bulgares", "Squats bulgares", M.BULGARIAN_SPLIT_SQUAT, "exact"),
  entry("elastique-marche-laterale", "Marche latérale avec élastique", M.LATERAL_SHUFFLE, "approx"),
  entry("souleve-terre-jambe-tendue", "Soulevé de terre jambe tendue", M.SINGLE_LEG_RDL, "exact"),
  entry("gainage-rotation-medecine", "Gainage rotatif (anti-rotation)", M.ANTI_ROTATION_PRESS, "approx"),
  entry("tirage-elastique-dos", "Tirage élastique pour le dos", M.BAND_ROW, "approx"),
  entry("fentes-laterales-mobilite-hanches", "Fentes latérales", M.LATERAL_LUNGE, "exact"),

  // EXPLOSIVENESS
  entry("sprints-courts-10m", "Sprints courts 10m", M.SPRINT, "exact"),
  entry("skipping-genoux-hauts", "Skipping genoux hauts", M.HIGH_KNEES, "exact"),
  entry("talons-fesses", "Talons-fesses", M.HEEL_KICKS, "exact"),
  entry("squat-jumps", "Sauts en squat (squat jumps)", M.SQUAT_JUMP, "exact"),
  entry("bondissements-lateraux", "Bondissements latéraux (skater jumps)", M.LATERAL_BOUND, "exact"),
  entry("sprint-changement-direction-5-10-5", "Sprint + changement de direction", M.SPRINT, "approx", { cones: true }),
  entry("sauts-a-la-corde", "Sauts à la corde", M.ROPE_JUMP, "exact"),
  entry("departs-reactifs-signal", "Départs réactifs sur signal", M.SPRINT, "approx"),
  entry("montees-marche-explosives", "Montées de marche explosives", M.HIGH_KNEES, "approx"),
  entry("course-cote-courte", "Course en côte courte", M.SPRINT, "exact"),
  entry("course-lente-relachement", "Course lente en relâchement", M.JOG, "exact"),
  entry("echelle-agilite-pieds", "Échelle d'agilité", M.HIGH_KNEES, "approx"),
  entry("changement-direction-reactif-partenaire", "Changement de direction réactif", M.LATERAL_SHUFFLE, "approx"),
  entry("bondissements-avant-reception", "Bondissements avant (réception amortie)", M.VERTICAL_JUMP, "approx"),

  // CARDIO
  entry("fractionne-30-30", "Course fractionnée 30/30", M.SPRINT, "approx"),
  entry("footing-continu", "Footing continu", M.JOG, "exact"),
  entry("circuit-cardio-combine", "Circuit cardio combiné", M.JUMPING_JACKS, "approx"),
  entry("navette-progressive", "Course navette progressive", M.SPRINT, "approx"),
  entry("gammes-cardio-ballon", "Gammes cardio ballon", M.BALL_DRIBBLE, "approx", { ball: true }),
  entry("hiit-leger-20-10", "HIIT léger 20/10", M.JUMPING_JACKS, "approx"),
  entry("marche-active-accelerations", "Marche active + accélérations courtes", M.JOG, "approx"),
  entry("jonglage-cardio-deplacement", "Jonglage cardio en déplacement", M.JUGGLING, "approx", { ball: true }),
  entry("shuttle-run-match-simule", "Navettes simulant un rythme de match", M.SPRINT, "exact"),
  entry("footing-tempo-progressif", "Footing à tempo progressif", M.JOG, "exact"),
  entry("circuit-ballon-cardio-technique", "Circuit combiné ballon + cardio", M.BALL_DRIBBLE, "approx", { ball: true }),

  // PREVENTION
  entry("mobilite-chevilles", "Mobilité chevilles", M.ANKLE_CIRCLES, "approx"),
  entry("etirements-ischio-dynamiques", "Étirements dynamiques ischio-jambiers", M.FORWARD_HINGE_STRETCH, "exact"),
  entry("equilibre-unipodal-genoux", "Équilibre unipodal", M.SINGLE_LEG_BALANCE, "exact"),
  entry("gainage-lombaire-doux", "Gainage lombaire doux", M.PLANK_FRONT_HOLD, "approx"),
  entry("mobilite-hanches-cercles", "Mobilité hanches (cercles)", M.HIP_CIRCLES, "approx"),
  entry("proprioception-cheville-serviette", "Proprioception cheville", M.SINGLE_LEG_BALANCE, "exact"),
  entry("etirements-adducteurs", "Étirements adducteurs", M.WIDE_SIDE_LEAN_STRETCH, "exact"),
  entry("nordic-curl-assiste", "Nordic curl assisté", M.NORDIC_CURL_APPROX, "approx"),
  entry("respiration-retour-au-calme", "Respiration + retour au calme guidé", M.RELAXED_STAND, "exact"),
  entry("automassage-mollets", "Auto-massage mollets", M.CALF_FOAM_ROLL, "exact"),
  entry("mobilite-epaules-cercles", "Mobilité des épaules", M.SHOULDER_CIRCLES, "approx"),
  entry("etirement-fessiers-pigeon", "Étirement des fessiers (pigeon)", M.FLOOR_SEATED_STRETCH, "exact"),
  entry("auto-massage-quadriceps", "Auto-massage quadriceps", M.QUAD_FOAM_ROLL, "approx"),
  entry("gainage-oiseau-chien-stabilite", "Gainage oiseau-chien", M.BIRD_DOG, "exact"),

  // GOALKEEPER
  entry("plongeon-lateral-amorti", "Plongeon latéral amorti", M.GK_LATERAL_DIVE, "exact", { gk: true }),
  entry("prise-balle-haute", "Prise de balle haute", M.GK_HIGH_CATCH, "exact", { gk: true, ball: true }),
  entry("relance-pied-courte-longue", "Relance au pied courte/longue", M.PASS_STRIKE, "approx", { gk: true, ball: true }),
  entry("reflexes-mains-rapprochees", "Réflexes mains rapprochées", M.GK_LOW_BLOCK_MOVE, "approx", { gk: true }),
  entry("sorties-aeriennes", "Sorties aériennes", M.GK_HIGH_CATCH, "approx", { gk: true, ball: true }),
  entry("blocage-sol-parade-basse", "Blocage au sol (parade basse)", M.GK_LOW_BLOCK_MOVE, "exact", { gk: true }),
  entry("duel-face-a-face-gardien", "Duel face à face (1v1 gardien)", M.GK_LOW_BLOCK_MOVE, "approx", { gk: true }),
  entry("repositionnement-lateral-pas-chasses", "Repositionnement latéral rapide", M.LATERAL_SHUFFLE, "exact", { gk: true }),
  entry("distribution-precise-main", "Distribution précise à la main", M.GK_DISTRIBUTION, "exact", { gk: true }),
  entry("enchainement-plongeon-releve-plongeon", "Enchaînement plongeon-relevé-plongeon", M.GK_LATERAL_DIVE, "approx", { gk: true }),
  entry("footwork-echelle-gardien", "Footwork gardien (échelle)", M.HIGH_KNEES, "approx", { gk: true }),
  entry("reduction-angle-1v1", "Réduction d'angle en 1 contre 1", M.GK_LOW_BLOCK_MOVE, "approx", { gk: true }),
  entry("reflexes-frappes-rapprochees", "Réflexes sur frappes rapprochées", M.GK_LOW_BLOCK_MOVE, "approx", { gk: true }),
  entry("distribution-sous-pression", "Distribution sous pression temporelle", M.GK_DISTRIBUTION, "approx", { gk: true }),
];

export function getExerciseVisual(slug: string): ExerciseVisual | undefined {
  return EXERCISE_VISUALS.find((e) => e.slug === slug);
}
