import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { Exercise3DGallery } from "./Exercise3DGallery";

export const metadata = { robots: "noindex, nofollow" };

/** Revue interne du prototype moteur 3D (voir docs/exercise3d.md) — pas encore branché dans le parcours joueur. */
export default async function Exercise3DAdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return <AdminLoginForm />;
  return <Exercise3DGallery />;
}
