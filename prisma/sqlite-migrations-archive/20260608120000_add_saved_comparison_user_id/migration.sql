-- Add user ownership to saved comparison snapshots.
-- Existing local rows become legacy-unowned rows and are hidden by user-scoped queries.
ALTER TABLE "SavedComparison" ADD COLUMN "userId" TEXT NOT NULL DEFAULT '__legacy_unowned__';

CREATE INDEX "SavedComparison_userId_idx" ON "SavedComparison"("userId");
CREATE INDEX "SavedComparison_userId_createdAt_idx" ON "SavedComparison"("userId", "createdAt");
