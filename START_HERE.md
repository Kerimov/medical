# 🚀 НАЧНИТЕ ЗДЕСЬ

## ⚡ Быстрый запуск (5 минут)

### 1. Установка
```bash
git clone <repository-url>
cd medical
npm install
cp env.example .env.local
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```

### 2. Настройка .env.local
```env
JWT_SECRET=my-super-secret-jwt-key-123456789
OPENAI_API_KEY=sk-proj-your-openai-key-here
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com
```

### 3. Проверка
- Откройте: http://localhost:3000
- Войдите: `seed@example.com` / `seed1234`

## 📚 Документация

### Для быстрого старта
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - 5-минутная установка
- **[QUICK_COMMANDS.md](./QUICK_COMMANDS.md)** - Команды для копирования
- **[INSTALL_COMMANDS.txt](./INSTALL_COMMANDS.txt)** - Готовые команды

### Для настройки
- **[API_KEYS_SETUP.md](./API_KEYS_SETUP.md)** - Настройка API ключей
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Чек-лист готовности

### Для решения проблем
- **[TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)** - Устранение неполадок
- **[README.md](./README.md)** - Полная документация

### Навигация
- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Индекс всей документации
- **[SETUP_SUMMARY.md](./SETUP_SUMMARY.md)** - Резюме настройки

## 🆘 Если что-то не работает

1. Проверьте **[TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)**
2. Изучите **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)**
3. Проверьте логи в консоли
4. Перезапустите сервер

## 🎯 Следующие шаги

1. **Настройте API ключи** для полной функциональности
2. **Создайте свой аккаунт** через регистрацию
3. **Загрузите тестовые документы** для проверки
4. **Изучите AI-функции** через чат с документами

---

**Время установки**: 5 минут  
**Сложность**: Низкая  
**Результат**: Полностью рабочая система
