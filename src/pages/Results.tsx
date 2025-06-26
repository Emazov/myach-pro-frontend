import { useState, useEffect } from 'react';
import { useGameStore, useUserStore } from '../store';
import { CategoryItem, LoadingSpinner } from '../components';
import {
	fetchClubs,
	shareResults,
	previewResultsImage,
	type ShareData,
} from '../api';
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
	const [showShareModal, setShowShareModal] = useState(false);

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

		// Проверяем поддержку Web Share API
		if ('share' in navigator) {
			// Показываем модальное окно выбора способа шаринга
			setShowShareModal(true);
		} else {
			// Если Web Share API не поддерживается, сразу отправляем в Telegram
			await handleTelegramShare();
		}
	};

	// Новая функция для системного шаринга через Web Share API
	const handleWebShare = async () => {
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
				clubId: club.id,
			};

			// Получаем изображение как Blob для шаринга
			const imageBlob = await previewResultsImage(shareData);

			// Создаем файл из Blob
			const imageFile = new File([imageBlob], `tier-list-${club.name}.jpg`, {
				type: 'image/jpeg',
			});

			// Генерируем текстовое описание
			const shareText = generateShareText();

			// Используем Web Share API
			await navigator.share({
				title: `🏆 Тир-лист "${club.name}"`,
				text: shareText,
				files: [imageFile],
			});

			console.log('Успешно поделились через Web Share API');
		} catch (error: any) {
			console.error('Ошибка при шаринге через Web Share API:', error);

			// Если Web Share API не сработал, fallback на Telegram
			if (error.name === 'AbortError') {
				console.log('Пользователь отменил шаринг');
				return;
			}

			// В случае ошибки предлагаем отправить в Telegram
			const fallbackChoice = confirm(
				'Не удалось поделиться через системное окно. Отправить в Telegram?',
			);
			if (fallbackChoice) {
				await handleTelegramShare();
			}
		} finally {
			setIsSharing(false);
		}
	};

	// Существующая логика отправки в Telegram
	const handleTelegramShare = async () => {
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

	// Функция для генерации текстового описания для шаринга
	const generateShareText = (): string => {
		let text = `🏆 ТИР-ЛИСТ "${club.name.toUpperCase()}"\n\n`;

		categories.forEach((category) => {
			const players = categorizedPlayers[category.name] || [];
			text += `${category.name.toUpperCase()} (${players.length}/${
				category.slots
			}):\n`;

			if (players.length > 0) {
				players.forEach((player, index) => {
					text += `${index + 1}. ${player.name}\n`;
				});
			} else {
				text += '— Пусто\n';
			}
			text += '\n';
		});

		text += '⚽ Создано в @myach_pro_bot';
		return text;
	};

	// Функции для обработки выбора способа шаринга
	const handleWebShareChoice = async () => {
		setShowShareModal(false);
		await handleWebShare();
	};

	const handleTelegramShareChoice = async () => {
		setShowShareModal(false);
		await handleTelegramShare();
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

			{/* Модальное окно выбора способа шаринга */}
			{showShareModal && (
				<div className='fixed inset-0 flex items-center justify-center z-50 bg-black/50'>
					<div className='bg-white rounded-lg p-6 w-full max-w-sm mx-4'>
						<h3 className='text-lg font-bold text-center mb-4 text-black'>
							Выберите способ поделиться
						</h3>
						<p className='text-sm text-gray-600 text-center mb-6'>
							Поделитесь результатами с друзьями
						</p>

						<div className='flex flex-col gap-3'>
							<button
								onClick={handleWebShareChoice}
								disabled={isSharing}
								className='flex items-center justify-center gap-2 bg-[#0088cc] text-white font-bold py-3 px-4 rounded-lg text-lg transition-opacity hover:opacity-90 disabled:opacity-50'
							>
								📱 Системное окно шаринга
							</button>
							<button
								onClick={handleTelegramShareChoice}
								disabled={isSharing}
								className='flex items-center justify-center gap-2 bg-[#EC3381] text-white font-bold py-3 px-4 rounded-lg text-lg transition-opacity hover:opacity-90 disabled:opacity-50'
							>
								✈️ Отправить в Telegram
							</button>
							<button
								onClick={() => setShowShareModal(false)}
								disabled={isSharing}
								className='text-gray-500 py-2 text-sm transition-opacity hover:opacity-70 disabled:opacity-50'
							>
								Отмена
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Results;
