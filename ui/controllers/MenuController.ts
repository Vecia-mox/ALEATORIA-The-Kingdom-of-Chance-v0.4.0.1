
import { SaveManager } from '../../engine/core/SaveManager';

export class MenuController {
    
    public static init(button: HTMLButtonElement, onClick: (isContinue: boolean) => void) {
        const hasSave = SaveManager.hasSave();

        if (hasSave) {
            button.innerText = "CONTINUE JOURNEY";
            button.style.backgroundColor = "#10b981"; // Emerald Green
            button.style.boxShadow = "0 0 20px rgba(16, 185, 129, 0.4)";
            
            // Optional: Show save timestamp tooltip
            const save = SaveManager.load();
            if (save) {
                button.title = `Last Saved: ${new Date(save.timestamp).toLocaleString()}`;
            }
        } else {
            button.innerText = "NEW SOUL";
            button.style.backgroundColor = "#fbbf24"; // Amber
        }

        button.onclick = () => {
            onClick(hasSave);
        };
    }
}
