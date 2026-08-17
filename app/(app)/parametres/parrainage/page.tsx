import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { ensureReferralCode } from "@/lib/referral";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { ReferralShareLink } from "@/components/referral/ReferralShareLink";

export default async function ParrainagePage() {
  const user = await getCurrentInternalUser();
  if (!user) return null;

  const code = await ensureReferralCode(user.id);
  const [referrals, credits] = await Promise.all([
    prisma.referral.findMany({ where: { referrerId: user.id } }),
    prisma.referralCredit.findMany({ where: { userId: user.id } }),
  ]);

  const totalWeeksEarned = credits.reduce((sum, c) => sum + c.weeksGranted, 0);
  const converted = referrals.filter((r) => r.status === "CONVERTED_PAYING").length;

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Parrainage</h1>

      <Card>
        <CardTitle>Invite tes potes</CardTitle>
        <CardSubtitle className="mt-1">
          Tous les 3 potes qui terminent leur profil, tu gagnes 1 semaine de Premium (jusqu&apos;à 4 semaines). Si un
          pote passe Premium, tu gagnes 2 semaines de plus.
        </CardSubtitle>
        <ReferralShareLink code={code} />
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="font-display text-3xl font-extrabold text-[var(--color-primary-strong)]">{referrals.length}</p>
          <CardSubtitle>Potes inscrits</CardSubtitle>
        </Card>
        <Card className="text-center">
          <p className="font-display text-3xl font-extrabold text-[var(--color-primary-strong)]">{converted}</p>
          <CardSubtitle>Devenus Premium</CardSubtitle>
        </Card>
      </div>

      <Card className="text-center">
        <p className="font-display text-3xl font-extrabold text-[var(--color-primary-strong)]">{totalWeeksEarned}</p>
        <CardSubtitle>Semaines de Premium gagnées au total</CardSubtitle>
      </Card>
    </div>
  );
}
