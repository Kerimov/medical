@echo off
echo ========================================
echo   Медицинский Ассистент - Установка
echo ========================================

echo.
echo 1. Установка зависимостей...
call npm install
if %errorlevel% neq 0 (
    echo ОШИБКА: Не удалось установить зависимости
    pause
    exit /b 1
)

echo.
echo 2. Генерация Prisma клиента...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ОШИБКА: Не удалось сгенерировать Prisma клиент
    pause
    exit /b 1
)

echo.
echo 3. Создание базы данных...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ОШИБКА: Не удалось создать базу данных
    pause
    exit /b 1
)

echo.
echo 4. Заполнение тестовыми данными...
call node prisma/seed.js
if %errorlevel% neq 0 (
    echo ОШИБКА: Не удалось заполнить базу данных
    pause
    exit /b 1
)

echo.
echo 5. Проверка .env.local...
if not exist .env.local (
    echo ВНИМАНИЕ: Файл .env.local не найден!
    echo Скопируйте env.example в .env.local и настройте API ключи
    copy env.example .env.local
    echo.
    echo Файл .env.local создан. Отредактируйте его и добавьте:
    echo - JWT_SECRET (любая строка)
    echo - OPENAI_API_KEY (ваш ключ OpenAI)
    echo - NEXT_PUBLIC_ADMIN_EMAILS (ваш email)
    echo.
    pause
)

echo.
echo ========================================
echo   Установка завершена успешно!
echo ========================================
echo.
echo Следующие шаги:
echo 1. Отредактируйте .env.local (если еще не сделали)
echo 2. Запустите: npm run dev
echo 3. Откройте: http://localhost:3000
echo 4. Войдите как администратор: admin@example.com / admin123
echo 5. Или как пациент: testpatient@example.com / test123
echo.
pause
