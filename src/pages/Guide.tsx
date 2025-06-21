import { useState } from 'react';
import { Link } from 'react-router-dom';

const players = Array.from({ length: 20 }, (_, i) => i + 1);

const categories = [
	{ name: 'goat', color: '#0EA94B', slots: 2 },
	{ name: 'Хорош', color: '#94CC7A', slots: 6 },
	{ name: 'норм', color: '#E6A324', slots: 6 },
	{ name: 'Бездарь', color: '#E13826', slots: 6 },
];

const Guide = () => {
	const [nextStep, setNextStep] = useState(false);

	return (
		<div className='container flex flex-col justify-around h-full'>
			{!nextStep && (
				<>
					<div className='guide_item'>
						<h2 className='text-[clamp(2rem,7vw,3rem)] text-center font-bold mb-4'>
							Покажем 20 игроков
						</h2>
						<div className='player_list grid grid-cols-10 gap-1'>
							{players.map((num) => (
								<div
									className='player_item flex items-center justify-center text-[clamp(1.5rem,4vw,2.5rem)] font-bold bg-[#FFEC13] text-[#EC3381] rounded-lg'
									key={`player-${num}`}
								>
									<p>{num}</p>
								</div>
							))}
						</div>
					</div>
					<div className='guide_item'>
						<h2 className='text-[clamp(2rem,7vw,3rem)] text-center font-bold mb-4'>
							Распредели их по 4 категориям:
						</h2>
						<ul className='category_list text-center flex flex-col gap-2'>
							{categories.map((category) => (
								<li
									key={`category-${category.name}`}
									className='category_item text-[clamp(1.5rem,4vw,2rem)] font-bold rounded-lg text-white uppercase py-[clamp(0.5rem,1.5vh,1.5rem)]'
									style={{
										backgroundColor: category.color,
									}}
								>
									<p>{category.name}</p>
								</li>
							))}
						</ul>
					</div>
				</>
			)}
			{nextStep && (
				<>
					<div className='guide_item'>
						<h2 className='text-[clamp(2rem,7vw,3rem)] text-center font-bold mb-4'>
							Ограниченное количество мест
						</h2>
						<ul className='category_list flex flex-col gap-2'>
							{categories.map((category) => (
								<li
									key={`category-${category.name}`}
									className='category_item rounded-lg py-[clamp(0.5rem,1vh,1rem)] flex px-[clamp(0.5rem,2vw,2rem)] justify-between items-center'
									style={{
										backgroundColor: category.color,
									}}
								>
									<p className='category_name text-[clamp(1rem,5vw,3rem)] font-bold text-white text-left uppercase '>
										{category.name}
									</p>
									<ul className='player_list grid grid-cols-6 gap-2 items-center'>
										{Array.from(
											{ length: category.slots },
											(_, i) => i + 1,
										).map((num) => (
											<li
												className='player_item flex items-center justify-center text-[clamp(1.5rem,4vw,2.5rem)] font-bold bg-[#FFEC13] text-[#EC3381] rounded-lg w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vh,4rem)]'
												key={`slot-${num}`}
											>
												{num}
											</li>
										))}
									</ul>
								</li>
							))}
						</ul>
					</div>
					<div className='guide_item'>
						<h2 className='text-[clamp(2rem,7vw,3rem)] text-center font-bold'>
							Если в категории нет места — замени игрока или выбери другую
							категорию
						</h2>
					</div>
				</>
			)}
			{!nextStep && (
				<button
					className='link_btn bg-[#EC3381] border-1 border-[#EC3381] text-white py-[clamp(1rem,2vh,2rem)] text-[clamp(1rem,2vh,1.5rem)]'
					onClick={() => setNextStep(true)}
				>
					Дальше
				</button>
			)}
			{nextStep && (
				<div className='guide_btns flex gap-3 items-center'>
					<button
						className='link_btn text-[#EC3381] border-2 text-[clamp(1rem,2vh,1.5rem)] py-[clamp(0.5rem,2vh,1rem)]'
						onClick={() => setNextStep(false)}
					>
						Назад
					</button>
					<Link
						to='/game'
						className='link_btn text-white bg-[#EC3381] text-[clamp(1rem,2vh,1.5rem)] border-2 border-[#EC3381] py-[clamp(0.5rem,2vh,1rem)]'
					>
						Начать игру
					</Link>
				</div>
			)}
		</div>
	);
};

export default Guide;
