import { useState, useEffect } from 'react';
import { useGameStore, useUserStore } from '../store';
import { CategoryItem, LoadingSpinner } from '../components';
import { fetchClubs, shareResults, type ShareData } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import { getProxyImageUrl } from '../utils/imageUtils';
import { completeGameSession } from '../api/analyticsService';
import { Link } from 'react-router-dom';

// генерируем изображение

const Results = () => {
	const { initData, tg } = useTelegram();
	const { isAdmin } = useUserStore();
	const { categorizedPlayers, categories } = useGameStore();
	const [club, setClub] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isSharing, setIsSharing] = useState(false);

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

	// Функция для обработки клика по кнопке "Поделиться"
	const handleShare = async () => {
		if (!initData || !club || !hasGameData) {
			alert('Недостаточно данных для создания изображения');
			return;
		}

		setIsSharing(true);

		try {
			// Преобразуем categorizedPlayers в categorizedPlayerIds (только IDs)
			const categorizedPlayerIds: { [categoryName: string]: string[] } = {};

			Object.entries(categorizedPlayers).forEach(([categoryName, players]) => {
				categorizedPlayerIds[categoryName] = players.map((player) => player.id);
			});

			const shareData: ShareData = {
				categorizedPlayerIds,
				categories,
				clubId: club.id, // Передаем только ID клуба
			};

			const result = await shareResults(initData, shareData);

			if (result.success) {
				// Если сервер сообщил о необходимости закрыть веб-приложение
				if (result.closeWebApp && tg) {
					tg.close();
				}
			}
		} catch (error: any) {
			console.error('Ошибка при отправке результатов:', error);
			alert(error.message || 'Произошла ошибка при отправке результатов');
		} finally {
			setIsSharing(false);
		}
	};

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
		<div className='min-h-screen bg-[url("/main_bg.jpg")] flex flex-col'>
			<div className='flex-1 flex flex-col'>
				{/* Заголовок с мячом */}
				<div className='flex items-center justify-center gap-3'>
					<img
						src='./main_logo.png'
						alt='main_logo'
						className='w-40 object-contain'
						loading='eager'
					/>
				</div>

				{/* Основной контент */}
				<div className='bg-[var(--tg-theme-bg-color)] flex-1 rounded-t-3xl px-4 pt-6 '>
					{/* Заголовок тир-листа и логотип */}
					<div className='flex items-center justify-center gap-2 mb-6'>
						<div className='flex items-center gap-2'>
							<img
								src={getProxyImageUrl(club.img_url)}
								alt={club.name}
								className='w-12 object-contain rounded'
								loading='eager'
								onError={(e) => {
									// Если логотип не загрузился, скрываем изображение
									const target = e.target as HTMLImageElement;
									target.style.display = 'none';
								}}
							/>
							<span className='text-[clamp(2rem,4vw,4rem)] font-bold'>
								{club.name}
							</span>
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
					<div className='flex flex-col items-center justify-center gap-2'>
						<button
							className='bg-[#FFEC13] text-black font-bold py-3 px-8 rounded-lg text-lg w-fit disabled:opacity-50 disabled:cursor-not-allowed'
							onClick={handleShare}
							disabled={isSharing}
						>
							{isSharing ? 'Отправляем...' : 'Поделиться'}
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
		</div>
	);
};

export default Results;
