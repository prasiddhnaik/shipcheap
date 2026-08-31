import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getInstallation, verifyInstallState } from "@/lib/github-app";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const state = url.searchParams.get("state") ?? "";
  const installationId = url.searchParams.get("installation_id") ?? "";
  if (!/^\d+$/.test(installationId) || !verifyInstallState(state, userId)) {
    return NextResponse.redirect(new URL("/projects?error=invalid-installation", request.url));
  }

  try {
    const [installation, user] = await Promise.all([getInstallation(installationId), currentUser()]);
    const githubAccount = user?.externalAccounts.find((account) => account.provider === "oauth_github");
    const accountLogin = installation.account?.login;
    if (!githubAccount?.username || !accountLogin || installation.account?.type !== "User") {
      return NextResponse.redirect(new URL("/projects?error=github-account-required", request.url));
    }
    if (githubAccount.username.toLowerCase() !== accountLogin.toLowerCase()) {
      return NextResponse.redirect(new URL("/projects?error=github-account-mismatch", request.url));
    }

    const existing = await prisma.gitHubInstallation.findUnique({ where: { githubInstallationId: installationId } });
    if (existing && existing.userId !== userId) {
      return NextResponse.redirect(new URL("/projects?error=installation-already-linked", request.url));
    }

    await prisma.gitHubInstallation.upsert({
      where: { githubInstallationId: installationId },
      create: {
        userId,
        githubInstallationId: installationId,
        accountLogin,
        accountType: installation.account.type,
      },
      update: { accountLogin, accountType: installation.account.type },
    });
    return NextResponse.redirect(new URL("/projects?connected=1", request.url));
  } catch {
    return NextResponse.redirect(new URL("/projects?error=github-connection-failed", request.url));
  }
}
