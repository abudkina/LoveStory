import { StoredStory } from "@/types";

export function buildStoryHtml(story: StoredStory): string {
  const [n1, n2] = story.partnerNames;
  const firstDate = new Date(story.stats.firstMessageDate).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const lastDate = new Date(story.stats.lastMessageDate).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(story.title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Lato', sans-serif;
    background: linear-gradient(180deg, #fff5f7 0%, #fdf2f8 40%, #fffbf7 100%);
    color: #3d2c2c;
    line-height: 1.6;
    min-height: 100vh;
  }
  .hero {
    position: relative;
    text-align: center;
    padding: 80px 24px 60px;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(251,113,133,0.15) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-label {
    font-size: 0.75rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #d4a574;
    margin-bottom: 16px;
  }
  .hero h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2rem, 6vw, 3.5rem);
    background: linear-gradient(135deg, #be123c, #fb7185, #d4a574);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 12px;
    line-height: 1.15;
  }
  .hero-couple {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.35rem;
    color: #f43f5e;
    margin-bottom: 8px;
  }
  .hero-dates { color: #fb7185; font-size: 0.9rem; margin-bottom: 28px; }
  .hero-badge {
    display: inline-block;
    background: rgba(255,255,255,0.9);
    border: 1px solid rgba(251,113,133,0.25);
    border-radius: 999px;
    padding: 10px 28px;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.1rem;
    color: #be123c;
    box-shadow: 0 8px 32px rgba(190,18,60,0.1);
  }
  .section {
    max-width: 800px;
    margin: 0 auto;
    padding: 48px 24px;
  }
  .section-alt { background: linear-gradient(135deg, #fff5f7, #fdf2f8, #fffbf7); }
  .section-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.75rem;
    color: #9f1239;
    text-align: center;
    margin-bottom: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  .section-title::before, .section-title::after {
    content: '✦';
    color: #d4a574;
    font-size: 0.75rem;
  }
  .facts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }
  .fact {
    background: rgba(255,255,255,0.9);
    border: 1px solid rgba(251,113,133,0.15);
    border-radius: 20px;
    padding: 24px 16px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(190,18,60,0.08);
  }
  .fact-icon { font-size: 2rem; margin-bottom: 8px; }
  .fact-value {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.6rem;
    color: #be123c;
    margin-bottom: 4px;
  }
  .fact-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #fb7185;
  }
  .highlights { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
  .highlight {
    background: rgba(255,255,255,0.9);
    border: 1px solid rgba(251,113,133,0.15);
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 8px 32px rgba(190,18,60,0.08);
  }
  .highlight-icon { font-size: 2rem; margin-bottom: 12px; }
  .highlight h3 {
    font-family: 'Playfair Display', Georgia, serif;
    color: #9f1239;
    font-size: 1.15rem;
    margin-bottom: 8px;
  }
  .highlight p { color: #f43f5e; font-size: 0.95rem; }
  .timeline { position: relative; padding-left: 32px; }
  .timeline::before {
    content: '';
    position: absolute;
    left: 11px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: linear-gradient(180deg, #fda4b8, #fb7185, #d4a574);
    border-radius: 2px;
  }
  .timeline-item { position: relative; margin-bottom: 32px; }
  .timeline-dot {
    position: absolute;
    left: -32px;
    top: 4px;
    width: 22px;
    height: 22px;
    background: #fb7185;
    border: 4px solid #ffe4ec;
    border-radius: 50%;
  }
  .timeline-date { color: #d4a574; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px; }
  .timeline-item h3 {
    font-family: 'Playfair Display', Georgia, serif;
    color: #9f1239;
    font-size: 1.05rem;
    margin-bottom: 4px;
  }
  .timeline-item p { color: #f43f5e; font-size: 0.9rem; }
  .quote {
    position: relative;
    background: rgba(255,255,255,0.9);
    border: 1px solid rgba(251,113,133,0.15);
    border-left: 4px solid #fb7185;
    border-radius: 20px;
    padding: 28px 28px 28px 48px;
    margin-bottom: 20px;
    box-shadow: 0 8px 32px rgba(190,18,60,0.06);
  }
  .quote::before {
    content: '«';
    position: absolute;
    left: 16px;
    top: 8px;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 3rem;
    color: #fecdd9;
    line-height: 1;
  }
  .quote-text {
    font-family: 'Playfair Display', Georgia, serif;
    font-style: italic;
    font-size: 1.1rem;
    color: #be123c;
    line-height: 1.7;
    margin-bottom: 12px;
  }
  .quote-author { color: #fb7185; font-size: 0.85rem; }
  .words { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
  .word {
    padding: 8px 18px;
    border-radius: 999px;
    background: linear-gradient(135deg, #ffe4ec, #fff5f7);
    color: #be123c;
    font-weight: 500;
    border: 1px solid rgba(251,113,133,0.2);
  }
  .gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; }
  .gallery-item {
    background: rgba(255,255,255,0.9);
    border: 1px solid rgba(251,113,133,0.15);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(190,18,60,0.08);
  }
  .gallery-item img { width: 100%; aspect-ratio: 3/4; object-fit: cover; display: block; }
  .gallery-caption { padding: 16px; }
  .gallery-date { color: #d4a574; font-size: 0.75rem; font-weight: 600; margin-bottom: 4px; }
  .gallery-from { color: #fb7185; font-size: 0.85rem; }
  .gallery-text { color: #f43f5e; font-size: 0.8rem; margin-top: 6px; line-height: 1.4; }
  .footer {
    text-align: center;
    padding: 48px 24px 60px;
    color: #d4a574;
    font-size: 0.9rem;
  }
  .footer-heart { font-size: 1.5rem; margin-bottom: 8px; }
  @media print {
    body { background: white; }
    .fact, .highlight, .quote { break-inside: avoid; box-shadow: none; border: 1px solid #fecdd9; }
  }
</style>
</head>
<body>
<header class="hero">
  <p class="hero-label">Love Story</p>
  <h1>${esc(story.title)}</h1>
  <p class="hero-couple">${esc(n1)} <span style="color:#fda4b8">&</span> ${esc(n2)}</p>
  <p class="hero-dates">${firstDate} — ${lastDate}</p>
  <div class="hero-badge">💕 ${story.stats.daysTogether} дней вместе · ${story.stats.totalMessages.toLocaleString("ru-RU")} сообщений</div>
</header>

<section class="section">
  <h2 class="section-title">Наша история в цифрах</h2>
  <div class="facts">
    ${story.facts
      .map(
        (f) =>
          `<div class="fact"><div class="fact-icon">${f.icon}</div><div class="fact-value">${esc(f.value)}</div><div class="fact-label">${esc(f.label)}</div></div>`
      )
      .join("")}
  </div>
</section>

<section class="section section-alt">
  <h2 class="section-title">Лучшие моменты</h2>
  <div class="highlights">
    ${story.highlights
      .map(
        (h) =>
          `<div class="highlight"><div class="highlight-icon">${h.icon}</div><h3>${esc(h.title)}</h3><p>${esc(h.description)}</p></div>`
      )
      .join("")}
  </div>
</section>

${
  (story.photos?.length ?? 0) > 0
    ? `<section class="section">
  <h2 class="section-title">Моменты в фото</h2>
  <div class="gallery">
    ${story.photos
      .map(
        (photo) =>
          `<figure class="gallery-item"><img src="${photo.src}" alt="${esc(photo.caption || `Фото от ${photo.from}`)}"/><figcaption class="gallery-caption"><p class="gallery-date">${esc(photo.date)}</p><p class="gallery-from">${esc(photo.from)}</p>${photo.caption ? `<p class="gallery-text">${esc(photo.caption)}</p>` : ""}</figcaption></figure>`
      )
      .join("")}
  </div>
</section>`
    : ""
}

<section class="section">
  <h2 class="section-title">Хронология любви</h2>
  <div class="timeline">
    ${story.timeline
      .map(
        (e) =>
          `<div class="timeline-item"><div class="timeline-dot"></div><p class="timeline-date">${esc(e.date)}</p><h3>${esc(e.title)}</h3><p>${esc(e.description)}</p></div>`
      )
      .join("")}
  </div>
</section>

<section class="section section-alt">
  <h2 class="section-title">Слова, от которых тает сердце</h2>
  ${story.quotes
    .map(
      (q) =>
        `<div class="quote"><p class="quote-text">${esc(q.text)}</p><p class="quote-author">— ${esc(q.author)}, ${esc(q.date)}</p></div>`
    )
    .join("")}
</section>

${
  story.stats.topWords.length > 0
    ? `<section class="section">
  <h2 class="section-title">Ваши слова</h2>
  <div class="words">
    ${story.stats.topWords
      .map(
        (w, i) =>
          `<span class="word" style="font-size:${1 - i * 0.04}rem;opacity:${1 - i * 0.06}">${esc(w)}</span>`
      )
      .join("")}
  </div>
</section>`
    : ""
}

<footer class="footer">
  <div class="footer-heart">✨</div>
  <p>Создано с LoveStory</p>
</footer>
</body>
</html>`;
}
