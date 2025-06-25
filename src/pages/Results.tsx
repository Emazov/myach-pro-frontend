import { useState, useEffect } from 'react';
import { useGameStore, useUserStore } from '../store';
import { CategoryItem, LoadingSpinner } from '../components';
import { fetchClubs } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import { getProxyImageUrl } from '../utils/imageUtils';
import { completeGameSession } from '../api/analyticsService';
import { Link } from 'react-router-dom';

// генерируем изображение
import { useToPng } from '@hugocxl/react-to-image';

const Results = () => {
	const { initData } = useTelegram();
	const { isAdmin } = useUserStore();
	const { categorizedPlayers, categories } = useGameStore();
	const [club, setClub] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Проверяем, есть ли данные игры
	const hasGameData =
		categories.length > 0 &&
		Object.keys(categorizedPlayers).length > 0 &&
		Object.values(categorizedPlayers).some((players) => players.length > 0);

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

				// Логируем завершение игры при заходе на страницу результатов
				if (hasGameData) {
					completeGameSession(initData).catch((error) => {
						console.error('Ошибка при логировании завершения игры:', error);
					});
				}
			} catch (err) {
				console.error('Ошибка при загрузке данных о клубе:', err);
				setError('Ошибка при загрузке данных о клубе');
			} finally {
				setIsLoading(false);
			}
		};

		loadClub();
	}, [initData, hasGameData]);

	const [_, convert, ref] = useToPng<HTMLDivElement>({
		quality: 0.8,
		onSuccess: (data) => {
			const link = document.createElement('a');
			link.download = 'my-image-name.jpeg';
			link.href = data;
			link.click();
		},
	});

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
				<div
					ref={ref}
					className='bg-[var(--tg-theme-bg-color)] rounded-lg flex-1 px-4 pt-6 pb-16'
				>
					{/* Заголовок тир-листа и логотип */}
					<div className='flex items-center justify-center mb-6'>
						<div>
							<h2 className='text-lg font-bold uppercase'>ТИР-ЛИСТ</h2>
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
				</div>
				{/* Кнопка поделиться */}
				<div className='flex flex-col items-center justify-center gap-2'>
					<button
						className='bg-[#FFEC13] text-black font-bold py-3 px-8 rounded-lg text-lg w-fit'
						onClick={() => {
							convert();
						}}
					>
						Поделиться
					</button>
					{isAdmin && (
						<Link
							to='/admin'
							className='inline-block bg-[#FFEC13] text-black font-bold py-3 px-8 rounded-lg text-lg w-fit'
						>
							Админ
						</Link>
					)}
				</div>
			</div>
		</div>
	);
};

export default Results;
