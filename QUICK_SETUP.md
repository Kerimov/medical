# Быстрый старт - Медицинский Ассистент

## 1. Установка (5 минут)

```bash
# Клонирование и установка
git clone <repository-url>
cd medical-1
npm install

# Создание .env.local
cp .env.example .env.local
# Отредактируйте .env.local - добавьте ваши API ключи

# Настройка БД
npx prisma generate
npx prisma db push
node prisma/seed.js

# Запуск
npm run dev
```

## 2. Обязательные настройки в .env.local

```env
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=sk-proj-your-openai-key
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com
```

## 3. Тестовый вход

- **Email**: `seed@example.com`
- **Пароль**: `seed1234`

## 4. Проверка работы

1. Откройте `http://localhost:3000`
2. Войдите с тестовыми данными
3. Загрузите PDF с медицинским анализом
4. Проверьте создание напоминаний

## 5. Если что-то не работает

```bash
# Очистка и перезапуск
rm -rf .next node_modules
npm install
npx prisma generate
npx prisma db push
npm run dev
```

**Полная документация**: см. `SETUP_README.md`
