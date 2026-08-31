-- Persist fixed-window API rate limit counters across server instances.
CREATE TABLE "ApiRateLimitBucket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "route" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "windowStart" DATETIME NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX "ApiRateLimitBucket_route_identifier_windowStart_key" ON "ApiRateLimitBucket"("route", "identifier", "windowStart");
CREATE INDEX "ApiRateLimitBucket_route_identifier_idx" ON "ApiRateLimitBucket"("route", "identifier");
CREATE INDEX "ApiRateLimitBucket_updatedAt_idx" ON "ApiRateLimitBucket"("updatedAt");
