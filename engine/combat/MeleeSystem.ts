
import * as THREE from 'three';
import { FloatingText } from '../../ui/vfx/FloatingText';
import { LootSystem } from '../items/LootSystem';
import { ParticleSystem } from '../vfx/ParticleSystem'; // Static import for blood, not embers
import { AudioManager } from '../audio/AudioManager';
import { HapticManager } from '../input/HapticManager';
import { CameraShaker } from '../vfx/CameraShaker'; // New
import { MaterialManager } from '../graphics/MaterialManager';
import { VFXFactory } from '../vfx/VFXFactory';

export class MeleeSystem {
    
    public static handleAttack(
        player: THREE.Mesh, 
        enemies: THREE.Group[], 
        camera: THREE.Camera,
        scene: THREE.Scene,
        lootSystem?: LootSystem 
    ) {
        // 0. Audio
        AudioManager.getInstance().play('swoosh');

        // 1. Calculate Hit Cone
        const playerDir = new THREE.Vector3();
        playerDir.set(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
        
        const attackRange = 3.5;
        const attackAngle = Math.PI / 2.0; 

        // 2. Iterate Enemies
        enemies.forEach(enemy => {
            if (enemy.userData.isDead) return;

            const toEnemy = new THREE.Vector3().subVectors(enemy.position, player.position);
            const dist = toEnemy.length();

            if (dist < attackRange) {
                toEnemy.normalize();
                const angle = playerDir.angleTo(toEnemy);

                if (angle < attackAngle) {
                    // CRIT CALCULATION
                    const isCrit = Math.random() < 0.15; // 15% Crit Chance
                    const baseDmg = 10 + Math.floor(Math.random() * 5);
                    const damage = isCrit ? baseDmg * 2 : baseDmg;
                    
                    // VFX & SFX
                    VFXFactory.spawnBlood(enemy.position); // Use Factory
                    AudioManager.getInstance().play('hit');
                    
                    if (isCrit) {
                        HapticManager.heavyImpact();
                        CameraShaker.addShake(0.4); // HEAVY SHAKE
                    } else {
                        HapticManager.lightImpact();
                        CameraShaker.addShake(0.1); // LIGHT SHAKE
                    }
                    
                    this.applyDamage(enemy, damage, isCrit, player, scene, lootSystem);
                }
            }
        });

        // 3. Player Feedback
        player.position.add(playerDir.multiplyScalar(0.3));
    }

    private static applyDamage(
        enemy: THREE.Group, 
        amount: number, 
        isCrit: boolean, 
        player: THREE.Mesh, 
        scene: THREE.Scene, 
        lootSystem?: LootSystem
    ) {
        enemy.userData.hp -= amount;
        
        // Floating Text
        const color = isCrit ? '#fbbf24' : '#ffffff'; 
        const size = isCrit ? 1.5 : 1.0;
        const text = isCrit ? `${amount}!` : `${amount}`;
        FloatingText.spawn(enemy.position, text, color, size);

        // Flash Material
        MaterialManager.flash(enemy);

        // Death Check
        if (enemy.userData.hp <= 0 && !enemy.userData.isDead) {
            enemy.userData.isDead = true;
            AudioManager.getInstance().play('explosion'); 
            
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
}
