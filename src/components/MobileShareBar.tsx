"use client";

import { useState } from "react";
import { buildShareUrl } from "@/lib/storage";
import { StoredStory } from "@/types";

interface MobileShareBarProps {
  story: StoredStory;
}

export default function MobileShareBar({ story }: MobileShareBarProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => buildShareUrl(story);

  const getShareText = () => {
    const [n1, n2] = story.partnerNames;
    return `${story.title} 💕 ${n1} & ${n2}`;
  };

  const handleShare = async () => {
    const url = getShareUrl();
    if (!url) return;

    if (navigator.share) {
      try {
        await navigator.share({ title: story.title, url });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${getShareText()}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mobile-share-bar no-print">
      <div className="flex gap-2 max-w-lg mx-auto">
        <button
          onClick={handleShare}
          className="btn-primary flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
        >
          <span>📤</span>
          {copied ? "Скопировано!" : "Поделиться"}
        </button>
        <a
          href="#share-full"
          className="btn-secondary px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center"
        >
          Ещё
        </a>
      </div>
    </div>
  );
}
