#!/usr/bin/env node

/**
 * Скрипт для генерации JWT секрета
 * Использование: node scripts/generate-jwt-secret.js
 */

const crypto = require('crypto');

function generateJWTSecret() {
  // Генерируем случайную строку длиной 64 символа
  const secret = crypto.randomBytes(32).toString('hex');
  return secret;
}

function main() {
  console.log('🔐 Генерация JWT секрета для продакшена');
  console.log('=' .repeat(50));
  
  const secret = generateJWTSecret();
  
  console.log('Сгенерированный JWT_SECRET:');
  console.log(secret);
  console.log('');
  console.log('📋 Скопируйте этот ключ и добавьте в переменные окружения Vercel');
  console.log('');
  console.log('⚠️  ВАЖНО: Никогда не коммитьте этот ключ в репозиторий!');
  console.log('   Используйте его только в настройках Vercel');
}

if (require.main === module) {
  main();
}

module.exports = { generateJWTSecret };
