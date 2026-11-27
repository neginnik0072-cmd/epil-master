# Epil_master — сайт-одностраничник

Стек: **Vite + чистый JavaScript + GSAP (ScrollTrigger, Flip) + Lenis**. Шрифты (Cormorant, Onest, JetBrains Mono) встроены в сборку — без Google Fonts.

## Запуск локально

```bash
npm install
npm run dev
```

## Предпросмотр и публикация

GitHub Pages публикует `npm run build:preview` из ветки `main`. В этой сборке поисковая индексация отключена.

После подключения домена соберите версию для публикации с его каноническим HTTPS-адресом:

```bash
SITE_URL=https://example.com/ npm run build
```

Замените `example.com` на домен студии. Сборка создаст в `dist/` файлы сайта, `sitemap.xml` и `robots.txt`. Адрес домена также используется для `canonical`, ссылок на изображения в Open Graph и разметки обоих филиалов. Обычный `npm run build` без `SITE_URL` подходит для локальной проверки.

## Где что править

| Что | Где |
|---|---|
| Тексты, мастера, FAQ, контакты, ссылки | `index.html` |
| Ставки в калькуляторе цен | `index.html` → прайсы филиалов, атрибуты `value` у элементов `<data>` |
| Таблица ставок под калькулятором | `index.html`, блок `.ratecard` |
| Цвета, шрифты, отступы | `src/style.css`, раздел `:root` |
| Лента-нити на первом экране | `src/threads.js` |
| Анимация «Волос за волосом» | `src/how.js` |
| Фото | `public/img/` (формат WebP) |

Ссылки на онлайн-запись (YCLIENTS), MAX, Telegram, ВКонтакте и оферты на Taplink прописаны в `index.html`. Если поменяется ссылка записи, найдите `b330971.yclients.ru` и замените её во всех местах.
