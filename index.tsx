
import { App } from './engine/core/App';
import './styles/game.css';

console.log("🚀 PHASE 45: STATE MANAGEMENT UPGRADE");

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root') || document.body;
    
    if (root) {
        root.innerHTML = '';
        root.style.display = 'block';
    }

    const appContainer = document.createElement('div');
    appContainer.id = 'app-container';
    root.appendChild(appContainer);

    App.init(appContainer);
});
