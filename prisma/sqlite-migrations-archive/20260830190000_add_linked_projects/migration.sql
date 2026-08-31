-- CreateTable
CREATE TABLE "GitHubInstallation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "githubInstallationId" TEXT NOT NULL,
    "accountLogin" TEXT NOT NULL,
    "accountType" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "LinkedProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
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
    "lastSyncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LinkedProject_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "GitHubInstallation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GitHubInstallation_githubInstallationId_key" ON "GitHubInstallation"("githubInstallationId");
CREATE INDEX "GitHubInstallation_userId_idx" ON "GitHubInstallation"("userId");
CREATE INDEX "GitHubInstallation_userId_updatedAt_idx" ON "GitHubInstallation"("userId", "updatedAt");
CREATE UNIQUE INDEX "LinkedProject_userId_githubRepositoryId_key" ON "LinkedProject"("userId", "githubRepositoryId");
CREATE INDEX "LinkedProject_userId_idx" ON "LinkedProject"("userId");
CREATE INDEX "LinkedProject_userId_updatedAt_idx" ON "LinkedProject"("userId", "updatedAt");
CREATE INDEX "LinkedProject_installationId_idx" ON "LinkedProject"("installationId");
