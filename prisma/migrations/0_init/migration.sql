-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PLAYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('GOALKEEPER', 'CENTER_BACK', 'FULLBACK', 'DEFENSIVE_MID', 'ATTACKING_MID', 'WINGER', 'STRIKER');

-- CreateEnum
CREATE TYPE "Objective" AS ENUM ('SPEED_EXPLOSIVENESS', 'TECHNIQUE_DRIBBLING', 'PHYSICAL_DUELS', 'ENDURANCE', 'SHOOTING', 'ALL_ROUND');

-- CreateEnum
CREATE TYPE "Country" AS ENUM ('FR', 'BE', 'CH', 'LU', 'MA', 'DZ', 'TN', 'SN', 'CI', 'CM', 'CA_QC', 'OTHER');

-- CreateEnum
CREATE TYPE "Equipment" AS ENUM ('BALL', 'CONES', 'WALL', 'STREET_PITCH', 'RESISTANCE_BAND', 'NONE');

-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('TECHNIQUE', 'STRENGTH', 'EXPLOSIVENESS', 'CARDIO', 'PREVENTION', 'GOALKEEPER');

-- CreateEnum
CREATE TYPE "ProgramSource" AS ENUM ('AI', 'FALLBACK_TEMPLATE', 'MANUAL_REGEN');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PLANNED', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "BlockPhase" AS ENUM ('WARMUP', 'MAIN', 'COOLDOWN');

