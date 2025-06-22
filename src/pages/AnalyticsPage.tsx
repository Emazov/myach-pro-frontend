import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { LoadingSpinner } from '../components';
import { getStats, getDetailedStats } from '../api/analyticsService';
import type { AnalyticsStats, DetailedStats } from '../api/analyticsService';

const AnalyticsPage = () => {
	const navigate = useNavigate();
	const { initData } = useTelegram();
	const [stats, setStats] = useState<AnalyticsStats | null>(null);
	const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedPeriod, setSelectedPeriod] = useState(7);

	useEffect(() => {
		const loadAnalytics = async () => {
			if (!initData) {
				setError('Данные Telegram не найдены');
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const [statsData, detailedData] = await Promise.all([
					getStats(initData),
					getDetailedStats(initData, selectedPeriod),
				]);

				setStats(statsData);
				setDetailedStats(detailedData);
			} catch (err: any) {
				console.error('Ошибка при загрузке аналитики:', err);
				setError(err.message || 'Ошибка при загрузке данных');
			} finally {
				setLoading(false);
			}
		};

		loadAnalytics();
	}, [initData, selectedPeriod]);

	const handlePeriodChange = (days: number) => {
		setSelectedPeriod(days);
	};

	if (loading) {
		return <LoadingSpinner fullScreen message='Загрузка аналитики...' />;
	}

	if (error || !stats) {
		return (
			<div className='min-h-screen flex flex-col items-center justify-center p-4'>
				<div className='text-center max-w-md'>
					<h2 className='text-2xl font-bold mb-4 text-red-500'>
						{error || 'Ошибка при загрузке данных'}
					</h2>
					<button
						className='py-3 px-6 rounded-lg font-medium transition-opacity hover:opacity-80 bg-blue-500 text-white mr-4'
						onClick={() => window.location.reload()}
					>
						Обновить
					</button>
					<button
						className='py-3 px-6 rounded-lg font-medium transition-opacity hover:opacity-80 bg-gray-500 text-white'
						onClick={() => navigate('/admin')}
					>
						Назад
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-b from-[#EC3381] to-[#FF6B9D] flex flex-col'>
			{/* Заголовок */}
			<div className='text-center py-6'>
				<div className='flex items-center justify-center gap-3 mb-2'>
					<img
						src='./main_logo.png'
						alt='main_logo'
						className='w-16 h-16 object-contain'
						loading='eager'
					/>
				</div>
				<h1 className='text-white text-3xl font-bold'>АНАЛИТИКА</h1>
			</div>

			{/* Основной контент */}
			<div className='bg-[var(--tg-theme-bg-color)] rounded-t-3xl flex-1 px-4 pt-6 pb-16'>
				{/* Кнопка назад */}
				<div className='mb-6'>
					<button
						onClick={() => navigate('/admin')}
						className='flex items-center gap-2 text-blue-500 hover:text-blue-700 transition-colors'
					>
						<span>←</span>
						<span>Назад к админ панели</span>
					</button>
				</div>

				{/* Общая статистика */}
				<div className='mb-6'>
					<h2 className='text-xl font-bold mb-4'>Общая статистика</h2>
					<div className='grid grid-cols-2 gap-4 mb-4'>
						<div className='bg-white rounded-lg p-4 shadow-sm'>
							<div className='text-2xl font-bold text-[#EC3381]'>
								{stats.totalUsers}
							</div>
							<div className='text-sm text-gray-600'>Всего пользователей</div>
						</div>
						<div className='bg-white rounded-lg p-4 shadow-sm'>
							<div className='text-2xl font-bold text-[#EC3381]'>
								{stats.totalAppStarts}
							</div>
							<div className='text-sm text-gray-600'>Запусков приложения</div>
						</div>
						<div className='bg-white rounded-lg p-4 shadow-sm'>
							<div className='text-2xl font-bold text-[#EC3381]'>
								{stats.totalGameCompletions}
							</div>
							<div className='text-sm text-gray-600'>Завершенных игр</div>
						</div>
						<div className='bg-white rounded-lg p-4 shadow-sm'>
							<div className='text-2xl font-bold text-[#EC3381]'>
								{stats.conversionRate}%
							</div>
							<div className='text-sm text-gray-600'>Конверсия</div>
						</div>
					</div>
				</div>

				{/* Статистика за сегодня */}
				<div className='mb-6'>
					<h2 className='text-xl font-bold mb-4'>За сегодня</h2>
					<div className='grid grid-cols-3 gap-3'>
						<div className='bg-white rounded-lg p-3 shadow-sm'>
							<div className='text-lg font-bold text-blue-500'>
								{stats.recentStats.usersToday}
							</div>
							<div className='text-xs text-gray-600'>Новых пользователей</div>
						</div>
						<div className='bg-white rounded-lg p-3 shadow-sm'>
							<div className='text-lg font-bold text-blue-500'>
								{stats.recentStats.appStartsToday}
							</div>
							<div className='text-xs text-gray-600'>Запусков</div>
						</div>
						<div className='bg-white rounded-lg p-3 shadow-sm'>
							<div className='text-lg font-bold text-blue-500'>
								{stats.recentStats.gameCompletionsToday}
							</div>
							<div className='text-xs text-gray-600'>Завершений</div>
						</div>
					</div>
				</div>

				{/* Фильтр периода */}
				<div className='mb-6'>
					<h2 className='text-xl font-bold mb-4'>Детальная статистика</h2>
					<div className='flex gap-2 mb-4'>
						{[7, 14, 30].map((days) => (
							<button
								key={days}
								onClick={() => handlePeriodChange(days)}
								className={`px-4 py-2 rounded-lg font-medium transition-colors ${
									selectedPeriod === days
										? 'bg-[#EC3381] text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
								}`}
							>
								{days} дней
							</button>
						))}
					</div>
				</div>

				{/* Топ клубов */}
				{detailedStats && (
					<div className='mb-6'>
						<h3 className='text-lg font-semibold mb-3'>Топ клубов по играм</h3>
						<div className='space-y-2'>
							{detailedStats.topClubs.map((club, index) => (
								<div
									key={club.clubId}
									className='bg-white rounded-lg p-3 shadow-sm flex justify-between items-center'
								>
									<div className='flex items-center gap-3'>
										<div className='w-6 h-6 bg-[#EC3381] text-white rounded-full flex items-center justify-center text-sm font-bold'>
											{index + 1}
										</div>
										<span className='font-medium'>{club.clubName}</span>
									</div>
									<div className='text-[#EC3381] font-bold'>
										{club.gameCount} игр
									</div>
								</div>
							))}
						</div>
						{detailedStats.topClubs.length === 0 && (
							<div className='text-center text-gray-500 py-4'>
								Нет данных за выбранный период
							</div>
						)}
					</div>
				)}

				{/* Статистика по дням */}
				{detailedStats && (
					<div className='mb-6'>
						<h3 className='text-lg font-semibold mb-3'>Статистика по дням</h3>
						<div className='space-y-2'>
							{detailedStats.dailyStats.map((day: any) => (
								<div
									key={day.date}
									className='bg-white rounded-lg p-3 shadow-sm'
								>
									<div className='font-medium mb-1'>
										{new Date(day.date).toLocaleDateString('ru-RU')}
									</div>
									<div className='grid grid-cols-2 gap-4 text-sm'>
										<div>
											<span className='text-gray-600'>Запуски: </span>
											<span className='font-medium'>
												{Number(day.app_starts) || 0}
											</span>
										</div>
										<div>
											<span className='text-gray-600'>Завершения: </span>
											<span className='font-medium'>
												{Number(day.game_completions) || 0}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
						{detailedStats.dailyStats.length === 0 && (
							<div className='text-center text-gray-500 py-4'>
								Нет данных за выбранный период
							</div>
						)}
					</div>
				)}

				{/* Кнопка обновления */}
				<div className='text-center mt-8'>
					<button
						onClick={() => window.location.reload()}
						className='bg-[#EC3381] text-white py-3 px-8 rounded-lg font-medium hover:opacity-80 transition-opacity'
					>
						Обновить данные
					</button>
				</div>
			</div>
		</div>
	);
};

export default AnalyticsPage;
