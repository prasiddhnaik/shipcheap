-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "SavedComparison" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appType" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "database" TEXT NOT NULL,
    "alwaysOn" BOOLEAN NOT NULL,
    "hasCard" BOOLEAN NOT NULL,
    "region" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "resultJson" JSONB NOT NULL,

    CONSTRAINT "SavedComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiRateLimitBucket" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "route" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ApiRateLimitBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSourceCheck" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "platformSlug" TEXT NOT NULL,
    "sourceLabel" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL,
    "lastChangedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "httpStatus" INTEGER,
    "contentHash" TEXT,
    "title" TEXT,
    "excerpt" TEXT,
    "changedSinceLastRun" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlatformSourceCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreshnessCheckRun" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "checkedSources" INTEGER NOT NULL DEFAULT 0,
    "failedSources" INTEGER NOT NULL DEFAULT 0,
    "blockedSources" INTEGER NOT NULL DEFAULT 0,
    "changedSources" INTEGER NOT NULL DEFAULT 0,
    "resultJson" JSONB,
    "error" TEXT,

    CONSTRAINT "FreshnessCheckRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubInstallation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "githubInstallationId" TEXT NOT NULL,
    "accountLogin" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,

    CONSTRAINT "GitHubInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedProject" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "installationId" TEXT,
    "githubRepositoryId" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "htmlUrl" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "defaultBranch" TEXT NOT NULL,
    "description" TEXT,
    "primaryLanguage" TEXT,
    "detectedStack" JSONB NOT NULL,
    "analysisJson" JSONB NOT NULL,
    "recommendationJson" JSONB NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkedProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedComparison_createdAt_idx" ON "SavedComparison"("createdAt");

-- CreateIndex
CREATE INDEX "ApiRateLimitBucket_route_identifier_idx" ON "ApiRateLimitBucket"("route", "identifier");

-- CreateIndex
CREATE INDEX "ApiRateLimitBucket_updatedAt_idx" ON "ApiRateLimitBucket"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApiRateLimitBucket_route_identifier_windowStart_key" ON "ApiRateLimitBucket"("route", "identifier", "windowStart");

-- CreateIndex
CREATE INDEX "PlatformSourceCheck_platformSlug_idx" ON "PlatformSourceCheck"("platformSlug");

-- CreateIndex
CREATE INDEX "PlatformSourceCheck_lastCheckedAt_idx" ON "PlatformSourceCheck"("lastCheckedAt");

-- CreateIndex
CREATE INDEX "PlatformSourceCheck_status_idx" ON "PlatformSourceCheck"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformSourceCheck_platformSlug_sourceUrl_key" ON "PlatformSourceCheck"("platformSlug", "sourceUrl");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubInstallation_githubInstallationId_key" ON "GitHubInstallation"("githubInstallationId");

-- CreateIndex
CREATE INDEX "GitHubInstallation_userId_idx" ON "GitHubInstallation"("userId");

-- CreateIndex
CREATE INDEX "GitHubInstallation_userId_updatedAt_idx" ON "GitHubInstallation"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "LinkedProject_userId_idx" ON "LinkedProject"("userId");

-- CreateIndex
CREATE INDEX "LinkedProject_userId_updatedAt_idx" ON "LinkedProject"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "LinkedProject_installationId_idx" ON "LinkedProject"("installationId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedProject_userId_githubRepositoryId_key" ON "LinkedProject"("userId", "githubRepositoryId");

-- AddForeignKey
ALTER TABLE "LinkedProject" ADD CONSTRAINT "LinkedProject_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "GitHubInstallation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
