import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { useUserStore } from '../store';
import { navigateToGame } from '../utils/navigation';
import { fetchClubs } from '../api';

const players = Array.from({ length: 20 }, (_, i) => i + 1);

const categories = [
	{ name: 'goat', color: '#0EA94B', slots: 2 },
	{ name: 'Хорош', color: '#94CC7A', slots: 6 },
	{ name: 'норм', color: '#E6A324', slots: 6 },
	{ name: 'Бездарь', color: '#E13826', slots: 6 },
];

const Guide = () => {
	const [nextStep, setNextStep] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [showNoClubsMessage, setShowNoClubsMessage] = useState(false);
	const navigate = useNavigate();
	const { initData } = useTelegram();
	const { isAdmin } = useUserStore();

	const handleStartGame = async () => {
		if (!initData) {
			console.error('Данные Telegram не найдены');
			return;
		}

		setIsLoading(true);
		try {
			// Проверяем наличие команд перед переходом к игре
			const clubs = await fetchClubs(initData);

			if (clubs.length === 0) {
				// Показываем сообщение об отсутствии команд
				setShowNoClubsMessage(true);
				return;
			}

			// Если команды есть, переходим к игре
			await navigateToGame(initData, navigate);
		} catch (error) {
			console.error('Ошибка при загрузке команд:', error);
			// Показываем общее сообщение об ошибке
			setShowNoClubsMessage(true);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoToAdmin = () => {
		navigate('/admin');
	};

	const handleCreateFirstClub = () => {
		navigate('/admin/add-club');
	};

	return (
		<div className='container flex flex-col justify-around h-full'>
			{!nextStep && (
				<>
					<div className='guide_item'>
						<h2 className='text-[clamp(2rem,7vw,3rem)] text-center font-bold mb-4'>
							Покажем 20 игроков
						</h2>
						<div className='player_list grid grid-cols-10 gap-1'>
							{players.map((num) => (
								<div
									className='player_item flex items-center justify-center text-[clamp(1.5rem,4vw,2.5rem)] font-bold rounded-lg'
									style={{
										background: '#FFEC13',
										color: '#EC3381',
									}}
									key={`player-${num}`}
								>
									<p>{num}</p>
								</div>
							))}
						</div>
					</div>
					<div className='guide_item'>
						<h2 className='text-[clamp(2rem,7vw,3rem)] text-center font-bold mb-4'>
							Распредели их по 4 категориям:
						</h2>
						<ul className='category_list text-center flex flex-col gap-2'>
							{categories.map((category) => (
								<li
									key={`category-${category.name}`}
									className='category_item text-[clamp(1.5rem,4vw,2rem)] font-bold rounded-lg text-white uppercase py-[clamp(0.5rem,1.5vh,1.5rem)]'
									style={{
										backgroundColor: category.color,
									}}
								>
									<p>{category.name}</p>
								</li>
							))}
						</ul>
					</div>
				</>
			)}
			{nextStep && (
				<>
					<div className='guide_item'>
						<h2 className='text-[clamp(2rem,7vw,3rem)] text-center font-bold mb-4'>
							Ограниченное количество мест
						</h2>
						<ul className='category_list flex flex-col gap-2'>
							{categories.map((category) => (
								<li
									key={`category-${category.name}`}
									className='category_item rounded-lg py-[clamp(0.5rem,1vh,1rem)] flex px-[clamp(0.5rem,2vw,2rem)] justify-between items-center'
									style={{
										backgroundColor: category.color,
									}}
								>
									<p className='category_name text-[clamp(1rem,5vw,3rem)] font-bold text-white text-left uppercase '>
										{category.name}
									</p>
									<ul className='player_list grid grid-cols-6 gap-2 items-center'>
										{Array.from(
											{ length: category.slots },
											(_, i) => i + 1,
										).map((num) => (
											<li
												className='player_item flex items-center justify-center text-[clamp(1.5rem,4vw,2.5rem)] font-bold rounded-lg w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vh,4rem)]'
												style={{
													background: '#FFEC13',
													color: '#EC3381',
												}}
												key={`slot-${num}`}
											>
												{num}
											</li>
										))}
									</ul>
								</li>
							))}
						</ul>
					</div>
					<div className='guide_item'>
						<h2 className='text-[clamp(2rem,7vw,3rem)] text-center font-bold'>
							Если в категории нет места — замени игрока или выбери другую
							категорию
						</h2>
					</div>
				</>
			)}
			{!nextStep && (
				<div className='guide_btns flex gap-3 items-center'>
					{isAdmin && (
						<button
							onClick={handleGoToAdmin}
							className='link_btn text-[clamp(1rem,2vh,1.5rem)] py-[clamp(0.5rem,2vh,1rem)] border-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-80'
							style={{
								background: '#EC3381',
								color: '#fff',
								borderColor: '#EC3381',
							}}
						>
							👤 Админ
						</button>
					)}
					<button
						className='link_btn text-[clamp(1rem,2vh,1.5rem)] py-[clamp(0.5rem,2vh,1rem)] border-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-80'
						style={{
							background: '#EC3381',
							color: '#fff',
							borderColor: '#EC3381',
						}}
						onClick={() => setNextStep(true)}
					>
						Дальше
					</button>
				</div>
			)}
			{nextStep && (
				<div className='guide_btns flex gap-3 items-center'>
					<button
						className='link_btn text-[clamp(1rem,2vh,1.5rem)] py-[clamp(0.5rem,2vh,1rem)] border-2 transition-opacity hover:opacity-80'
						style={{
							color: '#EC3381',
							borderColor: '#EC3381',
							background: 'transparent',
						}}
						onClick={() => setNextStep(false)}
					>
						Назад
					</button>
					<button
						onClick={handleStartGame}
						disabled={isLoading}
						className='link_btn text-[clamp(1rem,2vh,1.5rem)] py-[clamp(0.5rem,2vh,1rem)] border-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-80'
						style={{
							background: '#EC3381',
							color: '#fff',
							borderColor: '#EC3381',
						}}
					>
						{isLoading ? 'Загрузка...' : 'Начать игру'}
					</button>
				</div>
			)}

			{/* Модальное окно при отсутствии команд */}
			{showNoClubsMessage && (
				<div
					className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
					onClick={() => setShowNoClubsMessage(false)}
				>
					<div
						className='rounded-lg p-6 max-w-sm w-full'
						style={{
							background: 'var(--tg-theme-bg-color)',
							color: 'var(--tg-theme-text-color)',
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<h3 className='text-xl font-bold mb-4 text-center'>
							Команды не найдены
						</h3>
						<p
							className='text-center mb-6'
							style={{ color: 'var(--tg-theme-hint-color)' }}
						>
							{isAdmin
								? 'Для начала игры необходимо создать хотя бы одну команду с игроками.'
								: 'В системе пока нет команд. Обратитесь к администратору для добавления команд.'}
						</p>

						<div className='flex flex-col gap-3'>
							{isAdmin && (
								<button
									onClick={handleCreateFirstClub}
									className='py-3 rounded-lg text-lg font-medium w-full transition-opacity hover:opacity-80'
									style={{
										background: 'var(--tg-theme-button-color)',
										color: 'var(--tg-theme-button-text-color)',
									}}
								>
									Создать команду
								</button>
							)}
							<button
								onClick={() => setShowNoClubsMessage(false)}
								className='py-3 rounded-lg text-lg font-medium w-full transition-opacity hover:opacity-80'
								style={{
									background: 'var(--tg-theme-secondary-bg-color)',
									color: 'var(--tg-theme-text-color)',
								}}
							>
								Закрыть
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Guide;
