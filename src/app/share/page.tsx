"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import LoveStoryView from "@/components/LoveStoryView";
import { decodeStoryFromShare } from "@/lib/storage";
import { StoredStory } from "@/types";

function ShareContent() {
  const searchParams = useSearchParams();
  const [story, setStory] = useState<StoredStory | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data =
        searchParams.get("d") ??
        (typeof window !== "undefined"
          ? new URLSearchParams(window.location.hash.slice(1)).get("d")
          : null);

      if (!data) {
        setError(true);
        return;
      }

      const decoded = await decodeStoryFromShare(data);
      if (!decoded || !decoded.stats) {
        setError(true);
        return;
      }

      setStory(decoded as StoredStory);
    };

    void load();
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-4">
        <div className="text-5xl mb-4">💔</div>
        <h1 className="font-display text-2xl text-rose-800 mb-2">
          История не найдена
        </h1>
        <p className="text-rose-400 mb-6">Ссылка повреждена или устарела</p>
        <Link href="/" className="btn-primary px-6 py-3 rounded-full">
          На главную
        </Link>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen share-story-page flex items-center justify-center">
        <div className="text-4xl animate-pulse">💕</div>
      </div>
    );
  }

  return (
    <>
      <div className="no-print fixed top-3 right-3 sm:top-4 sm:right-4 z-50 safe-top">
        <Link
          href="/"
          className="btn-primary px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm shadow-sm"
        >
          Создать свою ✨
        </Link>
      </div>
      <LoveStoryView story={story} showShare={true} />
    </>
  );
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen share-story-page flex items-center justify-center">
          <div className="text-4xl animate-pulse">💕</div>
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  );
}
