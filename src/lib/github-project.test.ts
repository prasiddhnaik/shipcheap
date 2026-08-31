import assert from "node:assert/strict";
import test from "node:test";
import { analyzeRepositoryFiles, parseGitHubRepositoryUrl } from "./github-project";

test("parses canonical GitHub repository URLs", () => {
  assert.deepEqual(parseGitHubRepositoryUrl("https://github.com/acme/api.git"), {
    owner: "acme",
    name: "api",
  });
  assert.equal(parseGitHubRepositoryUrl("https://example.com/acme/api"), null);
  assert.equal(parseGitHubRepositoryUrl("https://github.com/acme"), null);
});

test("detects a Dockerized FastAPI project with Postgres", () => {
  const analysis = analyzeRepositoryFiles({
    paths: ["Dockerfile", "pyproject.toml", "app/main.py"],
    files: {
      "pyproject.toml": '[project]\ndependencies = ["fastapi", "uvicorn", "psycopg"]',
      Dockerfile: "FROM python:3.13-slim",
    },
  });

  assert.equal(analysis.input.appType, "fastapi");
  assert.equal(analysis.input.database, "postgres");
  assert.equal(analysis.input.alwaysOn, true);
  assert.deepEqual(analysis.stack, ["Python", "FastAPI", "Docker", "Postgres"]);
});

test("detects a Next.js project without inventing a database", () => {
  const analysis = analyzeRepositoryFiles({
    paths: ["package.json", "src/app/page.tsx"],
    files: {
      "package.json": JSON.stringify({ dependencies: { next: "16.2.6", react: "19.2.4" } }),
    },
  });

  assert.equal(analysis.input.appType, "node");
  assert.equal(analysis.input.database, "none");
  assert.deepEqual(analysis.stack, ["Node.js", "Next.js"]);
});
