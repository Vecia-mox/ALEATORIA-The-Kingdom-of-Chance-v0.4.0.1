
import { AudioManager } from '../../engine/audio/AudioManager';
import { CombatUI } from './CombatUI';
import { SkillWheel } from '../../engine/ui/SkillWheel';
import { VirtualJoystick } from './VirtualJoystick';

export class HUDController {
    private static goldEl: HTMLElement;
    private static interactBtn: HTMLElement;
    private static xpBarFill: HTMLElement;
    private static manaBarFill: HTMLElement; 
    private static levelDisplay: HTMLElement;
    private static floorDisplay: HTMLElement; 
    private static fadeOverlay: HTMLElement; 
    private static damageOverlay: HTMLElement;
    private static questDisplay: HTMLElement; 
    private static bannerEl: HTMLElement;
    private static interactCallback: (() => void) | null = null;
    
    private static systemTray: HTMLElement;
    private static skillWheel: SkillWheel | null = null;

    public static init() {
        // Create Skill Wheel (Controls)
        if (!this.skillWheel) {
            this.skillWheel = new SkillWheel(['1', '2', '3', '4']);
            const container = (this.skillWheel as any).container;
            if (container) container.classList.add('skill-wheel-container');
        }

        VirtualJoystick.init();

        setTimeout(() => {
            this.createSystemTray();
            this.createGoldDisplay();
            this.createQuestDisplay(); 
            this.createInteractButton();
            this.createBars(); 
            this.createFadeOverlay(); 
            this.createDamageOverlay();
            this.createBanner();
            
            CombatUI.initializeButtons();
        }, 500);
    }

    private static createBars() {
        // Container for bottom bars
        const container = document.createElement('div');
        container.id = 'bars-container';
        container.style.cssText = `
            position: absolute; bottom: 0; left: 0; width: 100%;
            display: flex; flex-direction: column;
            z-index: 1000; pointer-events: none;
        `;

        // 1. MANA BAR (Blue)
        const manaContainer = document.createElement('div');
        manaContainer.style.cssText = `
            width: 100%; height: 6px; background: #111;
            border-top: 1px solid #333; position: relative;
        `;
        this.manaBarFill = document.createElement('div');
        this.manaBarFill.id = 'mana-fill';
        this.manaBarFill.style.cssText = `
            width: 100%; height: 100%; background: #3b82f6;
            box-shadow: 0 0 10px #3b82f6; transition: width 0.1s linear;
        `;
        manaContainer.appendChild(this.manaBarFill);

        // 2. XP BAR (Gold)
        // Spec: width 100%, height 6px, bottom 0
        const xpContainer = document.createElement('div');
        xpContainer.style.cssText = `
            width: 100%; height: 6px; background: #222;
            border-top: 1px solid #333; position: relative; overflow: hidden;
        `;
        this.xpBarFill = document.createElement('div');
        this.xpBarFill.id = 'xp-fill';
        this.xpBarFill.style.cssText = `
            width: 0%; height: 100%; 
            background: #FFD700;
            box-shadow: 0 0 10px #FFD700; 
            transition: width 0.2s ease-out;
        `;
        
        xpContainer.appendChild(this.xpBarFill);

        container.appendChild(manaContainer);
        container.appendChild(xpContainer);
        document.body.appendChild(container);
    }

    private static createBanner() {
        this.bannerEl = document.createElement('div');
        this.bannerEl.style.cssText = `
            position: absolute; top: 30%; left: 50%; transform: translate(-50%, -50%) scale(0);
            font-family: 'Cinzel', serif; font-size: 48px; font-weight: 900;
            color: #fbbf24; text-shadow: 0 0 20px #b45309;
            z-index: 5000; pointer-events: none; opacity: 0;
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            white-space: nowrap;
        `;
        document.body.appendChild(this.bannerEl);
    }

    public static showBanner(text: string, color: string = '#fbbf24') {
        if (!this.bannerEl) return;
        this.bannerEl.innerText = text;
        this.bannerEl.style.color = color;
        this.bannerEl.style.textShadow = `0 0 20px ${color}`;
        
        // Pop In
        this.bannerEl.style.transform = 'translate(-50%, -50%) scale(1.2)';
        this.bannerEl.style.opacity = '1';

        // Fade Out
        setTimeout(() => {
            this.bannerEl.style.transform = 'translate(-50%, -50%) scale(1.5)';
            this.bannerEl.style.opacity = '0';
            setTimeout(() => {
                this.bannerEl.style.transform = 'translate(-50%, -50%) scale(0)';
            }, 500);
        }, 2000);
    }

