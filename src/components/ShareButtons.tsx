"use client";

import { useState } from "react";
import { buildShareUrl } from "@/lib/storage";
import { buildStoryHtml } from "@/lib/storyHtmlTemplate";
import { StoredStory } from "@/types";

interface ShareButtonsProps {
  story: StoredStory;
}

export default function ShareButtons({ story }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  const getShareUrl = () => buildShareUrl(story);

  const getShareText = () => {
    const [n1, n2] = story.partnerNames;
    return `${story.title} 💕 ${n1} & ${n2} — ${story.stats.totalMessages} сообщений за ${story.stats.daysTogether} дней`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setShareStatus("Не удалось скопировать");
    }
  };

  const handleNativeShare = async () => {
    const url = getShareUrl();
    if (!url) return;

    if (navigator.share) {
      try {
        await navigator.share({ title: story.title, url });
        setShareStatus("Поделились!");
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        await handleCopyLink();
      }
    } else {
      await handleCopyLink();
    }
  };

  const handleTelegramShare = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(getShareText());
    window.open(
      `https://t.me/share/url?url=${url}&text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${getShareText()}\n${getShareUrl()}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleDownloadHtml = () => {
    const html = buildStoryHtml(story);
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${story.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
    setShareStatus("HTML скачан!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="no-print space-y-4">
      <div className="card-love rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <h3 className="font-display text-lg sm:text-xl text-rose-800 mb-1 text-center">
          Поделиться историей
        </h3>
        <p className="text-rose-400 text-xs sm:text-sm text-center mb-4 sm:mb-5">
          Отправьте вашу love story близким
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <button
            onClick={handleNativeShare}
            className="btn-primary py-3.5 sm:py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>📤</span> Поделиться
          </button>

          <button
            onClick={handleCopyLink}
            className="btn-secondary py-3.5 sm:py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>{copied ? "✅" : "🔗"}</span>
            {copied ? "Скопировано!" : "Копировать"}
          </button>

          <button
            onClick={handleTelegramShare}
            className="btn-secondary py-3.5 sm:py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>✈️</span> Telegram
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="btn-secondary py-3.5 sm:py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>💬</span> WhatsApp
          </button>

          <button
            onClick={handleDownloadHtml}
            className="btn-secondary py-3.5 sm:py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>📄</span> Скачать HTML
          </button>

          <button
            onClick={handlePrint}
            className="btn-secondary py-3.5 sm:py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>🖨️</span> Печать
          </button>
        </div>

        {shareStatus && (
          <p className="text-center text-rose-500 text-sm mt-3">{shareStatus}</p>
        )}
      </div>
    </div>
  );
}
