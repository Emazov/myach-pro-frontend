import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserInstructionsPage: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className='min-h-screen bg-gray-900 text-white p-4'>
			<div className='max-w-2xl mx-auto'>
				{/* Заголовок */}
				<div className='flex items-center gap-4 mb-6'>
					<button
						onClick={() => navigate(-1)}
						className='text-blue-400 hover:text-blue-300 text-lg'
					>
						← Назад
					</button>
					<h1 className='text-2xl font-bold'>Инструкция для пользователей</h1>
				</div>

				{/* Основная инструкция */}
				<div className='bg-gray-800 rounded-lg p-6 mb-6'>
					<h2 className='text-xl font-semibold mb-4 text-blue-300'>
						🎯 Как стать администратором бота?
					</h2>
					<div className='space-y-4 text-gray-300'>
						<p>
							Чтобы вас могли добавить в качестве администратора, выполните
							следующие шаги:
						</p>
						<div className='bg-gray-700 rounded-lg p-4'>
							<h3 className='font-semibold mb-2 text-white'>
								1. Установите @username в Telegram
							</h3>
							<ul className='space-y-2 text-sm'>
								<li>• Откройте Telegram и перейдите в "Настройки"</li>
								<li>• Найдите раздел "Имя пользователя" или "Username"</li>
								<li>
									• Придумайте и установите уникальное имя (например:
									@ivan_petrov)
								</li>
								<li>• Сохраните изменения</li>
							</ul>
						</div>

						<div className='bg-gray-700 rounded-lg p-4'>
							<h3 className='font-semibold mb-2 text-white'>
								2. Запустите бота
							</h3>
							<ul className='space-y-2 text-sm'>
								<li>• Обязательно запустите этого бота хотя бы один раз</li>
								<li>• Нажмите кнопку "Старт" или отправьте команду /start</li>
								<li>• Это необходимо для регистрации в системе</li>
							</ul>
						</div>

						<div className='bg-gray-700 rounded-lg p-4'>
							<h3 className='font-semibold mb-2 text-white'>
								3. Сообщите ваш @username администратору
							</h3>
							<ul className='space-y-2 text-sm'>
								<li>• Скажите главному администратору ваш @username</li>
								<li>
									• Администратор сможет найти вас в системе и назначить права
								</li>
								<li>
									• После назначения перезапустите бота для обновления прав
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Важные замечания */}
				<div className='bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-6'>
					<h3 className='text-lg font-semibold mb-2 text-yellow-300'>
						⚠️ Важно!
					</h3>
					<div className='text-sm text-yellow-200 space-y-2'>
						<p>• Без @username вас невозможно будет найти в системе</p>
						<p>
							• Обязательно запустите бота до того, как вас будут добавлять в
							админы
						</p>
						<p>• После получения прав админа перезапустите бота</p>
						<p>
							• Если возникли проблемы - обратитесь к главному администратору
						</p>
					</div>
				</div>

				{/* Пример */}
				<div className='bg-green-900 border border-green-700 rounded-lg p-4'>
					<h3 className='text-lg font-semibold mb-2 text-green-300'>
						✅ Пример правильного @username
					</h3>
					<div className='text-sm text-green-200 space-y-2'>
						<p>
							<strong>Правильно:</strong> @ivan_petrov, @admin_2024, @user123
						</p>
						<p>
							<strong>Неправильно:</strong> Иван Петров, ivan.petrov@mail.ru,
							+79998887766
						</p>
						<p>
							@username должен начинаться с символа @ и содержать только буквы,
							цифры и подчеркивания
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserInstructionsPage;
