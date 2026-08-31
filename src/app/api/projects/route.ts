import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getPublicRepository, inspectRepository, listInstallationRepositories } from "@/lib/github-app";
import { analyzeRepositoryFiles, parseGitHubRepositoryUrl, recommendForRepository } from "@/lib/github-project";
import { prisma } from "@/lib/prisma";

const MAX_BODY_BYTES = 4_000;

type LinkProjectBody = {
  repositoryUrl?: unknown;
  installationId?: unknown;
  repositoryId?: unknown;
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const projects = await prisma.linkedProject.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) return NextResponse.json({ error: "Payload is too large." }, { status: 413 });

  let body: LinkProjectBody;
  try {
    body = (await request.json()) as LinkProjectBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    let installationRecord: Awaited<ReturnType<typeof prisma.gitHubInstallation.findFirst>> = null;
    let repository;
    if (typeof body.installationId === "string" && typeof body.repositoryId === "string") {
      installationRecord = await prisma.gitHubInstallation.findFirst({ where: { id: body.installationId, userId } });
      if (!installationRecord) return NextResponse.json({ error: "GitHub installation not found." }, { status: 404 });
      const repositories = await listInstallationRepositories(installationRecord.githubInstallationId);
      repository = repositories.find((item) => String(item.id) === body.repositoryId);
      if (!repository) return NextResponse.json({ error: "Repository is not available to this installation." }, { status: 404 });
    } else if (typeof body.repositoryUrl === "string") {
      const parsed = parseGitHubRepositoryUrl(body.repositoryUrl);
      if (!parsed) return NextResponse.json({ error: "Enter a valid GitHub repository URL." }, { status: 400 });
      repository = await getPublicRepository(parsed.owner, parsed.name);
    } else {
      return NextResponse.json({ error: "Choose a GitHub repository." }, { status: 400 });
    }

    const inspection = await inspectRepository(installationRecord?.githubInstallationId ?? null, repository);
    const analysis = analyzeRepositoryFiles(inspection);
    const recommendations = recommendForRepository(analysis);
    const project = await prisma.linkedProject.upsert({
      where: { userId_githubRepositoryId: { userId, githubRepositoryId: String(repository.id) } },
      create: {
        userId,
        installationId: installationRecord?.id,
        githubRepositoryId: String(repository.id),
        owner: repository.full_name.split("/")[0] ?? "",
        name: repository.name,
        fullName: repository.full_name,
        htmlUrl: repository.html_url,
        isPrivate: repository.private,
        defaultBranch: repository.default_branch,
        description: repository.description,
        primaryLanguage: repository.language,
        detectedStack: analysis.stack,
        analysisJson: { signals: analysis.signals, input: analysis.input, treeTruncated: inspection.truncated },
        recommendationJson: recommendations,
      },
      update: {
        installationId: installationRecord?.id,
        description: repository.description,
        primaryLanguage: repository.language,
        detectedStack: analysis.stack,
        analysisJson: { signals: analysis.signals, input: analysis.input, treeTruncated: inspection.truncated },
        recommendationJson: recommendations,
        lastSyncedAt: new Date(),
      },
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not link this repository." }, { status: 502 });
  }
}
