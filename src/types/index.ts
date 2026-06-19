export interface User {
  id: string;
  email: string;
  name: string;
}

export interface TelegramMessage {
  id: number;
  type: string;
  date: string;
  from?: string;
  from_id?: string;
  text?: string | TextEntity[];
  reply_to_message_id?: number;
}

export interface TextEntity {
  type: string;
  text: string;
}

export interface TelegramExport {
  name?: string;
  type?: string;
  id?: number;
  messages: TelegramMessage[];
}

export interface ChatStats {
  totalMessages: number;
  daysTogether: number;
  firstMessageDate: Date;
  lastMessageDate: Date;
  participants: string[];
  messagesByPerson: Record<string, number>;
  wordsByPerson: Record<string, number>;
  topWords: string[];
  longestMessage: { text: string; from: string; date: Date } | null;
  firstMessages: { text: string; from: string; date: Date }[];
  sweetMessages: { text: string; from: string; date: Date }[];
  nightMessages: number;
  morningMessages: number;
  busiestDay: string;
  busiestHour: number;
  heartEmojis: number;
  photosCount: number;
  stickersCount: number;
}

export interface StoryPhoto {
  id: string;
  src: string;
  from: string;
  date: string;
  caption?: string;
}

export interface LoveStory {
  id: string;
  userId: string;
  title: string;
  partnerNames: [string, string];
  createdAt: string;
  stats: ChatStats;
  highlights: StoryHighlight[];
  timeline: TimelineEvent[];
  quotes: StoryQuote[];
  facts: StoryFact[];
  photos: StoryPhoto[];
}

export interface StoryHighlight {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}

export interface StoryQuote {
  id: string;
  text: string;
  author: string;
  date: string;
}

export interface StoryFact {
  id: string;
  label: string;
  value: string;
  icon: string;
}

export interface StoredStory extends LoveStory {
  shareId: string;
}
