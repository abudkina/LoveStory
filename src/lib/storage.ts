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

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(encoded: string): string {
  let normalized = encoded.replace(/ /g, "+").replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  if (pad) normalized += "=".repeat(4 - pad);
  return atob(normalized);
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

export function encodeStoryForShare(story: StoredStory): string {
  const payload = {
    t: story.title,
    p: story.partnerNames,
    s: slimStatsForShare(story.stats),
    h: story.highlights,
    tl: story.timeline,
    q: story.quotes,
    f: story.facts,
    c: story.createdAt,
  };
  return toBase64Url(encodeURIComponent(JSON.stringify(payload)));
}

export function buildShareUrl(story: StoredStory, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/share?d=${encodeStoryForShare(story)}`;
}

export function decodeStoryFromShare(encoded: string): Partial<StoredStory> | null {
  try {
    const payload = JSON.parse(decodeURIComponent(fromBase64Url(encoded)));
    return {
      title: payload.t,
      partnerNames: payload.p,
      stats: payload.s,
      highlights: payload.h ?? [],
      timeline: payload.tl ?? [],
      quotes: payload.q ?? [],
      facts: payload.f ?? [],
      photos: payload.ph ?? [],
      createdAt: payload.c,
      id: "shared",
      userId: "shared",
      shareId: "shared",
    };
  } catch {
    return null;
  }
}
