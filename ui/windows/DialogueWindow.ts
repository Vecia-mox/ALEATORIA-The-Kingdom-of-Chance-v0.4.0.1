
export class DialogueWindow {
    private static container: HTMLElement;
    private static textEl: HTMLElement;
    private static titleEl: HTMLElement;
    
    public static init() {
        this.container = document.createElement('div');
        this.container.id = 'dialogue-window';
        // Moved bottom to 250px to clear controls
        this.container.style.cssText = `
            position: absolute; bottom: 250px; left: 50%; transform: translateX(-50%);
            width: 600px; max-width: 90%;
            background: rgba(10, 5, 20, 0.95);
            border: 2px solid #b45309;
            box-shadow: 0 0 30px rgba(0,0,0,0.8);
            padding: 20px;
            display: none;
            flex-direction: column;
            gap: 10px;
            z-index: 3000;
            cursor: pointer;
            border-radius: 8px;
        `;

        this.titleEl = document.createElement('div');
        this.titleEl.style.cssText = "color: #fbbf24; font-family: 'Cinzel', serif; font-size: 18px; font-weight: bold;";
        
        this.textEl = document.createElement('div');
        this.textEl.style.cssText = "color: #e5e5e5; font-family: sans-serif; font-size: 16px; line-height: 1.5;";

        const hint = document.createElement('div');
        hint.innerText = "(Click to continue)";
        hint.style.cssText = "color: #666; font-size: 12px; text-align: right; margin-top: 5px;";

        this.container.appendChild(this.titleEl);
        this.container.appendChild(this.textEl);
        this.container.appendChild(hint);
        
        this.container.onclick = () => this.hide();

        document.body.appendChild(this.container);
    }

    public static show(title: string, text: string) {
        if (!this.container) this.init();
        this.titleEl.innerText = title;
        this.textEl.innerText = text;
        this.container.style.display = 'flex';
        this.container.style.animation = 'fadeIn 0.3s ease-out';
    }

    public static hide() {
        if (this.container) this.container.style.display = 'none';
    }
}
