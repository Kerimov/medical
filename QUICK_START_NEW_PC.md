# ⚡ Быстрый старт на новом компьютере

Минимальная инструкция для запуска проекта за 5 минут.

---

## 📋 Шаг 1: Установка Node.js

Скачайте и установите Node.js 18+ с [nodejs.org](https://nodejs.org/)

Проверка:
```bash
node --version  # Должно быть v18.0.0+
npm --version   # Должно быть 9.0.0+
```

---

## 📦 Шаг 2: Установка зависимостей

```bash
cd medical-1
npm install
```

---

## ⚙️ Шаг 3: Настройка окружения

### Windows PowerShell:
```powershell
Copy-Item env.example .env.local
```

### Linux/macOS:
```bash
cp env.example .env.local
```

### Отредактируйте `.env.local`:

**Минимальная конфигурация:**
```env
JWT_SECRET=your-secret-key-change-this
OPENAI_API_KEY=sk-proj-your-key-here
OCR_SPACE_API_KEY=your-key-here
DATABASE_URL="file:./prisma/dev.db"
```

**Где взять ключи:**
- OpenAI: [platform.openai.com](https://platform.openai.com/) → API Keys
- OCR.space: [ocr.space/ocrapi](https://ocr.space/ocrapi) → Free API Key

---

## 🗄️ Шаг 4: Настройка базы данных

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

---

## 🚀 Шаг 5: Запуск

```bash
npm run dev
```

Откройте: **http://localhost:3000**

---

## 👤 Тестовые учетные данные

После выполнения `npm run db:seed`:

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | admin@pma.ru | admin123 |
| Пациент | test@pma.ru | test123 |
| Врач | doctor@pma.ru | doctor123 |

---

## 🛠️ Дополнительно

### Prisma Studio (визуальный редактор БД):
```bash
npm run prisma:studio
```
Откройте: **http://localhost:5555**

### Если порт 3000 занят:
Next.js автоматически использует порт 3001

---

## ❗ Частые проблемы

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
npm install
```

### "Invalid token"
1. Очистите cookies браузера
2. Перезапустите сервер
3. Войдите заново

### OCR/AI не работает
1. Проверьте API ключи в `.env.local`
2. Перезапустите сервер: `Ctrl+C` → `npm run dev`

---

## 📚 Полная документация

Смотрите `README_SETUP.md` для подробной информации.

---

## ✅ Готово!

Теперь можно:
- 📊 Загружать анализы
- 📅 Записываться на прием
- 🤖 Общаться с AI-ассистентом
- 👨‍⚕️ Управлять пациентами (для врачей)

**Приятной работы!** 🎉
