#!/bin/bash

echo "========================================"
echo "Prisma Studio для Vercel Production DB"
echo "========================================"
echo ""
echo "ВАЖНО: Тебе нужно получить DATABASE_URL из Vercel:"
echo "1. Зайди в Vercel → Storage → твоя база Postgres"
echo "2. Скопируй Connection String"
echo ""
read -p "Вставь DATABASE_URL (postgresql://...): " DATABASE_URL
echo ""
echo "Запускаю Prisma Studio..."
echo "Открой http://localhost:5555 в браузере"
echo ""
export DATABASE_URL="$DATABASE_URL"
npx prisma studio

