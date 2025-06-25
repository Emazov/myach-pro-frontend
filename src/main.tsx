import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// unregister service worker
if ('serviceWorker' in navigator) {
	navigator.serviceWorker
		.getRegistrations()
		.then((regs) => regs.forEach((reg) => reg.unregister()));
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</StrictMode>,
);
