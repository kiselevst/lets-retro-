# Let's Retro

Ретро-доска команды. Миграция с HTML-прототипа (`window.storage` + polling) на
Next.js 15 + Supabase (Realtime, без polling).

## Статус миграции

- [x] Этап 1 — скелет репозитория, Supabase-клиент, первая SQL-миграция
- [ ] Этап 2 — RLS-политики, `lib/types.ts`
- [ ] Этап 3 — лендинг и создание доски
- [ ] Этап 4 — вход в комнату по ссылке / коду
- [ ] Этап 5 — чтение доски (Board/Column/Card) + Realtime-подписки
- [ ] Этап 6 — CRUD карточек и голосование
- [ ] Этап 7 — drag&drop склейка, SMART, экшн-айтемы, «ретро закончилось»
- [ ] Этап 8 — таймер, highlight-режим
- [ ] Этап 9 — настройки (intercepting route) + настройки колонок
- [ ] Этап 10 — архив (экспорт/импорт)
- [ ] Этап 11 — полировка, README деплоя целиком

## Запуск локально

1. Создать проект на [supabase.com](https://supabase.com).
2. Скопировать `.env.example` → `.env.local`, вставить `NEXT_PUBLIC_SUPABASE_URL` и
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` из Project Settings → API.
3. Применить миграцию `supabase/migrations/0001_init.sql` — через Supabase CLI
   (`supabase db push`) либо вставить содержимое файла в SQL Editor в дашборде и выполнить.
4. `npm install`
5. `npm run dev` → http://localhost:3000

## Деплой на Vercel

1. Импортировать репозиторий в Vercel.
2. Добавить те же переменные окружения (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) в Project Settings → Environment Variables.
3. Deploy. Дальше — `git push` на нужную ветку деплоит автоматически.

**Важно:** это этап 1 (скелет). RLS-политики ещё не применены, часть страниц —
заглушки. Полная инструкция деплоя появится на этапе 11.

