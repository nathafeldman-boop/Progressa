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
 *
 * Légendes: chaque pose porte une consigne complète (le geste + le repère
 * technique ou l'erreur à éviter), pas juste un mot-clé — l'objectif est de
 * pouvoir comprendre et reproduire l'exercice rien qu'en lisant les 4 poses.
 */
export const EXERCISE_FRAMES: Partial<Record<string, ExerciseFrameSequence>> = {
  "squats-poids-du-corps": {
    poses: [
      { image: "/exercises/frames/squats-poids-du-corps/pose-1.png", caption: "Pieds largeur épaules, dos droit, regard devant toi." },
      { image: "/exercises/frames/squats-poids-du-corps/pose-2.png", caption: "Descends en poussant les fesses en arrière, bras tendus devant pour l'équilibre." },
      { image: "/exercises/frames/squats-poids-du-corps/pose-3.png", caption: "Cuisses parallèles au sol, genoux au-dessus des pieds — jamais vers l'intérieur." },
      { image: "/exercises/frames/squats-poids-du-corps/pose-4.png", caption: "Remonte en poussant sur les talons, pas sur la pointe des pieds." },
    ],
  },
  "fentes-avant-alternees": {
    poses: [
      { image: "/exercises/frames/fentes-avant-alternees/pose-1.png", caption: "Position de départ, mains sur les hanches, buste droit." },
      { image: "/exercises/frames/fentes-avant-alternees/pose-2.png", caption: "Avance une jambe loin devant toi, pas plutôt grand." },
      { image: "/exercises/frames/fentes-avant-alternees/pose-3.png", caption: "Descends jusqu'à ce que le genou arrière frôle le sol, genou avant à 90°." },
      { image: "/exercises/frames/fentes-avant-alternees/pose-4.png", caption: "Reviens à la position de départ en poussant sur la jambe avant, puis change de jambe." },
    ],
  },
  "talons-fesses": {
    poses: [
      { image: "/exercises/frames/talons-fesses/pose-1.png", caption: "Position de départ, légère course sur place, buste droit." },
      { image: "/exercises/frames/talons-fesses/pose-2.png", caption: "Ramène activement le talon vers la fesse, genou pointé vers le sol." },
      { image: "/exercises/frames/talons-fesses/pose-3.png", caption: "Alterne rapidement les jambes, sans ralentir le rythme." },
      { image: "/exercises/frames/talons-fesses/pose-4.png", caption: "Garde le buste droit et reste sur l'avant-pied, pas sur les talons." },
    ],
  },
  "skipping-genoux-hauts": {
    poses: [
      { image: "/exercises/frames/skipping-genoux-hauts/pose-1.png", caption: "Position de départ, appuis légers, prêt à démarrer." },
      { image: "/exercises/frames/skipping-genoux-hauts/pose-2.png", caption: "Lève un genou à hauteur de hanche, cuisse bien horizontale." },
      { image: "/exercises/frames/skipping-genoux-hauts/pose-3.png", caption: "Alterne rapidement les jambes, reste léger sur tes appuis." },
      { image: "/exercises/frames/skipping-genoux-hauts/pose-4.png", caption: "Garde un rythme soutenu du début à la fin, bras qui accompagnent le mouvement." },
    ],
  },
  "gainage-planche-ventrale": {
    poses: [
      { image: "/exercises/frames/gainage-planche-ventrale/pose-1.png", caption: "Position à quatre pattes, mains sous les épaules." },
      { image: "/exercises/frames/gainage-planche-ventrale/pose-2.png", caption: "Tends une jambe vers l'arrière, puis l'autre, pour te placer en appui." },
      { image: "/exercises/frames/gainage-planche-ventrale/pose-3.png", caption: "Place-toi en planche, corps parfaitement aligné des épaules aux talons." },
      { image: "/exercises/frames/gainage-planche-ventrale/pose-4.png", caption: "Maintiens la position sans creuser le dos ni lever les fesses." },
    ],
  },
  "squat-jumps": {
    poses: [
      { image: "/exercises/frames/squat-jumps/pose-1.png", caption: "Position de départ debout, pieds largeur épaules." },
      { image: "/exercises/frames/squat-jumps/pose-2.png", caption: "Descends en squat, cuisses proches de l'horizontale." },
      { image: "/exercises/frames/squat-jumps/pose-3.png", caption: "Explose vers le haut, bras levés pour t'aider à sauter plus haut." },
      { image: "/exercises/frames/squat-jumps/pose-4.png", caption: "Réceptionne en souplesse, genoux fléchis, et redescends directement en squat." },
    ],
  },
  "jonglages-progressifs": {
    poses: [
      { image: "/exercises/frames/jonglages-progressifs/pose-1.png", caption: "Touche le ballon avec l'intérieur du pied, geste doux et contrôlé." },
      { image: "/exercises/frames/jonglages-progressifs/pose-2.png", caption: "Laisse-le redescendre sans le rattraper, garde les yeux dessus." },
      { image: "/exercises/frames/jonglages-progressifs/pose-3.png", caption: "Enchaîne un nouveau contact, garde le ballon proche de toi, pas trop haut." },
      { image: "/exercises/frames/jonglages-progressifs/pose-4.png", caption: "Reste doux avec le ballon : contrôle près du corps, pas de frappe." },
    ],
  },
  "passes-mur-controle": {
    poses: [
      { image: "/exercises/frames/passes-mur-controle/pose-1.png", caption: "Positionne-toi à 5m du mur, ballon au pied, face à la cible." },
      { image: "/exercises/frames/passes-mur-controle/pose-2.png", caption: "Passe le ballon avec l'intérieur du pied, geste précis et calme." },
      { image: "/exercises/frames/passes-mur-controle/pose-3.png", caption: "Contrôle le ballon au retour dès le premier touché, puis enchaîne." },
    ],
  },
  "conduite-balle-int-ext": {
    poses: [
      { image: "/exercises/frames/conduite-balle-int-ext/pose-1.png", caption: "Ballon au pied, avance sur 15m à allure de course modérée." },
      { image: "/exercises/frames/conduite-balle-int-ext/pose-2.png", caption: "Touche le ballon avec l'intérieur du pied droit, petites touches régulières." },
      { image: "/exercises/frames/conduite-balle-int-ext/pose-3.png", caption: "Touche le ballon avec l'extérieur du pied gauche, garde-le proche." },
      { image: "/exercises/frames/conduite-balle-int-ext/pose-4.png", caption: "Alterne pied gauche et pied droit sans ralentir ni perdre le contrôle." },
    ],
  },
  "gainage-mountain-climbers": {
    poses: [
      { image: "/exercises/frames/gainage-mountain-climbers/pose-1.png", caption: "Position de planche haute, mains sous les épaules, corps aligné." },
      { image: "/exercises/frames/gainage-mountain-climbers/pose-2.png", caption: "Ramène le genou droit vers la poitrine, bassin qui reste stable." },
      { image: "/exercises/frames/gainage-mountain-climbers/pose-3.png", caption: "Ramène le genou gauche vers la poitrine, même vitesse que le droit." },
      { image: "/exercises/frames/gainage-mountain-climbers/pose-4.png", caption: "Alterne rapidement les jambes, garde le dos plat, pas de rebond de bassin." },
    ],
  },
  "squats-bulgares": {
    poses: [
      { image: "/exercises/frames/squats-bulgares/pose-1.png", caption: "Un pied posé sur un banc derrière toi, l'autre au sol devant." },
      { image: "/exercises/frames/squats-bulgares/pose-2.png", caption: "Descends en pliant la jambe avant, buste légèrement penché en avant." },
      { image: "/exercises/frames/squats-bulgares/pose-3.png", caption: "Descends jusqu'au point bas, genou arrière proche du sol sans le toucher." },
      { image: "/exercises/frames/squats-bulgares/pose-4.png", caption: "Remonte de façon explosive en poussant sur le talon de la jambe avant." },
    ],
  },
  "elastique-marche-laterale": {
    poses: [
      { image: "/exercises/frames/elastique-marche-laterale/pose-1.png", caption: "Élastique placé juste au-dessus des genoux, tension déjà présente." },
      { image: "/exercises/frames/elastique-marche-laterale/pose-2.png", caption: "Descends en position de demi-squat, genoux légèrement écartés contre l'élastique." },
      { image: "/exercises/frames/elastique-marche-laterale/pose-3.png", caption: "Fais un pas explosif vers la droite en gardant la tension." },
      { image: "/exercises/frames/elastique-marche-laterale/pose-4.png", caption: "Fais un pas vers la gauche pour ramener le pied, sans jamais relâcher l'élastique." },
    ],
  },
  "sprints-courts-10m": {
    poses: [
      { image: "/exercises/frames/sprints-courts-10m/pose-1.png", caption: "Départ debout, buste légèrement penché en avant, prêt à sprinter." },
      { image: "/exercises/frames/sprints-courts-10m/pose-2.png", caption: "Essaie aussi un départ assis au sol pour varier l'appui initial." },
      { image: "/exercises/frames/sprints-courts-10m/pose-3.png", caption: "Sprint à fond sur les 10 mètres, genoux hauts, bras qui pompent." },
      { image: "/exercises/frames/sprints-courts-10m/pose-4.png", caption: "Marche de récupération complète avant de refaire un nouvel essai." },
    ],
  },
  "bondissements-lateraux": {
    poses: [
      { image: "/exercises/frames/bondissements-lateraux/pose-1.png", caption: "Position de départ, appuis souples, légère flexion des genoux." },
      { image: "/exercises/frames/bondissements-lateraux/pose-2.png", caption: "Bond explosif vers la droite, pousse fort sur la jambe gauche." },
      { image: "/exercises/frames/bondissements-lateraux/pose-3.png", caption: "Bond explosif vers la gauche, pousse fort sur la jambe droite." },
      { image: "/exercises/frames/bondissements-lateraux/pose-4.png", caption: "Réceptionne en souplesse à chaque bond, reste stable avant de repartir." },
    ],
  },
  "sprint-changement-direction-5-10-5": {
    poses: [
      { image: "/exercises/frames/sprint-changement-direction-5-10-5/pose-1.png", caption: "Sprint à fond sur les 5 premiers mètres, départ explosif." },
      { image: "/exercises/frames/sprint-changement-direction-5-10-5/pose-2.png", caption: "Plante l'appui extérieur et pivote franchement au repère de 5m." },
      { image: "/exercises/frames/sprint-changement-direction-5-10-5/pose-3.png", caption: "Sprint retour sur 10m dans l'autre sens, puis nouveau virage au repère suivant." },
    ],
  },
  "sauts-a-la-corde": {
    poses: [
      { image: "/exercises/frames/sauts-a-la-corde/pose-1.png", caption: "Position de départ, corde en main, coudes proches du corps." },
      { image: "/exercises/frames/sauts-a-la-corde/pose-2.png", caption: "Sauts pieds joints, rythme régulier, petits sauts sur l'avant-pied." },
      { image: "/exercises/frames/sauts-a-la-corde/pose-3.png", caption: "Passe en sauts alternés, un pied puis l'autre, sans casser le rythme." },
      { image: "/exercises/frames/sauts-a-la-corde/pose-4.png", caption: "Garde un rythme régulier jusqu'à la fin, poignets qui font tourner la corde." },
    ],
  },
  "departs-reactifs-signal": {
    poses: [
      { image: "/exercises/frames/departs-reactifs-signal/pose-1.png", caption: "Position d'attente, dos tourné au départ, concentré sur le signal." },
      { image: "/exercises/frames/departs-reactifs-signal/pose-2.png", caption: "Réagis dès le signal sonore, pas avant — c'est la vitesse de réaction qui compte." },
      { image: "/exercises/frames/departs-reactifs-signal/pose-3.png", caption: "Départ explosif sur 8 mètres, premiers appuis courts et puissants." },
      { image: "/exercises/frames/departs-reactifs-signal/pose-4.png", caption: "Ne relâche pas avant la ligne, garde l'intensité jusqu'à la fin de la course." },
    ],
  },
  "montees-marche-explosives": {
    poses: [
      { image: "/exercises/frames/montees-marche-explosives/pose-1.png", caption: "Face au banc, un pied posé dessus, l'autre au sol." },
      { image: "/exercises/frames/montees-marche-explosives/pose-2.png", caption: "Montée explosive en poussant sur le pied posé, genou droit qui monte haut." },
      { image: "/exercises/frames/montees-marche-explosives/pose-3.png", caption: "Retour contrôlé au sol, prépare l'autre jambe pour la montée suivante." },
      { image: "/exercises/frames/montees-marche-explosives/pose-4.png", caption: "Montée explosive côté gauche, alterne le rythme sans perdre en puissance." },
    ],
  },
  "slalom-plots-serre": {
    poses: [
      { image: "/exercises/frames/slalom-plots-serre/pose-1.png", caption: "Touche le ballon avec l'intérieur du pied fort à chaque plot, petites touches." },
      { image: "/exercises/frames/slalom-plots-serre/pose-2.png", caption: "Passe à l'extérieur du pied fort au plot suivant, garde le ballon proche." },
      { image: "/exercises/frames/slalom-plots-serre/pose-3.png", caption: "Accélère franchement une fois sorti du dernier plot." },
    ],
  },
  "course-cote-courte": {
    poses: [
      { image: "/exercises/frames/course-cote-courte/pose-1.png", caption: "Position de départ, en bas de la pente, buste penché vers l'avant." },
      { image: "/exercises/frames/course-cote-courte/pose-2.png", caption: "Montée explosive, pousse fort sur chaque appui, genoux hauts." },
      { image: "/exercises/frames/course-cote-courte/pose-3.png", caption: "Maintiens l'allure jusqu'en haut, ne ralentis pas sur les derniers mètres." },
      { image: "/exercises/frames/course-cote-courte/pose-4.png", caption: "Redescends en marchant pour bien récupérer avant le prochain effort." },
    ],
  },
  "course-lente-relachement": {
    poses: [
      { image: "/exercises/frames/course-lente-relachement/pose-1.png", caption: "Position de départ, allure très modérée, respiration calme." },
      { image: "/exercises/frames/course-lente-relachement/pose-2.png", caption: "Relâche complètement les épaules et les bras, aucune tension inutile." },
      { image: "/exercises/frames/course-lente-relachement/pose-3.png", caption: "Garde une foulée souple, sans à-coup, pied qui pose en douceur." },
      { image: "/exercises/frames/course-lente-relachement/pose-4.png", caption: "Maintiens un rythme constant jusqu'à la fin, sans jamais forcer." },
    ],
  },
  "gainage-lateral": {
    poses: [
      { image: "/exercises/frames/gainage-lateral/pose-1.png", caption: "Allonge-toi sur le côté, coude bien placé sous l'épaule." },
      { image: "/exercises/frames/gainage-lateral/pose-2.png", caption: "Décolle le bassin en poussant sur le bras d'appui." },
      { image: "/exercises/frames/gainage-lateral/pose-3.png", caption: "Tiens la position : chevilles, hanches et épaules parfaitement alignées." },
      { image: "/exercises/frames/gainage-lateral/pose-4.png", caption: "Redescends doucement sans t'effondrer, puis change de côté." },
    ],
  },
  "gainage-lombaire-doux": {
    poses: [
      { image: "/exercises/frames/gainage-lombaire-doux/pose-1.png", caption: "Allonge-toi sur le dos, genoux pliés, pieds à plat au sol." },
      { image: "/exercises/frames/gainage-lombaire-doux/pose-2.png", caption: "Plaque le bas du dos au sol en rentrant légèrement le ventre." },
      { image: "/exercises/frames/gainage-lombaire-doux/pose-3.png", caption: "Décolle une jambe sans laisser le dos se creuser ni le bassin bouger." },
    ],
  },
  "hip-thrust-sol": {
    poses: [
      { image: "/exercises/frames/hip-thrust-sol/pose-1.png", caption: "Allonge-toi, genoux pliés, pieds à plat près des fesses." },
      { image: "/exercises/frames/hip-thrust-sol/pose-2.png", caption: "Monte jusqu'à aligner épaules, hanches et genoux, en serrant fort les fessiers." },
      { image: "/exercises/frames/hip-thrust-sol/pose-3.png", caption: "Redescends lentement sans poser complètement les fesses au sol." },
    ],
  },
  "pompes-genoux-pieds": {
    poses: [
      { image: "/exercises/frames/pompes-genoux-pieds/pose-1.png", caption: "Mains sous les épaules, corps bien aligné, ventre gainé." },
      { image: "/exercises/frames/pompes-genoux-pieds/pose-2.png", caption: "Descends en gardant les coudes près du corps, pas écartés." },
      { image: "/exercises/frames/pompes-genoux-pieds/pose-3.png", caption: "Remonte en poussant fort sur les mains, sans casser l'alignement du dos." },
    ],
  },
  "equilibre-unipodal-genoux": {
    poses: [
      { image: "/exercises/frames/equilibre-unipodal-genoux/pose-1.png", caption: "Debout, regard droit devant toi, poids réparti sur les deux pieds." },
      { image: "/exercises/frames/equilibre-unipodal-genoux/pose-2.png", caption: "Lève un pied, fléchis légèrement le genou de la jambe d'appui." },
      { image: "/exercises/frames/equilibre-unipodal-genoux/pose-3.png", caption: "Tiens la position : le genou reste aligné avec la pointe du pied, pas vers l'intérieur." },
    ],
  },
  "proprioception-cheville-serviette": {
    poses: [
      { image: "/exercises/frames/proprioception-cheville-serviette/pose-1.png", caption: "Plie une serviette en plusieurs épaisseurs et pose-la au sol." },
      { image: "/exercises/frames/proprioception-cheville-serviette/pose-2.png", caption: "Pose un pied dessus, l'autre reste au sol pour te stabiliser." },
      { image: "/exercises/frames/proprioception-cheville-serviette/pose-3.png", caption: "Tiens sur une jambe : la cheville travaille toute seule pour garder l'équilibre." },
      { image: "/exercises/frames/proprioception-cheville-serviette/pose-4.png", caption: "Version difficile : ferme les yeux pour intensifier le travail de la cheville." },
    ],
  },
  "tacle-glisse-controle": {
    poses: [
      { image: "/exercises/frames/tacle-glisse-controle/pose-1.png", caption: "Position de départ, face au porteur de balle, distance de sécurité." },
      { image: "/exercises/frames/tacle-glisse-controle/pose-2.png", caption: "Approche toujours de biais, jamais de face, pour ne pas te faire éliminer." },
      { image: "/exercises/frames/tacle-glisse-controle/pose-3.png", caption: "Glisse jambe tendue en visant le ballon, pas le joueur." },
      { image: "/exercises/frames/tacle-glisse-controle/pose-4.png", caption: "Relève-toi tout de suite après le contact, ballon récupéré et sous contrôle." },
    ],
  },
  "duel-aerien-defensif": {
    poses: [
      { image: "/exercises/frames/duel-aerien-defensif/pose-1.png", caption: "Position de départ, lis la trajectoire du ballon dès le centre ou le corner." },
      { image: "/exercises/frames/duel-aerien-defensif/pose-2.png", caption: "Cours te placer sous le point de chute, avant l'attaquant si possible." },
      { image: "/exercises/frames/duel-aerien-defensif/pose-3.png", caption: "Saute et dégage de la tête, front haut, yeux ouverts sur le ballon." },
      { image: "/exercises/frames/duel-aerien-defensif/pose-4.png", caption: "Retombe équilibré sur tes deux appuis, prêt à réagir sur l'action suivante." },
    ],
  },
  "jockey-defensif-pas-chasses": {
    poses: [
      { image: "/exercises/frames/jockey-defensif-pas-chasses/pose-1.png", caption: "Position basse, face à l'attaquant, genoux fléchis, distance de contrôle." },
      { image: "/exercises/frames/jockey-defensif-pas-chasses/pose-2.png", caption: "Recule en pas chassés, sans jamais croiser les appuis." },
      { image: "/exercises/frames/jockey-defensif-pas-chasses/pose-3.png", caption: "Reste sur la pointe des pieds, concentré sur le ballon et les hanches adverses." },
      { image: "/exercises/frames/jockey-defensif-pas-chasses/pose-4.png", caption: "Position maîtrisée, prêt à réagir dans n'importe quelle direction sans te précipiter." },
    ],
  },
  "feintes-corps-piquet": {
    poses: [
      { image: "/exercises/frames/feintes-corps-piquet/pose-1.png", caption: "Balle au pied, face au piquet, vitesse de course normale." },
      { image: "/exercises/frames/feintes-corps-piquet/pose-2.png", caption: "Feinte le corps d'un côté, les épaules et le regard trompent l'adversaire." },
      { image: "/exercises/frames/feintes-corps-piquet/pose-3.png", caption: "Change d'appui et repars aussitôt de l'autre côté, ballon toujours proche." },
      { image: "/exercises/frames/feintes-corps-piquet/pose-4.png", caption: "Accélère franchement dans l'espace libéré par la feinte." },
    ],
  },
  "dribble-1v1-plot-mobile": {
    poses: [
      { image: "/exercises/frames/dribble-1v1-plot-mobile/pose-1.png", caption: "Balle au pied, face au plot mobile, vitesse contrôlée." },
      { image: "/exercises/frames/dribble-1v1-plot-mobile/pose-2.png", caption: "Provoque le duel, garde la balle protégée du corps." },
      { image: "/exercises/frames/dribble-1v1-plot-mobile/pose-3.png", caption: "Élimine d'un crochet sec, change de rythme au moment du contact." },
      { image: "/exercises/frames/dribble-1v1-plot-mobile/pose-4.png", caption: "Accélère pour ressortir du dribble en vitesse, ne ralentis pas après l'élimination." },
    ],
  },
  "plongeon-lateral-amorti": {
    poses: [
      { image: "/exercises/frames/plongeon-lateral-amorti/pose-1.png", caption: "Position de base, mains prêtes devant toi, genoux légèrement fléchis." },
      { image: "/exercises/frames/plongeon-lateral-amorti/pose-2.png", caption: "Pousse fort sur l'appui, pars vers le côté sans sauter vers le haut." },
      { image: "/exercises/frames/plongeon-lateral-amorti/pose-3.png", caption: "Étends-toi complètement vers le ballon, mains devant, corps allongé." },
      { image: "/exercises/frames/plongeon-lateral-amorti/pose-4.png", caption: "Amortis la réception avec le corps, ballon plaqué fermement au sol." },
    ],
  },
  "frappe-enroulee-cible": {
    poses: [
      { image: "/exercises/frames/frappe-enroulee-cible/pose-1.png", caption: "Balle au sol, fixe la cible du regard avant de démarrer ta course." },
      { image: "/exercises/frames/frappe-enroulee-cible/pose-2.png", caption: "Course d'approche en angle vers le ballon, jamais droit dessus." },
      { image: "/exercises/frames/frappe-enroulee-cible/pose-3.png", caption: "Frappe de l'extérieur du pied pour enrouler, cheville verrouillée au contact." },
      { image: "/exercises/frames/frappe-enroulee-cible/pose-4.png", caption: "La trajectoire courbe vient chercher la cible, accompagne le geste avec le corps." },
    ],
  },
  "frappe-puissance-surface": {
    poses: [
      { image: "/exercises/frames/frappe-puissance-surface/pose-1.png", caption: "Balle posée à l'entrée de la surface, repère ta cible dans le but." },
      { image: "/exercises/frames/frappe-puissance-surface/pose-2.png", caption: "Course d'appel, corps gainé vers le ballon, dernier appui juste à côté." },
      { image: "/exercises/frames/frappe-puissance-surface/pose-3.png", caption: "Frappe du cou-de-pied, cheville verrouillée, tout le corps derrière le geste." },
      { image: "/exercises/frames/frappe-puissance-surface/pose-4.png", caption: "Frappe puissante, droit au but, jambe qui accompagne loin après l'impact." },
    ],
  },
  "frappe-volee-ballon-lance": {
    poses: [
      { image: "/exercises/frames/frappe-volee-ballon-lance/pose-1.png", caption: "Un partenaire (ou toi-même) lance le ballon en l'air devant toi." },
      { image: "/exercises/frames/frappe-volee-ballon-lance/pose-2.png", caption: "Avance sous la trajectoire, yeux sur le ballon, corps prêt à frapper." },
      { image: "/exercises/frames/frappe-volee-ballon-lance/pose-3.png", caption: "Frappe de volée, sans laisser rebondir, pied qui vient chercher le ballon en l'air." },
      { image: "/exercises/frames/frappe-volee-ballon-lance/pose-4.png", caption: "Bon timing : le ballon part cadré, corps stable après l'impact." },
    ],
  },
  "frappe-premiere-intention": {
    poses: [
      { image: "/exercises/frames/frappe-premiere-intention/pose-1.png", caption: "Le ballon arrive, aucun contrôle prévu — anticipe déjà ta frappe." },
      { image: "/exercises/frames/frappe-premiere-intention/pose-2.png", caption: "Anticipe la trajectoire et arme ta frappe tôt, avant l'arrivée du ballon." },
      { image: "/exercises/frames/frappe-premiere-intention/pose-3.png", caption: "Frappe dès le premier contact, sans amortir ni ralentir le geste." },
      { image: "/exercises/frames/frappe-premiere-intention/pose-4.png", caption: "Réaction rapide, ballon cadré grâce à l'anticipation faite en amont." },
    ],
  },
  "controle-oriente-frappe-rapide": {
    poses: [
      { image: "/exercises/frames/controle-oriente-frappe-rapide/pose-1.png", caption: "Le ballon arrive en passe, repère déjà l'espace libre où l'orienter." },
      { image: "/exercises/frames/controle-oriente-frappe-rapide/pose-2.png", caption: "Contrôle orienté vers l'espace libre en un seul geste, sans double touche." },
      { image: "/exercises/frames/controle-oriente-frappe-rapide/pose-3.png", caption: "Enchaîne aussitôt sur la frappe, sans temps mort entre contrôle et tir." },
      { image: "/exercises/frames/controle-oriente-frappe-rapide/pose-4.png", caption: "Frappe rapide et cadrée, résultat direct du bon contrôle orienté." },
    ],
  },
  "frappe-pied-faible-cible": {
    poses: [
      { image: "/exercises/frames/frappe-pied-faible-cible/pose-1.png", caption: "Balle au sol, choisis volontairement ton pied le moins fort." },
      { image: "/exercises/frames/frappe-pied-faible-cible/pose-2.png", caption: "Course d'approche identique à ton pied fort, sans hésiter." },
      { image: "/exercises/frames/frappe-pied-faible-cible/pose-3.png", caption: "Frappe avec le pied faible, concentre-toi sur le contact avec le ballon." },
      { image: "/exercises/frames/frappe-pied-faible-cible/pose-4.png", caption: "Frappe cadrée : la confiance vient avec la répétition." },
    ],
  },
  "frappe-basse-enroulee-poteau": {
    poses: [
      { image: "/exercises/frames/frappe-basse-enroulee-poteau/pose-1.png", caption: "Balle au sol, vise le petit filet près du poteau." },
      { image: "/exercises/frames/frappe-basse-enroulee-poteau/pose-2.png", caption: "Course d'approche en angle, corps penché vers le ballon." },
      { image: "/exercises/frames/frappe-basse-enroulee-poteau/pose-3.png", caption: "Frappe de l'intérieur du pied, ballon rasant, effet enroulé." },
      { image: "/exercises/frames/frappe-basse-enroulee-poteau/pose-4.png", caption: "La trajectoire basse vient frôler le poteau et rentre." },
    ],
  },
  "frappe-exterieur-surprise": {
    poses: [
      { image: "/exercises/frames/frappe-exterieur-surprise/pose-1.png", caption: "Balle au sol, garde ton intention cachée jusqu'au dernier moment." },
      { image: "/exercises/frames/frappe-exterieur-surprise/pose-2.png", caption: "Course d'approche normale, comme pour une frappe classique." },
      { image: "/exercises/frames/frappe-exterieur-surprise/pose-3.png", caption: "Frappe de l'extérieur du pied, sans changer d'appui — c'est la surprise." },
      { image: "/exercises/frames/frappe-exterieur-surprise/pose-4.png", caption: "La trajectoire enroulée surprend le gardien, pris à contre-pied." },
    ],
  },
  "tete-plongeante-cage": {
    poses: [
      { image: "/exercises/frames/tete-plongeante-cage/pose-1.png", caption: "Position de départ, lis la trajectoire du centre à venir." },
      { image: "/exercises/frames/tete-plongeante-cage/pose-2.png", caption: "Cours vers le point de chute, yeux fixés sur le ballon." },
      { image: "/exercises/frames/tete-plongeante-cage/pose-3.png", caption: "Plonge en avant, engage tout le corps, front qui vient frapper le ballon." },
      { image: "/exercises/frames/tete-plongeante-cage/pose-4.png", caption: "Réception au sol contrôlée — le geste qui surprend toujours le gardien." },
    ],
  },
  "frappe-longue-distance": {
    poses: [
      { image: "/exercises/frames/frappe-longue-distance/pose-1.png", caption: "Position de départ, à 25m ou plus du but." },
      { image: "/exercises/frames/frappe-longue-distance/pose-2.png", caption: "Prise d'élan franche, corps qui s'engage vers le ballon." },
      { image: "/exercises/frames/frappe-longue-distance/pose-3.png", caption: "Frappe du cou-de-pied, cheville verrouillée, tout le corps derrière le geste." },
      { image: "/exercises/frames/frappe-longue-distance/pose-4.png", caption: "Trajectoire puissante et précise, jambe qui accompagne loin après l'impact." },
    ],
  },

  // --- Gardien (remplacent le générique vidéo Pexels, peu lisible sur ces gestes précis) ---
  "prise-balle-haute": {
    poses: [
      { image: "/exercises/frames/prise-balle-haute/pose-1.png", caption: "Position basse, jambes fléchies, prêt à sauter dans la zone de saut." },
      { image: "/exercises/frames/prise-balle-haute/pose-2.png", caption: "Détends-toi vers le ballon au point le plus haut, mains bien ouvertes devant toi." },
      { image: "/exercises/frames/prise-balle-haute/pose-3.png", caption: "Capte le ballon avec les mains en premier, coudes fléchis pour amortir." },
      { image: "/exercises/frames/prise-balle-haute/pose-4.png", caption: "Ramène le ballon contre toi et protège-le avec un genou levé en retombant." },
    ],
  },
  "relance-pied-courte-longue": {
    poses: [
      { image: "/exercises/frames/relance-pied-courte-longue/pose-1.png", caption: "Ballon en main, analyse le placement de tes coéquipiers avant de choisir." },
      { image: "/exercises/frames/relance-pied-courte-longue/pose-2.png", caption: "Relance courte: pose le ballon et passe-le placé vers un appui proche démarqué." },
      { image: "/exercises/frames/relance-pied-courte-longue/pose-3.png", caption: "Relance longue: prends de l'élan et frappe fort et haut vers la zone libre." },
      { image: "/exercises/frames/relance-pied-courte-longue/pose-4.png", caption: "Suis la trajectoire des yeux pour ajuster ta prochaine relance." },
    ],
  },
  "reflexes-mains-rapprochees": {
    poses: [
      { image: "/exercises/frames/reflexes-mains-rapprochees/pose-1.png", caption: "Position de départ face au tireur, appuis légers et équilibrés." },
      { image: "/exercises/frames/reflexes-mains-rapprochees/pose-2.png", caption: "Réagis vite: mains rapprochées, paumes tournées vers le ballon." },
      { image: "/exercises/frames/reflexes-mains-rapprochees/pose-3.png", caption: "Bloque le tir avec les mains en opposition, coudes fléchis pour amortir le choc." },
      { image: "/exercises/frames/reflexes-mains-rapprochees/pose-4.png", caption: "Contrôle le ballon repoussé, reste tout de suite prêt pour l'action suivante." },
    ],
  },
  "sorties-aeriennes": {
    poses: [
      { image: "/exercises/frames/sorties-aeriennes/pose-1.png", caption: "Position basse, analyse la trajectoire du centre avant de sortir de ta ligne." },
      { image: "/exercises/frames/sorties-aeriennes/pose-2.png", caption: "Décide tôt et pars franchement vers le ballon, sans hésiter." },
      { image: "/exercises/frames/sorties-aeriennes/pose-3.png", caption: "Saute au point culminant, mains hautes, capte le ballon avec conviction." },
      { image: "/exercises/frames/sorties-aeriennes/pose-4.png", caption: "Retombe en sécurité, ballon serré contre toi, genou levé pour te protéger." },
    ],
  },

  // --- Attaque ---
  "protection-ballon-dos-adversaire": {
    poses: [
      { image: "/exercises/frames/protection-ballon-dos-adversaire/pose-1.png", caption: "Reçois le ballon en te plaçant dos au défenseur, corps entre lui et le ballon." },
      { image: "/exercises/frames/protection-ballon-dos-adversaire/pose-2.png", caption: "Contrôle orienté loin du défenseur, utilise ton corps comme un écran." },
      { image: "/exercises/frames/protection-ballon-dos-adversaire/pose-3.png", caption: "Garde le bras déployé pour sentir la position du défenseur sans le pousser." },
      { image: "/exercises/frames/protection-ballon-dos-adversaire/pose-4.png", caption: "Écarte-toi ou repars vers l'avant dès que l'espace s'ouvre." },
    ],
  },
};
