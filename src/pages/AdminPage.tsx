import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store';
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
		<div className='container flex flex-col justify-around h-full py-8'>
			<div className='hero flex flex-col items-center'>
				<h1 className='text-[clamp(2rem,6vw,3rem)] font-bold text-center mb-8'>
					Панель администратора
				</h1>

				{/* Уведомление об успехе */}
				{successMessage && (
					<div className='mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded'>
						{successMessage}
					</div>
				)}
			</div>

			<div className='admin-buttons flex flex-col gap-4'>
				<Link
					to='/admin/add-club'
					className='admin-btn bg-black text-white text-[clamp(1rem,3vw,1.5rem)] py-4 rounded-full text-center font-medium'
				>
					Добавить команду
				</Link>

				<Link
					to='/admin/manage-club'
					className='admin-btn bg-black text-white text-[clamp(1rem,3vw,1.5rem)] py-4 rounded-full text-center font-medium'
				>
					Изменить команду
				</Link>

				<Link
					to='/admin/manage-admins'
					className='admin-btn bg-black text-white text-[clamp(1rem,3vw,1.5rem)] py-4 rounded-full text-center font-medium'
				>
					Управление админами
				</Link>

				<Link
					to='/admin/user-instructions'
					className='admin-btn bg-blue-600 text-white text-[clamp(1rem,3vw,1.5rem)] py-4 rounded-full text-center font-medium'
				>
					📋 Инструкция для пользователей
				</Link>

				<Link
					to='/admin/analytics'
					className='admin-btn bg-black text-white text-[clamp(1rem,3vw,1.5rem)] py-4 rounded-full text-center font-medium'
				>
					Аналитика
				</Link>

				<Link
					to='/guide'
					className='admin-btn bg-[#EC3381] text-white text-[clamp(1rem,3vw,1.5rem)] py-4 rounded-full text-center font-medium'
				>
					Играть
				</Link>
			</div>
		</div>
	);
};

export default AdminPage;
