
import * as THREE from 'three';
import { VFXFactory } from '../vfx/VFXFactory';
import { FloatingTextManager } from '../../ui/vfx/FloatingTextManager';
import { AudioManager } from '../audio/AudioManager';
import { InputManager } from '../../services/InputManager';
import { CameraSystem } from '../core/CameraSystem';
import { EnemyEntity } from '../entities/EnemyEntity';
import { LootSystem } from '../items/LootSystem';

export class CombatController {
    public state: 'IDLE' | 'ATTACKING' = 'IDLE';
    public comboIndex: number = 0;

    public requestAttack(params: any[]) {
        if (this.state === 'ATTACKING') return;
        this.state = 'ATTACKING';
        
        // Mock State Reset
        setTimeout(() => {
            this.state = 'IDLE';
            this.comboIndex = (this.comboIndex + 1) % 2; // Toggle A/B
        }, 500);
    }
}

export class CombatSystem {
    
    public static performAttack(
        player: THREE.Mesh, 
        enemies: THREE.Group[], 
        cameraSystem: CameraSystem, 
        scene: THREE.Scene,
        lootSystem?: LootSystem
    ) {
        // 1. Config
        const ATK_RANGE = 3.5;
        const ATK_ANGLE = Math.PI / 2.0; 
        const DAMAGE = 15;

        // 2. Audio & Haptics
        AudioManager.getInstance().play('swoosh');
        InputManager.vibrate(10); 
        
        const playerDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
        
        let hitCount = 0;

        // 3. Hit Detection
        enemies.forEach(group => {
            // Safe cast if using new factory
            const enemy = group as unknown as EnemyEntity;
            const enemyObj = group as THREE.Group; // Use Group for position access to avoid TS errors
            
            // Check if user data exists (legacy fallback)
            if (!enemy.userData) return;
            if (enemy.userData.isDead) return;

            const dist = player.position.distanceTo(enemyObj.position);
            
            if (dist < ATK_RANGE) {
                const dirToEnemy = new THREE.Vector3().subVectors(enemyObj.position, player.position).normalize();
                const angle = playerDir.angleTo(dirToEnemy);

                if (angle < ATK_ANGLE / 2) {
                    hitCount++;
                    
                    // Crit Calculation
                    const isCrit = Math.random() < 0.2; // 20% Crit
                    const finalDamage = isCrit ? DAMAGE * 2 : DAMAGE;

                    // A. DAMAGE & FLASH
                    if (typeof enemy.takeDamage === 'function') {
                        enemy.takeDamage(finalDamage);
                    } else {
                        // Fallback for legacy mobs
                        if (enemy.userData) {
                            enemy.userData.hp -= finalDamage;
                        }
                    }

                    // B. FLOATING TEXT
                    FloatingTextManager.spawn(enemyObj.position, finalDamage, isCrit);

                    // C. VISUALS
                    VFXFactory.spawnBlood(enemyObj.position);
                    AudioManager.getInstance().play('hit');

                    // D. CAMERA SHAKE & HAPTICS
                    if (isCrit) {
                        cameraSystem.triggerShake(0.4);
                        InputManager.vibrate([20, 50]);
                    } else {
                        cameraSystem.triggerShake(0.1);
                    }

                    // E. DEATH
                    if (enemy.userData.hp <= 0 && !enemy.userData.processedDeath) {
                        enemy.userData.processedDeath = true;
                        this.killEnemy(enemyObj, scene, lootSystem);
                    }
                }
            }
        });

        // Forward Step
        if (hitCount === 0) {
            player.position.add(playerDir.multiplyScalar(0.5));
        }
    }

    private static killEnemy(enemy: THREE.Object3D, scene: THREE.Scene, lootSystem?: LootSystem) {
        AudioManager.getInstance().play('explosion');
        FloatingTextManager.spawn(enemy.position, 0, false); 

        if (lootSystem) {
            const type = enemy.userData.type || 'ZOMBIE';
            lootSystem.spawnLoot(type, enemy.position);
        }

        const animateDeath = () => {
            enemy.rotation.x -= 0.1;
            enemy.position.y -= 0.05;
            if (enemy.position.y > -2) {
                requestAnimationFrame(animateDeath);
            } else {
                scene.remove(enemy);
            }
        };
        animateDeath();
    }
}
