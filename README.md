# Let's Retro

Ретро-доска команды. Миграция с HTML-прототипа (`window.storage` + polling) на
Next.js 15 + Supabase (Realtime, без polling).

## Статус миграции

- [x] Этап 1 — скелет репозитория, Supabase-клиент, первая SQL-миграция
- [x] Этап 2 — RLS-политики (открытые, без Auth — осознанное решение для MVP), `lib/types.ts`
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
3. Применить миграции из `supabase/migrations/` **по порядку** (0001, затем 0002) —
   через Supabase CLI (`supabase db push`) либо вставляя содержимое каждого файла
   в SQL Editor в дашборде и выполняя одну за другой.
4. `npm install`
5. `npm run dev` → http://localhost:3000

## Деплой на Vercel

1. Импортировать репозиторий в Vercel (Import Git Repository).
2. Добавить те же переменные окружения (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) в Project Settings → Environment Variables.
3. Deploy. Дальше — `git push` на нужную ветку деплоит автоматически.

## Про безопасность (этап 2)

RLS включён на всех таблицах, но политики открытые (`USING (true)`) — без
Supabase Auth у Postgres нет возможности проверить, кто именно шлёт запрос
(anon-ключ общий на всех). Это осознанный выбор для MVP с доверенной командой,
совпадающий по уровню защиты с исходным прототипом на `window.storage`.
Ужесточение доступа в будущем — это правка только
`supabase/migrations/000X_tighten_rls.sql`, без изменений в коде приложения.

**Важно:** часть страниц всё ещё заглушки — реальные экраны появятся на этапах 3–5.
