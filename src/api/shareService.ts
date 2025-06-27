import { api } from './apiService';

// Новая структура - передаем только IDs игроков по категориям
export interface ShareData {
	categorizedPlayerIds: { [categoryName: string]: string[] };
	categories: Array<{ name: string; color: string; slots: number }>;
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
		const response = await api.post(
			'/share/results',
			{
				shareData,
			},
			{
				headers: {
					Authorization: `tma ${initData}`,
				},
			},
		);

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
 * Получение изображения для предварительного просмотра (сжатое)
 */
export async function previewResultsImage(
	initData: string,
	data: ShareData,
): Promise<Blob> {
	try {
		const response = await api.post('/share/preview', data, {
			responseType: 'blob',
			timeout: 30000, // 30 секунд таймаут
			headers: {
				Authorization: `tma ${initData}`,
			},
		});

		if (response.data instanceof Blob) {
			return response.data;
		}

		throw new Error('Неверный формат ответа сервера');
	} catch (error: any) {
		console.error('Ошибка при получении превью изображения:', error);

		if (error.code === 'ECONNABORTED') {
			throw new Error('Превышено время ожидания генерации изображения');
		}

		if (error.response?.status === 400) {
			throw new Error('Неверные данные для генерации изображения');
		}

		if (error.response?.status >= 500) {
			throw new Error('Ошибка сервера при генерации изображения');
		}

		throw new Error('Не удалось сгенерировать изображение');
	}
}

/**
 * Получение изображения в высоком качестве для шэринга/скачивания
 */
export async function downloadResultsImage(
	initData: string,
	data: ShareData,
): Promise<{
	blob: Blob;
	filename: string;
}> {
	try {
		const response = await api.post('/share/download', data, {
			responseType: 'blob',
			timeout: 60000, // 60 секунд таймаут для высокого качества
			headers: {
				Authorization: `tma ${initData}`,
			},
		});

		if (!(response.data instanceof Blob)) {
			throw new Error('Неверный формат ответа сервера');
		}

		// Извлекаем имя файла из заголовков
		const contentDisposition = response.headers['content-disposition'];
		let filename = 'tier-list.jpg';

		if (contentDisposition) {
			const filenameMatch = contentDisposition.match(
				/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
			);
			if (filenameMatch && filenameMatch[1]) {
				filename = filenameMatch[1].replace(/['"]/g, '');
			}
		}

		return {
			blob: response.data,
			filename,
		};
	} catch (error: any) {
		console.error('Ошибка при скачивании изображения:', error);

		if (error.code === 'ECONNABORTED') {
			throw new Error('Превышено время ожидания генерации изображения');
		}

		if (error.response?.status === 400) {
			throw new Error('Неверные данные для генерации изображения');
		}

		if (error.response?.status >= 500) {
			throw new Error('Ошибка сервера при генерации изображения');
		}

		throw new Error('Не удалось сгенерировать изображение');
	}
}

/**
 * Проверка доступности сервиса шэринга
 */
export async function checkShareServiceHealth(): Promise<boolean> {
	try {
		// Делаем легкий запрос для проверки доступности
		await api.get('/health');
		return true;
	} catch (error) {
		console.warn('Сервис шэринга недоступен:', error);
		return false;
	}
}
