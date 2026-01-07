
import * as THREE from 'three';
import { HUDController } from '../../ui/controllers/HUDController';
import { GameDirector } from './GameDirector';
import { DamageNumbers } from '../ui/DamageNumbers';
import { CameraShaker } from '../vfx/CameraShaker';
import { InputManager } from '../../services/InputManager'; // Use new InputManager
import { AudioManager } from '../audio/AudioManager';
import { FloatingText } from '../../ui/vfx/FloatingText';
import { VFXFactory } from '../vfx/VFXFactory';

export class PlayerStats {
    private static player: THREE.Object3D;
    private static camera: THREE.Camera;
    
    // Config
    private static readonly MANA_REGEN = 10; // MP per second

    public static init(player: THREE.Object3D, camera: THREE.Camera) {
        this.player = player;
        this.camera = camera;

        // Initialize Defaults if missing
        if (typeof this.player.userData.mp === 'undefined') this.player.userData.mp = 100;
        if (typeof this.player.userData.maxMp === 'undefined') this.player.userData.maxMp = 100;
        if (typeof this.player.userData.xp === 'undefined') this.player.userData.xp = 0;
        if (typeof this.player.userData.level === 'undefined') this.player.userData.level = 1;
        if (typeof this.player.userData.maxXp === 'undefined') this.player.userData.maxXp = 100;
        
        // Initial HUD Sync
        HUDController.updateLevel(this.player.userData.level);
        HUDController.updateXP(this.player.userData.xp, this.player.userData.maxXp);
    }

    public static regenerate(dt: number) {
        if (!this.player || this.player.userData.hp <= 0) return;
        
        const max = this.player.userData.maxMp;
        if (this.player.userData.mp < max) {
            this.player.userData.mp = Math.min(max, this.player.userData.mp + (this.MANA_REGEN * dt));
        }
    }

    public static consumeMana(amount: number): boolean {
        if (!this.player) return false;
        
        if (this.player.userData.mp >= amount) {
            this.player.userData.mp -= amount;
            return true;
        }
        
        // Feedback for OOM
        FloatingText.spawn(this.player.position, "Not Enough Mana!", '#3b82f6', 0.8);
        AudioManager.getInstance().play('ui_click'); // Error sound
        return false;
    }

    public static gainXP(amount: number) {
        if (!this.player) return;

        this.player.userData.xp += amount;
        
        // Check Level Up
        if (this.player.userData.xp >= this.player.userData.maxXp) {
            this.levelUp();
        } else {
            HUDController.updateXP(this.player.userData.xp, this.player.userData.maxXp);
        }
    }

    private static levelUp() {
        // 1. Math
        this.player.userData.level++;
        this.player.userData.xp = 0;
        this.player.userData.maxXp = Math.floor(this.player.userData.maxXp * 1.5);
        
        // Stat Boosts
        this.player.userData.maxHp += 20;
        this.player.userData.hp = this.player.userData.maxHp; // Full Heal
        this.player.userData.maxMp += 10;
        this.player.userData.mp = this.player.userData.maxMp;

        // 2. Visuals & Audio
        HUDController.updateLevel(this.player.userData.level);
        HUDController.updateXP(0, this.player.userData.maxXp);
        HUDController.showBanner("LEVEL UP!", "#fbbf24");
        
        AudioManager.getInstance().play('ding');
        VFXFactory.spawnSpin(this.player.position); // Reusing spin as "burst"
        FloatingText.spawn(this.player.position, "LEVEL UP!", "#fbbf24", 2.0);
        
        InputManager.vibrate([20, 50, 20]); // Success pattern
    }

    public static takeDamage(amount: number) {
        if (!this.player || this.player.userData.hp <= 0) return;

        this.player.userData.hp = Math.max(0, this.player.userData.hp - amount);
        
        // Feedback
        HUDController.checkLowHealth(this.player.userData.hp, this.player.userData.maxHp);
        HUDController.flashDamage(); // Trigger red screen flash
        DamageNumbers.spawn(this.player.position, amount, this.camera, false); 
        CameraShaker.addShake(amount * 0.02);
        
        InputManager.vibrate(200); // Heavy Rumble for damage
        AudioManager.getInstance().play('hit');

        if (this.player.userData.hp <= 0) {
            this.die();
        }
    }

    public static heal(amount: number) {
        if (!this.player) return;
        this.player.userData.hp = Math.min(this.player.userData.maxHp, this.player.userData.hp + amount);
        HUDController.checkLowHealth(this.player.userData.hp, this.player.userData.maxHp);
    }

    private static die() {
        console.log("💀 PLAYER DIED");
        GameDirector.triggerDefeat();
    }
}
