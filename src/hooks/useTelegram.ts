import { useEffect } from 'react';

const tg = (window as any).Telegram?.WebApp;

// Проверяем, запущено ли приложение в Telegram WebApp
const isTelegramWebApp = Boolean(tg);

// Fallback данные для разработки
const developmentFallback = {
	user: {
		id: 123456789,
		first_name: 'Test',
		last_name: 'User',
		username: 'testuser',
	},
	initData:
		'query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Владимир%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22vdmrv%22%2C%22language_code%22%3A%22ru%22%7D&auth_date=1703179173&hash=example_hash',
	queryId: 'AAHdF6IQAAAAAN0XohDhrOrc',
};

export function useTelegram() {
	useEffect(() => {
		if (tg) {
			tg.ready();
		}
	}, []);

	const onClose = () => {
		if (tg) {
			tg.close();
		} else {
			console.log('Telegram WebApp не доступен - режим разработки');
		}
	};

	const onToggleButton = () => {
		if (tg?.MainButton) {
			if (tg.MainButton.isVisible) {
				tg.MainButton.hide();
			} else {
				tg.MainButton.show();
			}
		}
	};

	return {
		onClose,
		onToggleButton,
		tg: tg || null,
		user: isTelegramWebApp
			? tg?.initDataUnsafe?.user
			: developmentFallback.user,
		initData: isTelegramWebApp ? tg?.initData : developmentFallback.initData,
		queryId: isTelegramWebApp
			? tg?.initDataUnsafe?.query_id
			: developmentFallback.queryId,
		isTelegramWebApp,
	};
}
