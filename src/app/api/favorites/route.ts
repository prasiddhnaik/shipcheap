import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPlatformBySlug } from "@/data/platforms";
import { prisma } from "@/lib/prisma";

const MAX_FAVORITE_BODY_BYTES = 4_000;
const MAX_NOTE_LENGTH = 280;
const MAX_FAVORITES_PER_USER = 40;
const FAVORITE_RATE_LIMIT_ROUTE = "api:favorites";
const FAVORITE_RATE_LIMIT_WINDOW_MS = 60_000;
const FAVORITE_RATE_LIMIT_MAX_REQUESTS = 30;
const RATE_LIMIT_CLEANUP_AFTER_MS = 24 * 60 * 60 * 1000;

class RequestBodyTooLargeError extends Error {}

type FavoriteBody = {
  platformSlug?: unknown;
  note?: unknown;
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to view favorites." }, { status: 401 });
  }

  const favorites = await prisma.favoritePlatform.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    favorites: favorites.map((favorite) => ({
      id: favorite.id,
      platformSlug: favorite.platformSlug,
      note: favorite.note,
      createdAt: favorite.createdAt.toISOString(),
      updatedAt: favorite.updatedAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to save favorites." }, { status: 401 });
  }

  const rateLimit = await checkFavoriteRateLimit(`user:${userId}`);
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: "Too many favorite updates. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  let body: FavoriteBody;
  try {
    body = JSON.parse(await readLimitedBody(request, MAX_FAVORITE_BODY_BYTES)) as FavoriteBody;
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ error: "Favorite payload is too large." }, { status: 413 });
    }
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const platformSlug = typeof body.platformSlug === "string" ? body.platformSlug.trim() : "";
  const platform = getPlatformBySlug(platformSlug);
  if (!platform) {
    return NextResponse.json({ error: "Unknown platform." }, { status: 400 });
  }

  const note = normalizeNote(body.note);
  if (note === null) {
    return NextResponse.json({ error: "Note must be a short text note." }, { status: 400 });
  }

  const existing = await prisma.favoritePlatform.findUnique({
    where: {
      userId_platformSlug: {
        userId,
        platformSlug: platform.slug,
      },
    },
  });

  if (!existing) {
    const count = await prisma.favoritePlatform.count({ where: { userId } });
    if (count >= MAX_FAVORITES_PER_USER) {
      return NextResponse.json({ error: "Favorite limit reached. Remove one before adding another." }, { status: 400 });
    }
  }

  const favorite = await prisma.favoritePlatform.upsert({
    where: {
      userId_platformSlug: {
        userId,
        platformSlug: platform.slug,
      },
    },
    create: {
      userId,
      platformSlug: platform.slug,
      note,
    },
    update: {
      note,
    },
  });

  return NextResponse.json({
    favorite: {
      id: favorite.id,
      platformSlug: favorite.platformSlug,
      note: favorite.note,
      createdAt: favorite.createdAt.toISOString(),
      updatedAt: favorite.updatedAt.toISOString(),
    },
  });
}

export async function PATCH(request: Request) {
  return POST(request);
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to manage favorites." }, { status: 401 });
  }

  const rateLimit = await checkFavoriteRateLimit(`user:${userId}`);
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: "Too many favorite updates. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  let body: FavoriteBody;
  try {
    body = JSON.parse(await readLimitedBody(request, MAX_FAVORITE_BODY_BYTES)) as FavoriteBody;
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ error: "Favorite payload is too large." }, { status: 413 });
    }
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const platformSlug = typeof body.platformSlug === "string" ? body.platformSlug.trim() : "";
  const platform = getPlatformBySlug(platformSlug);
  if (!platform) {
    return NextResponse.json({ error: "Unknown platform." }, { status: 400 });
  }

  await prisma.favoritePlatform.deleteMany({
    where: {
      userId,
      platformSlug: platform.slug,
    },
  });

  return NextResponse.json({ ok: true });
}

function normalizeNote(value: unknown) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, MAX_NOTE_LENGTH);
  return trimmed;
}

async function checkFavoriteRateLimit(identifier: string) {
  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / FAVORITE_RATE_LIMIT_WINDOW_MS) * FAVORITE_RATE_LIMIT_WINDOW_MS);
  const bucket = await prisma.apiRateLimitBucket.upsert({
    where: {
      route_identifier_windowStart: {
        route: FAVORITE_RATE_LIMIT_ROUTE,
        identifier,
        windowStart,
      },
    },
    create: {
      route: FAVORITE_RATE_LIMIT_ROUTE,
      identifier,
      windowStart,
      count: 1,
    },
    update: {
      count: { increment: 1 },
    },
  });

  if (bucket.count === 1) {
    await prisma.apiRateLimitBucket.deleteMany({
      where: {
        route: FAVORITE_RATE_LIMIT_ROUTE,
        updatedAt: { lt: new Date(now.getTime() - RATE_LIMIT_CLEANUP_AFTER_MS) },
      },
    });
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((windowStart.getTime() + FAVORITE_RATE_LIMIT_WINDOW_MS - now.getTime()) / 1000),
  );

  return {
    limited: bucket.count > FAVORITE_RATE_LIMIT_MAX_REQUESTS,
    retryAfterSeconds,
  };
}

async function readLimitedBody(request: Request, maxBytes: number) {
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      throw new RequestBodyTooLargeError();
    }
    chunks.push(value);
  }

  const bodyBytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bodyBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(bodyBytes);
}
