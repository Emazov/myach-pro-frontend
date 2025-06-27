import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Улучшенный Service Worker с поддержкой инвалидации кэша
if ('serviceWorker' in navigator && import.meta.env.PROD) {
	window.addEventListener('load', async () => {
		try {
			// Создаем улучшенный Service Worker с правильным кэшированием API
			const swCode = `
				const CACHE_NAME = 'myach-pro-v2'; // Увеличиваем версию для обновления
				const STATIC_CACHE_NAME = 'myach-pro-static-v2';
				const API_CACHE_NAME = 'myach-pro-api-v2';
				
				// Статические ресурсы для кэширования
				const staticUrlsToCache = [
					'/',
					'/assets/',
					'/fonts/'
				];

				// КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: НЕ кэшируем API запросы клубов и игроков в SW
				const NEVER_CACHE_PATTERNS = [
					'/api/clubs',
					'/api/players',
					'/api/admin'
				];

				self.addEventListener('install', (event) => {
					event.waitUntil(
						Promise.all([
							// Кэшируем только статические ресурсы
							caches.open(STATIC_CACHE_NAME)
								.then((cache) => cache.addAll(staticUrlsToCache))
						])
					);
					self.skipWaiting(); // Принудительно активируем новый SW
				});

				self.addEventListener('activate', (event) => {
					event.waitUntil(
						caches.keys().then((cacheNames) => {
							return Promise.all(
								cacheNames.map((cacheName) => {
									// Удаляем старые кэши
									if (cacheName !== STATIC_CACHE_NAME && 
										cacheName !== API_CACHE_NAME && 
										cacheName !== CACHE_NAME) {
										return caches.delete(cacheName);
									}
								})
							);
						})
					);
					self.clients.claim(); // Берем контроль над всеми клиентами
				});

				self.addEventListener('fetch', (event) => {
					const url = new URL(event.request.url);
					
					// КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Никогда не кэшируем API клубов и игроков
					const shouldNeverCache = NEVER_CACHE_PATTERNS.some(pattern => 
						url.pathname.includes(pattern)
					);
					
					if (shouldNeverCache) {
						// Всегда идем в сеть для API запросов
						event.respondWith(
							fetch(event.request).catch(() => {
								// В случае ошибки сети возвращаем fallback
								return new Response(JSON.stringify({
									error: 'Нет соединения с сервером'
								}), {
									status: 503,
									headers: { 'Content-Type': 'application/json' }
								});
							})
						);
						return;
					}
					
					// Для статических ресурсов используем кэш
					if (url.pathname.includes('/assets/') || 
						url.pathname.includes('/fonts/') ||
						url.pathname === '/') {
						
						event.respondWith(
							caches.match(event.request)
								.then((response) => {
									return response || fetch(event.request);
								})
						);
						return;
					}
					
					// Для всех остальных запросов идем в сеть
					event.respondWith(fetch(event.request));
				});
			`;

			const blob = new Blob([swCode], { type: 'application/javascript' });
			const swUrl = URL.createObjectURL(blob);

			const registration = await navigator.serviceWorker.register(swUrl);
			console.log('SW registered with cache invalidation:', registration);

			// Очищаем старые кэши при обновлении
			if (registration.waiting) {
				registration.waiting.postMessage({ type: 'SKIP_WAITING' });
			}
		} catch (error) {
			console.log('SW registration failed:', error);
		}
	});
} else {
	// КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Полная очистка SW в development
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.getRegistrations().then((regs) => {
			regs.forEach((reg) => {
				reg.unregister();
				console.log('SW unregistered for development');
			});
		});

		// Очищаем все кэши в development
		if ('caches' in window) {
			caches.keys().then((names) => {
				names.forEach((name) => {
					caches.delete(name);
				});
			});
		}
	}
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</StrictMode>,
);
