import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import {
	fetchAdmins,
	removeAdmin,
	searchUsers,
	addAdminByUsername,
} from '../api';

interface AdminUser {
	id: string;
	telegramId: string;
	username: string | null;
	addedBy: string | null;
	createdAt: string;
}

interface User {
	telegramId: string;
	username: string | null;
	role: string;
}

const ManageAdminsPage: React.FC = () => {
	const { initData } = useTelegram();
	const navigate = useNavigate();
	const [admins, setAdmins] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<User[]>([]);
	const [searchLoading, setSearchLoading] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

	// Поиск пользователей
	const handleSearch = async (query: string) => {
		if (!initData || !query.trim()) {
			setSearchResults([]);
			return;
		}

		try {
			setSearchLoading(true);
			const users = await searchUsers(initData, query.trim());
			setSearchResults(users);
		} catch (error) {
			console.error('Ошибка при поиске пользователей:', error);
			setSearchResults([]);
		} finally {
			setSearchLoading(false);
		}
	};

	// Добавление админа
	const handleAddAdmin = async () => {
		if (!initData || !selectedUser?.username) return;

		try {
			setOperationLoading(true);
			const result = await addAdminByUsername(initData, selectedUser.username);

			if (result.success) {
				alert('Админ успешно добавлен!');
				setIsAddModalOpen(false);
				setSearchQuery('');
				setSearchResults([]);
				setSelectedUser(null);
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

				{/* Информационная панель */}
				<div className='bg-blue-900 border border-blue-700 rounded-lg p-4 mb-6'>
					<h3 className='text-lg font-semibold mb-2 text-blue-300'>
						💡 Как добавить админа?
					</h3>
					<div className='text-sm text-blue-200 space-y-2'>
						<p>• Пользователь должен сначала запустить бота хотя бы один раз</p>
						<p>
							• У пользователя должен быть установлен @username в настройках
							Telegram
						</p>
						<p>• Введите @username в поле поиска (например: @ivan_petrov)</p>
						<p>
							• Если пользователя нет в списке - попросите его перезапустить
							бота
						</p>
					</div>
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
									Поиск пользователя *
								</label>
								<input
									type='text'
									value={searchQuery}
									onChange={(e) => {
										setSearchQuery(e.target.value);
										handleSearch(e.target.value);
									}}
									className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2'
									placeholder='Введите @username пользователя'
								/>
								{searchLoading && (
									<div className='text-sm text-gray-400 mt-1'>Поиск...</div>
								)}
							</div>

							{/* Результаты поиска */}
							{searchResults.length > 0 && (
								<div className='max-h-40 overflow-y-auto bg-gray-700 rounded-lg'>
									{searchResults.map((user) => (
										<div
											key={user.telegramId}
											onClick={() => {
												setSelectedUser(user);
												setSearchQuery(user.username || '');
												setSearchResults([]);
											}}
											className={`p-3 cursor-pointer hover:bg-gray-600 border-b border-gray-600 last:border-b-0 ${
												selectedUser?.telegramId === user.telegramId
													? 'bg-gray-600'
													: ''
											}`}
										>
											<div className='font-medium'>
												{user.username ? `@${user.username}` : 'Без username'}
											</div>
											<div className='text-sm text-gray-400'>
												{user.role === 'admin'
													? '⚠️ Уже админ'
													: 'Пользователь'}
											</div>
										</div>
									))}
								</div>
							)}

							{/* Выбранный пользователь */}
							{selectedUser && (
								<div className='bg-gray-700 rounded-lg p-3'>
									<div className='text-sm text-gray-400 mb-1'>
										Выбранный пользователь:
									</div>
									<div className='font-medium'>
										{selectedUser.username
											? `@${selectedUser.username}`
											: 'Без username'}
									</div>
									<div className='text-sm text-gray-400'>
										ID: {selectedUser.telegramId}
									</div>
									{selectedUser.role === 'admin' && (
										<div className='text-sm text-yellow-400 mt-1'>
											⚠️ Этот пользователь уже является админом
										</div>
									)}
								</div>
							)}

							{searchQuery && searchResults.length === 0 && !searchLoading && (
								<div className='text-sm text-gray-400'>
									Пользователи не найдены. Попробуйте другой запрос.
								</div>
							)}
						</div>

						<div className='flex gap-3 mt-6'>
							<button
								onClick={handleAddAdmin}
								disabled={
									operationLoading ||
									!selectedUser?.username ||
									selectedUser.role === 'admin'
								}
								className='flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-lg'
							>
								{operationLoading ? 'Добавление...' : 'Добавить админа'}
							</button>
							<button
								onClick={() => {
									setIsAddModalOpen(false);
									setSearchQuery('');
									setSearchResults([]);
									setSelectedUser(null);
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
