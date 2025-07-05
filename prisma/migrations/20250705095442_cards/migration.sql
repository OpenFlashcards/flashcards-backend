-- CreateTable
CREATE TABLE "cards" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "deckId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
