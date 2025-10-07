# 📋 Команды для установки (копируй и вставляй)

Все команды для быстрой установки проекта на новом компьютере.

---

## Windows PowerShell

```powershell
# 1. Установка зависимостей
npm install

# 2. Копирование файла окружения
Copy-Item env.example .env.local

# 3. Настройка базы данных
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed

# 4. Запуск приложения
npm run dev

# 5. (Опционально) Запуск Prisma Studio
npm run prisma:studio
```

---

## Linux / macOS

```bash
# 1. Установка зависимостей
npm install

# 2. Копирование файла окружения
cp env.example .env.local

# 3. Настройка базы данных
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed

# 4. Запуск приложения
npm run dev

# 5. (Опционально) Запуск Prisma Studio
npm run prisma:studio
```

---

## Одной командой (после настройки .env.local)

### Windows:
```powershell
npm install && npx prisma generate && npx prisma migrate dev --name init && npm run db:seed && npm run dev
```

### Linux/macOS:
```bash
npm install && npx prisma generate && npx prisma migrate dev --name init && npm run db:seed && npm run dev
```

---

## Очистка и переустановка (если что-то пошло не так)

### Windows:
```powershell
# Удаление зависимостей и базы данных
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .next
Remove-Item -Force prisma\dev.db
Remove-Item -Force package-lock.json

# Переустановка
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

### Linux/macOS:
```bash
# Удаление зависимостей и базы данных
rm -rf node_modules .next prisma/dev.db package-lock.json

# Переустановка
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

---

## Остановка процессов

### Windows:
```powershell
# Остановить все процессы Node.js
taskkill /F /IM node.exe

# Освободить порт 3000
netstat -ano | findstr :3000
# Найдите PID и выполните:
taskkill /PID <PID> /F
```

### Linux/macOS:
```bash
# Остановить все процессы Node.js
killall node

# Освободить порт 3000
lsof -ti:3000 | xargs kill -9
```

---

## Генерация JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Скопируйте результат в `.env.local` как `JWT_SECRET`

---

## Проверка установки

```bash
# Проверка версий
node --version
npm --version

# Проверка Prisma
npx prisma --version

# Проверка базы данных
npx prisma studio
```

---

## Полезные команды для разработки

```bash
# Просмотр логов в реальном времени
npm run dev

# Проверка кода (линтер)
npm run lint

# Сборка для продакшена
npm run build

# Запуск продакшен версии
npm start

# Просмотр базы данных
npm run prisma:studio

# Создание новой миграции
npx prisma migrate dev --name <migration-name>

# Сброс базы данных
npx prisma migrate reset

# Обновление зависимостей
npm update
npm audit fix
```

---

## Готово! 🎉

После выполнения команд откройте:
- **Приложение**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555

**Тестовые данные:**
- Администратор: admin@pma.ru / admin123
- Пациент: test@pma.ru / test123
- Врач: doctor@pma.ru / doctor123
