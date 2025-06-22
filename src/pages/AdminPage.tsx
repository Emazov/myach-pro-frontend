import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store';
import { LoadingSpinner } from '../components';
import { useEffect, useState } from 'react';

const AdminPage = () => {
	const { isAdmin, isLoading } = useUserStore();
	const navigate = useNavigate();
	const location = useLocation();
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

	if (isLoading) {
		return <LoadingSpinner fullScreen message='Проверка прав доступа...' />;
	}

	if (!isAdmin) {
		return null;
	}

	return (
		<div
			className='min-h-screen p-4'
			style={{
				background: 'var(--tg-theme-bg-color)',
				color: 'var(--tg-theme-text-color)',
			}}
		>
			<div className='max-w-4xl mx-auto'>
				{/* Заголовок */}
				<div className='flex items-center justify-center mb-8'>
					<h1 className='text-2xl font-bold text-center'>
						Панель администратора
					</h1>
				</div>

				{/* Уведомление об успехе */}
				{successMessage && (
					<div
						className='mb-6 p-4 rounded-lg'
						style={{
							background: 'var(--tg-theme-button-color)',
							color: 'var(--tg-theme-button-text-color)',
						}}
					>
						{successMessage}
					</div>
				)}

				{/* Сетка кнопок */}
				<div className='grid grid-cols-1 gap-4 max-w-2xl mx-auto'>
					<Link
						to='/admin/add-club'
						className='flex items-center justify-center p-4 rounded-lg font-medium text-center transition-opacity hover:opacity-80'
						style={{
							background: 'var(--tg-theme-button-color)',
							color: 'var(--tg-theme-button-text-color)',
						}}
					>
						<span className='text-lg'>➕ Добавить команду</span>
					</Link>

					<Link
						to='/admin/manage-club'
						className='flex items-center justify-center p-4 rounded-lg font-medium text-center transition-opacity hover:opacity-80'
						style={{
							background: 'var(--tg-theme-button-color)',
							color: 'var(--tg-theme-button-text-color)',
						}}
					>
						<span className='text-lg'>✏️ Изменить команду</span>
					</Link>

					<Link
						to='/admin/manage-admins'
						className='flex items-center justify-center p-4 rounded-lg font-medium text-center transition-opacity hover:opacity-80'
						style={{
							background: 'var(--tg-theme-button-color)',
							color: 'var(--tg-theme-button-text-color)',
						}}
					>
						<span className='text-lg'>👥 Управление админами</span>
					</Link>

					<Link
						to='/admin/analytics'
						className='flex items-center justify-center p-4 rounded-lg font-medium text-center transition-opacity hover:opacity-80'
						style={{
							background: 'var(--tg-theme-button-color)',
							color: 'var(--tg-theme-button-text-color)',
						}}
					>
						<span className='text-lg'>📊 Аналитика</span>
					</Link>

					<Link
						to='/guide'
						className='flex items-center justify-center p-4 rounded-lg font-medium text-center transition-opacity hover:opacity-80'
						style={{
							background: 'var(--tg-theme-button-color)',
							color: 'var(--tg-theme-button-text-color)',
						}}
					>
						<span className='text-lg'>🎮 Играть</span>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default AdminPage;
