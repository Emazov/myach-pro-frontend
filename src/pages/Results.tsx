import { useState, useEffect } from 'react';
import { useGameStore } from '../store';
import { CategoryItem } from '../components';
import { fetchClubs } from '../api';
import { useTelegram } from '../hooks/useTelegram';

const Results = () => {
	const { initData } = useTelegram();
	const { categorizedPlayers, categories } = useGameStore();
	const [club, setClub] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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
			<div className='flex-1 flex flex-col'>
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
				<div className='bg-white rounded-t-3xl flex-1 px-4 pt-6 pb-16'>
					{/* Заголовок тир-листа и логотип */}
					<div className='flex items-center justify-between mb-6'>
						<div>
							<h2 className='text-black text-lg font-bold'>ТИР-ЛИСТ ИГРОКОВ</h2>
							<div className='flex items-center gap-2 mt-1'>
								<img
									src={club.img_url}
									alt={club.name}
									className='w-6 h-6 object-contain'
									loading='eager'
									onError={(e) => {
										// Если логотип не загрузился, скрываем изображение
										const target = e.target as HTMLImageElement;
										target.style.display = 'none';
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
