import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { CategoryItem } from '../components';
import { fetchClubs, sendTierListImage, getBotChats } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import html2canvas from 'html2canvas';

const Results = () => {
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

	// Функция для предварительной загрузки изображений
	const preloadImages = async (): Promise<void> => {
		const imageUrls: string[] = [];

		// Добавляем логотип клуба
		if (club?.img_url) {
			imageUrls.push(club.img_url);
		}

		// Добавляем изображения всех игроков
		categories.forEach((category) => {
			const players = categorizedPlayers[category.name] || [];
			players.forEach((player) => {
				if (player.img_url) {
					imageUrls.push(player.img_url);
				}
			});
		});

		// Загружаем все изображения
		const loadPromises = imageUrls.map((url) => {
			return new Promise<void>((resolve) => {
				const img = new Image();
				img.crossOrigin = 'anonymous'; // Для работы с CORS
				img.onload = () => resolve();
				img.onerror = () => {
					console.warn(`Не удалось загрузить изображение: ${url}`);
					resolve(); // Продолжаем даже если одно изображение не загрузилось
				};
				img.src = url;
			});
		});

		await Promise.all(loadPromises);

		// Дополнительная задержка для рендеринга
		await new Promise((resolve) => setTimeout(resolve, 500));
	};

	const handleShare = async () => {
		if (!resultsRef.current) return;

		setIsSharing(true);
		try {
			// Предварительно загружаем все изображения
			await preloadImages();

			// Подготавливаем DOM для создания скриншота
			// Принудительно устанавливаем размеры и видимость всех изображений
			const prepareDOM = () => {
				const allImages = document.querySelectorAll('img');
				allImages.forEach((img) => {
					img.style.visibility = 'visible';
					img.style.opacity = '1';

					// Добавление альтернативных источников для изображений
					const originalSrc = img.getAttribute('src');
					if (originalSrc && !img.hasAttribute('data-original-src')) {
						img.setAttribute('data-original-src', originalSrc);
						// Проверяем, корректно ли загрузилось изображение
						if (img.complete && img.naturalWidth === 0) {
							console.warn(`Проблема с загрузкой изображения: ${originalSrc}`);
							// Пробуем добавить кэш-бастинг параметр
							img.src = `${originalSrc}?t=${new Date().getTime()}`;
						}
					}
				});
			};

			// Подготавливаем DOM
			prepareDOM();

			// Дополнительное ожидание для гарантированной загрузки изображений
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Создаём скриншот результатов
			const canvas = await html2canvas(resultsRef.current, {
				backgroundColor: '#ffffff',
				scale: 2, // Увеличиваем качество
				useCORS: true,
				allowTaint: true, // Разрешаем "taint" для работы с проблемными изображениями
				imageTimeout: 5000, // Увеличиваем время ожидания загрузки изображений
				logging: true, // Включаем логирование для отладки
				width: resultsRef.current.offsetWidth,
				height: resultsRef.current.offsetHeight,
				scrollX: 0,
				scrollY: 0,
				onclone: (clonedDoc) => {
					// Обеспечиваем правильную загрузку изображений в клоне
					const images = clonedDoc.querySelectorAll('img');
					images.forEach((img) => {
						img.crossOrigin = 'anonymous';
						// Применяем принудительную видимость
						img.style.visibility = 'visible';
						img.style.opacity = '1';

						// Для изображений, которые не загрузились, подставляем плейсхолдер
						if (img.complete && img.naturalWidth === 0) {
							// Этот код будет выполняться в клонированном DOM, подставляем базовый плейсхолдер
							img.src =
								"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' font-size='8' text-anchor='middle' dy='.3em' fill='%23666666'%3E?%3C/text%3E%3C/svg%3E";
						}
					});
				},
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
					if (tg) {
						try {
							// Преобразуем blob в base64 для отправки через API
							const reader = new FileReader();
							reader.readAsDataURL(blob);
							reader.onloadend = async () => {
								const base64data = reader.result as string;

								// Создаем текстовое сообщение с результатами
								const resultText = categories
									.map((category) => {
										const players = categorizedPlayers[category.name] || [];
										return `${category.name}: ${players
											.map((p) => p.name)
											.join(', ')}`;
									})
									.join('\n');

								const shareText = `🏆 ТИР-ЛИСТ ${club?.name.toUpperCase()}\n\n${resultText}\n\n👉 Собери свой тир-лист в боте @MyachProBot`;

								try {
									// Пробуем отправить через наш API бота
									if (initData) {
										// Получаем chatId пользователя
										const chatInfo = await getBotChats(initData);

										if (chatInfo.chatId) {
											// Отправляем сообщение через API
											await sendTierListImage(
												initData,
												base64data,
												chatInfo.chatId,
												club?.name || '',
												shareText,
											);

											if (tg && tg.showAlert) {
												tg.showAlert('Результаты отправлены в чат!');
											}
											return;
										}
									}

									// Запасные варианты если API не сработал
									if (tg) {
										if (tg.sendData) {
											// Отправка изображения через Telegram WebApp API
											const data = JSON.stringify({
												type: 'photo',
												data: base64data,
												text: shareText,
											});
											tg.sendData(data);
											if (tg.showAlert) {
												tg.showAlert('Результаты отправлены в чат!');
											}
											return;
										} else if (tg.switchInlineQuery) {
											// Только текст через inline query
											tg.switchInlineQuery(shareText, ['users', 'groups']);
											if (tg.showAlert) {
												tg.showAlert('Выберите чат для отправки результатов');
											}
											return;
										}
									}
								} catch (err) {
									console.error('Ошибка при отправке через API бота:', err);

									// Если API не сработал, пробуем стандартные методы Telegram
									if (tg && tg.switchInlineQuery) {
										tg.switchInlineQuery(shareText, ['users', 'groups']);
										if (tg.showAlert) {
											tg.showAlert('Выберите чат для отправки результатов');
										}
									}
								}
							};
							return; // Ждем завершения асинхронной операции
						} catch (err) {
							console.error(
								'Ошибка при подготовке изображения для отправки:',
								err,
							);
							// Если не удалось отправить через API, используем switchInlineQuery
							if (tg.switchInlineQuery) {
								const resultText = categories
									.map((category) => {
										const players = categorizedPlayers[category.name] || [];
										return `${category.name}: ${players
											.map((p) => p.name)
											.join(', ')}`;
									})
									.join('\n');

								const shareText = `🏆 ТИР-ЛИСТ ${club?.name.toUpperCase()}\n\n${resultText}\n\n👉 Собери свой тир-лист в боте @MyachProBot`;
								tg.switchInlineQuery(shareText, ['users', 'groups']);
							}
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
		<div className='min-h-screen bg-gradient-to-b from-[#EC3381] to-[#FF6B9D] flex flex-col'>
			<div ref={resultsRef} className='flex-1 flex flex-col'>
				{/* Заголовок с мячом */}
				<div className='text-center py-6'>
					<div className='flex items-center justify-center gap-3 mb-2'>
						<div className='w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-yellow-400 flex items-center justify-center'>
							<span className='text-2xl'>⚽</span>
						</div>
					</div>
					<h1 className='text-white text-3xl font-bold'>РЕЗУЛЬТАТ</h1>
				</div>

				{/* Основной контент */}
				<div className='bg-white rounded-t-3xl flex-1 px-4 pt-6 pb-4'>
					{/* Заголовок тир-листа и логотип */}
					<div className='flex items-center justify-between mb-6'>
						<div>
							<h2 className='text-black text-lg font-bold'>ТИР-ЛИСТ ИГРОКОВ</h2>
							<div className='flex items-center gap-2 mt-1'>
								<img
									src={club.img_url}
									alt={club.name}
									className='w-6 h-6 object-contain'
									crossOrigin='anonymous'
									loading='eager'
									onError={(e) => {
										// Если логотип не загрузился, подставляем плейсхолдер
										const target = e.target as HTMLImageElement;
										target.onerror = null;
										target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%23EC3381'/%3E%3Ctext x='50%25' y='50%25' font-size='12' text-anchor='middle' dy='.3em' fill='white'%3E${club.name.charAt(
											0,
										)}%3C/text%3E%3C/svg%3E`;
									}}
								/>
								<span className='text-black font-semibold'>{club.name}</span>
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
								/>
							);
						})}
					</ul>

					{/* Ссылка на бота */}
					<div className='text-center mb-6'>
						<a
							href='https://t.me/MyachProBot'
							className='inline-flex items-center gap-2 text-blue-600 text-sm font-medium'
							target='_blank'
							rel='noopener noreferrer'
						>
							<span>🔗</span>
							Собери свой тир-лист в боте
						</a>
					</div>
				</div>
			</div>

			{/* Кнопка поделиться */}
			<div className='p-4'>
				<button
					onClick={handleShare}
					disabled={isSharing}
					className='w-full bg-yellow-400 text-black py-4 rounded-2xl text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed'
				>
					{isSharing ? 'Создаём картинку...' : 'Поделиться'}
				</button>
			</div>
		</div>
	);
};

export default Results;
