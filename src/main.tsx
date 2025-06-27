import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Регистрируем Service Worker для кэширования
if ('serviceWorker' in navigator && import.meta.env.PROD) {
	window.addEventListener('load', async () => {
		try {
			// Создаем простой Service Worker для кэширования
			const swCode = `
				const CACHE_NAME = 'myach-pro-v1';
				const urlsToCache = [
					'/',
					'/static/js/',
					'/static/css/',
					'/assets/'
				];

				self.addEventListener('install', (event) => {
					event.waitUntil(
						caches.open(CACHE_NAME)
							.then((cache) => cache.addAll(urlsToCache))
					);
				});

				self.addEventListener('fetch', (event) => {
					event.respondWith(
						caches.match(event.request)
							.then((response) => {
								if (response) {
									return response;
								}
								return fetch(event.request);
							}
						)
					);
				});
			`;

			const blob = new Blob([swCode], { type: 'application/javascript' });
			const swUrl = URL.createObjectURL(blob);

			const registration = await navigator.serviceWorker.register(swUrl);
			console.log('SW registered:', registration);
		} catch (error) {
			console.log('SW registration failed:', error);
		}
	});
} else {
	// unregister service worker for development
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker
			.getRegistrations()
			.then((regs) => regs.forEach((reg) => reg.unregister()));
	}
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</StrictMode>,
);
