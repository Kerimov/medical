# 🔍 Как узнать DATABASE_URL локально

## Быстрая проверка текущего DATABASE_URL

```bash
node scripts/check-database-url.js
```

Этот скрипт покажет:
- Текущий DATABASE_URL из `.env.local`
- Тип базы данных (SQLite или PostgreSQL)
- Детали подключения

## Формат DATABASE_URL

### SQLite (текущий)
```env
DATABASE_URL="file:./prisma/dev.db"
```

### PostgreSQL (локально)
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

**Пример:**
```env
DATABASE_URL="postgresql://medical:medical123@localhost:5432/medical_dev"
```

Где:
- `medical` - имя пользователя
- `medical123` - пароль
- `localhost` - хост (127.0.0.1)
- `5432` - порт PostgreSQL (по умолчанию)
- `medical_dev` - имя базы данных

## Как узнать DATABASE_URL для PostgreSQL

### Вариант 1: Docker Compose (рекомендуется)

1. **Запустите PostgreSQL:**
```bash
docker-compose up -d
```

2. **DATABASE_URL будет:**
```env
DATABASE_URL="postgresql://medical:medical123@localhost:5432/medical_dev"
```

Эти значения заданы в `docker-compose.yml`:
- Пользователь: `medical`
- Пароль: `medical123`
- База данных: `medical_dev`
- Порт: `5432`

### Вариант 2: Локальный PostgreSQL

Если PostgreSQL установлен локально:

1. **Узнайте параметры подключения:**

```bash
# Windows (если PostgreSQL в PATH)
psql -U postgres -c "\l"

# Или через pgAdmin (GUI)
```

2. **Составьте DATABASE_URL:**

```env
DATABASE_URL="postgresql://ВАШ_ПОЛЬЗОВАТЕЛЬ:ВАШ_ПАРОЛЬ@localhost:5432/ВАША_БАЗА"
```

**Пример:**
```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/medical_dev"
```

### Вариант 3: Проверить через переменные окружения

```bash
# Windows PowerShell
$env:DATABASE_URL

# Linux/Mac
echo $DATABASE_URL
```

## Проверка подключения к PostgreSQL

После настройки DATABASE_URL проверьте подключение:

```bash
node scripts/test-postgres-connection.js
```

Скрипт покажет:
- ✅ Успешное подключение
- Версию PostgreSQL
- Текущую базу данных
- Список таблиц

## Где находится DATABASE_URL?

DATABASE_URL хранится в файле `.env.local` в корне проекта.

**Проверить содержимое:**
```bash
# Windows PowerShell
Get-Content .env.local | Select-String "DATABASE_URL"

# Linux/Mac
grep DATABASE_URL .env.local
```

## Быстрая настройка для PostgreSQL

1. **Откройте `.env.local`**

2. **Замените строку:**
```env
DATABASE_URL="file:./prisma/dev.db"
```

**На:**
```env
DATABASE_URL="postgresql://medical:medical123@localhost:5432/medical_dev"
```

3. **Запустите PostgreSQL (если еще не запущен):**
```bash
docker-compose up -d
```

4. **Проверьте подключение:**
```bash
node scripts/test-postgres-connection.js
```

5. **Примените миграции:**
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

## Полезные команды

```bash
# Проверить текущий DATABASE_URL
node scripts/check-database-url.js

# Проверить подключение к PostgreSQL
node scripts/test-postgres-connection.js

# Посмотреть все переменные окружения
Get-Content .env.local

# Проверить, запущен ли PostgreSQL в Docker
docker ps | findstr postgres
```

