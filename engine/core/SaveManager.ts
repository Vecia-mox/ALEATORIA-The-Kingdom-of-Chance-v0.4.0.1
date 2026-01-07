
import { InventoryManager } from '../items/InventoryManager';
import { EconomyManager } from '../economy/EconomyManager';
import { DifficultyManager } from './DifficultyManager';
import { PlayerEntity } from '../entities/PlayerEntity';
import { Item } from '../items/ItemFactory';

export interface SaveData {
    level: number;
    gold: number;
    maxHP: number;
    inventory: Item[]; // Saving full items to preserve rarity/stats
    floor: number;
    xp: number;
    timestamp: number;
    equippedWeapon: Item | null;
    equippedArmor: Item | null;
    position?: { x: number, y: number, z: number };
}

export class SaveManager {
    private static readonly KEY = 'diablo_save';

    public static save(
        player: PlayerEntity, 
        inventoryMgr: InventoryManager, 
        economyMgr: EconomyManager,
        difficultyMgr: DifficultyManager
    ) {
        const data: SaveData = {
            level: player.userData.level || 1,
            gold: economyMgr.gold,
            maxHP: player.userData.maxHp || 100,
            inventory: inventoryMgr.items.filter(i => i !== null) as Item[],
            floor: difficultyMgr.currentFloor,
            xp: player.userData.xp || 0,
            timestamp: Date.now(),
            equippedWeapon: inventoryMgr.equippedWeapon,
            equippedArmor: inventoryMgr.equippedArmor,
            position: { x: player.position.x, y: player.position.y, z: player.position.z }
        };

        try {
            const json = JSON.stringify(data);
            localStorage.setItem(this.KEY, json);
            console.log(`[SaveManager] Game Saved. Floor: ${data.floor}, Gold: ${data.gold}`);
        } catch (e) {
            console.error("[SaveManager] Failed to save:", e);
        }
    }

    public static load(): SaveData | null {
        const json = localStorage.getItem(this.KEY);
        if (!json) return null;

        try {
            return JSON.parse(json) as SaveData;
        } catch (e) {
            console.error("[SaveManager] Corrupt save file:", e);
            return null;
        }
    }

    public static hasSave(): boolean {
        return !!localStorage.getItem(this.KEY);
    }

    public static wipe() {
        localStorage.removeItem(this.KEY);
        console.log("[SaveManager] Save wiped.");
    }

    // Call this when entering a portal
    public static autoSave(
        player: PlayerEntity, 
        inventoryMgr: InventoryManager, 
        economyMgr: EconomyManager,
        difficultyMgr: DifficultyManager
    ) {
        this.save(player, inventoryMgr, economyMgr, difficultyMgr);
        
        // Visual Feedback (Toast)
        const toast = document.createElement('div');
        toast.innerText = "Saving...";
        toast.style.cssText = `
            position: absolute; bottom: 20px; right: 20px;
            color: #fbbf24; font-family: 'Cinzel', serif; font-size: 14px;
            text-shadow: 0 0 5px black; z-index: 9999;
            opacity: 1; transition: opacity 1s;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 1000);
        }, 1000);
    }
}
