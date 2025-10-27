# 🚀 Руководство по развертыванию на Vercel

## Подготовка проекта ✅

Проект уже подготовлен для развертывания:
- ✅ Переключен на PostgreSQL
- ✅ Обновлены скрипты сборки
- ✅ Созданы конфигурационные файлы
- ✅ Настроены переменные окружения

## Пошаговое развертывание

### 1. Подготовка репозитория

```bash
# Добавьте все изменения в git
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Создание аккаунта Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "Sign Up" и войдите через GitHub
3. Подтвердите email адрес

### 3. Подключение проекта

1. В панели Vercel нажмите "New Project"
2. Выберите ваш GitHub репозиторий
3. Нажмите "Import"

### 4. Настройка переменных окружения

В настройках проекта (Settings → Environment Variables) добавьте:

| Переменная | Значение | Описание |
|------------|----------|----------|
| `JWT_SECRET` | `your-super-secret-jwt-key` | Сгенерируйте новый ключ |
| `DATABASE_URL` | `postgresql://...` | URL базы данных (см. шаг 5) |
| `NEXT_PUBLIC_ADMIN_EMAILS` | `admin@yourdomain.com` | Email админов |
| `OPENAI_API_KEY` | `sk-...` | Ваш OpenAI API ключ |
| `OCR_SPACE_API_KEY` | `your-key` | Опционально |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | URL вашего приложения |

### 5. Настройка базы данных PostgreSQL

#### Вариант A: Vercel Postgres (Рекомендуется)

1. В панели Vercel перейдите в "Storage"
2. Нажмите "Create Database" → "Postgres"
3. Выберите план (Hobby - бесплатный)
4. Скопируйте `DATABASE_URL` из настроек базы данных
5. Добавьте его в переменные окружения

#### Вариант B: Внешняя база данных

Можете использовать:
- **Neon** (бесплатно): [neon.tech](https://neon.tech)
- **Supabase** (бесплатно): [supabase.com](https://supabase.com)
- **Railway** (бесплатно): [railway.app](https://railway.app)

### 6. Первоначальная миграция базы данных

После создания базы данных выполните миграцию:

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Выполните миграцию
npx prisma migrate deploy
```

### 7. Развертывание

1. В панели Vercel нажмите "Deploy"
2. Дождитесь завершения сборки
3. Получите URL вашего приложения

### 8. Проверка работы

1. Откройте URL приложения
2. Проверьте регистрацию/вход
3. Убедитесь, что база данных работает

## 🔧 Дополнительные настройки

### Настройка домена (опционально)

1. В настройках проекта перейдите в "Domains"
2. Добавьте ваш домен
3. Настройте DNS записи

### Мониторинг

Vercel предоставляет:
- Логи приложения
- Метрики производительности
- Анализ ошибок

## 🚨 Решение проблем

### Ошибка базы данных

```bash
# Проверьте подключение
npx prisma db pull

# Выполните миграцию заново
npx prisma migrate reset
npx prisma migrate deploy
```

### Ошибка сборки

1. Проверьте логи в панели Vercel
2. Убедитесь, что все переменные окружения настроены
3. Проверьте синтаксис кода

### Проблемы с Prisma

```bash
# Перегенерируйте клиент
npx prisma generate

# Проверьте схему
npx prisma validate
```

## 📊 Мониторинг и обновления

### Автоматические деплои

Vercel автоматически развертывает изменения при push в main ветку.

### Обновление базы данных

```bash
# Создайте новую миграцию
npx prisma migrate dev --name your-migration-name

# Примените в продакшене
npx prisma migrate deploy
```

## 💰 Стоимость

**Бесплатный план Vercel включает:**
- 100GB bandwidth/месяц
- 100 serverless function executions/день
- 6 часов build time/месяц
- Неограниченные статические сайты

**Для большинства проектов этого достаточно!**

## 🎉 Готово!

Ваше приложение теперь доступно по адресу: `https://your-app-name.vercel.app`

---

## Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
