-- CreateTable
CREATE TABLE "ExerciseRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExerciseRating_exerciseId_idx" ON "ExerciseRating"("exerciseId");

-- CreateIndex
CREATE INDEX "ExerciseRating_userId_idx" ON "ExerciseRating"("userId");

-- AddForeignKey
ALTER TABLE "ExerciseRating" ADD CONSTRAINT "ExerciseRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseRating" ADD CONSTRAINT "ExerciseRating_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
