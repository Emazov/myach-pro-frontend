import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useUserStore } from '../store';
import { useTelegram } from '../hooks/useTelegram';
import { createPlayer } from '../api';

interface Player {
	id: string;
	name: string;
	image: File | null;
	imagePreview: string | null;
}

const AddPlayersPage = () => {
	const { isAdmin, isLoading } = useUserStore();
	const { initData } = useTelegram();
	const navigate = useNavigate();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { clubId } = useParams();
	const { state } = useLocation();

	const [players, setPlayers] = useState<Player[]>(
		Array.from({ length: 20 }, (_, i) => ({
			id: `player-${i}`,
			name: '',
			image: null,
			imagePreview: null,
		})),
	);
	const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(
		null,
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPlayerForm, setShowPlayerForm] = useState(false);

	// Проверяем права доступа
	useEffect(() => {
		if (!isLoading && !isAdmin) {
			navigate('/');
			return;
		}
	}, [isAdmin, isLoading, navigate]);

	const handleSlotClick = (index: number) => {
		setSelectedPlayerIndex(index);
		setShowPlayerForm(true);
	};

	const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (selectedPlayerIndex === null) return;

		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setPlayers((prev) =>
					prev.map((player, index) =>
						index === selectedPlayerIndex
							? {
									...player,
									image: file,
									imagePreview: e.target?.result as string,
							  }
							: player,
					),
				);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleNameChange = (name: string) => {
		if (selectedPlayerIndex === null) return;

		setPlayers((prev) =>
			prev.map((player, index) =>
				index === selectedPlayerIndex ? { ...player, name } : player,
			),
		);
	};

	const handleSavePlayer = async () => {
		if (selectedPlayerIndex === null) return;

		const player = players[selectedPlayerIndex];

		if (!player || !player.name.trim()) {
			setError('Введите имя игрока');
			return;
		}

		if (!player.image) {
			setError('Выберите фото игрока');
			return;
		}

		if (!clubId || !initData) {
			setError('Ошибка данных команды');
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append('name', player.name.trim());
			formData.append('avatar', player.image);
			formData.append('clubId', clubId);

			// Используем API сервис
			await createPlayer(initData, formData);

			// Успешно сохранено
			setShowPlayerForm(false);
			setSelectedPlayerIndex(null);
		} catch (err) {
			console.error('Ошибка при создании игрока:', err);
			setError(err instanceof Error ? err.message : 'Произошла ошибка');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleFinish = () => {
		navigate('/admin', {
			state: {
				message: `Игроки для команды "${
					state?.clubName || 'команды'
				}" успешно добавлены!`,
			},
		});
	};

	if (isLoading) {
		return (
			<div className='container flex flex-col items-center justify-center h-full'>
				<div className='text-2xl font-bold'>Загрузка...</div>
			</div>
		);
	}

	if (!isAdmin) {
		return null;
	}

	const currentPlayer =
		selectedPlayerIndex !== null ? players[selectedPlayerIndex] : null;

	return (
		<div
			className='min-h-screen p-4'
			style={{
				background: 'var(--tg-theme-bg-color)',
				color: 'var(--tg-theme-text-color)',
			}}
		>
			<div className='max-w-4xl mx-auto'>
				{!showPlayerForm ? (
					<>
						{/* Заголовок с кнопкой назад */}
						<div className='flex items-center justify-between mb-8'>
							<div className='flex items-center gap-4'>
								<button
									onClick={() => navigate('/admin')}
									className='text-lg transition-opacity hover:opacity-70'
									style={{ color: 'var(--tg-theme-link-color)' }}
								>
									← Назад
								</button>
								<div>
									<h1 className='text-2xl font-bold'>Добавьте игроков</h1>
									{state?.clubName && (
										<span
											className='block text-lg mt-1'
											style={{ color: 'var(--tg-theme-hint-color)' }}
										>
											в команду "{state.clubName}"
										</span>
									)}
								</div>
							</div>
						</div>

						{/* Сетка игроков */}
						<div className='grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4 mb-8 flex-1'>
							{players.map((player, index) => (
								<div
									key={player.id}
									onClick={() => handleSlotClick(index)}
									className='aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-opacity hover:opacity-80'
									style={{ background: 'var(--tg-theme-secondary-bg-color)' }}
								>
									{player.imagePreview ? (
										<div className='w-full h-full flex flex-col'>
											<img
												src={player.imagePreview}
												alt={player.name}
												className='flex-1 w-full object-cover'
											/>
											<div
												className='text-xs p-1 text-center'
												style={{
													background: 'var(--tg-theme-bg-color)',
													color: 'var(--tg-theme-text-color)',
												}}
											>
												{player.name}
											</div>
										</div>
									) : (
										<>
											<span
												className='text-2xl mb-1'
												style={{ color: 'var(--tg-theme-hint-color)' }}
											>
												+
											</span>
											<span
												className='text-xs text-center'
												style={{ color: 'var(--tg-theme-hint-color)' }}
											>
												Имя
											</span>
										</>
									)}
								</div>
							))}
						</div>

						{/* Кнопка сохранения */}
						<button
							onClick={handleFinish}
							className='py-4 rounded-lg text-lg font-medium w-full transition-opacity hover:opacity-80'
							style={{
								background: 'var(--tg-theme-button-color)',
								color: 'var(--tg-theme-button-text-color)',
							}}
						>
							Сохранить
						</button>
					</>
				) : (
					<>
						{/* Форма добавления игрока */}
						<div className='flex justify-between items-center mb-8'>
							<h1 className='text-[clamp(1.5rem,5vw,2rem)] font-bold'>
								Добавить игрока
							</h1>
							<button
								onClick={() => {
									setShowPlayerForm(false);
									setSelectedPlayerIndex(null);
									setError(null);
								}}
								className='text-2xl font-bold text-gray-600'
							>
								×
							</button>
						</div>

						{/* Сетка игроков (уменьшенная) */}
						<div className='grid grid-cols-5 gap-2 mb-8'>
							{players.slice(0, 5).map((player, index) => (
								<div
									key={player.id}
									className={`aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden ${
										index === selectedPlayerIndex ? 'ring-2 ring-[#EC3381]' : ''
									}`}
								>
									{player.imagePreview ? (
										<img
											src={player.imagePreview}
											alt={player.name}
											className='w-full h-full object-cover'
										/>
									) : (
										<span className='text-lg text-gray-500'>+</span>
									)}
								</div>
							))}
						</div>

						{/* Фото игрока */}
						<div className='flex flex-col items-center mb-8'>
							<div
								onClick={() => fileInputRef.current?.click()}
								className='w-32 h-32 bg-yellow-400 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden'
							>
								{currentPlayer?.imagePreview ? (
									<img
										src={currentPlayer.imagePreview}
										alt='Превью игрока'
										className='w-full h-full object-cover'
									/>
								) : (
									<span className='text-white text-sm text-center'>
										Добавить
										<br />
										фото
									</span>
								)}
							</div>
							<input
								ref={fileInputRef}
								type='file'
								accept='image/*'
								onChange={handleImageSelect}
								className='hidden'
							/>
						</div>

						{/* Поле ввода имени */}
						<div className='mb-8'>
							<input
								type='text'
								value={currentPlayer?.name || ''}
								onChange={(e) => handleNameChange(e.target.value)}
								placeholder='Имя игрока'
								className='w-full p-4 border-b-2 border-gray-300 bg-transparent text-[clamp(1rem,3vw,1.2rem)] focus:outline-none focus:border-[#EC3381]'
								disabled={isSubmitting}
							/>
						</div>

						{/* Ошибка */}
						{error && (
							<div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
								{error}
							</div>
						)}

						{/* Кнопка сохранения */}
						<button
							onClick={handleSavePlayer}
							disabled={
								isSubmitting ||
								!currentPlayer?.name.trim() ||
								!currentPlayer?.image
							}
							className='bg-[#EC3381] text-white py-4 rounded-full text-[clamp(1rem,3vw,1.5rem)] font-medium disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{isSubmitting ? 'Сохранение...' : 'Сохранить'}
						</button>
					</>
				)}
			</div>
		</div>
	);
};

export default AddPlayersPage;
