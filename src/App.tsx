import { useEffect, Suspense, lazy } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { useUserStore } from './store';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary, LoadingSpinner } from './components';

// Lazy loading для страниц
const StartPage = lazy(() => import('./pages/StartPage'));
const Guide = lazy(() => import('./pages/Guide'));
const SelectTeamPage = lazy(() => import('./pages/SelectTeamPage'));
const Game = lazy(() => import('./pages/Game'));
const Results = lazy(() => import('./pages/Results'));

// Админские страницы тоже делаем lazy
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AddClubPage = lazy(() => import('./pages/AddClubPage'));
const AddPlayersPage = lazy(() => import('./pages/AddPlayersPage'));
const ManageClubPage = lazy(() => import('./pages/ManageClubPage'));
const EditClubPage = lazy(() => import('./pages/EditClubPage'));
const EditPlayersPage = lazy(() => import('./pages/EditPlayersPage'));
const ManageAdminsPage = lazy(() => import('./pages/ManageAdminsPage'));

function App() {
	const { tg, initData, isDevelopment } = useTelegram();
	const { authenticateUser } = useUserStore();

	useEffect(() => {
		// Проверяем, что Telegram WebApp доступен
		if (!tg) {
			if (isDevelopment) {
				console.log('Telegram WebApp недоступен - режим разработки');
			}
			return;
		}

		// Безопасная инициализация Telegram WebApp
		try {
			tg.ready();
			tg.expand();
		} catch (error) {
			console.error('Ошибка инициализации Telegram WebApp:', error);
		}

		// Аутентификация только если есть initData
		if (initData) {
			authenticateUser(initData).catch((error) => {
				console.error('Ошибка при аутентификации:', error);
				// TODO: Показать пользователю уведомление об ошибке
				// Можно добавить toast notification или modal
			});
		}

		// Логируем initData только в development
		if (isDevelopment && initData) {
			console.log('initData:', initData);
		}
	}, [tg, initData, authenticateUser, isDevelopment]);

	return (
		<ErrorBoundary>
			<div className='w-full h-screen'>
				<Suspense
					fallback={<LoadingSpinner fullScreen message='Загрузка...' />}
				>
					<Routes>
						<Route index element={<StartPage />} />
						<Route path='/guide' element={<Guide />} />
						<Route path='/select-team' element={<SelectTeamPage />} />
						<Route path='/game' element={<Game />} />
						<Route path='/results' element={<Results />} />

						{/* Админские маршруты */}
						<Route path='/admin' element={<AdminPage />} />
						<Route path='/admin/add-club' element={<AddClubPage />} />
						<Route path='/admin/add-players' element={<AddPlayersPage />} />
						<Route
							path='/admin/add-players/:clubId'
							element={<AddPlayersPage />}
						/>
						<Route path='/admin/manage-club' element={<ManageClubPage />} />
						<Route path='/admin/edit-club/:clubId' element={<EditClubPage />} />
						<Route
							path='/admin/edit-players/:clubId'
							element={<EditPlayersPage />}
						/>
						<Route path='/admin/manage-admins' element={<ManageAdminsPage />} />
					</Routes>
				</Suspense>
			</div>
		</ErrorBoundary>
	);
}

export default App;
