/**
 * Конфигурация API
 */

// Проверяем наличие обязательных environment переменных
const requiredEnvVars = {
	API_URL: import.meta.env.VITE_API_URL,
	TELEGRAM_BOT_USERNAME: import.meta.env.VITE_TELEGRAM_BOT_USERNAME,
} as const;

// Валидация environment переменных
function validateEnvVars() {
	const missing: string[] = [];

	Object.entries(requiredEnvVars).forEach(([key, value]) => {
		if (!value || value.trim() === '') {
			missing.push(`VITE_${key}`);
		}
	});

	if (missing.length > 0) {
		console.warn(
			`⚠️  Отсутствуют environment переменные: ${missing.join(', ')}\n` +
				`Создайте файл .env.local на основе .env.example`,
		);
	}
}

// Запускаем валидацию только в development mode
if (import.meta.env.DEV) {
	validateEnvVars();
}

// Определяем базовый URL для API с fallback значением
export const API_BASE_URL =
	import.meta.env.VITE_API_URL ||
	(import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');

// Telegram Bot Username с fallback
export const TELEGRAM_BOT_USERNAME =
	import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'myach_pro_bot';

// Экспортируем для использования в других файлах
export const API_CONFIG = {
	baseUrl: API_BASE_URL,
	timeout: 10000, // 10 секунд
	telegramBot: TELEGRAM_BOT_USERNAME,
} as const;

// Экспортируем функцию для проверки готовности API
export const isApiConfigured = () => {
	return Boolean(API_BASE_URL && TELEGRAM_BOT_USERNAME);
};
