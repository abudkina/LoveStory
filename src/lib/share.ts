import { StoredStory } from "@/types";
import { buildShareUrl } from "./storage";
import { buildStoryHtml } from "./storyHtmlTemplate";

export function getStoryShareText(story: StoredStory): string {
  const [n1, n2] = story.partnerNames;
  return `${story.title} 💕 ${n1} & ${n2} — ${story.stats.totalMessages} сообщений за ${story.stats.daysTogether} дней`;
}

export function openTelegramShare(text: string, url: string): void {
  window.open(
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    "_blank",
    "noopener,noreferrer"
  );
}

export function openWhatsAppShare(text: string, url: string): void {
  window.open(
    `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
    "_blank",
    "noopener,noreferrer"
  );
}

function safeCanShare(data: ShareData): boolean {
  if (!navigator.share) return false;
  if (!navigator.canShare) return true;
  try {
    return navigator.canShare(data);
  } catch {
    return false;
  }
}

function storyHtmlFile(story: StoredStory): File {
  const html = buildStoryHtml(story);
  const name = `${story.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, "_") || "love_story"}.html`;
  return new File([html], name, { type: "text/html" });
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text || typeof document === "undefined") return false;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fallback below */
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export type ShareResult = "shared" | "aborted" | "fallback";

/** Opens system share sheet with installed apps. */
export function shareStory(story: StoredStory, onResult?: (result: ShareResult) => void): void {
  const text = getStoryShareText(story);
  const url = buildShareUrl(story);
  const title = story.title;

  if (!navigator.share) {
    openTelegramShare(text, url);
    onResult?.("fallback");
    return;
  }

  const file = storyHtmlFile(story);
  const attempts: ShareData[] = [
    { title, text, files: [file] },
    { title, text: `${text}\n${url}` },
    { title, url },
  ];

  const runAttempts = (index: number): void => {
    if (index >= attempts.length) {
      openTelegramShare(text, url);
      onResult?.("fallback");
      return;
    }

    const data = attempts[index];
    if (!safeCanShare(data)) {
      runAttempts(index + 1);
      return;
    }

    navigator
      .share(data)
      .then(() => onResult?.("shared"))
      .catch((err: Error) => {
        if (err?.name === "AbortError") {
          onResult?.("aborted");
          return;
        }
        runAttempts(index + 1);
      });
  };

  runAttempts(0);
}
