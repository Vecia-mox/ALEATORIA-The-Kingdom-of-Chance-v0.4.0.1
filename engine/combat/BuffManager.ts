
import { FloatingText } from '../../ui/vfx/FloatingText';
import { AudioManager } from '../audio/AudioManager';
import { PlayerStats } from '../core/PlayerStats';
import * as THREE from 'three';

export type BuffType = 'FRENZY' | 'SWIFTNESS' | 'VITALITY';

export class BuffManager {
    public static speedMult: number = 1.0;
    public static damageMult: number = 1.0;
    
    // Track timeouts to allow refreshing/extending
    private static timeouts: Record<string, any> = {};

    public static activate(type: BuffType, duration: number, playerPos: THREE.Vector3) {
        // Clear existing timeout if refreshing
        if (this.timeouts[type]) clearTimeout(this.timeouts[type]);

        // SFX
        AudioManager.getInstance().play('ding'); // Placeholder for holy sound

        switch (type) {
            case 'FRENZY':
                this.damageMult = 2.0;
                FloatingText.spawn(playerPos, "FRENZY! (2x DMG)", '#ef4444', 1.5);
                break;
            case 'SWIFTNESS':
                this.speedMult = 2.0;
                FloatingText.spawn(playerPos, "SWIFTNESS! (2x SPD)", '#3b82f6', 1.5);
                break;
            case 'VITALITY':
                PlayerStats.heal(9999); // Full Heal
                FloatingText.spawn(playerPos, "VITALITY RESTORED", '#22c55e', 1.5);
                break;
        }

        // Set reversion timeout (Vitality is instant, no revert needed)
        if (type !== 'VITALITY') {
            this.timeouts[type] = setTimeout(() => {
                this.remove(type);
                FloatingText.spawn(playerPos, `${type} ENDED`, '#aaaaaa', 1.0);
            }, duration);
        }
    }

    private static remove(type: BuffType) {
        switch (type) {
            case 'FRENZY':
                this.damageMult = 1.0;
                break;
            case 'SWIFTNESS':
                this.speedMult = 1.0;
                break;
        }
        delete this.timeouts[type];
    }
}
