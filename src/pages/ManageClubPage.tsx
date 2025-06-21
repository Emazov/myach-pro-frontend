import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store';
import { useTelegram } from '../hooks/useTelegram';
import { fetchClubs, deleteClub } from '../api';

interface Club {
	id: string;
	name: string;
	logoUrl: string;
}

const ManageClubPage = () => {
	const { isAdmin, isLoading } = useUserStore();
	const { initData } = useTelegram();
	const navigate = useNavigate();
	const location = useLocation();

	const [clubs, setClubs] = useState<Club[]>([]);
	const [selectedClub, setSelectedClub] = useState<Club | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [isLoadingClubs, setIsLoadingClubs] = useState(true);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	// Проверяем права доступа
	useEffect(() => {
		if (!isLoading && !isAdmin) {
			navigate('/');
		}
	}, [isAdmin, isLoading, navigate]);

	// Проверяем сообщения из state при навигации
	useEffect(() => {
		if (location.state?.message) {
			setSuccessMessage(location.state.message);
			// Очищаем сообщение через 3 секунды
			setTimeout(() => setSuccessMessage(null), 3000);
		}
	}, [location.state]);

	// Загружаем список команд
	useEffect(() => {
		const loadClubs = async () => {
			if (!initData) return;

			try {
				setIsLoadingClubs(true);
				const clubsData = await fetchClubs(initData);
				// Преобразуем данные в нужный формат
				const formattedClubs = clubsData.map((club: any) => ({
					id: club.id,
					name: club.name,
					logoUrl: club.img_url || '',
				}));
				setClubs(formattedClubs);
			} catch (err) {
				console.error('Ошибка при загрузке команд:', err);
				setError('Не удалось загрузить команды');
			} finally {
				setIsLoadingClubs(false);
			}
		};

		if (initData) {
			loadClubs();
		}
	}, [initData]);

	const handleClubClick = (club: Club) => {
		setSelectedClub(club);
		setShowModal(true);
	};

	const handleEditClub = () => {
		if (selectedClub) {
			setShowModal(false);
			navigate(`/admin/edit-club/${selectedClub.id}`, {
				state: { club: selectedClub },
			});
		}
	};

	const handleEditPlayers = () => {
		if (selectedClub) {
			setShowModal(false);
			navigate(`/admin/edit-players/${selectedClub.id}`, {
				state: { clubName: selectedClub.name },
			});
		}
	};

	const handleDeleteClub = async () => {
		if (!selectedClub || !initData) return;

		if (
			!confirm(`Вы уверены, что хотите удалить команду "${selectedClub.name}"?`)
		) {
			return;
		}

		setIsDeleting(true);
		try {
			await deleteClub(initData, selectedClub.id);

			// Удаляем команду из списка
			setClubs((prev) => prev.filter((club) => club.id !== selectedClub.id));

			setShowModal(false);
			setSelectedClub(null);

			// Показываем сообщение об успехе
			navigate('/admin', {
				state: { message: `Команда "${selectedClub.name}" успешно удалена!` },
			});
		} catch (err) {
			console.error('Ошибка при удалении команды:', err);
			setError(
				err instanceof Error ? err.message : 'Произошла ошибка при удалении',
			);
		} finally {
			setIsDeleting(false);
		}
	};

	if (isLoading || isLoadingClubs) {
		return (
			<div className='container flex flex-col items-center justify-center h-full'>
				<div className='text-2xl font-bold'>Загрузка...</div>
			</div>
		);
	}

	if (!isAdmin) {
		return null;
	}

	return (
		<div className='container flex flex-col justify-between h-full py-8'>
			{/* Заголовок с крестиком */}
			<div className='flex justify-between items-center mb-8'>
				<h1 className='text-[clamp(1.5rem,5vw,2rem)] font-bold'>Команды</h1>
				<button
					onClick={() => navigate('/admin')}
					className='text-2xl font-bold text-gray-600'
				>
					×
				</button>
			</div>

			{/* Уведомление об успехе */}
			{successMessage && (
				<div className='mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded'>
					{successMessage}
				</div>
			)}

			{/* Ошибка */}
			{error && (
				<div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
					{error}
				</div>
			)}

			{/* Список команд */}
			<div className='flex-1 mb-8'>
				{clubs.length === 0 ? (
					<div className='text-center text-gray-500 mt-8'>
						Команды не найдены
					</div>
				) : (
					<div className='grid grid-cols-2 gap-4'>
						{clubs.map((club) => (
							<div
								key={club.id}
								onClick={() => handleClubClick(club)}
								className='flex flex-col items-center p-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors'
							>
								<div className='w-16 h-16 mb-2 overflow-hidden rounded-full bg-gray-300'>
									{club.logoUrl ? (
										<img
											src={club.logoUrl}
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

			{/* Модальное окно опций команды */}
			{showModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50'>
					<div className='bg-white rounded-t-3xl p-6 w-full min-h-[300px]'>
						<div className='flex justify-between items-center mb-6'>
							<h2 className='text-xl font-bold'>{selectedClub?.name}</h2>
							<button
								onClick={() => {
									setShowModal(false);
									setSelectedClub(null);
								}}
								className='text-2xl font-bold text-gray-600'
							>
								×
							</button>
						</div>

						<div className='flex flex-col gap-4'>
							<button
								onClick={handleEditClub}
								className='bg-[#EC3381] text-white py-4 rounded-full text-[clamp(1rem,3vw,1.2rem)] font-medium'
							>
								Изменить лого и название
							</button>

							<button
								onClick={handleEditPlayers}
								className='bg-[#EC3381] text-white py-4 rounded-full text-[clamp(1rem,3vw,1.2rem)] font-medium'
							>
								Изменить игроков
							</button>

							<button
								onClick={handleDeleteClub}
								disabled={isDeleting}
								className='bg-black text-white py-4 rounded-full text-[clamp(1rem,3vw,1.2rem)] font-medium disabled:opacity-50'
							>
								{isDeleting ? 'Удаление...' : 'Удалить команду'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ManageClubPage;
