
import { AudioManager } from '../../engine/audio/AudioManager';
import { CombatUI } from './CombatUI';
import { VirtualJoystick } from './VirtualJoystick';
import { InputManager } from '../../services/InputManager';

export class HUDController {
    private static hpFill: HTMLElement;
    private static xpFill: HTMLElement;
    private static levelDisplay: HTMLElement;
    private static bannerEl: HTMLElement;
    private static interactBtn: HTMLElement;
    private static fadeOverlay: HTMLElement;
    private static damageOverlay: HTMLElement;
    private static questDisplay: HTMLElement;
    private static interactCallback: (() => void) | null = null;
    
    // Cache for combat buttons to trigger animations
    private static combatButtons: Map<string, HTMLElement> = new Map();

    public static init() {
        this.injectStyles();
        this.createImmortalHUD();
        this.createBanner();
        this.createInteractButton();
        this.createActionButtonsContainer(); // For dynamic extra buttons if needed
        this.createFadeOverlay();
        this.createDamageOverlay();
        this.createQuestDisplay();

        VirtualJoystick.init();

        setTimeout(() => {
            // Bind inputs now that DOM is ready
            InputManager.setupUIListeners();
            // CombatUI.initializeButtons(); // Optional: Re-init visuals if needed
        }, 100);
    }

    private static injectStyles() {
        const css = `
            /* --- IMMORTAL HUD STYLES (Diablo-esque) --- */
            
            /* COMBAT ARC (Bottom Right) */
            #combat-arc {
                position: fixed; bottom: 20px; right: 20px;
                width: 250px; height: 250px;
                pointer-events: none; /* Touches pass through empty space */
                z-index: 1000;
            }

            /* GLOBAL BUTTON STYLES */
            .hud-btn {
                pointer-events: auto; position: absolute;
                border-radius: 50%; color: #ddd;
                display: flex; justify-content: center; align-items: center;
                flex-direction: column;
                
                /* Metallic Gradient */
                background: radial-gradient(circle, #2a2a2a, #000);
                border: 2px solid #b8860b; /* Dark Gold Base */
                box-shadow: 0 0 5px #000, inset 0 0 10px rgba(0,0,0,0.8);
                
                touch-action: manipulation;
                user-select: none;
                transition: transform 0.05s, border-color 0.2s, box-shadow 0.2s;
                font-family: 'Cinzel', serif; /* For Icons */
                text-shadow: none;
            }

            /* Active State */
            .hud-btn:active, .hud-btn.active-press { 
                transform: scale(0.95); 
                border-color: #fff;
                box-shadow: 0 0 15px #C0A060;
                filter: brightness(1.2);
            }

            /* Main Attack (The Anchor) */
            #btn-attack {
                width: 90px; height: 90px;
                bottom: 0; right: 0;
                font-size: 40px;
                background: radial-gradient(circle, #550000, #220000); /* Blood Red Tint */
                border: 3px solid #FFD700; /* Bright Gold */
            }

            /* Skill Buttons (The Satellites) */
            .orbit-btn {
                width: 60px; height: 60px;
                font-size: 24px;
            }
            
            /* Specific Glows */
            .pos-1 { bottom: 10px; right: 110px; border-color: #ffd700; } /* Skill 1 (Gold) */
            .pos-2 { bottom: 80px; right: 90px; border-color: #00bfff; }  /* Skill 2 (Blue) */
            .pos-3 { bottom: 110px; right: 10px; border-color: #ff4500; } /* Skill 3 (Orange) */

            /* Potion (Small & Panic-Accessible) */
            .tiny-btn {
                width: 45px; height: 45px;
                font-size: 20px;
                background: radial-gradient(circle, #3f0000, #1a0000);
                border: 1px solid #ef4444;
                bottom: 140px; right: 80px; /* High Diagonal */
            }
            
            /* --- UNIT FRAME (Top Left) --- */
            #unit-frame {
                position: fixed; top: 15px; left: 15px;
                display: flex; align-items: center;
                z-index: 1000; pointer-events: none;
            }
            .portrait-ring {
                width: 60px; height: 60px;
                background: #111; border: 3px solid #C0A060;
                border-radius: 50%;
                position: relative; z-index: 2;
                box-shadow: 0 0 15px black;
                display: flex; align-items: center; justify-content: center;
                font-size: 30px; color: #555;
            }
            .level-badge {
                position: absolute; bottom: -5px; right: -5px;
                background: #800; color: gold; font-weight: bold;
                width: 22px; height: 22px; text-align: center; font-size: 12px;
                border-radius: 50%; border: 1px solid white;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 2px 4px black;
            }
            .bars {
                margin-left: -15px; padding-left: 20px; /* Tuck behind portrait */
                width: 160px; background: rgba(0,0,0,0.7);
                border-radius: 0 10px 10px 0;
                padding-top: 6px; padding-bottom: 6px;
                border: 1px solid #444; border-left: none;
            }
            .bar-bg { width: 90%; height: 8px; background: #222; margin: 3px 0; border-radius: 2px; overflow: hidden; }
            .hp-fill { height: 100%; background: linear-gradient(90deg, #991b1b, #ef4444); width: 100%; transition: width 0.2s; }
            .xp-fill { height: 100%; background: #FFD700; width: 0%; transition: width 0.2s; box-shadow: 0 0 5px #FFD700; }

            /* --- UTILITY ROW (Top Right) --- */
            #utility-row {
                position: fixed; top: 20px; right: 20px;
                display: flex; gap: 10px; z-index: 1000;
            }
            .icon-btn {
                width: 40px; height: 40px;
                background: rgba(0,0,0,0.6); border: 1px solid #666;
                border-radius: 8px; color: #ccc;
                display: flex; align-items: center; justify-content: center;
                font-size: 20px; cursor: pointer; pointer-events: auto;
            }
            .icon-btn:active { background: #333; border-color: #fbbf24; }
        `;
        const style = document.createElement('style');
        style.innerHTML = css;
        document.head.appendChild(style);
    }

