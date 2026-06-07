-- CreateTable
CREATE TABLE "PlatformSourceCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "platformSlug" TEXT NOT NULL,
    "sourceLabel" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "lastCheckedAt" DATETIME NOT NULL,
    "lastChangedAt" DATETIME,
    "status" TEXT NOT NULL,
    "httpStatus" INTEGER,
    "contentHash" TEXT,
    "title" TEXT,
    "excerpt" TEXT,
    "changedSinceLastRun" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "FreshnessCheckRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "status" TEXT NOT NULL,
    "checkedSources" INTEGER NOT NULL DEFAULT 0,
    "failedSources" INTEGER NOT NULL DEFAULT 0,
    "changedSources" INTEGER NOT NULL DEFAULT 0,
    "resultJson" TEXT,
    "error" TEXT
);

-- CreateIndex
CREATE INDEX "PlatformSourceCheck_platformSlug_idx" ON "PlatformSourceCheck"("platformSlug");

-- CreateIndex
CREATE INDEX "PlatformSourceCheck_lastCheckedAt_idx" ON "PlatformSourceCheck"("lastCheckedAt");

-- CreateIndex
CREATE INDEX "PlatformSourceCheck_status_idx" ON "PlatformSourceCheck"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformSourceCheck_platformSlug_sourceUrl_key" ON "PlatformSourceCheck"("platformSlug", "sourceUrl");
