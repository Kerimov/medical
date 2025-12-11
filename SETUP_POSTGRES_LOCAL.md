# 🐘 Настройка PostgreSQL для локальной разработки

Этот гайд поможет настроить PostgreSQL локально для единообразия с продакшеном.

## Вариант 1: Docker (Рекомендуется - самый простой)

### 1. Установите Docker Desktop
- Windows: [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
- Mac: [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
- Linux: `sudo apt-get install docker.io` или используйте дистрибутив Docker

### 2. Запустите PostgreSQL в Docker

```bash
docker run --name medical-postgres \
  -e POSTGRES_PASSWORD=medical123 \
  -e POSTGRES_USER=medical \
  -e POSTGRES_DB=medical_dev \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Проверьте, что контейнер запущен

```bash
docker ps
```

Должен быть виден контейнер `medical-postgres`.

### 4. Настройте `.env.local`

```env
DATABASE_URL="postgresql://medical:medical123@localhost:5432/medical_dev"
```

### 5. Примените миграции

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

## Вариант 2: Локальная установка PostgreSQL

### Windows

1. **Скачайте PostgreSQL:**
   - [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
   - Или используйте установщик от EnterpriseDB

2. **Установите PostgreSQL:**
   - Запомните пароль для пользователя `postgres`
   - Порт по умолчанию: `5432`

3. **Создайте базу данных:**

Откройте pgAdmin или командную строку:

```sql
CREATE DATABASE medical_dev;
CREATE USER medical WITH PASSWORD 'medical123';
GRANT ALL PRIVILEGES ON DATABASE medical_dev TO medical;
```

4. **Настройте `.env.local`:**

```env
DATABASE_URL="postgresql://medical:medical123@localhost:5432/medical_dev"
```

### Mac (Homebrew)

```bash
# Установка PostgreSQL
brew install postgresql@15

# Запуск PostgreSQL
brew services start postgresql@15

# Создание базы данных
createdb medical_dev
createuser medical
psql medical_dev -c "ALTER USER medical WITH PASSWORD 'medical123';"
psql medical_dev -c "GRANT ALL PRIVILEGES ON DATABASE medical_dev TO medical;"
```

### Linux (Ubuntu/Debian)

```bash
# Установка PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Запуск PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Создание базы данных
sudo -u postgres psql
```

В psql выполните:

```sql
CREATE DATABASE medical_dev;
CREATE USER medical WITH PASSWORD 'medical123';
GRANT ALL PRIVILEGES ON DATABASE medical_dev TO medical;
\q
```

## Вариант 3: Использовать существующий PostgreSQL (если уже установлен)

Если у вас уже есть PostgreSQL:

1. **Создайте базу данных:**

```bash
psql -U postgres
```

```sql
CREATE DATABASE medical_dev;
CREATE USER medical WITH PASSWORD 'medical123';
GRANT ALL PRIVILEGES ON DATABASE medical_dev TO medical;
\q
```

2. **Настройте `.env.local`:**

```env
DATABASE_URL="postgresql://medical:medical123@localhost:5432/medical_dev"
```

## После настройки PostgreSQL

### 1. Обновите Prisma Client

```bash
npx prisma generate
```

### 2. Примените схему базы данных

```bash
npx prisma db push
```

Или создайте миграцию:

```bash
npx prisma migrate dev --name init
```

### 3. Заполните базу тестовыми данными

```bash
npm run db:seed
```

### 4. Проверьте подключение

```bash
npx prisma studio
```

Откройте http://localhost:5555 - должна открыться база данных.

## Полезные команды Docker

```bash
# Остановить контейнер
docker stop medical-postgres

# Запустить контейнер
docker start medical-postgres

# Удалить контейнер (данные будут потеряны!)
docker rm -f medical-postgres

# Посмотреть логи
docker logs medical-postgres

# Подключиться к базе через psql
docker exec -it medical-postgres psql -U medical -d medical_dev
```

## Переключение между SQLite и PostgreSQL

Если нужно временно переключиться обратно на SQLite:

1. Измените `DATABASE_URL` в `.env.local`:
```env
DATABASE_URL="file:./prisma/dev.db"
```

2. Измените `provider` в `prisma/schema.prisma`:
```prisma
provider = "sqlite"
```

3. Перегенерируйте Prisma Client:
```bash
npx prisma generate
```

## Устранение проблем

### Ошибка подключения

Проверьте:
- PostgreSQL запущен (`docker ps` или `sudo systemctl status postgresql`)
- Порт 5432 свободен
- Правильные credentials в `DATABASE_URL`
- База данных создана

### Ошибка прав доступа

```sql
GRANT ALL PRIVILEGES ON DATABASE medical_dev TO medical;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO medical;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO medical;
```

### Сброс базы данных

```bash
# Docker
docker exec -it medical-postgres psql -U medical -d medical_dev -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Локальный PostgreSQL
psql -U medical -d medical_dev -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

Затем снова:
```bash
npx prisma db push
npm run db:seed
```

