type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
	level: LogLevel;
	message: string;
	data?: any;
	timestamp: Date;
}

class Logger {
	private isDevelopment = import.meta.env.DEV;
	private logs: LogEntry[] = [];

	private log(level: LogLevel, message: string, data?: any) {
		const entry: LogEntry = {
			level,
			message,
			data,
			timestamp: new Date(),
		};

		this.logs.push(entry);

		// В development режиме выводим в консоль
		if (this.isDevelopment) {
			const method = level === 'debug' ? 'log' : level;
			console[method](`[${level.toUpperCase()}] ${message}`, data || '');
		}

		// В production логи можно отправлять на сервер
		if (!this.isDevelopment && level === 'error') {
			// TODO: Отправка критических ошибок на сервер
			this.sendErrorToServer(entry);
		}
	}

	debug(message: string, data?: any) {
		this.log('debug', message, data);
	}

	info(message: string, data?: any) {
		this.log('info', message, data);
	}

	warn(message: string, data?: any) {
		this.log('warn', message, data);
	}

	error(message: string, data?: any) {
		this.log('error', message, data);
	}

	// Группированные логи для отладки
	group(name: string, callback: () => void) {
		if (this.isDevelopment) {
			console.group(name);
			callback();
			console.groupEnd();
		} else {
			callback();
		}
	}

	// Получить все логи для отладки
	getLogs(): LogEntry[] {
		return [...this.logs];
	}

	// Очистить логи
	clearLogs() {
		this.logs = [];
	}

	private async sendErrorToServer(entry: LogEntry) {
		try {
			// TODO: Реализовать отправку ошибок на сервер
			// await fetch('/api/logs', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify(entry)
			// });
		} catch (error) {
			// Избегаем рекурсии при ошибке отправки логов
		}
	}
}

export const logger = new Logger();

// Утилиты для дебага
export const debugUtils = {
	// Засекаем время выполнения
	time: (label: string) => {
		if (import.meta.env.DEV) {
			console.time(label);
		}
	},

	timeEnd: (label: string) => {
		if (import.meta.env.DEV) {
			console.timeEnd(label);
		}
	},

	// Логируем render'ы компонентов
	renderLog: (componentName: string, props?: any) => {
		if (import.meta.env.DEV) {
			logger.debug(`🔄 ${componentName} render`, props);
		}
	},
};
