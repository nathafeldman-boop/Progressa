import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";

export default async function InscriptionPage() {
  const supabase = await createClient();
  const authUser = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (authUser) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-surface-alt)] p-4">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Créer un compte</h1>
      <EmailAuthForm redirectTo="/onboarding" />
    </div>
  );
}
