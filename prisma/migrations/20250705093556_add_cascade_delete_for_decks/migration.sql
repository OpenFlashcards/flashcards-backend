-- DropForeignKey
ALTER TABLE "decks" DROP CONSTRAINT "decks_parentDeckId_fkey";

-- DropForeignKey
ALTER TABLE "user_decks" DROP CONSTRAINT "user_decks_deckId_fkey";

-- AddForeignKey
ALTER TABLE "decks" ADD CONSTRAINT "decks_parentDeckId_fkey" FOREIGN KEY ("parentDeckId") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_decks" ADD CONSTRAINT "user_decks_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
