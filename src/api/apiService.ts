import type { Club, Player, User } from '../types';

const API_URL = `https://myach-pro-backend-production.up.railway.app/api`;

/**
 * Получить список клубов с сервера
 */
export const fetchClubs = async (initData: string): Promise<Club[]> => {
	try {
		const response = await fetch(`${API_URL}/clubs`, {
			headers: {
				Authorization: `tma ${initData}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error(`Ошибка при получении клубов: ${response.status}`);
		}

		const result = await response.json();

		// Преобразуем данные в нужный формат
		return result.clubs.map((club: any) => ({
			id: club.id, // Используем реальный ID из API
			name: club.name,
			img_url: club.logoUrl || '',
		}));
	} catch (error) {
		console.error('Ошибка при запросе клубов:', error);
		throw error;
	}
};

/**
 * Получить список игроков с сервера
 */
export const fetchPlayers = async (initData: string): Promise<Player[]> => {
	try {
		const response = await fetch(`${API_URL}/players`, {
			headers: {
				Authorization: `tma ${initData}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error(`Ошибка при получении игроков: ${response.status}`);
		}

		const result = await response.json();

		// Преобразуем данные в нужный формат
		// API возвращает игроков без club_id, поэтому ставим 1 по умолчанию
		return result.players.map((player: any, index: number) => ({
			id: index + 1, // Используем индекс как числовой ID
			name: player.name,
			img_url: player.avatarUrl || '',
			club_id: 1, // Устанавливаем club_id по умолчанию
		}));
	} catch (error) {
		console.error('Ошибка при запросе игроков:', error);
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
			telegramId: parseInt(result.user.telegramId),
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
		const response = await fetch(`${API_URL}/clubs/${clubId}`, {
			headers: {
				Authorization: `tma ${initData}`,
				'Content-Type': 'application/json',
			},
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
				Authorization: `tma ${initData}`,
				'Content-Type': 'application/json',
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
				Authorization: `tma ${initData}`,
				'Content-Type': 'application/json',
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
