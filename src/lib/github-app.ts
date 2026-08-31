import { createHmac, createSign, timingSafeEqual } from "node:crypto";

const GITHUB_API = "https://api.github.com";
const TOKEN_TTL_SECONDS = 9 * 60;
const STATE_TTL_SECONDS = 10 * 60;

type GitHubInstallation = {
  id: number;
  account: { login: string; type: string } | null;
};

export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  language: string | null;
};

export function hasGitHubAppConfiguration() {
  return Boolean(
    process.env.GITHUB_APP_ID &&
      process.env.GITHUB_APP_PRIVATE_KEY &&
      process.env.GITHUB_APP_STATE_SECRET &&
      process.env.NEXT_PUBLIC_GITHUB_APP_SLUG,
  );
}

export function getGitHubInstallUrl(userId: string) {
  const slug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
  if (!slug || !/^[A-Za-z0-9-]+$/.test(slug)) throw new Error("GitHub App slug is not configured.");
  const state = createInstallState(userId);
  return `https://github.com/apps/${slug}/installations/new?state=${encodeURIComponent(state)}`;
}

export function createInstallState(userId: string, now = Math.floor(Date.now() / 1000)) {
  const secret = process.env.GITHUB_APP_STATE_SECRET;
  if (!secret) throw new Error("GitHub App state secret is not configured.");
  const payload = base64Url(JSON.stringify({ userId, exp: now + STATE_TTL_SECONDS }));
  return `${payload}.${signState(payload, secret)}`;
}

export function verifyInstallState(state: string, expectedUserId: string, now = Math.floor(Date.now() / 1000)) {
  const secret = process.env.GITHUB_APP_STATE_SECRET;
  if (!secret) return false;
  const [payload, signature, extra] = state.split(".");
  if (!payload || !signature || extra) return false;
  const expected = signState(payload, secret);
  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { userId?: unknown; exp?: unknown };
    return parsed.userId === expectedUserId && typeof parsed.exp === "number" && parsed.exp >= now;
  } catch {
    return false;
  }
}

export async function getInstallation(installationId: string) {
  return githubRequest<GitHubInstallation>(`/app/installations/${encodeURIComponent(installationId)}`, {
    token: createAppJwt(),
  });
}

export async function listInstallationRepositories(installationId: string) {
  const token = await createInstallationToken(installationId);
  const response = await githubRequest<{ repositories: GitHubRepository[] }>("/installation/repositories?per_page=100", { token });
  return response.repositories;
}

export async function inspectRepository(installationId: string | null, repository: GitHubRepository) {
  const token = installationId ? await createInstallationToken(installationId) : null;
  const branch = encodeURIComponent(repository.default_branch);
  const tree = await githubRequest<{ tree?: Array<{ path?: string; type?: string }>; truncated?: boolean }>(
    `/repos/${repository.full_name}/git/trees/${branch}?recursive=1`,
    { token },
  );
  const paths = (tree.tree ?? []).filter((item) => item.type === "blob" && typeof item.path === "string").map((item) => item.path as string);
  const wanted = ["package.json", "requirements.txt", "pyproject.toml", "Dockerfile", "go.mod", "Cargo.toml"];
  const files: Record<string, string> = {};

  await Promise.all(
    wanted.filter((path) => paths.includes(path)).map(async (path) => {
      const file = await githubRequest<{ content?: string; encoding?: string }>(
        `/repos/${repository.full_name}/contents/${encodeURIComponent(path)}?ref=${branch}`,
        { token },
      );
      if (file.encoding === "base64" && file.content) files[path] = Buffer.from(file.content, "base64").toString("utf8").slice(0, 100_000);
    }),
  );

  return { paths: paths.slice(0, 10_000), files, truncated: Boolean(tree.truncated) };
}

export async function getPublicRepository(owner: string, name: string) {
  const repository = await githubRequest<GitHubRepository>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`, { token: null });
  if (repository.private) throw new Error("Private repositories require the ShipCheap GitHub App.");
  return repository;
}

async function createInstallationToken(installationId: string) {
  const result = await githubRequest<{ token: string }>(`/app/installations/${encodeURIComponent(installationId)}/access_tokens`, {
    token: createAppJwt(),
    method: "POST",
  });
  return result.token;
}

function createAppJwt(now = Math.floor(Date.now() / 1000)) {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!appId || !privateKey) throw new Error("GitHub App credentials are not configured.");
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({ iat: now - 60, exp: now + TOKEN_TTL_SECONDS, iss: appId }));
  const unsigned = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${signer.sign(privateKey, "base64url")}`;
}

async function githubRequest<T>(path: string, { token, method = "GET" }: { token: string | null; method?: "GET" | "POST" }) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "ShipCheap",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const requestId = response.headers.get("x-github-request-id");
    throw new Error(`GitHub request failed (${response.status}${requestId ? `, ${requestId}` : ""}).`);
  }
  return (await response.json()) as T;
}

function signState(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}
