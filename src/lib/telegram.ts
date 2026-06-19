import {
  TelegramExport,
  TelegramMessage,
  ChatStats,
  LoveStory,
  StoryHighlight,
  TimelineEvent,
  StoryQuote,
  StoryFact,
  StoryPhoto,
} from "@/types";

const SWEET_WORDS = [
  "люблю",
  "любим",
  "любимый",
  "любимая",
  "скучаю",
  "милый",
  "милая",
  "солнышко",
  "котик",
  "кошечка",
  "сердце",
  "целую",
  "обнимаю",
  "красив",
  "дорог",
  "счастлив",
  "love",
  "miss you",
  "baby",
  "honey",
  "sweet",
  "heart",
  "❤",
  "💕",
  "😘",
  "🥰",
  "💋",
];

const STOP_WORDS = new Set([
  "и", "в", "на", "с", "не", "что", "а", "я", "ты", "он", "она", "мы", "вы",
  "они", "это", "как", "но", "да", "нет", "то", "же", "за", "от", "по", "из",
  "the", "a", "an", "is", "are", "was", "were", "be", "to", "of", "and", "in",
  "that", "it", "for", "on", "with", "as", "at", "by", "this", "but", "from",
  "ok", "ок", "ага", "ну", "ещё", "еще", "уже", "тоже", "так", "вот", "тут",
]);

