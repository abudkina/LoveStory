"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import LoveStoryView from "@/components/LoveStoryView";
import { getSession } from "@/lib/auth";
import { getStoryById } from "@/lib/storage";
import { StoredStory } from "@/types";

function StoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [story, setStory] = useState<StoredStory | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    setStory(null);

    const id = searchParams.get("id");
    if (!id) {
      router.replace("/dashboard");
      return;
    }

    const session = getSession();
    if (!session) {
      router.replace("/#auth");
      return;
    }

    const found = getStoryById(id);
    if (!found || found.userId !== session.id) {
      router.replace("/dashboard");
      return;
    }

    setStory(found);
    setReady(true);
  }, [searchParams, router]);

  if (!ready || !story) {
    return (
      <div className="min-h-screen share-story-page flex items-center justify-center">
        <div className="text-4xl animate-pulse">💕</div>
      </div>
    );
  }

  return (
    <>
      <div className="no-print fixed top-3 left-3 sm:top-4 sm:left-4 z-50 safe-top">
        <Link
          href="/dashboard"
          className="btn-secondary-light px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm shadow-sm"
        >
          ← Кабинет
        </Link>
      </div>
      <LoveStoryView story={story} />
    </>
  );
}

export default function StoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen share-story-page flex items-center justify-center">
          <div className="text-4xl animate-pulse">💕</div>
        </div>
      }
    >
      <StoryContent />
    </Suspense>
  );
}
