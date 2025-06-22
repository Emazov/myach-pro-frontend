import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		// Обновляем состояние, чтобы следующий рендер показал fallback UI
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Логируем ошибку
		console.error('Error Boundary перехватил ошибку:', error, errorInfo);

		this.setState({
			error,
			errorInfo,
		});

		// Здесь можно отправить ошибку в сервис мониторинга
		// например, в Sentry, LogRocket и т.д.
	}

	private handleReload = () => {
		window.location.reload();
	};

	private handleReset = () => {
		this.setState({ hasError: false, error: undefined, errorInfo: undefined });
	};

	render() {
		if (this.state.hasError) {
			// Если передан кастомный fallback, используем его
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Стандартный fallback UI
			return (
				<div
					className='min-h-screen flex flex-col items-center justify-center p-4'
					style={{
						background: 'var(--tg-theme-bg-color)',
						color: 'var(--tg-theme-text-color)',
					}}
				>
					<div className='text-center max-w-md'>
						<h2 className='text-2xl font-bold mb-4 text-red-500'>
							Что-то пошло не так 😔
						</h2>
						<p className='text-gray-600 mb-6'>
							Произошла неожиданная ошибка. Попробуйте перезагрузить страницу.
						</p>

						{/* Показываем детали ошибки только в development */}
						{import.meta.env.DEV && this.state.error && (
							<details className='mb-6 text-left'>
								<summary className='cursor-pointer text-sm text-gray-500 mb-2'>
									Детали ошибки (только для разработки)
								</summary>
								<pre className='text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40'>
									{this.state.error.toString()}
									{this.state.errorInfo?.componentStack}
								</pre>
							</details>
						)}

						<div className='flex flex-col gap-3'>
							<button
								onClick={this.handleReload}
								className='py-3 px-6 rounded-lg font-medium transition-opacity hover:opacity-80'
								style={{
									background: 'var(--tg-theme-button-color)',
									color: 'var(--tg-theme-button-text-color)',
								}}
							>
								Перезагрузить страницу
							</button>

							<button
								onClick={this.handleReset}
								className='py-2 px-4 text-sm text-gray-500 hover:text-gray-700 transition-colors'
							>
								Попробовать еще раз
							</button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
