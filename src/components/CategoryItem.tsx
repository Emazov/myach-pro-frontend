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
							className='player_item flex items-center justify-center rounded-lg w-[clamp(2.5rem,4vw,4rem)]'
							key={`slot-${player.id}`}
						>
							<img
								src={player.img_url}
								alt={player.name}
								className='object-cover rounded-sm'
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
