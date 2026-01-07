
import * as THREE from 'three';
import { TelegraphSystem } from '../vfx/TelegraphSystem';
import { PlayerStats } from '../core/PlayerStats';
import { ParticleSystem } from '../vfx/ParticleSystem';
import { AudioManager } from '../audio/AudioManager';
import { CameraShaker } from '../vfx/CameraShaker';
import { EnemyFactory } from '../entities/EnemyFactory';
import { DungeonDirector } from '../generation/DungeonDirector';

export class BossSkills {
    
    public static groundSlam(boss: THREE.Group, player: THREE.Mesh, scene: THREE.Scene, onComplete: () => void) {
        const radius = 6.0;
        const duration = 1.2; // Time to react
        const targetPos = player.position.clone();
        targetPos.y = 0.05; // Floor level

        // 1. Telegraph
        TelegraphSystem.spawn(targetPos, radius, duration, () => {
            // 2. Impact
            AudioManager.getInstance().play('explosion');
            CameraShaker.addShake(0.5);
            ParticleSystem.spawn('EXPLOSION', targetPos);

            // 3. Damage Check
            const dist = player.position.distanceTo(targetPos);
            if (dist < radius) {
                PlayerStats.takeDamage(30);
            }
            
            onComplete();
        });
    }

    public static summonMinions(boss: THREE.Group, scene: THREE.Scene): THREE.Group[] {
        const minions: THREE.Group[] = [];
        AudioManager.getInstance().play('ding'); // Summon sound
        
        // Spawn 3 Skeletons in a triangle around boss
        for(let i=0; i<3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const offset = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).multiplyScalar(4);
            const pos = boss.position.clone().add(offset);
            
            // Spawn Minion
            const minion = EnemyFactory.createEnemy(scene, pos.x, pos.z, 'ROGUE'); // Fast annoying minions
            
            // FX
            ParticleSystem.spawn('LEVEL_UP', pos); // Reusing level up burst as spawn poof
            
            // Add to game loop
            DungeonDirector.enemies.push(minion);
            minions.push(minion);
        }
        
        return minions;
    }
}
