import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { fetchAdmins, addAdmin, removeAdmin } from '../api';

interface AdminUser {
	id: string;
	telegramId: string;
	username: string | null;
	addedBy: string | null;
	createdAt: string;
}

const ManageAdminsPage: React.FC = () => {
	const { initData } = useTelegram();
	const navigate = useNavigate();
	const [admins, setAdmins] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [newAdminTelegramId, setNewAdminTelegramId] = useState('');
	const [newAdminUsername, setNewAdminUsername] = useState('');
	const [operationLoading, setOperationLoading] = useState(false);

	useEffect(() => {
		loadAdmins();
	}, []);

	const loadAdmins = async () => {
		if (!initData) return;

		try {
			setLoading(true);
			const adminsData = await fetchAdmins(initData);
			setAdmins(adminsData);
		} catch (error) {
			console.error('Ошибка при загрузке админов:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddAdmin = async () => {
		if (!initData || !newAdminTelegramId.trim()) return;

		try {
			setOperationLoading(true);
			const result = await addAdmin(
				initData,
				newAdminTelegramId.trim(),
				newAdminUsername.trim() || undefined,
			);

			if (result.success) {
				alert('Админ успешно добавлен!');
				setIsAddModalOpen(false);
				setNewAdminTelegramId('');
				setNewAdminUsername('');
				await loadAdmins();
			} else {
				alert(`Ошибка: ${result.message}`);
			}
		} catch (error) {
			console.error('Ошибка при добавлении админа:', error);
			alert('Ошибка при добавлении админа');
		} finally {
			setOperationLoading(false);
		}
	};

	const handleRemoveAdmin = async (admin: AdminUser) => {
		if (!initData) return;

		if (!confirm(`Удалить админа ${admin.username || admin.telegramId}?`)) {
			return;
		}

		try {
			setOperationLoading(true);
			const result = await removeAdmin(initData, admin.telegramId);

			if (result.success) {
				alert('Админ успешно удален!');
				await loadAdmins();
			} else {
				alert(`Ошибка: ${result.message}`);
			}
		} catch (error) {
			console.error('Ошибка при удалении админа:', error);
			alert('Ошибка при удалении админа');
		} finally {
			setOperationLoading(false);
		}
	};

	if (loading) {
		return (
			<div className='min-h-screen bg-gray-900 flex items-center justify-center'>
				<div className='text-white text-xl'>Загрузка...</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-900 text-white p-4'>
			<div className='max-w-4xl mx-auto'>
				{/* Заголовок */}
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center gap-4'>
						<button
							onClick={() => navigate('/admin')}
							className='text-blue-400 hover:text-blue-300 text-lg'
						>
							← Назад
						</button>
						<h1 className='text-2xl font-bold'>Управление админами</h1>
					</div>
					<button
						onClick={() => setIsAddModalOpen(true)}
						className='bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg'
						disabled={operationLoading}
					>
						Добавить админа
					</button>
				</div>

				{/* Список админов */}
				<div className='space-y-4'>
					{admins.map((admin) => (
						<div
							key={admin.id}
							className='bg-gray-800 rounded-lg p-4 flex items-center justify-between'
						>
							<div>
								<div className='text-lg font-semibold'>
									{admin.username || 'Без имени'}
								</div>
								<div className='text-gray-400 text-sm'>
									ID: {admin.telegramId}
								</div>
								<div className='text-gray-500 text-xs'>
									{admin.addedBy
										? `Добавлен админом: ${admin.addedBy}`
										: 'Главный админ'}
								</div>
								<div className='text-gray-500 text-xs'>
									{new Date(admin.createdAt).toLocaleString('ru-RU')}
								</div>
							</div>

							<div className='flex gap-2'>
								{admin.id !== 'main-admin' && (
									<button
										onClick={() => handleRemoveAdmin(admin)}
										className='bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm'
										disabled={operationLoading}
									>
										Удалить
									</button>
								)}
								{admin.id === 'main-admin' && (
									<span className='text-gray-400 text-sm'>Главный админ</span>
								)}
							</div>
						</div>
					))}
				</div>

				{admins.length === 0 && (
					<div className='text-center text-gray-400 py-8'>
						Админы не найдены
					</div>
				)}
			</div>

			{/* Модальное окно добавления админа */}
			{isAddModalOpen && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<div className='bg-gray-800 rounded-lg p-6 w-full max-w-md'>
						<h2 className='text-xl font-bold mb-4'>Добавить нового админа</h2>

						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium mb-2'>
									Telegram ID *
								</label>
								<input
									type='text'
									value={newAdminTelegramId}
									onChange={(e) => setNewAdminTelegramId(e.target.value)}
									className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2'
									placeholder='Введите Telegram ID'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium mb-2'>
									Имя пользователя (необязательно)
								</label>
								<input
									type='text'
									value={newAdminUsername}
									onChange={(e) => setNewAdminUsername(e.target.value)}
									className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2'
									placeholder='Введите имя пользователя'
								/>
							</div>
						</div>

						<div className='flex gap-3 mt-6'>
							<button
								onClick={handleAddAdmin}
								disabled={operationLoading || !newAdminTelegramId.trim()}
								className='flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-lg'
							>
								{operationLoading ? 'Добавление...' : 'Добавить'}
							</button>
							<button
								onClick={() => {
									setIsAddModalOpen(false);
									setNewAdminTelegramId('');
									setNewAdminUsername('');
								}}
								disabled={operationLoading}
								className='flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg'
							>
								Отмена
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ManageAdminsPage;
