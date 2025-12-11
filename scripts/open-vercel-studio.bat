@echo off
echo ========================================
echo Prisma Studio для Vercel Production DB
echo ========================================
echo.
echo ВАЖНО: Тебе нужно получить DATABASE_URL из Vercel:
echo 1. Зайди в Vercel - Storage - твоя база Postgres
echo 2. Скопируй Connection String
echo.
set /p DATABASE_URL="Вставь DATABASE_URL (postgresql://...): "
echo.
echo Запускаю Prisma Studio...
echo Открой http://localhost:5555 в браузере
echo.
set DATABASE_URL=%DATABASE_URL%
npx prisma studio
pause

