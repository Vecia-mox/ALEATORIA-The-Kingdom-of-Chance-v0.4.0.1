
import * as THREE from 'three';
import { HUDController } from '../../ui/controllers/HUDController';
import { VFXFactory } from '../vfx/VFXFactory';
import { SoundKey } from '../audio/SoundKey';
import { DamageNumbers } from '../ui/DamageNumbers';

export class LevelingManager {
    
    public static gainXP(player: THREE.Mesh, amount: number, camera: THREE.Camera) {
        // Init stats if missing
        if (typeof player.userData.xp === 'undefined') player.userData.xp = 0;
        if (typeof player.userData.level === 'undefined') player.userData.level = 1;
        if (typeof player.userData.maxXp === 'undefined') player.userData.maxXp = 100; // Base requirement

        // Add XP
        player.userData.xp += amount;
        SoundKey.play('XP_GAIN');
        
        // Check for Level Up (Loop for multiple levels at once)
        while (player.userData.xp >= player.userData.maxXp) {
            player.userData.xp -= player.userData.maxXp; // Overflow logic
            this.levelUp(player, camera);
        }

        // Update HUD
        HUDController.updateXP(player.userData.xp, player.userData.maxXp);
    }

    private static levelUp(player: THREE.Mesh, camera: THREE.Camera) {
        player.userData.level++;
        
        // 1. Exponential Curve: maxXP = Level * 100 * 1.5
        player.userData.maxXp = Math.floor(player.userData.level * 100 * 1.5);
        
        // 2. Stat Scaling
        // +20 HP, Full Heal
        player.userData.maxHp = (player.userData.maxHp || 100) + 20;
        player.userData.hp = player.userData.maxHp; 
        
        // +Damage (handled in damage calc via level, but we can store base stat too)
        // player.userData.baseDamage = (player.userData.baseDamage || 5) + 2;

        // 3. Visuals & Audio
        VFXFactory.spawnLevelUp(player.position);
        SoundKey.play('LEVEL_UP');
        
        // Big Floating Text
        DamageNumbers.spawn(player.position, player.userData.level, camera, true); 
        
        // UI Banner
        HUDController.showBanner(`LEVEL ${player.userData.level} REACHED!`, "#fbbf24");
        HUDController.updateLevel(player.userData.level);
        
        // Full update to ensure bar is accurate after overflow
        HUDController.updateXP(player.userData.xp, player.userData.maxXp);
        HUDController.checkLowHealth(player.userData.hp, player.userData.maxHp); // Remove low health screen
        
        console.log(`🎉 LEVEL UP! Now Level ${player.userData.level}. Next Level requires ${player.userData.maxXp} XP.`);
    }
}
