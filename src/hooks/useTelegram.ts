import { useEffect } from 'react';

const tg = (window as any).Telegram?.WebApp;

export function useTelegram() {
	useEffect(() => {
		if (tg) {
			tg.ready();
		}
	}, []);

	const onClose = () => {
		if (tg) {
			tg.close();
		}
	};

	const onToggleButton = () => {
		if (tg.MainButton.isVisible) {
			tg.MainButton.hide();
		} else {
			tg.MainButton.show();
		}
	};

	return {
		onClose,
		onToggleButton,
		tg,
		user: tg?.initDataUnsafe?.user,
		initData: tg?.initData,
		queryId: tg?.initDataUnsafe?.query_id,
	};
}
