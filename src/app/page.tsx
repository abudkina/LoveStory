"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FloatingHearts from "@/components/FloatingHearts";
import AuthForm from "@/components/AuthForm";
import { getSession } from "@/lib/auth";
import { withBasePath } from "@/lib/paths";
import { User } from "@/types";

const STEPS = [
  {
    num: "01",
    emoji: "📤",
    title: "Экспорт из Telegram",
    desc: "Telegram Desktop → ваш чат → ⋮ → «Export chat history» → формат HTML. Без ботов, без сторонних сервисов — только вы и ваш файл.",
    tip: "Подойдёт любой личный чат: с парнём, женой, мужем, лучшим другом.",
    example: (
      <div className="rounded-xl bg-slate-900/90 p-4 font-mono text-xs sm:text-sm text-left shadow-inner">
        <div className="text-emerald-400">✓ messages.html</div>
        <div className="text-slate-400 mt-1">12 483 сообщения · 2 участника</div>
        <div className="text-rose-300 mt-2 border-l-2 border-rose-500/50 pl-3">
          «Привет! Как дела?» — 14 марта 2022
        </div>
      </div>
    ),
    accent: "from-violet-500 via-purple-500 to-fuchsia-500",
  },
  {
    num: "02",
    emoji: "✨",
    title: "Магия LoveStory",
    desc: "Алгоритм читает переписку и собирает историю: статистику, цитаты, хронологию вех, облако слов и лучшие моменты — как готовый роман о вашей паре.",
    tip: "Всё считается локально в браузере — переписка никуда не уходит.",
    example: (
      <div className="grid grid-cols-2 gap-2 text-left">
        {[
          { icon: "💬", val: "12.4k", label: "сообщений" },
          { icon: "❤️", val: "342", label: "сердечка" },
          { icon: "🌙", val: "847", label: "дней вместе" },
          { icon: "🔥", val: "03:14", label: "пик переписки" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-white/90 p-2.5 border border-rose-200/60 shadow-sm">
            <div className="text-lg">{s.icon}</div>
            <div className="font-display text-base text-rose-700 font-bold">{s.val}</div>
            <div className="text-[10px] text-rose-400 uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>
    ),
    accent: "from-rose-500 via-pink-500 to-orange-400",
  },
  {
    num: "03",
    emoji: "🎁",
    title: "Поделитесь и удивите",
    desc: "Отправьте ссылку партнёру на годовщину, сохраните как HTML-подарок или покажите друзьям — красивая страница, которую хочется перечитывать.",
    tip: "Идеально для 14 февраля, дня рождения отношений или просто «сюрприз без повода».",
    example: (
      <div className="rounded-xl bg-gradient-to-br from-rose-100 to-pink-50 p-4 border border-rose-200 text-left">
        <p className="text-[10px] uppercase tracking-widest text-rose-400 mb-1">Пример цитаты</p>
        <blockquote className="font-display text-sm sm:text-base text-rose-800 italic leading-snug">
          «Ты — моё самое красивое совпадение во вселенной»
        </blockquote>
        <div className="flex gap-2 mt-3">
          {["💕 Поделиться", "📱 Сохранить"].map((btn) => (
            <span key={btn} className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full bg-white border border-rose-200 text-rose-600 font-medium">
              {btn}
            </span>
          ))}
        </div>
      </div>
    ),
    accent: "from-amber-400 via-rose-500 to-pink-600",
  },
];

const FEATURE_CARDS = [
  {
    icon: "📊",
    title: "Статистика в цифрах",
    desc: "Сколько сообщений, сердечек, дней вместе — и неожиданные факты из вашей переписки.",
    example: "«Вы написали друг другу 12 483 раза — это как 3 романа Толстого»",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: "💬",
    title: "Лучшие цитаты",
    desc: "Самые трогательные, смешные и запоминающиеся фразы — вытащены прямо из чата.",
    example: "«Ложись спать, я буду думать о тебе» — Максим, 2:47 ночи",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: "📅",
    title: "Хронология любви",
    desc: "Первое сообщение, первое «люблю», важные даты — лента вашей истории.",
    example: "14.03.2022 — первое «привет» · 09.07.2022 — первое свидание",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: "☁️",
    title: "Облако слов",
    desc: "Слова, которые вы говорите чаще всего — визуально и с любовью.",
    example: "люблю · скучаю · обнимаю · солнышко · котик",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: "⭐",
    title: "Лучшие моменты",
    desc: "Ночные разговоры, рекорды активности, самый длинный день переписки.",
    example: "«Рекорд: 847 сообщений за один вечер — 31 декабря»",
    color: "from-fuchsia-500 to-rose-500",
  },
  {
    icon: "🎨",
    title: "Красивый дизайн",
    desc: "Готовая страница с анимациями, градиентами и сердечками — как открытка.",
    example: "Анна & Максим · Love Story Page · share/abc123",
    color: "from-emerald-400 to-teal-500",
  },
];

const PERKS = [
  { icon: "🆓", title: "Бесплатно", desc: "Без ограничений и скрытых платежей" },
  { icon: "🔒", title: "Приватно", desc: "Данные хранятся только в вашем браузере" },
  { icon: "⚡", title: "Мгновенно", desc: "Результат сразу после загрузки чата" },
  { icon: "💌", title: "Красиво", desc: "Готовый шаблон для sharing и подарка" },
];

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    setUser(getSession());
    setSessionChecked(true);
  }, []);

  const handleAuthSuccess = () => {
    window.location.href = withBasePath("/dashboard");
  };

  const startHref = user ? "/dashboard" : "#auth";

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />

      <div className="flex-1 page-enter">
        <main>
          {/* Hero */}
          <section className="relative pt-14 pb-24 sm:pt-20 sm:pb-32 flex flex-col items-center overflow-hidden mesh-hero mesh-animated">
            <div className="aurora-orb w-72 h-72 bg-pink-500/30 top-10 left-[5%]" style={{ animationDelay: "0s" }} />
            <div className="aurora-orb w-96 h-96 bg-violet-600/25 top-20 right-[0%]" style={{ animationDelay: "2s" }} />
            <div className="aurora-orb w-64 h-64 bg-cyan-400/20 bottom-10 left-[40%]" style={{ animationDelay: "4s" }} />
            <div className="absolute inset-0 grid-dots opacity-40" />
            <FloatingHearts />

            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
              <div className="hero-badge mb-6 mx-auto w-fit">
                ✦ Ваша история любви ✦
              </div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 text-glow">
                Каждое сообщение —
                <span className="block text-shimmer mt-1">
                  часть вашей love story
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
                Загрузите переписку из Telegram и получите красивую историю ваших отношений —{" "}
                <span className="text-pink-300 font-semibold italic">уникальную</span> для вас и{" "}
                <span className="text-violet-300 font-semibold italic">ваших близких</span>.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-10">
                <a
                  href={startHref}
                  className="btn-glow inline-flex items-center justify-center px-8 py-4 rounded-2xl font-bold text-base"
                >
                  {user ? "В кабинет ✦" : "Начать бесплатно ✦"}
                </a>
                <a
                  href="#features"
                  className="btn-secondary inline-flex items-center justify-center px-8 py-4 rounded-2xl font-semibold text-base"
                >
                  Узнать больше →
                </a>
              </div>
            </div>
          </section>

          {/* Preview */}
          <section id="preview" className="relative py-20 sm:py-28 section-dark scroll-mt-20 overflow-hidden">
            <div className="absolute inset-0 grid-dots opacity-20" />
            <div className="aurora-orb w-80 h-80 bg-pink-500/20 top-0 right-[10%]" />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
              <div className="text-center mb-14">
                <span className="hero-badge mb-5 mx-auto w-fit text-[10px]">👀 Превью</span>
                <h2 className="font-display text-3xl sm:text-5xl font-bold text-white mb-4">
                  Так выглядит{" "}
                  <span className="text-shimmer">ваша история</span>
                </h2>
                <p className="text-white/60 text-lg max-w-2xl mx-auto">
                  Статистика, цитаты и лучшие моменты — всё в одном красивом формате
                </p>
              </div>

              <div className="flex justify-center">
                <div className="relative w-full max-w-md animate-float">
                  <div className="preview-phone rounded-3xl p-6 sm:p-10 rotate-0 sm:rotate-1">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-4xl mb-5 shadow-lg shadow-pink-500/30 animate-pulse-glow">
                        💑
                      </div>
                      <p className="font-display text-2xl sm:text-3xl text-white">Анна & Максим</p>
                      <p className="text-pink-300 text-sm mt-2 tracking-widest uppercase font-medium">847 дней вместе</p>
                      <div className="ornament-line max-w-[120px] mx-auto my-6" />
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { val: "12.4k", label: "сообщений", color: "from-pink-500/20 to-pink-500/5" },
                          { val: "342", label: "сердечка", color: "from-violet-500/20 to-violet-500/5" },
                          { val: "∞", label: "любви", color: "from-cyan-500/20 to-cyan-500/5" },
                        ].map((s) => (
                          <div key={s.label} className={`rounded-xl p-3 bg-gradient-to-b ${s.color} border border-white/10`}>
                            <div className="font-display text-lg sm:text-xl text-white font-bold">{s.val}</div>
                            <div className="text-[10px] sm:text-xs text-white/50 mt-0.5">{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <blockquote className="mt-6 text-sm text-white/60 italic border-l-2 border-pink-500/50 pl-4 text-left">
                        «Ты — моё самое красивое совпадение»
                      </blockquote>
                    </div>
                  </div>
                  <span className="absolute -top-4 -right-4 text-3xl animate-sparkle">✨</span>
                  <span className="absolute -bottom-3 -left-5 text-2xl animate-sparkle" style={{ animationDelay: "1s" }}>💕</span>
                  <span className="absolute top-1/2 -right-8 text-xl animate-sparkle hidden sm:block" style={{ animationDelay: "0.5s" }}>🌟</span>
                </div>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section id="features" className="relative py-20 sm:py-28 scroll-mt-20 overflow-hidden section-mesh">
            <div className="absolute inset-0 heart-pattern opacity-80" />
            <div className="absolute inset-0 hero-glow" />
            <div className="aurora-orb w-48 h-48 bg-pink-400/25 top-10 left-[5%]" />
            <div className="aurora-orb w-64 h-64 bg-violet-500/20 bottom-10 right-[5%]" style={{ animationDelay: "3s" }} />
            <div className="aurora-orb w-80 h-80 bg-amber-400/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: "1.5s" }} />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-14 sm:mb-20">
                <span className="inline-block px-5 py-2 rounded-full btn-glow text-white text-xs font-bold uppercase tracking-widest mb-5">
                  ✦ Как это работает ✦
                </span>
                <h2 className="font-display text-3xl sm:text-5xl font-bold text-slate-900 mb-4">
                  От переписки до{" "}
                  <span className="text-shimmer">
                    love story
                  </span>
                </h2>
                <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Три шага — и ваша история оживает. Ниже — примеры того, что вы получите на выходе.
                </p>
                <div className="ornament-line max-w-xs mx-auto mt-8" />
              </div>

              <div className="space-y-8 sm:space-y-10">
                {STEPS.map((step, i) => (
                  <div
                    key={step.num}
                    className={`flex flex-col ${i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} gap-6 lg:gap-10 items-stretch group`}
                  >
                    <div className="flex-1 card-love-premium p-6 sm:p-8 hover:scale-[1.01] transition-transform duration-300">
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.accent} text-white font-bold text-xl flex flex-col items-center justify-center shadow-lg shadow-rose-300/30`}
                        >
                          <span className="text-2xl leading-none">{step.emoji}</span>
                          <span className="text-[10px] opacity-80 mt-0.5">{step.num}</span>
                        </div>
                        <div>
                          <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                            {step.title}
                          </h3>
                          <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                          <p className="mt-3 text-sm text-rose-500 font-medium flex items-start gap-2">
                            <span className="flex-shrink-0">💡</span>
                            {step.tip}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="lg:w-72 xl:w-80 flex-shrink-0 flex items-center">
                      <div className="w-full rounded-2xl p-4 sm:p-5 bg-white/70 backdrop-blur border border-white/80 shadow-xl shadow-rose-200/30 ring-1 ring-rose-100">
                        <p className="text-[10px] uppercase tracking-widest text-rose-400 mb-3 font-semibold">
                          Пример
                        </p>
                        {step.example}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-20 sm:mt-24">
                <div className="text-center mb-10 sm:mb-14">
                  <h3 className="font-display text-2xl sm:text-4xl font-bold text-slate-800 section-title mb-3">
                    Что внутри вашей истории
                  </h3>
                  <p className="text-slate-600 text-lg max-w-xl mx-auto">
                    Каждый блок — живая выжимка из вашего чата, не шаблонные фразы
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {FEATURE_CARDS.map((card) => (
                    <div
                      key={card.title}
                      className="group feature-card-vivid p-6 shadow-lg"
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`}
                      />
                      <div
                        className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} items-center justify-center text-2xl shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                      >
                        {card.icon}
                      </div>
                      <h4 className="font-display text-lg font-bold text-slate-900 mb-2">{card.title}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">{card.desc}</p>
                      <div className="rounded-xl bg-gradient-to-r from-pink-50 via-violet-50 to-cyan-50 border border-pink-100/60 px-3 py-2.5">
                        <p className="text-[11px] sm:text-xs text-violet-700 italic leading-relaxed">
                          {card.example}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-16 sm:mt-20 rounded-3xl overflow-hidden shadow-2xl shadow-violet-300/30 border border-white/60">
                <div className="cta-banner px-6 py-5 flex items-center gap-3">
                  <span className="text-3xl animate-sparkle">👀</span>
                  <div>
                    <p className="text-white font-bold text-sm sm:text-base">Живой пример страницы</p>
                    <p className="text-white/70 text-xs sm:text-sm">Так выглядит готовая love story</p>
                  </div>
                </div>
                <div className="bg-gradient-to-b from-white via-pink-50/50 to-violet-50/30 p-6 sm:p-10">
                  <div className="max-w-lg mx-auto text-center">
                    <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">✦ Love Story ✦</p>
                    <p className="font-display text-2xl sm:text-3xl text-shimmer mb-1">История Анны и Максима</p>
                    <p className="text-rose-500 font-display mb-4">Анна <span className="text-rose-300 italic">&</span> Максим</p>
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {["847 дней", "12.4k сообщений", "342 ❤️"].map((badge) => (
                        <span
                          key={badge}
                          className="px-3 py-1 rounded-full bg-white border border-rose-200 text-rose-600 text-xs font-medium shadow-sm"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {["люблю", "скучаю", "солнышко", "обнимаю", "милый", "целую"].map((word, i) => (
                        <span
                          key={word}
                          className="word-cloud-item rounded-full px-2 py-1 text-xs text-rose-600"
                          style={{ fontSize: `${0.7 + (i % 3) * 0.15}rem` }}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                    <blockquote className="quote-card text-left pl-8 pr-4 py-3 rounded-xl bg-white/80 border border-rose-100 text-sm text-slate-600 italic">
                      Ты — моё самое красивое совпадение во вселенной
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Perks */}
          <section className="py-20 sm:py-24 bg-white relative overflow-hidden">
            <div className="absolute inset-0 grid-dots opacity-30" />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {PERKS.map((p, i) => {
                  const colors = [
                    ["#ff2d78", "#a855f7"],
                    ["#a855f7", "#22d3ee"],
                    ["#22d3ee", "#fbbf24"],
                    ["#fbbf24", "#ff2d78"],
                  ][i];
                  return (
                    <div
                      key={p.title}
                      className="group perk-card p-6 text-center"
                      style={{ "--perk-color-1": colors[0], "--perk-color-2": colors[1] } as React.CSSProperties}
                    >
                      <div className="text-4xl mb-4 group-hover:scale-125 group-hover:-rotate-6 transition-transform duration-300">{p.icon}</div>
                      <h3 className="font-display text-lg font-bold text-slate-900 mb-1">{p.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{p.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 sm:py-24 bg-white relative overflow-hidden">
            <div className="absolute inset-0 grid-dots opacity-30" />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-slate-900 mb-4">
                Готовы рассказать{" "}
                <span className="text-shimmer">вашу историю?</span>
              </h2>
              <p className="text-lg text-slate-600 mb-10">
                Создайте love story за несколько минут. Без технических знаний.
              </p>
              <a
                href={startHref}
                className="btn-glow inline-block px-12 py-4 rounded-2xl font-bold text-lg"
              >
                {user ? "В кабинет ✦" : "Начать сейчас ✦"}
              </a>
            </div>
          </section>

          {/* Auth */}
          <section id="auth" className="relative py-20 sm:py-24 section-dark scroll-mt-20 overflow-hidden">
            <div className="absolute inset-0 grid-dots opacity-20" />
            <div className="aurora-orb w-96 h-96 bg-violet-600/20 top-0 left-0" />
            <div className="aurora-orb w-72 h-72 bg-pink-500/20 bottom-0 right-0" style={{ animationDelay: "2s" }} />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center relative">
              <div className="text-center lg:text-left">
                <span className="hero-badge mb-5 inline-flex">💌 Регистрация</span>
                <h2 className="font-display text-3xl sm:text-5xl font-bold text-white mb-4">
                  Создайте{" "}
                  <span className="text-shimmer">аккаунт</span>
                </h2>
                <p className="text-white/60 leading-relaxed mb-8 text-lg">
                  Зарегистрируйтесь, чтобы загрузить переписку и создать вашу уникальную love story.
                </p>
                <ul className="space-y-4 text-white/70 inline-block text-left">
                  {[
                    "Бесплатно и без ограничений",
                    "Приватность — данные не покидают браузер",
                    "Мгновенный результат",
                    "Красивый шаблон для sharing",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-white flex items-center justify-center text-xs shadow-lg shadow-pink-500/30">
                        ♥
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center">
                {!sessionChecked ? (
                  <div className="landing-card-dark rounded-3xl p-6 sm:p-8 w-full max-w-md flex items-center justify-center min-h-[320px]">
                    <div className="text-4xl animate-pulse">💕</div>
                  </div>
                ) : user ? (
                  <div className="landing-card-dark rounded-3xl p-6 sm:p-8 w-full max-w-md text-center">
                    <span className="text-5xl inline-block animate-float">💕</span>
                    <h2 className="font-display text-2xl text-white mt-4">
                      С возвращением, {user.name}!
                    </h2>
                    <p className="text-white/50 text-sm mt-2 mb-8">
                      Продолжите создавать вашу love story
                    </p>
                    <a
                      href="/dashboard"
                      className="btn-glow inline-block w-full py-3.5 rounded-xl font-bold text-base"
                    >
                      Перейти в кабинет ✦
                    </a>
                  </div>
                ) : (
                  <AuthForm initialMode="register" onSuccess={handleAuthSuccess} />
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      <footer className="relative bg-[#0a0610] text-slate-400 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <p className="font-display text-2xl font-bold text-white">
                LoveStory <span className="text-shimmer">Page</span>
              </p>
              <p className="mt-3 text-slate-500 text-sm leading-relaxed max-w-xs">
                Превратите переписку из Telegram в красивую историю любви.
              </p>
            </div>
            <div className="flex gap-8 text-sm">
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="hover:text-pink-400 transition-colors">
                    Как это работает
                  </a>
                </li>
                <li>
                  <a href="#auth" className="hover:text-violet-400 transition-colors">
                    Начать
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/5 text-center md:text-left">
            <p className="text-slate-600 text-sm">© {new Date().getFullYear()} LoveStory Page</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
