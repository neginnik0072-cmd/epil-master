# Epil_master — сайт-одностраничник

Стек: **Vite + чистый JavaScript + GSAP (ScrollTrigger, Flip) + Lenis**. Шрифты (Cormorant, Onest, JetBrains Mono) встроены в сборку — без Google Fonts.

## Запуск локально

```bash
npm install
npm run dev
```

## Сборка для хостинга

```bash
npm run build
```

Готовый сайт появится в папке `dist/` — это обычные статические файлы. Их можно загрузить на любой хостинг: Timeweb, Beget, REG.RU, Netlify, Vercel, GitHub Pages и т.п.

## Где что править

| Что | Где |
|---|---|
| Тексты, мастера, FAQ, контакты, ссылки | `index.html` |
| Ставки в калькуляторе цен | `src/calc.js` → `RATES`, `ELECTRODE` |
| Таблица ставок под калькулятором | `index.html`, блок `.ratecard` |
| Цвета, шрифты, отступы | `src/style.css`, раздел `:root` |
| Лента-нити на первом экране | `src/threads.js` |
| Анимация «Волос за волосом» | `src/how.js` |
| Фото | `public/img/` (формат WebP) |

Ссылки на онлайн-запись (YCLIENTS), WhatsApp, MAX и оферты на Taplink прописаны в `index.html`. Если поменяется ссылка записи, найдите `b330971.yclients.ru` и замените её во всех местах.
