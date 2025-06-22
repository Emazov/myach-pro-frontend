/**
 * Генерирует стабильный цвет на основе строки
 */
function generateColorFromString(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}

	// Генерируем приятные цвета в диапазоне HSL
	const hue = Math.abs(hash) % 360;
	const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
	const lightness = 45 + (Math.abs(hash) % 20); // 45-65%

	// Конвертируем HSL в HEX
	const hslToHex = (h: number, s: number, l: number) => {
		l /= 100;
		const a = (s * Math.min(l, 1 - l)) / 100;
		const f = (n: number) => {
			const k = (n + h / 30) % 12;
			const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
			return Math.round(255 * color)
				.toString(16)
				.padStart(2, '0');
		};
		return `${f(0)}${f(8)}${f(4)}`;
	};

	return hslToHex(hue, saturation, lightness);
}

/**
 * Создает SVG плейсхолдер для изображения игрока
 */
export function createPlayerImagePlaceholder(
	playerName: string,
	width: number = 40,
	height: number = 40,
): string {
	const color = generateColorFromString(playerName);
	const initial = playerName.charAt(0).toUpperCase();
	const fontSize = Math.min(width, height) * 0.4;

	return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23${color}'/%3E%3Ctext x='50%25' y='50%25' font-size='${fontSize}' text-anchor='middle' dy='.3em' fill='white' font-family='Arial, sans-serif'%3E${initial}%3C/text%3E%3C/svg%3E`;
}

/**
 * Создает SVG плейсхолдер для логотипа клуба
 */
export function createClubLogoPlaceholder(
	clubName: string,
	width: number = 24,
	height: number = 24,
): string {
	const color = generateColorFromString(clubName);
	const initial = clubName.charAt(0).toUpperCase();
	const fontSize = Math.min(width, height) * 0.5;

	return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23${color}' rx='2'/%3E%3Ctext x='50%25' y='50%25' font-size='${fontSize}' text-anchor='middle' dy='.3em' fill='white' font-family='Arial, sans-serif' font-weight='bold'%3E${initial}%3C/text%3E%3C/svg%3E`;
}
