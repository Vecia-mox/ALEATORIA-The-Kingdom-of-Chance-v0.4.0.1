
import * as THREE from 'three';
import { PlayerStats } from '../core/PlayerStats';
import { VFXFactory } from '../vfx/VFXFactory';
import { HapticManager } from '../input/HapticManager';

export class SimpleAI {
    // Config
    private static readonly AGGRO_RANGE = 20.0;
    private static readonly BITE_RANGE = 1.8;
    private static readonly BITE_COOLDOWN = 1000; // ms
    
    private static tempDir = new THREE.Vector3();

    public static update(enemies: THREE.Group[], player: THREE.Group, dt: number) {
        if (!player) return;
        const now = Date.now();

        enemies.forEach(enemy => {
            if (enemy.userData.isDead) return;

            const dist = enemy.position.distanceTo(player.position);

            // 1. CHASE (Force Move)
            if (dist < this.AGGRO_RANGE && dist > 1.0) {
                // Look at player
                enemy.lookAt(player.position.x, enemy.position.y, player.position.z);
                
                if (dist > this.BITE_RANGE - 0.5) {
                    const speed = enemy.userData.speed || 3.5;
                    this.tempDir.subVectors(player.position, enemy.position).normalize();
                    this.tempDir.y = 0; // Lock to floor
                    enemy.position.add(this.tempDir.multiplyScalar(speed * dt));
                }
            }

            // 2. ATTACK (Bite)
            if (dist < this.BITE_RANGE) {
                const lastAttack = enemy.userData.lastAttack || 0;
                
                if (now - lastAttack > this.BITE_COOLDOWN) {
                    enemy.userData.lastAttack = now;
                    this.performBite(enemy, player);
                }
            }
        });
    }

    private static performBite(enemy: THREE.Group, player: THREE.Group) {
        // Logic
        PlayerStats.takeDamage(10);
        
        // Visuals
        VFXFactory.spawnScratch(player.position);
        HapticManager.lightImpact();

        // Animation (Lunge)
        const lunge = new THREE.Vector3().subVectors(player.position, enemy.position).normalize().multiplyScalar(0.5);
        enemy.position.add(lunge);
    }
}