    private static createImmortalHUD() {
        const hud = document.createElement('div');
        hud.id = 'immortal-hud';
        hud.style.cssText = "position: absolute; inset: 0; pointer-events: none; z-index: 1000;";

        hud.innerHTML = `
            <!-- UNIT FRAME -->
            <div id="unit-frame">
                <div class="portrait-ring">
                    👤
                    <div id="hud-level" class="level-badge">1</div>
                </div>
                <div class="bars">
                    <div class="bar-bg"><div id="hp-bar-fill" class="hp-fill"></div></div>
                    <div class="bar-bg"><div id="xp-bar-fill" class="xp-fill"></div></div>
                </div>
            </div>

            <!-- UTILITY ROW -->
            <div id="utility-row">
                <div class="icon-btn" id="btn-bag">🎒</div>
                <div class="icon-btn" id="btn-settings">⚙️</div>
            </div>

            <!-- COMBAT ARC -->
            <div id="combat-arc">
                <!-- Main Attack -->
                <div id="btn-attack" class="hud-btn">
                    ⚔️
                </div>
                
                <!-- Skills -->
                <div id="btn-skill-1" class="hud-btn orbit-btn pos-1">
                    🌪️
                </div> 
                <div id="btn-skill-2" class="hud-btn orbit-btn pos-2">
                    💨
                </div> 
                <div id="btn-skill-3" class="hud-btn orbit-btn pos-3">
                    🔥
                </div> 
                
                <!-- Potion -->
                <div id="btn-potion" class="hud-btn tiny-btn">
                    🍷
                </div>
            </div>
        `;

        document.body.appendChild(hud);

        // Cache Elements for Updates
        this.hpFill = document.getElementById('hp-bar-fill')!;
        this.xpFill = document.getElementById('xp-bar-fill')!;
        this.levelDisplay = document.getElementById('hud-level')!;

        // Store Buttons for Input Animation reference
        ['btn-attack', 'btn-skill-1', 'btn-skill-2', 'btn-skill-3', 'btn-potion'].forEach(id => {
            const el = document.getElementById(id);
            if (el) this.combatButtons.set(id, el);
        });

        // Bind Utility Buttons
        document.getElementById('btn-bag')?.addEventListener('click', () => this.toggleInventory());
        document.getElementById('btn-settings')?.addEventListener('click', () => alert("Settings")); // Placeholder
    }
    
    private static createActionButtonsContainer() {
        // Just a dummy container if external systems expect to append dynamic buttons
        const container = document.createElement('div');
        container.id = 'action-buttons'; 
        container.style.display = 'none'; 
        document.body.appendChild(container);
    }

