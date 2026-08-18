import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncInternalUser } from "@/lib/auth";
import { onboardingPayloadSchema } from "@/lib/onboarding/schema";
import { isMinor } from "@/lib/age-category";
import { ensureReferralCode, recordReferralOnboarding } from "@/lib/referral";
import { pickTargetWeekDays } from "@/lib/scheduling";
import { getCurrentWeekStart } from "@/lib/week";
import { generateWeeklyProgram } from "@/lib/ai/generate-program";
import { persistWeeklyProgram } from "@/lib/programs/persist-weekly-program";
import { sendEmailOnce } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates";
import { composeWelcomeMessage } from "@/lib/brian/messages";

/**
 * Finalise l'onboarding. Étape critique (doit réussir): synchroniser la
 * ligne User interne — le compte Supabase Auth existe déjà, donc bloquer ici
 * priverait le joueur d'un compte qu'il a déjà techniquement créé.
 * Tout le reste (profil, code de parrainage, série, premier programme) est
 * volontairement non-bloquant: chaque étape est isolée dans son propre
 * try/catch et peut être régénérée/complétée plus tard.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = onboardingPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }
  const payload = parsed.data;

  const user = await syncInternalUser();
  if (!user) {
    return NextResponse.json({ error: "user_sync_failed" }, { status: 500 });
  }

  try {
    const minor = isMinor(payload.birthYear);
    if (minor !== user.isMinor) {
      await prisma.user.update({ where: { id: user.id }, data: { isMinor: minor } });
    }
  } catch (err) {
    console.error("[onboarding/complete] minor flag update failed", err);
  }

  try {
    // syncInternalUser() ne connaît le prénom que via Supabase user_metadata
    // (absent avec le flux OTP actuel — pas de mot de passe, donc pas de
    // formulaire d'inscription séparé qui l'aurait renseigné), d'où le
    // "Joueur" par défaut. L'onboarding est la vraie source du prénom.
    if (payload.firstName && payload.firstName !== user.firstName) {
      await prisma.user.update({ where: { id: user.id }, data: { firstName: payload.firstName } });
      user.firstName = payload.firstName; // pour que le reste de cette requête (email, message Brian) utilise le bon prénom
    }
  } catch (err) {
    console.error("[onboarding/complete] firstName update failed", err);
  }

  try {
    await prisma.playerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        birthYear: payload.birthYear,
        position: payload.position,
        country: payload.country,
        ligue: payload.ligue ?? null,
        district: payload.district ?? null,
        levelLabel: payload.levelLabel,
        heightCm: payload.heightCm ?? null,
        weightKg: payload.weightKg ?? null,
        clubSessionsPerWeek: payload.clubSessionsPerWeek ?? null,
        matchDay: payload.matchDay ?? null,
        equipment: payload.equipment,
        objective: payload.objective,
        weakPointNote: payload.weakPointNote || null,
      },
      update: {
        birthYear: payload.birthYear,
        position: payload.position,
        country: payload.country,
        ligue: payload.ligue ?? null,
        district: payload.district ?? null,
        levelLabel: payload.levelLabel,
        heightCm: payload.heightCm ?? null,
        weightKg: payload.weightKg ?? null,
        clubSessionsPerWeek: payload.clubSessionsPerWeek ?? null,
        matchDay: payload.matchDay ?? null,
        equipment: payload.equipment,
        objective: payload.objective,
        weakPointNote: payload.weakPointNote || null,
      },
    });
  } catch (err) {
    console.error("[onboarding/complete] player profile upsert failed", err);
  }

  try {
    await ensureReferralCode(user.id);
  } catch (err) {
    console.error("[onboarding/complete] referral code creation failed", err);
  }

  try {
    const referralCode = typeof (body as Record<string, unknown>)?.referralCode === "string" ? (body as { referralCode: string }).referralCode : null;
    await recordReferralOnboarding(referralCode, user.id);
  } catch (err) {
    console.error("[onboarding/complete] referral credit failed", err);
  }

  try {
    await prisma.streakState.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });
  } catch (err) {
    console.error("[onboarding/complete] streak state init failed", err);
  }

  try {
    await prisma.playerStatState.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });
    const alreadyWelcomed = await prisma.brianMessage.findFirst({
      where: { userId: user.id, category: "WELCOME" },
    });
    if (!alreadyWelcomed) {
      await prisma.brianMessage.create({
        data: { userId: user.id, category: "WELCOME", text: composeWelcomeMessage(payload.firstName) },
      });
    }
  } catch (err) {
    console.error("[onboarding/complete] Coach Brian init failed", err);
  }

  try {
    const weekStartDate = getCurrentWeekStart();
    const existingProgram = await prisma.weeklyProgram.findUnique({
      where: { userId_weekStartDate: { userId: user.id, weekStartDate } },
    });

    if (!existingProgram) {
      const { targetWeekDays, matchAdjacentDays } = pickTargetWeekDays(1, payload.matchDay ?? null);
      const result = await generateWeeklyProgram({
        firstName: payload.firstName,
        birthYear: payload.birthYear,
        position: payload.position,
        country: payload.country,
        levelLabel: payload.levelLabel,
        heightCm: payload.heightCm,
        weightKg: payload.weightKg,
        clubSessionsPerWeek: payload.clubSessionsPerWeek,
        matchDay: payload.matchDay,
        equipment: payload.equipment,
        objective: payload.objective,
        weakPointNote: payload.weakPointNote,
        unresolvedPain: [],
        previousWeek: null,
        sessionCount: 1, // compte gratuit à la création
        targetWeekDays,
        matchAdjacentDays,
        isPremium: false,
      });
      await persistWeeklyProgram(user.id, weekStartDate, result.program, result.source, result.rawModelOutput);
    }
  } catch (err) {
    console.error("[onboarding/complete] initial program generation failed", err);
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    await sendEmailOnce(user.id, user.email, "welcome", welcomeEmail(user.firstName, appUrl));
  } catch (err) {
    console.error("[onboarding/complete] welcome email failed", err);
  }

  return NextResponse.json({ ok: true });
}
