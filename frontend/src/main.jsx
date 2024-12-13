import { createRoot } from 'react-dom/client';
import GunlukToplanti from './GunlukToplanti';

const globalStyles = `body, html { margin: 0; padding: 0; }`;

const styleSheet = document.createElement('style');
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);

const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(
        <GunlukToplanti />
    );
}
