# Как открыть Prisma Studio для продакшн базы Vercel

## Шаг 1: Получите DATABASE_URL из Vercel

1. Зайди в Vercel → твой проект
2. Перейди в **Storage** (в боковом меню)
3. Выбери свою базу данных Postgres
4. В разделе **"Connection String"** скопируй `DATABASE_URL`
   - Он выглядит как: `postgresql://user:password@host:port/database`

## Шаг 2: Запусти Prisma Studio с продакшн базой

### Вариант A: Через переменную окружения (временно)

```bash
# Windows PowerShell
$env:DATABASE_URL="postgresql://user:password@host:port/database"
npx prisma studio

# Windows CMD
set DATABASE_URL=postgresql://user:password@host:port/database
npx prisma studio

# Linux/Mac
export DATABASE_URL="postgresql://user:password@host:port/database"
npx prisma studio
```

### Вариант B: Через .env файл (безопаснее)

1. Создай файл `.env.production.local` в корне проекта
2. Добавь туда:
   ```
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```
3. Запусти:
   ```bash
   npx prisma studio
   ```

## Шаг 3: Открой Prisma Studio

После запуска открой в браузере: **http://localhost:5555**

Там будут все таблицы из продакшн базы!

## ⚠️ ВАЖНО: Безопасность

- **НЕ коммить** `.env.production.local` в Git!
- Добавь `.env.production.local` в `.gitignore`
- Используй только для просмотра, не редактируй данные напрямую в продакшене

