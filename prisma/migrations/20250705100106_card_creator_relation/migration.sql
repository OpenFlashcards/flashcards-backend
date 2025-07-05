-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "createdById" INTEGER;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
