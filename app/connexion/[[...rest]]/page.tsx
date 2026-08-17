import { SignIn } from "@clerk/nextjs";

export default function ConnexionPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-alt)] p-4">
      <SignIn path="/connexion" routing="path" signUpUrl="/inscription" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
