/*
  Warnings:

  - A unique constraint covering the columns `[userId,questionId,questionnaireId]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Answer_userId_questionId_questionnaireId_key" ON "Answer"("userId", "questionId", "questionnaireId");
