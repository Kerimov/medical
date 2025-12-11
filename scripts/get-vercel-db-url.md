# 🔑 Как получить DATABASE_URL продакшена из Vercel

## Способ 1: Через Vercel Dashboard (самый простой)

1. Зайди на [vercel.com/dashboard](https://vercel.com/dashboard)
2. Выбери свой проект
3. Перейди в **Settings** → **Environment Variables**
4. Найди переменную `DATABASE_URL`
5. Нажми на иконку глаза 👁️ чтобы показать значение
6. Скопируй значение

## Способ 2: Через Vercel CLI

```bash
# Установи Vercel CLI (если еще не установлен)
npm i -g vercel

# Войди в аккаунт
vercel login

# Получи переменные окружения
vercel env pull .env.production

# Открой .env.production и скопируй DATABASE_URL
```

## Способ 3: Через Vercel Postgres Dashboard

1. Зайди в [vercel.com/dashboard](https://vercel.com/dashboard)
2. Перейди в раздел **Storage**
3. Выбери свою Postgres базу данных
4. Перейди в **Settings** → **Connection String**
5. Скопируй Connection String

## После получения DATABASE_URL

Добавь в `.env.local`:

```env
DATABASE_URL_PROD="postgresql://user:password@host:port/database"
```

Затем выполни:

```bash
# Экспорт
node scripts/export-production.js

# Импорт
node scripts/import-production.js
```

