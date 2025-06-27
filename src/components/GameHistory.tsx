import React, { useState } from 'react';
import { useGameStore } from '../store';

interface GameHistoryProps {
	isVisible: boolean;
	onClose: () => void;
}

const GameHistory: React.FC<GameHistoryProps> = ({ isVisible, onClose }) => {
	const { getGameHistory, goBackToAction, getCurrentPlayer } = useGameStore();
	const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

	const history = getGameHistory();
	const currentPlayer = getCurrentPlayer();

	const handleGoBackToAction = (actionId: string) => {
		const success = goBackToAction(actionId);
		if (success) {
			onClose();
		}
	};

	const formatTime = (timestamp: number) => {
		return new Date(timestamp).toLocaleTimeString('ru-RU', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		});
	};

	if (!isVisible) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div
				className='bg-[var(--tg-theme-bg-color)] rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col'
				style={{
					border: '1px solid var(--tg-theme-secondary-bg-color)',
					color: 'var(--tg-theme-text-color)',
				}}
			>
				{/* Заголовок */}
				<div className='p-4 border-b border-[var(--tg-theme-secondary-bg-color)]'>
					<div className='flex items-center justify-between'>
						<h3 className='text-lg font-bold'>История игры</h3>
						<button
							onClick={onClose}
							className='w-8 h-8 rounded-full flex items-center justify-center'
							style={{
								background: 'var(--tg-theme-secondary-bg-color)',
								color: 'var(--tg-theme-text-color)',
							}}
						>
							✕
						</button>
					</div>
					{currentPlayer && (
						<p
							className='text-sm mt-2'
							style={{ color: 'var(--tg-theme-hint-color)' }}
						>
							Текущий игрок:{' '}
							<span className='font-medium'>{currentPlayer.name}</span>
						</p>
					)}
				</div>

				{/* Список истории */}
				<div className='flex-1 overflow-y-auto p-4'>
					{history.length === 0 ? (
						<div
							className='text-center py-8'
							style={{ color: 'var(--tg-theme-hint-color)' }}
						>
							<p>История пока пуста</p>
							<p className='text-sm mt-1'>
								Начните расставлять игроков по категориям
							</p>
						</div>
					) : (
						<div className='space-y-3'>
							{history
								.slice()
								.reverse()
								.map((action) => (
									<div
										key={action.actionId}
										className='p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02]'
										style={{
											background:
												selectedActionId === action.actionId
													? 'var(--tg-theme-secondary-bg-color)'
													: 'var(--tg-theme-bg-color)',
											borderColor:
												selectedActionId === action.actionId
													? 'var(--tg-theme-link-color)'
													: 'var(--tg-theme-secondary-bg-color)',
										}}
										onClick={() =>
											setSelectedActionId(
												selectedActionId === action.actionId
													? null
													: action.actionId,
											)
										}
									>
										<div className='flex items-start justify-between'>
											<div className='flex-1'>
												<div className='flex items-center gap-2 mb-1'>
													<span
														className='text-xs px-2 py-1 rounded-full font-medium'
														style={{
															background: action.wasReplacement
																? 'var(--tg-theme-destructive-text-color)'
																: 'var(--tg-theme-link-color)',
															color: 'white',
														}}
													>
														{action.wasReplacement ? 'Замена' : 'Добавление'}
													</span>
													<span
														className='text-xs'
														style={{ color: 'var(--tg-theme-hint-color)' }}
													>
														{formatTime(action.timestamp)}
													</span>
												</div>

												<p className='font-medium text-sm mb-1'>
													{action.player.name}
												</p>

												<div
													className='text-xs'
													style={{ color: 'var(--tg-theme-hint-color)' }}
												>
													<p>
														Категория:{' '}
														<span className='font-medium'>
															{action.categoryName}
														</span>
													</p>
													{action.wasReplacement && action.replacedPlayer && (
														<p>
															Заменил:{' '}
															<span className='font-medium'>
																{action.replacedPlayer.name}
															</span>
														</p>
													)}
												</div>
											</div>

											{action.player.img_url && (
												<img
													src={action.player.img_url}
													alt={action.player.name}
													className='w-12 h-12 rounded-lg object-cover ml-3'
												/>
											)}
										</div>

										{/* Кнопка возврата */}
										{selectedActionId === action.actionId && (
											<div
												className='mt-3 pt-3 border-t'
												style={{
													borderColor: 'var(--tg-theme-secondary-bg-color)',
												}}
											>
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleGoBackToAction(action.actionId);
													}}
													className='w-full py-2 px-4 rounded-lg font-medium transition-opacity hover:opacity-80'
													style={{
														background: 'var(--tg-theme-button-color)',
														color: 'var(--tg-theme-button-text-color)',
													}}
												>
													Вернуться к этому моменту
												</button>
												<p
													className='text-xs mt-2 text-center'
													style={{ color: 'var(--tg-theme-hint-color)' }}
												>
													Все последующие действия будут отменены
												</p>
											</div>
										)}
									</div>
								))}
						</div>
					)}
				</div>

				{/* Кнопка сброса до начала */}
				{history.length > 0 && (
					<div className="p-4 border-t" style={{ borderColor: 'var(--tg-theme-secondary-bg-color)' }}>
						<button
							onClick={() => {
								const firstAction = history[0];
								if (firstAction) {
									handleGoBackToAction(firstAction.actionId);
								}
							}}
							className="w-full py-3 px-4 rounded-lg font-medium"
							style={{
								background: 'var(--tg-theme-destructive-text-color)',
								color: 'white',
							}}
						>
							Сбросить до начала игры
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default GameHistory;
