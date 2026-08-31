-- CreateEnum
CREATE TYPE "RewardedAdKind" AS ENUM ('BRIAN_MESSAGES', 'SESSION_TIMER');

-- CreateTable
CREATE TABLE "FreeTargetedSessionUsage" (
    "userId" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3) NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "FreeTargetedSessionUsage_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "RewardedAdEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "RewardedAdKind" NOT NULL,
    "providerTransactionId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardedAdEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RewardedAdEvent_providerTransactionId_key" ON "RewardedAdEvent"("providerTransactionId");

-- CreateIndex
CREATE INDEX "RewardedAdEvent_userId_kind_grantedAt_idx" ON "RewardedAdEvent"("userId", "kind", "grantedAt");

-- AddForeignKey
ALTER TABLE "FreeTargetedSessionUsage" ADD CONSTRAINT "FreeTargetedSessionUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardedAdEvent" ADD CONSTRAINT "RewardedAdEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