function extractText(msg: TelegramMessage): string {
  if (!msg.text) return "";
  if (typeof msg.text === "string") return msg.text;
  return msg.text.map((e) => e.text).join("");
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function daysBetween(d1: Date, d2: Date): number {
  const t1 = d1.getTime();
  const t2 = d2.getTime();
  if (!Number.isFinite(t1) || !Number.isFinite(t2)) return 1;
  const diff = Math.abs(t2 - t1);
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function isSweet(text: string): boolean {
  const lower = text.toLowerCase();
  return SWEET_WORDS.some((w) => lower.includes(w));
}

function countHearts(text: string): number {
  const hearts = text.match(/❤|💕|💗|💖|💘|💝|🥰|😍|😘|💋|♥/g);
  return hearts ? hearts.length : 0;
}

export function parseTelegramExport(data: TelegramExport): ChatStats {
  const messages = data.messages.filter(
    (m) => m.type === "message" && extractText(m).trim().length > 0
  );

  const participants = new Set<string>();
  const messagesByPerson: Record<string, number> = {};
  const wordsByPerson: Record<string, number> = {};
  const wordFreq: Record<string, number> = {};
  const dayCount: Record<string, number> = {};
  const hourCount: Record<number, number> = {};

  let longestMessage: ChatStats["longestMessage"] = null;
  const firstMessages: ChatStats["firstMessages"] = [];
  const sweetMessages: ChatStats["sweetMessages"] = [];
  let nightMessages = 0;
  let morningMessages = 0;
  let heartEmojis = 0;
  let photosCount = 0;
  let stickersCount = 0;

  const sorted = [...messages].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const msg of data.messages) {
    if (msg.type === "message") {
      const photo = (msg as TelegramMessage & { photo?: string }).photo;
      if (photo && !photo.includes("File not included") && photo !== "1") {
        photosCount++;
      }
      if (!extractText(msg)) {
        if ((msg as TelegramMessage & { sticker_emoji?: string }).sticker_emoji) stickersCount++;
      }
    }
  }

  for (const msg of sorted) {
    const text = extractText(msg);
    if (!text) continue;

    const from = msg.from || "Неизвестный";
    const date = new Date(msg.date);

    participants.add(from);
    messagesByPerson[from] = (messagesByPerson[from] || 0) + 1;
    wordsByPerson[from] = (wordsByPerson[from] || 0) + text.split(/\s+/).length;

    const hour = date.getHours();
    hourCount[hour] = (hourCount[hour] || 0) + 1;
    if (hour >= 22 || hour < 5) nightMessages++;
    if (hour >= 5 && hour < 9) morningMessages++;

    const dayKey = date.toLocaleDateString("ru-RU", { weekday: "long" });
    dayCount[dayKey] = (dayCount[dayKey] || 0) + 1;

    heartEmojis += countHearts(text);

    const words = text.toLowerCase().match(/[а-яёa-z]{3,}/gi) || [];
    for (const word of words) {
      if (!STOP_WORDS.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    }

    if (!longestMessage || text.length > longestMessage.text.length) {
      longestMessage = { text: text.slice(0, 300), from, date };
    }

    if (isSweet(text) && text.length > 10) {
      sweetMessages.push({ text: text.slice(0, 200), from, date });
    }
  }

  if (sorted.length > 0) {
    const first = sorted[0];
    firstMessages.push({
      text: extractText(first).slice(0, 200),
      from: first.from || "Неизвестный",
      date: new Date(first.date),
    });
    if (sorted.length > 1) {
      const second = sorted[1];
      firstMessages.push({
        text: extractText(second).slice(0, 200),
        from: second.from || "Неизвестный",
        date: new Date(second.date),
      });
    }
  }

  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);

  const busiestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  const busiestHour = Number(
    Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 20
  );

  const firstDate = sorted.length > 0 ? new Date(sorted[0].date) : new Date();
  const lastDate = sorted.length > 0 ? new Date(sorted[sorted.length - 1].date) : new Date();

  return {
    totalMessages: sorted.length,
    daysTogether: daysBetween(firstDate, lastDate),
    firstMessageDate: firstDate,
    lastMessageDate: lastDate,
    participants: Array.from(participants),
    messagesByPerson,
    wordsByPerson,
    topWords,
    longestMessage,
    firstMessages,
    sweetMessages: sweetMessages.slice(0, 20),
    nightMessages,
    morningMessages,
    busiestDay,
    busiestHour,
    heartEmojis,
    photosCount,
    stickersCount,
  };
}

function extractPhotoPathFromHtml(body: Element): string | undefined {
  const photoHref = body.querySelector("a.photo_wrap")?.getAttribute("href");
  if (photoHref) return photoHref;

  const imgSrc = body.querySelector("img.photo")?.getAttribute("src");
  if (imgSrc) return imgSrc.replace(/_thumb(\.[^.]+)$/i, "$1");

  const mediaPhoto = body.querySelector(".media_photo img")?.getAttribute("src");
  if (mediaPhoto) return mediaPhoto;

  if (body.querySelector(".media_photo, .photo_wrap")) return undefined;

  return undefined;
}

export function generateLoveStory(
  stats: ChatStats,
  userId: string,
  customTitle?: string,
  photos: StoryPhoto[] = []
): LoveStory {
  const names = stats.participants.slice(0, 2) as [string, string];
  if (names.length < 2) names.push("Партнёр");

  const [name1, name2] = names;
  const title = customTitle || `История любви ${name1} & ${name2}`;

  const msg1 = stats.messagesByPerson[name1] || 0;
  const msg2 = stats.messagesByPerson[name2] || 0;
  const chattier = msg1 >= msg2 ? name1 : name2;

  const highlights: StoryHighlight[] = [
    {
      id: "1",
      title: "Первое сообщение",
      description: stats.firstMessages[0]
        ? `${stats.firstMessages[0].from}: «${stats.firstMessages[0].text.slice(0, 100)}${stats.firstMessages[0].text.length > 100 ? "…" : ""}»`
        : "Начало вашей истории",
      icon: "💌",
    },
    {
      id: "2",
      title: "Самое длинное сообщение",
      description: stats.longestMessage
        ? `${stats.longestMessage.from} написал(а) целых ${stats.longestMessage.text.length} символов — видимо, было что сказать!`
        : "Много слов о любви",
      icon: "📝",
    },
    {
      id: "3",
      title: "Ночные разговоры",
      description: `${stats.nightMessages} сообщений после 22:00 — когда сердце говорит громче`,
      icon: "🌙",
    },
    {
      id: "4",
      title: "Утренние приветствия",
      description: `${stats.morningMessages} сообщений с 5 до 9 утра — первые мысли друг о друге`,
      icon: "🌅",
    },
  ];

  const timeline: TimelineEvent[] = [
    {
      id: "1",
      date: formatDate(stats.firstMessageDate),
      title: "Начало истории",
      description: `Первое сообщение в чате. С этого дня началась ваша переписка.`,
    },
    {
      id: "2",
      date: formatDate(
        new Date(
          stats.firstMessageDate.getTime() +
            (stats.lastMessageDate.getTime() - stats.firstMessageDate.getTime()) / 3
        )
      ),
      title: "Разговоры становятся ближе",
      description: `Вы уже обменялись ${Math.floor(stats.totalMessages / 3)} сообщениями. Слова находят путь к сердцу.`,
    },
    {
      id: "3",
      date: formatDate(
        new Date(
          stats.firstMessageDate.getTime() +
            ((stats.lastMessageDate.getTime() - stats.firstMessageDate.getTime()) * 2) / 3
        )
      ),
      title: "Привычка быть рядом",
      description: `Каждый день — новые слова, новые эмоции. ${stats.heartEmojis} сердечек в переписке.`,
    },
    {
      id: "4",
      date: formatDate(stats.lastMessageDate),
      title: "Сегодня",
      description: `${stats.totalMessages} сообщений и ${stats.daysTogether} дней вашей истории.`,
    },
  ];

  const quotes: StoryQuote[] = stats.sweetMessages.slice(0, 6).map((msg, i) => ({
    id: String(i + 1),
    text: msg.text,
    author: msg.from,
    date: formatDate(msg.date),
  }));

  if (quotes.length === 0 && stats.firstMessages.length > 0) {
    quotes.push({
      id: "1",
      text: stats.firstMessages[0].text,
      author: stats.firstMessages[0].from,
      date: formatDate(stats.firstMessages[0].date),
    });
  }

  const facts: StoryFact[] = [
    {
      id: "1",
      label: "Сообщений",
      value: stats.totalMessages.toLocaleString("ru-RU"),
      icon: "💬",
    },
    {
      id: "2",
      label: "Дней вместе",
      value: stats.daysTogether.toLocaleString("ru-RU"),
      icon: "📅",
    },
    {
      id: "3",
      label: "Сердечек",
      value: stats.heartEmojis.toLocaleString("ru-RU"),
      icon: "❤️",
    },
    {
      id: "4",
      label: "Болтун",
      value: chattier,
      icon: "🗣️",
    },
    {
      id: "5",
      label: "Любимый день",
      value: stats.busiestDay,
      icon: "📆",
    },
    {
      id: "6",
      label: "Час страсти",
      value: `${stats.busiestHour}:00`,
      icon: "⏰",
    },
    {
      id: "7",
      label: "Фото",
      value: stats.photosCount.toLocaleString("ru-RU"),
      icon: "📸",
    },
    {
      id: "8",
      label: "Стикеры",
      value: stats.stickersCount.toLocaleString("ru-RU"),
      icon: "🎨",
    },
  ];

  if (stats.topWords.length > 0) {
    facts.push({
      id: "9",
      label: "Ваше слово",
      value: stats.topWords[0],
      icon: "✨",
    });
  }

  return {
    id: crypto.randomUUID(),
    userId,
    title,
    partnerNames: names,
    createdAt: new Date().toISOString(),
    stats,
    highlights,
    timeline,
    quotes,
    facts,
    photos,
  };
}

function htmlElementToText(el: Element): string {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
  return clone.textContent?.replace(/\u00a0/g, " ").trim() || "";
}

function parseTelegramHtmlDate(title: string): string {
  const match = title.match(
    /(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})\s+UTC([+-]\d{2}):(\d{2})/
  );
  if (!match) return new Date().toISOString();
  const [, day, month, year, hour, min, sec, tzOffset, tzMin] = match;
  return `${year}-${month}-${day}T${hour}:${min}:${sec}${tzOffset}:${tzMin}`;
}

