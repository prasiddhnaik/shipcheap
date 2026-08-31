"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, ExternalLink, FolderGit2, GitBranch, LockKeyhole, RefreshCw, Trash2 } from "lucide-react";

type Project = {
  id: string;
  fullName: string;
  htmlUrl: string;
  isPrivate: boolean;
  description: string | null;
  primaryLanguage: string | null;
  detectedStack: string[];
  recommendations: Array<{ platformSlug: string; platformName: string; score: number }>;
  lastSyncedAt: string;
};

type RepositoryGroup = {
  installationId: string;
  accountLogin: string;
  repositories: Array<{ id: string; fullName: string; isPrivate: boolean; description: string | null; language: string | null }>;
};

const errorMessages: Record<string, string> = {
  "github-app-not-configured": "Private repository linking needs the GitHub App environment settings.",
  "invalid-installation": "That GitHub installation link expired or was invalid. Please try again.",
  "github-account-required": "Sign in with the same personal GitHub account that installs the ShipCheap GitHub App.",
  "github-account-mismatch": "The installed GitHub account does not match your signed-in GitHub identity.",
  "installation-already-linked": "That GitHub installation is already linked to another ShipCheap account.",
  "github-connection-failed": "ShipCheap could not verify that GitHub installation.",
};

export function ProjectsClient({
  initialProjects,
  githubAppConfigured,
  notice,
  errorCode,
}: {
  initialProjects: Project[];
  githubAppConfigured: boolean;
  notice: string | null;
  errorCode: string | null;
}) {
  const router = useRouter();
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [groups, setGroups] = useState<RepositoryGroup[]>([]);
  const [loadingRepositories, setLoadingRepositories] = useState(githubAppConfigured);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState(errorCode ? errorMessages[errorCode] ?? "GitHub connection failed." : null);

  useEffect(() => {
    if (!githubAppConfigured) return;
    let cancelled = false;
    fetch("/api/github/repositories")
      .then(async (response) => {
        const data = (await response.json()) as { groups?: RepositoryGroup[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Could not load repositories.");
        if (!cancelled) setGroups(data.groups ?? []);
      })
      .catch((reason: unknown) => !cancelled && setError(reason instanceof Error ? reason.message : "Could not load repositories."))
      .finally(() => !cancelled && setLoadingRepositories(false));
    return () => {
      cancelled = true;
    };
  }, [githubAppConfigured]);

  async function linkProject(payload: { repositoryUrl: string } | { installationId: string; repositoryId: string }, busy: string) {
    setBusyKey(busy);
    setError(null);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not link repository.");
      setRepositoryUrl("");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not link repository.");
    } finally {
      setBusyKey(null);
    }
  }

  async function removeProject(id: string) {
    setBusyKey(id);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not unlink project.");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not unlink project.");
    } finally {
      setBusyKey(null);
    }
  }

  const linkedNames = new Set(initialProjects.map((project) => project.fullName));

  return (
    <div className="mx-auto max-w-[1260px] px-4 py-6 sm:px-6 lg:px-10">
      <section className="brutal-panel p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <span className="brutal-badge bg-[var(--green)] px-3 py-1 text-xs uppercase">Account workspace</span>
            <h1 className="mt-4 text-4xl font-black leading-none sm:text-6xl">Your projects, analyzed for safer hosting.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
              Link a GitHub repository. ShipCheap reads dependency and configuration files, detects the stack, and builds hosting recommendations around the real project.
            </p>
          </div>
          <a href="/api/github/install/start" className="brutal-button brutal-button-primary px-4 py-3 text-sm" aria-disabled={!githubAppConfigured}>
            <GitBranch size={17} />
            {githubAppConfigured ? "Connect private repositories" : "GitHub App setup required"}
          </a>
        </div>
        <div className="mt-5 border-[3px] border-[var(--line)] bg-[var(--paper)] p-4 text-sm font-bold">
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 shrink-0 text-[var(--accent)]" size={18} />
            <p>Read-only by design. ShipCheap requests repository metadata and contents only; it cannot push code, edit settings, or deploy.</p>
          </div>
        </div>
      </section>

      {(notice || error) && (
        <div className={`mt-5 border-[3px] border-[var(--line)] p-4 text-sm font-black ${error ? "bg-[#ffddd7]" : "bg-[var(--green)]"}`}>
          {error ?? notice}
        </div>
      )}

      <section className="mt-5 grid gap-5 xl:grid-cols-[360px_1fr]">
        <aside className="brutal-panel h-fit p-5">
          <h2 className="text-xl font-black">Link a public repository</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">No GitHub App installation is needed for public repositories.</p>
          <form
            className="mt-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (repositoryUrl.trim()) void linkProject({ repositoryUrl: repositoryUrl.trim() }, "public");
            }}
          >
            <label className="brutal-label" htmlFor="repository-url">GitHub URL</label>
            <input
              id="repository-url"
              className="brutal-input mt-2 w-full px-3 text-sm"
              placeholder="https://github.com/owner/repo"
              type="url"
              required
              value={repositoryUrl}
              onChange={(event) => setRepositoryUrl(event.target.value)}
            />
            <button disabled={busyKey === "public"} className="brutal-button brutal-button-yellow mt-3 w-full px-4 py-2.5 text-sm disabled:opacity-60">
              {busyKey === "public" ? <RefreshCw className="animate-spin" size={16} /> : <FolderGit2 size={16} />}
              Analyze repository
            </button>
          </form>

          <div className="my-5 border-t-[3px] border-[var(--line)]" />
          <h2 className="text-xl font-black">Selected private repositories</h2>
          {loadingRepositories ? (
            <p className="mt-3 flex items-center gap-2 text-sm font-bold text-[var(--muted)]"><RefreshCw className="animate-spin" size={15} /> Loading GitHub…</p>
          ) : groups.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Connect the GitHub App to select private repositories.</p>
          ) : (
            <div className="mt-3 space-y-4">
              {groups.map((group) => (
                <div key={group.installationId}>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">{group.accountLogin}</p>
                  <div className="mt-2 space-y-2">
                    {group.repositories.map((repository) => (
                      <button
                        key={repository.id}
                        disabled={linkedNames.has(repository.fullName) || busyKey === repository.id}
                        onClick={() => void linkProject({ installationId: group.installationId, repositoryId: repository.id }, repository.id)}
                        className="flex w-full items-center justify-between gap-3 border-2 border-[var(--line)] bg-white px-3 py-2 text-left text-sm font-black disabled:opacity-50"
                      >
                        <span className="min-w-0 truncate">{repository.fullName}</span>
                        {linkedNames.has(repository.fullName) ? <CheckCircle2 size={16} /> : repository.isPrivate ? <LockKeyhole size={16} /> : <ArrowRight size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        <div>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">Linked projects</h2>
              <p className="mt-1 text-sm font-bold text-[var(--muted)]">{initialProjects.length} project{initialProjects.length === 1 ? "" : "s"} in your private workspace</p>
            </div>
          </div>
          {initialProjects.length === 0 ? (
            <div className="brutal-panel grid min-h-64 place-items-center p-8 text-center">
              <div>
                <FolderGit2 className="mx-auto text-[var(--accent)]" size={42} />
                <h3 className="mt-4 text-xl font-black">No linked projects yet</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">Add a public URL or connect GitHub to start a project-specific analysis.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {initialProjects.map((project) => (
                <article key={project.id} className="brutal-panel p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black">{project.fullName}</h3>
                        {project.isPrivate && <span className="brutal-badge bg-[var(--yellow)] px-2 py-1 text-[10px] uppercase">Private</span>}
                      </div>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{project.description ?? "No repository description."}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={project.htmlUrl} target="_blank" rel="noreferrer" className="brutal-button px-3 py-2 text-sm" aria-label={`Open ${project.fullName} on GitHub`}>
                        <ExternalLink size={15} />
                      </a>
                      <button onClick={() => void removeProject(project.id)} disabled={busyKey === project.id} className="brutal-button px-3 py-2 text-sm" aria-label={`Unlink ${project.fullName}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(project.detectedStack.length ? project.detectedStack : [project.primaryLanguage ?? "Stack not detected"]).map((item) => (
                      <span key={item} className="brutal-badge bg-[var(--paper)] px-2 py-1 text-xs">{item}</span>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {project.recommendations.map((recommendation, index) => (
                      <Link key={recommendation.platformSlug} href={`/platforms/${recommendation.platformSlug}`} className={`border-[3px] border-[var(--line)] p-3 transition hover:-translate-y-0.5 ${index === 0 ? "bg-[var(--green)]" : "bg-white"}`}>
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">#{index + 1} match</p>
                        <div className="mt-2 flex items-end justify-between gap-3">
                          <p className="text-lg font-black">{recommendation.platformName}</p>
                          <p className="text-sm font-black">{recommendation.score} pts</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <p className="mt-4 text-xs font-bold text-[var(--muted)]">Analyzed {new Date(project.lastSyncedAt).toLocaleString()}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
