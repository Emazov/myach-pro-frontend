interface LoadingSpinnerProps {
	size?: 'sm' | 'md' | 'lg';
	message?: string;
	fullScreen?: boolean;
	color?: string;
}

const LoadingSpinner = ({
	size = 'md',
	message,
	fullScreen = false,
	color = 'var(--tg-theme-button-color)',
}: LoadingSpinnerProps) => {
	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12',
	};

	const containerClasses = fullScreen
		? 'min-h-screen flex flex-col items-center justify-center p-4'
		: 'flex flex-col items-center justify-center p-4';

	const spinner = (
		<div
			className={`${sizeClasses[size]} animate-spin border-2 border-gray-300 border-t-transparent rounded-full`}
			style={{ borderTopColor: color }}
		/>
	);

	const content = (
		<div className={containerClasses}>
			{spinner}
			{message && (
				<p
					className='mt-3 text-center font-medium'
					style={{ color: 'var(--tg-theme-text-color)' }}
				>
					{message}
				</p>
			)}
		</div>
	);

	if (fullScreen) {
		return (
			<div style={{ background: 'var(--tg-theme-bg-color)' }}>{content}</div>
		);
	}

	return content;
};

export default LoadingSpinner;