    private static createQuestDisplay() {
        this.questDisplay = document.createElement('div');
        this.questDisplay.id = 'hud-quest';
        this.questDisplay.style.cssText = `
            position: absolute; top: 160px; left: 20px;
            width: 300px;
            color: #fbbf24; font-family: 'Cinzel', serif; font-size: 14px;
            font-weight: bold; text-shadow: 0 2px 4px black;
            background: linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0));
            padding: 10px; border-left: 3px solid #b45309;
            pointer-events: none; z-index: 900;
            display: flex; flex-direction: column; align-items: flex-start;
            backdrop-filter: blur(2px);
        `;
        
        const label = document.createElement('span');
        label.innerText = "CURRENT OBJECTIVE";
        label.style.cssText = "font-size: 9px; color: #aaa; margin-bottom: 4px; letter-spacing: 2px;";
        
        const text = document.createElement('span');
        text.id = 'quest-text';
        text.innerText = "Explore the Dungeon";

        this.floorDisplay = document.createElement('div');
        this.floorDisplay.id = 'floor-indicator';
        this.floorDisplay.innerText = "FLOOR 1";
        this.floorDisplay.style.cssText = "font-size: 9px; color: #9ca3af; margin-top: 4px; border-top: 1px solid #444; width: 100%; padding-top: 4px;";

        this.questDisplay.appendChild(label);
        this.questDisplay.appendChild(text);
        this.questDisplay.appendChild(this.floorDisplay);
        
        document.body.appendChild(this.questDisplay);
    }

    public static updateQuest(text: string) {
        if (!this.questDisplay) return;
        const el = this.questDisplay.querySelector('#quest-text') as HTMLElement;
        if (el) el.innerText = text;
        
        this.questDisplay.style.transform = 'scale(1.05)';
        this.questDisplay.style.borderLeftColor = '#fbbf24';
        setTimeout(() => {
            this.questDisplay.style.transform = 'scale(1.0)';
            this.questDisplay.style.borderLeftColor = '#b45309';
        }, 200);
    }

    private static createSystemTray() {
        if (this.systemTray) return;

        this.systemTray = document.createElement('div');
        this.systemTray.id = 'system-tray';
        this.systemTray.style.cssText = `
            position: absolute; top: 20px; right: 150px;
            display: flex; gap: 15px;
            z-index: 1100; pointer-events: auto;
        `;
        document.body.appendChild(this.systemTray);

        const muteBtn = this.createTrayButton("🔊", () => {
            const isMuted = AudioManager.getInstance().toggleMute();
            muteBtn.innerText = isMuted ? "🔇" : "🔊";
            muteBtn.style.borderColor = isMuted ? "#ef4444" : "#C8AA6E";
            muteBtn.style.color = isMuted ? "#ef4444" : "#fff";
        });
    }

    private static createTrayButton(icon: string, onClick: () => void): HTMLElement {
        const btn = document.createElement('div');
        btn.className = 'tray-icon';
        btn.innerText = icon;
        btn.style.cssText = `
            width: 40px; height: 40px; 
            background: rgba(0,0,0,0.7);
            border: 2px solid #C8AA6E;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 20px; cursor: pointer;
            color: #fff;
            transition: transform 0.1s;
            user-select: none;
        `;
        btn.onmousedown = () => btn.style.transform = "scale(0.9)";
        btn.onmouseup = () => btn.style.transform = "scale(1.0)";
        btn.onclick = () => {
            AudioManager.getInstance().play('ui_click');
            onClick();
        };
        this.systemTray.appendChild(btn);
        return btn;
    }

    private static createDamageOverlay() {
        this.damageOverlay = document.createElement('div');
        this.damageOverlay.id = 'damage-vignette'; // Correct ID for CSS
        document.body.appendChild(this.damageOverlay);
    }

    public static flashDamage() {
        if (!this.damageOverlay) return;
        this.damageOverlay.classList.add('damage-flash');
        setTimeout(() => {
            this.damageOverlay.classList.remove('damage-flash');
        }, 200); // Quick flash
    }

    public static checkLowHealth(current: number, max: number) {
        if (!this.damageOverlay) return;
        
        const ratio = current / max;
        if (ratio < 0.3) {
            this.damageOverlay.classList.add('low-health-pulse');
        } else {
            this.damageOverlay.classList.remove('low-health-pulse');
        }
    }

