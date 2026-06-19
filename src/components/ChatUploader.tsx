"use client";

import { useState, useRef } from "react";
import { parseTelegramFile, parseTelegramExport, generateLoveStory } from "@/lib/telegram";
import { indexUploadFiles, resolveStoryPhotos, extractPhotoMessages } from "@/lib/photos";
import {
  collectDroppedFiles,
  findMessagesHtml,
  pickExportFolderFiles,
} from "@/lib/exportFiles";
import { saveStory } from "@/lib/storage";
import { generateId } from "@/lib/id";
import { StoredStory } from "@/types";

interface ChatUploaderProps {
  userId: string;
  onStoryCreated: (story: StoredStory) => void;
}

export default function ChatUploader({ userId, onStoryCreated }: ChatUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const htmlRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: File[], htmlFile?: File) => {
    setError("");
    setLoading(true);

    try {
      let allFiles = [...files];
      let exportFile = htmlFile ?? findMessagesHtml(allFiles);

      if (!exportFile) {
        throw new Error(
          "В папке нет messages.html. Выберите папку экспорта Telegram целиком (там должен быть messages.html и photos/)."
        );
      }

      let content = await exportFile.text();
      let exportData = parseTelegramFile(content);
      let fileIndex = indexUploadFiles(allFiles);
      let photos = await resolveStoryPhotos(exportData, fileIndex);
      let missingPhotos = extractPhotoMessages(exportData).length - photos.length;

      if (missingPhotos > 0) {
        const fromFolder = allFiles.some(
          (f) => (f as File & { webkitRelativePath?: string }).webkitRelativePath
        );
        if (!fromFolder) {
          const folderFiles = await pickExportFolderFiles().catch(() => [] as File[]);
          if (folderFiles.length > 0) {
            allFiles = [...allFiles, ...folderFiles];
            exportFile = findMessagesHtml(allFiles) ?? exportFile;
            content = await exportFile.text();
            exportData = parseTelegramFile(content);
            fileIndex = indexUploadFiles(allFiles);
            photos = await resolveStoryPhotos(exportData, fileIndex);
            missingPhotos = extractPhotoMessages(exportData).length - photos.length;
          }
        }
      }

      const stats = parseTelegramExport(exportData);
      const story = generateLoveStory(stats, userId, title || undefined, photos);

      const stored: StoredStory = {
        ...story,
        shareId: generateId().slice(0, 8),
      };

      saveStory(stored);
      onStoryCreated(stored);

      if (missingPhotos > 0) {
        setError(
          `История создана без ${missingPhotos} фото. При загрузке укажите папку экспорта — в ней должна быть папка photos.`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось обработать messages.html из экспорта Telegram."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    try {
      const files = await collectDroppedFiles(e.dataTransfer);
      if (!files.length) {
        setError("Не удалось прочитать папку. Нажмите «выбрать папку экспорта» или загрузите messages.html.");
        return;
      }
      await processFiles(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обработать файлы из папки.");
    }
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFiles([file], file);
    e.target.value = "";
  };

  const handlePickFolder = async () => {
    setError("");
    try {
      const files = await pickExportFolderFiles();
      if (files.length) {
        await processFiles(files);
        return;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
    folderRef.current?.click();
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) void processFiles(files);
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название истории (необязательно)"
        className="w-full px-4 py-3.5 rounded-xl border border-pink-200/60 focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20 outline-none transition bg-white/90 text-slate-800 placeholder:text-slate-400 shadow-sm"
      />

      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
          setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragging(false);
          }
        }}
        onDrop={handleDrop}
        onClick={() => !loading && htmlRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all touch-manipulation overflow-hidden ${
          dragging
            ? "border-pink-400 bg-gradient-to-br from-pink-50 via-violet-50 to-cyan-50 scale-[1.02] shadow-xl shadow-pink-200/40"
            : "border-pink-200/50 bg-gradient-to-br from-white via-pink-50/30 to-violet-50/20 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-200/30 hover:-translate-y-0.5"
        } ${loading ? "pointer-events-none" : ""}`}
      >
        <div className="absolute inset-0 grid-dots opacity-20 pointer-events-none" />
        <input
          ref={htmlRef}
          type="file"
          accept=".html,text/html"
          onChange={handleHtmlChange}
          className="hidden"
        />
        <input
          ref={folderRef}
          type="file"
          multiple
          // @ts-expect-error non-standard directory picker attributes
          webkitdirectory=""
          directory=""
          mozdirectory=""
          onChange={handleFolderChange}
          className="hidden"
        />

        {loading ? (
          <div className="relative space-y-4">
            <div className="text-5xl animate-pulse-glow">💕</div>
            <p className="text-shimmer font-display font-bold text-lg">Создаём вашу love story...</p>
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 animate-sparkle"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-4xl mb-4 shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
              📱
            </div>
            <p className="text-slate-800 font-semibold text-base sm:text-lg">
              Загрузите{" "}
              <span className="text-gradient-rainbow font-bold">messages.html</span>
            </p>
            <p className="text-slate-500 text-sm mt-2">
              или перетащите папку экспорта целиком ✦
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handlePickFolder();
              }}
              className="mt-4 text-xs text-rose-500 underline underline-offset-2 hover:text-rose-700"
            >
              выбрать папку экспорта (с фото)
            </button>
          </div>
        )}
      </div>

      {error && (
        <p
          className={`text-sm text-center rounded-xl py-3 px-4 ${
            error.startsWith("История создана")
              ? "text-amber-700 bg-amber-50 border border-amber-200"
              : "text-red-600 bg-red-50 border border-red-200"
          }`}
        >
          {error}
        </p>
      )}
    </div>
  );
}
