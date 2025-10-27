# ⚡ Быстрое развертывание на Vercel

## 🚀 За 5 минут

### 1. Подготовка (1 мин)
```bash
# Сгенерируйте JWT секрет
npm run generate:jwt

# Зафиксируйте изменения
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Создание проекта на Vercel (2 мин)
1. Идите на [vercel.com](https://vercel.com) → Sign Up (через GitHub)
2. New Project → Import ваш репозиторий
3. Deploy (пока без переменных окружения)

### 3. Настройка базы данных (1 мин)
1. В Vercel → Storage → Create Database → Postgres
2. Выберите Hobby (бесплатный) план
3. Скопируйте `DATABASE_URL`

### 4. Переменные окружения (1 мин)
В Vercel → Settings → Environment Variables добавьте:

| Переменная | Значение |
|------------|----------|
| `JWT_SECRET` | Результат `npm run generate:jwt` |
| `DATABASE_URL` | Из шага 3 |
| `NEXT_PUBLIC_ADMIN_EMAILS` | `admin@example.com` |
| `OPENAI_API_KEY` | Ваш OpenAI ключ |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

### 5. Миграция базы данных
```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите
vercel login

# Выполните миграцию
npx prisma migrate deploy
```

### 6. Пересборка
В Vercel → Deployments → Redeploy

## ✅ Готово!

Ваше приложение доступно по адресу: `https://your-app-name.vercel.app`

---

## 🔧 Если что-то пошло не так

### Ошибка базы данных
```bash
npx prisma db pull
npx prisma migrate deploy
```

### Ошибка сборки
- Проверьте все переменные окружения
- Убедитесь, что `DATABASE_URL` правильный
- Проверьте логи в Vercel

### Нужна помощь?
Смотрите полное руководство: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
