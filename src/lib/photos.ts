import { StoryPhoto, TelegramExport, TelegramMessage } from "@/types";

const MAX_PHOTOS = 16;
const MAX_WIDTH = 640;
const JPEG_QUALITY = 0.82;

type PhotoMessage = TelegramMessage & { photo?: string };

function extractText(msg: TelegramMessage): string {
  if (!msg.text) return "";
  if (typeof msg.text === "string") return msg.text;
  return msg.text.map((e) => e.text).join("");
}

function isValidPhotoPath(path: string): boolean {
  return !path.includes("File not included") && path !== "1";
}

export function extractPhotoMessages(data: TelegramExport) {
  const items: { path: string; from: string; date: Date; caption?: string }[] = [];

  for (const msg of data.messages) {
    if (msg.type !== "message") continue;
    const path = (msg as PhotoMessage).photo;
    if (!path || !isValidPhotoPath(path)) continue;

    items.push({
      path,
      from: msg.from || "Неизвестный",
      date: new Date(msg.date),
      caption: extractText(msg) || undefined,
    });
  }

  return items;
}

export function indexUploadFiles(files: File[]): Map<string, File> {
  const index = new Map<string, File>();

  for (const file of files) {
    const rel = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
    const normalized = rel.replace(/\\/g, "/");
    index.set(normalized, file);
    index.set(normalized.toLowerCase(), file);

    const basename = normalized.split("/").pop();
    if (basename) {
      index.set(basename, file);
      index.set(basename.toLowerCase(), file);
    }
  }

  return index;
}

function findFileForPath(path: string, fileIndex: Map<string, File>): File | undefined {
  const normalized = path.replace(/\\/g, "/");
  return (
    fileIndex.get(normalized) ||
    fileIndex.get(normalized.toLowerCase()) ||
    fileIndex.get(normalized.split("/").pop()!) ||
    fileIndex.get(normalized.split("/").pop()!.toLowerCase())
  );
}

function preferFullSizePath(path: string): string {
  return path.replace(/_thumb(\.[^.]+)$/i, "$1");
}

async function fileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Не удалось прочитать фото"));
      reader.readAsDataURL(file);
    });
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas недоступен");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

function formatPhotoDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function resolveStoryPhotos(
  data: TelegramExport,
  fileIndex: Map<string, File>
): Promise<StoryPhoto[]> {
  const photoMessages = extractPhotoMessages(data);
  const photos: StoryPhoto[] = [];
  const usedPaths = new Set<string>();

  for (const item of photoMessages) {
    if (photos.length >= MAX_PHOTOS) break;

    const fullPath = preferFullSizePath(item.path);
    if (usedPaths.has(fullPath)) continue;

    const file =
      findFileForPath(fullPath, fileIndex) ||
      findFileForPath(item.path, fileIndex) ||
      findFileForPath(fullPath.replace(/^photos\//, ""), fileIndex);

    if (!file) continue;

    try {
      const src = await fileToDataUrl(file);
      usedPaths.add(fullPath);
      photos.push({
        id: String(photos.length + 1),
        src,
        from: item.from,
        date: formatPhotoDate(item.date),
        caption: item.caption,
      });
    } catch {
      /* skip broken image */
    }
  }

  return photos;
}
