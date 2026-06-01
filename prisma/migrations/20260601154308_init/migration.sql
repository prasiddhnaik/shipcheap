-- CreateTable
CREATE TABLE "SavedComparison" (
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
