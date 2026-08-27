# Moteur d'exercices 3D — architecture et guide

Prototype (voir `/admin/exercise3d`, protégé par le secret admin) — **pas
encore branché** dans `/seance`. Objectif de cette phase: valider
l'architecture et le pipeline avant de couvrir davantage d'exercices.

## Ce qui existe

- `lib/exercise3d/types.ts` — schéma `Exercise3D`: un exercice est décrit
  par des données (setup, équipement, flèches, ballon, phases, caméra,
  impact stats), jamais par une scène codée à la main.
- `lib/exercise3d/cameras.ts` — 8 presets de caméra (FRONT, FRONT_45, SIDE,
  SIDE_45, BACK, TOP, CLOSE, FOLLOW). Un exercice choisit un preset, jamais
  un angle codé en dur.
- `lib/exercise3d/rig.ts` + `movements.ts` — bibliothèque de mouvements:
  soit un clip d'animation existant du rig (Idle/Walk/Run), soit une pose
  procédurale (squat, gainage, frappe, dribble) qui pose les os à chaque
  frame via `applyWorldBend` — voir "Convention de rotation" ci-dessous.
- `lib/exercise3d/ball.ts` — trajectoire de ballon procédurale (parabole +
  courbe latérale), pas de simulation physique complète.
- `components/exercise3d/` — Player (charge le GLB, expose les os),
  Field/Equipment (terrain, plots, buts, échelle — géométrie procédurale,
  aucun asset GLB requis), Guides (flèches de trajectoire, zones/marqueurs
  au sol), Ball, CameraRig, InstructionOverlay (chrono + légende + repère
  technique), Exercise3D (orchestrateur, `<Exercise3D exercise={...} />`).
- `lib/exercise3d/exercises/` — 5 exercices de démonstration: squat,
  sprint 10m, conduite de balle en slalom, frappe cadrée, gainage latéral.

## Le personnage: placeholder, pas Coach Brian

`public/models/player-placeholder.glb` est l'asset "Soldier" des exemples
officiels three.js (licence MIT, librement réutilisable) — **pas un
personnage Progressa**. Choisi parce que c'est un vrai rig au format
Mixamo (squelette `mixamorigHips/Spine/LeftUpLeg/...`, skinning correct,
clips Idle/Walk/Run/TPose réels), donc un vrai test de bout en bout du
pipeline squelettique — pas parce qu'il ressemble à un footballeur.

**Prochaine étape produit (hors de ce que je peux faire seul ici):** un
vrai personnage Coach Brian, verrouillé (morphologie, maillot, chaussures),
suit le pipeline Mixamo → Blender déjà évoqué:
1. Modéliser/rigger Coach Brian une fois (ou partir d'un avatar Mixamo
   custom skinné).
2. Récupérer les animations de base sur Mixamo (course, sprint, saut...).
3. Retargeter sur Coach Brian dans Blender, corriger, ajouter les
   mouvements que Mixamo ne couvre pas (frappe, dribble, plongeon gardien).
4. Exporter en GLB avec la MÊME convention de bones que `rig.ts` (`BONE.*`)
   — sinon mettre à jour cette table.
5. Remplacer `PLAYER_MODEL_URL` dans `Player.tsx`. Tout le reste (caméras,
   ballon, terrain, guides, données d'exercice) continue de fonctionner
   sans changement.

Un rig custom n'a pas de raison de garder le préfixe `mixamorig` sans les
`:` — **vérifier les vrais noms de bones à l'import** (le `onReady` du
`Player` peut logguer `Array.from(handle.bones.keys())`) avant de réutiliser
`BONE` tel quel: c'est un détail d'export, jamais une garantie.

## Convention de rotation (validée par rendu, pas par théorie)

Un bug d'axe local est invisible en relisant le code — seul le rendu le
révèle (voir historique de calibration). Toute nouvelle pose procédurale
doit être vérifiée visuellement (captures d'écran, pas de supposition).

- `applyWorldBend(bone, bindLocal, worldAxis, angle)` (dans `rig.ts`) pose
  une flexion comme un angle autour d'un **axe MONDE**, converti dans
  l'espace local de l'os par conjugaison via le quaternion monde du
  parent — indépendant de la convention locale arbitraire du rig source.
- Hanche/épaule (segment qui pend depuis son pivot): angle **positif**
  autour de `WORLD_AXIS.leftRight` fait avancer l'extrémité vers l'avant.
- Genou/coude: **toujours négatif** pour une flexion normale, quel que
  soit le signe du parent (même axe, la rotation s'additionne).
- Ces signes sont identiques à ceux déjà validés pour le système CSS 2D
  (`app/globals.css`, `Character3D`) — cohérence attendue puisque c'est la
  même réalité anatomique, pas une coïncidence.
- Réorienter un mouvement déjà validé (ex: debout → allongé pour le
  gainage) se fait par **une rotation rigide de tout le groupe joueur**
  (`Exercise3D.restRotationDeg`), jamais en recalculant chaque articulation
  pour la nouvelle orientation — la seule méthode fiable.
- `MODEL_FACING_OFFSET` (`Exercise3D.tsx`) compense le sens de face du rig
  actuel (dos à la caméra par défaut). À revérifier si le GLB change.

## Caméra et joueur: mutation impérative, pas des props React

`CameraRig` et le suivi de trajectoire du joueur (`TimedRig` dans
`Exercise3D.tsx`) mutent directement les objets Three.js à l'intérieur de
`useFrame` (caméra via l'argument `state` du callback, joueur via
`PlayerHandle.root`) plutôt que de recalculer des props React à chaque
frame — une valeur qui change 60x/s ne doit jamais transiter par une prop
React ou un ref lu pendant le rendu (interdit par les règles de pureté
React 19, et de toute façon ce n'est pas fait pour ça).

## Ajouter un exercice

1. Créer `lib/exercise3d/exercises/mon-exercice.ts`, remplir `Exercise3D`.
2. Si le mouvement existe déjà dans `movements.ts`/clips du rig,
   réutiliser son `movement`. Sinon, écrire une nouvelle fonction
   procédurale dans `movements.ts` et l'enregistrer dans
   `PROCEDURAL_POSES` — vérifier le sens de chaque flexion par rendu.
3. Ajouter l'export dans `lib/exercise3d/exercises/index.ts`.
4. Vérifier dans `/admin/exercise3d`: mouvement naturel, caméra qui ne
   cache rien, trajectoires/marqueurs cohérents, boucle propre.

## État honnête du prototype

Fonctionnel et vérifié visuellement: squat (cycle procédural), sprint (clip
Run + trajectoire + ligne de départ/arrivée), dribble (trajectoire en
slalom + ballon qui suit les pieds + plots), frappe (ballon qui suit une
parabole vers une cible), gainage latéral (réorientation rigide,
positionnement encore perfectible). Pas encore fait: coude/genou/hanche
n'ont que 2 axes de mouvement testés en profondeur (flexion avant/arrière)
— une abduction latérale ou rotation interne n'a pas été calibrée. Ballon:
pas de vrai rebond/rotation physique, juste une trajectoire procédurale.
Pas de niveaux de détail/qualité mobile (LOD, Draco) — à faire avant mise
en prod réelle sur des téléphones bas de gamme.
