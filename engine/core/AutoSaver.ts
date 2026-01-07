
import * as THREE from 'three';
import { SaveManager } from './SaveManager';
import { InventoryManager } from '../items/InventoryManager';
import { EconomyManager } from '../economy/EconomyManager';
import { DifficultyManager } from './DifficultyManager';

export class AutoSaver {
    private player: THREE.Object3D;
    private inventory: InventoryManager;
    private economy: EconomyManager;
    private intervalId: number;
    private icon: HTMLElement;

    constructor(player: THREE.Object3D, inventory: InventoryManager, economy: EconomyManager) {
        this.player = player;
        this.inventory = inventory;
        this.economy = economy;
        this.createIcon();
    }

    private createIcon() {
        this.icon = document.createElement('div');
        this.icon.innerText = "💾";
        this.icon.style.cssText = `
            position: absolute; bottom: 20px; left: 20px;
            font-size: 24px; opacity: 0; transition: opacity 0.5s;
            z-index: 2000; pointer-events: none;
            filter: drop-shadow(0 0 5px #fbbf24);
        `;
        document.body.appendChild(this.icon);
    }

    public start() {
        // Save every 30 seconds
        this.intervalId = window.setInterval(() => {
            this.triggerSave();
        }, 30000);
    }

    public stop() {
        clearInterval(this.intervalId);
        if (this.icon.parentNode) this.icon.parentNode.removeChild(this.icon);
    }

    public triggerSave() {
        // Cast player to any to satisfy PlayerEntity requirement of SaveManager (compatible via duck typing/userData)
        SaveManager.save(this.player as any, this.inventory, this.economy, DifficultyManager.getInstance());
        this.showFeedback();
    }

    private showFeedback() {
        this.icon.style.opacity = "1";
        setTimeout(() => {
            this.icon.style.opacity = "0";
        }, 1000);
    }
}
