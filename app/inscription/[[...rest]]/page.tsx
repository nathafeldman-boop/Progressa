import { SignUp } from "@clerk/nextjs";

export default function InscriptionPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-alt)] p-4">
      <SignUp path="/inscription" routing="path" signInUrl="/connexion" fallbackRedirectUrl="/onboarding/finish" />
    </div>
  );
}
