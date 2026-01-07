
import * as THREE from 'three';
import { BossHUD } from '../../ui/controllers/BossHUD';
import { HUDController } from '../../ui/controllers/HUDController';
import { LootSystem } from '../items/LootSystem';
import { Portal } from '../entities/Portal';
import { DifficultyManager } from './DifficultyManager';
import { DeathScreen } from '../../ui/windows/DeathScreen';
import { PlayerStats } from './PlayerStats';
import { TimeManager } from './TimeManager';
import { QuestManager } from '../systems/QuestManager';
import { SaveManager } from './SaveManager';
import { InventoryManager } from '../items/InventoryManager';
import { EconomyManager } from '../economy/EconomyManager';

export class GameDirector {
    private static lootSystem: LootSystem;
    private static onResetLevel: () => void;
    
    // Dependencies needed for AutoSave
    private static player: any;
    private static inventory: InventoryManager;
    private static economy: EconomyManager;

    public static portal: Portal | null = null;

    public static init(lootSystem: LootSystem, player: any, inv: InventoryManager, eco: EconomyManager) {
        this.lootSystem = lootSystem;
        this.player = player;
        this.inventory = inv;
        this.economy = eco;
        
        // Reset state
        this.portal = null;
    }

    public static setResetCallback(cb: () => void) {
        this.onResetLevel = cb;
    }

    // Called by DungeonDirector when level is ready
    public static onLevelStart(portalPos: THREE.Vector3, scene: THREE.Scene) {
        // Create Portal (Inactive)
        this.portal = new Portal(scene, portalPos.x, portalPos.z);
        
        // Set Quest
        const floor = DifficultyManager.getInstance().currentFloor;
        const killReq = Math.min(10, 3 + floor); // Scale quest difficulty
        QuestManager.startKillQuest(`Defeat ${killReq} Enemies`, killReq);
        
        HUDController.updateFloor(floor);
    }

    public static onQuestComplete() {
        if (this.portal) {
            this.portal.activate();
            // Point Quest Arrow to Portal
            QuestManager.setObjective("Enter the Portal", this.portal.mesh.position);
        }
    }

    public static update(dt: number, playerPos: THREE.Vector3) {
        if (this.portal) {
            this.portal.update(dt, playerPos);
        }
    }

    public static triggerNextLevel() {
        if (!this.portal) return;
        
        // Auto Save
        SaveManager.autoSave(this.player, this.inventory, this.economy, DifficultyManager.getInstance());

        // Effect
        TimeManager.slowMo(1000, 0.5);
        HUDController.fadeScreen(true, () => {
            // Logic
            DifficultyManager.getInstance().nextFloor();
            
            // Re-generate
            if (this.onResetLevel) this.onResetLevel();
            
            // Reset
            TimeManager.resume();
            setTimeout(() => HUDController.fadeScreen(false), 500);
        });
    }

    public static triggerDefeat() {
        TimeManager.slowMo(3000, 0.1);
        DeathScreen.show();
    }

    public static resurrect() {
        TimeManager.resume();
        PlayerStats.heal(9999);
        // Penalty?
        // Reset current level
        if (this.onResetLevel) this.onResetLevel();
    }
}
