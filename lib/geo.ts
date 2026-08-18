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

// Régions/provinces de premier niveau pour les pays francophones autres que
// la France (qui utilise déjà son propre système de départements/ligues
// ci-dessus). Purement informatif — contrairement au département français,
// aucune ligue n'est déduite de ce choix. Pas d'entrée pour Monaco (pas de
// subdivision administrative) ni "Autre" (aucune liste possible).
export const REGIONS_BY_COUNTRY: Record<string, string[]> = {
  Belgique: [
    "Anvers", "Brabant flamand", "Brabant wallon", "Bruxelles-Capitale", "Flandre occidentale",
    "Flandre orientale", "Hainaut", "Liège", "Limbourg", "Luxembourg (Belgique)", "Namur",
  ],
  Suisse: [
    "Argovie", "Appenzell Rhodes-Extérieures", "Appenzell Rhodes-Intérieures", "Bâle-Campagne", "Bâle-Ville",
    "Berne", "Fribourg", "Genève", "Glaris", "Grisons", "Jura", "Lucerne", "Neuchâtel", "Nidwald", "Obwald",
    "Schaffhouse", "Schwytz", "Soleure", "Saint-Gall", "Tessin", "Thurgovie", "Uri", "Valais", "Vaud", "Zoug", "Zurich",
  ],
  Luxembourg: [
    "Capellen", "Clervaux", "Diekirch", "Echternach", "Esch-sur-Alzette", "Grevenmacher",
    "Luxembourg", "Mersch", "Redange", "Remich", "Vianden", "Wiltz",
  ],
  "Canada (Québec)": [
    "Bas-Saint-Laurent", "Saguenay–Lac-Saint-Jean", "Capitale-Nationale", "Mauricie", "Estrie", "Montréal",
    "Outaouais", "Abitibi-Témiscamingue", "Côte-Nord", "Nord-du-Québec", "Gaspésie–Îles-de-la-Madeleine",
    "Chaudière-Appalaches", "Laval", "Lanaudière", "Laurentides", "Montérégie", "Centre-du-Québec",
  ],
  Maroc: [
    "Tanger-Tétouan-Al Hoceïma", "Oriental", "Fès-Meknès", "Rabat-Salé-Kénitra", "Béni Mellal-Khénifra",
    "Casablanca-Settat", "Marrakech-Safi", "Drâa-Tafilalet", "Souss-Massa", "Guelmim-Oued Noun",
    "Laâyoune-Sakia El Hamra", "Dakhla-Oued Ed-Dahab",
  ],
  Algérie: [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
    "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda",
    "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara",
    "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf",
    "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
    "Ghardaïa", "Relizane",
  ],
  Tunisie: [
    "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba", "Kairouan", "Kasserine", "Kébili",
    "Le Kef", "Mahdia", "La Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana",
    "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan",
  ],
  Sénégal: [
    "Dakar", "Diourbel", "Fatick", "Kaffrine", "Kaolack", "Kédougou", "Kolda", "Louga", "Matam",
    "Saint-Louis", "Sédhiou", "Tambacounda", "Thiès", "Ziguinchor",
  ],
  "Côte d'Ivoire": [
    "Abidjan", "Agnéby-Tiassa", "Bafing", "Bagoué", "Bas-Sassandra", "Bélier", "Béré", "Bounkani", "Cavally",
    "Folon", "Gbêkê", "Gbôklé", "Gôh", "Gontougo", "Grands-Ponts", "Guémon", "Hambol", "Haut-Sassandra",
    "Iffou", "Indénié-Djuablin", "Kabadougou", "San-Pédro", "Lôh-Djiboua", "Marahoué", "Moronou", "N'zi",
    "Nawa", "Poro", "Sud-Comoé", "Tchologo", "Tonkpi", "Worodougou", "Yamoussoukro",
  ],
  Cameroun: ["Adamaoua", "Centre", "Est", "Extrême-Nord", "Littoral", "Nord", "Nord-Ouest", "Ouest", "Sud", "Sud-Ouest"],
  Mali: [
    "Kayes", "Koulikoro", "Sikasso", "Ségou", "Mopti", "Tombouctou", "Gao", "Kidal", "Taoudénit", "Ménaka", "Bamako",
  ],
  "République démocratique du Congo": [
    "Bas-Uélé", "Équateur", "Haut-Katanga", "Haut-Lomami", "Haut-Uélé", "Ituri", "Kasaï", "Kasaï central",
    "Kasaï oriental", "Kinshasa", "Kongo central", "Kwango", "Kwilu", "Lomami", "Lualaba", "Mai-Ndombe",
    "Maniema", "Mongala", "Nord-Kivu", "Nord-Ubangi", "Sankuru", "Sud-Kivu", "Sud-Ubangi", "Tanganyika",
    "Tshopo", "Tshuapa",
  ],
  Congo: [
    "Bouenza", "Cuvette", "Cuvette-Ouest", "Kouilou", "Lékoumou", "Likouala", "Niari", "Plateaux", "Pool",
    "Sangha", "Brazzaville", "Pointe-Noire",
  ],
  Gabon: ["Estuaire", "Haut-Ogooué", "Moyen-Ogooué", "Ngounié", "Nyanga", "Ogooué-Ivindo", "Ogooué-Lolo", "Ogooué-Maritime", "Woleu-Ntem"],
  "Burkina Faso": [
    "Boucle du Mouhoun", "Cascades", "Centre", "Centre-Est", "Centre-Nord", "Centre-Ouest", "Centre-Sud",
    "Est", "Hauts-Bassins", "Nord", "Plateau-Central", "Sahel", "Sud-Ouest",
  ],
  Guinée: ["Boké", "Conakry", "Faranah", "Kankan", "Kindia", "Labé", "Mamou", "N'Zérékoré"],
  Bénin: [
    "Alibori", "Atacora", "Atlantique", "Borgou", "Collines", "Couffo", "Donga", "Littoral",
    "Mono", "Ouémé", "Plateau", "Zou",
  ],
  Togo: ["Maritime", "Plateaux", "Centrale", "Kara", "Savanes"],
  Niger: ["Agadez", "Diffa", "Dosso", "Maradi", "Niamey", "Tahoua", "Tillabéri", "Zinder"],
  Tchad: [
    "Batha", "Borkou", "Chari-Baguirmi", "Ennedi-Est", "Ennedi-Ouest", "Guéra", "Hadjer-Lamis", "Kanem",
    "Lac", "Logone occidental", "Logone oriental", "Mandoul", "Mayo-Kebbi Est", "Mayo-Kebbi Ouest",
    "Moyen-Chari", "N'Djamena", "Ouaddaï", "Salamat", "Sila", "Tandjilé", "Tibesti", "Wadi Fira",
  ],
  Madagascar: [
    "Analamanga", "Vakinankaratra", "Itasy", "Bongolava", "Haute Matsiatra", "Amoron'i Mania", "Vatovavy",
    "Fitovinany", "Atsimo-Atsinanana", "Ihorombe", "Atsinanana", "Analanjirofo", "Alaotra-Mangoro", "Boeny",
    "Sofia", "Betsiboka", "Melaky", "Atsimo-Andrefana", "Androy", "Anosy", "Menabe", "Diana", "Sava",
  ],
  Maurice: ["Port-Louis", "Pamplemousses", "Rivière du Rempart", "Flacq", "Grand Port", "Savanne", "Plaines Wilhems", "Moka", "Black River"],
  Mauritanie: [
    "Hodh Ech Chargui", "Hodh El Gharbi", "Assaba", "Gorgol", "Brakna", "Trarza", "Adrar",
    "Dakhlet Nouadhibou", "Tagant", "Guidimaka", "Tiris Zemmour", "Inchiri", "Nouakchott-Nord",
    "Nouakchott-Ouest", "Nouakchott-Sud",
  ],
  Rwanda: ["Ville de Kigali", "Nord", "Sud", "Est", "Ouest"],
  Burundi: [
    "Bubanza", "Bujumbura Mairie", "Bujumbura Rural", "Bururi", "Cankuzo", "Cibitoke", "Gitega", "Karuzi",
    "Kayanza", "Kirundo", "Makamba", "Muramvya", "Muyinga", "Mwaro", "Ngozi", "Rumonge", "Rutana", "Ruyigi",
  ],
  "République centrafricaine": [
    "Bamingui-Bangoran", "Bangui", "Basse-Kotto", "Haute-Kotto", "Haut-Mbomou", "Kémo", "Lobaye", "Mambéré-Kadéï",
    "Mbomou", "Nana-Grébizi", "Nana-Mambéré", "Ombella-M'Poko", "Ouaka", "Ouham", "Ouham-Pendé", "Sangha-Mbaéré", "Vakaga",
  ],
  Comores: ["Grande Comore", "Anjouan", "Mohéli"],
  Djibouti: ["Djibouti (ville)", "Ali Sabieh", "Dikhil", "Tadjourah", "Obock", "Arta"],
  Haïti: [
    "Ouest", "Sud-Est", "Nord", "Nord-Est", "Artibonite", "Centre", "Sud", "Grand'Anse", "Nord-Ouest", "Nippes",
  ],
};

export function getRegionsForCountry(country: string): string[] {
  return REGIONS_BY_COUNTRY[country] ?? [];
}
