"use client";

import { useState } from "react";
import { shareStory } from "@/lib/share";
import { StoredStory } from "@/types";

interface MobileShareBarProps {
  story: StoredStory;
}

export default function MobileShareBar({ story }: MobileShareBarProps) {
  const [opened, setOpened] = useState(false);

  const handleShare = () => {
    shareStory(story, (result) => {
      if (result === "fallback") {
        setOpened(true);
        setTimeout(() => setOpened(false), 2000);
      }
    });
  };

  return (
    <div className="mobile-share-bar no-print">
      <div className="flex gap-2 max-w-lg mx-auto">
        <button
          onClick={handleShare}
          className="btn-primary flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
        >
          <span>📤</span>
          {opened ? "Открыто!" : "Поделиться"}
        </button>
        <a
          href="#share-full"
          className="btn-secondary-light px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center"
        >
          Ещё
        </a>
      </div>
    </div>
  );
}
