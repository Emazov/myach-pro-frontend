import type { CategorizedPlayers, Category } from '../types';

interface ShareData {
	categorizedPlayers: CategorizedPlayers;
	categories: Category[];
	clubName: string;
}

export const generateShareText = ({
	categorizedPlayers,
	categories,
	clubName,
}: ShareData): string => {
	let text = `🏆 ТИР-ЛИСТ ИГРОКОВ "${clubName.toUpperCase()}"\n\n`;

	categories.forEach((category) => {
		const players = categorizedPlayers[category.name] || [];
		const emoji = getCategoryEmoji(category.name);

		text += `${emoji} ${category.name.toUpperCase()} (${players.length}/${
			category.slots
		}):\n`;

		if (players.length > 0) {
			players.forEach((player, index) => {
				text += `${index + 1}. ${player.name}\n`;
			});
		} else {
			text += '— Пусто\n';
		}
		text += '\n';
	});

	text += '⚽ Создано в боте @myach_pro_bot';
	return text;
};

export const generateShareImage = async (
	shareData: ShareData,
): Promise<string | null> => {
	try {
		// Создаем Canvas для генерации изображения
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		if (!ctx) return null;

		// Настройки canvas
		canvas.width = 800;
		canvas.height = 1000;

		// Фон с градиентом
		const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
		gradient.addColorStop(0, '#EC3381');
		gradient.addColorStop(1, '#FF6B9D');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Заголовок
		ctx.fillStyle = 'white';
		ctx.font = 'bold 48px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('ТИР-ЛИСТ ИГРОКОВ', canvas.width / 2, 80);

		// Название клуба
		ctx.font = 'bold 36px Arial';
		ctx.fillText(shareData.clubName.toUpperCase(), canvas.width / 2, 140);

		// Рендерим категории
		let yPos = 200;
		shareData.categories.forEach((category) => {
			const players = shareData.categorizedPlayers[category.name] || [];

			// Фон категории
			ctx.fillStyle = category.color;
			ctx.fillRect(50, yPos, canvas.width - 100, 60);

			// Название категории
			ctx.fillStyle = 'white';
			ctx.font = 'bold 28px Arial';
			ctx.textAlign = 'left';
			ctx.fillText(
				`${category.name.toUpperCase()} (${players.length}/${category.slots})`,
				70,
				yPos + 40,
			);

			yPos += 80;

			// Игроки
			if (players.length > 0) {
				ctx.fillStyle = 'white';
				ctx.font = '24px Arial';
				players.forEach((player, index) => {
					ctx.fillText(`${index + 1}. ${player.name}`, 70, yPos);
					yPos += 35;
				});
			} else {
				ctx.fillStyle = '#cccccc';
				ctx.font = 'italic 20px Arial';
				ctx.fillText('— Пусто', 70, yPos);
				yPos += 35;
			}

			yPos += 20;
		});

		// Логотип бота внизу
		ctx.fillStyle = 'white';
		ctx.font = '20px Arial';
		ctx.textAlign = 'center';
		ctx.fillText(
			'⚽ Создано в @myach_pro_bot',
			canvas.width / 2,
			canvas.height - 40,
		);

		// Конвертируем в base64
		return canvas.toDataURL('image/png');
	} catch (error) {
		console.error('Ошибка при создании изображения:', error);
		return null;
	}
};

const getCategoryEmoji = (categoryName: string): string => {
	const emojiMap: Record<string, string> = {
		goat: '🐐',
		хорош: '👍',
		норм: '👌',
		бездарь: '👎',
	};

	return emojiMap[categoryName.toLowerCase()] || '⚽';
};

export const shareViaTelegram = (shareData: ShareData) => {
	try {
		const tg = (window as any).Telegram?.WebApp;
		const text = generateShareText(shareData);

		if (tg?.openTelegramLink) {
			// Используем Telegram sharing API
			const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(text)}`;
			tg.openTelegramLink(shareUrl);
		} else if (navigator.share) {
			// Fallback на Web Share API
			navigator.share({
				title: `Тир-лист игроков ${shareData.clubName}`,
				text: text,
			});
		} else {
			// Fallback на копирование в буфер обмена
			copyToClipboard(text);
		}
	} catch (error) {
		console.error('Ошибка при шеринге:', error);
		// Последний fallback
		const text = generateShareText(shareData);
		copyToClipboard(text);
	}
};

const copyToClipboard = async (text: string) => {
	try {
		if (navigator.clipboard) {
			await navigator.clipboard.writeText(text);
			alert('Результат скопирован в буфер обмена!');
		} else {
			// Fallback для старых браузеров
			const textArea = document.createElement('textarea');
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
			alert('Результат скопирован в буфер обмена!');
		}
	} catch (error) {
		console.error('Ошибка при копировании:', error);
		alert('Не удалось скопировать результат');
	}
};
