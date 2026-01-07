
import { GameDirector } from '../../engine/core/GameDirector';

export class DeathScreen {
    private static container: HTMLElement;

    public static init() {
        this.container = document.createElement('div');
        this.container.id = 'death-screen';
        this.container.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(circle, rgba(50,0,0,0.8) 0%, #000000 100%);
            display: none; flex-direction: column; align-items: center; justify-content: center;
            z-index: 9000; color: #ef4444; font-family: 'Cinzel', serif;
            opacity: 0; transition: opacity 1s ease-in;
        `;

        const title = document.createElement('h1');
        title.innerText = "YOU HAVE DIED";
        title.style.fontSize = "48px";
        title.style.textShadow = "0 0 20px black";
        title.style.letterSpacing = "5px";

        const sub = document.createElement('p');
        sub.innerText = "The void claims another soul...";
        sub.style.color = "#999";
        sub.style.fontSize = "16px";

        const btn = document.createElement('button');
        btn.innerText = "RESURRECT";
        btn.style.cssText = `
            margin-top: 40px; padding: 15px 40px;
            background: transparent; border: 2px solid #ef4444; color: #ef4444;
            font-size: 18px; font-weight: bold; cursor: pointer;
            transition: all 0.2s;
        `;
        btn.onmouseover = () => { btn.style.background = "#ef4444"; btn.style.color = "black"; };
        btn.onmouseout = () => { btn.style.background = "transparent"; btn.style.color = "#ef4444"; };
        
        btn.onclick = () => {
            GameDirector.resurrect();
            this.hide();
        };

        this.container.appendChild(title);
        this.container.appendChild(sub);
        this.container.appendChild(btn);
        document.body.appendChild(this.container);
    }

    public static show() {
        if (!this.container) this.init();
        this.container.style.display = 'flex';
        // Trigger reflow
        void this.container.offsetWidth;
        this.container.style.opacity = '1';
    }

    public static hide() {
        if (this.container) {
            this.container.style.opacity = '0';
            setTimeout(() => {
                this.container.style.display = 'none';
            }, 1000);
        }
    }
}
