import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { ExerciseVectorGallery } from "./ExerciseVectorGallery";

export const metadata = { robots: "noindex, nofollow" };

/** Revue interne du rig vectoriel IK (voir lib/exercise-vector) — les 101 exercices du catalogue et leur mouvement associé. */
export default async function ExerciseVectorAdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return <AdminLoginForm />;
  return <ExerciseVectorGallery />;
}
