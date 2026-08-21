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
  "slalom-plots-serre": {
    poses: [
      { image: "/exercises/frames/slalom-plots-serre/pose-1.png", caption: "Touche le ballon avec l'intérieur du pied fort à chaque plot." },
      { image: "/exercises/frames/slalom-plots-serre/pose-2.png", caption: "Passe à l'extérieur du pied fort au plot suivant." },
      { image: "/exercises/frames/slalom-plots-serre/pose-3.png", caption: "Accélère une fois sorti du dernier plot." },
    ],
  },
  "course-cote-courte": {
    poses: [
      { image: "/exercises/frames/course-cote-courte/pose-1.png", caption: "Position de départ, en bas de la pente." },
      { image: "/exercises/frames/course-cote-courte/pose-2.png", caption: "Montée explosive, pousse fort sur chaque appui." },
      { image: "/exercises/frames/course-cote-courte/pose-3.png", caption: "Maintiens l'allure jusqu'en haut." },
      { image: "/exercises/frames/course-cote-courte/pose-4.png", caption: "Redescends en marchant pour récupérer." },
    ],
  },
  "course-lente-relachement": {
    poses: [
      { image: "/exercises/frames/course-lente-relachement/pose-1.png", caption: "Position de départ, allure très modérée." },
      { image: "/exercises/frames/course-lente-relachement/pose-2.png", caption: "Relâche complètement les épaules et les bras." },
      { image: "/exercises/frames/course-lente-relachement/pose-3.png", caption: "Garde une foulée souple, sans à-coup." },
      { image: "/exercises/frames/course-lente-relachement/pose-4.png", caption: "Maintiens un rythme constant jusqu'à la fin." },
    ],
  },
  "gainage-lateral": {
    poses: [
      { image: "/exercises/frames/gainage-lateral/pose-1.png", caption: "Allonge-toi sur le côté, coude bien sous l'épaule." },
      { image: "/exercises/frames/gainage-lateral/pose-2.png", caption: "Décolle le bassin en poussant sur le bras." },
      { image: "/exercises/frames/gainage-lateral/pose-3.png", caption: "Tiens la position : chevilles, hanches et épaules alignées." },
      { image: "/exercises/frames/gainage-lateral/pose-4.png", caption: "Redescends doucement, puis change de côté." },
    ],
  },
  "gainage-lombaire-doux": {
    poses: [
      { image: "/exercises/frames/gainage-lombaire-doux/pose-1.png", caption: "Allonge-toi sur le dos, genoux pliés, pieds à plat." },
      { image: "/exercises/frames/gainage-lombaire-doux/pose-2.png", caption: "Plaque le bas du dos au sol en rentrant le ventre." },
      { image: "/exercises/frames/gainage-lombaire-doux/pose-3.png", caption: "Décolle une jambe sans laisser le dos se creuser." },
    ],
  },
  "hip-thrust-sol": {
    poses: [
      { image: "/exercises/frames/hip-thrust-sol/pose-1.png", caption: "Allonge-toi, pieds à plat près des fesses." },
      { image: "/exercises/frames/hip-thrust-sol/pose-2.png", caption: "Monte jusqu'à aligner épaules, hanches et genoux. Serre les fessiers." },
      { image: "/exercises/frames/hip-thrust-sol/pose-3.png", caption: "Redescends lentement sans poser les fesses." },
    ],
  },
  "pompes-genoux-pieds": {
    poses: [
      { image: "/exercises/frames/pompes-genoux-pieds/pose-1.png", caption: "Mains sous les épaules, corps bien aligné." },
      { image: "/exercises/frames/pompes-genoux-pieds/pose-2.png", caption: "Descends en gardant les coudes près du corps." },
      { image: "/exercises/frames/pompes-genoux-pieds/pose-3.png", caption: "Remonte en poussant fort sur les mains." },
    ],
  },
  "equilibre-unipodal-genoux": {
    poses: [
      { image: "/exercises/frames/equilibre-unipodal-genoux/pose-1.png", caption: "Debout, regard droit devant toi." },
      { image: "/exercises/frames/equilibre-unipodal-genoux/pose-2.png", caption: "Lève un pied, fléchis légèrement le genou d'appui." },
      { image: "/exercises/frames/equilibre-unipodal-genoux/pose-3.png", caption: "Tiens : le genou reste aligné avec la pointe du pied." },
    ],
  },
  "proprioception-cheville-serviette": {
    poses: [
      { image: "/exercises/frames/proprioception-cheville-serviette/pose-1.png", caption: "Plie une serviette et pose-la au sol." },
      { image: "/exercises/frames/proprioception-cheville-serviette/pose-2.png", caption: "Pose un pied dessus, l'autre reste au sol." },
      { image: "/exercises/frames/proprioception-cheville-serviette/pose-3.png", caption: "Tiens sur une jambe : la cheville travaille toute seule." },
      { image: "/exercises/frames/proprioception-cheville-serviette/pose-4.png", caption: "Version difficile : ferme les yeux." },
    ],
  },
  "tacle-glisse-controle": {
    poses: [
      { image: "/exercises/frames/tacle-glisse-controle/pose-1.png", caption: "Position de départ, face au porteur de balle." },
      { image: "/exercises/frames/tacle-glisse-controle/pose-2.png", caption: "Approche de biais, jamais de face." },
      { image: "/exercises/frames/tacle-glisse-controle/pose-3.png", caption: "Glisse, jambe tendue, en visant le ballon." },
      { image: "/exercises/frames/tacle-glisse-controle/pose-4.png", caption: "Relève-toi tout de suite, ballon récupéré." },
    ],
  },
  "duel-aerien-defensif": {
    poses: [
      { image: "/exercises/frames/duel-aerien-defensif/pose-1.png", caption: "Position de départ, lis la trajectoire du ballon." },
      { image: "/exercises/frames/duel-aerien-defensif/pose-2.png", caption: "Cours te placer sous le point de chute." },
      { image: "/exercises/frames/duel-aerien-defensif/pose-3.png", caption: "Saute et dégage de la tête, front haut." },
      { image: "/exercises/frames/duel-aerien-defensif/pose-4.png", caption: "Retombe équilibré, prêt pour la suite." },
    ],
  },
  "jockey-defensif-pas-chasses": {
    poses: [
      { image: "/exercises/frames/jockey-defensif-pas-chasses/pose-1.png", caption: "Position basse, face à l'attaquant." },
      { image: "/exercises/frames/jockey-defensif-pas-chasses/pose-2.png", caption: "Recule en pas chassés, sans croiser les appuis." },
      { image: "/exercises/frames/jockey-defensif-pas-chasses/pose-3.png", caption: "Reste sur la pointe des pieds, concentré." },
      { image: "/exercises/frames/jockey-defensif-pas-chasses/pose-4.png", caption: "Position maîtrisée, prêt à réagir." },
    ],
  },
  "feintes-corps-piquet": {
    poses: [
      { image: "/exercises/frames/feintes-corps-piquet/pose-1.png", caption: "Balle au pied, face au piquet." },
      { image: "/exercises/frames/feintes-corps-piquet/pose-2.png", caption: "Feinte le corps d'un côté, les épaules trompent l'adversaire." },
      { image: "/exercises/frames/feintes-corps-piquet/pose-3.png", caption: "Change d'appui et repars de l'autre côté." },
      { image: "/exercises/frames/feintes-corps-piquet/pose-4.png", caption: "Accélère dans l'espace libéré." },
    ],
  },
  "dribble-1v1-plot-mobile": {
    poses: [
      { image: "/exercises/frames/dribble-1v1-plot-mobile/pose-1.png", caption: "Balle au pied, face au plot mobile." },
      { image: "/exercises/frames/dribble-1v1-plot-mobile/pose-2.png", caption: "Provoque, garde la balle protégée du corps." },
      { image: "/exercises/frames/dribble-1v1-plot-mobile/pose-3.png", caption: "Élimine d'un crochet sec, change de rythme." },
      { image: "/exercises/frames/dribble-1v1-plot-mobile/pose-4.png", caption: "Accélère pour ressortir du dribble en vitesse." },
    ],
  },
  "plongeon-lateral-amorti": {
    poses: [
      { image: "/exercises/frames/plongeon-lateral-amorti/pose-1.png", caption: "Position de base, mains prêtes devant toi." },
      { image: "/exercises/frames/plongeon-lateral-amorti/pose-2.png", caption: "Pousse fort sur l'appui, pars vers le côté." },
      { image: "/exercises/frames/plongeon-lateral-amorti/pose-3.png", caption: "Étends-toi vers le ballon, mains devant." },
      { image: "/exercises/frames/plongeon-lateral-amorti/pose-4.png", caption: "Amortis la réception, ballon plaqué au sol." },
    ],
  },
  "frappe-enroulee-cible": {
    poses: [
      { image: "/exercises/frames/frappe-enroulee-cible/pose-1.png", caption: "Balle au sol, fixe la cible du regard." },
      { image: "/exercises/frames/frappe-enroulee-cible/pose-2.png", caption: "Course d'approche en angle vers le ballon." },
      { image: "/exercises/frames/frappe-enroulee-cible/pose-3.png", caption: "Frappe de l'extérieur du pied pour enrouler." },
      { image: "/exercises/frames/frappe-enroulee-cible/pose-4.png", caption: "La trajectoire courbe vient chercher la cible." },
    ],
  },
  "frappe-puissance-surface": {
    poses: [
      { image: "/exercises/frames/frappe-puissance-surface/pose-1.png", caption: "Balle posée à l'entrée de la surface." },
      { image: "/exercises/frames/frappe-puissance-surface/pose-2.png", caption: "Course d'appel, corps gainé vers le ballon." },
      { image: "/exercises/frames/frappe-puissance-surface/pose-3.png", caption: "Frappe du cou-de-pied, cheville verrouillée." },
      { image: "/exercises/frames/frappe-puissance-surface/pose-4.png", caption: "Frappe puissante, droit au but." },
    ],
  },
  "frappe-volee-ballon-lance": {
    poses: [
      { image: "/exercises/frames/frappe-volee-ballon-lance/pose-1.png", caption: "Un partenaire (ou toi-même) lance le ballon en l'air." },
      { image: "/exercises/frames/frappe-volee-ballon-lance/pose-2.png", caption: "Avance sous la trajectoire, yeux sur le ballon." },
      { image: "/exercises/frames/frappe-volee-ballon-lance/pose-3.png", caption: "Frappe de volée, sans laisser rebondir." },
      { image: "/exercises/frames/frappe-volee-ballon-lance/pose-4.png", caption: "Bon timing : le ballon part cadré." },
    ],
  },
  "frappe-premiere-intention": {
    poses: [
      { image: "/exercises/frames/frappe-premiere-intention/pose-1.png", caption: "Le ballon arrive, aucun contrôle prévu." },
      { image: "/exercises/frames/frappe-premiere-intention/pose-2.png", caption: "Anticipe la trajectoire et arme ta frappe tôt." },
      { image: "/exercises/frames/frappe-premiere-intention/pose-3.png", caption: "Frappe dès le premier contact, sans amortir." },
      { image: "/exercises/frames/frappe-premiere-intention/pose-4.png", caption: "Réaction rapide, ballon cadré." },
    ],
  },
};
