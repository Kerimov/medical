# 🚀 Быстрое развертывание на новом компьютере

## ⚡ Экспресс-установка (5 минут)

### 1. Подготовка
```bash
# Убедитесь, что установлены:
node --version  # Должен быть 18+
npm --version   # Должен быть 8+
git --version   # Любая версия
```

### 2. Клонирование и установка
```bash
git clone <repository-url>
cd medical
npm install
```

### 3. Настройка окружения
```bash
# Скопируйте пример конфигурации
cp env.example .env.local

# Отредактируйте .env.local и добавьте:
# JWT_SECRET=любая-строка-для-безопасности
# OPENAI_API_KEY=ваш-ключ-openai
# NEXT_PUBLIC_ADMIN_EMAILS=ваш-email@example.com
```

### 4. Инициализация базы данных
```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
```

### 5. Запуск
```bash
npm run dev
```

### 6. Проверка
- Откройте: http://localhost:3000
- Войдите: `seed@example.com` / `seed1234`

## 🔑 Минимальные настройки

Если у вас нет API ключей, приложение будет работать с ограниченной функциональностью:

```env
JWT_SECRET=my-secret-key-123
OPENAI_API_KEY=sk-test-key
NEXT_PUBLIC_ADMIN_EMAILS=test@example.com
```

## 🆘 Если что-то не работает

### Порт занят
```bash
# Windows
taskkill /f /im node.exe

# Linux/Mac
pkill -f node
```

### Ошибки базы данных
```bash
npx prisma generate
npx prisma db push --force-reset
node prisma/seed.js
```

### Проблемы с зависимостями
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📋 Чек-лист готовности

- [ ] Node.js 18+ установлен
- [ ] Проект склонирован
- [ ] `npm install` выполнен успешно
- [ ] `.env.local` создан и настроен
- [ ] База данных инициализирована
- [ ] Сервер запускается без ошибок
- [ ] Сайт открывается в браузере
- [ ] Вход с тестовыми данными работает

## 🎯 Что дальше?

1. **Получите OpenAI API ключ** для AI функций
2. **Создайте свой аккаунт** через регистрацию
3. **Загрузите тестовые документы** для проверки
4. **Изучите функции** через интерфейс

---

**Время установки**: ~5 минут  
**Сложность**: Низкая  
**Требования**: Node.js, Git, интернет
