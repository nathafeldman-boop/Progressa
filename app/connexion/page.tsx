import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";

export default async function ConnexionPage({ searchParams }: PageProps<"/connexion">) {
  const params = await searchParams;
  const redirectParam = typeof params.redirect === "string" ? params.redirect : "/dashboard";

  const supabase = await createClient();
  const authUser = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (authUser) redirect(redirectParam);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-surface-alt)] p-4">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Connexion</h1>
      <EmailAuthForm redirectTo={redirectParam} />
    </div>
  );
}
