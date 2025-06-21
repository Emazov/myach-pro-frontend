export interface Player {
	id: number;
	name: string;
	img_url: string;
	club_id: number;
}

export interface Club {
	id: number;
	name: string;
	img_url: string;
}

export interface Category {
	name: string;
	color: string;
	slots: number;
}

export interface CategorizedPlayers {
	[key: string]: Player[];
}

export interface LocationState {
	categorizedPlayers: CategorizedPlayers;
	club: Club;
}

export type ModalMode = 'message' | 'replace_player';

export interface ModalProps {
	isOpen: boolean;
	mode: ModalMode;
	message?: string;
	categoryName?: string;
	players?: Player[];
	onClose: () => void;
	onReplacePlayer?: (player: Player) => void;
	onChooseOtherCategory?: () => void;
}

export type UserRole = 'admin' | 'user';

export interface User {
	id: string;
	telegramId: number;
	role: UserRole;
}
