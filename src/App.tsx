import { useEffect } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { useUserStore } from './store';
import { Routes, Route } from 'react-router-dom';

import StartPage from './pages/StartPage';
import Guide from './pages/Guide';
import Game from './pages/Game';
import Results from './pages/Results';

function App() {
	const { tg, initData } = useTelegram();
	const { authenticateUser } = useUserStore();

	useEffect(() => {
		tg.ready();
		tg.expand();

		// Если есть initData, отправляем его на сервер для аутентификации
		if (initData) {
			authenticateUser(initData).catch((error) => {
				console.error('Ошибка при аутентификации:', error);
			});
		}

		console.log(initData);
	}, [tg, initData, authenticateUser]);

	return (
		<div className='w-full h-screen'>
			<Routes>
				<Route index element={<StartPage />} />
				<Route path='/guide' element={<Guide />} />
				<Route path='/game' element={<Game />} />
				<Route path='/results' element={<Results />} />
			</Routes>
		</div>
	);
}

export default App;
