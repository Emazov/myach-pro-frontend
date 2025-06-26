import { api } from './apiService';
import type { Category } from '../types';

// Новая структура - передаем только IDs игроков по категориям
export interface ShareData {
	categorizedPlayerIds: { [categoryName: string]: string[] };
	categories: Category[];
	clubId: string; // Передаем ID клуба вместо названия и URL
}

/**
 * Отправляет данные результатов на сервер для генерации и отправки изображения в Telegram
 */
export const shareResults = async (
	initData: string,
	shareData: ShareData,
): Promise<{ success: boolean; message: string; closeWebApp?: boolean }> => {
	try {
		const response = await api.post('/share/results', {
			initData,
			shareData,
		});

		return response.data;
	} catch (error: any) {
		console.error('Ошибка при отправке результатов:', error);

		throw new Error(
			error.response?.data?.error ||
				'Произошла ошибка при отправке результатов',
		);
	}
};

/**
 * Получает предварительный просмотр изображения (для тестирования)
 */
export const previewResultsImage = async (
	shareData: ShareData,
): Promise<Blob> => {
	try {
		const response = await api.post('/share/preview', shareData, {
			responseType: 'blob',
		});

		return response.data;
	} catch (error: any) {
		console.error('Ошибка при получении превью изображения:', error);

		throw new Error(
			error.response?.data?.error || 'Произошла ошибка при создании превью',
		);
	}
};
