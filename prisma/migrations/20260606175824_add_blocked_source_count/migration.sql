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
    "resultJson" TEXT,
    "error" TEXT
);
INSERT INTO "new_FreshnessCheckRun" ("changedSources", "checkedSources", "createdAt", "error", "failedSources", "finishedAt", "id", "resultJson", "status") SELECT "changedSources", "checkedSources", "createdAt", "error", "failedSources", "finishedAt", "id", "resultJson", "status" FROM "FreshnessCheckRun";
DROP TABLE "FreshnessCheckRun";
ALTER TABLE "new_FreshnessCheckRun" RENAME TO "FreshnessCheckRun";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
