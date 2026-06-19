const PRODUCTION_BASE = "/LoveStory";

export function getBasePath(): string {
  const env = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (env) return env;
  if (typeof window !== "undefined" && window.location.hostname.endsWith("github.io")) {
    if (window.location.pathname.startsWith(PRODUCTION_BASE)) return PRODUCTION_BASE;
  }
  return "";
}

export function withBasePath(path: string): string {
  const base = getBasePath();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
