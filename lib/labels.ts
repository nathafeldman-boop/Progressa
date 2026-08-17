import { Equipment, Objective, Position, Weekday } from "@prisma/client";

export const POSITION_LABELS: Record<Position, string> = {
  GOALKEEPER: "Gardien",
  CENTER_BACK: "Défenseur central",
  FULLBACK: "Latéral",
  DEFENSIVE_MID: "Milieu défensif",
  ATTACKING_MID: "Milieu offensif",
  WINGER: "Ailier",
  STRIKER: "Attaquant",
};

export const OBJECTIVE_LABELS: Record<Objective, string> = {
  SPEED_EXPLOSIVENESS: "Vitesse / explosivité",
  TECHNIQUE_DRIBBLING: "Technique / dribble",
  PHYSICAL_DUELS: "Physique / duels",
  ENDURANCE: "Endurance",
  SHOOTING: "Frappe",
  ALL_ROUND: "Polyvalent",
};

export const OBJECTIVE_EMOJI: Record<Objective, string> = {
  SPEED_EXPLOSIVENESS: "💨",
  TECHNIQUE_DRIBBLING: "⚽",
  PHYSICAL_DUELS: "💪",
  ENDURANCE: "🫁",
  SHOOTING: "🥅",
  ALL_ROUND: "🧭",
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  BALL: "Ballon",
  CONES: "Plots",
  WALL: "Mur",
  STREET_PITCH: "City-stade",
  RESISTANCE_BAND: "Élastiques",
  NONE: "Aucun matériel",
};

export const EQUIPMENT_EMOJI: Record<Equipment, string> = {
  BALL: "⚽",
  CONES: "🔶",
  WALL: "🧱",
  STREET_PITCH: "🏟️",
  RESISTANCE_BAND: "🎗️",
  NONE: "🚫",
};

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  MONDAY: "Lundi",
  TUESDAY: "Mardi",
  WEDNESDAY: "Mercredi",
  THURSDAY: "Jeudi",
  FRIDAY: "Vendredi",
  SATURDAY: "Samedi",
  SUNDAY: "Dimanche",
};