export function parseTelegramHtml(content: string): TelegramExport {
  if (typeof DOMParser === "undefined") {
    throw new Error("HTML-парсинг доступен только в браузере");
  }

  const doc = new DOMParser().parseFromString(content, "text/html");
  const chatName = doc.querySelector(".page_header .text.bold")?.textContent?.trim();

  const messages: TelegramMessage[] = [];
  let lastFrom: string | undefined;

  for (const el of doc.querySelectorAll(".history > .message")) {
    if (!el.classList.contains("default")) continue;

    const body = el.querySelector(".body");
    if (!body) continue;

    const fromEl = body.querySelector(".from_name");
    if (fromEl?.textContent) {
      lastFrom = fromEl.textContent.trim();
    }

    const dateTitle = body.querySelector(".date.details")?.getAttribute("title");
    if (!dateTitle) continue;

    const idMatch = el.id?.match(/message(\d+)/);
    const id = idMatch ? parseInt(idMatch[1], 10) : messages.length + 1;

    const textEl = body.querySelector(".text");
    const text = textEl ? htmlElementToText(textEl) : "";

    const msg: TelegramMessage & { photo?: string; sticker_emoji?: string } = {
      id,
      type: "message",
      date: parseTelegramHtmlDate(dateTitle),
      from: lastFrom,
    };

    if (text) msg.text = text;

    const photoPath = extractPhotoPathFromHtml(body);
    if (photoPath) msg.photo = photoPath;

    const stickerEl = body.querySelector(".media_sticker .emoji");
    if (stickerEl?.textContent) msg.sticker_emoji = stickerEl.textContent.trim();

    messages.push(msg);
  }

  if (messages.length === 0) {
    throw new Error("В HTML-файле не найдено сообщений");
  }

  return { name: chatName, messages };
}

export function parseTelegramFile(content: string): TelegramExport {
  const trimmed = content.trim();

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    const data = JSON.parse(content) as TelegramExport;
    if (!data.messages || !Array.isArray(data.messages)) {
      throw new Error("Неверный формат файла. Ожидается экспорт Telegram (result.json)");
    }
    return data;
  }

  if (trimmed.toLowerCase().includes("<!doctype html") || trimmed.toLowerCase().includes("<html")) {
    return parseTelegramHtml(content);
  }

  throw new Error("Неверный формат. Загрузите result.json или messages.html из экспорта Telegram");
}
