"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ChatUploader from "@/components/ChatUploader";
import FloatingHearts from "@/components/FloatingHearts";
import { getSession } from "@/lib/auth";
import { getUserStories, deleteStory } from "@/lib/storage";
import { User, StoredStory } from "@/types";

const EXPORT_STEPS = [
  { emoji: "💬", text: "Откройте чат с партнёром в Telegram Desktop" },
  { emoji: "⋮", text: "Меню ⋮ → Export chat history" },
  { emoji: "📄", text: "Выберите формат JSON, без медиафайлов" },
  { emoji: "📤", text: "Загрузите файл result.json в поле выше" },
];

const STAT_COLORS = [
  "from-pink-500/30 to-pink-500/5 border-pink-500/20",
  "from-violet-500/30 to-violet-500/5 border-violet-500/20",
  "from-cyan-500/30 to-cyan-500/5 border-cyan-500/20",
];

function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-white font-bold text-lg shadow-lg shadow-pink-500/30">
      {n}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stories, setStories] = useState<StoredStory[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/#auth");
      return;
    }
    setUser(session);
    setStories(getUserStories(session.id));
    setReady(true);
  }, [router]);

  const handleStoryCreated = (story: StoredStory) => {
    setStories((prev) => [story, ...prev]);
    router.push(`/story/${story.id}`);
  };

  const handleDelete = (id: string) => {
    deleteStory(id);
    setStories((prev) => prev.filter((s) => s.id !== id));
  };

  if (!ready) {
    return (
      <div className="min-h-screen mesh-hero flex items-center justify-center">
        <div className="text-5xl animate-pulse-glow">💕</div>
      </div>
    );
  }

  const totalMessages = stories.reduce((sum, s) => sum + s.stats.totalMessages, 0);
  const maxDays = stories.length > 0 ? Math.max(...stories.map((s) => s.stats.daysTogether)) : 0;

  return (
    <>
      <Header user={user} />

      <main className="min-h-screen overflow-x-hidden">
        {/* Hero */}
        <section className="relative mesh-hero mesh-animated pt-10 pb-16 sm:pt-14 sm:pb-20 overflow-hidden">
          <div className="aurora-orb w-72 h-72 bg-pink-500/25 top-0 left-[10%]" />
          <div className="aurora-orb w-80 h-80 bg-violet-600/20 top-10 right-[5%]" style={{ animationDelay: "2s" }} />
          <div className="absolute inset-0 grid-dots opacity-30" />
          <FloatingHearts />

          <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center page-enter">
            <span className="hero-badge mb-5 inline-flex">✦ Личный кабинет ✦</span>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-3 text-glow">
              Привет,{" "}
              <span className="text-shimmer">{user?.name}</span>!
            </h1>
            <p className="text-lg text-white/60 max-w-md mx-auto">
              Загрузите переписку из Telegram и создайте вашу love story за пару минут.
            </p>

            {stories.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-10">
                {[
                  { val: stories.length, label: stories.length === 1 ? "история" : "историй", icon: "📖" },
                  { val: totalMessages.toLocaleString("ru-RU"), label: "сообщений", icon: "💬" },
                  { val: maxDays, label: "дней вместе", icon: "💕" },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className={`rounded-2xl p-4 bg-gradient-to-b ${STAT_COLORS[i]} border backdrop-blur-sm`}
                  >
                    <div className="text-xl mb-1">{stat.icon}</div>
                    <p className="text-2xl font-bold text-white font-display">{stat.val}</p>
                    <p className="text-[10px] sm:text-xs text-white/50 mt-0.5 uppercase tracking-wide">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Steps */}
        <section className="relative section-mesh py-14 sm:py-20">
          <div className="absolute inset-0 heart-pattern opacity-60 pointer-events-none" />
          <div className="aurora-orb w-64 h-64 bg-pink-400/15 bottom-0 left-[0%]" />

          <div className="relative max-w-2xl mx-auto px-4 sm:px-6 min-w-0 page-enter">
            <ol className="space-y-10 sm:space-y-14">
              <li className="flex flex-col gap-5 min-w-0">
                <div className="flex items-start gap-4 min-w-0">
                  <StepBadge n={1} />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 mt-1">
                      Создайте{" "}
                      <span className="text-gradient-rainbow">love story</span>
                    </h2>
                    <p className="text-slate-600 mt-2 leading-relaxed">
                      Придумайте название и загрузите файл{" "}
                      <span className="font-semibold text-pink-600">result.json</span>{" "}
                      из экспорта Telegram.
                    </p>
                  </div>
                </div>
                <div className="w-full min-w-0 sm:ml-16">
                  <ChatUploader userId={user!.id} onStoryCreated={handleStoryCreated} />
                </div>
              </li>

              <li className="flex flex-col gap-5 min-w-0">
                <div className="flex items-start gap-4 min-w-0">
                  <StepBadge n={2} />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 mt-1">
                      Как экспортировать чат
                    </h2>
                    <p className="text-slate-600 mt-2 leading-relaxed">
                      Если у вас ещё нет файла — следуйте инструкции ниже.
                    </p>
                  </div>
                </div>
                <div className="w-full min-w-0 sm:ml-16 card-love-premium p-5 sm:p-6">
                  <ol className="space-y-4">
                    {EXPORT_STEPS.map((step, i) => (
                      <li key={i} className="flex items-start gap-4 text-slate-700 text-sm sm:text-base leading-relaxed">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-violet-100 text-base mt-0.5">
                          {step.emoji}
                        </span>
                        <span className="pt-1">{step.text}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </li>
            </ol>

            {stories.length > 0 && (
              <div className="mt-16 sm:mt-20 pt-12 border-t border-pink-200/40">
                <div className="text-center mb-10">
                  <span className="hero-badge-light mb-4 inline-flex">
                    📚 Ваши истории
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-display font-bold text-slate-900">
                    <span className="text-shimmer">Love stories</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {stories.map((story, i) => {
                    const accents = [
                      "from-pink-500 to-rose-500",
                      "from-violet-500 to-purple-600",
                      "from-cyan-500 to-blue-500",
                      "from-amber-400 to-orange-500",
                    ];
                    const accent = accents[i % accents.length];
                    return (
                      <article
                        key={story.id}
                        className="group card-love-premium overflow-hidden hover:scale-[1.01] transition-transform duration-300"
                      >
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-2xl shadow-lg`}>
                            💕
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-display font-bold text-slate-900 truncate">
                              {story.title}
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">
                              {story.partnerNames.join(" & ")} ·{" "}
                              {story.stats.totalMessages.toLocaleString("ru-RU")}{" "}
                              сообщений · {story.stats.daysTogether} дней
                            </p>
                          </div>
                          <div className="relative z-10 flex gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => router.push(`/story/${story.id}`)}
                              className="flex-1 sm:flex-none text-center px-5 py-2.5 rounded-xl btn-glow font-semibold text-sm"
                            >
                              Открыть ✦
                            </button>
                            <button
                              onClick={() => handleDelete(story.id)}
                              className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-colors"
                              title="Удалить"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {stories.length === 0 && (
              <div className="mt-12 text-center">
                <div className="inline-flex flex-col items-center gap-3 p-8 rounded-3xl border-2 border-dashed border-pink-200/60 bg-white/50">
                  <span className="text-5xl animate-float">✨</span>
                  <p className="text-slate-600 font-medium">Пока нет историй — загрузите первый чат!</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
