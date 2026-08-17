import type { Country } from "@prisma/client";

/**
 * Système de ligues/districts détaillé pour la France (FFF), générique
 * pour les autres pays francophones ciblés.
 */

export interface Ligue {
  name: string;
  districts: string[];
}

// Les 13 ligues régionales FFF (découpage 2016) + les principales ligues
// d'outre-mer. Chaque district métropolitain correspond à un département,
// convention standard FFF ("District de <département>").
export const FRANCE_LIGUES: Ligue[] = [
  {
    name: "Ligue Auvergne-Rhône-Alpes",
    districts: ["Ain", "Allier", "Ardèche", "Cantal", "Drôme", "Isère", "Loire", "Haute-Loire", "Puy-de-Dôme", "Rhône", "Savoie", "Haute-Savoie"],
  },
  {
    name: "Ligue Bourgogne-Franche-Comté",
    districts: ["Côte-d'Or", "Doubs", "Jura", "Nièvre", "Haute-Saône", "Saône-et-Loire", "Yonne", "Territoire de Belfort"],
  },
  {
    name: "Ligue de Bretagne",
    districts: ["Côtes-d'Armor", "Finistère", "Ille-et-Vilaine", "Morbihan"],
  },
  {
    name: "Ligue du Centre-Val de Loire",
    districts: ["Cher", "Eure-et-Loir", "Indre", "Indre-et-Loire", "Loir-et-Cher", "Loiret"],
  },
  {
    name: "Ligue Corse",
    districts: ["Corse-du-Sud", "Haute-Corse"],
  },
  {
    name: "Ligue du Grand Est",
    districts: ["Ardennes", "Aube", "Marne", "Haute-Marne", "Meurthe-et-Moselle", "Meuse", "Moselle", "Bas-Rhin", "Haut-Rhin", "Vosges"],
  },
  {
    name: "Ligue des Hauts-de-France",
    districts: ["Aisne", "Nord", "Oise", "Pas-de-Calais", "Somme"],
  },
  {
    name: "Ligue de Paris Île-de-France",
    districts: ["Paris", "Seine-et-Marne", "Yvelines", "Essonne", "Hauts-de-Seine", "Seine-Saint-Denis", "Val-de-Marne", "Val-d'Oise"],
  },
  {
    name: "Ligue de Normandie",
    districts: ["Calvados", "Eure", "Manche", "Orne", "Seine-Maritime"],
  },
  {
    name: "Ligue de Nouvelle-Aquitaine",
    districts: ["Charente", "Charente-Maritime", "Corrèze", "Creuse", "Dordogne", "Gironde", "Landes", "Lot-et-Garonne", "Pyrénées-Atlantiques", "Deux-Sèvres", "Vienne", "Haute-Vienne"],
  },
  {
    name: "Ligue d'Occitanie",
    districts: ["Ariège", "Aude", "Aveyron", "Gard", "Haute-Garonne", "Gers", "Hérault", "Lot", "Lozère", "Hautes-Pyrénées", "Pyrénées-Orientales", "Tarn", "Tarn-et-Garonne"],
  },
  {
    name: "Ligue des Pays de la Loire",
    districts: ["Loire-Atlantique", "Maine-et-Loire", "Mayenne", "Sarthe", "Vendée"],
  },
  {
    name: "Ligue Méditerranée",
    districts: ["Alpes-de-Haute-Provence", "Hautes-Alpes", "Alpes-Maritimes", "Bouches-du-Rhône", "Var", "Vaucluse"],
  },
  {
    name: "Ligue de Guadeloupe",
    districts: ["Guadeloupe"],
  },
  {
    name: "Ligue de Martinique",
    districts: ["Martinique"],
  },
  {
    name: "Ligue de Guyane",
    districts: ["Guyane"],
  },
  {
    name: "Ligue de La Réunion",
    districts: ["La Réunion"],
  },
];

export const FRANCE_NIVEAUX = [
  "National",
  "Régional 1 (R1)",
  "Régional 2 (R2)",
  "Régional 3 (R3)",
  "Départemental 1 (D1)",
  "Départemental 2 (D2)",
  "Départemental 3 (D3)",
  "Loisir / Débutant",
] as const;

export const GENERIC_NIVEAUX = ["Niveau national", "Niveau régional", "Niveau local / club", "Loisir / débutant"] as const;

export const COUNTRY_LABELS: Record<Country, string> = {
  FR: "France",
  BE: "Belgique",
  CH: "Suisse",
  LU: "Luxembourg",
  MA: "Maroc",
  DZ: "Algérie",
  TN: "Tunisie",
  SN: "Sénégal",
  CI: "Côte d'Ivoire",
  CM: "Cameroun",
  CA_QC: "Canada (Québec)",
  OTHER: "Autre",
};

export function getNiveauxForCountry(country: Country): readonly string[] {
  return country === "FR" ? FRANCE_NIVEAUX : GENERIC_NIVEAUX;
}

export function getDistrictsForLigue(ligueName: string): string[] {
  return FRANCE_LIGUES.find((l) => l.name === ligueName)?.districts ?? [];
}
