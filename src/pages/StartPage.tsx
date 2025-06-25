import { Link } from 'react-router-dom';
import { useUserStore } from '../store';

const StartPage = () => {
	const { isAdmin, isLoading, telegramId } = useUserStore();

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
					) : telegramId && isAdmin ? (
						<div className='mt-4 bg-white/80 p-3 rounded-lg text-center'>
							<div className='flex flex-col gap-1'>
								<p className='font-bold text-green-600'>Администратор</p>
							</div>
						</div>
					) : null}
				</div>

				{/* Разные кнопки для админов и обычных пользователей */}

				<div className='flex flex-col gap-3'>
					<Link
						to={isAdmin ? '/admin' : '/guide'}
						className='link_btn bg-[#FFEC13] text-[clamp(1rem,2vh,1.5rem)] text-black py-[clamp(1rem,1vh,2rem)]'
					>
						{isAdmin ? 'Админ' : 'Поехали!'}
					</Link>
				</div>
			</div>
		</div>
	);
};

export default StartPage;
