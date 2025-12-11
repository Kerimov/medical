# ⚡ Быстрая настройка PostgreSQL локально

## Вариант 1: Docker Compose (Самый простой)

### 1. Запустите Docker Desktop
Убедитесь, что Docker Desktop запущен.

### 2. Запустите PostgreSQL одной командой:

```bash
docker-compose up -d
```

### 3. Проверьте, что контейнер запущен:

```bash
docker ps
```

Должен быть виден контейнер `medical-postgres`.

### 4. Настройте `.env.local`:

```env
DATABASE_URL="postgresql://medical:medical123@localhost:5432/medical_dev"
```

### 5. Примените миграции:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### Остановить PostgreSQL:

```bash
docker-compose down
```

### Запустить снова:

```bash
docker-compose up -d
```

## Вариант 2: Если Docker не запускается

Можно временно использовать SQLite локально, но схема уже настроена на PostgreSQL.

### Временное переключение на SQLite:

1. Измените `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

2. В `.env.local`:
```env
DATABASE_URL="file:./prisma/dev.db"
```

3. Перегенерируйте:
```bash
npx prisma generate
npx prisma db push
```

Но лучше использовать PostgreSQL для единообразия с продакшеном!

