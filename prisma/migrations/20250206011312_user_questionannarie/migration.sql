-- CreateTable
CREATE TABLE "UserQuestionnaire" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "questionnaireId" INTEGER NOT NULL,

    CONSTRAINT "UserQuestionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserQuestionnaire_userId_questionnaireId_key" ON "UserQuestionnaire"("userId", "questionnaireId");

-- AddForeignKey
ALTER TABLE "UserQuestionnaire" ADD CONSTRAINT "UserQuestionnaire_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionnaire" ADD CONSTRAINT "UserQuestionnaire_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "Questionnaire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
