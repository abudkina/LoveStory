"use client";

import { StoredStory } from "@/types";
import ShareButtons from "./ShareButtons";
import MobileShareBar from "./MobileShareBar";
import FloatingHearts from "./FloatingHearts";

interface LoveStoryViewProps {
  story: StoredStory;
  showShare?: boolean;
}

const STAGGER = ["stagger-1", "stagger-2", "stagger-3", "stagger-4", "stagger-5", "stagger-6", "stagger-7", "stagger-8"];

export default function LoveStoryView({ story, showShare = true }: LoveStoryViewProps) {
  const [n1, n2] = story.partnerNames;

  return (
    <div className="share-story-page min-h-screen pb-20 sm:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4">
        <div className="absolute inset-0 heart-pattern opacity-40" />
        <div className="absolute inset-0 hero-glow" />
        <FloatingHearts />

        <div className="relative max-w-4xl mx-auto text-center animate-fade-in-up">
          <p className="text-gold text-xs sm:text-sm tracking-[0.25em] sm:tracking-[0.35em] uppercase mb-4">
            ✦ Love Story ✦
          </p>
          <h1 className="font-display text-3xl sm:text-5xl md:text-7xl text-shimmer mb-4 px-2 break-words leading-tight">
            {story.title}
          </h1>
          <p className="text-lg sm:text-2xl text-rose-500 font-display break-words mb-2">
            {n1} <span className="text-rose-300 italic">&</span> {n2}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-rose-400 text-xs sm:text-sm mb-8">
            <span>
              {new Date(story.stats.firstMessageDate).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="hidden sm:inline text-gold">✦</span>
            <span>
              {new Date(story.stats.lastMessageDate).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="hero-badge-light text-sm sm:text-base">
            <span>💕</span>
            <span>
              {story.stats.daysTogether.toLocaleString("ru-RU")} дней вместе
            </span>
            <span className="text-rose-300">·</span>
            <span>
              {story.stats.totalMessages.toLocaleString("ru-RU")} сообщений
            </span>
          </div>
        </div>

        <div className="relative max-w-xs mx-auto mt-10 ornament-line" />
      </section>

      {/* Facts */}
      <section className="py-10 sm:py-16 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl sm:text-4xl section-title text-rose-800 mb-8 sm:mb-12">
            Наша история в цифрах
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {story.facts.map((fact, i) => (
              <div
                key={fact.id}
                className={`card-love-premium p-4 sm:p-6 text-center transition-transform duration-300 animate-scale-in ${STAGGER[i % STAGGER.length]}`}
              >
                <div className="text-3xl sm:text-4xl mb-2">{fact.icon}</div>
                <div className="font-display text-xl sm:text-3xl text-rose-700 break-words leading-tight">
                  {fact.value}
                </div>
                <div className="text-[10px] sm:text-xs text-rose-400 mt-2 uppercase tracking-widest">
                  {fact.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-10 sm:py-16 px-3 sm:px-4 gradient-love">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl sm:text-4xl section-title text-rose-800 mb-8 sm:mb-12">
            Лучшие моменты
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {story.highlights.map((h, i) => (
              <div
                key={h.id}
                className={`card-love-premium p-5 sm:p-8 transition-transform duration-300 animate-scale-in ${STAGGER[i % STAGGER.length]}`}
              >
                <div className="text-3xl sm:text-4xl mb-3">{h.icon}</div>
                <h3 className="font-display text-lg sm:text-xl text-rose-800 mb-2">{h.title}</h3>
                <p className="text-rose-500 text-sm sm:text-base leading-relaxed">{h.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photos */}
      {(story.photos?.length ?? 0) > 0 && (
        <section className="py-10 sm:py-16 px-3 sm:px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl sm:text-4xl section-title text-rose-800 mb-8 sm:mb-12">
              Моменты в фото
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
              {story.photos.map((photo, i) => (
                <figure
                  key={photo.id}
                  className={`card-love-premium overflow-hidden animate-scale-in ${STAGGER[i % STAGGER.length]}`}
                >
                  <img
                    src={photo.src}
                    alt={photo.caption || `Фото от ${photo.from}`}
                    className="w-full aspect-[3/4] object-cover"
                    loading="lazy"
                  />
                  <figcaption className="p-3 sm:p-4">
                    <p className="text-gold text-[10px] sm:text-xs font-medium tracking-wide mb-1">
                      {photo.date}
                    </p>
                    <p className="text-rose-500 text-xs sm:text-sm">{photo.from}</p>
                    {photo.caption && (
                      <p className="text-rose-400 text-xs mt-1 line-clamp-2">{photo.caption}</p>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Timeline */}
      <section className="py-10 sm:py-16 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl sm:text-4xl section-title text-rose-800 mb-8 sm:mb-12">
            Хронология любви
          </h2>
          <div className="relative">
            <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 timeline-line rounded-full" />
            <div className="space-y-8 sm:space-y-10">
              {story.timeline.map((event, i) => (
                <div
                  key={event.id}
                  className={`relative pl-14 sm:pl-18 animate-scale-in ${STAGGER[i % STAGGER.length]}`}
                >
                  <div className="absolute left-2.5 sm:left-4 top-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full timeline-dot flex items-center justify-center text-[8px] text-white">
                    ♥
                  </div>
                  <p className="text-gold text-xs sm:text-sm font-medium tracking-wide mb-1">{event.date}</p>
                  <h3 className="font-display text-base sm:text-xl text-rose-800 mb-1">{event.title}</h3>
                  <p className="text-rose-500 text-sm sm:text-base leading-relaxed">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quotes */}
      <section className="py-10 sm:py-16 px-3 sm:px-4 gradient-love">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl sm:text-4xl section-title text-rose-800 mb-8 sm:mb-12">
            Слова, от которых тает сердце
          </h2>
          <div className="space-y-5 sm:space-y-6">
            {story.quotes.map((quote, i) => (
              <blockquote
                key={quote.id}
                className={`quote-card card-love-premium p-5 sm:p-8 pl-10 sm:pl-12 border-l-4 border-rose-400 animate-scale-in ${STAGGER[i % STAGGER.length]}`}
              >
                <p className="font-display text-base sm:text-xl text-rose-700 italic leading-relaxed break-words relative z-10">
                  {quote.text}
                </p>
                <footer className="mt-3 sm:mt-4 text-xs sm:text-sm text-rose-400 relative z-10">
                  — {quote.author}, {quote.date}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Word cloud */}
      {story.stats.topWords.length > 0 && (
        <section className="py-10 sm:py-16 px-3 sm:px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-2xl sm:text-4xl section-title text-rose-800 mb-8 sm:mb-10">
              Ваши слова
            </h2>
            <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
              {story.stats.topWords.map((word, i) => (
                <span
                  key={word}
                  className="word-cloud-item px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-rose-600 font-medium"
                  style={{
                    fontSize: `${Math.max(0.8, 1.1 - i * 0.04)}rem`,
                    opacity: 1 - i * 0.06,
                  }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Closing */}
      <section className="py-10 sm:py-14 px-4">
        <div className="max-w-xl mx-auto love-closing p-8 sm:p-12 text-center">
          <p className="text-3xl sm:text-4xl mb-4">💌</p>
          <p className="font-display text-lg sm:text-2xl text-rose-700 italic leading-relaxed">
            Каждое сообщение — кирпичик в доме, который вы строите вместе
          </p>
          <p className="mt-4 text-rose-400 text-sm">
            {n1} & {n2}
          </p>
        </div>
      </section>

      {/* Share */}
      {showShare && (
        <section id="share-full" className="py-8 sm:py-12 px-3 sm:px-4">
          <div className="max-w-2xl mx-auto">
            <ShareButtons story={story} />
          </div>
        </section>
      )}

      {showShare && <MobileShareBar story={story} />}

      {/* Footer */}
      <footer className="py-8 sm:py-10 text-center safe-bottom">
        <p className="text-gold text-lg mb-1">✦</p>
        <p className="text-rose-300 text-xs sm:text-sm">Создано с LoveStory</p>
      </footer>
    </div>
  );
}
