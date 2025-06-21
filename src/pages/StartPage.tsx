import { Link } from 'react-router-dom';
import { useUserStore } from '../store';

const StartPage = () => {
	const { isAdmin, isLoading, user, telegramId } = useUserStore();

	return (
		<div className='welcome bg-[url("/main_bg.jpg")] bg-cover bg-center h-full'>
			<div className='container flex flex-col justify-around h-full'>
				<div className='hero flex flex-col items-center'>
					<h2 className='text-white text-[clamp(2.5rem,9vw,3.5rem)] text-center font-bold'>
						Добро <br />
						пожаловать!
					</h2>
					<img src='./main_logo.png' alt='logo' className='logo' />

					{/* Отображаем статус пользователя */}
					{isLoading ? (
						<div className='mt-4 bg-white/80 p-3 rounded-lg text-center'>
							<p className='font-medium'>Проверка пользователя...</p>
						</div>
					) : telegramId ? (
						<div className='mt-4 bg-white/80 p-3 rounded-lg text-center'>
							{isAdmin ? (
								<div className='flex flex-col gap-1'>
									<p className='font-bold text-green-600'>Администратор</p>
									<p>ID: {telegramId}</p>
									{user && <p>Роль: {user.role}</p>}
								</div>
							) : (
								<div className='flex flex-col gap-1'>
									<p>Обычный пользователь</p>
									<p>ID: {telegramId}</p>
								</div>
							)}
						</div>
					) : (
						<div className='mt-4 bg-white/80 p-3 rounded-lg text-center'>
							<p>Telegram ID не найден</p>
						</div>
					)}
				</div>
				<Link
					to='/guide'
					className='link_btn bg-[#FFEC13] text-[clamp(1rem,2vh,1.5rem)] text-black py-[clamp(1rem,1vh,2rem)]'
				>
					Поехали!
				</Link>
			</div>
		</div>
	);
};

export default StartPage;
