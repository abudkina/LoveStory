const PARTICLES = [
  { left: "5%", emoji: "♥", color: "text-pink-400", size: "text-xl", delay: "0s", duration: "7s" },
  { left: "18%", emoji: "✨", color: "text-yellow-300", size: "text-sm", delay: "2s", duration: "9s" },
  { left: "32%", emoji: "💜", color: "text-violet-400", size: "text-base", delay: "4s", duration: "8s" },
  { left: "48%", emoji: "♥", color: "text-rose-400", size: "text-lg", delay: "1s", duration: "10s" },
  { left: "62%", emoji: "💫", color: "text-cyan-300", size: "text-sm", delay: "3s", duration: "7s" },
  { left: "75%", emoji: "♥", color: "text-fuchsia-400", size: "text-xl", delay: "5s", duration: "9s" },
  { left: "88%", emoji: "✨", color: "text-amber-300", size: "text-base", delay: "1.5s", duration: "8s" },
  { left: "12%", emoji: "💕", color: "text-pink-300", size: "text-sm", delay: "3.5s", duration: "11s" },
  { left: "42%", emoji: "♥", color: "text-purple-400", size: "text-lg", delay: "2.5s", duration: "7s" },
  { left: "55%", emoji: "🌟", color: "text-yellow-200", size: "text-sm", delay: "4.5s", duration: "9s" },
  { left: "68%", emoji: "♥", color: "text-rose-300", size: "text-base", delay: "0.5s", duration: "10s" },
  { left: "95%", emoji: "💗", color: "text-pink-400", size: "text-lg", delay: "2.8s", duration: "8s" },
  { left: "25%", emoji: "✦", color: "text-violet-300", size: "text-xs", delay: "6s", duration: "12s" },
  { left: "82%", emoji: "♥", color: "text-cyan-400", size: "text-sm", delay: "3.2s", duration: "9s" },
];

export default function FloatingHearts() {
  return (
    <>
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={`absolute bottom-[20%] ${p.size} ${p.color} pointer-events-none select-none`}
          style={{
            left: p.left,
            animation: `float-heart ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
          }}
          aria-hidden
        >
          {p.emoji}
        </span>
      ))}
    </>
  );
}
