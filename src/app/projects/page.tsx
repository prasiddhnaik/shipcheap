import { auth } from "@clerk/nextjs/server";
import { AppChrome } from "@/components/AppChrome";
import { ProjectsClient } from "@/components/ProjectsClient";
import { hasGitHubAppConfiguration } from "@/lib/github-app";
import { prisma } from "@/lib/prisma";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { userId } = await auth.protect();
  const [projects, query] = await Promise.all([
    prisma.linkedProject.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }),
    searchParams,
  ]);

  return (
    <AppChrome active="projects">
      <ProjectsClient
        githubAppConfigured={hasGitHubAppConfiguration()}
        notice={query.connected ? "GitHub connected. Choose a repository below." : null}
        errorCode={query.error ?? null}
        initialProjects={projects.map((project) => ({
          id: project.id,
          fullName: project.fullName,
          htmlUrl: project.htmlUrl,
          isPrivate: project.isPrivate,
          description: project.description,
          primaryLanguage: project.primaryLanguage,
          detectedStack: Array.isArray(project.detectedStack) ? project.detectedStack.filter((item): item is string => typeof item === "string") : [],
          recommendations: parseRecommendations(project.recommendationJson),
          lastSyncedAt: project.lastSyncedAt.toISOString(),
        }))}
      />
    </AppChrome>
  );
}

function parseRecommendations(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    if (typeof record.platformSlug !== "string" || typeof record.platformName !== "string" || typeof record.score !== "number") return [];
    return [{ platformSlug: record.platformSlug, platformName: record.platformName, score: record.score }];
  });
}
