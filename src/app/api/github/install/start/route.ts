import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getGitHubInstallUrl, hasGitHubAppConfiguration } from "@/lib/github-app";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasGitHubAppConfiguration()) {
    return NextResponse.redirect(new URL("/projects?error=github-app-not-configured", request.url));
  }
  return NextResponse.redirect(getGitHubInstallUrl(userId));
}
