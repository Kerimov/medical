# 🤖 Автоматический скрипт развертывания

## Шаг 1: Генерация JWT секрета
```bash
npm run generate:jwt
```
**Скопируйте результат и сохраните!**

## Шаг 2: Подготовка репозитория
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

## Шаг 3: Создание Vercel проекта

### 3.1 Откройте Vercel
Перейдите на: https://vercel.com/new

### 3.2 Импорт репозитория
- Нажмите "Import Git Repository"
- Вставьте: `https://github.com/Kerimov/medical.git`
- Нажмите "Import"

### 3.3 Настройка проекта
- **Project Name:** `medical` (или любое другое)
- **Framework Preset:** Next.js (автоматически определится)
- **Root Directory:** `./` (по умолчанию)
- **Build Command:** `npm run build` (по умолчанию)
- **Output Directory:** `.next` (по умолчанию)

## Шаг 4: Создание базы данных

### 4.1 В панели Vercel
1. Перейдите в "Storage" (в боковом меню)
2. Нажмите "Create Database"
3. Выберите "Postgres"
4. Выберите план "Hobby" (бесплатный)
5. Нажмите "Create"

### 4.2 Получение DATABASE_URL
1. В настройках базы данных найдите "Connection String"
2. Скопируйте URL (начинается с `postgresql://`)

## Шаг 5: Настройка переменных окружения

### 5.1 В настройках проекта
1. Перейдите в "Settings" → "Environment Variables"
2. Добавьте следующие переменные:

| Переменная | Значение | Описание |
|------------|----------|----------|
| `JWT_SECRET` | `[результат из шага 1]` | JWT секрет |
| `DATABASE_URL` | `[из шага 4.2]` | URL базы данных |
| `NEXT_PUBLIC_ADMIN_EMAILS` | `admin@example.com` | Email админов |
| `OPENAI_API_KEY` | `sk-your-openai-key` | OpenAI API ключ |
| `OCR_SPACE_API_KEY` | `your-ocr-key` | OCR Space ключ (опционально) |
| `NEXTAUTH_URL` | `https://medical-xxx.vercel.app` | URL приложения |

### 5.2 Сохранение
Нажмите "Save" для каждой переменной

## Шаг 6: Миграция базы данных

### 6.1 Установка Vercel CLI
```bash
npm install -g vercel
```

### 6.2 Вход в аккаунт
```bash
vercel login
```
Следуйте инструкциям в браузере

### 6.3 Выполнение миграции
```bash
npx prisma migrate deploy
```

## Шаг 7: Развертывание

### 7.1 В панели Vercel
1. Перейдите в "Deployments"
2. Нажмите "Redeploy" на последнем деплое
3. Дождитесь завершения сборки

### 7.2 Проверка
1. Откройте URL вашего приложения
2. Проверьте регистрацию/вход
3. Убедитесь, что все функции работают

## 🎉 Готово!

Ваше приложение будет доступно по адресу:
`https://medical-xxx.vercel.app`

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
