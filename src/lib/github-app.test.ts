import assert from "node:assert/strict";
import test from "node:test";
import { createInstallState, verifyInstallState } from "./github-app";

test("GitHub install state is signed, user-bound, and expiring", () => {
  process.env.GITHUB_APP_STATE_SECRET = "test-only-secret";
  const state = createInstallState("user_123", 1_000);
  assert.equal(verifyInstallState(state, "user_123", 1_001), true);
  assert.equal(verifyInstallState(state, "user_other", 1_001), false);
  assert.equal(verifyInstallState(state, "user_123", 2_000), false);
  assert.equal(verifyInstallState(`${state}x`, "user_123", 1_001), false);
});
