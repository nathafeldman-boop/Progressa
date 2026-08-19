export interface ExerciseFramePose {
  image: string;
  caption: string;
}

export interface ExerciseFrameSequence {
  poses: ExerciseFramePose[];
}

/**
 * Séquences de poses Coach Brian (fournies par l'utilisateur) pour la
 * démonstration frame-par-frame avant/pendant un exercice. Clé = slug du
 * catalogue (lib/exercises/catalog-data.ts). Un exercice non couvert ici
 * retombe sur la vidéo (EXERCISE_VIDEO) ou l'emoji — jamais d'écran cassé.
 */
export const EXERCISE_FRAMES: Partial<Record<string, ExerciseFrameSequence>> = {
  "squats-poids-du-corps": {
    poses: [
      { image: "/exercises/frames/squats-poids-du-corps/pose-1.png", caption: "Position de départ, dos droit." },
      { image: "/exercises/frames/squats-poids-du-corps/pose-2.png", caption: "Descends en poussant les fesses en arrière, bras tendus devant toi." },
      { image: "/exercises/frames/squats-poids-du-corps/pose-3.png", caption: "Cuisses parallèles au sol, genoux au-dessus des pieds." },
      { image: "/exercises/frames/squats-poids-du-corps/pose-4.png", caption: "Remonte en poussant sur les talons." },
    ],
  },
  "fentes-avant-alternees": {
    poses: [
      { image: "/exercises/frames/fentes-avant-alternees/pose-1.png", caption: "Position de départ, mains sur les hanches." },
      { image: "/exercises/frames/fentes-avant-alternees/pose-2.png", caption: "Avance une jambe loin devant toi." },
      { image: "/exercises/frames/fentes-avant-alternees/pose-3.png", caption: "Descends, le genou arrière proche du sol." },
      { image: "/exercises/frames/fentes-avant-alternees/pose-4.png", caption: "Reviens à la position de départ et change de jambe." },
    ],
  },
  "talons-fesses": {
    poses: [
      { image: "/exercises/frames/talons-fesses/pose-1.png", caption: "Position de départ, en légère course sur place." },
      { image: "/exercises/frames/talons-fesses/pose-2.png", caption: "Ramène le talon vers la fesse." },
      { image: "/exercises/frames/talons-fesses/pose-3.png", caption: "Alterne rapidement les jambes." },
      { image: "/exercises/frames/talons-fesses/pose-4.png", caption: "Garde le buste droit et reste sur l'avant-pied." },
    ],
  },
  "skipping-genoux-hauts": {
    poses: [
      { image: "/exercises/frames/skipping-genoux-hauts/pose-1.png", caption: "Position de départ." },
      { image: "/exercises/frames/skipping-genoux-hauts/pose-2.png", caption: "Lève un genou à hauteur de hanche." },
      { image: "/exercises/frames/skipping-genoux-hauts/pose-3.png", caption: "Alterne rapidement, reste léger sur tes appuis." },
      { image: "/exercises/frames/skipping-genoux-hauts/pose-4.png", caption: "Garde un rythme soutenu." },
    ],
  },
  "gainage-planche-ventrale": {
    poses: [
      { image: "/exercises/frames/gainage-planche-ventrale/pose-1.png", caption: "Position à quatre pattes." },
      { image: "/exercises/frames/gainage-planche-ventrale/pose-2.png", caption: "Tends une jambe vers l'arrière." },
      { image: "/exercises/frames/gainage-planche-ventrale/pose-3.png", caption: "Place-toi en planche, corps bien aligné." },
      { image: "/exercises/frames/gainage-planche-ventrale/pose-4.png", caption: "Maintiens la position, ne creuse pas le dos." },
    ],
  },
  "squat-jumps": {
    poses: [
      { image: "/exercises/frames/squat-jumps/pose-1.png", caption: "Position de départ." },
      { image: "/exercises/frames/squat-jumps/pose-2.png", caption: "Descends en squat." },
      { image: "/exercises/frames/squat-jumps/pose-3.png", caption: "Explose vers le haut, bras levés." },
      { image: "/exercises/frames/squat-jumps/pose-4.png", caption: "Réceptionne en souplesse et redescends en squat." },
    ],
  },
  "jonglages-progressifs": {
    poses: [
      { image: "/exercises/frames/jonglages-progressifs/pose-1.png", caption: "Touche le ballon avec l'intérieur du pied." },
      { image: "/exercises/frames/jonglages-progressifs/pose-2.png", caption: "Laisse-le redescendre sans le rattraper." },
      { image: "/exercises/frames/jonglages-progressifs/pose-3.png", caption: "Enchaîne un nouveau contact, garde-le proche de toi." },
      { image: "/exercises/frames/jonglages-progressifs/pose-4.png", caption: "Reste doux avec le ballon, contrôle près du corps." },
    ],
  },
  "passes-mur-controle": {
    poses: [
      { image: "/exercises/frames/passes-mur-controle/pose-1.png", caption: "Positionne-toi face au mur, ballon au pied." },
      { image: "/exercises/frames/passes-mur-controle/pose-2.png", caption: "Passe le ballon avec l'intérieur du pied." },
      { image: "/exercises/frames/passes-mur-controle/pose-3.png", caption: "Contrôle le ballon au retour et enchaîne." },
    ],
  },
};
