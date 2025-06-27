import axios from 'axios';
import type { Club, Player, User } from '../types';
import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

// Создаем axios instance для использования в других сервисах
export const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

/**
 * КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Генерируем заголовки для обхода кэша без CORS preflight
 */
const getNoCacheHeaders = (initData: string) => ({
	Authorization: `tma ${initData}`,
	'Content-Type': 'application/json',
	'Cache-Control': 'no-cache, no-store, must-revalidate',
	Pragma: 'no-cache',
	Expires: '0',
	// УБРАНО: 'X-Requested-At': Date.now().toString(), // Вызывает CORS preflight ошибки
});

/**
 * Получить список клубов с сервера
 */
export const fetchClubs = async (initData: string): Promise<Club[]> => {
	try {
		console.log('🔍 fetchClubs: Начало запроса', {
			timestamp: new Date().toISOString(),
			API_URL,
			initDataLength: initData?.length || 0,
		});

		// КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Используем заголовки для обхода кэша
		const url = `${API_URL}/clubs?t=${Date.now()}`;
		const headers = getNoCacheHeaders(initData);

		console.log('📡 Отправляем запрос:', { url, headers });

		const response = await fetch(url, { headers });

		console.log('📨 Получен ответ:', {
			status: response.status,
			statusText: response.statusText,
			headers: Object.fromEntries(response.headers.entries()),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ Ошибка ответа сервера:', errorText);
			throw new Error(
				`Ошибка при получении клубов: ${response.status} - ${errorText}`,
			);
		}

		const result = await response.json();
		console.log('📊 Данные от сервера:', result);

		// Преобразуем данные в нужный формат
		const clubs = result.clubs.map((club: any) => {
			return {
				id: club.id.toString(),
				name: club.name,
				img_url: club.logoUrl || '',
			};
		});

		console.log('✅ Преобразованные клубы:', clubs);
		return clubs;
	} catch (error) {
		console.error('❌ Ошибка при запросе клубов:', {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
			timestamp: new Date().toISOString(),
		});
		throw error;
	}
};

/**
 * Получить список игроков с сервера
 */
export const fetchPlayers = async (initData: string): Promise<Player[]> => {
	try {
		// КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Используем заголовки для обхода кэша
		const response = await fetch(`${API_URL}/players?t=${Date.now()}`, {
			headers: getNoCacheHeaders(initData),
		});

		if (!response.ok) {
			throw new Error(`Ошибка при получении игроков: ${response.status}`);
		}

		const result = await response.json();

		// Преобразуем данные в нужный формат
		return result.players.map((player: any, index: number) => {
			return {
				id: (index + 1).toString(),
				name: player.name,
				img_url: player.avatarUrl || '',
				club_id: '1',
			};
		});
	} catch (error) {
		console.error('Ошибка при запросе игроков:', error);
		throw error;
	}
};

/**
 * Получить список игроков конкретной команды
 */
export const fetchPlayersByClub = async (
	initData: string,
	clubId: string,
): Promise<Player[]> => {
	try {
		const club = await fetchClubById(initData, clubId);

		// Преобразуем игроков команды в нужный формат
		return club.players.map((player: any) => {
			return {
				id: player.id.toString(),
				name: player.name,
				img_url: player.avatarUrl || '',
				club_id: clubId,
			};
		});
	} catch (error) {
		console.error('Ошибка при запросе игроков команды:', error);
		throw error;
	}
};

/**
 * Аутентифицировать пользователя через Telegram
 * Отправляет initData на сервер для проверки и получения информации о пользователе
 */
export const authenticateTelegramUser = async (
	initData: string,
): Promise<User | null> => {
	try {
		const response = await fetch(`${API_URL}/auth`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `tma ${initData}`,
			},
		});

		if (response.status === 401 || response.status === 403) {
			// Неавторизованный или запрещенный доступ
			return null;
		}

		if (!response.ok) {
			throw new Error(
				`Ошибка при аутентификации пользователя: ${response.status}`,
			);
		}

		const result = await response.json();

		// Преобразуем данные в нужный формат
		return {
			id: result.user.id,
			telegramId: result.user.telegramId.toString(),
			role: result.role,
		};
	} catch (error) {
		console.error('Ошибка при аутентификации пользователя:', error);
		throw error;
	}
};

/**
 * Создать новый клуб (команду) - только для админа
 */
