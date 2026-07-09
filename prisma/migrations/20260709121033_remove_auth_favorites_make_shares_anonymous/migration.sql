/*
  Warnings:

  - You are about to drop the `FavoritePlatform` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `userId` on the `SavedComparison` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "FavoritePlatform_userId_platformSlug_key";

-- DropIndex
DROP INDEX "FavoritePlatform_userId_updatedAt_idx";

-- DropIndex
DROP INDEX "FavoritePlatform_userId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "FavoritePlatform";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SavedComparison" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appType" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "database" TEXT NOT NULL,
    "alwaysOn" BOOLEAN NOT NULL,
    "hasCard" BOOLEAN NOT NULL,
    "region" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "resultJson" JSONB NOT NULL
);
INSERT INTO "new_SavedComparison" ("alwaysOn", "appType", "budget", "createdAt", "database", "hasCard", "id", "region", "resultJson", "riskLevel") SELECT "alwaysOn", "appType", "budget", "createdAt", "database", "hasCard", "id", "region", "resultJson", "riskLevel" FROM "SavedComparison";
DROP TABLE "SavedComparison";
ALTER TABLE "new_SavedComparison" RENAME TO "SavedComparison";
CREATE INDEX "SavedComparison_createdAt_idx" ON "SavedComparison"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
