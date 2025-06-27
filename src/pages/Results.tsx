import { useState, useEffect } from 'react';
import { useGameStore, useUserStore } from '../store';
import { CategoryItem, LoadingSpinner, ShareTestPanel } from '../components';
import { fetchClubs } from '../api';
import { downloadResultsImage, type ShareData } from '../api/shareService';
import { useTelegram } from '../hooks/useTelegram';
import { getProxyImageUrl } from '../utils/imageUtils';
import { completeGameSession } from '../api/analyticsService';
import { TELEGRAM_BOT_USERNAME } from '../config/api';
import { Link } from 'react-router-dom';
import {
	universalShare,
	detectPlatform,
	getAvailableShareMethods,
	type ShareOptions,
} from '../utils/shareUtils';

// Функция для обработки названия клуба
const getDisplayClubName = (clubName: string): string => {
	// Проверяем, содержит ли название "клуб" (регистронезависимо)
	const hasClub = clubName.toLowerCase().includes('клуб');

	// Ищем сезон в формате YYYY/YY
	const seasonMatch = clubName.match(/(\d{4}\/\d{2})/);

	if (hasClub && seasonMatch) {
		const season = seasonMatch[1];
		return `Твой тир-лист клубов сезона ${season}`;
	}

	return clubName;
};

const Results = () => {
	const { initData } = useTelegram();
	const { isAdmin } = useUserStore();
	const { categorizedPlayers, categories } = useGameStore();
	const [club, setClub] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isSharing, setIsSharing] = useState(false);
	const [shareStatus, setShareStatus] = useState<string>('');
	const [platform] = useState(() => detectPlatform());
	const [availableMethods] = useState(() => getAvailableShareMethods());

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

	// Универсальная функция для обработки клика по кнопке "Поделиться"
	const handleShare = async () => {
		if (!initData || !club || !hasGameData) {
			setShareStatus('Недостаточно данных для создания изображения');
			setTimeout(() => setShareStatus(''), 3000);
			return;
		}

		setIsSharing(true);
		setShareStatus('Генерируем изображение...');

		try {
			// Преобразуем categorizedPlayers в categorizedPlayerIds (только IDs)
			const categorizedPlayerIds: { [categoryName: string]: string[] } = {};

			Object.entries(categorizedPlayers).forEach(([categoryName, players]) => {
				categorizedPlayerIds[categoryName] = players.map((player) => player.id);
			});

			const shareData: ShareData = {
				categorizedPlayerIds,
				categories,
				clubId: club.id,
			};

			setShareStatus('Получаем изображение...');

			// Получаем изображение в высоком качестве
			const { blob } = await downloadResultsImage(initData, shareData);

			setShareStatus('Подготавливаем к шэрингу...');

			// Подготавливаем данные для универсального шэринга
			const shareOptions: ShareOptions = {
				imageBlob: blob,
				text: `Собери свой тир лист - @${TELEGRAM_BOT_USERNAME}`,
				clubName: club.name,
			};

			setShareStatus('Открываем шэринг...');

			// Используем универсальную функцию шэринга
			const result = await universalShare(shareOptions);

			if (result.success) {
				const methodNames: { [key: string]: string } = {
					webShare: 'системный шэринг',
					telegram: 'Telegram',
					clipboard: 'буфер обмена',
					download: 'скачивание',
				};

				setShareStatus(
					`✅ Успешно: ${methodNames[result.method] || result.method}`,
				);
			} else {
				setShareStatus(`❌ ${result.error || 'Не удалось поделиться'}`);
			}
		} catch (error: any) {
			console.error('Ошибка при шэринге:', error);
			setShareStatus(`❌ ${error.message || 'Не удалось создать изображение'}`);
		} finally {
			setIsSharing(false);

			// Очищаем статус через 5 секунд
			setTimeout(() => setShareStatus(''), 5000);
		}
	};

	// Функция для тестирования шэринга (только в development)
	const getTestShareOptions = async (
		testInitData: string,
	): Promise<ShareOptions> => {
		if (!club || !hasGameData) {
			throw new Error('Недостаточно данных для тестирования');
		}

		// Преобразуем categorizedPlayers в categorizedPlayerIds (только IDs)
		const categorizedPlayerIds: { [categoryName: string]: string[] } = {};

		Object.entries(categorizedPlayers).forEach(([categoryName, players]) => {
			categorizedPlayerIds[categoryName] = players.map((player) => player.id);
		});

		const shareData: ShareData = {
			categorizedPlayerIds,
			categories,
			clubId: club.id,
		};

		// Получаем изображение для тестирования
		const { blob } = await downloadResultsImage(testInitData, shareData);

		return {
			imageBlob: blob,
			text: `Тест шэринга тир-листа - @${TELEGRAM_BOT_USERNAME}`,
			clubName: club.name,
		};
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
							{getDisplayClubName(club.name) === club.name && (
								<img
									src={getProxyImageUrl(club.img_url)}
									alt={club.name}
									className='w-10 object-contain rounded-full'
									loading='eager'
									onError={(e) => {
										// Если логотип не загрузился, скрываем изображение
										const target = e.target as HTMLImageElement;
										target.style.display = 'none';
									}}
								/>
							)}
							<span className='text-[clamp(1.5rem,2.5vw,3rem)] font-bold text-center'>
								{getDisplayClubName(club.name)}
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

					{/* Информация о платформе (только для разработки) */}
					{import.meta.env.DEV && (
						<div className='text-xs text-gray-500 mb-4'>
							<p>Платформа: {platform}</p>
							<p>
								Доступные методы:{' '}
								{availableMethods
									.filter((m) => m.available)
									.map((m) => m.name)
									.join(', ')}
							</p>
						</div>
					)}

					{/* Кнопка поделиться и статус */}
					<div className='flex flex-col items-center justify-center gap-2'>
						<button
							className='bg-[#FFEC13] text-black font-bold py-3 px-8 rounded-lg text-lg w-fit disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
							onClick={handleShare}
							disabled={isSharing}
						>
							{isSharing ? 'Подготавливаем...' : 'Поделиться'}
						</button>

						{/* Статус шэринга */}
						{shareStatus && (
							<div
								className={`text-sm px-4 py-2 rounded-lg max-w-xs text-center ${
									shareStatus.startsWith('✅')
										? 'bg-green-100 text-green-800'
										: shareStatus.startsWith('❌')
										? 'bg-red-100 text-red-800'
										: 'bg-blue-100 text-blue-800'
								}`}
							>
								{shareStatus}
							</div>
						)}

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

			{/* Компонент для тестирования шэринга в development режиме */}
			{import.meta.env.DEV && hasGameData && club && (
				<ShareTestPanel
					onTestShare={getTestShareOptions}
					initData={initData || ''}
				/>
			)}
		</div>
	);
};

export default Results;
