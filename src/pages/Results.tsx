import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store';
import { CategoryItem } from '../components';
import { fetchClubs } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import { navigateToGame } from '../utils/navigation';

const Results = () => {
	const navigate = useNavigate();
	const { initData } = useTelegram();
	const { categorizedPlayers, resetGame, categories } = useGameStore();
	const [club, setClub] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isStartingNewGame, setIsStartingNewGame] = useState(false);
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

	const handleNewGame = async () => {
		if (!initData) {
			console.error('Данные Telegram не найдены');
			return;
		}

		setIsStartingNewGame(true);
		try {
			resetGame();
			await navigateToGame(initData, navigate);
		} finally {
			setIsStartingNewGame(false);
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

			<div className='flex justify-center gap-4 mt-8'>
				<button
					onClick={handleNewGame}
					disabled={isStartingNewGame}
					className='bg-[#EC3381] text-white py-3 px-6 rounded-lg text-[clamp(1rem,3vw,1.2rem)] disabled:opacity-50 disabled:cursor-not-allowed'
				>
					{isStartingNewGame ? 'Загрузка...' : 'Новая игра'}
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
