#!/bin/bash

echo "========================================"
echo "  Медицинский Ассистент - Установка"
echo "========================================"

echo ""
echo "1. Установка зависимостей..."
npm install
if [ $? -ne 0 ]; then
    echo "ОШИБКА: Не удалось установить зависимости"
    exit 1
fi

echo ""
echo "2. Генерация Prisma клиента..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "ОШИБКА: Не удалось сгенерировать Prisma клиент"
    exit 1
fi

echo ""
echo "3. Создание базы данных..."
npx prisma db push
if [ $? -ne 0 ]; then
    echo "ОШИБКА: Не удалось создать базу данных"
    exit 1
fi

echo ""
echo "4. Заполнение тестовыми данными..."
node prisma/seed.js
if [ $? -ne 0 ]; then
    echo "ОШИБКА: Не удалось заполнить базу данных"
    exit 1
fi

echo ""
echo "5. Проверка .env.local..."
if [ ! -f .env.local ]; then
    echo "ВНИМАНИЕ: Файл .env.local не найден!"
    echo "Копирую env.example в .env.local..."
    cp env.example .env.local
    echo ""
    echo "Файл .env.local создан. Отредактируйте его и добавьте:"
    echo "- JWT_SECRET (любая строка)"
    echo "- OPENAI_API_KEY (ваш ключ OpenAI)"
    echo "- NEXT_PUBLIC_ADMIN_EMAILS (ваш email)"
    echo ""
    read -p "Нажмите Enter для продолжения..."
fi

echo ""
echo "========================================"
echo "  Установка завершена успешно!"
echo "========================================"
echo ""
echo "Следующие шаги:"
echo "1. Отредактируйте .env.local (если еще не сделали)"
echo "2. Запустите: npm run dev"
echo "3. Откройте: http://localhost:3000"
echo "4. Войдите как администратор: admin@example.com / admin123"
echo "5. Или как пациент: testpatient@example.com / test123"
echo ""
