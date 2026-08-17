/**
 * Système de ligues/départements pour la France (FFF), et liste de pays
 * francophones pour tous les autres joueurs. Le joueur ne choisit jamais sa
 * "ligue régionale" ni son "district" directement — personne ne sait ce que
 * c'est. Il choisit son département, et l'app associe la ligue toute seule
 * (getLigueForDepartment).
 */

export interface Ligue {
  name: string;
  departments: string[];
}

// Les 13 ligues régionales FFF (découpage 2016) + les ligues d'outre-mer.
// Un département métropolitain = un district FFF, d'où l'association directe.
export const FRANCE_LIGUES: Ligue[] = [
  {
    name: "Ligue Auvergne-Rhône-Alpes",
    departments: ["Ain", "Allier", "Ardèche", "Cantal", "Drôme", "Isère", "Loire", "Haute-Loire", "Puy-de-Dôme", "Rhône", "Savoie", "Haute-Savoie"],
  },
  {
    name: "Ligue Bourgogne-Franche-Comté",
    departments: ["Côte-d'Or", "Doubs", "Jura", "Nièvre", "Haute-Saône", "Saône-et-Loire", "Yonne", "Territoire de Belfort"],
  },
  {
    name: "Ligue de Bretagne",
    departments: ["Côtes-d'Armor", "Finistère", "Ille-et-Vilaine", "Morbihan"],
  },
  {
    name: "Ligue du Centre-Val de Loire",
    departments: ["Cher", "Eure-et-Loir", "Indre", "Indre-et-Loire", "Loir-et-Cher", "Loiret"],
  },
  {
    name: "Ligue Corse",
    departments: ["Corse-du-Sud", "Haute-Corse"],
  },
  {
    name: "Ligue du Grand Est",
    departments: ["Ardennes", "Aube", "Marne", "Haute-Marne", "Meurthe-et-Moselle", "Meuse", "Moselle", "Bas-Rhin", "Haut-Rhin", "Vosges"],
  },
  {
    name: "Ligue des Hauts-de-France",
    departments: ["Aisne", "Nord", "Oise", "Pas-de-Calais", "Somme"],
  },
  {
    name: "Ligue de Paris Île-de-France",
    departments: ["Paris", "Seine-et-Marne", "Yvelines", "Essonne", "Hauts-de-Seine", "Seine-Saint-Denis", "Val-de-Marne", "Val-d'Oise"],
  },
  {
    name: "Ligue de Normandie",
    departments: ["Calvados", "Eure", "Manche", "Orne", "Seine-Maritime"],
  },
  {
    name: "Ligue de Nouvelle-Aquitaine",
    departments: ["Charente", "Charente-Maritime", "Corrèze", "Creuse", "Dordogne", "Gironde", "Landes", "Lot-et-Garonne", "Pyrénées-Atlantiques", "Deux-Sèvres", "Vienne", "Haute-Vienne"],
  },
  {
    name: "Ligue d'Occitanie",
    departments: ["Ariège", "Aude", "Aveyron", "Gard", "Haute-Garonne", "Gers", "Hérault", "Lot", "Lozère", "Hautes-Pyrénées", "Pyrénées-Orientales", "Tarn", "Tarn-et-Garonne"],
  },
  {
    name: "Ligue des Pays de la Loire",
    departments: ["Loire-Atlantique", "Maine-et-Loire", "Mayenne", "Sarthe", "Vendée"],
  },
  {
    name: "Ligue Méditerranée",
    departments: ["Alpes-de-Haute-Provence", "Hautes-Alpes", "Alpes-Maritimes", "Bouches-du-Rhône", "Var", "Vaucluse"],
  },
  { name: "Ligue de Guadeloupe", departments: ["Guadeloupe"] },
  { name: "Ligue de Martinique", departments: ["Martinique"] },
  { name: "Ligue de Guyane", departments: ["Guyane"] },
  { name: "Ligue de La Réunion", departments: ["La Réunion"] },
  { name: "Ligue de Mayotte", departments: ["Mayotte"] },
];

export const ALL_FRANCE_DEPARTMENTS: string[] = FRANCE_LIGUES.flatMap((l) => l.departments);

export function getLigueForDepartment(department: string): string | null {
  return FRANCE_LIGUES.find((l) => l.departments.includes(department))?.name ?? null;
}

export const FRANCE_NIVEAUX = [
  "National",
  "Régional 1 (R1)",
  "Régional 2 (R2)",
  "Régional 3 (R3)",
  "Départemental 1 (D1)",
  "Départemental 2 (D2)",
  "Départemental 3 (D3)",
  "Départemental 4 (D4)",
  "Départemental 5 (D5)",
  "Loisir / Débutant",
] as const;

export const GENERIC_NIVEAUX = ["Niveau national", "Niveau régional", "Niveau local / club", "Loisir / débutant"] as const;

// Pays francophones — liste large, la France n'est qu'une option parmi
// d'autres. "Autre" reste en secours pour tout pays non listé.
export const FRANCOPHONE_COUNTRIES: string[] = [
  "France",
  "Belgique",
  "Suisse",
  "Luxembourg",
  "Monaco",
  "Canada (Québec)",
  "Maroc",
  "Algérie",
  "Tunisie",
  "Sénégal",
  "Côte d'Ivoire",
  "Cameroun",
  "Mali",
  "République démocratique du Congo",
  "Congo",
  "Gabon",
  "Burkina Faso",
  "Guinée",
  "Bénin",
  "Togo",
  "Niger",
  "Tchad",
  "Madagascar",
  "Maurice",
  "Mauritanie",
  "Rwanda",
  "Burundi",
  "République centrafricaine",
  "Comores",
  "Djibouti",
  "Haïti",
  "Autre",
];

export function getNiveauxForCountry(country: string): readonly string[] {
  return country === "France" ? FRANCE_NIVEAUX : GENERIC_NIVEAUX;
}
