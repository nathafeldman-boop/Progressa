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
  "conduite-balle-int-ext": {
    poses: [
      { image: "/exercises/frames/conduite-balle-int-ext/pose-1.png", caption: "Ballon au pied, avance sur 15m." },
      { image: "/exercises/frames/conduite-balle-int-ext/pose-2.png", caption: "Touche avec l'intérieur du pied droit." },
      { image: "/exercises/frames/conduite-balle-int-ext/pose-3.png", caption: "Touche avec l'extérieur du pied gauche." },
      { image: "/exercises/frames/conduite-balle-int-ext/pose-4.png", caption: "Alterne pied gauche et pied droit sans ralentir." },
    ],
  },
  "feintes-corps-piquet": {
    poses: [
      { image: "/exercises/frames/feintes-corps-piquet/pose-1.png", caption: "Approche le piquet ballon au pied." },
      { image: "/exercises/frames/feintes-corps-piquet/pose-2.png", caption: "Feinte de corps explosive juste avant le piquet." },
      { image: "/exercises/frames/feintes-corps-piquet/pose-3.png", caption: "Pousse le ballon de l'autre côté du piquet." },
      { image: "/exercises/frames/feintes-corps-piquet/pose-4.png", caption: "Accélère pour sortir du duel." },
    ],
  },
  "gainage-mountain-climbers": {
    poses: [
      { image: "/exercises/frames/gainage-mountain-climbers/pose-1.png", caption: "Position de planche haute, mains sous les épaules." },
      { image: "/exercises/frames/gainage-mountain-climbers/pose-2.png", caption: "Ramène le genou droit vers la poitrine." },
      { image: "/exercises/frames/gainage-mountain-climbers/pose-3.png", caption: "Ramène le genou gauche vers la poitrine." },
      { image: "/exercises/frames/gainage-mountain-climbers/pose-4.png", caption: "Alterne rapidement, garde le dos plat." },
    ],
  },
  "squats-bulgares": {
    poses: [
      { image: "/exercises/frames/squats-bulgares/pose-1.png", caption: "Un pied posé sur le banc derrière toi." },
      { image: "/exercises/frames/squats-bulgares/pose-2.png", caption: "Descends en pliant la jambe avant." },
      { image: "/exercises/frames/squats-bulgares/pose-3.png", caption: "Descends jusqu'au point bas, genou proche du sol." },
      { image: "/exercises/frames/squats-bulgares/pose-4.png", caption: "Remonte de façon explosive." },
    ],
  },
  "elastique-marche-laterale": {
    poses: [
      { image: "/exercises/frames/elastique-marche-laterale/pose-1.png", caption: "Élastique placé juste au-dessus des genoux." },
      { image: "/exercises/frames/elastique-marche-laterale/pose-2.png", caption: "Descends en position de demi-squat." },
      { image: "/exercises/frames/elastique-marche-laterale/pose-3.png", caption: "Fais un pas explosif vers la droite." },
      { image: "/exercises/frames/elastique-marche-laterale/pose-4.png", caption: "Fais un pas vers la gauche, garde la tension." },
    ],
  },
  "sprints-courts-10m": {
    poses: [
      { image: "/exercises/frames/sprints-courts-10m/pose-1.png", caption: "Départ debout, prêt à sprinter." },
      { image: "/exercises/frames/sprints-courts-10m/pose-2.png", caption: "Essaie aussi un départ assis, au sol." },
      { image: "/exercises/frames/sprints-courts-10m/pose-3.png", caption: "Sprint à fond sur les 10 mètres." },
      { image: "/exercises/frames/sprints-courts-10m/pose-4.png", caption: "Marche de récupération avant de refaire un essai." },
    ],
  },
  "bondissements-lateraux": {
    poses: [
      { image: "/exercises/frames/bondissements-lateraux/pose-1.png", caption: "Position de départ, appuis souples." },
      { image: "/exercises/frames/bondissements-lateraux/pose-2.png", caption: "Bond explosif vers la droite." },
      { image: "/exercises/frames/bondissements-lateraux/pose-3.png", caption: "Bond explosif vers la gauche." },
      { image: "/exercises/frames/bondissements-lateraux/pose-4.png", caption: "Réceptionne en souplesse, reste stable." },
    ],
  },
  "sprint-changement-direction-5-10-5": {
    poses: [
      { image: "/exercises/frames/sprint-changement-direction-5-10-5/pose-1.png", caption: "Sprint à fond sur les 5 premiers mètres." },
      { image: "/exercises/frames/sprint-changement-direction-5-10-5/pose-2.png", caption: "Plante l'appui et pivote au repère de 5m." },
      { image: "/exercises/frames/sprint-changement-direction-5-10-5/pose-3.png", caption: "Sprint retour sur 10m, puis nouveau virage." },
    ],
  },
  "sauts-a-la-corde": {
    poses: [
      { image: "/exercises/frames/sauts-a-la-corde/pose-1.png", caption: "Position de départ, corde en main." },
      { image: "/exercises/frames/sauts-a-la-corde/pose-2.png", caption: "Sauts pieds joints, rythme régulier." },
      { image: "/exercises/frames/sauts-a-la-corde/pose-3.png", caption: "Passe en sauts alternés, un pied puis l'autre." },
      { image: "/exercises/frames/sauts-a-la-corde/pose-4.png", caption: "Garde un rythme régulier jusqu'à la fin." },
    ],
  },
  "departs-reactifs-signal": {
    poses: [
      { image: "/exercises/frames/departs-reactifs-signal/pose-1.png", caption: "Position d'attente, dos tourné au départ." },
      { image: "/exercises/frames/departs-reactifs-signal/pose-2.png", caption: "Réagis dès le signal sonore." },
      { image: "/exercises/frames/departs-reactifs-signal/pose-3.png", caption: "Départ explosif sur 8 mètres." },
      { image: "/exercises/frames/departs-reactifs-signal/pose-4.png", caption: "Ne relâche pas avant la fin de la course." },
    ],
  },
  "montees-marche-explosives": {
    poses: [
      { image: "/exercises/frames/montees-marche-explosives/pose-1.png", caption: "Face au banc, un pied posé dessus." },
      { image: "/exercises/frames/montees-marche-explosives/pose-2.png", caption: "Montée explosive, genou droit qui monte haut." },
      { image: "/exercises/frames/montees-marche-explosives/pose-3.png", caption: "Retour contrôlé, prépare l'autre jambe." },
      { image: "/exercises/frames/montees-marche-explosives/pose-4.png", caption: "Montée explosive côté gauche, alterne le rythme." },
    ],
  },
};
