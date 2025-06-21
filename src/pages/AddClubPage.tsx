import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store';
import { useTelegram } from '../hooks/useTelegram';
import { createClub } from '../api';

const AddClubPage = () => {
	const { isAdmin, isLoading } = useUserStore();
	const { initData } = useTelegram();
	const navigate = useNavigate();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [clubName, setClubName] = useState('');
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Проверяем права доступа
	React.useEffect(() => {
		if (!isLoading && !isAdmin) {
			navigate('/');
		}
	}, [isAdmin, isLoading, navigate]);

	const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedImage(file);

			// Создаем превью изображения
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleImageClick = () => {
		fileInputRef.current?.click();
	};

	const handleSubmit = async () => {
		setError(null);

		if (!clubName.trim()) {
			setError('Введите название команды');
			return;
		}

		if (!selectedImage) {
			setError('Выберите логотип команды');
			return;
		}

		if (!initData) {
			setError('Ошибка авторизации');
			return;
		}

		setIsSubmitting(true);

		try {
			const formData = new FormData();
			formData.append('name', clubName.trim());
			formData.append('logo', selectedImage);

			// Используем API сервис
			const response = await createClub(initData, formData);

			// Переходим на страницу добавления игроков с ID созданной команды
			navigate(`/admin/add-players/${response.club.id}`, {
				state: { clubName: clubName.trim() },
			});
		} catch (err) {
			console.error('Ошибка при создании команды:', err);
			setError(err instanceof Error ? err.message : 'Произошла ошибка');
		} finally {
			setIsSubmitting(false);
		}
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

	return (
		<div className='container flex flex-col justify-between h-full py-8'>
			{/* Заголовок с крестиком */}
			<div className='flex justify-between items-center mb-8'>
				<h1 className='text-[clamp(1.5rem,5vw,2rem)] font-bold'>
					Добавить команду
				</h1>
				<button
					onClick={() => navigate('/admin')}
					className='text-2xl font-bold text-gray-600'
				>
					×
				</button>
			</div>

			{/* Логотип команды */}
			<div className='flex flex-col items-center mb-8'>
				<div
					onClick={handleImageClick}
					className='w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer overflow-hidden'
				>
					{imagePreview ? (
						<img
							src={imagePreview}
							alt='Превью логотипа'
							className='w-full h-full object-cover'
						/>
					) : (
						<span className='text-gray-500 text-sm text-center'>
							Выберите
							<br />
							логотип
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

			{/* Поле ввода названия */}
			<div className='mb-8'>
				<input
					type='text'
					value={clubName}
					onChange={(e) => setClubName(e.target.value)}
					placeholder='Название команды'
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
				onClick={handleSubmit}
				disabled={isSubmitting || !clubName.trim() || !selectedImage}
				className='bg-[#EC3381] text-white py-4 rounded-full text-[clamp(1rem,3vw,1.5rem)] font-medium disabled:opacity-50 disabled:cursor-not-allowed'
			>
				{isSubmitting ? 'Сохранение...' : 'Дальше'}
			</button>
		</div>
	);
};

export default AddClubPage;
