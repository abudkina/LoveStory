import { StoredStory } from "@/types";

const STORIES_KEY = "love_story_stories";

export function getAllStories(): StoredStory[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORIES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getStoryById(id: string): StoredStory | null {
  return getAllStories().find((s) => s.id === id) ?? null;
}

export function getStoryByShareId(shareId: string): StoredStory | null {
  return getAllStories().find((s) => s.shareId === shareId) ?? null;
}

export function saveStory(story: StoredStory): void {
  const stories = getAllStories();
  const index = stories.findIndex((s) => s.id === story.id);
  if (index >= 0) {
    stories[index] = story;
  } else {
    stories.push(story);
  }
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
}

export function getUserStories(userId: string): StoredStory[] {
  return getAllStories().filter((s) => s.userId === userId);
}

export function deleteStory(id: string): void {
  const stories = getAllStories().filter((s) => s.id !== id);
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(encoded: string): Uint8Array {
  let normalized = encoded.replace(/ /g, "+").replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  if (pad) normalized += "=".repeat(4 - pad);
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function utf8ToBase64Url(value: string): string {
  return toBase64Url(new TextEncoder().encode(value));
}

function utf8FromBase64Url(encoded: string): string {
  return new TextDecoder().decode(fromBase64Url(encoded));
}

async function gzipCompress(text: string): Promise<string> {
  const stream = new Blob([new TextEncoder().encode(text)])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));
  const buf = await new Response(stream).arrayBuffer();
  return toBase64Url(new Uint8Array(buf));
}

async function gzipDecompress(encoded: string): Promise<string> {
  const bytes = new Uint8Array(fromBase64Url(encoded));
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  return await new Response(stream).text();
}

function slimStatsForShare(stats: StoredStory["stats"]) {
  return {
    totalMessages: stats.totalMessages,
    daysTogether: stats.daysTogether,
    firstMessageDate: stats.firstMessageDate,
    lastMessageDate: stats.lastMessageDate,
    topWords: stats.topWords,
  };
}

function sharePayload(story: StoredStory) {
  return {
    t: story.title,
    p: story.partnerNames,
    s: slimStatsForShare(story.stats),
    h: story.highlights,
    tl: story.timeline,
    q: story.quotes,
    f: story.facts,
    c: story.createdAt,
  };
}

export async function encodeStoryForShare(story: StoredStory): Promise<string> {
  const json = JSON.stringify(sharePayload(story));
  if (typeof CompressionStream !== "undefined") {
    return `z${await gzipCompress(json)}`;
  }
  return utf8ToBase64Url(json);
}

const DEFAULT_PUBLIC_URL = "https://abudkina.github.io/LoveStory";

function isLocalHostname(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]") return true;
  if (/^10\./.test(hostname)) return true;
  if (/^192\.168\./.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return true;
  return false;
}

export function getShareBase(origin?: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (origin) return `${origin.replace(/\/$/, "")}${basePath}`;

  if (envUrl) return envUrl;

  if (typeof window !== "undefined") {
    const { origin: pageOrigin, hostname } = window.location;
    if (!isLocalHostname(hostname)) {
      return `${pageOrigin.replace(/\/$/, "")}${basePath}`;
    }
  }

  return DEFAULT_PUBLIC_URL;
}

export async function buildShareUrl(story: StoredStory, origin?: string): Promise<string> {
  return `${getShareBase(origin)}/share?d=${await encodeStoryForShare(story)}`;
}

function storyFromPayload(payload: Record<string, unknown>): Partial<StoredStory> {
  return {
    title: payload.t as string,
    partnerNames: payload.p as [string, string],
    stats: payload.s as StoredStory["stats"],
    highlights: (payload.h as StoredStory["highlights"]) ?? [],
    timeline: (payload.tl as StoredStory["timeline"]) ?? [],
    quotes: (payload.q as StoredStory["quotes"]) ?? [],
    facts: (payload.f as StoredStory["facts"]) ?? [],
    photos: (payload.ph as StoredStory["photos"]) ?? [],
    createdAt: payload.c as string,
    id: "shared",
    userId: "shared",
    shareId: "shared",
  };
}

function decodeLegacyShare(encoded: string): Partial<StoredStory> | null {
  try {
    const legacy = decodeURIComponent(
      Array.from(fromBase64Url(encoded), (b) => String.fromCharCode(b)).join("")
    );
    return storyFromPayload(JSON.parse(legacy));
  } catch {
    return null;
  }
}

export async function decodeStoryFromShare(
  encoded: string
): Promise<Partial<StoredStory> | null> {
  try {
    if (encoded.startsWith("z")) {
      const json =
        typeof DecompressionStream !== "undefined"
          ? await gzipDecompress(encoded.slice(1))
          : null;
      if (!json) return decodeLegacyShare(encoded);
      return storyFromPayload(JSON.parse(json));
    }

    try {
      return storyFromPayload(JSON.parse(utf8FromBase64Url(encoded)));
    } catch {
      return decodeLegacyShare(encoded);
    }
  } catch {
    return null;
  }
}
