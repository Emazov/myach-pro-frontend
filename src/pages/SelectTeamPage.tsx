import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { fetchClubs } from '../api';
import type { Club } from '../types';

const SelectTeamPage = () => {
	const navigate = useNavigate();
	const { initData } = useTelegram();

	const [clubs, setClubs] = useState<Club[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadClubs = async () => {
			if (!initData) {
				setError('Данные Telegram не найдены');
				setIsLoading(false);
				return;
			}

			try {
				const clubsData = await fetchClubs(initData);
				setClubs(clubsData);
			} catch (err) {
				console.error('Ошибка при загрузке команд:', err);
				setError('Не удалось загрузить команды');
			} finally {
				setIsLoading(false);
			}
		};

		loadClubs();
	}, [initData]);

	const handleTeamSelect = (club: Club) => {
		// Переходим в игру с выбранной командой
		navigate('/game', {
			state: {
				selectedClub: club,
			},
		});
	};

	if (isLoading) {
		return (
			<div className='container flex flex-col items-center justify-center h-full'>
				<div className='text-2xl font-bold'>Загрузка команд...</div>
			</div>
		);
	}

	if (error || clubs.length === 0) {
		return (
			<div className='container flex flex-col items-center justify-center h-full'>
				<div className='text-2xl font-bold text-red-500 text-center mb-4'>
					{error || 'Команды не найдены'}
				</div>
				<button
					onClick={() => navigate('/guide')}
					className='link_btn bg-gray-500 text-white py-3 px-6 rounded-lg'
				>
					Назад
				</button>
			</div>
		);
	}

	return (
		<div className='container flex flex-col justify-between h-full py-8'>
			{/* Заголовок с кнопкой назад */}
			<div className='flex justify-between items-center mb-8'>
				<h1 className='text-[clamp(2rem,6vw,3rem)] font-bold text-center flex-1'>
					Выберите команду
				</h1>
				<button
					onClick={() => navigate('/guide')}
					className='text-2xl font-bold text-gray-600 ml-4'
				>
					×
				</button>
			</div>

			{/* Список команд */}
			<div className='flex-1 mb-8'>
				{clubs.length === 1 && clubs[0] ? (
					/* Если команда одна - показываем её по центру */
					<div className='flex justify-center items-center h-full'>
						<div
							onClick={() => handleTeamSelect(clubs[0]!)}
							className='flex flex-col items-center p-6 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors min-w-[200px]'
						>
							<div className='w-24 h-24 mb-4 overflow-hidden rounded-full bg-gray-300'>
								{clubs[0]!.img_url ? (
									<img
										src={clubs[0]!.img_url}
										alt={clubs[0]!.name}
										className='w-full h-full object-cover'
									/>
								) : (
									<div className='w-full h-full flex items-center justify-center text-gray-500'>
										?
									</div>
								)}
							</div>
							<span className='text-lg text-center font-bold'>
								{clubs[0]!.name}
							</span>
						</div>
					</div>
				) : (
					/* Если команд много - показываем сетку */
					<div className='grid grid-cols-2 gap-4'>
						{clubs.map((club) => (
							<div
								key={club.id}
								onClick={() => handleTeamSelect(club)}
								className='flex flex-col items-center p-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors'
							>
								<div className='w-16 h-16 mb-2 overflow-hidden rounded-full bg-gray-300'>
									{club.img_url ? (
										<img
											src={club.img_url}
											alt={club.name}
											className='w-full h-full object-cover'
										/>
									) : (
										<div className='w-full h-full flex items-center justify-center text-gray-500'>
											?
										</div>
									)}
								</div>
								<span className='text-sm text-center font-medium'>
									{club.name}
								</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default SelectTeamPage;
