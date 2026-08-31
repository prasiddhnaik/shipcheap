import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listInstallationRepositories } from "@/lib/github-app";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const installations = await prisma.gitHubInstallation.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
  try {
    const groups = await Promise.all(
      installations.map(async (installation) => ({
        installationId: installation.id,
        accountLogin: installation.accountLogin,
        repositories: (await listInstallationRepositories(installation.githubInstallationId)).map((repository) => ({
          id: String(repository.id),
          fullName: repository.full_name,
          isPrivate: repository.private,
          description: repository.description,
          language: repository.language,
        })),
      })),
    );
    return NextResponse.json({ groups });
  } catch {
    return NextResponse.json({ error: "Could not load GitHub repositories." }, { status: 502 });
  }
}
