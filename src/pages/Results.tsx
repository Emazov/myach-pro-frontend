import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store';
import { CategoryItem } from '../components';
import { fetchClubs } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import html2canvas from 'html2canvas';

const Results = () => {
	const navigate = useNavigate();
	const { initData, tg } = useTelegram();
	const { categorizedPlayers, categories } = useGameStore();
	const [club, setClub] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSharing, setIsSharing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const resultsRef = useRef<HTMLDivElement>(null);

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

	const handleShare = async () => {
		if (!resultsRef.current) return;

		setIsSharing(true);
		try {
			// Создаём скриншот результатов
			const canvas = await html2canvas(resultsRef.current, {
				backgroundColor: '#ffffff',
				scale: 2, // Увеличиваем качество
				useCORS: true,
				allowTaint: true,
				height: resultsRef.current.offsetHeight,
				width: resultsRef.current.offsetWidth,
			});

			// Конвертируем canvas в blob
			canvas.toBlob(async (blob) => {
				if (!blob) {
					console.error('Не удалось создать изображение');
					return;
				}

				try {
					// Пробуем поделиться через Web Share API (современные браузеры)
					if (navigator.share && navigator.canShare) {
						const file = new File(
							[blob],
							`результаты_${club?.name || 'команды'}.png`,
							{
								type: 'image/png',
							},
						);

						if (navigator.canShare({ files: [file] })) {
							await navigator.share({
								title: `Результаты распределения - ${club?.name}`,
								text: 'Результаты распределения игроков по категориям',
								files: [file],
							});

							if (tg && tg.showAlert) {
								tg.showAlert('Картинка отправлена!');
							}
							return;
						}
					}

					// Если Web Share API недоступен, пробуем через Telegram Web App
					if (tg && tg.switchInlineQuery) {
						// Создаем текстовое сообщение с результатами для отправки
						const resultText = categories
							.map((category) => {
								const players = categorizedPlayers[category.name] || [];
								return `${category.name}: ${players
									.map((p) => p.name)
									.join(', ')}`;
							})
							.join('\n');

						const shareText = `🏆 Результаты распределения - ${club?.name}\n\n${resultText}`;

						tg.switchInlineQuery(shareText, ['users', 'groups']);

						if (tg.showAlert) {
							tg.showAlert('Выберите чат для отправки результатов');
						}
						return;
					}

					// Запасной вариант - скачивание файла
					const url = URL.createObjectURL(blob);
					const link = document.createElement('a');
					link.href = url;
					link.download = `результаты_${club?.name || 'команды'}.png`;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(url);

					if (tg && tg.showAlert) {
						tg.showAlert(
							'Картинка сохранена в загрузки. Вы можете поделиться ей в чате.',
						);
					}
				} catch (err) {
					console.error('Ошибка при отправке:', err);
					if (tg && tg.showAlert) {
						tg.showAlert('Ошибка при отправке. Попробуйте еще раз.');
					}
				}
			}, 'image/png');
		} catch (err) {
			console.error('Ошибка при создании скриншота:', err);
			if (tg && tg.showAlert) {
				tg.showAlert('Ошибка при создании картинки');
			}
		} finally {
			setIsSharing(false);
		}
	};

	const handleGoHome = () => {
		navigate('/');
	};

	// Показываем загрузку, если данные еще не получены
	if (isLoading) {
		return (
			<div className='container flex flex-col items-center justify-center h-full'>
				<div className='text-2xl font-bold'>Загрузка...</div>
			</div>
		);
	}

	// Показываем ошибку, если что-то пошло не так
	if (error || !club) {
		return (
			<div className='container flex flex-col items-center justify-center h-full'>
				<div className='text-2xl font-bold text-red-500'>
					{error || 'Произошла ошибка при загрузке данных'}
				</div>
				<button
					className='mt-4 px-4 py-2 bg-blue-500 text-white rounded'
					onClick={() => window.location.reload()}
				>
					Обновить страницу
				</button>
			</div>
		);
	}

	return (
		<div className='container mx-auto px-4 py-8'>
			<div ref={resultsRef} className='bg-white p-4 rounded-lg'>
				<div className='flex flex-col items-center mb-8'>
					<img
						src={club.img_url}
						alt={club.name}
						className='w-24 h-24 object-contain mb-4'
					/>
					<h1 className='text-[clamp(1.5rem,5vw,3rem)] font-bold text-center mb-2'>
						{club.name}
					</h1>
					<h2 className='text-[clamp(1rem,3vw,2rem)] text-center mb-8'>
						Результаты распределения игроков
					</h2>
				</div>

				<ul className='category_list flex flex-col gap-2'>
					{categories.map((category) => {
						const players = categorizedPlayers[category.name] || [];
						return (
							<CategoryItem
								key={`category-${category.name}`}
								category={category}
								players={players}
								showPlayerImages={true}
							/>
						);
					})}
				</ul>
			</div>

			<div className='flex justify-center gap-4 mt-8'>
				<button
					onClick={handleShare}
					disabled={isSharing}
					className='bg-[#EC3381] text-white py-3 px-6 rounded-lg text-[clamp(1rem,3vw,1.2rem)] disabled:opacity-50 disabled:cursor-not-allowed'
				>
					{isSharing ? 'Создаём картинку...' : 'Поделиться'}
				</button>
				<button
					onClick={handleGoHome}
					className='bg-gray-700 text-white py-3 px-6 rounded-lg text-[clamp(1rem,3vw,1.2rem)]'
				>
					На главную
				</button>
			</div>
		</div>
	);
};

export default Results;
