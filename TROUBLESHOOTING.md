# 🔧 Решение проблем

## ❗ Проблема: "Неверный email или пароль" при входе

### Причина
Текущая версия использует **временное хранилище в памяти** для демонстрации функционала. Данные пользователей хранятся только пока сервер запущен.

**Когда данные теряются:**
- ❌ При перезапуске сервера (`npm run dev`)
- ❌ При изменении файлов (hot reload)
- ❌ При перезагрузке системы

### Решение

#### Вариант 1: Зарегистрируйтесь заново
1. Откройте http://localhost:3000/register
2. Создайте новый аккаунт с любыми данными:
   - **Имя:** Иван Петров
   - **Email:** test@example.com
   - **Пароль:** test123

#### Вариант 2: Проверьте количество пользователей
Откройте отладочный эндпоинт:
```
http://localhost:3000/api/debug/users
```

Вы увидите:
```json
{
  "totalUsers": 0,
  "users": []
}
```

Если `totalUsers: 0` - база пуста, нужно зарегистрироваться.

### Проверка в консоли сервера

После регистрации в терминале должно появиться:
```
User registered: test@example.com
Total users in DB: 1
```

При попытке входа:
```
Login attempt for: test@example.com
Total users in DB: 1
```

## 🔄 Постоянное хранилище данных

### Планируется в следующих версиях

**Этап 3: Интеграция с PostgreSQL**

1. **Установка PostgreSQL и Prisma:**
```bash
npm install prisma @prisma/client
npm install -D prisma
```

2. **Инициализация Prisma:**
```bash
npx prisma init
```

3. **Настройка схемы (`prisma/schema.prisma`):**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

4. **Миграция:**
```bash
npx prisma migrate dev --name init
```

5. **Обновление кода:**
Заменить `lib/db.ts` на Prisma Client:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const db = {
  users: prisma.user
}
```

### Альтернативы

1. **Supabase** - PostgreSQL как сервис + встроенная аутентификация
2. **PlanetScale** - Serverless MySQL
3. **MongoDB Atlas** - NoSQL вариант
4. **SQLite** - Локальная файловая БД (не рекомендуется для продакшена)

## 🐛 Другие частые проблемы

### 404 на `/api/auth/me`
**Причина:** Файл не скомпилировался  
**Решение:** Перезапустите сервер

### JWT токен истек
**Причина:** Токен действителен 7 дней  
**Решение:** Выйдите и войдите заново

### CORS ошибки
**Причина:** Запросы с другого домена  
**Решение:** Настройте CORS в `next.config.mjs`

## 📊 Отладка

### Проверка логов сервера
Смотрите в терминал где запущен `npm run dev`

### Проверка Network в DevTools
1. Откройте DevTools (F12)
2. Вкладка Network
3. Попробуйте войти/зарегистрироваться
4. Посмотрите запросы к `/api/auth/*`

### Проверка токена в cookies
1. DevTools → Application → Cookies
2. Найдите `token`
3. Скопируйте и проверьте на https://jwt.io

## 🔐 Безопасность в текущей версии

### Что работает:
✅ Хеширование паролей (bcrypt)  
✅ JWT токены  
✅ Валидация на клиенте и сервере  

### Что НЕ работает (пока):
⚠️ Постоянное хранение  
⚠️ Email верификация  
⚠️ Восстановление пароля  
⚠️ 2FA  
⚠️ Rate limiting  
⚠️ HTTPS (в dev режиме)  

## 💡 Советы

1. **Не перезапускайте сервер** без необходимости во время тестирования
2. **Используйте одни и те же credentials** для тестов
3. **Проверяйте консоль** на наличие ошибок
4. **Сохраните email и пароль** тестового пользователя

## 📞 Нужна помощь?

Если проблема не решена:
1. Проверьте консоль браузера (F12)
2. Проверьте терминал сервера
3. Откройте `/api/debug/users` для проверки БД
4. Попробуйте полностью перезапустить сервер

