import type { Category, Player } from '../types';

interface CategoryItemProps {
	category: Category;
	players?: Player[];
	onClick?: () => void;
	showPlayerImages?: boolean;
}

const CategoryItem = ({
	category,
	players = [],
	onClick,
	showPlayerImages = false,
}: CategoryItemProps) => {
	if (showPlayerImages) {
		return (
			<li
				className='category_item rounded-md py-[clamp(0.2rem,0.5vh,1rem)] flex px-[clamp(0.2rem,0.5vh,1rem)] justify-between items-center'
				style={{ backgroundColor: category.color }}
			>
				<p className='ml-1 category_name text-[clamp(1rem,4vw,4rem)] font-bold text-white text-left uppercase '>
					{category.name}
				</p>
				<ul className='player_list grid grid-cols-6 gap-1 items-center'>
					{players.map((player) => (
						<li
							className='player_item flex items-center justify-center rounded-lg w-[clamp(2.5rem,4vw,4rem)] h-[clamp(2.5rem,4vw,4rem)] overflow-hidden'
							key={`slot-${player.id}`}
						>
							<img
								src={player.img_url}
								alt={player.name}
								className='w-full h-full object-cover rounded-sm'
								crossOrigin='anonymous'
								loading='eager'
								onError={(e) => {
									// Если изображение не загрузилось, подставляем плейсхолдер
									const target = e.target as HTMLImageElement;
									target.onerror = null; // Предотвращаем бесконечную рекурсию
									// Подставляем плейсхолдер с инициалами игрока
									target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23${Math.floor(
										Math.random() * 16777215,
									).toString(
										16,
									)}'/%3E%3Ctext x='50%25' y='50%25' font-size='16' text-anchor='middle' dy='.3em' fill='white'%3E${player.name.charAt(
										0,
									)}%3C/text%3E%3C/svg%3E`;
								}}
							/>
						</li>
					))}
				</ul>
			</li>
		);
	}

	return (
		<li
			className={`category_item flex justify-center items-center text-[clamp(1.5rem,4vw,2rem)] font-bold rounded-lg text-white uppercase py-[clamp(0.5rem,1.5vh,1.5rem)] ${
				onClick ? 'cursor-pointer' : ''
			}`}
			style={{ backgroundColor: category.color }}
			onClick={onClick}
		>
			<p>{category.name}</p>
			<span className='ml-3 text-[clamp(1rem,4vw,3rem)] font-light'>
				{players.length} / {category.slots}
			</span>
		</li>
	);
};

export default CategoryItem;