export const createClub = async (
	initData: string,
	formData: FormData,
): Promise<any> => {
	try {
		const response = await fetch(`${API_URL}/clubs`, {
			method: 'POST',
			headers: {
				Authorization: `tma ${initData}`,
			},
			body: formData,
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Ошибка при создании команды');
		}

		return await response.json();
	} catch (error) {
		console.error('Ошибка при создании команды:', error);
		throw error;
	}
};

/**
 * Создать нового игрока - только для админа
 */
export const createPlayer = async (
	initData: string,
	formData: FormData,
): Promise<any> => {
	try {
		const response = await fetch(`${API_URL}/players`, {
			method: 'POST',
			headers: {
				Authorization: `tma ${initData}`,
			},
			body: formData,
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Ошибка при создании игрока');
		}

		return await response.json();
	} catch (error) {
		console.error('Ошибка при создании игрока:', error);
		throw error;
	}
};

/**
 * Получить конкретную команду с игроками по ID
 */
export const fetchClubById = async (
	initData: string,
	clubId: string,
): Promise<any> => {
	try {
		// КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Используем заголовки для обхода кэша
		const response = await fetch(`${API_URL}/clubs/${clubId}?t=${Date.now()}`, {
			headers: getNoCacheHeaders(initData),
		});

		if (!response.ok) {
			throw new Error(`Ошибка при получении команды: ${response.status}`);
		}

		const result = await response.json();
		return result.club;
	} catch (error) {
		console.error('Ошибка при запросе команды:', error);
		throw error;
	}
};

/**
 * Обновить команду - только для админа
 */
export const updateClub = async (
	initData: string,
	clubId: string,
	formData: FormData,
): Promise<any> => {
	try {
		const response = await fetch(`${API_URL}/clubs/${clubId}`, {
			method: 'PUT',
			headers: {
				Authorization: `tma ${initData}`,
			},
			body: formData,
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Ошибка при обновлении команды');
		}

		return await response.json();
	} catch (error) {
		console.error('Ошибка при обновлении команды:', error);
		throw error;
	}
};

/**
 * Удалить команду - только для админа
 */
export const deleteClub = async (
	initData: string,
	clubId: string,
): Promise<any> => {
	try {
		const response = await fetch(`${API_URL}/clubs/${clubId}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `tma ${initData}`,
			},
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Ошибка при удалении команды');
		}

		return await response.json();
	} catch (error) {
		console.error('Ошибка при удалении команды:', error);
		throw error;
	}
};

/**
 * Удалить игрока - только для админа
 */
export const deletePlayer = async (
	initData: string,
	playerId: string,
): Promise<any> => {
	try {
		const response = await fetch(`${API_URL}/players/${playerId}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `tma ${initData}`,
			},
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Ошибка при удалении игрока');
		}

		return await response.json();
	} catch (error) {
		console.error('Ошибка при удалении игрока:', error);
		throw error;
	}
};

/**
 * Получить список админов
 */
export const fetchAdmins = async (initData: string): Promise<any[]> => {
	try {
		const response = await fetch(`${API_URL}/admin/admins`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `tma ${initData}`,
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		return result.admins || [];
	} catch (error) {
		console.error('Ошибка при запросе списка админов:', error);
		throw error;
	}
};

/**
 * Добавить нового админа
 */
export const addAdmin = async (
	initData: string,
	telegramId: string,
	username?: string,
): Promise<{ success: boolean; message: string }> => {
	try {
		const response = await fetch(`${API_URL}/admin/admins`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `tma ${initData}`,
			},
			body: JSON.stringify({
				telegramId,
				username,
			}),
		});

		const result = await response.json();

		if (!response.ok) {
			return { success: false, message: result.error || 'Ошибка сервера' };
		}

		return { success: true, message: result.message };
	} catch (error) {
		console.error('Ошибка при добавлении админа:', error);
		return { success: false, message: 'Ошибка сети' };
	}
};

/**
 * Удалить админа
 */
export const removeAdmin = async (
	initData: string,
	telegramId: string,
): Promise<{ success: boolean; message: string }> => {
	try {
		const response = await fetch(`${API_URL}/admin/admins/${telegramId}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `tma ${initData}`,
			},
			body: JSON.stringify({ telegramId }),
		});

		const result = await response.json();

		if (!response.ok) {
			return { success: false, message: result.error || 'Ошибка сервера' };
		}

		return { success: true, message: result.message };
	} catch (error) {
		console.error('Ошибка при удалении админа:', error);
		return { success: false, message: 'Ошибка сети' };
	}
};

/**
 * Поиск пользователей по username
 */
export const searchUsers = async (
	initData: string,
	query: string,
): Promise<any[]> => {
	try {
		const response = await fetch(
			`${API_URL}/admin/search-users?query=${encodeURIComponent(query)}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `tma ${initData}`,
				},
			},
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		return result.users || [];
	} catch (error) {
		console.error('Ошибка при поиске пользователей:', error);
		throw error;
	}
};

/**
 * Добавить админа по username
 */
export const addAdminByUsername = async (
	initData: string,
	username: string,
): Promise<{ success: boolean; message: string }> => {
	try {
		const response = await fetch(`${API_URL}/admin/admins/by-username`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `tma ${initData}`,
			},
			body: JSON.stringify({
				username,
			}),
		});

		const result = await response.json();

		if (!response.ok) {
			return { success: false, message: result.error || 'Ошибка сервера' };
		}

		return { success: true, message: result.message };
	} catch (error) {
		console.error('Ошибка при добавлении админа по username:', error);
		return { success: false, message: 'Ошибка сети' };
	}
};

/**
 * Обновить игрока - только для админа
 */
export const updatePlayer = async (
	initData: string,
	playerId: string,
	formData: FormData,
): Promise<any> => {
	try {
		const response = await fetch(`${API_URL}/players/${playerId}`, {
			method: 'PUT',
			headers: {
				Authorization: `tma ${initData}`,
			},
			body: formData,
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Ошибка при обновлении игрока');
		}

		return await response.json();
	} catch (error) {
		console.error('Ошибка при обновлении игрока:', error);
		throw error;
	}
};
