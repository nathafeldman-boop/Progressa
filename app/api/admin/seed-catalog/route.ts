import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { seedCatalog } from "@/lib/exercises/seed-catalog";

/**
 * Re-synchronisation manuelle et immédiate du catalogue (voir aussi
 * instrumentation.ts, qui le fait automatiquement à chaque démarrage
 * serveur — ce bouton sert seulement à forcer une synchronisation
 * instantanée sans attendre le prochain cold start).
 */
export async function POST() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const result = await seedCatalog({ force: true });
  return NextResponse.json(result);
}
