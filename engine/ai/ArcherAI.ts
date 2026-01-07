
import * as THREE from 'three';
import { ProjectileSystem } from '../combat/ProjectileSystem';

export class ArcherAI {
    // Config
    private static readonly FLEE_DIST = 8.0;
    private static readonly ATTACK_DIST_MIN = 8.0;
    private static readonly ATTACK_DIST_MAX = 18.0;
    private static readonly ATTACK_COOLDOWN = 2.0;
    private static readonly MOVE_SPEED = 3.5;

    public static update(archer: THREE.Group, player: THREE.Mesh, dt: number, projSystem: ProjectileSystem) {
        if (archer.userData.isDead) return;

        const dist = archer.position.distanceTo(player.position);
        const now = Date.now();
        const lastShot = archer.userData.lastShot || 0;

        // 1. ROTATION: Always face player
        archer.lookAt(player.position.x, archer.position.y, player.position.z);

        // 2. BEHAVIOR
        if (dist < this.FLEE_DIST) {
            // FLEE: Move directly away from player
            const fleeDir = new THREE.Vector3()
                .subVectors(archer.position, player.position)
                .normalize();
            fleeDir.y = 0; // Keep on ground
            
            archer.position.add(fleeDir.multiplyScalar(this.MOVE_SPEED * dt));
        } 
        else if (dist >= this.ATTACK_DIST_MIN && dist <= this.ATTACK_DIST_MAX) {
            // ATTACK: Stand ground and fire
            if (now - lastShot > (this.ATTACK_COOLDOWN * 1000)) {
                this.shoot(archer, player, projSystem);
                archer.userData.lastShot = now;
            }
        }
        else if (dist > this.ATTACK_DIST_MAX && dist < 30.0) {
            // CHASE: Too far, get in range
            const chaseDir = new THREE.Vector3()
                .subVectors(player.position, archer.position)
                .normalize();
            chaseDir.y = 0;
            archer.position.add(chaseDir.multiplyScalar(this.MOVE_SPEED * dt));
        }
    }

    private static shoot(archer: THREE.Group, player: THREE.Mesh, projSystem: ProjectileSystem) {
        // Calculate shot direction (Predictive aiming could go here later)
        const startPos = archer.position.clone();
        startPos.y += 1.0; // Shoot from "chest" height

        const targetPos = player.position.clone();
        targetPos.y += 1.0; 

        const dir = new THREE.Vector3().subVectors(targetPos, startPos).normalize();
        const velocity = dir.multiplyScalar(12.0); // Projectile speed

        projSystem.spawnEnemyProjectile(startPos, velocity);
    }
}
