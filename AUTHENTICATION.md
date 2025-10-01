# 🔐 Система Аутентификации - ПМА

## Обзор

Полноценная система аутентификации Персонального Медицинского Ассистента с регистрацией, входом и защищенными маршрутами.

## Реализованные функции

### ✅ Регистрация пользователей
- Страница: `/register`
- Валидация email и пароля
- Хеширование паролей (bcrypt)
- Автоматический вход после регистрации

### ✅ Вход в систему
- Страница: `/login`
- Проверка credentials
- JWT токены (срок действия 7 дней)
- Сохранение токена в cookies

### ✅ Личный кабинет
- Страница: `/dashboard`
- Защищенный маршрут (требует авторизации)
- Отображение информации о пользователе
- Карточки основных функций
- Статистика и активность

### ✅ Управление сессией
- React Context для состояния пользователя
- Автоматическая проверка токена при загрузке
- Кнопка выхода
- Динамическая навигация

## Архитектура

### Backend API Routes

#### POST `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Иван Иванов"
}
```

**Ответ:**
```json
{
  "message": "Регистрация успешна",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Иван Иванов"
  }
}
```

#### POST `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ:**
```json
{
  "message": "Вход выполнен успешно",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Иван Иванов"
  }
}
```

#### GET `/api/auth/me`
**Headers:** `Authorization: Bearer {token}`

**Ответ:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Иван Иванов"
  }
}
```

### Frontend

#### AuthContext
Глобальный контекст для управления состоянием аутентификации:
- `user` - текущий пользователь или null
- `login(email, password)` - функция входа
- `register(email, password, name)` - функция регистрации
- `logout()` - функция выхода
- `isLoading` - состояние загрузки

#### Использование в компонентах

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, login, logout, isLoading } = useAuth()
  
  if (isLoading) return <div>Загрузка...</div>
  
  if (!user) {
    return <div>Пожалуйста, войдите</div>
  }
  
  return <div>Привет, {user.name}!</div>
}
```

## Безопасность

### Реализовано:
- ✅ Хеширование паролей с bcrypt (salt rounds: 10)
- ✅ JWT токены с истечением срока действия (7 дней)
- ✅ Валидация на клиенте и сервере
- ✅ Secure cookies для хранения токенов
- ✅ Проверка авторизации для защищенных маршрутов

### TODO (для продакшена):
- ⏳ HTTPS обязательно
- ⏳ Rate limiting для API
- ⏳ CSRF защита
- ⏳ Email верификация
- ⏳ 2FA (двухфакторная аутентификация)
- ⏳ Восстановление пароля
- ⏳ Refresh tokens
- ⏳ Переход на базу данных (PostgreSQL + Prisma)

## База данных

### Текущая реализация
Временное хранилище в памяти (`lib/db.ts`)

### Для продакшена
Необходимо заменить на PostgreSQL с Prisma:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Тестирование

### Регистрация нового пользователя:
1. Откройте http://localhost:3000/register
2. Заполните форму:
   - Имя: Тестовый Пользователь
   - Email: test@example.com
   - Пароль: test123
3. Нажмите "Зарегистрироваться"
4. Вы будете автоматически перенаправлены в личный кабинет

### Вход:
1. Откройте http://localhost:3000/login
2. Введите credentials
3. Нажмите "Войти"

### Выход:
В личном кабинете нажмите кнопку с иконкой выхода

## Переменные окружения

Создайте файл `.env.local`:

```bash
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ ВАЖНО:** Используйте сильный случайный ключ для `JWT_SECRET` в продакшене!

## Известные ограничения

1. **Хранилище в памяти** - данные теряются при перезапуске сервера
2. **Нет восстановления пароля** - будет добавлено позже
3. **Нет email верификации** - будет добавлено позже
4. **Нет refresh tokens** - токены действуют 7 дней

## Следующие шаги

1. Интеграция с PostgreSQL и Prisma
2. Email верификация
3. Восстановление пароля
4. Профиль пользователя с редактированием
5. Загрузка аватара
6. 2FA опция

