-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "appleId" TEXT,
    "googleId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'email',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentDeckId" INTEGER,

    CONSTRAINT "decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_decks" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "deckId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',

    CONSTRAINT "user_decks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_appleId_key" ON "users"("appleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_decks_userId_deckId_key" ON "user_decks"("userId", "deckId");

-- AddForeignKey
ALTER TABLE "decks" ADD CONSTRAINT "decks_parentDeckId_fkey" FOREIGN KEY ("parentDeckId") REFERENCES "decks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_decks" ADD CONSTRAINT "user_decks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_decks" ADD CONSTRAINT "user_decks_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