-- CreateEnum
CREATE TYPE "BlockStatus" AS ENUM ('PLANNED', 'COMPLETED', 'SKIPPED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "FeltDifficulty" AS ENUM ('VERY_EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD');

-- CreateEnum
CREATE TYPE "EvaluationTestType" AS ENUM ('JUGGLING', 'SHUTTLE_5X10', 'PLANK', 'SPRINT_20M');

-- CreateEnum
CREATE TYPE "StatAxis" AS ENUM ('VITESSE', 'TECHNIQUE', 'CONDUITE', 'ENDURANCE', 'PHYSIQUE', 'MENTAL', 'TIR', 'PASSE', 'DEFENSE');

-- CreateEnum
CREATE TYPE "PainStatus" AS ENUM ('UNRESOLVED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "BrianMessageCategory" AS ENUM ('WELCOME', 'EXERCISE_EXCELLENT', 'EXERCISE_GOOD', 'EXERCISE_AVERAGE', 'EXERCISE_HARD', 'EXERCISE_ABANDONED', 'EXERCISE_PROGRESS', 'EXERCISE_STAGNATION', 'EXERCISE_PERSONAL_RECORD', 'SESSION_SUMMARY', 'DAILY_OBJECTIVE', 'RETENTION');

-- CreateEnum
CREATE TYPE "ObjectiveKey" AS ENUM ('COMPLETE_SESSION', 'COMPLETE_ALL_BLOCKS', 'WORK_ON_SPEED', 'WORK_ON_TECHNIQUE', 'WORK_ON_ENDURANCE', 'BEAT_RECORD', 'NO_ABANDON');

-- CreateEnum
CREATE TYPE "TestimonialStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('NONE', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('MONTHLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('ONBOARDED', 'CONVERTED_PAYING');

-- CreateEnum
CREATE TYPE "ReferralCreditSource" AS ENUM ('THREE_FRIENDS_ONBOARDED', 'FRIEND_PAID');

-- CreateEnum
CREATE TYPE "FunnelAction" AS ENUM ('VIEWED', 'COMPLETED', 'SKIPPED', 'ABANDONED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "externalAuthId" TEXT,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PLAYER',
    "photoUrl" TEXT,
    "isMinor" BOOLEAN NOT NULL DEFAULT false,
    "parentEmail" TEXT,
    "parentConsentAt" TIMESTAMP(3),
    "lastManualRegenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "birthYear" INTEGER NOT NULL,
    "position" "Position" NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'FR',
    "ligue" TEXT,
    "district" TEXT,
    "levelLabel" TEXT NOT NULL,
    "heightCm" INTEGER,
    "weightKg" INTEGER,
    "clubSessionsPerWeek" INTEGER,
    "matchDay" "Weekday",
    "club" TEXT,
    "equipment" "Equipment"[],
    "objective" "Objective" NOT NULL,
    "weakPointNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ExerciseCategory" NOT NULL,
    "emoji" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "matchBenefit" TEXT NOT NULL,
    "steps" TEXT[],
    "commonMistakes" TEXT[],
    "breathingCue" TEXT,
    "equipment" "Equipment"[],
    "spaceFriendly" BOOLEAN NOT NULL DEFAULT false,
    "minAge" INTEGER NOT NULL,
    "positions" "Position"[],
    "objectives" "Objective"[],
    "easyVariant" TEXT NOT NULL,
    "hardVariant" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "isFreeTier" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyProgram" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "source" "ProgramSource" NOT NULL,
    "rawModelOutput" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramSession" (
    "id" TEXT NOT NULL,
    "weeklyProgramId" TEXT NOT NULL,
    "dayOfWeek" "Weekday" NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "focusObjective" "Objective",
    "isMatchAdjacent" BOOLEAN NOT NULL DEFAULT false,
    "status" "SessionStatus" NOT NULL DEFAULT 'PLANNED',
    "completedAt" TIMESTAMP(3),
    "difficultyRating" INTEGER,
    "recoveryNote" TEXT,

    CONSTRAINT "ProgramSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionBlock" (
    "id" TEXT NOT NULL,
    "programSessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "phase" "BlockPhase" NOT NULL,
    "sets" INTEGER,
    "reps" TEXT,
    "restSeconds" INTEGER,
    "customInstruction" TEXT NOT NULL,
    "status" "BlockStatus" NOT NULL DEFAULT 'PLANNED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "actualDurationSeconds" INTEGER,
    "feltDifficulty" "FeltDifficulty",

    CONSTRAINT "SessionBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testType" "EvaluationTestType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stats" JSONB NOT NULL,
    "shareSlug" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerStatState" (
    "userId" TEXT NOT NULL,
    "vitesse" INTEGER NOT NULL DEFAULT 50,
    "technique" INTEGER NOT NULL DEFAULT 50,
    "conduite" INTEGER NOT NULL DEFAULT 50,
    "endurance" INTEGER NOT NULL DEFAULT 50,
    "physique" INTEGER NOT NULL DEFAULT 50,
    "mental" INTEGER NOT NULL DEFAULT 50,
    "tir" INTEGER NOT NULL DEFAULT 50,
    "passe" INTEGER NOT NULL DEFAULT 50,
    "defense" INTEGER NOT NULL DEFAULT 50,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerStatState_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "StatDelta" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "axis" "StatAxis" NOT NULL,
    "delta" INTEGER NOT NULL,
    "blockId" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatDelta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCheckin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "sleepHours" DOUBLE PRECISION,
    "sleepQuality" INTEGER NOT NULL,
    "energy" INTEGER NOT NULL,
    "soreness" INTEGER NOT NULL,
    "mood" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyCheckin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PainLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bodyPart" TEXT NOT NULL,
    "intensity" INTEGER NOT NULL,
    "note" TEXT,
    "status" "PainStatus" NOT NULL DEFAULT 'UNRESOLVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "PainLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "heightCm" INTEGER,
    "weightKg" INTEGER,

    CONSTRAINT "GrowthEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "opponent" TEXT,
    "competition" TEXT,
    "minutesPlayed" INTEGER,
    "goals" INTEGER,
    "assists" INTEGER,
    "feeling" INTEGER,
    "note" TEXT,
    "focusNextTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3),
    "status" "GoalStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrianMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "BrianMessageCategory" NOT NULL,
    "text" TEXT NOT NULL,
    "fromPlayer" BOOLEAN NOT NULL DEFAULT false,
    "relatedSessionId" TEXT,
    "relatedBlockId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrianMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyObjective" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "key" "ObjectiveKey" NOT NULL,
    "label" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreakState" (
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastCompletedAt" TIMESTAMP(3),
    "currentTier" TEXT,
    "lastTierCelebratedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StreakState_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "firstNameSnapshot" TEXT NOT NULL,
    "status" "TestimonialStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moderatedAt" TIMESTAMP(3),
    "moderatorNote" TEXT,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'NONE',
    "plan" "SubscriptionPlan",
    "currentPeriodEnd" TIMESTAMP(3),
    "payerIsParent" BOOLEAN NOT NULL DEFAULT false,
    "bonusPremiumUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralCode" (
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'ONBOARDED',
    "onboardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralCredit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "ReferralCreditSource" NOT NULL,
    "weeksGranted" INTEGER NOT NULL,
    "relatedReferralId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "anonId" TEXT NOT NULL,
    "userId" TEXT,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClickEvent" (
    "id" TEXT NOT NULL,
    "anonId" TEXT NOT NULL,
    "userId" TEXT,
    "label" TEXT NOT NULL,
    "path" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingFunnelEvent" (
    "id" TEXT NOT NULL,
    "anonId" TEXT NOT NULL,
    "screen" INTEGER NOT NULL,
    "screenKey" TEXT NOT NULL,
    "action" "FunnelAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingFunnelEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MicroSurveyResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "surveyKey" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MicroSurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailSendLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailKey" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailSendLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_externalAuthId_key" ON "User"("externalAuthId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_userId_key" ON "PlayerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_slug_key" ON "Exercise"("slug");

-- CreateIndex
CREATE INDEX "Exercise_category_idx" ON "Exercise"("category");

-- CreateIndex
CREATE INDEX "Exercise_minAge_idx" ON "Exercise"("minAge");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyProgram_userId_weekStartDate_key" ON "WeeklyProgram"("userId", "weekStartDate");

-- CreateIndex
CREATE INDEX "ProgramSession_weeklyProgramId_idx" ON "ProgramSession"("weeklyProgramId");

-- CreateIndex
CREATE INDEX "SessionBlock_programSessionId_idx" ON "SessionBlock"("programSessionId");

-- CreateIndex
CREATE INDEX "EvaluationResult_userId_testType_recordedAt_idx" ON "EvaluationResult"("userId", "testType", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCard_userId_key" ON "PlayerCard"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCard_shareSlug_key" ON "PlayerCard"("shareSlug");

-- CreateIndex
CREATE INDEX "StatDelta_userId_axis_createdAt_idx" ON "StatDelta"("userId", "axis", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCheckin_userId_date_key" ON "DailyCheckin"("userId", "date");

-- CreateIndex
CREATE INDEX "PainLog_userId_status_idx" ON "PainLog"("userId", "status");

-- CreateIndex
CREATE INDEX "GrowthEntry_userId_date_idx" ON "GrowthEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "MatchLog_userId_date_idx" ON "MatchLog"("userId", "date");

-- CreateIndex
CREATE INDEX "BrianMessage_userId_createdAt_idx" ON "BrianMessage"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DailyObjective_userId_date_key_key" ON "DailyObjective"("userId", "date", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_slug_key" ON "Badge"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralCode_code_key" ON "ReferralCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_refereeId_key" ON "Referral"("refereeId");

-- CreateIndex
CREATE INDEX "Referral_referrerId_status_idx" ON "Referral"("referrerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralCredit_relatedReferralId_source_key" ON "ReferralCredit"("relatedReferralId", "source");

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_userId_idx" ON "PageView"("userId");

-- CreateIndex
CREATE INDEX "PageView_anonId_idx" ON "PageView"("anonId");

-- CreateIndex
CREATE INDEX "ClickEvent_createdAt_idx" ON "ClickEvent"("createdAt");

-- CreateIndex
CREATE INDEX "ClickEvent_label_idx" ON "ClickEvent"("label");

-- CreateIndex
CREATE INDEX "OnboardingFunnelEvent_anonId_idx" ON "OnboardingFunnelEvent"("anonId");

-- CreateIndex
CREATE INDEX "OnboardingFunnelEvent_screen_action_idx" ON "OnboardingFunnelEvent"("screen", "action");

-- CreateIndex
CREATE UNIQUE INDEX "MicroSurveyResponse_userId_surveyKey_key" ON "MicroSurveyResponse"("userId", "surveyKey");

-- CreateIndex
CREATE UNIQUE INDEX "EmailSendLog_userId_emailKey_key" ON "EmailSendLog"("userId", "emailKey");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- AddForeignKey
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyProgram" ADD CONSTRAINT "WeeklyProgram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramSession" ADD CONSTRAINT "ProgramSession_weeklyProgramId_fkey" FOREIGN KEY ("weeklyProgramId") REFERENCES "WeeklyProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionBlock" ADD CONSTRAINT "SessionBlock_programSessionId_fkey" FOREIGN KEY ("programSessionId") REFERENCES "ProgramSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionBlock" ADD CONSTRAINT "SessionBlock_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationResult" ADD CONSTRAINT "EvaluationResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerCard" ADD CONSTRAINT "PlayerCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerStatState" ADD CONSTRAINT "PlayerStatState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatDelta" ADD CONSTRAINT "StatDelta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCheckin" ADD CONSTRAINT "DailyCheckin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainLog" ADD CONSTRAINT "PainLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthEntry" ADD CONSTRAINT "GrowthEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchLog" ADD CONSTRAINT "MatchLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalGoal" ADD CONSTRAINT "PersonalGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrianMessage" ADD CONSTRAINT "BrianMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyObjective" ADD CONSTRAINT "DailyObjective_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreakState" ADD CONSTRAINT "StreakState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCredit" ADD CONSTRAINT "ReferralCredit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCredit" ADD CONSTRAINT "ReferralCredit_relatedReferralId_fkey" FOREIGN KEY ("relatedReferralId") REFERENCES "Referral"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClickEvent" ADD CONSTRAINT "ClickEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroSurveyResponse" ADD CONSTRAINT "MicroSurveyResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailSendLog" ADD CONSTRAINT "EmailSendLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

