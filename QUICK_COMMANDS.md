# ⚡ Быстрые команды

## 🚀 Установка (копируйте и вставляйте)

```bash
# 1. Клонирование
git clone <repository-url>
cd medical

# 2. Установка зависимостей
npm install

# 3. Настройка окружения
cp env.example .env.local

# 4. Инициализация БД
npx prisma generate
npx prisma db push
node prisma/seed.js

# 5. Запуск
npm run dev
```

## 🔑 Настройка .env.local

```env
JWT_SECRET=my-super-secret-jwt-key-123456789
OPENAI_API_KEY=sk-proj-your-openai-key-here
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com
OCR_SPACE_API_KEY=your-ocr-space-key-here
DATABASE_URL="file:./prisma/dev.db"
```

## 🧪 Тестовые данные

```
Email: seed@example.com
Пароль: seed1234
URL: http://localhost:3000
```

## 🛠 Полезные команды

```bash
# Запуск
npm run dev

# Сборка
npm run build

# Линтинг
npm run lint

# Prisma Studio
npx prisma studio

# Сброс БД
npx prisma db push --force-reset
node prisma/seed.js

# Очистка кэша
rm -rf .next
npm run dev
```

## 🚨 Решение проблем

```bash
# Порт занят
taskkill /f /im node.exe  # Windows
pkill -f node             # Linux/Mac

# Переустановка зависимостей
rm -rf node_modules package-lock.json
npm install

# Полный сброс
rm -rf .next node_modules package-lock.json
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```

## 📋 Проверка

```bash
# Версии
node --version
npm --version

# Статус
curl http://localhost:3000/api/parser-status

# Процессы
ps aux | grep node  # Linux/Mac
tasklist | findstr node  # Windows
```

---

**Время установки**: 5 минут  
**Сложность**: Низкая