    private static createGoldDisplay() {
        const div = document.createElement('div');
        div.id = 'hud-gold';
        div.style.cssText = `
            position: absolute; top: 20px; left: 20px;
            background: rgba(0,0,0,0.6);
            border: 1px solid #fbbf24;
            color: #fbbf24;
            padding: 8px 15px;
            font-family: 'Cinzel', serif;
            font-weight: bold;
            font-size: 16px;
            border-radius: 4px;
            display: flex; align-items: center; gap: 8px;
            z-index: 1000;
            pointer-events: none;
        `;
        
        div.innerHTML = `
            <div id="hud-level" style="
                width: 24px; height: 24px; background: #fbbf24; color: black;
                display: flex; align-items: center; justify-content: center;
                transform: rotate(45deg); border: 2px solid #fff; margin-right: 10px;
            ">
                <span style="transform: rotate(-45deg); font-size: 12px; font-weight: 900;">1</span>
            </div>
            <span>🟡</span> <span id="gold-val">0</span>
        `;
        document.body.appendChild(div);
        this.goldEl = div.querySelector('#gold-val') as HTMLElement;
        this.levelDisplay = div.querySelector('#hud-level span') as HTMLElement;
    }

    private static createFadeOverlay() {
        this.fadeOverlay = document.createElement('div');
        this.fadeOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #000; z-index: 9999; pointer-events: none;
            opacity: 0; transition: opacity 1.0s ease-in-out;
        `;
        document.body.appendChild(this.fadeOverlay);
    }

    private static createInteractButton() {
        const btn = document.createElement('div');
        btn.id = 'hud-interact';
        btn.style.cssText = `
            position: absolute; bottom: 150px; left: 50%;
            transform: translateX(-50%);
            background: #1e3a8a;
            border: 2px solid #60a5fa;
            color: white;
            padding: 10px 25px;
            font-family: 'Cinzel', serif;
            font-weight: bold;
            font-size: 18px;
            border-radius: 30px;
            cursor: pointer;
            z-index: 2000;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
            display: none;
            pointer-events: auto;
            text-transform: uppercase;
            letter-spacing: 1px;
        `;
        btn.onclick = () => {
            if (this.interactCallback) this.interactCallback();
        };
        document.body.appendChild(btn);
        this.interactBtn = btn;
    }

    public static updateGold(amount: number) {
        if (this.goldEl) {
            this.goldEl.innerText = amount.toLocaleString();
            this.goldEl.style.transform = 'scale(1.2)';
            setTimeout(() => this.goldEl.style.transform = 'scale(1)', 100);
        }
    }

    public static updateXP(current: number, max: number) {
        if (this.xpBarFill) {
            const pct = Math.min(100, Math.max(0, (current / max) * 100));
            this.xpBarFill.style.width = `${pct}%`;
        }
    }

    public static updateMana(current: number, max: number) {
        if (this.manaBarFill) {
            const pct = Math.min(100, Math.max(0, (current / max) * 100));
            this.manaBarFill.style.width = `${pct}%`;
        }
    }

    public static updateLevel(level: number) {
        if (this.levelDisplay) {
            this.levelDisplay.innerText = level.toString();
            const parent = this.levelDisplay.parentElement;
            if (parent) {
                parent.style.transform = 'rotate(45deg) scale(1.5)';
                parent.style.background = '#fff';
                setTimeout(() => {
                    parent.style.transform = 'rotate(45deg) scale(1.0)';
                    parent.style.background = '#fbbf24';
                }, 300);
            }
        }
    }

    public static updateFloor(floor: number) {
        if (this.floorDisplay) {
            this.floorDisplay.innerText = `FLOOR ${floor}`;
            this.floorDisplay.style.color = '#fff';
            setTimeout(() => {
                this.floorDisplay.style.color = '#9ca3af';
            }, 500);
        }
    }

    public static fadeScreen(fadeToBlack: boolean, onComplete?: () => void) {
        if (this.fadeOverlay) {
            this.fadeOverlay.style.opacity = fadeToBlack ? '1' : '0';
            if (onComplete) {
                setTimeout(onComplete, 1000); 
            }
        }
    }

    public static toggleCombatControls(show: boolean) {
        if (show) {
            document.body.classList.remove('hide-combat-controls');
        } else {
            document.body.classList.add('hide-combat-controls');
        }
    }

    public static showInteractButton(text: string, onClick: () => void) {
        if (this.interactBtn) {
            this.interactBtn.innerText = text;
            this.interactBtn.style.display = 'block';
            this.interactCallback = onClick;
            AudioManager.getInstance().play('ui_open');
        }
    }

    public static hideInteractButton() {
        if (this.interactBtn) {
            this.interactBtn.style.display = 'none';
            this.interactCallback = null;
        }
    }

    public static updateLabels() {
        CombatUI.initializeButtons();
    }

    public static addInventoryButton(onClick: () => void) {
        if (!this.systemTray) this.createSystemTray();
        this.createTrayButton("🎒", onClick);
    }
}
