# PMA Medical Assistant — Быстрый запуск на новом ПК

Этот документ поможет развернуть проект на другом компьютере (Windows/macOS/Linux) с нуля.

## 1) Предустановки
- Node.js 18+ (рекомендуется LTS)
- Git
- (Опционально) pnpm или yarn — можно работать через npm

Проверка версий:
```bash
node -v
npm -v
```

## 2) Клонирование проекта
```bash
git clone <YOUR_REPO_URL> medical-1
cd medical-1
```

## 3) Установка зависимостей
```bash
npm install
```

Если используете pnpm:
```bash
pnpm install
```

## 4) Переменные окружения
Скопируйте пример и заполните значения:
```bash
cp env.example .env.local
```
Минимально необходимо указать:
- JWT_SECRET — любой надёжный секрет
- NEXT_PUBLIC_ADMIN_EMAILS — список админ‑email через запятую (для доступа к админ‑панели)

Пример `.env.local`:
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NEXT_PUBLIC_ADMIN_EMAILS=admin@medical.com
OCR_SPACE_API_KEY=your-ocr-space-api-key
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
```

## 5) Подготовка БД (SQLite)
Сгенерируйте Prisma Client и примените схему в локальную БД:
```bash
npx prisma generate
npx prisma db push
```
Если во время `db push` сервер разработки был запущен и занял Prisma client, просто остановите `node` и повторите команду:
```bash
# Windows
taskkill /F /IM node.exe
# macOS/Linux
pkill -f node
npx prisma generate && npx prisma db push
```

(Опционально) первичное наполнение данными — не требуется. База создаётся пустой.

## 6) Запуск проекта
```bash
npm run dev
```
Адрес: http://localhost:3000

Первая компиляция может занять 10–30 секунд.

## 7) Вход и роли
- Зарегистрируйте нового пользователя на `/register` или войдите на `/login`
- Чтобы увидеть ссылку «Админ» в шапке, email пользователя должен быть включён в `NEXT_PUBLIC_ADMIN_EMAILS`
- Роль `ADMIN` также проверяется на серверных эндпоинтах админки

## 8) Полезные страницы
- Главная панель: `/dashboard`
- Документы: `/documents`
- Анализы: `/analyses`
- База знаний: `/knowledge-base`
- Дневник здоровья: `/diary` (создание, фильтрация, удаление)
- Аналитика: `/analytics` (KPI и тренды, 7 дней)
- Админ‑панель: `/admin` (для пользователей из `NEXT_PUBLIC_ADMIN_EMAILS` и с ролью ADMIN)

## 9) Типичные проблемы
1) EPERM при `prisma generate` / `db push` на Windows
   - Закрыть работающий `node.exe`: `taskkill /F /IM node.exe`
   - Повторить `npx prisma generate && npx prisma db push`
2) Гидратационные предупреждения
   - Выполните жёсткое обновление (Ctrl+F5)
   - Убедитесь, что не вложены компоненты `<Link>` друг в друга
3) «Unauthorized» в API
   - Проверьте наличие токена в `localStorage`
   - Повторно выполните вход на `/login`

## 10) Сборка/продакшен (опционально)
```bash
npm run build
npm run start
```
Приложение будет доступно на `http://localhost:3000`.

---
Если при запуске возникли вопросы — сообщите, я дополню инструкцию под ваш сценарий (Windows/macOS/Linux, Docker и т.д.).
