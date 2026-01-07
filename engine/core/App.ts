
import { MainMenu } from '../../ui/screens/MainMenu';
import { GameLoop } from './GameLoop';
import { SaveManager } from './SaveManager';

export class App {
    private static container: HTMLElement;
    private static gameLoop: GameLoop | null = null;

    public static init(root: HTMLElement) {
        this.container = root;
        this.showMenu();
    }

    public static showMenu() {
        this.container.innerHTML = '';
        new MainMenu(this.container);
    }

    public static startGame(load: boolean) {
        this.container.innerHTML = '';
        
        // Determine Save Data
        let saveData = null;
        if (load) {
            saveData = SaveManager.load();
        }

        // Initialize Game Loop
        this.gameLoop = new GameLoop(this.container);
        
        // Inject Save Data
        (this.gameLoop as any).initialSaveData = saveData;
        
        this.gameLoop.start();

        // --- CRITICAL UI FIX ---
        // Ensure the Combat Controls layer is visible
        setTimeout(() => {
            const combatUI = document.querySelector('.skill-wheel-container') as HTMLElement;
            if (combatUI) {
                combatUI.style.display = 'block';
                combatUI.style.zIndex = '999';
            }
            
            const hud = document.getElementById('hud-layer'); // General HUD container if exists
            if (hud) hud.style.display = 'block';
        }, 100);
    }
}
