/**
 * Конфигурация API
 */

// Определяем базовый URL для API
export const API_BASE_URL = import.meta.env.VITE_API_URL;

// Экспортируем для использования в других файлах
export const API_CONFIG = {
	baseUrl: API_BASE_URL,
	timeout: 10000, // 10 секунд
} as const;
