/*
  Warnings:

  - You are about to alter the column `resultJson` on the `FreshnessCheckRun` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- CreateTable
CREATE TABLE "FavoritePlatform" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "platformSlug" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT ''
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FreshnessCheckRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "status" TEXT NOT NULL,
    "checkedSources" INTEGER NOT NULL DEFAULT 0,
    "failedSources" INTEGER NOT NULL DEFAULT 0,
    "blockedSources" INTEGER NOT NULL DEFAULT 0,
    "changedSources" INTEGER NOT NULL DEFAULT 0,
    "resultJson" JSONB,
    "error" TEXT
);
INSERT INTO "new_FreshnessCheckRun" ("blockedSources", "changedSources", "checkedSources", "createdAt", "error", "failedSources", "finishedAt", "id", "resultJson", "status") SELECT "blockedSources", "changedSources", "checkedSources", "createdAt", "error", "failedSources", "finishedAt", "id", "resultJson", "status" FROM "FreshnessCheckRun";
DROP TABLE "FreshnessCheckRun";
ALTER TABLE "new_FreshnessCheckRun" RENAME TO "FreshnessCheckRun";
CREATE TABLE "new_SavedComparison" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "appType" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "database" TEXT NOT NULL,
    "alwaysOn" BOOLEAN NOT NULL,
    "hasCard" BOOLEAN NOT NULL,
    "region" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "resultJson" JSONB NOT NULL
);
INSERT INTO "new_SavedComparison" ("alwaysOn", "appType", "budget", "createdAt", "database", "hasCard", "id", "region", "resultJson", "riskLevel", "userId") SELECT "alwaysOn", "appType", "budget", "createdAt", "database", "hasCard", "id", "region", "resultJson", "riskLevel", "userId" FROM "SavedComparison";
DROP TABLE "SavedComparison";
ALTER TABLE "new_SavedComparison" RENAME TO "SavedComparison";
CREATE INDEX "SavedComparison_userId_idx" ON "SavedComparison"("userId");
CREATE INDEX "SavedComparison_userId_createdAt_idx" ON "SavedComparison"("userId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "FavoritePlatform_userId_idx" ON "FavoritePlatform"("userId");

-- CreateIndex
CREATE INDEX "FavoritePlatform_userId_updatedAt_idx" ON "FavoritePlatform"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FavoritePlatform_userId_platformSlug_key" ON "FavoritePlatform"("userId", "platformSlug");
