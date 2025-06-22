import { useState, useEffect } from 'react';
import { useGameStore } from '../store';
import { CategoryItem, LoadingSpinner } from '../components';
import { fetchClubs } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import { getProxyImageUrl } from '../utils/imageUtils';

const Results = () => {
	const { initData } = useTelegram();
	const { categorizedPlayers, categories } = useGameStore();
	const [club, setClub] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Проверяем, есть ли данные игры
	const hasGameData =
		categories.length > 0 &&
		Object.keys(categorizedPlayers).length > 0 &&
		Object.values(categorizedPlayers).some((players) => players.length > 0);

	// Отладка данных игроков
	useEffect(() => {
		console.group('🔍 Results Page Debug');
		console.log('categories:', categories);
		console.log('categorizedPlayers:', categorizedPlayers);
		console.log('hasGameData:', hasGameData);

		// Проверяем URL изображений игроков
		Object.entries(categorizedPlayers).forEach(([categoryName, players]) => {
			console.log(`Category "${categoryName}" players:`, players);
			players.forEach((player) => {
				console.log(`Player "${player.name}":`, {
					originalUrl: player.img_url,
					processedUrl: getProxyImageUrl(player.img_url),
				});
			});
		});
		console.groupEnd();
	}, [categories, categorizedPlayers, hasGameData]);

	useEffect(() => {
		const loadClub = async () => {
			if (!initData) {
				setError('Данные Telegram не найдены');
				setIsLoading(false);
				return;
			}

			try {
				const clubs = await fetchClubs(initData);
				if (clubs && clubs.length > 0) {
					setClub(clubs[0]);
				} else {
					setError('Не удалось загрузить информацию о клубе');
				}
			} catch (err) {
				console.error('Ошибка при загрузке данных о клубе:', err);
				setError('Ошибка при загрузке данных о клубе');
			} finally {
				setIsLoading(false);
			}
		};

		loadClub();
	}, [initData]);

	// Показываем загрузку, если данные еще не получены
	if (isLoading) {
		return <LoadingSpinner fullScreen message='Загрузка результатов...' />;
	}

	// Показываем ошибку, если что-то пошло не так
	if (error || !club) {
		return (
			<div
				className='min-h-screen flex flex-col items-center justify-center p-4'
				style={{
					background: 'var(--tg-theme-bg-color)',
					color: 'var(--tg-theme-text-color)',
				}}
			>
				<div className='text-center max-w-md'>
					<h2 className='text-2xl font-bold mb-4 text-red-500'>
						{error || 'Произошла ошибка при загрузке данных'}
					</h2>
					<button
						className='py-3 px-6 rounded-lg font-medium transition-opacity hover:opacity-80'
						style={{
							background: 'var(--tg-theme-button-color)',
							color: 'var(--tg-theme-button-text-color)',
						}}
						onClick={() => window.location.reload()}
					>
						Обновить страницу
					</button>
				</div>
			</div>
		);
	}

	// Показываем сообщение, если нет данных игры
	if (!hasGameData) {
		return (
			<div
				className='min-h-screen flex flex-col items-center justify-center p-4'
				style={{
					background: 'var(--tg-theme-bg-color)',
					color: 'var(--tg-theme-text-color)',
				}}
			>
				<div className='text-center max-w-md'>
					<h2 className='text-2xl font-bold mb-4'>
						Нет данных для отображения результатов
					</h2>
					<p className='text-lg mb-6'>
						Сначала пройдите игру, чтобы увидеть результаты
					</p>
					<button
						className='py-3 px-6 rounded-lg font-medium transition-opacity hover:opacity-80'
						style={{
							background: 'var(--tg-theme-button-color)',
							color: 'var(--tg-theme-button-text-color)',
						}}
						onClick={() => window.history.back()}
					>
						Вернуться назад
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-b from-[#EC3381] to-[#FF6B9D] flex flex-col'>
			<div className='flex-1 flex flex-col'>
				{/* Заголовок с мячом */}
				<div className='text-center py-6'>
					<div className='flex items-center justify-center gap-3 mb-2'>
						<img
							src='./main_logo.png'
							alt='main_logo'
							className='w-16 h-16 object-contain'
							loading='eager'
						/>
					</div>
					<h1 className='text-white text-3xl font-bold'>РЕЗУЛЬТАТ</h1>
				</div>

				{/* Основной контент */}
				<div className='bg-[var(--tg-theme-bg-color)] rounded-t-3xl flex-1 px-4 pt-6 pb-16'>
					{/* Заголовок тир-листа и логотип */}
					<div className='flex items-center justify-between mb-6'>
						<div>
							<h2 className='text-lg font-bold uppercase'>
								ТИР-ЛИСТ ИГРОКОВ КЛУБА
							</h2>
							<div className='flex items-center gap-2 mt-1'>
								<img
									src={getProxyImageUrl(club.img_url)}
									alt={club.name}
									className='w-8 h-8 object-contain rounded'
									loading='eager'
									onError={(e) => {
										// Если логотип не загрузился, скрываем изображение
										const target = e.target as HTMLImageElement;
										target.style.display = 'none';
									}}
								/>
								<span className='text-lg font-semibold'>{club.name}</span>
							</div>
						</div>
						<div className='text-right'>
							<span className='text-black text-sm'>МЯЧ</span>
						</div>
					</div>

					{/* Список категорий */}
					<ul className='category_list flex flex-col gap-3 mb-6'>
						{categories.map((category) => {
							const players = categorizedPlayers[category.name] || [];
							return (
								<CategoryItem
									key={`category-${category.name}`}
									category={category}
									players={players}
									showPlayerImages={true}
									showSkeletons={true}
								/>
							);
						})}
					</ul>

					{/* Кнопка поделиться */}
					<div className='text-center mt-10 mb-6'>
						<button
							className='bg-[#FFEC13] text-black font-bold py-3 px-8 rounded-lg text-lg w-full max-w-xs mx-auto'
							onClick={() => {
								// Здесь можно добавить логику для шеринга
								console.log('Поделиться результатом');
							}}
						>
							Поделиться
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Results;
