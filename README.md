# Progressa

Préparateur physique et technique personnel pour footballeurs et footballeuses
amateurs de 16 à 30 ans. L'app génère un programme hebdomadaire personnalisé
par IA, toujours en complément — jamais en remplacement — du calendrier club.

## Stack

- **Next.js 16** (App Router, TypeScript strict, Turbopack)
- **PostgreSQL + Prisma 6** ([`prisma/schema.prisma`](./prisma/schema.prisma))
- **Supabase Auth** (email/mot de passe + Google) pour l'auth, synchronisée
  vers une table `User` interne (`lib/auth.ts`) — l'app ne dépend jamais
  uniquement de l'id du provider
- **Supabase Postgres** comme base de données (accédée via Prisma)
- **Stripe** (Checkout + Customer Portal + webhooks) — paiement direct, sans
  essai gratuit
- **API Claude (Anthropic)**, `claude-opus-5`, pour la génération de
  programme — sortie validée par Zod contre le catalogue d'exercices, avec
  garde-fou anti-hallucination et repli déterministe (`lib/ai/`)
- **Resend** pour les emails transactionnels
- **Design system** en tokens CSS (thème clair, accent vert,
  `app/globals.css`), prêt pour un futur toggle sombre
- PWA installable (manifest + service worker minimal)

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # renseigner les variables (voir plus bas)
npm run db:generate
npm run db:migrate           # applique les migrations versionnées (prisma/migrations/)
npm run db:seed              # charge le catalogue d'exercices (~60) et les badges
npm run dev
```

- `npm test` — tests unitaires (node:test) sur la logique métier critique:
  calcul de catégorie d'âge, couverture du catalogue par objectif, garde-fou
  anti-hallucination de l'IA, calcul de la carte joueur.
- `npm run lint` / `npx tsc --noEmit` — le repo est 100% propre sur les deux.
- `npm run build` — build de production validé (Next 16 / Turbopack).

## Variables d'environnement

| Variable | Usage |
|---|---|
| `DATABASE_URL` | Connexion PostgreSQL (Prisma) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Auth + base de données Supabase |
| `ANTHROPIC_API_KEY` | Génération de programme (Claude API) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Paiement |
| `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_ANNUAL` | Prix Stripe (les réductions/coupons se configurent côté Stripe, jamais en dur dans le code) |
| `RESEND_API_KEY`, `EMAIL_FROM` | Emails transactionnels |
| `ADMIN_DASHBOARD_SECRET` | Accès au dashboard admin (`/admin`), protection par secret simple |
| `CRON_SECRET` | Vérifie que les appels aux routes `/api/cron/*` viennent bien de Vercel Cron |
| `NEXT_PUBLIC_APP_URL` | URL publique (liens dans les emails, redirections Stripe) |

Les clients Stripe/Resend sont **initialisés paresseusement**
(`lib/stripe.ts`, `lib/email/resend.ts`): l'app build et démarre même sans
ces clés, elles ne sont requises qu'au moment d'un vrai paiement/envoi.

## Migrations de base de données

Le schéma est versionné via `prisma/migrations/` — jamais de `db push` en
production (ça ne laisse aucune trace, aucun historique, et un rollback
devient impossible sans deviner le diff à la main).

- **Nouveau changement de schéma (dev):** édite `prisma/schema.prisma` puis
  `npm run db:migrate` — ça crée un nouveau dossier horodaté dans
  `prisma/migrations/` avec le SQL généré, à commiter avec le code qui en
  dépend.
- **Déploiement:** `npm run build` exécute automatiquement
  `prisma migrate deploy` avant `next build` — les migrations en attente
  s'appliquent à chaque déploiement Vercel, sans étape manuelle.
- `db:push` reste disponible pour du prototypage local rapide (jamais contre
  la base de production) — une fois le schéma stabilisé, capture-le avec
  `db:migrate` pour qu'il rentre dans l'historique versionné.

`prisma/migrations/0_init/` est une migration de **baseline**: elle capture
l'état du schéma tel qu'il existait déjà en base (précédemment géré par
`db push`, sans historique). **Étape unique obligatoire avant le premier
déploiement de ce changement** — sans elle, `prisma migrate deploy` tentera
de recréer des tables qui existent déjà et le build échouera:

```bash
npx prisma migrate resolve --applied 0_init
```

À exécuter une seule fois, depuis une machine qui a accès à la vraie
`DATABASE_URL` (ce sandbox ne l'a pas). Une fois fait, plus jamais besoin
d'y revenir — chaque nouvelle migration s'applique normalement au déploiement
suivant.

## Architecture

```
app/
  (app)/            shell authentifié (dashboard, séance, tests, carte, journal, réglages)
  onboarding/        wizard 8 écrans (localStorage jusqu'à la création de compte)
  admin/             dashboard interne protégé par secret
  api/               routes (auth, IA, Stripe, cron, analytics...)
lib/
  ai/                génération de programme: schéma Zod, prompts, garde-fou, repli
  exercises/         catalogue d'exercices (source unique de vérité, ~60)
  programs/          persistance/régénération des programmes hebdomadaires
  analytics/         couche first-party (page views, clics, funnel, micro-sondages)
  onboarding/        état localStorage + schéma de validation
  ...
prisma/schema.prisma modèle de données complet
tests/                tests node:test
```

### Le garde-fou IA (`lib/ai/`)

L'IA ne peut **jamais** inventer un exercice: le schéma Zod passé au modèle
est construit dynamiquement à partir des slugs du catalogue déjà filtré
(âge, poste, matériel, douleurs non résolues). Toute réponse hors catalogue
est rejetée par le parsing lui-même. En cas d'échec (deux tentatives), un
programme-template déterministe prend le relais — le joueur n'a jamais
d'écran d'erreur. Voir `tests/ai-guard.test.ts` pour la preuve par le test.

### Base de données et affiliation créateurs externes

Conformément au brief produit, la base de données de production et le
système d'affiliation créateurs externes (liens `/r/<code>` pour les
créateurs, commissions, offres de lancement) **existent déjà ailleurs** et
seront réimportés tel quel — c'est une migration de données, hors périmètre
de ce repo. Seul le parrainage joueur-à-joueur (viral loop natif,
`lib/referral.ts`) est implémenté ici.

## Ce qui est implémenté

Onboarding 8 écrans non-bloquant · génération IA + repli déterministe ·
catalogue 60 exercices (couverture vérifiée par test pour chaque objectif,
y compris en freemium) · lecteur de séance · streaks/badges · tests
d'évaluation + carte joueur partageable · Stripe (checkout, portail,
webhooks) · parrainage joueur-à-joueur avec verrou anti double-crédit ·
analytics first-party + dashboard admin + micro-sondages en contexte ·
emails transactionnels + relances + cron hebdomadaire · PWA installable ·
RGPD (suppression de compte en cascade, politique de confidentialité) ·
journal santé complet (check-in, douleurs, croissance, matchs, objectifs) ·
avis modérés · pages éditoriales (nutrition, mental, filière pro réaliste).

## Backlog / limitations connues

- **Notifications push web** : le modèle de données (`PushSubscription`)
  existe, l'intégration Web Push (VAPID, service worker push) reste à faire.
- **Programme d'affiliation créateurs externes** : volontairement absent,
  voir ci-dessus.
- **Favicon** : toujours celui du scaffold Next.js par défaut — les vraies
  icônes PWA sont dans `public/icons/` (générées, prêtes à l'emploi), il
  reste à produire un `favicon.ico` multi-résolution assorti.
- Les seuils de conversion mesure → note (`lib/player-card.ts`) sont
  indicatifs et à recalibrer avec des données réelles.
