
export class BossHUD {
    private static container: HTMLElement;
    private static fill: HTMLElement;
    private static label: HTMLElement;
    private static isVisible: boolean = false;

    public static init() {
        this.container = document.createElement('div');
        this.container.id = 'boss-hud';
        // Moved top from 60px to 100px to clear the top-left/right HUD elements
        this.container.style.cssText = `
            position: absolute; top: 100px; left: 50%; transform: translateX(-50%);
            width: 60%; height: 24px;
            background: #111; border: 2px solid #550000;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.3);
            display: none; z-index: 800;
        `;

        this.fill = document.createElement('div');
        this.fill.style.cssText = `
            width: 100%; height: 100%;
            background: linear-gradient(90deg, #7f1d1d, #ef4444);
            transition: width 0.2s;
        `;

        this.label = document.createElement('div');
        this.label.innerText = "THE WARDEN - LEVEL 5";
        this.label.style.cssText = `
            position: absolute; top: -30px; left: 0; width: 100%;
            text-align: center; color: #ef4444; font-family: 'Cinzel', serif;
            font-weight: 900; letter-spacing: 3px; text-shadow: 0 0 10px black;
            font-size: 18px;
        `;

        const skull = document.createElement('div');
        skull.innerText = "💀";
        skull.style.cssText = `
            position: absolute; left: -50px; top: -15px; font-size: 42px;
            filter: drop-shadow(0 0 5px red);
        `;

        this.container.appendChild(this.fill);
        this.container.appendChild(this.label);
        this.container.appendChild(skull);
        document.body.appendChild(this.container);
    }

    public static show() {
        if (this.isVisible) return;
        this.isVisible = true;
        this.container.style.display = 'block';
        this.container.style.animation = 'fadeIn 1s ease-in';
    }

    public static hide() {
        this.isVisible = false;
        this.container.style.display = 'none';
    }

    public static update(current: number, max: number) {
        if (!this.isVisible) return;
        const pct = Math.max(0, (current / max) * 100);
        this.fill.style.width = `${pct}%`;
    }
}
