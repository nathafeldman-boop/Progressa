import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { TEST_PROTOCOLS, nextEligibleDate } from "@/lib/evaluation-tests";
import { isInFuture } from "@/lib/time";
import { TestPlayer, type TestFlowEntry } from "@/components/tests/TestPlayer";
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

  const tests: TestFlowEntry[] = Object.values(TEST_PROTOCOLS).map((protocol) => {
    const last = lastByType.get(protocol.type);
    const eligibleAt = last ? nextEligibleDate(last.recordedAt) : null;
    const locked = isInFuture(eligibleAt);
    return {
      type: protocol.type,
      name: protocol.name,
      unit: protocol.unit,
      lowerIsBetter: protocol.lowerIsBetter,
      protocol: protocol.protocol,
      lastValue: last?.value ?? null,
      locked,
      eligibleAtLabel: locked ? eligibleAt!.toLocaleDateString("fr-FR") : null,
    };
  });

  return <TestPlayer tests={tests} firstName={user.firstName} isFirstTime={results.length === 0} />;
}
