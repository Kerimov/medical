# 🏥 Медицинский Ассистент

Веб-приложение для управления медицинскими документами и анализами с использованием AI для распознавания и анализа медицинских данных.

## 🚀 Быстрый старт

### Автоматическая установка

**Windows:**
```bash
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Ручная установка

```bash
# 1. Установка зависимостей
npm install

# 2. Настройка переменных окружения
cp env.example .env.local
# Отредактируйте .env.local - добавьте ваши API ключи

# 3. Настройка базы данных
npx prisma generate
npx prisma db push
node prisma/seed.js

# 4. Запуск
npm run dev
```

## 📋 Обязательные настройки

Создайте файл `.env.local` с обязательными переменными:

```env
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=sk-proj-your-openai-key
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com
```

## 🔑 Тестовый вход

- **Email**: `seed@example.com`
- **Пароль**: `seed1234`

## ✨ Основные функции

- 📄 **Загрузка документов** - PDF/изображения медицинских анализов
- 🤖 **AI анализ** - Автоматическое распознавание и структурирование данных
- 📊 **Управление анализами** - Категоризация и группировка результатов
- 💬 **Интеллектуальные комментарии** - AI-генерируемые пояснения
- 🔔 **Умные напоминания** - Автоматические рекомендации на основе анализов
- 👥 **Изоляция данных** - Каждый пользователь видит только свои данные
- 🔐 **Безопасность** - JWT аутентификация и авторизация

## 🛠 Технологии

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **База данных**: SQLite (разработка), PostgreSQL/MySQL (продакшн)
- **AI**: OpenAI GPT-4o-mini, OCR.space, Tesseract.js
- **Аутентификация**: JWT токены, bcrypt

## 📁 Структура проекта

```
medical-1/
├── app/                    # Next.js App Router
│   ├── api/               # API маршруты
│   ├── dashboard/         # Главная панель
│   ├── analyses/          # Страницы анализов
│   ├── documents/         # Страницы документов
│   └── reminders/         # Страницы напоминаний
├── components/            # React компоненты
├── contexts/              # React контексты
├── lib/                   # Утилиты и библиотеки
├── prisma/                # Схема базы данных
└── public/                # Статические файлы
```

## 🔧 Разработка

### Доступные команды

```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для продакшена
npm run start        # Запуск продакшен версии
npm run lint         # Проверка кода
npx prisma studio    # GUI для базы данных
```

### Просмотр базы данных

```bash
npx prisma studio
```

## 🚨 Решение проблем

### Порт занят
```bash
# Windows
taskkill /f /im node.exe

# Linux/Mac
pkill -f node

# Очистка кэша
rm -rf .next
npm run dev
```

### Ошибки базы данных
```bash
npx prisma generate
npx prisma db push --force-reset
node prisma/seed.js
```

## 📚 Документация

- **Полная документация**: [SETUP_README.md](./SETUP_README.md)
- **Быстрый старт**: [QUICK_SETUP.md](./QUICK_SETUP.md)
- **Пример конфигурации**: [env.example](./env.example)

## 🔒 Безопасность

- Всегда меняйте `JWT_SECRET` в продакшене
- Не коммитьте `.env.local` файлы
- Используйте HTTPS в продакшене
- Ограничьте доступ к админским функциям

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи в консоли браузера и сервера
2. Убедитесь, что все переменные окружения настроены
3. Проверьте статус внешних API (OpenAI, OCR.space)
4. Обратитесь к документации в `SETUP_README.md`

---

**Примечание**: Этот проект использует SQLite для простоты разработки. В продакшене рекомендуется использовать PostgreSQL или MySQL.