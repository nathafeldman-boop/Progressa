-- CreateTable
CREATE TABLE "PaywallNudgeEmail" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sendCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PaywallNudgeEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaywallNudgeEmail_userId_key" ON "PaywallNudgeEmail"("userId");

-- AddForeignKey
ALTER TABLE "PaywallNudgeEmail" ADD CONSTRAINT "PaywallNudgeEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