    private static createInteractButton() {
        const btn = document.createElement('div');
        btn.id = 'hud-interact';
        btn.style.cssText = `
            position: absolute; bottom: 200px; left: 50%;
            transform: translateX(-50%);
            background: #1e3a8a; border: 2px solid #60a5fa;
            color: white; padding: 10px 30px;
            font-family: 'Cinzel', serif; font-weight: bold; font-size: 18px;
            border-radius: 30px; cursor: pointer;
            z-index: 2000; box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
            display: none; pointer-events: auto;
            text-transform: uppercase; letter-spacing: 1px;
            animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;
        btn.onclick = () => {
            if (this.interactCallback) this.interactCallback();
        };
        document.body.appendChild(btn);
        this.interactBtn = btn;
    }

    public static toggleButtonPress(buttonId: string, isPressed: boolean) {
        const btn = this.combatButtons.get(buttonId);
        if (btn) {
            if (isPressed) btn.classList.add('active-press');
            else btn.classList.remove('active-press');
        }
    }

    // --- UPDATER METHODS ---

    public static updateHealth(current: number, max: number) {
        if (this.hpFill) {
            const pct = Math.max(0, Math.min(100, (current / max) * 100));
            this.hpFill.style.width = `${pct}%`;
        }
    }

    // Map legacy 'updateMana' to nothing or new resource if added later
    public static updateMana(current: number, max: number) {
        // Not used in this simplified layout, but kept for interface compatibility
    }

    public static updateXP(current: number, max: number) {
        if (this.xpFill) {
            const pct = Math.max(0, Math.min(100, (current / max) * 100));
            this.xpFill.style.width = `${pct}%`;
        }
    }

    public static updateLevel(level: number) {
        if (this.levelDisplay) {
            this.levelDisplay.innerText = level.toString();
        }
    }
    
    private static toggleInventory() {
        // Mock key press 'I' to open inventory via listener or logic
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' }));
    }

    // --- LEGACY COMPATIBILITY ---
    public static checkLowHealth(c: number, m: number) { this.updateHealth(c, m); }
    public static updateGold(g: number) { /* No gold display in simplified unit frame yet */ }
    
    public static createBanner() {
        this.bannerEl = document.createElement('div');
        this.bannerEl.style.cssText = `
            position: absolute; top: 25%; left: 50%; transform: translate(-50%, -50%) scale(0);
            font-family: 'Cinzel', serif; font-size: 42px; font-weight: 900;
            color: #fbbf24; text-shadow: 0 0 20px #b45309;
            z-index: 5000; pointer-events: none; opacity: 0;
            transition: all 0.5s; white-space: nowrap;
        `;
        document.body.appendChild(this.bannerEl);
    }
    
    public static showBanner(text: string, color: string = '#fbbf24') {
        if (!this.bannerEl) return;
        this.bannerEl.innerText = text;
        this.bannerEl.style.color = color;
        this.bannerEl.style.textShadow = `0 0 20px ${color}`;
        this.bannerEl.style.transform = 'translate(-50%, -50%) scale(1.2)';
        this.bannerEl.style.opacity = '1';
        setTimeout(() => {
            this.bannerEl.style.opacity = '0';
            this.bannerEl.style.transform = 'translate(-50%, -50%) scale(0)';
        }, 3000);
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

    private static createQuestDisplay() {
        this.questDisplay = document.createElement('div');
        this.questDisplay.id = 'hud-quest';
        this.questDisplay.style.cssText = `
            position: absolute; top: 100px; left: 20px;
            color: #fbbf24; font-family: 'Cinzel', serif; font-size: 14px;
            font-weight: bold; text-shadow: 0 2px 4px black;
            pointer-events: none; z-index: 900;
        `;
        document.body.appendChild(this.questDisplay);
    }

    public static updateQuest(text: string) {
        if (this.questDisplay) this.questDisplay.innerText = text;
    }

    public static updateFloor(f: number) {
        // Implement floor display update if needed
    }

    private static createDamageOverlay() {
        if(document.getElementById('damage-vignette')) return;
        const overlay = document.createElement('div');
        overlay.id = 'damage-vignette';
        document.body.appendChild(overlay);
    }
    
    public static flashDamage() {
        const el = document.getElementById('damage-vignette');
        if(el) {
            el.classList.add('damage-flash');
            setTimeout(() => el.classList.remove('damage-flash'), 200);
        }
    }

    private static createFadeOverlay() {
        if (document.getElementById('fade-overlay')) return;
        this.fadeOverlay = document.createElement('div');
        this.fadeOverlay.id = 'fade-overlay';
        this.fadeOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #000; z-index: 9999; pointer-events: none;
            opacity: 0; transition: opacity 1.0s ease-in-out;
        `;
        document.body.appendChild(this.fadeOverlay);
    }

    public static fadeScreen(fadeToBlack: boolean, onComplete?: () => void) {
        if (!this.fadeOverlay) this.createFadeOverlay();
        void this.fadeOverlay.offsetWidth;
        this.fadeOverlay.style.opacity = fadeToBlack ? '1' : '0';
        if (onComplete) {
            setTimeout(onComplete, 1000);
        }
    }
    
    public static addInventoryButton(cb:any) {} 
}
