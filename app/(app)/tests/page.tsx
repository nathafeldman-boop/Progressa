import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { TEST_PROTOCOLS, nextEligibleDate } from "@/lib/evaluation-tests";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { TestSubmitForm } from "@/components/tests/TestSubmitForm";
import { EvaluationTestType } from "@prisma/client";

export default async function TestsPage() {
  const user = await getCurrentInternalUser();
  if (!user) return null;

  const results = await prisma.evaluationResult.findMany({
    where: { userId: user.id },
    orderBy: { recordedAt: "desc" },
  });

  const lastByType = new Map<EvaluationTestType, (typeof results)[number]>();
  for (const result of results) {
    if (!lastByType.has(result.testType)) lastByType.set(result.testType, result);
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Tests d&apos;évaluation</h1>
      <CardSubtitle>4 tests simples, réalisables seul, pour suivre ta progression réelle.</CardSubtitle>

      {Object.values(TEST_PROTOCOLS).map((protocol) => {
        const last = lastByType.get(protocol.type);
        const eligibleAt = last ? nextEligibleDate(last.recordedAt) : null;
        const isLocked = !!eligibleAt && eligibleAt.getTime() > Date.now();

        return (
          <Card key={protocol.type}>
            <CardTitle>
              {protocol.emoji} {protocol.name}
            </CardTitle>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--color-text-muted)]">
              {protocol.protocol.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
            {last && (
              <p className="mt-2 text-sm font-semibold text-[var(--color-primary-strong)]">
                Dernier résultat: {last.value} {protocol.unit}
              </p>
            )}
            {isLocked ? (
              <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                Prochain essai possible le {eligibleAt!.toLocaleDateString("fr-FR")}.
              </p>
            ) : (
              <TestSubmitForm testType={protocol.type} unit={protocol.unit} />
            )}
          </Card>
        );
      })}
    </div>
  );
}
